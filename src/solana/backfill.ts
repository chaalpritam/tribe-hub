import { Connection, PublicKey } from "@solana/web3.js";
import { config } from "../config";
import { db } from "../storage/db";

const ANCHOR_EVENT_PREFIX = "Program data: ";

export type EventHandler = (
  eventData: string,
  txSignature: string
) => Promise<void>;

interface IndexerCursor {
  signature: string | null;
  slot: bigint | null;
}

/**
 * Read the saved cursor for a program. Null fields mean we've never
 * indexed events from this program before.
 */
export async function getIndexerCursor(programId: PublicKey): Promise<IndexerCursor> {
  const result = await db.query<{
    last_processed_signature: string | null;
    last_processed_slot: string | null;
  }>(
    `SELECT last_processed_signature, last_processed_slot
     FROM solana_indexer_state
     WHERE program_id = $1`,
    [programId.toBase58()]
  );
  if (result.rows.length === 0) {
    return { signature: null, slot: null };
  }
  const row = result.rows[0];
  return {
    signature: row.last_processed_signature,
    slot: row.last_processed_slot ? BigInt(row.last_processed_slot) : null,
  };
}

/**
 * Advance the cursor for a program. Idempotent under concurrent
 * updates from the live subscription and the backfill loop: only
 * moves forward (slot must be greater than what's already saved).
 */
export async function advanceIndexerCursor(
  programId: PublicKey,
  signature: string,
  slot: bigint
): Promise<void> {
  await db.query(
    `INSERT INTO solana_indexer_state (
       program_id, last_processed_signature, last_processed_slot
     ) VALUES ($1, $2, $3)
     ON CONFLICT (program_id) DO UPDATE SET
       last_processed_signature = EXCLUDED.last_processed_signature,
       last_processed_slot = EXCLUDED.last_processed_slot,
       updated_at = NOW()
     WHERE solana_indexer_state.last_processed_slot IS NULL
        OR solana_indexer_state.last_processed_slot < EXCLUDED.last_processed_slot`,
    [programId.toBase58(), signature, slot.toString()]
  );
}

async function markBackfillComplete(programId: PublicKey): Promise<void> {
  await db.query(
    `INSERT INTO solana_indexer_state (program_id, last_backfill_completed_at)
     VALUES ($1, NOW())
     ON CONFLICT (program_id) DO UPDATE SET
       last_backfill_completed_at = NOW(),
       updated_at = NOW()`,
    [programId.toBase58()]
  );
}

/**
 * Replay all Anchor events emitted by `programId` between the saved
 * cursor (exclusive) and now, in chronological order.
 *
 * Strategy: getSignaturesForAddress returns newest-first; we paginate
 * backward toward the cursor, then reverse the collected list and
 * replay. This way handlers see events in the same order they were
 * confirmed on chain, matching the live subscription's order so the
 * stateful "expected current status" guards in the handlers behave
 * identically.
 *
 * Idempotency: the mirror tables all have PKs derived from on-chain
 * data (PDA, tx_signature, or composite keys), so overlap with the
 * live subscription causes ON CONFLICT rejections rather than
 * double-counting. Backfill can therefore run in the background
 * without coordinating with live.
 */
export async function backfillProgram(
  connection: Connection,
  programId: PublicKey,
  handler: EventHandler
): Promise<void> {
  const limit = config.solanaBackfillLimit;
  if (limit <= 0) {
    console.log(`Backfill disabled for ${programId.toBase58()} (limit=0)`);
    return;
  }
  const batchSize = Math.max(1, Math.min(config.solanaBackfillBatchSize, 1000));
  const cursor = await getIndexerCursor(programId);
  const cursorLabel = cursor.signature ? cursor.signature.slice(0, 8) : "<empty>";
  console.log(
    `Backfill ${programId.toBase58()} starting from cursor=${cursorLabel} (limit=${limit})`
  );

  // First pass: walk backward via paginated getSignaturesForAddress
  // collecting signatures newer than the cursor.
  const collected: { signature: string; slot: number }[] = [];
  let before: string | undefined;
  while (collected.length < limit) {
    const remaining = Math.min(batchSize, limit - collected.length);
    const opts: { limit: number; before?: string; until?: string } = {
      limit: remaining,
    };
    if (before) opts.before = before;
    if (cursor.signature) opts.until = cursor.signature;

    let page;
    try {
      page = await connection.getSignaturesForAddress(programId, opts);
    } catch (err) {
      console.error(
        `Backfill ${programId.toBase58()} getSignaturesForAddress failed:`,
        err
      );
      return;
    }
    if (page.length === 0) break;
    for (const sig of page) {
      if (sig.err) continue;
      collected.push({ signature: sig.signature, slot: sig.slot });
    }
    before = page[page.length - 1].signature;
    if (page.length < remaining) break;
  }

  if (collected.length === 0) {
    console.log(`Backfill ${programId.toBase58()} found no new signatures`);
    await markBackfillComplete(programId);
    return;
  }

  // Reverse to chronological order so the stateful handlers (claim
  // before complete, pledge before refund) see events in the order
  // they were confirmed on chain.
  collected.reverse();
  console.log(
    `Backfill ${programId.toBase58()} replaying ${collected.length} signature(s)`
  );

  let processed = 0;
  for (const { signature, slot } of collected) {
    let tx;
    try {
      tx = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
    } catch (err) {
      console.error(
        `Backfill ${programId.toBase58()} getTransaction(${signature.slice(0, 8)}) failed:`,
        err
      );
      continue;
    }
    if (!tx?.meta?.logMessages) continue;

    for (const log of tx.meta.logMessages) {
      if (!log.startsWith(ANCHOR_EVENT_PREFIX)) continue;
      const eventData = log.slice(ANCHOR_EVENT_PREFIX.length);
      try {
        await handler(eventData, signature);
      } catch (err) {
        console.error(
          `Backfill ${programId.toBase58()} handler error on ${signature.slice(0, 8)}:`,
          err
        );
      }
    }

    // Advance the cursor as we go so a crash mid-backfill doesn't
    // re-replay everything on the next start.
    await advanceIndexerCursor(programId, signature, BigInt(slot));
    processed++;
  }

  await markBackfillComplete(programId);
  console.log(
    `Backfill ${programId.toBase58()} replayed ${processed}/${collected.length} signatures`
  );
}

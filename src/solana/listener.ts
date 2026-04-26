import { createHash } from "crypto";
import { Connection, PublicKey, Logs } from "@solana/web3.js";
import { config } from "../config";
import { db } from "../storage/db";

const ANCHOR_EVENT_PREFIX = "Program data: ";

// --- Event discriminators ---

function eventDiscriminator(name: string): Buffer {
  return createHash("sha256").update(`event:${name}`).digest().subarray(0, 8);
}

const TID_DISCRIMINATORS = {
  tidRegistered: eventDiscriminator("TidRegistered"),
  tidTransferred: eventDiscriminator("TidTransferred"),
  tidRecovered: eventDiscriminator("TidRecovered"),
  recoveryChanged: eventDiscriminator("RecoveryChanged"),
};

const SOCIAL_DISCRIMINATORS = {
  profileInitialized: eventDiscriminator("ProfileInitialized"),
  followed: eventDiscriminator("Followed"),
  unfollowed: eventDiscriminator("Unfollowed"),
};

const TIP_DISCRIMINATORS = {
  senderStateInitialized: eventDiscriminator("SenderTipStateInitialized"),
  tipSent: eventDiscriminator("TipSent"),
};

const CROWDFUND_DISCRIMINATORS = {
  creatorStateInitialized: eventDiscriminator("CreatorStateInitialized"),
  crowdfundCreated: eventDiscriminator("CrowdfundCreated"),
  crowdfundPledged: eventDiscriminator("CrowdfundPledged"),
  crowdfundClaimed: eventDiscriminator("CrowdfundClaimed"),
  crowdfundRefunded: eventDiscriminator("CrowdfundRefunded"),
};

// --- Byte-level helpers (no BigUInt64LE for browser compat) ---

function readU64LE(buf: Buffer, offset: number): bigint {
  let val = 0n;
  for (let i = 0; i < 8; i++) {
    val += BigInt(buf[offset + i]) << BigInt(i * 8);
  }
  return val;
}

function readPubkey(buf: Buffer, offset: number): string {
  return new PublicKey(buf.subarray(offset, offset + 32)).toBase58();
}

// --- TID event processor ---

async function processTidEvent(eventData: string, txSignature: string): Promise<void> {
  const decoded = Buffer.from(eventData, "base64");
  const discriminator = decoded.subarray(0, 8);
  const data = decoded.subarray(8);

  if (discriminator.equals(TID_DISCRIMINATORS.tidRegistered)) {
    const tid = readU64LE(data, 0);
    const custodyAddress = readPubkey(data, 8);
    const recoveryAddress = readPubkey(data, 40);

    await db.query(
      `INSERT INTO tids (tid, custody_address, recovery_address, registered_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (tid) DO UPDATE SET
         custody_address = EXCLUDED.custody_address,
         recovery_address = EXCLUDED.recovery_address,
         updated_at = NOW()`,
      [tid.toString(), custodyAddress, recoveryAddress]
    );
    console.log(`TidRegistered: tid=${tid} custody=${custodyAddress} tx=${txSignature}`);

  } else if (discriminator.equals(TID_DISCRIMINATORS.tidTransferred)) {
    const tid = readU64LE(data, 0);
    const newCustody = readPubkey(data, 40);

    await db.query(
      `UPDATE tids SET custody_address = $2, updated_at = NOW() WHERE tid = $1`,
      [tid.toString(), newCustody]
    );
    console.log(`TidTransferred: tid=${tid} new_custody=${newCustody} tx=${txSignature}`);

  } else if (discriminator.equals(TID_DISCRIMINATORS.tidRecovered)) {
    const tid = readU64LE(data, 0);
    const newCustody = readPubkey(data, 40);

    await db.query(
      `UPDATE tids SET custody_address = $2, updated_at = NOW() WHERE tid = $1`,
      [tid.toString(), newCustody]
    );
    console.log(`TidRecovered: tid=${tid} new_custody=${newCustody} tx=${txSignature}`);

  } else if (discriminator.equals(TID_DISCRIMINATORS.recoveryChanged)) {
    const tid = readU64LE(data, 0);
    const newRecovery = readPubkey(data, 40);

    await db.query(
      `UPDATE tids SET recovery_address = $2, updated_at = NOW() WHERE tid = $1`,
      [tid.toString(), newRecovery]
    );
    console.log(`RecoveryChanged: tid=${tid} new_recovery=${newRecovery} tx=${txSignature}`);

  } else {
    console.warn(`Unknown TID event discriminator: ${discriminator.toString("hex")} tx=${txSignature}`);
  }
}

// --- Social event processor ---

async function processSocialEvent(eventData: string, txSignature: string): Promise<void> {
  const decoded = Buffer.from(eventData, "base64");
  const discriminator = decoded.subarray(0, 8);
  const data = decoded.subarray(8);

  if (discriminator.equals(SOCIAL_DISCRIMINATORS.profileInitialized)) {
    const tid = readU64LE(data, 0);
    console.log(`ProfileInitialized: tid=${tid} tx=${txSignature}`);

  } else if (discriminator.equals(SOCIAL_DISCRIMINATORS.followed)) {
    const followerTid = readU64LE(data, 0);
    const followingTid = readU64LE(data, 8);

    await db.query(
      `INSERT INTO social_graph (follower_tid, following_tid, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (follower_tid, following_tid) DO UPDATE SET
         deleted_at = NULL,
         created_at = NOW()`,
      [followerTid.toString(), followingTid.toString()]
    );
    console.log(`Followed: ${followerTid} -> ${followingTid} tx=${txSignature}`);

  } else if (discriminator.equals(SOCIAL_DISCRIMINATORS.unfollowed)) {
    const followerTid = readU64LE(data, 0);
    const followingTid = readU64LE(data, 8);

    await db.query(
      `UPDATE social_graph SET deleted_at = NOW()
       WHERE follower_tid = $1 AND following_tid = $2`,
      [followerTid.toString(), followingTid.toString()]
    );
    console.log(`Unfollowed: ${followerTid} -> ${followingTid} tx=${txSignature}`);

  } else {
    console.warn(`Unknown social event discriminator: ${discriminator.toString("hex")} tx=${txSignature}`);
  }
}

// --- Tip event processor ---

/** Derive the TipRecord PDA seed exactly like tip-registry does:
 * `["tip", sender_pubkey, tip_id_le]`. We compute it locally so we
 * can persist the canonical PDA address without re-querying the
 * chain on every event. */
function deriveTipRecordPda(
  programId: PublicKey,
  sender: PublicKey,
  tipId: bigint
): string {
  const idBuf = Buffer.alloc(8);
  idBuf.writeBigUInt64LE(tipId);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("tip"), sender.toBuffer(), idBuf],
    programId
  );
  return pda.toBase58();
}

async function processTipEvent(eventData: string, txSignature: string): Promise<void> {
  const decoded = Buffer.from(eventData, "base64");
  const discriminator = decoded.subarray(0, 8);
  const data = decoded.subarray(8);

  if (discriminator.equals(TIP_DISCRIMINATORS.tipSent)) {
    // TipSent layout (after 8-byte event disc):
    //   sender(32) | recipient(32) | sender_tid(8) | recipient_tid(8)
    //   | amount(8) | tip_id(8) | has_target(1) | target_hash(32)
    const sender = readPubkey(data, 0);
    const recipient = readPubkey(data, 32);
    const senderTid = readU64LE(data, 64);
    const recipientTid = readU64LE(data, 72);
    const amount = readU64LE(data, 80);
    const tipId = readU64LE(data, 88);
    const hasTarget = data[96] === 1;
    const targetHashBuf = data.subarray(97, 129);
    const targetHash = hasTarget ? targetHashBuf.toString("base64") : null;

    const programId = new PublicKey(config.programIds.tipRegistry);
    const senderKey = new PublicKey(sender);
    const pda = deriveTipRecordPda(programId, senderKey, tipId);

    await db.query(
      `INSERT INTO onchain_tip_records (
         pda, sender, recipient, sender_tid, recipient_tid,
         amount, tip_id, target_hash, has_target, tx_signature
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (pda) DO NOTHING`,
      [
        pda,
        sender,
        recipient,
        senderTid.toString(),
        recipientTid.toString(),
        amount.toString(),
        tipId.toString(),
        targetHash,
        hasTarget,
        txSignature,
      ]
    );
    console.log(
      `TipSent: ${senderTid} -> ${recipientTid} amount=${amount} tip_id=${tipId} tx=${txSignature}`
    );
  } else if (discriminator.equals(TIP_DISCRIMINATORS.senderStateInitialized)) {
    // No persistent state to track — counter PDA is a chain-side
    // implementation detail. Just log for visibility.
    const senderTid = readU64LE(data, 32);
    console.log(`SenderTipStateInitialized: tid=${senderTid} tx=${txSignature}`);
  } else {
    console.warn(
      `Unknown tip event discriminator: ${discriminator.toString("hex")} tx=${txSignature}`
    );
  }
}

// --- Crowdfund event processor ---

async function processCrowdfundEvent(
  eventData: string,
  txSignature: string
): Promise<void> {
  const decoded = Buffer.from(eventData, "base64");
  const discriminator = decoded.subarray(0, 8);
  const data = decoded.subarray(8);

  if (discriminator.equals(CROWDFUND_DISCRIMINATORS.crowdfundCreated)) {
    // crowdfund(32) | creator(32) | creator_tid(8) | crowdfund_id(8)
    //   | goal_amount(8) | deadline_at(8 i64)
    const crowdfund = readPubkey(data, 0);
    const creator = readPubkey(data, 32);
    const creatorTid = readU64LE(data, 64);
    const crowdfundId = readU64LE(data, 72);
    const goalAmount = readU64LE(data, 80);
    const deadlineAt = data.readBigInt64LE(88);
    const deadlineDate = new Date(Number(deadlineAt) * 1000);

    await db.query(
      `INSERT INTO onchain_crowdfunds (
         pda, creator, creator_tid, crowdfund_id, goal_amount,
         deadline_at, status, create_tx_signature
       ) VALUES ($1, $2, $3, $4, $5, $6, 0, $7)
       ON CONFLICT (pda) DO NOTHING`,
      [
        crowdfund,
        creator,
        creatorTid.toString(),
        crowdfundId.toString(),
        goalAmount.toString(),
        deadlineDate,
        txSignature,
      ]
    );
    console.log(
      `CrowdfundCreated: pda=${crowdfund} creator_tid=${creatorTid} goal=${goalAmount} tx=${txSignature}`
    );
  } else if (discriminator.equals(CROWDFUND_DISCRIMINATORS.crowdfundPledged)) {
    // crowdfund(32) | backer(32) | backer_tid(8) | amount(8)
    //   | total_pledged(8) | pledge_count(4 u32)
    const crowdfund = readPubkey(data, 0);
    const backer = readPubkey(data, 32);
    const backerTid = readU64LE(data, 64);
    const amount = readU64LE(data, 72);
    const totalPledged = readU64LE(data, 80);
    const pledgeCount = data.readUInt32LE(88);

    // Per-backer accumulator. The WHERE clause makes the upsert
    // idempotent across log redelivery: same tx_signature seen twice
    // = no second increment.
    await db.query(
      `INSERT INTO onchain_crowdfund_pledges (
         crowdfund, backer, backer_tid, amount, last_pledge_tx
       ) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (crowdfund, backer) DO UPDATE SET
         amount = onchain_crowdfund_pledges.amount + EXCLUDED.amount,
         last_pledge_tx = EXCLUDED.last_pledge_tx,
         updated_at = NOW()
       WHERE onchain_crowdfund_pledges.last_pledge_tx
             IS DISTINCT FROM EXCLUDED.last_pledge_tx`,
      [crowdfund, backer, backerTid.toString(), amount.toString(), txSignature]
    );

    // Campaign-level aggregates are authoritative in the event
    // payload, so a redelivered Pledged log just overwrites with the
    // same values — no double-count risk here.
    await db.query(
      `UPDATE onchain_crowdfunds
       SET total_pledged = $2, pledge_count = $3, updated_at = NOW()
       WHERE pda = $1`,
      [crowdfund, totalPledged.toString(), pledgeCount]
    );
    console.log(
      `CrowdfundPledged: pda=${crowdfund} backer_tid=${backerTid} amount=${amount} total=${totalPledged} tx=${txSignature}`
    );
  } else if (discriminator.equals(CROWDFUND_DISCRIMINATORS.crowdfundClaimed)) {
    // crowdfund(32) | creator(32) | total_pledged(8)
    const crowdfund = readPubkey(data, 0);
    const totalPledged = readU64LE(data, 64);

    await db.query(
      `UPDATE onchain_crowdfunds
       SET status = 1, total_pledged = 0, claim_tx_signature = $2, updated_at = NOW()
       WHERE pda = $1 AND status <> 1`,
      [crowdfund, txSignature]
    );
    console.log(
      `CrowdfundClaimed: pda=${crowdfund} swept=${totalPledged} tx=${txSignature}`
    );
  } else if (discriminator.equals(CROWDFUND_DISCRIMINATORS.crowdfundRefunded)) {
    // crowdfund(32) | backer(32) | amount(8)
    const crowdfund = readPubkey(data, 0);
    const backer = readPubkey(data, 32);
    const amount = readU64LE(data, 64);

    // The on-chain Pledge PDA is closed on refund; mirror by deleting
    // the row. Idempotent against redelivery (DELETE on missing row
    // is a no-op).
    await db.query(
      `DELETE FROM onchain_crowdfund_pledges
       WHERE crowdfund = $1 AND backer = $2`,
      [crowdfund, backer]
    );

    // Decrement campaign aggregates. saturating_sub at the SQL layer:
    // never go negative even if events arrive out of order.
    await db.query(
      `UPDATE onchain_crowdfunds
       SET total_pledged = GREATEST(total_pledged - $2, 0),
           pledge_count = GREATEST(pledge_count - 1, 0),
           status = CASE WHEN status = 0 THEN 2 ELSE status END,
           updated_at = NOW()
       WHERE pda = $1`,
      [crowdfund, amount.toString()]
    );
    console.log(
      `CrowdfundRefunded: pda=${crowdfund} backer=${backer} amount=${amount} tx=${txSignature}`
    );
  } else if (
    discriminator.equals(CROWDFUND_DISCRIMINATORS.creatorStateInitialized)
  ) {
    // No persistent state — counter PDA is a chain-side detail.
    console.log(`Crowdfund CreatorStateInitialized: tx=${txSignature}`);
  } else {
    console.warn(
      `Unknown crowdfund event discriminator: ${discriminator.toString("hex")} tx=${txSignature}`
    );
  }
}

// --- Main listener ---

const RECONNECT_DELAY_MS = 5_000;
const MAX_RECONNECT_DELAY_MS = 60_000;

const programHandlers = [
  { id: new PublicKey(config.programIds.tidRegistry), handler: processTidEvent },
  { id: new PublicKey(config.programIds.socialGraph), handler: processSocialEvent },
  { id: new PublicKey(config.programIds.tipRegistry), handler: processTipEvent },
  { id: new PublicKey(config.programIds.crowdfundRegistry), handler: processCrowdfundEvent },
];

/**
 * Subscribe to Solana program logs via WebSocket.
 * Parses Anchor events and processes TID + social graph updates.
 * Automatically reconnects with exponential backoff on disconnect.
 */
export function startSolanaListener(): void {
  let reconnectDelay = RECONNECT_DELAY_MS;

  function subscribe(): void {
    const connection = new Connection(config.solanaRpcUrl, {
      wsEndpoint: config.solanaWsUrl,
    });

    const subscriptionIds: number[] = [];

    for (const { id, handler } of programHandlers) {
      const subId = connection.onLogs(
        id,
        (logs: Logs) => {
          if (logs.err) return;

          for (const log of logs.logs) {
            if (log.startsWith(ANCHOR_EVENT_PREFIX)) {
              const eventData = log.slice(ANCHOR_EVENT_PREFIX.length);
              try {
                handler(eventData, logs.signature);
              } catch (err) {
                console.error(`Error processing event from ${id.toBase58()}:`, err);
              }
            }
          }
        },
        "confirmed"
      );

      subscriptionIds.push(subId);
      console.log(`Subscribed to Solana logs for ${id.toBase58()}`);
    }

    // Reset delay on successful connection
    reconnectDelay = RECONNECT_DELAY_MS;

    // Monitor the WebSocket connection health
    // @ts-expect-error accessing internal _rpcWebSocket for reconnection
    const ws = connection._rpcWebSocket?._ws;
    if (ws) {
      ws.on("close", () => {
        console.warn(`Solana WebSocket disconnected. Reconnecting in ${reconnectDelay / 1000}s...`);
        scheduleReconnect();
      });
      ws.on("error", (err: Error) => {
        console.error("Solana WebSocket error:", err.message);
      });
    }
  }

  function scheduleReconnect(): void {
    setTimeout(() => {
      console.log("Reconnecting Solana listener...");
      try {
        subscribe();
      } catch (err) {
        console.error("Failed to reconnect Solana listener:", err);
        reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY_MS);
        scheduleReconnect();
      }
    }, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY_MS);
  }

  subscribe();
}

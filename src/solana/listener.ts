import { createHash } from "crypto";
import { Connection, PublicKey, Logs, Context } from "@solana/web3.js";
import { config } from "../config";
import { db } from "../storage/db";
import { advanceIndexerCursor, backfillProgram } from "./backfill";

// Lazy module-level read-only Connection for handlers that need to
// fetch on-chain account data (e.g. reading metadata_hash off the
// Event PDA after an EventCreated log fires). Sharing one client
// across handler invocations is fine — the underlying HTTP keepalive
// makes this efficient.
let _readConnection: Connection | null = null;
function getReadConnection(): Connection {
  if (!_readConnection) {
    _readConnection = new Connection(config.solanaRpcUrl, "confirmed");
  }
  return _readConnection;
}

/** Fetch a 32-byte slice off an on-chain account at a known offset
 *  and return it base64-encoded. Returns null on RPC failure or when
 *  the account is shorter than expected — callers fall back to a
 *  NULL metadata_hash and the API gracefully shows placeholder copy. */
async function readBytesAt(
  pda: PublicKey,
  offset: number,
  length: number
): Promise<string | null> {
  try {
    const acct = await getReadConnection().getAccountInfo(pda);
    if (!acct || acct.data.length < offset + length) return null;
    return acct.data.subarray(offset, offset + length).toString("base64");
  } catch (err) {
    console.warn(
      `Account read failed for ${pda.toBase58()} offset=${offset}:`,
      err
    );
    return null;
  }
}

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

// Note: task-registry's CreatorStateInitialized has the same name —
// and therefore the same discriminator — as crowdfund-registry's.
// That's fine because the listener routes by program ID before
// discriminator matching; each handler only sees its own program's
// logs and there's no cross-program collision.
const TASK_DISCRIMINATORS = {
  creatorStateInitialized: eventDiscriminator("CreatorStateInitialized"),
  taskCreated: eventDiscriminator("TaskCreated"),
  taskClaimed: eventDiscriminator("TaskClaimed"),
  taskCompleted: eventDiscriminator("TaskCompleted"),
  taskCancelled: eventDiscriminator("TaskCancelled"),
};

const CHANNEL_DISCRIMINATORS = {
  channelRegistered: eventDiscriminator("ChannelRegistered"),
  channelUpdated: eventDiscriminator("ChannelUpdated"),
  channelTransferred: eventDiscriminator("ChannelTransferred"),
};

const KARMA_DISCRIMINATORS = {
  karmaAccountInitialized: eventDiscriminator("KarmaAccountInitialized"),
  tipKarmaRecorded: eventDiscriminator("TipKarmaRecorded"),
  taskKarmaRecorded: eventDiscriminator("TaskKarmaRecorded"),
};

const POLL_DISCRIMINATORS = {
  // Note: CreatorStateInitialized collides by name with the same
  // event in crowdfund-registry / task-registry. Per-program log
  // routing means the collision never matters.
  creatorStateInitialized: eventDiscriminator("CreatorStateInitialized"),
  pollCreated: eventDiscriminator("PollCreated"),
  pollVoted: eventDiscriminator("PollVoted"),
};

const EVENT_DISCRIMINATORS = {
  // Same CreatorStateInitialized collision as above. Same handling.
  creatorStateInitialized: eventDiscriminator("CreatorStateInitialized"),
  eventCreated: eventDiscriminator("EventCreated"),
  eventRsvped: eventDiscriminator("EventRsvped"),
  eventRsvpUpdated: eventDiscriminator("EventRsvpUpdated"),
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

    // metadata_hash sits at offset 8 + 86 in the Crowdfund account:
    //   creator(32) creator_tid(8) crowdfund_id(8) goal_amount(8)
    //   total_pledged(8) pledge_count(4) deadline_at(8) created_at(8)
    //   status(1) bump(1) → 86 bytes after the disc.
    const metadataHashB64 = await readBytesAt(
      new PublicKey(crowdfund),
      8 + 86,
      32
    );

    await db.query(
      `INSERT INTO onchain_crowdfunds (
         pda, creator, creator_tid, crowdfund_id, goal_amount,
         deadline_at, status, create_tx_signature, metadata_hash
       ) VALUES ($1, $2, $3, $4, $5, $6, 0, $7, $8)
       ON CONFLICT (pda) DO NOTHING`,
      [
        crowdfund,
        creator,
        creatorTid.toString(),
        crowdfundId.toString(),
        goalAmount.toString(),
        deadlineDate,
        txSignature,
        metadataHashB64,
      ]
    );
    console.log(
      `CrowdfundCreated: pda=${crowdfund} creator_tid=${creatorTid} goal=${goalAmount} metadata_hash=${metadataHashB64 ? "yes" : "n/a"} tx=${txSignature}`
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

// --- Task event processor ---

async function processTaskEvent(
  eventData: string,
  txSignature: string
): Promise<void> {
  const decoded = Buffer.from(eventData, "base64");
  const discriminator = decoded.subarray(0, 8);
  const data = decoded.subarray(8);

  if (discriminator.equals(TASK_DISCRIMINATORS.taskCreated)) {
    // task(32) | creator(32) | creator_tid(8) | task_id(8) | reward_amount(8)
    const task = readPubkey(data, 0);
    const creator = readPubkey(data, 32);
    const creatorTid = readU64LE(data, 64);
    const taskId = readU64LE(data, 72);
    const rewardAmount = readU64LE(data, 80);

    // metadata_hash sits at offset 8 + 122 in the Task account:
    //   creator(32) creator_tid(8) task_id(8) status(1) reward_amount(8)
    //   claimer(32) claimer_tid(8) has_claimer(1) created_at(8)
    //   claimed_at(8) completed_at(8) → 122 bytes after the disc.
    const metadataHashB64 = await readBytesAt(
      new PublicKey(task),
      8 + 122,
      32
    );

    await db.query(
      `INSERT INTO onchain_tasks (
         pda, creator, creator_tid, task_id, status,
         reward_amount, create_tx_signature, metadata_hash
       ) VALUES ($1, $2, $3, $4, 0, $5, $6, $7)
       ON CONFLICT (pda) DO NOTHING`,
      [
        task,
        creator,
        creatorTid.toString(),
        taskId.toString(),
        rewardAmount.toString(),
        txSignature,
        metadataHashB64,
      ]
    );
    console.log(
      `TaskCreated: pda=${task} creator_tid=${creatorTid} reward=${rewardAmount} metadata_hash=${metadataHashB64 ? "yes" : "n/a"} tx=${txSignature}`
    );
  } else if (discriminator.equals(TASK_DISCRIMINATORS.taskClaimed)) {
    // task(32) | claimer(32) | claimer_tid(8)
    const task = readPubkey(data, 0);
    const claimer = readPubkey(data, 32);
    const claimerTid = readU64LE(data, 64);

    // Only flip from Open (0) → Claimed (1). Re-delivery is a no-op
    // because status will already be 1.
    await db.query(
      `UPDATE onchain_tasks
       SET status = 1, claimer = $2, claimer_tid = $3,
           claimed_at = NOW(), claim_tx_signature = $4, updated_at = NOW()
       WHERE pda = $1 AND status = 0`,
      [task, claimer, claimerTid.toString(), txSignature]
    );
    console.log(
      `TaskClaimed: pda=${task} claimer_tid=${claimerTid} tx=${txSignature}`
    );
  } else if (discriminator.equals(TASK_DISCRIMINATORS.taskCompleted)) {
    // task(32) | creator(32) | claimer(32) | reward_amount(8)
    const task = readPubkey(data, 0);
    const rewardAmount = readU64LE(data, 96);

    // Only flip from Claimed (1) → Completed (2).
    await db.query(
      `UPDATE onchain_tasks
       SET status = 2, completed_at = NOW(),
           complete_tx_signature = $2, updated_at = NOW()
       WHERE pda = $1 AND status = 1`,
      [task, txSignature]
    );
    console.log(
      `TaskCompleted: pda=${task} reward=${rewardAmount} tx=${txSignature}`
    );
  } else if (discriminator.equals(TASK_DISCRIMINATORS.taskCancelled)) {
    // task(32) | creator(32) | refunded(8)
    const task = readPubkey(data, 0);
    const refunded = readU64LE(data, 64);

    // Only flip from Open (0) → Cancelled (3); the program rejects
    // cancel after claim, so we mirror that defensively.
    await db.query(
      `UPDATE onchain_tasks
       SET status = 3, cancel_tx_signature = $2, updated_at = NOW()
       WHERE pda = $1 AND status = 0`,
      [task, txSignature]
    );
    console.log(
      `TaskCancelled: pda=${task} refunded=${refunded} tx=${txSignature}`
    );
  } else if (
    discriminator.equals(TASK_DISCRIMINATORS.creatorStateInitialized)
  ) {
    // No persistent state — counter PDA is a chain-side detail.
    console.log(`Task CreatorStateInitialized: tx=${txSignature}`);
  } else {
    console.warn(
      `Unknown task event discriminator: ${discriminator.toString("hex")} tx=${txSignature}`
    );
  }
}

// --- Channel event processor ---

async function processChannelEvent(
  eventData: string,
  txSignature: string
): Promise<void> {
  const decoded = Buffer.from(eventData, "base64");
  const discriminator = decoded.subarray(0, 8);
  const data = decoded.subarray(8);

  if (discriminator.equals(CHANNEL_DISCRIMINATORS.channelRegistered)) {
    // channel(32) | owner(32) | owner_tid(8) | kind(1)
    const channel = readPubkey(data, 0);
    const owner = readPubkey(data, 32);
    const ownerTid = readU64LE(data, 64);
    const kind = data[72];

    await db.query(
      `INSERT INTO onchain_channels (
         pda, owner, owner_tid, kind, register_tx_signature
       ) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (pda) DO NOTHING`,
      [channel, owner, ownerTid.toString(), kind, txSignature]
    );
    console.log(
      `ChannelRegistered: pda=${channel} owner_tid=${ownerTid} kind=${kind} tx=${txSignature}`
    );
  } else if (discriminator.equals(CHANNEL_DISCRIMINATORS.channelUpdated)) {
    // channel(32) | owner(32)
    const channel = readPubkey(data, 0);
    // Update event doesn't carry the new lat/lon/metadata_hash;
    // those would need an RPC fetch. We just bump updated_at so
    // callers can see the channel was touched.
    await db.query(
      `UPDATE onchain_channels SET updated_at = NOW() WHERE pda = $1`,
      [channel]
    );
    console.log(`ChannelUpdated: pda=${channel} tx=${txSignature}`);
  } else if (discriminator.equals(CHANNEL_DISCRIMINATORS.channelTransferred)) {
    // channel(32) | previous_owner(32) | previous_owner_tid(8)
    //   | new_owner(32) | new_owner_tid(8)
    const channel = readPubkey(data, 0);
    const newOwner = readPubkey(data, 72);
    const newOwnerTid = readU64LE(data, 104);

    await db.query(
      `UPDATE onchain_channels
       SET owner = $2, owner_tid = $3,
           last_transfer_tx = $4, updated_at = NOW()
       WHERE pda = $1`,
      [channel, newOwner, newOwnerTid.toString(), txSignature]
    );
    console.log(
      `ChannelTransferred: pda=${channel} new_owner_tid=${newOwnerTid} tx=${txSignature}`
    );
  } else {
    console.warn(
      `Unknown channel event discriminator: ${discriminator.toString("hex")} tx=${txSignature}`
    );
  }
}

// --- Karma event processor ---

async function processKarmaEvent(
  eventData: string,
  txSignature: string
): Promise<void> {
  const decoded = Buffer.from(eventData, "base64");
  const discriminator = decoded.subarray(0, 8);
  const data = decoded.subarray(8);

  if (discriminator.equals(KARMA_DISCRIMINATORS.karmaAccountInitialized)) {
    // karma(32) | tid(8)
    const karma = readPubkey(data, 0);
    const tid = readU64LE(data, 32);

    await db.query(
      `INSERT INTO onchain_karma (tid, pda)
       VALUES ($1, $2)
       ON CONFLICT (tid) DO NOTHING`,
      [tid.toString(), karma]
    );
    console.log(`KarmaAccountInitialized: tid=${tid} pda=${karma} tx=${txSignature}`);
  } else if (discriminator.equals(KARMA_DISCRIMINATORS.tipKarmaRecorded)) {
    // karma(32) | tid(8) | tip_record(32) | amount(8)
    //   | new_tip_count(8) | new_tip_lamports(8)
    const karma = readPubkey(data, 0);
    const tid = readU64LE(data, 32);
    const tipRecord = readPubkey(data, 40);
    const amount = readU64LE(data, 72);
    const newTipCount = readU64LE(data, 80);
    const newTipLamports = readU64LE(data, 88);

    // Counters in the event are authoritative; redelivery overwrites
    // with the same values.
    await db.query(
      `INSERT INTO onchain_karma (
         tid, pda, tips_received_count, tips_received_lamports
       ) VALUES ($1, $2, $3, $4)
       ON CONFLICT (tid) DO UPDATE SET
         tips_received_count = EXCLUDED.tips_received_count,
         tips_received_lamports = EXCLUDED.tips_received_lamports,
         updated_at = NOW()`,
      [tid.toString(), karma, newTipCount.toString(), newTipLamports.toString()]
    );

    // Audit row keyed by source. ON CONFLICT DO NOTHING so a
    // redelivered event doesn't duplicate the proof.
    await db.query(
      `INSERT INTO onchain_karma_proofs (
         source, kind, tid, karma_pda, amount, tx_signature
       ) VALUES ($1, 1, $2, $3, $4, $5)
       ON CONFLICT (source) DO NOTHING`,
      [tipRecord, tid.toString(), karma, amount.toString(), txSignature]
    );
    console.log(
      `TipKarmaRecorded: tid=${tid} amount=${amount} new_count=${newTipCount} new_lamports=${newTipLamports} tx=${txSignature}`
    );
  } else if (discriminator.equals(KARMA_DISCRIMINATORS.taskKarmaRecorded)) {
    // karma(32) | tid(8) | task(32) | reward_amount(8)
    //   | new_task_count(8) | new_task_reward_lamports(8)
    const karma = readPubkey(data, 0);
    const tid = readU64LE(data, 32);
    const task = readPubkey(data, 40);
    const rewardAmount = readU64LE(data, 72);
    const newTaskCount = readU64LE(data, 80);
    const newTaskRewardLamports = readU64LE(data, 88);

    await db.query(
      `INSERT INTO onchain_karma (
         tid, pda, tasks_completed_count, tasks_completed_reward_lamports
       ) VALUES ($1, $2, $3, $4)
       ON CONFLICT (tid) DO UPDATE SET
         tasks_completed_count = EXCLUDED.tasks_completed_count,
         tasks_completed_reward_lamports = EXCLUDED.tasks_completed_reward_lamports,
         updated_at = NOW()`,
      [tid.toString(), karma, newTaskCount.toString(), newTaskRewardLamports.toString()]
    );

    await db.query(
      `INSERT INTO onchain_karma_proofs (
         source, kind, tid, karma_pda, amount, tx_signature
       ) VALUES ($1, 2, $2, $3, $4, $5)
       ON CONFLICT (source) DO NOTHING`,
      [task, tid.toString(), karma, rewardAmount.toString(), txSignature]
    );
    console.log(
      `TaskKarmaRecorded: tid=${tid} reward=${rewardAmount} new_count=${newTaskCount} new_lamports=${newTaskRewardLamports} tx=${txSignature}`
    );
  } else {
    console.warn(
      `Unknown karma event discriminator: ${discriminator.toString("hex")} tx=${txSignature}`
    );
  }
}

// --- Poll event processor ---

async function processPollEvent(
  eventData: string,
  txSignature: string
): Promise<void> {
  const decoded = Buffer.from(eventData, "base64");
  const discriminator = decoded.subarray(0, 8);
  const data = decoded.subarray(8);

  if (discriminator.equals(POLL_DISCRIMINATORS.pollCreated)) {
    // poll(32) | creator(32) | creator_tid(8) | poll_id(8) | option_count(1)
    const poll = readPubkey(data, 0);
    const creator = readPubkey(data, 32);
    const creatorTid = readU64LE(data, 64);
    const pollId = readU64LE(data, 72);
    const optionCount = data[80];

    // metadata_hash sits at offset 8 + 102 in the Poll account:
    //   creator(32) creator_tid(8) poll_id(8) option_count(1)
    //   option_votes(4*8) total_votes(4) expires_at(8)
    //   has_expiry(1) created_at(8) → 102 bytes after the disc.
    const metadataHashB64 = await readBytesAt(
      new PublicKey(poll),
      8 + 102,
      32
    );

    await db.query(
      `INSERT INTO onchain_polls (
         pda, creator, creator_tid, poll_id, option_count,
         create_tx_signature, metadata_hash
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (pda) DO NOTHING`,
      [
        poll,
        creator,
        creatorTid.toString(),
        pollId.toString(),
        optionCount,
        txSignature,
        metadataHashB64,
      ]
    );
    console.log(
      `PollCreated: pda=${poll} creator_tid=${creatorTid} options=${optionCount} tx=${txSignature}`
    );
  } else if (discriminator.equals(POLL_DISCRIMINATORS.pollVoted)) {
    // poll(32) | voter(32) | voter_tid(8) | option_index(1) | new_total_for_option(4 u32)
    const poll = readPubkey(data, 0);
    const voter = readPubkey(data, 32);
    const voterTid = readU64LE(data, 64);
    const optionIndex = data[72];

    // (poll, voter) PK + ON CONFLICT DO NOTHING handles redelivery
    // and matches the on-chain Vote PDA's init-as-uniqueness guarantee.
    await db.query(
      `INSERT INTO onchain_poll_votes (
         poll, voter, voter_tid, option_index, tx_signature
       ) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (poll, voter) DO NOTHING`,
      [poll, voter, voterTid.toString(), optionIndex, txSignature]
    );
    console.log(
      `PollVoted: poll=${poll} voter_tid=${voterTid} option=${optionIndex} tx=${txSignature}`
    );
  } else if (discriminator.equals(POLL_DISCRIMINATORS.creatorStateInitialized)) {
    console.log(`Poll CreatorStateInitialized: tx=${txSignature}`);
  } else {
    console.warn(
      `Unknown poll event discriminator: ${discriminator.toString("hex")} tx=${txSignature}`
    );
  }
}

// --- Event event processor ---

async function processEventEvent(
  eventData: string,
  txSignature: string
): Promise<void> {
  const decoded = Buffer.from(eventData, "base64");
  const discriminator = decoded.subarray(0, 8);
  const data = decoded.subarray(8);

  if (discriminator.equals(EVENT_DISCRIMINATORS.eventCreated)) {
    // event(32) | creator(32) | creator_tid(8) | event_id(8) | starts_at(8 i64)
    const eventPda = readPubkey(data, 0);
    const creator = readPubkey(data, 32);
    const creatorTid = readU64LE(data, 64);
    const eventId = readU64LE(data, 72);
    const startsAtSec = data.readBigInt64LE(80);
    const startsAtDate = new Date(Number(startsAtSec) * 1000);

    // Read metadata_hash off the on-chain Event account. Layout
    // (after the 8-byte Anchor discriminator):
    //   creator(32) creator_tid(8) event_id(8) starts_at(8) ends_at(8)
    //   has_end(1) latitude(8) longitude(8) has_location(1)
    //   yes_count(4) no_count(4) maybe_count(4) created_at(8)
    //   metadata_hash(32) bump(1)
    // → metadata_hash starts at offset 8 + 110 = 118 in raw account
    //   data (110 after the discriminator).
    const METADATA_HASH_OFFSET = 8 + 110;
    const metadataHashB64 = await readBytesAt(
      new PublicKey(eventPda),
      METADATA_HASH_OFFSET,
      32
    );

    await db.query(
      `INSERT INTO onchain_events (
         pda, creator, creator_tid, event_id, starts_at,
         create_tx_signature, metadata_hash
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (pda) DO NOTHING`,
      [
        eventPda,
        creator,
        creatorTid.toString(),
        eventId.toString(),
        startsAtDate,
        txSignature,
        metadataHashB64,
      ]
    );
    console.log(
      `EventCreated: pda=${eventPda} creator_tid=${creatorTid} starts_at=${startsAtSec} metadata_hash=${metadataHashB64 ? "yes" : "n/a"} tx=${txSignature}`
    );
  } else if (discriminator.equals(EVENT_DISCRIMINATORS.eventRsvped)) {
    // event(32) | attendee(32) | attendee_tid(8) | status(1)
    const eventPda = readPubkey(data, 0);
    const attendee = readPubkey(data, 32);
    const attendeeTid = readU64LE(data, 64);
    const status = data[72];

    await db.query(
      `INSERT INTO onchain_event_rsvps (
         event, attendee, attendee_tid, status, tx_signature
       ) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (event, attendee) DO NOTHING`,
      [eventPda, attendee, attendeeTid.toString(), status, txSignature]
    );
    console.log(
      `EventRsvped: event=${eventPda} attendee_tid=${attendeeTid} status=${status} tx=${txSignature}`
    );
  } else if (discriminator.equals(EVENT_DISCRIMINATORS.eventRsvpUpdated)) {
    // event(32) | attendee(32) | previous_status(1) | new_status(1)
    const eventPda = readPubkey(data, 0);
    const attendee = readPubkey(data, 32);
    const newStatus = data[65];

    // Idempotent: WHERE status <> $3 means re-delivery is a no-op.
    // If we somehow missed the original Rsvped event, this UPDATE
    // matches no rows and we log a warning so backfill can fix it.
    const result = await db.query(
      `UPDATE onchain_event_rsvps
       SET status = $3, updated_at = NOW(), tx_signature = $4
       WHERE event = $1 AND attendee = $2 AND status <> $3`,
      [eventPda, attendee, newStatus, txSignature]
    );
    if (result.rowCount === 0) {
      console.warn(
        `EventRsvpUpdated had no matching row (idempotent or missing original): event=${eventPda} tx=${txSignature}`
      );
    } else {
      console.log(
        `EventRsvpUpdated: event=${eventPda} new_status=${newStatus} tx=${txSignature}`
      );
    }
  } else if (discriminator.equals(EVENT_DISCRIMINATORS.creatorStateInitialized)) {
    console.log(`Event CreatorStateInitialized: tx=${txSignature}`);
  } else {
    console.warn(
      `Unknown event-registry discriminator: ${discriminator.toString("hex")} tx=${txSignature}`
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
  { id: new PublicKey(config.programIds.taskRegistry), handler: processTaskEvent },
  { id: new PublicKey(config.programIds.channelRegistry), handler: processChannelEvent },
  { id: new PublicKey(config.programIds.karmaRegistry), handler: processKarmaEvent },
  { id: new PublicKey(config.programIds.pollRegistry), handler: processPollEvent },
  { id: new PublicKey(config.programIds.eventRegistry), handler: processEventEvent },
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
        (logs: Logs, ctx: Context) => {
          if (logs.err) return;

          // Process every Anchor event in the log entries first…
          (async () => {
            for (const log of logs.logs) {
              if (log.startsWith(ANCHOR_EVENT_PREFIX)) {
                const eventData = log.slice(ANCHOR_EVENT_PREFIX.length);
                try {
                  await handler(eventData, logs.signature);
                } catch (err) {
                  console.error(`Error processing event from ${id.toBase58()}:`, err);
                }
              }
            }
            // …then advance the cursor so a hub restart picks up
            // signatures newer than this one. The advance is gated
            // on slot monotonicity so out-of-order delivery between
            // live and backfill can't move the cursor backward.
            try {
              await advanceIndexerCursor(id, logs.signature, BigInt(ctx.slot));
            } catch (err) {
              console.error(
                `Failed to advance cursor for ${id.toBase58()}:`,
                err
              );
            }
          })();
        },
        "confirmed"
      );

      subscriptionIds.push(subId);
      console.log(`Subscribed to Solana logs for ${id.toBase58()}`);
    }

    // Kick off backfill in the background. Live subscription is
    // already running; existing PK constraints in the mirror tables
    // make any overlap between live + backfilled events harmless.
    for (const { id, handler } of programHandlers) {
      backfillProgram(connection, id, handler).catch((err) => {
        console.error(`Backfill failed for ${id.toBase58()}:`, err);
      });
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

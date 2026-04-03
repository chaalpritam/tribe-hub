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

// --- Main listener ---

/**
 * Subscribe to Solana program logs via WebSocket.
 * Parses Anchor events and processes TID + social graph updates.
 */
export function startSolanaListener(): void {
  const connection = new Connection(config.solanaRpcUrl, {
    wsEndpoint: config.solanaWsUrl,
  });

  const programHandlers = [
    { id: new PublicKey(config.programIds.tidRegistry), handler: processTidEvent },
    { id: new PublicKey(config.programIds.socialGraph), handler: processSocialEvent },
  ];

  for (const { id, handler } of programHandlers) {
    connection.onLogs(
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

    console.log(`Subscribed to Solana logs for ${id.toBase58()}`);
  }
}

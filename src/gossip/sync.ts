import nacl from "tweetnacl";
import { hash as blake3Hash } from "blake3";
import { db } from "../storage/db";
import { GossipMessage, GossipDm } from "../types";
import { validateGossipMessage } from "../validation/verifier";
import { appKeyCache } from "../validation/app-key-cache";
import { broadcastToClients } from "../api/ws";
import {
  getSignedEnvelopes,
  storeSignedEnvelope,
} from "../storage/signed-envelopes";
import { recordDataB64Status } from "../metrics";

/**
 * Get hashes of messages we have since a timestamp.
 */
export async function getMessageHashes(since: Date, limit: number): Promise<string[]> {
  const result = await db.query(
    `SELECT hash FROM messages WHERE created_at > $1 ORDER BY created_at ASC LIMIT $2`,
    [since, limit]
  );
  return result.rows.map((r: { hash: string }) => r.hash);
}

/**
 * Find which hashes from a list we are missing locally.
 */
export async function findMissingHashes(hashes: string[]): Promise<string[]> {
  if (hashes.length === 0) return [];

  const result = await db.query(
    `SELECT hash FROM messages WHERE hash = ANY($1)`,
    [hashes]
  );
  const existing = new Set(result.rows.map((r: { hash: string }) => r.hash));
  return hashes.filter((h) => !existing.has(h));
}

/**
 * Get full messages by hashes, formatted for gossip transmission.
 * Includes the signed envelope bytes (dataB64) when available so the
 * receiver can recompute blake3 and reject any tampered projection.
 */
export async function getMessagesByHashes(hashes: string[]): Promise<GossipMessage[]> {
  if (hashes.length === 0) return [];

  const [result, envelopes] = await Promise.all([
    db.query(
      `SELECT hash, tid, type, text, parent_hash, channel_id, mentions, embeds, timestamp, signature, signer
       FROM messages WHERE hash = ANY($1)`,
      [hashes],
    ),
    getSignedEnvelopes(hashes),
  ]);
  return result.rows.map((r: {
    hash: string;
    tid: string;
    type: number;
    text: string | null;
    parent_hash: string | null;
    channel_id: string | null;
    mentions: string[];
    embeds: string[];
    timestamp: Date;
    signature: string;
    signer: string;
  }) => ({
    hash: r.hash,
    tid: r.tid.toString(),
    type: r.type,
    text: r.text,
    parentHash: r.parent_hash,
    channelId: r.channel_id,
    mentions: r.mentions || [],
    embeds: r.embeds || [],
    timestamp: r.timestamp instanceof Date ? r.timestamp.toISOString() : r.timestamp,
    signature: r.signature,
    signer: r.signer,
    dataB64: envelopes.get(r.hash),
  }));
}

/**
 * Store a message received from a peer (after validation).
 * Returns true if stored, false if invalid or already exists.
 *
 * When the gossip envelope carries dataB64, validateGossipMessage
 * recomputes blake3 and — for JSON-encoded bytes — overrides the
 * projected fields on `msg` with the authentic decoded values, so
 * what we persist matches what the signer authenticated.
 */
export async function storeGossipMessage(msg: GossipMessage, fromHubId: string): Promise<boolean> {
  const validation = await validateGossipMessage(msg);
  if (!validation.valid) {
    console.warn(`Rejected gossip message ${msg.hash}: ${validation.error}`);
    return false;
  }

  if (msg.dataB64) {
    await storeSignedEnvelope(msg.hash, msg.dataB64);
  }

  const result = await db.query(
    `INSERT INTO messages (hash, tid, type, text, parent_hash, channel_id, mentions, embeds, timestamp, signature, signer, received_from)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     ON CONFLICT (hash) DO NOTHING`,
    [
      msg.hash,
      msg.tid,
      msg.type,
      msg.text,
      msg.parentHash,
      msg.channelId,
      msg.mentions,
      msg.embeds,
      msg.timestamp,
      msg.signature,
      msg.signer,
      fromHubId,
    ]
  );

  const stored = (result.rowCount ?? 0) > 0;
  if (stored) {
    broadcastToClients("new_message", { hash: msg.hash, tid: msg.tid, type: msg.type });
  }
  return stored;
}

/**
 * Get the last sync time with a peer.
 */
export async function getLastSyncTime(peerHubId: string): Promise<Date> {
  const result = await db.query(
    `SELECT last_sync_at FROM sync_state WHERE peer_hub_id = $1`,
    [peerHubId]
  );
  if (result.rows.length > 0) {
    return new Date(result.rows[0].last_sync_at);
  }
  // Default: sync everything from the last 24 hours
  return new Date(Date.now() - 24 * 60 * 60 * 1000);
}

/**
 * Update the sync state for a peer.
 */
export async function updateSyncState(peerHubId: string, lastHash: string | null): Promise<void> {
  await db.query(
    `INSERT INTO sync_state (peer_hub_id, last_sync_hash, last_sync_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (peer_hub_id) DO UPDATE SET
       last_sync_hash = EXCLUDED.last_sync_hash,
       last_sync_at = NOW()`,
    [peerHubId, lastHash]
  );
}

/**
 * Update peer info in the peers table.
 */
export async function upsertPeer(hubId: string, url: string): Promise<void> {
  await db.query(
    `INSERT INTO peers (hub_id, url, last_seen)
     VALUES ($1, $2, NOW())
     ON CONFLICT (hub_id) DO UPDATE SET
       url = EXCLUDED.url,
       last_seen = NOW()`,
    [hubId, url]
  );
}

/**
 * Increment the message count for a peer.
 */
export async function incrementPeerMessageCount(hubId: string, count: number): Promise<void> {
  await db.query(
    `UPDATE peers SET message_count = message_count + $2, last_seen = NOW() WHERE hub_id = $1`,
    [hubId, count]
  );
}

// ── DM gossip ────────────────────────────────────────────────────────

function conversationIdFor(a: number | string, b: number | string): string {
  const ai = typeof a === "string" ? parseInt(a, 10) : a;
  const bi = typeof b === "string" ? parseInt(b, 10) : b;
  const [lo, hi] = ai < bi ? [ai, bi] : [bi, ai];
  return `${lo}:${hi}`;
}

/**
 * Verify dataB64 against the DM's claimed hash and, when JSON-encoded,
 * overwrite ciphertext / nonce / sender_x25519 / timestamp / sender_tid /
 * recipient_tid on `msg` with the decoded values. Returns false on
 * mismatch (caller should reject); true otherwise (including when
 * dataB64 is absent — pre-3.4 peers).
 *
 * Mirrors checkDataB64Integrity in verifier.ts but for the GossipDm
 * shape, since the projected DM fields are different from a tweet's.
 */
function verifyAndOverrideDmDataB64(msg: GossipDm): boolean {
  if (!msg.dataB64) {
    recordDataB64Status("gossip", "absent");
    return true;
  }
  let bytes: Buffer;
  try {
    bytes = Buffer.from(msg.dataB64, "base64");
    if (bytes.length === 0) throw new Error("empty");
  } catch {
    recordDataB64Status("gossip", "invalid_base64");
    console.warn(`Rejected gossip DM ${msg.hash}: dataB64 not valid base64`);
    return false;
  }
  const computed = blake3Hash(bytes) as Uint8Array;
  const claimed = Buffer.from(msg.hash, "base64");
  if (
    computed.length !== claimed.length ||
    !Buffer.from(computed).equals(claimed)
  ) {
    recordDataB64Status("gossip", "mismatch");
    console.warn(`Rejected gossip DM ${msg.hash}: blake3(dataB64) ≠ hash`);
    return false;
  }
  recordDataB64Status("gossip", "present");

  if (bytes[0] === 0x7b /* '{' */) {
    try {
      const parsed = JSON.parse(bytes.toString("utf8")) as {
        tid?: number | string;
        timestamp?: number;
        body?: {
          recipient_tid?: number | string;
          ciphertext?: string;
          nonce?: string;
          sender_x25519?: string;
        };
      };
      if (parsed && typeof parsed === "object" && parsed.body) {
        recordDataB64Status("gossip", "decoded_json");
        msg.senderTid = String(parsed.tid ?? msg.senderTid);
        if (typeof parsed.timestamp === "number") {
          msg.timestamp = new Date(parsed.timestamp * 1000).toISOString();
        }
        if (parsed.body.recipient_tid !== undefined) {
          msg.recipientTid = String(parsed.body.recipient_tid);
        }
        if (typeof parsed.body.ciphertext === "string") {
          msg.ciphertext = parsed.body.ciphertext;
        }
        if (typeof parsed.body.nonce === "string") {
          msg.nonce = parsed.body.nonce;
        }
        if (typeof parsed.body.sender_x25519 === "string") {
          msg.senderX25519 = parsed.body.sender_x25519;
        }
      }
    } catch {
      // Hash matched but bytes didn't parse — keep wire projection.
    }
  } else {
    recordDataB64Status("gossip", "decoded_proto");
  }
  return true;
}

/**
 * Store an encrypted DM received from a peer hub. Mirrors the
 * /v1/dm/send route's integrity check: signature, dataB64 against
 * hash, app-key. When dataB64 is JSON we project ciphertext/nonce/
 * sender_x25519 from the decoded body so a tampered relay can't
 * substitute a different ciphertext past us.
 */
export async function storeGossipDm(
  msg: GossipDm,
  fromHubId: string
): Promise<boolean> {
  try {
    const hash = Buffer.from(msg.hash, "base64");
    const signature = Buffer.from(msg.signature, "base64");
    const signer = Buffer.from(msg.signer, "base64");
    if (!nacl.sign.detached.verify(hash, signature, signer)) {
      console.warn(`Rejected gossip DM ${msg.hash}: bad signature`);
      return false;
    }
    if (!verifyAndOverrideDmDataB64(msg)) {
      return false;
    }
    const signerHex = Buffer.from(signer).toString("hex");
    const valid = await appKeyCache.isValid(msg.senderTid, signerHex);
    if (!valid) {
      console.warn(`Rejected gossip DM ${msg.hash}: signer not an app key for ${msg.senderTid}`);
      return false;
    }
  } catch (err) {
    console.warn(`Rejected gossip DM ${msg.hash}: verify error`, err);
    return false;
  }

  if (msg.dataB64) {
    await storeSignedEnvelope(msg.hash, msg.dataB64);
  }

  const conversationId = msg.conversationId ||
    conversationIdFor(msg.senderTid, msg.recipientTid);
  const sentAt = new Date(msg.timestamp);

  await db.query(
    `INSERT INTO dm_conversations (id, tid_a, tid_b, last_message_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE
       SET last_message_at = GREATEST(dm_conversations.last_message_at, EXCLUDED.last_message_at)`,
    [
      conversationId,
      Math.min(parseInt(msg.senderTid, 10), parseInt(msg.recipientTid, 10)),
      Math.max(parseInt(msg.senderTid, 10), parseInt(msg.recipientTid, 10)),
      sentAt,
    ]
  );

  const result = await db.query(
    `INSERT INTO dm_messages
       (hash, conversation_id, sender_tid, recipient_tid,
        ciphertext, nonce, sender_x25519, timestamp, signature, signer)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (hash) DO NOTHING`,
    [
      msg.hash,
      conversationId,
      msg.senderTid,
      msg.recipientTid,
      msg.ciphertext,
      msg.nonce,
      msg.senderX25519,
      sentAt,
      msg.signature,
      msg.signer,
    ]
  );

  const stored = (result.rowCount ?? 0) > 0;
  if (stored) {
    console.log(`Stored gossip DM ${msg.hash.slice(0, 12)}… from ${fromHubId}`);
    broadcastToClients("new_dm", {
      hash: msg.hash,
      conversationId,
      recipientTid: msg.recipientTid,
    });
  }
  return stored;
}

/**
 * Store / refresh a DM key gossiped from a peer hub. Idempotent.
 */
export async function storeGossipDmKey(
  tid: string,
  x25519Pubkey: string
): Promise<void> {
  await db.query(
    `INSERT INTO dm_keys (tid, x25519_pubkey, registered_at, updated_at)
     VALUES ($1, $2, NOW(), NOW())
     ON CONFLICT (tid) DO UPDATE
       SET x25519_pubkey = EXCLUDED.x25519_pubkey,
           updated_at    = NOW()`,
    [tid, x25519Pubkey]
  );
}

/** Recent DM hashes for catch-up gossip. */
export async function getDmHashes(
  since: Date,
  limit: number
): Promise<string[]> {
  const result = await db.query(
    `SELECT hash FROM dm_messages
     WHERE created_at > $1
     ORDER BY created_at ASC
     LIMIT $2`,
    [since, limit]
  );
  return result.rows.map((r: { hash: string }) => r.hash);
}

/** Subset of input hashes that we don't yet have in dm_messages. */
export async function findMissingDmHashes(
  hashes: string[]
): Promise<string[]> {
  if (hashes.length === 0) return [];
  const result = await db.query(
    `SELECT hash FROM dm_messages WHERE hash = ANY($1)`,
    [hashes]
  );
  const existing = new Set(result.rows.map((r: { hash: string }) => r.hash));
  return hashes.filter((h) => !existing.has(h));
}

/** Pull DMs by hash for sending in a dm_messages envelope. */
export async function getDmsByHashes(hashes: string[]): Promise<GossipDm[]> {
  if (hashes.length === 0) return [];
  const [result, envelopes] = await Promise.all([
    db.query(
      `SELECT hash, conversation_id, sender_tid, recipient_tid,
              ciphertext, nonce, sender_x25519, timestamp, signature, signer
       FROM dm_messages
       WHERE hash = ANY($1)`,
      [hashes],
    ),
    getSignedEnvelopes(hashes),
  ]);
  return result.rows.map((r: {
    hash: string;
    conversation_id: string;
    sender_tid: string;
    recipient_tid: string;
    ciphertext: string;
    nonce: string;
    sender_x25519: string;
    timestamp: Date | string;
    signature: string;
    signer: string;
  }) => ({
    hash: r.hash,
    conversationId: r.conversation_id,
    senderTid: r.sender_tid.toString(),
    recipientTid: r.recipient_tid.toString(),
    ciphertext: r.ciphertext,
    nonce: r.nonce,
    senderX25519: r.sender_x25519,
    timestamp:
      r.timestamp instanceof Date ? r.timestamp.toISOString() : r.timestamp,
    signature: r.signature,
    signer: r.signer,
    dataB64: envelopes.get(r.hash),
  }));
}

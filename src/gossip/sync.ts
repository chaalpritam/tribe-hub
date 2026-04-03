import { db } from "../storage/db";
import { GossipMessage } from "../types";
import { validateGossipMessage } from "../validation/verifier";

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
 */
export async function getMessagesByHashes(hashes: string[]): Promise<GossipMessage[]> {
  if (hashes.length === 0) return [];

  const result = await db.query(
    `SELECT hash, tid, type, text, parent_hash, channel_id, mentions, embeds, timestamp, signature, signer
     FROM messages WHERE hash = ANY($1)`,
    [hashes]
  );
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
  }));
}

/**
 * Store a message received from a peer (after validation).
 * Returns true if stored, false if invalid or already exists.
 */
export async function storeGossipMessage(msg: GossipMessage, fromHubId: string): Promise<boolean> {
  // Validate signature and app key
  const validation = await validateGossipMessage(msg);
  if (!validation.valid) {
    console.warn(`Rejected gossip message ${msg.hash}: ${validation.error}`);
    return false;
  }

  // Store (ON CONFLICT = already have it, that's fine)
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

  return (result.rowCount ?? 0) > 0;
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

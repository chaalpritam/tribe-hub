import { FastifyInstance } from "fastify";
import { Connection, PublicKey } from "@solana/web3.js";
import { db } from "../../storage/db";
import { config } from "../../config";
import { fetchErLinks, mergedCount } from "../er-client";

// Reuse a single connection for backfill requests
const solanaConnection = new Connection(config.solanaRpcUrl, "confirmed");

/**
 * Read a u64 from a buffer at the given offset (little-endian).
 * Uses manual byte-level operations for browser compatibility.
 */
function readU64LE(data: Buffer, offset: number): number {
  let val = 0;
  for (let i = 0; i < 8; i++) {
    val += data[offset + i] * 2 ** (i * 8);
  }
  return val;
}

function tidToBuffer(tid: number): Buffer {
  const buf = Buffer.alloc(8);
  let val = tid;
  for (let i = 0; i < 8; i++) {
    buf[i] = val & 0xff;
    val = Math.floor(val / 256);
  }
  return buf;
}

/**
 * Try to fetch a TID from on-chain and insert into the DB.
 * Backfills TIDs that were registered before the hub started.
 */
async function backfillTid(tid: string): Promise<boolean> {
  try {
    const connection = solanaConnection;
    const programId = new PublicKey(config.programIds.tidRegistry);
    const tidNum = parseInt(tid, 10);

    const [tidPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("tid"), tidToBuffer(tidNum)],
      programId
    );

    const info = await connection.getAccountInfo(tidPda);
    if (!info) return false;

    // TidRecord layout: 8 disc + 8 tid + 32 custody + 32 recovery + 8 registered_at + 1 bump
    const data = info.data;
    if (data.length < 89) return false;

    const custodyAddress = new PublicKey(data.slice(16, 48)).toBase58();
    const recoveryAddress = new PublicKey(data.slice(48, 80)).toBase58();
    const registeredAt = readU64LE(data, 80);
    const registeredDate = new Date(registeredAt * 1000);

    await db.query(
      `INSERT INTO tids (tid, custody_address, recovery_address, registered_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (tid) DO NOTHING`,
      [tid, custodyAddress, recoveryAddress, registeredDate]
    );

    return true;
  } catch {
    return false;
  }
}

export async function userRoutes(server: FastifyInstance): Promise<void> {
  // List all users
  server.get<{
    Querystring: { limit?: string; offset?: string };
  }>("/v1/users", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 100);
    const offset = parseInt(request.query.offset || "0", 10);
    const result = await db.query(
      `SELECT f.tid, f.custody_address, f.recovery_address, f.registered_at, f.username,
              (SELECT COUNT(*) FROM social_graph WHERE follower_tid = f.tid AND deleted_at IS NULL) as following_count,
              (SELECT COUNT(*) FROM social_graph WHERE following_tid = f.tid AND deleted_at IS NULL) as followers_count
       FROM tids f
       ORDER BY f.tid DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const countResult = await db.query(`SELECT COUNT(*)::int as total FROM tids`);
    return { users: result.rows, total: countResult.rows[0]?.total ?? 0 };
  });

  // Get single user by TID
  server.get<{ Params: { tid: string } }>("/v1/user/:tid", async (request, reply) => {
    let result = await db.query(
      `SELECT f.tid, f.custody_address, f.recovery_address, f.registered_at, f.username,
              (SELECT COUNT(*) FROM social_graph WHERE follower_tid = f.tid AND deleted_at IS NULL) as following_count,
              (SELECT COUNT(*) FROM social_graph WHERE following_tid = f.tid AND deleted_at IS NULL) as followers_count
       FROM tids f
       WHERE f.tid = $1`,
      [request.params.tid]
    );

    // If not found, try to backfill from on-chain
    if (result.rows.length === 0) {
      const backfilled = await backfillTid(request.params.tid);
      if (backfilled) {
        result = await db.query(
          `SELECT f.tid, f.custody_address, f.recovery_address, f.registered_at, f.username,
                  (SELECT COUNT(*) FROM social_graph WHERE follower_tid = f.tid AND deleted_at IS NULL) as following_count,
                  (SELECT COUNT(*) FROM social_graph WHERE following_tid = f.tid AND deleted_at IS NULL) as followers_count
           FROM tids f
           WHERE f.tid = $1`,
          [request.params.tid]
        );
      }
    }

    if (result.rows.length === 0) {
      return reply.status(404).send({ error: "User not found" });
    }

    // Tack on the latest profile fields published as USER_DATA_ADD.
    const fieldsResult = await db.query(
      `SELECT DISTINCT ON (field) field, value, timestamp
       FROM user_data
       WHERE tid = $1
       ORDER BY field, timestamp DESC`,
      [request.params.tid]
    );
    const profile: Record<string, string> = {};
    for (const row of fieldsResult.rows) {
      profile[row.field] = row.value;
    }

    // Pull the social_graph follow lists, then merge with the ER's
    // view (in-flight follows added, in-flight unfollows subtracted)
    // so the displayed counts both move on a fresh click AND don't
    // dip during the indexer-lag window. The simple "social_graph
    // count + ER delta" approach we used previously dipped to the
    // pre-click value during the gap between L1 settlement and the
    // hub indexer picking up the on-chain row.
    const row = result.rows[0];
    const [sgFollowing, sgFollowers, erLinks] = await Promise.all([
      db.query(
        `SELECT following_tid FROM social_graph
         WHERE follower_tid = $1 AND deleted_at IS NULL`,
        [request.params.tid],
      ),
      db.query(
        `SELECT follower_tid FROM social_graph
         WHERE following_tid = $1 AND deleted_at IS NULL`,
        [request.params.tid],
      ),
      fetchErLinks(request.params.tid),
    ]);
    const sgFollowingTids = sgFollowing.rows.map((r) => String(r.following_tid));
    const sgFollowerTids = sgFollowers.rows.map((r) => String(r.follower_tid));
    const followingCount = mergedCount(
      sgFollowingTids,
      erLinks.followingTids,
      erLinks.unfollowingTids,
    );
    const followersCount = mergedCount(
      sgFollowerTids,
      erLinks.followerTids,
      erLinks.unfollowerTids,
    );
    return {
      ...row,
      following_count: String(followingCount),
      followers_count: String(followersCount),
      profile,
    };
  });

  // Bulk read of a TID's currently-active reactions. Used by mobile
  // clients to populate like / heart state on every tweet card in
  // the feed without N+1 round-trips. A reaction is "active" when a
  // REACTION_ADD exists with no later REACTION_REMOVE for the same
  // (tid, parent_hash) — REACTION_REMOVE clears every reaction the
  // user has on that target, regardless of reaction subtype, so the
  // remove check doesn't constrain on the subtype field.
  server.get<{
    Params: { tid: string };
    Querystring: { type?: string; limit?: string };
  }>("/v1/users/:tid/reactions", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "1000", 10), 5000);
    const filterType = request.query.type;
    const params: unknown[] = [request.params.tid];
    let typeClause = "";
    if (filterType) {
      params.push(filterType);
      typeClause = `AND ra.text = $${params.length}`;
    }
    params.push(limit);
    const result = await db.query(
      `SELECT ra.parent_hash AS target_hash,
              ra.text AS reaction_type,
              ra.timestamp AS reacted_at
       FROM messages ra
       WHERE ra.type = 3
         AND ra.tid = $1
         ${typeClause}
         AND NOT EXISTS (
           SELECT 1 FROM messages rr
           WHERE rr.type = 4
             AND rr.tid = ra.tid
             AND rr.parent_hash = ra.parent_hash
             AND rr.timestamp > ra.timestamp
         )
       ORDER BY ra.timestamp DESC
       LIMIT $${params.length}`,
      params
    );
    return { reactions: result.rows };
  });

  // Tweets this TID has currently liked (REACTION_ADD with body.type
  // stored as text='1', no later REACTION_REMOVE on the same target).
  // Returns full tweet rows joined the same way /v1/feed does so the
  // frontend can drop the result straight into TweetCard. liked_at
  // is the reaction timestamp so the tab orders by recency-of-like
  // rather than recency-of-tweet.
  server.get<{
    Params: { tid: string };
    Querystring: { limit?: string };
  }>("/v1/users/:tid/likes", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 200);
    const result = await db.query(
      `SELECT m.hash, m.tid, m.type, m.text, m.parent_hash, m.channel_id,
              m.mentions, m.embeds, m.timestamp,
              t.username,
              (SELECT value FROM user_data
                 WHERE tid = m.tid AND field = 'displayName'
                 ORDER BY timestamp DESC LIMIT 1) AS display_name,
              (SELECT value FROM user_data
                 WHERE tid = m.tid AND field = 'pfpUrl'
                 ORDER BY timestamp DESC LIMIT 1) AS pfp_url,
              ra.timestamp AS liked_at
       FROM messages ra
       JOIN messages m ON m.hash = ra.parent_hash AND m.type = 1
       LEFT JOIN tids t ON t.tid = m.tid
       WHERE ra.type = 3
         AND ra.tid = $1
         AND ra.text = '1'
         AND NOT EXISTS (
           SELECT 1 FROM messages rr
           WHERE rr.type = 4
             AND rr.tid = ra.tid
             AND rr.parent_hash = ra.parent_hash
             AND rr.timestamp > ra.timestamp
         )
         AND NOT EXISTS (
           SELECT 1 FROM messages tr
           WHERE tr.type = 2 AND tr.tid = m.tid AND tr.text = m.hash
         )
       ORDER BY ra.timestamp DESC
       LIMIT $2`,
      [request.params.tid, limit]
    );
    return { tweets: result.rows };
  });
}

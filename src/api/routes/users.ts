import { FastifyInstance } from "fastify";
import { Connection, PublicKey } from "@solana/web3.js";
import { db } from "../../storage/db";
import { config } from "../../config";

// Reuse a single connection for backfill requests
const solanaConnection = new Connection(config.solanaRpcUrl, "confirmed");

/**
 * Best-effort fetch of in-flight follow / unfollow deltas for a TID
 * from the ER server. Returns zeros when ER isn't configured, the
 * request times out, or the response is malformed — the caller falls
 * back to the social_graph counts alone in those cases. The whole
 * point is to surface a freshly-clicked Follow before the L1
 * settlement + indexer pickup completes (~10–60s window).
 */
async function fetchErPendingDeltas(
  tid: string,
): Promise<{ followingDelta: number; followersDelta: number }> {
  if (!config.erServerUrl) return { followingDelta: 0, followersDelta: 0 };
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    config.erServerTimeoutMs,
  );
  try {
    const res = await fetch(
      `${config.erServerUrl}/pending-deltas/${encodeURIComponent(tid)}`,
      { signal: controller.signal },
    );
    if (!res.ok) return { followingDelta: 0, followersDelta: 0 };
    const body = (await res.json()) as {
      followingDelta?: number;
      followersDelta?: number;
    };
    return {
      followingDelta: Number.isFinite(body.followingDelta)
        ? Number(body.followingDelta)
        : 0,
      followersDelta: Number.isFinite(body.followersDelta)
        ? Number(body.followersDelta)
        : 0,
    };
  } catch {
    // Timeout or network error — fail open.
    return { followingDelta: 0, followersDelta: 0 };
  } finally {
    clearTimeout(timeout);
  }
}

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

    // Add in-flight follow / unfollow ops the ER hasn't yet settled
    // to L1, so the displayed counts move as soon as the user clicks
    // Follow instead of waiting for the indexer to catch up. ER is
    // best-effort — if it's down or slow we keep social_graph alone.
    const row = result.rows[0];
    const settledFollowing = Number(row.following_count ?? 0);
    const settledFollowers = Number(row.followers_count ?? 0);
    const { followingDelta, followersDelta } = await fetchErPendingDeltas(
      request.params.tid,
    );
    return {
      ...row,
      following_count: String(Math.max(0, settledFollowing + followingDelta)),
      followers_count: String(Math.max(0, settledFollowers + followersDelta)),
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
}

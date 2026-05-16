import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";

/// Reels feed. A reel is a TWEET_ADD with body.post_kind = 'reel' —
/// see PLAN.md's option B over a separate REEL_ADD envelope.
/// Reactions / replies / bookmarks all work without changes because
/// the row sits in the same `messages` table as plain tweets; this
/// endpoint just adds the post_kind filter that the partial index
/// from migration 028 covers.
///
/// Two sort modes:
///
/// - `?sort=recent` (default) — `ORDER BY timestamp DESC`. Chronological
///   firehose; what the original /v1/reels shipped with.
/// - `?sort=engagement` — Reads precomputed ranking from
///   `reels_engagement_cache` (refreshed every 5 min by
///   src/storage/reels-cache.ts). Top 500 reels by HN-style score:
///   (reactions + bookmarks*2 + replies) / (hours+2)^1.5 over the
///   last 14d. The cache stores only (hash, rank, score); we JOIN
///   back to messages so reply/reaction/bookmark counts on each card
///   are still live (not stale to the last cache refresh).
///
///   Falls back to a live (uncached) query when the cache is empty —
///   happens for ~30s after boot before the first refresh fires.
///
/// Cursor semantics differ per sort:
///
/// - `recent`: cursor is the last row's timestamp (string ms). Next page
///   fetches `timestamp < cursor`.
/// - `engagement`: cursor is the last row's rank (integer string). Next
///   page fetches `rank > cursor`. Past page 25 (rank 500) we hit the
///   long-tail boundary and the page comes back empty even if more
///   reels exist — clients should switch to ?sort=recent to keep
///   paginating.
const ENGAGEMENT_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

// Shared SELECT — same shape for both sort modes so consumers can
// ignore `score` when they don't care about it. `score` is always
// present so clients can render a "trending" badge without a
// second query. When called from the engagement path we add a JOIN
// to reels_engagement_cache and select its rank/score; the recent
// path just leaves them null.
const countsSubquery = `
  SELECT m.hash, m.tid, m.text, m.embeds, m.timestamp,
         m.audio_title, m.location, m.post_kind, m.channel_id,
         t.username,
         (SELECT value FROM user_data
            WHERE tid = m.tid AND field = 'displayName'
            ORDER BY timestamp DESC LIMIT 1) AS display_name,
         (SELECT value FROM user_data
            WHERE tid = m.tid AND field = 'pfpUrl'
            ORDER BY timestamp DESC LIMIT 1) AS pfp_url,
         (SELECT COUNT(*)::int FROM messages rep
            WHERE rep.type = 1 AND rep.parent_hash = m.hash
              AND NOT EXISTS (
                SELECT 1 FROM messages d
                WHERE d.type = 2 AND d.tid = rep.tid AND d.text = rep.hash
              )
         ) AS reply_count,
         (SELECT COUNT(DISTINCT r.tid)::int FROM messages r
            WHERE r.type = 3 AND r.parent_hash = m.hash AND r.text = '1'
              AND NOT EXISTS (
                SELECT 1 FROM messages u
                WHERE u.type = 4 AND u.tid = r.tid AND u.parent_hash = m.hash
                  AND u.timestamp > r.timestamp
              )
         ) AS reaction_count,
         (SELECT COUNT(*)::int FROM bookmarks b WHERE b.target_hash = m.hash) AS bookmark_count
    FROM messages m
    LEFT JOIN tids t ON t.tid = m.tid
   WHERE m.type = 1
     AND m.post_kind = 'reel'
     AND NOT EXISTS (
       SELECT 1 FROM messages r
       WHERE r.type = 2 AND r.tid = m.tid AND r.text = m.hash
     )
`;

export async function reelsRoutes(server: FastifyInstance): Promise<void> {
  server.get<{
    Querystring: { limit?: string; cursor?: string; sort?: string };
  }>("/v1/reels", async (request, reply) => {
    const limit = Math.min(parseInt(request.query.limit || "20", 10), 100);
    const sort = request.query.sort === "engagement" ? "engagement" : "recent";
    const cursor = request.query.cursor;

    if (sort === "engagement") {
      return engagementSorted(limit, cursor, reply);
    }

    // sort === "recent" — original behavior preserved.
    const params: (string | number)[] = [limit];
    let query = countsSubquery;
    if (cursor) {
      query += ` AND m.timestamp < $2`;
      params.push(cursor);
    }
    query += ` ORDER BY m.timestamp DESC LIMIT $1`;
    const result = await db.query(query, params);
    return {
      reels: result.rows,
      cursor:
        result.rows.length === limit
          ? result.rows[result.rows.length - 1]?.timestamp
          : undefined,
    };
  });
}

async function engagementSorted(
  limit: number,
  cursor: string | undefined,
  reply: import("fastify").FastifyReply
): Promise<{ reels: unknown[]; cursor?: string }> {
  // Cursor is the last row's rank — integer string. Reject anything
  // else with 400 so a bad cursor doesn't quietly fall through.
  let afterRank = 0;
  if (cursor) {
    const parsed = parseInt(cursor, 10);
    if (!Number.isFinite(parsed) || parsed < 0 || String(parsed) !== cursor) {
      reply.code(400);
      return { reels: [], cursor: undefined };
    }
    afterRank = parsed;
  }

  // Read from cache: INNER JOIN drops reels that haven't been ranked
  // yet (e.g. just-posted reels that are too new for the cache, or
  // reels past rank 500). The recent path is the answer for those.
  const cacheParams: (string | number)[] = [limit, afterRank];
  const cacheQuery = `
    WITH reel AS (
      ${countsSubquery}
    )
    SELECT reel.*, c.score, c.rank
      FROM reel
      JOIN reels_engagement_cache c ON c.hash = reel.hash
     WHERE c.rank > $2
     ORDER BY c.rank ASC
     LIMIT $1
  `;
  const cached = await db.query(cacheQuery, cacheParams);

  if (cached.rows.length > 0 || afterRank > 0) {
    // Either we got rows, or we're paginating past the start — in the
    // pagination case an empty result legitimately means "end of
    // cached results, stop paginating."
    return {
      reels: cached.rows,
      cursor:
        cached.rows.length === limit
          ? String(cached.rows[cached.rows.length - 1]?.rank)
          : undefined,
    };
  }

  // Cache miss on the very first page — happens for ~30s after boot
  // before the first refresh fires, or if the refresh has been
  // failing. Fall back to a live (uncached) ranking query so the
  // endpoint never returns empty on a populated DB.
  const sinceMs = Date.now() - ENGAGEMENT_WINDOW_MS;
  const liveQuery = `
    WITH ranked AS (
      ${countsSubquery}
        AND m.timestamp >= $2
    )
    SELECT *,
           (
             (reaction_count + bookmark_count * 2 + reply_count)::float
             / POWER(
                 GREATEST(
                   2.0,
                   EXTRACT(EPOCH FROM (NOW() - to_timestamp(timestamp / 1000.0))) / 3600.0 + 2
                 ),
                 1.5
               )
           ) AS score
      FROM ranked
     ORDER BY score DESC, hash ASC
     LIMIT $1
  `;
  const live = await db.query(liveQuery, [limit, sinceMs]);
  return {
    reels: live.rows,
    // No cursor in fallback mode — the route returns whatever fits
    // on the first page and asks the client to retry once the cache
    // has populated.
    cursor: undefined,
  };
}

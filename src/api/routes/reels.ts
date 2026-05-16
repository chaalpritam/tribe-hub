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
/// - `?sort=engagement` — HN-style time-decayed score over the last 14d
///   window. Score = (reactions + bookmarks*2 + replies) / (hours+2)^1.5.
///   Bookmarks weigh double because saving a reel is a stronger signal
///   than a like; the (hours+2)^1.5 denominator stops new posts from
///   locking the top spot indefinitely.
///
/// Cursor semantics differ per sort:
///
/// - `recent`: cursor is the last row's timestamp (string ms). Next page
///   fetches `timestamp < cursor`.
/// - `engagement`: cursor is base64(JSON({score, hash})). Next page
///   fetches `(score, hash) < (cursor.score, cursor.hash)` lexicographically
///   so ties on score still paginate deterministically.
const ENGAGEMENT_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

type EngagementCursor = { score: number; hash: string };

function encodeEngagementCursor(c: EngagementCursor): string {
  return Buffer.from(JSON.stringify(c), "utf8").toString("base64url");
}

function decodeEngagementCursor(s: string): EngagementCursor | undefined {
  try {
    const decoded = Buffer.from(s, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded) as EngagementCursor;
    if (typeof parsed.score === "number" && typeof parsed.hash === "string") {
      return parsed;
    }
  } catch {
    // fall through
  }
  return undefined;
}

export async function reelsRoutes(server: FastifyInstance): Promise<void> {
  server.get<{
    Querystring: { limit?: string; cursor?: string; sort?: string };
  }>("/v1/reels", async (request, reply) => {
    const limit = Math.min(parseInt(request.query.limit || "20", 10), 100);
    const sort = request.query.sort === "engagement" ? "engagement" : "recent";
    const cursor = request.query.cursor;

    // Shared SELECT — same shape for both sort modes so consumers can
    // ignore `score` when they don't care about it. `score` is always
    // present so clients can render a "trending" badge without a
    // second query.
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

    if (sort === "engagement") {
      const sinceMs = Date.now() - ENGAGEMENT_WINDOW_MS;
      const params: (string | number)[] = [limit, sinceMs];
      let query = `
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
      `;
      if (cursor) {
        const decoded = decodeEngagementCursor(cursor);
        if (!decoded) {
          reply.code(400);
          return { error: "invalid cursor" };
        }
        params.push(decoded.score, decoded.hash);
        // Tie-break on hash so identical scores still paginate
        // deterministically. `score` is computed in the outer SELECT
        // so we wrap one more layer to filter on it.
        query = `
          SELECT * FROM (${query}) scored
           WHERE (score < $3) OR (score = $3 AND hash > $4)
        `;
      }
      query += ` ORDER BY score DESC, hash ASC LIMIT $1`;
      const result = await db.query(query, params);
      const last = result.rows[result.rows.length - 1];
      return {
        reels: result.rows,
        cursor:
          result.rows.length === limit && last
            ? encodeEngagementCursor({ score: last.score, hash: last.hash })
            : undefined,
      };
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

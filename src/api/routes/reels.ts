import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";

/// Reels feed. A reel is a TWEET_ADD with body.post_kind = 'reel' —
/// see PLAN.md's option B over a separate REEL_ADD envelope.
/// Reactions / replies / bookmarks all work without changes because
/// the row sits in the same `messages` table as plain tweets; this
/// endpoint just adds the post_kind filter that the partial index
/// from migration 028 covers.
export async function reelsRoutes(server: FastifyInstance): Promise<void> {
  server.get<{
    Querystring: { limit?: string; cursor?: string };
  }>("/v1/reels", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "20", 10), 100);
    const cursor = request.query.cursor;
    const params: (string | number)[] = [limit];
    let query = `
      SELECT m.hash, m.tid, m.text, m.embeds, m.timestamp,
             m.audio_title, m.location, m.post_kind,
             m.channel_id,
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
    if (cursor) {
      query += ` AND m.timestamp < $2`;
      params.push(cursor);
    }
    query += ` ORDER BY m.timestamp DESC LIMIT $1`;
    const result = await db.query(query, params);
    return {
      reels: result.rows,
      cursor: result.rows.length === limit
        ? result.rows[result.rows.length - 1]?.timestamp
        : undefined,
    };
  });
}

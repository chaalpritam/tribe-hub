import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";

export async function bookmarkRoutes(server: FastifyInstance): Promise<void> {
  // List a TID's current bookmarks (most-recently saved first).
  // Joins against messages so each row has the tweet text + timestamp
  // when the bookmark target is a known tweet on this hub.
  server.get<{
    Params: { tid: string };
    Querystring: { limit?: string; offset?: string };
  }>("/v1/bookmarks/:tid", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 200);
    const offset = parseInt(request.query.offset || "0", 10);
    const result = await db.query(
      `SELECT b.target_hash, b.bookmarked_at,
              m.tid AS author_tid, m.text, m.timestamp,
              m.parent_hash, m.channel_id, m.embeds,
              t.username,
              (SELECT value FROM user_data WHERE tid = m.tid AND field = 'displayName' ORDER BY timestamp DESC LIMIT 1) AS author_display_name,
              (SELECT value FROM user_data WHERE tid = m.tid AND field = 'pfpUrl' ORDER BY timestamp DESC LIMIT 1) AS author_pfp_url
       FROM bookmarks b
       LEFT JOIN messages m ON m.hash = b.target_hash
       LEFT JOIN tids t ON t.tid = m.tid
       WHERE b.tid = $1
       ORDER BY b.bookmarked_at DESC
       LIMIT $2 OFFSET $3`,
      [request.params.tid, limit, offset]
    );
    return { bookmarks: result.rows };
  });
}

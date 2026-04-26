import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";

export async function channelRoutes(server: FastifyInstance): Promise<void> {
  // List all channels — registered + any channel_id seen in tweets.
  server.get<{
    Querystring: { limit?: string; offset?: string };
  }>("/v1/channels", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 100);
    const offset = parseInt(request.query.offset || "0", 10);
    const result = await db.query(
      `WITH activity AS (
         SELECT channel_id,
                COUNT(*)::int AS tweet_count,
                MAX(timestamp) AS last_tweet_at
         FROM messages
         WHERE channel_id IS NOT NULL AND type = 1
         GROUP BY channel_id
       )
       SELECT
         COALESCE(c.id, a.channel_id) AS id,
         c.name,
         c.description,
         c.created_by,
         c.created_at,
         COALESCE(a.tweet_count, 0) AS tweet_count,
         a.last_tweet_at,
         (SELECT COUNT(*) FROM channel_memberships m
            WHERE m.channel_id = COALESCE(c.id, a.channel_id)
              AND m.left_at IS NULL) AS member_count
       FROM channels c
       FULL OUTER JOIN activity a ON c.id = a.channel_id
       ORDER BY a.last_tweet_at DESC NULLS LAST, c.created_at DESC NULLS LAST
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return { channels: result.rows };
  });

  // Get one channel by id.
  server.get<{ Params: { id: string } }>(
    "/v1/channels/:id",
    async (request, reply) => {
      const result = await db.query(
        `SELECT c.id, c.name, c.description, c.created_by, c.created_at,
                (SELECT COUNT(*) FROM channel_memberships m
                   WHERE m.channel_id = c.id AND m.left_at IS NULL) AS member_count
         FROM channels c
         WHERE c.id = $1`,
        [request.params.id]
      );
      if (result.rows.length === 0) {
        return reply.status(404).send({ error: "Channel not found" });
      }
      return result.rows[0];
    }
  );

  // List members of a channel.
  server.get<{ Params: { id: string } }>(
    "/v1/channels/:id/members",
    async (request) => {
      const result = await db.query(
        `SELECT m.tid, m.joined_at,
                t.username, t.custody_address
         FROM channel_memberships m
         LEFT JOIN tids t ON t.tid = m.tid
         WHERE m.channel_id = $1 AND m.left_at IS NULL
         ORDER BY m.joined_at DESC`,
        [request.params.id]
      );
      return { members: result.rows };
    }
  );

  // List channels a TID has joined.
  server.get<{ Params: { tid: string } }>(
    "/v1/channels/member/:tid",
    async (request) => {
      const result = await db.query(
        `SELECT c.id, c.name, c.description, m.joined_at
         FROM channel_memberships m
         JOIN channels c ON c.id = m.channel_id
         WHERE m.tid = $1 AND m.left_at IS NULL
         ORDER BY m.joined_at DESC`,
        [request.params.tid]
      );
      return { channels: result.rows };
    }
  );
}

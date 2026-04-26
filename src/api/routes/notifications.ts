import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";

export async function notificationRoutes(server: FastifyInstance): Promise<void> {
  // Per-TID notification feed. Aggregates from existing tables
  // rather than carrying its own notifications table — that lets us
  // ship without a migration; persisted notifications can come later.
  server.get<{
    Params: { tid: string };
    Querystring: { limit?: string };
  }>("/v1/notifications/:tid", async (request) => {
    const tid = request.params.tid;
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 200);

    const result = await db.query(
      `(
        -- New followers: rows in social_graph that point at me.
        SELECT 'follow' AS type,
               follower_tid AS actor_tid,
               NULL::text AS target_hash,
               NULL::text AS preview,
               created_at
        FROM social_graph
        WHERE following_tid = $1 AND deleted_at IS NULL
      )
      UNION ALL
      (
        -- Reactions on my tweets: REACTION_ADD whose parent_hash is
        -- one of my tweets.
        SELECT 'reaction' AS type,
               r.tid AS actor_tid,
               r.parent_hash AS target_hash,
               m.text AS preview,
               r.timestamp AS created_at
        FROM messages r
        JOIN messages m ON m.hash = r.parent_hash
        WHERE r.type = 3 AND m.tid = $1
      )
      UNION ALL
      (
        -- Replies to my tweets: TWEET_ADD with parent_hash pointing
        -- at one of mine, posted by someone else.
        SELECT 'reply' AS type,
               c.tid AS actor_tid,
               c.parent_hash AS target_hash,
               c.text AS preview,
               c.timestamp AS created_at
        FROM messages c
        JOIN messages m ON m.hash = c.parent_hash
        WHERE c.type = 1
          AND c.parent_hash IS NOT NULL
          AND m.tid = $1
          AND c.tid <> $1
      )
      UNION ALL
      (
        -- Tips received.
        SELECT 'tip' AS type,
               sender_tid AS actor_tid,
               target_hash,
               (amount::text || ' ' || currency) AS preview,
               sent_at AS created_at
        FROM tips
        WHERE recipient_tid = $1
      )
      UNION ALL
      (
        -- Mentions: tweets that include my TID in mentions[].
        SELECT 'mention' AS type,
               m.tid AS actor_tid,
               m.hash AS target_hash,
               m.text AS preview,
               m.timestamp AS created_at
        FROM messages m
        WHERE m.type = 1 AND m.mentions @> ARRAY[$1::bigint]
          AND m.tid <> $1
      )
      ORDER BY created_at DESC
      LIMIT $2`,
      [tid, limit]
    );
    return { notifications: result.rows };
  });

  server.get<{ Params: { tid: string } }>(
    "/v1/notifications/:tid/count",
    async (request) => {
      const tid = request.params.tid;
      const result = await db.query(
        `SELECT
           (SELECT COUNT(*) FROM social_graph
              WHERE following_tid = $1 AND deleted_at IS NULL) +
           (SELECT COUNT(*) FROM messages r
              JOIN messages m ON m.hash = r.parent_hash
              WHERE r.type = 3 AND m.tid = $1) +
           (SELECT COUNT(*) FROM messages c
              JOIN messages m ON m.hash = c.parent_hash
              WHERE c.type = 1 AND c.parent_hash IS NOT NULL
                AND m.tid = $1 AND c.tid <> $1) +
           (SELECT COUNT(*) FROM tips WHERE recipient_tid = $1) +
           (SELECT COUNT(*) FROM messages
              WHERE type = 1 AND mentions @> ARRAY[$1::bigint] AND tid <> $1)
           AS count`,
        [tid]
      );
      return { count: Number(result.rows[0]?.count ?? 0) };
    }
  );
}

import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";

export async function notificationRoutes(server: FastifyInstance): Promise<void> {
  // Per-TID notification feed. Aggregates from existing tables
  // rather than carrying its own notifications table — that lets us
  // ship without a migration; persisted notifications can come later.
  //
  // The inner UNION enumerates raw events; the outer SELECT joins
  // tids + user_data on actor_tid so callers see `username`/`pfpUrl`
  // instead of falling back to "TID #N" in the UI.
  server.get<{
    Params: { tid: string };
    Querystring: { limit?: string };
  }>("/v1/notifications/:tid", async (request) => {
    const tid = request.params.tid;
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 200);

    const result = await db.query(
      `WITH events AS (
        (
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
        UNION ALL
        (
          -- Votes on my polls.
          SELECT 'poll_vote' AS type,
                 pv.voter_tid AS actor_tid,
                 pv.poll_id AS target_hash,
                 p.question AS preview,
                 pv.voted_at AS created_at
          FROM poll_votes pv
          JOIN polls p ON p.id = pv.poll_id
          WHERE p.creator_tid = $1 AND pv.voter_tid <> $1
        )
        UNION ALL
        (
          -- RSVPs on my events.
          SELECT 'event_rsvp' AS type,
                 r.tid AS actor_tid,
                 r.event_id AS target_hash,
                 (e.title || ' (' || r.status || ')') AS preview,
                 r.rsvped_at AS created_at
          FROM event_rsvps r
          JOIN events e ON e.id = r.event_id
          WHERE e.creator_tid = $1 AND r.tid <> $1
        )
        UNION ALL
        (
          -- Someone claimed my task.
          SELECT 'task_claim' AS type,
                 claimed_by_tid AS actor_tid,
                 id AS target_hash,
                 title AS preview,
                 claimed_at AS created_at
          FROM tasks
          WHERE creator_tid = $1
            AND claimed_by_tid IS NOT NULL
            AND claimed_by_tid <> $1
        )
        UNION ALL
        (
          -- Someone completed my task.
          SELECT 'task_complete' AS type,
                 completed_by_tid AS actor_tid,
                 id AS target_hash,
                 title AS preview,
                 completed_at AS created_at
          FROM tasks
          WHERE creator_tid = $1
            AND completed_by_tid IS NOT NULL
            AND completed_by_tid <> $1
        )
        UNION ALL
        (
          -- Pledges to my crowdfund.
          SELECT 'crowdfund_pledge' AS type,
                 cp.pledger_tid AS actor_tid,
                 cp.crowdfund_id AS target_hash,
                 (cf.title || ' · ' || cp.amount::text || ' ' || cp.currency) AS preview,
                 cp.pledged_at AS created_at
          FROM crowdfund_pledges cp
          JOIN crowdfunds cf ON cf.id = cp.crowdfund_id
          WHERE cf.creator_tid = $1 AND cp.pledger_tid <> $1
        )
        UNION ALL
        (
          -- Direct messages I received. Body is encrypted so we
          -- don't surface a preview; target_hash carries the
          -- conversation_id so the frontend can deep-link to
          -- /messages?conv=<id>.
          SELECT 'dm' AS type,
                 sender_tid AS actor_tid,
                 conversation_id AS target_hash,
                 NULL::text AS preview,
                 timestamp AS created_at
          FROM dm_messages
          WHERE recipient_tid = $1 AND sender_tid <> $1
        )
        UNION ALL
        (
          -- Group DMs sent to a group I'm in. target_hash carries
          -- the group_id so the frontend can deep-link to
          -- /messages?group=<id>; preview shows the group name so
          -- the row reads as "@alice messaged Trip planning".
          SELECT 'dm_group' AS type,
                 m.sender_tid AS actor_tid,
                 m.group_id AS target_hash,
                 g.name AS preview,
                 m.timestamp AS created_at
          FROM dm_group_messages m
          JOIN dm_group_members me
            ON me.group_id = m.group_id AND me.tid = $1
          JOIN dm_groups g ON g.id = m.group_id
          WHERE m.sender_tid <> $1
        )
      )
      SELECT e.type,
             e.actor_tid,
             e.target_hash,
             e.preview,
             e.created_at,
             t.username AS actor_username,
             (SELECT value FROM user_data
                WHERE tid = e.actor_tid AND field = 'pfpUrl'
                ORDER BY timestamp DESC LIMIT 1) AS actor_pfp_url
      FROM events e
      LEFT JOIN tids t ON t.tid = e.actor_tid
      ORDER BY e.created_at DESC
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
              WHERE type = 1 AND mentions @> ARRAY[$1::bigint] AND tid <> $1) +
           (SELECT COUNT(*) FROM poll_votes pv
              JOIN polls p ON p.id = pv.poll_id
              WHERE p.creator_tid = $1 AND pv.voter_tid <> $1) +
           (SELECT COUNT(*) FROM event_rsvps r
              JOIN events e ON e.id = r.event_id
              WHERE e.creator_tid = $1 AND r.tid <> $1) +
           (SELECT COUNT(*) FROM tasks
              WHERE creator_tid = $1 AND claimed_by_tid IS NOT NULL
                AND claimed_by_tid <> $1) +
           (SELECT COUNT(*) FROM tasks
              WHERE creator_tid = $1 AND completed_by_tid IS NOT NULL
                AND completed_by_tid <> $1) +
           (SELECT COUNT(*) FROM crowdfund_pledges cp
              JOIN crowdfunds cf ON cf.id = cp.crowdfund_id
              WHERE cf.creator_tid = $1 AND cp.pledger_tid <> $1) +
           (SELECT COUNT(*) FROM dm_messages
              WHERE recipient_tid = $1 AND sender_tid <> $1) +
           (SELECT COUNT(*) FROM dm_group_messages m
              JOIN dm_group_members me
                ON me.group_id = m.group_id AND me.tid = $1
              WHERE m.sender_tid <> $1)
           AS count`,
        [tid]
      );
      return { count: Number(result.rows[0]?.count ?? 0) };
    }
  );
}

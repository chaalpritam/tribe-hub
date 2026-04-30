import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";

export async function feedRoutes(server: FastifyInstance): Promise<void> {
  // Global feed -- all tweets (type=1), newest first
  server.get<{
    Querystring: { limit?: string; cursor?: string };
  }>("/v1/feed", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "20", 10), 100);
    const cursor = request.query.cursor;
    const params: (string | number)[] = [limit];
    let query = `
      SELECT m.hash, m.tid, m.type, m.text, m.parent_hash, m.channel_id,
             m.mentions, m.embeds, m.timestamp, t.username,
             (SELECT value FROM user_data WHERE tid = m.tid AND field = 'displayName' ORDER BY timestamp DESC LIMIT 1) AS display_name,
             (SELECT value FROM user_data WHERE tid = m.tid AND field = 'pfpUrl' ORDER BY timestamp DESC LIMIT 1) AS pfp_url
      FROM messages m
      LEFT JOIN tids t ON t.tid = m.tid
      WHERE m.type = 1
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
      tweets: result.rows,
      cursor: result.rows.length === limit
        ? result.rows[result.rows.length - 1]?.timestamp
        : undefined,
    };
  });

  // User feed
  server.get<{
    Params: { tid: string };
    Querystring: { limit?: string; cursor?: string };
  }>("/v1/feed/:tid", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "20", 10), 100);
    const cursor = request.query.cursor;
    const params: (string | number)[] = [request.params.tid, limit];
    let query = `
      SELECT m.hash, m.tid, m.type, m.text, m.parent_hash, m.channel_id,
             m.mentions, m.embeds, m.timestamp, t.username,
             (SELECT value FROM user_data WHERE tid = m.tid AND field = 'displayName' ORDER BY timestamp DESC LIMIT 1) AS display_name,
             (SELECT value FROM user_data WHERE tid = m.tid AND field = 'pfpUrl' ORDER BY timestamp DESC LIMIT 1) AS pfp_url
      FROM messages m
      LEFT JOIN tids t ON t.tid = m.tid
      WHERE m.tid = $1 AND m.type = 1
        AND NOT EXISTS (
          SELECT 1 FROM messages r
          WHERE r.type = 2 AND r.tid = m.tid AND r.text = m.hash
        )
    `;
    if (cursor) {
      query += ` AND m.timestamp < $3`;
      params.push(cursor);
    }
    query += ` ORDER BY m.timestamp DESC LIMIT $2`;
    const result = await db.query(query, params);
    return { tweets: result.rows };
  });

  // Single message by hash
  server.get<{
    Params: { hash: string };
  }>("/v1/messages/:hash", async (request, reply) => {
    const result = await db.query(
      `SELECT m.hash, m.tid, m.type, m.text, m.parent_hash, m.channel_id,
              m.mentions, m.embeds, m.timestamp, m.signature, m.signer,
              m.received_from, t.username,
              (SELECT value FROM user_data WHERE tid = m.tid AND field = 'displayName' ORDER BY timestamp DESC LIMIT 1) AS display_name,
              (SELECT value FROM user_data WHERE tid = m.tid AND field = 'pfpUrl' ORDER BY timestamp DESC LIMIT 1) AS pfp_url
       FROM messages m
       LEFT JOIN tids t ON t.tid = m.tid
       WHERE m.hash = $1
         AND NOT EXISTS (
           SELECT 1 FROM messages r
           WHERE r.type = 2 AND r.tid = m.tid AND r.text = m.hash
         )`,
      [request.params.hash]
    );
    if (result.rows.length === 0) {
      return reply.status(404).send({ error: "Message not found" });
    }
    return result.rows[0];
  });

  // Search tweets
  server.get<{
    Querystring: { q: string; limit?: string };
  }>("/v1/search", async (request, reply) => {
    const q = request.query.q;
    if (!q || q.length < 2) {
      return reply.status(400).send({ error: "Query must be at least 2 characters" });
    }
    if (q.length > 200) {
      return reply.status(400).send({ error: "Query too long" });
    }
    const limit = Math.min(parseInt(request.query.limit || "20", 10), 100);
    const result = await db.query(
      `SELECT m.hash, m.tid, m.type, m.text, m.parent_hash, m.channel_id,
              m.mentions, m.embeds, m.timestamp, t.username,
              (SELECT value FROM user_data WHERE tid = m.tid AND field = 'displayName' ORDER BY timestamp DESC LIMIT 1) AS display_name,
              (SELECT value FROM user_data WHERE tid = m.tid AND field = 'pfpUrl' ORDER BY timestamp DESC LIMIT 1) AS pfp_url
       FROM messages m
       LEFT JOIN tids t ON t.tid = m.tid
       WHERE m.type = 1 AND m.text ILIKE $1
         AND NOT EXISTS (
           SELECT 1 FROM messages r
           WHERE r.type = 2 AND r.tid = m.tid AND r.text = m.hash
         )
       ORDER BY m.timestamp DESC LIMIT $2`,
      [`%${q}%`, limit]
    );
    return { tweets: result.rows, query: q };
  });

  // Search users by username (case-insensitive prefix match) or by
  // recent USER_DATA displayName / bio substring.
  server.get<{
    Querystring: { q: string; limit?: string };
  }>("/v1/search/users", async (request, reply) => {
    const q = request.query.q;
    if (!q || q.length < 2) {
      return reply
        .status(400)
        .send({ error: "Query must be at least 2 characters" });
    }
    if (q.length > 100) {
      return reply.status(400).send({ error: "Query too long" });
    }
    const limit = Math.min(parseInt(request.query.limit || "20", 10), 50);
    const result = await db.query(
      `SELECT DISTINCT t.tid, t.custody_address, t.username,
              dn.value AS display_name, bio.value AS bio, pfp.value AS pfp_url
       FROM tids t
       LEFT JOIN LATERAL (
         SELECT value FROM user_data
         WHERE tid = t.tid AND field = 'displayName'
         ORDER BY timestamp DESC LIMIT 1
       ) dn ON TRUE
       LEFT JOIN LATERAL (
         SELECT value FROM user_data
         WHERE tid = t.tid AND field = 'bio'
         ORDER BY timestamp DESC LIMIT 1
       ) bio ON TRUE
       LEFT JOIN LATERAL (
         SELECT value FROM user_data
         WHERE tid = t.tid AND field = 'pfpUrl'
         ORDER BY timestamp DESC LIMIT 1
       ) pfp ON TRUE
       WHERE
         t.username ILIKE $1
         OR dn.value ILIKE $2
         OR bio.value ILIKE $2
       ORDER BY
         CASE WHEN t.username ILIKE $1 THEN 0 ELSE 1 END,
         t.tid
       LIMIT $3`,
      [`${q}%`, `%${q}%`, limit]
    );
    return { users: result.rows, query: q };
  });

  // Search channels by id or name.
  server.get<{
    Querystring: { q: string; limit?: string };
  }>("/v1/search/channels", async (request, reply) => {
    const q = request.query.q;
    if (!q || q.length < 2) {
      return reply
        .status(400)
        .send({ error: "Query must be at least 2 characters" });
    }
    if (q.length > 100) {
      return reply.status(400).send({ error: "Query too long" });
    }
    const limit = Math.min(parseInt(request.query.limit || "20", 10), 50);
    const result = await db.query(
      `WITH activity AS (
         SELECT channel_id, MAX(timestamp) AS last_tweet_at
         FROM messages
         WHERE channel_id IS NOT NULL AND type = 1
         GROUP BY channel_id
       )
       SELECT
         COALESCE(c.id, a.channel_id) AS id,
         c.name,
         c.description,
         (SELECT COUNT(*) FROM channel_memberships m
            WHERE m.channel_id = COALESCE(c.id, a.channel_id)
              AND m.left_at IS NULL) AS member_count,
         a.last_tweet_at
       FROM channels c
       FULL OUTER JOIN activity a ON c.id = a.channel_id
       WHERE
         COALESCE(c.id, a.channel_id) ILIKE $1
         OR c.name ILIKE $1
       ORDER BY a.last_tweet_at DESC NULLS LAST
       LIMIT $2`,
      [`%${q}%`, limit]
    );
    return { channels: result.rows, query: q };
  });

  // Search polls by question text.
  server.get<{
    Querystring: { q: string; limit?: string };
  }>("/v1/search/polls", async (request, reply) => {
    const q = request.query.q;
    if (!q || q.length < 2) {
      return reply
        .status(400)
        .send({ error: "Query must be at least 2 characters" });
    }
    if (q.length > 200) {
      return reply.status(400).send({ error: "Query too long" });
    }
    const limit = Math.min(parseInt(request.query.limit || "20", 10), 50);
    const result = await db.query(
      `SELECT p.id, p.creator_tid, p.question, p.options, p.expires_at,
              p.channel_id, p.created_at, t.username AS creator_username,
              (SELECT COUNT(*) FROM poll_votes pv WHERE pv.poll_id = p.id)
                AS total_votes
       FROM polls p
       LEFT JOIN tids t ON t.tid = p.creator_tid
       WHERE p.question ILIKE $1
          OR EXISTS (
            SELECT 1 FROM unnest(p.options) AS opt WHERE opt ILIKE $1
          )
       ORDER BY p.created_at DESC
       LIMIT $2`,
      [`%${q}%`, limit]
    );
    return { polls: result.rows, query: q };
  });

  // Search events by title, description, or location text.
  server.get<{
    Querystring: { q: string; limit?: string };
  }>("/v1/search/events", async (request, reply) => {
    const q = request.query.q;
    if (!q || q.length < 2) {
      return reply
        .status(400)
        .send({ error: "Query must be at least 2 characters" });
    }
    if (q.length > 200) {
      return reply.status(400).send({ error: "Query too long" });
    }
    const limit = Math.min(parseInt(request.query.limit || "20", 10), 50);
    const result = await db.query(
      `SELECT e.id, e.creator_tid, e.title, e.description, e.starts_at,
              e.ends_at, e.location_text, e.image_url, e.channel_id,
              e.created_at, t.username AS creator_username,
              (SELECT COUNT(*) FROM event_rsvps r
                 WHERE r.event_id = e.id AND r.status = 'yes')
                AS yes_count
       FROM events e
       LEFT JOIN tids t ON t.tid = e.creator_tid
       WHERE e.title ILIKE $1
          OR e.description ILIKE $1
          OR e.location_text ILIKE $1
       ORDER BY e.starts_at DESC
       LIMIT $2`,
      [`%${q}%`, limit]
    );
    return { events: result.rows, query: q };
  });

  // Search tasks by title, description, or reward text.
  server.get<{
    Querystring: { q: string; limit?: string };
  }>("/v1/search/tasks", async (request, reply) => {
    const q = request.query.q;
    if (!q || q.length < 2) {
      return reply
        .status(400)
        .send({ error: "Query must be at least 2 characters" });
    }
    if (q.length > 200) {
      return reply.status(400).send({ error: "Query too long" });
    }
    const limit = Math.min(parseInt(request.query.limit || "20", 10), 50);
    const result = await db.query(
      `SELECT tk.id, tk.creator_tid, tk.title, tk.description, tk.reward_text,
              tk.status, tk.claimed_by_tid, tk.completed_by_tid,
              tk.channel_id, tk.created_at,
              t.username AS creator_username
       FROM tasks tk
       LEFT JOIN tids t ON t.tid = tk.creator_tid
       WHERE tk.title ILIKE $1
          OR tk.description ILIKE $1
          OR tk.reward_text ILIKE $1
       ORDER BY tk.created_at DESC
       LIMIT $2`,
      [`%${q}%`, limit]
    );
    return { tasks: result.rows, query: q };
  });

  // Search crowdfunds by title or description.
  server.get<{
    Querystring: { q: string; limit?: string };
  }>("/v1/search/crowdfunds", async (request, reply) => {
    const q = request.query.q;
    if (!q || q.length < 2) {
      return reply
        .status(400)
        .send({ error: "Query must be at least 2 characters" });
    }
    if (q.length > 200) {
      return reply.status(400).send({ error: "Query too long" });
    }
    const limit = Math.min(parseInt(request.query.limit || "20", 10), 50);
    const result = await db.query(
      `SELECT cf.id, cf.creator_tid, cf.title, cf.description, cf.goal_amount,
              cf.currency, cf.deadline_at, cf.image_url, cf.channel_id,
              cf.created_at, t.username AS creator_username,
              (SELECT COALESCE(SUM(amount), 0) FROM crowdfund_pledges cp
                 WHERE cp.crowdfund_id = cf.id) AS pledged_amount,
              (SELECT COUNT(*) FROM crowdfund_pledges cp
                 WHERE cp.crowdfund_id = cf.id) AS pledger_count
       FROM crowdfunds cf
       LEFT JOIN tids t ON t.tid = cf.creator_tid
       WHERE cf.title ILIKE $1
          OR cf.description ILIKE $1
       ORDER BY cf.created_at DESC
       LIMIT $2`,
      [`%${q}%`, limit]
    );
    return { crowdfunds: result.rows, query: q };
  });

  // Channel feed
  server.get<{
    Params: { channelId: string };
    Querystring: { limit?: string; cursor?: string };
  }>("/v1/feed/channel/:channelId", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "20", 10), 100);
    const result = await db.query(
      `SELECT m.hash, m.tid, m.type, m.text, m.parent_hash, m.channel_id,
              m.mentions, m.embeds, m.timestamp, t.username,
              (SELECT value FROM user_data WHERE tid = m.tid AND field = 'displayName' ORDER BY timestamp DESC LIMIT 1) AS display_name,
              (SELECT value FROM user_data WHERE tid = m.tid AND field = 'pfpUrl' ORDER BY timestamp DESC LIMIT 1) AS pfp_url
       FROM messages m
       LEFT JOIN tids t ON t.tid = m.tid
       WHERE m.channel_id = $1 AND m.type = 1
         AND NOT EXISTS (
           SELECT 1 FROM messages r
           WHERE r.type = 2 AND r.tid = m.tid AND r.text = m.hash
         )
       ORDER BY m.timestamp DESC LIMIT $2`,
      [request.params.channelId, limit]
    );
    return { tweets: result.rows };
  });

  // Replies to a message
  server.get<{
    Querystring: { hash: string; limit?: string };
  }>("/v1/replies", async (request, reply) => {
    const hash = request.query.hash;
    if (!hash) return reply.status(400).send({ error: "hash query parameter required" });
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 100);
    const result = await db.query(
      `SELECT m.hash, m.tid, m.type, m.text, m.parent_hash, m.channel_id,
              m.mentions, m.embeds, m.timestamp, t.username,
              (SELECT value FROM user_data WHERE tid = m.tid AND field = 'displayName' ORDER BY timestamp DESC LIMIT 1) AS display_name,
              (SELECT value FROM user_data WHERE tid = m.tid AND field = 'pfpUrl' ORDER BY timestamp DESC LIMIT 1) AS pfp_url
       FROM messages m
       LEFT JOIN tids t ON t.tid = m.tid
       WHERE m.parent_hash = $1 AND m.type = 1
         AND NOT EXISTS (
           SELECT 1 FROM messages r
           WHERE r.type = 2 AND r.tid = m.tid AND r.text = m.hash
         )
       ORDER BY m.timestamp ASC LIMIT $2`,
      [hash, limit]
    );
    const countResult = await db.query(
      `SELECT COUNT(*)::int AS count FROM messages WHERE parent_hash = $1 AND type = 1`,
      [hash]
    );
    return { replies: result.rows, count: countResult.rows[0]?.count ?? 0 };
  });
}

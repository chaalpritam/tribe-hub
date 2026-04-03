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
             m.mentions, m.embeds, m.timestamp, t.username
      FROM messages m
      LEFT JOIN tids t ON t.tid = m.tid
      WHERE m.type = 1
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
             m.mentions, m.embeds, m.timestamp, t.username
      FROM messages m
      LEFT JOIN tids t ON t.tid = m.tid
      WHERE m.tid = $1 AND m.type = 1
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
              m.received_from, t.username
       FROM messages m
       LEFT JOIN tids t ON t.tid = m.tid
       WHERE m.hash = $1`,
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
    const limit = Math.min(parseInt(request.query.limit || "20", 10), 100);
    const result = await db.query(
      `SELECT m.hash, m.tid, m.type, m.text, m.parent_hash, m.channel_id,
              m.mentions, m.embeds, m.timestamp, t.username
       FROM messages m
       LEFT JOIN tids t ON t.tid = m.tid
       WHERE m.type = 1 AND m.text ILIKE $1
       ORDER BY m.timestamp DESC LIMIT $2`,
      [`%${q}%`, limit]
    );
    return { tweets: result.rows, query: q };
  });

  // Channel feed
  server.get<{
    Params: { channelId: string };
    Querystring: { limit?: string; cursor?: string };
  }>("/v1/feed/channel/:channelId", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "20", 10), 100);
    const result = await db.query(
      `SELECT m.hash, m.tid, m.type, m.text, m.parent_hash, m.channel_id,
              m.mentions, m.embeds, m.timestamp, t.username
       FROM messages m
       LEFT JOIN tids t ON t.tid = m.tid
       WHERE m.channel_id = $1 AND m.type = 1
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
              m.mentions, m.embeds, m.timestamp, t.username
       FROM messages m
       LEFT JOIN tids t ON t.tid = m.tid
       WHERE m.parent_hash = $1 AND m.type = 1
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

import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";

export async function tipRoutes(server: FastifyInstance): Promise<void> {
  // Tips a TID has sent.
  server.get<{
    Params: { tid: string };
    Querystring: { limit?: string };
  }>("/v1/tips/sent/:tid", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "100", 10), 200);
    const result = await db.query(
      `SELECT hash, sender_tid, recipient_tid, target_hash, amount,
              currency, tx_signature, sent_at
       FROM tips
       WHERE sender_tid = $1
       ORDER BY sent_at DESC
       LIMIT $2`,
      [request.params.tid, limit]
    );
    return { tips: result.rows };
  });

  // Tips a TID has received.
  server.get<{
    Params: { tid: string };
    Querystring: { limit?: string };
  }>("/v1/tips/received/:tid", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "100", 10), 200);
    const result = await db.query(
      `SELECT hash, sender_tid, recipient_tid, target_hash, amount,
              currency, tx_signature, sent_at
       FROM tips
       WHERE recipient_tid = $1
       ORDER BY sent_at DESC
       LIMIT $2`,
      [request.params.tid, limit]
    );
    return { tips: result.rows };
  });

  // Tips against a particular target (e.g. a tweet hash).
  server.get<{
    Params: { hash: string };
    Querystring: { limit?: string };
  }>("/v1/tips/target/:hash", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "100", 10), 200);
    const result = await db.query(
      `SELECT hash, sender_tid, recipient_tid, amount, currency,
              tx_signature, sent_at
       FROM tips
       WHERE target_hash = $1
       ORDER BY sent_at DESC
       LIMIT $2`,
      [request.params.hash, limit]
    );
    const totalsResult = await db.query(
      `SELECT COUNT(*)::int AS tip_count,
              COALESCE(SUM(amount), 0) AS total_amount
       FROM tips WHERE target_hash = $1`,
      [request.params.hash]
    );
    return {
      tips: result.rows,
      tip_count: totalsResult.rows[0].tip_count,
      total_amount: totalsResult.rows[0].total_amount,
    };
  });
}

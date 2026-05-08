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

  // ── On-chain mirror: TipRecord PDAs from tip-registry ──────────────

  // Tips a TID has sent on chain. Joins the recipient's username so
  // the profile can render @name.tribe without a per-row round-trip
  // (mirrors the join already on /v1/tips/onchain/target/:hash).
  server.get<{
    Params: { tid: string };
    Querystring: { limit?: string };
  }>("/v1/tips/onchain/sent/:tid", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "100", 10), 200);
    const result = await db.query(
      `SELECT t.pda, t.sender, t.recipient, t.sender_tid, t.recipient_tid,
              t.amount, t.tip_id, t.target_hash, t.has_target,
              t.tx_signature, t.created_at,
              ti.username AS counterparty_username
       FROM onchain_tip_records t
       LEFT JOIN tids ti ON ti.tid = t.recipient_tid
       WHERE t.sender_tid = $1
       ORDER BY t.created_at DESC
       LIMIT $2`,
      [request.params.tid, limit]
    );
    return { tips: result.rows };
  });

  // Tips a TID has received on chain. Joins the sender's username
  // so received-tip rows can show who sent without a second hop.
  server.get<{
    Params: { tid: string };
    Querystring: { limit?: string };
  }>("/v1/tips/onchain/received/:tid", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "100", 10), 200);
    const result = await db.query(
      `SELECT t.pda, t.sender, t.recipient, t.sender_tid, t.recipient_tid,
              t.amount, t.tip_id, t.target_hash, t.has_target,
              t.tx_signature, t.created_at,
              ti.username AS counterparty_username
       FROM onchain_tip_records t
       LEFT JOIN tids ti ON ti.tid = t.sender_tid
       WHERE t.recipient_tid = $1
       ORDER BY t.created_at DESC
       LIMIT $2`,
      [request.params.tid, limit]
    );
    return { tips: result.rows };
  });

  // On-chain tips against a particular target. `target_hash` here is
  // the base64 of the 32-byte content hash that was packed into the
  // TipSent event — same encoding the off-chain TIP_ADD envelope uses
  // for `target_hash`, so the two are directly comparable.
  server.get<{
    Params: { hash: string };
    Querystring: { limit?: string };
  }>("/v1/tips/onchain/target/:hash", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "100", 10), 200);
    const result = await db.query(
      `SELECT t.pda, t.sender, t.recipient, t.sender_tid, t.recipient_tid,
              t.amount, t.tip_id, t.tx_signature, t.created_at,
              ti.username AS sender_username
       FROM onchain_tip_records t
       LEFT JOIN tids ti ON ti.tid = t.sender_tid
       WHERE t.target_hash = $1 AND t.has_target = TRUE
       ORDER BY t.created_at DESC
       LIMIT $2`,
      [request.params.hash, limit]
    );
    const totalsResult = await db.query(
      `SELECT COUNT(*)::int AS tip_count,
              COALESCE(SUM(amount), 0)::bigint AS total_lamports
       FROM onchain_tip_records
       WHERE target_hash = $1 AND has_target = TRUE`,
      [request.params.hash]
    );
    return {
      tips: result.rows,
      tip_count: totalsResult.rows[0].tip_count,
      total_lamports: totalsResult.rows[0].total_lamports,
    };
  });
}

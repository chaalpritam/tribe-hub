import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";

export async function crowdfundRoutes(server: FastifyInstance): Promise<void> {
  // List crowdfunds with current pledged totals.
  server.get<{
    Querystring: { limit?: string; offset?: string; channel_id?: string };
  }>("/v1/crowdfunds", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 100);
    const offset = parseInt(request.query.offset || "0", 10);
    const params: unknown[] = [];
    let where = "";
    if (request.query.channel_id) {
      params.push(request.query.channel_id);
      where = `WHERE channel_id = $${params.length}`;
    }
    params.push(limit, offset);
    const result = await db.query(
      `SELECT c.id, c.creator_tid, c.title, c.description, c.goal_amount,
              c.currency, c.deadline_at, c.image_url, c.channel_id,
              c.created_at,
              COALESCE(SUM(p.amount), 0) AS raised_amount,
              COUNT(DISTINCT p.pledger_tid)::int AS pledger_count
       FROM crowdfunds c
       LEFT JOIN crowdfund_pledges p ON p.crowdfund_id = c.id
       ${where}
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return { crowdfunds: result.rows };
  });

  server.get<{ Params: { id: string } }>(
    "/v1/crowdfunds/:id",
    async (request, reply) => {
      const result = await db.query(
        `SELECT c.id, c.creator_tid, c.title, c.description, c.goal_amount,
                c.currency, c.deadline_at, c.image_url, c.channel_id,
                c.created_at,
                COALESCE(SUM(p.amount), 0) AS raised_amount,
                COUNT(DISTINCT p.pledger_tid)::int AS pledger_count
         FROM crowdfunds c
         LEFT JOIN crowdfund_pledges p ON p.crowdfund_id = c.id
         WHERE c.id = $1
         GROUP BY c.id`,
        [request.params.id]
      );
      if (result.rows.length === 0) {
        return reply.status(404).send({ error: "Crowdfund not found" });
      }
      return result.rows[0];
    }
  );

  server.get<{
    Params: { id: string };
    Querystring: { limit?: string };
  }>("/v1/crowdfunds/:id/pledges", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "100", 10), 200);
    const result = await db.query(
      `SELECT hash, pledger_tid, amount, currency, pledged_at
       FROM crowdfund_pledges
       WHERE crowdfund_id = $1
       ORDER BY pledged_at DESC
       LIMIT $2`,
      [request.params.id, limit]
    );
    return { pledges: result.rows };
  });

  // ── On-chain mirror: Crowdfund + Pledge PDAs from crowdfund-registry ──

  // List on-chain campaigns. Filterable by status (0/1/2) and creator
  // TID; sorted newest first.
  server.get<{
    Querystring: {
      limit?: string;
      offset?: string;
      status?: string;
      creator_tid?: string;
    };
  }>("/v1/crowdfunds/onchain", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 100);
    const offset = parseInt(request.query.offset || "0", 10);
    const filters: string[] = [];
    const params: unknown[] = [];
    if (request.query.status !== undefined) {
      params.push(parseInt(request.query.status, 10));
      filters.push(`status = $${params.length}`);
    }
    if (request.query.creator_tid !== undefined) {
      params.push(request.query.creator_tid);
      filters.push(`creator_tid = $${params.length}`);
    }
    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    params.push(limit, offset);
    const result = await db.query(
      `SELECT pda, creator, creator_tid, crowdfund_id, goal_amount,
              total_pledged, pledge_count, deadline_at, status,
              created_at, updated_at, create_tx_signature, claim_tx_signature
       FROM onchain_crowdfunds
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return { crowdfunds: result.rows };
  });

  // Single on-chain campaign by PDA.
  server.get<{ Params: { pda: string } }>(
    "/v1/crowdfunds/onchain/:pda",
    async (request, reply) => {
      const result = await db.query(
        `SELECT pda, creator, creator_tid, crowdfund_id, goal_amount,
                total_pledged, pledge_count, deadline_at, status,
                created_at, updated_at, create_tx_signature, claim_tx_signature
         FROM onchain_crowdfunds
         WHERE pda = $1`,
        [request.params.pda]
      );
      if (result.rows.length === 0) {
        return reply.status(404).send({ error: "Crowdfund not found" });
      }
      return result.rows[0];
    }
  );

  // Pledges on a campaign, joined with the off-chain envelope's
  // tx_signature when present (so callers can render "X pledged
  // 0.05 SOL — confirmed on chain at <txSig>").
  server.get<{ Params: { pda: string } }>(
    "/v1/crowdfunds/onchain/:pda/pledges",
    async (request) => {
      const result = await db.query(
        `SELECT crowdfund, backer, backer_tid, amount,
                last_pledge_tx, pledged_at, updated_at
         FROM onchain_crowdfund_pledges
         WHERE crowdfund = $1
         ORDER BY pledged_at DESC`,
        [request.params.pda]
      );
      return { pledges: result.rows };
    }
  );

  // All on-chain pledges a TID has made (across campaigns).
  server.get<{ Params: { tid: string } }>(
    "/v1/crowdfunds/onchain/backer/:tid",
    async (request) => {
      const result = await db.query(
        `SELECT p.crowdfund, p.backer, p.backer_tid, p.amount,
                p.last_pledge_tx, p.pledged_at, p.updated_at,
                c.creator_tid, c.goal_amount, c.total_pledged,
                c.deadline_at, c.status
         FROM onchain_crowdfund_pledges p
         LEFT JOIN onchain_crowdfunds c ON c.pda = p.crowdfund
         WHERE p.backer_tid = $1
         ORDER BY p.updated_at DESC`,
        [request.params.tid]
      );
      return { pledges: result.rows };
    }
  );
}

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
}

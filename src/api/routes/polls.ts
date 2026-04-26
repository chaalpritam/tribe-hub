import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";

export async function pollRoutes(server: FastifyInstance): Promise<void> {
  // List polls — most recent first.
  server.get<{
    Querystring: { limit?: string; offset?: string; channel_id?: string };
  }>("/v1/polls", async (request) => {
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
      `SELECT id, creator_tid, question, options, expires_at, channel_id, created_at
       FROM polls
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return { polls: result.rows };
  });

  // Get a single poll with its tally.
  server.get<{ Params: { id: string } }>(
    "/v1/polls/:id",
    async (request, reply) => {
      const pollResult = await db.query(
        `SELECT id, creator_tid, question, options, expires_at, channel_id, created_at
         FROM polls WHERE id = $1`,
        [request.params.id]
      );
      if (pollResult.rows.length === 0) {
        return reply.status(404).send({ error: "Poll not found" });
      }
      const tallyResult = await db.query(
        `SELECT option_index, COUNT(*)::int AS votes
         FROM poll_votes WHERE poll_id = $1
         GROUP BY option_index`,
        [request.params.id]
      );
      const counts: Record<number, number> = {};
      for (const row of tallyResult.rows) {
        counts[row.option_index] = row.votes;
      }
      return { ...pollResult.rows[0], tally: counts };
    }
  );

  // Get a TID's vote on a poll (404 if hasn't voted).
  server.get<{ Params: { id: string; tid: string } }>(
    "/v1/polls/:id/vote/:tid",
    async (request, reply) => {
      const result = await db.query(
        `SELECT option_index, voted_at FROM poll_votes
         WHERE poll_id = $1 AND voter_tid = $2`,
        [request.params.id, request.params.tid]
      );
      if (result.rows.length === 0) {
        return reply.status(404).send({ error: "No vote" });
      }
      return result.rows[0];
    }
  );
}

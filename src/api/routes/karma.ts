import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";

// Per-action point weights. Tunable; keeping them small + integer.
const WEIGHTS = {
  tweet: 1,
  reactionReceived: 2,
  follower: 5,
  tipReceived: 10,
  taskCompleted: 20,
};

export async function karmaRoutes(server: FastifyInstance): Promise<void> {
  server.get<{ Params: { tid: string } }>(
    "/v1/users/:tid/karma",
    async (request) => {
      const tid = request.params.tid;
      const result = await db.query(
        `SELECT
           (SELECT COUNT(*)::int FROM messages
              WHERE tid = $1 AND type = 1) AS tweets,
           (SELECT COUNT(*)::int FROM messages
              WHERE type = 3
                AND parent_hash IN (
                  SELECT hash FROM messages WHERE tid = $1 AND type = 1
                )) AS reactions_received,
           (SELECT COUNT(*)::int FROM social_graph
              WHERE following_tid = $1 AND deleted_at IS NULL) AS followers,
           (SELECT COUNT(*)::int FROM tips
              WHERE recipient_tid = $1) AS tips_received,
           (SELECT COUNT(*)::int FROM tasks
              WHERE completed_by_tid = $1 AND status = 'completed') AS tasks_completed`,
        [tid]
      );
      const row = result.rows[0] ?? {
        tweets: 0,
        reactions_received: 0,
        followers: 0,
        tips_received: 0,
        tasks_completed: 0,
      };
      const total =
        row.tweets * WEIGHTS.tweet +
        row.reactions_received * WEIGHTS.reactionReceived +
        row.followers * WEIGHTS.follower +
        row.tips_received * WEIGHTS.tipReceived +
        row.tasks_completed * WEIGHTS.taskCompleted;
      // Levels: 0-99 (1), 100-499 (2), 500-1999 (3), 2000-9999 (4), 10000+ (5).
      const level =
        total >= 10000 ? 5 : total >= 2000 ? 4 : total >= 500 ? 3 : total >= 100 ? 2 : 1;
      return {
        tid,
        total,
        level,
        breakdown: row,
        weights: WEIGHTS,
      };
    }
  );

  // ── On-chain mirror: KarmaAccount + KarmaProofs from karma-registry ──

  // On-chain karma counters for a TID.
  server.get<{ Params: { tid: string } }>(
    "/v1/karma/onchain/:tid",
    async (request, reply) => {
      const result = await db.query(
        `SELECT tid, pda, tips_received_count, tips_received_lamports,
                tasks_completed_count, tasks_completed_reward_lamports,
                initialized_at, updated_at
         FROM onchain_karma
         WHERE tid = $1`,
        [request.params.tid]
      );
      if (result.rows.length === 0) {
        return reply.status(404).send({
          error: "On-chain karma account not initialized for this TID",
        });
      }
      return result.rows[0];
    }
  );

  // Audit trail of every credit a TID has received. Filterable by
  // kind (1=Tip, 2=Task) so callers can render "tipped from" and
  // "tasks completed" tabs without two round trips.
  server.get<{
    Params: { tid: string };
    Querystring: { kind?: string; limit?: string };
  }>("/v1/karma/onchain/:tid/proofs", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "100", 10), 200);
    const params: unknown[] = [request.params.tid];
    let where = "tid = $1";
    if (request.query.kind !== undefined) {
      params.push(parseInt(request.query.kind, 10));
      where += ` AND kind = $${params.length}`;
    }
    params.push(limit);
    const result = await db.query(
      `SELECT source, kind, tid, karma_pda, amount,
              tx_signature, recorded_at
       FROM onchain_karma_proofs
       WHERE ${where}
       ORDER BY recorded_at DESC
       LIMIT $${params.length}`,
      params
    );
    return { proofs: result.rows };
  });
}

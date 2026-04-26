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
}

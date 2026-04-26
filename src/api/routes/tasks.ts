import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";

export async function taskRoutes(server: FastifyInstance): Promise<void> {
  server.get<{
    Querystring: {
      limit?: string;
      offset?: string;
      channel_id?: string;
      status?: string;
    };
  }>("/v1/tasks", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 100);
    const offset = parseInt(request.query.offset || "0", 10);
    const params: unknown[] = [];
    const where: string[] = [];
    if (request.query.channel_id) {
      params.push(request.query.channel_id);
      where.push(`channel_id = $${params.length}`);
    }
    if (request.query.status) {
      params.push(request.query.status);
      where.push(`status = $${params.length}`);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    params.push(limit, offset);
    const result = await db.query(
      `SELECT id, creator_tid, title, description, reward_text, channel_id,
              status, claimed_by_tid, completed_by_tid,
              claimed_at, completed_at, created_at
       FROM tasks
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return { tasks: result.rows };
  });

  server.get<{ Params: { id: string } }>(
    "/v1/tasks/:id",
    async (request, reply) => {
      const result = await db.query(
        `SELECT id, creator_tid, title, description, reward_text, channel_id,
                status, claimed_by_tid, completed_by_tid,
                claimed_at, completed_at, created_at
         FROM tasks WHERE id = $1`,
        [request.params.id]
      );
      if (result.rows.length === 0) {
        return reply.status(404).send({ error: "Task not found" });
      }
      return result.rows[0];
    }
  );
}

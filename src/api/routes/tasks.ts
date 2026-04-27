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

  // ── On-chain mirror: Task PDAs from task-registry ─────────────────

  // List on-chain tasks. Filterable by status (0=Open, 1=Claimed,
  // 2=Completed, 3=Cancelled) and creator TID.
  server.get<{
    Querystring: {
      limit?: string;
      offset?: string;
      status?: string;
      creator_tid?: string;
    };
  }>("/v1/tasks/onchain", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 100);
    const offset = parseInt(request.query.offset || "0", 10);
    const filters: string[] = [];
    const params: unknown[] = [];
    if (request.query.status !== undefined) {
      params.push(parseInt(request.query.status, 10));
      filters.push(`t.status = $${params.length}`);
    }
    if (request.query.creator_tid !== undefined) {
      params.push(request.query.creator_tid);
      filters.push(`t.creator_tid = $${params.length}`);
    }
    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    params.push(limit, offset);
    // LEFT JOIN against the off-chain tasks envelope table on BLAKE3
    // hash so callers get title / description / reward_text resolved
    // in a single round trip.
    const result = await db.query(
      `SELECT t.pda, t.creator, t.creator_tid, t.task_id, t.status,
              t.reward_amount, t.claimer, t.claimer_tid,
              t.created_at, t.claimed_at, t.completed_at, t.updated_at,
              t.create_tx_signature, t.claim_tx_signature,
              t.complete_tx_signature, t.cancel_tx_signature,
              t.metadata_hash,
              tk_off.title       AS off_title,
              tk_off.description AS off_description,
              tk_off.reward_text AS off_reward_text
       FROM onchain_tasks t
       LEFT JOIN tasks tk_off ON tk_off.hash = t.metadata_hash
       ${where}
       ORDER BY t.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return { tasks: result.rows };
  });

  // Single on-chain task by PDA.
  server.get<{ Params: { pda: string } }>(
    "/v1/tasks/onchain/:pda",
    async (request, reply) => {
      const result = await db.query(
        `SELECT t.pda, t.creator, t.creator_tid, t.task_id, t.status,
                t.reward_amount, t.claimer, t.claimer_tid,
                t.created_at, t.claimed_at, t.completed_at, t.updated_at,
                t.create_tx_signature, t.claim_tx_signature,
                t.complete_tx_signature, t.cancel_tx_signature,
                t.metadata_hash,
                tk_off.title       AS off_title,
                tk_off.description AS off_description,
                tk_off.reward_text AS off_reward_text
         FROM onchain_tasks t
         LEFT JOIN tasks tk_off ON tk_off.hash = t.metadata_hash
         WHERE t.pda = $1`,
        [request.params.pda]
      );
      if (result.rows.length === 0) {
        return reply.status(404).send({ error: "Task not found" });
      }
      return result.rows[0];
    }
  );

  // All on-chain tasks created by a TID.
  server.get<{ Params: { tid: string } }>(
    "/v1/tasks/onchain/creator/:tid",
    async (request) => {
      const result = await db.query(
        `SELECT pda, creator, creator_tid, task_id, status,
                reward_amount, claimer, claimer_tid,
                created_at, claimed_at, completed_at, updated_at
         FROM onchain_tasks
         WHERE creator_tid = $1
         ORDER BY created_at DESC`,
        [request.params.tid]
      );
      return { tasks: result.rows };
    }
  );

  // All on-chain tasks claimed by a TID.
  server.get<{ Params: { tid: string } }>(
    "/v1/tasks/onchain/claimer/:tid",
    async (request) => {
      const result = await db.query(
        `SELECT pda, creator, creator_tid, task_id, status,
                reward_amount, claimer, claimer_tid,
                created_at, claimed_at, completed_at, updated_at
         FROM onchain_tasks
         WHERE claimer_tid = $1
         ORDER BY claimed_at DESC`,
        [request.params.tid]
      );
      return { tasks: result.rows };
    }
  );
}

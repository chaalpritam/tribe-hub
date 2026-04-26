import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";

export async function eventRoutes(server: FastifyInstance): Promise<void> {
  server.get<{
    Querystring: {
      limit?: string;
      offset?: string;
      channel_id?: string;
      upcoming?: string;
    };
  }>("/v1/events", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 100);
    const offset = parseInt(request.query.offset || "0", 10);
    const params: unknown[] = [];
    const where: string[] = [];
    if (request.query.channel_id) {
      params.push(request.query.channel_id);
      where.push(`channel_id = $${params.length}`);
    }
    if (request.query.upcoming === "true") {
      where.push(`starts_at >= NOW()`);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    params.push(limit, offset);
    const result = await db.query(
      `SELECT id, creator_tid, title, description, starts_at, ends_at,
              location_text, latitude, longitude, channel_id, image_url,
              created_at
       FROM events
       ${whereSql}
       ORDER BY starts_at ASC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return { events: result.rows };
  });

  server.get<{ Params: { id: string } }>(
    "/v1/events/:id",
    async (request, reply) => {
      const eventResult = await db.query(
        `SELECT id, creator_tid, title, description, starts_at, ends_at,
                location_text, latitude, longitude, channel_id, image_url,
                created_at
         FROM events WHERE id = $1`,
        [request.params.id]
      );
      if (eventResult.rows.length === 0) {
        return reply.status(404).send({ error: "Event not found" });
      }
      const tally = await db.query(
        `SELECT status, COUNT(*)::int AS count
         FROM event_rsvps WHERE event_id = $1
         GROUP BY status`,
        [request.params.id]
      );
      const counts: Record<string, number> = { yes: 0, no: 0, maybe: 0 };
      for (const row of tally.rows) counts[row.status] = row.count;
      return { ...eventResult.rows[0], rsvp_counts: counts };
    }
  );

  server.get<{ Params: { id: string; tid: string } }>(
    "/v1/events/:id/rsvp/:tid",
    async (request, reply) => {
      const result = await db.query(
        `SELECT status, rsvped_at FROM event_rsvps
         WHERE event_id = $1 AND tid = $2`,
        [request.params.id, request.params.tid]
      );
      if (result.rows.length === 0) {
        return reply.status(404).send({ error: "No RSVP" });
      }
      return result.rows[0];
    }
  );
}

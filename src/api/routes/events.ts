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

  // ── On-chain mirror: Event + Rsvp PDAs from event-registry ────────

  // List on-chain events. Filterable by creator_tid; sorted by
  // starts_at asc by default so callers see upcoming events first.
  // RSVP counts are joined inline so the home-feed list-render
  // doesn't need a per-row follow-up.
  server.get<{
    Querystring: {
      limit?: string;
      offset?: string;
      creator_tid?: string;
      /** "upcoming" (default) returns events with starts_at >= now */
      filter?: "all" | "upcoming";
      sort?: "starts_at_asc" | "created_at_desc";
    };
  }>("/v1/events/onchain", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 100);
    const offset = parseInt(request.query.offset || "0", 10);
    const filters: string[] = [];
    const params: unknown[] = [];
    if (request.query.creator_tid !== undefined) {
      params.push(request.query.creator_tid);
      filters.push(`e.creator_tid = $${params.length}`);
    }
    if ((request.query.filter ?? "upcoming") === "upcoming") {
      filters.push(`e.starts_at >= NOW()`);
    }
    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const orderBy =
      request.query.sort === "created_at_desc"
        ? "e.created_at DESC"
        : "e.starts_at ASC";
    params.push(limit, offset);
    // LEFT JOIN against the off-chain events table on the BLAKE3
    // hash so callers get title / description / location_text /
    // image_url resolved in a single round trip when the indexer
    // captured the metadata_hash. Falls back to NULL columns when
    // not yet available; clients render placeholder copy.
    const result = await db.query(
      `SELECT e.pda, e.creator, e.creator_tid, e.event_id, e.starts_at,
              e.created_at, e.create_tx_signature, e.metadata_hash,
              ev_off.title         AS off_title,
              ev_off.description   AS off_description,
              ev_off.location_text AS off_location_text,
              ev_off.image_url     AS off_image_url,
              t.username           AS creator_username,
              COUNT(*) FILTER (WHERE r.status = 1)::int AS yes_count,
              COUNT(*) FILTER (WHERE r.status = 2)::int AS no_count,
              COUNT(*) FILTER (WHERE r.status = 3)::int AS maybe_count
       FROM onchain_events e
       LEFT JOIN onchain_event_rsvps r ON r.event = e.pda
       LEFT JOIN events ev_off ON ev_off.hash = e.metadata_hash
       LEFT JOIN tids t ON t.tid = e.creator_tid
       ${where}
       GROUP BY e.pda, ev_off.title, ev_off.description,
                ev_off.location_text, ev_off.image_url, t.username
       ORDER BY ${orderBy}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return { events: result.rows };
  });

  // Single on-chain event with yes/no/maybe counts aggregated from
  // the rsvps table. Same metadata-hash join as the list endpoint.
  server.get<{ Params: { pda: string } }>(
    "/v1/events/onchain/:pda",
    async (request, reply) => {
      const eventResult = await db.query(
        `SELECT e.pda, e.creator, e.creator_tid, e.event_id, e.starts_at,
                e.created_at, e.create_tx_signature, e.metadata_hash,
                ev_off.title         AS off_title,
                ev_off.description   AS off_description,
                ev_off.location_text AS off_location_text,
                ev_off.image_url     AS off_image_url,
                t.username           AS creator_username
         FROM onchain_events e
         LEFT JOIN events ev_off ON ev_off.hash = e.metadata_hash
         LEFT JOIN tids t ON t.tid = e.creator_tid
         WHERE e.pda = $1`,
        [request.params.pda]
      );
      if (eventResult.rows.length === 0) {
        return reply.status(404).send({ error: "Event not found" });
      }
      const tallyResult = await db.query(
        `SELECT status, COUNT(*)::int AS count
         FROM onchain_event_rsvps
         WHERE event = $1
         GROUP BY status`,
        [request.params.pda]
      );
      const counts = { yes: 0, no: 0, maybe: 0 };
      for (const row of tallyResult.rows) {
        if (row.status === 1) counts.yes = row.count;
        else if (row.status === 2) counts.no = row.count;
        else if (row.status === 3) counts.maybe = row.count;
      }
      return { ...eventResult.rows[0], rsvp_counts: counts };
    }
  );

  // Events created by a TID, with RSVP counts inline.
  server.get<{ Params: { tid: string } }>(
    "/v1/events/onchain/creator/:tid",
    async (request) => {
      const result = await db.query(
        `SELECT e.pda, e.creator, e.creator_tid, e.event_id, e.starts_at,
                e.created_at,
                COUNT(*) FILTER (WHERE r.status = 1)::int AS yes_count,
                COUNT(*) FILTER (WHERE r.status = 2)::int AS no_count,
                COUNT(*) FILTER (WHERE r.status = 3)::int AS maybe_count
         FROM onchain_events e
         LEFT JOIN onchain_event_rsvps r ON r.event = e.pda
         WHERE e.creator_tid = $1
         GROUP BY e.pda
         ORDER BY e.starts_at DESC`,
        [request.params.tid]
      );
      return { events: result.rows };
    }
  );

  // Events a TID has RSVPed to.
  server.get<{ Params: { tid: string } }>(
    "/v1/events/onchain/attendee/:tid",
    async (request) => {
      const result = await db.query(
        `SELECT r.event, r.attendee, r.attendee_tid, r.status,
                r.tx_signature, r.responded_at, r.updated_at,
                e.creator_tid, e.event_id, e.starts_at
         FROM onchain_event_rsvps r
         LEFT JOIN onchain_events e ON e.pda = r.event
         WHERE r.attendee_tid = $1
         ORDER BY e.starts_at DESC NULLS LAST`,
        [request.params.tid]
      );
      return { rsvps: result.rows };
    }
  );

  // All RSVPs on a specific event.
  server.get<{ Params: { pda: string }; Querystring: { status?: string } }>(
    "/v1/events/onchain/:pda/rsvps",
    async (request) => {
      const params: unknown[] = [request.params.pda];
      let where = "event = $1";
      if (request.query.status !== undefined) {
        params.push(parseInt(request.query.status, 10));
        where += ` AND status = $${params.length}`;
      }
      const result = await db.query(
        `SELECT event, attendee, attendee_tid, status, tx_signature,
                responded_at, updated_at
         FROM onchain_event_rsvps
         WHERE ${where}
         ORDER BY responded_at DESC`,
        params
      );
      return { rsvps: result.rows };
    }
  );
}

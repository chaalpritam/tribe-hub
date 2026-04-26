import { FastifyInstance } from "fastify";
import { PublicKey } from "@solana/web3.js";
import { db } from "../../storage/db";
import { config } from "../../config";

/**
 * Mirror channel-registry's PDA derivation: ["channel", id_bytes].
 * Lets clients hit `/v1/channels/onchain/by-id/:id` with a slug
 * instead of having to derive the PDA themselves.
 */
function deriveChannelPda(id: string): string {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("channel"), Buffer.from(id)],
    new PublicKey(config.programIds.channelRegistry)
  );
  return pda.toBase58();
}

export async function channelRoutes(server: FastifyInstance): Promise<void> {
  // List all channels — registered + any channel_id seen in tweets.
  server.get<{
    Querystring: { limit?: string; offset?: string };
  }>("/v1/channels", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 100);
    const offset = parseInt(request.query.offset || "0", 10);
    const result = await db.query(
      `WITH activity AS (
         SELECT channel_id,
                COUNT(*)::int AS tweet_count,
                MAX(timestamp) AS last_tweet_at
         FROM messages
         WHERE channel_id IS NOT NULL AND type = 1
         GROUP BY channel_id
       )
       SELECT
         COALESCE(c.id, a.channel_id) AS id,
         c.name,
         c.description,
         c.kind,
         c.latitude,
         c.longitude,
         c.created_by,
         c.created_at,
         COALESCE(a.tweet_count, 0) AS tweet_count,
         a.last_tweet_at,
         (SELECT COUNT(*) FROM channel_memberships m
            WHERE m.channel_id = COALESCE(c.id, a.channel_id)
              AND m.left_at IS NULL) AS member_count
       FROM channels c
       FULL OUTER JOIN activity a ON c.id = a.channel_id
       ORDER BY a.last_tweet_at DESC NULLS LAST, c.created_at DESC NULLS LAST
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return { channels: result.rows };
  });

  // Get one channel by id.
  server.get<{ Params: { id: string } }>(
    "/v1/channels/:id",
    async (request, reply) => {
      const result = await db.query(
        `SELECT c.id, c.name, c.description, c.kind, c.latitude, c.longitude,
                c.created_by, c.created_at,
                (SELECT COUNT(*) FROM channel_memberships m
                   WHERE m.channel_id = c.id AND m.left_at IS NULL) AS member_count
         FROM channels c
         WHERE c.id = $1`,
        [request.params.id]
      );
      if (result.rows.length === 0) {
        return reply.status(404).send({ error: "Channel not found" });
      }
      return result.rows[0];
    }
  );

  // List members of a channel.
  server.get<{ Params: { id: string } }>(
    "/v1/channels/:id/members",
    async (request) => {
      const result = await db.query(
        `SELECT m.tid, m.joined_at,
                t.username, t.custody_address
         FROM channel_memberships m
         LEFT JOIN tids t ON t.tid = m.tid
         WHERE m.channel_id = $1 AND m.left_at IS NULL
         ORDER BY m.joined_at DESC`,
        [request.params.id]
      );
      return { members: result.rows };
    }
  );

  // List channels a TID has joined.
  server.get<{ Params: { tid: string } }>(
    "/v1/channels/member/:tid",
    async (request) => {
      const result = await db.query(
        `SELECT c.id, c.name, c.description, c.kind, c.latitude, c.longitude, m.joined_at
         FROM channel_memberships m
         JOIN channels c ON c.id = m.channel_id
         WHERE m.tid = $1 AND m.left_at IS NULL
         ORDER BY m.joined_at DESC`,
        [request.params.tid]
      );
      return { channels: result.rows };
    }
  );

  // ── On-chain mirror: ChannelRecord PDAs from channel-registry ─────

  // List on-chain channels (filterable by kind / owner_tid).
  server.get<{
    Querystring: {
      limit?: string;
      offset?: string;
      kind?: string;
      owner_tid?: string;
    };
  }>("/v1/channels/onchain", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 100);
    const offset = parseInt(request.query.offset || "0", 10);
    const filters: string[] = [];
    const params: unknown[] = [];
    if (request.query.kind !== undefined) {
      params.push(parseInt(request.query.kind, 10));
      filters.push(`kind = $${params.length}`);
    }
    if (request.query.owner_tid !== undefined) {
      params.push(request.query.owner_tid);
      filters.push(`owner_tid = $${params.length}`);
    }
    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    params.push(limit, offset);
    const result = await db.query(
      `SELECT pda, owner, owner_tid, kind, registered_at, updated_at,
              register_tx_signature, last_transfer_tx
       FROM onchain_channels
       ${where}
       ORDER BY registered_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return { channels: result.rows };
  });

  // Single on-chain channel by PDA.
  server.get<{ Params: { pda: string } }>(
    "/v1/channels/onchain/:pda",
    async (request, reply) => {
      const result = await db.query(
        `SELECT pda, owner, owner_tid, kind, registered_at, updated_at,
                register_tx_signature, last_transfer_tx
         FROM onchain_channels
         WHERE pda = $1`,
        [request.params.pda]
      );
      if (result.rows.length === 0) {
        return reply.status(404).send({ error: "Channel not found" });
      }
      return result.rows[0];
    }
  );

  // Look up by slug — derives the PDA server-side and returns the row.
  // Joined with the off-chain `channels` row for rich metadata
  // (name, description, lat/lon) when one exists.
  server.get<{ Params: { id: string } }>(
    "/v1/channels/onchain/by-id/:id",
    async (request, reply) => {
      const id = request.params.id;
      let pda: string;
      try {
        pda = deriveChannelPda(id);
      } catch {
        return reply.status(400).send({ error: "Invalid channel id" });
      }
      const result = await db.query(
        `SELECT oc.pda, oc.owner, oc.owner_tid, oc.kind,
                oc.registered_at, oc.updated_at,
                oc.register_tx_signature, oc.last_transfer_tx,
                c.name, c.description, c.latitude, c.longitude
         FROM onchain_channels oc
         LEFT JOIN channels c ON c.id = $2
         WHERE oc.pda = $1`,
        [pda, id]
      );
      if (result.rows.length === 0) {
        return reply.status(404).send({ error: "Channel not registered on chain", pda });
      }
      return { id, ...result.rows[0] };
    }
  );

  // All on-chain channels owned by a TID.
  server.get<{ Params: { tid: string } }>(
    "/v1/channels/onchain/owner/:tid",
    async (request) => {
      const result = await db.query(
        `SELECT pda, owner, owner_tid, kind, registered_at, updated_at
         FROM onchain_channels
         WHERE owner_tid = $1
         ORDER BY registered_at DESC`,
        [request.params.tid]
      );
      return { channels: result.rows };
    }
  );
}

import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";
import { getPeers, getPeerCount } from "../../gossip/protocol";
import { connectToPeer } from "../../gossip/peer-manager";
import { config } from "../../config";

export async function peerRoutes(server: FastifyInstance): Promise<void> {
  // List known peers
  server.get("/v1/peers", async () => {
    const result = await db.query(
      `SELECT hub_id, url, last_seen, message_count FROM peers ORDER BY last_seen DESC`
    );

    // Also include currently connected peers
    const connectedIds = new Set<string>();
    for (const [hubId] of getPeers()) {
      connectedIds.add(hubId);
    }

    const peers = result.rows.map((row: { hub_id: string; url: string; last_seen: Date; message_count: number }) => ({
      ...row,
      connected: connectedIds.has(row.hub_id),
    }));

    return {
      hubId: config.hubId,
      connectedCount: getPeerCount(),
      peers,
    };
  });

  // Manually add a peer
  server.post<{
    Body: { url: string };
  }>("/v1/peers", async (request, reply) => {
    const { url } = request.body || {};
    if (!url) {
      return reply.status(400).send({ error: "url is required" });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return reply.status(400).send({ error: "Invalid URL format" });
    }

    connectToPeer(url);
    return { ok: true, message: `Connecting to ${url}` };
  });

  // Sync status with each peer
  server.get("/v1/sync/status", async () => {
    const result = await db.query(
      `SELECT ss.peer_hub_id, ss.last_sync_hash, ss.last_sync_at,
              p.url, p.message_count
       FROM sync_state ss
       LEFT JOIN peers p ON p.hub_id = ss.peer_hub_id
       ORDER BY ss.last_sync_at DESC`
    );
    return {
      hubId: config.hubId,
      syncStates: result.rows,
    };
  });
}

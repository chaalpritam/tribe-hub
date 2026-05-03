import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";
import {
  getPeers,
  getPeerCount,
  broadcastHaveSince,
} from "../../gossip/protocol";
import { getOwnTotals } from "../../gossip/sync";
import { connectToPeer } from "../../gossip/peer-manager";
import { config } from "../../config";

/**
 * Derive an HTTP /health URL from a gossip WebSocket URL. Mesh peers
 * register as e.g. `ws://192.168.1.11:4000/gossip`; we want
 * `http://192.168.1.11:4000/health` so the sync-status report can pull
 * the peer's total message count for coverage maths.
 */
function healthUrlFor(peerWsUrl: string): string | null {
  try {
    const u = new URL(peerWsUrl);
    u.protocol = u.protocol === "wss:" ? "https:" : "http:";
    u.pathname = "/health";
    u.search = "";
    u.hash = "";
    return u.toString();
  } catch {
    return null;
  }
}

async function fetchPeerTotals(
  url: string
): Promise<{ messages: number; tids: number } | null> {
  const healthUrl = healthUrlFor(url);
  if (!healthUrl) return null;
  try {
    const res = await fetch(healthUrl, {
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { messages?: number; tids?: number };
    return {
      messages: typeof body.messages === "number" ? body.messages : 0,
      tids: typeof body.tids === "number" ? body.tids : 0,
    };
  } catch {
    return null;
  }
}

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
  }>("/v1/peers", {
    config: {
      rateLimit: {
        max: config.rateLimitPeersMax,
        timeWindow: config.rateLimitWindowMs,
      },
    },
  }, async (request, reply) => {
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
    // Union peers we know about with peers we've actually sync'd with —
    // a freshly-added peer may not yet have a sync_state row, but we
    // still want it in the table so the user can see "0% — never
    // synced" instead of a missing entry.
    const result = await db.query(
      `SELECT p.hub_id AS peer_hub_id,
              p.url,
              p.message_count,
              ss.last_sync_hash,
              ss.last_sync_at
         FROM peers p
         LEFT JOIN sync_state ss ON ss.peer_hub_id = p.hub_id
         UNION
         SELECT ss.peer_hub_id,
                p.url,
                p.message_count,
                ss.last_sync_hash,
                ss.last_sync_at
           FROM sync_state ss
           LEFT JOIN peers p ON p.hub_id = ss.peer_hub_id
        ORDER BY 5 DESC NULLS LAST`
    );

    const ownTotals = await getOwnTotals();
    const ownTotal = ownTotals.messages + ownTotals.dms;
    const connectedIds = new Set<string>();
    for (const [hubId] of getPeers()) connectedIds.add(hubId);

    // Probe peers in parallel so a slow peer doesn't serialize the
    // whole status response.
    const enriched = await Promise.all(
      result.rows.map(async (row: {
        peer_hub_id: string;
        url: string | null;
        message_count: number | null;
        last_sync_hash: string | null;
        last_sync_at: Date | null;
      }) => {
        const peerTotals = row.url ? await fetchPeerTotals(row.url) : null;
        const peerTotal = peerTotals?.messages ?? null;
        // Coverage = our store / peer's store, capped at 100%. If we
        // can't reach the peer's /health we surface null so the CLI
        // can render a "?" rather than a misleading 0%.
        const coverage =
          peerTotal && peerTotal > 0
            ? Math.min(100, Math.round((ownTotal / peerTotal) * 100))
            : null;
        return {
          peerHubId: row.peer_hub_id,
          url: row.url,
          connected: connectedIds.has(row.peer_hub_id),
          messageCount: row.message_count ?? 0,
          lastSyncHash: row.last_sync_hash,
          lastSyncAt: row.last_sync_at,
          peerTotal,
          coverage,
        };
      })
    );

    return {
      hubId: config.hubId,
      ownTotal,
      ownMessages: ownTotals.messages,
      ownDms: ownTotals.dms,
      syncStates: enriched,
    };
  });

  // Hard-sync trigger. Posts a wider "have" frame to one peer (or all
  // connected peers) so a freshly-added hub doesn't have to wait for
  // organic gossip to catch up. `peer` is a hub-id; "all" or omitted
  // means broadcast to every connected peer. `sinceMs` is how far back
  // to cover (default 30 days).
  server.post<{
    Body: { peer?: string; sinceMs?: number };
  }>("/v1/sync/trigger", {
    config: {
      rateLimit: {
        max: config.rateLimitPeersMax,
        timeWindow: config.rateLimitWindowMs,
      },
    },
  }, async (request, reply) => {
    const { peer, sinceMs } = request.body || {};
    const windowMs =
      typeof sinceMs === "number" && sinceMs > 0 && sinceMs < 365 * 24 * 60 * 60 * 1000
        ? sinceMs
        : 30 * 24 * 60 * 60 * 1000;
    const since = new Date(Date.now() - windowMs);

    const targetPeer = peer && peer !== "all" ? peer : null;
    if (targetPeer) {
      const peers = getPeers();
      if (!peers.has(targetPeer)) {
        return reply.status(404).send({
          error: `Peer ${targetPeer} is not currently connected. Run "tribe peers" to see connected hubs.`,
        });
      }
    }

    const sentTo = await broadcastHaveSince(targetPeer, since);
    return {
      ok: true,
      hubId: config.hubId,
      target: targetPeer ?? "all",
      since: since.toISOString(),
      sentTo,
    };
  });
}

import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";
import { config } from "../../config";
import { getPeerCount } from "../../gossip/protocol";

/**
 * GET /v1/stats — operator-facing snapshot of the hub's content + storage
 * + connectivity. Designed for `tribe stats` (the CLI), local dashboards,
 * and ops pings; the deeper Prometheus counters live at /metrics.
 *
 * Counts are best-effort — if a table doesn't exist (e.g. on a hub that
 * skipped a migration), it's reported as null rather than failing the
 * whole response. Recent activity windows give operators a "is this
 * thing alive?" signal without having to scrape time series.
 */
export async function statsRoutes(server: FastifyInstance): Promise<void> {
  server.get("/v1/stats", async () => {
    const counts = await collectCounts();
    const dbSize = await getDbSize();
    const recent = await collectRecentActivity();

    return {
      hubId: config.hubId,
      uptimeSeconds: Math.floor(process.uptime()),
      peers: getPeerCount(),
      counts,
      recent,
      storage: {
        databaseBytes: dbSize.bytes,
        databasePretty: dbSize.pretty,
      },
      timestamp: new Date().toISOString(),
    };
  });
}

const COUNT_TABLES = [
  "messages",
  "tids",
  "channels",
  "dm_messages",
  "user_data",
  "polls",
  "poll_votes",
  "events",
  "event_rsvps",
  "tasks",
  "crowdfunds",
  "crowdfund_pledges",
  "tips",
  "bookmarks",
  "social_graph",
  "signed_envelopes",
] as const;

async function collectCounts(): Promise<Record<string, number | null>> {
  const out: Record<string, number | null> = {};
  // Run counts in parallel — slowest single COUNT(*) caps the total.
  await Promise.all(
    COUNT_TABLES.map(async (table) => {
      try {
        const r = await db.query<{ count: string }>(
          `SELECT COUNT(*)::text AS count FROM ${table}`,
        );
        out[table] = parseInt(r.rows[0]?.count ?? "0", 10);
      } catch {
        // Table missing (skipped migration) or other transient — null
        // signals "couldn't read this row" without breaking the rest.
        out[table] = null;
      }
    }),
  );
  return out;
}

async function getDbSize(): Promise<{ bytes: number; pretty: string }> {
  try {
    const r = await db.query<{ bytes: string; pretty: string }>(`
      SELECT
        pg_database_size(current_database())::text AS bytes,
        pg_size_pretty(pg_database_size(current_database())) AS pretty
    `);
    const row = r.rows[0];
    return {
      bytes: parseInt(row?.bytes ?? "0", 10),
      pretty: row?.pretty ?? "0 bytes",
    };
  } catch {
    return { bytes: 0, pretty: "unknown" };
  }
}

async function collectRecentActivity(): Promise<{
  messagesLastHour: number;
  messagesLast24h: number;
  dmsLastHour: number;
  dmsLast24h: number;
}> {
  // Single query covering both windows — way cheaper than four COUNT(*)
  // subqueries against the messages + dm_messages tables.
  const out = {
    messagesLastHour: 0,
    messagesLast24h: 0,
    dmsLastHour: 0,
    dmsLast24h: 0,
  };
  try {
    const r = await db.query<{
      messages_h: string;
      messages_d: string;
      dms_h: string;
      dms_d: string;
    }>(`
      SELECT
        (SELECT COUNT(*) FROM messages WHERE created_at > NOW() - INTERVAL '1 hour')::text AS messages_h,
        (SELECT COUNT(*) FROM messages WHERE created_at > NOW() - INTERVAL '24 hours')::text AS messages_d,
        (SELECT COUNT(*) FROM dm_messages WHERE created_at > NOW() - INTERVAL '1 hour')::text AS dms_h,
        (SELECT COUNT(*) FROM dm_messages WHERE created_at > NOW() - INTERVAL '24 hours')::text AS dms_d
    `);
    const row = r.rows[0];
    if (row) {
      out.messagesLastHour = parseInt(row.messages_h, 10);
      out.messagesLast24h = parseInt(row.messages_d, 10);
      out.dmsLastHour = parseInt(row.dms_h, 10);
      out.dmsLast24h = parseInt(row.dms_d, 10);
    }
  } catch {
    // Fall through with zeros if either table is missing.
  }
  return out;
}

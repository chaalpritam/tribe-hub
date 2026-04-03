import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";
import { getPeerCount } from "../../gossip/protocol";
import { config } from "../../config";

export async function healthRoutes(server: FastifyInstance): Promise<void> {
  server.get("/health", async () => {
    let dbOk = false;
    let messageCount = 0;
    let tidCount = 0;

    try {
      const msgResult = await db.query(`SELECT COUNT(*)::int as count FROM messages`);
      messageCount = msgResult.rows[0]?.count ?? 0;

      const tidResult = await db.query(`SELECT COUNT(*)::int as count FROM tids`);
      tidCount = tidResult.rows[0]?.count ?? 0;

      dbOk = true;
    } catch {
      // DB is down
    }

    return {
      status: dbOk ? "ok" : "degraded",
      hubId: config.hubId,
      uptime: process.uptime(),
      database: dbOk ? "connected" : "disconnected",
      messages: messageCount,
      tids: tidCount,
      peers: getPeerCount(),
      timestamp: new Date().toISOString(),
    };
  });
}

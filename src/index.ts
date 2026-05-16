import { config, validateConfig } from "./config";
import { db, runMigrations } from "./storage/db";
import { startSolanaListener } from "./solana/listener";
import { startPeerManager } from "./gossip/peer-manager";
import { startStoriesCleanup } from "./storage/stories-cleanup";
import { startReelsCacheRefresh } from "./storage/reels-cache";
import { buildServer } from "./server";
import { getPeerCount } from "./gossip/protocol";
import { bindRuntimeMetrics } from "./metrics";
import { appKeyCache } from "./validation/app-key-cache";

async function main() {
  const { errors, warnings } = validateConfig();
  for (const w of warnings) console.warn(`[config] WARNING: ${w}`);
  if (errors.length > 0) {
    for (const e of errors) console.error(`[config] ERROR: ${e}`);
    process.exit(1);
  }

  console.log(`Starting Tribe Hub [${config.hubId}] (${config.nodeEnv})...`);

  bindRuntimeMetrics({
    dbPool: db,
    appKeyCacheSize: () => ({
      positive: appKeyCache.size(),
      negative: appKeyCache.negativeSize(),
    }),
  });

  // 1. Run database migrations
  await runMigrations();

  // 2. Start Solana event listener
  startSolanaListener();

  // 3. Start gossip peer manager (connect to seed peers)
  startPeerManager();

  // 3b. Hourly purge of expired stories (24h TTL stamped at insert).
  startStoriesCleanup();

  // 3c. 5-minute refresh of the engagement-ranked reels cache.
  startReelsCacheRefresh();

  // 4. Start HTTP API + gossip WebSocket server
  const server = await buildServer();
  await server.listen({ port: config.port, host: "0.0.0.0" });

  server.log.info(
    {
      hubId: config.hubId,
      port: config.port,
      gossipUrl: `ws://0.0.0.0:${config.port}/gossip`,
      clientUrl: `ws://0.0.0.0:${config.port}/v1/ws`,
      seedPeers: config.peers.length,
      connectedPeers: getPeerCount(),
      corsOrigins: config.corsOrigins.length === 0 ? "*" : config.corsOrigins,
    },
    "Tribe Hub ready"
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

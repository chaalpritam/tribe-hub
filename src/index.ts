import { config } from "./config";
import { runMigrations } from "./storage/db";
import { startSolanaListener } from "./solana/listener";
import { startPeerManager } from "./gossip/peer-manager";
import { buildServer } from "./server";
import { getPeerCount } from "./gossip/protocol";

async function main() {
  console.log(`Starting Tribe Hub [${config.hubId}]...`);

  // 1. Run database migrations
  await runMigrations();

  // 2. Start Solana event listener
  startSolanaListener();

  // 3. Start gossip peer manager (connect to seed peers)
  startPeerManager();

  // 4. Start HTTP API + gossip WebSocket server
  const server = await buildServer();
  await server.listen({ port: config.port, host: "0.0.0.0" });

  console.log(`Tribe Hub [${config.hubId}] running on port ${config.port}`);
  console.log(`Gossip WebSocket: ws://0.0.0.0:${config.port}/gossip`);
  console.log(`Client WebSocket: ws://0.0.0.0:${config.port}/v1/ws`);
  console.log(`Seed peers: ${config.peers.length}`);
  console.log(`Connected peers: ${getPeerCount()}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

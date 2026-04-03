import "dotenv/config";

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  hubId: process.env.HUB_ID || `hub-${Math.random().toString(36).slice(2, 8)}`,
  solanaRpcUrl: process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
  solanaWsUrl: process.env.SOLANA_WS_URL || "wss://api.devnet.solana.com",
  databaseUrl: process.env.DATABASE_URL || "postgresql://tribe:tribe@localhost:5436/tribe_hub",
  // Peer hubs to connect to (comma-separated WebSocket URLs)
  peers: (process.env.PEERS || "").split(",").filter(Boolean),
  // Gossip settings
  gossipIntervalMs: parseInt(process.env.GOSSIP_INTERVAL_MS || "5000", 10),
  maxSyncBatchSize: parseInt(process.env.MAX_SYNC_BATCH_SIZE || "100", 10),
  // Program IDs
  programIds: {
    tidRegistry: process.env.TID_REGISTRY_PROGRAM_ID || "4BSmJmRGQWKgioP9DG2bUuRS9U3V6soRauU7Nv6yGvHD",
    appKeyRegistry: process.env.APP_KEY_REGISTRY_PROGRAM_ID || "5LtbFUeAoXWRovGpyWnRJhiCS62XsTYKVErT9kPpv4hN",
    socialGraph: process.env.SOCIAL_GRAPH_PROGRAM_ID || "8kKnWvbmTjWq5uPePk79RRbQMAXCszNFzHdRwUS4N74w",
  },
};

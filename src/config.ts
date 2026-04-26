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
  reconnectDelayMs: parseInt(process.env.RECONNECT_DELAY_MS || "10000", 10),
  pingIntervalMs: parseInt(process.env.PING_INTERVAL_MS || "30000", 10),
  // Media storage
  mediaDir: process.env.MEDIA_DIR || "./data/media",
  // Validation settings
  maxTweetTextLength: parseInt(process.env.MAX_TWEET_TEXT_LENGTH || "320", 10),
  appKeyCacheTtlMs: parseInt(process.env.APP_KEY_CACHE_TTL_MS || "60000", 10),
  // Program IDs
  programIds: {
    tidRegistry: process.env.TID_REGISTRY_PROGRAM_ID || "4BSmJmRGQWKgioP9DG2bUuRS9U3V6soRauU7Nv6yGvHD",
    appKeyRegistry: process.env.APP_KEY_REGISTRY_PROGRAM_ID || "5LtbFUeAoXWRovGpyWnRJhiCS62XsTYKVErT9kPpv4hN",
    socialGraph: process.env.SOCIAL_GRAPH_PROGRAM_ID || "8kKnWvbmTjWq5uPePk79RRbQMAXCszNFzHdRwUS4N74w",
    tipRegistry: process.env.TIP_REGISTRY_PROGRAM_ID || "TipReg1111111111111111111111111111111111111",
    crowdfundRegistry: process.env.CROWDFUND_REGISTRY_PROGRAM_ID || "CrowdF11111111111111111111111111111111111111",
    taskRegistry: process.env.TASK_REGISTRY_PROGRAM_ID || "TaskReg111111111111111111111111111111111111",
    channelRegistry: process.env.CHANNEL_REGISTRY_PROGRAM_ID || "ChanReg111111111111111111111111111111111111",
  },
};

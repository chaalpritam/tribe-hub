import "dotenv/config";

const NODE_ENV = process.env.NODE_ENV || "development";

export const config = {
  nodeEnv: NODE_ENV,
  isProduction: NODE_ENV === "production",
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
  // HTTP server hardening
  // Comma-separated list of allowed CORS origins. Empty string or "*" allows all
  // (only recommended for development). Production deployments should set an
  // explicit allowlist, e.g. CORS_ORIGINS=https://tribeapp.wtf,https://app.tribe.so
  corsOrigins: (process.env.CORS_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean),
  // Max JSON body size in bytes (default 1 MiB). Tweets are short; large bodies
  // mostly indicate abuse. Uploads use a separate multipart pipeline.
  bodyLimitBytes: parseInt(process.env.BODY_LIMIT_BYTES || String(1024 * 1024), 10),
  // Rate limit window applies to each client IP per route. Global cap is a
  // safety net; write routes apply tighter caps via their own route options.
  rateLimitGlobalMax: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || "300", 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
  rateLimitSubmitMax: parseInt(process.env.RATE_LIMIT_SUBMIT_MAX || "30", 10),
  rateLimitUploadMax: parseInt(process.env.RATE_LIMIT_UPLOAD_MAX || "10", 10),
  rateLimitPeersMax: parseInt(process.env.RATE_LIMIT_PEERS_MAX || "5", 10),
  // Replay-window for signed messages. Anything signed more than
  // MESSAGE_MAX_AGE_MS in the past or MESSAGE_MAX_FUTURE_SKEW_MS in the
  // future is rejected. Defaults: 7 days / 5 minutes.
  messageMaxAgeMs: parseInt(process.env.MESSAGE_MAX_AGE_MS || String(7 * 24 * 60 * 60 * 1000), 10),
  messageMaxFutureSkewMs: parseInt(process.env.MESSAGE_MAX_FUTURE_SKEW_MS || String(5 * 60 * 1000), 10),
  // Gossip socket abuse controls
  gossipMaxFrameBytes: parseInt(process.env.GOSSIP_MAX_FRAME_BYTES || String(1024 * 1024), 10),
  gossipFramesPerSecPerPeer: parseInt(process.env.GOSSIP_FRAMES_PER_SEC_PER_PEER || "100", 10),
  gossipFrameBurst: parseInt(process.env.GOSSIP_FRAME_BURST || "200", 10),
  // Negative cache for unknown app keys (defends RPC budget when bogus
  // signers flood the hub). 0 disables negative caching.
  appKeyNegativeCacheTtlMs: parseInt(process.env.APP_KEY_NEGATIVE_CACHE_TTL_MS || "30000", 10),
  // When true, /v1/submit and /v1/dm/* + the gossip ingest path reject
  // any envelope without dataB64. Default false during the rollout —
  // flip once `tribe_hub_validation_databytes_status_total{status=absent}`
  // trends to ~0 in production.
  requireDataB64: (process.env.REQUIRE_DATA_B64 || "false").toLowerCase() === "true",
  // Solana log backfill on startup: fetches signatures newer than the
  // saved cursor and replays them through the same handlers as the
  // live subscription. Existing PK constraints in the mirror tables
  // make overlap with live events harmless. 0 disables backfill.
  solanaBackfillLimit: parseInt(process.env.SOLANA_BACKFILL_LIMIT || "1000", 10),
  solanaBackfillBatchSize: parseInt(process.env.SOLANA_BACKFILL_BATCH_SIZE || "100", 10),
  // Program IDs
  programIds: {
    tidRegistry: process.env.TID_REGISTRY_PROGRAM_ID || "4BSmJmRGQWKgioP9DG2bUuRS9U3V6soRauU7Nv6yGvHD",
    appKeyRegistry: process.env.APP_KEY_REGISTRY_PROGRAM_ID || "5LtbFUeAoXWRovGpyWnRJhiCS62XsTYKVErT9kPpv4hN",
    usernameRegistry: process.env.USERNAME_REGISTRY_PROGRAM_ID || "65oKjSjcGYR61ASzDYczbodz6H8TARtJyQGvb5V9y9W1",
    socialGraph: process.env.SOCIAL_GRAPH_PROGRAM_ID || "8kKnWvbmTjWq5uPePk79RRbQMAXCszNFzHdRwUS4N74w",
    tipRegistry: process.env.TIP_REGISTRY_PROGRAM_ID || "TipReg1111111111111111111111111111111111111",
    crowdfundRegistry: process.env.CROWDFUND_REGISTRY_PROGRAM_ID || "CrowdF11111111111111111111111111111111111111",
    taskRegistry: process.env.TASK_REGISTRY_PROGRAM_ID || "TaskReg111111111111111111111111111111111111",
    channelRegistry: process.env.CHANNEL_REGISTRY_PROGRAM_ID || "ChanReg111111111111111111111111111111111111",
    karmaRegistry: process.env.KARMA_REGISTRY_PROGRAM_ID || "KarmaReg11111111111111111111111111111111111",
    pollRegistry: process.env.POLL_REGISTRY_PROGRAM_ID || "HPd8FqxVfoeBxwBr7wuKDeahgGX1V9UewxEWzjZY2SAm",
    eventRegistry: process.env.EVENT_REGISTRY_PROGRAM_ID || "D2Gt2qkNAa8gZAmvqt3PWH39ydBL1cpwuXqeogkCoPRk",
  },
};

export interface ConfigDiagnostics {
  errors: string[];
  warnings: string[];
}

export function validateConfig(): ConfigDiagnostics {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!process.env.DATABASE_URL && config.isProduction) {
    errors.push("DATABASE_URL must be set in production (refusing to use the local default)");
  }
  if (config.isProduction && config.corsOrigins.length === 0) {
    errors.push("CORS_ORIGINS must list at least one origin in production (set to '*' to opt out explicitly)");
  }
  if (config.solanaBackfillLimit === 0) {
    warnings.push("SOLANA_BACKFILL_LIMIT=0 disables on-chain event backfill — recent on-chain state may be missing until a live event arrives");
  }
  for (const [key, val] of [
    ["PORT", config.port],
    ["GOSSIP_INTERVAL_MS", config.gossipIntervalMs],
    ["MAX_SYNC_BATCH_SIZE", config.maxSyncBatchSize],
    ["BODY_LIMIT_BYTES", config.bodyLimitBytes],
    ["RATE_LIMIT_WINDOW_MS", config.rateLimitWindowMs],
    ["RATE_LIMIT_GLOBAL_MAX", config.rateLimitGlobalMax],
    ["MESSAGE_MAX_AGE_MS", config.messageMaxAgeMs],
    ["MESSAGE_MAX_FUTURE_SKEW_MS", config.messageMaxFutureSkewMs],
    ["GOSSIP_MAX_FRAME_BYTES", config.gossipMaxFrameBytes],
    ["GOSSIP_FRAMES_PER_SEC_PER_PEER", config.gossipFramesPerSecPerPeer],
    ["GOSSIP_FRAME_BURST", config.gossipFrameBurst],
  ] as const) {
    if (!Number.isFinite(val) || val <= 0) {
      errors.push(`${key} must be a positive integer (got ${val})`);
    }
  }

  return { errors, warnings };
}

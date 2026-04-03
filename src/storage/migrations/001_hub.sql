-- Messages (tweets/reactions from all users across the network)
CREATE TABLE IF NOT EXISTS messages (
  hash        TEXT PRIMARY KEY,
  tid         BIGINT NOT NULL,
  type        INT NOT NULL,
  text        TEXT,
  parent_hash TEXT,
  channel_id  TEXT,
  mentions    BIGINT[] DEFAULT '{}',
  embeds      TEXT[] DEFAULT '{}',
  timestamp   TIMESTAMPTZ NOT NULL,
  signature   TEXT NOT NULL,
  signer      TEXT NOT NULL,
  received_from TEXT,  -- hub_id that sent us this message
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- TIDs (from Solana events)
CREATE TABLE IF NOT EXISTS tids (
  tid               BIGINT PRIMARY KEY,
  custody_address   TEXT NOT NULL,
  recovery_address  TEXT NOT NULL,
  registered_at     TIMESTAMPTZ,
  username          TEXT,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Social graph (from Solana events)
CREATE TABLE IF NOT EXISTS social_graph (
  follower_tid  BIGINT,
  following_tid BIGINT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ,
  PRIMARY KEY (follower_tid, following_tid)
);

-- Peers (known hub peers)
CREATE TABLE IF NOT EXISTS peers (
  hub_id      TEXT PRIMARY KEY,
  url         TEXT NOT NULL,
  last_seen   TIMESTAMPTZ DEFAULT NOW(),
  message_count BIGINT DEFAULT 0
);

-- Sync state (track what we've synced with each peer)
CREATE TABLE IF NOT EXISTS sync_state (
  peer_hub_id     TEXT PRIMARY KEY,
  last_sync_hash  TEXT,
  last_sync_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_tid ON messages (tid, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages (channel_id, timestamp DESC) WHERE channel_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_parent ON messages (parent_hash) WHERE parent_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tids_custody ON tids (custody_address);
CREATE INDEX IF NOT EXISTS idx_tids_username ON tids (username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_social_follower ON social_graph (follower_tid) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_social_following ON social_graph (following_tid) WHERE deleted_at IS NULL;

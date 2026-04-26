-- On-chain ChannelRecord mirror, populated by the channel-registry
-- log listener. One row per channel PDA — channel-registry's events
-- carry only (pda, owner, owner_tid, kind), so this table is the
-- ownership anchor; rich channel metadata (slug, name, description,
-- lat/lon) lives in the off-chain `channels` table populated from
-- CHANNEL_ADD envelopes. Clients that have the slug can derive the
-- PDA locally with seeds = ["channel", id_bytes] and join.
CREATE TABLE IF NOT EXISTS onchain_channels (
  pda                    TEXT PRIMARY KEY,
  owner                  TEXT NOT NULL,
  owner_tid              BIGINT NOT NULL,
  -- Mirrors the on-chain ChannelKind enum: 1 = General (reserved,
  -- never written here), 2 = City, 3 = Interest.
  kind                   SMALLINT NOT NULL,
  registered_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  register_tx_signature  TEXT NOT NULL,
  last_transfer_tx       TEXT
);

CREATE INDEX IF NOT EXISTS idx_onchain_channels_owner
  ON onchain_channels (owner_tid, registered_at DESC);
CREATE INDEX IF NOT EXISTS idx_onchain_channels_kind
  ON onchain_channels (kind);

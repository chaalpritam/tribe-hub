-- Channels (a.k.a. tribes / topics). Created via CHANNEL_ADD (type=9).
CREATE TABLE IF NOT EXISTS channels (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  created_by    BIGINT NOT NULL,
  hash          TEXT NOT NULL,
  signature     TEXT NOT NULL,
  signer        TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Membership rows. join sets joined_at, leave sets left_at.
-- A TID can re-join after leaving, so we keep a unique key on
-- (channel_id, tid) but allow updates.
CREATE TABLE IF NOT EXISTS channel_memberships (
  channel_id    TEXT NOT NULL,
  tid           BIGINT NOT NULL,
  joined_at     TIMESTAMPTZ NOT NULL,
  left_at       TIMESTAMPTZ,
  PRIMARY KEY (channel_id, tid)
);

CREATE INDEX IF NOT EXISTS idx_channel_memberships_tid
  ON channel_memberships (tid) WHERE left_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_channel_memberships_channel
  ON channel_memberships (channel_id) WHERE left_at IS NULL;

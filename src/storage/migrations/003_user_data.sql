-- Profile fields published as USER_DATA_ADD (type=7) envelopes.
-- Latest value per (tid, field) wins.
CREATE TABLE IF NOT EXISTS user_data (
  hash       TEXT PRIMARY KEY,
  tid        BIGINT NOT NULL,
  field      TEXT NOT NULL,
  value      TEXT NOT NULL,
  timestamp  TIMESTAMPTZ NOT NULL,
  signature  TEXT NOT NULL,
  signer     TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_data_tid_field
  ON user_data (tid, field, timestamp DESC);

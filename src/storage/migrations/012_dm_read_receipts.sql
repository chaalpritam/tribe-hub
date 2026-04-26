-- DM read receipts (DM_READ = 28).
-- conversation_id matches the existing 1:1 form "min:max" or the
-- prefix "group:<id>" for group conversations.
CREATE TABLE IF NOT EXISTS dm_read_receipts (
  tid              BIGINT NOT NULL,
  conversation_id  TEXT NOT NULL,
  last_read_hash   TEXT NOT NULL,
  last_read_at     TIMESTAMPTZ NOT NULL,
  signature        TEXT NOT NULL,
  signer           TEXT NOT NULL,
  PRIMARY KEY (tid, conversation_id)
);

CREATE INDEX IF NOT EXISTS idx_dm_read_conversation
  ON dm_read_receipts (conversation_id, last_read_at DESC);

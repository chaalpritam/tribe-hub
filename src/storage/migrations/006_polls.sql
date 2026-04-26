-- Polls (POLL_ADD = 16, POLL_VOTE = 17).
CREATE TABLE IF NOT EXISTS polls (
  id          TEXT PRIMARY KEY,
  creator_tid BIGINT NOT NULL,
  question    TEXT NOT NULL,
  options     TEXT[] NOT NULL,
  expires_at  TIMESTAMPTZ,
  channel_id  TEXT,
  hash        TEXT NOT NULL,
  signature   TEXT NOT NULL,
  signer      TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- One vote per (poll, voter). Re-voting overwrites the previous choice.
CREATE TABLE IF NOT EXISTS poll_votes (
  poll_id      TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  voter_tid    BIGINT NOT NULL,
  option_index INT NOT NULL,
  hash         TEXT NOT NULL,
  signature    TEXT NOT NULL,
  signer       TEXT NOT NULL,
  voted_at     TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (poll_id, voter_tid)
);

CREATE INDEX IF NOT EXISTS idx_polls_creator ON polls (creator_tid, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_polls_channel
  ON polls (channel_id, created_at DESC) WHERE channel_id IS NOT NULL;

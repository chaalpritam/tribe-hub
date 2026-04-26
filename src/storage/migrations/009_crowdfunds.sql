-- Crowdfunds (CROWDFUND_ADD = 23, CROWDFUND_PLEDGE = 24).
-- v1 stores intent only — actual SPL transfers happen out-of-band.
CREATE TABLE IF NOT EXISTS crowdfunds (
  id            TEXT PRIMARY KEY,
  creator_tid   BIGINT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  goal_amount   NUMERIC(20, 4) NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'USD',
  deadline_at   TIMESTAMPTZ,
  image_url     TEXT,
  channel_id    TEXT,
  hash          TEXT NOT NULL,
  signature     TEXT NOT NULL,
  signer        TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Pledge envelopes are append-only — a pledger can pledge multiple
-- times. (hash) is the unique key since each envelope is unique.
CREATE TABLE IF NOT EXISTS crowdfund_pledges (
  hash          TEXT PRIMARY KEY,
  crowdfund_id  TEXT NOT NULL REFERENCES crowdfunds(id) ON DELETE CASCADE,
  pledger_tid   BIGINT NOT NULL,
  amount        NUMERIC(20, 4) NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'USD',
  signature     TEXT NOT NULL,
  signer        TEXT NOT NULL,
  pledged_at    TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crowdfunds_created ON crowdfunds (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crowdfunds_channel
  ON crowdfunds (channel_id, created_at DESC) WHERE channel_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pledges_crowdfund
  ON crowdfund_pledges (crowdfund_id, pledged_at DESC);
CREATE INDEX IF NOT EXISTS idx_pledges_pledger
  ON crowdfund_pledges (pledger_tid, pledged_at DESC);

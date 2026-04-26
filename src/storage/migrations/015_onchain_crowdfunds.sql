-- On-chain Crowdfund campaigns, populated by the crowdfund-registry
-- log listener. One row per campaign, keyed by the Crowdfund PDA.
CREATE TABLE IF NOT EXISTS onchain_crowdfunds (
  pda                  TEXT PRIMARY KEY,
  creator              TEXT NOT NULL,
  creator_tid          BIGINT NOT NULL,
  crowdfund_id         BIGINT NOT NULL,
  goal_amount          BIGINT NOT NULL,
  total_pledged        BIGINT NOT NULL DEFAULT 0,
  pledge_count         INT NOT NULL DEFAULT 0,
  deadline_at          TIMESTAMPTZ NOT NULL,
  -- 0 = Active, 1 = Succeeded, 2 = Failed (mirrors the on-chain enum)
  status               SMALLINT NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  create_tx_signature  TEXT NOT NULL,
  claim_tx_signature   TEXT
);

CREATE INDEX IF NOT EXISTS idx_onchain_crowdfunds_creator
  ON onchain_crowdfunds (creator_tid, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_onchain_crowdfunds_status
  ON onchain_crowdfunds (status, deadline_at);

-- Per-backer pledge accumulator. Re-pledging from the same backer
-- adds to the row's `amount`; a refund removes the row outright
-- (mirroring the on-chain Pledge PDA which is closed on refund).
-- The (crowdfund, backer) pair is unique by construction.
CREATE TABLE IF NOT EXISTS onchain_crowdfund_pledges (
  crowdfund        TEXT NOT NULL,
  backer           TEXT NOT NULL,
  backer_tid       BIGINT NOT NULL,
  amount           BIGINT NOT NULL,
  -- Stored so a re-delivered Pledged log doesn't double-count: the
  -- upsert WHERE clause skips the increment when this matches.
  last_pledge_tx   TEXT NOT NULL,
  pledged_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (crowdfund, backer)
);

CREATE INDEX IF NOT EXISTS idx_onchain_pledges_backer
  ON onchain_crowdfund_pledges (backer_tid, pledged_at DESC);
CREATE INDEX IF NOT EXISTS idx_onchain_pledges_crowdfund
  ON onchain_crowdfund_pledges (crowdfund);

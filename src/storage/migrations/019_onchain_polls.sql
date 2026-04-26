-- On-chain Poll mirror, populated by the poll-registry log listener.
-- Question text + option labels live in the off-chain `polls` table
-- (POLL_ADD envelope); this table is the on-chain identity anchor
-- and parents the votes table for tally aggregation.
CREATE TABLE IF NOT EXISTS onchain_polls (
  pda                  TEXT PRIMARY KEY,
  creator              TEXT NOT NULL,
  creator_tid          BIGINT NOT NULL,
  poll_id              BIGINT NOT NULL,
  option_count         SMALLINT NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  create_tx_signature  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_onchain_polls_creator
  ON onchain_polls (creator_tid, created_at DESC);

-- One row per (poll, voter). The on-chain Vote PDA's `init`
-- constraint already enforces one-vote-per-TID, but we add a PK on
-- the same pair locally so log redelivery is a no-op via
-- ON CONFLICT DO NOTHING.
CREATE TABLE IF NOT EXISTS onchain_poll_votes (
  poll          TEXT NOT NULL,
  voter         TEXT NOT NULL,
  voter_tid     BIGINT NOT NULL,
  option_index  SMALLINT NOT NULL,
  tx_signature  TEXT NOT NULL,
  voted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (poll, voter)
);

CREATE INDEX IF NOT EXISTS idx_onchain_poll_votes_poll
  ON onchain_poll_votes (poll, option_index);
CREATE INDEX IF NOT EXISTS idx_onchain_poll_votes_voter
  ON onchain_poll_votes (voter_tid, voted_at DESC);

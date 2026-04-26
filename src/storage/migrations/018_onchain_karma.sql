-- On-chain karma counters mirrored from karma-registry. Keyed by
-- TID (more useful than PDA since karma is what apps query by user).
-- The pda column is stored alongside in case callers want to verify.
CREATE TABLE IF NOT EXISTS onchain_karma (
  tid                              BIGINT PRIMARY KEY,
  pda                              TEXT NOT NULL,
  tips_received_count              BIGINT NOT NULL DEFAULT 0,
  tips_received_lamports           BIGINT NOT NULL DEFAULT 0,
  tasks_completed_count            BIGINT NOT NULL DEFAULT 0,
  tasks_completed_reward_lamports  BIGINT NOT NULL DEFAULT 0,
  initialized_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit trail of what credited each TID's karma. Each row mirrors a
-- KarmaProof PDA from karma-registry — source is the address of the
-- on-chain TipRecord or Task that contributed. Useful for showing
-- "this karma came from these tips / completed tasks".
CREATE TABLE IF NOT EXISTS onchain_karma_proofs (
  source         TEXT PRIMARY KEY,
  -- 1 = TipRecord, 2 = Task (matches karma-registry's KarmaProofKind)
  kind           SMALLINT NOT NULL,
  tid            BIGINT NOT NULL,
  karma_pda      TEXT NOT NULL,
  amount         BIGINT NOT NULL,
  tx_signature   TEXT NOT NULL,
  recorded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onchain_karma_proofs_tid
  ON onchain_karma_proofs (tid, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_onchain_karma_proofs_kind
  ON onchain_karma_proofs (tid, kind, recorded_at DESC);

-- On-chain TipRecord mirror, populated by the tip-registry log
-- listener. Keyed by the TipRecord PDA address (one row per
-- on-chain tip). Joined to the off-chain `tips` table on
-- `tx_signature` so callers can pull both halves in one query.
CREATE TABLE IF NOT EXISTS onchain_tip_records (
  pda            TEXT PRIMARY KEY,
  sender         TEXT NOT NULL,
  recipient      TEXT NOT NULL,
  sender_tid     BIGINT NOT NULL,
  recipient_tid  BIGINT NOT NULL,
  amount         BIGINT NOT NULL,
  tip_id         BIGINT NOT NULL,
  target_hash    TEXT,
  has_target     BOOLEAN NOT NULL DEFAULT FALSE,
  tx_signature   TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (sender_tid <> recipient_tid),
  CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_onchain_tips_sender
  ON onchain_tip_records (sender_tid, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_onchain_tips_recipient
  ON onchain_tip_records (recipient_tid, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_onchain_tips_target
  ON onchain_tip_records (target_hash, created_at DESC) WHERE target_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_onchain_tips_tx
  ON onchain_tip_records (tx_signature);

-- Tips (TIP_ADD = 25). Records the social signal — the actual SPL
-- transfer happens out-of-band on Solana (tx hash optional).
CREATE TABLE IF NOT EXISTS tips (
  hash          TEXT PRIMARY KEY,
  sender_tid    BIGINT NOT NULL,
  recipient_tid BIGINT NOT NULL,
  target_hash   TEXT,
  amount        NUMERIC(20, 4) NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'USD',
  tx_signature  TEXT,
  signature     TEXT NOT NULL,
  signer        TEXT NOT NULL,
  sent_at       TIMESTAMPTZ NOT NULL,
  CHECK (sender_tid <> recipient_tid)
);

CREATE INDEX IF NOT EXISTS idx_tips_sender
  ON tips (sender_tid, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_tips_recipient
  ON tips (recipient_tid, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_tips_target
  ON tips (target_hash, sent_at DESC) WHERE target_hash IS NOT NULL;

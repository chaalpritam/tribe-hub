-- On-chain Tasks, populated by the task-registry log listener.
-- One row per task, keyed by the Task PDA.
--
-- The status column mirrors the on-chain TaskStatus enum:
--   0 = Open       (no claimer yet)
--   1 = Claimed    (locked to a single claimer)
--   2 = Completed  (creator released the reward; terminal)
--   3 = Cancelled  (creator cancelled while still Open; terminal)
CREATE TABLE IF NOT EXISTS onchain_tasks (
  pda                   TEXT PRIMARY KEY,
  creator               TEXT NOT NULL,
  creator_tid           BIGINT NOT NULL,
  task_id               BIGINT NOT NULL,
  status                SMALLINT NOT NULL DEFAULT 0,
  reward_amount         BIGINT NOT NULL DEFAULT 0,
  claimer               TEXT,
  claimer_tid           BIGINT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  claimed_at            TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  create_tx_signature   TEXT NOT NULL,
  claim_tx_signature    TEXT,
  complete_tx_signature TEXT,
  cancel_tx_signature   TEXT
);

CREATE INDEX IF NOT EXISTS idx_onchain_tasks_creator
  ON onchain_tasks (creator_tid, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_onchain_tasks_claimer
  ON onchain_tasks (claimer_tid, claimed_at DESC) WHERE claimer_tid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_onchain_tasks_status
  ON onchain_tasks (status, created_at DESC);

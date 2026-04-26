-- Tasks (TASK_ADD = 20, TASK_CLAIM = 21, TASK_COMPLETE = 22).
CREATE TABLE IF NOT EXISTS tasks (
  id                TEXT PRIMARY KEY,
  creator_tid       BIGINT NOT NULL,
  title             TEXT NOT NULL,
  description       TEXT,
  reward_text       TEXT,
  channel_id        TEXT,
  status            TEXT NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open', 'claimed', 'completed')),
  claimed_by_tid    BIGINT,
  completed_by_tid  BIGINT,
  claimed_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  hash              TEXT NOT NULL,
  signature         TEXT NOT NULL,
  signer            TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_status_created ON tasks (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_channel
  ON tasks (channel_id, created_at DESC) WHERE channel_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_claimed_by
  ON tasks (claimed_by_tid) WHERE claimed_by_tid IS NOT NULL;

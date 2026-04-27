-- Bridge between on-chain Poll/Task/Crowdfund PDAs and their
-- off-chain envelope tables. Same shape as migration 022 for events:
-- the on-chain account holds metadata_hash, the listener captures
-- it on the *Created event, and query endpoints LEFT JOIN the
-- off-chain table on hash to resolve title / question / description
-- in a single round trip.
--
-- All three columns are nullable because capture is best-effort —
-- an RPC failure during indexing leaves the row with NULL and the
-- JOIN gracefully falls back to placeholder copy on the client.
ALTER TABLE onchain_polls
  ADD COLUMN IF NOT EXISTS metadata_hash TEXT;

ALTER TABLE onchain_tasks
  ADD COLUMN IF NOT EXISTS metadata_hash TEXT;

ALTER TABLE onchain_crowdfunds
  ADD COLUMN IF NOT EXISTS metadata_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_onchain_polls_metadata_hash
  ON onchain_polls (metadata_hash) WHERE metadata_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_onchain_tasks_metadata_hash
  ON onchain_tasks (metadata_hash) WHERE metadata_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_onchain_crowdfunds_metadata_hash
  ON onchain_crowdfunds (metadata_hash) WHERE metadata_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_polls_hash ON polls (hash);
CREATE INDEX IF NOT EXISTS idx_tasks_hash ON tasks (hash);
CREATE INDEX IF NOT EXISTS idx_crowdfunds_hash ON crowdfunds (hash);

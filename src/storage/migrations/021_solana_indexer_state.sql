-- Cursor state for the Solana log listener.
--
-- One row per indexed program. The live `onLogs` subscription updates
-- (last_processed_signature, last_processed_slot) on every event, and
-- the startup backfill reads them to know where to resume from
-- (`getSignaturesForAddress` with `until = last_processed_signature`).
-- A NULL signature means we've never indexed this program before;
-- backfill in that case fetches up to BACKFILL_LIMIT recent
-- signatures and stops.
CREATE TABLE IF NOT EXISTS solana_indexer_state (
  program_id                  TEXT PRIMARY KEY,
  last_processed_signature    TEXT,
  last_processed_slot         BIGINT,
  last_backfill_completed_at  TIMESTAMPTZ,
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

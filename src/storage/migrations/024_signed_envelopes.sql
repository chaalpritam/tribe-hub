-- Phase 3.4: persist the bytes the signer hashed alongside any
-- accepted envelope, keyed by hash. Single table works for every
-- message type (tweets, reactions, polls, events, dms, …) without
-- adding a data_bytes column to each projection table.
--
-- Hubs that received a message can re-emit it on /gossip with full
-- integrity (peer recomputes blake3(data_bytes) and verifies against
-- the hash) instead of forwarding only the projection.
--
-- Pre-3.4 envelopes don't have an entry here; the gossip path falls
-- back to the projected fields for those, with no integrity check.
CREATE TABLE IF NOT EXISTS signed_envelopes (
  hash       TEXT PRIMARY KEY,
  data_bytes BYTEA NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

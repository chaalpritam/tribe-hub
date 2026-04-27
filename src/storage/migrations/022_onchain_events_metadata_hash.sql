-- Bridge between on-chain Event PDAs and the off-chain events table.
--
-- The on-chain Event holds metadata_hash: the BLAKE3 hash of the
-- off-chain EVENT_ADD envelope (which carries title / description /
-- location_text). The listener reads metadata_hash from the Event
-- account on EventCreated and stores its base64 form here so query
-- endpoints can LEFT JOIN events on hash to resolve the rich
-- metadata in a single round trip.
--
-- Column is nullable because we capture it best-effort — an RPC
-- failure during indexing leaves the row with NULL and the JOIN
-- gracefully falls back to placeholder copy.
ALTER TABLE onchain_events
  ADD COLUMN IF NOT EXISTS metadata_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_onchain_events_metadata_hash
  ON onchain_events (metadata_hash) WHERE metadata_hash IS NOT NULL;

-- Index on the off-chain envelope hash so the JOIN is cheap. The
-- existing events.hash column is unique-by-construction (envelope
-- hashes are content-addressed) but had no index.
CREATE INDEX IF NOT EXISTS idx_events_hash ON events (hash);

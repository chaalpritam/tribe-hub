-- Channel kinds + optional location.
-- kind values match the protobuf ChannelKind enum:
--   1 = GENERAL (the reserved "general" channel),
--   2 = CITY    (carries latitude/longitude),
--   3 = INTEREST.
ALTER TABLE channels
  ADD COLUMN IF NOT EXISTS kind      SMALLINT NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS latitude  DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_channels_kind ON channels (kind);

-- Seed the reserved "general" channel. It is the protocol-wide default —
-- every TWEET_ADD without an explicit channel_id lands here. The synthetic
-- creator/hash/signature values mark this row as hub-seeded; a real
-- CHANNEL_ADD would always carry a non-empty signature.
INSERT INTO channels (
  id, name, description, created_by, hash, signature, signer, kind
) VALUES (
  'general',
  'General',
  'The protocol-wide default channel. Tweets without a city or interest group land here.',
  0,
  '',
  '',
  '',
  1
)
ON CONFLICT (id) DO UPDATE SET kind = 1;

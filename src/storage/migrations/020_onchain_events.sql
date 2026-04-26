-- On-chain Event mirror, populated by the event-registry log
-- listener. Title / description / location_text / lat-lon live in
-- the off-chain `events` table from EVENT_ADD envelopes; this
-- table is the on-chain identity anchor and parents the RSVPs.
CREATE TABLE IF NOT EXISTS onchain_events (
  pda                  TEXT PRIMARY KEY,
  creator              TEXT NOT NULL,
  creator_tid          BIGINT NOT NULL,
  event_id             BIGINT NOT NULL,
  starts_at            TIMESTAMPTZ NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  create_tx_signature  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_onchain_events_creator
  ON onchain_events (creator_tid, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_onchain_events_starts
  ON onchain_events (starts_at DESC);

-- One row per (event, attendee). The on-chain Rsvp PDA's init
-- constraint enforces one-RSVP-per-TID; the (event, attendee) PK
-- here mirrors that and makes redelivery a no-op.
--
-- status mirrors the on-chain RsvpStatus enum: 1=Yes, 2=No, 3=Maybe.
CREATE TABLE IF NOT EXISTS onchain_event_rsvps (
  event         TEXT NOT NULL,
  attendee      TEXT NOT NULL,
  attendee_tid  BIGINT NOT NULL,
  status        SMALLINT NOT NULL,
  tx_signature  TEXT NOT NULL,
  responded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (event, attendee)
);

CREATE INDEX IF NOT EXISTS idx_onchain_rsvps_event_status
  ON onchain_event_rsvps (event, status);
CREATE INDEX IF NOT EXISTS idx_onchain_rsvps_attendee
  ON onchain_event_rsvps (attendee_tid, responded_at DESC);

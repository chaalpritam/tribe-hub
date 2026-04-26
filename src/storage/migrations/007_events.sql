-- Events (EVENT_ADD = 18, EVENT_RSVP = 19).
CREATE TABLE IF NOT EXISTS events (
  id            TEXT PRIMARY KEY,
  creator_tid   BIGINT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ,
  location_text TEXT,
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  channel_id    TEXT,
  image_url     TEXT,
  hash          TEXT NOT NULL,
  signature     TEXT NOT NULL,
  signer        TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_rsvps (
  event_id    TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  tid         BIGINT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('yes', 'no', 'maybe')),
  hash        TEXT NOT NULL,
  signature   TEXT NOT NULL,
  signer      TEXT NOT NULL,
  rsvped_at   TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (event_id, tid)
);

CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events (starts_at);
CREATE INDEX IF NOT EXISTS idx_events_channel
  ON events (channel_id, starts_at) WHERE channel_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_rsvps_tid
  ON event_rsvps (tid, rsvped_at DESC);

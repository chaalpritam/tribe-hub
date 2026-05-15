-- Stories (STORY_ADD = 33). Ephemeral posts — auto-purged 24h after
-- creation by the stories-cleanup cron in src/storage/stories-cleanup.ts.
--
-- Unlike POLL_ADD / EVENT_ADD, a story doesn't carry a user-chosen
-- id — the envelope hash IS the primary key. Cuts a class of "two
-- stories with the same id" conflicts and matches how reactions /
-- bookmarks key off target_hash already.
CREATE TABLE IF NOT EXISTS stories (
  hash         TEXT PRIMARY KEY,
  author_tid   BIGINT NOT NULL,
  media_hash   TEXT NOT NULL,
  caption      TEXT,
  music        TEXT,
  signature    TEXT NOT NULL,
  signer       TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stories_author
  ON stories (author_tid, created_at DESC);

-- Used by the hourly cleanup pass — DELETE WHERE expires_at < now()
-- should be a quick index scan, not a seq scan as the table grows.
CREATE INDEX IF NOT EXISTS idx_stories_expires
  ON stories (expires_at);

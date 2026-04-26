-- Bookmarks (private to a TID). Each row is the current bookmarked
-- state; BOOKMARK_ADD upserts, BOOKMARK_REMOVE deletes.
CREATE TABLE IF NOT EXISTS bookmarks (
  tid             BIGINT NOT NULL,
  target_hash     TEXT NOT NULL,
  bookmarked_at   TIMESTAMPTZ NOT NULL,
  envelope_hash   TEXT NOT NULL,
  signature       TEXT NOT NULL,
  signer          TEXT NOT NULL,
  PRIMARY KEY (tid, target_hash)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_tid_recent
  ON bookmarks (tid, bookmarked_at DESC);

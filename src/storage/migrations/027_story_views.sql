-- Story views (STORY_VIEW = 34). One row per (story, viewer); the
-- composite key dedupes the same viewer hitting the same story twice.
-- Cascades from stories so the hourly expires_at cleanup also reaps
-- the join rows without a second query.
CREATE TABLE IF NOT EXISTS story_views (
  story_hash   TEXT NOT NULL REFERENCES stories(hash) ON DELETE CASCADE,
  viewer_tid   BIGINT NOT NULL,
  viewed_at    TIMESTAMPTZ NOT NULL,
  signature    TEXT NOT NULL,
  signer       TEXT NOT NULL,
  PRIMARY KEY (story_hash, viewer_tid)
);

-- "What have I seen?" — used by the iOS / web stories tray to ring
-- author avatars grey instead of gradient when every story has been
-- viewed. Without this index it's a seq scan on every story-tray render.
CREATE INDEX IF NOT EXISTS idx_story_views_viewer
  ON story_views (viewer_tid, viewed_at DESC);

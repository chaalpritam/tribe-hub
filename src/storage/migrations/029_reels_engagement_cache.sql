-- Materialized snapshot of the engagement-ranked reels feed.
--
-- /v1/reels?sort=engagement runs five correlated subqueries per row
-- (reply_count, reaction_count, bookmark_count, displayName, pfpUrl)
-- and then sorts the result by an HN-style score. Cheap for a handful
-- of reels; melts the planner once we have a few thousand.
--
-- This table holds the precomputed top-N reels, refreshed every 5 min
-- by src/storage/reels-cache.ts. The route reads (rank, hash) and
-- joins back to messages for the full row — keeps the cache narrow
-- so refresh is fast and the live row data (counts that changed in
-- the last 5 min) stays accurate.
--
-- Why a regular table over a materialized view: the route still wants
-- live reply / reaction / bookmark counts (no point caching stale
-- numbers next to a stale rank), so the cache only stores rank + score
-- and we join back to messages on read. A matview would force the
-- counts to be cached too.
CREATE TABLE IF NOT EXISTS reels_engagement_cache (
  hash         TEXT PRIMARY KEY,
  score        DOUBLE PRECISION NOT NULL,
  rank         INTEGER NOT NULL,
  computed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cursor pagination drives ORDER BY rank ASC; index lets it scan.
CREATE INDEX IF NOT EXISTS idx_reels_cache_rank
  ON reels_engagement_cache (rank);

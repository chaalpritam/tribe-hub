-- Index supporting the NOT EXISTS sub-query that excludes removed
-- tweets from feed reads. Without it, every tweet read scans all
-- TWEET_REMOVE rows looking for a match.
--
-- TWEET_REMOVE stores the target tweet's hash in the `text` column
-- (existing schema convention — see hub submit route's TWEET_REMOVE
-- branch). type=2 + author + target_hash gives us O(log n) lookup.
CREATE INDEX IF NOT EXISTS idx_messages_tweet_remove_target
  ON messages (tid, text)
  WHERE type = 2;

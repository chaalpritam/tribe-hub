-- Extend messages with the post_kind discriminator + a couple of
-- body fields the IG-shaped surface needs. All nullable so existing
-- tweets re-replay cleanly.
--
-- post_kind values today:
--   NULL      — plain tweet (text + optional embeds). Default for
--               every row pre-migration.
--   'photo'   — photo post (1+ image embeds, IG-shaped). Hub doesn't
--               require this be set explicitly today — feed views
--               filter on `embeds != '{}'` regardless — but having
--               it stamped at write time lets future indexes
--               partition cleanly.
--   'reel'    — video post. /v1/reels filters on this column.
--
-- location and audio_title travel through the TWEET_ADD body when
-- present; submit.ts (next commit) writes them onto the row.
ALTER TABLE messages ADD COLUMN IF NOT EXISTS post_kind   TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS location    TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS audio_title TEXT;

-- Index on post_kind so /v1/reels stays O(reels) not O(messages).
-- Partial — most rows have post_kind NULL and we don't want them in
-- the index.
CREATE INDEX IF NOT EXISTS idx_messages_post_kind
  ON messages (post_kind, timestamp DESC)
  WHERE post_kind IS NOT NULL;

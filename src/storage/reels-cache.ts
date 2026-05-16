import { db } from "./db";

/// Background job that refreshes `reels_engagement_cache` — the
/// materialized top-N list that /v1/reels?sort=engagement reads
/// from instead of running the full ranking query per request.
///
/// Cadence: every 5 minutes. Tradeoff:
///   - 5 min staleness on the *rank* of a reel (i.e. a brand-new viral
///     reel takes up to 5 min to appear at the top)
///   - 5 min refresh interval means we only run the expensive query
///     288×/day instead of once per request
///   - reply/reaction/bookmark *counts* shown on each card are NOT
///     stale — the route joins back to messages on read, so a card
///     always reflects the live count even if its rank is from the
///     last refresh
///
/// Top-N size: 500. Most consumers paginate 20 reels at a time, so
/// 500 = 25 pages of cached results. Past page 25 we fall through to
/// the live query (which is fine — by then we're deep into long-tail).

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 min
const TOP_N = 500;
const ENGAGEMENT_WINDOW_MS = 14 * 24 * 60 * 60 * 1000; // 14d

let timer: NodeJS.Timeout | null = null;

/// Recompute the cache. Returns the number of reels written.
///
/// Implementation: single transaction so a reader during refresh
/// either sees the old snapshot (before BEGIN commits) or the new
/// one — never a half-written set.
export async function refreshReelsEngagementCache(): Promise<number> {
  const sinceMs = Date.now() - ENGAGEMENT_WINDOW_MS;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query("TRUNCATE reels_engagement_cache");
    const result = await client.query(
      `
      WITH ranked AS (
        SELECT m.hash, m.timestamp,
               (SELECT COUNT(*)::int FROM messages rep
                  WHERE rep.type = 1 AND rep.parent_hash = m.hash
                    AND NOT EXISTS (
                      SELECT 1 FROM messages d
                      WHERE d.type = 2 AND d.tid = rep.tid AND d.text = rep.hash
                    )
               ) AS reply_count,
               (SELECT COUNT(DISTINCT r.tid)::int FROM messages r
                  WHERE r.type = 3 AND r.parent_hash = m.hash AND r.text = '1'
                    AND NOT EXISTS (
                      SELECT 1 FROM messages u
                      WHERE u.type = 4 AND u.tid = r.tid AND u.parent_hash = m.hash
                        AND u.timestamp > r.timestamp
                    )
               ) AS reaction_count,
               (SELECT COUNT(*)::int FROM bookmarks b
                  WHERE b.target_hash = m.hash) AS bookmark_count
          FROM messages m
         WHERE m.type = 1
           AND m.post_kind = 'reel'
           AND m.timestamp >= $1
           AND NOT EXISTS (
             SELECT 1 FROM messages r
             WHERE r.type = 2 AND r.tid = m.tid AND r.text = m.hash
           )
      ),
      scored AS (
        SELECT hash,
               (
                 (reaction_count + bookmark_count * 2 + reply_count)::float
                 / POWER(
                     GREATEST(
                       2.0,
                       EXTRACT(EPOCH FROM (NOW() - to_timestamp(timestamp / 1000.0))) / 3600.0 + 2
                     ),
                     1.5
                   )
               ) AS score
          FROM ranked
      )
      INSERT INTO reels_engagement_cache (hash, score, rank, computed_at)
      SELECT hash,
             score,
             ROW_NUMBER() OVER (ORDER BY score DESC, hash ASC)::int AS rank,
             NOW()
        FROM scored
       ORDER BY score DESC, hash ASC
       LIMIT $2
      `,
      [sinceMs, TOP_N]
    );
    await client.query("COMMIT");
    return result.rowCount ?? 0;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

export function startReelsCacheRefresh(): void {
  if (timer) return;
  // First pass shortly after boot so /v1/reels?sort=engagement has
  // a cache to read from before the first 5-min tick fires.
  setTimeout(() => {
    refreshReelsEngagementCache().catch((err) => {
      console.error("[reels-cache] initial refresh failed:", err);
    });
  }, 30 * 1000);

  timer = setInterval(() => {
    refreshReelsEngagementCache().catch((err) => {
      console.error("[reels-cache] periodic refresh failed:", err);
    });
  }, REFRESH_INTERVAL_MS);
  if (timer.unref) timer.unref();
}

export function stopReelsCacheRefresh(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

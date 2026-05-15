import { db } from "./db";

/// Background job that reaps stories whose expires_at has passed.
/// stories.expires_at is hub-stamped at created_at + 24h by submit.ts,
/// so this just runs `DELETE WHERE expires_at < now()` on a timer.
/// story_views has ON DELETE CASCADE off stories so the join rows
/// vanish in the same statement.
///
/// Idempotent — if the cron fires twice, the second pass finds no
/// expired rows and is a no-op. Safe to also call eagerly on hub
/// startup (current main() doesn't, but doing so wouldn't break
/// anything).

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1h

let timer: NodeJS.Timeout | null = null;

export async function runStoriesCleanup(): Promise<number> {
  const result = await db.query(
    `DELETE FROM stories WHERE expires_at < NOW()`
  );
  return result.rowCount ?? 0;
}

export function startStoriesCleanup(): void {
  if (timer) return;
  // Run once shortly after boot so a hub that's been stopped for
  // hours doesn't surface stale stories on the first /v1/stories
  // request. Then settle into the hourly cadence.
  setTimeout(() => {
    runStoriesCleanup().catch((err) => {
      console.error("[stories-cleanup] initial pass failed:", err);
    });
  }, 30 * 1000);

  timer = setInterval(() => {
    runStoriesCleanup().catch((err) => {
      console.error("[stories-cleanup] periodic pass failed:", err);
    });
  }, CLEANUP_INTERVAL_MS);
  if (timer.unref) timer.unref();
}

export function stopStoriesCleanup(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

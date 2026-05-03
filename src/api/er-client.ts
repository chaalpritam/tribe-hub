import { config } from "../config";

export interface ErLinks {
  followingTids: string[];
  followerTids: string[];
  unfollowingTids: string[];
  unfollowerTids: string[];
}

export const EMPTY_ER_LINKS: ErLinks = {
  followingTids: [],
  followerTids: [],
  unfollowingTids: [],
  unfollowerTids: [],
};

/**
 * Best-effort fetch of the ER's view of follow / unfollow state for
 * a TID. Used by every endpoint that surfaces follow data so a
 * freshly-clicked Follow / Unfollow shows up before the L1
 * settlement + indexer pickup completes (~10–60s window).
 *
 * Empty arrays when ER isn't configured, the request times out, or
 * the response is malformed — callers fall back to social_graph
 * alone in those cases.
 */
export async function fetchErLinks(tid: string): Promise<ErLinks> {
  if (!config.erServerUrl) return EMPTY_ER_LINKS;
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    config.erServerTimeoutMs,
  );
  try {
    const res = await fetch(
      `${config.erServerUrl}/v1/er-links/${encodeURIComponent(tid)}`,
      { signal: controller.signal },
    );
    if (!res.ok) return EMPTY_ER_LINKS;
    const body = (await res.json()) as Partial<{
      followingTids: (string | number)[];
      followerTids: (string | number)[];
      unfollowingTids: (string | number)[];
      unfollowerTids: (string | number)[];
    }>;
    const toStr = (xs: (string | number)[] | undefined) =>
      Array.isArray(xs) ? xs.map(String) : [];
    return {
      followingTids: toStr(body.followingTids),
      followerTids: toStr(body.followerTids),
      unfollowingTids: toStr(body.unfollowingTids),
      unfollowerTids: toStr(body.unfollowerTids),
    };
  } catch {
    // Timeout or network error — fail open.
    return EMPTY_ER_LINKS;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Compute (social ∪ erAdds) \ erRemoves and return its size. Used
 * for follow counts: erAdds = followingTids/followerTids, erRemoves
 * = unfollowingTids/unfollowerTids.
 */
export function mergedCount(
  social: string[],
  erAdds: string[],
  erRemoves: string[],
): number {
  const set = new Set(social);
  for (const t of erAdds) set.add(t);
  for (const t of erRemoves) set.delete(t);
  return set.size;
}

export interface ErOperation {
  id: string;
  op_type: "follow" | "unfollow";
  follower_tid: string;
  following_tid: string;
  status: "pending" | "settling" | "settled" | "failed";
  created_at: string;
  settled_at: string | null;
  tx_signature: string | null;
  error: string | null;
}

/**
 * Per-account follow / unfollow operation log from the ER. Used by
 * the activity feed so the user can see every on-chain follow they
 * triggered (with a tx signature once settled). Empty list when ER
 * is unconfigured / unreachable — caller falls back to hub-only.
 */
export async function fetchErOperations(tid: string): Promise<ErOperation[]> {
  if (!config.erServerUrl) return [];
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    config.erServerTimeoutMs,
  );
  try {
    const res = await fetch(
      `${config.erServerUrl}/v1/operations/${encodeURIComponent(tid)}`,
      { signal: controller.signal },
    );
    if (!res.ok) return [];
    const body = (await res.json()) as { operations?: ErOperation[] };
    return Array.isArray(body.operations) ? body.operations : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

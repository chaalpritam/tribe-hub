import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";
import { fetchErLinks } from "../er-client";

interface FollowRow {
  follower_tid?: string;
  following_tid?: string;
  created_at: string;
  username: string | null;
  custody_address: string | null;
  pfp_url: string | null;
}

/**
 * Look up identity rows (username, custody_address, pfp_url) for a
 * batch of TIDs that the caller already knows aren't in social_graph
 * — used to project the ER-only side of the merge into the same
 * row shape /v1/followers /v1/following return.
 */
async function loadIdentitiesByTid(
  tids: string[],
  side: "follower" | "following",
): Promise<FollowRow[]> {
  if (tids.length === 0) return [];
  const result = await db.query(
    `SELECT t.tid, t.username, t.custody_address,
            (SELECT value FROM user_data
               WHERE tid = t.tid AND field = 'pfpUrl'
               ORDER BY timestamp DESC LIMIT 1) AS pfp_url
     FROM tids t
     WHERE t.tid = ANY($1::bigint[])`,
    [tids.map((t) => t)],
  );
  // No social_graph created_at for ER-only rows — synthesize NOW so
  // the caller can sort the ER side at the top of the merged list.
  const nowIso = new Date().toISOString();
  return result.rows.map((r) => ({
    [side === "follower" ? "follower_tid" : "following_tid"]: String(r.tid),
    created_at: nowIso,
    username: r.username ?? null,
    custody_address: r.custody_address ?? null,
    pfp_url: r.pfp_url ?? null,
  }));
}

export async function socialRoutes(server: FastifyInstance): Promise<void> {
  // Get followers of a user
  server.get<{
    Params: { tid: string };
    Querystring: { limit?: string };
  }>("/v1/followers/:tid", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 100);
    const tid = request.params.tid;
    const [sgResult, erLinks] = await Promise.all([
      db.query(
        `SELECT sg.follower_tid, sg.created_at, f.username, f.custody_address,
                (SELECT value FROM user_data
                   WHERE tid = sg.follower_tid AND field = 'pfpUrl'
                   ORDER BY timestamp DESC LIMIT 1) AS pfp_url
         FROM social_graph sg
         LEFT JOIN tids f ON f.tid = sg.follower_tid
         WHERE sg.following_tid = $1 AND sg.deleted_at IS NULL
         ORDER BY sg.created_at DESC
         LIMIT $2`,
        [tid, limit],
      ),
      fetchErLinks(tid),
    ]);

    // Drop pending unfollows from the settled list and find ER-only
    // tids that haven't reached social_graph yet.
    const unfollowerSet = new Set(erLinks.unfollowerTids);
    const settledRows: FollowRow[] = sgResult.rows.filter(
      (r: FollowRow) => !unfollowerSet.has(String(r.follower_tid)),
    );
    const settledTids = new Set(
      sgResult.rows.map((r: FollowRow) => String(r.follower_tid)),
    );
    const erOnlyTids = erLinks.followerTids.filter(
      (t) => !settledTids.has(t) && !unfollowerSet.has(t),
    );
    const erOnlyRows = await loadIdentitiesByTid(erOnlyTids, "follower");

    // ER-only first (those are the most recently followed), then
    // settled by created_at desc. Cap at limit.
    const merged = [...erOnlyRows, ...settledRows].slice(0, limit);
    return { followers: merged };
  });

  // Get who a user is following
  server.get<{
    Params: { tid: string };
    Querystring: { limit?: string };
  }>("/v1/following/:tid", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 100);
    const tid = request.params.tid;
    const [sgResult, erLinks] = await Promise.all([
      db.query(
        `SELECT sg.following_tid, sg.created_at, f.username, f.custody_address,
                (SELECT value FROM user_data
                   WHERE tid = sg.following_tid AND field = 'pfpUrl'
                   ORDER BY timestamp DESC LIMIT 1) AS pfp_url
         FROM social_graph sg
         LEFT JOIN tids f ON f.tid = sg.following_tid
         WHERE sg.follower_tid = $1 AND sg.deleted_at IS NULL
         ORDER BY sg.created_at DESC
         LIMIT $2`,
        [tid, limit],
      ),
      fetchErLinks(tid),
    ]);

    const unfollowingSet = new Set(erLinks.unfollowingTids);
    const settledRows: FollowRow[] = sgResult.rows.filter(
      (r: FollowRow) => !unfollowingSet.has(String(r.following_tid)),
    );
    const settledTids = new Set(
      sgResult.rows.map((r: FollowRow) => String(r.following_tid)),
    );
    const erOnlyTids = erLinks.followingTids.filter(
      (t) => !settledTids.has(t) && !unfollowingSet.has(t),
    );
    const erOnlyRows = await loadIdentitiesByTid(erOnlyTids, "following");

    const merged = [...erOnlyRows, ...settledRows].slice(0, limit);
    return { following: merged };
  });
}

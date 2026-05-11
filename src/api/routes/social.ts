import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";
import { fetchErLinks } from "../er-client";

interface UserRow {
  tid: string;
  custody_address: string;
  recovery_address: string | null;
  registered_at: string | null;
  username: string | null;
  following_count: string;
  followers_count: string;
  display_name: string | null;
  pfp_url: string | null;
  bio: string | null;
  profile: Record<string, string>;
}

/**
 * Bulk-load /v1/user-shaped rows for an ordered list of TIDs in a
 * single round trip. Same shape as /v1/user/:tid (flat fields plus
 * a nested `profile` object) so iOS's User decoder and the web
 * clients can consume followers / following without per-endpoint
 * adapters. Result is filtered + ordered to match the input list,
 * silently dropping TIDs not in the local `tids` table.
 */
async function loadUserRowsByTids(tids: string[]): Promise<UserRow[]> {
  if (tids.length === 0) return [];
  const result = await db.query(
    `SELECT t.tid::text AS tid,
            t.custody_address,
            t.recovery_address,
            t.registered_at,
            t.username,
            (SELECT COUNT(*) FROM social_graph
               WHERE follower_tid = t.tid AND deleted_at IS NULL)::text AS following_count,
            (SELECT COUNT(*) FROM social_graph
               WHERE following_tid = t.tid AND deleted_at IS NULL)::text AS followers_count,
            (SELECT value FROM user_data
               WHERE tid = t.tid AND field = 'displayName'
               ORDER BY timestamp DESC LIMIT 1) AS display_name,
            (SELECT value FROM user_data
               WHERE tid = t.tid AND field = 'pfpUrl'
               ORDER BY timestamp DESC LIMIT 1) AS pfp_url,
            (SELECT value FROM user_data
               WHERE tid = t.tid AND field = 'bio'
               ORDER BY timestamp DESC LIMIT 1) AS bio,
            COALESCE(
              (SELECT jsonb_object_agg(field, value)
                 FROM (SELECT DISTINCT ON (field) field, value
                         FROM user_data
                         WHERE tid = t.tid
                         ORDER BY field, timestamp DESC) latest),
              '{}'::jsonb
            ) AS profile
       FROM tids t
       WHERE t.tid = ANY($1::bigint[])`,
    [tids],
  );
  const byTid = new Map<string, UserRow>();
  for (const r of result.rows) byTid.set(String(r.tid), r as UserRow);
  return tids
    .map((t) => byTid.get(t))
    .filter((r): r is UserRow => Boolean(r));
}

export async function socialRoutes(server: FastifyInstance): Promise<void> {
  // Followers of a user. Returns canonical user rows under `users`,
  // ordered ER-only first (most recent follows that haven't settled
  // to L1 yet), then social_graph by created_at desc.
  server.get<{
    Params: { tid: string };
    Querystring: { limit?: string };
  }>("/v1/followers/:tid", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 100);
    const tid = request.params.tid;
    const [sgResult, erLinks] = await Promise.all([
      db.query(
        `SELECT sg.follower_tid
           FROM social_graph sg
           WHERE sg.following_tid = $1 AND sg.deleted_at IS NULL
           ORDER BY sg.created_at DESC
           LIMIT $2`,
        [tid, limit],
      ),
      fetchErLinks(tid),
    ]);

    const unfollowerSet = new Set(erLinks.unfollowerTids);
    const settledTids: string[] = sgResult.rows
      .map((r: { follower_tid: string }) => String(r.follower_tid))
      .filter((t) => !unfollowerSet.has(t));
    const settledSet = new Set(settledTids);
    const erOnlyTids = erLinks.followerTids.filter(
      (t) => !settledSet.has(t) && !unfollowerSet.has(t),
    );
    const finalTids = [...erOnlyTids, ...settledTids].slice(0, limit);
    const users = await loadUserRowsByTids(finalTids);
    return { users, total: users.length };
  });

  // Who a user is following. Same canonical shape as /v1/followers.
  server.get<{
    Params: { tid: string };
    Querystring: { limit?: string };
  }>("/v1/following/:tid", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 100);
    const tid = request.params.tid;
    const [sgResult, erLinks] = await Promise.all([
      db.query(
        `SELECT sg.following_tid
           FROM social_graph sg
           WHERE sg.follower_tid = $1 AND sg.deleted_at IS NULL
           ORDER BY sg.created_at DESC
           LIMIT $2`,
        [tid, limit],
      ),
      fetchErLinks(tid),
    ]);

    const unfollowingSet = new Set(erLinks.unfollowingTids);
    const settledTids: string[] = sgResult.rows
      .map((r: { following_tid: string }) => String(r.following_tid))
      .filter((t) => !unfollowingSet.has(t));
    const settledSet = new Set(settledTids);
    const erOnlyTids = erLinks.followingTids.filter(
      (t) => !settledSet.has(t) && !unfollowingSet.has(t),
    );
    const finalTids = [...erOnlyTids, ...settledTids].slice(0, limit);
    const users = await loadUserRowsByTids(finalTids);
    return { users, total: users.length };
  });
}

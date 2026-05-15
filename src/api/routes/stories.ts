import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";

/// Story read endpoints. Stories are STORY_ADD envelopes (type 33)
/// persisted to the `stories` table with a 24h expires_at stamped by
/// submit.ts at created_at + 24h. The stories-cleanup background job
/// deletes expired rows hourly so these endpoints can use a simple
/// `expires_at > now()` filter without joining elapsed-time math.
export async function storyRoutes(server: FastifyInstance): Promise<void> {
  // Active stories grouped by author, newest-first within each.
  //
  // viewer_tid (optional) flips on follow-graph filtering: when set,
  // only stories from authors the viewer follows + the viewer's own
  // stories surface. Omit it (or pass an unparseable value) to see
  // every active story — useful for the demo, for the public landing
  // page, and as a fallback while the iOS app's onboarding still
  // hasn't populated the user's TID.
  server.get<{
    Querystring: { limit?: string; viewer_tid?: string };
  }>("/v1/stories", async (request) => {
    const limit = Math.min(parseInt(request.query.limit || "100", 10), 200);
    const viewerRaw = request.query.viewer_tid;
    const viewerTid = viewerRaw ? parseInt(viewerRaw, 10) : null;
    const useFilter = viewerTid !== null && !Number.isNaN(viewerTid);

    const params: (number | null)[] = [limit];
    let filterClause = "";
    if (useFilter) {
      filterClause = `
        AND (
          s.author_tid = $2
          OR EXISTS (
            SELECT 1 FROM social_graph sg
            WHERE sg.follower_tid = $2
              AND sg.following_tid = s.author_tid
              AND sg.deleted_at IS NULL
          )
        )
      `;
      params.push(viewerTid);
    }

    const result = await db.query(
      `SELECT s.hash, s.author_tid, s.media_hash, s.caption, s.music,
              s.created_at, s.expires_at,
              t.username,
              (SELECT value FROM user_data
                 WHERE tid = s.author_tid AND field = 'pfpUrl'
                 ORDER BY timestamp DESC LIMIT 1) AS pfp_url
         FROM stories s
         LEFT JOIN tids t ON t.tid = s.author_tid
        WHERE s.expires_at > NOW()
        ${filterClause}
        ORDER BY s.author_tid, s.created_at DESC
        LIMIT $1`,
      params
    );
    return { stories: result.rows };
  });

  // Active stories for one user. Used by ProfileView's avatar tap
  // (open someone's story reel) and the StoryViewer's initial load.
  server.get<{
    Params: { tid: string };
  }>("/v1/stories/:tid", async (request) => {
    const tid = parseInt(request.params.tid, 10);
    if (Number.isNaN(tid)) {
      return { stories: [] };
    }
    const result = await db.query(
      `SELECT s.hash, s.author_tid, s.media_hash, s.caption, s.music,
              s.created_at, s.expires_at,
              t.username
         FROM stories s
         LEFT JOIN tids t ON t.tid = s.author_tid
        WHERE s.author_tid = $1 AND s.expires_at > NOW()
        ORDER BY s.created_at ASC`,
      [tid]
    );
    return { stories: result.rows };
  });

  // "Seen by" list for a single story. Author-only at the client
  // layer; the hub returns the list to anyone who asks (mirrors the
  // rest of /v1 — reads are public, writes are signature-verified).
  // The optional `viewer_tid` query lets clients short-circuit when
  // they're not the author: a non-author request gets a 403 and
  // doesn't see the list.
  server.get<{
    Params: { hash: string };
    Querystring: { viewer_tid?: string };
  }>("/v1/stories/:hash/viewers", async (request, reply) => {
    const hash = request.params.hash;
    const viewerTid = request.query.viewer_tid
      ? parseInt(request.query.viewer_tid, 10)
      : null;

    const ownerResult = await db.query(
      `SELECT author_tid FROM stories WHERE hash = $1 LIMIT 1`,
      [hash]
    );
    if (ownerResult.rowCount === 0) {
      return reply.status(404).send({ error: "Story not found" });
    }
    const authorTid = ownerResult.rows[0].author_tid;

    if (viewerTid !== null && BigInt(viewerTid) !== BigInt(authorTid)) {
      return reply.status(403).send({
        error: "Only the story's author can see the viewer list",
      });
    }

    const result = await db.query(
      `SELECT sv.viewer_tid, sv.viewed_at,
              t.username,
              (SELECT value FROM user_data
                 WHERE tid = sv.viewer_tid AND field = 'pfpUrl'
                 ORDER BY timestamp DESC LIMIT 1) AS pfp_url
         FROM story_views sv
         LEFT JOIN tids t ON t.tid = sv.viewer_tid
        WHERE sv.story_hash = $1
        ORDER BY sv.viewed_at DESC`,
      [hash]
    );
    return { viewers: result.rows };
  });
}

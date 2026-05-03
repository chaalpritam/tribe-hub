import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";
import { fetchErOperations } from "../er-client";
import type { ErOperation } from "../er-client";

export type ActivityType =
  | "tid_registered"
  | "tweet"
  | "tweet_reply"
  | "reaction_like"
  | "reaction_recast"
  | "bookmark"
  | "dm_sent"
  | "tip_sent"
  | "tip_received"
  | "follow_pending"
  | "follow_settled"
  | "follow_failed"
  | "unfollow_pending"
  | "unfollow_settled"
  | "unfollow_failed";

export interface ActivityRow {
  type: ActivityType;
  /** ISO 8601. Newest first when sorted. */
  timestamp: string;
  /** Solana tx signature when the underlying action settled on-chain. */
  tx_signature: string | null;
  /** Short human snippet — tweet text, tip amount, etc. */
  preview: string | null;
  /** Hash of the related message (tweet/dm/etc) when applicable. */
  target_hash: string | null;
  /** Other party's TID for two-party actions (follows, dms, tips). */
  peer_tid: string | null;
}

function mapErOpType(op: ErOperation): ActivityType | null {
  const isPending = op.status === "pending" || op.status === "settling";
  const isSettled = op.status === "settled";
  const isFailed = op.status === "failed";
  if (op.op_type === "follow") {
    if (isPending) return "follow_pending";
    if (isSettled) return "follow_settled";
    if (isFailed) return "follow_failed";
  } else {
    if (isPending) return "unfollow_pending";
    if (isSettled) return "unfollow_settled";
    if (isFailed) return "unfollow_failed";
  }
  return null;
}

export async function activityRoutes(server: FastifyInstance): Promise<void> {
  // Per-account activity feed — every signed envelope the account
  // produced (tweets, reactions, bookmarks, DMs, tips) PLUS every
  // follow / unfollow op via the ER (in-flight or settled, with
  // tx_signature once on-chain). Designed for a transparency card
  // in the sidebar so users can audit "what has my account done."
  server.get<{
    Params: { tid: string };
    Querystring: { limit?: string };
  }>("/v1/users/:tid/activity", async (request) => {
    const { tid } = request.params;
    const limit = Math.min(parseInt(request.query.limit || "50", 10), 200);

    const [hubResult, erOps] = await Promise.all([
      db.query(
        // Aggregate every event the hub knows about for this TID.
        // Each branch projects into a uniform shape so the UNION
        // type-checks. Filters mirror the per-feature queries:
        //   - tweets: type=1 with no later TWEET_REMOVE
        //   - reactions: type=3 with no later REACTION_REMOVE
        // Bookmarks / DMs / tips come straight from their tables.
        `WITH events AS (
          (
            SELECT 'tid_registered'::text AS type,
                   registered_at AS timestamp,
                   NULL::text AS tx_signature,
                   username    AS preview,
                   NULL::text  AS target_hash,
                   NULL::bigint AS peer_tid
            FROM tids
            WHERE tid = $1
          )
          UNION ALL
          (
            SELECT CASE WHEN m.parent_hash IS NOT NULL
                        THEN 'tweet_reply'
                        ELSE 'tweet'
                   END        AS type,
                   m.timestamp AS timestamp,
                   NULL::text  AS tx_signature,
                   m.text      AS preview,
                   m.hash      AS target_hash,
                   NULL::bigint AS peer_tid
            FROM messages m
            WHERE m.tid = $1 AND m.type = 1
              AND NOT EXISTS (
                SELECT 1 FROM messages r
                WHERE r.type = 2 AND r.tid = m.tid AND r.text = m.hash
              )
          )
          UNION ALL
          (
            SELECT CASE WHEN m.text = '2'
                        THEN 'reaction_recast'
                        ELSE 'reaction_like'
                   END         AS type,
                   m.timestamp  AS timestamp,
                   NULL::text   AS tx_signature,
                   NULL::text   AS preview,
                   m.parent_hash AS target_hash,
                   NULL::bigint AS peer_tid
            FROM messages m
            WHERE m.tid = $1 AND m.type = 3
              AND NOT EXISTS (
                SELECT 1 FROM messages rr
                WHERE rr.type = 4 AND rr.tid = m.tid
                  AND rr.parent_hash = m.parent_hash
                  AND rr.timestamp > m.timestamp
              )
          )
          UNION ALL
          (
            SELECT 'bookmark'::text AS type,
                   bookmarked_at    AS timestamp,
                   NULL::text       AS tx_signature,
                   NULL::text       AS preview,
                   target_hash,
                   NULL::bigint     AS peer_tid
            FROM bookmarks
            WHERE tid = $1
          )
          UNION ALL
          (
            SELECT 'dm_sent'::text AS type,
                   m.timestamp     AS timestamp,
                   NULL::text      AS tx_signature,
                   NULL::text      AS preview,
                   m.hash          AS target_hash,
                   m.recipient_tid AS peer_tid
            FROM dm_messages m
            WHERE m.sender_tid = $1
          )
          UNION ALL
          (
            SELECT 'tip_sent'::text AS type,
                   sent_at          AS timestamp,
                   tx_signature,
                   (amount::text || ' ' || currency) AS preview,
                   target_hash,
                   recipient_tid    AS peer_tid
            FROM tips
            WHERE sender_tid = $1
          )
          UNION ALL
          (
            SELECT 'tip_received'::text AS type,
                   sent_at              AS timestamp,
                   tx_signature,
                   (amount::text || ' ' || currency) AS preview,
                   target_hash,
                   sender_tid           AS peer_tid
            FROM tips
            WHERE recipient_tid = $1
          )
        )
        SELECT type, timestamp, tx_signature, preview, target_hash,
               peer_tid::text AS peer_tid
        FROM events
        ORDER BY timestamp DESC
        LIMIT $2`,
        [tid, limit],
      ),
      fetchErOperations(tid),
    ]);

    const hubRows: ActivityRow[] = hubResult.rows.map((r) => ({
      type: r.type as ActivityType,
      timestamp:
        r.timestamp instanceof Date
          ? r.timestamp.toISOString()
          : String(r.timestamp),
      tx_signature: r.tx_signature ?? null,
      preview: r.preview ?? null,
      target_hash: r.target_hash ?? null,
      peer_tid: r.peer_tid ? String(r.peer_tid) : null,
    }));

    // Project ER ops. follower_tid drives whether this is "I
    // followed them" vs "they followed me" — the activity card is
    // about THIS account's actions, so peer_tid is whichever side
    // isn't them.
    const erRows: ActivityRow[] = [];
    for (const op of erOps) {
      const type = mapErOpType(op);
      if (!type) continue;
      const isMyAction = String(op.follower_tid) === tid;
      // Skip incoming follows / unfollows where the action wasn't
      // initiated by this user — those belong on a notifications-
      // style "who interacted with me" feed, not "what I did".
      if (!isMyAction) continue;
      erRows.push({
        type,
        timestamp: op.settled_at ?? op.created_at,
        tx_signature: op.tx_signature,
        preview: null,
        target_hash: null,
        peer_tid: String(op.following_tid),
      });
    }

    const merged = [...hubRows, ...erRows].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    return { activity: merged.slice(0, limit) };
  });
}

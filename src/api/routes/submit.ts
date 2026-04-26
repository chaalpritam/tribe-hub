import { FastifyInstance } from "fastify";
import { SubmitMessageRequest, GossipMessage } from "../../types";
import { validateMessage } from "../../validation/verifier";
import { db } from "../../storage/db";
import { gossipMessage } from "../../gossip/protocol";
import { broadcastToClients } from "../ws";

// Message types
const TWEET_ADD = 1;
const TWEET_REMOVE = 2;
const REACTION_ADD = 3;
const REACTION_REMOVE = 4;
const USER_DATA_ADD = 7;
const CHANNEL_ADD = 9;
const CHANNEL_JOIN = 10;
const CHANNEL_LEAVE = 11;
const BOOKMARK_ADD = 14;
const BOOKMARK_REMOVE = 15;
const POLL_ADD = 16;
const POLL_VOTE = 17;

const POLL_ID_RE = /^[a-z0-9-]{1,64}$/;

const CHANNEL_ID_RE = /^[a-z0-9-]{1,64}$/;

const ALLOWED_USER_DATA_FIELDS = new Set([
  "bio",
  "displayName",
  "pfpUrl",
  "url",
  "location",
]);
const MAX_USER_DATA_VALUE_LEN = 500;

export async function submitRoutes(server: FastifyInstance): Promise<void> {
  server.post<{ Body: SubmitMessageRequest }>("/v1/submit", async (request, reply) => {
    const message = request.body;

    // Validate message signature, app key, dedup
    const validation = await validateMessage(message);
    if (!validation.valid) {
      return reply.status(400).send({ error: validation.error });
    }

    const messageType = message.data.type;
    const body = message.data.body;

    switch (messageType) {
      case TWEET_ADD: {
        const tweetBody = body as {
          text: string;
          mentions?: string[];
          embeds?: string[];
          parent_hash?: string;
          channel_id?: string;
        };
        // Convert mentions from string[] to number[] for BIGINT[] column
        const mentionsBigint = (tweetBody.mentions || []).map((m) => parseInt(m, 10)).filter((n) => !isNaN(n));
        await db.query(
          `INSERT INTO messages (hash, tid, type, text, parent_hash, channel_id, mentions, embeds, timestamp, signature, signer)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (hash) DO NOTHING`,
          [
            message.hash,
            message.data.tid,
            messageType,
            tweetBody.text,
            tweetBody.parent_hash || null,
            tweetBody.channel_id || null,
            mentionsBigint,
            tweetBody.embeds || [],
            new Date(message.data.timestamp * 1000),
            message.signature,
            message.signer,
          ]
        );
        break;
      }

      case TWEET_REMOVE: {
        const removeBody = body as { target_hash: string };
        if (!removeBody.target_hash) {
          return reply.status(400).send({ error: "target_hash is required for TWEET_REMOVE" });
        }
        // Store as a remove message
        await db.query(
          `INSERT INTO messages (hash, tid, type, text, parent_hash, channel_id, timestamp, signature, signer)
           VALUES ($1, $2, $3, $4, NULL, NULL, $5, $6, $7)
           ON CONFLICT (hash) DO NOTHING`,
          [
            message.hash,
            message.data.tid,
            messageType,
            removeBody.target_hash, // store target_hash in text field for removes
            new Date(message.data.timestamp * 1000),
            message.signature,
            message.signer,
          ]
        );
        break;
      }

      case REACTION_ADD: {
        const reactionBody = body as { type: number; target_hash: string };
        if (!reactionBody.target_hash || !reactionBody.type) {
          return reply.status(400).send({ error: "type and target_hash are required for REACTION_ADD" });
        }
        await db.query(
          `INSERT INTO messages (hash, tid, type, text, parent_hash, channel_id, timestamp, signature, signer)
           VALUES ($1, $2, $3, $4, $5, NULL, $6, $7, $8)
           ON CONFLICT (hash) DO NOTHING`,
          [
            message.hash,
            message.data.tid,
            messageType,
            reactionBody.type.toString(),
            reactionBody.target_hash,
            new Date(message.data.timestamp * 1000),
            message.signature,
            message.signer,
          ]
        );
        break;
      }

      case USER_DATA_ADD: {
        const userBody = body as { field?: string; value?: string };
        if (
          !userBody.field ||
          !userBody.value ||
          typeof userBody.field !== "string" ||
          typeof userBody.value !== "string"
        ) {
          return reply
            .status(400)
            .send({ error: "field and value are required for USER_DATA_ADD" });
        }
        if (!ALLOWED_USER_DATA_FIELDS.has(userBody.field)) {
          return reply
            .status(400)
            .send({ error: `unsupported user_data field: ${userBody.field}` });
        }
        if (userBody.value.length > MAX_USER_DATA_VALUE_LEN) {
          return reply.status(400).send({
            error: `value exceeds max length ${MAX_USER_DATA_VALUE_LEN}`,
          });
        }
        await db.query(
          `INSERT INTO user_data (hash, tid, field, value, timestamp, signature, signer)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (hash) DO NOTHING`,
          [
            message.hash,
            message.data.tid,
            userBody.field,
            userBody.value,
            new Date(message.data.timestamp * 1000),
            message.signature,
            message.signer,
          ]
        );
        break;
      }

      case CHANNEL_ADD: {
        const ch = body as {
          channel_id?: string;
          name?: string;
          description?: string;
        };
        if (!ch.channel_id || !ch.name) {
          return reply
            .status(400)
            .send({ error: "channel_id and name required for CHANNEL_ADD" });
        }
        if (!CHANNEL_ID_RE.test(ch.channel_id)) {
          return reply.status(400).send({
            error: "channel_id must match /^[a-z0-9-]{1,64}$/",
          });
        }
        await db.query(
          `INSERT INTO channels (id, name, description, created_by, hash, signature, signer)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [
            ch.channel_id,
            ch.name,
            ch.description ?? null,
            message.data.tid,
            message.hash,
            message.signature,
            message.signer,
          ]
        );
        break;
      }

      case CHANNEL_JOIN:
      case CHANNEL_LEAVE: {
        const ch = body as { channel_id?: string };
        if (!ch.channel_id) {
          return reply
            .status(400)
            .send({ error: "channel_id required" });
        }
        const ts = new Date(message.data.timestamp * 1000);
        if (messageType === CHANNEL_JOIN) {
          await db.query(
            `INSERT INTO channel_memberships (channel_id, tid, joined_at, left_at)
             VALUES ($1, $2, $3, NULL)
             ON CONFLICT (channel_id, tid)
               DO UPDATE SET joined_at = EXCLUDED.joined_at, left_at = NULL`,
            [ch.channel_id, message.data.tid, ts]
          );
        } else {
          await db.query(
            `UPDATE channel_memberships
             SET left_at = $3
             WHERE channel_id = $1 AND tid = $2`,
            [ch.channel_id, message.data.tid, ts]
          );
        }
        break;
      }

      case POLL_ADD: {
        const p = body as {
          poll_id?: string;
          question?: string;
          options?: string[];
          expires_at?: number; // unix seconds
          channel_id?: string;
        };
        if (
          !p.poll_id ||
          !p.question ||
          !Array.isArray(p.options) ||
          p.options.length < 2 ||
          p.options.length > 10
        ) {
          return reply.status(400).send({
            error: "poll_id, question, and 2-10 options required",
          });
        }
        if (!POLL_ID_RE.test(p.poll_id)) {
          return reply
            .status(400)
            .send({ error: "poll_id must match /^[a-z0-9-]{1,64}$/" });
        }
        await db.query(
          `INSERT INTO polls
             (id, creator_tid, question, options, expires_at, channel_id,
              hash, signature, signer)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [
            p.poll_id,
            message.data.tid,
            p.question,
            p.options,
            p.expires_at ? new Date(p.expires_at * 1000) : null,
            p.channel_id ?? null,
            message.hash,
            message.signature,
            message.signer,
          ]
        );
        break;
      }

      case POLL_VOTE: {
        const v = body as { poll_id?: string; option_index?: number };
        if (
          !v.poll_id ||
          typeof v.option_index !== "number" ||
          v.option_index < 0
        ) {
          return reply
            .status(400)
            .send({ error: "poll_id and option_index required" });
        }
        const pollResult = await db.query(
          `SELECT array_length(options, 1) AS n, expires_at
           FROM polls WHERE id = $1`,
          [v.poll_id]
        );
        if (pollResult.rows.length === 0) {
          return reply.status(400).send({ error: "Unknown poll" });
        }
        const { n, expires_at } = pollResult.rows[0];
        if (v.option_index >= n) {
          return reply.status(400).send({ error: "option_index out of range" });
        }
        if (expires_at && new Date(expires_at) < new Date()) {
          return reply.status(400).send({ error: "Poll has expired" });
        }
        await db.query(
          `INSERT INTO poll_votes
             (poll_id, voter_tid, option_index, hash, signature, signer, voted_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (poll_id, voter_tid) DO UPDATE
             SET option_index = EXCLUDED.option_index,
                 hash         = EXCLUDED.hash,
                 signature    = EXCLUDED.signature,
                 signer       = EXCLUDED.signer,
                 voted_at     = EXCLUDED.voted_at`,
          [
            v.poll_id,
            message.data.tid,
            v.option_index,
            message.hash,
            message.signature,
            message.signer,
            new Date(message.data.timestamp * 1000),
          ]
        );
        break;
      }

      case BOOKMARK_ADD:
      case BOOKMARK_REMOVE: {
        const bm = body as { target_hash?: string };
        if (!bm.target_hash) {
          return reply
            .status(400)
            .send({ error: "target_hash required for bookmark op" });
        }
        const ts = new Date(message.data.timestamp * 1000);
        if (messageType === BOOKMARK_ADD) {
          await db.query(
            `INSERT INTO bookmarks
               (tid, target_hash, bookmarked_at, envelope_hash, signature, signer)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (tid, target_hash) DO UPDATE
               SET bookmarked_at = EXCLUDED.bookmarked_at,
                   envelope_hash = EXCLUDED.envelope_hash,
                   signature     = EXCLUDED.signature,
                   signer        = EXCLUDED.signer`,
            [
              message.data.tid,
              bm.target_hash,
              ts,
              message.hash,
              message.signature,
              message.signer,
            ]
          );
        } else {
          await db.query(
            `DELETE FROM bookmarks WHERE tid = $1 AND target_hash = $2`,
            [message.data.tid, bm.target_hash]
          );
        }
        break;
      }

      case REACTION_REMOVE: {
        const removeReactionBody = body as { target_hash: string };
        if (!removeReactionBody.target_hash) {
          return reply.status(400).send({ error: "target_hash is required for REACTION_REMOVE" });
        }
        await db.query(
          `INSERT INTO messages (hash, tid, type, text, parent_hash, channel_id, timestamp, signature, signer)
           VALUES ($1, $2, $3, $4, $5, NULL, $6, $7, $8)
           ON CONFLICT (hash) DO NOTHING`,
          [
            message.hash,
            message.data.tid,
            messageType,
            null,
            removeReactionBody.target_hash,
            new Date(message.data.timestamp * 1000),
            message.signature,
            message.signer,
          ]
        );
        break;
      }

      default:
        return reply.status(400).send({ error: `Unsupported message type: ${messageType}` });
    }

    // Gossip to all connected peers (this is a direct submission, so we gossip it)
    const gossipMsg: GossipMessage = {
      hash: message.hash,
      tid: message.data.tid,
      type: messageType,
      text: (body as { text?: string }).text || null,
      parentHash: (body as { parent_hash?: string }).parent_hash || null,
      channelId: (body as { channel_id?: string }).channel_id || null,
      mentions: ((body as { mentions?: string[] }).mentions || []).map((m) => parseInt(m, 10).toString()).filter((m) => m !== "NaN"),
      embeds: (body as { embeds?: string[] }).embeds || [],
      timestamp: new Date(message.data.timestamp * 1000).toISOString(),
      signature: message.signature,
      signer: message.signer,
    };
    gossipMessage(gossipMsg);

    // Notify connected browser clients
    broadcastToClients("new_message", { hash: message.hash, tid: message.data.tid, type: messageType });

    return { hash: message.hash };
  });
}

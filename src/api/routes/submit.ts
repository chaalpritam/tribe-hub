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

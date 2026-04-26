import { FastifyInstance } from "fastify";
import nacl from "tweetnacl";
import { db } from "../../storage/db";
import { appKeyCache } from "../../validation/app-key-cache";
import { SubmitMessageRequest } from "../../types";
import { gossipDm, gossipDmKey } from "../../gossip/protocol";

const DM_KEY_REGISTER = 12;
const DM_SEND = 13;

interface DmKeyRegisterBody {
  x25519_pubkey: string;
}

interface DmSendBody {
  recipient_tid: number | string;
  ciphertext: string;
  nonce: string;
  sender_x25519: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Verify the envelope signature + that the signer is a registered app key
 * for the claimed TID. Caller is responsible for any per-route dedup.
 */
async function verifyEnvelope(
  message: SubmitMessageRequest
): Promise<ValidationResult> {
  const hash = Buffer.from(message.hash, "base64");
  const signature = Buffer.from(message.signature, "base64");
  const signer = Buffer.from(message.signer, "base64");

  if (!nacl.sign.detached.verify(hash, signature, signer)) {
    return { valid: false, error: "Invalid signature" };
  }
  const signerHex = Buffer.from(signer).toString("hex");
  const isValidKey = await appKeyCache.isValid(message.data.tid, signerHex);
  if (!isValidKey) {
    return {
      valid: false,
      error: "Signer is not a valid app key for this TID",
    };
  }
  return { valid: true };
}

function conversationIdFor(a: number, b: number): string {
  const [lo, hi] = a < b ? [a, b] : [b, a];
  return `${lo}:${hi}`;
}

export async function dmRoutes(server: FastifyInstance): Promise<void> {
  // Register or replace the x25519 pubkey for the caller's TID.
  // Body must be a TribeMessage envelope of type DM_KEY_REGISTER.
  server.post<{ Body: SubmitMessageRequest }>(
    "/v1/dm/register-key",
    async (request, reply) => {
      const message = request.body;
      if (message?.data?.type !== DM_KEY_REGISTER) {
        return reply
          .status(400)
          .send({ error: "Expected DM_KEY_REGISTER envelope" });
      }
      const validation = await verifyEnvelope(message);
      if (!validation.valid) {
        return reply.status(400).send({ error: validation.error });
      }

      const body = message.data.body as unknown as DmKeyRegisterBody;
      if (!body?.x25519_pubkey || typeof body.x25519_pubkey !== "string") {
        return reply.status(400).send({ error: "x25519_pubkey is required" });
      }

      await db.query(
        `INSERT INTO dm_keys (tid, x25519_pubkey, registered_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         ON CONFLICT (tid) DO UPDATE
           SET x25519_pubkey = EXCLUDED.x25519_pubkey,
               updated_at    = NOW()`,
        [message.data.tid, body.x25519_pubkey]
      );

      gossipDmKey(String(message.data.tid), body.x25519_pubkey);

      return { tid: message.data.tid, x25519_pubkey: body.x25519_pubkey };
    }
  );

  // Lookup the x25519 pubkey for a TID so a sender can encrypt to them.
  server.get<{ Params: { tid: string } }>(
    "/v1/dm/key/:tid",
    async (request, reply) => {
      const result = await db.query(
        `SELECT tid, x25519_pubkey, registered_at
         FROM dm_keys
         WHERE tid = $1`,
        [request.params.tid]
      );
      if (result.rows.length === 0) {
        return reply.status(404).send({ error: "No DM key for TID" });
      }
      return result.rows[0];
    }
  );

  // Send an encrypted DM. Body is a DM_SEND TribeMessage envelope.
  // The hub never sees plaintext — it stores the ciphertext as-is.
  server.post<{ Body: SubmitMessageRequest }>(
    "/v1/dm/send",
    async (request, reply) => {
      const message = request.body;
      if (message?.data?.type !== DM_SEND) {
        return reply
          .status(400)
          .send({ error: "Expected DM_SEND envelope" });
      }
      const validation = await verifyEnvelope(message);
      if (!validation.valid) {
        return reply.status(400).send({ error: validation.error });
      }

      const body = message.data.body as unknown as DmSendBody;
      const recipientTid =
        typeof body?.recipient_tid === "string"
          ? parseInt(body.recipient_tid, 10)
          : body?.recipient_tid;
      if (
        !recipientTid ||
        Number.isNaN(recipientTid) ||
        !body.ciphertext ||
        !body.nonce ||
        !body.sender_x25519
      ) {
        return reply.status(400).send({
          error:
            "recipient_tid, ciphertext, nonce, and sender_x25519 are required",
        });
      }
      const senderTid =
        typeof message.data.tid === "string"
          ? parseInt(message.data.tid, 10)
          : message.data.tid;
      if (senderTid === recipientTid) {
        return reply
          .status(400)
          .send({ error: "Cannot DM yourself" });
      }

      // Reject duplicate hashes for DMs.
      const dup = await db.query(
        `SELECT 1 FROM dm_messages WHERE hash = $1 LIMIT 1`,
        [message.hash]
      );
      if (dup.rowCount && dup.rowCount > 0) {
        return reply.status(409).send({ error: "Duplicate message hash" });
      }

      const conversationId = conversationIdFor(senderTid, recipientTid);
      const sentAt = new Date(message.data.timestamp * 1000);

      await db.query(
        `INSERT INTO dm_conversations (id, tid_a, tid_b, last_message_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE
           SET last_message_at = EXCLUDED.last_message_at`,
        [
          conversationId,
          Math.min(senderTid, recipientTid),
          Math.max(senderTid, recipientTid),
          sentAt,
        ]
      );

      await db.query(
        `INSERT INTO dm_messages
           (hash, conversation_id, sender_tid, recipient_tid,
            ciphertext, nonce, sender_x25519, timestamp, signature, signer)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          message.hash,
          conversationId,
          senderTid,
          recipientTid,
          body.ciphertext,
          body.nonce,
          body.sender_x25519,
          sentAt,
          message.signature,
          message.signer,
        ]
      );

      gossipDm({
        hash: message.hash,
        conversationId,
        senderTid: String(senderTid),
        recipientTid: String(recipientTid),
        ciphertext: body.ciphertext,
        nonce: body.nonce,
        senderX25519: body.sender_x25519,
        timestamp: sentAt.toISOString(),
        signature: message.signature,
        signer: message.signer,
      });

      return { hash: message.hash, conversation_id: conversationId };
    }
  );

  // List conversations for a TID, newest first.
  server.get<{ Params: { tid: string } }>(
    "/v1/dm/conversations/:tid",
    async (request) => {
      const tid = parseInt(request.params.tid, 10);
      const result = await db.query(
        `SELECT id,
                CASE WHEN tid_a = $1 THEN tid_b ELSE tid_a END AS peer_tid,
                last_message_at
         FROM dm_conversations
         WHERE tid_a = $1 OR tid_b = $1
         ORDER BY last_message_at DESC`,
        [tid]
      );
      return { conversations: result.rows };
    }
  );

  // List the encrypted messages in a conversation. The caller passes
  // their TID so we can ensure they are a participant before returning.
  server.get<{
    Params: { conversationId: string };
    Querystring: { tid?: string; limit?: string; before?: string };
  }>("/v1/dm/messages/:conversationId", async (request, reply) => {
    const tid = parseInt(request.query.tid || "", 10);
    if (!tid || Number.isNaN(tid)) {
      return reply
        .status(400)
        .send({ error: "tid query parameter is required" });
    }
    const limit = Math.min(
      parseInt(request.query.limit || "50", 10) || 50,
      200
    );

    const conv = await db.query(
      `SELECT tid_a, tid_b FROM dm_conversations WHERE id = $1`,
      [request.params.conversationId]
    );
    if (conv.rows.length === 0) {
      return { messages: [] };
    }
    if (conv.rows[0].tid_a !== tid && conv.rows[0].tid_b !== tid) {
      return reply
        .status(403)
        .send({ error: "Not a participant in this conversation" });
    }

    const before = request.query.before
      ? new Date(request.query.before)
      : null;
    const params: unknown[] = [request.params.conversationId];
    let beforeClause = "";
    if (before && !Number.isNaN(before.getTime())) {
      params.push(before);
      beforeClause = `AND timestamp < $${params.length}`;
    }
    params.push(limit);

    const messagesResult = await db.query(
      `SELECT hash, sender_tid, recipient_tid, ciphertext, nonce,
              sender_x25519, timestamp
       FROM dm_messages
       WHERE conversation_id = $1
         ${beforeClause}
       ORDER BY timestamp DESC
       LIMIT $${params.length}`,
      params
    );

    return { messages: messagesResult.rows.reverse() };
  });
}

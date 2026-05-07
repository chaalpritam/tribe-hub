import { FastifyInstance } from "fastify";
import { db } from "../../storage/db";
import { storeSignedEnvelope } from "../../storage/signed-envelopes";
import { verifyEnvelopeBaseline } from "../../validation/verifier";
import { SubmitMessageRequest } from "../../types";
import {
  gossipDm,
  gossipDmKey,
  gossipGroupCreate,
  gossipGroupMessage,
  gossipGroupStateOp,
} from "../../gossip/protocol";

import { MessageType } from "../../messages/types";

const {
  DM_KEY_REGISTER,
  DM_SEND,
  DM_GROUP_CREATE,
  DM_GROUP_SEND,
  DM_GROUP_LEAVE,
  DM_GROUP_ADD_MEMBER,
  DM_GROUP_REMOVE_MEMBER,
  DM_GROUP_DELETE,
  DM_READ,
} = MessageType;

const GROUP_ID_RE = /^[a-z0-9-]{1,64}$/;

interface DmKeyRegisterBody {
  x25519_pubkey: string;
}

interface DmGroupCreateBody {
  group_id: string;
  name: string;
  member_tids: string[]; // includes the creator
}

interface PerRecipientCipher {
  recipient_tid: string;
  ciphertext: string;
  nonce: string;
}

interface DmGroupSendBody {
  group_id: string;
  sender_x25519: string;
  ciphertexts: PerRecipientCipher[];
}

interface DmSendBody {
  recipient_tid: number | string;
  ciphertext: string;
  nonce: string;
  sender_x25519: string;
}

/**
 * DM submit/group/read routes share the same envelope baseline as the
 * tweet/reaction submit path: signature, dataB64 integrity (with JSON
 * override), timestamp window, app-key check. Per-route dedup happens
 * in the route via UNIQUE constraints on the target tables.
 *
 * After a baseline pass, persist the signed bytes so we can re-emit
 * them via gossip with full integrity (phase 3.4 for DMs).
 */
async function verifyAndPersistEnvelope(
  message: SubmitMessageRequest,
): Promise<{ valid: boolean; error?: string }> {
  const baseline = await verifyEnvelopeBaseline(message, "submit");
  if (!baseline.valid) return baseline;
  if (message.dataB64) {
    await storeSignedEnvelope(message.hash, message.dataB64);
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
      const validation = await verifyAndPersistEnvelope(message);
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
      const validation = await verifyAndPersistEnvelope(message);
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
        dataB64: message.dataB64,
      });

      return { hash: message.hash, conversation_id: conversationId };
    }
  );

  // List conversations for a TID, newest first.
  server.get<{ Params: { tid: string } }>(
    "/v1/dm/conversations/:tid",
    async (request) => {
      const tid = parseInt(request.params.tid, 10);
      // peer_tid: the OTHER side of the conversation (whichever of tid_a/tid_b
      // isn't the caller). peer_username + message_count are joined in so
      // clients don't need a second round-trip to render a conversation list.
      const result = await db.query(
        `SELECT
            c.id,
            CASE WHEN c.tid_a = $1 THEN c.tid_b ELSE c.tid_a END AS peer_tid,
            c.last_message_at,
            t.username AS peer_username,
            (SELECT COUNT(*)::int FROM dm_messages
             WHERE conversation_id = c.id) AS message_count,
            (SELECT COUNT(*)::int FROM dm_messages m
             LEFT JOIN dm_read_receipts r
               ON r.conversation_id = c.id AND r.tid = $1
             WHERE m.conversation_id = c.id
               AND m.sender_tid <> $1
               AND (r.last_read_at IS NULL OR m.timestamp > r.last_read_at)
            ) AS unread_count
         FROM dm_conversations c
         LEFT JOIN tids t
           ON t.tid = (CASE WHEN c.tid_a = $1 THEN c.tid_b ELSE c.tid_a END)
         WHERE c.tid_a = $1 OR c.tid_b = $1
         ORDER BY c.last_message_at DESC`,
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
    // node-pg returns BIGINT as a string by default — coerce before
    // comparing to the parseInt'd query param, otherwise "10" !== 10
    // and every participant gets a 403.
    if (
      Number(conv.rows[0].tid_a) !== tid &&
      Number(conv.rows[0].tid_b) !== tid
    ) {
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

  // ── Group DMs ────────────────────────────────────────────────────

  // Create a group + add the initial member set.
  server.post<{ Body: SubmitMessageRequest }>(
    "/v1/dm/groups/create",
    async (request, reply) => {
      const message = request.body;
      if (message?.data?.type !== DM_GROUP_CREATE) {
        return reply
          .status(400)
          .send({ error: "Expected DM_GROUP_CREATE envelope" });
      }
      const validation = await verifyAndPersistEnvelope(message);
      if (!validation.valid) {
        return reply.status(400).send({ error: validation.error });
      }

      const body = message.data.body as unknown as DmGroupCreateBody;
      if (
        !body?.group_id ||
        !body?.name ||
        !Array.isArray(body.member_tids) ||
        body.member_tids.length < 2
      ) {
        return reply.status(400).send({
          error: "group_id, name, and >=2 member_tids required",
        });
      }
      if (!GROUP_ID_RE.test(body.group_id)) {
        return reply.status(400).send({
          error: "group_id must match /^[a-z0-9-]{1,64}$/",
        });
      }

      await db.query(
        `INSERT INTO dm_groups (id, name, creator_tid, hash, signature, signer)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          body.group_id,
          body.name,
          message.data.tid,
          message.hash,
          message.signature,
          message.signer,
        ]
      );

      // Members are appended; re-creating the same group keeps any
      // existing membership intact (idempotent).
      const memberRows = body.member_tids.map((tid) => `(${
        body.group_id ? `'${body.group_id.replace(/'/g, "''")}'` : "NULL"
      }, ${parseInt(String(tid), 10)})`);
      if (memberRows.length > 0) {
        await db.query(
          `INSERT INTO dm_group_members (group_id, tid)
           VALUES ${memberRows.join(", ")}
           ON CONFLICT (group_id, tid) DO NOTHING`
        );
      }

      gossipGroupCreate({
        hash: message.hash,
        groupId: body.group_id,
        name: body.name,
        creatorTid: String(message.data.tid),
        memberTids: body.member_tids.map((m) => String(m)),
        signature: message.signature,
        signer: message.signer,
        dataB64: message.dataB64,
      });

      return { group_id: body.group_id };
    }
  );

  // Send a group message — sender includes per-recipient ciphertext.
  server.post<{ Body: SubmitMessageRequest }>(
    "/v1/dm/groups/send",
    async (request, reply) => {
      const message = request.body;
      if (message?.data?.type !== DM_GROUP_SEND) {
        return reply
          .status(400)
          .send({ error: "Expected DM_GROUP_SEND envelope" });
      }
      const validation = await verifyAndPersistEnvelope(message);
      if (!validation.valid) {
        return reply.status(400).send({ error: validation.error });
      }

      const body = message.data.body as unknown as DmGroupSendBody;
      if (
        !body?.group_id ||
        !body?.sender_x25519 ||
        !Array.isArray(body.ciphertexts) ||
        body.ciphertexts.length === 0
      ) {
        return reply.status(400).send({
          error: "group_id, sender_x25519, ciphertexts required",
        });
      }

      // Sender must be a member of the group.
      const memberCheck = await db.query(
        `SELECT 1 FROM dm_group_members WHERE group_id = $1 AND tid = $2`,
        [body.group_id, message.data.tid]
      );
      if (memberCheck.rows.length === 0) {
        return reply
          .status(403)
          .send({ error: "Sender is not a member of this group" });
      }

      const sentAt = new Date(message.data.timestamp * 1000);

      const dup = await db.query(
        `SELECT 1 FROM dm_group_messages WHERE hash = $1`,
        [message.hash]
      );
      if (dup.rowCount && dup.rowCount > 0) {
        return reply.status(409).send({ error: "Duplicate message hash" });
      }

      await db.query(
        `INSERT INTO dm_group_messages
           (hash, group_id, sender_tid, sender_x25519, timestamp, signature, signer)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          message.hash,
          body.group_id,
          message.data.tid,
          body.sender_x25519,
          sentAt,
          message.signature,
          message.signer,
        ]
      );

      // Insert one row per recipient ciphertext.
      const values: string[] = [];
      const params: unknown[] = [];
      for (const c of body.ciphertexts) {
        params.push(message.hash, c.recipient_tid, c.ciphertext, c.nonce);
        const i = params.length;
        values.push(`($${i - 3}, $${i - 2}, $${i - 1}, $${i})`);
      }
      await db.query(
        `INSERT INTO dm_group_ciphertexts
           (envelope_hash, recipient_tid, ciphertext, nonce)
         VALUES ${values.join(", ")}
         ON CONFLICT (envelope_hash, recipient_tid) DO NOTHING`,
        params
      );

      gossipGroupMessage({
        hash: message.hash,
        groupId: body.group_id,
        senderTid: String(message.data.tid),
        senderX25519: body.sender_x25519,
        timestamp: sentAt.toISOString(),
        ciphertexts: body.ciphertexts.map((c) => ({
          recipientTid: String(c.recipient_tid),
          ciphertext: c.ciphertext,
          nonce: c.nonce,
        })),
        signature: message.signature,
        signer: message.signer,
        dataB64: message.dataB64,
      });

      return { hash: message.hash, group_id: body.group_id };
    }
  );

  // List groups a TID belongs to. last_message_at + unread_count are
  // joined in so the inbox can sort by recency and show a badge
  // without a second round-trip per group. unread_count counts group
  // messages newer than this tid's last_read_at (read receipts are
  // stored in dm_read_receipts keyed by conversation_id 'group:<id>').
  server.get<{ Params: { tid: string } }>(
    "/v1/dm/groups/member/:tid",
    async (request) => {
      const tid = parseInt(request.params.tid, 10);
      const result = await db.query(
        `SELECT g.id, g.name, g.creator_tid, g.created_at,
                m.joined_at,
                (SELECT COUNT(*) FROM dm_group_members
                   WHERE group_id = g.id) AS member_count,
                (SELECT MAX(timestamp) FROM dm_group_messages
                   WHERE group_id = g.id) AS last_message_at,
                (SELECT COUNT(*)::int FROM dm_group_messages gm
                 LEFT JOIN dm_read_receipts r
                   ON r.conversation_id = 'group:' || g.id AND r.tid = $1
                 WHERE gm.group_id = g.id
                   AND gm.sender_tid <> $1
                   AND (r.last_read_at IS NULL OR gm.timestamp > r.last_read_at)
                ) AS unread_count
         FROM dm_group_members m
         JOIN dm_groups g ON g.id = m.group_id
         WHERE m.tid = $1
         ORDER BY last_message_at DESC NULLS LAST, g.created_at DESC`,
        [tid]
      );
      return { groups: result.rows };
    }
  );

  // Remove the caller from a group's member list. The creator can't
  // leave their own group while there's no ownership-transfer flow —
  // they'd have to delete the group entirely, which lives in a
  // future phase. Idempotent: leaving a group you're not in is a 200.
  server.post<{ Body: SubmitMessageRequest }>(
    "/v1/dm/groups/leave",
    async (request, reply) => {
      const message = request.body;
      if (message?.data?.type !== DM_GROUP_LEAVE) {
        return reply
          .status(400)
          .send({ error: "Expected DM_GROUP_LEAVE envelope" });
      }
      const validation = await verifyAndPersistEnvelope(message);
      if (!validation.valid) {
        return reply.status(400).send({ error: validation.error });
      }

      const body = message.data.body as unknown as { group_id?: string };
      if (!body?.group_id || !GROUP_ID_RE.test(body.group_id)) {
        return reply.status(400).send({ error: "group_id required" });
      }

      const group = await db.query(
        `SELECT creator_tid FROM dm_groups WHERE id = $1`,
        [body.group_id]
      );
      if (group.rows.length === 0) {
        return reply.status(404).send({ error: "Group not found" });
      }
      if (Number(group.rows[0].creator_tid) === Number(message.data.tid)) {
        return reply.status(403).send({
          error: "Creator cannot leave their own group",
        });
      }

      await db.query(
        `DELETE FROM dm_group_members WHERE group_id = $1 AND tid = $2`,
        [body.group_id, message.data.tid]
      );

      gossipGroupStateOp({
        hash: message.hash,
        type: DM_GROUP_LEAVE,
        groupId: body.group_id,
        signerTid: String(message.data.tid),
        signature: message.signature,
        signer: message.signer,
        dataB64: message.dataB64,
      });

      return { ok: true };
    }
  );

  // Add a member to a group. Creator-only until a richer permission
  // model exists (no admin role, no self-invite). Idempotent thanks
  // to the (group_id, tid) primary key.
  server.post<{ Body: SubmitMessageRequest }>(
    "/v1/dm/groups/add-member",
    async (request, reply) => {
      const message = request.body;
      if (message?.data?.type !== DM_GROUP_ADD_MEMBER) {
        return reply
          .status(400)
          .send({ error: "Expected DM_GROUP_ADD_MEMBER envelope" });
      }
      const validation = await verifyAndPersistEnvelope(message);
      if (!validation.valid) {
        return reply.status(400).send({ error: validation.error });
      }

      const body = message.data.body as unknown as {
        group_id?: string;
        tid?: number | string;
      };
      const newTid =
        typeof body?.tid === "string" ? parseInt(body.tid, 10) : body?.tid;
      if (
        !body?.group_id ||
        !GROUP_ID_RE.test(body.group_id) ||
        !newTid ||
        Number.isNaN(newTid)
      ) {
        return reply
          .status(400)
          .send({ error: "group_id and numeric tid required" });
      }

      const group = await db.query(
        `SELECT creator_tid FROM dm_groups WHERE id = $1`,
        [body.group_id]
      );
      if (group.rows.length === 0) {
        return reply.status(404).send({ error: "Group not found" });
      }
      if (Number(group.rows[0].creator_tid) !== Number(message.data.tid)) {
        return reply
          .status(403)
          .send({ error: "Only the creator can add members" });
      }

      await db.query(
        `INSERT INTO dm_group_members (group_id, tid)
         VALUES ($1, $2)
         ON CONFLICT (group_id, tid) DO NOTHING`,
        [body.group_id, newTid]
      );

      gossipGroupStateOp({
        hash: message.hash,
        type: DM_GROUP_ADD_MEMBER,
        groupId: body.group_id,
        signerTid: String(message.data.tid),
        targetTid: String(newTid),
        signature: message.signature,
        signer: message.signer,
        dataB64: message.dataB64,
      });

      return { ok: true };
    }
  );

  // Remove a member from a group. Creator-only; the creator can't
  // remove themselves (use the future delete-group flow instead).
  server.post<{ Body: SubmitMessageRequest }>(
    "/v1/dm/groups/remove-member",
    async (request, reply) => {
      const message = request.body;
      if (message?.data?.type !== DM_GROUP_REMOVE_MEMBER) {
        return reply
          .status(400)
          .send({ error: "Expected DM_GROUP_REMOVE_MEMBER envelope" });
      }
      const validation = await verifyAndPersistEnvelope(message);
      if (!validation.valid) {
        return reply.status(400).send({ error: validation.error });
      }

      const body = message.data.body as unknown as {
        group_id?: string;
        tid?: number | string;
      };
      const targetTid =
        typeof body?.tid === "string" ? parseInt(body.tid, 10) : body?.tid;
      if (
        !body?.group_id ||
        !GROUP_ID_RE.test(body.group_id) ||
        !targetTid ||
        Number.isNaN(targetTid)
      ) {
        return reply
          .status(400)
          .send({ error: "group_id and numeric tid required" });
      }

      const group = await db.query(
        `SELECT creator_tid FROM dm_groups WHERE id = $1`,
        [body.group_id]
      );
      if (group.rows.length === 0) {
        return reply.status(404).send({ error: "Group not found" });
      }
      if (Number(group.rows[0].creator_tid) !== Number(message.data.tid)) {
        return reply
          .status(403)
          .send({ error: "Only the creator can remove members" });
      }
      if (Number(group.rows[0].creator_tid) === targetTid) {
        return reply
          .status(403)
          .send({ error: "Creator cannot be removed" });
      }

      await db.query(
        `DELETE FROM dm_group_members WHERE group_id = $1 AND tid = $2`,
        [body.group_id, targetTid]
      );

      gossipGroupStateOp({
        hash: message.hash,
        type: DM_GROUP_REMOVE_MEMBER,
        groupId: body.group_id,
        signerTid: String(message.data.tid),
        targetTid: String(targetTid),
        signature: message.signature,
        signer: message.signer,
        dataB64: message.dataB64,
      });

      return { ok: true };
    }
  );

  // Delete a group entirely. Creator-only. dm_group_members and
  // dm_group_messages cascade (and dm_group_ciphertexts cascades off
  // dm_group_messages), so a single DELETE on dm_groups is enough.
  server.post<{ Body: SubmitMessageRequest }>(
    "/v1/dm/groups/delete",
    async (request, reply) => {
      const message = request.body;
      if (message?.data?.type !== DM_GROUP_DELETE) {
        return reply
          .status(400)
          .send({ error: "Expected DM_GROUP_DELETE envelope" });
      }
      const validation = await verifyAndPersistEnvelope(message);
      if (!validation.valid) {
        return reply.status(400).send({ error: validation.error });
      }

      const body = message.data.body as unknown as { group_id?: string };
      if (!body?.group_id || !GROUP_ID_RE.test(body.group_id)) {
        return reply.status(400).send({ error: "group_id required" });
      }

      const group = await db.query(
        `SELECT creator_tid FROM dm_groups WHERE id = $1`,
        [body.group_id]
      );
      if (group.rows.length === 0) {
        return reply.status(404).send({ error: "Group not found" });
      }
      if (Number(group.rows[0].creator_tid) !== Number(message.data.tid)) {
        return reply
          .status(403)
          .send({ error: "Only the creator can delete the group" });
      }

      await db.query(`DELETE FROM dm_groups WHERE id = $1`, [body.group_id]);

      gossipGroupStateOp({
        hash: message.hash,
        type: DM_GROUP_DELETE,
        groupId: body.group_id,
        signerTid: String(message.data.tid),
        signature: message.signature,
        signer: message.signer,
        dataB64: message.dataB64,
      });

      return { ok: true };
    }
  );

  // Get a single group's metadata + members.
  server.get<{ Params: { groupId: string } }>(
    "/v1/dm/groups/:groupId",
    async (request, reply) => {
      const groupResult = await db.query(
        `SELECT id, name, creator_tid, created_at FROM dm_groups WHERE id = $1`,
        [request.params.groupId]
      );
      if (groupResult.rows.length === 0) {
        return reply.status(404).send({ error: "Group not found" });
      }
      const memberResult = await db.query(
        `SELECT tid, joined_at FROM dm_group_members
         WHERE group_id = $1
         ORDER BY joined_at`,
        [request.params.groupId]
      );
      return { ...groupResult.rows[0], members: memberResult.rows };
    }
  );

  // Fetch a recipient's per-message ciphertext for a group.
  server.get<{
    Params: { groupId: string };
    Querystring: { tid?: string; limit?: string };
  }>("/v1/dm/groups/:groupId/messages", async (request, reply) => {
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

    const memberCheck = await db.query(
      `SELECT 1 FROM dm_group_members WHERE group_id = $1 AND tid = $2`,
      [request.params.groupId, tid]
    );
    if (memberCheck.rows.length === 0) {
      return reply
        .status(403)
        .send({ error: "Not a member of this group" });
    }

    const result = await db.query(
      `SELECT m.hash, m.sender_tid, m.sender_x25519, m.timestamp,
              c.ciphertext, c.nonce
       FROM dm_group_messages m
       JOIN dm_group_ciphertexts c
         ON c.envelope_hash = m.hash AND c.recipient_tid = $2
       WHERE m.group_id = $1
       ORDER BY m.timestamp DESC
       LIMIT $3`,
      [request.params.groupId, tid, limit]
    );
    return { messages: result.rows.reverse() };
  });

  // ── Read receipts ───────────────────────────────────────────────

  // Mark progress through a conversation.
  server.post<{ Body: SubmitMessageRequest }>(
    "/v1/dm/read",
    async (request, reply) => {
      const message = request.body;
      if (message?.data?.type !== DM_READ) {
        return reply
          .status(400)
          .send({ error: "Expected DM_READ envelope" });
      }
      const validation = await verifyAndPersistEnvelope(message);
      if (!validation.valid) {
        return reply.status(400).send({ error: validation.error });
      }

      const body = message.data.body as unknown as {
        conversation_id?: string;
        last_read_hash?: string;
      };
      if (!body?.conversation_id || !body?.last_read_hash) {
        return reply.status(400).send({
          error: "conversation_id and last_read_hash required",
        });
      }
      const ts = new Date(message.data.timestamp * 1000);
      await db.query(
        `INSERT INTO dm_read_receipts
           (tid, conversation_id, last_read_hash, last_read_at,
            signature, signer)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (tid, conversation_id) DO UPDATE
           SET last_read_hash = EXCLUDED.last_read_hash,
               last_read_at   = EXCLUDED.last_read_at,
               signature      = EXCLUDED.signature,
               signer         = EXCLUDED.signer
           WHERE dm_read_receipts.last_read_at < EXCLUDED.last_read_at`,
        [
          message.data.tid,
          body.conversation_id,
          body.last_read_hash,
          ts,
          message.signature,
          message.signer,
        ]
      );
      return { ok: true };
    }
  );

  // All read receipts in a conversation (so participants can render
  // each other's last-read marker).
  server.get<{ Params: { conversationId: string } }>(
    "/v1/dm/conversations/:conversationId/reads",
    async (request) => {
      const result = await db.query(
        `SELECT tid, last_read_hash, last_read_at
         FROM dm_read_receipts
         WHERE conversation_id = $1
         ORDER BY last_read_at DESC`,
        [request.params.conversationId]
      );
      return { reads: result.rows };
    }
  );
}

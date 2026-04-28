import { tribe } from "./proto/message";
import { SubmitMessageRequest } from "../types";

/**
 * Decode protobuf-encoded MessageData bytes into the snake_case wire
 * shape that the hub's routes (submit.ts, dms.ts, etc.) consume — i.e.
 * the same shape tribe-app sends as JSON. Lets validateMessage /
 * verifyEnvelopeBaseline override `message.data` with authentic decoded
 * values regardless of whether the SDK signed via JSON or protobuf.
 *
 * Returns null when the bytes don't decode cleanly.
 */
export function decodeProtoToWire(
  bytes: Uint8Array,
): SubmitMessageRequest["data"] | null {
  let proto: tribe.MessageData;
  try {
    proto = tribe.MessageData.decode(bytes);
  } catch {
    return null;
  }

  const body = decodeBody(proto);
  if (body === null) return null;

  return {
    type: proto.type as number,
    tid: proto.tid?.toString() ?? "0",
    timestamp: proto.timestamp,
    network: proto.network as number,
    body,
  };
}

function decodeBody(proto: tribe.MessageData): Record<string, unknown> | null {
  if (proto.tweetAdd) {
    return {
      text: proto.tweetAdd.text,
      mentions: (proto.tweetAdd.mentions ?? []).map((m) => String(m)),
      embeds: proto.tweetAdd.embeds ?? [],
      parent_hash: bufferToB64(proto.tweetAdd.parentHash),
      channel_id: proto.tweetAdd.channelId ?? "",
    };
  }
  if (proto.tweetRemove) {
    return {
      target_hash: bufferToB64(proto.tweetRemove.targetHash) ?? "",
    };
  }
  if (proto.reaction) {
    return {
      type: proto.reaction.type as number,
      target_hash: bufferToB64(proto.reaction.targetHash) ?? "",
    };
  }
  if (proto.userData) {
    return {
      field: proto.userData.field,
      value: proto.userData.value,
    };
  }
  if (proto.bookmark) {
    return {
      target_hash: proto.bookmark.targetHash,
    };
  }
  if (proto.channelAdd) {
    return {
      channel_id: proto.channelAdd.channelId,
      name: proto.channelAdd.name,
      description: proto.channelAdd.description,
      kind: proto.channelAdd.kind as number,
      latitude: proto.channelAdd.latitude,
      longitude: proto.channelAdd.longitude,
    };
  }
  if (proto.channelMembership) {
    return {
      channel_id: proto.channelMembership.channelId,
    };
  }
  if (proto.pollAdd) {
    return {
      poll_id: proto.pollAdd.pollId,
      question: proto.pollAdd.question,
      options: proto.pollAdd.options ?? [],
      expires_at: proto.pollAdd.expiresAt,
      channel_id: proto.pollAdd.channelId,
    };
  }
  if (proto.pollVote) {
    return {
      poll_id: proto.pollVote.pollId,
      option_index: proto.pollVote.optionIndex,
    };
  }
  if (proto.eventAdd) {
    return {
      event_id: proto.eventAdd.eventId,
      title: proto.eventAdd.title,
      description: proto.eventAdd.description,
      starts_at: proto.eventAdd.startsAt,
      ends_at: proto.eventAdd.endsAt,
      location_text: proto.eventAdd.locationText,
      latitude: proto.eventAdd.latitude,
      longitude: proto.eventAdd.longitude,
      channel_id: proto.eventAdd.channelId,
      image_url: proto.eventAdd.imageUrl,
    };
  }
  if (proto.eventRsvp) {
    return {
      event_id: proto.eventRsvp.eventId,
      status: proto.eventRsvp.status,
    };
  }
  if (proto.taskAdd) {
    return {
      task_id: proto.taskAdd.taskId,
      title: proto.taskAdd.title,
      description: proto.taskAdd.description,
      reward_text: proto.taskAdd.rewardText,
      channel_id: proto.taskAdd.channelId,
    };
  }
  if (proto.taskTransition) {
    return {
      task_id: proto.taskTransition.taskId,
    };
  }
  if (proto.crowdfundAdd) {
    return {
      crowdfund_id: proto.crowdfundAdd.crowdfundId,
      title: proto.crowdfundAdd.title,
      description: proto.crowdfundAdd.description,
      goal_amount: proto.crowdfundAdd.goalAmount,
      currency: proto.crowdfundAdd.currency,
      deadline_at: proto.crowdfundAdd.deadlineAt,
      image_url: proto.crowdfundAdd.imageUrl,
      channel_id: proto.crowdfundAdd.channelId,
    };
  }
  if (proto.crowdfundPledge) {
    return {
      crowdfund_id: proto.crowdfundPledge.crowdfundId,
      amount: proto.crowdfundPledge.amount,
      currency: proto.crowdfundPledge.currency,
    };
  }
  if (proto.tipAdd) {
    return {
      recipient_tid: proto.tipAdd.recipientTid?.toString() ?? "0",
      amount: proto.tipAdd.amount,
      currency: proto.tipAdd.currency,
      target_hash: proto.tipAdd.targetHash,
      tx_signature: proto.tipAdd.txSignature,
    };
  }
  if (proto.dmKeyRegister) {
    return {
      x25519_pubkey: proto.dmKeyRegister.x25519Pubkey,
    };
  }
  if (proto.dmSend) {
    return {
      recipient_tid: proto.dmSend.recipientTid?.toString() ?? "0",
      ciphertext: proto.dmSend.ciphertext,
      nonce: proto.dmSend.nonce,
      sender_x25519: proto.dmSend.senderX25519,
    };
  }
  if (proto.dmGroupCreate) {
    return {
      group_id: proto.dmGroupCreate.groupId,
      name: proto.dmGroupCreate.name,
      member_tids: (proto.dmGroupCreate.memberTids ?? []).map((m) => String(m)),
    };
  }
  if (proto.dmGroupSend) {
    return {
      group_id: proto.dmGroupSend.groupId,
      sender_x25519: proto.dmGroupSend.senderX25519,
      ciphertexts: (proto.dmGroupSend.ciphertexts ?? []).map((c) => ({
        recipient_tid: c.recipientTid?.toString() ?? "0",
        ciphertext: c.ciphertext,
        nonce: c.nonce,
      })),
    };
  }
  if (proto.dmRead) {
    return {
      conversation_id: proto.dmRead.conversationId,
      last_read_hash: proto.dmRead.lastReadHash,
    };
  }
  return null;
}

function bufferToB64(buf: Uint8Array | null | undefined): string | null {
  if (!buf || buf.length === 0) return null;
  return Buffer.from(buf).toString("base64");
}

export interface SubmitMessageRequest {
  protocolVersion: number;
  data: {
    type: number;
    tid: string; // bigint as string
    timestamp: number;
    network: number;
    body: Record<string, unknown>;
  };
  /**
   * Base64 of the exact bytes that were hashed by the client. When
   * present, the hub recomputes blake3(dataB64) and rejects mismatches
   * — this defends against a relay tampering with the hash/sig pair.
   * Phase 3.2 keeps this optional during SDK migration; phase 3.3 will
   * make it required and project routes will decode from these bytes
   * rather than trusting `data` (which closes the remaining client-side
   * tamper gap).
   */
  dataB64?: string;
  hash: string;      // base64
  signature: string;  // base64
  signer: string;     // base64
}

export interface MessageRow {
  hash: string;
  tid: string;
  type: number;
  text: string | null;
  parent_hash: string | null;
  channel_id: string | null;
  mentions: string[];
  embeds: string[];
  timestamp: Date;
  signature: string;
  signer: string;
  received_from: string | null;
  created_at: Date;
}

export interface GossipMessage {
  hash: string;
  tid: string;
  type: number;
  text: string | null;
  parentHash: string | null;
  channelId: string | null;
  mentions: string[];
  embeds: string[];
  timestamp: string;
  signature: string;
  signer: string;
  /**
   * Base64 of the bytes the signer hashed. Optional during the rollout:
   * pre-3.4 peers don't send it, in which case the receiver falls back
   * to the projected fields with no integrity check. Post-3.4 peers
   * include it so receivers can recompute blake3 and reject tampering.
   */
  dataB64?: string;
}

export interface GossipEnvelope {
  type:
    | "hello"
    | "have"
    | "want"
    | "messages"
    | "dm_messages"
    | "dm_have"
    | "dm_want"
    | "dm_key"
    | "group_create"
    | "group_create_have"
    | "group_create_want"
    | "group_msg"
    | "group_msg_have"
    | "group_msg_want"
    | "ping"
    | "pong";
  hubId: string;
  payload: unknown;
}

/** DM ciphertext as gossiped between hubs. Mirrors dm_messages row. */
export interface GossipDm {
  hash: string;
  conversationId: string;
  senderTid: string;
  recipientTid: string;
  ciphertext: string;
  nonce: string;
  senderX25519: string;
  timestamp: string;
  signature: string;
  signer: string;
  /**
   * Base64 of the bytes the signer hashed. Same role as on GossipMessage:
   * receiver recomputes blake3 and rejects relays that tampered with the
   * projection. Optional during the rollout — pre-3.4 peers omit it.
   */
  dataB64?: string;
}

export interface DmMessagesPayload {
  messages: GossipDm[];
}

export interface DmKeyPayload {
  tid: string;
  x25519Pubkey: string;
}

/** Group creation envelope as gossiped between hubs. Carries the
 * member list so the receiver can populate dm_group_members in the
 * same transaction-shaped sequence the originating hub did. */
export interface GossipGroupCreate {
  hash: string;
  groupId: string;
  name: string;
  creatorTid: string;
  memberTids: string[];
  signature: string;
  signer: string;
  /** Same role as on GossipMessage / GossipDm. Optional during rollout. */
  dataB64?: string;
}

/** Per-recipient ciphertext slice carried inside a GossipGroupMsg. */
export interface GossipGroupCipher {
  recipientTid: string;
  ciphertext: string;
  nonce: string;
}

/** Group message envelope + every recipient's ciphertext. The hub
 * never holds plaintext — each ciphertext is encrypted to one
 * recipient's x25519 pubkey. */
export interface GossipGroupMsg {
  hash: string;
  groupId: string;
  senderTid: string;
  senderX25519: string;
  timestamp: string;
  ciphertexts: GossipGroupCipher[];
  signature: string;
  signer: string;
  dataB64?: string;
}

export interface GroupCreatePayload {
  groups: GossipGroupCreate[];
}

export interface GroupMsgPayload {
  messages: GossipGroupMsg[];
}

export interface HelloPayload {
  version: number;
}

export interface HavePayload {
  hashes: string[];
  since: string; // ISO date
}

export interface WantPayload {
  hashes: string[];
}

export interface MessagesPayload {
  messages: GossipMessage[];
}

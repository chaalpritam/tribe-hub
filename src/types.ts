export interface SubmitMessageRequest {
  protocolVersion: number;
  data: {
    type: number;
    tid: string; // bigint as string
    timestamp: number;
    network: number;
    body: Record<string, unknown>;
  };
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
}

export interface DmMessagesPayload {
  messages: GossipDm[];
}

export interface DmKeyPayload {
  tid: string;
  x25519Pubkey: string;
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

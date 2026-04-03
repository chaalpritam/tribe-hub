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
  type: "hello" | "have" | "want" | "messages" | "ping" | "pong";
  hubId: string;
  payload: unknown;
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

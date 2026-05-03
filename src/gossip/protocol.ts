import WebSocket from "ws";
import { config } from "../config";
import {
  gossipMessagesStoredTotal,
  gossipPeersConnected,
  recordGossipDroppedFrame,
  recordGossipFrame,
} from "../metrics";
import {
  GossipEnvelope,
  HelloPayload,
  HavePayload,
  WantPayload,
  MessagesPayload,
  DmMessagesPayload,
  DmKeyPayload,
  GossipMessage,
  GossipDm,
} from "../types";
import {
  getMessageHashes,
  getMessageHashTimestamp,
  getMessagesByHashes,
  findMissingHashes,
  storeGossipMessage,
  storeGossipDm,
  storeGossipDmKey,
  getDmHashes,
  getDmHashTimestamp,
  getDmsByHashes,
  findMissingDmHashes,
  getLastSyncTime,
  updateSyncState,
  incrementPeerMessageCount,
} from "./sync";

// Connected peers: hubId -> WebSocket
const connectedPeers = new Map<string, WebSocket>();

/**
 * Token-bucket frame rate limiter per WebSocket connection. Refills at
 * config.gossipFramesPerSecPerPeer tokens/sec up to config.gossipFrameBurst.
 * Used to defend against frame floods from a misbehaving peer before any
 * expensive work (signature verify, RPC fetch) runs.
 */
class FrameBucket {
  private tokens: number;
  private lastRefillMs: number;
  constructor(private capacity: number, private refillPerSec: number) {
    this.tokens = capacity;
    this.lastRefillMs = Date.now();
  }
  tryConsume(): boolean {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefillMs) / 1000;
    if (elapsedSec > 0) {
      this.tokens = Math.min(
        this.capacity,
        this.tokens + elapsedSec * this.refillPerSec,
      );
      this.lastRefillMs = now;
    }
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
}

/**
 * Get the map of connected peers (for use by other modules).
 */
export function getPeers(): Map<string, WebSocket> {
  return connectedPeers;
}

/**
 * Get the count of connected peers.
 */
export function getPeerCount(): number {
  return connectedPeers.size;
}

/**
 * Send a gossip envelope to a WebSocket.
 */
function send(ws: WebSocket, envelope: GossipEnvelope): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(envelope));
    recordGossipFrame("out", envelope.type);
  }
}

/**
 * Broadcast a "have" message with recent hashes to all connected peers.
 * Called periodically by the peer manager.
 */
export async function broadcastHave(): Promise<void> {
  if (connectedPeers.size === 0) return;

  // Get hashes from the last gossip interval window
  const since = new Date(Date.now() - config.gossipIntervalMs * 2);
  const hashes = await getMessageHashes(since, config.maxSyncBatchSize);
  if (hashes.length === 0) return;

  const envelope: GossipEnvelope = {
    type: "have",
    hubId: config.hubId,
    payload: { hashes, since: since.toISOString() } as HavePayload,
  };

  for (const [, ws] of connectedPeers) {
    send(ws, envelope);
  }
}

/**
 * Send a wider-window "have" frame to one peer (or every connected
 * peer if peerHubId is null) covering everything since `since`. This
 * is what `tribe sync --peer …` triggers — the standard gossip tick
 * only covers the last ~2 intervals so a freshly-added hub would
 * otherwise have to wait for messages to organically replay or for
 * the next "hello" handshake.
 *
 * Returns the list of peer hub-ids we actually sent to, so the API
 * can echo it back in the trigger response (helpful for the CLI to
 * say "blasted to hub-x, hub-y" rather than guess).
 */
export async function broadcastHaveSince(
  peerHubId: string | null,
  since: Date
): Promise<string[]> {
  if (connectedPeers.size === 0) return [];

  const targets: Array<[string, WebSocket]> = peerHubId
    ? connectedPeers.has(peerHubId)
      ? [[peerHubId, connectedPeers.get(peerHubId)!]]
      : []
    : Array.from(connectedPeers.entries());

  if (targets.length === 0) return [];

  // Walk forward from `since` in batches of MAX_SYNC_BATCH_SIZE so a
  // 30-day catch-up doesn't get truncated to the first 100 hashes.
  const sent: string[] = [];
  for (const [hubId, ws] of targets) {
    let cursor = since;
    let total = 0;
    // Hard cap on iterations to avoid pathological loops; 100 batches *
    // 100 batch size = 10k message hashes per peer per trigger.
    for (let i = 0; i < 100; i++) {
      const hashes = await getMessageHashes(cursor, config.maxSyncBatchSize);
      if (hashes.length === 0) break;
      send(ws, {
        type: "have",
        hubId: config.hubId,
        payload: { hashes, since: cursor.toISOString() } as HavePayload,
      });
      total += hashes.length;
      if (hashes.length < config.maxSyncBatchSize) break;
      // Bump cursor by 1ms; the gossip "have" handler dedupes via
      // findMissingHashes so the small window overlap is harmless.
      cursor = new Date(
        Date.now() - 1, // sentinel — overwritten below by the real ts
      );
      // Re-resolve cursor from the timestamp of the last message we
      // sent so the next batch starts strictly after it.
      const tsResult = await getMessageHashTimestamp(
        hashes[hashes.length - 1]
      );
      cursor = tsResult ? new Date(tsResult.getTime() + 1) : new Date();
    }

    // Mirror for DMs.
    let dmCursor = since;
    for (let i = 0; i < 100; i++) {
      const dmHashes = await getDmHashes(dmCursor, config.maxSyncBatchSize);
      if (dmHashes.length === 0) break;
      send(ws, {
        type: "dm_have",
        hubId: config.hubId,
        payload: { hashes: dmHashes, since: dmCursor.toISOString() } as HavePayload,
      });
      total += dmHashes.length;
      if (dmHashes.length < config.maxSyncBatchSize) break;
      const dmTs = await getDmHashTimestamp(dmHashes[dmHashes.length - 1]);
      dmCursor = dmTs ? new Date(dmTs.getTime() + 1) : new Date();
    }

    if (total > 0) sent.push(hubId);
  }
  return sent;
}

/**
 * Gossip a single new message to all connected peers.
 * Called when a message is submitted directly to this hub (not via gossip).
 */
export function gossipMessage(msg: GossipMessage): void {
  if (connectedPeers.size === 0) return;

  const envelope: GossipEnvelope = {
    type: "messages",
    hubId: config.hubId,
    payload: { messages: [msg] } as MessagesPayload,
  };

  for (const [, ws] of connectedPeers) {
    send(ws, envelope);
  }
}

/**
 * Gossip a freshly-received encrypted DM to peers. Push-only — peers
 * that miss this gossip won't catch up, but the recipient can still
 * read it from the originating hub.
 */
export function gossipDm(msg: GossipDm): void {
  if (connectedPeers.size === 0) return;

  const envelope: GossipEnvelope = {
    type: "dm_messages",
    hubId: config.hubId,
    payload: { messages: [msg] } as DmMessagesPayload,
  };

  for (const [, ws] of connectedPeers) {
    send(ws, envelope);
  }
}

/**
 * Gossip a DM key registration to peers so cross-hub recipient lookup
 * works without round-tripping back to the originating hub.
 */
export function gossipDmKey(tid: string, x25519Pubkey: string): void {
  if (connectedPeers.size === 0) return;

  const envelope: GossipEnvelope = {
    type: "dm_key",
    hubId: config.hubId,
    payload: { tid, x25519Pubkey } as DmKeyPayload,
  };

  for (const [, ws] of connectedPeers) {
    send(ws, envelope);
  }
}

/**
 * Handle an incoming WebSocket connection (from a peer hub or via connectToPeer).
 */
export function handlePeerConnection(ws: WebSocket, isOutgoing: boolean): void {
  let peerHubId: string | null = null;
  const bucket = new FrameBucket(
    config.gossipFrameBurst,
    config.gossipFramesPerSecPerPeer,
  );

  // If we initiated the connection, send hello first
  if (isOutgoing) {
    send(ws, {
      type: "hello",
      hubId: config.hubId,
      payload: { version: 1 } as HelloPayload,
    });
  }

  ws.on("message", async (data: WebSocket.Data) => {
    // Size guard before JSON.parse — keeps a peer from forcing a multi-MB
    // parse attempt by sending a single huge frame.
    const frameLen =
      typeof data === "string"
        ? Buffer.byteLength(data)
        : data instanceof ArrayBuffer
          ? data.byteLength
          : Array.isArray(data)
            ? data.reduce((n, b) => n + b.length, 0)
            : (data as Buffer).length;
    if (frameLen > config.gossipMaxFrameBytes) {
      recordGossipDroppedFrame("oversized");
      console.warn(
        `Closing peer ${peerHubId ?? "unknown"}: frame ${frameLen}B exceeds GOSSIP_MAX_FRAME_BYTES (${config.gossipMaxFrameBytes}B)`,
      );
      ws.close(1009, "frame too large");
      return;
    }

    if (!bucket.tryConsume()) {
      recordGossipDroppedFrame("rate_limited");
      console.warn(
        `Closing peer ${peerHubId ?? "unknown"}: frame rate exceeded ${config.gossipFramesPerSecPerPeer}/s`,
      );
      ws.close(1008, "rate limit");
      return;
    }

    try {
      const msg: GossipEnvelope = JSON.parse(data.toString());
      recordGossipFrame("in", msg.type ?? "unknown");
      await handlePeerMessage(ws, msg, peerHubId, (id) => {
        peerHubId = id;
      });
    } catch (err) {
      recordGossipDroppedFrame("malformed");
      recordGossipFrame("in", "malformed");
      console.error("Error handling peer message:", err);
    }
  });

  ws.on("close", () => {
    if (peerHubId) {
      connectedPeers.delete(peerHubId);
      gossipPeersConnected.set(connectedPeers.size);
      console.log(`Peer disconnected: ${peerHubId}`);
    }
  });

  ws.on("error", (err) => {
    console.error(`Peer WebSocket error (${peerHubId || "unknown"}):`, err.message);
    ws.close();
  });
}

/**
 * Handle incoming gossip protocol messages.
 */
async function handlePeerMessage(
  ws: WebSocket,
  msg: GossipEnvelope,
  currentPeerHubId: string | null,
  setPeerHubId: (id: string) => void
): Promise<void> {
  switch (msg.type) {
    case "hello": {
      // Peer introduces itself
      const peerId = msg.hubId;
      if (peerId === config.hubId) {
        // Don't connect to ourselves
        ws.close();
        return;
      }

      setPeerHubId(peerId);
      connectedPeers.set(peerId, ws);
      gossipPeersConnected.set(connectedPeers.size);
      console.log(`Peer connected: ${peerId}`);

      // Send our hello back if we haven't already (incoming connection)
      if (!currentPeerHubId) {
        send(ws, {
          type: "hello",
          hubId: config.hubId,
          payload: { version: 1 } as HelloPayload,
        });
      }

      // Send "have" with hashes since last sync with this peer
      const lastSync = await getLastSyncTime(peerId);
      const hashes = await getMessageHashes(lastSync, config.maxSyncBatchSize);
      if (hashes.length > 0) {
        send(ws, {
          type: "have",
          hubId: config.hubId,
          payload: { hashes, since: lastSync.toISOString() } as HavePayload,
        });
      }

      // Same idea for DMs.
      const dmHashes = await getDmHashes(lastSync, config.maxSyncBatchSize);
      if (dmHashes.length > 0) {
        send(ws, {
          type: "dm_have",
          hubId: config.hubId,
          payload: {
            hashes: dmHashes,
            since: lastSync.toISOString(),
          } as HavePayload,
        });
      }
      break;
    }

    case "have": {
      // Peer tells us what hashes they have
      const payload = msg.payload as HavePayload;
      if (!Array.isArray(payload.hashes) || payload.hashes.length > 1000) break;
      const missing = await findMissingHashes(payload.hashes);
      if (missing.length > 0) {
        send(ws, {
          type: "want",
          hubId: config.hubId,
          payload: { hashes: missing } as WantPayload,
        });
      }
      break;
    }

    case "want": {
      // Peer wants specific messages from us
      const payload = msg.payload as WantPayload;
      if (!Array.isArray(payload.hashes) || payload.hashes.length > 1000) break;
      const messages = await getMessagesByHashes(payload.hashes);
      if (messages.length > 0) {
        send(ws, {
          type: "messages",
          hubId: config.hubId,
          payload: { messages } as MessagesPayload,
        });
      }
      break;
    }

    case "messages": {
      // Received messages from peer -- validate and store
      const payload = msg.payload as MessagesPayload;
      if (!Array.isArray(payload.messages) || payload.messages.length > 1000) {
        console.warn(`Rejected messages payload from ${msg.hubId}: invalid or too large (${payload.messages?.length})`);
        break;
      }
      let stored = 0;
      for (const message of payload.messages) {
        const ok = await storeGossipMessage(message, msg.hubId);
        if (ok) stored++;
      }
      if (stored > 0) {
        console.log(`Stored ${stored}/${payload.messages.length} messages from ${msg.hubId}`);
        gossipMessagesStoredTotal.inc({ kind: "tweet" }, stored);
        await incrementPeerMessageCount(msg.hubId, stored);

        // Update sync state
        const lastHash = payload.messages[payload.messages.length - 1]?.hash ?? null;
        await updateSyncState(msg.hubId, lastHash);
      }
      // NOTE: Do NOT re-gossip received messages to other peers (prevents infinite loops)
      break;
    }

    case "dm_messages": {
      const payload = msg.payload as DmMessagesPayload;
      if (!Array.isArray(payload.messages) || payload.messages.length > 1000) {
        console.warn(
          `Rejected dm_messages from ${msg.hubId}: invalid or too large (${payload.messages?.length})`
        );
        break;
      }
      let stored = 0;
      for (const dm of payload.messages) {
        const ok = await storeGossipDm(dm, msg.hubId);
        if (ok) stored++;
      }
      if (stored > 0) {
        console.log(`Stored ${stored}/${payload.messages.length} DMs from ${msg.hubId}`);
        gossipMessagesStoredTotal.inc({ kind: "dm" }, stored);
        await incrementPeerMessageCount(msg.hubId, stored);
      }
      // Don't re-gossip — same loop-prevention rule as tweets.
      break;
    }

    case "dm_have": {
      const payload = msg.payload as HavePayload;
      if (!Array.isArray(payload.hashes) || payload.hashes.length > 1000) break;
      const missing = await findMissingDmHashes(payload.hashes);
      if (missing.length > 0) {
        send(ws, {
          type: "dm_want",
          hubId: config.hubId,
          payload: { hashes: missing } as WantPayload,
        });
      }
      break;
    }

    case "dm_want": {
      const payload = msg.payload as WantPayload;
      if (!Array.isArray(payload.hashes) || payload.hashes.length > 1000) break;
      const messages = await getDmsByHashes(payload.hashes);
      if (messages.length > 0) {
        send(ws, {
          type: "dm_messages",
          hubId: config.hubId,
          payload: { messages } as DmMessagesPayload,
        });
      }
      break;
    }

    case "dm_key": {
      const payload = msg.payload as DmKeyPayload;
      if (!payload?.tid || !payload?.x25519Pubkey) break;
      await storeGossipDmKey(payload.tid, payload.x25519Pubkey);
      break;
    }

    case "ping": {
      send(ws, { type: "pong", hubId: config.hubId, payload: null });
      break;
    }

    case "pong": {
      // Peer is alive, nothing to do
      break;
    }

    default: {
      console.warn(`Unknown gossip message type: ${msg.type} from ${msg.hubId}`);
    }
  }
}

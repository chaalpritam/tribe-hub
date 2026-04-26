import WebSocket from "ws";
import { config } from "../config";
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
  getMessagesByHashes,
  findMissingHashes,
  storeGossipMessage,
  storeGossipDm,
  storeGossipDmKey,
  getLastSyncTime,
  updateSyncState,
  incrementPeerMessageCount,
} from "./sync";

// Connected peers: hubId -> WebSocket
const connectedPeers = new Map<string, WebSocket>();

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

  // If we initiated the connection, send hello first
  if (isOutgoing) {
    send(ws, {
      type: "hello",
      hubId: config.hubId,
      payload: { version: 1 } as HelloPayload,
    });
  }

  ws.on("message", async (data: WebSocket.Data) => {
    try {
      const msg: GossipEnvelope = JSON.parse(data.toString());
      await handlePeerMessage(ws, msg, peerHubId, (id) => {
        peerHubId = id;
      });
    } catch (err) {
      console.error("Error handling peer message:", err);
    }
  });

  ws.on("close", () => {
    if (peerHubId) {
      connectedPeers.delete(peerHubId);
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
        await incrementPeerMessageCount(msg.hubId, stored);
      }
      // Don't re-gossip — same loop-prevention rule as tweets.
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

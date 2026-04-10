import WebSocket from "ws";
import { config } from "../config";
import { handlePeerConnection, broadcastHave, getPeers } from "./protocol";
import { upsertPeer } from "./sync";

// Track reconnect attempts per URL
const reconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Connect to a peer hub via WebSocket.
 */
export function connectToPeer(url: string): void {
  const peers = getPeers();

  // Check if already connected to a peer at this URL
  for (const [, ws] of peers) {
    if ((ws as WebSocket & { _peerUrl?: string })._peerUrl === url) {
      return; // Already connected
    }
  }

  console.log(`Connecting to peer: ${url}`);

  let ws: WebSocket;
  try {
    ws = new WebSocket(url);
  } catch (err) {
    console.error(`Failed to create WebSocket to ${url}:`, err);
    scheduleReconnect(url);
    return;
  }

  // Tag the WebSocket with the URL for dedup
  (ws as WebSocket & { _peerUrl?: string })._peerUrl = url;

  ws.on("open", () => {
    console.log(`Connected to peer: ${url}`);
    // Clear any pending reconnect timer
    const timer = reconnectTimers.get(url);
    if (timer) {
      clearTimeout(timer);
      reconnectTimers.delete(url);
    }

    // Hand off to protocol handler
    handlePeerConnection(ws, true);
  });

  ws.on("close", () => {
    scheduleReconnect(url);
  });

  ws.on("error", (err) => {
    console.error(`WebSocket error connecting to ${url}:`, err.message);
    ws.close();
  });
}

/**
 * Schedule a reconnect attempt to a peer after a delay.
 */
function scheduleReconnect(url: string): void {
  if (reconnectTimers.has(url)) return;

  const timer = setTimeout(() => {
    reconnectTimers.delete(url);
    connectToPeer(url);
  }, config.reconnectDelayMs);

  reconnectTimers.set(url, timer);
}

/**
 * Start the peer manager:
 * 1. Connect to configured seed peers
 * 2. Start periodic gossip (broadcast "have" to all peers)
 * 3. Start periodic ping to keep connections alive
 */
export function startPeerManager(): void {
  // Connect to seed peers
  for (const peerUrl of config.peers) {
    connectToPeer(peerUrl);
  }

  // Periodic gossip: broadcast recent hashes to all peers
  setInterval(async () => {
    try {
      await broadcastHave();
    } catch (err) {
      console.error("Error broadcasting have:", err);
    }
  }, config.gossipIntervalMs);

  // Periodic ping to keep connections alive and detect dead peers
  setInterval(() => {
    const peers = getPeers();
    for (const [hubId, ws] of peers) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping", hubId: config.hubId, payload: null }));
      } else {
        peers.delete(hubId);
      }
    }
  }, config.pingIntervalMs);

  console.log(`Peer manager started. Seed peers: ${config.peers.length}`);
}

/**
 * Register a peer that connected to us (for tracking).
 */
export async function registerIncomingPeer(hubId: string, url: string): Promise<void> {
  await upsertPeer(hubId, url);
}

/**
 * Stop all reconnect timers (for clean shutdown).
 */
export function stopPeerManager(): void {
  for (const [, timer] of reconnectTimers) {
    clearTimeout(timer);
  }
  reconnectTimers.clear();

  const peers = getPeers();
  for (const [, ws] of peers) {
    ws.close();
  }
  peers.clear();
}

import { WebSocket } from "ws";

const MAX_CLIENT_CONNECTIONS = 10_000;

/**
 * Connected browser/app clients (distinct from gossip peers).
 */
const clients = new Set<WebSocket>();

/**
 * Broadcast an event to all connected browser clients.
 */
export function broadcastToClients(event: string, data: unknown): void {
  if (clients.size === 0) return;
  const message = JSON.stringify({ event, data });
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}

/**
 * Register a new client WebSocket connection.
 */
export function addClient(ws: WebSocket): void {
  if (clients.size >= MAX_CLIENT_CONNECTIONS) {
    ws.close(1013, "Too many connections");
    return;
  }
  clients.add(ws);

  ws.on("close", () => {
    clients.delete(ws);
  });

  ws.on("error", () => {
    clients.delete(ws);
  });

  ws.send(JSON.stringify({ event: "connected", data: { clients: clients.size } }));
}

/**
 * Get the count of connected browser clients.
 */
export function getClientCount(): number {
  return clients.size;
}

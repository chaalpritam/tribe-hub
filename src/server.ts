import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { registerRoutes } from "./api/routes";
import { handlePeerConnection } from "./gossip/protocol";
import { addClient } from "./api/ws";

export async function buildServer() {
  const server = Fastify({ logger: true });

  await server.register(cors, { origin: true });
  await server.register(websocket);

  // Gossip WebSocket endpoint -- peers connect here
  server.get("/gossip", { websocket: true }, (socket) => {
    // Incoming peer connection (they connected to us)
    handlePeerConnection(socket, false);
  });

  // Client WebSocket endpoint -- browsers/apps connect here for real-time updates
  server.get("/v1/ws", { websocket: true }, (socket) => {
    addClient(socket);
  });

  // Register all HTTP routes
  registerRoutes(server);

  return server;
}

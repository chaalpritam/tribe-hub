import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { registerRoutes } from "./api/routes";
import { handlePeerConnection } from "./gossip/protocol";

export async function buildServer() {
  const server = Fastify({ logger: true });

  await server.register(cors, { origin: true });
  await server.register(websocket);

  // Gossip WebSocket endpoint -- peers connect here
  server.get("/gossip", { websocket: true }, (socket) => {
    // Incoming peer connection (they connected to us)
    handlePeerConnection(socket, false);
  });

  // Register all HTTP routes
  registerRoutes(server);

  return server;
}

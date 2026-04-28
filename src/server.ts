import Fastify, { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import cors, { FastifyCorsOptions } from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import websocket from "@fastify/websocket";
import { config } from "./config";
import { registerRoutes } from "./api/routes";
import { handlePeerConnection } from "./gossip/protocol";
import { addClient } from "./api/ws";

function buildCorsOptions(): FastifyCorsOptions {
  const allowAll = config.corsOrigins.length === 0 || config.corsOrigins.includes("*");
  if (allowAll) return { origin: true };
  return { origin: config.corsOrigins };
}

export async function buildServer() {
  const server = Fastify({
    logger: true,
    bodyLimit: config.bodyLimitBytes,
    trustProxy: true,
  });

  await server.register(cors, buildCorsOptions());
  await server.register(rateLimit, {
    global: true,
    max: config.rateLimitGlobalMax,
    timeWindow: config.rateLimitWindowMs,
    // Skip rate limiting for the health check so liveness probes never get 429s.
    allowList: (req) => req.url === "/health",
  });
  await server.register(websocket);

  server.setErrorHandler((err: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const status = err.statusCode ?? 500;
    if (status >= 500) {
      request.log.error({ err, url: request.url, method: request.method }, "request failed");
    } else {
      request.log.warn({ err: err.message, url: request.url, method: request.method }, "request rejected");
    }
    const payload =
      status >= 500 && config.isProduction
        ? { error: "Internal server error" }
        : { error: err.message || "Request failed" };
    reply.status(status).send(payload);
  });

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

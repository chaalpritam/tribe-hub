import Fastify, { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import cors, { FastifyCorsOptions } from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import websocket from "@fastify/websocket";
import { config } from "./config";
import { registerRoutes } from "./api/routes";
import { handlePeerConnection } from "./gossip/protocol";
import { addClient } from "./api/ws";
import { observeHttpRequest, registry as metricsRegistry } from "./metrics";

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
    // Skip rate limiting for liveness probes (/health) and Prometheus
    // scrapes (/metrics) so monitors never get 429s.
    allowList: (req) => req.url === "/health" || req.url === "/metrics",
  });
  await server.register(websocket);

  server.addHook("onResponse", async (request, reply) => {
    const route = request.routeOptions?.url ?? request.url ?? "unknown";
    // Skip self-instrumentation to avoid scrape feedback loops.
    if (route === "/metrics") return;
    const elapsedMs = reply.elapsedTime ?? 0;
    observeHttpRequest(request.method, route, reply.statusCode, elapsedMs / 1000);
  });

  server.get("/metrics", async (_request, reply) => {
    reply.header("Content-Type", metricsRegistry.contentType);
    return metricsRegistry.metrics();
  });

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

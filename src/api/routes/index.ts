import { FastifyInstance } from "fastify";
import { submitRoutes } from "./submit";
import { feedRoutes } from "./feed";
import { userRoutes } from "./users";
import { socialRoutes } from "./social";
import { peerRoutes } from "./peers";
import { healthRoutes } from "./health";

export function registerRoutes(server: FastifyInstance): void {
  server.register(submitRoutes);
  server.register(feedRoutes);
  server.register(userRoutes);
  server.register(socialRoutes);
  server.register(peerRoutes);
  server.register(healthRoutes);
}

import { FastifyInstance } from "fastify";
import { submitRoutes } from "./submit";
import { feedRoutes } from "./feed";
import { userRoutes } from "./users";
import { socialRoutes } from "./social";
import { peerRoutes } from "./peers";
import { healthRoutes } from "./health";
import { uploadRoutes } from "./upload";
import { dmRoutes } from "./dms";
import { channelRoutes } from "./channels";
import { bookmarkRoutes } from "./bookmarks";
import { pollRoutes } from "./polls";
import { eventRoutes } from "./events";
import { taskRoutes } from "./tasks";
import { crowdfundRoutes } from "./crowdfunds";
import { tipRoutes } from "./tips";
import { karmaRoutes } from "./karma";
import { notificationRoutes } from "./notifications";

export function registerRoutes(server: FastifyInstance): void {
  server.register(submitRoutes);
  server.register(feedRoutes);
  server.register(userRoutes);
  server.register(socialRoutes);
  server.register(peerRoutes);
  server.register(healthRoutes);
  server.register(uploadRoutes);
  server.register(dmRoutes);
  server.register(channelRoutes);
  server.register(bookmarkRoutes);
  server.register(pollRoutes);
  server.register(eventRoutes);
  server.register(taskRoutes);
  server.register(crowdfundRoutes);
  server.register(tipRoutes);
  server.register(karmaRoutes);
  server.register(notificationRoutes);
}

import { FastifyInstance } from "fastify";
import multipart from "@fastify/multipart";
import { mediaStore } from "../../storage/media-store";
import { config } from "../../config";

// Separate caps per media kind. Photos are quick to display and we
// don't want a 50 MB JPEG from a misbehaving client; reels are
// inherently larger and need headroom — 100 MB covers ~1 minute of
// 1080p H.264 at sane bitrates.
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;     // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;   // 100MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

function maxSizeFor(mimetype: string): number {
  return ALLOWED_VIDEO_TYPES.includes(mimetype) ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
}

export async function uploadRoutes(server: FastifyInstance): Promise<void> {
  await server.register(multipart, {
    // Multipart needs an upper bound at register time — set it to the
    // video cap so a legitimate reel upload doesn't 413 before the
    // route handler can branch on mimetype.
    limits: { fileSize: MAX_VIDEO_SIZE },
  });

  server.post("/v1/upload", {
    config: {
      rateLimit: {
        max: config.rateLimitUploadMax,
        timeWindow: config.rateLimitWindowMs,
      },
    },
  }, async (request, reply) => {
    const file = await request.file();
    if (!file) {
      return reply.status(400).send({ error: "No file provided" });
    }

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return reply.status(400).send({
        error: `Unsupported file type: ${file.mimetype}. Allowed: ${ALLOWED_TYPES.join(", ")}`,
      });
    }

    const chunks: Buffer[] = [];
    for await (const chunk of file.file) {
      chunks.push(chunk);
    }
    const data = Buffer.concat(chunks);

    const cap = maxSizeFor(file.mimetype);
    if (data.length > cap) {
      const mb = (cap / (1024 * 1024)).toFixed(0);
      return reply.status(400).send({
        error: `File too large for ${file.mimetype} (max ${mb}MB)`,
      });
    }

    const hash = await mediaStore.store(data, file.mimetype);

    return {
      hash,
      url: `/v1/media/${hash}`,
      contentType: file.mimetype,
      size: data.length,
    };
  });

  server.get<{ Params: { hash: string } }>("/v1/media/:hash", async (request, reply) => {
    const hash = request.params.hash;

    if (!/^[a-f0-9]{64}$/.test(hash)) {
      return reply.status(400).send({ error: "Invalid hash format" });
    }

    const media = mediaStore.retrieve(hash);
    if (!media) {
      return reply.status(404).send({ error: "Media not found" });
    }

    reply.header("Content-Type", media.contentType);
    reply.header("Cache-Control", "public, max-age=31536000, immutable");
    return reply.send(media.data);
  });
}

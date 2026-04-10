import { FastifyInstance } from "fastify";
import multipart from "@fastify/multipart";
import { mediaStore } from "../../storage/media-store";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function uploadRoutes(server: FastifyInstance): Promise<void> {
  await server.register(multipart, {
    limits: { fileSize: MAX_FILE_SIZE },
  });

  server.post("/v1/upload", async (request, reply) => {
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

    if (data.length > MAX_FILE_SIZE) {
      return reply.status(400).send({ error: "File too large (max 5MB)" });
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

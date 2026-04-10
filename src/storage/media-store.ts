import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";
import { config } from "../config";

interface MediaRecord {
  contentType: string;
  size: number;
  createdAt: string;
}

/**
 * Content-addressable media storage on local disk.
 * Files sharded into subdirectories by first 2 hex chars of hash.
 */
class MediaStore {
  private metaCache = new Map<string, MediaRecord>();
  private mediaDir: string;

  constructor() {
    this.mediaDir = config.mediaDir ?? "./data/media";
    mkdirSync(this.mediaDir, { recursive: true });
  }

  async store(data: Buffer, contentType: string): Promise<string> {
    const hash = createHash("sha256").update(data).digest("hex");

    if (this.exists(hash)) return hash;

    const shard = hash.substring(0, 2);
    const shardDir = join(this.mediaDir, shard);
    mkdirSync(shardDir, { recursive: true });

    writeFileSync(join(shardDir, hash), data);

    const meta: MediaRecord = { contentType, size: data.length, createdAt: new Date().toISOString() };
    writeFileSync(join(shardDir, `${hash}.json`), JSON.stringify(meta));
    this.metaCache.set(hash, meta);

    return hash;
  }

  retrieve(hash: string): { data: Buffer; contentType: string } | null {
    const meta = this.getMeta(hash);
    if (!meta) return null;

    const filePath = join(this.mediaDir, hash.substring(0, 2), hash);
    if (!existsSync(filePath)) return null;

    return { data: readFileSync(filePath), contentType: meta.contentType };
  }

  exists(hash: string): boolean {
    return existsSync(join(this.mediaDir, hash.substring(0, 2), hash));
  }

  private getMeta(hash: string): MediaRecord | null {
    const cached = this.metaCache.get(hash);
    if (cached) return cached;

    const metaPath = join(this.mediaDir, hash.substring(0, 2), `${hash}.json`);
    if (!existsSync(metaPath)) return null;

    try {
      const meta = JSON.parse(readFileSync(metaPath, "utf-8")) as MediaRecord;
      this.metaCache.set(hash, meta);
      return meta;
    } catch {
      // Corrupted metadata file — treat as missing
      return null;
    }
  }
}

export const mediaStore = new MediaStore();

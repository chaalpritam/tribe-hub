import { Connection, PublicKey } from "@solana/web3.js";
import { config } from "../config";

interface CachedAppKey {
  tid: string;
  appPubkey: string;
  scope: number;
  revoked: boolean;
  expiresAt: number;
  cachedAt: number;
}

const MAX_CACHE_SIZE = 10_000; // Max entries to prevent unbounded memory growth

// Anchor account layout for AppKeyRecord after 8-byte discriminator:
// u64 tid (8) + Pubkey app_pubkey (32) + u8 scope (1) + i64 created_at (8) + i64 expires_at (8) + bool revoked (1) + u8 bump (1)
const DISCRIMINATOR_LEN = 8;
const TID_OFFSET = DISCRIMINATOR_LEN;
const SCOPE_OFFSET = TID_OFFSET + 8 + 32; // after tid + app_pubkey
const EXPIRES_AT_OFFSET = SCOPE_OFFSET + 1 + 8; // after scope + created_at
const REVOKED_OFFSET = EXPIRES_AT_OFFSET + 8;
const MIN_ACCOUNT_LEN = REVOKED_OFFSET + 1;

/**
 * In-memory cache of app keys from Solana.
 * Avoids RPC call per message validation.
 */
class AppKeyCache {
  private cache = new Map<string, CachedAppKey>();
  private connection: Connection;

  constructor() {
    this.connection = new Connection(config.solanaRpcUrl);
  }

  /**
   * Check if a signer is a valid (active, non-revoked) app key for a TID.
   */
  async isValid(tid: string, signerHex: string): Promise<boolean> {
    const key = `${tid}:${signerHex}`;
    const cached = this.cache.get(key);

    // Return from cache if fresh.
    if (cached && Date.now() - cached.cachedAt < config.appKeyCacheTtlMs) {
      return !cached.revoked && (cached.expiresAt === 0 || cached.expiresAt > Date.now() / 1000);
    }

    // Cache miss -- fetch from Solana.
    const record = await this.fetchFromChain(tid, signerHex);
    if (!record) return false;

    // Evict oldest entries if cache is full
    if (this.cache.size >= MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, { ...record, cachedAt: Date.now() });
    return !record.revoked && (record.expiresAt === 0 || record.expiresAt > Date.now() / 1000);
  }

  /**
   * Fetch an app key record from on-chain and deserialize Anchor account data.
   * Uses manual byte-level u64 operations for browser compatibility.
   */
  private async fetchFromChain(tid: string, signerHex: string): Promise<CachedAppKey | null> {
    try {
      // Manual LE u64 write for browser compat (no BigUInt64LE)
      const tidNum = BigInt(tid);
      const tidBuffer = Buffer.alloc(8);
      let val = tidNum;
      for (let i = 0; i < 8; i++) {
        tidBuffer[i] = Number(val & 0xffn);
        val >>= 8n;
      }

      const signerPubkey = new PublicKey(Buffer.from(signerHex, "hex"));

      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("app_key"), tidBuffer, signerPubkey.toBuffer()],
        new PublicKey(config.programIds.appKeyRegistry)
      );

      const accountInfo = await this.connection.getAccountInfo(pda);
      if (!accountInfo || accountInfo.data.length < MIN_ACCOUNT_LEN) return null;

      const data = accountInfo.data;
      const scope = data[SCOPE_OFFSET];

      // Manual LE i64 read for expiresAt
      let expiresAtVal = 0;
      for (let i = 0; i < 8; i++) {
        expiresAtVal += data[EXPIRES_AT_OFFSET + i] * 2 ** (i * 8);
      }

      const revoked = data[REVOKED_OFFSET] !== 0;

      return {
        tid,
        appPubkey: signerHex,
        scope,
        revoked,
        expiresAt: expiresAtVal,
        cachedAt: Date.now(),
      };
    } catch {
      return null;
    }
  }

  /**
   * Invalidate a specific key (called on revoke events).
   */
  invalidate(tid: string, signerHex: string): void {
    this.cache.delete(`${tid}:${signerHex}`);
  }

  /**
   * Clear entire cache.
   */
  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const appKeyCache = new AppKeyCache();

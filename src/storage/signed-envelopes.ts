import { db } from "./db";

/**
 * Persist the bytes the signer hashed for a message envelope. Used by
 * both the submit route and the gossip ingest path so any later peer
 * can pull (hash, data_bytes) and re-verify blake3(data_bytes) == hash.
 *
 * Stores raw bytes (BYTEA) regardless of encoding (JSON or protobuf)
 * — the hub doesn't need to know which; that's the receiver's
 * problem when recomputing the hash.
 */
export async function storeSignedEnvelope(
  hashB64: string,
  dataB64: string,
): Promise<void> {
  const dataBytes = Buffer.from(dataB64, "base64");
  if (dataBytes.length === 0) return;
  await db.query(
    `INSERT INTO signed_envelopes (hash, data_bytes)
     VALUES ($1, $2)
     ON CONFLICT (hash) DO NOTHING`,
    [hashB64, dataBytes],
  );
}

/**
 * Look up the original signed bytes for a known hash. Returns null
 * when the hub has the projected message but no signed envelope —
 * either pre-3.4 ingest, or the envelope arrived without dataB64.
 */
export async function getSignedEnvelope(
  hashB64: string,
): Promise<string | null> {
  const result = await db.query<{ data_bytes: Buffer }>(
    `SELECT data_bytes FROM signed_envelopes WHERE hash = $1 LIMIT 1`,
    [hashB64],
  );
  if (result.rowCount === 0) return null;
  return Buffer.from(result.rows[0].data_bytes).toString("base64");
}

/**
 * Bulk variant for gossip "want" responses — looks up multiple
 * envelopes in a single query and returns a hash → dataB64 map.
 */
export async function getSignedEnvelopes(
  hashesB64: string[],
): Promise<Map<string, string>> {
  if (hashesB64.length === 0) return new Map();
  const result = await db.query<{ hash: string; data_bytes: Buffer }>(
    `SELECT hash, data_bytes FROM signed_envelopes WHERE hash = ANY($1::text[])`,
    [hashesB64],
  );
  const out = new Map<string, string>();
  for (const row of result.rows) {
    out.set(row.hash, Buffer.from(row.data_bytes).toString("base64"));
  }
  return out;
}

import nacl from "tweetnacl";
import { hash as blake3Hash } from "blake3";
import { SubmitMessageRequest, GossipMessage } from "../types";
import { appKeyCache } from "./app-key-cache";
import { db } from "../storage/db";
import { config } from "../config";
import { recordDataB64Status, recordValidationRejection } from "../metrics";

interface ValidationResult {
  valid: boolean;
  error?: string;
}

function reject(
  source: "submit" | "gossip",
  reason: string,
  error: string,
): ValidationResult {
  recordValidationRejection(source, reason);
  return { valid: false, error };
}

interface DataB64CheckResult {
  rejection: ValidationResult | null;
  /**
   * Authentic MessageData decoded from dataB64, when the bytes were
   * JSON-encoded. Callers should overwrite request.data with this so
   * downstream projection runs against the bytes the signer actually
   * authenticated, not against whatever `data` field rode along on
   * the wire. Null when dataB64 was absent or proto-encoded (proto
   * decoding is a follow-up — phase 3.3 stops at JSON).
   */
  decodedData: SubmitMessageRequest["data"] | null;
}

/**
 * If the request carries dataB64, recompute blake3 over those bytes and
 * compare to the claimed hash. When the bytes are JSON (first byte '{'),
 * also parse them and surface the result so the caller can overwrite
 * request.data with the authentic, blake3-bound version.
 *
 * Sniffing JSON vs protobuf by first byte: JSON envelopes start with
 * 0x7B ('{'); MessageData protobuf wire format starts with a varint tag
 * (0x08 for field 1) and never with 0x7B.
 */
function checkDataB64Integrity(
  source: "submit" | "gossip",
  dataB64: string | undefined,
  claimedHashB64: string,
): DataB64CheckResult {
  if (!dataB64) {
    recordDataB64Status(source, "absent");
    return { rejection: null, decodedData: null };
  }
  let bytes: Buffer;
  try {
    bytes = Buffer.from(dataB64, "base64");
    if (bytes.length === 0) throw new Error("empty");
  } catch {
    recordDataB64Status(source, "invalid_base64");
    return {
      rejection: reject(source, "invalid_data_b64", "dataB64 is not valid base64"),
      decodedData: null,
    };
  }
  const computed = blake3Hash(bytes) as Uint8Array;
  const claimed = Buffer.from(claimedHashB64, "base64");
  if (
    computed.length !== claimed.length ||
    !Buffer.from(computed).equals(claimed)
  ) {
    recordDataB64Status(source, "mismatch");
    return {
      rejection: reject(
        source,
        "data_b64_hash_mismatch",
        "blake3(dataB64) does not match the claimed hash",
      ),
      decodedData: null,
    };
  }
  recordDataB64Status(source, "present");

  let decodedData: SubmitMessageRequest["data"] | null = null;
  if (bytes[0] === 0x7b /* '{' */) {
    try {
      const parsed = JSON.parse(bytes.toString("utf8"));
      if (parsed && typeof parsed === "object" && "type" in parsed && "tid" in parsed) {
        decodedData = parsed as SubmitMessageRequest["data"];
        recordDataB64Status(source, "decoded_json");
      }
    } catch {
      // dataB64 looked like JSON but didn't parse — bytes still match the
      // hash, so don't reject. Just skip the override.
    }
  } else {
    // Protobuf-encoded — phase 3.3 verifies the hash but doesn't yet
    // decode for projection. Tracked so we know when proto traffic
    // appears and full projection support becomes worth implementing.
    recordDataB64Status(source, "decoded_proto");
  }
  return { rejection: null, decodedData };
}

/**
 * Reject messages whose signed timestamp is too far in the past or future.
 * `signedAtMs` is the message's claimed signing time in milliseconds since
 * epoch. Returns null if the timestamp is in window.
 */
function checkTimestampWindow(
  source: "submit" | "gossip",
  signedAtMs: number,
): ValidationResult | null {
  if (!Number.isFinite(signedAtMs)) {
    return reject(source, "invalid_timestamp", "Message timestamp is not a finite number");
  }
  const now = Date.now();
  if (signedAtMs > now + config.messageMaxFutureSkewMs) {
    return reject(source, "timestamp_in_future", "Message timestamp is too far in the future");
  }
  if (signedAtMs < now - config.messageMaxAgeMs) {
    return reject(source, "timestamp_too_old", "Message timestamp is older than the replay window");
  }
  return null;
}

/**
 * Validate a submitted message:
 * 1. Verify ed25519 signature
 * 2. Check app key is valid for the TID
 * 3. Check for duplicate hash
 * 4. Validate message body
 */
export async function validateMessage(message: SubmitMessageRequest): Promise<ValidationResult> {
  // 1. Decode fields.
  const hash = Buffer.from(message.hash, "base64");
  const signature = Buffer.from(message.signature, "base64");
  const signer = Buffer.from(message.signer, "base64");

  // 2. Verify ed25519 signature over hash.
  const signatureValid = nacl.sign.detached.verify(hash, signature, signer);
  if (!signatureValid) {
    return reject("submit", "invalid_signature", "Invalid signature");
  }

  // 2a. If the client included dataB64, verify the hash recomputes
  // from those bytes. When the bytes are JSON we also overwrite
  // message.data with the decoded version — that's the authentic
  // payload the signer authenticated, and downstream projection should
  // run against it rather than the (untrusted) data field on the wire.
  const integrityCheck = checkDataB64Integrity(
    "submit",
    message.dataB64,
    message.hash,
  );
  if (integrityCheck.rejection) return integrityCheck.rejection;
  if (integrityCheck.decodedData) {
    message.data = integrityCheck.decodedData;
  }

  // 2b. Reject messages outside the replay window. data.timestamp is unix
  // seconds in the signed envelope; convert to ms for the window check.
  const tsCheck = checkTimestampWindow("submit", message.data.timestamp * 1000);
  if (tsCheck) return tsCheck;

  // 3. Verify signer is a valid app key for this TID.
  const signerHex = Buffer.from(signer).toString("hex");
  const isValidKey = await appKeyCache.isValid(message.data.tid, signerHex);
  if (!isValidKey) {
    return reject(
      "submit",
      "invalid_app_key",
      "Signer is not a valid app key for this TID",
    );
  }

  // 4. Check for duplicate hash.
  const dupResult = await db.query(
    `SELECT 1 FROM messages WHERE hash = $1 LIMIT 1`,
    [message.hash]
  );
  if (dupResult.rowCount !== null && dupResult.rowCount > 0) {
    return reject("submit", "duplicate_hash", "Duplicate message hash");
  }

  // 5. Validate tweet body for TWEET_ADD (type 1).
  const messageType = message.data.type;
  if (messageType === 1) {
    const body = message.data.body as { text?: string };
    if (!body.text || typeof body.text !== "string") {
      return reject("submit", "missing_tweet_text", "Tweet text is required");
    }
    if (body.text.length > config.maxTweetTextLength) {
      return reject(
        "submit",
        "tweet_text_too_long",
        `Tweet text exceeds max length of ${config.maxTweetTextLength} characters`,
      );
    }
  }

  return { valid: true };
}

/**
 * Validate a gossip message (received from a peer hub).
 * Same checks as validateMessage but adapted for the gossip message format.
 */
export async function validateGossipMessage(msg: GossipMessage): Promise<ValidationResult> {
  // Decode fields.
  const hash = Buffer.from(msg.hash, "base64");
  const signature = Buffer.from(msg.signature, "base64");
  const signer = Buffer.from(msg.signer, "base64");

  // Verify ed25519 signature over hash.
  const signatureValid = nacl.sign.detached.verify(hash, signature, signer);
  if (!signatureValid) {
    return reject("gossip", "invalid_signature", "Invalid signature");
  }

  // Reject messages outside the replay window. Note: a malicious peer can
  // lie about timestamp without invalidating the signature (the gossip
  // projection isn't part of the hashed envelope), but honest peers
  // forward the original timestamp and this still catches replays at
  // honest hops in the gossip graph.
  const signedAtMs = Date.parse(msg.timestamp);
  const tsCheck = checkTimestampWindow("gossip", signedAtMs);
  if (tsCheck) return tsCheck;

  // Verify signer is a valid app key for this TID.
  const signerHex = Buffer.from(signer).toString("hex");
  const isValidKey = await appKeyCache.isValid(msg.tid, signerHex);
  if (!isValidKey) {
    return reject(
      "gossip",
      "invalid_app_key",
      "Signer is not a valid app key for this TID",
    );
  }

  return { valid: true };
}

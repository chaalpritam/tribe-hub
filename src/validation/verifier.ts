import nacl from "tweetnacl";
import { SubmitMessageRequest, GossipMessage } from "../types";
import { appKeyCache } from "./app-key-cache";
import { db } from "../storage/db";
import { config } from "../config";
import { recordValidationRejection } from "../metrics";

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

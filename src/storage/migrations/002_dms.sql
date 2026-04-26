-- x25519 public keys per TID, used by senders to encrypt DMs.
CREATE TABLE IF NOT EXISTS dm_keys (
  tid             BIGINT PRIMARY KEY,
  x25519_pubkey   TEXT NOT NULL,
  registered_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- One row per pair of TIDs that have ever exchanged a DM.
-- id is "min(a,b):max(a,b)" so it's deterministic from the participants.
CREATE TABLE IF NOT EXISTS dm_conversations (
  id              TEXT PRIMARY KEY,
  tid_a           BIGINT NOT NULL,
  tid_b           BIGINT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- Encrypted message store. ciphertext + nonce are nacl.box payloads;
-- sender_x25519 lets the recipient open them. Hub never sees plaintext.
CREATE TABLE IF NOT EXISTS dm_messages (
  hash            TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES dm_conversations(id) ON DELETE CASCADE,
  sender_tid      BIGINT NOT NULL,
  recipient_tid   BIGINT NOT NULL,
  ciphertext      TEXT NOT NULL,
  nonce           TEXT NOT NULL,
  sender_x25519   TEXT NOT NULL,
  timestamp       TIMESTAMPTZ NOT NULL,
  signature       TEXT NOT NULL,
  signer          TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dm_messages_conv ON dm_messages (conversation_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_dm_conv_tid_a ON dm_conversations (tid_a, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_conv_tid_b ON dm_conversations (tid_b, last_message_at DESC);

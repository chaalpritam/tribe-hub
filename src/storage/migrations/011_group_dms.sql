-- Group DMs (DM_GROUP_CREATE = 26, DM_GROUP_SEND = 27).
-- Each message is one envelope + one ciphertext per recipient
-- (sender encrypts separately to each member's x25519 key).
CREATE TABLE IF NOT EXISTS dm_groups (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  creator_tid  BIGINT NOT NULL,
  hash         TEXT NOT NULL,
  signature    TEXT NOT NULL,
  signer       TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dm_group_members (
  group_id   TEXT NOT NULL REFERENCES dm_groups(id) ON DELETE CASCADE,
  tid        BIGINT NOT NULL,
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, tid)
);

CREATE TABLE IF NOT EXISTS dm_group_messages (
  hash             TEXT PRIMARY KEY,
  group_id         TEXT NOT NULL REFERENCES dm_groups(id) ON DELETE CASCADE,
  sender_tid       BIGINT NOT NULL,
  sender_x25519    TEXT NOT NULL,
  timestamp        TIMESTAMPTZ NOT NULL,
  signature        TEXT NOT NULL,
  signer           TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- One row per (envelope, recipient). Each recipient gets their own
-- ciphertext + nonce so the hub never holds plaintext.
CREATE TABLE IF NOT EXISTS dm_group_ciphertexts (
  envelope_hash  TEXT NOT NULL REFERENCES dm_group_messages(hash)
                                ON DELETE CASCADE,
  recipient_tid  BIGINT NOT NULL,
  ciphertext     TEXT NOT NULL,
  nonce          TEXT NOT NULL,
  PRIMARY KEY (envelope_hash, recipient_tid)
);

CREATE INDEX IF NOT EXISTS idx_dm_group_messages_group
  ON dm_group_messages (group_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_dm_group_members_tid
  ON dm_group_members (tid);
CREATE INDEX IF NOT EXISTS idx_dm_group_ciphertexts_recipient
  ON dm_group_ciphertexts (recipient_tid);

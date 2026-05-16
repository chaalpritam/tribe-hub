import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";

// ---------------------------------------------------------------------------
// Mocks - must be before imports that use them
// ---------------------------------------------------------------------------

vi.mock("../src/storage/db", () => ({
  db: { query: vi.fn(), on: vi.fn() },
  runMigrations: vi.fn(),
}));

vi.mock("../src/validation/app-key-cache", () => ({
  appKeyCache: {
    isValid: vi.fn(),
    invalidate: vi.fn(),
    clear: vi.fn(),
  },
}));

vi.mock("../src/gossip/protocol", () => ({
  handlePeerConnection: vi.fn(),
  broadcastHave: vi.fn(),
  gossipMessage: vi.fn(),
  getPeers: vi.fn(() => new Map()),
  getPeerCount: vi.fn(() => 0),
}));

vi.mock("../src/solana/listener", () => ({
  startSolanaListener: vi.fn(),
}));

vi.mock("../src/gossip/peer-manager", () => ({
  startPeerManager: vi.fn(),
  stopPeerManager: vi.fn(),
  connectToPeer: vi.fn(),
  registerIncomingPeer: vi.fn(),
}));

// Mock Connection to avoid real network calls
vi.mock("@solana/web3.js", async () => {
  const actual = await vi.importActual<typeof import("@solana/web3.js")>("@solana/web3.js");
  class MockConnection {
    getAccountInfo = vi.fn().mockResolvedValue(null);
    onLogs = vi.fn().mockReturnValue(0);
  }
  return {
    ...actual,
    Connection: MockConnection,
  };
});

import { db } from "../src/storage/db";
import { appKeyCache } from "../src/validation/app-key-cache";
import { gossipMessage } from "../src/gossip/protocol";
import { buildServer } from "../src/server";
import type { FastifyInstance } from "fastify";

const mockQuery = db.query as ReturnType<typeof vi.fn>;
const mockIsValid = appKeyCache.isValid as ReturnType<typeof vi.fn>;
const mockGossipMessage = gossipMessage as ReturnType<typeof vi.fn>;

// Helper: create a signed message for submission
function createSignedMessage(
  type: number,
  tid: string,
  body: Record<string, unknown>,
  keyPair: nacl.SignKeyPair
) {
  const data = {
    type,
    tid,
    timestamp: Math.floor(Date.now() / 1000),
    network: 2,
    body,
  };

  const dataBytes = new TextEncoder().encode(JSON.stringify(data));
  // Simulate blake3 hash with sha-256 for testing (just need 32 bytes)
  const hashBytes = nacl.hash(dataBytes).subarray(0, 32);
  const signature = nacl.sign.detached(hashBytes, keyPair.secretKey);

  return {
    protocolVersion: 1,
    data,
    hash: Buffer.from(hashBytes).toString("base64"),
    signature: Buffer.from(signature).toString("base64"),
    signer: Buffer.from(keyPair.publicKey).toString("base64"),
  };
}

let server: FastifyInstance;
let testKeyPair: nacl.SignKeyPair;

beforeEach(async () => {
  vi.clearAllMocks();
  testKeyPair = nacl.sign.keyPair();
  server = await buildServer();
  await server.ready();
});

afterEach(async () => {
  await server.close();
});

// ===========================================================================
// Health endpoint
// ===========================================================================
describe("GET /health", () => {
  it("returns ok status when DB is healthy", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ count: 42 }] }) // message count
      .mockResolvedValueOnce({ rows: [{ count: 5 }] }); // tid count

    const res = await server.inject({ method: "GET", url: "/health" });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.messages).toBe(42);
    expect(body.tids).toBe(5);
    expect(body.peers).toBe(0);
    expect(body).toHaveProperty("hubId");
    expect(body).toHaveProperty("uptime");
    expect(body).toHaveProperty("timestamp");
  });

  it("returns degraded status when DB is down", async () => {
    mockQuery.mockRejectedValueOnce(new Error("connection refused"));

    const res = await server.inject({ method: "GET", url: "/health" });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.status).toBe("degraded");
    expect(body.database).toBe("disconnected");
  });
});

// ===========================================================================
// Submit message endpoint
// ===========================================================================
describe("POST /v1/submit", () => {
  it("accepts a valid TWEET_ADD and gossips it", async () => {
    const message = createSignedMessage(1, "42", {
      text: "Hello Tribe!",
      mentions: [],
      embeds: [],
      channel_id: "general",
    }, testKeyPair);

    // Signature is valid (mocked in validateMessage via appKeyCache)
    mockIsValid.mockResolvedValueOnce(true);
    // Duplicate check
    mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    // Insert into messages
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await server.inject({
      method: "POST",
      url: "/v1/submit",
      payload: message,
    });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.hash).toBe(message.hash);
    expect(mockGossipMessage).toHaveBeenCalledOnce();
  });

  it("rejects invalid signature", async () => {
    const message = createSignedMessage(1, "42", { text: "test" }, testKeyPair);
    // Create a valid-length but wrong signature (64 bytes)
    const badSig = new Uint8Array(64);
    badSig.fill(0xab);
    message.signature = Buffer.from(badSig).toString("base64");

    const res = await server.inject({
      method: "POST",
      url: "/v1/submit",
      payload: message,
    });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(400);
    expect(body.error).toContain("Invalid signature");
  });

  it("rejects when app key is not valid", async () => {
    const message = createSignedMessage(1, "42", { text: "test" }, testKeyPair);

    mockIsValid.mockResolvedValueOnce(false);

    const res = await server.inject({
      method: "POST",
      url: "/v1/submit",
      payload: message,
    });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(400);
    expect(body.error).toContain("not a valid app key");
  });

  it("rejects duplicate message hash", async () => {
    const message = createSignedMessage(1, "42", { text: "test", channel_id: "general" }, testKeyPair);

    mockIsValid.mockResolvedValueOnce(true);
    // Duplicate check returns a row
    mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ hash: "existing" }] });

    const res = await server.inject({
      method: "POST",
      url: "/v1/submit",
      payload: message,
    });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(400);
    expect(body.error).toContain("Duplicate");
  });

  it("rejects tweet text exceeding max length", async () => {
    const longText = "x".repeat(321);
    const message = createSignedMessage(1, "42", { text: longText, channel_id: "general" }, testKeyPair);

    mockIsValid.mockResolvedValueOnce(true);
    mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const res = await server.inject({
      method: "POST",
      url: "/v1/submit",
      payload: message,
    });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(400);
    expect(body.error).toContain("max length");
  });

  it("accepts TWEET_REMOVE with target_hash", async () => {
    const message = createSignedMessage(2, "42", {
      target_hash: "abc123",
    }, testKeyPair);

    mockIsValid.mockResolvedValueOnce(true);
    mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await server.inject({
      method: "POST",
      url: "/v1/submit",
      payload: message,
    });

    expect(res.statusCode).toBe(200);
  });

  it("rejects TWEET_REMOVE without target_hash", async () => {
    const message = createSignedMessage(2, "42", {}, testKeyPair);

    mockIsValid.mockResolvedValueOnce(true);
    mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const res = await server.inject({
      method: "POST",
      url: "/v1/submit",
      payload: message,
    });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(400);
    expect(body.error).toContain("target_hash");
  });

  it("accepts REACTION_ADD with type and target_hash", async () => {
    const message = createSignedMessage(3, "42", {
      type: 1,
      target_hash: "tweet_abc",
    }, testKeyPair);

    mockIsValid.mockResolvedValueOnce(true);
    mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await server.inject({
      method: "POST",
      url: "/v1/submit",
      payload: message,
    });

    expect(res.statusCode).toBe(200);
  });

  it("rejects unsupported message type", async () => {
    const message = createSignedMessage(99, "42", {}, testKeyPair);

    mockIsValid.mockResolvedValueOnce(true);
    mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const res = await server.inject({
      method: "POST",
      url: "/v1/submit",
      payload: message,
    });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(400);
    expect(body.error).toContain("Unsupported message type");
  });
});

// ===========================================================================
// Feed endpoints
// ===========================================================================
describe("GET /v1/feed", () => {
  it("returns global feed", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { hash: "h1", tid: "1", type: 1, text: "Hello", timestamp: new Date(), username: "alice" },
        { hash: "h2", tid: "2", type: 1, text: "World", timestamp: new Date(), username: null },
      ],
    });

    const res = await server.inject({ method: "GET", url: "/v1/feed" });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.tweets).toHaveLength(2);
    expect(body.tweets[0].hash).toBe("h1");
  });

  it("respects limit parameter", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    await server.inject({ method: "GET", url: "/v1/feed?limit=5" });

    const queryCall = mockQuery.mock.calls[0];
    expect(queryCall[1]).toContain(5);
  });

  it("caps limit at 100", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    await server.inject({ method: "GET", url: "/v1/feed?limit=999" });

    const queryCall = mockQuery.mock.calls[0];
    expect(queryCall[1]).toContain(100);
  });
});

describe("GET /v1/feed/:tid", () => {
  it("returns user-specific feed", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { hash: "h1", tid: "42", type: 1, text: "My tweet", timestamp: new Date(), username: "bob" },
      ],
    });

    const res = await server.inject({ method: "GET", url: "/v1/feed/42" });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.tweets).toHaveLength(1);
    expect(body.tweets[0].tid).toBe("42");
  });
});

describe("GET /v1/messages/:hash", () => {
  it("returns message by hash", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ hash: "abc", tid: "1", type: 1, text: "Found it", timestamp: new Date() }],
    });

    const res = await server.inject({ method: "GET", url: "/v1/messages/abc" });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.hash).toBe("abc");
  });

  it("returns 404 when not found", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await server.inject({ method: "GET", url: "/v1/messages/missing" });

    expect(res.statusCode).toBe(404);
  });
});

// ===========================================================================
// Search endpoint
// ===========================================================================
describe("GET /v1/search", () => {
  it("returns matching tweets", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ hash: "s1", tid: "1", type: 1, text: "tribe rocks", timestamp: new Date() }],
    });

    const res = await server.inject({ method: "GET", url: "/v1/search?q=tribe" });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.tweets).toHaveLength(1);
    expect(body.query).toBe("tribe");
  });

  it("rejects queries shorter than 2 chars", async () => {
    const res = await server.inject({ method: "GET", url: "/v1/search?q=a" });

    expect(res.statusCode).toBe(400);
  });
});

// ===========================================================================
// Channels endpoint
// ===========================================================================
describe("GET /v1/channels", () => {
  it("returns channel list with message counts", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { channel_id: "general", message_count: 15, last_message_at: new Date() },
        { channel_id: "dev", message_count: 8, last_message_at: new Date() },
      ],
    });

    const res = await server.inject({ method: "GET", url: "/v1/channels" });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.channels).toHaveLength(2);
    expect(body.channels[0].channel_id).toBe("general");
    expect(body.channels[0].message_count).toBe(15);
  });
});

// ===========================================================================
// Replies endpoint
// ===========================================================================
describe("GET /v1/replies", () => {
  it("returns replies for a message hash", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [{ hash: "r1", tid: "2", type: 1, text: "nice!", parent_hash: "parent1" }],
      })
      .mockResolvedValueOnce({ rows: [{ count: 1 }] });

    const res = await server.inject({ method: "GET", url: "/v1/replies?hash=parent1" });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.replies).toHaveLength(1);
    expect(body.count).toBe(1);
  });

  it("returns 400 without hash parameter", async () => {
    const res = await server.inject({ method: "GET", url: "/v1/replies" });

    expect(res.statusCode).toBe(400);
  });
});

// ===========================================================================
// Social endpoints
// ===========================================================================
describe("GET /v1/followers/:tid", () => {
  it("returns followers as canonical users", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ follower_tid: "10" }] })
      .mockResolvedValueOnce({
        rows: [
          {
            tid: "10",
            custody_address: "abc",
            recovery_address: null,
            registered_at: null,
            username: "alice",
            following_count: "0",
            followers_count: "1",
            display_name: null,
            pfp_url: null,
            bio: null,
            profile: {},
          },
        ],
      });

    const res = await server.inject({ method: "GET", url: "/v1/followers/42" });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.users).toHaveLength(1);
    expect(body.users[0].tid).toBe("10");
    expect(body.users[0].username).toBe("alice");
    expect(body.total).toBe(1);
  });
});

describe("GET /v1/following/:tid", () => {
  it("returns following as canonical users", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ following_tid: "20" }] })
      .mockResolvedValueOnce({
        rows: [
          {
            tid: "20",
            custody_address: "def",
            recovery_address: null,
            registered_at: null,
            username: "bob",
            following_count: "0",
            followers_count: "0",
            display_name: null,
            pfp_url: null,
            bio: null,
            profile: {},
          },
        ],
      });

    const res = await server.inject({ method: "GET", url: "/v1/following/42" });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.users).toHaveLength(1);
    expect(body.users[0].tid).toBe("20");
    expect(body.users[0].username).toBe("bob");
    expect(body.total).toBe(1);
  });
});

// ===========================================================================
// Users endpoints
// ===========================================================================
describe("GET /v1/users", () => {
  it("returns user list with total count", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          { tid: "1", custody_address: "abc", username: "alice", following_count: "3", followers_count: "5" },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ total: 1 }] });

    const res = await server.inject({ method: "GET", url: "/v1/users" });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.users).toHaveLength(1);
    expect(body.total).toBe(1);
  });
});

describe("GET /v1/user/:tid", () => {
  it("returns user when found locally", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ tid: "42", custody_address: "abc", username: "bob", following_count: "2", followers_count: "3" }],
    });
    // user_data lookup follow-up
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await server.inject({ method: "GET", url: "/v1/user/42" });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.tid).toBe("42");
    expect(body.username).toBe("bob");
    expect(body.profile).toEqual({});
  });

  it("returns 404 when not found locally and not on-chain", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    // Backfill fails (Connection.getAccountInfo returns null from global mock)
    mockQuery.mockResolvedValueOnce({ rows: [] }); // re-query after backfill

    const res = await server.inject({ method: "GET", url: "/v1/user/999" });

    expect(res.statusCode).toBe(404);
  });
});

describe("GET /v1/tid-by-wallet/:address", () => {
  it("rejects malformed addresses with 400", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/v1/tid-by-wallet/not-a-real-address",
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns canonical user row(s) for the wallet", async () => {
    const validAddress = "11111111111111111111111111111111";
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          tid: "77",
          custody_address: validAddress,
          recovery_address: null,
          registered_at: null,
          username: "carol",
          following_count: "0",
          followers_count: "0",
          display_name: null,
          pfp_url: null,
          bio: null,
          profile: {},
        },
      ],
    });

    const res = await server.inject({
      method: "GET",
      url: `/v1/tid-by-wallet/${validAddress}`,
    });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.users).toHaveLength(1);
    expect(body.users[0].tid).toBe("77");
    expect(body.users[0].username).toBe("carol");
    expect(body.total).toBe(1);
  });

  it("returns empty list when no TID is registered to the wallet", async () => {
    const validAddress = "11111111111111111111111111111111";
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await server.inject({
      method: "GET",
      url: `/v1/tid-by-wallet/${validAddress}`,
    });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.users).toEqual([]);
    expect(body.total).toBe(0);
  });
});

// ===========================================================================
// Peers endpoints
// ===========================================================================
describe("GET /v1/peers", () => {
  it("returns peer list from database", async () => {
    const peerRow = { hub_id: "hub-abc", url: "ws://peer1:4000/gossip", last_seen: new Date(), message_count: 100 };
    mockQuery.mockResolvedValue({ rows: [peerRow] });

    const res = await server.inject({ method: "GET", url: "/v1/peers" });
    const body = JSON.parse(res.body);

    // Reset to avoid leaking into next test
    mockQuery.mockReset();

    expect(res.statusCode).toBe(200);
    expect(body).toHaveProperty("hubId");
    expect(body.connectedCount).toBe(0);
    // Peers come from DB query; verify the response structure
    expect(body).toHaveProperty("peers");
    expect(Array.isArray(body.peers)).toBe(true);
  });
});

describe("POST /v1/peers", () => {
  it("accepts valid peer URL", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/v1/peers",
      payload: { url: "ws://peer2:4000/gossip" },
    });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.ok).toBe(true);
  });

  it("rejects missing URL", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/v1/peers",
      payload: {},
    });

    expect(res.statusCode).toBe(400);
  });

  it("rejects invalid URL format", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/v1/peers",
      payload: { url: "not-a-url" },
    });

    expect(res.statusCode).toBe(400);
  });
});

describe("GET /v1/sync/status", () => {
  it("returns sync state with peers", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { peer_hub_id: "hub-abc", last_sync_hash: "h1", last_sync_at: new Date(), url: "ws://peer1:4000", message_count: 50 },
      ],
    });

    const res = await server.inject({ method: "GET", url: "/v1/sync/status" });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body).toHaveProperty("hubId");
    expect(body.syncStates).toHaveLength(1);
  });
});

describe("GET /v1/reels", () => {
  it("defaults to chronological sort", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { hash: "r1", tid: "1", timestamp: 1000, reply_count: 0, reaction_count: 0, bookmark_count: 0 },
      ],
    });

    const res = await server.inject({ method: "GET", url: "/v1/reels" });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.reels).toHaveLength(1);
    // Default sort is ORDER BY m.timestamp DESC — no CTE wrapping.
    const sql = mockQuery.mock.calls[0][0] as string;
    expect(sql).toContain("ORDER BY m.timestamp DESC");
    expect(sql).not.toContain("WITH ranked");
  });

  it("ranks by engagement when sort=engagement", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { hash: "hot", tid: "1", timestamp: Date.now(), reply_count: 3, reaction_count: 50, bookmark_count: 10, score: 12.3 },
        { hash: "cold", tid: "2", timestamp: Date.now(), reply_count: 0, reaction_count: 1, bookmark_count: 0, score: 0.2 },
      ],
    });

    const res = await server.inject({ method: "GET", url: "/v1/reels?sort=engagement" });
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    const sql = mockQuery.mock.calls[0][0] as string;
    expect(sql).toContain("WITH ranked");
    expect(sql).toContain("score");
    expect(sql).toContain("ORDER BY score DESC");
    // 14-day window is the second param after limit
    const params = mockQuery.mock.calls[0][1] as (string | number)[];
    expect(params[1]).toBeLessThan(Date.now());
    expect(params[1]).toBeGreaterThan(Date.now() - 15 * 24 * 60 * 60 * 1000);
    // Cursor is returned only when full page (limit 20); 2 rows means no cursor
    expect(body.cursor).toBeUndefined();
    expect(body.reels[0].hash).toBe("hot");
  });

  it("returns base64url cursor when engagement page is full", async () => {
    const rows = Array.from({ length: 20 }, (_, i) => ({
      hash: `h${i}`,
      tid: "1",
      timestamp: Date.now(),
      reply_count: 0,
      reaction_count: 0,
      bookmark_count: 0,
      score: 20 - i,
    }));
    mockQuery.mockResolvedValueOnce({ rows });

    const res = await server.inject({ method: "GET", url: "/v1/reels?sort=engagement" });
    const body = JSON.parse(res.body);

    expect(body.cursor).toBeDefined();
    const decoded = JSON.parse(Buffer.from(body.cursor, "base64url").toString("utf8"));
    expect(decoded.score).toBe(1); // last row in the page
    expect(decoded.hash).toBe("h19");
  });

  it("paginates engagement cursor with score+hash tiebreak", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const cursor = Buffer.from(JSON.stringify({ score: 5.5, hash: "abc" }), "utf8").toString("base64url");
    await server.inject({ method: "GET", url: `/v1/reels?sort=engagement&cursor=${encodeURIComponent(cursor)}` });

    const sql = mockQuery.mock.calls[0][0] as string;
    expect(sql).toContain("score < $3");
    expect(sql).toContain("hash > $4");
    const params = mockQuery.mock.calls[0][1] as (string | number)[];
    expect(params[2]).toBe(5.5);
    expect(params[3]).toBe("abc");
  });

  it("rejects invalid engagement cursor", async () => {
    const res = await server.inject({ method: "GET", url: "/v1/reels?sort=engagement&cursor=not-a-cursor" });
    expect(res.statusCode).toBe(400);
    // db.query should never be reached for an invalid cursor
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

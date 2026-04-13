# tribe-hub

Decentralized hub for the Tribe protocol. Stores tweets, indexes Solana events, and syncs with peer hubs via a gossip protocol.

A hub is a node on the Tribe network. Anyone can run one. Hubs sync with each other -- if one goes down, others still have the data.

## What It Does

- **Stores tweets** (signed messages) in PostgreSQL, validates ed25519 signatures against on-chain app keys
- **Indexes Solana events** (TID registrations, follows, unfollows) via WebSocket subscription
- **Syncs with peer hubs** via a gossip protocol (HAVE/WANT message exchange)
- **Serves a REST API** for apps to read feeds, user profiles, search, and submit messages
- **Serves a WebSocket API** for real-time updates

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/submit` | Submit a signed message (tweet, reaction) |
| GET | `/v1/feed` | Global feed |
| GET | `/v1/feed/:tid` | User's tweet feed |
| GET | `/v1/feed/channel/:id` | Channel feed |
| GET | `/v1/messages/:hash` | Single message by hash |
| GET | `/v1/search?q=` | Text search |
| GET | `/v1/replies?hash=` | Thread replies |
| GET | `/v1/channels` | Channel list |
| GET | `/v1/user/:tid` | User profile |
| GET | `/v1/users` | All users |
| GET | `/v1/followers/:tid` | Followers list |
| GET | `/v1/following/:tid` | Following list |
| GET | `/v1/peers` | Connected peers |
| GET | `/v1/sync/status` | Sync state per peer |
| POST | `/v1/upload` | Media upload |
| GET | `/v1/media/:hash` | Serve uploaded media |
| GET | `/health` | Hub health |
| WS | `/gossip` | Gossip peer connection |
| WS | `/v1/ws` | Client WebSocket (real-time events) |

## Gossip Protocol

Hubs connect to each other via WebSocket and exchange messages:

1. **HAVE** -- periodically broadcast hashes of recent messages
2. **WANT** -- request messages by hash that this hub doesn't have
3. **MESSAGES** -- send full message data in response to WANT

Features:
- Automatic reconnection with exponential backoff
- Deduplication (messages tracked by `received_from` hub ID)
- Per-peer sync state tracking (`last_sync_hash`, `last_sync_at`)

## Project Structure

```
src/
  index.ts                    # Bootstrap (migrations, listeners, gossip, server)
  server.ts                   # Fastify setup + CORS
  config.ts                   # Environment configuration
  api/
    routes/
      feed.ts                 # Feed, messages, search, channels, replies
      users.ts                # User profiles, user list
      social.ts               # Followers, following
      submit.ts               # Message submission + validation
      upload.ts               # Media upload/download
      peers.ts                # Peer list, sync status
      health.ts               # Health check
    ws.ts                     # Client WebSocket API
  gossip/
    peer-manager.ts           # Peer connections, reconnection, scheduling
    protocol.ts               # HAVE/WANT/MESSAGES exchange
    sync.ts                   # Sync state persistence
  solana/
    listener.ts               # Subscribe to program logs, parse Anchor events
  storage/
    db.ts                     # PostgreSQL pool + migrations
    media-store.ts            # Disk-based media storage
    migrations/
      001_hub.sql             # Schema: messages, sync_state, peers, social_graph
  validation/
    app-key-cache.ts          # In-memory cache of on-chain app keys (60s TTL)
    verifier.ts               # Signature verification pipeline
```

## Getting Started

```bash
# Start PostgreSQL
docker compose up -d    # or use deploy/docker-compose.node.yml

# Configure
cp .env.example .env    # edit DATABASE_URL, SOLANA_RPC_URL, PEERS

# Run
pnpm install
pnpm dev                # http://localhost:4000
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | HTTP port |
| `HUB_ID` | random | Unique hub identifier |
| `DATABASE_URL` | `postgresql://tribe:tribe@localhost:5436/tribe_hub` | PostgreSQL |
| `SOLANA_RPC_URL` | devnet | Solana JSON-RPC |
| `SOLANA_WS_URL` | devnet | Solana WebSocket |
| `PEERS` | (none) | Comma-separated peer gossip URLs |
| `GOSSIP_INTERVAL_MS` | `5000` | How often to send HAVE messages |
| `MAX_SYNC_BATCH_SIZE` | `100` | Max messages per sync batch |
| `MEDIA_DIR` | `./data/media` | Media storage directory |

## Multi-Node Setup

Point each hub at the other via the `PEERS` env var:

- Node A: `PEERS=wss://hub-b.example.com/gossip`
- Node B: `PEERS=wss://hub-a.example.com/gossip`

Both hubs will continuously sync. See `deploy/setup-node.sh` in the root repo for automated setup.

## License

MIT

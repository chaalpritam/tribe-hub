# tribe-hub

Decentralized hub for TribeEco. Combined tweet storage + Solana event indexer + gossip peer sync.

## Stack

- Fastify HTTP server (port 4000)
- PostgreSQL 16 for storage
- TypeScript, pnpm, node:20

## Key Directories

- `src/api/routes/` — REST API routes (tweets, peers, sync, health)
- `src/gossip/` — Gossip protocol (protocol.ts, peer-manager.ts, sync.ts)
- `src/storage/` — Database queries and migrations
- `src/config.ts` — Environment config

## API Endpoints

- `GET /health` — Health check
- `GET /v1/peers` — List known peers with connection status
- `POST /v1/peers` — Add a peer at runtime `{ "url": "ws://..." }`
- `GET /v1/sync/status` — Sync state per peer
- `GET /gossip` — WebSocket endpoint for hub-to-hub gossip
- `GET /v1/ws` — WebSocket endpoint for client real-time updates

## Gossip Protocol

Pull-based protocol with 5 message types: hello, have, want, messages, ping/pong.

- Peers configured via `PEERS` env var or `POST /v1/peers`
- Auto-reconnection with exponential backoff (RECONNECT_DELAY_MS, default 10s)
- Periodic broadcasts every GOSSIP_INTERVAL_MS (default 5s)
- Keep-alive pings every PING_INTERVAL_MS (default 30s)
- Received messages validated (signature + app key) before storage

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| PORT | 4000 | Server port |
| HUB_ID | hub-{random} | Unique hub identifier |
| PEERS | (empty) | Comma-separated peer WebSocket URLs |
| DATABASE_URL | — | PostgreSQL connection string |
| SOLANA_RPC_URL | — | Solana RPC endpoint |
| SOLANA_WS_URL | — | Solana WebSocket endpoint |
| GOSSIP_INTERVAL_MS | 5000 | Gossip broadcast interval |
| RECONNECT_DELAY_MS | 10000 | Peer reconnection delay |
| PING_INTERVAL_MS | 30000 | Keep-alive ping interval |
| MAX_SYNC_BATCH_SIZE | 100 | Max messages per gossip batch |

## Docker

- `Dockerfile` — Multi-stage build: pnpm install → pnpm build → node dist/index.js
- Exposes port 4000
- Migrations auto-applied on startup

## Seed Node

When deployed as a seed node (`deploy/seed/docker-compose.seed.yml`), runs with HUB_ID=seed-1 and no PEERS. Home nodes connect to it; it doesn't initiate outbound connections.

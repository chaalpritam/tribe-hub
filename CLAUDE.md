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
- `GET /v1/sync/status` — Sync state per peer plus our own message + DM totals and a coverage % (= local store / peer total, capped at 100). Probes each peer's `/health` for their total.
- `POST /v1/sync/trigger` — `{ peer?: "<hub-id>" | "all", sinceMs?: number }`. Calls `broadcastHaveSince` to send a wider "have" frame for everything since `Date.now() - sinceMs` (default 30d) to one connected peer or every connected peer. Used by `tribe sync --peer …`.
- `GET /v1/stories` — Active stories across all authors (24h TTL); grouped by author, newest-first within
- `GET /v1/stories/:tid` — One user's active stories, oldest-first (story-pager order)
- `GET /v1/stories/:hash/viewers` — "Seen by" list; pass `?viewer_tid=` to self-gate (non-author requests get 403)
- `GET /v1/reels` — Paginated feed of `post_kind='reel'` tweets. `?sort=recent` (default) is newest-first; `?sort=engagement` reads from `reels_engagement_cache` — top 500 reels by `(reactions + bookmarks*2 + replies) / (hours+2)^1.5` over the last 14 days, refreshed every 5 min by `src/storage/reels-cache.ts`. Engagement cursors are integer rank strings; recent cursors are plain timestamp strings — not interchangeable. Engagement falls back to a live (uncached) query when the cache is empty on the first page (~30s after boot).
- `GET /gossip` — WebSocket endpoint for hub-to-hub gossip
- `GET /v1/ws` — WebSocket endpoint for client real-time updates

## Stories + Reels (Phase 3)

- Stories live as `STORY_ADD = 33` envelopes → `stories` table with hub-stamped `expires_at = created_at + 24h`. Hourly `DELETE WHERE expires_at < now()` cron in `src/storage/stories-cleanup.ts` reaps expired rows; `story_views` (`STORY_VIEW = 34`) cascades.
- Reels are `TWEET_ADD` with `body.post_kind='reel'`. Same envelope kind as a plain tweet so reactions / replies / bookmarks all work for free; `/v1/reels` filters on the column.
- `/v1/upload` accepts `image/jpeg`, `image/png`, `image/gif`, `image/webp` up to 5 MB; `video/mp4` and `video/quicktime` up to 100 MB.
- Optional `body.location` and `body.audio_title` on TWEET_ADD persist as nullable columns on `messages`.

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

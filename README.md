# tribe-hub

Decentralized hub for the Tribe protocol. Stores tweets, indexes Solana events, and syncs with peer hubs via a gossip protocol.

A hub is a node on the Tribe network. Anyone can run one. Hubs sync with each other -- if one goes down, others still have the data.

## What It Does

- **Stores signed messages** (tweets, reactions, DMs, bookmarks, polls, events, tasks, crowdfunds, tips, channel ops, profile fields) in PostgreSQL, validating ed25519 signatures against on-chain app keys
- **Indexes Solana events** (TID registrations, follows, unfollows) via WebSocket subscription
- **Syncs with peer hubs** via a pull-based gossip protocol (hello / have / want / messages / ping)
- **Serves a REST API** for apps to read feeds, profiles, DMs, polls, events, tasks, crowdfunds, tips, bookmarks, notifications, karma, and search
- **Serves a WebSocket API** for real-time updates

## API Endpoints

### Core
| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/submit` | Submit a signed message (any `TribeMessage`) |
| GET | `/v1/feed` | Global feed |
| GET | `/v1/feed/:tid` | User's tweet feed |
| GET | `/v1/feed/channel/:id` | Channel feed |
| GET | `/v1/messages/:hash` | Single message by hash |
| GET | `/v1/search?q=` | Text search across tweets/users/channels |
| GET | `/v1/replies?hash=` | Thread replies |
| GET | `/v1/channels` | Channel list |

### Identity & Social
| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/user/:tid` | User profile |
| GET | `/v1/users` | All users |
| GET | `/v1/users/:tid/karma` | Aggregated karma score for a TID (off-chain) |
| GET | `/v1/karma/onchain/:tid` | On-chain karma counters from karma-registry |
| GET | `/v1/karma/onchain/:tid/proofs` | Audit trail of every credit (filter by kind) |
| GET | `/v1/followers/:tid` | Followers list |
| GET | `/v1/following/:tid` | Following list |

### Messaging & Bookmarks
| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/dms/keys` | Register x25519 DM pubkey |
| GET | `/v1/dms/keys/:tid` | Look up a TID's DM pubkey |
| GET | `/v1/dms/:tid` | Inbox / conversations |
| POST | `/v1/dms/groups` | Create a group DM |
| POST | `/v1/dms/read` | Mark messages as read (receipts) |
| GET | `/v1/bookmarks/:tid` | Bookmarked tweets for a TID |

### Community Primitives
| Method | Path | Description |
|--------|------|-------------|
| GET / POST | `/v1/polls` | List or create polls (off-chain envelopes); vote |
| GET | `/v1/polls/onchain` | List on-chain polls with total vote counts inline |
| GET | `/v1/polls/onchain/:pda` | Single poll with aggregated tallies + total votes |
| GET | `/v1/polls/onchain/creator/:tid` | Polls created by a TID |
| GET | `/v1/polls/onchain/voter/:tid` | Votes a TID has cast on chain |
| GET | `/v1/polls/onchain/:pda/votes` | All votes on a specific poll |
| GET / POST | `/v1/events` | List or create events (off-chain envelopes); RSVP |
| GET | `/v1/events/onchain` | List on-chain events with RSVP counts (filter by creator_tid; defaults to upcoming) |
| GET | `/v1/events/onchain/:pda` | Single event with yes/no/maybe counts |
| GET | `/v1/events/onchain/creator/:tid` | Events created by a TID |
| GET | `/v1/events/onchain/attendee/:tid` | Events a TID has RSVPed to |
| GET | `/v1/events/onchain/:pda/rsvps` | All RSVPs on a specific event (filter by status) |
| GET / POST | `/v1/tasks` | List or create tasks (off-chain envelopes); claim/complete |
| GET | `/v1/tasks/onchain` | List on-chain tasks (filter by status / creator_tid) |
| GET | `/v1/tasks/onchain/:pda` | Single task by PDA |
| GET | `/v1/tasks/onchain/creator/:tid` | Tasks created by a TID |
| GET | `/v1/tasks/onchain/claimer/:tid` | Tasks claimed by a TID |
| GET / POST | `/v1/crowdfunds` | List or create crowdfunds (off-chain envelopes); pledge |
| GET | `/v1/crowdfunds/onchain` | List on-chain campaigns (filter by status / creator_tid) |
| GET | `/v1/crowdfunds/onchain/:pda` | Single campaign by PDA |
| GET | `/v1/crowdfunds/onchain/:pda/pledges` | Pledges on a campaign |
| GET | `/v1/crowdfunds/onchain/backer/:tid` | A TID's pledges across campaigns |
| GET / POST | `/v1/tips` | Send and query tips (off-chain envelopes) |
| GET | `/v1/tips/onchain/sent/:tid` | TipRecord PDAs the TID sent on chain |
| GET | `/v1/tips/onchain/received/:tid` | TipRecord PDAs the TID received on chain |
| GET | `/v1/tips/onchain/target/:hash` | On-chain tips for a content hash + total lamports |
| GET | `/v1/notifications/:tid` | Per-TID notification feed |

### Network & Media
| Method | Path | Description |
|--------|------|-------------|
| GET / POST | `/v1/peers` | List peers / add a peer at runtime |
| GET | `/v1/sync/status` | Sync state per peer |
| POST | `/v1/upload` | Media upload |
| GET | `/v1/media/:hash` | Serve uploaded media |
| GET | `/health` | Hub health |
| GET | `/metrics` | Prometheus metrics (text format) — scraped at any interval; allowlisted from rate limits |
| WS | `/gossip` | Hub-to-hub gossip |
| WS | `/v1/ws` | Client WebSocket (real-time events) |

## Message integrity

`POST /v1/submit` accepts an optional `dataB64` field — base64 of the exact bytes the client hashed. When present, the hub recomputes `blake3(dataB64)` and rejects the request unless it matches the claimed `hash`. This catches a relay (or compromised intermediary) that tampered with `(hash, signature)` without producing a matching `dataB64`.

When `dataB64` is **JSON-encoded** (first byte `{`), the hub also parses it and uses the decoded value as the authoritative `message.data`, ignoring whatever `data` field rode along on the wire. That closes the client-side `data ≠ dataB64` attack: even a client that builds a malicious `data` field is forced to project from the bytes the signer actually authenticated.

When `dataB64` is **protobuf-encoded**, the hub decodes via the vendored `tribe-sdk` proto schema and converts the camelCase fields back to the snake_case wire shape so the same projection-from-decoded-bytes path runs. Status is reported via `decoded_proto`. JSON and proto paths now have parity for SDK-style and tribe-app-style traffic.

`dataB64` is **optional** during the rollout. Status is reported via `tribe_hub_validation_databytes_status_total{status=present|absent|mismatch|invalid_base64|decoded_json|decoded_proto}` so operators can watch migration progress before flipping the field to required.

The same integrity check runs on the **gossip path** (phase 3.4): incoming gossip envelopes can carry `dataB64`, the receiving hub recomputes blake3 and (for JSON-encoded bytes) projects from the decoded values, and the bytes are persisted in the `signed_envelopes` table so the hub can re-emit them with full integrity to other peers. Pre-3.4 peers don't carry `dataB64` and fall back to the projected fields with no integrity check.

The **DM submit + gossip routes** (`/v1/dm/send`, `/v1/dm/groups`, `/v1/dm/read`, etc.) now share the same envelope baseline as the tweet/reaction submit path via `verifyEnvelopeBaseline`. DM gossip envelopes carry `dataB64` and the receiver recomputes blake3 + (for JSON-encoded bytes) overrides ciphertext / nonce / sender_x25519 / recipient_tid from the decoded body before storage — a tampered relay can no longer substitute a different ciphertext past us.

## Channels

Every `TWEET_ADD` must carry a non-empty `channel_id`; the submit route rejects empty values. The reserved channel id `"general"` is seeded by migration 013 on startup — it's the protocol-wide default and the target for every tweet that isn't tied to a city or interest group.

`CHANNEL_ADD` carries a `kind`:

| Kind | Value | Use |
|------|-------|-----|
| `GENERAL`  | 1 | Reserved for the seeded `general` channel; rejected on `CHANNEL_ADD`. |
| `CITY`     | 2 | Hyperlocal channel; persists `latitude` / `longitude`. |
| `INTEREST` | 3 | Topic / community channel. Default when `kind` is omitted. |

The `channels` table exposes `kind`, `latitude`, and `longitude` via `GET /v1/channels`, `GET /v1/channels/:id`, and `GET /v1/channels/member/:tid`.

For globally-unique on-chain ownership, hit:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/channels/onchain` | List on-chain channels (filter by kind / owner_tid) |
| GET | `/v1/channels/onchain/:pda` | Single channel by PDA |
| GET | `/v1/channels/onchain/by-id/:id` | Slug-based lookup (derives PDA, joins off-chain metadata) |
| GET | `/v1/channels/onchain/owner/:tid` | Channels owned by a TID |

## Solana log indexer

Two paths feed the on-chain mirror tables:

1. **Live subscription.** `connection.onLogs(programId, …)` per program, parsed for Anchor events (`Program data: …`), dispatched to the program-specific handler. Each successful event advances `solana_indexer_state.last_processed_signature` so a restart knows where to resume.
2. **Startup backfill.** For every indexed program, `getSignaturesForAddress(programId, { until: cursor })` walks back from "now" toward the saved cursor, paginating in batches of `SOLANA_BACKFILL_BATCH_SIZE`. Collected signatures are reversed into chronological order and replayed through the same handlers as live. The cursor is advanced as we go, so a crash mid-backfill resumes from the last replayed signature on the next start.

Backfill runs **in the background** alongside the live subscription. Mirror tables all use PKs derived from on-chain data (PDAs, `(parent, actor)` composites, or `tx_signature`), so any overlap between live + backfilled events causes `ON CONFLICT DO NOTHING` rejections rather than double-counting.

`SOLANA_BACKFILL_LIMIT=0` disables backfill entirely (useful for tests or during initial setup before any on-chain activity exists).

## Gossip Protocol

Pull-based with five frame types: `hello` / `have` / `want` / `messages` / `ping` (+`pong`).

1. **hello** -- exchange hub IDs on connect
2. **have** -- periodically broadcast hashes of recent messages
3. **want** -- request messages this hub is missing
4. **messages** -- send full message data in response to `want`
5. **ping/pong** -- keep-alive

Features:
- Automatic reconnection with exponential backoff (`RECONNECT_DELAY_MS`)
- Periodic broadcasts every `GOSSIP_INTERVAL_MS`
- Keep-alive pings every `PING_INTERVAL_MS`
- Deduplication (messages tracked by `received_from` hub ID)
- Per-peer sync state tracking (`last_sync_hash`, `last_sync_at`)
- Received messages re-validated (signature + on-chain app key) before storage

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
      dms.ts                  # 1:1 + group DMs, key registration, read receipts
      bookmarks.ts            # Save/list bookmarked tweets
      polls.ts                # Create polls, vote, tally
      events.ts               # Create events, RSVP, list
      tasks.ts                # Create / claim / complete tasks
      crowdfunds.ts           # Crowdfund campaigns + pledges
      tips.ts                 # Send and query tips
      karma.ts                # Aggregated karma score per TID
      notifications.ts        # Per-TID notification feed
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
      001_hub.sql             # messages, sync_state, peers, social_graph
      002_dms.sql             # dm_keys, dm_conversations, dm_messages
      003_user_data.sql       # user_data (profile fields)
      004_channels.sql        # channels, channel_members
      005_bookmarks.sql       # bookmarks
      006_polls.sql           # polls, poll_votes
      007_events.sql          # events, event_rsvps
      008_tasks.sql           # tasks, task_claims, task_completions
      009_crowdfunds.sql      # crowdfunds, crowdfund_pledges
      010_tips.sql            # tips
      011_group_dms.sql       # group_dms, group_dm_members, group_dm_messages
      012_dm_read.sql         # dm_read_receipts
      013_channel_kinds.sql   # channels.kind / latitude / longitude + seed "general"
      014_onchain_tips.sql    # onchain_tip_records — mirror of tip-registry's TipRecord PDAs
      015_onchain_crowdfunds.sql # onchain_crowdfunds + onchain_crowdfund_pledges — crowdfund-registry mirror
      016_onchain_tasks.sql   # onchain_tasks — task-registry mirror with state-machine status
      017_onchain_channels.sql # onchain_channels — channel-registry ownership anchor
      018_onchain_karma.sql   # onchain_karma + onchain_karma_proofs — karma-registry mirror
      019_onchain_polls.sql   # onchain_polls + onchain_poll_votes — poll-registry mirror
      020_onchain_events.sql  # onchain_events + onchain_event_rsvps — event-registry mirror
      021_solana_indexer_state.sql # cursor table for backfill + live cursor advance
      022_onchain_events_metadata_hash.sql # bridge column linking onchain_events → events via BLAKE3 hash
      023_onchain_metadata_hash_pop.sql    # same bridge for polls / tasks / crowdfunds
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
| `GOSSIP_INTERVAL_MS` | `5000` | How often to send `have` frames |
| `RECONNECT_DELAY_MS` | `10000` | Base reconnection delay (exponential backoff) |
| `PING_INTERVAL_MS` | `30000` | Keep-alive ping interval |
| `MAX_SYNC_BATCH_SIZE` | `100` | Max messages per sync batch |
| `MAX_TWEET_TEXT_LENGTH` | `320` | Server-side tweet length cap |
| `APP_KEY_CACHE_TTL_MS` | `60000` | In-memory app key cache TTL |
| `NODE_ENV` | `development` | When `production`, missing `DATABASE_URL` / `CORS_ORIGINS` fail boot and 5xx responses hide internal errors |
| `CORS_ORIGINS` | (empty = allow all) | Comma-separated allowlist, e.g. `https://tribeapp.wtf,https://app.tribe.so`. Use `*` to opt out explicitly in production |
| `BODY_LIMIT_BYTES` | `1048576` | Max JSON body size (1 MiB). Multipart `/v1/upload` is unaffected |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rolling window for all rate limits (per-IP) |
| `RATE_LIMIT_GLOBAL_MAX` | `300` | Global request cap per IP per window (read endpoints) |
| `RATE_LIMIT_SUBMIT_MAX` | `30` | `POST /v1/submit` cap per IP per window |
| `RATE_LIMIT_UPLOAD_MAX` | `10` | `POST /v1/upload` cap per IP per window |
| `RATE_LIMIT_PEERS_MAX` | `5` | `POST /v1/peers` cap per IP per window |
| `MESSAGE_MAX_AGE_MS` | `604800000` (7d) | Max age of a signed message timestamp; older messages are rejected |
| `MESSAGE_MAX_FUTURE_SKEW_MS` | `300000` (5m) | Max clock skew into the future for a signed timestamp |
| `GOSSIP_MAX_FRAME_BYTES` | `1048576` | Max bytes per gossip WebSocket frame; oversized frames close the connection |
| `GOSSIP_FRAMES_PER_SEC_PER_PEER` | `100` | Sustained gossip frame rate per peer connection (token-bucket refill) |
| `GOSSIP_FRAME_BURST` | `200` | Burst capacity for the gossip token bucket |
| `APP_KEY_NEGATIVE_CACHE_TTL_MS` | `30000` | TTL for caching "no such app key" results to spare RPC budget; `0` disables |
| `REQUIRE_DATA_B64` | `false` | When `true`, reject any submit/gossip envelope that omits `dataB64`. Flip once `tribe_hub_validation_databytes_status_total{status=absent}` trends to ~0 |
| `TID_REGISTRY_PROGRAM_ID` | (devnet default) | Override `tid-registry` program ID |
| `APP_KEY_REGISTRY_PROGRAM_ID` | (devnet default) | Override `app-key-registry` program ID |
| `SOCIAL_GRAPH_PROGRAM_ID` | (devnet default) | Override `social-graph` program ID |
| `TIP_REGISTRY_PROGRAM_ID` | (placeholder default) | Override `tip-registry` program ID |
| `CROWDFUND_REGISTRY_PROGRAM_ID` | (placeholder default) | Override `crowdfund-registry` program ID |
| `TASK_REGISTRY_PROGRAM_ID` | (placeholder default) | Override `task-registry` program ID |
| `CHANNEL_REGISTRY_PROGRAM_ID` | (placeholder default) | Override `channel-registry` program ID |
| `KARMA_REGISTRY_PROGRAM_ID` | (placeholder default) | Override `karma-registry` program ID |
| `POLL_REGISTRY_PROGRAM_ID` | (real keypair default) | Override `poll-registry` program ID |
| `EVENT_REGISTRY_PROGRAM_ID` | (real keypair default) | Override `event-registry` program ID |
| `SOLANA_BACKFILL_LIMIT` | `1000` | Max signatures per program to fetch on startup; `0` disables backfill |
| `SOLANA_BACKFILL_BATCH_SIZE` | `100` | Page size for `getSignaturesForAddress` during backfill |
| `MEDIA_DIR` | `./data/media` | Media storage directory |

## Multi-Node Setup

Point each hub at the other via the `PEERS` env var:

- Node A: `PEERS=wss://hub-b.example.com/gossip`
- Node B: `PEERS=wss://hub-a.example.com/gossip`

Both hubs will continuously sync. See `deploy/setup-node.sh` in the root repo for automated setup.

## License

MIT

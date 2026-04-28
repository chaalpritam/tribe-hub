import {
  Counter,
  Gauge,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from "prom-client";

export const registry = new Registry();
registry.setDefaultLabels({ service: "tribe-hub" });

collectDefaultMetrics({ register: registry });

export const httpRequestDuration = new Histogram({
  name: "tribe_hub_http_request_duration_seconds",
  help: "HTTP request duration in seconds, by route + method + status",
  labelNames: ["method", "route", "status"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [registry],
});

export const httpRequestsTotal = new Counter({
  name: "tribe_hub_http_requests_total",
  help: "HTTP requests by route + method + status",
  labelNames: ["method", "route", "status"] as const,
  registers: [registry],
});

export const gossipFramesTotal = new Counter({
  name: "tribe_hub_gossip_frames_total",
  help: "Gossip frames sent or received by frame type",
  labelNames: ["direction", "type"] as const,
  registers: [registry],
});

export const gossipFramesDroppedTotal = new Counter({
  name: "tribe_hub_gossip_frames_dropped_total",
  help: "Gossip frames dropped before processing, by reason",
  labelNames: ["reason"] as const,
  registers: [registry],
});

export const gossipMessagesStoredTotal = new Counter({
  name: "tribe_hub_gossip_messages_stored_total",
  help: "Messages successfully stored from gossip, by kind (tweet|dm)",
  labelNames: ["kind"] as const,
  registers: [registry],
});

export const gossipPeersConnected = new Gauge({
  name: "tribe_hub_gossip_peers_connected",
  help: "Number of currently connected gossip peers",
  registers: [registry],
});

export const validationRejectionsTotal = new Counter({
  name: "tribe_hub_validation_rejections_total",
  help: "Messages rejected during validation, by source + reason",
  labelNames: ["source", "reason"] as const,
  registers: [registry],
});

interface DbPoolSnapshot {
  totalCount: number;
  idleCount: number;
  waitingCount: number;
}

let dbPoolGetter: () => DbPoolSnapshot = () => ({
  totalCount: 0,
  idleCount: 0,
  waitingCount: 0,
});
interface AppKeyCacheSizes {
  positive: number;
  negative: number;
}

let appKeyCacheSizeGetter: () => AppKeyCacheSizes = () => ({
  positive: 0,
  negative: 0,
});

export const dbPoolConnections = new Gauge({
  name: "tribe_hub_db_pool_connections",
  help: "PostgreSQL connection pool connections, by state",
  labelNames: ["state"] as const,
  registers: [registry],
  collect() {
    const snap = dbPoolGetter();
    this.set({ state: "total" }, snap.totalCount);
    this.set({ state: "idle" }, snap.idleCount);
    this.set({ state: "waiting" }, snap.waitingCount);
  },
});

export const appKeyCacheSize = new Gauge({
  name: "tribe_hub_app_key_cache_entries",
  help: "Entries in the app-key cache, by kind (positive=on-chain hit, negative=miss)",
  labelNames: ["kind"] as const,
  registers: [registry],
  collect() {
    const sizes = appKeyCacheSizeGetter();
    this.set({ kind: "positive" }, sizes.positive);
    this.set({ kind: "negative" }, sizes.negative);
  },
});

export function observeHttpRequest(
  method: string,
  route: string,
  status: number,
  durationSeconds: number,
): void {
  const labels = { method, route, status: String(status) };
  httpRequestDuration.observe(labels, durationSeconds);
  httpRequestsTotal.inc(labels);
}

export function recordGossipFrame(
  direction: "in" | "out",
  type: string,
): void {
  gossipFramesTotal.inc({ direction, type });
}

export function recordGossipDroppedFrame(reason: string): void {
  gossipFramesDroppedTotal.inc({ reason });
}

export function recordValidationRejection(
  source: "submit" | "gossip",
  reason: string,
): void {
  validationRejectionsTotal.inc({ source, reason });
}

interface RuntimeMetricSources {
  dbPool: DbPoolSnapshot;
  appKeyCacheSize: () => AppKeyCacheSizes;
}

/**
 * Wire gauges that read live values from runtime singletons. Called once
 * at boot — the gauges' collect() callbacks then refresh on each scrape.
 */
export function bindRuntimeMetrics(sources: RuntimeMetricSources): void {
  dbPoolGetter = () => sources.dbPool;
  appKeyCacheSizeGetter = sources.appKeyCacheSize;
}

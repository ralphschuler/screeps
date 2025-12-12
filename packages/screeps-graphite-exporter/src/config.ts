export type ExporterMode = 'memory' | 'console';

export interface ExporterConfig {
  mode: ExporterMode;
  pollIntervalMs: number;
  minPollIntervalMs: number;
  memoryPath: string;
  exportFullMemory: boolean;
  shard: string;
  fetchAllShards: boolean;
  protocol: string;
  hostname: string;
  apiPort: number | undefined;
  apiPath: string;
  token?: string;
  username?: string;
  password?: string;
  graphiteUrl: string;
  graphiteApiKey: string;
  graphitePrefix: string;
}

function parseNumber(envValue: string | undefined, fallback: number): number {
  if (!envValue) return fallback;
  const numeric = Number(envValue);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function loadConfig(): ExporterConfig {
  const mode = (process.env.EXPORTER_MODE ?? 'memory').toLowerCase() as ExporterMode;
  if (mode !== 'memory' && mode !== 'console') {
    throw new Error(`Unsupported EXPORTER_MODE '${mode}'. Use 'memory' or 'console'.`);
  }

  const screepsToken = process.env.SCREEPS_TOKEN;
  const username = process.env.SCREEPS_USERNAME;
  const password = process.env.SCREEPS_PASSWORD;

  if (!screepsToken && !(username && password)) {
    throw new Error('Set SCREEPS_TOKEN or SCREEPS_USERNAME + SCREEPS_PASSWORD for authentication.');
  }

  const graphiteApiKey = process.env.GRAFANA_CLOUD_API_KEY;
  if (!graphiteApiKey) {
    throw new Error('Set GRAFANA_CLOUD_API_KEY for Grafana Cloud authentication.');
  }

  const graphiteUrl = process.env.GRAFANA_CLOUD_GRAPHITE_URL;
  if (!graphiteUrl) {
    throw new Error('Set GRAFANA_CLOUD_GRAPHITE_URL for Grafana Cloud Graphite endpoint.');
  }

  // GET /api/user/memory has a rate limit of 1440/day = 60/hour = 1/minute
  // To be safe, default to 90 seconds (40 requests/hour, well under the limit)
  // This ensures we never exhaust the rate limit quota
  const pollIntervalMs = parseNumber(process.env.EXPORTER_POLL_INTERVAL_MS, 90000);
  const minPollIntervalMs = parseNumber(process.env.EXPORTER_MIN_POLL_INTERVAL_MS, 60000);

  return {
    mode,
    pollIntervalMs,
    minPollIntervalMs: Math.max(minPollIntervalMs, 60000), // Enforce minimum 60s to respect API rate limits (1440/day = 1/min)
    memoryPath: process.env.EXPORTER_MEMORY_PATH ?? 'stats',
    exportFullMemory: (process.env.EXPORTER_MEMORY_FULL ?? 'false').toLowerCase() === 'true',
    shard: process.env.EXPORTER_SHARD ?? 'shard0',
    fetchAllShards: (process.env.EXPORTER_FETCH_ALL_SHARDS ?? 'false').toLowerCase() === 'true',
    protocol: process.env.SCREEPS_PROTOCOL ?? 'https',
    hostname: process.env.SCREEPS_HOST ?? 'screeps.com',
    apiPort: process.env.SCREEPS_PORT ? Number(process.env.SCREEPS_PORT) : undefined,
    apiPath: process.env.SCREEPS_PATH ?? '/',
    token: screepsToken,
    username,
    password,
    graphiteUrl,
    graphiteApiKey,
    graphitePrefix: process.env.GRAFANA_CLOUD_GRAPHITE_PREFIX ?? 'screeps'
  };
}

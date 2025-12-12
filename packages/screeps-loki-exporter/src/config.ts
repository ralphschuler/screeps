export interface LokiExporterConfig {
  // Screeps connection
  protocol: string;
  hostname: string;
  apiPort: number | undefined;
  apiPath: string;
  token?: string;
  username?: string;
  password?: string;
  shard: string;

  // Loki connection
  lokiUrl: string;
  lokiUsername: string;
  lokiApiKey: string;

  // Optional configuration
  extraLabels: Record<string, string>;
  batchSize: number;
  batchIntervalMs: number;
}

function parseNumber(envValue: string | undefined, fallback: number): number {
  if (!envValue) return fallback;
  const numeric = Number(envValue);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function parseLabels(labelsStr?: string): Record<string, string> {
  if (!labelsStr) return {};
  
  const labels: Record<string, string> = {};
  const pairs = labelsStr.split(',');
  
  for (const pair of pairs) {
    const [key, value] = pair.split(':').map(s => s.trim());
    if (key && value) {
      labels[key] = value;
    }
  }
  
  return labels;
}

export function loadConfig(): LokiExporterConfig {
  const screepsToken = process.env.SCREEPS_TOKEN;
  const username = process.env.SCREEPS_USERNAME;
  const password = process.env.SCREEPS_PASSWORD;

  if (!screepsToken && !(username && password)) {
    throw new Error('Set SCREEPS_TOKEN or SCREEPS_USERNAME + SCREEPS_PASSWORD for authentication.');
  }

  const lokiUrl = process.env.GRAFANA_LOKI_URL;
  if (!lokiUrl) {
    throw new Error('Set GRAFANA_LOKI_URL for Grafana Loki endpoint.');
  }

  const lokiUsername = process.env.GRAFANA_LOKI_USERNAME;
  if (!lokiUsername) {
    throw new Error('Set GRAFANA_LOKI_USERNAME for Grafana Loki authentication.');
  }

  const lokiApiKey = process.env.GRAFANA_LOKI_API_KEY;
  if (!lokiApiKey) {
    throw new Error('Set GRAFANA_LOKI_API_KEY for Grafana Loki authentication.');
  }

  return {
    protocol: process.env.SCREEPS_PROTOCOL ?? 'https',
    hostname: process.env.SCREEPS_HOST ?? 'screeps.com',
    apiPort: process.env.SCREEPS_PORT ? Number(process.env.SCREEPS_PORT) : undefined,
    apiPath: process.env.SCREEPS_PATH ?? '/',
    token: screepsToken,
    username,
    password,
    shard: process.env.SCREEPS_SHARD ?? 'shard0',
    lokiUrl,
    lokiUsername,
    lokiApiKey,
    extraLabels: parseLabels(process.env.LOKI_EXTRA_LABELS),
    batchSize: parseNumber(process.env.LOKI_BATCH_SIZE, 100),
    batchIntervalMs: parseNumber(process.env.LOKI_BATCH_INTERVAL_MS, 5000)
  };
}

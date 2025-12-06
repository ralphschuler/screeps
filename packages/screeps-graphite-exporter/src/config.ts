export type ExporterMode = 'memory' | 'console';

export interface ExporterConfig {
  mode: ExporterMode;
  pollIntervalMs: number;
  memoryPath: string;
  shard: string;
  protocol: string;
  hostname: string;
  apiPort: number | undefined;
  apiPath: string;
  token?: string;
  username?: string;
  password?: string;
  graphiteHost: string;
  graphitePort: number;
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

  const token = process.env.SCREEPS_TOKEN;
  const username = process.env.SCREEPS_USERNAME;
  const password = process.env.SCREEPS_PASSWORD;

  if (!token && !(username && password)) {
    throw new Error('Set SCREEPS_TOKEN or SCREEPS_USERNAME + SCREEPS_PASSWORD for authentication.');
  }

  return {
    mode,
    pollIntervalMs: parseNumber(process.env.EXPORTER_POLL_INTERVAL_MS, 15000),
    memoryPath: process.env.EXPORTER_MEMORY_PATH ?? 'stats',
    shard: process.env.EXPORTER_SHARD ?? 'shard0',
    protocol: process.env.SCREEPS_PROTOCOL ?? 'https',
    hostname: process.env.SCREEPS_HOST ?? 'screeps.com',
    apiPort: process.env.SCREEPS_PORT ? Number(process.env.SCREEPS_PORT) : undefined,
    apiPath: process.env.SCREEPS_PATH ?? '/',
    token,
    username,
    password,
    graphiteHost: process.env.GRAPHITE_HOST ?? 'localhost',
    graphitePort: parseNumber(process.env.GRAPHITE_PORT, 2003),
    graphitePrefix: process.env.GRAPHITE_PREFIX ?? 'screeps'
  };
}

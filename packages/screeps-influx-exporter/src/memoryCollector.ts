import { ScreepsAPI } from 'screeps-api';
import { gunzipSync } from 'zlib';
import { ExporterConfig } from './config';
import { Metrics } from './metrics';
import { Logger } from './logger';

function ingestStat(metrics: Metrics, logger: Logger, key: string, value: unknown) {
  if (typeof value === 'number') {
    metrics.recordStat(key, 'memory', value);
    return;
  }

  if (value && typeof value === 'object') {
    for (const [range, rangeValue] of Object.entries(value)) {
      if (typeof rangeValue === 'number') {
        metrics.recordStat(key, range, rangeValue);
      }
    }
    return;
  }

  logger.warn('Ignoring unsupported stat value from memory', { key, value });
}

function decodeMemory(raw: unknown, logger: Logger): any {
  if (typeof raw !== 'string') return raw as any;

  try {
    const payload = raw.startsWith('gz:')
      ? gunzipSync(Buffer.from(raw.slice(3), 'base64')).toString('utf8')
      : raw;
    return JSON.parse(payload);
  } catch (error) {
    logger.error('Failed to decode memory payload', error);
    return undefined;
  }
}

export async function startMemoryCollector(
  api: ScreepsAPI,
  config: ExporterConfig,
  metrics: Metrics,
  logger: Logger
): Promise<void> {
  const poll = async () => {
    try {
      const rawMemory = await api.memory.get(config.memoryPath, config.shard);
      const decoded = decodeMemory(rawMemory, logger);
      const stats = decoded?.stats ?? decoded;

      if (stats && typeof stats === 'object') {
        for (const [key, value] of Object.entries(stats as Record<string, unknown>)) {
          ingestStat(metrics, logger, key, value);
        }
        metrics.markScrapeSuccess('memory', true);
      } else {
        logger.warn('No stats found in memory path', { path: config.memoryPath, shard: config.shard });
        metrics.markScrapeSuccess('memory', false);
      }
    } catch (error) {
      logger.error('Failed to poll stats from Memory', error);
      metrics.markScrapeSuccess('memory', false);
    }

    // Flush metrics to InfluxDB after each poll
    metrics.flush();
  };

  await poll();
  setInterval(poll, config.pollIntervalMs);
}

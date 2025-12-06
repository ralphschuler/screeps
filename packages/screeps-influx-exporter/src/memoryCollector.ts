import { ScreepsAPI } from 'screeps-api';
import { gunzipSync } from 'zlib';
import { ExporterConfig } from './config';
import { Metrics } from './metrics';
import { Logger } from './logger';

/**
 * Recursively flatten a nested object into dot-separated keys.
 * For example: { cpu: { used: 10 } } becomes { "cpu.used": 10 }
 */
function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
  result: Record<string, number> = {}
): Record<string, number> {
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'number') {
      result[newKey] = value;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenObject(value as Record<string, unknown>, newKey, result);
    }
    // Skip arrays and other non-numeric values
  }
  return result;
}

/**
 * Extract room name from a key like "room.W1N1.energy" or "profiler.room.W1N1.avg_cpu"
 */
function extractRoomFromKey(key: string): string | null {
  // Match patterns like room.ROOMNAME.xxx or profiler.room.ROOMNAME.xxx
  const roomMatch = key.match(/(?:^|\.)(room|rooms?)\.([EW]\d+[NS]\d+)\./i);
  if (roomMatch) {
    return roomMatch[2];
  }
  return null;
}

/**
 * Extract subsystem name from keys like "profiler.subsystem.NAME.xxx"
 */
function extractSubsystemFromKey(key: string): string | null {
  const match = key.match(/profiler\.subsystem\.([^.]+)\./);
  if (match) {
    return match[1];
  }
  return null;
}

function ingestStat(metrics: Metrics, logger: Logger, key: string, value: unknown) {
  if (typeof value === 'number') {
    // Determine the range tag based on key structure
    let range = 'memory';
    const roomName = extractRoomFromKey(key);
    const subsystemName = extractSubsystemFromKey(key);

    if (roomName) {
      range = roomName;
    } else if (subsystemName) {
      range = subsystemName;
    }

    metrics.recordStat(key, range, value);
    return;
  }

  if (value && typeof value === 'object') {
    // For nested objects, flatten and ingest each value
    const flattened = flattenObject({ [key]: value });
    for (const [flatKey, flatValue] of Object.entries(flattened)) {
      // Remove the redundant prefix
      const cleanKey = flatKey.startsWith(`${key}.`) ? flatKey : flatKey;
      let range = 'memory';
      const roomName = extractRoomFromKey(cleanKey);
      const subsystemName = extractSubsystemFromKey(cleanKey);

      if (roomName) {
        range = roomName;
      } else if (subsystemName) {
        range = subsystemName;
      } else {
        // For nested objects, use the first level key as range
        const parts = cleanKey.split('.');
        if (parts.length > 1) {
          range = parts[0];
        }
      }

      metrics.recordStat(cleanKey, range, flatValue);
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
        // First, flatten the entire stats object
        const flatStats = flattenObject(stats as Record<string, unknown>);

        // Ingest all flattened stats
        for (const [key, value] of Object.entries(flatStats)) {
          ingestStat(metrics, logger, key, value);
        }

        // Also process any remaining nested objects that weren't fully flattened
        for (const [key, value] of Object.entries(stats as Record<string, unknown>)) {
          if (typeof value === 'number') {
            // Already processed in flatStats, but we record again for backward compatibility
            // with non-nested keys
          } else if (value && typeof value === 'object') {
            ingestStat(metrics, logger, key, value);
          }
        }

        metrics.markScrapeSuccess('memory', true);
        logger.info(`Processed ${Object.keys(flatStats).length} flat metrics from Memory.stats`);
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

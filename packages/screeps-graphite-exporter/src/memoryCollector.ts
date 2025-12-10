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
      let range = 'memory';
      const roomName = extractRoomFromKey(flatKey);
      const subsystemName = extractSubsystemFromKey(flatKey);

      if (roomName) {
        range = roomName;
      } else if (subsystemName) {
        range = subsystemName;
      } else {
        // For nested objects, use the first level key as range
        const parts = flatKey.split('.');
        if (parts.length > 1) {
          range = parts[0];
        }
      }

      metrics.recordStat(flatKey, range, flatValue);
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

interface RateLimitInfo {
  method: string;
  path: string;
  limit: number;
  remaining: number;
  reset: number;
  toReset: number;
}

// Constants for rate limit handling
const RATE_LIMIT_BUFFER_MS = 5000; // 5 second buffer after rate limit reset
const RATE_LIMIT_FALLBACK_BACKOFF_MS = 30000; // 30 second fallback backoff
// Maximum reasonable rate limit reset time (1 hour = 3600 seconds)
// If toReset exceeds this, it's likely already in milliseconds
const MAX_REASONABLE_RESET_SECONDS = 3600;

/**
 * Normalize the toReset value to milliseconds, handling cases where it might
 * already be in milliseconds or incorrectly calculated.
 * 
 * According to the Screeps API spec, X-RateLimit-Reset is in UTC epoch seconds,
 * so toReset (calculated as reset - current_time_seconds) should be in seconds.
 * However, if there's a bug in the screeps-api library or the server, toReset
 * might already be in milliseconds, which would cause wait times to be 1000x too long.
 * 
 * @param toReset - The time until rate limit reset (expected in seconds, but may be in milliseconds)
 * @param logger - Logger for diagnostic messages
 * @returns The time in milliseconds
 */
function normalizeToResetMs(toReset: number, logger: Logger): number {
  // If toReset is suspiciously large (> 1 hour in seconds), it's likely already in milliseconds
  // or there's a calculation error.
  if (toReset > MAX_REASONABLE_RESET_SECONDS) {
    // Convert to seconds to check if that makes sense
    const asSeconds = toReset / 1000;
    if (asSeconds > 0 && asSeconds <= MAX_REASONABLE_RESET_SECONDS) {
      // This was likely already in milliseconds - log warning and return as-is
      logger.warn('Rate limit toReset appears to already be in milliseconds', {
        rawToReset: toReset,
        asSeconds: asSeconds
      });
      return toReset;
    }
    // Still too large even as milliseconds - cap it to avoid excessive waits
    logger.error('Rate limit toReset is unreasonably large, capping to 1 hour', {
      rawToReset: toReset,
      cappedSeconds: MAX_REASONABLE_RESET_SECONDS
    });
    return MAX_REASONABLE_RESET_SECONDS * 1000;
  }
  // Normal case: toReset is in seconds, convert to milliseconds
  return toReset * 1000;
}

export async function startMemoryCollector(
  api: ScreepsAPI,
  config: ExporterConfig,
  metrics: Metrics,
  logger: Logger
): Promise<void> {
  let timeoutHandle: NodeJS.Timeout | null = null;
  let lastRateLimitInfo: RateLimitInfo | null = null;

  // Listen to rate limit events from the API
  api.on('rateLimit', (rateLimitInfo: RateLimitInfo) => {
    // Validate rate limit info has valid numeric values
    if (
      typeof rateLimitInfo === 'object' &&
      typeof rateLimitInfo.limit === 'number' &&
      typeof rateLimitInfo.remaining === 'number' &&
      typeof rateLimitInfo.reset === 'number' &&
      typeof rateLimitInfo.toReset === 'number' &&
      !isNaN(rateLimitInfo.limit) &&
      !isNaN(rateLimitInfo.remaining) &&
      !isNaN(rateLimitInfo.toReset)
    ) {
      lastRateLimitInfo = rateLimitInfo;
      
      // Only log if rate limits are being approached (< 50% remaining)
      if (rateLimitInfo.remaining < rateLimitInfo.limit * 0.5) {
        logger.info('Rate limit info', {
          remaining: rateLimitInfo.remaining,
          limit: rateLimitInfo.limit,
          resetIn: rateLimitInfo.toReset
        });
      }
    }
  });

  const calculateNextPollDelay = (): number => {
    // Start with the configured poll interval
    let delayMs = config.pollIntervalMs;

    if (lastRateLimitInfo) {
      const { remaining, limit, toReset } = lastRateLimitInfo;

      // If we've exhausted the rate limit, wait until reset
      if (remaining === 0 && toReset > 0) {
        // Add a buffer to ensure the limit has reset
        const toResetMs = normalizeToResetMs(toReset, logger);
        delayMs = toResetMs + RATE_LIMIT_BUFFER_MS;
        
        logger.warn(`Rate limit exhausted. Waiting until reset`, {
          rawToResetSeconds: toReset,
          normalizedResetMs: toResetMs,
          waitTimeSeconds: Math.round(delayMs / 1000)
        });
      }
      // If we're running low on rate limit quota (< 20% remaining)
      else if (remaining < limit * 0.2 && remaining > 0 && toReset > 0) {
        // Calculate delay to spread remaining requests evenly until reset
        // Extra safety check to prevent division by zero
        const toResetMs = normalizeToResetMs(toReset, logger);
        const safeDelay = Math.max(
          remaining > 0 ? toResetMs / remaining : config.pollIntervalMs,
          config.minPollIntervalMs
        );
        
        logger.info(`Adjusting poll interval to respect rate limits`, {
          remaining,
          limit,
          rawToResetSeconds: toReset,
          normalizedResetMs: toResetMs,
          newDelayMs: Math.round(safeDelay)
        });
        
        delayMs = Math.max(delayMs, safeDelay);
      }
    }

    // Enforce minimum poll interval
    return Math.max(delayMs, config.minPollIntervalMs);
  };

  const scheduleNextPoll = (customDelayMs?: number) => {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
    const delayMs = customDelayMs ?? calculateNextPollDelay();
    timeoutHandle = setTimeout(() => poll(), delayMs);
  };

  const poll = async () => {
    try {
      const rawMemory = await api.memory.get(config.memoryPath, config.shard);
      const decoded = decodeMemory(rawMemory, logger);
      const stats = config.exportFullMemory ? decoded : decoded?.stats ?? decoded;

      if (stats && typeof stats === 'object') {
        // Flatten the entire stats object and ingest all metrics
        const flatStats = flattenObject(stats as Record<string, unknown>);

        // Ingest all flattened stats
        for (const [key, value] of Object.entries(flatStats)) {
          ingestStat(metrics, logger, key, value);
        }

        metrics.markScrapeSuccess('memory', true);
        logger.info(`Processed ${Object.keys(flatStats).length} flat metrics from Memory.stats`);
      } else {
        logger.warn('No stats found in memory path', { path: config.memoryPath, shard: config.shard });
        metrics.markScrapeSuccess('memory', false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Handle HTTP 429 Too Many Requests
      if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('too many requests')) {
        logger.warn('Rate limit exceeded (HTTP 429)', { error: errorMessage });
        
        // If we have rate limit info, use it to calculate wait time
        // Otherwise, use a default backoff
        if (
          lastRateLimitInfo &&
          typeof lastRateLimitInfo.toReset === 'number' &&
          !isNaN(lastRateLimitInfo.toReset) &&
          lastRateLimitInfo.toReset > 0
        ) {
          const toResetMs = normalizeToResetMs(lastRateLimitInfo.toReset, logger);
          const waitMs = toResetMs + RATE_LIMIT_BUFFER_MS;
          logger.info(`Waiting ${Math.round(waitMs / 1000)}s for rate limit reset`, {
            rawToResetSeconds: lastRateLimitInfo.toReset,
            normalizedResetMs: toResetMs
          });
          scheduleNextPoll(waitMs);
          metrics.markScrapeSuccess('memory', false);
          return;
        } else {
          // Fallback: use default backoff when rate limit info is unavailable
          logger.info(`Using fallback backoff: ${RATE_LIMIT_FALLBACK_BACKOFF_MS}ms`);
          scheduleNextPoll(RATE_LIMIT_FALLBACK_BACKOFF_MS);
          metrics.markScrapeSuccess('memory', false);
          return;
        }
      }
      
      logger.error('Failed to poll stats from Memory', error);
      metrics.markScrapeSuccess('memory', false);
    }

    // Flush metrics to Grafana Cloud Graphite after each poll
    metrics.flush();
    
    // Schedule next poll with dynamic rate limit adjustment
    scheduleNextPoll();
  };

  await poll();
}

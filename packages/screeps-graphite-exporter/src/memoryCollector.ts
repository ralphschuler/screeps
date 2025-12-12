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

function ingestStat(metrics: Metrics, logger: Logger, key: string, value: unknown, shard?: string) {
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

    metrics.recordStat(key, range, value, shard);
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

      metrics.recordStat(flatKey, range, flatValue, shard);
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
 * However, if there's a bug in the screeps-api library or the server (e.g., reset
 * sent in milliseconds instead of seconds), toReset could be a huge number that
 * causes wait times to be absurdly long (hours instead of seconds).
 * 
 * @param toReset - The time until rate limit reset (expected in seconds, but may be miscalculated)
 * @param logger - Logger for diagnostic messages
 * @returns The time in milliseconds, capped to a maximum of 1 hour
 */
function normalizeToResetMs(toReset: number, logger: Logger): number {
  // Sanity check: if toReset is negative or zero, something is wrong
  if (toReset <= 0) {
    logger.warn('Rate limit toReset is negative or zero, using fallback', {
      rawToReset: toReset
    });
    return RATE_LIMIT_FALLBACK_BACKOFF_MS;
  }

  // If toReset is absurdly large (> 1 day in seconds), it's definitely a calculation error
  // This happens when reset is sent in milliseconds but the screeps-api library expects seconds
  if (toReset > 86400) { // 86400 seconds = 1 day
    logger.error('Rate limit toReset is absurdly large (> 1 day), capping to 1 hour', {
      rawToReset: toReset,
      inDays: (toReset / 86400).toFixed(2),
      cappedToSeconds: MAX_REASONABLE_RESET_SECONDS
    });
    return MAX_REASONABLE_RESET_SECONDS * 1000;
  }

  // If toReset is large but reasonable in milliseconds (e.g., 60000ms = 1 minute)
  // Check if it's between 1 hour and 1 day in "seconds" but makes sense as milliseconds
  if (toReset > MAX_REASONABLE_RESET_SECONDS && toReset <= 86400000) {
    // This might already be in milliseconds
    const asSeconds = toReset / 1000;
    if (asSeconds > 0 && asSeconds <= MAX_REASONABLE_RESET_SECONDS) {
      logger.warn('Rate limit toReset appears to already be in milliseconds', {
        rawToReset: toReset,
        asSeconds: asSeconds
      });
      return toReset; // Already in milliseconds, return as-is
    }
    // Still doesn't make sense, cap it
    logger.error('Rate limit toReset is ambiguous, capping to 1 hour', {
      rawToReset: toReset,
      cappedToSeconds: MAX_REASONABLE_RESET_SECONDS
    });
    return MAX_REASONABLE_RESET_SECONDS * 1000;
  }

  // Normal case: toReset is in seconds (0-3600), convert to milliseconds
  return toReset * 1000;
}

/**
 * Fetch available shard names from the Screeps API
 */
async function fetchAvailableShards(api: ScreepsAPI, logger: Logger): Promise<string[]> {
  try {
    const shardData = await api.raw.version() as any;
    // The response contains shard information in various formats
    // We need to extract shard names
    if (shardData && shardData.shards) {
      return shardData.shards;
    }
    
    // Fallback: try to get shard info from user info
    const userInfo = await api.me() as any;
    if (userInfo && userInfo.ok && userInfo.shards) {
      return userInfo.shards;
    }
    
    logger.warn('Unable to fetch available shards, will use configured shard only');
    return [];
  } catch (error) {
    logger.error('Failed to fetch available shards', error);
    return [];
  }
}

export async function startMemoryCollector(
  api: ScreepsAPI,
  config: ExporterConfig,
  metrics: Metrics,
  logger: Logger
): Promise<void> {
  let timeoutHandle: NodeJS.Timeout | null = null;
  let lastRateLimitInfo: RateLimitInfo | null = null;
  let availableShards: string[] = [];

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
    // Fetch available shards if we're configured to fetch all shards and haven't fetched them yet
    if (config.fetchAllShards && availableShards.length === 0) {
      availableShards = await fetchAvailableShards(api, logger);
      if (availableShards.length > 0) {
        logger.info(`Discovered ${availableShards.length} available shards: ${availableShards.join(', ')}`);
      } else {
        // Fallback to configured shard if we can't fetch available shards
        logger.warn('Failed to fetch available shards, using configured shard only');
        availableShards = [config.shard];
      }
    }

    // Determine which shards to poll
    const shardsToPoll = config.fetchAllShards && availableShards.length > 0
      ? availableShards
      : [config.shard];

    let totalMetricsProcessed = 0;
    let successfulShards = 0;
    let failedShards = 0;

    for (const shard of shardsToPoll) {
      try {
        const rawMemory = await api.memory.get(config.memoryPath, shard) as string;
        const decoded = decodeMemory(rawMemory, logger);
        const stats = config.exportFullMemory ? decoded : decoded?.stats ?? decoded;

        if (stats && typeof stats === 'object') {
          // Flatten the entire stats object and ingest all metrics
          const flatStats = flattenObject(stats as Record<string, unknown>);

          // Ingest all flattened stats with shard tag
          for (const [key, value] of Object.entries(flatStats)) {
            ingestStat(metrics, logger, key, value, shard);
          }

          metrics.markScrapeSuccess('memory', true, shard);
          totalMetricsProcessed += Object.keys(flatStats).length;
          successfulShards++;
          logger.info(`Processed ${Object.keys(flatStats).length} flat metrics from Memory.stats on ${shard}`);
        } else {
          logger.warn('No stats found in memory path', { path: config.memoryPath, shard });
          metrics.markScrapeSuccess('memory', false, shard);
          failedShards++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Handle HTTP 429 Too Many Requests
        if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('too many requests')) {
          logger.warn('Rate limit exceeded (HTTP 429)', { error: errorMessage, shard });
          
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
            metrics.markScrapeSuccess('memory', false, shard);
            return;
          } else {
            // Fallback: use default backoff when rate limit info is unavailable
            logger.info(`Using fallback backoff: ${RATE_LIMIT_FALLBACK_BACKOFF_MS}ms`);
            scheduleNextPoll(RATE_LIMIT_FALLBACK_BACKOFF_MS);
            metrics.markScrapeSuccess('memory', false, shard);
            return;
          }
        }
        
        logger.error('Failed to poll stats from Memory', { error, shard });
        metrics.markScrapeSuccess('memory', false, shard);
        failedShards++;
      }
    }

    if (shardsToPoll.length > 1) {
      logger.info(`Completed poll cycle: ${successfulShards}/${shardsToPoll.length} shards successful, ${totalMetricsProcessed} total metrics`);
    }

    // Flush metrics to Grafana Cloud Graphite after each poll
    metrics.flush();
    
    // Schedule next poll with dynamic rate limit adjustment
    scheduleNextPoll();
  };

  await poll();
}

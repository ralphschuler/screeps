import { ScreepsAPI } from 'screeps-api';
import { Metrics } from './metrics';
import { Logger } from './logger';

const STAT_LINE = /^stats:([^\s]+)\s+(-?\d+(?:\.\d+)?)\s*(\S+)?/i;

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

function recordConsoleLine(metrics: Metrics, logger: Logger, line: string) {
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(line.trim());
    
    // New format: entire stats object
    if (parsed.type === 'stats' && parsed.data && typeof parsed.data === 'object') {
      // Flatten the stats object and ingest all metrics
      const flatStats = flattenObject(parsed.data as Record<string, unknown>);
      
      let recordedCount = 0;
      for (const [key, value] of Object.entries(flatStats)) {
        // Determine the range tag based on key structure
        let range = 'console';
        const roomName = extractRoomFromKey(key);
        const subsystemName = extractSubsystemFromKey(key);

        if (roomName) {
          range = roomName;
        } else if (subsystemName) {
          range = subsystemName;
        } else {
          // For nested objects, use the first level key as range
          const parts = key.split('.');
          if (parts.length > 1) {
            range = parts[0];
          }
        }

        metrics.recordStat(key, range, value);
        recordedCount++;
      }
      
      logger.info(`Recorded ${recordedCount} stats from console`, { tick: parsed.data.tick });
      metrics.markScrapeSuccess('console', true);
      return;
    }
    
    // Legacy single-stat format: {"type": "stat", "key": "...", "value": ...}
    if (parsed.type === 'stat' && parsed.key && typeof parsed.value === 'number') {
      metrics.recordStat(parsed.key, parsed.unit ?? 'console', parsed.value);
      metrics.markScrapeSuccess('console', true);
      return;
    }
  } catch {
    // Not JSON, try legacy text format
  }

  // Legacy text format: "stats:key value unit"
  const match = STAT_LINE.exec(line.trim());
  if (!match) return;

  const [, key, value, range] = match;
  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    logger.warn('Ignoring non-numeric console stat', { key, value });
    return;
  }

  metrics.recordStat(key, range ?? 'console', numeric);
  metrics.markScrapeSuccess('console', true);
}

export async function startConsoleListener(api: ScreepsAPI, metrics: Metrics, logger: Logger): Promise<void> {
  const socket = api.socket;

  // Flush metrics every 15 seconds for console mode
  setInterval(() => {
    metrics.flush();
  }, 15000);

  socket.on('connected', () => {
    logger.info('Connected to Screeps console');
  });

  socket.on('disconnected', () => {
    logger.warn('Disconnected from Screeps console, reconnecting');
    metrics.markScrapeSuccess('console', false);
    metrics.flush();
  });

  socket.on('error', (error: unknown) => {
    logger.error('Socket error', error);
    metrics.markScrapeSuccess('console', false);
    metrics.flush();
  });

  socket.on('console', (payload: { messages?: { log?: string[] } }) => {
    const lines = payload?.messages?.log ?? [];
    lines.forEach((line) => recordConsoleLine(metrics, logger, line));
    // Flush after each batch of console messages
    if (lines.length > 0) {
      metrics.flush();
    }
  });

  // Subscribe to console events once, before connecting
  // This prevents multiple subscriptions on reconnections
  socket.subscribe('console', () => logger.info('Subscribed to console events'));

  if (typeof socket.connect === 'function') {
    await socket.connect();
  }
}

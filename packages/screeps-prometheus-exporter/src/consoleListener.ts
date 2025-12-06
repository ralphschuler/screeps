import { ScreepsAPI } from 'screeps-api';
import { Metrics } from './metrics';
import { Logger } from './logger';

const STAT_LINE = /^stats:([^\s]+)\s+(-?\d+(?:\.\d+)?)\s*(\S+)?/i;

function recordConsoleLine(metrics: Metrics, logger: Logger, line: string) {
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

  socket.on('connected', () => {
    logger.info('Connected to Screeps console');
    socket.subscribe('console', () => logger.info('Subscribed to console events'));
  });

  socket.on('disconnected', () => {
    logger.warn('Disconnected from Screeps console, reconnecting');
    metrics.markScrapeSuccess('console', false);
  });

  socket.on('error', (error: unknown) => {
    logger.error('Socket error', error);
    metrics.markScrapeSuccess('console', false);
  });

  socket.on('console', (payload: { messages?: { log?: string[] } }) => {
    const lines = payload?.messages?.log ?? [];
    lines.forEach((line) => recordConsoleLine(metrics, logger, line));
  });

  if (typeof socket.connect === 'function') {
    await socket.connect();
  }
}

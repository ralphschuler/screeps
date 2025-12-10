import { ScreepsAPI } from 'screeps-api';
import { LokiClient, LogEntry } from './lokiClient';
import { Logger } from './logger';

function parseLogLine(line: string, logger: Logger): LogEntry | null {
  // Try to parse as JSON
  try {
    const parsed = JSON.parse(line);
    
    // Must have required fields
    if (!parsed.type || !parsed.level || !parsed.message || typeof parsed.tick !== 'number') {
      return null;
    }

    // Skip stat logs - those are for the graphite exporter
    if (parsed.type === 'stat') {
      return null;
    }

    return {
      type: parsed.type,
      level: parsed.level,
      message: parsed.message,
      tick: parsed.tick,
      subsystem: parsed.subsystem,
      room: parsed.room
    };
  } catch {
    // Not JSON, skip it
    return null;
  }
}

export async function startConsoleListener(
  api: ScreepsAPI,
  lokiClient: LokiClient,
  logger: Logger
): Promise<void> {
  const socket = api.socket;

  socket.on('connected', () => {
    logger.info('Connected to Screeps console');
    socket.subscribe('console', () => logger.info('Subscribed to console events'));
  });

  socket.on('disconnected', () => {
    logger.warn('Disconnected from Screeps console, reconnecting');
  });

  socket.on('error', (error: unknown) => {
    logger.error('Socket error', error);
  });

  socket.on('console', (payload: { messages?: { log?: string[] } }) => {
    const lines = payload?.messages?.log ?? [];
    
    for (const line of lines) {
      const logEntry = parseLogLine(line, logger);
      if (logEntry) {
        lokiClient.addLog(logEntry);
      }
    }
  });

  if (typeof socket.connect === 'function') {
    await socket.connect();
  }

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    logger.info('Shutting down gracefully...');
    lokiClient.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('Shutting down gracefully...');
    lokiClient.stop();
    process.exit(0);
  });
}

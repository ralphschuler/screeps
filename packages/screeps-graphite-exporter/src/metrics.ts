import * as net from 'net';
import { ExporterConfig } from './config';
import { Logger } from './logger';

export interface Metrics {
  recordStat(stat: string, range: string, value: number): void;
  markScrapeSuccess(mode: string, success: boolean): void;
  flush(): void;
}

/**
 * Sanitize a metric name for Graphite (replace invalid characters with underscores)
 */
function sanitizeMetricName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

export function createMetrics(config: ExporterConfig, logger: Logger): Metrics {
  const pendingMetrics: Map<string, { value: number; timestamp: number }> = new Map();

  const sendToGraphite = (data: string) => {
    const socket = new net.Socket();
    socket.setTimeout(5000);

    socket.on('error', (err) => {
      logger.error('Graphite connection error', err);
      socket.destroy();
    });

    socket.on('timeout', () => {
      logger.warn('Graphite connection timeout');
      socket.destroy();
    });

    socket.connect(config.graphitePort, config.graphiteHost, () => {
      socket.write(data, () => {
        socket.end();
      });
    });
  };

  const flush = () => {
    if (pendingMetrics.size === 0) return;

    const lines: string[] = [];
    const now = Math.floor(Date.now() / 1000);

    for (const [key, { value, timestamp }] of pendingMetrics) {
      const ts = timestamp || now;
      lines.push(`${key} ${value} ${ts}`);
    }

    if (lines.length > 0) {
      const data = lines.join('\n') + '\n';
      sendToGraphite(data);
      logger.info(`Sent ${lines.length} metrics to Graphite`);
    }

    pendingMetrics.clear();
  };

  return {
    recordStat(stat: string, range: string, value: number) {
      const sanitizedStat = sanitizeMetricName(stat);
      const sanitizedRange = sanitizeMetricName(range);
      const metricName = `${config.graphitePrefix}.stat.${sanitizedStat}.${sanitizedRange}`;
      pendingMetrics.set(metricName, { value, timestamp: Math.floor(Date.now() / 1000) });
    },

    markScrapeSuccess(mode: string, success: boolean) {
      const sanitizedMode = sanitizeMetricName(mode);
      const metricName = `${config.graphitePrefix}.exporter.scrape_success.${sanitizedMode}`;
      pendingMetrics.set(metricName, { value: success ? 1 : 0, timestamp: Math.floor(Date.now() / 1000) });
    },

    flush
  };
}

import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';
import { ExporterConfig } from './config';
import { Logger } from './logger';

export interface Metrics {
  recordStat(stat: string, range: string, value: number): void;
  markScrapeSuccess(mode: string, success: boolean): void;
  flush(): void;
}

/**
 * Sanitize a tag value for InfluxDB (replace invalid characters with underscores)
 */
function sanitizeTagValue(name: string): string {
  return name.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

export function createMetrics(config: ExporterConfig, logger: Logger): Metrics {
  const influxDB = new InfluxDB({ url: config.influxUrl, token: config.influxToken });
  const writeApi: WriteApi = influxDB.getWriteApi(config.influxOrg, config.influxBucket, 's');
  writeApi.useDefaultTags({ source: 'exporter' });

  const pendingPoints: Point[] = [];

  const flush = () => {
    if (pendingPoints.length === 0) return;

    for (const point of pendingPoints) {
      writeApi.writePoint(point);
    }

    writeApi
      .flush()
      .then(() => {
        logger.info(`Sent ${pendingPoints.length} metrics to InfluxDB`);
      })
      .catch((err) => {
        logger.error('InfluxDB write error', err);
      });

    pendingPoints.length = 0;
  };

  return {
    recordStat(stat: string, range: string, value: number) {
      const sanitizedStat = sanitizeTagValue(stat);
      const sanitizedRange = sanitizeTagValue(range);
      const point = new Point(config.influxMeasurement)
        .tag('stat', sanitizedStat)
        .tag('range', sanitizedRange)
        .floatField('value', value)
        .timestamp(new Date());
      pendingPoints.push(point);
    },

    markScrapeSuccess(mode: string, success: boolean) {
      const sanitizedMode = sanitizeTagValue(mode);
      const point = new Point(config.influxMeasurement)
        .tag('type', 'scrape_success')
        .tag('mode', sanitizedMode)
        .intField('value', success ? 1 : 0)
        .timestamp(new Date());
      pendingPoints.push(point);
    },

    flush
  };
}

import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';
import { ExporterConfig } from './config';
import { Logger } from './logger';

export interface Metrics {
  recordStat(stat: string, range: string, value: number): void;
  recordStatWithTags(stat: string, value: number, tags: Record<string, string>): void;
  markScrapeSuccess(mode: string, success: boolean): void;
  flush(): void;
}

/**
 * Sanitize a tag value for InfluxDB (replace invalid characters with underscores)
 */
function sanitizeTagValue(name: string): string {
  return name.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

/**
 * Parse a stat key to extract category information.
 * Keys like "cpu.used", "room.W1N1.energy", "profiler.subsystem.kernel.avg_cpu",
 * "stats.empire.owned_rooms", "stats.room.W1N1.rcl", "stats.pheromone.W1N1.expand"
 * are parsed to extract meaningful tags.
 */
function parseStatKey(key: string): { measurement: string; category: string; subCategory: string } {
  const parts = key.split('.');

  if (parts.length === 1) {
    return { measurement: key, category: 'general', subCategory: '' };
  }

  // Handle new unified stats keys
  if (parts[0] === 'stats') {
    if (parts[1] === 'empire') {
      return { measurement: key, category: 'stats_empire', subCategory: parts[2] || '' };
    }
    if (parts[1] === 'room' && parts.length >= 3) {
      return { measurement: key, category: 'stats_room', subCategory: parts[2] };
    }
    if (parts[1] === 'subsystem' && parts.length >= 3) {
      return { measurement: key, category: 'stats_subsystem', subCategory: parts[2] };
    }
    if (parts[1] === 'role' && parts.length >= 3) {
      return { measurement: key, category: 'stats_role', subCategory: parts[2] };
    }
    if (parts[1] === 'pheromone' && parts.length >= 3) {
      return { measurement: key, category: 'stats_pheromone', subCategory: parts[2] };
    }
    if (parts[1] === 'native_calls') {
      return { measurement: key, category: 'stats_native_calls', subCategory: parts[2] || '' };
    }
    return { measurement: key, category: 'stats', subCategory: parts[1] || '' };
  }

  // Handle profiler keys (legacy)
  if (parts[0] === 'profiler') {
    if (parts[1] === 'room' && parts.length >= 3) {
      return { measurement: key, category: 'profiler_room', subCategory: parts[2] };
    }
    if (parts[1] === 'subsystem' && parts.length >= 3) {
      return { measurement: key, category: 'profiler_subsystem', subCategory: parts[2] };
    }
    return { measurement: key, category: 'profiler', subCategory: parts[1] || '' };
  }

  // Handle room keys
  if (parts[0] === 'room' && parts.length >= 2) {
    return { measurement: key, category: 'room', subCategory: parts[1] };
  }

  // Handle cpu, gcl, gpl, empire keys
  return { measurement: key, category: parts[0], subCategory: parts[1] || '' };
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
      const parsed = parseStatKey(stat);

      const point = new Point(config.influxMeasurement)
        .tag('stat', sanitizedStat)
        .tag('range', sanitizedRange)
        .tag('category', sanitizeTagValue(parsed.category))
        .floatField('value', value)
        .timestamp(new Date());

      // Add sub_category tag if present
      if (parsed.subCategory) {
        point.tag('sub_category', sanitizeTagValue(parsed.subCategory));
      }

      pendingPoints.push(point);
    },

    recordStatWithTags(stat: string, value: number, tags: Record<string, string>) {
      const sanitizedStat = sanitizeTagValue(stat);
      const point = new Point(config.influxMeasurement)
        .tag('stat', sanitizedStat)
        .floatField('value', value)
        .timestamp(new Date());

      for (const [tagKey, tagValue] of Object.entries(tags)) {
        point.tag(sanitizeTagValue(tagKey), sanitizeTagValue(tagValue));
      }

      pendingPoints.push(point);
    },

    markScrapeSuccess(mode: string, success: boolean) {
      const sanitizedMode = sanitizeTagValue(mode);
      const point = new Point(config.influxMeasurement)
        .tag('type', 'scrape_success')
        .tag('mode', sanitizedMode)
        .tag('category', 'system')
        .floatField('value', success ? 1 : 0)
        .timestamp(new Date());
      pendingPoints.push(point);
    },

    flush
  };
}

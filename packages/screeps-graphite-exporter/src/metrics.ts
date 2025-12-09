import { ExporterConfig } from './config';
import { Logger } from './logger';

export interface Metrics {
  recordStat(stat: string, range: string, value: number): void;
  recordStatWithTags(stat: string, value: number, tags: Record<string, string>): void;
  markScrapeSuccess(mode: string, success: boolean): void;
  flush(): void;
}

interface GraphiteMetric {
  name: string;
  value: number;
  time: number;
  tags: Record<string, string>;
}

/**
 * Sanitize a tag value for Graphite (replace invalid characters with underscores)
 */
function sanitizeTagValue(name: string): string {
  return name.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

/**
 * Convert a metric name to Graphite format with tags
 */
function formatGraphiteMetric(metric: GraphiteMetric): string {
  const tags = Object.entries(metric.tags)
    .map(([key, value]) => `${sanitizeTagValue(key)}=${sanitizeTagValue(value)}`)
    .join(';');
  
  const metricName = tags ? `${metric.name};${tags}` : metric.name;
  return `${metricName} ${metric.value} ${metric.time}`;
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
  const pendingMetrics: GraphiteMetric[] = [];

  const flush = async () => {
    if (pendingMetrics.length === 0) return;

    // Format metrics in Graphite plaintext format
    const metricsData = pendingMetrics.map(formatGraphiteMetric).join('\n');

    try {
      const response = await fetch(config.graphiteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Authorization': `Bearer ${config.graphiteApiKey}`
        },
        body: metricsData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      logger.info(`Sent ${pendingMetrics.length} metrics to Grafana Cloud Graphite`);
    } catch (err) {
      logger.error('Grafana Cloud Graphite write error', err);
    }

    pendingMetrics.length = 0;
  };

  return {
    recordStat(stat: string, range: string, value: number) {
      const sanitizedStat = sanitizeTagValue(stat);
      const sanitizedRange = sanitizeTagValue(range);
      const parsed = parseStatKey(stat);

      const tags: Record<string, string> = {
        source: 'exporter',
        stat: sanitizedStat,
        range: sanitizedRange,
        category: sanitizeTagValue(parsed.category)
      };

      // Add sub_category tag if present
      if (parsed.subCategory) {
        tags.sub_category = sanitizeTagValue(parsed.subCategory);
      }

      const metric: GraphiteMetric = {
        name: `${config.graphitePrefix}.${parsed.measurement}`,
        value,
        time: Math.floor(Date.now() / 1000),
        tags
      };

      pendingMetrics.push(metric);
    },

    recordStatWithTags(stat: string, value: number, tags: Record<string, string>) {
      const sanitizedStat = sanitizeTagValue(stat);
      const parsed = parseStatKey(stat);

      const allTags: Record<string, string> = {
        source: 'exporter',
        stat: sanitizedStat,
        ...tags
      };

      // Sanitize all tag values
      for (const [key, val] of Object.entries(allTags)) {
        allTags[key] = sanitizeTagValue(val);
      }

      const metric: GraphiteMetric = {
        name: `${config.graphitePrefix}.${parsed.measurement}`,
        value,
        time: Math.floor(Date.now() / 1000),
        tags: allTags
      };

      pendingMetrics.push(metric);
    },

    markScrapeSuccess(mode: string, success: boolean) {
      const sanitizedMode = sanitizeTagValue(mode);
      
      const metric: GraphiteMetric = {
        name: `${config.graphitePrefix}.system.scrape_success`,
        value: success ? 1 : 0,
        time: Math.floor(Date.now() / 1000),
        tags: {
          source: 'exporter',
          type: 'scrape_success',
          mode: sanitizedMode,
          category: 'system'
        }
      };

      pendingMetrics.push(metric);
    },

    flush
  };
}

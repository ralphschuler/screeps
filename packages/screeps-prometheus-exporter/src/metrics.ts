import { Gauge, Registry, collectDefaultMetrics } from 'prom-client';

export interface Metrics {
  recordStat(stat: string, range: string, value: number): void;
  markScrapeSuccess(mode: string, success: boolean): void;
  render(): Promise<string>;
}

export function createMetrics(): Metrics {
  const registry = new Registry();
  collectDefaultMetrics({ register: registry });

  const statGauge = new Gauge({
    name: 'screeps_stat_value',
    help: 'Numeric stat value reported by the Screeps bot',
    labelNames: ['stat', 'range'],
    registers: [registry]
  });

  const scrapeGauge = new Gauge({
    name: 'screeps_exporter_last_scrape_success',
    help: 'Whether the last data collection succeeded (1 = success, 0 = failure)',
    labelNames: ['mode'],
    registers: [registry]
  });

  return {
    recordStat(stat: string, range: string, value: number) {
      statGauge.set({ stat, range }, value);
    },
    markScrapeSuccess(mode: string, success: boolean) {
      scrapeGauge.set({ mode }, success ? 1 : 0);
    },
    async render() {
      return registry.metrics();
    }
  };
}

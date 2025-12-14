// TODO(P2): ARCH - Add graceful shutdown handling for the exporter
// Ensure buffered metrics are flushed before exit
// TODO(P2): FEATURE - Add health check endpoint for monitoring
// Allow external systems to verify the exporter is running
// TODO(P2): TEST - Add integration tests for metric collection and export
// Issue URL: https://github.com/ralphschuler/screeps/issues/616
// Verify metrics are correctly formatted for Graphite/Grafana

import { loadConfig } from './config';
import { createApi } from './api';
import { createLogger } from './logger';
import { createMetrics } from './metrics';
import { startMemoryCollector } from './memoryCollector';
import { startConsoleListener } from './consoleListener';

async function main() {
  const logger = createLogger();
  const config = loadConfig();
  const metrics = createMetrics(config, logger);
  const api = await createApi(config);

  logger.info(`Starting Screeps Graphite exporter in ${config.mode} mode`);
  logger.info(`Grafana Cloud Graphite target: ${config.graphiteUrl}`);
  logger.info(`Graphite prefix: ${config.graphitePrefix}`);

  if (config.mode === 'memory') {
    await startMemoryCollector(api, config, metrics, logger);
  } else {
    await startConsoleListener(api, config, metrics, logger);
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Exporter failed to start', error);
  process.exit(1);
});

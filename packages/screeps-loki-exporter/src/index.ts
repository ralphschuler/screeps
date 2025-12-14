// TODO(P2): ARCH - Add graceful shutdown handling for the exporter
// Ensure buffered logs are flushed to Loki before exit
// TODO(P2): FEATURE - Add health check endpoint for monitoring
// Allow external systems to verify the exporter is running
// TODO(P2): FEATURE - Add log filtering/sampling to reduce volume in high-traffic scenarios
// Issue URL: https://github.com/ralphschuler/screeps/issues/617
// Not all console output needs to be exported to Loki

import { loadConfig } from './config';
import { createApi } from './api';
import { createLogger } from './logger';
import { LokiClient } from './lokiClient';
import { startConsoleListener } from './consoleListener';

async function main() {
  const logger = createLogger();
  const config = loadConfig();
  const api = await createApi(config);
  const lokiClient = new LokiClient(config, logger);

  logger.info('Starting Screeps Loki exporter');
  logger.info(`Screeps host: ${config.hostname}, shard: ${config.shard}`);
  logger.info(`Grafana Loki target: ${config.lokiUrl}`);
  logger.info(`Batch size: ${config.batchSize}, Interval: ${config.batchIntervalMs}ms`);

  await startConsoleListener(api, lokiClient, logger);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Exporter failed to start', error);
  process.exit(1);
});

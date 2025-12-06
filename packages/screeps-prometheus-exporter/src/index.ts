import { loadConfig } from './config';
import { createApi } from './api';
import { createLogger } from './logger';
import { createMetrics } from './metrics';
import { startHttpServer } from './server';
import { startMemoryCollector } from './memoryCollector';
import { startConsoleListener } from './consoleListener';

async function main() {
  const logger = createLogger();
  const config = loadConfig();
  const metrics = createMetrics();
  const api = await createApi(config);

  startHttpServer(config, metrics, logger);

  if (config.mode === 'memory') {
    await startMemoryCollector(api, config, metrics, logger);
  } else {
    await startConsoleListener(api, metrics, logger);
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Exporter failed to start', error);
  process.exit(1);
});

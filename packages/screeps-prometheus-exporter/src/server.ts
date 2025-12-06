import express from 'express';
import { Metrics } from './metrics';
import { ExporterConfig } from './config';
import { Logger } from './logger';

export function startHttpServer(config: ExporterConfig, metrics: Metrics, logger: Logger) {
  const app = express();

  app.get('/', (_req, res) => {
    res.json({
      name: 'screeps-prometheus-exporter',
      mode: config.mode,
      metricsPath: config.metricsPath
    });
  });

  app.get(config.metricsPath, async (_req, res) => {
    try {
      res.set('Content-Type', 'text/plain; version=0.0.4');
      res.send(await metrics.render());
    } catch (error) {
      logger.error('Failed to render metrics', error);
      res.status(500).send('error rendering metrics');
    }
  });

  app.listen(config.listenPort, () => {
    logger.info(`Exporter listening on port ${config.listenPort} (${config.mode} mode)`);
  });
}

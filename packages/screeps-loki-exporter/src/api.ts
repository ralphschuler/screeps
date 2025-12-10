import { ScreepsAPI } from 'screeps-api';
import { LokiExporterConfig } from './config';

export async function createApi(config: LokiExporterConfig): Promise<ScreepsAPI> {
  const api = new ScreepsAPI({
    protocol: config.protocol,
    hostname: config.hostname,
    port: config.apiPort,
    path: config.apiPath,
    token: config.token
  });

  if (!config.token && config.username && config.password) {
    await api.auth(config.username, config.password);
  }

  return api;
}

import { ScreepsAPI } from 'screeps-api';
import { LokiExporterConfig } from './config';

export async function createApi(config: LokiExporterConfig): Promise<ScreepsAPI> {
  const api = await ScreepsAPI.fromConfig(config.hostname, {
    protocol: config.protocol,
    port: config.apiPort,
    path: config.apiPath,
    ...(config.token ? { token: config.token } : { username: config.username, password: config.password })
  });

  return api;
}

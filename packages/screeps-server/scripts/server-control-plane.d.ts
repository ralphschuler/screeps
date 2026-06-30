export function parseTickRate(rawValue: unknown): number;
export function isLoopbackHost(host: string): boolean;
export function validateLocalServerCredentials(options: {
  host: string;
  serverPassword: string;
  password: string;
}): void;
export function buildTerrainSetupCommand(options: { shardName: string; tickRate: number }): string;
export function createServerControlPlane(options: {
  apiHost: string;
  serverPort: number;
  cliPort: number;
  shardName: string;
  tickRate: number;
  cliTransport?: (command: string) => Promise<string>;
  fetchTransport?: (url: string) => Promise<{ ok: boolean; status: number }>;
  sleep?: (ms: number) => Promise<void>;
}): {
  ensureTerrainData(): Promise<void>;
  waitForHttpReady(timeoutMs?: number): Promise<void>;
};

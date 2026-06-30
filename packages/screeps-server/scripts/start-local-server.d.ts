export function parseTickRate(rawValue: unknown): number;
export function isLoopbackHost(host: string): boolean;
export function validateLocalServerCredentials(options: {
  host: string;
  serverPassword: string;
  password: string;
}): void;
export function buildComposeEnv(options: {
  host: string;
  shardName: string;
  serverPort: number;
  cliPort: number;
  serverPassword: string;
}): Record<string, string>;
export function redactCommandArgs(args: string[]): string[];

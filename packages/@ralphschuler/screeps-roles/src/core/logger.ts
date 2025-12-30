/**
 * Logger stub for roles package
 * Provides minimal console logging functionality
 */

export interface Logger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export function createLogger(name: string): Logger {
  return {
    debug: (message: string) => console.log(`[${name}] ${message}`),
    info: (message: string) => console.log(`[${name}] ${message}`),
    warn: (message: string) => console.log(`[${name}] WARN: ${message}`),
    error: (message: string) => console.log(`[${name}] ERROR: ${message}`)
  };
}

export const logger = createLogger("roles");

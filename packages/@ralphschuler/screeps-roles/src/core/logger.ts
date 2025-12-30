/**
 * Logger stub for roles package
 * Provides minimal console logging functionality
 */

export interface Logger {
  debug(message: string, context?: any): void;
  info(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  error(message: string, context?: any): void;
}

export function createLogger(name: string): Logger {
  return {
    debug: (message: string, context?: any) => console.log(`[${name}] ${message}`, context || ''),
    info: (message: string, context?: any) => console.log(`[${name}] ${message}`, context || ''),
    warn: (message: string, context?: any) => console.log(`[${name}] WARN: ${message}`, context || ''),
    error: (message: string, context?: any) => console.log(`[${name}] ERROR: ${message}`, context || '')
  };
}

export const logger = createLogger("roles");

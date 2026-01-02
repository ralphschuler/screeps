/**
 * Simple logger implementation for visualization package
 */

import type { Logger } from "./types";

/**
 * Create a simple console-based logger
 */
export function createLogger(name: string): Logger {
  return {
    info(message: string, data?: Record<string, unknown>): void {
      if (data) {
        console.log(`[${name}] ${message}`, JSON.stringify(data));
      } else {
        console.log(`[${name}] ${message}`);
      }
    },
    warn(message: string, data?: Record<string, unknown>): void {
      if (data) {
        console.log(`[${name}] WARN: ${message}`, JSON.stringify(data));
      } else {
        console.log(`[${name}] WARN: ${message}`);
      }
    },
    error(message: string, data?: Record<string, unknown>): void {
      if (data) {
        console.log(`[${name}] ERROR: ${message}`, JSON.stringify(data));
      } else {
        console.log(`[${name}] ERROR: ${message}`);
      }
    },
    debug(message: string, data?: Record<string, unknown>): void {
      if (data) {
        console.log(`[${name}] DEBUG: ${message}`, JSON.stringify(data));
      } else {
        console.log(`[${name}] DEBUG: ${message}`);
      }
    }
  };
}

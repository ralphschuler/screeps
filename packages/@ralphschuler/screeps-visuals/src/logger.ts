/**
 * Simple logger implementation for visualization package
 */

import type { Logger } from "./types";

/**
 * Safely stringify data for logging, handling circular references and errors
 */
function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch (_error) {
    // Fallback to string representation if JSON.stringify fails
    try {
      return String(value);
    } catch {
      return "[Unserializable]";
    }
  }
}

/**
 * Create a simple console-based logger
 */
export function createLogger(name: string): Logger {
  return {
    info(message: string, data?: Record<string, unknown>): void {
      if (data) {
        console.log(`[${name}] ${message}`, safeStringify(data));
      } else {
        console.log(`[${name}] ${message}`);
      }
    },
    warn(message: string, data?: Record<string, unknown>): void {
      if (data) {
        console.log(`[${name}] WARN: ${message}`, safeStringify(data));
      } else {
        console.log(`[${name}] WARN: ${message}`);
      }
    },
    error(message: string, data?: Record<string, unknown>): void {
      if (data) {
        console.log(`[${name}] ERROR: ${message}`, safeStringify(data));
      } else {
        console.log(`[${name}] ERROR: ${message}`);
      }
    },
    debug(message: string, data?: Record<string, unknown>): void {
      if (data) {
        console.log(`[${name}] DEBUG: ${message}`, safeStringify(data));
      } else {
        console.log(`[${name}] DEBUG: ${message}`);
      }
    }
  };
}

/**
 * Error Handler Utilities
 *
 * Provides utilities for consistent error logging and handling across the bot.
 * All uncaught errors should be logged to help identify issues.
 *
 * Design Principles (from ROADMAP.md):
 * - Logging-Ebenen: Core events, warnings, errors with proper context
 * - Debug-Levels: Configurable logging per subsystem
 * - CPU-Effizienz: Error handling should not significantly impact CPU usage
 */

import { logger } from "../core/logger";

/**
 * Error context for logging
 */
export interface ErrorContext {
  subsystem: string;
  room?: string;
  creepName?: string;
  processId?: string;
  operation?: string;
}

/**
 * Format error message with context
 */
function formatErrorMessage(error: unknown, context: ErrorContext): string {
  const errorMsg = error instanceof Error ? error.message : String(error);
  const parts: string[] = [];
  
  if (context.operation) {
    parts.push(`Operation: ${context.operation}`);
  }
  if (context.creepName) {
    parts.push(`Creep: ${context.creepName}`);
  }
  if (context.processId) {
    parts.push(`Process: ${context.processId}`);
  }
  
  const prefix = parts.length > 0 ? `${parts.join(", ")} - ` : "";
  return `${prefix}${errorMsg}`;
}

/**
 * Log an error with full context and stack trace
 */
export function logError(error: unknown, context: ErrorContext): void {
  const message = formatErrorMessage(error, context);
  logger.error(message, {
    subsystem: context.subsystem,
    room: context.room
  });
  
  // Log stack trace if available (at debug level to avoid spam)
  if (error instanceof Error && error.stack) {
    logger.debug(`Stack trace: ${error.stack}`, {
      subsystem: context.subsystem,
      room: context.room
    });
  }
}

/**
 * Wrap a function with error logging
 * Returns the result of the function or undefined if an error occurs
 */
export function wrapWithErrorLogging<T>(
  fn: () => T,
  context: ErrorContext
): T | undefined {
  try {
    return fn();
  } catch (error) {
    logError(error, context);
    return undefined;
  }
}

/**
 * Wrap a function with error logging and a fallback value
 * Returns the result of the function or the fallback value if an error occurs
 */
export function wrapWithErrorLoggingAndFallback<T>(
  fn: () => T,
  fallback: T,
  context: ErrorContext
): T {
  try {
    return fn();
  } catch (error) {
    logError(error, context);
    return fallback;
  }
}

/**
 * Wrap an async/generator function with error logging
 * Logs error but doesn't re-throw to prevent loop crashes
 */
export function safeExecute(fn: () => void, context: ErrorContext): void {
  try {
    fn();
  } catch (error) {
    logError(error, context);
  }
}

/**
 * Create a method decorator that wraps the method with error logging
 * Usage: @logErrors({ subsystem: "MySubsystem" })
 */
export function logErrors(context: Omit<ErrorContext, "operation">) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      try {
        return originalMethod.apply(this, args);
      } catch (error) {
        logError(error, {
          ...context,
          operation: `${target.constructor.name}.${propertyKey}`
        });
        return undefined;
      }
    };
    
    return descriptor;
  };
}

/**
 * Create a safe version of a function that logs errors instead of throwing
 */
export function makeSafe<T extends (...args: any[]) => any>(
  fn: T,
  context: ErrorContext
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  return function (...args: Parameters<T>): ReturnType<T> | undefined {
    try {
      return fn(...args);
    } catch (error) {
      logError(error, context);
      return undefined;
    }
  };
}

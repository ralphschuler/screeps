/**
 * Logger Module
 *
 * Provides structured logging with levels (debug/info/warn/error).
 * Includes optional CPU logging wrapper for per-room/per-subsystem profiling.
 */

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level: LogLevel;
  showTimestamp: boolean;
  showRoom: boolean;
  cpuLogging: boolean;
  outputFormat: "json" | "text";
}

const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  showTimestamp: true,
  showRoom: true,
  cpuLogging: false,
  outputFormat: "json"
};

/**
 * Global logger configuration
 */
let globalConfig: LoggerConfig = { ...DEFAULT_CONFIG };

/**
 * Set global logger configuration
 */
export function configureLogger(config: Partial<LoggerConfig>): void {
  globalConfig = { ...globalConfig, ...config };
}

/**
 * Get current logger configuration
 */
export function getLoggerConfig(): LoggerConfig {
  return { ...globalConfig };
}

/**
 * Log context type
 */
export interface LogContext {
  room?: string | undefined;
  subsystem?: string;
}

/**
 * Log entry type for distinguishing logs from stats
 */
export type LogType = "log" | "stat";

/**
 * Format log message with optional context
 */
function formatMessage(level: string, message: string, context?: LogContext, type: LogType = "log"): string {
  if (globalConfig.outputFormat === "json") {
    const logObject: Record<string, any> = {
      type,
      level,
      message,
      tick: Game.time
    };

    if (context?.subsystem) {
      logObject.subsystem = context.subsystem;
    }

    if (context?.room) {
      logObject.room = context.room;
    }

    return JSON.stringify(logObject);
  }

  // Legacy text format
  const parts: string[] = [];

  if (globalConfig.showTimestamp) {
    parts.push(`[${Game.time}]`);
  }

  parts.push(`[${level}]`);

  if (context?.subsystem) {
    parts.push(`[${context.subsystem}]`);
  }

  if (globalConfig.showRoom && context?.room) {
    parts.push(`[${context.room}]`);
  }

  parts.push(message);

  return parts.join(" ");
}

/**
 * Log a debug message
 */
export function debug(message: string, context?: LogContext): void {
  if (globalConfig.level <= LogLevel.DEBUG) {
    console.log(formatMessage("DEBUG", message, context));
  }
}

/**
 * Log an info message
 */
export function info(message: string, context?: LogContext): void {
  if (globalConfig.level <= LogLevel.INFO) {
    console.log(formatMessage("INFO", message, context));
  }
}

/**
 * Log a warning message
 */
export function warn(message: string, context?: LogContext): void {
  if (globalConfig.level <= LogLevel.WARN) {
    console.log(formatMessage("WARN", message, context));
  }
}

/**
 * Log an error message
 */
export function error(message: string, context?: LogContext): void {
  if (globalConfig.level <= LogLevel.ERROR) {
    console.log(formatMessage("ERROR", message, context));
  }
}

/**
 * CPU measurement result
 */
export interface CpuMeasurement {
  name: string;
  cpu: number;
  tick: number;
}

/**
 * Measure CPU usage of a function
 */
export function measureCpu<T>(name: string, fn: () => T, context?: LogContext): T {
  if (!globalConfig.cpuLogging) {
    return fn();
  }

  const startCpu = Game.cpu.getUsed();
  const result = fn();
  const endCpu = Game.cpu.getUsed();
  const cpuUsed = endCpu - startCpu;

  debug(`${name}: ${cpuUsed.toFixed(3)} CPU`, context);

  return result;
}

/**
 * Log a stat message (for metrics/stats exporters)
 * Stats are distinguished from regular logs and can be filtered by exporters
 */
export function stat(key: string, value: number, unit?: string): void {
  if (globalConfig.outputFormat === "json") {
    const statObject: Record<string, any> = {
      type: "stat",
      key,
      value,
      tick: Game.time
    };
    if (unit) {
      statObject.unit = unit;
    }
    console.log(JSON.stringify(statObject));
  } else {
    // Legacy format for graphite exporter
    const parts = ["stats:", key, value.toString()];
    if (unit) {
      parts.push(unit);
    }
    console.log(parts.join(" "));
  }
}

/**
 * Create a scoped logger for a specific subsystem
 */
export function createLogger(subsystem: string) {
  return {
    debug: (message: string, room?: string) => debug(message, { subsystem, room }),
    info: (message: string, room?: string) => info(message, { subsystem, room }),
    warn: (message: string, room?: string) => warn(message, { subsystem, room }),
    error: (message: string, room?: string) => error(message, { subsystem, room }),
    measureCpu: <T>(name: string, fn: () => T, room?: string) => measureCpu(name, fn, { subsystem, room })
  };
}

/**
 * Default logger instance
 */
export const logger = {
  debug,
  info,
  warn,
  error,
  stat,
  measureCpu,
  configure: configureLogger,
  getConfig: getLoggerConfig,
  createLogger
};

/**
 * Logger Module
 *
 * Provides structured logging with levels (debug/info/warn/error).
 * All logs are output as single-line JSON objects for Loki ingestion.
 * Each log includes the current game tick for traceability.
 * 
 * Key features:
 * - Single-line JSON output (Loki-compatible)
 * - Automatic tick tracking for all logs
 * - Rich metadata support (subsystem, room, creep, etc.)
 * - Log level filtering
 * - CPU measurement utilities
 * - Log batching for reduced console.log overhead
 * 
 * Log Batching: IMPLEMENTED
 * Multiple logs are batched and output once per tick to reduce console.log overhead.
 * Configurable batch size with auto-flush when limit is reached.
 * Expected CPU savings: 1-2%.
 * 
 * TODO(P3): FEATURE - Add log sampling to reduce output volume in production
 * Only log a percentage of debug messages to reduce console spam
 * TODO(P3): FEATURE - Add structured error serialization
 * Include stack traces and error context in structured format
 * TODO(P3): FEATURE - Consider adding log rate limiting per subsystem
 Issue URL: https://github.com/ralphschuler/screeps/issues/2801
 * Prevent any single subsystem from flooding the console
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
  cpuLogging: boolean;
  /** Enable log batching to reduce console.log overhead (default: true) */
  enableBatching: boolean;
  /** Maximum batch size before automatic flush (default: 50) */
  maxBatchSize: number;
}

const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  cpuLogging: false,
  enableBatching: true,  // Matches JSDoc comment above
  maxBatchSize: 50       // Matches JSDoc comment above
};

/**
 * Global logger configuration
 */
let globalConfig: LoggerConfig = { ...DEFAULT_CONFIG };

/**
 * Message batch for batched logging
 */
let messageBatch: string[] = [];

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
 * Add a message to the batch or output immediately if batching is disabled
 */
function addToBatch(message: string): void {
  if (!globalConfig.enableBatching) {
    console.log(message);
    return;
  }

  messageBatch.push(message);

  // Auto-flush if batch size limit reached
  if (messageBatch.length >= globalConfig.maxBatchSize) {
    flushLogs();
  }
}

/**
 * Flush all batched log messages to console
 * This should be called at the end of each tick
 */
export function flushLogs(): void {
  if (messageBatch.length === 0) {
    return;
  }

  // Output all messages in a single console.log call
  // Join with newlines for readability in console
  console.log(messageBatch.join('\n'));
  
  // Clear the batch
  messageBatch = [];
}

/**
 * Log context type - rich metadata for logs
 */
export interface LogContext {
  /** Subsystem generating the log (e.g., "kernel", "spawns", "defense") */
  subsystem?: string;
  /** Room name if log is room-specific */
  room?: string;
  /** Creep name if log is creep-specific */
  creep?: string;
  /** Process ID if log is process-specific */
  processId?: string;
  /** Shard name - automatically populated if not provided */
  shard?: string;
  /** Additional metadata as key-value pairs */
  meta?: Record<string, any>;
}

/**
 * Log entry type for distinguishing logs from stats
 */
export type LogType = "log" | "stat";

/**
 * Reserved log field names that cannot be overwritten by meta
 */
const RESERVED_LOG_FIELDS = new Set(["type", "level", "message", "tick", "subsystem", "room", "creep", "processId", "shard"]);

/**
 * Format log message as single-line JSON with tick information
 */
function formatMessage(level: string, message: string, context?: LogContext, type: LogType = "log"): string {
  const logObject: Record<string, any> = {
    type,
    level,
    message,
    tick: typeof Game !== "undefined" ? Game.time : 0,
    shard: typeof Game !== "undefined" && Game.shard ? Game.shard.name : "shard0"
  };

  // Add context fields
  if (context) {
    // Allow explicit shard override from context
    if (context.shard) {
      logObject.shard = context.shard;
    }
    if (context.subsystem) {
      logObject.subsystem = context.subsystem;
    }
    if (context.room) {
      logObject.room = context.room;
    }
    if (context.creep) {
      logObject.creep = context.creep;
    }
    if (context.processId) {
      logObject.processId = context.processId;
    }
    if (context.meta) {
      // Flatten meta object into the log object, but skip reserved fields
      for (const key in context.meta) {
        if (!RESERVED_LOG_FIELDS.has(key)) {
          logObject[key] = context.meta[key];
        }
      }
    }
  }

  // Always output single-line JSON for Loki compatibility
  return JSON.stringify(logObject);
}

/**
 * Log a debug message
 */
export function debug(message: string, context?: LogContext): void {
  if (globalConfig.level <= LogLevel.DEBUG) {
    addToBatch(formatMessage("DEBUG", message, context));
  }
}

/**
 * Log an info message
 */
export function info(message: string, context?: LogContext): void {
  if (globalConfig.level <= LogLevel.INFO) {
    addToBatch(formatMessage("INFO", message, context));
  }
}

/**
 * Log a warning message
 */
export function warn(message: string, context?: LogContext): void {
  if (globalConfig.level <= LogLevel.WARN) {
    addToBatch(formatMessage("WARN", message, context));
  }
}

/**
 * Log an error message
 */
export function error(message: string, context?: LogContext): void {
  if (globalConfig.level <= LogLevel.ERROR) {
    addToBatch(formatMessage("ERROR", message, context));
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
 * Reserved stat field names that cannot be overwritten by meta
 */
const RESERVED_STAT_FIELDS = new Set(["type", "key", "value", "tick", "unit", "subsystem", "room", "shard"]);

/**
 * Log a stat message (for metrics/stats exporters)
 * Stats are distinguished from regular logs and can be filtered by exporters
 */
export function stat(key: string, value: number, unit?: string, context?: LogContext): void {
  const statObject: Record<string, any> = {
    type: "stat",
    key,
    value,
    tick: typeof Game !== "undefined" ? Game.time : 0,
    shard: typeof Game !== "undefined" && Game.shard ? Game.shard.name : "shard0"
  };
  
  if (unit) {
    statObject.unit = unit;
  }
  
  // Add context fields if provided
  if (context) {
    // Allow explicit shard override from context
    if (context.shard) {
      statObject.shard = context.shard;
    }
    if (context.subsystem) {
      statObject.subsystem = context.subsystem;
    }
    if (context.room) {
      statObject.room = context.room;
    }
    if (context.meta) {
      // Flatten meta object into the stat object, but skip reserved fields
      for (const key in context.meta) {
        if (!RESERVED_STAT_FIELDS.has(key)) {
          statObject[key] = context.meta[key];
        }
      }
    }
  }
  
  // Always output single-line JSON
  addToBatch(JSON.stringify(statObject));
}

/**
 * Create a scoped logger for a specific subsystem
 * Provides convenient methods with pre-filled subsystem context
 */
export function createLogger(subsystem: string) {
  return {
    debug: (message: string, contextOrRoom?: string | Omit<LogContext, "subsystem">) => {
      const context = typeof contextOrRoom === "string" 
        ? { subsystem, room: contextOrRoom }
        : { subsystem, ...contextOrRoom };
      debug(message, context);
    },
    info: (message: string, contextOrRoom?: string | Omit<LogContext, "subsystem">) => {
      const context = typeof contextOrRoom === "string" 
        ? { subsystem, room: contextOrRoom }
        : { subsystem, ...contextOrRoom };
      info(message, context);
    },
    warn: (message: string, contextOrRoom?: string | Omit<LogContext, "subsystem">) => {
      const context = typeof contextOrRoom === "string" 
        ? { subsystem, room: contextOrRoom }
        : { subsystem, ...contextOrRoom };
      warn(message, context);
    },
    error: (message: string, contextOrRoom?: string | Omit<LogContext, "subsystem">) => {
      const context = typeof contextOrRoom === "string" 
        ? { subsystem, room: contextOrRoom }
        : { subsystem, ...contextOrRoom };
      error(message, context);
    },
    stat: (key: string, value: number, unit?: string, contextOrRoom?: string | Omit<LogContext, "subsystem">) => {
      const context = typeof contextOrRoom === "string" 
        ? { subsystem, room: contextOrRoom }
        : { subsystem, ...contextOrRoom };
      stat(key, value, unit, context);
    },
    measureCpu: <T>(name: string, fn: () => T, contextOrRoom?: string | Omit<LogContext, "subsystem">) => {
      const context = typeof contextOrRoom === "string" 
        ? { subsystem, room: contextOrRoom }
        : { subsystem, ...contextOrRoom };
      return measureCpu(name, fn, context);
    }
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
  createLogger,
  flush: flushLogs
};

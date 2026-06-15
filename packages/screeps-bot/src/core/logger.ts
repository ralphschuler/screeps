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
 * - Debug sampling and per-tick rate limiting to reduce output volume
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
  /**
   * Debug sampling ratio in production (0.0-1.0).
   * 1.0 = log all debug messages, 0.5 = every other debug message,
   * 0.1 = one in ten debug messages.
   */
  debugSampleRate: number;
  /**
   * Maximum number of log/stat entries per subsystem per tick.
   * 0 disables the per-subsystem limit (default).
   */
  maxEntriesPerSubsystemPerTick: number;
  /**
   * Maximum number of log/stat entries across all subsystems per tick.
   * 0 disables the global limit (default).
   */
  maxEntriesPerTick: number;
}

const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  cpuLogging: false,
  enableBatching: true, // Matches JSDoc comment above
  maxBatchSize: 50, // Matches JSDoc comment above
  debugSampleRate: 1,
  maxEntriesPerSubsystemPerTick: 0,
  maxEntriesPerTick: 0
};

/**
 * Global logger configuration
 */
let globalConfig: LoggerConfig = { ...DEFAULT_CONFIG };

/**
 * Message batch for batched logging
 */
let messageBatch: string[] = [];

interface RateLimitState {
  tick: number;
  totalCount: number;
  perSubsystemCounts: Map<string, number>;
  debugSampleCounter: number;
}

const DEFAULT_LOG_TICK = -1;

let rateLimitState: RateLimitState = {
  tick: DEFAULT_LOG_TICK,
  totalCount: 0,
  perSubsystemCounts: new Map(),
  debugSampleCounter: 0
};

function getCurrentTick(): number {
  return typeof Game !== "undefined" && typeof Game.time === "number" ? Game.time : 0;
}

function resetRateLimitsIfNeeded(): void {
  const currentTick = getCurrentTick();

  if (rateLimitState.tick === currentTick) {
    return;
  }

  rateLimitState = {
    tick: currentTick,
    totalCount: 0,
    perSubsystemCounts: new Map(),
    debugSampleCounter: 0
  };
}

function clampNormalized(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(1, Math.max(0, value));
}

function shouldSampleDebug(level: LogLevel): boolean {
  if (level !== LogLevel.DEBUG) {
    return true;
  }

  resetRateLimitsIfNeeded();

  const sampleRate = clampNormalized(globalConfig.debugSampleRate);
  if (sampleRate >= 1) {
    return true;
  }

  if (sampleRate <= 0) {
    return false;
  }

  rateLimitState.debugSampleCounter += 1;
  const sampleInterval = Math.max(1, Math.ceil(1 / sampleRate));
  return rateLimitState.debugSampleCounter % sampleInterval === 0;
}

function shouldRespectRateLimits(subsystem?: string): boolean {
  const effectiveMaxPerTick = clampPositiveInteger(globalConfig.maxEntriesPerTick);
  const effectiveMaxPerSubsystem = clampPositiveInteger(globalConfig.maxEntriesPerSubsystemPerTick);

  if (effectiveMaxPerTick === 0 && effectiveMaxPerSubsystem === 0) {
    return true;
  }

  resetRateLimitsIfNeeded();

  if (effectiveMaxPerTick > 0 && rateLimitState.totalCount >= effectiveMaxPerTick) {
    return false;
  }

  if (effectiveMaxPerSubsystem > 0) {
    const key = subsystem ?? "global";
    const currentSubsystemCount = rateLimitState.perSubsystemCounts.get(key) ?? 0;
    if (currentSubsystemCount >= effectiveMaxPerSubsystem) {
      return false;
    }
  }

  rateLimitState.totalCount += 1;
  const key = subsystem ?? "global";
  rateLimitState.perSubsystemCounts.set(key, (rateLimitState.perSubsystemCounts.get(key) ?? 0) + 1);

  return true;
}

function shouldLog(level: LogLevel, context?: LogContext): boolean {
  if (!shouldSampleDebug(level)) {
    return false;
  }

  return shouldRespectRateLimits(context?.subsystem);
}

function clampPositiveInteger(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return value > 0 ? Math.floor(value) : 0;
}

/**
 * Internal logger runtime reset
 */
function resetRuntimeState(): void {
  messageBatch = [];
  rateLimitState = {
    tick: DEFAULT_LOG_TICK,
    totalCount: 0,
    perSubsystemCounts: new Map(),
    debugSampleCounter: 0
  };
}

/**
 * Set global logger configuration.
 *
 * Runtime counters are reset on every reconfiguration so per-subsystem and per-tick
 * rate limits and debug sampling counters do not leak state across tests or runtime mode
 * changes.
 */
export function configureLogger(config: Partial<LoggerConfig>): void {
  // Flush any queued batched output before reconfiguration to avoid dropping logs.
  if (messageBatch.length > 0) {
    flushLogs();
  }

  const previousConfig = globalConfig;
  globalConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    // Preserve mutable runtime-mode values when caller omitted them.
    // This keeps legacy behavior where setLogLevel/debug toggles do not
    // unintentionally reset unrelated settings.
    level: "level" in config ? config.level! : previousConfig.level,
    cpuLogging: "cpuLogging" in config ? config.cpuLogging! : previousConfig.cpuLogging,
    enableBatching: "enableBatching" in config ? config.enableBatching! : previousConfig.enableBatching,
    maxBatchSize: "maxBatchSize" in config ? config.maxBatchSize! : previousConfig.maxBatchSize,
    debugSampleRate: "debugSampleRate" in config
      ? config.debugSampleRate!
      : previousConfig.debugSampleRate,
    // Avoid leaking stale throttling configuration between unrelated calls.
    maxEntriesPerSubsystemPerTick: "maxEntriesPerSubsystemPerTick" in config
      ? config.maxEntriesPerSubsystemPerTick!
      : DEFAULT_CONFIG.maxEntriesPerSubsystemPerTick,
    maxEntriesPerTick: "maxEntriesPerTick" in config
      ? config.maxEntriesPerTick!
      : DEFAULT_CONFIG.maxEntriesPerTick
  };

  resetRuntimeState();
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
  console.log(messageBatch.join("\n"));

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
const RESERVED_LOG_FIELDS = new Set([
  "type",
  "level",
  "message",
  "tick",
  "subsystem",
  "room",
  "creep",
  "processId",
  "shard"
]);

/**
 * Build a JSON replacer that keeps logging from crashing on unsafe metadata.
 */
function createSafeJsonReplacer(): (_key: string, value: unknown) => unknown {
  const seen = new WeakSet<object>();

  return (_key: string, value: unknown): unknown => {
    if (typeof value === "bigint") return value.toString();
    if (typeof value !== "object" || value === null) return value;

    if (seen.has(value)) return "[Circular]";
    seen.add(value);
    return value;
  };
}

function stringifyLogObject(logObject: Record<string, any>): string {
  return JSON.stringify(logObject, createSafeJsonReplacer());
}

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
  return stringifyLogObject(logObject);
}

/**
 * Log a debug message
 */
export function debug(message: string, context?: LogContext): void {
  if (globalConfig.level <= LogLevel.DEBUG && shouldLog(LogLevel.DEBUG, context)) {
    addToBatch(formatMessage("DEBUG", message, context));
  }
}

/**
 * Log an info message
 */
export function info(message: string, context?: LogContext): void {
  if (globalConfig.level <= LogLevel.INFO && shouldLog(LogLevel.INFO, context)) {
    addToBatch(formatMessage("INFO", message, context));
  }
}

/**
 * Log a warning message
 */
export function warn(message: string, context?: LogContext): void {
  if (globalConfig.level <= LogLevel.WARN && shouldLog(LogLevel.WARN, context)) {
    addToBatch(formatMessage("WARN", message, context));
  }
}

/**
 * Log an error message
 */
export function error(message: string, context?: LogContext): void {
  if (globalConfig.level <= LogLevel.ERROR && shouldLog(LogLevel.ERROR, context)) {
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
      for (const metaKey in context.meta) {
        if (!RESERVED_STAT_FIELDS.has(metaKey)) {
          statObject[metaKey] = context.meta[metaKey];
        }
      }
    }
  }

  if (!shouldLog(LogLevel.INFO, context)) {
    return;
  }

  // Always output single-line JSON
  addToBatch(stringifyLogObject(statObject));
}

/**
 * Create a scoped logger for a specific subsystem
 * Provides convenient methods with pre-filled subsystem context
 */
export function createLogger(subsystem: string) {
  return {
    debug: (message: string, contextOrRoom?: string | Omit<LogContext, "subsystem">) => {
      const context =
        typeof contextOrRoom === "string" ? { subsystem, room: contextOrRoom } : { subsystem, ...contextOrRoom };
      debug(message, context);
    },
    info: (message: string, contextOrRoom?: string | Omit<LogContext, "subsystem">) => {
      const context =
        typeof contextOrRoom === "string" ? { subsystem, room: contextOrRoom } : { subsystem, ...contextOrRoom };
      info(message, context);
    },
    warn: (message: string, contextOrRoom?: string | Omit<LogContext, "subsystem">) => {
      const context =
        typeof contextOrRoom === "string" ? { subsystem, room: contextOrRoom } : { subsystem, ...contextOrRoom };
      warn(message, context);
    },
    error: (message: string, contextOrRoom?: string | Omit<LogContext, "subsystem">) => {
      const context =
        typeof contextOrRoom === "string" ? { subsystem, room: contextOrRoom } : { subsystem, ...contextOrRoom };
      error(message, context);
    },
    stat: (key: string, value: number, unit?: string, contextOrRoom?: string | Omit<LogContext, "subsystem">) => {
      const context =
        typeof contextOrRoom === "string" ? { subsystem, room: contextOrRoom } : { subsystem, ...contextOrRoom };
      stat(key, value, unit, context);
    },
    measureCpu: <T>(name: string, fn: () => T, contextOrRoom?: string | Omit<LogContext, "subsystem">) => {
      const context =
        typeof contextOrRoom === "string" ? { subsystem, room: contextOrRoom } : { subsystem, ...contextOrRoom };
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

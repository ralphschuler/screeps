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
 *
 * TODO(P3): FEATURE - Add log sampling to reduce output volume in production
 * Only log a percentage of debug messages to reduce console spam
 * TODO(P2): PERF - Implement log batching for bulk output
 * Batch multiple logs and output once per tick to reduce console.log overhead
 * TODO(P3): FEATURE - Add structured error serialization
 * Include stack traces and error context in structured format
 * TODO(P3): FEATURE - Consider adding log rate limiting per subsystem
 * Prevent any single subsystem from flooding the console
 */
/**
 * Log levels
 */
export declare enum LogLevel {
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
}
/**
 * Set global logger configuration
 */
export declare function configureLogger(config: Partial<LoggerConfig>): void;
/**
 * Get current logger configuration
 */
export declare function getLoggerConfig(): LoggerConfig;
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
 * Log a debug message
 */
export declare function debug(message: string, context?: LogContext): void;
/**
 * Log an info message
 */
export declare function info(message: string, context?: LogContext): void;
/**
 * Log a warning message
 */
export declare function warn(message: string, context?: LogContext): void;
/**
 * Log an error message
 */
export declare function error(message: string, context?: LogContext): void;
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
export declare function measureCpu<T>(name: string, fn: () => T, context?: LogContext): T;
/**
 * Log a stat message (for metrics/stats exporters)
 * Stats are distinguished from regular logs and can be filtered by exporters
 */
export declare function stat(key: string, value: number, unit?: string, context?: LogContext): void;
/**
 * Create a scoped logger for a specific subsystem
 * Provides convenient methods with pre-filled subsystem context
 */
export declare function createLogger(subsystem: string): {
    debug: (message: string, contextOrRoom?: string | Omit<LogContext, "subsystem">) => void;
    info: (message: string, contextOrRoom?: string | Omit<LogContext, "subsystem">) => void;
    warn: (message: string, contextOrRoom?: string | Omit<LogContext, "subsystem">) => void;
    error: (message: string, contextOrRoom?: string | Omit<LogContext, "subsystem">) => void;
    stat: (key: string, value: number, unit?: string, contextOrRoom?: string | Omit<LogContext, "subsystem">) => void;
    measureCpu: <T>(name: string, fn: () => T, contextOrRoom?: string | Omit<LogContext, "subsystem">) => T;
};
/**
 * Default logger instance
 */
export declare const logger: {
    debug: typeof debug;
    info: typeof info;
    warn: typeof warn;
    error: typeof error;
    stat: typeof stat;
    measureCpu: typeof measureCpu;
    configure: typeof configureLogger;
    getConfig: typeof getLoggerConfig;
    createLogger: typeof createLogger;
};
//# sourceMappingURL=logger.d.ts.map
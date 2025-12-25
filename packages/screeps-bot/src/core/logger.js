"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.createLogger = exports.stat = exports.measureCpu = exports.error = exports.warn = exports.info = exports.debug = exports.getLoggerConfig = exports.configureLogger = exports.LogLevel = void 0;
/**
 * Log levels
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["NONE"] = 4] = "NONE";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
const DEFAULT_CONFIG = {
    level: LogLevel.INFO,
    cpuLogging: false
};
/**
 * Global logger configuration
 */
let globalConfig = { ...DEFAULT_CONFIG };
/**
 * Set global logger configuration
 */
function configureLogger(config) {
    globalConfig = { ...globalConfig, ...config };
}
exports.configureLogger = configureLogger;
/**
 * Get current logger configuration
 */
function getLoggerConfig() {
    return { ...globalConfig };
}
exports.getLoggerConfig = getLoggerConfig;
/**
 * Reserved log field names that cannot be overwritten by meta
 */
const RESERVED_LOG_FIELDS = new Set(["type", "level", "message", "tick", "subsystem", "room", "creep", "processId", "shard"]);
/**
 * Format log message as single-line JSON with tick information
 */
function formatMessage(level, message, context, type = "log") {
    const logObject = {
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
function debug(message, context) {
    if (globalConfig.level <= LogLevel.DEBUG) {
        console.log(formatMessage("DEBUG", message, context));
    }
}
exports.debug = debug;
/**
 * Log an info message
 */
function info(message, context) {
    if (globalConfig.level <= LogLevel.INFO) {
        console.log(formatMessage("INFO", message, context));
    }
}
exports.info = info;
/**
 * Log a warning message
 */
function warn(message, context) {
    if (globalConfig.level <= LogLevel.WARN) {
        console.log(formatMessage("WARN", message, context));
    }
}
exports.warn = warn;
/**
 * Log an error message
 */
function error(message, context) {
    if (globalConfig.level <= LogLevel.ERROR) {
        console.log(formatMessage("ERROR", message, context));
    }
}
exports.error = error;
/**
 * Measure CPU usage of a function
 */
function measureCpu(name, fn, context) {
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
exports.measureCpu = measureCpu;
/**
 * Reserved stat field names that cannot be overwritten by meta
 */
const RESERVED_STAT_FIELDS = new Set(["type", "key", "value", "tick", "unit", "subsystem", "room", "shard"]);
/**
 * Log a stat message (for metrics/stats exporters)
 * Stats are distinguished from regular logs and can be filtered by exporters
 */
function stat(key, value, unit, context) {
    const statObject = {
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
    console.log(JSON.stringify(statObject));
}
exports.stat = stat;
/**
 * Create a scoped logger for a specific subsystem
 * Provides convenient methods with pre-filled subsystem context
 */
function createLogger(subsystem) {
    return {
        debug: (message, contextOrRoom) => {
            const context = typeof contextOrRoom === "string"
                ? { subsystem, room: contextOrRoom }
                : { subsystem, ...contextOrRoom };
            debug(message, context);
        },
        info: (message, contextOrRoom) => {
            const context = typeof contextOrRoom === "string"
                ? { subsystem, room: contextOrRoom }
                : { subsystem, ...contextOrRoom };
            info(message, context);
        },
        warn: (message, contextOrRoom) => {
            const context = typeof contextOrRoom === "string"
                ? { subsystem, room: contextOrRoom }
                : { subsystem, ...contextOrRoom };
            warn(message, context);
        },
        error: (message, contextOrRoom) => {
            const context = typeof contextOrRoom === "string"
                ? { subsystem, room: contextOrRoom }
                : { subsystem, ...contextOrRoom };
            error(message, context);
        },
        stat: (key, value, unit, contextOrRoom) => {
            const context = typeof contextOrRoom === "string"
                ? { subsystem, room: contextOrRoom }
                : { subsystem, ...contextOrRoom };
            stat(key, value, unit, context);
        },
        measureCpu: (name, fn, contextOrRoom) => {
            const context = typeof contextOrRoom === "string"
                ? { subsystem, room: contextOrRoom }
                : { subsystem, ...contextOrRoom };
            return measureCpu(name, fn, context);
        }
    };
}
exports.createLogger = createLogger;
/**
 * Default logger instance
 */
exports.logger = {
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

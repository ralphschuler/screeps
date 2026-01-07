/**
 * @ralphschuler/screeps-core
 * 
 * Minimal core infrastructure for Screeps bot including:
 * - Logger: Structured logging with Loki integration
 * - Events: Event bus for cross-module communication
 * - Command Registry: Console command system
 * - CPU Budget Manager: CPU allocation and tracking
 */

// Logger
export {
  logger,
  createLogger,
  configureLogger,
  getLoggerConfig,
  flushLogs,
  debug,
  info,
  warn,
  error,
  stat,
  measureCpu,
  LogLevel,
  type LoggerConfig,
  type LogContext,
  type LogType,
  type CpuMeasurement
} from "./logger";

// Events
export {
  eventBus,
  EventPriority,
  type EventBus,
  type EventHandler
} from "./events";

// Command Registry
export {
  commandRegistry,
  Command,
  type CommandMetadata
} from "./commandRegistry";

// CPU Budget Manager
export {
  cpuBudgetManager,
  CpuBudgetManager,
  type CpuBudgetConfig,
  type SubsystemType
} from "./cpuBudgetManager";

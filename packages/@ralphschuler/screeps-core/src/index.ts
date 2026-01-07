/**
 * @ralphschuler/screeps-core
 * 
 * Core infrastructure for Screeps bot including:
 * - Logger: Structured logging with Loki integration
 * - Kernel: Process scheduling and CPU budget management
 * - Console Commands: Interactive command system
 * - Events: Event bus for cross-module communication
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

// Command Registry
export {
  commandRegistry,
  Command,
  type CommandHandler,
  type CommandMetadata
} from "./commandRegistry";

// CPU Budget Manager
export {
  createCPUBudget,
  type CPUBudget,
  type CPUBudgetResult
} from "./cpuBudgetManager";

// Events
export {
  eventBus,
  EventPriority,
  type EventBus,
  type EventHandler,
  type EventSubscription
} from "./events";

// Native Calls Tracker
export {
  trackNativeCall,
  getNativeCallStats,
  resetNativeCallStats,
  type NativeCallStats
} from "./nativeCallsTracker";

// Process Decorators
export {
  Process,
  Priority,
  type ProcessMetadata
} from "./processDecorators";

// Scheduler
export {
  createScheduler,
  type Scheduler,
  type ScheduledTask
} from "./scheduler";

// Room Process Manager
export {
  RoomProcessManager,
  type RoomProcess
} from "./roomProcessManager";

// Kernel - exported but may need refactoring due to dependencies
export { kernel } from "./kernel";

// Console Commands - exported but may need refactoring due to dependencies
export { registerAllConsoleCommands } from "./consoleCommands";

// UI Help
export {
  generateInteractiveHelp,
  generateCategoryHelp
} from "./uiHelp";

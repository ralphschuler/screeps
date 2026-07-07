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

// Adaptive CPU budget policy
export {
  DEFAULT_ADAPTIVE_CONFIG,
  calculateAdaptiveBudget,
  calculateAdaptiveBudgets,
  calculateBucketMultiplier,
  calculateRoomScalingMultiplier,
  getAdaptiveBudgetInfo,
  getAdaptiveBudgets,
  getCurrentBucket,
  getCurrentRoomCount,
  type AdaptiveBudgetConfig,
  type AdaptiveBudgetInfo,
  type FrequencyUtilizationSnapshot,
  type ProcessFrequency
} from "./adaptiveBudgets";

// Alliance safety
export {
  NON_AGGRESSION_PACT_PLAYERS,
  getConfiguredAllyPlayers,
  getKnownAllyPlayers,
  isAllyPlayer,
  isConfiguredAllyPlayer,
  isKnownAllyPlayer,
  isAllyOwned,
  isConfiguredAllyOwned,
  isKnownAllyOwned,
  isAllyCreep,
  isAllyPowerCreep,
  isAllyStructure,
  isKnownAllyCreep,
  isKnownAllyPowerCreep,
  isKnownAllyStructure,
  filterAllyCreeps,
  filterAllyPowerCreeps,
  filterAllyStructures,
  filterKnownAllyCreeps,
  filterKnownAllyPowerCreeps,
  filterKnownAllyStructures,
  getActualHostileCreeps,
  getActualHostilePowerCreeps,
  getActualHostileStructures,
  getKnownHostileCreeps,
  getKnownHostilePowerCreeps,
  getKnownHostileStructures,
  hasActualHostiles,
  hasKnownHostiles,
  type AlliedPlayer,
  type AllyPolicyMemorySource,
  type AllyPolicyOptions
} from "./alliance";

// Room geometry
export {
  classifyRoomName,
  isHighwayRoom,
  isSourceKeeperRoom,
  parseRoomName,
  type SignedRoomCoordinate
} from "./roomGeometry";

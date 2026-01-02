/**
 * @ralphschuler/screeps-console
 * 
 * Console command framework with decorators and plugin system
 */

// Export command registry and decorators
export { 
  Command,
  commandRegistry,
  registerDecoratedCommands,
  type CommandMetadata
} from './commandRegistry';

// Export command collections
export {
  LoggingCommands,
  VisualizationCommands,
  StatsCommands,
  KernelCommands,
  ConfigCommands
} from './consoleCommands';

// Export interfaces for external dependencies
export type {
  Logger,
  LoggerConfig,
  Config,
  Kernel,
  ProcessInfo,
  MemorySegmentStats,
  UnifiedStats,
  RoomVisualizer,
  MapVisualizer,
  ProcessManager,
  CommandCollection
} from './interfaces';

export {
  LogLevel,
  createLogger
} from './interfaces';

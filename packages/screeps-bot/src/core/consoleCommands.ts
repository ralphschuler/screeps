/**
 * Console Commands
 *
 * All console commands available in the game using @Command decorators.
 * Commands are automatically registered and exposed to global scope.
 *
 * Categories:
 * - Logging: Commands for controlling log output
 * - Visualization: Commands for toggling visual overlays
 * - Statistics: Commands for viewing bot statistics
 * - Kernel: Commands for managing kernel processes
 * - Configuration: Commands for viewing/modifying bot configuration
 */

 

import { globalCache } from "@ralphschuler/screeps-cache";
import { visualizationManager } from "@ralphschuler/screeps-visuals";
import { getConfig, updateConfig } from "../config";
import { economyCommands } from "../economy/economyCommands";
import { expansionCommands } from "../empire/expansionCommands";
import { tooAngelCommands } from "../empire/tooangel/consoleCommands";
import { memoryCommands } from "../memory/memoryCommands";
import { labCommands, marketCommands, powerCommands } from "./advancedSystemCommands";
import { commandRegistry, registerDecoratedCommands } from "./commandRegistry";
import { ConfigurationCommands } from "./commands/ConfigurationCommands";
import { StatisticsCommands } from "./commands/StatisticsCommands";
import { KernelCommands } from "./commands/KernelCommands";
import { LoggingCommands } from "./commands/LoggingCommands";
import { SystemCommands } from "./commands/SystemCommands";
import { VisualizationCommands } from "./commands/VisualizationCommands";
import { configureLogger } from "./logger";
import { shardCommands } from "./shardCommands";
import { UICommands } from "./uiCommands";

/**
 * Command classes - imported from commands/
 */
// Re-export for backward compatibility
export { LoggingCommands } from "./commands/LoggingCommands";
export { VisualizationCommands } from "./commands/VisualizationCommands";
export { StatisticsCommands } from "./commands/StatisticsCommands";
export { ConfigurationCommands } from "./commands/ConfigurationCommands";
export { KernelCommands } from "./commands/KernelCommands";
export { SystemCommands } from "./commands/SystemCommands";


// =============================================================================
// Command instances (singletons)
// =============================================================================

const loggingCommands = new LoggingCommands();
const visualizationCommands = new VisualizationCommands();
const statisticsCommands = new StatisticsCommands();
const configurationCommands = new ConfigurationCommands();
const kernelCommands = new KernelCommands();
const systemCommands = new SystemCommands();

/**
 * Register all console commands with the command registry
 * @param lazy - If true, defer actual registration until first command is used
 */
export function registerAllConsoleCommands(lazy = false): void {
  const doRegistration = (): void => {
    // Initialize command registry first
    commandRegistry.initialize();

    // Register decorated commands from all command class instances
    registerDecoratedCommands(loggingCommands);
    registerDecoratedCommands(visualizationCommands);
    registerDecoratedCommands(statisticsCommands);
    registerDecoratedCommands(configurationCommands);
    registerDecoratedCommands(kernelCommands);
    registerDecoratedCommands(systemCommands);

    // Register advanced system commands
    registerDecoratedCommands(labCommands);
    registerDecoratedCommands(marketCommands);
    registerDecoratedCommands(powerCommands);
    registerDecoratedCommands(shardCommands);
    registerDecoratedCommands(economyCommands);
    registerDecoratedCommands(expansionCommands);
    registerDecoratedCommands(memoryCommands);

    // Register TooAngel commands as global object
    (global as unknown as Record<string, unknown>).tooangel = tooAngelCommands;

    // Expose utility modules to global for use in UI command strings
    // These are needed because Screeps doesn't support require() at runtime
    const g = global as unknown as Record<string, unknown>;
    g.botConfig = { getConfig, updateConfig };
    g.botLogger = { configureLogger };
    g.botVisualizationManager = visualizationManager;
    g.botCacheManager = globalCache;

    // Expose all commands to global scope
    commandRegistry.exposeToGlobal();
  };

  if (lazy) {
    // Initialize command registry with just the help command
    commandRegistry.initialize();
    // Enable lazy loading - commands will be registered on first access
    commandRegistry.enableLazyLoading(doRegistration);
    // Expose just the help command initially
    commandRegistry.exposeToGlobal();
  } else {
    // Immediate registration
    doRegistration();
  }
}

// Export command classes for potential extension
export {
  loggingCommands,
  visualizationCommands,
  statisticsCommands,
  configurationCommands,
  kernelCommands,
  systemCommands,
  labCommands,
  marketCommands,
  powerCommands,
  shardCommands,
  expansionCommands,
  tooAngelCommands,
  memoryCommands,
  UICommands
};

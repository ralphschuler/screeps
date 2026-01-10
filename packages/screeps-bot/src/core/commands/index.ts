/**
 * Console Commands Index
 *
 * Re-exports all command classes for easier importing.
 * Extracted command modules for better modularity and maintainability.
 */

export { LoggingCommands } from "./LoggingCommands";
export { ConfigurationCommands } from "./ConfigurationCommands";
export { SystemCommands } from "./SystemCommands";

// TODO: Extract remaining command classes:
// - VisualizationCommands (~220 LOC)
// - StatisticsCommands (~340 LOC)
// - KernelCommands (~299 LOC)

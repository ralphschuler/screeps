/**
 * Configuration Console Commands
 *
 * Commands for viewing/modifying bot configuration.
 * Extracted from consoleCommands.ts for better modularity.
 */

import { getConfig } from "../../config";
import { Command } from "../commandRegistry";
import { LogLevel, getLoggerConfig } from "../logger";

/**
 * Configuration commands
 */
export class ConfigurationCommands {
  @Command({
    name: "showConfig",
    description: "Show current bot configuration",
    usage: "showConfig()",
    examples: ["showConfig()"],
    category: "Configuration"
  })
  public showConfig(): string {
    const config = getConfig();
    const loggerConfig = getLoggerConfig();
    return `=== SwarmBot Config ===
Debug: ${String(config.debug)}
Profiling: ${String(config.profiling)}
Visualizations: ${String(config.visualizations)}
Logger Level: ${LogLevel[loggerConfig.level]}
CPU Logging: ${String(loggerConfig.cpuLogging)}`;
  }
}

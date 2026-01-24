/**
 * Logging Console Commands
 *
 * Commands for controlling log output and debug mode.
 * Extracted from consoleCommands.ts for better modularity.
 */

import { getConfig, updateConfig } from "../../config";
import { Command } from "../commandRegistry";
import { LogLevel, configureLogger } from "../logger";

/**
 * Logging commands
 */
export class LoggingCommands {
  @Command({
    name: "setLogLevel",
    description: "Set the log level for the bot",
    usage: "setLogLevel(level)",
    examples: [
      "setLogLevel('debug')",
      "setLogLevel('info')",
      "setLogLevel('warn')",
      "setLogLevel('error')",
      "setLogLevel('none')"
    ],
    category: "Logging"
  })
  public setLogLevel(level: string): string {
    const levelMap: Record<string, LogLevel> = {
      debug: LogLevel.DEBUG,
      info: LogLevel.INFO,
      warn: LogLevel.WARN,
      error: LogLevel.ERROR,
      none: LogLevel.NONE
    };

    const logLevel = levelMap[level.toLowerCase()];
    if (logLevel === undefined) {
      return `Invalid log level: ${level}. Valid levels: debug, info, warn, error, none`;
    }

    configureLogger({ level: logLevel });
    return `Log level set to: ${level.toUpperCase()}`;
  }

  @Command({
    name: "toggleDebug",
    description: "Toggle debug mode on/off (affects log level and debug features)",
    usage: "toggleDebug()",
    examples: ["toggleDebug()"],
    category: "Logging"
  })
  public toggleDebug(): string {
    const config = getConfig();
    const newValue = !config.debug;
    updateConfig({ debug: newValue });
    configureLogger({ level: newValue ? LogLevel.DEBUG : LogLevel.INFO });
    return `Debug mode: ${newValue ? "ENABLED" : "DISABLED"} (Log level: ${newValue ? "DEBUG" : "INFO"})`;
  }
}

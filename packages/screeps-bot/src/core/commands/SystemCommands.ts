/**
 * System Console Commands
 *
 * Core system commands for help and command discovery.
 * Extracted from consoleCommands.ts for better modularity.
 */

import { Command, commandRegistry } from "../commandRegistry";

/**
 * System commands
 */
export class SystemCommands {
  @Command({
    name: "listCommands",
    description: "List all available commands (alias for help)",
    usage: "listCommands()",
    examples: ["listCommands()"],
    category: "System"
  })
  public listCommands(): string {
    return commandRegistry.generateHelp();
  }

  @Command({
    name: "commandHelp",
    description: "Get detailed help for a specific command",
    usage: "commandHelp(commandName)",
    examples: ["commandHelp('setLogLevel')", "commandHelp('suspendProcess')"],
    category: "System"
  })
  public commandHelp(commandName: string): string {
    return commandRegistry.generateCommandHelp(commandName);
  }
}

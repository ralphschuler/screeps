/**
 * Command Registry - Centralized console command management
 *
 * Provides decorator-based command registration for kernel console commands.
 * Commands are registered using the @Command decorator and automatically
 * exposed to the global scope for console access.
 *
 * Features:
 * - @Command decorator for declarative command registration
 * - Automatic help() command generation
 * - Command metadata storage (description, usage, examples)
 * - Global scope integration for console access
 *
 * Usage:
 * ```typescript
 * class MyCommands {
 *   @Command({
 *     name: "myCommand",
 *     description: "Does something useful",
 *     usage: "myCommand(arg1, arg2)",
 *     examples: ["myCommand('test', 123)"]
 *   })
 *   myCommand(arg1: string, arg2: number): string {
 *     return `Result: ${arg1} ${arg2}`;
 *   }
 * }
 * ```
 */

import { logger } from "./interfaces";

/**
 * Command metadata for registration and help display
 */
export interface CommandMetadata {
  /** Command name (will be used as global function name) */
  name: string;
  /** Brief description of what the command does */
  description: string;
  /** Usage syntax (e.g., "myCommand(arg1, arg2)") */
  usage?: string;
  /** Example invocations */
  examples?: string[];
  /** Category for grouping in help output */
  category?: string;
}

/**
 * Internal storage for command with its handler
 */
interface RegisteredCommand {
  metadata: CommandMetadata;
  handler: (...args: unknown[]) => unknown;
}

/**
 * Metadata storage for decorated commands before registration
 */
interface CommandDecoratorMetadata {
  metadata: CommandMetadata;
  methodName: string;
  target: object;
}

/**
 * Storage for command decorator metadata
 */
const commandDecoratorStore: CommandDecoratorMetadata[] = [];

/**
 * Command Registry - Manages console commands
 */
class CommandRegistry {
  private commands: Map<string, RegisteredCommand> = new Map();
  private initialized = false;
  private lazyLoadEnabled = false;
  private commandsRegistered = false;
  private registrationCallback?: () => void;
  private commandsExposed = false;

  /**
   * Register a command with the registry
   */
  public register(metadata: CommandMetadata, handler: (...args: unknown[]) => unknown): void {
    if (this.commands.has(metadata.name)) {
      logger.warn(`Command "${metadata.name}" is already registered, overwriting`, {
        subsystem: "CommandRegistry"
      });
    }

    this.commands.set(metadata.name, {
      metadata: {
        ...metadata,
        category: metadata.category ?? "General"
      },
      handler
    });

    logger.debug(`Registered command "${metadata.name}"`, { subsystem: "CommandRegistry" });
  }

  /**
   * Unregister a command
   */
  public unregister(name: string): boolean {
    const deleted = this.commands.delete(name);
    if (deleted) {
      logger.debug(`Unregistered command "${name}"`, { subsystem: "CommandRegistry" });
    }
    return deleted;
  }

  /**
   * Get a registered command
   * Triggers lazy loading if needed
   */
  public getCommand(name: string): RegisteredCommand | undefined {
    if (this.lazyLoadEnabled && !this.commandsRegistered) {
      this.triggerLazyLoad();
    }
    return this.commands.get(name);
  }

  /**
   * Get all registered commands
   * Triggers lazy loading if needed
   */
  public getCommands(): RegisteredCommand[] {
    if (this.lazyLoadEnabled && !this.commandsRegistered) {
      this.triggerLazyLoad();
    }
    return Array.from(this.commands.values());
  }

  /**
   * Get command names grouped by category
   * Triggers lazy loading if needed
   */
  public getCommandsByCategory(): Map<string, RegisteredCommand[]> {
    if (this.lazyLoadEnabled && !this.commandsRegistered) {
      this.triggerLazyLoad();
    }
    
    const categories = new Map<string, RegisteredCommand[]>();

    for (const cmd of this.commands.values()) {
      const category = cmd.metadata.category ?? "General";
      const existing = categories.get(category) ?? [];
      existing.push(cmd);
      categories.set(category, existing);
    }

    // Sort commands within each category
    for (const [category, cmds] of categories) {
      categories.set(category, cmds.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name)));
    }

    return categories;
  }

  /**
   * Execute a command by name
   * In lazy loading mode, this will trigger command registration on first call
   */
  public execute(name: string, ...args: unknown[]): unknown {
    if (this.lazyLoadEnabled && !this.commandsRegistered) {
      this.triggerLazyLoad();
    }

    const command = this.commands.get(name);
    if (!command) {
      return `Command "${name}" not found. Use help() to see available commands.`;
    }

    try {
      return command.handler(...args);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error(`Error executing command "${name}": ${errorMessage}`, {
        subsystem: "CommandRegistry"
      });
      return `Error: ${errorMessage}`;
    }
  }

  /**
   * Generate help output for all commands
   */
  public generateHelp(): string {
    const categories = this.getCommandsByCategory();
    const lines: string[] = ["=== Available Console Commands ===", ""];

    // Sort categories, putting "General" first
    const sortedCategories = Array.from(categories.keys()).sort((a, b) => {
      if (a === "General") return -1;
      if (b === "General") return 1;
      return a.localeCompare(b);
    });

    for (const category of sortedCategories) {
      const cmds = categories.get(category);
      if (!cmds || cmds.length === 0) continue;

      lines.push(`--- ${category} ---`);

      for (const cmd of cmds) {
        const usage = cmd.metadata.usage ?? `${cmd.metadata.name}()`;
        lines.push(`  ${usage}`);
        lines.push(`    ${cmd.metadata.description}`);

        if (cmd.metadata.examples && cmd.metadata.examples.length > 0) {
          lines.push(`    Examples:`);
          for (const example of cmd.metadata.examples) {
            lines.push(`      ${example}`);
          }
        }
        lines.push("");
      }
    }

    return lines.join("\n");
  }

  /**
   * Generate help output for a specific command
   * Triggers lazy loading if needed
   */
  public generateCommandHelp(name: string): string {
    if (this.lazyLoadEnabled && !this.commandsRegistered) {
      this.triggerLazyLoad();
    }
    
    const command = this.commands.get(name);
    if (!command) {
      return `Command "${name}" not found. Use help() to see available commands.`;
    }

    const lines: string[] = [
      `=== ${command.metadata.name} ===`,
      "",
      `Description: ${command.metadata.description}`,
      `Usage: ${command.metadata.usage ?? `${command.metadata.name}()`}`,
      `Category: ${command.metadata.category ?? "General"}`
    ];

    if (command.metadata.examples && command.metadata.examples.length > 0) {
      lines.push("");
      lines.push("Examples:");
      for (const example of command.metadata.examples) {
        lines.push(`  ${example}`);
      }
    }

    return lines.join("\n");
  }

  /**
   * Expose all registered commands to the global scope
   * This allows commands to be called directly from the Screeps console
   */
  public exposeToGlobal(): void {
    // TypeScript's global type doesn't have an index signature, so we cast
    // through unknown to Record<string, unknown> to allow dynamic property assignment.
    // This is safe because we're only adding command handler functions.
    const g = global as unknown as Record<string, unknown>;

    // Only expose commands if not already exposed or if new commands were registered
    if (!this.commandsExposed || (this.lazyLoadEnabled && this.commandsRegistered)) {
      for (const [name, command] of this.commands) {
        g[name] = command.handler;
      }
      this.commandsExposed = true;
      logger.debug(`Exposed ${this.commands.size} commands to global scope`, {
        subsystem: "CommandRegistry"
      });
    }

    // Always set up the help command wrapper (for lazy loading support)
    g.help = (commandName?: string): string => {
      // Trigger lazy load if needed when help is called
      if (this.lazyLoadEnabled && !this.commandsRegistered) {
        this.triggerLazyLoad();
      }
      if (commandName) {
        return this.generateCommandHelp(commandName);
      }
      return this.generateHelp();
    };
  }

  /**
   * Initialize the command registry
   * Should be called once at bot startup
   */
  public initialize(): void {
    if (this.initialized) return;

    // Register the help command
    this.register(
      {
        name: "help",
        description: "Show available commands and their descriptions",
        usage: "help() or help('commandName')",
        examples: ["help()", "help('setLogLevel')"],
        category: "System"
      },
      (...args: unknown[]): string => {
        const commandName = args[0];
        if (commandName !== undefined) {
          return this.generateCommandHelp(String(commandName));
        }
        return this.generateHelp();
      }
    );

    this.initialized = true;
    logger.info("Command registry initialized", { subsystem: "CommandRegistry" });
  }

  /**
   * Enable lazy loading mode
   * Commands will be registered only when first accessed
   */
  public enableLazyLoading(registrationCallback: () => void): void {
    this.lazyLoadEnabled = true;
    this.registrationCallback = registrationCallback;
    logger.info("Console commands lazy loading enabled", { subsystem: "CommandRegistry" });
  }

  /**
   * Trigger lazy loading of all commands
   * Called automatically when a command is first accessed
   */
  private triggerLazyLoad(): void {
    if (!this.commandsRegistered && this.registrationCallback) {
      logger.debug("Lazy loading console commands on first access", { subsystem: "CommandRegistry" });
      this.commandsRegistered = true;
      this.registrationCallback();
      // After registration, expose all commands to global
      this.exposeToGlobal();
    }
  }

  /**
   * Get count of registered commands
   */
  public getCommandCount(): number {
    return this.commands.size;
  }

  /**
   * Check if registry is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Reset the registry (for testing purposes)
   * Clears all commands and resets initialized state
   */
  public reset(): void {
    this.commands.clear();
    this.initialized = false;
    this.lazyLoadEnabled = false;
    this.commandsRegistered = false;
    this.commandsExposed = false;
    this.registrationCallback = undefined;
  }
}

/**
 * Global command registry instance
 */
export const commandRegistry = new CommandRegistry();

// =============================================================================
// Decorators
// =============================================================================

/**
 * Command decorator - marks a method as a console command
 *
 * @param metadata - Command metadata including name, description, etc.
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * class MyCommands {
 *   @Command({
 *     name: "sayHello",
 *     description: "Prints a greeting",
 *     usage: "sayHello(name)",
 *     examples: ["sayHello('World')"]
 *   })
 *   sayHello(name: string): string {
 *     return `Hello, ${name}!`;
 *   }
 * }
 * ```
 */
export function Command(metadata: CommandMetadata) {
  return function <T>(
    target: object,
    propertyKey: string | symbol,
    _descriptor?: TypedPropertyDescriptor<T>
  ): void {
    commandDecoratorStore.push({
      metadata,
      methodName: String(propertyKey),
      target
    });
  };
}

/**
 * Register all decorated commands from an instance
 * Call this after creating an instance of a class with @Command decorated methods
 *
 * @param instance - Instance of a class with decorated command methods
 *
 * @example
 * ```typescript
 * const myCommands = new MyCommands();
 * registerDecoratedCommands(myCommands);
 * ```
 */
export function registerDecoratedCommands(instance: object): void {
  const instancePrototype = Object.getPrototypeOf(instance) as object | null;

  for (const decoratorMeta of commandDecoratorStore) {
    // Check if this metadata belongs to the instance's prototype chain
    // This handles cases where decorators are applied at different levels of the prototype chain
    if (isDecoratorForInstance(decoratorMeta.target, instancePrototype)) {
      const method = (instance as Record<string, unknown>)[decoratorMeta.methodName];

      if (typeof method === "function") {
        const boundMethod = (method as (...args: unknown[]) => unknown).bind(instance);

        commandRegistry.register(decoratorMeta.metadata, boundMethod);

        logger.debug(`Registered decorated command "${decoratorMeta.metadata.name}"`, {
          subsystem: "CommandRegistry"
        });
      }
    }
  }
}

/**
 * Check if a decorator target belongs to an instance's prototype chain
 * @param decoratorTarget - The target object where the decorator was applied
 * @param instancePrototype - The prototype of the instance being registered
 */
function isDecoratorForInstance(decoratorTarget: object, instancePrototype: object | null): boolean {
  if (instancePrototype === null) return false;

  return (
    decoratorTarget === instancePrototype ||
    Object.getPrototypeOf(decoratorTarget) === instancePrototype ||
    decoratorTarget === Object.getPrototypeOf(instancePrototype)
  );
}

/**
 * Register commands from multiple instances
 *
 * @param instances - Array of instances with decorated command methods
 */
export function registerAllDecoratedCommands(...instances: object[]): void {
  for (const instance of instances) {
    registerDecoratedCommands(instance);
  }

  logger.info(`Registered decorated commands from ${instances.length} instance(s)`, {
    subsystem: "CommandRegistry"
  });
}

/**
 * Get all stored command decorator metadata (for debugging)
 */
export function getCommandDecoratorMetadata(): CommandDecoratorMetadata[] {
  return [...commandDecoratorStore];
}

/**
 * Clear all stored command decorator metadata (for testing)
 */
export function clearCommandDecoratorMetadata(): void {
  commandDecoratorStore.length = 0;
}

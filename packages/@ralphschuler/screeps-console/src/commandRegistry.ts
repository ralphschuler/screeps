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

import { getDecoratorMetadataForInstance, storeCommandDecoratorMetadata } from "./decoratorStore";
import { formatCommandHelp, formatRegistryHelp } from "./helpFormatter";
import { logger } from "./interfaces";
import type { CommandMetadata, RegisteredCommand } from "./commandTypes";

export type { CommandDecoratorMetadata, CommandMetadata, RegisteredCommand } from "./commandTypes";
export { clearCommandDecoratorMetadata, getCommandDecoratorMetadata } from "./decoratorStore";

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
   * Does not trigger lazy loading; execute/help paths load commands on demand.
   */
  public getCommand(name: string): RegisteredCommand | undefined {
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
      categories.set(
        category,
        cmds.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name))
      );
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
    return formatRegistryHelp(this.getCommandsByCategory());
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

    return formatCommandHelp(command);
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

    for (const [name, command] of this.commands) {
      g[name] = command.handler;
    }

    this.commandsExposed = true;
    logger.debug(`Exposed ${this.commands.size} commands to global scope`, {
      subsystem: "CommandRegistry"
    });

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

  /**
   * Clear all registered commands.
   * Kept as a compatibility alias for older console command setup/tests.
   */
  public clear(): void {
    this.reset();
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
    targetOrMethod: object,
    propertyKeyOrContext: string | symbol | ClassMethodDecoratorContext,
    _descriptor?: TypedPropertyDescriptor<T>
  ): void {
    if (typeof propertyKeyOrContext === "object") {
      const context = propertyKeyOrContext;
      const methodName = String(context.name);

      context.addInitializer(function (this: unknown) {
        if (typeof this === "object" && this !== null) {
          storeCommandDecoratorMetadata(metadata, methodName, Object.getPrototypeOf(this) as object);
        }
      });
      return;
    }

    storeCommandDecoratorMetadata(metadata, String(propertyKeyOrContext), targetOrMethod);
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
  for (const decoratorMeta of getDecoratorMetadataForInstance(instance)) {
    const method = (instance as Record<string, unknown>)[decoratorMeta.methodName];

    if (typeof method !== "function") continue;

    const boundMethod = (method as (...args: unknown[]) => unknown).bind(instance);

    commandRegistry.register(decoratorMeta.metadata, boundMethod);

    logger.debug(`Registered decorated command "${decoratorMeta.metadata.name}"`, {
      subsystem: "CommandRegistry"
    });
  }
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

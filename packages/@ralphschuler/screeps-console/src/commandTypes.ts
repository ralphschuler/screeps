/** Shared command types for registry, decorators, and help rendering. */

/** Command metadata for registration and help display. */
export interface CommandMetadata {
  /** Command name, exposed as the global Screeps console function name. */
  name: string;
  /** Brief description shown in generated help. */
  description: string;
  /** Usage syntax, e.g. `myCommand(arg1, arg2)`. */
  usage?: string;
  /** Example invocations shown in detailed and registry help. */
  examples?: string[];
  /** Category used to group commands in generated help. */
  category?: string;
}

/** Internal command entry paired with the executable handler. */
export interface RegisteredCommand {
  metadata: CommandMetadata;
  handler: (...args: unknown[]) => unknown;
}

/** Decorator metadata captured before an instance is registered. */
export interface CommandDecoratorMetadata {
  metadata: CommandMetadata;
  methodName: string;
  target: object;
}

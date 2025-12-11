/**
 * IPosisProcess - Process Interface
 *
 * Standard interface for process implementations following POSIS principles.
 * Processes are self-contained, runnable entities with lifecycle management.
 *
 * References:
 * - https://github.com/screepers/POSIS
 * - ROADMAP.md Section 22: POSIS Operating System Architecture
 */

import type { IPosisProcessSyscalls } from "./IPosisKernel";

/**
 * Process state
 */
export type IPosisProcessState = "idle" | "running" | "sleeping" | "suspended" | "error";

/**
 * Process context for inter-process communication and kernel interaction
 */
export interface IPosisProcessContext {
  /** Process ID */
  id: string;

  /** Parent process ID (if any) */
  parentId?: string;

  /** Process memory (isolated per-process) */
  memory: Record<string, unknown>;

  /** Syscalls for kernel interaction */
  syscalls: IPosisProcessSyscalls;

  /** Event bus for subscribing to events */
  on(event: string, handler: (data: unknown) => void): void;

  /** Emit an event */
  emit(event: string, data: unknown): void;

  /** Log a message (scoped to process) */
  log(level: "debug" | "info" | "warn" | "error", message: string, metadata?: Record<string, unknown>): void;
}

/**
 * Process interface following POSIS principles
 */
export interface IPosisProcess {
  /** Unique process ID */
  id: string;

  /** Display name */
  name: string;

  /** Process priority (higher runs first) */
  priority: number;

  /** Current state */
  state: IPosisProcessState;

  /** Process context */
  context?: IPosisProcessContext;

  /**
   * Initialize the process (called once when registered)
   * @param context Process context provided by kernel
   */
  init?(context: IPosisProcessContext): void;

  /**
   * Run the process for one tick
   * @returns void or Promise<void> for async operations
   */
  run(): void | Promise<void>;

  /**
   * Cleanup when process is unregistered
   */
  cleanup?(): void;

  /**
   * Handle incoming message
   * @param message Message data
   * @param senderId Sender process ID
   */
  onMessage?(message: unknown, senderId: string): void;

  /**
   * Serialize process state to Memory
   * @returns Serializable state object
   */
  serialize?(): Record<string, unknown>;

  /**
   * Restore process state from Memory
   * @param state Previously serialized state
   */
  deserialize?(state: Record<string, unknown>): void;
}

/**
 * Process memory structure for serialization
 */
export interface IPosisProcessMemory {
  /** Process ID */
  id: string;

  /** Process state */
  state: IPosisProcessState;

  /** Last run tick */
  lastRunTick: number;

  /** Sleep until tick (if sleeping) */
  sleepUntil?: number;

  /** Parent process ID */
  parentId?: string;

  /** Child process IDs */
  childIds?: string[];

  /** Process-specific data */
  data?: Record<string, unknown>;

  /** Message queue */
  messages?: unknown[];
}

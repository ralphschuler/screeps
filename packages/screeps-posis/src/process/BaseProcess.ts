/**
 * BaseProcess - Base class for POSIS-compliant processes
 *
 * Provides common functionality for process implementations:
 * - Lifecycle management (init, run, cleanup)
 * - State serialization/deserialization
 * - Message handling
 * - Syscall access
 *
 * Usage:
 * ```typescript
 * class MyProcess extends BaseProcess {
 *   protected doRun(): void {
 *     // Process logic here
 *     // Access syscalls via this.syscalls
 *     // Access memory via this.memory
 *   }
 * }
 * ```
 */

import type {
  IPosisProcess,
  IPosisProcessContext,
  IPosisProcessState
} from "./IPosisProcess";
import type { IPosisProcessSyscalls } from "../kernel/IPosisKernel";

/**
 * Base process implementation
 */
export abstract class BaseProcess implements IPosisProcess {
  public id: string;
  public name: string;
  public priority: number;
  public state: IPosisProcessState = "idle";
  public context?: IPosisProcessContext;

  protected get syscalls(): IPosisProcessSyscalls {
    if (!this.context) {
      throw new Error(`Process ${this.id} not initialized - no context available`);
    }
    return this.context.syscalls;
  }

  protected get memory(): Record<string, unknown> {
    if (!this.context) {
      throw new Error(`Process ${this.id} not initialized - no context available`);
    }
    return this.context.memory;
  }

  constructor(id: string, name: string, priority: number = 50) {
    this.id = id;
    this.name = name;
    this.priority = priority;
  }

  /**
   * Initialize the process
   */
  public init(context: IPosisProcessContext): void {
    this.context = context;
    this.onInit();
  }

  /**
   * Run the process for one tick
   */
  public run(): void {
    this.state = "running";
    try {
      this.doRun();
      this.state = "idle";
    } catch (err) {
      this.state = "error";
      throw err;
    }
  }

  /**
   * Cleanup when process is unregistered
   */
  public cleanup(): void {
    this.onCleanup();
  }

  /**
   * Handle incoming message
   */
  public onMessage(message: unknown, senderId: string): void {
    this.handleMessage(message, senderId);
  }

  /**
   * Serialize process state
   */
  public serialize(): Record<string, unknown> {
    return {
      id: this.id,
      state: this.state,
      priority: this.priority,
      ...this.serializeState()
    };
  }

  /**
   * Deserialize process state
   */
  public deserialize(state: Record<string, unknown>): void {
    if (state.priority !== undefined) {
      this.priority = state.priority as number;
    }
    if (state.state !== undefined) {
      this.state = state.state as IPosisProcessState;
    }
    this.deserializeState(state);
  }

  // ============================================================================
  // Protected methods for subclasses to override
  // ============================================================================

  /**
   * Called after init - override for custom initialization
   */
  protected onInit(): void {
    // Override in subclass
  }

  /**
   * Main process logic - override in subclass
   */
  protected abstract doRun(): void;

  /**
   * Called on cleanup - override for custom cleanup
   */
  protected onCleanup(): void {
    // Override in subclass
  }

  /**
   * Handle incoming messages - override in subclass
   */
  protected handleMessage(message: unknown, senderId: string): void {
    // Override in subclass
  }

  /**
   * Serialize custom state - override in subclass
   */
  protected serializeState(): Record<string, unknown> {
    return {};
  }

  /**
   * Deserialize custom state - override in subclass
   */
  protected deserializeState(state: Record<string, unknown>): void {
    // Override in subclass
  }

  // ============================================================================
  // Helper methods
  // ============================================================================

  /**
   * Sleep for N ticks
   */
  protected sleep(ticks: number): void {
    this.syscalls.sleep(ticks);
  }

  /**
   * Send message to another process
   */
  protected sendMessage(targetId: string, message: unknown): void {
    this.syscalls.sendMessage(targetId, message);
  }

  /**
   * Fork a child process
   */
  protected fork(childId: string, process: IPosisProcess): void {
    this.syscalls.fork(childId, process);
  }

  /**
   * Log a message
   */
  protected log(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    if (this.context) {
      this.context.log(level, message, metadata);
    }
  }

  /**
   * Emit an event
   */
  protected emit(event: string, data: unknown): void {
    if (this.context) {
      this.context.emit(event, data);
    }
  }

  /**
   * Subscribe to an event
   */
  protected on(event: string, handler: (data: unknown) => void): void {
    if (this.context) {
      this.context.on(event, handler);
    }
  }

  /**
   * Get shared memory
   */
  protected getSharedMemory(key: string): unknown {
    return this.syscalls.getSharedMemory(key);
  }

  /**
   * Set shared memory
   */
  protected setSharedMemory(key: string, value: unknown): void {
    this.syscalls.setSharedMemory(key, value);
  }
}

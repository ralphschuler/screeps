/**
 * IPosisKernel - Portable Operating System Interface for Screeps
 *
 * Standard interface for kernel implementations following POSIS principles.
 * This interface provides a contract for process management, scheduling,
 * and inter-process communication.
 *
 * Enhancements implemented:
 * - Process sandboxing with isolated memory and syscall-only communication
 * - Per-process CPU and memory resource limits with hard enforcement
 * - Automatic crash recovery with cooldown and permanent disable after 3 crashes
 * - IPC communication tracing for debugging inter-process messages
 * - Process migration support with state serialization and validation
 * - Automatic checkpointing for state preservation across global resets
 * - Priority inheritance for process dependencies to prevent priority inversion
 *
 * References:
 * - https://github.com/screepers/POSIS
 * - ROADMAP.md Section 22: POSIS Operating System Architecture
 */

import type { IPosisProcess, IPosisProcessContext } from "./IPosisProcess";

/**
 * Process spawn options
 */
export interface IPosisSpawnOptions {
  /** Parent process ID (for hierarchy) */
  parentId?: string;
  /** Initial priority */
  priority?: number;
  /** Initial CPU budget (fraction, 0-1) */
  cpuBudget?: number;
  /** Run interval in ticks */
  interval?: number;
  /** Minimum bucket to run */
  minBucket?: number;
  /** Process metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Kernel interface following POSIS principles
 */
export interface IPosisKernel {
  /**
   * Initialize the kernel
   */
  initialize(): void;

  /**
   * Register a process type with the kernel
   * @param id Unique process ID
   * @param process Process instance
   * @param options Spawn options
   */
  registerProcess(id: string, process: IPosisProcess, options?: IPosisSpawnOptions): void;

  /**
   * Unregister a process
   * @param id Process ID to unregister
   */
  unregisterProcess(id: string): void;

  /**
   * Get a process by ID
   * @param id Process ID
   * @returns Process instance or undefined
   */
  getProcess(id: string): IPosisProcess | undefined;

  /**
   * Get all registered processes
   */
  getProcesses(): IPosisProcess[];

  /**
   * Get process context for inter-process communication
   * @param processId Process ID
   */
  getProcessContext(processId: string): IPosisProcessContext | undefined;

  /**
   * Run the kernel for one tick
   * Executes all scheduled processes according to priority and CPU budget
   */
  run(): void;

  /**
   * Send a message to a process
   * @param targetId Target process ID
   * @param message Message data
   * @param senderId Sender process ID
   */
  sendMessage(targetId: string, message: unknown, senderId: string): void;

  /**
   * Get current bucket mode
   */
  getBucketMode(): "critical" | "low" | "normal" | "high";

  /**
   * Check if CPU budget is available
   */
  hasCpuBudget(): boolean;

  /**
   * Get CPU statistics
   */
  getCpuStats(): {
    used: number;
    limit: number;
    bucket: number;
  };
}

/**
 * Process syscall interface for process-kernel interaction
 */
export interface IPosisProcessSyscalls {
  /**
   * Sleep for N ticks
   * @param ticks Number of ticks to sleep
   */
  sleep(ticks: number): void;

  /**
   * Wake up a sleeping process
   * @param processId Process ID to wake
   */
  wake(processId: string): void;

  /**
   * Fork a child process
   * @param processId New process ID
   * @param process Process instance
   * @param options Spawn options
   */
  fork(processId: string, process: IPosisProcess, options?: IPosisSpawnOptions): void;

  /**
   * Kill a process
   * @param processId Process ID to kill
   */
  kill(processId: string): void;

  /**
   * Adjust process priority at runtime
   * @param processId Process ID
   * @param priority New priority
   */
  setPriority(processId: string, priority: number): void;

  /**
   * Send message to another process
   * @param targetId Target process ID
   * @param message Message data
   */
  sendMessage(targetId: string, message: unknown): void;

  /**
   * Get messages for this process
   */
  getMessages(): unknown[];

  /**
   * Get shared memory for inter-process communication
   * @param key Memory key
   */
  getSharedMemory(key: string): unknown;

  /**
   * Set shared memory
   * @param key Memory key
   * @param value Value to store
   */
  setSharedMemory(key: string, value: unknown): void;
}

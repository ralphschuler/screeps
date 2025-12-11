/**
 * PosisKernelAdapter - Adapter for existing Kernel to implement IPosisKernel
 *
 * This adapter extends the existing kernel with POSIS-compliant interfaces
 * and adds ScreepsOS-inspired syscalls for enhanced process management.
 *
 * Features:
 * - Process sleep/wake syscalls
 * - Process forking (parent-child relationships)
 * - Runtime priority adjustment
 * - Inter-process messaging
 * - Shared memory segments
 * - Process state serialization
 *
 * References:
 * - https://github.com/screepers/POSIS
 * - https://github.com/screepers/ScreepsOS
 * - ROADMAP.md Section 3: Architektur-Ebenen
 */

import { kernel } from "../kernel";
import { logger } from "../logger";
import { eventBus } from "../events";
import type {
  IPosisKernel,
  IPosisSpawnOptions,
  IPosisProcessSyscalls
} from "./IPosisKernel";
import type {
  IPosisProcess,
  IPosisProcessContext,
  IPosisProcessMemory
} from "./IPosisProcess";

/**
 * Process context implementation
 */
class ProcessContext implements IPosisProcessContext {
  public id: string;
  public parentId?: string;
  public memory: Record<string, unknown>;
  public syscalls: IPosisProcessSyscalls;

  constructor(
    id: string,
    adapter: PosisKernelAdapter,
    parentId?: string
  ) {
    this.id = id;
    this.parentId = parentId;
    this.memory = adapter.getProcessMemory(id);
    this.syscalls = adapter.createSyscalls(id);
  }

  public on(event: string, handler: (data: unknown) => void): void {
    eventBus.on(event as any, handler);
  }

  public emit(event: string, data: unknown): void {
    eventBus.emit(event as any, data);
  }

  public log(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    const meta = { ...metadata, process: this.id };
    logger[level](message, meta);
  }
}

/**
 * POSIS Kernel Adapter
 */
export class PosisKernelAdapter implements IPosisKernel {
  private processContexts: Map<string, IPosisProcessContext> = new Map();
  private processInstances: Map<string, IPosisProcess> = new Map();
  private messageQueues: Map<string, Array<{ message: unknown; senderId: string }>> = new Map();
  private sharedMemory: Map<string, unknown> = new Map();
  private processHierarchy: Map<string, Set<string>> = new Map(); // parent -> children

  /**
   * Initialize the kernel adapter
   */
  public initialize(): void {
    kernel.initialize();
    this.loadProcessStates();
  }

  /**
   * Register a process
   */
  public registerProcess(
    id: string,
    process: IPosisProcess,
    options?: IPosisSpawnOptions
  ): void {
    // Create process context
    const context = new ProcessContext(id, this, options?.parentId);
    this.processContexts.set(id, context);
    this.processInstances.set(id, process);
    this.messageQueues.set(id, []);

    // Track parent-child relationship
    if (options?.parentId) {
      const children = this.processHierarchy.get(options.parentId) || new Set();
      children.add(id);
      this.processHierarchy.set(options.parentId, children);
    }

    // Initialize process
    if (process.init) {
      process.init(context);
    }

    // Restore state if available
    const savedState = this.getProcessMemoryData(id);
    if (savedState && process.deserialize) {
      process.deserialize(savedState);
    }

    // Register with underlying kernel
    kernel.registerProcess({
      id,
      name: process.name,
      priority: options?.priority ?? process.priority,
      frequency: this.mapPriorityToFrequency(process.priority),
      cpuBudget: options?.cpuBudget ?? 0.1,
      interval: options?.interval ?? 1,
      minBucket: options?.minBucket ?? 0,
      execute: () => this.executeProcess(id)
    });
  }

  /**
   * Unregister a process
   */
  public unregisterProcess(id: string): void {
    const process = this.processInstances.get(id);
    
    // Cleanup process
    if (process?.cleanup) {
      process.cleanup();
    }

    // Serialize state before removing
    if (process?.serialize) {
      const state = process.serialize();
      this.setProcessMemoryData(id, state);
    }

    // Remove children
    const children = this.processHierarchy.get(id);
    if (children) {
      for (const childId of children) {
        this.unregisterProcess(childId);
      }
      this.processHierarchy.delete(id);
    }

    // Remove from parent's children
    for (const [parentId, children] of this.processHierarchy) {
      if (children.has(id)) {
        children.delete(id);
      }
    }

    // Clean up
    this.processContexts.delete(id);
    this.processInstances.delete(id);
    this.messageQueues.delete(id);
    kernel.unregisterProcess(id);
  }

  /**
   * Get a process by ID
   */
  public getProcess(id: string): IPosisProcess | undefined {
    return this.processInstances.get(id);
  }

  /**
   * Get all registered processes
   */
  public getProcesses(): IPosisProcess[] {
    return Array.from(this.processInstances.values());
  }

  /**
   * Get process context
   */
  public getProcessContext(processId: string): IPosisProcessContext | undefined {
    return this.processContexts.get(processId);
  }

  /**
   * Run the kernel
   */
  public run(): void {
    kernel.run();
    this.saveProcessStates();
  }

  /**
   * Send a message to a process
   */
  public sendMessage(targetId: string, message: unknown, senderId: string): void {
    const queue = this.messageQueues.get(targetId);
    if (queue) {
      queue.push({ message, senderId });
    }
  }

  /**
   * Get current bucket mode
   */
  public getBucketMode(): "critical" | "low" | "normal" | "high" {
    return kernel.getBucketMode();
  }

  /**
   * Check if CPU budget is available
   */
  public hasCpuBudget(): boolean {
    return kernel.hasCpuBudget();
  }

  /**
   * Get CPU statistics
   */
  public getCpuStats() {
    return {
      used: Game.cpu.getUsed(),
      limit: Game.cpu.limit,
      bucket: Game.cpu.bucket
    };
  }

  /**
   * Execute a process
   */
  private executeProcess(id: string): void {
    const process = this.processInstances.get(id);
    if (!process) return;

    // Check if process is sleeping
    const memory = this.getProcessMemoryData(id) as IPosisProcessMemory | undefined;
    if (memory?.state === "sleeping" && memory.sleepUntil) {
      if (Game.time < memory.sleepUntil) {
        return; // Still sleeping
      }
      // Wake up
      memory.state = "running";
      this.setProcessMemoryData(id, memory);
    }

    // Deliver messages
    const queue = this.messageQueues.get(id);
    if (queue && queue.length > 0 && process.onMessage) {
      for (const { message, senderId } of queue) {
        try {
          process.onMessage(message, senderId);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          logger.error(`Process ${id} message handler error: ${errorMessage}`, {
            subsystem: "PosisKernel",
            processId: id
          });
        }
      }
      queue.length = 0; // Clear queue
    }

    // Run process
    try {
      process.state = "running";
      const result = process.run();
      
      // Handle async processes (optional)
      if (result instanceof Promise) {
        result.catch((err) => {
          const errorMessage = err instanceof Error ? err.message : String(err);
          logger.error(`Async process ${id} error: ${errorMessage}`, {
            subsystem: "PosisKernel",
            processId: id
          });
        });
      }
      
      process.state = "idle";
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error(`Process ${id} error: ${errorMessage}`, {
        subsystem: "PosisKernel",
        processId: id
      });
      process.state = "error";
    }
  }

  /**
   * Create syscalls for a process
   */
  public createSyscalls(processId: string): IPosisProcessSyscalls {
    return {
      sleep: (ticks: number) => {
        const memory = this.getProcessMemoryData(processId) as IPosisProcessMemory;
        memory.state = "sleeping";
        memory.sleepUntil = Game.time + ticks;
        this.setProcessMemoryData(processId, memory);
      },

      wake: (targetId: string) => {
        const memory = this.getProcessMemoryData(targetId) as IPosisProcessMemory;
        if (memory?.state === "sleeping") {
          memory.state = "running";
          delete memory.sleepUntil;
          this.setProcessMemoryData(targetId, memory);
        }
      },

      fork: (childId: string, process: IPosisProcess, options?: IPosisSpawnOptions) => {
        this.registerProcess(childId, process, {
          ...options,
          parentId: processId
        });
      },

      kill: (targetId: string) => {
        this.unregisterProcess(targetId);
      },

      setPriority: (targetId: string, priority: number) => {
        // This is a limitation - we need to re-register the process with new priority
        // For now, log a warning
        logger.warn(`setPriority not fully implemented for ${targetId}`, {
          subsystem: "PosisKernel"
        });
      },

      sendMessage: (targetId: string, message: unknown) => {
        this.sendMessage(targetId, message, processId);
      },

      getMessages: () => {
        const queue = this.messageQueues.get(processId) || [];
        return queue.map(m => m.message);
      },

      getSharedMemory: (key: string) => {
        return this.sharedMemory.get(key);
      },

      setSharedMemory: (key: string, value: unknown) => {
        this.sharedMemory.set(key, value);
      }
    };
  }

  /**
   * Get process memory storage
   */
  public getProcessMemory(processId: string): Record<string, unknown> {
    if (!Memory.posisProcesses) {
      Memory.posisProcesses = {};
    }
    if (!Memory.posisProcesses[processId]) {
      Memory.posisProcesses[processId] = {
        id: processId,
        state: "idle",
        lastRunTick: 0,
        data: {}
      };
    }
    return Memory.posisProcesses[processId].data || {};
  }

  /**
   * Get process memory data
   */
  private getProcessMemoryData(processId: string): Record<string, unknown> {
    if (!Memory.posisProcesses) {
      Memory.posisProcesses = {};
    }
    return Memory.posisProcesses[processId] || {};
  }

  /**
   * Set process memory data
   */
  private setProcessMemoryData(processId: string, data: Record<string, unknown>): void {
    if (!Memory.posisProcesses) {
      Memory.posisProcesses = {};
    }
    Memory.posisProcesses[processId] = data;
  }

  /**
   * Load process states from Memory
   */
  private loadProcessStates(): void {
    if (!Memory.posisProcesses) return;

    for (const [id, state] of Object.entries(Memory.posisProcesses)) {
      const process = this.processInstances.get(id);
      if (process?.deserialize) {
        process.deserialize(state as Record<string, unknown>);
      }
    }
  }

  /**
   * Save process states to Memory
   */
  private saveProcessStates(): void {
    if (!Memory.posisProcesses) {
      Memory.posisProcesses = {};
    }

    for (const [id, process] of this.processInstances) {
      if (process.serialize) {
        const state = process.serialize();
        Memory.posisProcesses[id] = state;
      }
    }
  }

  /**
   * Map priority to frequency
   */
  private mapPriorityToFrequency(priority: number): "high" | "medium" | "low" {
    if (priority >= 75) return "high";
    if (priority >= 50) return "medium";
    return "low";
  }
}

// Extend Memory interface
declare global {
  interface Memory {
    posisProcesses?: Record<string, Record<string, unknown>>;
  }
}

/**
 * Global POSIS kernel adapter instance
 */
export const posisKernel = new PosisKernelAdapter();

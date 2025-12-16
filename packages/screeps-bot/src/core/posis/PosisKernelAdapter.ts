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
 * Process resource limits
 */
interface ProcessResourceLimits {
  cpuBudget: number; // Fraction of CPU limit (0-1)
  memoryLimit?: number; // Optional memory limit in bytes
  cpuWarningThreshold: number; // Warning at X% of budget (0-1)
}

/**
 * Process crash metadata
 */
interface ProcessCrashMetadata {
  crashCount: number;
  consecutiveCrashes: number;
  lastCrashTick: number;
  restartCooldownUntil?: number;
  disabled: boolean;
}

/**
 * IPC message trace
 */
interface IPCMessageTrace {
  timestamp: number;
  senderId: string;
  receiverId: string;
  messageSize: number;
  messageType: string;
}

/**
 * Process checkpoint
 */
interface ProcessCheckpoint {
  processId: string;
  tick: number;
  state: Record<string, unknown>;
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
  
  // Resource limits and crash recovery
  private processResourceLimits: Map<string, ProcessResourceLimits> = new Map();
  private processCrashMetadata: Map<string, ProcessCrashMetadata> = new Map();
  private processCpuUsage: Map<string, number> = new Map();
  
  // Communication tracing
  private ipcTraceEnabled = false;
  private ipcMessageTraces: IPCMessageTrace[] = [];
  private ipcMessageCount: Map<string, number> = new Map(); // channel -> count
  
  // Checkpointing
  private checkpointFrequency = 100; // Default: checkpoint every 100 ticks
  private lastCheckpointTick = 0;
  
  // Priority inheritance
  private processDependencies: Map<string, Set<string>> = new Map(); // dependent -> dependencies
  private inheritedPriorities: Map<string, number> = new Map(); // process -> inherited priority
  private maxInheritedPriority = 100; // Cap on inherited priority

  /**
   * Initialize the kernel adapter
   */
  public initialize(): void {
    kernel.initialize();
    this.loadProcessStates();
    this.loadCheckpoints();
  }
  
  /**
   * Enable or disable IPC communication tracing
   */
  public setIPCTracing(enabled: boolean): void {
    this.ipcTraceEnabled = enabled;
    logger.info(`IPC tracing ${enabled ? 'enabled' : 'disabled'}`, {
      subsystem: "PosisKernel"
    });
  }
  
  /**
   * Set checkpoint frequency
   */
  public setCheckpointFrequency(ticks: number): void {
    this.checkpointFrequency = Math.max(1, ticks);
  }
  
  /**
   * Set resource limits for a process
   */
  public setProcessResourceLimits(processId: string, limits: Partial<ProcessResourceLimits>): void {
    const existing = this.processResourceLimits.get(processId) || {
      cpuBudget: 0.1,
      cpuWarningThreshold: 0.8
    };
    this.processResourceLimits.set(processId, { ...existing, ...limits });
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
    
    // Initialize resource limits
    this.processResourceLimits.set(id, {
      cpuBudget: options?.cpuBudget ?? 0.1,
      cpuWarningThreshold: 0.8
    });
    
    // Initialize crash metadata
    this.processCrashMetadata.set(id, {
      crashCount: 0,
      consecutiveCrashes: 0,
      lastCrashTick: 0,
      disabled: false
    });

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

    // Clean up all process data
    this.processContexts.delete(id);
    this.processInstances.delete(id);
    this.messageQueues.delete(id);
    this.processResourceLimits.delete(id);
    this.processCrashMetadata.delete(id);
    this.processCpuUsage.delete(id);
    this.inheritedPriorities.delete(id);
    this.processDependencies.delete(id);
    
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
    
    // Perform checkpointing if needed
    if (Game.time - this.lastCheckpointTick >= this.checkpointFrequency) {
      this.performCheckpointing();
      this.lastCheckpointTick = Game.time;
    }
    
    this.saveProcessStates();
    
    // Log IPC statistics if tracing is enabled
    if (this.ipcTraceEnabled && Game.time % 100 === 0) {
      this.logIPCStatistics();
    }
  }

  /**
   * Send a message to a process
   */
  public sendMessage(targetId: string, message: unknown, senderId: string): void {
    const queue = this.messageQueues.get(targetId);
    if (queue) {
      queue.push({ message, senderId });
      
      // IPC tracing
      if (this.ipcTraceEnabled) {
        this.traceIPCMessage(senderId, targetId, message);
      }
      
      // Detect excessive communication
      const channelKey = `${senderId}->${targetId}`;
      const count = (this.ipcMessageCount.get(channelKey) || 0) + 1;
      this.ipcMessageCount.set(channelKey, count);
      
      // Warn if excessive (more than 100 messages per tick on a channel)
      if (count > 100 && count % 100 === 0) {
        logger.warn(
          `Excessive IPC: ${channelKey} has sent ${count} messages this tick`,
          { subsystem: "PosisKernel" }
        );
      }
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
    
    // Check if process is disabled due to crashes
    const crashMeta = this.processCrashMetadata.get(id);
    if (crashMeta?.disabled) {
      return;
    }
    
    // Check if process is in restart cooldown
    if (crashMeta?.restartCooldownUntil && Game.time < crashMeta.restartCooldownUntil) {
      return; // Still in cooldown
    }

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

    // Track CPU usage before execution
    const cpuBefore = Game.cpu.getUsed();
    
    // Run process with crash recovery
    try {
      process.state = "running";
      const result = process.run();
      
      // Handle async processes (optional)
      if (result instanceof Promise) {
        result.catch((err) => {
          this.handleProcessCrash(id, err);
        });
      }
      
      process.state = "idle";
      
      // Reset consecutive crash counter on success
      if (crashMeta) {
        crashMeta.consecutiveCrashes = 0;
      }
    } catch (err) {
      this.handleProcessCrash(id, err);
    }
    
    // Check CPU usage and enforce limits
    const cpuUsed = Game.cpu.getUsed() - cpuBefore;
    this.processCpuUsage.set(id, cpuUsed);
    this.checkResourceLimits(id, cpuUsed);
  }
  
  /**
   * Handle process crash with automatic recovery
   */
  private handleProcessCrash(id: string, err: unknown): void {
    const process = this.processInstances.get(id);
    if (!process) return;
    
    const errorMessage = err instanceof Error ? err.message : String(err);
    const stackTrace = err instanceof Error && err.stack ? err.stack : '';
    
    // Update crash metadata
    let crashMeta = this.processCrashMetadata.get(id);
    if (!crashMeta) {
      crashMeta = {
        crashCount: 0,
        consecutiveCrashes: 0,
        lastCrashTick: 0,
        disabled: false
      };
      this.processCrashMetadata.set(id, crashMeta);
    }
    
    crashMeta.crashCount++;
    crashMeta.consecutiveCrashes++;
    crashMeta.lastCrashTick = Game.time;
    
    // Log crash with stack trace
    logger.error(
      `Process ${id} (${process.name}) crashed: ${errorMessage}`,
      { subsystem: "PosisKernel", processId: id, crashCount: crashMeta.crashCount }
    );
    if (stackTrace) {
      logger.error(stackTrace, { subsystem: "PosisKernel", processId: id });
    }
    
    process.state = "error";
    
    // Check if we should disable the process permanently
    if (crashMeta.consecutiveCrashes >= 3) {
      crashMeta.disabled = true;
      logger.error(
        `Process ${id} (${process.name}) disabled after 3 consecutive crashes`,
        { subsystem: "PosisKernel", processId: id }
      );
      console.log(
        `⚠️ POSIS ALERT: Process "${process.name}" (${id}) has been permanently disabled after 3 consecutive crashes`
      );
    } else {
      // Set restart cooldown (10 ticks)
      crashMeta.restartCooldownUntil = Game.time + 10;
      logger.warn(
        `Process ${id} (${process.name}) will restart in 10 ticks (crashes: ${crashMeta.consecutiveCrashes}/3)`,
        { subsystem: "PosisKernel", processId: id }
      );
    }
  }
  
  /**
   * Check resource limits and enforce them
   */
  private checkResourceLimits(id: string, cpuUsed: number): void {
    const limits = this.processResourceLimits.get(id);
    if (!limits) return;
    
    const cpuLimit = Game.cpu.limit * limits.cpuBudget;
    
    // Check if over hard limit - kill process
    if (cpuUsed > cpuLimit) {
      const process = this.processInstances.get(id);
      logger.error(
        `Process ${id} (${process?.name}) exceeded CPU limit: ${cpuUsed.toFixed(3)} > ${cpuLimit.toFixed(3)} - KILLED`,
        { subsystem: "PosisKernel", processId: id }
      );
      this.unregisterProcess(id);
      return;
    }
    
    // Check if approaching limit - warn
    const warningThreshold = cpuLimit * limits.cpuWarningThreshold;
    if (cpuUsed > warningThreshold && Game.time % 100 === 0) {
      const process = this.processInstances.get(id);
      const percentage = (cpuUsed / cpuLimit * 100).toFixed(0);
      logger.warn(
        `Process ${id} (${process?.name}) at ${percentage}% of CPU budget: ${cpuUsed.toFixed(3)}/${cpuLimit.toFixed(3)}`,
        { subsystem: "PosisKernel", processId: id }
      );
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
        const process = this.processInstances.get(targetId);
        if (!process) {
          logger.warn(`Cannot set priority for unknown process ${targetId}`, {
            subsystem: "PosisKernel"
          });
          return;
        }
        
        // Update process priority
        process.priority = priority;
        
        // Note: The underlying kernel process priority cannot be changed after registration
        // without re-registering. The new priority will take effect if the process is
        // re-registered (e.g., after a respawn or manual restart).
        logger.debug(`Updated priority for ${targetId} to ${priority} (takes effect on next registration)`, {
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
  
  /**
   * Trace IPC message for debugging
   */
  private traceIPCMessage(senderId: string, receiverId: string, message: unknown): void {
    const messageSize = JSON.stringify(message).length;
    const messageType = typeof message === 'object' && message !== null && 'type' in message
      ? String((message as any).type)
      : typeof message;
    
    this.ipcMessageTraces.push({
      timestamp: Game.time,
      senderId,
      receiverId,
      messageSize,
      messageType
    });
    
    // Keep only last 1000 traces to avoid memory bloat
    if (this.ipcMessageTraces.length > 1000) {
      this.ipcMessageTraces = this.ipcMessageTraces.slice(-1000);
    }
    
    logger.debug(
      `IPC: ${senderId} -> ${receiverId} (${messageType}, ${messageSize} bytes)`,
      { subsystem: "PosisKernel" }
    );
  }
  
  /**
   * Log IPC statistics
   */
  private logIPCStatistics(): void {
    // Group messages by channel
    const channelStats: Record<string, { count: number; totalBytes: number }> = {};
    
    for (const trace of this.ipcMessageTraces.filter(t => t.timestamp >= Game.time - 100)) {
      const channel = `${trace.senderId}->${trace.receiverId}`;
      if (!channelStats[channel]) {
        channelStats[channel] = { count: 0, totalBytes: 0 };
      }
      channelStats[channel].count++;
      channelStats[channel].totalBytes += trace.messageSize;
    }
    
    // Log top channels
    const topChannels = Object.entries(channelStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);
    
    if (topChannels.length > 0) {
      logger.info(
        `IPC Statistics (last 100 ticks): Top channels:\n` +
        topChannels.map(([ch, stats]) => 
          `  ${ch}: ${stats.count} messages, ${stats.totalBytes} bytes`
        ).join('\n'),
        { subsystem: "PosisKernel" }
      );
    }
    
    // Reset per-tick message count
    this.ipcMessageCount.clear();
  }
  
  /**
   * Perform checkpointing for all processes
   */
  private performCheckpointing(): void {
    if (!Memory.processCheckpoints) {
      Memory.processCheckpoints = {};
    }
    
    let checkpointCount = 0;
    
    for (const [id, process] of this.processInstances) {
      if (process.serialize) {
        const state = process.serialize();
        
        // Incremental checkpointing: only save if state changed
        const previousCheckpoint = Memory.processCheckpoints[id];
        const stateJson = JSON.stringify(state);
        
        if (!previousCheckpoint || JSON.stringify(previousCheckpoint.state) !== stateJson) {
          Memory.processCheckpoints[id] = {
            processId: id,
            tick: Game.time,
            state
          };
          checkpointCount++;
        }
      }
    }
    
    if (checkpointCount > 0) {
      logger.debug(
        `Checkpointed ${checkpointCount} processes at tick ${Game.time}`,
        { subsystem: "PosisKernel" }
      );
    }
  }
  
  /**
   * Load checkpoints from Memory
   */
  private loadCheckpoints(): void {
    if (!Memory.processCheckpoints) return;
    
    let restoredCount = 0;
    
    for (const [id, checkpoint] of Object.entries(Memory.processCheckpoints)) {
      const process = this.processInstances.get(id);
      if (process?.deserialize && checkpoint.state) {
        process.deserialize(checkpoint.state);
        restoredCount++;
      }
    }
    
    if (restoredCount > 0) {
      logger.info(
        `Restored ${restoredCount} processes from checkpoints`,
        { subsystem: "PosisKernel" }
      );
    }
  }
  
  /**
   * Add process dependency for priority inheritance
   */
  public addProcessDependency(dependentId: string, dependsOnId: string): void {
    const deps = this.processDependencies.get(dependentId) || new Set();
    deps.add(dependsOnId);
    this.processDependencies.set(dependentId, deps);
  }
  
  /**
   * Remove process dependency
   */
  public removeProcessDependency(dependentId: string, dependsOnId: string): void {
    const deps = this.processDependencies.get(dependentId);
    if (deps) {
      deps.delete(dependsOnId);
      if (deps.size === 0) {
        this.processDependencies.delete(dependentId);
      }
    }
  }
  
  /**
   * Calculate inherited priority for a process
   */
  private calculateInheritedPriority(processId: string): number {
    const process = this.processInstances.get(processId);
    if (!process) return 0;
    
    let maxPriority = process.priority;
    
    // Check all processes that depend on this one
    for (const [dependentId, dependencies] of this.processDependencies) {
      if (dependencies.has(processId)) {
        const dependent = this.processInstances.get(dependentId);
        if (dependent && dependent.priority > maxPriority) {
          maxPriority = Math.min(dependent.priority, this.maxInheritedPriority);
        }
      }
    }
    
    return maxPriority;
  }
  
  /**
   * Update inherited priorities for all processes
   */
  private updateInheritedPriorities(): void {
    for (const id of this.processInstances.keys()) {
      const inheritedPriority = this.calculateInheritedPriority(id);
      const process = this.processInstances.get(id);
      
      if (process && inheritedPriority > process.priority) {
        this.inheritedPriorities.set(id, inheritedPriority);
      } else {
        this.inheritedPriorities.delete(id);
      }
    }
  }
  
  /**
   * Migrate a process to another kernel instance
   * Returns serialized process state for migration
   */
  public migrateProcess(processId: string): Record<string, unknown> | null {
    const process = this.processInstances.get(processId);
    if (!process?.serialize) {
      logger.warn(`Cannot migrate process ${processId}: no serialize method`, {
        subsystem: "PosisKernel"
      });
      return null;
    }
    
    try {
      const state = process.serialize();
      
      // Validate state is JSON-serializable
      const stateJson = JSON.stringify(state);
      const validated = JSON.parse(stateJson);
      
      logger.info(`Migrated process ${processId} (${process.name})`, {
        subsystem: "PosisKernel",
        stateSize: stateJson.length
      });
      
      return {
        id: processId,
        name: process.name,
        priority: process.priority,
        state: validated
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error(`Failed to migrate process ${processId}: ${errorMessage}`, {
        subsystem: "PosisKernel"
      });
      return null;
    }
  }
  
  /**
   * Import a migrated process
   */
  public importMigratedProcess(
    processData: Record<string, unknown>,
    process: IPosisProcess,
    options?: IPosisSpawnOptions
  ): boolean {
    try {
      const id = processData.id as string;
      
      // Register the process
      this.registerProcess(id, process, options);
      
      // Restore state
      if (processData.state && process.deserialize) {
        process.deserialize(processData.state as Record<string, unknown>);
      }
      
      logger.info(`Imported migrated process ${id} (${process.name})`, {
        subsystem: "PosisKernel"
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error(`Failed to import process: ${errorMessage}`, {
        subsystem: "PosisKernel"
      });
      
      // Rollback on failure
      if (processData.id) {
        this.unregisterProcess(processData.id as string);
      }
      
      return false;
    }
  }
  
  /**
   * Get process crash metadata
   */
  public getProcessCrashMetadata(processId: string): ProcessCrashMetadata | undefined {
    return this.processCrashMetadata.get(processId);
  }
  
  /**
   * Get IPC message traces
   */
  public getIPCMessageTraces(limit = 100): IPCMessageTrace[] {
    return this.ipcMessageTraces.slice(-limit);
  }
  
  /**
   * Get process CPU usage
   */
  public getProcessCpuUsage(processId: string): number {
    return this.processCpuUsage.get(processId) || 0;
  }
}

// Extend Memory interface
declare global {
  interface Memory {
    posisProcesses?: Record<string, Record<string, unknown>>;
    processCheckpoints?: Record<string, ProcessCheckpoint>;
  }
}

/**
 * Global POSIS kernel adapter instance
 */
export const posisKernel = new PosisKernelAdapter();

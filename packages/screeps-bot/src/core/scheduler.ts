/**
 * CPU Scheduler - Phase 6
 *
 * Implements bucket-based CPU management and task scheduling:
 * - High-frequency tasks (every tick)
 * - Medium-frequency tasks (every 5-10 ticks)
 * - Low-frequency tasks (every 20-50 ticks)
 * - Bucket modes (normal, low, high)
 *
 * NOTE: The kernel is the primary source of truth for bucket modes.
 * The scheduler delegates to kernel for bucket mode decisions to ensure
 * consistent behavior, especially during pixel generation recovery periods.
 */

import { logger } from "./logger";
import { kernel } from "./kernel";

/**
 * Bucket mode enum
 */
export type BucketMode = "low" | "normal" | "high";

/**
 * Task frequency
 */
export type TaskFrequency = "high" | "medium" | "low";

/**
 * Scheduled task definition
 */
export interface ScheduledTask {
  /** Task name */
  name: string;
  /** Execution function */
  execute: () => void;
  /** Task frequency */
  frequency: TaskFrequency;
  /** Minimum bucket to run */
  minBucket: number;
  /** Interval in ticks (for medium/low frequency) */
  interval: number;
  /** Last run tick */
  lastRun: number;
  /** CPU budget (0-1, fraction of available) */
  cpuBudget: number;
  /** Priority (higher runs first) */
  priority: number;
}

/**
 * Scheduler configuration
 */
export interface SchedulerConfig {
  /** Low bucket threshold */
  lowBucketThreshold: number;
  /** High bucket threshold */
  highBucketThreshold: number;
  /** Target CPU usage (fraction) */
  targetCpuUsage: number;
  /** High frequency interval */
  highFrequencyInterval: number;
  /** Medium frequency interval */
  mediumFrequencyInterval: number;
  /** Low frequency interval */
  lowFrequencyInterval: number;
}

const DEFAULT_CONFIG: SchedulerConfig = {
  lowBucketThreshold: 2000,
  highBucketThreshold: 9000,
  targetCpuUsage: 0.8,
  highFrequencyInterval: 1,
  mediumFrequencyInterval: 5,
  lowFrequencyInterval: 20
};

/**
 * CPU Scheduler
 */
export class Scheduler {
  private config: SchedulerConfig;
  private tasks: Map<string, ScheduledTask> = new Map();
  private currentMode: BucketMode = "normal";
  private tickCpuUsed = 0;

  public constructor(config: Partial<SchedulerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Register a task
   */
  public registerTask(task: Omit<ScheduledTask, "lastRun">): void {
    this.tasks.set(task.name, {
      ...task,
      lastRun: 0
    });
  }

  /**
   * Unregister a task
   */
  public unregisterTask(name: string): void {
    this.tasks.delete(name);
  }

  /**
   * Determine current bucket mode.
   * Delegates to the kernel for consistent bucket mode decisions,
   * especially during pixel generation recovery periods.
   * 
   * Note: The kernel has a more granular BucketMode ("critical" | "low" | "normal" | "high")
   * while the scheduler uses a simpler set ("low" | "normal" | "high") for backward compatibility.
   * The kernel's "critical" mode is mapped to "low" for scheduler consumers.
   */
  public getBucketMode(): BucketMode {
    // Delegate to kernel for consistent bucket mode decisions
    const kernelMode = kernel.getBucketMode();
    
    // Map kernel's BucketMode to scheduler's BucketMode
    // Kernel has "critical" which scheduler treats as "low" for backward compatibility
    if (kernelMode === "critical" || kernelMode === "low") {
      return "low";
    }
    if (kernelMode === "high") {
      return "high";
    }
    return "normal";
  }

  /**
   * Update bucket mode
   */
  private updateBucketMode(): void {
    const newMode = this.getBucketMode();
    if (newMode !== this.currentMode) {
      logger.info(`Bucket mode changed: ${this.currentMode} -> ${newMode}`, {
        subsystem: "Scheduler"
      });
      this.currentMode = newMode;
    }
  }

  /**
   * Get CPU limit for current tick
   */
  public getCpuLimit(): number {
    const baseLimit = Game.cpu.limit;

    switch (this.currentMode) {
      case "low":
        return baseLimit * 0.5;
      case "high":
        return baseLimit * this.config.targetCpuUsage;
      default:
        return baseLimit * this.config.targetCpuUsage;
    }
  }

  /**
   * Check if we have CPU budget remaining
   */
  public hasCpuBudget(): boolean {
    return Game.cpu.getUsed() < this.getCpuLimit();
  }

  /**
   * Get remaining CPU budget
   */
  public getRemainingCpu(): number {
    return Math.max(0, this.getCpuLimit() - Game.cpu.getUsed());
  }

  /**
   * Check if task should run this tick
   */
  private shouldRunTask(task: ScheduledTask): boolean {
    // Check bucket requirement
    if (Game.cpu.bucket < task.minBucket) {
      return false;
    }

    // Check frequency
    const ticksSinceRun = Game.time - task.lastRun;
    const interval = this.getIntervalForFrequency(task.frequency);

    if (ticksSinceRun < interval) {
      return false;
    }

    // In low bucket mode, skip non-essential tasks
    if (this.currentMode === "low" && task.frequency !== "high") {
      return false;
    }

    return true;
  }

  /**
   * Get interval for frequency
   */
  private getIntervalForFrequency(frequency: TaskFrequency): number {
    switch (frequency) {
      case "high":
        return this.config.highFrequencyInterval;
      case "medium":
        return this.config.mediumFrequencyInterval;
      case "low":
        return this.config.lowFrequencyInterval;
    }
  }

  /**
   * Run scheduled tasks
   */
  public run(): void {
    this.updateBucketMode();
    this.tickCpuUsed = 0;

    // Sort tasks by priority
    const sortedTasks = Array.from(this.tasks.values()).sort((a, b) => b.priority - a.priority);

    for (const task of sortedTasks) {
      if (!this.shouldRunTask(task)) {
        continue;
      }

      // Check CPU budget
      const cpuBefore = Game.cpu.getUsed();
      const taskCpuBudget = this.getCpuLimit() * task.cpuBudget;

      if (cpuBefore + taskCpuBudget > this.getCpuLimit() && task.frequency !== "high") {
        continue;
      }

      try {
        task.execute();
        task.lastRun = Game.time;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.error(`Task ${task.name} failed: ${errorMessage}`, { subsystem: "Scheduler" });
      }

      const cpuUsed = Game.cpu.getUsed() - cpuBefore;
      this.tickCpuUsed += cpuUsed;

      // Stop if over budget
      if (!this.hasCpuBudget()) {
        logger.warn("CPU budget exhausted, skipping remaining tasks", { subsystem: "Scheduler" });
        break;
      }
    }
  }

  /**
   * Get CPU used this tick by scheduler
   */
  public getTickCpuUsed(): number {
    return this.tickCpuUsed;
  }

  /**
   * Get current bucket mode
   */
  public getCurrentMode(): BucketMode {
    return this.currentMode;
  }

  /**
   * Get task list
   */
  public getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }
}

/**
 * Global scheduler instance
 */
export const scheduler = new Scheduler();

// ============================================================================
// Pre-defined task helpers
// ============================================================================

/**
 * Create a high-frequency task (every tick)
 */
export function createHighFrequencyTask(
  name: string,
  execute: () => void,
  priority = 50
): Omit<ScheduledTask, "lastRun"> {
  return {
    name,
    execute,
    frequency: "high",
    minBucket: 500,
    interval: 1,
    cpuBudget: 0.3,
    priority
  };
}

/**
 * Create a medium-frequency task (every 5-10 ticks)
 */
export function createMediumFrequencyTask(
  name: string,
  execute: () => void,
  priority = 30
): Omit<ScheduledTask, "lastRun"> {
  return {
    name,
    execute,
    frequency: "medium",
    minBucket: 2000,
    interval: 5,
    cpuBudget: 0.15,
    priority
  };
}

/**
 * Create a low-frequency task (every 20-50 ticks)
 */
export function createLowFrequencyTask(
  name: string,
  execute: () => void,
  priority = 10
): Omit<ScheduledTask, "lastRun"> {
  return {
    name,
    execute,
    frequency: "low",
    minBucket: 5000,
    interval: 20,
    cpuBudget: 0.1,
    priority
  };
}

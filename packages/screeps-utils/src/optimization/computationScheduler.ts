/**
 * Computation Scheduler - Multi-Tick Spreading
 *
 * Spreads expensive computations across multiple ticks to maintain stable CPU usage.
 * Prevents CPU spikes by deferring non-critical operations when bucket is low.
 *
 * Design Principles (from ROADMAP.md Section 18):
 * - CPU-Bucket-gesteuertes Verhalten (CPU Bucket-controlled behavior)
 * - High-Bucket: Enable expensive operations
 * - Low-Bucket: Only core logic
 * - Strict Tick-Budget management
 *
 * Features:
 * - Priority-based task execution
 * - Bucket-aware scheduling
 * - Automatic spreading of periodic tasks
 * - CPU budget enforcement per task
 *
 * Use Cases:
 * - Route planning (expensive PathFinder operations)
 * - Room scanning and threat assessment
 * - Market analysis
 * - Base layout planning
 * - Statistics aggregation
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Task priority levels
 */
export enum TaskPriority {
  /** Critical tasks that must run every tick */
  CRITICAL = 0,
  /** High priority tasks (run when bucket > 2000) */
  HIGH = 1,
  /** Medium priority tasks (run when bucket > 5000) */
  MEDIUM = 2,
  /** Low priority tasks (run when bucket > 8000) */
  LOW = 3
}

/**
 * Scheduled task definition
 */
export interface ScheduledTask {
  /** Unique task identifier */
  id: string;
  /** Task priority level */
  priority: TaskPriority;
  /** Function to execute */
  execute: () => void;
  /** Execution interval in ticks */
  interval: number;
  /** Last execution tick */
  lastRun: number;
  /** Maximum CPU budget for this task */
  maxCpu?: number;
  /** Whether task can be skipped if over budget */
  skippable?: boolean;
}

/**
 * Scheduler configuration
 */
export interface SchedulerConfig {
  /** Bucket thresholds for each priority level */
  bucketThresholds: Record<TaskPriority, number>;
  /** Default max CPU per task */
  defaultMaxCpu: number;
  /** Whether to log task execution */
  logExecution: boolean;
}

/**
 * Scheduler statistics
 */
export interface SchedulerStats {
  /** Total tasks registered */
  totalTasks: number;
  /** Tasks by priority */
  tasksByPriority: Record<TaskPriority, number>;
  /** Tasks executed this tick */
  executedThisTick: number;
  /** Tasks skipped this tick (due to bucket) */
  skippedThisTick: number;
  /** Tasks deferred (due to CPU budget) */
  deferredThisTick: number;
  /** Total CPU used by scheduler this tick */
  cpuUsed: number;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_CONFIG: SchedulerConfig = {
  bucketThresholds: {
    [TaskPriority.CRITICAL]: 0, // Always run
    [TaskPriority.HIGH]: 2000,
    [TaskPriority.MEDIUM]: 5000,
    [TaskPriority.LOW]: 8000
  },
  defaultMaxCpu: 5.0,
  logExecution: false
};

// =============================================================================
// Scheduler Class
// =============================================================================

/**
 * Computation Scheduler for spreading expensive operations across ticks
 */
export class ComputationScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private config: SchedulerConfig;
  private stats: SchedulerStats = {
    totalTasks: 0,
    tasksByPriority: {
      [TaskPriority.CRITICAL]: 0,
      [TaskPriority.HIGH]: 0,
      [TaskPriority.MEDIUM]: 0,
      [TaskPriority.LOW]: 0
    },
    executedThisTick: 0,
    skippedThisTick: 0,
    deferredThisTick: 0,
    cpuUsed: 0
  };

  constructor(config?: Partial<SchedulerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Register a new task with the scheduler.
   *
   * @param task - Task definition
   *
   * @example
   * scheduler.register({
   *   id: "market-analysis",
   *   priority: TaskPriority.MEDIUM,
   *   interval: 100,
   *   maxCpu: 2.0,
   *   execute: () => analyzeMarket()
   * });
   */
  public register(task: Omit<ScheduledTask, "lastRun">): void {
    const fullTask: ScheduledTask = {
      ...task,
      lastRun: Game.time - task.interval, // Allow immediate execution
      maxCpu: task.maxCpu ?? this.config.defaultMaxCpu,
      skippable: task.skippable ?? true
    };

    this.tasks.set(task.id, fullTask);
    this.updateStats();
  }

  /**
   * Unregister a task from the scheduler.
   *
   * @param taskId - Task identifier
   */
  public unregister(taskId: string): void {
    this.tasks.delete(taskId);
    this.updateStats();
  }

  /**
   * Run all due tasks based on priority and bucket level.
   * Call this once per tick from main loop.
   *
   * @param availableCpu - Optional CPU budget for this tick's tasks
   * @returns Statistics about task execution
   */
  public run(availableCpu?: number): SchedulerStats {
    const startCpu = Game.cpu.getUsed();
    const bucket = Game.cpu.bucket;
    const cpuBudget = availableCpu ?? Infinity;

    // Reset tick stats
    this.stats.executedThisTick = 0;
    this.stats.skippedThisTick = 0;
    this.stats.deferredThisTick = 0;

    // Get tasks sorted by priority (critical first)
    const tasks = Array.from(this.tasks.values()).sort((a, b) => a.priority - b.priority);

    let cpuUsed = 0;

    for (const task of tasks) {
      // Check if task is due
      if (Game.time - task.lastRun < task.interval) {
        continue;
      }

      // Check bucket threshold for non-critical tasks
      if (task.priority !== TaskPriority.CRITICAL) {
        const threshold = this.config.bucketThresholds[task.priority];
        if (bucket < threshold) {
          this.stats.skippedThisTick++;
          continue;
        }
      }

      // Check CPU budget
      const taskMaxCpu = task.maxCpu ?? this.config.defaultMaxCpu;
      if (cpuUsed + taskMaxCpu > cpuBudget && task.skippable) {
        this.stats.deferredThisTick++;
        continue;
      }

      // Execute task with CPU tracking
      const taskStartCpu = Game.cpu.getUsed();
      try {
        task.execute();
        task.lastRun = Game.time;
        this.stats.executedThisTick++;

        const taskCpuUsed = Game.cpu.getUsed() - taskStartCpu;
        cpuUsed += taskCpuUsed;

        // Warn if task exceeded its budget
        if (taskCpuUsed > taskMaxCpu) {
          console.log(`[Scheduler] WARN: Task ${task.id} exceeded CPU budget: ${taskCpuUsed.toFixed(2)} > ${taskMaxCpu}`);
        }
      } catch (error) {
        console.log(`[Scheduler] ERROR: Error executing task ${task.id}: ${String(error)}`);
        // Still mark as run to prevent repeated failures
        task.lastRun = Game.time;
      }

      // Stop if we've exceeded the overall budget
      if (cpuUsed > cpuBudget) {
        break;
      }
    }

    this.stats.cpuUsed = Game.cpu.getUsed() - startCpu;
    return { ...this.stats };
  }

  /**
   * Force execution of a specific task, ignoring interval and bucket checks.
   *
   * @param taskId - Task identifier
   * @returns true if task was executed, false if not found
   */
  public forceRun(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    try {
      task.execute();
      task.lastRun = Game.time;
      return true;
    } catch (error) {
      console.log(`[Scheduler] ERROR: Error force-executing task ${taskId}: ${String(error)}`);
      return false;
    }
  }

  /**
   * Reset task's last run time to allow immediate execution.
   *
   * @param taskId - Task identifier
   */
  public resetTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.lastRun = Game.time - task.interval;
    }
  }

  /**
   * Get current scheduler statistics.
   *
   * @returns Statistics object
   */
  public getStats(): SchedulerStats {
    return { ...this.stats };
  }

  /**
   * Get list of all registered tasks.
   *
   * @returns Array of task definitions
   */
  public getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Check if a task is registered.
   *
   * @param taskId - Task identifier
   * @returns true if task exists
   */
  public hasTask(taskId: string): boolean {
    return this.tasks.has(taskId);
  }

  /**
   * Clear all registered tasks.
   */
  public clear(): void {
    this.tasks.clear();
    this.updateStats();
  }

  /**
   * Update internal statistics.
   */
  private updateStats(): void {
    this.stats.totalTasks = this.tasks.size;
    this.stats.tasksByPriority = {
      [TaskPriority.CRITICAL]: 0,
      [TaskPriority.HIGH]: 0,
      [TaskPriority.MEDIUM]: 0,
      [TaskPriority.LOW]: 0
    };

    for (const task of this.tasks.values()) {
      this.stats.tasksByPriority[task.priority]++;
    }
  }
}

// =============================================================================
// Global Scheduler Instance
// =============================================================================

/**
 * Global object type with computation scheduler attached
 */
interface GlobalWithScheduler {
  _computationScheduler?: ComputationScheduler;
}

/**
 * Get or create the global scheduler instance.
 * Stored in global object to persist across ticks.
 */
function getGlobalScheduler(): ComputationScheduler {
  const g = global as GlobalWithScheduler;
  if (!g._computationScheduler) {
    g._computationScheduler = new ComputationScheduler();
  }
  return g._computationScheduler as ComputationScheduler;
}

/**
 * Global computation scheduler instance.
 * Use this for application-wide task scheduling.
 */
export const globalScheduler = getGlobalScheduler();

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Register a periodic task with the global scheduler.
 *
 * @param id - Unique task identifier
 * @param interval - Execution interval in ticks
 * @param execute - Function to execute
 * @param priority - Task priority (default: MEDIUM)
 * @param maxCpu - Maximum CPU budget (default: from config)
 *
 * @example
 * scheduleTask("scan-rooms", 50, () => {
 *   // Scan rooms for threats
 * }, TaskPriority.HIGH);
 */
export function scheduleTask(
  id: string,
  interval: number,
  execute: () => void,
  priority: TaskPriority = TaskPriority.MEDIUM,
  maxCpu?: number
): void {
  globalScheduler.register({
    id,
    interval,
    execute,
    priority,
    maxCpu,
    skippable: priority !== TaskPriority.CRITICAL
  });
}

/**
 * Unregister a task from the global scheduler.
 *
 * @param id - Task identifier
 */
export function unscheduleTask(id: string): void {
  globalScheduler.unregister(id);
}

/**
 * Run scheduled tasks for this tick.
 * Call once per tick from main loop.
 *
 * @param availableCpu - Optional CPU budget
 * @returns Execution statistics
 */
export function runScheduledTasks(availableCpu?: number): SchedulerStats {
  return globalScheduler.run(availableCpu);
}

/**
 * Get statistics about scheduled tasks.
 *
 * @returns Statistics object
 */
export function getSchedulerStats(): SchedulerStats {
  return globalScheduler.getStats();
}

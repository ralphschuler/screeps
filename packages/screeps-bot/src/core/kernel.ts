/**
 * Kernel - Central Process Management
 *
 * The kernel is the central coordinator for all processes in the bot:
 * - Process registration and lifecycle management
 * - CPU budget allocation and enforcement per process
 * - Priority-based process scheduling with wrap-around queue
 * - Process statistics tracking
 * - Centralized event system for inter-process communication
 *
 * Wrap-Around Queue:
 * When processes are skipped due to CPU budget exhaustion, the kernel tracks
 * which process was last executed. In the next tick, execution continues from
 * the next process after the last executed one, wrapping around to the beginning
 * when reaching the end of the queue. This ensures all processes eventually run
 * even under CPU pressure, providing fair execution across ticks while maintaining
 * priority order within the queue.
 *
 * Design Principles (from ROADMAP.md):
 * - Striktes Tick-Budget: Eco rooms ≤ 0.1 CPU, War rooms ≤ 0.25 CPU, Global overmind ≤ 1 CPU
 * - Rolling index execution: All processes get fair execution time via wrap-around queue
 * - Frequenzebenen: High frequency (every tick), Medium (5-20 ticks), Low (≥100 ticks)
 * - Ereignisgetriebene Logik: Critical events trigger immediate updates
 * 
 * TODO(P2): ARCH - Implement adaptive CPU budgets based on room count and actual process performance
 * Dynamic budget adjustment could better handle growth from 10 to 100+ rooms
 * TODO(P2): ARCH - Add process dependency tracking to ensure prerequisite processes run first
 * Some processes depend on others (e.g., intel must run before expansion decisions)
 * TODO(P3): ARCH - Consider implementing process groups for coordinated batch execution
 * Related processes could be grouped and executed together for better cache locality
 * TODO(P2): TEST - Add unit tests for kernel process scheduling and wrap-around queue behavior
 * Critical system component needs comprehensive test coverage
 */

import {
  EventBus,
  EventHandler,
  EventName,
  EventPayload,
  eventBus
} from "./events";
import type { CPUConfig } from "../config";
import { getConfig } from "../config";
import { logger } from "./logger";
import { getAdaptiveBudgets, type AdaptiveBudgetConfig, DEFAULT_ADAPTIVE_CONFIG } from "./adaptiveBudgets";

/**
 * Process priority levels
 */
export enum ProcessPriority {
  CRITICAL = 100,  // Must run every tick (movement, spawns)
  HIGH = 75,       // High priority tasks (rooms, creeps)
  MEDIUM = 50,     // Standard tasks (pheromones, clusters)
  LOW = 25,        // Background tasks (empire, market)
  IDLE = 10        // Very low priority (visualizations, stats)
}

/**
 * Process frequency types
 */
export type ProcessFrequency = "high" | "medium" | "low";

/**
 * Process state
 */
export type ProcessState = "idle" | "running" | "suspended" | "error";

/**
 * Process statistics
 */
export interface ProcessStats {
  /** Total CPU used across all runs */
  totalCpu: number;
  /** Number of times process has run */
  runCount: number;
  /** Average CPU per run */
  avgCpu: number;
  /** Maximum CPU used in a single run */
  maxCpu: number;
  /** Last run tick */
  lastRunTick: number;
  /** Number of times process was skipped due to CPU */
  skippedCount: number;
  /** Number of errors */
  errorCount: number;
  /** Number of consecutive errors (reset on successful run) */
  consecutiveErrors: number;
  /** Last successful run tick (no errors) */
  lastSuccessfulRunTick: number;
  /** Health score (0-100) based on success rate and recent performance */
  healthScore: number;
  /** Tick when process can resume (null if active) */
  suspendedUntil: number | null;
  /** Reason for suspension */
  suspensionReason: string | null;
}

/**
 * Process definition
 */
export interface Process {
  /** Unique process ID */
  id: string;
  /** Display name */
  name: string;
  /** Process priority */
  priority: ProcessPriority;
  /** Process frequency */
  frequency: ProcessFrequency;
  /** Minimum CPU bucket to run */
  minBucket: number;
  /** CPU budget (fraction of limit, 0-1) */
  cpuBudget: number;
  /** Run interval in ticks (for medium/low frequency) */
  interval: number;
  /** Process execution function */
  execute: () => void;
  /** Current state */
  state: ProcessState;
  /** Statistics */
  stats: ProcessStats;
}

/**
 * Kernel configuration
 */
export interface KernelConfig {
  /** Low bucket threshold - enter conservation mode */
  lowBucketThreshold: number;
  /** High bucket threshold - allow expensive operations */
  highBucketThreshold: number;
  /** Critical bucket threshold - minimal processing only */
  criticalBucketThreshold: number;
  /** Target CPU usage (fraction of limit) */
  targetCpuUsage: number;
  /**
   * Reserved CPU for finalization (fraction of limit, e.g., 0.02 = 2%)
   * This is subtracted from the effective CPU limit to ensure we have buffer
   * for end-of-tick operations like memory serialization.
   * 
   * Using a percentage ensures the reserve scales with CPU limit:
   * - 20 CPU limit: 0.02 * 20 = 0.4 CPU reserved
   * - 50 CPU limit: 0.02 * 50 = 1.0 CPU reserved
   * - 100 CPU limit: 0.02 * 100 = 2.0 CPU reserved
   */
  reservedCpuFraction: number;
  /** Enable process statistics */
  enableStats: boolean;
  /** Log interval for stats (ticks) */
  statsLogInterval: number;
  /** Default intervals for process frequencies */
  frequencyIntervals: Record<ProcessFrequency, number>;
  /** Default min bucket per frequency */
  frequencyMinBucket: Record<ProcessFrequency, number>;
  /** Default CPU budgets per frequency */
  frequencyCpuBudgets: Record<ProcessFrequency, number>;
  /**
   * Ratio above budget that triggers warnings (e.g., 1.5 = 150% over budget)
   */
  budgetWarningThreshold: number;
  /**
   * Interval in ticks for logging CPU budget warnings
   */
  budgetWarningInterval: number;
  /**
   * Enable adaptive CPU budgets based on room count and bucket level
   */
  enableAdaptiveBudgets: boolean;
  /**
   * Configuration for adaptive budget calculation
   */
  adaptiveBudgetConfig: AdaptiveBudgetConfig;
}

/**
 * Bucket mode
 */
export type BucketMode = "critical" | "low" | "normal" | "high";

const BASE_CONFIG: Omit<KernelConfig, "lowBucketThreshold" | "highBucketThreshold" | "criticalBucketThreshold" | "frequencyIntervals" |
  "frequencyMinBucket" | "frequencyCpuBudgets"> = {
  // Increased from 0.85 to 0.98 to use available CPU more efficiently
  // The reserved CPU (2%) plus this gives us ~98% utilization with 2% buffer
  // This prevents excessive CPU waste (was leaving 40+ CPU unused)
  targetCpuUsage: 0.98,
  reservedCpuFraction: 0.02, // 2% of CPU limit reserved for finalization
  enableStats: true,
  statsLogInterval: 100,
  budgetWarningThreshold: 1.5,
  budgetWarningInterval: 500,
  enableAdaptiveBudgets: true,
  adaptiveBudgetConfig: DEFAULT_ADAPTIVE_CONFIG
};

const DEFAULT_CRITICAL_DIVISOR = 2;

function deriveCriticalThreshold(lowBucketThreshold: number): number {
  return Math.max(0, Math.floor(lowBucketThreshold / DEFAULT_CRITICAL_DIVISOR));
}

function deriveFrequencyIntervals(taskFrequencies: CPUConfig["taskFrequencies"]): Record<ProcessFrequency, number> {
  return {
    high: 1,
    medium: Math.max(1, Math.min(taskFrequencies.clusterLogic, taskFrequencies.pheromoneUpdate)),
    low: Math.max(taskFrequencies.marketScan, taskFrequencies.nukeEvaluation, taskFrequencies.memoryCleanup)
  };
}

/**
 * Derive frequency min bucket thresholds
 * 
 * REMOVED: All bucket requirements - user regularly depletes bucket and doesn't
 * want minBucket limitations blocking processes. Returns 0 for all frequencies.
 */
function deriveFrequencyMinBucket(bucketThresholds: CPUConfig["bucketThresholds"], highBucketThreshold: number): Record<ProcessFrequency, number> {
  return {
    high: 0, // No bucket requirement
    medium: 0, // No bucket requirement
    low: 0 // No bucket requirement
  };
}

function deriveFrequencyBudgets(budgets: CPUConfig["budgets"]): Record<ProcessFrequency, number> {
  return {
    high: budgets.rooms,
    medium: budgets.strategic,
    low: Math.max(budgets.market, budgets.visualization)
  };
}

export function buildKernelConfigFromCpu(cpuConfig: CPUConfig): KernelConfig {
  const highBucketThreshold = cpuConfig.bucketThresholds.highMode;
  const lowBucketThreshold = cpuConfig.bucketThresholds.lowMode;
  const criticalBucketThreshold = deriveCriticalThreshold(lowBucketThreshold);

  const frequencyIntervals = deriveFrequencyIntervals(cpuConfig.taskFrequencies);
  const frequencyMinBucket = deriveFrequencyMinBucket(cpuConfig.bucketThresholds, highBucketThreshold);
  const frequencyCpuBudgets = deriveFrequencyBudgets(cpuConfig.budgets);

  return {
    ...BASE_CONFIG,
    lowBucketThreshold,
    highBucketThreshold,
    criticalBucketThreshold,
    frequencyIntervals,
    frequencyMinBucket,
    frequencyCpuBudgets
  };
}

interface FrequencyDefaults { interval: number; minBucket: number; cpuBudget: number }

/**
 * Kernel - Central Process Manager
 */
export class Kernel {
  private config: KernelConfig;
  private processes: Map<string, Process> = new Map();
  private bucketMode: BucketMode = "normal";
  private tickCpuUsed = 0;
  private initialized = false;
  private frequencyDefaults: Record<ProcessFrequency, FrequencyDefaults>;
  /** ID of the last process executed (for wrap-around preservation across queue rebuilds) */
  private lastExecutedProcessId: string | null = null;
  /** Index of the last process executed in the current queue (for wrap-around within a tick) */
  private lastExecutedIndex = -1;
  /** Cached sorted process queue */
  private processQueue: Process[] = [];
  /** Flag indicating if process queue needs rebuild */
  private queueDirty = true;
  /** Number of processes skipped this tick */
  private skippedProcessesThisTick = 0;

  public constructor(config: KernelConfig) {
    this.config = { ...config };
    this.validateConfig();
    this.frequencyDefaults = this.buildFrequencyDefaults();
  }

  /**
   * Register a process with the kernel
   */
  public registerProcess(options: {
    id: string;
    name: string;
    priority?: ProcessPriority;
    frequency?: ProcessFrequency;
    minBucket?: number;
    cpuBudget?: number;
    interval?: number;
    execute: () => void;
  }): void {
    const frequency = options.frequency ?? "medium";
    const defaults = this.frequencyDefaults[frequency];

    const process: Process = {
      id: options.id,
      name: options.name,
      priority: options.priority ?? ProcessPriority.MEDIUM,
      frequency,
      minBucket: options.minBucket ?? defaults.minBucket,
      cpuBudget: options.cpuBudget ?? defaults.cpuBudget,
      interval: options.interval ?? defaults.interval,
      execute: options.execute,
      state: "idle",
      stats: {
        totalCpu: 0,
        runCount: 0,
        avgCpu: 0,
        maxCpu: 0,
        lastRunTick: 0,
        skippedCount: 0,
        errorCount: 0,
        consecutiveErrors: 0,
        lastSuccessfulRunTick: 0,
        healthScore: 100,
        suspendedUntil: null,
        suspensionReason: null
      }
    };

    this.processes.set(options.id, process);
    this.queueDirty = true; // Mark queue for rebuild
    logger.debug(`Kernel: Registered process "${process.name}" (${process.id})`, { subsystem: "Kernel" });
  }

  /**
   * Unregister a process
   */
  public unregisterProcess(id: string): boolean {
    const deleted = this.processes.delete(id);
    if (deleted) {
      this.queueDirty = true; // Mark queue for rebuild
      logger.debug(`Kernel: Unregistered process ${id}`, { subsystem: "Kernel" });
    }
    return deleted;
  }

  /**
   * Get a registered process
   */
  public getProcess(id: string): Process | undefined {
    return this.processes.get(id);
  }

  /**
   * Get all registered processes
   */
  public getProcesses(): Process[] {
    return Array.from(this.processes.values());
  }

  /**
   * Initialize the kernel (call once at start of first tick)
   */
  public initialize(): void {
    if (this.initialized) return;
    
    logger.info(`Kernel initialized with ${this.processes.size} processes`, { subsystem: "Kernel" });
    this.initialized = true;
  }

  /**
   * Determine current bucket mode based on bucket level.
   */
  private updateBucketMode(): void {
    const bucket = Game.cpu.bucket;
    let newMode: BucketMode;

    if (bucket < this.config.criticalBucketThreshold) {
      newMode = "critical";
    } else if (bucket < this.config.lowBucketThreshold) {
      newMode = "low";
    } else if (bucket > this.config.highBucketThreshold) {
      newMode = "high";
    } else {
      newMode = "normal";
    }

    if (newMode !== this.bucketMode) {
      logger.info(`Kernel: Bucket mode changed from ${this.bucketMode} to ${newMode} (bucket: ${bucket})`, {
        subsystem: "Kernel"
      });
      this.bucketMode = newMode;
    }
    
    // FEATURE: Periodic bucket status logging for user visibility
    // Log bucket status every 100 ticks to help users monitor bucket health
    // Bucket mode is informational only - it doesn't affect process execution
    if (Game.time % 100 === 0 && (this.bucketMode === "low" || this.bucketMode === "critical")) {
      const totalProcesses = this.processes.size;
      
      logger.info(
        `Bucket ${this.bucketMode.toUpperCase()} mode: ${bucket}/10000 bucket. ` +
        `Running all ${totalProcesses} processes normally (bucket mode is informational only)`,
        { subsystem: "Kernel" }
      );
    }
  }

  private validateConfig(): void {
    if (this.config.criticalBucketThreshold >= this.config.lowBucketThreshold) {
      logger.warn(
        `Kernel: Adjusting critical bucket threshold ${this.config.criticalBucketThreshold} to stay below low threshold ${this.config.lowBucketThreshold}`,
        { subsystem: "Kernel" }
      );
      this.config.criticalBucketThreshold = Math.max(0, this.config.lowBucketThreshold - 1);
    }

    if (this.config.lowBucketThreshold >= this.config.highBucketThreshold) {
      logger.warn(
        `Kernel: Adjusting high bucket threshold ${this.config.highBucketThreshold} to stay above low threshold ${this.config.lowBucketThreshold}`,
        { subsystem: "Kernel" }
      );
      this.config.highBucketThreshold = this.config.lowBucketThreshold + 1;
    }
  }

  private buildFrequencyDefaults(): Record<ProcessFrequency, FrequencyDefaults> {
    return {
      high: {
        interval: this.config.frequencyIntervals.high,
        minBucket: this.config.frequencyMinBucket.high,
        cpuBudget: this.config.frequencyCpuBudgets.high
      },
      medium: {
        interval: this.config.frequencyIntervals.medium,
        minBucket: this.config.frequencyMinBucket.medium,
        cpuBudget: this.config.frequencyCpuBudgets.medium
      },
      low: {
        interval: this.config.frequencyIntervals.low,
        minBucket: this.config.frequencyMinBucket.low,
        cpuBudget: this.config.frequencyCpuBudgets.low
      }
    };
  }

  /**
   * Update adaptive CPU budgets based on current game state
   * 
   * If adaptive budgets are enabled, calculates new budgets based on:
   * - Current room count (logarithmic scaling)
   * - Current bucket level (conservation/boost multipliers)
   * 
   * This is called each tick during run() to keep budgets aligned with empire size
   */
  private updateAdaptiveBudgets(): void {
    if (!this.config.enableAdaptiveBudgets) {
      return;
    }

    const adaptiveBudgets = getAdaptiveBudgets(this.config.adaptiveBudgetConfig);
    
    // Update frequency defaults with new adaptive budgets
    this.config.frequencyCpuBudgets = adaptiveBudgets;
    this.frequencyDefaults = this.buildFrequencyDefaults();

    // Log budget changes periodically for visibility
    if (Game.time % 500 === 0) {
      const roomCount = Object.keys(Game.rooms).length;
      const bucket = Game.cpu.bucket;
      logger.info(
        `Adaptive budgets updated: rooms=${roomCount}, bucket=${bucket}, ` +
        `high=${adaptiveBudgets.high.toFixed(3)}, medium=${adaptiveBudgets.medium.toFixed(3)}, low=${adaptiveBudgets.low.toFixed(3)}`,
        { subsystem: "Kernel" }
      );
    }
  }

  /**
   * Get current bucket mode.
   * Ensures the bucket mode is up-to-date before returning.
   */
  public getBucketMode(): BucketMode {
    this.updateBucketMode();
    return this.bucketMode;
  }

  /**
   * Get CPU limit for current tick
   * 
   * Returns the effective CPU limit regardless of bucket mode. The system continues
   * to process normally even with low bucket, using the full targetCpuUsage.
   * Individual processes can check bucket mode if they want to skip expensive
   * optional operations (like heavy calculations, optional optimizations) when bucket is low.
   */
  public getCpuLimit(): number {
    return Game.cpu.limit * this.config.targetCpuUsage;
  }

  /**
   * Check if CPU budget is available
   * 
   * BUGFIX: Use the effective CPU limit (from getCpuLimit()) for both
   * the limit and reserved CPU calculation to maintain consistency across
   * all bucket modes (critical, low, normal, high).
   */
  public hasCpuBudget(): boolean {
    const used = Game.cpu.getUsed();
    const limit = this.getCpuLimit();
    const reservedCpu = limit * this.config.reservedCpuFraction;
    return (limit - used) > reservedCpu;
  }

  /**
   * Get remaining CPU budget
   * 
   * BUGFIX: Use the effective CPU limit (from getCpuLimit()) for both
   * the limit and reserved CPU calculation to maintain consistency across
   * all bucket modes (critical, low, normal, high).
   */
  public getRemainingCpu(): number {
    const limit = this.getCpuLimit();
    const reservedCpu = limit * this.config.reservedCpuFraction;
    return Math.max(0, limit - Game.cpu.getUsed() - reservedCpu);
  }

  /**
   * Rebuild the process queue sorted by priority.
   * Preserves execution fairness by finding the last executed process
   * in the new queue and continuing from the next one.
   */
  private rebuildProcessQueue(): void {
    this.processQueue = Array.from(this.processes.values())
      .sort((a, b) => b.priority - a.priority);
    this.queueDirty = false;
    
    // BUGFIX: Preserve wrap-around position across queue rebuilds
    // When processes are added/removed (e.g., creep spawns/dies), we rebuild the queue.
    // Find the last executed process in the new queue to resume from the next one.
    // This ensures fair execution even when the queue is constantly changing.
    if (this.lastExecutedProcessId) {
      this.lastExecutedIndex = this.processQueue.findIndex(p => p.id === this.lastExecutedProcessId);
      // If process no longer exists (-1), start from beginning (will become 0 after +1)
    } else {
      // No last executed process, start from beginning
      this.lastExecutedIndex = -1;
    }
  }

  /**
   * Check if process should run this tick
   * 
   * Processes are only skipped based on:
   * - Interval timing (process hasn't reached its next scheduled run)
   * - Suspension state (process is explicitly suspended)
   * 
   * Bucket mode no longer affects process execution - the rolling index
   * and CPU budget checks provide sufficient protection against CPU overuse.
   * 
   * TODO(P2): PERF - Add jitter to intervals to prevent all processes running on the same tick
   * Spread process execution across ticks for more even CPU distribution
   * TODO(P2): ARCH - Implement priority decay for starved processes to prevent indefinite skipping
   * Long-skipped low-priority processes could temporarily boost priority
   */
  private shouldRunProcess(process: Process): boolean {
    // Check if suspended and if suspension has expired
    if (process.state === "suspended" && process.stats.suspendedUntil !== null) {
      // Check if suspension period has expired
      if (Game.time >= process.stats.suspendedUntil) {
        // Automatic recovery: resume process
        process.state = "idle";
        process.stats.suspendedUntil = null;
        const previousReason = process.stats.suspensionReason;
        process.stats.suspensionReason = null;
        
        logger.info(
          `Kernel: Process "${process.name}" automatically resumed after suspension. ` +
          `Previous reason: ${previousReason}. Consecutive errors: ${process.stats.consecutiveErrors}`,
          { 
            subsystem: "Kernel",
            processId: process.id
          }
        );
        
        // Emit recovery event
        this.emit('process.recovered', {
          processId: process.id,
          processName: process.name,
          previousReason: previousReason || 'Unknown',
          consecutiveErrors: process.stats.consecutiveErrors
        }, { priority: 50 });
        
        // Process can now run
      } else {
        // Still suspended
        if (Game.time % 100 === 0) {
          const ticksRemaining = process.stats.suspendedUntil - Game.time;
          logger.debug(
            `Kernel: Process "${process.name}" suspended (${ticksRemaining} ticks remaining)`,
            { subsystem: "Kernel" }
          );
        }
        return false;
      }
    }

    // Check interval (skip check if process has never run - runCount will be 0)
    if (process.stats.runCount > 0) {
      const ticksSinceRun = Game.time - process.stats.lastRunTick;
      if (ticksSinceRun < process.interval) {
        // Only log interval skips occasionally to avoid spam
        if (Game.time % 100 === 0 && process.priority >= ProcessPriority.HIGH) {
          logger.debug(
            `Kernel: Process "${process.name}" skipped (interval: ${ticksSinceRun}/${process.interval} ticks)`,
            { subsystem: "Kernel" }
          );
        }
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate health score for a process (0-100)
   * 
   * Health score is based on:
   * - Success rate: (runCount - errorCount) / runCount * 100
   * - Recent success bonus: +20 if successful run in last 100 ticks
   * - Penalty for consecutive errors: reduces score significantly
   * 
   * @param stats - Process statistics
   * @returns Health score between 0 and 100
   */
  private calculateHealthScore(stats: ProcessStats): number {
    // If process hasn't run yet, assume healthy
    if (stats.runCount === 0) {
      return 100;
    }

    // Base score from success rate
    const successRate = (stats.runCount - stats.errorCount) / stats.runCount;
    let score = successRate * 100;

    // Bonus for recent successful run (within last 100 ticks)
    const ticksSinceSuccess = Game.time - stats.lastSuccessfulRunTick;
    if (ticksSinceSuccess < 100 && stats.lastSuccessfulRunTick > 0) {
      score += 20;
    }

    // Heavy penalty for consecutive errors
    // Each consecutive error reduces score by 15 points
    score -= stats.consecutiveErrors * 15;

    // Clamp to 0-100 range
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Execute a single process with CPU tracking
   */
  private executeProcess(process: Process): void {
    const cpuBefore = Game.cpu.getUsed();
    process.state = "running";

    try {
      process.execute();
      process.state = "idle";
      
      // Success: reset consecutive errors and update last successful run
      process.stats.consecutiveErrors = 0;
      process.stats.lastSuccessfulRunTick = Game.time;
    } catch (err) {
      process.state = "error";
      process.stats.errorCount++;
      process.stats.consecutiveErrors++;
      
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error(`Kernel: Process "${process.name}" error: ${errorMessage}`, { subsystem: "Kernel" });
      if (err instanceof Error && err.stack) {
        logger.error(err.stack, { subsystem: "Kernel" });
      }

      // Check for automatic suspension
      const consecutiveErrors = process.stats.consecutiveErrors;
      
      // Circuit breaker: permanent suspension after 10 consecutive failures
      if (consecutiveErrors >= 10) {
        process.stats.suspendedUntil = Number.MAX_SAFE_INTEGER;
        process.stats.suspensionReason = `Circuit breaker: ${consecutiveErrors} consecutive failures (permanent)`;
        process.state = "suspended";
        
        logger.error(
          `Kernel: Process "${process.name}" permanently suspended after ${consecutiveErrors} consecutive failures`,
          { subsystem: "Kernel", processId: process.id }
        );
        
        // Emit critical event for permanent suspension
        this.emit('process.suspended', {
          processId: process.id,
          processName: process.name,
          reason: process.stats.suspensionReason,
          consecutive: consecutiveErrors,
          permanent: true
        }, { immediate: true, priority: 100 });
      }
      // Automatic suspension after 3 consecutive failures with exponential backoff
      else if (consecutiveErrors >= 3) {
        // Exponential backoff: 2^errors ticks, max 1000 ticks
        const suspensionDuration = Math.min(1000, Math.pow(2, consecutiveErrors));
        process.stats.suspendedUntil = Game.time + suspensionDuration;
        process.stats.suspensionReason = `${consecutiveErrors} consecutive failures (auto-resume in ${suspensionDuration} ticks)`;
        process.state = "suspended";
        
        logger.warn(
          `Kernel: Process "${process.name}" suspended for ${suspensionDuration} ticks after ${consecutiveErrors} consecutive failures`,
          { 
            subsystem: "Kernel",
            processId: process.id,
            meta: {
              errorCount: process.stats.errorCount,
              resumeAt: process.stats.suspendedUntil
            }
          }
        );
        
        // Emit event for temporary suspension
        this.emit('process.suspended', {
          processId: process.id,
          processName: process.name,
          reason: process.stats.suspensionReason,
          consecutive: consecutiveErrors,
          permanent: false,
          resumeAt: process.stats.suspendedUntil
        }, { immediate: true, priority: 75 });
      }
    }

    const cpuUsed = Game.cpu.getUsed() - cpuBefore;

    // Update statistics
    if (this.config.enableStats) {
      process.stats.totalCpu += cpuUsed;
      process.stats.runCount++;
      process.stats.avgCpu = process.stats.totalCpu / process.stats.runCount;
      process.stats.maxCpu = Math.max(process.stats.maxCpu, cpuUsed);
      process.stats.lastRunTick = Game.time;
      
      // Update health score
      process.stats.healthScore = this.calculateHealthScore(process.stats);
    }

    this.tickCpuUsed += cpuUsed;

    // Check CPU budget violation
    // Only log if significantly over budget to reduce noise
    const budgetLimit = this.getCpuLimit() * process.cpuBudget;
    const overBudgetRatio = cpuUsed / budgetLimit;
    if (overBudgetRatio > this.config.budgetWarningThreshold && 
        Game.time % this.config.budgetWarningInterval === 0) {
      logger.warn(
        `Kernel: Process "${process.name}" exceeded CPU budget: ${cpuUsed.toFixed(3)} > ${budgetLimit.toFixed(3)} (${(overBudgetRatio * 100).toFixed(0)}%)`,
        { subsystem: "Kernel" }
      );
    }
  }

  /**
   * Run all scheduled processes for this tick using a wrap-around queue.
   * 
   * When processes are skipped due to CPU budget, they are guaranteed to be
   * considered first in the next tick by continuing from where we left off.
   * This ensures fair process execution across ticks while maintaining priority order.
   */
  public run(): void {
    this.updateBucketMode();
    this.updateAdaptiveBudgets(); // Update budgets based on current empire size and bucket
    this.tickCpuUsed = 0;
    this.skippedProcessesThisTick = 0;

    // Process queued events from previous ticks
    eventBus.processQueue();

    // Rebuild queue if needed (processes added/removed)
    if (this.queueDirty) {
      this.rebuildProcessQueue();
      logger.info(`Kernel: Rebuilt process queue with ${this.processQueue.length} processes`, {
        subsystem: "Kernel"
      });
    }

    // If no processes, nothing to do
    if (this.processQueue.length === 0) {
      logger.warn("Kernel: No processes registered in queue", { subsystem: "Kernel" });
      return;
    }

    // Log kernel run every 10 ticks for visibility
    if (Game.time % 10 === 0) {
      logger.info(`Kernel: Running ${this.processQueue.length} registered processes`, {
        subsystem: "Kernel"
      });
    }

    let processesRun = 0;
    let processesSkipped = 0;
    let processesSkippedByCpu = 0;
    let processesSkippedByInterval = 0;

    // Start from the next process after the last one executed
    // This creates a wrap-around effect: if we stopped at index 5 last tick,
    // we start at index 6 this tick, wrapping to 0 when we reach the end
    const startIndex = (this.lastExecutedIndex + 1) % this.processQueue.length;
    
    // Iterate through all processes exactly once, starting from startIndex
    for (let i = 0; i < this.processQueue.length; i++) {
      const index = (startIndex + i) % this.processQueue.length;
      const process = this.processQueue[index];

      // Check if we should run this process
      const shouldRun = this.shouldRunProcess(process);
      if (!shouldRun) {
        // Track processes that were skipped due to interval/suspension
        // BUGFIX: Increment per-process skippedCount for Grafana tracking
        if (this.config.enableStats) {
          process.stats.skippedCount++;
        }
        processesSkipped++;
        this.skippedProcessesThisTick++;
        
        // Track skip reasons for better diagnostics
        if (process.stats.runCount > 0 && (Game.time - process.stats.lastRunTick) < process.interval) {
          processesSkippedByInterval++;
        }
        // Note: processesSkippedByBucketMode is no longer incremented as bucket mode
        // no longer affects process execution
        continue;
      }

      // Check overall CPU budget
      if (!this.hasCpuBudget()) {
        // CPU budget exhausted - stop processing
        // Don't count remaining processes as "skipped" - they'll run next tick
        processesSkippedByCpu = this.processQueue.length - processesRun - processesSkipped;
        logger.warn(
          `Kernel: CPU budget exhausted after ${processesRun} processes. ${processesSkippedByCpu} processes deferred to next tick. Used: ${Game.cpu.getUsed().toFixed(2)}/${this.getCpuLimit().toFixed(2)}`,
          { subsystem: "Kernel" }
        );
        break;
      }

      // Execute the process
      this.executeProcess(process);
      processesRun++;
      
      // Track the last executed process by both ID and index
      // ID survives queue rebuilds, index is used for wrap-around within the current queue
      this.lastExecutedProcessId = process.id;
      this.lastExecutedIndex = index;
    }

    // Log stats periodically
    if (this.config.enableStats && Game.time % this.config.statsLogInterval === 0) {
      this.logStats(processesRun, processesSkipped, processesSkippedByInterval, processesSkippedByCpu);
      eventBus.logStats();
    }
  }

  /**
   * Log kernel statistics with detailed breakdown
   */
  private logStats(
    processesRun: number, 
    processesSkipped: number,
    skippedByInterval: number,
    skippedByCpu: number
  ): void {
    const bucket = Game.cpu.bucket;
    const bucketPercent = (bucket / 10000 * 100).toFixed(1);
    const cpuUsed = Game.cpu.getUsed();
    const cpuLimit = this.getCpuLimit();
    
    logger.info(
      `Kernel: ${processesRun} ran, ${processesSkipped} skipped (interval: ${skippedByInterval}, CPU: ${skippedByCpu}), ` +
      `CPU: ${cpuUsed.toFixed(2)}/${cpuLimit.toFixed(2)} (${(cpuUsed/cpuLimit*100).toFixed(1)}%), bucket: ${bucket}/10000 (${bucketPercent}%), mode: ${this.bucketMode}`,
      { subsystem: "Kernel" }
    );
    
    // Log top skipped processes if we have a high skip count
    if (processesSkipped > 10) {
      const topSkipped = this.processQueue
        .filter(p => p.stats.skippedCount > 100)
        .sort((a, b) => b.stats.skippedCount - a.stats.skippedCount)
        .slice(0, 5);
      
      if (topSkipped.length > 0) {
        logger.warn(
          `Kernel: Top skipped processes: ${topSkipped.map(p => `${p.name}(${p.stats.skippedCount}, interval:${p.interval})`).join(', ')}`,
          { subsystem: "Kernel" }
        );
      }
    }
  }

  /**
   * Get tick CPU used by kernel
   */
  public getTickCpuUsed(): number {
    return this.tickCpuUsed;
  }

  /**
   * Get number of processes skipped this tick
   */
  public getSkippedProcessesThisTick(): number {
    return this.skippedProcessesThisTick;
  }

  /**
   * Suspend a process
   */
  public suspendProcess(id: string): boolean {
    const process = this.processes.get(id);
    if (process) {
      process.state = "suspended";
      logger.info(`Kernel: Suspended process "${process.name}"`, { subsystem: "Kernel" });
      return true;
    }
    return false;
  }

  /**
   * Resume a suspended process
   */
  public resumeProcess(id: string): boolean {
    const process = this.processes.get(id);
    if (process && process.state === "suspended") {
      process.state = "idle";
      process.stats.suspendedUntil = null;
      const previousReason = process.stats.suspensionReason;
      process.stats.suspensionReason = null;
      
      logger.info(
        `Kernel: Manually resumed process "${process.name}". ` +
        `Previous reason: ${previousReason}. Consecutive errors: ${process.stats.consecutiveErrors}`,
        { 
          subsystem: "Kernel",
          processId: id
        }
      );
      
      // Emit manual recovery event
      this.emit('process.recovered', {
        processId: process.id,
        processName: process.name,
        previousReason: previousReason || 'Unknown',
        consecutiveErrors: process.stats.consecutiveErrors,
        manual: true
      }, { priority: 50 });
      
      return true;
    }
    return false;
  }

  /**
   * Get process statistics summary
   */
  public getStatsSummary(): {
    totalProcesses: number;
    activeProcesses: number;
    suspendedProcesses: number;
    totalCpuUsed: number;
    avgCpuPerProcess: number;
    topCpuProcesses: { name: string; avgCpu: number }[];
    unhealthyProcesses: { name: string; healthScore: number; consecutiveErrors: number }[];
    avgHealthScore: number;
  } {
    const processes = Array.from(this.processes.values());
    const active = processes.filter(p => p.state !== "suspended");
    const suspended = processes.filter(p => p.state === "suspended");
    
    const totalCpu = processes.reduce((sum, p) => sum + p.stats.totalCpu, 0);
    const avgCpu = processes.length > 0 ? totalCpu / processes.length : 0;
    
    const topCpu = [...processes]
      .sort((a, b) => b.stats.avgCpu - a.stats.avgCpu)
      .slice(0, 5)
      .map(p => ({ name: p.name, avgCpu: p.stats.avgCpu }));

    // Find unhealthy processes (health score < 50)
    const unhealthy = [...processes]
      .filter(p => p.stats.healthScore < 50)
      .sort((a, b) => a.stats.healthScore - b.stats.healthScore)
      .slice(0, 5)
      .map(p => ({ 
        name: p.name, 
        healthScore: p.stats.healthScore,
        consecutiveErrors: p.stats.consecutiveErrors
      }));

    // Calculate average health score
    const totalHealth = processes.reduce((sum, p) => sum + p.stats.healthScore, 0);
    const avgHealth = processes.length > 0 ? totalHealth / processes.length : 100;

    return {
      totalProcesses: processes.length,
      activeProcesses: active.length,
      suspendedProcesses: suspended.length,
      totalCpuUsed: totalCpu,
      avgCpuPerProcess: avgCpu,
      topCpuProcesses: topCpu,
      unhealthyProcesses: unhealthy,
      avgHealthScore: avgHealth
    };
  }

  /**
   * Reset all process statistics
   */
  public resetStats(): void {
    for (const process of this.processes.values()) {
      process.stats = {
        totalCpu: 0,
        runCount: 0,
        avgCpu: 0,
        maxCpu: 0,
        lastRunTick: 0,
        skippedCount: 0,
        errorCount: 0,
        consecutiveErrors: 0,
        lastSuccessfulRunTick: 0,
        healthScore: 100,
        suspendedUntil: null,
        suspensionReason: null
      };
    }
    logger.info("Kernel: Reset all process statistics", { subsystem: "Kernel" });
  }

  /**
   * Get kernel configuration
   */
  public getConfig(): KernelConfig {
    return { ...this.config };
  }

  /**
   * Get frequency defaults for a process frequency
   */
  public getFrequencyDefaults(frequency: ProcessFrequency): FrequencyDefaults {
    return { ...this.frequencyDefaults[frequency] };
  }

  /**
   * Update kernel configuration
   */
  public updateConfig(config: Partial<KernelConfig>): void {
    this.config = { ...this.config, ...config };
    this.validateConfig();
    this.frequencyDefaults = this.buildFrequencyDefaults();
  }

  /**
   * Update kernel configuration from CPU config
   */
  public updateFromCpuConfig(cpuConfig: CPUConfig): void {
    this.updateConfig(buildKernelConfigFromCpu(cpuConfig));
  }

  // ===========================================================================
  // Event System Methods
  // ===========================================================================

  /**
   * Subscribe to an event
   *
   * Provides type-safe event subscription through the kernel.
   * Events are processed according to bucket status and priority.
   *
   * @param eventName - Name of the event to subscribe to
   * @param handler - Handler function called when event is emitted
   * @param options - Subscription options
   * @returns Unsubscribe function
   *
   * @example
   * ```typescript
   * kernel.on('hostile.detected', (event) => {
   *   console.log(`Hostile in ${event.roomName}!`);
   * });
   * ```
   */
  public on<T extends EventName>(
    eventName: T,
    handler: EventHandler<T>,
    options: {
      priority?: number;
      minBucket?: number;
      once?: boolean;
    } = {}
  ): () => void {
    return eventBus.on(eventName, handler, options);
  }

  /**
   * Subscribe to an event (one-time)
   *
   * Handler is automatically unsubscribed after first invocation.
   *
   * @param eventName - Name of the event to subscribe to
   * @param handler - Handler function called once when event is emitted
   * @param options - Subscription options
   * @returns Unsubscribe function
   */
  public once<T extends EventName>(
    eventName: T,
    handler: EventHandler<T>,
    options: { priority?: number; minBucket?: number } = {}
  ): () => void {
    return eventBus.once(eventName, handler, options);
  }

  /**
   * Emit an event
   *
   * Emits a type-safe event that will be processed by all registered handlers.
   * Events are bucket-aware:
   * - Critical events are always processed immediately
   * - High-priority events are queued in low bucket
   * - Low-priority events may be dropped in critical bucket
   *
   * @param eventName - Name of the event to emit
   * @param payload - Event payload (tick is added automatically)
   * @param options - Emission options
   *
   * @example
   * ```typescript
   * kernel.emit('hostile.detected', {
   *   roomName: 'W1N1',
   *   hostileId: creep.id,
   *   hostileOwner: creep.owner.username,
   *   bodyParts: creep.body.length,
   *   threatLevel: 2
   * });
   * ```
   */
  public emit<T extends EventName>(
    eventName: T,
    payload: Omit<EventPayload<T>, "tick">,
    options: {
      immediate?: boolean;
      priority?: number;
    } = {}
  ): void {
    eventBus.emit(eventName, payload, options);
  }

  /**
   * Remove all handlers for an event
   *
   * @param eventName - Name of the event to clear handlers for
   */
  public offAll(eventName: EventName): void {
    eventBus.offAll(eventName);
  }

  /**
   * Process queued events
   *
   * Should be called each tick to process events that were deferred
   * due to low bucket status. This is automatically called by run().
   */
  public processEvents(): void {
    eventBus.processQueue();
  }

  /**
   * Get event bus statistics
   */
  public getEventStats(): ReturnType<EventBus["getStats"]> {
    return eventBus.getStats();
  }

  /**
   * Check if there are handlers for an event
   *
   * @param eventName - Name of the event to check
   */
  public hasEventHandlers(eventName: EventName): boolean {
    return eventBus.hasHandlers(eventName);
  }

  /**
   * Get the event bus instance for advanced usage
   *
   * Prefer using kernel.on() and kernel.emit() for standard usage.
   */
  public getEventBus(): EventBus {
    return eventBus;
  }
}

/**
 * Global kernel instance
 */
export const kernel = new Kernel(buildKernelConfigFromCpu(getConfig().cpu));

// =============================================================================
// Helper functions for process registration
// =============================================================================

/**
 * Create a high-frequency process (runs every tick)
 */
export function createHighFrequencyProcess(
  id: string,
  name: string,
  execute: () => void,
  priority = ProcessPriority.HIGH
): Parameters<Kernel["registerProcess"]>[0] {
  const defaults = kernel.getFrequencyDefaults("high");
  return {
    id,
    name,
    execute,
    priority,
    frequency: "high",
    minBucket: defaults.minBucket,
    cpuBudget: defaults.cpuBudget,
    interval: defaults.interval
  };
}

/**
 * Create a medium-frequency process (runs every 5-10 ticks)
 */
export function createMediumFrequencyProcess(
  id: string,
  name: string,
  execute: () => void,
  priority = ProcessPriority.MEDIUM
): Parameters<Kernel["registerProcess"]>[0] {
  const defaults = kernel.getFrequencyDefaults("medium");
  return {
    id,
    name,
    execute,
    priority,
    frequency: "medium",
    minBucket: defaults.minBucket,
    cpuBudget: defaults.cpuBudget,
    interval: defaults.interval
  };
}

/**
 * Create a low-frequency process (runs every 20+ ticks)
 */
export function createLowFrequencyProcess(
  id: string,
  name: string,
  execute: () => void,
  priority = ProcessPriority.LOW
): Parameters<Kernel["registerProcess"]>[0] {
  const defaults = kernel.getFrequencyDefaults("low");
  return {
    id,
    name,
    execute,
    priority,
    frequency: "low",
    minBucket: defaults.minBucket,
    cpuBudget: defaults.cpuBudget,
    interval: defaults.interval
  };
}

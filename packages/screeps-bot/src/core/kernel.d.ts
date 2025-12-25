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
import { EventBus, EventHandler, EventName, EventPayload } from "./events";
import type { CPUConfig } from "../config";
import { type AdaptiveBudgetConfig } from "./adaptiveBudgets";
/**
 * Process priority levels
 */
export declare enum ProcessPriority {
    CRITICAL = 100,
    HIGH = 75,
    MEDIUM = 50,
    LOW = 25,
    IDLE = 10
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
export declare function buildKernelConfigFromCpu(cpuConfig: CPUConfig): KernelConfig;
interface FrequencyDefaults {
    interval: number;
    minBucket: number;
    cpuBudget: number;
}
/**
 * Kernel - Central Process Manager
 */
export declare class Kernel {
    private config;
    private processes;
    private bucketMode;
    private tickCpuUsed;
    private initialized;
    private frequencyDefaults;
    /** ID of the last process executed (for wrap-around preservation across queue rebuilds) */
    private lastExecutedProcessId;
    /** Index of the last process executed in the current queue (for wrap-around within a tick) */
    private lastExecutedIndex;
    /** Cached sorted process queue */
    private processQueue;
    /** Flag indicating if process queue needs rebuild */
    private queueDirty;
    /** Number of processes skipped this tick */
    private skippedProcessesThisTick;
    constructor(config: KernelConfig);
    /**
     * Register a process with the kernel
     */
    registerProcess(options: {
        id: string;
        name: string;
        priority?: ProcessPriority;
        frequency?: ProcessFrequency;
        minBucket?: number;
        cpuBudget?: number;
        interval?: number;
        execute: () => void;
    }): void;
    /**
     * Unregister a process
     */
    unregisterProcess(id: string): boolean;
    /**
     * Get a registered process
     */
    getProcess(id: string): Process | undefined;
    /**
     * Get all registered processes
     */
    getProcesses(): Process[];
    /**
     * Initialize the kernel (call once at start of first tick)
     */
    initialize(): void;
    /**
     * Determine current bucket mode based on bucket level.
     */
    private updateBucketMode;
    private validateConfig;
    private buildFrequencyDefaults;
    /**
     * Update adaptive CPU budgets based on current game state
     *
     * If adaptive budgets are enabled, calculates new budgets based on:
     * - Current room count (logarithmic scaling)
     * - Current bucket level (conservation/boost multipliers)
     *
     * This is called each tick during run() to keep budgets aligned with empire size
     *
     * WARNING: This method mutates this.config.frequencyCpuBudgets and rebuilds
     * this.frequencyDefaults each tick. Code that caches references to these
     * objects may see stale values. Always access via getConfig() or
     * getFrequencyDefaults() to get current values.
     */
    private updateAdaptiveBudgets;
    /**
     * Get current bucket mode.
     * Ensures the bucket mode is up-to-date before returning.
     */
    getBucketMode(): BucketMode;
    /**
     * Get CPU limit for current tick
     *
     * Returns the effective CPU limit regardless of bucket mode. The system continues
     * to process normally even with low bucket, using the full targetCpuUsage.
     * Individual processes can check bucket mode if they want to skip expensive
     * optional operations (like heavy calculations, optional optimizations) when bucket is low.
     */
    getCpuLimit(): number;
    /**
     * Check if CPU budget is available
     *
     * BUGFIX: Use the effective CPU limit (from getCpuLimit()) for both
     * the limit and reserved CPU calculation to maintain consistency across
     * all bucket modes (critical, low, normal, high).
     */
    hasCpuBudget(): boolean;
    /**
     * Get remaining CPU budget
     *
     * BUGFIX: Use the effective CPU limit (from getCpuLimit()) for both
     * the limit and reserved CPU calculation to maintain consistency across
     * all bucket modes (critical, low, normal, high).
     */
    getRemainingCpu(): number;
    /**
     * Rebuild the process queue sorted by priority.
     * Preserves execution fairness by finding the last executed process
     * in the new queue and continuing from the next one.
     */
    private rebuildProcessQueue;
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
    private shouldRunProcess;
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
    private calculateHealthScore;
    /**
     * Execute a single process with CPU tracking
     */
    private executeProcess;
    /**
     * Run all scheduled processes for this tick using a wrap-around queue.
     *
     * When processes are skipped due to CPU budget, they are guaranteed to be
     * considered first in the next tick by continuing from where we left off.
     * This ensures fair process execution across ticks while maintaining priority order.
     */
    run(): void;
    /**
     * Log kernel statistics with detailed breakdown
     */
    private logStats;
    /**
     * Get tick CPU used by kernel
     */
    getTickCpuUsed(): number;
    /**
     * Get number of processes skipped this tick
     */
    getSkippedProcessesThisTick(): number;
    /**
     * Suspend a process
     */
    suspendProcess(id: string): boolean;
    /**
     * Resume a suspended process
     */
    resumeProcess(id: string): boolean;
    /**
     * Get process statistics summary
     */
    getStatsSummary(): {
        totalProcesses: number;
        activeProcesses: number;
        suspendedProcesses: number;
        totalCpuUsed: number;
        avgCpuPerProcess: number;
        topCpuProcesses: {
            name: string;
            avgCpu: number;
        }[];
        unhealthyProcesses: {
            name: string;
            healthScore: number;
            consecutiveErrors: number;
        }[];
        avgHealthScore: number;
    };
    /**
     * Reset all process statistics
     */
    resetStats(): void;
    /**
     * Get kernel configuration
     */
    getConfig(): KernelConfig;
    /**
     * Get frequency defaults for a process frequency
     */
    getFrequencyDefaults(frequency: ProcessFrequency): FrequencyDefaults;
    /**
     * Update kernel configuration
     */
    updateConfig(config: Partial<KernelConfig>): void;
    /**
     * Update kernel configuration from CPU config
     */
    updateFromCpuConfig(cpuConfig: CPUConfig): void;
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
    on<T extends EventName>(eventName: T, handler: EventHandler<T>, options?: {
        priority?: number;
        minBucket?: number;
        once?: boolean;
    }): () => void;
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
    once<T extends EventName>(eventName: T, handler: EventHandler<T>, options?: {
        priority?: number;
        minBucket?: number;
    }): () => void;
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
    emit<T extends EventName>(eventName: T, payload: Omit<EventPayload<T>, "tick">, options?: {
        immediate?: boolean;
        priority?: number;
    }): void;
    /**
     * Remove all handlers for an event
     *
     * @param eventName - Name of the event to clear handlers for
     */
    offAll(eventName: EventName): void;
    /**
     * Process queued events
     *
     * Should be called each tick to process events that were deferred
     * due to low bucket status. This is automatically called by run().
     */
    processEvents(): void;
    /**
     * Get event bus statistics
     */
    getEventStats(): ReturnType<EventBus["getStats"]>;
    /**
     * Check if there are handlers for an event
     *
     * @param eventName - Name of the event to check
     */
    hasEventHandlers(eventName: EventName): boolean;
    /**
     * Get the event bus instance for advanced usage
     *
     * Prefer using kernel.on() and kernel.emit() for standard usage.
     */
    getEventBus(): EventBus;
}
/**
 * Global kernel instance
 */
export declare const kernel: Kernel;
/**
 * Create a high-frequency process (runs every tick)
 */
export declare function createHighFrequencyProcess(id: string, name: string, execute: () => void, priority?: ProcessPriority): Parameters<Kernel["registerProcess"]>[0];
/**
 * Create a medium-frequency process (runs every 5-10 ticks)
 */
export declare function createMediumFrequencyProcess(id: string, name: string, execute: () => void, priority?: ProcessPriority): Parameters<Kernel["registerProcess"]>[0];
/**
 * Create a low-frequency process (runs every 20+ ticks)
 */
export declare function createLowFrequencyProcess(id: string, name: string, execute: () => void, priority?: ProcessPriority): Parameters<Kernel["registerProcess"]>[0];
export {};
//# sourceMappingURL=kernel.d.ts.map
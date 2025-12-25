"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLowFrequencyProcess = exports.createMediumFrequencyProcess = exports.createHighFrequencyProcess = exports.kernel = exports.Kernel = exports.buildKernelConfigFromCpu = exports.ProcessPriority = void 0;
const events_1 = require("./events");
const config_1 = require("../config");
const logger_1 = require("./logger");
const adaptiveBudgets_1 = require("./adaptiveBudgets");
/**
 * Process priority levels
 */
var ProcessPriority;
(function (ProcessPriority) {
    ProcessPriority[ProcessPriority["CRITICAL"] = 100] = "CRITICAL";
    ProcessPriority[ProcessPriority["HIGH"] = 75] = "HIGH";
    ProcessPriority[ProcessPriority["MEDIUM"] = 50] = "MEDIUM";
    ProcessPriority[ProcessPriority["LOW"] = 25] = "LOW";
    ProcessPriority[ProcessPriority["IDLE"] = 10] = "IDLE"; // Very low priority (visualizations, stats)
})(ProcessPriority = exports.ProcessPriority || (exports.ProcessPriority = {}));
const BASE_CONFIG = {
    // Increased from 0.85 to 0.98 to use available CPU more efficiently
    // The reserved CPU (2%) plus this gives us ~98% utilization with 2% buffer
    // This prevents excessive CPU waste (was leaving 40+ CPU unused)
    targetCpuUsage: 0.98,
    reservedCpuFraction: 0.02,
    enableStats: true,
    statsLogInterval: 100,
    budgetWarningThreshold: 1.5,
    budgetWarningInterval: 500,
    enableAdaptiveBudgets: true,
    adaptiveBudgetConfig: adaptiveBudgets_1.DEFAULT_ADAPTIVE_CONFIG
};
const DEFAULT_CRITICAL_DIVISOR = 2;
function deriveCriticalThreshold(lowBucketThreshold) {
    return Math.max(0, Math.floor(lowBucketThreshold / DEFAULT_CRITICAL_DIVISOR));
}
function deriveFrequencyIntervals(taskFrequencies) {
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
function deriveFrequencyMinBucket(bucketThresholds, highBucketThreshold) {
    return {
        high: 0,
        medium: 0,
        low: 0 // No bucket requirement
    };
}
function deriveFrequencyBudgets(budgets) {
    return {
        high: budgets.rooms,
        medium: budgets.strategic,
        low: Math.max(budgets.market, budgets.visualization)
    };
}
function buildKernelConfigFromCpu(cpuConfig) {
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
exports.buildKernelConfigFromCpu = buildKernelConfigFromCpu;
/**
 * Kernel - Central Process Manager
 */
class Kernel {
    constructor(config) {
        this.processes = new Map();
        this.bucketMode = "normal";
        this.tickCpuUsed = 0;
        this.initialized = false;
        /** ID of the last process executed (for wrap-around preservation across queue rebuilds) */
        this.lastExecutedProcessId = null;
        /** Index of the last process executed in the current queue (for wrap-around within a tick) */
        this.lastExecutedIndex = -1;
        /** Cached sorted process queue */
        this.processQueue = [];
        /** Flag indicating if process queue needs rebuild */
        this.queueDirty = true;
        /** Number of processes skipped this tick */
        this.skippedProcessesThisTick = 0;
        this.config = { ...config };
        this.validateConfig();
        this.frequencyDefaults = this.buildFrequencyDefaults();
    }
    /**
     * Register a process with the kernel
     */
    registerProcess(options) {
        var _a, _b, _c, _d, _e;
        const frequency = (_a = options.frequency) !== null && _a !== void 0 ? _a : "medium";
        const defaults = this.frequencyDefaults[frequency];
        const process = {
            id: options.id,
            name: options.name,
            priority: (_b = options.priority) !== null && _b !== void 0 ? _b : ProcessPriority.MEDIUM,
            frequency,
            minBucket: (_c = options.minBucket) !== null && _c !== void 0 ? _c : defaults.minBucket,
            cpuBudget: (_d = options.cpuBudget) !== null && _d !== void 0 ? _d : defaults.cpuBudget,
            interval: (_e = options.interval) !== null && _e !== void 0 ? _e : defaults.interval,
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
        logger_1.logger.debug(`Kernel: Registered process "${process.name}" (${process.id})`, { subsystem: "Kernel" });
    }
    /**
     * Unregister a process
     */
    unregisterProcess(id) {
        const deleted = this.processes.delete(id);
        if (deleted) {
            this.queueDirty = true; // Mark queue for rebuild
            logger_1.logger.debug(`Kernel: Unregistered process ${id}`, { subsystem: "Kernel" });
        }
        return deleted;
    }
    /**
     * Get a registered process
     */
    getProcess(id) {
        return this.processes.get(id);
    }
    /**
     * Get all registered processes
     */
    getProcesses() {
        return Array.from(this.processes.values());
    }
    /**
     * Initialize the kernel (call once at start of first tick)
     */
    initialize() {
        if (this.initialized)
            return;
        logger_1.logger.info(`Kernel initialized with ${this.processes.size} processes`, { subsystem: "Kernel" });
        this.initialized = true;
    }
    /**
     * Determine current bucket mode based on bucket level.
     */
    updateBucketMode() {
        const bucket = Game.cpu.bucket;
        let newMode;
        if (bucket < this.config.criticalBucketThreshold) {
            newMode = "critical";
        }
        else if (bucket < this.config.lowBucketThreshold) {
            newMode = "low";
        }
        else if (bucket > this.config.highBucketThreshold) {
            newMode = "high";
        }
        else {
            newMode = "normal";
        }
        if (newMode !== this.bucketMode) {
            logger_1.logger.info(`Kernel: Bucket mode changed from ${this.bucketMode} to ${newMode} (bucket: ${bucket})`, {
                subsystem: "Kernel"
            });
            this.bucketMode = newMode;
        }
        // FEATURE: Periodic bucket status logging for user visibility
        // Log bucket status every 100 ticks to help users monitor bucket health
        // Bucket mode is informational only - it doesn't affect process execution
        if (Game.time % 100 === 0 && (this.bucketMode === "low" || this.bucketMode === "critical")) {
            const totalProcesses = this.processes.size;
            logger_1.logger.info(`Bucket ${this.bucketMode.toUpperCase()} mode: ${bucket}/10000 bucket. ` +
                `Running all ${totalProcesses} processes normally (bucket mode is informational only)`, { subsystem: "Kernel" });
        }
    }
    validateConfig() {
        if (this.config.criticalBucketThreshold >= this.config.lowBucketThreshold) {
            logger_1.logger.warn(`Kernel: Adjusting critical bucket threshold ${this.config.criticalBucketThreshold} to stay below low threshold ${this.config.lowBucketThreshold}`, { subsystem: "Kernel" });
            this.config.criticalBucketThreshold = Math.max(0, this.config.lowBucketThreshold - 1);
        }
        if (this.config.lowBucketThreshold >= this.config.highBucketThreshold) {
            logger_1.logger.warn(`Kernel: Adjusting high bucket threshold ${this.config.highBucketThreshold} to stay above low threshold ${this.config.lowBucketThreshold}`, { subsystem: "Kernel" });
            this.config.highBucketThreshold = this.config.lowBucketThreshold + 1;
        }
    }
    buildFrequencyDefaults() {
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
     *
     * WARNING: This method mutates this.config.frequencyCpuBudgets and rebuilds
     * this.frequencyDefaults each tick. Code that caches references to these
     * objects may see stale values. Always access via getConfig() or
     * getFrequencyDefaults() to get current values.
     */
    updateAdaptiveBudgets() {
        if (!this.config.enableAdaptiveBudgets) {
            return;
        }
        const adaptiveBudgets = (0, adaptiveBudgets_1.getAdaptiveBudgets)(this.config.adaptiveBudgetConfig);
        // Update frequency defaults with new adaptive budgets
        // NOTE: This mutates the config object - see method documentation
        this.config.frequencyCpuBudgets = adaptiveBudgets;
        this.frequencyDefaults = this.buildFrequencyDefaults();
        // Log budget changes periodically for visibility
        if (Game.time % 500 === 0) {
            const roomCount = Object.keys(Game.rooms).length;
            const bucket = Game.cpu.bucket;
            logger_1.logger.info(`Adaptive budgets updated: rooms=${roomCount}, bucket=${bucket}, ` +
                `high=${adaptiveBudgets.high.toFixed(3)}, medium=${adaptiveBudgets.medium.toFixed(3)}, low=${adaptiveBudgets.low.toFixed(3)}`, { subsystem: "Kernel" });
        }
    }
    /**
     * Get current bucket mode.
     * Ensures the bucket mode is up-to-date before returning.
     */
    getBucketMode() {
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
    getCpuLimit() {
        return Game.cpu.limit * this.config.targetCpuUsage;
    }
    /**
     * Check if CPU budget is available
     *
     * BUGFIX: Use the effective CPU limit (from getCpuLimit()) for both
     * the limit and reserved CPU calculation to maintain consistency across
     * all bucket modes (critical, low, normal, high).
     */
    hasCpuBudget() {
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
    getRemainingCpu() {
        const limit = this.getCpuLimit();
        const reservedCpu = limit * this.config.reservedCpuFraction;
        return Math.max(0, limit - Game.cpu.getUsed() - reservedCpu);
    }
    /**
     * Rebuild the process queue sorted by priority.
     * Preserves execution fairness by finding the last executed process
     * in the new queue and continuing from the next one.
     */
    rebuildProcessQueue() {
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
        }
        else {
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
    shouldRunProcess(process) {
        // Check if suspended and if suspension has expired
        if (process.state === "suspended" && process.stats.suspendedUntil !== null) {
            // Check if suspension period has expired
            if (Game.time >= process.stats.suspendedUntil) {
                // Automatic recovery: resume process
                process.state = "idle";
                process.stats.suspendedUntil = null;
                const previousReason = process.stats.suspensionReason;
                process.stats.suspensionReason = null;
                logger_1.logger.info(`Kernel: Process "${process.name}" automatically resumed after suspension. ` +
                    `Previous reason: ${previousReason}. Consecutive errors: ${process.stats.consecutiveErrors}`, {
                    subsystem: "Kernel",
                    processId: process.id
                });
                // Emit recovery event
                this.emit('process.recovered', {
                    processId: process.id,
                    processName: process.name,
                    previousReason: previousReason || 'Unknown',
                    consecutiveErrors: process.stats.consecutiveErrors
                }, { priority: 50 });
                // Process can now run
            }
            else {
                // Still suspended
                if (Game.time % 100 === 0) {
                    const ticksRemaining = process.stats.suspendedUntil - Game.time;
                    logger_1.logger.debug(`Kernel: Process "${process.name}" suspended (${ticksRemaining} ticks remaining)`, { subsystem: "Kernel" });
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
                    logger_1.logger.debug(`Kernel: Process "${process.name}" skipped (interval: ${ticksSinceRun}/${process.interval} ticks)`, { subsystem: "Kernel" });
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
    calculateHealthScore(stats) {
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
    executeProcess(process) {
        const cpuBefore = Game.cpu.getUsed();
        process.state = "running";
        try {
            process.execute();
            process.state = "idle";
            // Success: reset consecutive errors and update last successful run
            process.stats.consecutiveErrors = 0;
            process.stats.lastSuccessfulRunTick = Game.time;
        }
        catch (err) {
            process.state = "error";
            process.stats.errorCount++;
            process.stats.consecutiveErrors++;
            const errorMessage = err instanceof Error ? err.message : String(err);
            logger_1.logger.error(`Kernel: Process "${process.name}" error: ${errorMessage}`, { subsystem: "Kernel" });
            if (err instanceof Error && err.stack) {
                logger_1.logger.error(err.stack, { subsystem: "Kernel" });
            }
            // Check for automatic suspension
            const consecutiveErrors = process.stats.consecutiveErrors;
            // Circuit breaker: permanent suspension after 10 consecutive failures
            if (consecutiveErrors >= 10) {
                process.stats.suspendedUntil = Number.MAX_SAFE_INTEGER;
                process.stats.suspensionReason = `Circuit breaker: ${consecutiveErrors} consecutive failures (permanent)`;
                process.state = "suspended";
                logger_1.logger.error(`Kernel: Process "${process.name}" permanently suspended after ${consecutiveErrors} consecutive failures`, { subsystem: "Kernel", processId: process.id });
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
                logger_1.logger.warn(`Kernel: Process "${process.name}" suspended for ${suspensionDuration} ticks after ${consecutiveErrors} consecutive failures`, {
                    subsystem: "Kernel",
                    processId: process.id,
                    meta: {
                        errorCount: process.stats.errorCount,
                        resumeAt: process.stats.suspendedUntil
                    }
                });
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
            logger_1.logger.warn(`Kernel: Process "${process.name}" exceeded CPU budget: ${cpuUsed.toFixed(3)} > ${budgetLimit.toFixed(3)} (${(overBudgetRatio * 100).toFixed(0)}%)`, { subsystem: "Kernel" });
        }
    }
    /**
     * Run all scheduled processes for this tick using a wrap-around queue.
     *
     * When processes are skipped due to CPU budget, they are guaranteed to be
     * considered first in the next tick by continuing from where we left off.
     * This ensures fair process execution across ticks while maintaining priority order.
     */
    run() {
        this.updateBucketMode();
        this.updateAdaptiveBudgets(); // Update budgets based on current empire size and bucket
        this.tickCpuUsed = 0;
        this.skippedProcessesThisTick = 0;
        // Process queued events from previous ticks
        events_1.eventBus.processQueue();
        // Rebuild queue if needed (processes added/removed)
        if (this.queueDirty) {
            this.rebuildProcessQueue();
            logger_1.logger.info(`Kernel: Rebuilt process queue with ${this.processQueue.length} processes`, {
                subsystem: "Kernel"
            });
        }
        // If no processes, nothing to do
        if (this.processQueue.length === 0) {
            logger_1.logger.warn("Kernel: No processes registered in queue", { subsystem: "Kernel" });
            return;
        }
        // Log kernel run every 10 ticks for visibility
        if (Game.time % 10 === 0) {
            logger_1.logger.info(`Kernel: Running ${this.processQueue.length} registered processes`, {
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
                logger_1.logger.warn(`Kernel: CPU budget exhausted after ${processesRun} processes. ${processesSkippedByCpu} processes deferred to next tick. Used: ${Game.cpu.getUsed().toFixed(2)}/${this.getCpuLimit().toFixed(2)}`, { subsystem: "Kernel" });
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
            events_1.eventBus.logStats();
        }
    }
    /**
     * Log kernel statistics with detailed breakdown
     */
    logStats(processesRun, processesSkipped, skippedByInterval, skippedByCpu) {
        const bucket = Game.cpu.bucket;
        const bucketPercent = (bucket / 10000 * 100).toFixed(1);
        const cpuUsed = Game.cpu.getUsed();
        const cpuLimit = this.getCpuLimit();
        logger_1.logger.info(`Kernel: ${processesRun} ran, ${processesSkipped} skipped (interval: ${skippedByInterval}, CPU: ${skippedByCpu}), ` +
            `CPU: ${cpuUsed.toFixed(2)}/${cpuLimit.toFixed(2)} (${(cpuUsed / cpuLimit * 100).toFixed(1)}%), bucket: ${bucket}/10000 (${bucketPercent}%), mode: ${this.bucketMode}`, { subsystem: "Kernel" });
        // Log top skipped processes if we have a high skip count
        if (processesSkipped > 10) {
            const topSkipped = this.processQueue
                .filter(p => p.stats.skippedCount > 100)
                .sort((a, b) => b.stats.skippedCount - a.stats.skippedCount)
                .slice(0, 5);
            if (topSkipped.length > 0) {
                logger_1.logger.warn(`Kernel: Top skipped processes: ${topSkipped.map(p => `${p.name}(${p.stats.skippedCount}, interval:${p.interval})`).join(', ')}`, { subsystem: "Kernel" });
            }
        }
    }
    /**
     * Get tick CPU used by kernel
     */
    getTickCpuUsed() {
        return this.tickCpuUsed;
    }
    /**
     * Get number of processes skipped this tick
     */
    getSkippedProcessesThisTick() {
        return this.skippedProcessesThisTick;
    }
    /**
     * Suspend a process
     */
    suspendProcess(id) {
        const process = this.processes.get(id);
        if (process) {
            process.state = "suspended";
            logger_1.logger.info(`Kernel: Suspended process "${process.name}"`, { subsystem: "Kernel" });
            return true;
        }
        return false;
    }
    /**
     * Resume a suspended process
     */
    resumeProcess(id) {
        const process = this.processes.get(id);
        if (process && process.state === "suspended") {
            process.state = "idle";
            process.stats.suspendedUntil = null;
            const previousReason = process.stats.suspensionReason;
            process.stats.suspensionReason = null;
            logger_1.logger.info(`Kernel: Manually resumed process "${process.name}". ` +
                `Previous reason: ${previousReason}. Consecutive errors: ${process.stats.consecutiveErrors}`, {
                subsystem: "Kernel",
                processId: id
            });
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
    getStatsSummary() {
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
    resetStats() {
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
        logger_1.logger.info("Kernel: Reset all process statistics", { subsystem: "Kernel" });
    }
    /**
     * Get kernel configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Get frequency defaults for a process frequency
     */
    getFrequencyDefaults(frequency) {
        return { ...this.frequencyDefaults[frequency] };
    }
    /**
     * Update kernel configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.validateConfig();
        this.frequencyDefaults = this.buildFrequencyDefaults();
    }
    /**
     * Update kernel configuration from CPU config
     */
    updateFromCpuConfig(cpuConfig) {
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
    on(eventName, handler, options = {}) {
        return events_1.eventBus.on(eventName, handler, options);
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
    once(eventName, handler, options = {}) {
        return events_1.eventBus.once(eventName, handler, options);
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
    emit(eventName, payload, options = {}) {
        events_1.eventBus.emit(eventName, payload, options);
    }
    /**
     * Remove all handlers for an event
     *
     * @param eventName - Name of the event to clear handlers for
     */
    offAll(eventName) {
        events_1.eventBus.offAll(eventName);
    }
    /**
     * Process queued events
     *
     * Should be called each tick to process events that were deferred
     * due to low bucket status. This is automatically called by run().
     */
    processEvents() {
        events_1.eventBus.processQueue();
    }
    /**
     * Get event bus statistics
     */
    getEventStats() {
        return events_1.eventBus.getStats();
    }
    /**
     * Check if there are handlers for an event
     *
     * @param eventName - Name of the event to check
     */
    hasEventHandlers(eventName) {
        return events_1.eventBus.hasHandlers(eventName);
    }
    /**
     * Get the event bus instance for advanced usage
     *
     * Prefer using kernel.on() and kernel.emit() for standard usage.
     */
    getEventBus() {
        return events_1.eventBus;
    }
}
exports.Kernel = Kernel;
/**
 * Global kernel instance
 */
exports.kernel = new Kernel(buildKernelConfigFromCpu((0, config_1.getConfig)().cpu));
// =============================================================================
// Helper functions for process registration
// =============================================================================
/**
 * Create a high-frequency process (runs every tick)
 */
function createHighFrequencyProcess(id, name, execute, priority = ProcessPriority.HIGH) {
    const defaults = exports.kernel.getFrequencyDefaults("high");
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
exports.createHighFrequencyProcess = createHighFrequencyProcess;
/**
 * Create a medium-frequency process (runs every 5-10 ticks)
 */
function createMediumFrequencyProcess(id, name, execute, priority = ProcessPriority.MEDIUM) {
    const defaults = exports.kernel.getFrequencyDefaults("medium");
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
exports.createMediumFrequencyProcess = createMediumFrequencyProcess;
/**
 * Create a low-frequency process (runs every 20+ ticks)
 */
function createLowFrequencyProcess(id, name, execute, priority = ProcessPriority.LOW) {
    const defaults = exports.kernel.getFrequencyDefaults("low");
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
exports.createLowFrequencyProcess = createLowFrequencyProcess;

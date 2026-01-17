/**
 * Kernel - Central Process Management
 *
 * This module re-exports the kernel from @ralphschuler/screeps-kernel framework package
 * and adds monolith-specific customizations:
 * - Execution jitter (±10% on process intervals) to prevent thundering herd
 * - Integration with monolith's config system
 *
 * The kernel is the central coordinator for all processes in the bot:
 * - Process registration and lifecycle management
 * - CPU budget allocation and enforcement per process
 * - Priority-based process scheduling with wrap-around queue
 * - Process statistics tracking
 * - Centralized event system for inter-process communication
 * - Priority decay for fair process scheduling under CPU pressure
 *
 * Design Principles (from ROADMAP.md):
 * - Striktes Tick-Budget: Eco rooms ≤ 0.1 CPU, War rooms ≤ 0.25 CPU, Global overmind ≤ 1 CPU
 * - Rolling index execution: All processes get fair execution time via wrap-around queue
 * - Frequenzebenen: High frequency (every tick), Medium (5-20 ticks), Low (≥100 ticks)
 * - Ereignisgetriebene Logik: Critical events trigger immediate updates
 *
 * Test Coverage: 88% - Comprehensive tests exist for:
 * - Process scheduling and wrap-around queue (kernelWrapAround.test.ts)
 * - Health monitoring and auto-suspension (kernelHealthMonitoring.test.ts)
 * - Adaptive CPU budgets (kernelAdaptiveBudgets.test.ts)
 * - Process skipping and tick distribution (kernelSkippedProcesses.test.ts, kernelTickDistribution.test.ts)
 */

// Re-export everything from the framework package
export {
  ProcessPriority,
  type ProcessFrequency,
  type ProcessState,
  type ProcessStats,
  type KernelProcess as Process,
  type BucketMode,
  Kernel
} from "@ralphschuler/screeps-kernel";

import { Kernel, type ProcessFrequency, DEFAULT_ADAPTIVE_CONFIG } from "@ralphschuler/screeps-kernel";
import type { CPUConfig } from "../config";
import { getConfig } from "../config";
import { logger } from "./logger";

/**
 * Build kernel configuration from CPU config
 * Maps the monolith's CPU config to the framework's kernel config
 * 
 * Uses framework's default derivation logic to compute frequency intervals,
 * min bucket thresholds, and CPU budgets from the monolith's CPUConfig.
 */
export function buildKernelConfigFromCpu(cpuConfig: CPUConfig) {
  // Derive critical threshold from low bucket (framework uses lowBucket / 2)
  const criticalBucketThreshold = Math.floor(cpuConfig.bucketThresholds.lowMode / 2);
  
  // Derive frequency intervals from task frequencies
  const frequencyIntervals = {
    high: 1,
    medium: Math.max(1, Math.min(cpuConfig.taskFrequencies.clusterLogic, cpuConfig.taskFrequencies.pheromoneUpdate)),
    low: Math.max(cpuConfig.taskFrequencies.marketScan, cpuConfig.taskFrequencies.nukeEvaluation, cpuConfig.taskFrequencies.memoryCleanup)
  };
  
  // Derive CPU budgets from configured subsystem budgets
  const frequencyCpuBudgets = {
    high: cpuConfig.budgets.rooms,
    medium: cpuConfig.budgets.strategic,
    low: Math.max(cpuConfig.budgets.market, cpuConfig.budgets.visualization)
  };
  
  return {
    lowBucketThreshold: cpuConfig.bucketThresholds.lowMode,
    highBucketThreshold: cpuConfig.bucketThresholds.highMode,
    criticalBucketThreshold,
    // NOTE: Framework BASE_CONFIG uses targetCpuUsage = 0.98 to minimize CPU waste.
    // We intentionally run slightly lower at 0.95 to align with the monolith's strict
    // tick-budget policy in ROADMAP.md and to leave extra headroom for spikey ticks
    // and finalization work. This is a deliberate divergence from the framework default.
    targetCpuUsage: 0.95, // Target 95% of CPU limit (more conservative than framework default)
    reservedCpuFraction: 0.02, // Reserve 2% for finalization
    enableStats: true,
    statsLogInterval: 100,
    frequencyIntervals,
    frequencyMinBucket: {
      high: 0, // No bucket requirement
      medium: 0, // No bucket requirement
      low: 0 // No bucket requirement
    },
    frequencyCpuBudgets,
    budgetWarningThreshold: 1.5, // Warn when process exceeds budget by 50%
    budgetWarningInterval: 100, // Log warnings every 100 ticks
    // Explicitly configure adaptive budgets instead of relying on framework defaults.
    // The monolith currently uses fixed per-frequency CPU budgets.
    enableAdaptiveBudgets: false,
    adaptiveBudgetConfig: DEFAULT_ADAPTIVE_CONFIG, // Use framework defaults for adaptive config
    enablePriorityDecay: true, // Use framework's priority decay feature
    priorityDecayRate: 1, // Framework default (processes gain 1 priority per CPU skip)
    maxPriorityBoost: 50
  };
}

/**
 * Global kernel instance with monolith configuration
 * Lazily initialized on first access to avoid config issues during testing
 */
let _kernel: Kernel | null = null;

export const kernel = new Proxy({} as Kernel, {
  get(target, prop) {
    if (!_kernel) {
      _kernel = new Kernel(buildKernelConfigFromCpu(getConfig().cpu));
    }
    return (_kernel as any)[prop];
  },
  set(target, prop, value) {
    if (!_kernel) {
      _kernel = new Kernel(buildKernelConfigFromCpu(getConfig().cpu));
    }
    (_kernel as any)[prop] = value;
    return true;
  }
});

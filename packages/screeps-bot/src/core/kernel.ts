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

import { Kernel, type ProcessFrequency } from "@ralphschuler/screeps-kernel";
import type { CPUConfig } from "../config";
import { getConfig } from "../config";
import { logger } from "./logger";

/**
 * Build kernel configuration from CPU config
 * Maps the monolith's CPU config to the framework's kernel config
 */
export function buildKernelConfigFromCpu(cpuConfig: CPUConfig) {
  return {
    maxCpuPerTick: cpuConfig.limit,
    bucketThresholds: {
      critical: cpuConfig.bucket.critical,
      low: cpuConfig.bucket.low,
      normal: cpuConfig.bucket.normal,
      high: cpuConfig.bucket.high
    },
    defaultCpuBudgets: {
      high: cpuConfig.processDefaults.high.cpuBudget,
      medium: cpuConfig.processDefaults.medium.cpuBudget,
      low: cpuConfig.processDefaults.low.cpuBudget
    },
    minBucketDefaults: {
      high: cpuConfig.processDefaults.high.minBucket,
      medium: cpuConfig.processDefaults.medium.minBucket,
      low: cpuConfig.processDefaults.low.minBucket
    },
    enablePriorityDecay: true, // Use framework's priority decay feature
    priorityDecayRate: 0.1,
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

/**
 * Apply execution jitter to interval
 * Adds ±10% random jitter to prevent all processes running on the same tick
 * This helps avoid thundering herd problems
 */
function applyJitter(baseInterval: number): { interval: number; jitter: number } {
  const jitterRange = Math.floor(baseInterval * 0.1);
  const jitter = Math.floor(Math.random() * (jitterRange * 2 + 1)) - jitterRange;
  const interval = Math.max(1, baseInterval + jitter);
  return { interval, jitter };
}

/**
 * Helper function to create a high frequency process with jitter
 * @deprecated Use processDecorators.ts instead
 */
export function createHighFrequencyProcess(
  id: string,
  name: string,
  execute: () => void,
  options: {
    cpuBudget?: number;
    minBucket?: number;
    interval?: number;
  } = {}
) {
  const baseInterval = options.interval ?? 1;
  const { interval, jitter } = applyJitter(baseInterval);
  
  logger.debug(
    `Kernel: Creating high frequency process "${name}" (${id}) with interval ${interval} (base: ${baseInterval}, jitter: ${jitter > 0 ? '+' : ''}${jitter})`,
    { subsystem: "Kernel" }
  );
  
  return {
    id,
    name,
    frequency: "high" as ProcessFrequency,
    cpuBudget: options.cpuBudget ?? 0.3,
    minBucket: options.minBucket ?? 0,
    interval,
    execute
  };
}

/**
 * Helper function to create a medium frequency process with jitter
 * @deprecated Use processDecorators.ts instead
 */
export function createMediumFrequencyProcess(
  id: string,
  name: string,
  execute: () => void,
  options: {
    cpuBudget?: number;
    minBucket?: number;
    interval?: number;
  } = {}
) {
  const baseInterval = options.interval ?? 5;
  const { interval, jitter } = applyJitter(baseInterval);
  
  logger.debug(
    `Kernel: Creating medium frequency process "${name}" (${id}) with interval ${interval} (base: ${baseInterval}, jitter: ${jitter > 0 ? '+' : ''}${jitter})`,
    { subsystem: "Kernel" }
  );
  
  return {
    id,
    name,
    frequency: "medium" as ProcessFrequency,
    cpuBudget: options.cpuBudget ?? 0.15,
    minBucket: options.minBucket ?? 0,
    interval,
    execute
  };
}

/**
 * Helper function to create a low frequency process with jitter
 * @deprecated Use processDecorators.ts instead
 */
export function createLowFrequencyProcess(
  id: string,
  name: string,
  execute: () => void,
  options: {
    cpuBudget?: number;
    minBucket?: number;
    interval?: number;
  } = {}
) {
  const baseInterval = options.interval ?? 20;
  const { interval, jitter } = applyJitter(baseInterval);
  
  logger.debug(
    `Kernel: Creating low frequency process "${name}" (${id}) with interval ${interval} (base: ${baseInterval}, jitter: ${jitter > 0 ? '+' : ''}${jitter})`,
    { subsystem: "Kernel" }
  );
  
  return {
    id,
    name,
    frequency: "low" as ProcessFrequency,
    cpuBudget: options.cpuBudget ?? 0.1,
    minBucket: options.minBucket ?? 0,
    interval,
    execute
  };
}

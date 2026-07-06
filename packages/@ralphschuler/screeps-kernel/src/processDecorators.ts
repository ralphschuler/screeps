/**
 * Process Decorators
 *
 * TypeScript decorators for registering kernel processes declaratively.
 * Allows classes to define processes using method decorators instead of
 * manual registration calls.
 *
 * Usage:
 * ```typescript
 * class MyManager {
 *   @Process({
 *     id: "my:process",
 *     name: "My Process",
 *     priority: ProcessPriority.MEDIUM,
 *     frequency: "medium",
 *     interval: 10
 *   })
 *   run(): void {
 *     // Process logic
 *   }
 * }
 * ```
 */

import { type Kernel, type ProcessFrequency, ProcessPriority, kernel } from "./kernel";
import { logger } from "./logger";

/**
 * Process decorator options
 */
export interface ProcessOptions {
  /** Unique process ID */
  id: string;
  /** Display name */
  name: string;
  /** Process priority (default: MEDIUM) */
  priority?: ProcessPriority;
  /** Process frequency (default: "medium") */
  frequency?: ProcessFrequency;
  /** Minimum CPU bucket to run (default: based on frequency) */
  minBucket?: number;
  /** CPU budget as fraction of limit (default: 0.1) */
  cpuBudget?: number;
  /** Run interval in ticks (default: based on frequency) */
  interval?: number;
}

/**
 * Metadata storage for decorated processes
 */
export interface ProcessMetadata {
  options: ProcessOptions;
  methodName: string;
  target: object;
}

type ProcessDecoratorGlobal = typeof globalThis & {
  __screepsKernelProcessMetadataStore?: ProcessMetadata[];
  __screepsKernelRegisteredProcessClasses?: Set<new () => unknown>;
};

const processDecoratorGlobal = globalThis as ProcessDecoratorGlobal;

/**
 * Shared runtime storage for process metadata before registration.
 *
 * The global key keeps source/dist module instances on one metadata store when
 * package managers and the bot runtime are loaded through different module paths.
 */
const processMetadataStore: ProcessMetadata[] =
  processDecoratorGlobal.__screepsKernelProcessMetadataStore ??
  (processDecoratorGlobal.__screepsKernelProcessMetadataStore = []);

/**
 * Registered process classes for automatic discovery.
 */
const registeredClasses: Set<new () => unknown> =
  processDecoratorGlobal.__screepsKernelRegisteredProcessClasses ??
  (processDecoratorGlobal.__screepsKernelRegisteredProcessClasses = new Set());

/**
 * Process decorator - marks a method as a kernel process
 *
 * @param options - Process configuration options
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * class EmpireController {
 *   @Process({
 *     id: "empire:scan",
 *     name: "Empire Scanner",
 *     priority: ProcessPriority.LOW,
 *     frequency: "low",
 *     interval: 50
 *   })
 *   scanEmpire(): void {
 *     // Scan logic
 *   }
 * }
 * ```
 */
export function Process(options: ProcessOptions) {
  return function<T>(
    target: object,
    propertyKey: string | symbol,
    _descriptor: TypedPropertyDescriptor<T>
  ): void {
    processMetadataStore.push({
      options,
      methodName: String(propertyKey),
      target
    });
  };
}

/**
 * High frequency process decorator (runs every tick)
 * Shorthand for @Process with frequency: "high"
 */
export function HighFrequencyProcess(
  id: string,
  name: string,
  options?: Partial<Omit<ProcessOptions, "id" | "name" | "frequency">>
) {
  return Process({
    id,
    name,
    priority: ProcessPriority.HIGH,
    frequency: "high",
    cpuBudget: 0.3,
    interval: 1,
    ...options
  });
}

/**
 * Medium frequency process decorator (runs every 5-10 ticks)
 * Shorthand for @Process with frequency: "medium"
 */
export function MediumFrequencyProcess(
  id: string,
  name: string,
  options?: Partial<Omit<ProcessOptions, "id" | "name" | "frequency">>
) {
  return Process({
    id,
    name,
    priority: ProcessPriority.MEDIUM,
    frequency: "medium",
    cpuBudget: 0.15,
    interval: 5,
    ...options
  });
}

/**
 * Low frequency process decorator (runs every 20+ ticks)
 * Shorthand for @Process with frequency: "low"
 */
export function LowFrequencyProcess(
  id: string,
  name: string,
  options?: Partial<Omit<ProcessOptions, "id" | "name" | "frequency">>
) {
  return Process({
    id,
    name,
    priority: ProcessPriority.LOW,
    frequency: "low",
    cpuBudget: 0.1,
    interval: 20,
    ...options
  });
}

/**
 * Critical process decorator (must run every tick)
 * Shorthand for @Process with priority: CRITICAL
 */
export function CriticalProcess(
  id: string,
  name: string,
  options?: Partial<Omit<ProcessOptions, "id" | "name" | "priority">>
) {
  return Process({
    id,
    name,
    priority: ProcessPriority.CRITICAL,
    frequency: "high",
    minBucket: 0,
    cpuBudget: 0.3,
    interval: 1,
    ...options
  });
}

/**
 * Idle process decorator (very low priority background tasks)
 * Shorthand for @Process with priority: IDLE
 */
export function IdleProcess(
  id: string,
  name: string,
  options?: Partial<Omit<ProcessOptions, "id" | "name" | "priority">>
) {
  return Process({
    id,
    name,
    priority: ProcessPriority.IDLE,
    frequency: "low",
    cpuBudget: 0.05,
    interval: 100,
    ...options
  });
}

/**
 * Class decorator to mark a class as containing process methods
 * This enables automatic discovery and registration of decorated methods
 */
export function ProcessClass(): <T extends new (...args: any[]) => any>(constructor: T) => T {
  return function<T extends new (...args: any[]) => any>(constructor: T): T {
    registeredClasses.add(constructor as unknown as new () => unknown);
    return constructor;
  };
}

/**
 * Apply execution jitter to interval.
 * Adds ±10% random jitter to prevent all same-interval decorated processes from
 * registering with identical cadence after a global reset.
 */
function applyJitter(baseInterval: number): { interval: number; jitter: number } {
  const jitterRange = Math.floor(baseInterval * 0.1);
  const jitter = Math.floor(Math.random() * (jitterRange * 2 + 1)) - jitterRange;
  const interval = Math.max(1, baseInterval + jitter);
  return { interval, jitter };
}

function metadataMatchesInstance(metadata: ProcessMetadata, instance: object): boolean {
  const instancePrototype = Object.getPrototypeOf(instance) as object | null;
  if (!instancePrototype) {
    return false;
  }

  return (
    metadata.target === instancePrototype ||
    Object.getPrototypeOf(metadata.target) === instancePrototype ||
    metadata.target === Object.getPrototypeOf(instancePrototype)
  );
}

/**
 * Register all decorated processes from an instance onto an explicit kernel.
 *
 * Use this when a runtime owns a configured Kernel instance but consumes
 * managers from framework packages. Decorators still share this package's
 * single metadata store, while registration targets the runtime kernel that
 * actually executes processes.
 *
 * @param targetKernel - Kernel instance that should execute the decorated process
 * @param instance - Instance of a class with decorated process methods
 */
export function registerDecoratedProcessesWithKernel(targetKernel: Kernel, instance: object): void {
  for (const metadata of processMetadataStore) {
    if (!metadataMatchesInstance(metadata, instance)) {
      continue;
    }

    const method = (instance as Record<string, unknown>)[metadata.methodName];

    if (typeof method !== "function") {
      continue;
    }

    const boundMethod = (method as (...args: unknown[]) => unknown).bind(instance);
    const baseInterval = metadata.options.interval;
    const { interval, jitter } = baseInterval === undefined
      ? { interval: undefined, jitter: 0 }
      : applyJitter(baseInterval);

    targetKernel.registerProcess({
      id: metadata.options.id,
      name: metadata.options.name,
      priority: metadata.options.priority ?? ProcessPriority.MEDIUM,
      frequency: metadata.options.frequency ?? "medium",
      minBucket: metadata.options.minBucket,
      cpuBudget: metadata.options.cpuBudget,
      interval,
      execute: boundMethod as () => void
    });

    const jitterDescription = baseInterval === undefined
      ? "default interval"
      : `interval ${interval} (base: ${baseInterval}, jitter: ${jitter > 0 ? "+" : ""}${jitter})`;

    logger.debug(
      `Registered decorated process "${metadata.options.name}" (${metadata.options.id}) with ${jitterDescription}`,
      { subsystem: "ProcessDecorators" }
    );
  }
}

/**
 * Register all decorated processes from an instance on the framework singleton kernel.
 * Call this after creating an instance of a class with @Process decorated methods.
 *
 * @param instance - Instance of a class with decorated process methods
 *
 * @example
 * ```typescript
 * const manager = new EmpireController();
 * registerDecoratedProcesses(manager);
 * ```
 */
export function registerDecoratedProcesses(instance: object): void {
  registerDecoratedProcessesWithKernel(kernel, instance);
}

/**
 * Register processes from multiple instances onto an explicit kernel.
 *
 * @param targetKernel - Kernel instance that should execute the decorated processes
 * @param instances - Array of instances with decorated process methods
 */
export function registerAllDecoratedProcessesWithKernel(targetKernel: Kernel, ...instances: object[]): void {
  for (const instance of instances) {
    registerDecoratedProcessesWithKernel(targetKernel, instance);
  }

  logger.info(
    `Registered decorated processes from ${instances.length} instance(s)`,
    { subsystem: "ProcessDecorators" }
  );
}

/**
 * Register processes from multiple instances on the framework singleton kernel.
 *
 * @param instances - Array of instances with decorated process methods
 */
export function registerAllDecoratedProcesses(...instances: object[]): void {
  registerAllDecoratedProcessesWithKernel(kernel, ...instances);
}

/**
 * Get all stored process metadata (for debugging)
 */
export function getProcessMetadata(): ProcessMetadata[] {
  return [...processMetadataStore];
}

/**
 * Clear all stored process metadata (for testing)
 */
export function clearProcessMetadata(): void {
  processMetadataStore.length = 0;
}

/**
 * Get all registered process classes
 */
export function getRegisteredClasses(): Set<new () => unknown> {
  return new Set(registeredClasses);
}

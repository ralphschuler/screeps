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
import { type ProcessFrequency, ProcessPriority } from "./kernel";
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
interface ProcessMetadata {
    options: ProcessOptions;
    methodName: string;
    target: object;
}
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
export declare function Process(options: ProcessOptions): <T>(target: object, propertyKey: string | symbol, _descriptor: TypedPropertyDescriptor<T>) => void;
/**
 * High frequency process decorator (runs every tick)
 * Shorthand for @Process with frequency: "high"
 *
 * REMOVED: minBucket requirement set to 0 - processes run regardless of bucket level
 */
export declare function HighFrequencyProcess(id: string, name: string, options?: Partial<Omit<ProcessOptions, "id" | "name" | "frequency">>): <T>(target: object, propertyKey: string | symbol, _descriptor: TypedPropertyDescriptor<T>) => void;
/**
 * Medium frequency process decorator (runs every 5-10 ticks)
 * Shorthand for @Process with frequency: "medium"
 *
 * REMOVED: minBucket requirement set to 0 - processes run regardless of bucket level
 */
export declare function MediumFrequencyProcess(id: string, name: string, options?: Partial<Omit<ProcessOptions, "id" | "name" | "frequency">>): <T>(target: object, propertyKey: string | symbol, _descriptor: TypedPropertyDescriptor<T>) => void;
/**
 * Low frequency process decorator (runs every 20+ ticks)
 * Shorthand for @Process with frequency: "low"
 *
 * REMOVED: minBucket requirement set to 0 - processes run regardless of bucket level
 */
export declare function LowFrequencyProcess(id: string, name: string, options?: Partial<Omit<ProcessOptions, "id" | "name" | "frequency">>): <T>(target: object, propertyKey: string | symbol, _descriptor: TypedPropertyDescriptor<T>) => void;
/**
 * Critical process decorator (must run every tick)
 * Shorthand for @Process with priority: CRITICAL
 *
 * REMOVED: minBucket requirement set to 0 - processes run regardless of bucket level
 */
export declare function CriticalProcess(id: string, name: string, options?: Partial<Omit<ProcessOptions, "id" | "name" | "priority">>): <T>(target: object, propertyKey: string | symbol, _descriptor: TypedPropertyDescriptor<T>) => void;
/**
 * Idle process decorator (very low priority background tasks)
 * Shorthand for @Process with priority: IDLE
 *
 * REMOVED: minBucket requirement set to 0 - processes run regardless of bucket level
 */
export declare function IdleProcess(id: string, name: string, options?: Partial<Omit<ProcessOptions, "id" | "name" | "priority">>): <T>(target: object, propertyKey: string | symbol, _descriptor: TypedPropertyDescriptor<T>) => void;
/**
 * Class decorator to mark a class as containing process methods
 * This enables automatic discovery and registration of decorated methods
 */
export declare function ProcessClass(): <T extends new (...args: any[]) => any>(constructor: T) => T;
/**
 * Register all decorated processes from an instance
 * Call this after creating an instance of a class with @Process decorated methods
 *
 * @param instance - Instance of a class with decorated process methods
 *
 * @example
 * ```typescript
 * const manager = new EmpireController();
 * registerDecoratedProcesses(manager);
 * ```
 */
export declare function registerDecoratedProcesses(instance: object): void;
/**
 * Register processes from multiple instances
 *
 * @param instances - Array of instances with decorated process methods
 */
export declare function registerAllDecoratedProcesses(...instances: object[]): void;
/**
 * Get all stored process metadata (for debugging)
 */
export declare function getProcessMetadata(): ProcessMetadata[];
/**
 * Clear all stored process metadata (for testing)
 */
export declare function clearProcessMetadata(): void;
/**
 * Get all registered process classes
 */
export declare function getRegisteredClasses(): Set<new () => unknown>;
export {};
//# sourceMappingURL=processDecorators.d.ts.map
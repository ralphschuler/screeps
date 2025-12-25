"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegisteredClasses = exports.clearProcessMetadata = exports.getProcessMetadata = exports.registerAllDecoratedProcesses = exports.registerDecoratedProcesses = exports.ProcessClass = exports.IdleProcess = exports.CriticalProcess = exports.LowFrequencyProcess = exports.MediumFrequencyProcess = exports.HighFrequencyProcess = exports.Process = void 0;
const kernel_1 = require("./kernel");
const logger_1 = require("./logger");
/**
 * Storage for process metadata before registration
 */
const processMetadataStore = [];
/**
 * Registered process classes for automatic discovery
 */
const registeredClasses = new Set();
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
function Process(options) {
    return function (target, propertyKey, _descriptor) {
        processMetadataStore.push({
            options,
            methodName: String(propertyKey),
            target
        });
    };
}
exports.Process = Process;
/**
 * High frequency process decorator (runs every tick)
 * Shorthand for @Process with frequency: "high"
 *
 * REMOVED: minBucket requirement set to 0 - processes run regardless of bucket level
 */
function HighFrequencyProcess(id, name, options) {
    return Process({
        id,
        name,
        priority: kernel_1.ProcessPriority.HIGH,
        frequency: "high",
        minBucket: 0,
        cpuBudget: 0.3,
        interval: 1,
        ...options
    });
}
exports.HighFrequencyProcess = HighFrequencyProcess;
/**
 * Medium frequency process decorator (runs every 5-10 ticks)
 * Shorthand for @Process with frequency: "medium"
 *
 * REMOVED: minBucket requirement set to 0 - processes run regardless of bucket level
 */
function MediumFrequencyProcess(id, name, options) {
    return Process({
        id,
        name,
        priority: kernel_1.ProcessPriority.MEDIUM,
        frequency: "medium",
        minBucket: 0,
        cpuBudget: 0.15,
        interval: 5,
        ...options
    });
}
exports.MediumFrequencyProcess = MediumFrequencyProcess;
/**
 * Low frequency process decorator (runs every 20+ ticks)
 * Shorthand for @Process with frequency: "low"
 *
 * REMOVED: minBucket requirement set to 0 - processes run regardless of bucket level
 */
function LowFrequencyProcess(id, name, options) {
    return Process({
        id,
        name,
        priority: kernel_1.ProcessPriority.LOW,
        frequency: "low",
        minBucket: 0,
        cpuBudget: 0.1,
        interval: 20,
        ...options
    });
}
exports.LowFrequencyProcess = LowFrequencyProcess;
/**
 * Critical process decorator (must run every tick)
 * Shorthand for @Process with priority: CRITICAL
 *
 * REMOVED: minBucket requirement set to 0 - processes run regardless of bucket level
 */
function CriticalProcess(id, name, options) {
    return Process({
        id,
        name,
        priority: kernel_1.ProcessPriority.CRITICAL,
        frequency: "high",
        minBucket: 0,
        cpuBudget: 0.3,
        interval: 1,
        ...options
    });
}
exports.CriticalProcess = CriticalProcess;
/**
 * Idle process decorator (very low priority background tasks)
 * Shorthand for @Process with priority: IDLE
 *
 * REMOVED: minBucket requirement set to 0 - processes run regardless of bucket level
 */
function IdleProcess(id, name, options) {
    return Process({
        id,
        name,
        priority: kernel_1.ProcessPriority.IDLE,
        frequency: "low",
        minBucket: 0,
        cpuBudget: 0.05,
        interval: 100,
        ...options
    });
}
exports.IdleProcess = IdleProcess;
/**
 * Class decorator to mark a class as containing process methods
 * This enables automatic discovery and registration of decorated methods
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProcessClass() {
    return function (constructor) {
        registeredClasses.add(constructor);
        return constructor;
    };
}
exports.ProcessClass = ProcessClass;
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
function registerDecoratedProcesses(instance) {
    var _a, _b;
    const instancePrototype = Object.getPrototypeOf(instance);
    for (const metadata of processMetadataStore) {
        // Check if this metadata belongs to the instance's prototype chain
        if (metadata.target === instancePrototype ||
            Object.getPrototypeOf(metadata.target) === instancePrototype ||
            metadata.target === Object.getPrototypeOf(instancePrototype)) {
            const method = instance[metadata.methodName];
            if (typeof method === "function") {
                const boundMethod = method.bind(instance);
                kernel_1.kernel.registerProcess({
                    id: metadata.options.id,
                    name: metadata.options.name,
                    priority: (_a = metadata.options.priority) !== null && _a !== void 0 ? _a : kernel_1.ProcessPriority.MEDIUM,
                    frequency: (_b = metadata.options.frequency) !== null && _b !== void 0 ? _b : "medium",
                    minBucket: metadata.options.minBucket,
                    cpuBudget: metadata.options.cpuBudget,
                    interval: metadata.options.interval,
                    execute: boundMethod
                });
                logger_1.logger.debug(`Registered decorated process "${metadata.options.name}" (${metadata.options.id})`, { subsystem: "ProcessDecorators" });
            }
        }
    }
}
exports.registerDecoratedProcesses = registerDecoratedProcesses;
/**
 * Register processes from multiple instances
 *
 * @param instances - Array of instances with decorated process methods
 */
function registerAllDecoratedProcesses(...instances) {
    for (const instance of instances) {
        registerDecoratedProcesses(instance);
    }
    logger_1.logger.info(`Registered decorated processes from ${instances.length} instance(s)`, { subsystem: "ProcessDecorators" });
}
exports.registerAllDecoratedProcesses = registerAllDecoratedProcesses;
/**
 * Get all stored process metadata (for debugging)
 */
function getProcessMetadata() {
    return [...processMetadataStore];
}
exports.getProcessMetadata = getProcessMetadata;
/**
 * Clear all stored process metadata (for testing)
 */
function clearProcessMetadata() {
    processMetadataStore.length = 0;
}
exports.clearProcessMetadata = clearProcessMetadata;
/**
 * Get all registered process classes
 */
function getRegisteredClasses() {
    return new Set(registeredClasses);
}
exports.getRegisteredClasses = getRegisteredClasses;

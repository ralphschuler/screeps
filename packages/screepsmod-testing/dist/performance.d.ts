/**
 * Performance benchmarking utilities for Screeps testing
 */
import { BenchmarkResult } from './types';
/**
 * Benchmark a function's performance
 */
export declare function benchmark(name: string, fn: () => void | Promise<void>, options?: {
    samples?: number;
    iterations?: number;
    warmup?: number;
}): Promise<BenchmarkResult>;
/**
 * CPU usage tracking helper
 */
export declare class CPUTracker {
    private startCPU;
    start(): void;
    stop(): number;
}
/**
 * Memory usage tracking helper
 */
export declare class MemoryTracker {
    private startMemory;
    start(): void;
    stop(): number;
}
/**
 * Performance assertion helpers
 */
export declare class PerformanceAssert {
    /**
     * Assert that a function completes within a certain CPU budget
     */
    static cpuBudget(fn: () => void | Promise<void>, maxCPU: number, message?: string): Promise<void>;
    /**
     * Assert that a function completes within a certain time
     */
    static timeLimit(fn: () => void | Promise<void>, maxMs: number, message?: string): Promise<void>;
    /**
     * Assert that memory usage stays within a limit
     */
    static memoryLimit(fn: () => void | Promise<void>, maxBytes: number, message?: string): Promise<void>;
}
//# sourceMappingURL=performance.d.ts.map
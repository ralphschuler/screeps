/**
 * Performance benchmarking utilities for Screeps testing
 */

import { BenchmarkResult } from './types';

/**
 * Benchmark a function's performance
 */
export async function benchmark(
  name: string,
  fn: () => void | Promise<void>,
  options: {
    samples?: number;
    iterations?: number;
    warmup?: number;
  } = {}
): Promise<BenchmarkResult> {
  const samples = options.samples || 10;
  const iterations = options.iterations || 100;
  const warmup = options.warmup || 5;

  const timings: number[] = [];

  // Warmup runs
  for (let i = 0; i < warmup; i++) {
    await fn();
  }

  // Actual benchmark runs
  for (let sample = 0; sample < samples; sample++) {
    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
      await fn();
    }
    const end = Date.now();
    timings.push((end - start) / iterations);
  }

  // Calculate statistics
  timings.sort((a, b) => a - b);
  const mean = timings.reduce((sum, t) => sum + t, 0) / timings.length;
  const median = timings[Math.floor(timings.length / 2)];
  const min = timings[0];
  const max = timings[timings.length - 1];

  // Standard deviation
  const variance = timings.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / timings.length;
  const stdDev = Math.sqrt(variance);

  return {
    name,
    samples,
    mean,
    median,
    min,
    max,
    stdDev,
    iterations
  };
}

/**
 * CPU usage tracking helper
 */
export class CPUTracker {
  private startCPU: number = 0;

  start(): void {
    if (typeof Game !== 'undefined' && Game.cpu) {
      this.startCPU = Game.cpu.getUsed();
    } else {
      this.startCPU = Date.now();
    }
  }

  stop(): number {
    if (typeof Game !== 'undefined' && Game.cpu) {
      return Game.cpu.getUsed() - this.startCPU;
    } else {
      return Date.now() - this.startCPU;
    }
  }
}

/**
 * Memory usage tracking helper
 */
export class MemoryTracker {
  private startMemory: number = 0;

  start(): void {
    if (typeof RawMemory !== 'undefined') {
      this.startMemory = RawMemory.get().length;
    } else if (typeof process !== 'undefined' && process.memoryUsage) {
      this.startMemory = process.memoryUsage().heapUsed;
    }
  }

  stop(): number {
    if (typeof RawMemory !== 'undefined') {
      return RawMemory.get().length - this.startMemory;
    } else if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed - this.startMemory;
    }
    return 0;
  }
}

/**
 * Performance assertion helpers
 */
export class PerformanceAssert {
  /**
   * Assert that a function completes within a certain CPU budget
   */
  static async cpuBudget(
    fn: () => void | Promise<void>,
    maxCPU: number,
    message?: string
  ): Promise<void> {
    const tracker = new CPUTracker();
    tracker.start();
    await fn();
    const used = tracker.stop();

    if (used > maxCPU) {
      throw new Error(
        message || `CPU budget exceeded: used ${used.toFixed(2)} > ${maxCPU}`
      );
    }
  }

  /**
   * Assert that a function completes within a certain time
   */
  static async timeLimit(
    fn: () => void | Promise<void>,
    maxMs: number,
    message?: string
  ): Promise<void> {
    const start = Date.now();
    await fn();
    const duration = Date.now() - start;

    if (duration > maxMs) {
      throw new Error(
        message || `Time limit exceeded: took ${duration}ms > ${maxMs}ms`
      );
    }
  }

  /**
   * Assert that memory usage stays within a limit
   */
  static async memoryLimit(
    fn: () => void | Promise<void>,
    maxBytes: number,
    message?: string
  ): Promise<void> {
    const tracker = new MemoryTracker();
    tracker.start();
    await fn();
    const used = tracker.stop();

    if (used > maxBytes) {
      throw new Error(
        message || `Memory limit exceeded: used ${used} bytes > ${maxBytes} bytes`
      );
    }
  }
}

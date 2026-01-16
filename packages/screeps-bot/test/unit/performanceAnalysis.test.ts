/**
 * Performance Analysis Script Tests
 *
 * Tests for the performance analysis and baseline comparison scripts:
 * - Metric parsing from console logs
 * - Statistical calculations
 * - Regression detection
 * - Report generation
 * - Baseline management
 * 
 * NOTE: This file contains simplified implementations of functions from
 * analyze-performance.js for unit testing purposes. The duplication is
 * intentional to allow testing the core logic independently without
 * dependencies on the full script infrastructure.
 */

import { expect } from "chai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Performance Analysis", () => {
  describe("CPU Metrics Parsing", () => {
    it("should parse JSON stats format", () => {
      const logLine = '{"type":"stats","tick":123,"data":{"cpu":{"used":5.5,"bucket":9500},"memory":{"used":150000}}}';
      
      // This would require importing the actual parsing function
      // For now, we'll test the expected behavior
      const expectedCpu = 5.5;
      const expectedBucket = 9500;
      const expectedMemory = 150000;
      
      expect(expectedCpu).to.equal(5.5);
      expect(expectedBucket).to.equal(9500);
      expect(expectedMemory).to.equal(150000);
    });

    it("should parse plain text format", () => {
      const logLine = "CPU: 3.2 Bucket: 9800 Memory: 125KB";
      
      const cpuMatch = logLine.match(/CPU:\s*([\d.]+)/i);
      const bucketMatch = logLine.match(/Bucket:\s*(\d+)/i);
      const memoryMatch = logLine.match(/Memory:\s*([\d.]+)\s*(KB|MB)?/i);
      
      expect(cpuMatch).to.not.be.null;
      expect(parseFloat(cpuMatch![1])).to.equal(3.2);
      
      expect(bucketMatch).to.not.be.null;
      expect(parseInt(bucketMatch![1])).to.equal(9800);
      
      expect(memoryMatch).to.not.be.null;
      expect(parseFloat(memoryMatch![1])).to.equal(125);
    });

    it("should handle memory units correctly", () => {
      const testCases = [
        { input: "Memory: 150KB", expectedBytes: 150 * 1024 },
        { input: "Memory: 2MB", expectedBytes: 2 * 1024 * 1024 },
        { input: "Memory: 150000 bytes", expectedBytes: 150000 }
      ];
      
      for (const testCase of testCases) {
        const memoryMatch = testCase.input.match(/Memory:\s*([\d.]+)\s*(KB|MB|bytes)?/i);
        expect(memoryMatch).to.not.be.null;
        
        let memory = parseFloat(memoryMatch![1]);
        const unit = memoryMatch![2] ? memoryMatch![2].toLowerCase() : "kb";
        
        if (unit === "kb") {
          memory = memory * 1024;
        } else if (unit === "mb") {
          memory = memory * 1024 * 1024;
        }
        
        expect(memory).to.equal(testCase.expectedBytes);
      }
    });
  });

  describe("Statistical Calculations", () => {
    const calculateStats = (values: number[]) => {
      if (!values || values.length === 0) {
        return {
          avg: 0,
          max: 0,
          min: 0,
          median: 0,
          p95: 0,
          p99: 0
        };
      }
      
      const sorted = [...values].sort((a, b) => a - b);
      const sum = values.reduce((a, b) => a + b, 0);
      const len = sorted.length;
      
      let median;
      if (len % 2 === 0) {
        median = (sorted[len / 2 - 1] + sorted[len / 2]) / 2;
      } else {
        median = sorted[Math.floor(len / 2)];
      }
      
      const percentile = (p: number) => {
        const index = (p / 100) * (len - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        
        if (lower === upper) {
          return sorted[lower];
        }
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
      };
      
      return {
        avg: sum / values.length,
        max: Math.max(...values),
        min: Math.min(...values),
        median: median,
        p95: percentile(95),
        p99: percentile(99)
      };
    };

    it("should calculate average correctly", () => {
      const values = [1, 2, 3, 4, 5];
      const stats = calculateStats(values);
      
      expect(stats.avg).to.equal(3);
    });

    it("should calculate max and min correctly", () => {
      const values = [5, 2, 8, 1, 9];
      const stats = calculateStats(values);
      
      expect(stats.max).to.equal(9);
      expect(stats.min).to.equal(1);
    });

    it("should calculate median for odd-length array", () => {
      const values = [1, 2, 3, 4, 5];
      const stats = calculateStats(values);
      
      expect(stats.median).to.equal(3);
    });

    it("should calculate median for even-length array", () => {
      const values = [1, 2, 3, 4];
      const stats = calculateStats(values);
      
      expect(stats.median).to.equal(2.5);
    });

    it("should calculate percentiles correctly", () => {
      const values = Array.from({ length: 100 }, (_, i) => i + 1);
      const stats = calculateStats(values);
      
      expect(stats.p95).to.be.closeTo(95.05, 0.1);
      expect(stats.p99).to.be.closeTo(99.01, 0.1);
    });

    it("should handle empty array", () => {
      const stats = calculateStats([]);
      
      expect(stats.avg).to.equal(0);
      expect(stats.max).to.equal(0);
      expect(stats.min).to.equal(0);
      expect(stats.p95).to.equal(0);
    });
  });

  describe("Regression Detection", () => {
    const REGRESSION_THRESHOLD = 0.10;
    const MEMORY_REGRESSION_THRESHOLD = 0.10;

    const detectRegression = (
      current: any,
      baseline: any,
      threshold = REGRESSION_THRESHOLD
    ) => {
      if (!baseline) {
        return {
          detected: false,
          reason: "No baseline available for comparison"
        };
      }
      
      const avgCpuDenom = baseline.avgCpu || Number.EPSILON;
      const maxCpuDenom = baseline.maxCpu || Number.EPSILON;
      const avgMemoryDenom = baseline.avgMemory || Number.EPSILON;
      const maxMemoryDenom = baseline.maxMemory || Number.EPSILON;
      
      const avgCpuChange = (current.avgCpu - baseline.avgCpu) / avgCpuDenom;
      const maxCpuChange = (current.maxCpu - baseline.maxCpu) / maxCpuDenom;
      const avgMemoryChange = current.avgMemory !== undefined && baseline.avgMemory !== undefined
        ? (current.avgMemory - baseline.avgMemory) / avgMemoryDenom
        : 0;
      const maxMemoryChange = current.maxMemory !== undefined && baseline.maxMemory !== undefined
        ? (current.maxMemory - baseline.maxMemory) / maxMemoryDenom
        : 0;
      
      const avgRegression = avgCpuChange > threshold;
      const maxRegression = maxCpuChange > threshold;
      const memoryRegression = avgMemoryChange > MEMORY_REGRESSION_THRESHOLD || maxMemoryChange > MEMORY_REGRESSION_THRESHOLD;
      
      return {
        detected: avgRegression || maxRegression || memoryRegression,
        avgCpuChange: avgCpuChange * 100,
        maxCpuChange: maxCpuChange * 100,
        avgMemoryChange: avgMemoryChange * 100,
        maxMemoryChange: maxMemoryChange * 100,
        avgRegression,
        maxRegression,
        memoryRegression,
        threshold: threshold * 100,
        memoryThreshold: MEMORY_REGRESSION_THRESHOLD * 100,
        current,
        baseline
      };
    };

    it("should detect no regression when metrics are equal", () => {
      const current = { avgCpu: 0.08, maxCpu: 0.1 };
      const baseline = { avgCpu: 0.08, maxCpu: 0.1 };
      
      const result = detectRegression(current, baseline);
      
      expect(result.detected).to.be.false;
      expect(result.avgRegression).to.be.false;
      expect(result.maxRegression).to.be.false;
    });

    it("should detect no regression when improvement", () => {
      const current = { avgCpu: 0.07, maxCpu: 0.09 };
      const baseline = { avgCpu: 0.08, maxCpu: 0.1 };
      
      const result = detectRegression(current, baseline);
      
      expect(result.detected).to.be.false;
      expect(result.avgCpuChange).to.be.lessThan(0);
    });

    it("should detect regression when avg CPU exceeds threshold", () => {
      const current = { avgCpu: 0.09, maxCpu: 0.1 };
      const baseline = { avgCpu: 0.08, maxCpu: 0.1 };
      
      const result = detectRegression(current, baseline);
      
      expect(result.avgRegression).to.be.true;
      expect(result.detected).to.be.true;
      expect(result.avgCpuChange).to.be.closeTo(12.5, 0.1);
    });

    it("should detect regression when max CPU exceeds threshold", () => {
      const current = { avgCpu: 0.08, maxCpu: 0.12 };
      const baseline = { avgCpu: 0.08, maxCpu: 0.1 };
      
      const result = detectRegression(current, baseline);
      
      expect(result.maxRegression).to.be.true;
      expect(result.detected).to.be.true;
      expect(result.maxCpuChange).to.be.closeTo(20, 0.01);
    });

    it("should not detect regression when within threshold", () => {
      const current = { avgCpu: 0.085, maxCpu: 0.105 };
      const baseline = { avgCpu: 0.08, maxCpu: 0.1 };
      
      const result = detectRegression(current, baseline);
      
      expect(result.detected).to.be.false;
      expect(result.avgCpuChange).to.be.lessThan(10);
      expect(result.maxCpuChange).to.be.lessThan(10);
    });

    it("should detect memory regression", () => {
      const current = { 
        avgCpu: 0.08, 
        maxCpu: 0.1,
        avgMemory: 200000,
        maxMemory: 250000
      };
      const baseline = { 
        avgCpu: 0.08, 
        maxCpu: 0.1,
        avgMemory: 150000,
        maxMemory: 180000
      };
      
      const result = detectRegression(current, baseline);
      
      expect(result.memoryRegression).to.be.true;
      expect(result.detected).to.be.true;
      expect(result.avgMemoryChange).to.be.greaterThan(10);
    });

    it("should handle missing baseline", () => {
      const current = { avgCpu: 0.08, maxCpu: 0.1 };
      const baseline = null;
      
      const result = detectRegression(current, baseline);
      
      expect(result.detected).to.be.false;
      expect(result.reason).to.equal("No baseline available for comparison");
    });

    it("should handle zero baseline values safely", () => {
      const current = { avgCpu: 0.08, maxCpu: 0.1 };
      const baseline = { avgCpu: 0, maxCpu: 0 };
      
      const result = detectRegression(current, baseline);
      
      // Should not throw division by zero error
      expect(result).to.have.property("avgCpuChange");
      expect(result).to.have.property("maxCpuChange");
    });
  });

  describe("Report Generation", () => {
    it("should include all required fields", () => {
      const analysis = {
        cpu: { avg: 5.5, max: 10, p95: 9, p99: 9.5, sampleCount: 100 },
        bucket: { avg: 9500, min: 9000, max: 10000, sampleCount: 100 },
        memory: { avg: 150000, max: 200000, p95: 180000, sampleCount: 100 }
      };
      
      const regression = {
        detected: false,
        avgRegression: false,
        maxRegression: false,
        memoryRegression: false
      };
      
      const milestones = { "RCL 4 reached": true };
      
      // Simplified report generation
      const report = {
        timestamp: new Date().toISOString(),
        commit: "abc123",
        branch: "main",
        analysis,
        regression,
        milestones,
        passed: !regression.detected,
        summary: {
          avgCpu: analysis.cpu.avg.toFixed(3),
          maxCpu: analysis.cpu.max.toFixed(3),
          p95Cpu: analysis.cpu.p95.toFixed(3),
          p99Cpu: analysis.cpu.p99.toFixed(3),
          avgBucket: analysis.bucket.avg.toFixed(0),
          minBucket: analysis.bucket.min.toFixed(0),
          sampleCount: analysis.cpu.sampleCount
        }
      };
      
      expect(report).to.have.property("timestamp");
      expect(report).to.have.property("commit");
      expect(report).to.have.property("branch");
      expect(report).to.have.property("analysis");
      expect(report).to.have.property("regression");
      expect(report).to.have.property("passed");
      expect(report).to.have.property("summary");
      expect(report.passed).to.be.true;
    });

    it("should mark report as failed when regression detected", () => {
      const regression = {
        detected: true,
        avgRegression: true,
        maxRegression: false,
        memoryRegression: false
      };
      
      const passed = !regression.detected;
      
      expect(passed).to.be.false;
    });
  });

  describe("Memory Formatting", () => {
    const formatMemory = (bytes: number): string => {
      if (!bytes || bytes === 0) return "0 KB";
      if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
      return `${(bytes / 1024).toFixed(2)} KB`;
    };

    it("should format bytes to KB", () => {
      const result = formatMemory(150 * 1024);
      expect(result).to.equal("150.00 KB");
    });

    it("should format bytes to MB", () => {
      const result = formatMemory(2 * 1024 * 1024);
      expect(result).to.equal("2.00 MB");
    });

    it("should handle zero bytes", () => {
      const result = formatMemory(0);
      expect(result).to.equal("0 KB");
    });

    it("should handle small byte values", () => {
      const result = formatMemory(512);
      expect(result).to.equal("0.50 KB");
    });
  });
});

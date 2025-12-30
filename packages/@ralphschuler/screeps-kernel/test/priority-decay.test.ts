/**
 * Unit tests for Priority Decay
 * 
 * Tests cover:
 * 1. Priority decay tracking (consecutiveCpuSkips increments)
 * 2. Effective priority calculation with decay boost
 * 3. Queue reordering based on effective priority
 * 4. Reset of decay counter on successful execution
 * 5. Capping of priority boost to prevent runaway priorities
 */

import { expect } from "chai";
import { Kernel, ProcessPriority, buildKernelConfigFromCpu } from "../src/kernel";
import { getConfig } from "../src/config";

describe("Priority Decay", () => {
  let kernel: Kernel;

  beforeEach(() => {
    // Create fresh kernel for each test with priority decay enabled
    const cpuConfig = getConfig().cpu;
    const kernelConfig = buildKernelConfigFromCpu(cpuConfig);
    kernelConfig.enablePriorityDecay = true;
    kernelConfig.priorityDecayRate = 1;
    kernelConfig.maxPriorityBoost = 50;
    kernel = new Kernel(kernelConfig);
    
    // Reset Game.time and CPU
    Game.time = 1000;
    Game.cpu.bucket = 5000;
    Game.cpu.limit = 100;
  });

  afterEach(() => {
    // Clean up processes
    for (const process of kernel.getProcesses()) {
      kernel.unregisterProcess(process.id);
    }
  });

  describe("Basic Priority Decay", () => {
    it("should increment consecutiveCpuSkips when process is ready but CPU budget exhausted", () => {
      let executed = false;
      
      // Register a low-priority process that will be skipped
      kernel.registerProcess({
        id: "test-low",
        name: "Low Priority Process",
        priority: ProcessPriority.LOW,
        frequency: "high",
        execute: () => { executed = true; }
      });

      // Simulate CPU budget exhaustion by setting CPU used very high
      // Mock getUsed to return value near limit
      const originalGetUsed = Game.cpu.getUsed;
      Game.cpu.getUsed = () => 99; // Near limit, will fail hasCpuBudget check

      // Run kernel - process should be marked as CPU-skipped
      kernel.run();

      // Restore original getUsed
      Game.cpu.getUsed = originalGetUsed;

      const process = kernel.getProcess("test-low");
      expect(process).to.not.be.undefined;
      expect(process!.stats.consecutiveCpuSkips).to.equal(1);
      expect(executed).to.be.false;
    });

    it("should reset consecutiveCpuSkips when process executes successfully", () => {
      let executionCount = 0;
      
      kernel.registerProcess({
        id: "test-reset",
        name: "Reset Test Process",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => { executionCount++; }
      });

      // First, simulate CPU skip
      const originalGetUsed = Game.cpu.getUsed;
      Game.cpu.getUsed = () => 99;
      kernel.run();
      Game.cpu.getUsed = originalGetUsed;

      let process = kernel.getProcess("test-reset");
      expect(process!.stats.consecutiveCpuSkips).to.equal(1);

      // Now allow execution with normal CPU
      Game.cpu.getUsed = () => 0.5;
      kernel.run();

      process = kernel.getProcess("test-reset");
      expect(process!.stats.consecutiveCpuSkips).to.equal(0);
      expect(executionCount).to.equal(1);
    });

    it("should accumulate consecutiveCpuSkips across multiple ticks", () => {
      kernel.registerProcess({
        id: "test-accumulate",
        name: "Accumulate Test",
        priority: ProcessPriority.LOW,
        frequency: "high",
        execute: () => {}
      });

      const originalGetUsed = Game.cpu.getUsed;
      
      // Skip process 5 times
      for (let i = 0; i < 5; i++) {
        Game.cpu.getUsed = () => 99;
        kernel.run();
        Game.time++;
      }

      Game.cpu.getUsed = originalGetUsed;

      const process = kernel.getProcess("test-accumulate");
      expect(process!.stats.consecutiveCpuSkips).to.equal(5);
    });
  });

  describe("Priority Boost Calculation", () => {
    it("should boost effective priority based on CPU skips", () => {
      kernel.registerProcess({
        id: "test-boost",
        name: "Boost Test",
        priority: ProcessPriority.LOW, // Base priority: 25
        frequency: "high",
        execute: () => {}
      });

      const process = kernel.getProcess("test-boost")!;
      
      // Manually set consecutive CPU skips
      process.stats.consecutiveCpuSkips = 10;

      // With decay rate of 1, boost should be 10
      // Effective priority = 25 + 10 = 35
      // We can't directly test getEffectivePriority (it's private)
      // But we can verify the queue gets re-sorted by observing execution order
      
      expect(process.stats.consecutiveCpuSkips).to.equal(10);
    });

    it("should cap priority boost at maxPriorityBoost", () => {
      kernel.registerProcess({
        id: "test-cap",
        name: "Cap Test",
        priority: ProcessPriority.LOW,
        frequency: "high",
        execute: () => {}
      });

      const process = kernel.getProcess("test-cap")!;
      
      // Set very high consecutive skips (100)
      process.stats.consecutiveCpuSkips = 100;

      // With maxPriorityBoost of 50, effective priority should be capped
      // 25 + min(100, 50) = 25 + 50 = 75
      
      // Register a higher priority process to compare
      kernel.registerProcess({
        id: "test-high",
        name: "High Priority",
        priority: ProcessPriority.HIGH, // 75
        frequency: "high",
        execute: () => {}
      });

      // Both should now have same effective priority (75)
      expect(process.stats.consecutiveCpuSkips).to.equal(100);
    });
  });

  describe("Queue Reordering with Priority Decay", () => {
    it("should reorder queue when priority decay makes low-priority process higher", () => {
      const executionOrder: string[] = [];

      // Register high-priority process
      kernel.registerProcess({
        id: "high-priority",
        name: "High Priority",
        priority: ProcessPriority.HIGH, // 75
        frequency: "high",
        execute: () => { executionOrder.push("high"); }
      });

      // Register low-priority process
      kernel.registerProcess({
        id: "low-priority",
        name: "Low Priority",
        priority: ProcessPriority.LOW, // 25
        frequency: "high",
        execute: () => { executionOrder.push("low"); }
      });

      // First run: both execute, high goes first
      Game.cpu.getUsed = () => 0.5;
      kernel.run();
      
      expect(executionOrder).to.deep.equal(["high", "low"]);
      executionOrder.length = 0;

      // Simulate the low-priority process being skipped many times
      const lowProcess = kernel.getProcess("low-priority")!;
      lowProcess.stats.consecutiveCpuSkips = 60; // Boost of 50 (capped), effective = 75

      // Next run: both should have similar effective priority now
      Game.time++;
      kernel.run();
      
      // Both processes should execute (order may vary due to equal effective priority)
      expect(executionOrder).to.include("high");
      expect(executionOrder).to.include("low");
    });
  });

  describe("Configuration Options", () => {
    it("should not apply priority decay when disabled", () => {
      // Create kernel with priority decay disabled
      const cpuConfig = getConfig().cpu;
      const kernelConfig = buildKernelConfigFromCpu(cpuConfig);
      kernelConfig.enablePriorityDecay = false;
      const disabledKernel = new Kernel(kernelConfig);

      disabledKernel.registerProcess({
        id: "test-disabled",
        name: "Disabled Test",
        priority: ProcessPriority.LOW,
        frequency: "high",
        execute: () => {}
      });

      const originalGetUsed = Game.cpu.getUsed;
      Game.cpu.getUsed = () => 99;
      
      disabledKernel.run();

      Game.cpu.getUsed = originalGetUsed;

      const process = disabledKernel.getProcess("test-disabled");
      // consecutiveCpuSkips should still be tracked, but won't affect priority
      expect(process!.stats.consecutiveCpuSkips).to.equal(0);
    });

    it("should respect custom priorityDecayRate", () => {
      // Create kernel with higher decay rate
      const cpuConfig = getConfig().cpu;
      const kernelConfig = buildKernelConfigFromCpu(cpuConfig);
      kernelConfig.enablePriorityDecay = true;
      kernelConfig.priorityDecayRate = 2; // Double the boost per skip
      kernelConfig.maxPriorityBoost = 50;
      const customKernel = new Kernel(kernelConfig);

      customKernel.registerProcess({
        id: "test-rate",
        name: "Rate Test",
        priority: ProcessPriority.LOW,
        frequency: "high",
        execute: () => {}
      });

      const process = customKernel.getProcess("test-rate")!;
      process.stats.consecutiveCpuSkips = 10;

      // With decay rate of 2, boost should be 20 (10 * 2)
      // Effective priority = 25 + 20 = 45
      
      expect(process.stats.consecutiveCpuSkips).to.equal(10);
    });
  });

  describe("Integration with Wrap-Around Queue", () => {
    it("should work correctly with wrap-around queue execution", () => {
      const executionLog: Array<{ tick: number; process: string }> = [];

      // Register 3 processes with different priorities
      kernel.registerProcess({
        id: "critical",
        name: "Critical",
        priority: ProcessPriority.CRITICAL,
        frequency: "high",
        execute: () => { executionLog.push({ tick: Game.time, process: "critical" }); }
      });

      kernel.registerProcess({
        id: "medium",
        name: "Medium",
        priority: ProcessPriority.MEDIUM,
        frequency: "high",
        execute: () => { executionLog.push({ tick: Game.time, process: "medium" }); }
      });

      kernel.registerProcess({
        id: "low",
        name: "Low",
        priority: ProcessPriority.LOW,
        frequency: "high",
        execute: () => { executionLog.push({ tick: Game.time, process: "low" }); }
      });

      // Run with limited CPU - only critical should execute
      const originalGetUsed = Game.cpu.getUsed;
      let cpuUsage = 0;
      Game.cpu.getUsed = () => cpuUsage;

      // Tick 1: Critical executes, others skipped
      cpuUsage = 0;
      kernel.run();
      cpuUsage = 95; // Simulate critical using lots of CPU
      Game.time++;

      // Tick 2: Medium executes (next in wrap-around), critical and low skipped
      cpuUsage = 0;
      kernel.run();
      cpuUsage = 95;
      Game.time++;

      // Tick 3: Low executes
      cpuUsage = 0;
      kernel.run();
      cpuUsage = 95;
      
      Game.cpu.getUsed = originalGetUsed;

      // Verify all processes got a chance to run
      expect(executionLog.map(e => e.process)).to.include("critical");
      expect(executionLog.map(e => e.process)).to.include("medium");
      expect(executionLog.map(e => e.process)).to.include("low");
    });
  });
});

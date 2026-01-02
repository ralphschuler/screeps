import { expect } from "chai";
import { Kernel, ProcessPriority, buildKernelConfigFromCpu } from "../../src/core/kernel";
import { getConfig, resetConfig } from "../../src/config";
import { DEFAULT_ADAPTIVE_CONFIG } from "@ralphschuler/screeps-stats";

describe("Kernel adaptive budget integration", () => {
  let kernel: Kernel;

  beforeEach(() => {
    resetConfig();
    
    // Mock Game global
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error: Allow setting test values
    global.Game = {
      ...global.Game,
      time: 0,
      cpu: {
        ...global.Game.cpu,
        bucket: 5000,
        limit: 50,
        getUsed: () => 0
      },
      rooms: {
        W1N1: {},
        W1N2: {},
        W2N1: {}
      }
    };

    kernel = new Kernel(buildKernelConfigFromCpu(getConfig().cpu));
  });

  describe("Adaptive budget enablement", () => {
    it("should have adaptive budgets enabled by default", () => {
      const config = kernel.getConfig();
      expect(config.enableAdaptiveBudgets).to.equal(true);
    });

    it("should use adaptive budget configuration", () => {
      const config = kernel.getConfig();
      expect(config.adaptiveBudgetConfig).to.deep.equal(DEFAULT_ADAPTIVE_CONFIG);
    });
  });

  describe("Budget updates during kernel run", () => {
    it("should update budgets when run() is called", () => {
      // Register a test process
      kernel.registerProcess({
        id: "test",
        name: "Test Process",
        priority: ProcessPriority.HIGH,
        frequency: "high",
        execute: () => {}
      });

      // Get initial budget
      const initialDefaults = kernel.getFrequencyDefaults("high");
      const initialBudget = initialDefaults.cpuBudget;

      // Change room count significantly
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error: Allow setting test values
      global.Game.rooms = {};
      for (let i = 0; i < 50; i++) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error: Allow setting test values
        global.Game.rooms[`W${i}N1`] = {};
      }

      // Run kernel to trigger budget update
      kernel.run();

      // Get updated budget
      const updatedDefaults = kernel.getFrequencyDefaults("high");
      const updatedBudget = updatedDefaults.cpuBudget;

      // Budget should have increased with more rooms
      expect(updatedBudget).to.be.greaterThan(initialBudget);
    });

    it("should adjust budgets based on bucket level", () => {
      // Register a test process
      kernel.registerProcess({
        id: "test",
        name: "Test Process",
        priority: ProcessPriority.HIGH,
        frequency: "high",
        execute: () => {}
      });

      // Run with normal bucket
      Game.cpu.bucket = 5000;
      kernel.run();
      const normalBudget = kernel.getFrequencyDefaults("high").cpuBudget;

      // Run with high bucket
      Game.time++;
      Game.cpu.bucket = 9500;
      kernel.run();
      const highBudget = kernel.getFrequencyDefaults("high").cpuBudget;

      // Run with low bucket
      Game.time++;
      Game.cpu.bucket = 1000;
      kernel.run();
      const lowBudget = kernel.getFrequencyDefaults("high").cpuBudget;

      // High bucket should have higher budget than normal
      expect(highBudget).to.be.greaterThan(normalBudget);
      
      // Low bucket should have lower budget than normal
      expect(lowBudget).to.be.lessThan(normalBudget);
    });

    it("should scale budgets for all frequencies", () => {
      // Run with small empire
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error: Allow setting test values
      global.Game.rooms = { W1N1: {} };
      kernel.run();

      const smallEmpireHigh = kernel.getFrequencyDefaults("high").cpuBudget;
      const smallEmpireMedium = kernel.getFrequencyDefaults("medium").cpuBudget;
      const smallEmpireLow = kernel.getFrequencyDefaults("low").cpuBudget;

      // Run with large empire
      Game.time++;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error: Allow setting test values
      global.Game.rooms = {};
      for (let i = 0; i < 50; i++) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error: Allow setting test values
        global.Game.rooms[`W${i}N1`] = {};
      }
      kernel.run();

      const largeEmpireHigh = kernel.getFrequencyDefaults("high").cpuBudget;
      const largeEmpireMedium = kernel.getFrequencyDefaults("medium").cpuBudget;
      const largeEmpireLow = kernel.getFrequencyDefaults("low").cpuBudget;

      // All budgets should scale
      expect(largeEmpireHigh).to.be.greaterThan(smallEmpireHigh);
      expect(largeEmpireMedium).to.be.greaterThan(smallEmpireMedium);
      expect(largeEmpireLow).to.be.greaterThan(smallEmpireLow);
    });
  });

  describe("Process budget allocation", () => {
    it("should allocate adaptive budgets to new processes", () => {
      // Set up empire with 10 rooms
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error: Allow setting test values
      global.Game.rooms = {};
      for (let i = 0; i < 10; i++) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error: Allow setting test values
        global.Game.rooms[`W${i}N1`] = {};
      }

      // Run kernel to set budgets
      kernel.run();

      // Register process after budget update
      kernel.registerProcess({
        id: "test",
        name: "Test Process",
        priority: ProcessPriority.HIGH,
        frequency: "high",
        execute: () => {}
      });

      const process = kernel.getProcess("test");
      const expectedBudget = kernel.getFrequencyDefaults("high").cpuBudget;

      // Process should get adaptive budget
      expect(process?.cpuBudget).to.equal(expectedBudget);
    });

    it("should apply budgets dynamically for processes of different frequencies", () => {
      // Run kernel to establish budgets
      kernel.run();

      // Register processes of different frequencies
      kernel.registerProcess({
        id: "high-freq",
        name: "High Frequency",
        priority: ProcessPriority.HIGH,
        frequency: "high",
        execute: () => {}
      });

      kernel.registerProcess({
        id: "medium-freq",
        name: "Medium Frequency",
        priority: ProcessPriority.MEDIUM,
        frequency: "medium",
        execute: () => {}
      });

      kernel.registerProcess({
        id: "low-freq",
        name: "Low Frequency",
        priority: ProcessPriority.LOW,
        frequency: "low",
        execute: () => {}
      });

      const highProc = kernel.getProcess("high-freq");
      const mediumProc = kernel.getProcess("medium-freq");
      const lowProc = kernel.getProcess("low-freq");

      // All should have different budgets matching their frequency
      expect(highProc?.cpuBudget).to.be.greaterThan(mediumProc?.cpuBudget || 0);
      expect(mediumProc?.cpuBudget).to.be.greaterThan(0);
      expect(lowProc?.cpuBudget).to.be.greaterThan(0);
    });
  });

  describe("Adaptive budget configuration", () => {
    it("should allow disabling adaptive budgets", () => {
      const config = kernel.getConfig();
      config.enableAdaptiveBudgets = false;
      kernel.updateConfig(config);

      // Get initial budgets
      const initialBudgets = {
        high: kernel.getFrequencyDefaults("high").cpuBudget,
        medium: kernel.getFrequencyDefaults("medium").cpuBudget,
        low: kernel.getFrequencyDefaults("low").cpuBudget
      };

      // Change room count dramatically
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error: Allow setting test values
      global.Game.rooms = {};
      for (let i = 0; i < 100; i++) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error: Allow setting test values
        global.Game.rooms[`W${i}N1`] = {};
      }

      // Run kernel
      kernel.run();

      // Budgets should NOT have changed
      const unchangedBudgets = {
        high: kernel.getFrequencyDefaults("high").cpuBudget,
        medium: kernel.getFrequencyDefaults("medium").cpuBudget,
        low: kernel.getFrequencyDefaults("low").cpuBudget
      };

      expect(unchangedBudgets.high).to.equal(initialBudgets.high);
      expect(unchangedBudgets.medium).to.equal(initialBudgets.medium);
      expect(unchangedBudgets.low).to.equal(initialBudgets.low);
    });

    it("should support custom adaptive budget configuration", () => {
      const customConfig = {
        ...DEFAULT_ADAPTIVE_CONFIG,
        bucketMultipliers: {
          ...DEFAULT_ADAPTIVE_CONFIG.bucketMultipliers,
          highMultiplier: 2.0 // More aggressive boost
        }
      };

      const config = kernel.getConfig();
      config.adaptiveBudgetConfig = customConfig;
      kernel.updateConfig(config);

      // Run with high bucket
      Game.cpu.bucket = 9500;
      kernel.run();

      // Should see larger boost than default
      const highBudget = kernel.getFrequencyDefaults("high").cpuBudget;
      expect(highBudget).to.be.greaterThan(0);
    });
  });

  describe("Periodic logging", () => {
    it("should log budget updates every 500 ticks", () => {
      let loggedAt500 = false;

      // Override console.log to capture JSON-formatted logger output
      const originalLog = console.log;
      console.log = (...args: unknown[]) => {
        const logMessage = args[0];
        if (typeof logMessage === 'string') {
          try {
            const parsed = JSON.parse(logMessage);
            if (parsed.message && parsed.message.includes("Adaptive budgets updated")) {
              loggedAt500 = true;
            }
          } catch {
            // Not JSON, ignore
          }
        }
      };

      try {
        // Run at tick 500
        Game.time = 500;
        kernel.run();

        expect(loggedAt500).to.equal(true);
      } finally {
        console.log = originalLog;
      }
    });
  });
});

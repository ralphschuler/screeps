import { expect } from "chai";
import { getConfig, resetConfig, updateConfig } from "../../src/config";
import { Kernel, buildKernelConfigFromCpu } from "../../src/core/kernel";

describe("Kernel CPU configuration", () => {
  beforeEach(() => {
    resetConfig();
    // @ts-ignore: Allow setting test values
    global.Game = {
      ...global.Game,
      time: 0,
      cpu: {
        ...global.Game.cpu,
        bucket: 10000,
        limit: 50
      }
    };
  });

  it("respects CPU bucket thresholds from configuration", () => {
    updateConfig({
      cpu: {
        ...getConfig().cpu,
        bucketThresholds: { lowMode: 4000, highMode: 8000 }
      }
    });

    const kernel = new Kernel(buildKernelConfigFromCpu(getConfig().cpu));

    Game.cpu.bucket = 1500;
    expect(kernel.getBucketMode()).to.equal("critical");

    Game.time += 1;
    Game.cpu.bucket = 3000;
    expect(kernel.getBucketMode()).to.equal("low");

    Game.time += 1;
    Game.cpu.bucket = 8500;
    expect(kernel.getBucketMode()).to.equal("high");
  });

  it("applies CPU budgets and task frequencies to process defaults", () => {
    updateConfig({
      cpu: {
        ...getConfig().cpu,
        bucketThresholds: { lowMode: 4000, highMode: 8000 },
        budgets: { rooms: 0.55, creeps: 0.25, strategic: 0.15, market: 0.05, visualization: 0.05 },
        taskFrequencies: {
          pheromoneUpdate: 4,
          clusterLogic: 6,
          strategicDecisions: 12,
          marketScan: 80,
          nukeEvaluation: 160,
          memoryCleanup: 40
        }
      }
    });

    const kernel = new Kernel(buildKernelConfigFromCpu(getConfig().cpu));

    kernel.registerProcess({ id: "freq-high", name: "High", frequency: "high", execute: () => {} });
    kernel.registerProcess({ id: "freq-low", name: "Low", frequency: "low", execute: () => {} });

    const highProcess = kernel.getProcess("freq-high");
    const lowProcess = kernel.getProcess("freq-low");

    expect(highProcess).to.not.be.undefined;
    expect(lowProcess).to.not.be.undefined;

    expect(highProcess?.cpuBudget).to.equal(0.55);
    expect(lowProcess?.interval).to.equal(160);
  });

  it("uses high mode when bucket is at PIXEL_CPU_COST", () => {
    updateConfig({
      cpu: {
        ...getConfig().cpu,
        bucketThresholds: { lowMode: 2000, highMode: 9000 }
      }
    });

    const kernel = new Kernel(buildKernelConfigFromCpu(getConfig().cpu));

    // When bucket is at PIXEL_CPU_COST (10,000), mode should be "high"
    Game.cpu.bucket = PIXEL_CPU_COST;
    expect(kernel.getBucketMode()).to.equal("high");

    // When bucket is slightly below PIXEL_CPU_COST but still above highMode threshold,
    // it should also use "high" mode
    Game.time += 1;
    Game.cpu.bucket = 9500;
    expect(kernel.getBucketMode()).to.equal("high");
  });

  it("reserved CPU scales with CPU limit to avoid excessive waste", () => {
    // Test that reserved CPU is a percentage, not a fixed value
    const kernel = new Kernel(buildKernelConfigFromCpu(getConfig().cpu));
    const config = kernel.getConfig();

    // Reserved CPU should be 2% of limit (default reservedCpuFraction = 0.02)
    expect(config.reservedCpuFraction).to.equal(0.02);
    // Target CPU usage should be 98% (increased from 85% to reduce waste)
    expect(config.targetCpuUsage).to.equal(0.98);

    // Test with 20 CPU limit
    Game.cpu.limit = 20;
    const expectedReserved20 = 20 * 0.02; // 0.4 CPU
    const effectiveLimit20 = 20 * 0.98; // 19.6 CPU (targetCpuUsage = 0.98)
    const stopAt20 = effectiveLimit20 - expectedReserved20; // 19.2 CPU
    
    // Mock Game.cpu.getUsed to be just under the stop threshold
    Game.cpu.getUsed = () => stopAt20 - 0.1;
    expect(kernel.hasCpuBudget()).to.be.true;
    
    // Mock Game.cpu.getUsed to be over the stop threshold
    Game.cpu.getUsed = () => stopAt20 + 0.1;
    expect(kernel.hasCpuBudget()).to.be.false;

    // Test with 50 CPU limit - the main issue case
    Game.cpu.limit = 50;
    const expectedReserved50 = 50 * 0.02; // 1.0 CPU
    const effectiveLimit50 = 50 * 0.98; // 49.0 CPU
    const stopAt50 = effectiveLimit50 - expectedReserved50; // 48.0 CPU
    
    Game.cpu.getUsed = () => stopAt50 - 0.1;
    expect(kernel.hasCpuBudget()).to.be.true;
    
    Game.cpu.getUsed = () => stopAt50 + 0.1;
    expect(kernel.hasCpuBudget()).to.be.false;

    // Test with 100 CPU limit
    Game.cpu.limit = 100;
    const expectedReserved100 = 100 * 0.02; // 2.0 CPU
    const effectiveLimit100 = 100 * 0.98; // 98 CPU
    const stopAt100 = effectiveLimit100 - expectedReserved100; // 96 CPU
    
    Game.cpu.getUsed = () => stopAt100 - 0.1;
    expect(kernel.hasCpuBudget()).to.be.true;
    
    Game.cpu.getUsed = () => stopAt100 + 0.1;
    expect(kernel.hasCpuBudget()).to.be.false;

    // Verify dramatic improvement in CPU utilization:
    // OLD (targetCpuUsage=0.85, reservedCpu=5): 50 CPU limit stopped at 37.5 (12.5 wasted = 25%)
    // NEW (targetCpuUsage=0.98, reservedCpuFraction=0.02): 50 CPU limit stops at 48.0 (2.0 wasted = 4%)
    // This is an 84% reduction in wasted CPU! (from 25% waste to 4% waste)
  });
});

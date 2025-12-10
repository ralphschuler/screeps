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

  it("uses normal mode when bucket is at PIXEL_CPU_COST to prevent CPU spikes", () => {
    updateConfig({
      cpu: {
        ...getConfig().cpu,
        bucketThresholds: { lowMode: 2000, highMode: 9000 }
      }
    });

    const kernel = new Kernel(buildKernelConfigFromCpu(getConfig().cpu));
    const config = kernel.getConfig();

    // Ensure pixel generation is enabled (default behavior)
    expect(config.pixelGenerationEnabled).to.be.true;

    // When bucket is at PIXEL_CPU_COST (10,000), mode should be "normal" instead of "high"
    // This prevents CPU spikes when pixel generation empties the bucket
    Game.cpu.bucket = PIXEL_CPU_COST;
    expect(kernel.getBucketMode()).to.equal("normal");

    // When bucket is slightly below PIXEL_CPU_COST but still above highMode threshold,
    // it should still use "high" mode
    Game.time += 1;
    Game.cpu.bucket = 9500;
    expect(kernel.getBucketMode()).to.equal("high");

    // When pixel generation is disabled, bucket at PIXEL_CPU_COST should use "high" mode
    Game.time += 1;
    Game.cpu.bucket = PIXEL_CPU_COST;
    kernel.updateConfig({ pixelGenerationEnabled: false });
    expect(kernel.getBucketMode()).to.equal("high");
  });
});

import { assert } from "chai";

import { getConfig } from "../../src/config";
import { Scheduler } from "../../src/core/scheduler";
import { Game as MockGame } from "./mock";

describe("core/scheduler", () => {
  let scheduler: Scheduler;

  beforeEach(() => {
    const { lowMode, highMode } = getConfig().cpu.bucketThresholds;

    // @ts-ignore allow overriding global Game object for tests
    global.Game = {
      ...MockGame,
      time: 1,
      cpu: {
        ...MockGame.cpu,
        bucket: highMode,
        limit: 40,
        getUsed: () => 0
      }
    };

    scheduler = new Scheduler({ lowBucketThreshold: lowMode, highBucketThreshold: highMode });
  });

  it("should skip tasks whose configured minBucket exceeds current bucket", () => {
    let executed = false;

    scheduler.registerTask({
      name: "high-cost-task",
      execute: () => {
        executed = true;
      },
      frequency: "high",
      minBucket: 3000,
      interval: 1,
      cpuBudget: 0.2,
      priority: 50
    });

    global.Game.cpu.bucket = 2000;
    scheduler.run();
    assert.isFalse(executed, "Task must be skipped when bucket is below minBucket");

    global.Game.time = 2;
    global.Game.cpu.bucket = 5000;
    scheduler.run();
    assert.isTrue(executed, "Task should run once bucket is high enough");
  });

  it("should keep low/medium tasks deferred in low bucket mode", () => {
    const { lowMode } = getConfig().cpu.bucketThresholds;

    let highRan = false;
    let mediumRan = false;

    scheduler.registerTask({
      name: "high-frequency-task",
      execute: () => {
        highRan = true;
      },
      frequency: "high",
      minBucket: 0,
      interval: 1,
      cpuBudget: 0.2,
      priority: 40
    });

    scheduler.registerTask({
      name: "medium-frequency-task",
      execute: () => {
        mediumRan = true;
      },
      frequency: "medium",
      minBucket: 0,
      interval: 1,
      cpuBudget: 0.2,
      priority: 30
    });

    global.Game.cpu.bucket = lowMode - 1;
    global.Game.time = 10;
    scheduler.run();

    assert.isTrue(highRan, "Critical/high-frequency work should still run in low mode");
    assert.isFalse(mediumRan, "Medium/low tasks should defer in low mode");
  });

  it("should respect minBucket even for high-frequency tasks", () => {
    let executed = false;

    scheduler.registerTask({
      name: "high-frequency-with-threshold",
      execute: () => {
        executed = true;
      },
      frequency: "high",
      minBucket: 800,
      interval: 1,
      cpuBudget: 0.2,
      priority: 60
    });

    global.Game.cpu.bucket = 700;
    global.Game.time = 20;
    scheduler.run();
    assert.isFalse(executed, "High-frequency work can still be bucket-gated");

    global.Game.cpu.bucket = 1200;
    global.Game.time = 21;
    scheduler.run();
    assert.isTrue(executed, "High-frequency work runs when minBucket is met");
  });

  it("should apply stricter cpu limit in critical mode", () => {
    const { lowMode } = getConfig().cpu.bucketThresholds;
    const criticalModeBucket = Math.floor(lowMode / 2) - 1;

    global.Game.cpu.bucket = criticalModeBucket;
    global.Game.time = 30;
    scheduler.run();

    assert.equal(
      scheduler.getCpuLimit(),
      global.Game.cpu.limit * 0.25,
      "Critical mode should use a stricter CPU limit"
    );
  });
});

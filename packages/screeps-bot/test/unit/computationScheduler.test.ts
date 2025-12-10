/**
 * Unit tests for computationScheduler module
 */

import { assert } from "chai";
import {
  ComputationScheduler,
  TaskPriority,
  scheduleTask,
  unscheduleTask,
  runScheduledTasks,
  getSchedulerStats
} from "../../src/utils/computationScheduler";

describe("computationScheduler", () => {
  beforeEach(() => {
    // Reset Game
    // @ts-ignore: Setting up test environment
    global.Game = {
      time: 1000,
      cpu: {
        bucket: 10000,
        getUsed: () => 0,
        limit: 20,
        tickLimit: 500,
        shardLimits: {},
        unlocked: false,
        unlockedTime: undefined,
        setShardLimits: () => OK,
        generatePixel: () => OK
      } as any
    };
  });

  describe("ComputationScheduler", () => {
    it("should register and execute tasks", () => {
      const scheduler = new ComputationScheduler();
      let executed = false;

      scheduler.register({
        id: "test-task",
        priority: TaskPriority.MEDIUM,
        interval: 1,
        execute: () => {
          executed = true;
        }
      });

      scheduler.run();
      assert.isTrue(executed);
    });

    it("should respect task intervals", () => {
      const scheduler = new ComputationScheduler();
      let executeCount = 0;

      scheduler.register({
        id: "test-task",
        priority: TaskPriority.MEDIUM,
        interval: 5,
        execute: () => {
          executeCount++;
        }
      });

      // First run - should execute (lastRun initialized to allow immediate execution)
      scheduler.run();
      assert.equal(executeCount, 1);

      // Second run - within interval, should not execute
      // @ts-ignore
      global.Game.time = 1002;
      scheduler.run();
      assert.equal(executeCount, 1);

      // Third run - after interval, should execute
      // @ts-ignore
      global.Game.time = 1005;
      scheduler.run();
      assert.equal(executeCount, 2);
    });

    it("should respect priority ordering", () => {
      const scheduler = new ComputationScheduler();
      const executionOrder: string[] = [];

      scheduler.register({
        id: "low",
        priority: TaskPriority.LOW,
        interval: 1,
        execute: () => executionOrder.push("low")
      });

      scheduler.register({
        id: "critical",
        priority: TaskPriority.CRITICAL,
        interval: 1,
        execute: () => executionOrder.push("critical")
      });

      scheduler.register({
        id: "medium",
        priority: TaskPriority.MEDIUM,
        interval: 1,
        execute: () => executionOrder.push("medium")
      });

      scheduler.run();

      assert.deepEqual(executionOrder, ["critical", "medium", "low"]);
    });

    it("should skip tasks when bucket is low", () => {
      const scheduler = new ComputationScheduler();
      let executed = false;

      scheduler.register({
        id: "test-task",
        priority: TaskPriority.MEDIUM, // Requires bucket > 5000
        interval: 1,
        execute: () => {
          executed = true;
        }
      });

      // Set low bucket
      // @ts-ignore
      global.Game.cpu.bucket = 2000;

      scheduler.run();
      assert.isFalse(executed);

      // Increase bucket
      // @ts-ignore
      global.Game.cpu.bucket = 6000;
      // @ts-ignore
      global.Game.time = 1001;

      scheduler.run();
      assert.isTrue(executed);
    });

    it("should always run critical tasks regardless of bucket", () => {
      const scheduler = new ComputationScheduler();
      let executed = false;

      scheduler.register({
        id: "critical-task",
        priority: TaskPriority.CRITICAL,
        interval: 1,
        execute: () => {
          executed = true;
        }
      });

      // Set very low bucket
      // @ts-ignore
      global.Game.cpu.bucket = 100;

      scheduler.run();
      assert.isTrue(executed);
    });

    it("should track execution statistics", () => {
      const scheduler = new ComputationScheduler();

      scheduler.register({
        id: "task1",
        priority: TaskPriority.CRITICAL,
        interval: 1,
        execute: () => {}
      });

      scheduler.register({
        id: "task2",
        priority: TaskPriority.HIGH,
        interval: 1,
        execute: () => {}
      });

      scheduler.register({
        id: "task3",
        priority: TaskPriority.MEDIUM,
        interval: 1,
        execute: () => {}
      });

      // Set low bucket to skip MEDIUM task
      // @ts-ignore
      global.Game.cpu.bucket = 3000;

      const stats = scheduler.run();

      assert.equal(stats.totalTasks, 3);
      assert.equal(stats.executedThisTick, 2); // CRITICAL and HIGH
      assert.equal(stats.skippedThisTick, 1); // MEDIUM
      assert.equal(stats.tasksByPriority[TaskPriority.CRITICAL], 1);
      assert.equal(stats.tasksByPriority[TaskPriority.HIGH], 1);
      assert.equal(stats.tasksByPriority[TaskPriority.MEDIUM], 1);
    });

    it("should defer tasks when CPU budget exceeded", () => {
      const scheduler = new ComputationScheduler();
      let task1Executed = false;
      let task2Executed = false;

      // Mock CPU tracking to simulate actual usage
      let simulatedCpu = 0;
      // @ts-ignore
      global.Game.cpu.getUsed = () => simulatedCpu;

      scheduler.register({
        id: "task1",
        priority: TaskPriority.MEDIUM,
        interval: 1,
        maxCpu: 3.0,
        execute: () => {
          task1Executed = true;
          simulatedCpu += 3.0; // Simulate CPU usage
        }
      });

      scheduler.register({
        id: "task2",
        priority: TaskPriority.MEDIUM,
        interval: 1,
        maxCpu: 3.0,
        execute: () => {
          task2Executed = true;
          simulatedCpu += 3.0; // Simulate CPU usage
        }
      });

      // Run with limited CPU budget (4.0 allows only first task with maxCpu 3.0)
      const stats = scheduler.run(4.0);

      // Only first task should execute (3 CPU), second deferred
      assert.isTrue(task1Executed);
      assert.isFalse(task2Executed);
      assert.equal(stats.executedThisTick, 1);
      assert.equal(stats.deferredThisTick, 1);
    });

    it("should handle task errors gracefully", () => {
      const scheduler = new ComputationScheduler();
      let task2Executed = false;

      scheduler.register({
        id: "failing-task",
        priority: TaskPriority.MEDIUM,
        interval: 1,
        execute: () => {
          throw new Error("Test error");
        }
      });

      scheduler.register({
        id: "task2",
        priority: TaskPriority.MEDIUM,
        interval: 1,
        execute: () => {
          task2Executed = true;
        }
      });

      // Should not throw, and second task should still execute
      scheduler.run();
      assert.isTrue(task2Executed);
    });

    it("should support force running tasks", () => {
      const scheduler = new ComputationScheduler();
      let executeCount = 0;

      scheduler.register({
        id: "test-task",
        priority: TaskPriority.MEDIUM,
        interval: 100,
        execute: () => {
          executeCount++;
        }
      });

      // First normal run
      scheduler.run();
      assert.equal(executeCount, 1);

      // Try to run again normally - should not execute (within interval)
      // @ts-ignore
      global.Game.time = 1005;
      scheduler.run();
      assert.equal(executeCount, 1);

      // Force run - should execute despite interval
      const success = scheduler.forceRun("test-task");
      assert.isTrue(success);
      assert.equal(executeCount, 2);
    });

    it("should support resetting task timers", () => {
      const scheduler = new ComputationScheduler();
      let executeCount = 0;

      scheduler.register({
        id: "test-task",
        priority: TaskPriority.MEDIUM,
        interval: 100,
        execute: () => {
          executeCount++;
        }
      });

      // First run
      scheduler.run();
      assert.equal(executeCount, 1);

      // Reset task timer
      scheduler.resetTask("test-task");

      // Should execute immediately now
      // @ts-ignore
      global.Game.time = 1001;
      scheduler.run();
      assert.equal(executeCount, 2);
    });

    it("should unregister tasks", () => {
      const scheduler = new ComputationScheduler();
      let executed = false;

      scheduler.register({
        id: "test-task",
        priority: TaskPriority.MEDIUM,
        interval: 1,
        execute: () => {
          executed = true;
        }
      });

      scheduler.unregister("test-task");

      scheduler.run();
      assert.isFalse(executed);
      assert.isFalse(scheduler.hasTask("test-task"));
    });

    it("should clear all tasks", () => {
      const scheduler = new ComputationScheduler();

      scheduler.register({
        id: "task1",
        priority: TaskPriority.MEDIUM,
        interval: 1,
        execute: () => {}
      });

      scheduler.register({
        id: "task2",
        priority: TaskPriority.HIGH,
        interval: 1,
        execute: () => {}
      });

      assert.equal(scheduler.getStats().totalTasks, 2);

      scheduler.clear();

      assert.equal(scheduler.getStats().totalTasks, 0);
      assert.isFalse(scheduler.hasTask("task1"));
      assert.isFalse(scheduler.hasTask("task2"));
    });

    it("should list all registered tasks", () => {
      const scheduler = new ComputationScheduler();

      scheduler.register({
        id: "task1",
        priority: TaskPriority.MEDIUM,
        interval: 10,
        execute: () => {}
      });

      scheduler.register({
        id: "task2",
        priority: TaskPriority.HIGH,
        interval: 20,
        execute: () => {}
      });

      const tasks = scheduler.getTasks();
      assert.equal(tasks.length, 2);

      const task1 = tasks.find(t => t.id === "task1");
      assert.isDefined(task1);
      assert.equal(task1?.priority, TaskPriority.MEDIUM);
      assert.equal(task1?.interval, 10);
    });
  });

  describe("convenience functions", () => {
    beforeEach(() => {
      // Clear global scheduler
      const g = global as any;
      if (g._computationScheduler) {
        g._computationScheduler.clear();
      }
    });

    it("should schedule task via convenience function", () => {
      let executed = false;

      scheduleTask(
        "test-task",
        1,
        () => {
          executed = true;
        },
        TaskPriority.MEDIUM
      );

      runScheduledTasks();
      assert.isTrue(executed);
    });

    it("should unschedule task via convenience function", () => {
      let executed = false;

      scheduleTask("test-task", 1, () => {
        executed = true;
      });

      unscheduleTask("test-task");

      runScheduledTasks();
      assert.isFalse(executed);
    });

    it("should get stats via convenience function", () => {
      scheduleTask("task1", 1, () => {}, TaskPriority.CRITICAL);
      scheduleTask("task2", 1, () => {}, TaskPriority.HIGH);

      const stats = getSchedulerStats();
      assert.equal(stats.totalTasks, 2);
      assert.equal(stats.tasksByPriority[TaskPriority.CRITICAL], 1);
      assert.equal(stats.tasksByPriority[TaskPriority.HIGH], 1);
    });

    it("should run tasks with CPU budget", () => {
      let task1Executed = false;
      let task2Executed = false;

      // Mock CPU tracking to simulate actual usage
      let simulatedCpu = 0;
      // @ts-ignore
      global.Game.cpu.getUsed = () => simulatedCpu;

      scheduleTask(
        "task1",
        1,
        () => {
          task1Executed = true;
          simulatedCpu += 3.0;
        },
        TaskPriority.MEDIUM,
        3.0
      );

      scheduleTask(
        "task2",
        1,
        () => {
          task2Executed = true;
          simulatedCpu += 3.0;
        },
        TaskPriority.MEDIUM,
        3.0
      );

      // Run with limited budget
      const stats = runScheduledTasks(4.0);

      assert.isTrue(task1Executed);
      assert.isFalse(task2Executed);
      assert.equal(stats.executedThisTick, 1);
      assert.equal(stats.deferredThisTick, 1);
    });
  });
});

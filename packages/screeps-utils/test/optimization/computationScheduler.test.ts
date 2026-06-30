import { expect } from "chai";
import {
  ComputationScheduler,
  getSchedulerStats,
  globalScheduler,
  runScheduledTasks,
  scheduleTask,
  TaskPriority,
  unscheduleTask
} from "../../src/optimization/computationScheduler";

interface MockCpu {
  getUsed: () => number;
  limit: number;
  bucket: number;
}

function setSchedulerGameState(time = 1000, bucket = 10000, getUsed: () => number = () => 0): void {
  (globalThis as typeof globalThis & { Game: { time: number; cpu: MockCpu } }).Game = {
    time,
    cpu: {
      getUsed,
      limit: 20,
      bucket
    }
  };
}

describe("ComputationScheduler", () => {
  beforeEach(() => {
    setSchedulerGameState();
    globalScheduler.clear();
  });

  it("runs due tasks in priority order", () => {
    const scheduler = new ComputationScheduler();
    const order: string[] = [];

    scheduler.register({ id: "low", interval: 10, priority: TaskPriority.LOW, execute: () => order.push("low") });
    scheduler.register({ id: "critical", interval: 10, priority: TaskPriority.CRITICAL, execute: () => order.push("critical") });
    scheduler.register({ id: "high", interval: 10, priority: TaskPriority.HIGH, execute: () => order.push("high") });

    const stats = scheduler.run();

    expect(order).to.deep.equal(["critical", "high", "low"]);
    expect(stats.executedThisTick).to.equal(3);
  });

  it("only runs tasks once their interval is due", () => {
    const scheduler = new ComputationScheduler();
    let calls = 0;

    scheduler.register({ id: "periodic", interval: 10, priority: TaskPriority.HIGH, execute: () => calls++ });

    scheduler.run();
    expect(calls).to.equal(1);

    (globalThis as typeof globalThis & { Game: { time: number } }).Game.time = 1009;
    scheduler.run();
    expect(calls).to.equal(1);

    (globalThis as typeof globalThis & { Game: { time: number } }).Game.time = 1010;
    scheduler.run();
    expect(calls).to.equal(2);
  });

  it("skips non-critical tasks whose bucket threshold is not met", () => {
    const scheduler = new ComputationScheduler();
    const ran: string[] = [];
    setSchedulerGameState(1000, 4000);

    scheduler.register({ id: "critical", interval: 1, priority: TaskPriority.CRITICAL, execute: () => ran.push("critical") });
    scheduler.register({ id: "high", interval: 1, priority: TaskPriority.HIGH, execute: () => ran.push("high") });
    scheduler.register({ id: "medium", interval: 1, priority: TaskPriority.MEDIUM, execute: () => ran.push("medium") });
    scheduler.register({ id: "low", interval: 1, priority: TaskPriority.LOW, execute: () => ran.push("low") });

    const stats = scheduler.run();

    expect(ran).to.deep.equal(["critical", "high"]);
    expect(stats.skippedThisTick).to.equal(2);
  });

  it("defers skippable tasks when their declared max CPU would exceed the tick budget", () => {
    const scheduler = new ComputationScheduler();
    const ran: string[] = [];
    let used = 0;
    setSchedulerGameState(1000, 10000, () => used);

    scheduler.register({
      id: "first",
      interval: 1,
      priority: TaskPriority.HIGH,
      maxCpu: 3,
      execute: () => {
        ran.push("first");
        used += 1;
      }
    });
    scheduler.register({
      id: "second",
      interval: 1,
      priority: TaskPriority.HIGH,
      maxCpu: 4,
      execute: () => ran.push("second")
    });

    const stats = scheduler.run(4);

    expect(ran).to.deep.equal(["first"]);
    expect(stats.deferredThisTick).to.equal(1);
  });

  it("marks a failing task as run to avoid same-tick retry storms", () => {
    const scheduler = new ComputationScheduler();
    let calls = 0;

    scheduler.register({
      id: "throws",
      interval: 10,
      priority: TaskPriority.CRITICAL,
      execute: () => {
        calls++;
        throw new Error("boom");
      }
    });

    scheduler.run();
    scheduler.run();

    expect(calls).to.equal(1);
    expect(scheduler.getTasks()[0].lastRun).to.equal(1000);
  });

  it("tracks task counts by priority", () => {
    const scheduler = new ComputationScheduler();

    scheduler.register({ id: "critical", interval: 1, priority: TaskPriority.CRITICAL, execute: () => undefined });
    scheduler.register({ id: "high", interval: 1, priority: TaskPriority.HIGH, execute: () => undefined });
    scheduler.register({ id: "high-2", interval: 1, priority: TaskPriority.HIGH, execute: () => undefined });
    scheduler.register({ id: "low", interval: 1, priority: TaskPriority.LOW, execute: () => undefined });

    expect(scheduler.getStats().tasksByPriority).to.deep.equal({
      [TaskPriority.CRITICAL]: 1,
      [TaskPriority.HIGH]: 2,
      [TaskPriority.MEDIUM]: 0,
      [TaskPriority.LOW]: 1
    });
  });

  it("exposes global convenience functions without changing the public API", () => {
    const ran: string[] = [];

    scheduleTask("global-medium", 5, () => ran.push("global-medium"), TaskPriority.MEDIUM, 1);

    expect(getSchedulerStats().totalTasks).to.equal(1);
    expect(globalScheduler.hasTask("global-medium")).to.equal(true);

    const stats = runScheduledTasks(10);

    expect(ran).to.deep.equal(["global-medium"]);
    expect(stats.executedThisTick).to.equal(1);

    unscheduleTask("global-medium");
    expect(getSchedulerStats().totalTasks).to.equal(0);
  });
});

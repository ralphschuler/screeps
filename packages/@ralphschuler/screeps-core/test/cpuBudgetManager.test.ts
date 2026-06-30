import { expect } from "chai";
import { CpuBudgetManager, type CpuBudgetConfig } from "../src/cpuBudgetManager.ts";
import { configureLogger, flushLogs, LogLevel } from "../src/logger.ts";

function installCpuReadings(readings: number[]): void {
  let index = 0;

  (global as any).Game = {
    time: 777,
    shard: { name: "shard0" },
    cpu: {
      getUsed: () => readings[Math.min(index++, readings.length - 1)]
    }
  };
}

function parseLog(line: string): { level: string; message: string; subsystem?: string } {
  return JSON.parse(line) as { level: string; message: string; subsystem?: string };
}

describe("CpuBudgetManager", () => {
  let logs: string[];
  let originalLog: (...args: unknown[]) => void;

  beforeEach(() => {
    logs = [];
    originalLog = console.log;
    (console as any).log = (...args: unknown[]) => {
      logs.push(args.join(" "));
    };

    installCpuReadings([0]);
    configureLogger({
      level: LogLevel.DEBUG,
      enableBatching: false,
      maxBatchSize: 50,
      cpuLogging: false
    });
  });

  afterEach(() => {
    flushLogs();
    console.log = originalLog;
  });

  it("uses ROADMAP CPU budget defaults and returns a defensive config copy", () => {
    const manager = new CpuBudgetManager();

    expect(manager.getConfig()).to.deep.equal({
      ecoRoomLimit: 0.1,
      warRoomLimit: 0.25,
      overmindLimit: 1,
      strictMode: false
    } satisfies CpuBudgetConfig);

    const config = manager.getConfig();
    config.ecoRoomLimit = 99;

    expect(manager.getConfig().ecoRoomLimit).to.equal(0.1);
  });

  it("tracks budget violations by subsystem and sorts the summary by frequency", () => {
    const manager = new CpuBudgetManager();

    expect(manager.checkBudget("W0N0", "ecoRoom", 0.101)).to.equal(false);
    expect(manager.checkBudget("W0N0", "ecoRoom", 0.2)).to.equal(false);
    expect(manager.checkBudget("market", "other", 0.501)).to.equal(false);

    expect(manager.getViolationsSummary()).to.deep.equal([
      { subsystem: "W0N0", violations: 2 },
      { subsystem: "market", violations: 1 }
    ]);

    const event = parseLog(logs[0]);
    expect(event.level).to.equal("WARN");
    expect(event.subsystem).to.equal("CPUBudget");
    expect(event.message).to.contain("CPU budget exceeded: W0N0 used 0.101 CPU");
  });

  it("does not create violations for CPU usage inside configured budgets", () => {
    const manager = new CpuBudgetManager({ ecoRoomLimit: 0.2, warRoomLimit: 0.3, overmindLimit: 2 });

    expect(manager.checkBudget("eco", "ecoRoom", 0.2)).to.equal(true);
    expect(manager.checkBudget("war", "warRoom", 0.3)).to.equal(true);
    expect(manager.checkBudget("overmind", "overmind", 2)).to.equal(true);

    expect(manager.getViolationsSummary()).to.deep.equal([]);
    expect(logs).to.deep.equal([]);
  });

  it("logs strict-mode budget violations as errors", () => {
    const manager = new CpuBudgetManager({ strictMode: true });

    expect(manager.checkBudget("planner", "overmind", 1.5)).to.equal(false);

    const event = parseLog(logs[0]);
    expect(event.level).to.equal("ERROR");
    expect(event.message).to.contain("CPU budget violation: planner used 1.500 CPU");
  });

  it("executes work, returns the result, and records measured CPU overages", () => {
    installCpuReadings([10, 10.25]);
    const manager = new CpuBudgetManager();

    const result = manager.executeWithBudget("roomLogic", "ecoRoom", () => "done");

    expect(result).to.equal("done");
    expect(manager.getViolationsSummary()).to.deep.equal([{ subsystem: "roomLogic", violations: 1 }]);
  });

  it("catches execution errors, logs them, and returns null", () => {
    installCpuReadings([5]);
    const manager = new CpuBudgetManager();

    const result = manager.executeWithBudget("remoteMining", "other", () => {
      throw new Error("boom");
    });

    expect(result).to.equal(null);

    const event = parseLog(logs[0]);
    expect(event.level).to.equal("ERROR");
    expect(event.message).to.equal("Error in remoteMining: boom");
  });

  it("executes room work with eco budgets and emits the strict-mode completion warning", () => {
    installCpuReadings([1, 1.2]);
    const manager = new CpuBudgetManager({ strictMode: true });
    let ran = false;

    manager.executeRoomWithBudget("W0N0", false, () => {
      ran = true;
    });

    expect(ran).to.equal(true);
    expect(manager.getViolationsSummary()).to.deep.equal([{ subsystem: "W0N0", violations: 1 }]);

    const violation = parseLog(logs[0]);
    const completion = parseLog(logs[1]);
    expect(violation.level).to.equal("ERROR");
    expect(violation.message).to.contain("CPU budget violation: W0N0 used 0.200 CPU");
    expect(completion.level).to.equal("WARN");
    expect(completion.message).to.equal("Strict CPU budget exceeded after W0N0 completed");
  });

  it("uses the war-room budget category for room wrappers marked as war rooms", () => {
    installCpuReadings([1, 1.3]);
    const manager = new CpuBudgetManager();

    manager.executeRoomWithBudget("W9N9", true, () => undefined);

    expect(manager.getViolationsSummary()).to.deep.equal([{ subsystem: "W9N9", violations: 1 }]);

    const event = parseLog(logs[0]);
    expect(event.level).to.equal("WARN");
    expect(event.message).to.contain("CPU budget exceeded: W9N9 used 0.300 CPU (limit: 0.25");
  });

  it("catches room execution errors without recording a budget violation", () => {
    installCpuReadings([3]);
    const manager = new CpuBudgetManager();

    manager.executeRoomWithBudget("W1N1", true, () => {
      throw new Error("room boom");
    });

    expect(manager.getViolationsSummary()).to.deep.equal([]);

    const event = parseLog(logs[0]);
    expect(event.level).to.equal("ERROR");
    expect(event.message).to.equal("Error in room W1N1: room boom");
  });

  it("merges config updates without resetting omitted fields", () => {
    const manager = new CpuBudgetManager({ strictMode: true, ecoRoomLimit: 0.1 });

    manager.updateConfig({ ecoRoomLimit: 0.5 });

    expect(manager.getConfig()).to.include({
      ecoRoomLimit: 0.5,
      strictMode: true
    });
    expect(manager.checkBudget("eco", "ecoRoom", 0.5)).to.equal(true);
  });

  it("can reset accumulated violation counters", () => {
    const manager = new CpuBudgetManager();

    manager.checkBudget("W0N0", "ecoRoom", 0.2);
    expect(manager.getViolationsSummary()).to.deep.equal([{ subsystem: "W0N0", violations: 1 }]);

    manager.resetViolations();

    expect(manager.getViolationsSummary()).to.deep.equal([]);
  });
});

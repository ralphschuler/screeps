import { expect } from "chai";
import { Kernel, ProcessPriority, buildKernelConfigFromCpu } from "../../src/core/kernel";
import { getConfig, resetConfig } from "../../src/config";

describe("Kernel tick distribution", () => {
  let kernel: Kernel;
  let executionLog: Map<number, string[]>;

  beforeEach(() => {
    resetConfig();
    executionLog = new Map();
    
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Allow setting test values
    global.Game = {
      ...global.Game,
      time: 0,
      cpu: {
        ...global.Game.cpu,
        bucket: 10000,
        limit: 50,
        getUsed: () => 0
      }
    };

    kernel = new Kernel(buildKernelConfigFromCpu(getConfig().cpu));
  });

  afterEach(() => {
    executionLog.clear();
  });

  it("should run process every tick when tickModulo is undefined", () => {
    kernel.registerProcess({
      id: "every-tick",
      name: "Every Tick Process",
      priority: ProcessPriority.HIGH,
      frequency: "high",
      execute: () => {
        const tick = Game.time;
        if (!executionLog.has(tick)) {
          executionLog.set(tick, []);
        }
        executionLog.get(tick)!.push("every-tick");
      }
    });

    // Run for 10 ticks
    for (let tick = 0; tick < 10; tick++) {
      Game.time = tick;
      kernel.run();
    }

    // Should have executed on all 10 ticks
    expect(executionLog.size).to.equal(10);
    for (let tick = 0; tick < 10; tick++) {
      expect(executionLog.has(tick)).to.be.true;
      expect(executionLog.get(tick)).to.deep.equal(["every-tick"]);
    }
  });

  it("should distribute process execution using tickModulo", () => {
    kernel.registerProcess({
      id: "every-5-ticks",
      name: "Every 5 Ticks Process",
      priority: ProcessPriority.HIGH,
      frequency: "high",
      tickModulo: 5,
      tickOffset: 0,
      execute: () => {
        const tick = Game.time;
        if (!executionLog.has(tick)) {
          executionLog.set(tick, []);
        }
        executionLog.get(tick)!.push("every-5-ticks");
      }
    });

    // Run for 20 ticks
    for (let tick = 0; tick < 20; tick++) {
      Game.time = tick;
      kernel.run();
    }

    // Should execute on ticks: 0, 5, 10, 15 (when tick % 5 === 0)
    expect(executionLog.size).to.equal(4);
    expect(executionLog.has(0)).to.be.true;
    expect(executionLog.has(5)).to.be.true;
    expect(executionLog.has(10)).to.be.true;
    expect(executionLog.has(15)).to.be.true;
    
    // Should NOT execute on other ticks
    expect(executionLog.has(1)).to.be.false;
    expect(executionLog.has(2)).to.be.false;
    expect(executionLog.has(3)).to.be.false;
  });

  it("should respect tickOffset for distribution", () => {
    kernel.registerProcess({
      id: "offset-2",
      name: "Offset 2 Process",
      priority: ProcessPriority.HIGH,
      frequency: "high",
      tickModulo: 5,
      tickOffset: 2,
      execute: () => {
        const tick = Game.time;
        if (!executionLog.has(tick)) {
          executionLog.set(tick, []);
        }
        executionLog.get(tick)!.push("offset-2");
      }
    });

    // Run for 20 ticks
    for (let tick = 0; tick < 20; tick++) {
      Game.time = tick;
      kernel.run();
    }

    // With offset 2, should execute when (tick + 2) % 5 === 0
    // Which means: tick 3, 8, 13, 18
    expect(executionLog.size).to.equal(4);
    expect(executionLog.has(3)).to.be.true;
    expect(executionLog.has(8)).to.be.true;
    expect(executionLog.has(13)).to.be.true;
    expect(executionLog.has(18)).to.be.true;
  });

  it("should distribute multiple processes across ticks", () => {
    // Register 5 processes with same modulo but different offsets
    for (let i = 0; i < 5; i++) {
      kernel.registerProcess({
        id: `process-${i}`,
        name: `Process ${i}`,
        priority: ProcessPriority.HIGH,
        frequency: "high",
        tickModulo: 5,
        tickOffset: i,
        execute: () => {
          const tick = Game.time;
          if (!executionLog.has(tick)) {
            executionLog.set(tick, []);
          }
          executionLog.get(tick)!.push(`process-${i}`);
        }
      });
    }

    // Run for 10 ticks
    for (let tick = 0; tick < 10; tick++) {
      Game.time = tick;
      kernel.run();
    }

    // Each tick should have exactly one process execution (distributed round-robin)
    expect(executionLog.size).to.equal(10);
    
    // When (tick + offset) % modulo === 0:
    // Tick 0: (0+0)%5=0 -> process-0
    expect(executionLog.get(0)).to.deep.equal(["process-0"]);
    // Tick 1: (1+4)%5=0 -> process-4
    expect(executionLog.get(1)).to.deep.equal(["process-4"]);
    // Tick 2: (2+3)%5=0 -> process-3
    expect(executionLog.get(2)).to.deep.equal(["process-3"]);
    // Tick 3: (3+2)%5=0 -> process-2
    expect(executionLog.get(3)).to.deep.equal(["process-2"]);
    // Tick 4: (4+1)%5=0 -> process-1
    expect(executionLog.get(4)).to.deep.equal(["process-1"]);
    
    // Pattern repeats for ticks 5-9
    expect(executionLog.get(5)).to.deep.equal(["process-0"]);
    expect(executionLog.get(6)).to.deep.equal(["process-4"]);
    expect(executionLog.get(7)).to.deep.equal(["process-3"]);
    expect(executionLog.get(8)).to.deep.equal(["process-2"]);
    expect(executionLog.get(9)).to.deep.equal(["process-1"]);
  });

  it("should combine tickModulo with interval", () => {
    kernel.registerProcess({
      id: "modulo-and-interval",
      name: "Modulo and Interval Process",
      priority: ProcessPriority.HIGH,
      frequency: "high",
      interval: 10, // Must wait at least 10 ticks between runs
      tickModulo: 5,
      tickOffset: 0,
      execute: () => {
        const tick = Game.time;
        if (!executionLog.has(tick)) {
          executionLog.set(tick, []);
        }
        executionLog.get(tick)!.push("modulo-and-interval");
      }
    });

    // Run for 30 ticks
    for (let tick = 0; tick < 30; tick++) {
      Game.time = tick;
      kernel.run();
    }

    // tickModulo=5 means eligible on ticks: 0, 5, 10, 15, 20, 25
    // interval=10 means must wait 10 ticks between executions
    // Expected execution: tick 0, then next eligible is tick 10, then tick 20
    expect(executionLog.size).to.equal(3);
    expect(executionLog.has(0)).to.be.true;
    expect(executionLog.has(10)).to.be.true;
    expect(executionLog.has(20)).to.be.true;
  });

  it("should handle zero tickModulo as no distribution", () => {
    kernel.registerProcess({
      id: "zero-modulo",
      name: "Zero Modulo Process",
      priority: ProcessPriority.HIGH,
      frequency: "high",
      tickModulo: 0, // Should be ignored (treated as no distribution)
      tickOffset: 0,
      execute: () => {
        const tick = Game.time;
        if (!executionLog.has(tick)) {
          executionLog.set(tick, []);
        }
        executionLog.get(tick)!.push("zero-modulo");
      }
    });

    // Run for 5 ticks
    for (let tick = 0; tick < 5; tick++) {
      Game.time = tick;
      kernel.run();
    }

    // With tickModulo=0, shouldRunProcess checks tickModulo > 0, so it should run every tick
    expect(executionLog.size).to.equal(5);
  });

  it("should enable CPU reduction through distribution", () => {
    const processesPerTick = new Map<number, number>();
    
    // Register 20 processes without distribution
    for (let i = 0; i < 20; i++) {
      kernel.registerProcess({
        id: `no-dist-${i}`,
        name: `No Distribution ${i}`,
        priority: ProcessPriority.HIGH,
        frequency: "high",
        execute: () => {
          const tick = Game.time;
          processesPerTick.set(tick, (processesPerTick.get(tick) || 0) + 1);
        }
      });
    }

    // Run for 1 tick
    Game.time = 0;
    kernel.run();
    
    const withoutDistribution = processesPerTick.get(0) || 0;
    
    // Reset and register with distribution
    kernel = new Kernel(buildKernelConfigFromCpu(getConfig().cpu));
    processesPerTick.clear();
    
    for (let i = 0; i < 20; i++) {
      kernel.registerProcess({
        id: `with-dist-${i}`,
        name: `With Distribution ${i}`,
        priority: ProcessPriority.HIGH,
        frequency: "high",
        tickModulo: 5,
        tickOffset: i % 5,
        execute: () => {
          const tick = Game.time;
          processesPerTick.set(tick, (processesPerTick.get(tick) || 0) + 1);
        }
      });
    }

    // Run for 1 tick
    Game.time = 0;
    kernel.run();
    
    const withDistribution = processesPerTick.get(0) || 0;
    
    // With distribution modulo=5 and offsets 0-4:
    // Tick 0 executes processes where (0 + offset) % 5 === 0
    // Only offset=0 matches: 4 processes execute (20 processes / 5 offset groups = 4 per group)
    // Without distribution, all 20 processes run
    expect(withoutDistribution).to.equal(20);
    expect(withDistribution).to.equal(4);
    
    // This represents an 80% reduction in processes per tick
    const reduction = ((withoutDistribution - withDistribution) / withoutDistribution) * 100;
    expect(reduction).to.equal(80);
  });
});

import { expect } from "chai";
import { Kernel, ProcessPriority, buildKernelConfigFromCpu } from "../../src/core/kernel";
import { getConfig, resetConfig } from "../../src/config";

describe("Kernel topology", () => {
  let kernel: Kernel;
  const executionLog: string[] = [];

  beforeEach(() => {
    resetConfig();
    executionLog.length = 0;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error: Allow setting test values
    global.Game = {
      ...global.Game,
      time: 1,
      cpu: {
        ...global.Game.cpu,
        bucket: 10000,
        limit: 50,
        getUsed: () => 0
      }
    };
    kernel = new Kernel(buildKernelConfigFromCpu(getConfig().cpu));
  });

  it("exposes read-only parent child process topology without changing execution", () => {
    kernel.registerProcess({
      id: "room:W1N1",
      name: "Room W1N1",
      priority: ProcessPriority.HIGH,
      frequency: "high",
      topology: { group: "room", layer: "room" },
      execute: () => executionLog.push("room:W1N1")
    });
    kernel.registerProcess({
      id: "creep:Bob",
      name: "Creep Bob",
      priority: ProcessPriority.MEDIUM,
      frequency: "high",
      topology: { parentId: "room:W1N1", group: "creep", layer: "creep" },
      execute: () => executionLog.push("creep:Bob")
    });

    const topology = kernel.getProcessTopology();

    expect(topology.nodes.map(node => node.id)).to.have.members(["room:W1N1", "creep:Bob"]);
    expect(topology.childrenByParent["room:W1N1"]).to.deep.equal(["creep:Bob"]);

    kernel.run();
    expect(executionLog).to.deep.equal(["room:W1N1", "creep:Bob"]);
  });

  it("exposes scheduling and health metadata as part of the topology interface", () => {
    kernel.registerProcess({
      id: "room:W1N1",
      name: "Room W1N1",
      priority: ProcessPriority.HIGH,
      frequency: "high",
      tickModulo: 5,
      tickOffset: 2,
      cpuBudget: 0.08,
      topology: { group: "room", layer: "room" },
      execute: () => executionLog.push("room:W1N1")
    });
    kernel.registerProcess({
      id: "creep:Bob",
      name: "Creep Bob",
      priority: ProcessPriority.MEDIUM,
      frequency: "high",
      cpuBudget: 0.01,
      topology: { parentId: "room:W1N1", group: "creep", layer: "creep" },
      execute: () => executionLog.push("creep:Bob")
    });

    const beforeRun = kernel.getProcessTopology();
    const roomNode = beforeRun.nodes.find(node => node.id === "room:W1N1");

    expect(roomNode).to.deep.include({
      id: "room:W1N1",
      priority: ProcessPriority.HIGH,
      frequency: "high",
      state: "idle",
      interval: 1,
      tickModulo: 5,
      tickOffset: 2,
      cpuBudget: 0.08,
      runCount: 0,
      healthScore: 100
    });
    expect(beforeRun.rootIds).to.deep.equal(["room:W1N1"]);
    expect(beforeRun.nodesByLayer.room).to.deep.equal(["room:W1N1"]);
    expect(beforeRun.nodesByLayer.creep).to.deep.equal(["creep:Bob"]);
    expect(beforeRun.nodesByGroup.room).to.deep.equal(["room:W1N1"]);
    expect(beforeRun.nodesByGroup.creep).to.deep.equal(["creep:Bob"]);
    expect(beforeRun.summary).to.deep.include({ total: 2, roots: 1, edges: 1 });

    Game.time = 3;
    kernel.run();

    const afterRun = kernel.getProcessTopology();
    const executedRoomNode = afterRun.nodes.find(node => node.id === "room:W1N1");
    expect(executedRoomNode?.runCount).to.equal(1);
    expect(executedRoomNode?.lastRunTick).to.equal(Game.time);
  });
});

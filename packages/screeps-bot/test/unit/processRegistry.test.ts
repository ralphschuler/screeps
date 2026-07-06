import { clusterManager } from "@ralphschuler/screeps-clusters";
import { evacuationManager } from "@ralphschuler/screeps-defense";
import { linkManager } from "@ralphschuler/screeps-economy";
import { assert } from "chai";
import { getConfig } from "../../src/config";
import { kernel } from "../../src/core/kernel";
import { registerAllProcesses, unregisterAllProcesses } from "../../src/core/processRegistry";
import { Game, Memory } from "./mock";

describe("process registry", () => {
  beforeEach(() => {
    global.Game = {
      ...Game,
      time: 12345,
      rooms: {},
      spawns: {},
      cpu: {
        ...Game.cpu,
        getUsed: () => 0,
        limit: 20,
        bucket: 10000
      }
    } as unknown as typeof Game;
    global.Memory = { ...Memory, rooms: {}, creeps: {} } as unknown as typeof Memory;
    unregisterAllProcesses();
  });

  afterEach(() => {
    unregisterAllProcesses();
  });

  it("registers framework-decorated package processes on the bot kernel without the legacy defense dispatcher", () => {
    const originalClusterRun = clusterManager.run;
    const originalEvacuationRun = evacuationManager.run;
    const originalLinkRun = linkManager.run;
    let clusterRuns = 0;
    let evacuationRuns = 0;
    let linkRuns = 0;

    clusterManager.run = () => {
      clusterRuns += 1;
    };
    evacuationManager.run = () => {
      evacuationRuns += 1;
    };
    linkManager.run = () => {
      linkRuns += 1;
    };

    try {
      registerAllProcesses();

      const processIds = kernel.getProcesses().map(process => process.id);

      assert.include(processIds, "link:manager");
      assert.include(processIds, "terminal:manager");
      assert.include(processIds, "factory:manager");
      assert.include(processIds, "empire:market");
      assert.include(processIds, "cluster:manager");
      assert.include(processIds, "cluster:evacuation");
      assert.notInclude(processIds, "cluster:defense");

      kernel.getProcess("link:manager")?.execute();
      kernel.getProcess("cluster:manager")?.execute();
      kernel.getProcess("cluster:evacuation")?.execute();

      assert.equal(linkRuns, 1);
      assert.equal(clusterRuns, 1);
      assert.equal(evacuationRuns, 1);
    } finally {
      clusterManager.run = originalClusterRun;
      evacuationManager.run = originalEvacuationRun;
      linkManager.run = originalLinkRun;
    }
  });

  it("defers high-cost optional work until bucket exits low mode", () => {
    registerAllProcesses();

    const { highMode, lowMode } = getConfig().cpu.bucketThresholds;
    const optionalRecoveryBucket = highMode + 1000;
    const remoteInfrastructureRecoveryBucket = highMode + 1800;

    assert.equal(kernel.getProcess("empire:market")?.minBucket, lowMode);
    assert.equal(kernel.getProcess("empire:tooangel")?.minBucket, optionalRecoveryBucket);
    assert.equal(kernel.getProcess("expansion:manager")?.minBucket, optionalRecoveryBucket);
    assert.equal(kernel.getProcess("remote:infrastructure")?.minBucket, remoteInfrastructureRecoveryBucket);
  });
});

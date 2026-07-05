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

  it("registers framework-decorated economy processes on the bot kernel without the legacy defense dispatcher", () => {
    registerAllProcesses();

    const processIds = kernel.getProcesses().map(process => process.id);

    assert.include(processIds, "link:manager");
    assert.include(processIds, "terminal:manager");
    assert.include(processIds, "factory:manager");
    assert.include(processIds, "empire:market");
    assert.notInclude(processIds, "cluster:defense");
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

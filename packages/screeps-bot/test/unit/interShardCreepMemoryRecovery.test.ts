import { expect } from "chai";
import { recoverStrandedInterShardCreepMemory } from "../../src/intershard/creepMemoryRecovery";

function makeCreep(name: string, roomName: string, memory: CreepMemory): Creep {
  return {
    name,
    memory,
    room: { name: roomName }
  } as unknown as Creep;
}

describe("stranded inter-shard creep memory recovery", () => {
  it("reconstructs the minimum safe destination mission for a memoryless scout", () => {
    const creep = makeCreep("interShardScout_72319900_test", "W20S20", {});

    expect(recoverStrandedInterShardCreepMemory(creep, "shard2")).to.equal(true);
    expect(creep.memory).to.deep.equal({
      role: "interShardScout",
      family: "utility",
      homeRoom: "W20S20",
      targetRoom: "W20S20",
      targetShard: "shard2",
      task: "interShardFootprint",
      workflowState: "arrived",
      version: 1
    });
  });

  it("reconstructs role-specific claimer and pioneer missions", () => {
    const claimer = makeCreep("interShardClaimer_72319900_test", "W20S20", {});
    const pioneer = makeCreep("interShardPioneer_72319900_test", "W20S20", {});

    expect(recoverStrandedInterShardCreepMemory(claimer, "shard2")).to.equal(true);
    expect(claimer.memory).to.include({
      role: "interShardClaimer",
      family: "utility",
      task: "interShardClaim"
    });
    expect(recoverStrandedInterShardCreepMemory(pioneer, "shard2")).to.equal(true);
    expect(pioneer.memory).to.include({
      role: "interShardPioneer",
      family: "economy",
      task: "interShardBootstrap"
    });
  });

  it("does not replace existing mission memory or infer unknown creep names", () => {
    const existing = makeCreep("interShardScout_72319900_test", "W20S20", {
      role: "interShardScout",
      targetShard: "shard2"
    } as CreepMemory);
    const unknown = makeCreep("scout_72319900_test", "W20S20", {});

    expect(recoverStrandedInterShardCreepMemory(existing, "shard2")).to.equal(false);
    expect(existing.memory).to.deep.equal({
      role: "interShardScout",
      targetShard: "shard2"
    });
    expect(recoverStrandedInterShardCreepMemory(unknown, "shard2")).to.equal(false);
    expect(unknown.memory).to.deep.equal({});
  });
});

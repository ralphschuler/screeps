import { expect } from "chai";
import {
  getActiveInterShardCreepHandoffNames,
  publishInterShardCreepPresence,
  restoreInterShardCreepMemory,
  stageInterShardCreepMemory,
} from "../src/creepMemoryHandoff.ts";

interface MockCreep {
  name: string;
  memory: CreepMemory;
  ticksToLive: number;
}

function makeCreep(
  name: string,
  memory: CreepMemory,
  ticksToLive = 1000,
): MockCreep {
  return { name, memory, ticksToLive };
}

describe("inter-shard creep memory handoff", () => {
  let currentShard: string;
  let payloads: Record<string, string>;

  beforeEach(() => {
    currentShard = "shard1";
    payloads = {
      shard1: JSON.stringify({
        "portals:": { shard: "shard1", portals: ["W20S20"] },
      }),
      shard2: "",
    };
    Game.time = 1000;
    (Game as typeof Game & { shard: { name: string } }).shard = {
      name: currentShard,
    };
    (
      globalThis as unknown as { InterShardMemory: InterShardMemory }
    ).InterShardMemory = {
      getLocal: () => payloads[currentShard] ?? "",
      setLocal: (value) => {
        payloads[currentShard] = value;
      },
      getRemote: (shard) => payloads[shard] ?? null,
    };
  });

  it("restores a staged mission on the destination shard without source movement state", () => {
    const source = makeCreep("interShardScout_1000_test", {
      role: "interShardScout",
      family: "utility",
      homeRoom: "W19S20",
      targetShard: "shard2",
      portalRoom: "W20S20",
      targetRoom: "W20S20",
      task: "interShardFootprint",
      version: 1,
      state: {
        action: "moveTo",
        startTick: 1000,
        timeout: 25,
        targetPos: { x: 29, y: 13, roomName: "W20S20" },
        targetRange: 0,
      },
      _move: { path: "1234" },
    } as CreepMemory);

    const staged = stageInterShardCreepMemory([source as unknown as Creep]);

    expect(staged).to.deep.include({ staged: 1, written: true });
    expect(JSON.parse(payloads.shard1!)["portals:"]).to.deep.equal({
      shard: "shard1",
      portals: ["W20S20"],
    });

    currentShard = "shard2";
    (Game as typeof Game & { shard: { name: string } }).shard = {
      name: currentShard,
    };
    const destination = makeCreep(source.name, {});

    const restored = restoreInterShardCreepMemory(
      [destination as unknown as Creep],
      ["shard1", "shard0"],
    );

    expect(restored).to.deep.equal([source.name]);
    expect(destination.memory).to.deep.include({
      role: "interShardScout",
      family: "utility",
      homeRoom: "W19S20",
      targetShard: "shard2",
      portalRoom: "W20S20",
      targetRoom: "W20S20",
      task: "interShardFootprint",
      version: 1,
    });
    expect(
      (destination.memory as CreepMemory & { state?: unknown }).state,
    ).to.equal(undefined);
    expect(
      (destination.memory as CreepMemory & { _move?: unknown })._move,
    ).to.equal(undefined);
  });

  it("does not overwrite complete destination memory with an older handoff", () => {
    const source = makeCreep("interShardScout_1000_test", {
      role: "interShardScout",
      family: "utility",
      homeRoom: "W19S20",
      targetShard: "shard2",
      targetRoom: "W20S20",
      version: 1,
    } as CreepMemory);
    stageInterShardCreepMemory([source as unknown as Creep]);

    currentShard = "shard2";
    (Game as typeof Game & { shard: { name: string } }).shard = {
      name: currentShard,
    };
    const destination = makeCreep(source.name, {
      role: "interShardScout",
      family: "utility",
      homeRoom: "W20S20",
      targetShard: "shard2",
      targetRoom: "W21S20",
      version: 1,
    } as CreepMemory);

    expect(
      restoreInterShardCreepMemory(
        [destination as unknown as Creep],
        ["shard1"],
      ),
    ).to.deep.equal([]);
    expect(
      (destination.memory as CreepMemory & { targetRoom?: string }).targetRoom,
    ).to.equal("W21S20");
  });

  it("does not restore a handoff after the source creep lifetime bound", () => {
    const source = makeCreep(
      "interShardScout_1000_test",
      {
        role: "interShardScout",
        family: "utility",
        homeRoom: "W19S20",
        targetShard: "shard2",
        targetRoom: "W20S20",
        version: 1,
      } as CreepMemory,
      10,
    );
    stageInterShardCreepMemory([source as unknown as Creep]);

    currentShard = "shard2";
    (Game as typeof Game & { shard: { name: string } }).shard = {
      name: currentShard,
    };
    Game.time = 1011;
    const destination = makeCreep(source.name, {});

    expect(
      restoreInterShardCreepMemory(
        [destination as unknown as Creep],
        ["shard1"],
      ),
    ).to.deep.equal([]);
    expect(destination.memory).to.deep.equal({});
  });

  it("counts live handoffs and prunes them at the transferred creep lifetime bound", () => {
    const source = makeCreep(
      "interShardScout_1000_test",
      {
        role: "interShardScout",
        family: "utility",
        homeRoom: "W19S20",
        targetShard: "shard2",
        targetRoom: "W20S20",
        version: 1,
      } as CreepMemory,
      10,
    );
    stageInterShardCreepMemory([source as unknown as Creep]);

    expect(
      getActiveInterShardCreepHandoffNames({
        role: "interShardScout",
        targetShard: "shard2",
      }),
    ).to.deep.equal([source.name]);

    Game.time = 1011;
    expect(
      getActiveInterShardCreepHandoffNames({
        role: "interShardScout",
        targetShard: "shard2",
      }),
    ).to.deep.equal([]);

    const cleanup = stageInterShardCreepMemory([]);
    expect(cleanup).to.deep.include({ pruned: 1, written: true });
    expect(JSON.stringify(JSON.parse(payloads.shard1!))).not.to.contain(
      source.name,
    );
  });

  it("counts fresh destination presence and drops stale remote heartbeats", () => {
    currentShard = "shard2";
    (Game as typeof Game & { shard: { name: string } }).shard = {
      name: currentShard,
    };
    const destination = makeCreep("interShardScout_1000_test", {
      role: "interShardScout",
      family: "utility",
      homeRoom: "W19S20",
      targetShard: "shard2",
      targetRoom: "W20S20",
      version: 1,
    } as CreepMemory);
    expect(
      publishInterShardCreepPresence([destination as unknown as Creep]),
    ).to.equal(true);

    currentShard = "shard1";
    (Game as typeof Game & { shard: { name: string } }).shard = {
      name: currentShard,
    };
    expect(
      getActiveInterShardCreepHandoffNames({
        role: "interShardScout",
        targetShard: "shard2",
      }),
    ).to.deep.equal([destination.name]);

    Game.time = 1026;
    expect(
      getActiveInterShardCreepHandoffNames({
        role: "interShardScout",
        targetShard: "shard2",
      }),
    ).to.deep.equal([]);
  });

  it("limits duplicate suppression to portal transfer grace while retaining restore data", () => {
    const source = makeCreep("interShardScout_1000_test", {
      role: "interShardScout",
      family: "utility",
      homeRoom: "W19S20",
      targetShard: "shard2",
      targetRoom: "W20S20",
      version: 1,
    } as CreepMemory);
    stageInterShardCreepMemory([source as unknown as Creep]);

    Game.time = 1051;
    expect(
      getActiveInterShardCreepHandoffNames({
        role: "interShardScout",
        targetShard: "shard2",
      }),
    ).to.deep.equal([]);

    currentShard = "shard2";
    (Game as typeof Game & { shard: { name: string } }).shard = {
      name: currentShard,
    };
    const destination = makeCreep(source.name, {});
    expect(
      restoreInterShardCreepMemory(
        [destination as unknown as Creep],
        ["shard1"],
      ),
    ).to.deep.equal([source.name]);
  });

  it("fails closed without replacing local InterShardMemory when a handoff exceeds the size limit", () => {
    payloads.shard1 = JSON.stringify({ existing: "x".repeat(102350) });
    const original = payloads.shard1;
    const source = makeCreep("interShardScout_1000_test", {
      role: "interShardScout",
      family: "utility",
      homeRoom: "W19S20",
      targetShard: "shard2",
      targetRoom: "W20S20",
      version: 1,
    } as CreepMemory);

    expect(
      stageInterShardCreepMemory([source as unknown as Creep]),
    ).to.deep.include({
      staged: 0,
      written: false,
    });
    expect(payloads.shard1).to.equal(original);
  });
});

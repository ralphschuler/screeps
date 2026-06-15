import { expect } from "chai";
import {
  getHomeRoomCreepCount,
  isBootstrapMode,
  resetCreepBootstrapCountCacheForTests
} from "../../src/core/creepBootstrapCounts";
import { Game as MockGame, Memory as MockMemory } from "./mock";

function installFreshGlobals(): void {
  (global as any).Game = {
    ...MockGame,
    creeps: {},
    rooms: {},
    time: 1000
  };
  (global as any).Memory = {
    ...MockMemory,
    creeps: {},
    rooms: {}
  };
}

function trackedCreep(homeRoom: string): { creep: Partial<Creep>; getMemoryReads: () => number } {
  let memoryReads = 0;
  const creep = {
    get memory() {
      memoryReads++;
      return { homeRoom };
    }
  } as Partial<Creep>;

  return { creep, getMemoryReads: () => memoryReads };
}

describe("creep bootstrap count cache", () => {
  beforeEach(() => {
    installFreshGlobals();
    resetCreepBootstrapCountCacheForTests();
  });

  it("reuses home-room creep counts within one tick", () => {
    const a = trackedCreep("W1N1");
    const b = trackedCreep("W1N1");
    const c = trackedCreep("W2N2");
    (global as any).Game.creeps = {
      a: a.creep,
      b: b.creep,
      c: c.creep
    };

    expect(getHomeRoomCreepCount("W1N1")).to.equal(2);
    expect(getHomeRoomCreepCount("W2N2")).to.equal(1);
    expect(getHomeRoomCreepCount("W3N3")).to.equal(0);

    expect(a.getMemoryReads()).to.equal(1);
    expect(b.getMemoryReads()).to.equal(1);
    expect(c.getMemoryReads()).to.equal(1);
  });

  it("rebuilds cached home-room counts on the next tick", () => {
    const a = trackedCreep("W1N1");
    (global as any).Game.creeps = { a: a.creep };

    expect(getHomeRoomCreepCount("W1N1")).to.equal(1);

    const b = trackedCreep("W1N1");
    (global as any).Game.creeps = { a: a.creep, b: b.creep };
    expect(getHomeRoomCreepCount("W1N1")).to.equal(1);

    (global as any).Game.time += 1;
    expect(getHomeRoomCreepCount("W1N1")).to.equal(2);
  });

  it("can bypass the cache as a rollback flag", () => {
    const a = trackedCreep("W1N1");
    (global as any).Game.creeps = { a: a.creep };

    expect(getHomeRoomCreepCount("W1N1")).to.equal(1);

    const b = trackedCreep("W1N1");
    (global as any).Game.creeps = { a: a.creep, b: b.creep };

    expect(getHomeRoomCreepCount("W1N1", { useCache: false })).to.equal(2);
  });

  it("uses cached counts for bootstrap mode threshold checks", () => {
    (global as any).Game.creeps = {
      a: trackedCreep("W1N1").creep,
      b: trackedCreep("W1N1").creep,
      c: trackedCreep("W1N1").creep,
      d: trackedCreep("W1N1").creep
    };

    const room = { name: "W1N1" } as Room;
    expect(isBootstrapMode(room)).to.equal(true);

    (global as any).Game.creeps.e = trackedCreep("W1N1").creep;
    (global as any).Game.time += 1;
    expect(isBootstrapMode(room)).to.equal(false);
  });
});

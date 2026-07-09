import { expect } from "chai";
import { clearGameObjectCache, getGameObjectCacheStats } from "@ralphschuler/screeps-cache";
import { MemorySegmentStats } from "../src/memorySegmentStats.ts";

function createOwnedRoom(name: string, energyAvailable = 300): Room {
  return {
    name,
    controller: {
      my: true,
      level: 3,
      progress: 100,
      progressTotal: 200
    },
    energyAvailable,
    energyCapacityAvailable: 550
  } as Room;
}

function statsMemory(): Record<string, number> {
  return (Memory as unknown as { stats: Record<string, number> }).stats;
}

describe("MemorySegmentStats", () => {
  beforeEach(() => {
    clearGameObjectCache();
    (Game as unknown as { time: number; rooms: Record<string, Room>; creeps: Record<string, Creep> }).time = 1000;
    (Game as unknown as { rooms: Record<string, Room> }).rooms = {
      W1N1: createOwnedRoom("W1N1", 250),
      W0N0: { ...createOwnedRoom("W0N0", 999), controller: { my: false, level: 1 } } as Room
    };
    (Game as unknown as { creeps: Record<string, Creep> }).creeps = {};
    (Memory as unknown as { stats: Record<string, number> }).stats = {};
    RawMemory.segments = {};
  });

  it("publishes global stats from the framework owned-room snapshot and refreshes next tick", () => {
    const manager = new MemorySegmentStats({ updateInterval: 0 });

    manager.run();

    expect(statsMemory()["stats.empire.rooms"]).to.equal(1);
    expect(statsMemory()["stats.room.W1N1.energy.available"]).to.equal(250);
    expect(statsMemory()).not.to.have.property("stats.room.W0N0.energy.available");
    expect(statsMemory()).not.to.have.property("stats.room.W2N2.energy.available");
    expect(getGameObjectCacheStats()).to.include({ hits: 0, misses: 1, size: 1 });

    (Game.rooms as Record<string, Room>).W2N2 = createOwnedRoom("W2N2", 450);

    manager.run();

    expect(statsMemory()["stats.empire.rooms"]).to.equal(1);
    expect(statsMemory()).not.to.have.property("stats.room.W2N2.energy.available");
    expect(getGameObjectCacheStats()).to.include({ hits: 1, misses: 1, size: 1 });

    (Game as unknown as { time: number }).time += 1;

    manager.run();

    expect(statsMemory()["stats.empire.rooms"]).to.equal(2);
    expect(statsMemory()["stats.room.W2N2.energy.available"]).to.equal(450);
    expect(getGameObjectCacheStats()).to.include({ hits: 1, misses: 2, size: 1 });
  });
});

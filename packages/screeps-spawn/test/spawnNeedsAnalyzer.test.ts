import { expect } from "chai";
import { getRoleTargetCount, needsRole } from "../src/spawnNeedsAnalyzer";
import type { SwarmState } from "@ralphschuler/screeps-memory";

function makeEnergyStore(energy: number, capacity = 1_000_000): Store<RESOURCE_ENERGY, false> {
  return {
    [RESOURCE_ENERGY]: energy,
    getUsedCapacity: (resource?: ResourceConstant) => resource === undefined || resource === RESOURCE_ENERGY ? energy : 0,
    getFreeCapacity: (resource?: ResourceConstant) => resource === undefined || resource === RESOURCE_ENERGY ? Math.max(0, capacity - energy) : 0,
    getCapacity: () => capacity
  } as unknown as Store<RESOURCE_ENERGY, false>;
}

function makeRoom(storageEnergy: number, terminalEnergy: number): Room {
  const room = {
    name: "W1N1",
    controller: { my: true, level: 6 },
    storage: { id: "storage1", store: makeEnergyStore(storageEnergy) },
    terminal: { id: "terminal1", store: makeEnergyStore(terminalEnergy, 300_000) },
    energyAvailable: 2300,
    energyCapacityAvailable: 2300,
    find: () => []
  } as unknown as Room;
  return room;
}

function makeSwarm(): SwarmState {
  return { danger: 0, posture: "eco" } as SwarmState;
}

describe("spawn needs mature reserve recovery", () => {
  beforeEach(() => {
    (globalThis as any).Memory = { empire: { knownRooms: {}, clusters: {} } };
    (globalThis as any).Game = {
      time: 1,
      rooms: {},
      creeps: {},
      spawns: {},
      getObjectById: () => null
    };
  });

  it("holds extra upgraders when mature storage and terminal reserves are depleted", () => {
    const room = makeRoom(0, 0);
    Game.rooms[room.name] = room;
    Game.creeps = {
      upgrader1: { name: "upgrader1", spawning: false, memory: { role: "upgrader", homeRoom: room.name } } as Creep
    };

    expect(getRoleTargetCount(room.name, "upgrader", makeSwarm())).to.equal(1);
    expect(needsRole(room.name, "upgrader", makeSwarm())).to.equal(false);
    expect(needsRole(room.name, "hauler", makeSwarm())).to.equal(true);
  });

  it("keeps the reserve-recovery upgrader cap during danger states", () => {
    const room = makeRoom(0, 0);
    Game.rooms[room.name] = room;

    expect(getRoleTargetCount(room.name, "upgrader", { danger: 3, posture: "defense" } as SwarmState)).to.equal(1);
  });

  it("restores normal RCL6 upgrader targets after storage and terminal reserves recover", () => {
    const room = makeRoom(60_000, 25_000);
    Game.rooms[room.name] = room;

    expect(getRoleTargetCount(room.name, "upgrader", makeSwarm())).to.equal(7);
  });
});

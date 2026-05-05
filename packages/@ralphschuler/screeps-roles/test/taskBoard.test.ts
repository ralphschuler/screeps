import { expect } from "chai";
import { taskBoard } from "../src/tasks";
import { createMockCreep, createMockRoom, resetMockGame, MockGame } from "./setup";
import type { CreepContext } from "../src";

function makeStore(used: number, capacity: number) {
  return {
    getUsedCapacity: (resource?: ResourceConstant) => resource && resource !== RESOURCE_ENERGY ? 0 : used,
    getFreeCapacity: (resource?: ResourceConstant) => resource && resource !== RESOURCE_ENERGY ? 0 : capacity - used,
    getCapacity: (_resource?: ResourceConstant) => capacity,
    energy: used
  };
}

function makeSpawn(id: Id<StructureSpawn>, freeCapacity: number): StructureSpawn {
  return {
    id,
    structureType: STRUCTURE_SPAWN,
    pos: { x: 10, y: 10, roomName: "W1N1" },
    store: makeStore(300 - freeCapacity, 300)
  } as unknown as StructureSpawn;
}

function makeContext(creep: Creep, room: Room): CreepContext {
  return {
    creep,
    room,
    memory: creep.memory as CreepContext["memory"],
    swarmState: undefined,
    squadMemory: undefined,
    homeRoom: room.name,
    isInHomeRoom: true,
    isFull: false,
    isEmpty: false,
    isWorking: true,
    assignedSource: null,
    assignedMineral: null,
    energyAvailable: true,
    nearbyEnemies: false,
    constructionSiteCount: 0,
    damagedStructureCount: 0,
    droppedResources: [],
    containers: [],
    depositContainers: [],
    spawnStructures: [],
    towers: [],
    storage: undefined,
    terminal: undefined,
    hostiles: [],
    damagedAllies: [],
    prioritizedSites: [],
    repairTargets: [],
    labs: [],
    factory: undefined,
    tombstones: [],
    mineralContainers: []
  };
}

describe("TaskBoard", () => {
  beforeEach(() => {
    resetMockGame();
    taskBoard.clear();
    taskBoard.setEnabled(true);
  });

  it("reserves a spawn refill task for only one full-enough creep", () => {
    const spawn = makeSpawn("spawn1" as Id<StructureSpawn>, 100);
    const room = createMockRoom("W1N1");
    (room as any).find = (type: number) => type === FIND_MY_STRUCTURES ? [spawn] : [];
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === spawn.id ? spawn : null;

    const creep1 = createMockCreep("hauler1", { room, memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1 }, store: makeStore(100, 100) });
    const creep2 = createMockCreep("hauler2", { room, memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1 }, store: makeStore(100, 100) });
    MockGame.creeps[creep1.name] = creep1;
    MockGame.creeps[creep2.name] = creep2;

    const action1 = taskBoard.getAssignedDeliveryAction(makeContext(creep1, room));
    const action2 = taskBoard.getAssignedDeliveryAction(makeContext(creep2, room));

    expect(action1?.type).to.equal("transfer");
    expect(action2).to.equal(null);
    expect(taskBoard.describeAssignments(room.name)).to.contain("hauler1 -> refillSpawn");
    expect(taskBoard.describeAssignments(room.name)).to.not.contain("hauler2 -> refillSpawn");
  });

  it("assigns a second creep when remaining refill amount needs it", () => {
    const spawn = makeSpawn("spawn1" as Id<StructureSpawn>, 100);
    const room = createMockRoom("W1N1");
    (room as any).find = (type: number) => type === FIND_MY_STRUCTURES ? [spawn] : [];
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === spawn.id ? spawn : null;

    const creep1 = createMockCreep("hauler1", { room, memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1 }, store: makeStore(50, 100) });
    const creep2 = createMockCreep("hauler2", { room, memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1 }, store: makeStore(50, 100) });
    MockGame.creeps[creep1.name] = creep1;
    MockGame.creeps[creep2.name] = creep2;

    expect(taskBoard.getAssignedDeliveryAction(makeContext(creep1, room))?.type).to.equal("transfer");
    expect(taskBoard.getAssignedDeliveryAction(makeContext(creep2, room))?.type).to.equal("transfer");
  });

  it("cleans dead creep reservations", () => {
    const spawn = makeSpawn("spawn1" as Id<StructureSpawn>, 100);
    const room = createMockRoom("W1N1");
    (room as any).find = (type: number) => type === FIND_MY_STRUCTURES ? [spawn] : [];
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === spawn.id ? spawn : null;

    const creep = createMockCreep("hauler1", { room, memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1 }, store: makeStore(100, 100) });
    MockGame.creeps[creep.name] = creep;
    taskBoard.getAssignedDeliveryAction(makeContext(creep, room));

    delete MockGame.creeps[creep.name];
    const stats = taskBoard.getStats(room.name);
    expect(stats?.reservations).to.equal(0);
    expect(stats?.staleReservations).to.be.greaterThan(0);
  });

  it("can be disabled as rollback", () => {
    taskBoard.setEnabled(false);
    const room = createMockRoom("W1N1");
    const creep = createMockCreep("hauler1", { room, memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1 }, store: makeStore(100, 100) });
    expect(taskBoard.getAssignedDeliveryAction(makeContext(creep, room))).to.equal(null);
  });
});

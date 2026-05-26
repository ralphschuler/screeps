import { expect } from "chai";
import { taskBoard } from "../src/tasks";
import { evaluateEconomyBehavior } from "../src/behaviors/economy";
import { createMockCreep, createMockRoom, resetMockGame, MockGame } from "./setup";
import type { CreepAction, CreepContext } from "../src";

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

function makeStorage(id: Id<StructureStorage>, used: number, capacity: number): StructureStorage {
  return {
    id,
    structureType: STRUCTURE_STORAGE,
    pos: { x: 20, y: 20, roomName: "W1N1" },
    store: makeStore(used, capacity)
  } as unknown as StructureStorage;
}

function makeController(id: Id<StructureController>): StructureController {
  return {
    id,
    structureType: STRUCTURE_CONTROLLER,
    my: true,
    pos: { x: 40, y: 40, roomName: "W1N1" }
  } as unknown as StructureController;
}

function makeSource(id: Id<Source>, x: number, y: number): Source {
  return {
    id,
    energy: 3000,
    pos: { x, y, roomName: "W1N1" }
  } as unknown as Source;
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

  it("records same-tick cleanup so repeated assignment paths can skip cleanup churn", () => {
    const spawn = makeSpawn("spawn1" as Id<StructureSpawn>, 100);
    const room = createMockRoom("W1N1");
    (room as any).find = (type: number) => type === FIND_MY_STRUCTURES ? [spawn] : [];
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === spawn.id ? spawn : null;

    const creep = createMockCreep("hauler1", { room, memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1 }, store: makeStore(100, 100) });
    MockGame.creeps[creep.name] = creep;

    taskBoard.refreshRoom(room);
    taskBoard.getAssignedDeliveryAction(makeContext(creep, room));

    const board = (Memory as any).creepTaskBoard.rooms[room.name];
    expect(board.lastCleanedTick).to.equal(Game.time);
  });

  it("prunes stale invisible room boards during visible room refresh", () => {
    const room = createMockRoom("W1N1");
    MockGame.rooms[room.name] = room;
    (Memory as any).creepTaskBoard = {
      enabled: true,
      rooms: {
        W1N1: {
          roomName: "W1N1",
          tasks: {},
          lastGeneratedTick: Game.time,
          lastCleanedTick: Game.time,
          stats: { generated: 0, assigned: 0, completed: 0, invalidated: 0, staleReservations: 0, preemptions: 0 }
        },
        W9N9: {
          roomName: "W9N9",
          tasks: {},
          lastGeneratedTick: Game.time - 2000,
          lastCleanedTick: Game.time - 2000,
          stats: { generated: 0, assigned: 0, completed: 0, invalidated: 0, staleReservations: 0, preemptions: 0 }
        }
      }
    };

    taskBoard.refreshRoom(room);

    expect((Memory as any).creepTaskBoard.rooms.W1N1).to.not.equal(undefined);
    expect((Memory as any).creepTaskBoard.rooms.W9N9).to.equal(undefined);
  });

  it("can be disabled as rollback", () => {
    taskBoard.setEnabled(false);
    const room = createMockRoom("W1N1");
    const creep = createMockCreep("hauler1", { room, memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1 }, store: makeStore(100, 100) });
    expect(taskBoard.getAssignedDeliveryAction(makeContext(creep, room))).to.equal(null);
  });

  it("does not divert a full upgrader into storage when the controller can be upgraded", () => {
    const controller = makeController("controller1" as Id<StructureController>);
    const storage = makeStorage("storage1" as Id<StructureStorage>, 0, 1000000);
    const room = createMockRoom("W1N1", { controller, storage });
    (room as any).find = (type: number) => {
      if (type === FIND_MY_STRUCTURES) return [];
      if (type === FIND_MY_CONSTRUCTION_SITES) return [];
      if (type === FIND_STRUCTURES) return [];
      if (type === FIND_MY_CREEPS) return [];
      return [];
    };
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => {
      if (id === controller.id) return controller;
      if (id === storage.id) return storage;
      return null;
    };

    const creep = createMockCreep("upgrader1", {
      room,
      memory: { role: "upgrader", family: "economy", homeRoom: room.name, version: 1, working: true },
      store: makeStore(100, 100),
      pos: { x: 21, y: 20, roomName: room.name, getRangeTo: (target: RoomPosition) => target.x === 20 ? 1 : 30, isNearTo: () => false, findInRange: () => [] }
    });
    MockGame.creeps[creep.name] = creep;

    const action = evaluateEconomyBehavior(makeContext(creep, room));

    expect(action.type).to.equal("upgrade");
    expect((action as Extract<CreepAction, { type: "upgrade" }>).target.id).to.equal(controller.id);
  });

  it("balances new harvesters across room sources instead of assigning all to the closest source", () => {
    const sourceA = makeSource("sourceA" as Id<Source>, 10, 10);
    const sourceB = makeSource("sourceB" as Id<Source>, 40, 40);
    const room = createMockRoom("W1N1");
    (room as any).find = (type: number) => type === FIND_SOURCES ? [sourceA, sourceB] : [];
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => {
      if (id === sourceA.id) return sourceA;
      if (id === sourceB.id) return sourceB;
      return null;
    };

    const posNearA = { x: 11, y: 10, roomName: room.name, isNearTo: (target: Source) => target.id === sourceA.id, getRangeTo: (target: Source) => target.id === sourceA.id ? 1 : 20, findClosestByRange: () => sourceA, findInRange: () => [] };
    const harvester1 = createMockCreep("harvester1", { room, memory: { role: "harvester", family: "economy", homeRoom: room.name, version: 1 }, pos: posNearA });
    const harvester2 = createMockCreep("harvester2", { room, memory: { role: "harvester", family: "economy", homeRoom: room.name, version: 1 }, pos: posNearA });
    MockGame.creeps[harvester1.name] = harvester1;
    MockGame.creeps[harvester2.name] = harvester2;

    evaluateEconomyBehavior(makeContext(harvester1, room));
    evaluateEconomyBehavior(makeContext(harvester2, room));

    expect((harvester1.memory as { sourceId?: Id<Source> }).sourceId).to.equal(sourceA.id);
    expect((harvester2.memory as { sourceId?: Id<Source> }).sourceId).to.equal(sourceB.id);
  });
});

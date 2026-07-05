import { expect } from "chai";
import { TaskPriority, taskBoard } from "../src/tasks";
import { evaluateEconomyBehavior, getEconomyStateInterrupt } from "../src/behaviors/economy";
import { evaluateWithStateMachine } from "../src/behaviors/stateMachine";
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

function makeExtension(id: Id<StructureExtension>, freeCapacity: number): StructureExtension {
  return {
    id,
    structureType: STRUCTURE_EXTENSION,
    pos: { x: 12, y: 10, roomName: "W1N1" },
    store: makeStore(50 - freeCapacity, 50)
  } as unknown as StructureExtension;
}

function makeStorage(id: Id<StructureStorage>, used: number, capacity: number): StructureStorage {
  return {
    id,
    structureType: STRUCTURE_STORAGE,
    pos: { x: 20, y: 20, roomName: "W1N1" },
    store: makeStore(used, capacity)
  } as unknown as StructureStorage;
}

function makeTerminal(id: Id<StructureTerminal>, used: number, capacity: number): StructureTerminal {
  return {
    id,
    structureType: STRUCTURE_TERMINAL,
    pos: { x: 21, y: 20, roomName: "W1N1" },
    cooldown: 0,
    store: makeStore(used, capacity)
  } as unknown as StructureTerminal;
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

function makeHostile(id: Id<Creep>, x: number, y: number, username = "admon"): Creep {
  const body = [
    { type: RANGED_ATTACK, hits: 100 },
    { type: HEAL, hits: 100 },
    { type: MOVE, hits: 100 }
  ];

  return {
    id,
    name: `hostile-${id}`,
    owner: { username },
    hits: 5000,
    hitsMax: 5000,
    body,
    pos: { x, y, roomName: "W1N1" },
    getActiveBodyparts: (type: BodyPartConstant) => body.filter(part => part.type === type && part.hits > 0).length
  } as unknown as Creep;
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

  it("assigns another delivery creep when a partial refill reservation leaves energy remaining", () => {
    const extension = makeExtension("extension1" as Id<StructureExtension>, 50);
    const room = createMockRoom("W1N1");
    (room as any).find = (type: number) => type === FIND_MY_STRUCTURES ? [extension] : [];
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === extension.id ? extension : null;

    const creep1 = createMockCreep("hauler1", { room, memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1 }, store: makeStore(25, 50) });
    const creep2 = createMockCreep("hauler2", { room, memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1 }, store: makeStore(25, 50) });
    MockGame.creeps[creep1.name] = creep1;
    MockGame.creeps[creep2.name] = creep2;

    expect(taskBoard.getAssignedDeliveryAction(makeContext(creep1, room))?.type).to.equal("transfer");
    expect(taskBoard.getAssignedDeliveryAction(makeContext(creep2, room))?.type).to.equal("transfer");
    expect(taskBoard.describeAssignments(room.name)).to.contain("hauler1 -> refillExtension");
    expect(taskBoard.describeAssignments(room.name)).to.contain("hauler2 -> refillExtension");
  });

  it("includes the reserved amount on delivery transfer actions", () => {
    const extension = makeExtension("extension1" as Id<StructureExtension>, 50);
    const room = createMockRoom("W1N1");
    (room as any).find = (type: number) => type === FIND_MY_STRUCTURES ? [extension] : [];
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === extension.id ? extension : null;

    const creep = createMockCreep("hauler1", {
      room,
      memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1 },
      store: makeStore(200, 200),
    });
    MockGame.creeps[creep.name] = creep;

    const action = taskBoard.getAssignedDeliveryAction(makeContext(creep, room));

    expect(action?.type).to.equal("transfer");
    expect((action as Extract<CreepAction, { type: "transfer" }>).amount).to.equal(50);
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
    expect(stats?.staleReservations).to.equal(1);
  });

  it("reports stale reservations from the latest cleanup instead of accumulating forever", () => {
    const spawn = makeSpawn("spawn1" as Id<StructureSpawn>, 100);
    const room = createMockRoom("W1N1");
    (room as any).find = (type: number) => type === FIND_MY_STRUCTURES ? [spawn] : [];
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === spawn.id ? spawn : null;

    const creep = createMockCreep("hauler1", { room, memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1 }, store: makeStore(100, 100) });
    MockGame.creeps[creep.name] = creep;
    taskBoard.getAssignedDeliveryAction(makeContext(creep, room));

    delete MockGame.creeps[creep.name];
    expect(taskBoard.getStats(room.name)?.staleReservations).to.equal(1);

    Game.time++;
    expect(taskBoard.getStats(room.name)?.staleReservations).to.equal(0);
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

  it("uses assignedTaskId to keep existing delivery tasks without rescanning every board task", () => {
    const spawn = makeSpawn("spawn1" as Id<StructureSpawn>, 100);
    const room = createMockRoom("W1N1");
    (room as any).find = () => [];
    MockGame.rooms[room.name] = room;

    const creep = createMockCreep("hauler1", {
      room,
      memory: {
        role: "hauler",
        family: "economy",
        homeRoom: room.name,
        version: 1,
        assignedTaskId: "W1N1:refillSpawn:spawn1",
        assignedTaskPreemptCheckTick: Game.time
      } as any,
      store: makeStore(100, 100)
    });
    MockGame.creeps[creep.name] = creep;

    const tasks: Record<string, any> = {
      "W1N1:refillSpawn:spawn1": {
        id: "W1N1:refillSpawn:spawn1",
        roomName: room.name,
        type: "refillSpawn",
        priority: TaskPriority.CRITICAL,
        targetId: spawn.id,
        targetPos: { x: 10, y: 10, roomName: room.name },
        resourceType: RESOURCE_ENERGY,
        amount: 100,
        reservedAmount: 100,
        maxAssignments: 1,
        allowedRoles: ["hauler"],
        status: "assigned",
        assignedCreeps: [creep.name],
        reservations: { [creep.name]: { creepName: creep.name, amount: 100, assignedTick: Game.time, expiresTick: Game.time + 10 } },
        createdTick: Game.time,
        updatedTick: Game.time,
        expiresTick: Game.time + 50
      }
    };

    for (let i = 0; i < 20; i++) {
      tasks[`W1N1:storeEnergy:storage${i}`] = {
        ...tasks["W1N1:refillSpawn:spawn1"],
        id: `W1N1:storeEnergy:storage${i}`,
        type: "storeEnergy",
        priority: TaskPriority.LOW,
        targetId: `storage${i}`,
        targetPos: { x: 20, y: 20, roomName: room.name },
        reservedAmount: 0,
        maxAssignments: 1,
        status: "open",
        assignedCreeps: [],
        reservations: {}
      };
    }

    (Memory as any).creepTaskBoard = {
      enabled: true,
      rooms: {
        [room.name]: {
          roomName: room.name,
          tasks,
          lastGeneratedTick: Game.time,
          lastCleanedTick: Game.time,
          stats: { generated: 0, assigned: 0, completed: 0, invalidated: 0, staleReservations: 0, preemptions: 0 }
        }
      }
    };

    let getObjectByIdCalls = 0;
    MockGame.getObjectById = (id: string) => {
      getObjectByIdCalls++;
      return id === spawn.id ? spawn : null;
    };

    const action = taskBoard.getAssignedDeliveryAction(makeContext(creep, room));

    expect(action?.type).to.equal("transfer");
    expect(getObjectByIdCalls).to.equal(2);
  });

  it("prunes stale invisible room boards during visible room refresh", () => {
    Game.time = Math.max(Game.time, 3000);
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

  it("assigns terminal fill before storage when room storage enters energy export mode", () => {
    const storage = makeStorage("storage1" as Id<StructureStorage>, 850000, 1000000);
    const terminal = makeTerminal("terminal1" as Id<StructureTerminal>, 50000, 300000);
    const room = createMockRoom("W1N1", { controller: makeController("controller1" as Id<StructureController>), storage, terminal });
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => {
      if (id === terminal.id) return terminal;
      if (id === storage.id) return storage;
      return null;
    };

    const creep = createMockCreep("hauler1", { room, memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1 }, store: makeStore(100, 100) });
    MockGame.creeps[creep.name] = creep;

    const action = taskBoard.getAssignedDeliveryAction(makeContext(creep, room));

    expect(action?.type).to.equal("transfer");
    expect((action as Extract<CreepAction, { type: "transfer" }>).target).to.equal(terminal);
    expect(taskBoard.describeAssignments(room.name)).to.contain("hauler1 -> fillTerminalEnergy");
  });

  it("keeps terminal export tasks active until storage reaches the lower hysteresis threshold", () => {
    const storage = makeStorage("storage1" as Id<StructureStorage>, 850000, 1000000);
    const terminal = makeTerminal("terminal1" as Id<StructureTerminal>, 50000, 300000);
    const room = createMockRoom("W1N1", { controller: makeController("controller1" as Id<StructureController>), storage, terminal });
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => {
      if (id === terminal.id) return terminal;
      if (id === storage.id) return storage;
      return null;
    };

    const creep = createMockCreep("hauler1", { room, memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1 }, store: makeStore(100, 100) });
    MockGame.creeps[creep.name] = creep;

    expect((taskBoard.getAssignedDeliveryAction(makeContext(creep, room)) as Extract<CreepAction, { type: "transfer" }>).target).to.equal(terminal);

    (storage as unknown as { store: StoreDefinition }).store = makeStore(600000, 1000000);
    taskBoard.clear(room.name);
    expect((taskBoard.getAssignedDeliveryAction(makeContext(creep, room)) as Extract<CreepAction, { type: "transfer" }>).target).to.equal(terminal);

    (storage as unknown as { store: StoreDefinition }).store = makeStore(500000, 1000000);
    taskBoard.clear(room.name);
    const stopped = taskBoard.getAssignedDeliveryAction(makeContext(creep, room));
    expect(stopped?.type).to.equal("transfer");
    expect((stopped as Extract<CreepAction, { type: "transfer" }>).target).to.equal(storage);
  });

  it("caps low-priority storage task demand to an actionable haul batch", () => {
    const storage = makeStorage("storage1" as Id<StructureStorage>, 1000, 1000000);
    const room = createMockRoom("W1N1", { storage });
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === storage.id ? storage : null;

    taskBoard.refreshRoom(room);

    const task = (Memory as any).creepTaskBoard.rooms[room.name].tasks[`${room.name}:storeEnergy:${storage.id}`];
    expect(task.amount).to.equal(1000);
    expect(task.maxAssignments).to.equal(20);
  });

  it("stops assigning storage delivery once the actionable batch is reserved", () => {
    const storage = makeStorage("storage1" as Id<StructureStorage>, 1000, 1000000);
    const room = createMockRoom("W1N1", { storage });
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === storage.id ? storage : null;

    const first = createMockCreep("hauler1", { room, memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1 }, store: makeStore(500, 500) });
    const second = createMockCreep("hauler2", { room, memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1 }, store: makeStore(500, 500) });
    const third = createMockCreep("hauler3", { room, memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1 }, store: makeStore(500, 500) });
    MockGame.creeps[first.name] = first;
    MockGame.creeps[second.name] = second;
    MockGame.creeps[third.name] = third;

    expect(taskBoard.getAssignedDeliveryAction(makeContext(first, room))?.type).to.equal("transfer");
    expect(taskBoard.getAssignedDeliveryAction(makeContext(second, room))?.type).to.equal("transfer");
    expect(taskBoard.getAssignedDeliveryAction(makeContext(third, room))).to.equal(null);

    const task = (Memory as any).creepTaskBoard.rooms[room.name].tasks[`${room.name}:storeEnergy:${storage.id}`];
    expect(task.reservedAmount).to.equal(1000);
  });

  it("uses ranged attacks for ranged-only defenders assigned defend tasks", () => {
    const hostile = makeHostile("hostile1" as Id<Creep>, 20, 20);
    const room = createMockRoom("W1N1");
    (room as any).find = (type: number) => type === FIND_HOSTILE_CREEPS ? [hostile] : [];
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === hostile.id ? hostile : null;

    const ranger = createMockCreep("ranger1", {
      room,
      memory: { role: "ranger", family: "military", homeRoom: room.name, version: 1 },
      body: [{ type: RANGED_ATTACK, hits: 100 }, { type: MOVE, hits: 100 }]
    });
    MockGame.creeps[ranger.name] = ranger;

    const action = taskBoard.getAssignedAction(makeContext(ranger, room));

    expect(action?.type).to.equal("rangedAttack");
    expect((action as Extract<CreepAction, { type: "rangedAttack" }>).target).to.equal(hostile);
  });

  it("keeps melee defenders on attack actions for defend tasks", () => {
    const hostile = makeHostile("hostile1" as Id<Creep>, 20, 20);
    const room = createMockRoom("W1N1");
    (room as any).find = (type: number) => type === FIND_HOSTILE_CREEPS ? [hostile] : [];
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === hostile.id ? hostile : null;

    const guard = createMockCreep("guard1", {
      room,
      memory: { role: "guard", family: "military", homeRoom: room.name, version: 1 },
      body: [{ type: ATTACK, hits: 100 }, { type: MOVE, hits: 100 }]
    });
    MockGame.creeps[guard.name] = guard;

    const action = taskBoard.getAssignedAction(makeContext(guard, room));

    expect(action?.type).to.equal("attack");
    expect((action as Extract<CreepAction, { type: "attack" }>).target).to.equal(hostile);
  });

  it("does not create defend assignments for permanent allies", () => {
    const ally = makeHostile("ally1" as Id<Creep>, 20, 20, "TooAngel");
    const room = createMockRoom("W1N1");
    (room as any).find = (type: number) => type === FIND_HOSTILE_CREEPS ? [ally] : [];
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === ally.id ? ally : null;

    const ranger = createMockCreep("ranger1", {
      room,
      memory: { role: "ranger", family: "military", homeRoom: room.name, version: 1 },
      body: [{ type: RANGED_ATTACK, hits: 100 }, { type: MOVE, hits: 100 }]
    });
    MockGame.creeps[ranger.name] = ranger;

    expect(taskBoard.getAssignedAction(makeContext(ranger, room))).to.equal(null);
    expect(taskBoard.getStats(room.name)).to.include({ open: 0, assigned: 0, reservations: 0 });
  });

  it("does not create defend assignments for runtime configured allies", () => {
    const ally = makeHostile("ally1" as Id<Creep>, 20, 20, "FriendlyNeighbor");
    const room = createMockRoom("W1N1");
    (room as any).find = (type: number) => type === FIND_HOSTILE_CREEPS ? [ally] : [];
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === ally.id ? ally : null;
    (Memory as any).empire = { diplomacy: { allies: ["FriendlyNeighbor"] } };

    try {
      const ranger = createMockCreep("ranger1", {
        room,
        memory: { role: "ranger", family: "military", homeRoom: room.name, version: 1 },
        body: [{ type: RANGED_ATTACK, hits: 100 }, { type: MOVE, hits: 100 }]
      });
      MockGame.creeps[ranger.name] = ranger;

      expect(taskBoard.getAssignedAction(makeContext(ranger, room))).to.equal(null);
      expect(taskBoard.getStats(room.name)).to.include({ open: 0, assigned: 0, reservations: 0 });
    } finally {
      delete (Memory as any).empire;
    }
  });

  it("invalidates stale defend tasks when the target becomes a runtime configured ally", () => {
    const ally = makeHostile("ally1" as Id<Creep>, 20, 20, "FriendlyNeighbor");
    const room = createMockRoom("W1N1");
    (room as any).find = () => [];
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === ally.id ? ally : null;
    (Memory as any).empire = { diplomacy: { allies: ["FriendlyNeighbor"] } };

    try {
      const ranger = createMockCreep("ranger1", {
        room,
        memory: { role: "ranger", family: "military", homeRoom: room.name, version: 1 },
        body: [{ type: RANGED_ATTACK, hits: 100 }, { type: MOVE, hits: 100 }]
      });
      MockGame.creeps[ranger.name] = ranger;
      (Memory as any).creepTaskBoard = {
        enabled: true,
        rooms: {
          [room.name]: {
            roomName: room.name,
            tasks: {
              [`${room.name}:defend:${ally.id}`]: {
                id: `${room.name}:defend:${ally.id}`,
                roomName: room.name,
                type: "defend",
                priority: TaskPriority.CRITICAL,
                targetId: ally.id,
                targetPos: { x: 20, y: 20, roomName: room.name },
                amount: ally.hits,
                reservedAmount: 0,
                maxAssignments: 3,
                allowedRoles: ["ranger"],
                status: "open",
                assignedCreeps: [],
                reservations: {},
                createdTick: Game.time - 1,
                updatedTick: Game.time - 1,
                expiresTick: Game.time + 50
              }
            },
            lastGeneratedTick: Game.time,
            lastCleanedTick: Game.time - 1,
            stats: { generated: 0, assigned: 0, completed: 0, invalidated: 0, staleReservations: 0, preemptions: 0 }
          }
        }
      };

      expect(taskBoard.getAssignedAction(makeContext(ranger, room))).to.equal(null);
      expect((Memory as any).creepTaskBoard.rooms[room.name].tasks).to.deep.equal({});
      expect(taskBoard.getStats(room.name)).to.include({ open: 0, assigned: 0, reservations: 0 });
    } finally {
      delete (Memory as any).empire;
    }
  });

  it("can be disabled as rollback", () => {
    taskBoard.setEnabled(false);
    const room = createMockRoom("W1N1");
    const creep = createMockCreep("hauler1", { room, memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1 }, store: makeStore(100, 100) });
    expect(taskBoard.getAssignedDeliveryAction(makeContext(creep, room))).to.equal(null);
  });

  it("does not generate unconsumed build repair or upgrade tasks", () => {
    const controller = makeController("controller1" as Id<StructureController>);
    const site = {
      id: "site1" as Id<ConstructionSite>,
      structureType: STRUCTURE_EXTENSION,
      progress: 0,
      progressTotal: 100,
      pos: { x: 14, y: 10, roomName: "W1N1" }
    } as ConstructionSite;
    const road = {
      id: "road1" as Id<StructureRoad>,
      structureType: STRUCTURE_ROAD,
      hits: 100,
      hitsMax: 5000,
      pos: { x: 15, y: 10, roomName: "W1N1" }
    } as StructureRoad;
    const room = createMockRoom("W1N1", { controller });
    (room as any).find = (type: number) => {
      if (type === FIND_MY_STRUCTURES) return [];
      if (type === FIND_MY_CONSTRUCTION_SITES) return [site];
      if (type === FIND_STRUCTURES) return [road];
      if (type === FIND_MY_CREEPS) return [];
      return [];
    };
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => {
      if (id === site.id) return site;
      if (id === road.id) return road;
      if (id === controller.id) return controller;
      return null;
    };

    taskBoard.refreshRoom(room);

    const description = taskBoard.describe(room.name);
    expect(description).to.not.contain(" build ");
    expect(description).to.not.contain(" repair ");
    expect(description).to.not.contain(" upgrade ");
    expect(taskBoard.getStats(room.name)).to.include({ open: 0, assigned: 0, reservations: 0 });
  });

  it("prunes legacy build repair and upgrade tasks from memory while keeping delivery tasks", () => {
    const extension = makeExtension("extension1" as Id<StructureExtension>, 50);
    const controller = makeController("controller1" as Id<StructureController>);
    const site = {
      id: "site1" as Id<ConstructionSite>,
      structureType: STRUCTURE_EXTENSION,
      progress: 0,
      progressTotal: 100,
      pos: { x: 14, y: 10, roomName: "W1N1" }
    } as ConstructionSite;
    const road = {
      id: "road1" as Id<StructureRoad>,
      structureType: STRUCTURE_ROAD,
      hits: 100,
      hitsMax: 5000,
      pos: { x: 15, y: 10, roomName: "W1N1" }
    } as StructureRoad;
    const room = createMockRoom("W1N1", { controller });
    (room as any).find = (type: number) => {
      if (type === FIND_MY_STRUCTURES) return [extension];
      if (type === FIND_MY_CREEPS) return [];
      return [];
    };
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => {
      if (id === extension.id) return extension;
      if (id === site.id) return site;
      if (id === road.id) return road;
      if (id === controller.id) return controller;
      return null;
    };

    const builder = createMockCreep("builder1", {
      room,
      memory: { role: "builder", family: "economy", homeRoom: room.name, version: 1, assignedTaskId: `${room.name}:build:${site.id}` } as any,
      store: makeStore(50, 50),
      body: [{ type: WORK, hits: 100 }, { type: CARRY, hits: 100 }, { type: MOVE, hits: 100 }]
    });
    MockGame.creeps[builder.name] = builder;

    const baseTask = {
      roomName: room.name,
      priority: TaskPriority.NORMAL,
      amount: 50,
      maxAssignments: 1,
      allowedRoles: ["builder"],
      createdTick: Game.time - 10,
      updatedTick: Game.time - 10,
      expiresTick: Game.time + 50,
      reservedAmount: 0,
      assignedCreeps: [],
      reservations: {},
      status: "open"
    };

    (Memory as any).creepTaskBoard = {
      enabled: true,
      rooms: {
        [room.name]: {
          roomName: room.name,
          tasks: {
            [`${room.name}:build:${site.id}`]: {
              ...baseTask,
              id: `${room.name}:build:${site.id}`,
              type: "build",
              targetId: site.id,
              targetPos: { x: 14, y: 10, roomName: room.name },
              reservedAmount: 50,
              assignedCreeps: [builder.name],
              reservations: { [builder.name]: { creepName: builder.name, amount: 50, assignedTick: Game.time - 1, expiresTick: Game.time + 10 } },
              status: "assigned"
            },
            [`${room.name}:repair:${road.id}`]: {
              ...baseTask,
              id: `${room.name}:repair:${road.id}`,
              type: "repair",
              targetId: road.id,
              targetPos: { x: 15, y: 10, roomName: room.name }
            },
            [`${room.name}:upgrade:${controller.id}`]: {
              ...baseTask,
              id: `${room.name}:upgrade:${controller.id}`,
              type: "upgrade",
              targetId: controller.id,
              targetPos: { x: 40, y: 40, roomName: room.name }
            },
            [`${room.name}:refillExtension:${extension.id}`]: {
              ...baseTask,
              id: `${room.name}:refillExtension:${extension.id}`,
              type: "refillExtension",
              priority: TaskPriority.HIGH,
              targetId: extension.id,
              targetPos: { x: 12, y: 10, roomName: room.name },
              resourceType: RESOURCE_ENERGY,
              allowedRoles: ["hauler"]
            }
          },
          lastGeneratedTick: Game.time,
          lastCleanedTick: Game.time - 1,
          stats: { generated: 0, assigned: 0, completed: 0, invalidated: 0, staleReservations: 0, preemptions: 0 }
        }
      }
    };

    taskBoard.refreshRoom(room);

    const board = (Memory as any).creepTaskBoard.rooms[room.name];
    expect(Object.values(board.tasks).map((task: any) => task.type)).to.deep.equal(["refillExtension"]);
    expect(board.stats.invalidated).to.equal(3);
    expect((builder.memory as any).assignedTaskId).to.equal(undefined);
  });

  it("interrupts a committed builder upgrade state for critical refill task-board work", () => {
    const extension = makeExtension("extension1" as Id<StructureExtension>, 50);
    const controller = makeController("controller1" as Id<StructureController>);
    const room = createMockRoom("W1N1", { controller });
    (room as any).find = (type: number) => {
      if (type === FIND_MY_STRUCTURES) return [extension];
      if (type === FIND_MY_CONSTRUCTION_SITES) return [];
      if (type === FIND_STRUCTURES) return [];
      if (type === FIND_MY_CREEPS) return [];
      return [];
    };
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === extension.id ? extension : id === controller.id ? controller : null;

    const creep = createMockCreep("builder1", {
      room,
      memory: {
        role: "builder",
        family: "economy",
        homeRoom: room.name,
        version: 1,
        working: true,
        state: { action: "upgrade", targetId: controller.id, startTick: Game.time - 1, timeout: 25 }
      },
      store: makeStore(50, 50),
      pos: { x: 25, y: 25, roomName: room.name, getRangeTo: () => 10, isNearTo: () => false, findInRange: () => [] }
    });
    MockGame.creeps[creep.name] = creep;

    expect(getEconomyStateInterrupt).to.be.a("function");
    const action = evaluateWithStateMachine(makeContext(creep, room), evaluateEconomyBehavior, {
      interrupt: getEconomyStateInterrupt
    });

    expect(action.type).to.equal("transfer");
    expect((action as Extract<CreepAction, { type: "transfer" }>).target).to.equal(extension);
    expect((creep.memory as any).state.action).to.equal("transfer");
    expect(taskBoard.describeAssignments(room.name)).to.contain("builder1 -> refillExtension");
  });

  it("clears stale creep assignment memory when no matching reservation exists", () => {
    const room = createMockRoom("W1N1");
    (room as any).find = () => [];
    MockGame.rooms[room.name] = room;

    const creep = createMockCreep("hauler1", {
      room,
      memory: {
        role: "hauler",
        family: "economy",
        homeRoom: room.name,
        version: 1,
        working: true,
        assignedTaskId: "W1N1:refillExtension:missing"
      },
      store: makeStore(50, 50)
    });
    MockGame.creeps[creep.name] = creep;

    const action = taskBoard.getAssignedDeliveryAction(makeContext(creep, room));

    expect(action).to.equal(null);
    expect((creep.memory as any).assignedTaskId).to.equal(undefined);
  });

  it("repairs stale assignment memory when an active reservation exists", () => {
    const extension = makeExtension("extension1" as Id<StructureExtension>, 50);
    const room = createMockRoom("W1N1");
    (room as any).find = (type: number) => type === FIND_MY_STRUCTURES ? [extension] : [];
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === extension.id ? extension : null;

    const creep = createMockCreep("hauler1", {
      room,
      memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1, working: true },
      store: makeStore(50, 50)
    });
    MockGame.creeps[creep.name] = creep;

    const firstAction = taskBoard.getAssignedDeliveryAction(makeContext(creep, room));
    expect(firstAction?.type).to.equal("transfer");
    const assignedTaskId = (creep.memory as any).assignedTaskId;
    (creep.memory as any).assignedTaskId = "W1N1:refillExtension:stale";

    const continuedAction = taskBoard.getAssignedDeliveryAction(makeContext(creep, room));

    expect(continuedAction?.type).to.equal("transfer");
    expect((creep.memory as any).assignedTaskId).to.equal(assignedTaskId);
  });

  it("does not interrupt active-hauler upgraders for extension refill", () => {
    const extension = makeExtension("extension1" as Id<StructureExtension>, 50);
    const controller = makeController("controller1" as Id<StructureController>);
    const room = createMockRoom("W1N1", { controller });
    (room as any).find = (type: number) => type === FIND_MY_STRUCTURES ? [extension] : [];
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === extension.id ? extension : id === controller.id ? controller : null;

    const hauler = createMockCreep("hauler1", {
      room,
      memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1 },
      store: makeStore(0, 50)
    });
    const upgrader = createMockCreep("upgrader1", {
      room,
      memory: { role: "upgrader", family: "economy", homeRoom: room.name, version: 1, working: true },
      store: makeStore(50, 50)
    });
    MockGame.creeps[hauler.name] = hauler;
    MockGame.creeps[upgrader.name] = upgrader;

    const interrupt = getEconomyStateInterrupt(makeContext(upgrader, room), {
      action: "upgrade",
      targetId: controller.id,
      startTick: Game.time - 1,
      timeout: 25
    });

    expect(interrupt).to.equal(null);
    expect(taskBoard.describeAssignments(room.name)).to.not.contain("upgrader1 -> refillExtension");
  });

  it("assigns builder critical extension refill through the task board before direct build fallback", () => {
    const extension = makeExtension("extension1" as Id<StructureExtension>, 50);
    const controller = makeController("controller1" as Id<StructureController>);
    const room = createMockRoom("W1N1", { controller });
    (room as any).find = (type: number) => {
      if (type === FIND_MY_STRUCTURES) return [extension];
      if (type === FIND_MY_CONSTRUCTION_SITES) return [];
      if (type === FIND_STRUCTURES) return [];
      if (type === FIND_MY_CREEPS) return [];
      return [];
    };
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === extension.id ? extension : null;

    const creep = createMockCreep("builder1", {
      room,
      memory: { role: "builder", family: "economy", homeRoom: room.name, version: 1, working: true },
      store: makeStore(50, 50),
      pos: { x: 25, y: 25, roomName: room.name, getRangeTo: () => 10, isNearTo: () => false, findInRange: () => [] }
    });
    MockGame.creeps[creep.name] = creep;

    const action = evaluateEconomyBehavior(makeContext(creep, room));

    expect(action.type).to.equal("transfer");
    expect((action as Extract<CreepAction, { type: "transfer" }>).target).to.equal(extension);
    expect(taskBoard.describeAssignments(room.name)).to.contain("builder1 -> refillExtension");
  });

  it("assigns upgrader critical extension refill through the task board before direct upgrade fallback", () => {
    const extension = makeExtension("extension1" as Id<StructureExtension>, 50);
    const controller = makeController("controller1" as Id<StructureController>);
    const room = createMockRoom("W1N1", { controller });
    (room as any).find = (type: number) => {
      if (type === FIND_MY_STRUCTURES) return [extension];
      if (type === FIND_MY_CONSTRUCTION_SITES) return [];
      if (type === FIND_STRUCTURES) return [];
      if (type === FIND_MY_CREEPS) return [];
      return [];
    };
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === extension.id ? extension : null;

    const creep = createMockCreep("upgrader1", {
      room,
      memory: { role: "upgrader", family: "economy", homeRoom: room.name, version: 1, working: true },
      store: makeStore(50, 50),
      pos: { x: 25, y: 25, roomName: room.name, getRangeTo: () => 10, isNearTo: () => false, findInRange: () => [] }
    });
    MockGame.creeps[creep.name] = creep;

    const action = evaluateEconomyBehavior(makeContext(creep, room));

    expect(action.type).to.equal("transfer");
    expect((action as Extract<CreepAction, { type: "transfer" }>).target).to.equal(extension);
    expect(taskBoard.describeAssignments(room.name)).to.contain("upgrader1 -> refillExtension");
  });

  it("does not duplicate direct builder refill when a task-board reservation already owns the target", () => {
    const extension = makeExtension("extension1" as Id<StructureExtension>, 50);
    const controller = makeController("controller1" as Id<StructureController>);
    const room = createMockRoom("W1N1", { controller });
    (room as any).find = (type: number) => {
      if (type === FIND_MY_STRUCTURES) return [extension];
      if (type === FIND_MY_CONSTRUCTION_SITES) return [];
      if (type === FIND_STRUCTURES) return [];
      if (type === FIND_MY_CREEPS) return [];
      return [];
    };
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === extension.id ? extension : null;

    const first = createMockCreep("builder1", {
      room,
      memory: { role: "builder", family: "economy", homeRoom: room.name, version: 1, working: true },
      store: makeStore(50, 50)
    });
    const second = createMockCreep("builder2", {
      room,
      memory: { role: "builder", family: "economy", homeRoom: room.name, version: 1, working: true },
      store: makeStore(50, 50)
    });
    MockGame.creeps[first.name] = first;
    MockGame.creeps[second.name] = second;

    const firstContext = makeContext(first, room);
    firstContext.spawnStructures = [extension];
    const secondContext = makeContext(second, room);
    secondContext.spawnStructures = [extension];

    expect(evaluateEconomyBehavior(firstContext).type).to.equal("transfer");
    const secondAction = evaluateEconomyBehavior(secondContext);

    expect(secondAction.type).to.equal("upgrade");
    expect(taskBoard.describeAssignments(room.name)).to.contain("builder1 -> refillExtension");
    expect(taskBoard.describeAssignments(room.name)).to.not.contain("builder2 -> refillExtension");
  });

  it("does not duplicate direct upgrader refill when a task-board reservation already owns the target", () => {
    const extension = makeExtension("extension1" as Id<StructureExtension>, 50);
    const controller = makeController("controller1" as Id<StructureController>);
    const room = createMockRoom("W1N1", { controller });
    (room as any).find = (type: number) => {
      if (type === FIND_MY_STRUCTURES) return [extension];
      if (type === FIND_MY_CONSTRUCTION_SITES) return [];
      if (type === FIND_STRUCTURES) return [];
      if (type === FIND_MY_CREEPS) return [];
      return [];
    };
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === extension.id ? extension : null;

    const first = createMockCreep("upgrader1", {
      room,
      memory: { role: "upgrader", family: "economy", homeRoom: room.name, version: 1, working: true },
      store: makeStore(50, 50)
    });
    const second = createMockCreep("upgrader2", {
      room,
      memory: { role: "upgrader", family: "economy", homeRoom: room.name, version: 1, working: true },
      store: makeStore(50, 50)
    });
    MockGame.creeps[first.name] = first;
    MockGame.creeps[second.name] = second;

    const firstContext = makeContext(first, room);
    firstContext.spawnStructures = [extension];
    const secondContext = makeContext(second, room);
    secondContext.spawnStructures = [extension];

    expect(evaluateEconomyBehavior(firstContext).type).to.equal("transfer");
    const secondAction = evaluateEconomyBehavior(secondContext);

    expect(secondAction.type).to.equal("upgrade");
    expect(taskBoard.describeAssignments(room.name)).to.contain("upgrader1 -> refillExtension");
    expect(taskBoard.describeAssignments(room.name)).to.not.contain("upgrader2 -> refillExtension");
  });

  it("does not duplicate direct hauler refill when a task-board reservation already owns the target", () => {
    const extension = makeExtension("extension1" as Id<StructureExtension>, 50);
    const room = createMockRoom("W1N1");
    (room as any).find = (type: number) => {
      if (type === FIND_MY_STRUCTURES) return [extension];
      if (type === FIND_MY_CONSTRUCTION_SITES) return [];
      if (type === FIND_STRUCTURES) return [];
      if (type === FIND_MY_CREEPS) return [];
      return [];
    };
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === extension.id ? extension : null;

    const first = createMockCreep("hauler1", {
      room,
      memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1, working: true },
      store: makeStore(50, 50)
    });
    const second = createMockCreep("hauler2", {
      room,
      memory: { role: "hauler", family: "economy", homeRoom: room.name, version: 1, working: true },
      store: makeStore(50, 50)
    });
    MockGame.creeps[first.name] = first;
    MockGame.creeps[second.name] = second;

    const firstContext = makeContext(first, room);
    firstContext.spawnStructures = [extension];
    const secondContext = makeContext(second, room);
    secondContext.spawnStructures = [extension];

    expect(evaluateEconomyBehavior(firstContext).type).to.equal("transfer");
    const secondAction = evaluateEconomyBehavior(secondContext);

    expect(secondAction.type).to.not.equal("transfer");
    expect(taskBoard.describeAssignments(room.name)).to.contain("hauler1 -> refillExtension");
    expect(taskBoard.describeAssignments(room.name)).to.not.contain("hauler2 -> refillExtension");
  });

  it("does not duplicate direct larvaWorker refill when a task-board reservation already owns the target", () => {
    const extension = makeExtension("extension1" as Id<StructureExtension>, 50);
    const controller = makeController("controller1" as Id<StructureController>);
    const room = createMockRoom("W1N1", { controller });
    (room as any).find = (type: number) => {
      if (type === FIND_MY_STRUCTURES) return [extension];
      if (type === FIND_MY_CONSTRUCTION_SITES) return [];
      if (type === FIND_STRUCTURES) return [];
      if (type === FIND_MY_CREEPS) return [];
      return [];
    };
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === extension.id ? extension : null;

    const first = createMockCreep("larva1", {
      room,
      memory: { role: "larvaWorker", family: "economy", homeRoom: room.name, version: 1, working: true },
      store: makeStore(50, 50)
    });
    const second = createMockCreep("larva2", {
      room,
      memory: { role: "larvaWorker", family: "economy", homeRoom: room.name, version: 1, working: true },
      store: makeStore(50, 50)
    });
    MockGame.creeps[first.name] = first;
    MockGame.creeps[second.name] = second;

    const firstContext = makeContext(first, room);
    firstContext.spawnStructures = [extension];
    const secondContext = makeContext(second, room);
    secondContext.spawnStructures = [extension];

    expect(evaluateEconomyBehavior(firstContext).type).to.equal("transfer");
    const secondAction = evaluateEconomyBehavior(secondContext);

    expect(secondAction.type).to.equal("upgrade");
    expect(taskBoard.describeAssignments(room.name)).to.contain("larva1 -> refillExtension");
    expect(taskBoard.describeAssignments(room.name)).to.not.contain("larva2 -> refillExtension");
  });

  it("does not duplicate direct remoteHauler refill when a task-board reservation already owns the target", () => {
    const extension = makeExtension("extension1" as Id<StructureExtension>, 50);
    const room = createMockRoom("W1N1");
    (room as any).find = (type: number) => {
      if (type === FIND_MY_STRUCTURES) return [extension];
      if (type === FIND_MY_CONSTRUCTION_SITES) return [];
      if (type === FIND_STRUCTURES) return [];
      if (type === FIND_MY_CREEPS) return [];
      return [];
    };
    MockGame.rooms[room.name] = room;
    MockGame.getObjectById = (id: string) => id === extension.id ? extension : null;

    const first = createMockCreep("remoteHauler1", {
      room,
      memory: { role: "remoteHauler", family: "economy", homeRoom: room.name, targetRoom: "W2N2", version: 1, working: true },
      store: makeStore(50, 50)
    });
    const second = createMockCreep("remoteHauler2", {
      room,
      memory: { role: "remoteHauler", family: "economy", homeRoom: room.name, targetRoom: "W2N2", version: 1, working: true },
      store: makeStore(50, 50)
    });
    MockGame.creeps[first.name] = first;
    MockGame.creeps[second.name] = second;

    const firstContext = makeContext(first, room);
    firstContext.spawnStructures = [extension];
    const secondContext = makeContext(second, room);
    secondContext.spawnStructures = [extension];

    expect(evaluateEconomyBehavior(firstContext).type).to.equal("transfer");
    const secondAction = evaluateEconomyBehavior(secondContext);

    expect(secondAction.type).to.equal("remoteMoveToRoom");
    expect(taskBoard.describeAssignments(room.name)).to.contain("remoteHauler1 -> refillExtension");
    expect(taskBoard.describeAssignments(room.name)).to.not.contain("remoteHauler2 -> refillExtension");
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

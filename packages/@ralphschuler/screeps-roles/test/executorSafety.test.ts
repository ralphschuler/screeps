import { expect } from "chai";
import { executeAction, executePowerCreepAction, type CreepAction, type CreepContext } from "../src/index";
import { createMockCreep, createMockRoom, resetMockGame } from "./setup";

describe("Action execution ally-safety guard", () => {
  beforeEach(() => {
    resetMockGame();
  });

  function createTestContext(creep: Creep, room: Room): CreepContext {
    return {
      creep,
      room,
      memory: creep.memory as CreepContext["memory"],
      swarmState: undefined,
      squadMemory: undefined,
      homeRoom: room.name,
      isInHomeRoom: true,
      isFull: false,
      isEmpty: true,
      isWorking: false,
      assignedSource: null,
      assignedMineral: null,
      energyAvailable: false,
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
      mineralContainers: [],
    };
  }

  it("blocks creep attack actions against known allies", () => {
    const room = createMockRoom("W1N1");
    let attackCalled = false;

    const creep = createMockCreep("guard1", {
      room,
      memory: {
        role: "soldier",
        homeRoom: room.name,
        working: false,
        state: { action: "attack", targetId: "ally01", startTick: Game.time, timeout: 25 },
      },
    });
    (creep as any).attack = () => {
      attackCalled = true;
      return OK;
    };

    const allyCreep = {
      id: "ally01",
      owner: { username: "TooAngel" },
      pos: new RoomPosition(10, 10, room.name),
    } as unknown as Creep;

    Game.creeps[creep.name] = creep;
    Game.rooms[room.name] = room;

    executeAction(creep, { type: "attack", target: allyCreep }, createTestContext(creep, room));

    expect(attackCalled).to.equal(false);
    expect(creep.memory.state).to.equal(undefined);
  });

  it("allows attack actions against non-ally targets", () => {
    const room = createMockRoom("W1N1");
    let attackCalled = false;

    const creep = createMockCreep("guard2", {
      room,
      memory: {
        role: "soldier",
        homeRoom: room.name,
        working: false,
      },
    });
    (creep as any).attack = () => {
      attackCalled = true;
      return OK;
    };

    const hostileCreep = {
      id: "hostile01",
      owner: { username: "Enemy" },
      pos: new RoomPosition(10, 10, room.name),
    } as unknown as Creep;

    Game.creeps[creep.name] = creep;
    Game.rooms[room.name] = room;

    executeAction(creep, { type: "attack", target: hostileCreep }, createTestContext(creep, room));

    expect(attackCalled).to.equal(true);
  });

  it("passes bounded explicit transfer amounts to creep.transfer", () => {
    const room = createMockRoom("W1N1");
    let transferArgs: [AnyStoreStructure, ResourceConstant, number | undefined] | undefined;
    const extension = {
      id: "extension1" as Id<StructureExtension>,
      structureType: STRUCTURE_EXTENSION,
      pos: new RoomPosition(10, 10, room.name),
      store: { getFreeCapacity: () => 50 },
    } as unknown as StructureExtension;
    const creep = createMockCreep("hauler1", {
      room,
      memory: { role: "hauler", homeRoom: room.name, working: true },
      store: {
        getUsedCapacity: () => 200,
        getFreeCapacity: () => 0,
        getCapacity: () => 200,
      } as Creep["store"],
    });
    (creep as unknown as { transfer: typeof creep.transfer }).transfer = (
      target,
      resourceType,
      amount,
    ) => {
      transferArgs = [target as AnyStoreStructure, resourceType, amount];
      return OK;
    };
    Game.creeps[creep.name] = creep;
    Game.rooms[room.name] = room;

    executeAction(
      creep,
      { type: "transfer", target: extension, resourceType: RESOURCE_ENERGY, amount: 80 },
      createTestContext(creep, room),
    );

    expect(transferArgs).to.deep.equal([extension, RESOURCE_ENERGY, 50]);
  });

  it("leaves direct transfer actions unbounded when no amount is provided", () => {
    const room = createMockRoom("W1N1");
    let transferArgs: [AnyStoreStructure, ResourceConstant, number | undefined] | undefined;
    const storage = {
      id: "storage1" as Id<StructureStorage>,
      structureType: STRUCTURE_STORAGE,
      pos: new RoomPosition(10, 10, room.name),
      store: { getFreeCapacity: () => 1000 },
    } as unknown as StructureStorage;
    const creep = createMockCreep("hauler1", {
      room,
      memory: { role: "hauler", homeRoom: room.name, working: true },
    });
    (creep as unknown as { transfer: typeof creep.transfer }).transfer = (
      target,
      resourceType,
      amount,
    ) => {
      transferArgs = [target as AnyStoreStructure, resourceType, amount];
      return OK;
    };
    Game.creeps[creep.name] = creep;
    Game.rooms[room.name] = room;

    executeAction(
      creep,
      { type: "transfer", target: storage, resourceType: RESOURCE_ENERGY },
      createTestContext(creep, room),
    );

    expect(transferArgs).to.deep.equal([storage, RESOURCE_ENERGY, undefined]);
  });

  it("clears stale controller-action state when the creep has no active CLAIM parts", () => {
    const room = createMockRoom("W1N1");
    const controller = {
      id: "controller1" as Id<StructureController>,
      pos: new RoomPosition(10, 10, room.name),
    } as StructureController;
    const cases: Array<{
      action: "claim" | "reserve" | "attackController";
      method: "claimController" | "reserveController" | "attackController";
    }> = [
      { action: "claim", method: "claimController" },
      { action: "reserve", method: "reserveController" },
      { action: "attackController", method: "attackController" },
    ];

    for (const { action, method } of cases) {
      const creep = createMockCreep(`claimer-${action}`, {
        room,
        memory: {
          role: "claimer",
          homeRoom: room.name,
          working: false,
          state: { action, targetId: controller.id, startTick: Game.time, timeout: 25 },
        },
        body: [{ type: MOVE, hits: 100 }],
      });
      (creep as unknown as Record<typeof method, () => ScreepsReturnCode>)[method] = () => ERR_NO_BODYPART;

      Game.creeps[creep.name] = creep;
      Game.rooms[room.name] = room;

      executeAction(creep, { type: action, target: controller } as CreepAction, createTestContext(creep, room));

      expect(creep.memory.state, action).to.equal(undefined);
    }
  });

  it("blocks disruptive power actions against known allies", () => {
    const room = createMockRoom("W1N1");
    let usePowerCalled = false;

    const powerCreep: PowerCreep = {
      name: "pc1",
      pos: {
        x: 10,
        y: 10,
        roomName: room.name,
        isEqualTo: () => false,
        isNearTo: () => false,
        inRangeTo: () => true,
        getRangeTo: () => 0,
        findInRange: () => [],
        findClosestByRange: () => null,
        findClosestByPath: () => null,
        lookFor: () => [],
      } as unknown as RoomPosition,
      room,
      getActiveBodyparts: () => 0,
      usePower: () => {
        usePowerCalled = true;
        return OK;
      },
      cancelOrder: () => OK,
      move: () => OK,
      moveByPath: () => OK,
      moveByDirection: () => OK,
      moveTo: () => OK,
      renew: () => OK,
      enableRoom: () => OK,
      say: () => OK,
      notifyWhenAttacked: () => OK,
      getOffPath: () => false,
      drop: () => OK,
      suicide: () => OK,
      transfer: () => OK,
      withdraw: () => OK,
    } as unknown as PowerCreep;

    const allyTerminal = {
      id: "ally-term",
      owner: { username: "TedRoastBeef" },
      structureType: STRUCTURE_TERMINAL,
      effects: [],
      pos: new RoomPosition(10, 10, room.name),
    } as unknown as StructureTerminal;

    executePowerCreepAction(powerCreep, {
      type: "usePower",
      power: PWR_DISRUPT_TERMINAL,
      target: allyTerminal,
    });

    expect(usePowerCalled).to.equal(false);
  });
});

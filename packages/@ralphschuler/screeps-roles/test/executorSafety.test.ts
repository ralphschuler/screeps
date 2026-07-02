import { expect } from "chai";
import { executeAction, executePowerCreepAction, type CreepContext } from "../src/index";
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

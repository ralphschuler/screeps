import { expect } from "chai";
import { guard, ranger, healer, type CreepContext } from "../src/index";
import { createMockCreep, createMockRoom, resetMockGame } from "./setup";

function createAssistContext(
  role: "guard" | "ranger" | "healer",
  hostileStructures: Structure[],
  options: { roomName?: string; assistTarget?: string; extraMemory?: Record<string, unknown> } = {}
): CreepContext {
  const room = createMockRoom(options.roomName ?? "W2N1");
  (room as any).find = (type: number) => {
    if (type === FIND_HOSTILE_CREEPS) return [];
    if (type === FIND_HOSTILE_STRUCTURES) return hostileStructures;
    if (type === FIND_MY_CREEPS) return [];
    if (type === FIND_MY_SPAWNS) return [];
    return [];
  };

  const creep = createMockCreep(`${role}1`, {
    room,
    memory: {
      role,
      family: "military",
      homeRoom: "W1N1",
      assistTarget: options.assistTarget ?? "W2N1",
      ...options.extraMemory
    },
    body: role === "guard"
      ? [{ type: ATTACK, hits: 100 }, { type: MOVE, hits: 100 }]
      : role === "ranger"
        ? [{ type: RANGED_ATTACK, hits: 100 }, { type: MOVE, hits: 100 }]
        : [{ type: HEAL, hits: 100 }, { type: MOVE, hits: 100 }],
    pos: {
      x: 25,
      y: 25,
      roomName: room.name,
      getRangeTo: () => (role === "guard" ? 1 : 3),
      findClosestByRange: (targets: unknown) => Array.isArray(targets) ? targets[0] : null,
      findInRange: () => [],
      isEqualTo: () => false,
      isNearTo: () => false,
      inRangeTo: () => false,
      findClosestByPath: () => null,
      lookFor: () => []
    }
  });

  Game.rooms[room.name] = room;
  Game.creeps[creep.name] = creep;

  return {
    creep,
    room,
    memory: creep.memory as CreepContext["memory"],
    swarmState: undefined,
    squadMemory: undefined,
    homeRoom: "W1N1",
    isInHomeRoom: room.name === "W1N1",
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
    mineralContainers: []
  };
}

describe("military assistance behavior", () => {
  beforeEach(resetMockGame);

  it("stages guard assistance at home until its squad quorum is ready", () => {
    const ctx = createAssistContext("guard", [], {
      roomName: "W1N1",
      assistTarget: "W2N1",
      extraMemory: {
        defenseSquadId: "assist:W1N1:W2N1:12345",
        defenseSquadSize: 3,
        defenseSquadCreatedAt: Game.time
      }
    });
    Game.creeps[ctx.creep.name] = ctx.creep;

    const action = guard(ctx);

    expect(action.type).to.equal("wait");
    expect((action as { position: { roomName: string } }).position.roomName).to.equal("W1N1");
  });

  it("stages ranger assistance at home until its squad quorum is ready", () => {
    const ctx = createAssistContext("ranger", [], {
      roomName: "W1N1",
      assistTarget: "W2N1",
      extraMemory: {
        defenseSquadId: "assist:W1N1:W2N1:12345",
        defenseSquadSize: 2,
        defenseSquadCreatedAt: Game.time
      }
    });

    const action = ranger(ctx);

    expect(action.type).to.equal("wait");
    expect((action as { position: { roomName: string } }).position.roomName).to.equal("W1N1");
  });

  it("stages healer assistance at home until its squad quorum is ready", () => {
    const ctx = createAssistContext("healer", [], {
      roomName: "W1N1",
      assistTarget: "W2N1",
      extraMemory: {
        defenseSquadId: "assist:W1N1:W2N1:12345",
        defenseSquadSize: 2,
        defenseSquadCreatedAt: Game.time
      }
    });

    const action = healer(ctx);

    expect(action.type).to.equal("wait");
    expect((action as { position: { roomName: string } }).position.roomName).to.equal("W1N1");
  });

  it("moves assistance immediately when squad metadata is missing", () => {
    const ctx = createAssistContext("guard", [], { roomName: "W1N1", assistTarget: "W2N1" });

    const action = guard(ctx);

    expect(action).to.deep.equal({ type: "moveToRoom", roomName: "W2N1" });
  });

  it("moves guard assistance once the defense squad quorum is ready", () => {
    const squadId = "assist:W1N1:W2N1:12345";
    const ctx = createAssistContext("guard", [], {
      roomName: "W1N1",
      assistTarget: "W2N1",
      extraMemory: { defenseSquadId: squadId, defenseSquadSize: 3, defenseSquadCreatedAt: Game.time }
    });
    const rangerMate = createMockCreep("rangerMate", {
      room: ctx.room,
      memory: { role: "ranger", family: "military", homeRoom: "W1N1", assistTarget: "W2N1", defenseSquadId: squadId },
      body: [{ type: RANGED_ATTACK, hits: 100 }, { type: MOVE, hits: 100 }]
    });
    const healerMate = createMockCreep("healerMate", {
      room: ctx.room,
      memory: { role: "healer", family: "military", homeRoom: "W1N1", assistTarget: "W2N1", defenseSquadId: squadId },
      body: [{ type: HEAL, hits: 100 }, { type: MOVE, hits: 100 }]
    });
    Game.creeps = { [ctx.creep.name]: ctx.creep, rangerMate, healerMate } as typeof Game.creeps;

    const action = guard(ctx);

    expect(action).to.deep.equal({ type: "moveToRoom", roomName: "W2N1" });
  });

  it("releases healer assistance after the squad staging timeout", () => {
    const ctx = createAssistContext("healer", [], {
      roomName: "W1N1",
      assistTarget: "W2N1",
      extraMemory: {
        defenseSquadId: "assist:W1N1:W2N1:12345",
        defenseSquadSize: 3,
        defenseSquadCreatedAt: Game.time - 80
      }
    });
    Game.creeps[ctx.creep.name] = ctx.creep;

    const action = healer(ctx);

    expect(action).to.deep.equal({ type: "moveToRoom", roomName: "W2N1" });
  });

  it("keeps guard assistance active and attacks hostile structures when no hostile creeps remain", () => {
    const hostileStructure = {
      structureType: STRUCTURE_SPAWN,
      owner: { username: "Invader" },
      pos: { roomName: "W2N1", x: 26, y: 25 }
    } as Structure;
    const ctx = createAssistContext("guard", [hostileStructure]);

    const action = guard(ctx);

    expect(ctx.creep.memory.assistTarget).to.equal("W2N1");
    expect(action).to.deep.equal({ type: "attack", target: hostileStructure });
  });

  it("keeps ranger assistance active and attacks hostile structures when no hostile creeps remain", () => {
    const hostileStructure = {
      structureType: STRUCTURE_SPAWN,
      owner: { username: "Invader" },
      pos: { roomName: "W2N1", x: 28, y: 25 }
    } as Structure;
    const ctx = createAssistContext("ranger", [hostileStructure]);

    const action = ranger(ctx);

    expect(ctx.creep.memory.assistTarget).to.equal("W2N1");
    expect(action).to.deep.equal({ type: "rangedAttack", target: hostileStructure });
  });
});

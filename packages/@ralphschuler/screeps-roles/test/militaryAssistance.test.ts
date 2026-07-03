import { expect } from "chai";
import { guard, ranger, healer, type CreepContext } from "../src/index";
import { createMockCreep, createMockRoom, resetMockGame } from "./setup";

function createThreatRoom(roomName = "W2N1", body: BodyPartConstant[] = [ATTACK, MOVE]): Room {
  const hostile = {
    owner: { username: "Invader" },
    body: body.map(type => ({ type, hits: 100 }))
  } as unknown as Creep;
  const room = createMockRoom(roomName);
  (room as any).find = (type: number) => (type === FIND_HOSTILE_CREEPS ? [hostile] : []);
  Game.rooms[roomName] = room;
  return room;
}

function createHardThreatRoom(roomName = "W2N1"): Room {
  return createThreatRoom(roomName, [
    ...Array.from({ length: 25 }, () => RANGED_ATTACK),
    ...Array.from({ length: 10 }, () => HEAL),
    ...Array.from({ length: 10 }, () => MOVE)
  ]);
}

function createAggregateHardThreatRoom(roomName = "W2N1"): Room {
  const bodies: BodyPartConstant[][] = [
    [RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, HEAL, MOVE],
    [RANGED_ATTACK, MOVE, MOVE, HEAL, HEAL, MOVE],
    [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE],
    [RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, HEAL, MOVE],
    [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE],
    [RANGED_ATTACK, MOVE, MOVE, HEAL, HEAL, MOVE]
  ];
  const hostiles = bodies.map(body => ({
    owner: { username: "Invader" },
    body: body.map(type => ({ type, hits: 100 }))
  })) as unknown as Creep[];
  const room = createMockRoom(roomName);
  (room as any).find = (type: number) => (type === FIND_HOSTILE_CREEPS ? hostiles : []);
  Game.rooms[roomName] = room;
  return room;
}

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
  beforeEach(() => {
    resetMockGame();
    delete (Memory as unknown as { defenseRequests?: unknown }).defenseRequests;
    delete (Memory as unknown as { defenseAssistTrickleReleases?: unknown }).defenseAssistTrickleReleases;
  });

  it("assigns an idle guard to a visible active defense request", () => {
    createThreatRoom("W2N1");
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      { roomName: "W2N1", guardsNeeded: 1, rangersNeeded: 0, healersNeeded: 0, urgency: 2, createdAt: Game.time }
    ];
    const ctx = createAssistContext("guard", [], { roomName: "W1N1" });
    delete (ctx.creep.memory as { assistTarget?: string }).assistTarget;
    (ctx.room as any).getTerrain = () => ({ get: () => 0 });
    Game.creeps[ctx.creep.name] = ctx.creep;

    const action = guard(ctx);

    expect(action).to.deep.equal({ type: "moveToRoom", roomName: "W2N1" });
    expect(ctx.creep.memory).to.include({ task: "defenseAssist", targetRoom: "W2N1", assistTarget: "W2N1" });
  });

  it("stages auto-acquired idle defenders for visible hard-threat requests", () => {
    createHardThreatRoom("W2N1");
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      { roomName: "W2N1", guardsNeeded: 1, rangersNeeded: 0, healersNeeded: 0, urgency: 2, createdAt: Game.time }
    ];
    const ctx = createAssistContext("guard", [], { roomName: "W1N1" });
    delete (ctx.creep.memory as { assistTarget?: string }).assistTarget;
    Game.creeps[ctx.creep.name] = ctx.creep;

    const action = guard(ctx);

    expect(action.type).to.equal("wait");
    expect(ctx.creep.memory).to.include({ task: "defenseAssist", targetRoom: "W2N1", assistTarget: "W2N1" });
    expect((ctx.creep.memory as { defenseSquadId?: string }).defenseSquadId).to.equal("defenseAssist:W1N1:W2N1:active");
  });

  it("does not send idle defenders away from a threatened home room", () => {
    (global as { DISMANTLE_POWER?: number }).DISMANTLE_POWER = 50;
    createHardThreatRoom("W2N1");
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      { roomName: "W2N1", guardsNeeded: 1, rangersNeeded: 0, healersNeeded: 0, urgency: 2, createdAt: Game.time }
    ];
    const localHostileBody = [{ type: ATTACK, hits: 100 }, { type: MOVE, hits: 100 }];
    const localHostile = {
      owner: { username: "Invader" },
      body: localHostileBody,
      pos: { roomName: "W1N1", x: 26, y: 25 },
      getActiveBodyparts: (type: BodyPartConstant) => localHostileBody.filter(part => part.type === type && part.hits > 0).length
    } as unknown as Creep;
    const ctx = createAssistContext("guard", [], { roomName: "W1N1" });
    delete (ctx.creep.memory as { assistTarget?: string }).assistTarget;
    (ctx.room as any).find = (type: number) => {
      if (type === FIND_HOSTILE_CREEPS) return [localHostile];
      if (type === FIND_MY_CREEPS) return [ctx.creep];
      return [];
    };
    ctx.hostiles = [localHostile];
    Game.creeps[ctx.creep.name] = ctx.creep;

    const action = guard(ctx);

    expect(action).to.deep.equal({ type: "attack", target: localHostile });
    expect((ctx.creep.memory as { assistTarget?: string }).assistTarget).to.equal(undefined);
  });

  for (const allyName of ["TooAngel", "TedRoastBeef"]) {
    it(`does not acquire defense assist for allied ${allyName} creeps in the target room`, () => {
      const ally = { owner: { username: allyName }, body: [{ type: ATTACK, hits: 100 }] } as unknown as Creep;
      const target = createMockRoom("W2N1");
      (target as any).find = (type: number) => (type === FIND_HOSTILE_CREEPS ? [ally] : []);
      Game.rooms.W2N1 = target;
      (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
        { roomName: "W2N1", guardsNeeded: 1, rangersNeeded: 0, healersNeeded: 0, urgency: 2, createdAt: Game.time }
      ];
      const ctx = createAssistContext("guard", [], { roomName: "W1N1" });
      delete (ctx.creep.memory as { assistTarget?: string }).assistTarget;
      (ctx.room as any).getTerrain = () => ({ get: () => 0 });
      Game.creeps[ctx.creep.name] = ctx.creep;

      const action = guard(ctx);

      expect((ctx.creep.memory as { assistTarget?: string }).assistTarget).to.equal(undefined);
      expect(action.type).to.not.equal("moveToRoom");
    });
  }

  it("releases hard-threat assistance when cross-wave staging quorum is ready", () => {
    createHardThreatRoom("W2N1");
    const ctx = createAssistContext("guard", [], {
      roomName: "W1N1",
      assistTarget: "W2N1",
      extraMemory: {
        defenseSquadId: "assist:W1N1:W2N1:wave-a",
        defenseSquadSize: 2,
        defenseSquadCreatedAt: Game.time
      }
    });
    const mates = Array.from({ length: 4 }, (_, index) => createMockCreep(`mate${index}`, {
      room: ctx.room,
      memory: {
        role: index === 0 ? "healer" : "ranger",
        family: "military",
        homeRoom: "W1N1",
        assistTarget: "W2N1",
        defenseSquadId: `assist:W1N1:W2N1:wave-${index + 2}`,
        defenseSquadSize: 1,
        defenseSquadCreatedAt: Game.time
      },
      body: index === 0 ? [{ type: HEAL, hits: 100 }, { type: MOVE, hits: 100 }] : [{ type: RANGED_ATTACK, hits: 100 }, { type: MOVE, hits: 100 }]
    }));
    Game.creeps = { [ctx.creep.name]: ctx.creep, ...Object.fromEntries(mates.map(creep => [creep.name, creep])) } as typeof Game.creeps;

    const action = guard(ctx);

    expect(action).to.deep.equal({ type: "moveToRoom", roomName: "W2N1" });
  });

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
    expect((ctx.creep.memory as { defenseAssistReleaseReason?: string }).defenseAssistReleaseReason)
      .to.equal("squad-quorum");
  });

  it("keeps hard-threat defense assists staged after the normal timeout until parity is ready", () => {
    createHardThreatRoom("W2N1");
    const squadId = "assist:W1N1:W2N1:hard";
    const ctx = createAssistContext("healer", [], {
      roomName: "W1N1",
      assistTarget: "W2N1",
      extraMemory: {
        defenseSquadId: squadId,
        defenseSquadSize: 13,
        defenseSquadCreatedAt: Game.time - 260
      }
    });
    Game.creeps[ctx.creep.name] = ctx.creep;

    const action = healer(ctx);

    expect(action.type).to.equal("wait");
  });

  it("stages one-creep hard-threat squads before the hard staging timeout", () => {
    createHardThreatRoom("W2N1");
    const ctx = createAssistContext("ranger", [], {
      roomName: "W1N1",
      assistTarget: "W2N1",
      extraMemory: {
        defenseSquadId: "assist:W1N1:W2N1:solo-hard",
        defenseSquadSize: 1,
        defenseSquadCreatedAt: Game.time
      }
    });
    Game.creeps[ctx.creep.name] = ctx.creep;

    const action = ranger(ctx);

    expect(action.type).to.equal("wait");
  });

  it("does not release small hard-threat squads before the hard staging timeout", () => {
    createHardThreatRoom("W2N1");
    const squadId = "assist:W1N1:W2N1:small-hard";
    const ctx = createAssistContext("guard", [], {
      roomName: "W1N1",
      assistTarget: "W2N1",
      extraMemory: {
        defenseSquadId: squadId,
        defenseSquadSize: 2,
        defenseSquadCreatedAt: Game.time - 260
      }
    });
    const rangerMate = createMockCreep("rangerMate", {
      room: ctx.room,
      memory: { role: "ranger", family: "military", homeRoom: "W1N1", assistTarget: "W2N1", defenseSquadId: squadId },
      body: [{ type: RANGED_ATTACK, hits: 100 }, { type: MOVE, hits: 100 }]
    });
    Game.creeps = { [ctx.creep.name]: ctx.creep, rangerMate } as typeof Game.creeps;

    const action = guard(ctx);

    expect(action.type).to.equal("wait");
  });

  it("does not stage forever when squad creation tick is missing", () => {
    const ctx = createAssistContext("guard", [], {
      roomName: "W1N1",
      assistTarget: "W2N1",
      extraMemory: {
        defenseSquadId: "assist:W1N1:W2N1:missing-created-at",
        defenseSquadSize: 3
      }
    });
    delete (ctx.creep.memory as { defenseSquadCreatedAt?: number }).defenseSquadCreatedAt;
    Game.creeps[ctx.creep.name] = ctx.creep;

    const action = guard(ctx);

    expect(action).to.deep.equal({ type: "moveToRoom", roomName: "W2N1" });
  });

  it("releases visible hard-threat defense assists after the extended timeout without parity", () => {
    createHardThreatRoom("W2N1");
    const ctx = createAssistContext("healer", [], {
      roomName: "W1N1",
      assistTarget: "W2N1",
      extraMemory: {
        defenseSquadId: "assist:W1N1:W2N1:hard-timeout",
        defenseSquadSize: 13,
        defenseSquadCreatedAt: Game.time - 760
      }
    });
    Game.creeps[ctx.creep.name] = ctx.creep;

    const action = healer(ctx);

    expect(action).to.deep.equal({ type: "moveToRoom", roomName: "W2N1" });
    expect((ctx.creep.memory as { defenseAssistReleaseReason?: string }).defenseAssistReleaseReason)
      .to.equal("hard-threat-trickle");
  });

  it("stages spawn-produced low-energy hard-threat assists before bounded trickle release", () => {
    createHardThreatRoom("W2N1");
    const ctx = createAssistContext("guard", [], {
      roomName: "W1N1",
      assistTarget: "W2N1",
      extraMemory: {
        task: "defenseAssist",
        targetRoom: "W2N1",
        defenseSquadId: "defenseAssist:W1N1:W2N1:1000",
        defenseSquadSize: 5,
        defenseSquadCreatedAt: Game.time
      }
    });
    Game.creeps[ctx.creep.name] = ctx.creep;

    const stagedAction = guard(ctx);
    Game.time += 760;
    const releasedAction = guard(ctx);

    expect(stagedAction.type).to.equal("wait");
    expect(releasedAction).to.deep.equal({ type: "moveToRoom", roomName: "W2N1" });
    expect(ctx.creep.memory.defenseSquadId).to.equal("defenseAssist:W1N1:W2N1:1000");
    expect(ctx.creep.memory.assistTarget).to.equal("W2N1");
    expect((ctx.creep.memory as { defenseAssistReleaseReason?: string }).defenseAssistReleaseReason)
      .to.equal("hard-threat-trickle");
  });

  it("releases expired aggregate hard-threat assists as a bounded trickle", () => {
    createAggregateHardThreatRoom("W2N1");
    const ctx = createAssistContext("guard", [], {
      roomName: "W1N1",
      assistTarget: "W2N1",
      extraMemory: {
        defenseSquadId: "assist:W1N1:W2N1:aggregate-hard-timeout",
        defenseSquadSize: 1,
        defenseSquadCreatedAt: Game.time - 760
      }
    });
    Game.creeps[ctx.creep.name] = ctx.creep;

    const action = guard(ctx);

    expect(action).to.deep.equal({ type: "moveToRoom", roomName: "W2N1" });
  });

  it("limits expired hard-threat trickle release to one member per interval", () => {
    createHardThreatRoom("W2N1");
    const squadId = "assist:W1N1:W2N1:hard-trickle";
    const ctx = createAssistContext("guard", [], {
      roomName: "W1N1",
      assistTarget: "W2N1",
      extraMemory: {
        defenseSquadId: squadId,
        defenseSquadSize: 13,
        defenseSquadCreatedAt: Game.time - 760
      }
    });
    const guard2 = createMockCreep("guard2", {
      room: ctx.room,
      memory: {
        role: "guard",
        family: "military",
        homeRoom: "W1N1",
        assistTarget: "W2N1",
        defenseSquadId: squadId,
        defenseSquadSize: 13,
        defenseSquadCreatedAt: Game.time - 760
      },
      body: [{ type: ATTACK, hits: 100 }, { type: MOVE, hits: 100 }]
    });
    const guard2Ctx = { ...ctx, creep: guard2, memory: guard2.memory as CreepContext["memory"] };
    Game.creeps = { [ctx.creep.name]: ctx.creep, [guard2.name]: guard2 } as typeof Game.creeps;

    const firstAction = guard(ctx);
    const firstReleaseTick = Game.time;
    Game.time += 1;
    const releasedCreepNextTickAction = guard(ctx);
    const sameIntervalAction = guard(guard2Ctx);
    delete Game.creeps[ctx.creep.name];
    Game.time += 49;
    const nextIntervalAction = guard(guard2Ctx);

    expect(firstAction).to.deep.equal({ type: "moveToRoom", roomName: "W2N1" });
    expect((ctx.creep.memory as { defenseAssistReleasedAt?: number }).defenseAssistReleasedAt).to.equal(firstReleaseTick);
    expect(releasedCreepNextTickAction).to.deep.equal({ type: "moveToRoom", roomName: "W2N1" });
    expect(sameIntervalAction.type).to.equal("wait");
    expect(nextIntervalAction).to.deep.equal({ type: "moveToRoom", roomName: "W2N1" });
  });

  it("defends the home room before staging for another room", () => {
    (global as { DISMANTLE_POWER?: number }).DISMANTLE_POWER = 50;
    createHardThreatRoom("W2N1");
    const localHostileBody = [{ type: ATTACK, hits: 100 }, { type: MOVE, hits: 100 }];
    const localHostile = {
      owner: { username: "Invader" },
      body: localHostileBody,
      pos: { roomName: "W1N1", x: 26, y: 25 },
      getActiveBodyparts: (type: BodyPartConstant) => localHostileBody.filter(part => part.type === type && part.hits > 0).length
    } as unknown as Creep;
    const ctx = createAssistContext("guard", [], {
      roomName: "W1N1",
      assistTarget: "W2N1",
      extraMemory: {
        defenseSquadId: "assist:W1N1:W2N1:hard-home-threat",
        defenseSquadSize: 13,
        defenseSquadCreatedAt: Game.time
      }
    });
    (ctx.room as any).find = (type: number) => {
      if (type === FIND_HOSTILE_CREEPS) return [localHostile];
      if (type === FIND_MY_CREEPS) return [ctx.creep];
      return [];
    };
    ctx.hostiles = [localHostile];
    Game.creeps[ctx.creep.name] = ctx.creep;

    const action = guard(ctx);

    expect(action).to.deep.equal({ type: "attack", target: localHostile });
  });

  it("releases hard-threat defense assists once the bounded staging quorum is ready", () => {
    createHardThreatRoom("W2N1");
    const squadId = "assist:W1N1:W2N1:hard";
    const ctx = createAssistContext("guard", [], {
      roomName: "W1N1",
      assistTarget: "W2N1",
      extraMemory: {
        defenseSquadId: squadId,
        defenseSquadSize: 13,
        defenseSquadCreatedAt: Game.time - 260
      }
    });
    const mates = Array.from({ length: 4 }, (_, index) => createMockCreep(`mate${index}`, {
      room: ctx.room,
      memory: { role: index === 0 ? "healer" : "ranger", family: "military", homeRoom: "W1N1", assistTarget: "W2N1", defenseSquadId: squadId },
      body: index === 0 ? [{ type: HEAL, hits: 100 }, { type: MOVE, hits: 100 }] : [{ type: RANGED_ATTACK, hits: 100 }, { type: MOVE, hits: 100 }]
    }));
    Game.creeps = { [ctx.creep.name]: ctx.creep, ...Object.fromEntries(mates.map(creep => [creep.name, creep])) } as typeof Game.creeps;

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
        defenseSquadCreatedAt: Game.time - 260
      }
    });
    Game.creeps[ctx.creep.name] = ctx.creep;

    const action = healer(ctx);

    expect(action).to.deep.equal({ type: "moveToRoom", roomName: "W2N1" });
    expect((ctx.creep.memory as { defenseAssistReleaseReason?: string }).defenseAssistReleaseReason)
      .to.equal("expired-staging");
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

  it("uses targetRoom fallback for defense assist memory missing assistTarget", () => {
    const ctx = createAssistContext("ranger", [], {
      roomName: "W1N1",
      extraMemory: { task: "defenseAssist", targetRoom: "W2N1", assistTarget: undefined }
    });
    delete (ctx.creep.memory as { assistTarget?: string }).assistTarget;

    const action = ranger(ctx);

    expect(action).to.deep.equal({ type: "moveToRoom", roomName: "W2N1" });
  });

  it("heals nearby wounded combat allies before following the squad", () => {
    const hostile = { owner: { username: "Invader" }, body: [{ type: ATTACK, hits: 100 }] } as Creep;
    const wounded = createMockCreep("woundedRanger", {
      room: createMockRoom("W2N1"),
      memory: { role: "ranger", family: "military", homeRoom: "W1N1", assistTarget: "W2N1", version: 1 },
      body: [{ type: RANGED_ATTACK, hits: 100 }, { type: MOVE, hits: 100 }]
    });
    wounded.hits = 400;
    wounded.hitsMax = 1000;
    const ctx = createAssistContext("healer", [], { roomName: "W2N1", assistTarget: "W2N1" });
    (ctx.room as any).find = (type: number) => {
      if (type === FIND_HOSTILE_CREEPS) return [hostile];
      if (type === FIND_HOSTILE_STRUCTURES) return [];
      if (type === FIND_MY_CREEPS) return [ctx.creep, wounded];
      return [];
    };
    (ctx.creep.pos as any).findInRange = () => [wounded];
    (ctx.creep.pos as any).getRangeTo = () => 2;

    const action = healer(ctx);

    expect(action).to.deep.equal({ type: "rangedHeal", target: wounded });
  });

  it("moves toward wounded assigned combat allies outside heal range", () => {
    const hostile = { owner: { username: "Invader" }, body: [{ type: ATTACK, hits: 100 }] } as Creep;
    const wounded = createMockCreep("woundedGuard", {
      room: createMockRoom("W2N1"),
      memory: { role: "guard", family: "military", homeRoom: "W1N1", task: "defenseAssist", targetRoom: "W2N1", version: 1 },
      body: [{ type: ATTACK, hits: 100 }, { type: MOVE, hits: 100 }]
    });
    wounded.hits = 500;
    wounded.hitsMax = 1500;
    const ctx = createAssistContext("healer", [], { roomName: "W2N1", assistTarget: "W2N1" });
    (ctx.room as any).find = (type: number) => {
      if (type === FIND_HOSTILE_CREEPS) return [hostile];
      if (type === FIND_HOSTILE_STRUCTURES) return [];
      if (type === FIND_MY_CREEPS) return [ctx.creep, wounded];
      return [];
    };
    (ctx.creep.pos as any).findInRange = () => [];
    (ctx.creep.pos as any).getRangeTo = () => 5;

    const action = healer(ctx);

    expect(action).to.deep.equal({ type: "moveTo", target: wounded });
  });
});

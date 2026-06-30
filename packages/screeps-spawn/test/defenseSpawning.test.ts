import { assert } from "chai";
import {
  buildDefenseAssistBody,
  calculateAggregateDefenseResponsePlan,
  calculateCombatPower,
  calculateThreatParitySquadSize
} from "@ralphschuler/screeps-defense";
import { analyzeDefenderNeeds } from "../src/defenderManager.ts";
import {
  canSpawnIdleLocalMilitary,
  countLocalMilitaryCreeps,
  shouldLimitIdleLocalMilitary
} from "../src/militarySpawnPolicy.ts";
import { optimizeBody } from "../src/bodyOptimizer.ts";
import { ROLE_DEFINITIONS } from "../src/roleDefinitions.ts";
import { populateSpawnQueue } from "../src/spawnPipeline.ts";
import { SpawnPriority, spawnQueue } from "../src/spawnQueue.ts";

declare const require: NodeRequire;

function createRoom(hostiles: Creep[] = [], name = "W1N1", energyCapacity = 800, energyAvailable = energyCapacity): Room {
  const spawn = { id: `${name}-spawn`, spawning: false };
  return {
    name,
    energyAvailable,
    energyCapacityAvailable: energyCapacity,
    controller: { my: true, level: 3 },
    find: (type: number) => {
      if (type === FIND_HOSTILE_CREEPS) return hostiles;
      if (type === FIND_MY_SPAWNS) return [spawn];
      if (type === FIND_MY_STRUCTURES) return [];
      if (type === FIND_MY_CREEPS) return [];
      return [];
    }
  } as unknown as Room;
}

function createHostile(parts: BodyPartConstant[]): Creep {
  return {
    owner: { username: "Invader" },
    body: parts.map(type => ({ type, hits: 100 }))
  } as unknown as Creep;
}

function createRepeatedParts(...counts: Array<readonly [BodyPartConstant, number]>): BodyPartConstant[] {
  return counts.flatMap(([part, count]) => Array<BodyPartConstant>(count).fill(part));
}

describe("defense spawn throttling", () => {
  beforeEach(() => {
    (global as any).Game = {
      time: 1000,
      rooms: {},
      creeps: {},
      gcl: { level: 1 },
      spawns: {},
      map: { getRoomLinearDistance: () => 1 },
      getObjectById: () => null
    };
    (global as any).Memory = {};
    for (const roomName of ["W1N1", "W17S29", "W18S29", "W19S28"]) {
      spawnQueue.clearQueue(roomName);
    }
  });

  afterEach(() => {
    delete (global as any).Game;
  });

  it("does not create high-priority defender requirements for peaceful RCL3+ rooms", () => {
    const room = createRoom();
    Game.rooms.W1N1 = room;

    const needs = analyzeDefenderNeeds(room);

    assert.deepEqual(needs, {
      guards: 0,
      rangers: 0,
      healers: 0,
      urgency: 1.0,
      reasons: []
    });
  });

  it("still requests defenders when actual hostile combat parts are visible", () => {
    const room = createRoom([createHostile([ATTACK, ATTACK, MOVE])]);
    Game.rooms.W1N1 = room;

    const needs = analyzeDefenderNeeds(room);

    assert.isAtLeast(needs.guards, 1);
    assert.include(needs.reasons.join(";"), "melee parts detected");
  });

  it("caps peaceful local military reserve to a single guard role", () => {
    const emptyCounts = new Map<string, number>();

    assert.isTrue(shouldLimitIdleLocalMilitary(ROLE_DEFINITIONS.guard, 0));
    assert.isFalse(shouldLimitIdleLocalMilitary(ROLE_DEFINITIONS.guard, 1));
    assert.isFalse(shouldLimitIdleLocalMilitary(ROLE_DEFINITIONS.remoteGuard, 0));
    assert.isTrue(canSpawnIdleLocalMilitary("guard", emptyCounts));
    assert.isFalse(canSpawnIdleLocalMilitary("ranger", emptyCounts));
    assert.isFalse(canSpawnIdleLocalMilitary("healer", emptyCounts));
  });

  it("does not add more idle military when the local reserve already exists", () => {
    const counts = new Map<string, number>([["guard", 1]]);

    assert.equal(countLocalMilitaryCreeps(counts), 1);
    assert.isFalse(canSpawnIdleLocalMilitary("guard", counts));
    assert.isFalse(canSpawnIdleLocalMilitary("ranger", counts));
  });

  it("does not count remote military when enforcing local idle reserve", () => {
    const counts = new Map<string, number>([["remoteGuard", 1]]);

    assert.equal(countLocalMilitaryCreeps(counts), 0);
    assert.isTrue(shouldLimitIdleLocalMilitary(ROLE_DEFINITIONS.guard, 0));
    assert.isTrue(canSpawnIdleLocalMilitary("guard", counts));
  });

  it("spawns helper-room defense assists for visible attacked rooms even when the helper is peaceful", () => {
    const helper = createRoom([], "W17S29");
    const attacked = createRoom([createHostile([ATTACK, WORK, MOVE])], "W19S28");
    Game.rooms.W17S29 = helper;
    Game.rooms.W19S28 = attacked;
    Game.creeps = {
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W17S29" } },
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W17S29" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W17S29" } }
    } as unknown as typeof Game.creeps;
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W19S28",
        guardsNeeded: 1,
        rangersNeeded: 0,
        healersNeeded: 0,
        urgency: 3,
        createdAt: Game.time - 2000,
        threat: "visible hostile dismantler"
      }
    ];

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const plan = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any);
    const guardRequest = plan.requests.find(request => request.role === "guard");

    assert.equal(guardRequest?.targetRoom, "W19S28");
    assert.equal(guardRequest?.priority, SpawnPriority.EMERGENCY);
    assert.include(guardRequest?.additionalMemory, { task: "defenseAssist", assistTarget: "W19S28" });
    assert.equal(guardRequest?.additionalMemory?.defenseSquadId, "defenseAssist:W17S29:W19S28:1000");
    assert.equal(guardRequest?.additionalMemory?.defenseSquadSize, 1);
    assert.equal(guardRequest?.additionalMemory?.defenseSquadCreatedAt, Game.time);
  });

  it("assigns the same defense squad id to a helper room reinforcement wave", () => {
    const helper = createRoom([], "W17S29", 1800, 1800);
    const attacked = createRoom([createHostile([ATTACK, RANGED_ATTACK, HEAL, MOVE])], "W19S28");
    Game.rooms.W17S29 = helper;
    Game.rooms.W19S28 = attacked;
    Game.creeps = {
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W17S29" } },
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W17S29" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W17S29" } }
    } as unknown as typeof Game.creeps;
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W19S28",
        guardsNeeded: 1,
        rangersNeeded: 1,
        healersNeeded: 1,
        urgency: 3,
        createdAt: Game.time - 10,
        threat: "visible mixed assault"
      }
    ];

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const assistRequests = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any).requests
      .filter(request => request.additionalMemory?.task === "defenseAssist");

    assert.sameMembers(assistRequests.map(request => request.role), ["guard", "ranger", "healer"]);
    assert.deepEqual(
      [...new Set(assistRequests.map(request => request.additionalMemory?.defenseSquadId))],
      ["defenseAssist:W17S29:W19S28:1000"]
    );
    for (const request of assistRequests) {
      assert.equal(request.additionalMemory?.defenseSquadSize, 3);
      assert.equal(request.additionalMemory?.defenseSquadCreatedAt, Game.time);
    }
  });

  it("uses aggregate parity squad size instead of role count for hard defense assists", () => {
    const helper = createRoom([], "W17S29", 800, 800);
    const attacked = createRoom([
      createHostile([RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, HEAL, MOVE]),
      createHostile([RANGED_ATTACK, MOVE, MOVE, HEAL, HEAL, MOVE]),
      createHostile([ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE]),
      createHostile([RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, HEAL, MOVE]),
      createHostile([ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE]),
      createHostile([RANGED_ATTACK, MOVE, MOVE, HEAL, HEAL, MOVE])
    ], "W19S28", 0, 0);
    Game.rooms.W17S29 = helper;
    Game.rooms.W19S28 = attacked;
    Game.creeps = {
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W17S29" } },
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W17S29" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W17S29" } }
    } as unknown as typeof Game.creeps;
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W19S28",
        guardsNeeded: 1,
        rangersNeeded: 1,
        healersNeeded: 0,
        urgency: 1.5,
        createdAt: Game.time,
        threat: "stale low estimate"
      }
    ];

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const assistRequests = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any).requests
      .filter(request => request.additionalMemory?.task === "defenseAssist");

    assert.isNotEmpty(assistRequests);
    assert.isTrue(assistRequests.every(request => (request.additionalMemory?.defenseSquadSize ?? 0) > 3));
  });

  it("prunes stale defense-assist requests instead of spawning for old invisible attacks", () => {
    const helper = createRoom([], "W17S29");
    Game.rooms.W17S29 = helper;
    delete Game.rooms.W19S28;
    Game.creeps = {
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W17S29" } },
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W17S29" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W17S29" } }
    } as unknown as typeof Game.creeps;
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W19S28",
        guardsNeeded: 1,
        rangersNeeded: 0,
        healersNeeded: 0,
        urgency: 3,
        createdAt: Game.time - 1000,
        threat: "old invisible attack"
      }
    ];

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const plan = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any);

    assert.isUndefined(plan.requests.find(request => request.role === "guard" && request.additionalMemory?.assistTarget));
    assert.deepEqual((Memory as unknown as { defenseRequests: unknown[] }).defenseRequests, []);
  });

  it("preempts an existing helper-room queue with emergency defense assists", () => {
    const helper = createRoom([], "W17S29");
    const attacked = createRoom([createHostile([ATTACK, WORK, MOVE])], "W19S28");
    Game.rooms.W17S29 = helper;
    Game.rooms.W19S28 = attacked;
    Game.creeps = {
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W17S29" } },
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W17S29" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W17S29" } }
    } as unknown as typeof Game.creeps;
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W19S28",
        guardsNeeded: 1,
        rangersNeeded: 0,
        healersNeeded: 0,
        urgency: 3,
        createdAt: Game.time,
        threat: "visible hostile dismantler"
      }
    ];

    spawnQueue.addRequest({
      id: "existing_scout",
      roomName: "W17S29",
      role: "scout",
      family: "utility",
      body: { parts: [MOVE], cost: 50, minCapacity: 50 },
      priority: SpawnPriority.LOW,
      targetRoom: "W20S28",
      createdAt: Game.time
    });

    populateSpawnQueue(helper, { danger: 0, posture: "eco" } as any);

    const assist = spawnQueue.getPendingRequests("W17S29").find(request =>
      request.role === "guard" && request.additionalMemory?.assistTarget === "W19S28"
    );
    assert.isOk(assist);
    assert.equal(assist?.priority, SpawnPriority.EMERGENCY);
  });

  it("lets every capable helper room send a reinforcement wave for the same attack", () => {
    const helperA = createRoom([], "W17S29");
    const helperB = createRoom([], "W18S29");
    const attacked = createRoom([createHostile([ATTACK, WORK, MOVE])], "W19S28");
    Game.rooms.W17S29 = helperA;
    Game.rooms.W18S29 = helperB;
    Game.rooms.W19S28 = attacked;
    Game.creeps = {
      h1: { spawning: false, memory: { role: "harvester", homeRoom: "W17S29" } },
      c1: { spawning: false, memory: { role: "hauler", homeRoom: "W17S29" } },
      u1: { spawning: false, memory: { role: "upgrader", homeRoom: "W17S29" } },
      h2: { spawning: false, memory: { role: "harvester", homeRoom: "W18S29" } },
      c2: { spawning: false, memory: { role: "hauler", homeRoom: "W18S29" } },
      u2: { spawning: false, memory: { role: "upgrader", homeRoom: "W18S29" } }
    } as unknown as typeof Game.creeps;
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W19S28",
        guardsNeeded: 1,
        rangersNeeded: 0,
        healersNeeded: 0,
        urgency: 3,
        createdAt: Game.time,
        threat: "visible hostile dismantler"
      }
    ];
    spawnQueue.addRequest({
      id: "helper_a_guard",
      roomName: "W17S29",
      role: "guard",
      family: "military",
      body: { parts: [ATTACK, MOVE], cost: 130, minCapacity: 130 },
      priority: SpawnPriority.EMERGENCY,
      targetRoom: "W19S28",
      additionalMemory: { task: "defenseAssist", assistTarget: "W19S28" },
      createdAt: Game.time
    });

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const plan = createSpawnPlan(helperB, { danger: 0, posture: "eco" } as any);
    const guardRequest = plan.requests.find(request => request.role === "guard");

    assert.equal(guardRequest?.targetRoom, "W19S28");
    assert.include(guardRequest?.additionalMemory, { task: "defenseAssist", assistTarget: "W19S28" });
    assert.isString(guardRequest?.additionalMemory?.defenseSquadId);
  });

  it("continues spawning same-role defense assist waves until the global request is satisfied", () => {
    const helper = createRoom([], "W17S29", 1800, 1800);
    const attacked = createRoom([createHostile([RANGED_ATTACK, RANGED_ATTACK, HEAL, MOVE, MOVE])], "W19S28");
    Game.rooms.W17S29 = helper;
    Game.rooms.W19S28 = attacked;
    Game.creeps = {
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W17S29" } },
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W17S29" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W17S29" } },
      ranger1: {
        spawning: false,
        memory: {
          role: "ranger",
          family: "military",
          homeRoom: "W17S29",
          targetRoom: "W19S28",
          task: "defenseAssist",
          assistTarget: "W19S28"
        }
      }
    } as unknown as typeof Game.creeps;
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W19S28",
        guardsNeeded: 0,
        rangersNeeded: 3,
        healersNeeded: 0,
        urgency: 3,
        createdAt: Game.time,
        threat: "visible ranged assault"
      }
    ];

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const plan = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any);
    const rangerRequest = plan.requests.find(request => request.role === "ranger");

    assert.exists(rangerRequest, "one active helper ranger should not block additional same-role waves when need remains");
    assert.equal(rangerRequest!.targetRoom, "W19S28");
    assert.include(rangerRequest!.additionalMemory, { task: "defenseAssist", assistTarget: "W19S28" });
  });

  it("keeps optimized military bodies within the requested energy budget", () => {
    for (const [role, energy] of [["guard", 199], ["guard", 400], ["ranger", 200], ["healer", 300]] as const) {
      const body = optimizeBody({ role, maxEnergy: energy });
      assert.isAtMost(body.cost, energy, `${role} body must be affordable at ${energy} energy`);
    }
  });

  it("adds an affordable emergency guard under siege instead of idling behind unspawnable pending defenders", () => {
    const room = createRoom([createHostile([WORK, WORK, WORK, WORK, RANGED_ATTACK, MOVE])], "W19S26", 400, 199);
    Game.rooms.W19S26 = room;
    Game.creeps = {
      worker1: { spawning: false, memory: { role: "harvester", homeRoom: "W19S26" } }
    } as unknown as typeof Game.creeps;

    spawnQueue.addRequest({
      id: "stale_expensive_guard",
      roomName: "W19S26",
      role: "guard",
      family: "military",
      body: { parts: [TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE], cost: 580, minCapacity: 580 },
      priority: SpawnPriority.EMERGENCY,
      createdAt: Game.time - 10
    });

    populateSpawnQueue(room, { danger: 3, posture: "siege" } as any);

    const affordable = spawnQueue.getNextRequest("W19S26", 199);
    assert.equal(affordable?.role, "guard");
    assert.isAtMost(affordable!.body.cost, 199);
  });

  it("does not count a spawning or disarmed defender as current defense", () => {
    const hostile = createHostile([ATTACK, MOVE]);
    const room = createRoom([hostile]);
    const creeps = [
      { spawning: true, memory: { role: "guard" }, body: [{ type: ATTACK, hits: 100 }, { type: MOVE, hits: 100 }] },
      { spawning: false, memory: { role: "guard" }, body: [{ type: ATTACK, hits: 0 }, { type: MOVE, hits: 100 }] }
    ] as unknown as Creep[];
    (room as unknown as { find: (type: number) => unknown[] }).find = (type: number) => {
      if (type === FIND_HOSTILE_CREEPS) return [hostile];
      if (type === FIND_MY_SPAWNS) return [{ id: "spawn", spawning: false }];
      if (type === FIND_MY_STRUCTURES) return [];
      if (type === FIND_MY_CREEPS) return creeps;
      return [];
    };

    const { getCurrentDefenders } = require("../src/defenderManager") as typeof import("../src/defenderManager");
    assert.deepEqual(getCurrentDefenders(room), { guards: 0, rangers: 0, healers: 0 });
  });

  it("sizes defense-assist bodies above visible attackers when helper capacity can afford it", () => {
    const hostile = createHostile([ATTACK, ATTACK, ATTACK, MOVE, MOVE]);
    const helper = createRoom([], "W17S29", 1800, 1800);
    const attacked = createRoom([hostile], "W19S28");
    Game.rooms.W17S29 = helper;
    Game.rooms.W19S28 = attacked;
    Game.creeps = {
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W17S29" } },
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W17S29" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W17S29" } }
    } as unknown as typeof Game.creeps;
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W19S28",
        guardsNeeded: 1,
        rangersNeeded: 0,
        healersNeeded: 0,
        urgency: 3,
        createdAt: Game.time,
        threat: "single hostile attacker"
      }
    ];

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const plan = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any);
    const guardRequest = plan.requests.find(request => request.role === "guard");

    assert.isOk(guardRequest);
    assert.isAbove(guardRequest!.body.parts.length, hostile.body.length);
    assert.isAbove(calculateCombatPower(guardRequest!.body.parts).score, calculateCombatPower(hostile.body).score);
  });

  it("calculates aggregate parity squad size when no single affordable defender matches the threat", () => {
    const threatProfile = {
      hostileCount: 1,
      strongest: calculateCombatPower(createRepeatedParts([ATTACK, 20], [MOVE, 20])),
      total: calculateCombatPower(createRepeatedParts([ATTACK, 20], [MOVE, 20]))
    };

    const body = buildDefenseAssistBody("guard", 800, threatProfile);
    const squadSize = calculateThreatParitySquadSize("guard", 800, threatProfile);

    assert.isOk(body);
    assert.isBelow(calculateCombatPower(body!.parts).score, threatProfile.strongest.score);
    assert.isAbove(squadSize, 1);
    assert.isAtLeast(calculateCombatPower(body!.parts).score * squadSize, threatProfile.total.score);
  });

  it("queues local defenders with threat-parity bodies when the room is directly attacked", () => {
    const hostile = createHostile(createRepeatedParts([ATTACK, 8], [MOVE, 8]));
    const room = createRoom([hostile], "W1N1", 2400, 2400);
    Game.rooms.W1N1 = room;

    populateSpawnQueue(room, { danger: 3, posture: "defense" } as any);

    const guardRequest = spawnQueue.getPendingRequests("W1N1").find(request => request.role === "guard");
    assert.isOk(guardRequest);
    assert.isAtLeast(guardRequest!.body.parts.length, hostile.body.length);
    assert.isAtLeast(calculateCombatPower(guardRequest!.body.parts).score, calculateCombatPower(hostile.body).score);
  });

  it("does not spawn three-part rangers against hard ranged healer invaders", () => {
    const helper = createRoom([], "W17S29", 300, 300);
    const hardInvader = createHostile(createRepeatedParts([TOUGH, 5], [RANGED_ATTACK, 25], [MOVE, 10], [HEAL, 10]));
    const attacked = createRoom([hardInvader], "W19S28", 300, 300);
    Game.rooms.W17S29 = helper;
    Game.rooms.W19S28 = attacked;
    Game.creeps = {
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W17S29" } },
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W17S29" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W17S29" } }
    } as unknown as typeof Game.creeps;
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W19S28",
        guardsNeeded: 0,
        rangersNeeded: 1,
        healersNeeded: 0,
        urgency: 3,
        createdAt: Game.time,
        threat: "hard ranged healer"
      }
    ];

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const rangerRequest = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any).requests
      .find(request => request.role === "ranger");

    if (rangerRequest) {
      assert.isAtLeast(rangerRequest.body.parts.length, 6);
      assert.isAtLeast(rangerRequest.body.parts.filter(part => part === RANGED_ATTACK).length, 2);
    }
  });

  it("uses capacity-sized local emergency defenders against visible hard threats", () => {
    const hostile = createHostile(createRepeatedParts([TOUGH, 5], [RANGED_ATTACK, 25], [MOVE, 10], [HEAL, 10]));
    const room = createRoom([hostile], "W1N1", 1800, 300);
    Game.rooms.W1N1 = room;

    populateSpawnQueue(room, { danger: 3, posture: "defense" } as any);

    const defenderRequests = spawnQueue.getPendingRequests("W1N1")
      .filter(request => request.role === "guard" || request.role === "ranger" || request.role === "healer");

    assert.isAbove(defenderRequests.length, 0);
    assert.isTrue(defenderRequests.every(request => request.body.parts.length >= 6));
    assert.isTrue(defenderRequests.every(request => request.body.cost > room.energyAvailable));
  });

  it("plans aggregate friendly fight power strictly above visible hostile power", () => {
    const threatProfile = {
      hostileCount: 1,
      strongest: calculateCombatPower(createRepeatedParts([ATTACK, 20], [MOVE, 20])),
      total: calculateCombatPower(createRepeatedParts([ATTACK, 20], [MOVE, 20]))
    };

    const plan = calculateAggregateDefenseResponsePlan(800, threatProfile, { guard: 1 });

    assert.isAbove(plan.counts.guard + plan.counts.ranger + plan.counts.healer, 1);
    assert.isAbove(plan.totalPower.score, threatProfile.total.score);
  });

  it("adds healer coverage when aggregate defense needs multiple combat creeps", () => {
    const threatProfile = {
      hostileCount: 1,
      strongest: calculateCombatPower(createRepeatedParts([ATTACK, 12], [MOVE, 12])),
      total: calculateCombatPower(createRepeatedParts([ATTACK, 12], [MOVE, 12]))
    };

    const plan = calculateAggregateDefenseResponsePlan(800, threatProfile, { guard: 1 });

    assert.isAtLeast(plan.healerFloor, 1);
    assert.isAtLeast(plan.counts.healer, 1);
    assert.isAtLeast(plan.totalPower.heal, Math.ceil((threatProfile.total.attack + threatProfile.total.ranged) * 0.5));
  });

  it("does not treat one underpowered active defender as satisfying aggregate parity", () => {
    const hostile = createHostile(createRepeatedParts([ATTACK, 12], [MOVE, 12]));
    const weakGuard = {
      spawning: false,
      memory: { role: "guard" },
      body: [ATTACK, MOVE].map(type => ({ type, hits: 100 }))
    };
    const room = createRoom([hostile], "W1N1", 800, 800);
    (room as unknown as { find: (type: number) => unknown[] }).find = (type: number) => {
      if (type === FIND_HOSTILE_CREEPS) return [hostile];
      if (type === FIND_MY_SPAWNS) return [{ id: "spawn", spawning: false }];
      if (type === FIND_MY_STRUCTURES) return [];
      if (type === FIND_MY_CREEPS) return [weakGuard];
      return [];
    };
    Game.rooms.W1N1 = room;

    populateSpawnQueue(room, { danger: 3, posture: "defense" } as any);

    const queuedPower = spawnQueue.getPendingRequests("W1N1")
      .filter(request => request.role === "guard" || request.role === "ranger" || request.role === "healer")
      .map(request => calculateCombatPower(request.body.parts))
      .reduce((total, power) => total + power.score, calculateCombatPower(weakGuard.body as BodyPartDefinition[]).score);

    assert.isAbove(queuedPower, calculateCombatPower(hostile.body).score);
  });

  it("requests assist healers for multi-creep aggregate defense waves", () => {
    const helper = createRoom([], "W17S29", 800, 800);
    const attacked = createRoom([createHostile(createRepeatedParts([ATTACK, 12], [MOVE, 12]))], "W19S28");
    Game.rooms.W17S29 = helper;
    Game.rooms.W19S28 = attacked;
    Game.creeps = {
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W17S29" } },
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W17S29" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W17S29" } }
    } as unknown as typeof Game.creeps;
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W19S28",
        guardsNeeded: 1,
        rangersNeeded: 0,
        healersNeeded: 0,
        urgency: 3,
        createdAt: Game.time,
        threat: "large melee attack"
      }
    ];

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const plan = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any);

    assert.exists(plan.requests.find(request => request.role === "healer"));
  });

  it("does not keep adding defense assists once assigned pending power exceeds visible threat", () => {
    const helper = createRoom([], "W17S29", 800, 800);
    const attacked = createRoom([createHostile([ATTACK, MOVE])], "W19S28");
    Game.rooms.W17S29 = helper;
    Game.rooms.W19S28 = attacked;
    Game.creeps = {
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W17S29" } },
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W17S29" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W17S29" } }
    } as unknown as typeof Game.creeps;
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W19S28",
        guardsNeeded: 1,
        rangersNeeded: 0,
        healersNeeded: 0,
        urgency: 3,
        createdAt: Game.time,
        threat: "single melee attacker"
      }
    ];
    spawnQueue.addRequest({
      id: "pending_assist_guard",
      roomName: "W17S29",
      role: "guard",
      family: "military",
      body: { parts: [ATTACK, ATTACK, MOVE, MOVE], cost: 260, minCapacity: 260 },
      priority: SpawnPriority.EMERGENCY,
      targetRoom: "W19S28",
      createdAt: Game.time,
      additionalMemory: { task: "defenseAssist", assistTarget: "W19S28", targetRoom: "W19S28" }
    });

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const plan = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any);

    assert.isUndefined(plan.requests.find(request => request.additionalMemory?.assistTarget === "W19S28"));
  });
});

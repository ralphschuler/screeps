import { assert } from "chai";
import { calculateCombatPower } from "../src/defenseAssistBody.ts";
import { analyzeDefenderNeeds } from "../src/defenderManager.ts";
import {
  canSpawnIdleLocalMilitary,
  countLocalMilitaryCreeps,
  shouldLimitIdleLocalMilitary
} from "../src/militarySpawnPolicy.ts";
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
    assert.deepEqual(guardRequest?.additionalMemory, { task: "defenseAssist", assistTarget: "W19S28" });
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
    assert.deepEqual(guardRequest?.additionalMemory, { task: "defenseAssist", assistTarget: "W19S28" });
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
});

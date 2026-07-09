import { assert } from "chai";
import {
  buildDefenseAssistBody,
  calculateAggregateDefenseResponsePlan,
  calculateCombatPower,
  calculateThreatParitySquadSize,
  createDefenseRequest
} from "@ralphschuler/screeps-defense";
import { collectDefenseAssistTelemetry } from "../src/defenseAssistTelemetry.ts";
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

function createRoom(
  hostiles: Creep[] = [],
  name = "W1N1",
  energyCapacity = 800,
  energyAvailable = energyCapacity,
  controllerLevel = 3,
  hasSpawn = true
): Room {
  const spawn = { id: `${name}-spawn`, spawning: false };
  return {
    name,
    energyAvailable,
    energyCapacityAvailable: energyCapacity,
    controller: { my: true, level: controllerLevel },
    find: (type: number) => {
      if (type === FIND_HOSTILE_CREEPS) return hostiles;
      if (type === FIND_MY_SPAWNS) return hasSpawn ? [spawn] : [];
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

function createStore(usedEnergy: number, freeEnergy = 0): StoreDefinition {
  return {
    getUsedCapacity: (resource?: ResourceConstant) => resource === undefined || resource === RESOURCE_ENERGY ? usedEnergy : 0,
    getFreeCapacity: (resource?: ResourceConstant) => resource === undefined || resource === RESOURCE_ENERGY ? freeEnergy : 0,
    getCapacity: () => usedEnergy + freeEnergy,
    [RESOURCE_ENERGY]: usedEnergy
  } as unknown as StoreDefinition;
}

function createSourceContainer(energy: number, rangeToSource = 1): StructureContainer {
  return {
    id: `container-${energy}` as Id<StructureContainer>,
    structureType: STRUCTURE_CONTAINER,
    store: createStore(energy, 2000 - energy),
    pos: { getRangeTo: () => rangeToSource }
  } as unknown as StructureContainer;
}

function createSource(rangeToContainer = 1): Source {
  return {
    id: `source-${rangeToContainer}` as Id<Source>,
    pos: { getRangeTo: () => rangeToContainer }
  } as unknown as Source;
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
    for (const roomName of ["W1N1", "W17S29", "W18S28", "W18S29", "W19S28"]) {
      spawnQueue.clearQueue(roomName);
    }
  });

  afterEach(() => {
    delete (global as any).Game;
  });

  it("collects compact defense-assist queue and staging telemetry", () => {
    const helper = createRoom([], "W17S29", 800, 300);
    const target = createRoom([createHostile([ATTACK, MOVE])], "W19S28", 800, 800, 3, false);
    Game.rooms.W17S29 = helper;
    Game.rooms.W19S28 = target;
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      { roomName: "W19S28", guardsNeeded: 1, rangersNeeded: 1, healersNeeded: 0, urgency: 2, createdAt: 990 }
    ];

    spawnQueue.addRequest({
      id: "assist_guard",
      roomName: "W17S29",
      role: "guard",
      family: "military",
      body: { parts: [ATTACK, MOVE], cost: 130, minCapacity: 130 },
      priority: SpawnPriority.EMERGENCY,
      targetRoom: "W19S28",
      additionalMemory: {
        task: "defenseAssist",
        assistTarget: "W19S28",
        defenseSquadId: "defenseAssist:W17S29:W19S28:990",
        defenseSquadSize: 2,
        defenseSquadCreatedAt: 990
      },
      createdAt: Game.time
    });

    Game.creeps = {
      stagedRanger: {
        name: "stagedRanger",
        spawning: false,
        room: helper,
        body: [RANGED_ATTACK, MOVE].map(type => ({ type, hits: 100 })),
        memory: {
          role: "ranger",
          homeRoom: "W17S29",
          task: "defenseAssist",
          assistTarget: "W19S28",
          targetRoom: "W19S28",
          defenseSquadId: "defenseAssist:W17S29:W19S28:990",
          defenseSquadSize: 2,
          defenseSquadCreatedAt: 990
        }
      } as unknown as Creep,
      releasedHealer: {
        name: "releasedHealer",
        spawning: false,
        room: helper,
        body: [HEAL, MOVE].map(type => ({ type, hits: 100 })),
        memory: {
          role: "healer",
          homeRoom: "W17S29",
          task: "defenseAssist",
          assistTarget: "W19S28",
          targetRoom: "W19S28",
          defenseSquadId: "defenseAssist:W17S29:W19S28:990",
          defenseSquadSize: 2,
          defenseSquadCreatedAt: 990,
          defenseAssistReleasedAt: 1000,
          defenseAssistReleaseReason: "squad-quorum"
        }
      } as unknown as Creep
    } as typeof Game.creeps;

    const entry = collectDefenseAssistTelemetry("W17S29").find(item => item.targetRoom === "W19S28");

    assert.isOk(entry);
    assert.deepInclude(entry!.requested, { guard: 1, ranger: 1, healer: 0, total: 2 });
    assert.deepInclude(entry!.queued, { guard: 1, total: 1 });
    assert.deepInclude(entry!.staged, { ranger: 1, total: 1 });
    assert.deepInclude(entry!.moving, { healer: 1, total: 1 });
    assert.equal(entry!.released.byReason["squad-quorum"], 1);
    assert.equal(entry!.bodyCost.guard, 130);
    assert.equal(entry!.affordable.guard, true);
    assert.isAbove(entry!.assignedPower.score, 0);
    assert.equal(entry!.blockReason, "none");
  });

  it("derives defense-assist defer reasons for blocked helper-room waves", () => {
    const helper = createRoom([], "W17S29", 800, 0);
    Game.rooms.W17S29 = helper;
    Game.rooms.W18S28 = createRoom([], "W18S28", 800, 800, 3, false);
    Game.rooms.W19S28 = createRoom([createHostile([ATTACK, ATTACK, MOVE])], "W19S28", 800, 800, 3, false);
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      { roomName: "W18S28", guardsNeeded: 1, rangersNeeded: 0, healersNeeded: 0, urgency: 2, createdAt: 990 },
      { roomName: "W19S28", guardsNeeded: 1, rangersNeeded: 0, healersNeeded: 0, urgency: 3, createdAt: 990 },
      { roomName: "W18S29", guardsNeeded: 1, rangersNeeded: 0, healersNeeded: 0, urgency: 3, createdAt: 1 }
    ];

    spawnQueue.addRequest({
      id: "unaffordable_guard",
      roomName: "W17S29",
      role: "guard",
      family: "military",
      body: { parts: [ATTACK, MOVE], cost: 130, minCapacity: 130 },
      priority: SpawnPriority.EMERGENCY,
      targetRoom: "W18S28",
      additionalMemory: {
        task: "defenseAssist",
        assistTarget: "W18S28"
      },
      createdAt: Game.time
    });
    Game.creeps = {
      waitingGuard: {
        name: "waitingGuard",
        spawning: false,
        room: helper,
        body: [ATTACK, MOVE].map(type => ({ type, hits: 100 })),
        memory: {
          role: "guard",
          homeRoom: "W17S29",
          task: "defenseAssist",
          assistTarget: "W19S28",
          targetRoom: "W19S28"
        }
      } as unknown as Creep,
      movingGuard: {
        name: "movingGuard",
        spawning: false,
        room: createRoom([], "W18S29", 800, 800, 3, false),
        body: [ATTACK, ATTACK, MOVE, MOVE].map(type => ({ type, hits: 100 })),
        memory: {
          role: "guard",
          homeRoom: "W17S29",
          task: "defenseAssist",
          assistTarget: "W19S28",
          targetRoom: "W19S28"
        }
      } as unknown as Creep
    } as typeof Game.creeps;

    const entries = collectDefenseAssistTelemetry("W17S29");
    const unaffordable = entries.find(item => item.targetRoom === "W18S28");
    const waitingForParity = entries.find(item => item.targetRoom === "W19S28");

    assert.isUndefined(entries.find(item => item.targetRoom === "W18S29"));
    assert.equal(unaffordable?.blockReason, "unaffordable");
    assert.equal(unaffordable?.affordable.guard, false);
    assert.equal(waitingForParity?.blockReason, "waiting-for-parity");
    assert.isAbove(waitingForParity!.assignedPower.score, waitingForParity!.targetScore);
    assert.isBelow(waitingForParity!.parityPercent, 100);
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

  it("suppresses peaceful idle guard demand in RCL2 bootstrap rooms", () => {
    const room = createRoom([], "W19S26", 300, 300, 2);
    Game.rooms.W19S26 = room;
    Game.creeps = {
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W19S26" } },
      harvester2: { spawning: false, memory: { role: "harvester", homeRoom: "W19S26" } },
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W19S26" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W19S26" } }
    } as unknown as typeof Game.creeps;

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const plan = createSpawnPlan(room, { danger: 0, posture: "eco" } as any);

    assert.isUndefined(plan.requests.find(request => request.role === "guard"));
  });

  it("keeps one peaceful idle guard reserve after early bootstrap", () => {
    const room = createRoom([], "W1N1", 800, 800, 3);
    Game.rooms.W1N1 = room;
    Game.creeps = {
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W1N1" } },
      harvester2: { spawning: false, memory: { role: "harvester", homeRoom: "W1N1" } },
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W1N1" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W1N1" } }
    } as unknown as typeof Game.creeps;

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const plan = createSpawnPlan(room, { danger: 0, posture: "eco" } as any);

    assert.exists(plan.requests.find(request => request.role === "guard"));
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
        createdAt: Game.time,
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

  it("reuses same-tick defense-assist accounting and recomputes on a new tick", () => {
    const helper = createRoom([], "W17S29", 1800, 1800);
    const attacked = createRoom([createHostile([ATTACK, RANGED_ATTACK, HEAL, MOVE])], "W19S28", 0, 0, 5, false);
    let hostileScans = 0;
    const originalFind = attacked.find.bind(attacked);
    (attacked as unknown as { find: Room["find"] }).find = ((type: FindConstant) => {
      if (type === FIND_HOSTILE_CREEPS) hostileScans++;
      return originalFind(type as never);
    }) as Room["find"];
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
        createdAt: Game.time,
        threat: "visible mixed assault"
      }
    ];

    const originalGetPendingRequests = spawnQueue.getPendingRequests.bind(spawnQueue);
    const patchedSpawnQueue = spawnQueue as unknown as { getPendingRequests: typeof spawnQueue.getPendingRequests };
    let pendingRequestScans = 0;
    patchedSpawnQueue.getPendingRequests = (roomName: string) => {
      pendingRequestScans++;
      return originalGetPendingRequests(roomName);
    };

    try {
      const { getDefenseAssistSpawnAssignment } = require("../src/spawnNeedsAnalyzer") as typeof import("../src/spawnNeedsAnalyzer");
      const roomCount = Object.keys(Game.rooms).length;

      const assignments = (["guard", "ranger", "healer"] as const)
        .map(role => getDefenseAssistSpawnAssignment("W17S29", role));

      assert.isTrue(assignments.some(Boolean), "visible attack should produce at least one helper-room assist");
      assert.equal(hostileScans, 1, "target threat profile should be scanned once for same-tick role checks");
      assert.equal(pendingRequestScans, roomCount, "assigned creep/queue accounting should scan each room once per tick");

      spawnQueue.addRequest({
        id: "queued_assist_guard",
        roomName: "W17S29",
        role: "guard",
        family: "military",
        body: { parts: [ATTACK, MOVE], cost: 130, minCapacity: 130 },
        priority: SpawnPriority.EMERGENCY,
        targetRoom: "W19S28",
        additionalMemory: { task: "defenseAssist", assistTarget: "W19S28" },
        createdAt: Game.time
      });
      getDefenseAssistSpawnAssignment("W17S29", "guard");
      assert.equal(pendingRequestScans, roomCount * 2, "same-tick queue mutations should invalidate assigned accounting");

      const hostileScansAfterQueueMutation = hostileScans;
      Game.time += 1;
      getDefenseAssistSpawnAssignment("W17S29", "ranger");
      assert.equal(hostileScans, hostileScansAfterQueueMutation + 1, "target threat profile should recompute on a new tick");
      assert.equal(pendingRequestScans, roomCount * 3, "assigned creep/queue accounting should recompute on a new tick");
    } finally {
      patchedSpawnQueue.getPendingRequests = originalGetPendingRequests;
    }
  });

  it("turns spawnless hostile-room defense requests into emergency helper assists", () => {
    const helper = createRoom([], "W17S29", 800, 800, 6);
    const attacked = createRoom([createHostile([ATTACK, MOVE])], "W18S28", 800, 800, 5, false);
    Game.rooms.W17S29 = helper;
    Game.rooms.W18S28 = attacked;
    Game.creeps = {
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W17S29" } },
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W17S29" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W17S29" } }
    } as unknown as typeof Game.creeps;
    const request = createDefenseRequest(attacked, { danger: 0, posture: "eco" } as any);
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = request ? [request] : [];

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const guardRequest = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any).requests
      .find(spawnRequest => spawnRequest.additionalMemory?.task === "defenseAssist");

    assert.equal(request?.urgency, 3.0);
    assert.equal(guardRequest?.targetRoom, "W18S28");
    assert.equal(guardRequest?.priority, SpawnPriority.EMERGENCY);
    assert.include(guardRequest?.additionalMemory, { task: "defenseAssist", assistTarget: "W18S28" });
  });

  it("does not queue local defenders in a hostile room with no completed spawn", () => {
    const attacked = createRoom([createHostile([ATTACK, MOVE])], "W18S28", 800, 800, 5, false);
    Game.rooms.W18S28 = attacked;
    spawnQueue.addRequest({
      id: "stale_local_guard",
      roomName: "W18S28",
      role: "guard",
      family: "military",
      body: { parts: [ATTACK, MOVE], cost: 130, minCapacity: 130 },
      priority: SpawnPriority.EMERGENCY,
      createdAt: Game.time
    });

    populateSpawnQueue(attacked, { danger: 3, posture: "war" } as any);

    assert.deepEqual(spawnQueue.getPendingRequests("W18S28"), []);
  });

  it("does not queue local defenders when room energy capacity is zero", () => {
    const attacked = createRoom([createHostile([ATTACK, MOVE])], "W18S28", 0, 0, 5, true);
    Game.rooms.W18S28 = attacked;
    spawnQueue.addRequest({
      id: "stale_zero_capacity_guard",
      roomName: "W18S28",
      role: "guard",
      family: "military",
      body: { parts: [ATTACK, MOVE], cost: 130, minCapacity: 130 },
      priority: SpawnPriority.EMERGENCY,
      createdAt: Game.time
    });

    populateSpawnQueue(attacked, { danger: 3, posture: "war" } as any);

    assert.deepEqual(spawnQueue.getPendingRequests("W18S28"), []);
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
      ["defenseAssist:W17S29:W19S28:990"]
    );
    for (const request of assistRequests) {
      assert.equal(request.additionalMemory?.defenseSquadSize, 3);
      assert.equal(request.additionalMemory?.defenseSquadCreatedAt, 990);
    }
  });

  it("keeps helper defense-assist wave ids and staging start stable across planning ticks", () => {
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
        rangersNeeded: 0,
        healersNeeded: 0,
        urgency: 3,
        createdAt: 900,
        threat: "visible mixed assault"
      }
    ];

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const firstRequest = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any).requests
      .find(request => request.additionalMemory?.task === "defenseAssist");
    Game.time = 1005;
    const secondRequest = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any).requests
      .find(request => request.additionalMemory?.task === "defenseAssist");

    assert.equal(firstRequest?.additionalMemory?.defenseSquadId, "defenseAssist:W17S29:W19S28:900");
    assert.equal(secondRequest?.additionalMemory?.defenseSquadId, "defenseAssist:W17S29:W19S28:900");
    assert.equal(firstRequest?.additionalMemory?.defenseSquadCreatedAt, 900);
    assert.equal(secondRequest?.additionalMemory?.defenseSquadCreatedAt, 900);
  });

  it("stabilizes wave IDs across request refreshes", () => {
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
        rangersNeeded: 0,
        healersNeeded: 0,
        urgency: 3,
        createdAt: 1000,
        threat: "visible mixed assault"
      }
    ];

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const initial = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any).requests
      .find(request => request.additionalMemory?.task === "defenseAssist");

    Game.time = 1050;
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W19S28",
        guardsNeeded: 1,
        rangersNeeded: 0,
        healersNeeded: 0,
        urgency: 3,
        createdAt: 1050,
        threat: "visible mixed assault"
      }
    ];
    const refreshed = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any).requests
      .find(request => request.additionalMemory?.task === "defenseAssist");

    Game.time = 2405;
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W19S28",
        guardsNeeded: 1,
        rangersNeeded: 0,
        healersNeeded: 0,
        urgency: 3,
        createdAt: 2405,
        threat: "visible mixed assault"
      }
    ];
    const newWave = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any).requests
      .find(request => request.additionalMemory?.task === "defenseAssist");

    assert.equal(initial?.additionalMemory?.defenseSquadId, "defenseAssist:W17S29:W19S28:1000");
    assert.equal(refreshed?.additionalMemory?.defenseSquadId, "defenseAssist:W17S29:W19S28:1000");
    assert.equal(newWave?.additionalMemory?.defenseSquadId, "defenseAssist:W17S29:W19S28:2405");
    assert.equal(initial?.additionalMemory?.defenseSquadCreatedAt, 1000);
    assert.equal(refreshed?.additionalMemory?.defenseSquadCreatedAt, 1000);
    assert.equal(newWave?.additionalMemory?.defenseSquadCreatedAt, 2405);
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

  it("uses an affordable guard fallback instead of tiny emergency ranger assists for unseen urgent requests", () => {
    const helper = createRoom([], "W17S29", 300, 300);
    Game.rooms.W17S29 = helper;
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
    const requests = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any).requests;
    const tinyRangerAssist = requests.find(request => request.role === "ranger" &&
      request.priority >= SpawnPriority.EMERGENCY &&
      request.additionalMemory?.task === "defenseAssist" &&
      request.body.parts.length < 6);
    const rangerAssists = requests.filter(request => request.role === "ranger" &&
      request.priority >= SpawnPriority.EMERGENCY &&
      request.additionalMemory?.task === "defenseAssist");
    const guardFallback = requests.find(request => request.role === "guard" &&
      request.priority >= SpawnPriority.EMERGENCY &&
      request.additionalMemory?.task === "defenseAssist");

    assert.isUndefined(tinyRangerAssist);
    for (const rangerAssist of rangerAssists) {
      assert.isAtLeast(rangerAssist.body.parts.length, 6);
      assert.isAtLeast(rangerAssist.body.parts.filter(part => part === RANGED_ATTACK).length, 2);
    }
    assert.isOk(guardFallback);
    assert.isAtMost(guardFallback!.body.cost, helper.energyAvailable);
  });

  it("uses capacity-sized local emergency defenders against visible hard threats", () => {
    const hostile = createHostile(createRepeatedParts([TOUGH, 5], [RANGED_ATTACK, 25], [MOVE, 10], [HEAL, 10]));
    const room = createRoom([hostile], "W1N1", 1800, 300);
    Game.rooms.W1N1 = room;

    populateSpawnQueue(room, { danger: 3, posture: "defense" } as any);

    const defenderRequests = spawnQueue.getPendingRequests("W1N1")
      .filter(request => request.role === "guard" || request.role === "ranger" || request.role === "healer");

    assert.isAbove(defenderRequests.length, 0);
    assert.isTrue(defenderRequests.some(request => request.body.parts.length >= 6));
    assert.isTrue(defenderRequests.some(request => request.body.cost > room.energyAvailable));
  });

  it("adds an affordable emergency local defender for one hard invader without war posture", () => {
    const hardInvader = createHostile(createRepeatedParts([TOUGH, 5], [RANGED_ATTACK, 25], [MOVE, 10], [HEAL, 10]));
    const room = createRoom([hardInvader], "W9N6", 1800, 300, 4);
    Game.rooms.W9N6 = room;
    Game.creeps = {
      worker1: { spawning: false, memory: { role: "harvester", homeRoom: "W9N6" } }
    } as unknown as typeof Game.creeps;

    populateSpawnQueue(room, { danger: 2, posture: "defense" } as any);

    const defenderRequests = spawnQueue.getPendingRequests("W9N6")
      .filter(request => request.role === "guard" || request.role === "ranger" || request.role === "healer");
    const affordableEmergencyDefenders = defenderRequests.filter(request =>
      request.priority === SpawnPriority.EMERGENCY && request.body.cost <= room.energyAvailable
    );
    const next = spawnQueue.getNextRequest("W9N6", room.energyAvailable);

    assert.isTrue(defenderRequests.some(request => request.body.cost > room.energyAvailable));
    assert.lengthOf(affordableEmergencyDefenders, 1);
    assert.includeMembers(affordableEmergencyDefenders[0]!.body.parts, [MOVE]);
    assert.isTrue(
      affordableEmergencyDefenders[0]!.body.parts.includes(ATTACK) ||
      affordableEmergencyDefenders[0]!.body.parts.includes(RANGED_ATTACK)
    );
    assert.equal(next?.id, affordableEmergencyDefenders[0]!.id);
  });

  it("queues an emergency refuel hauler before defense assists when helper energy is trapped in source containers", () => {
    const hardInvaders = [
      createHostile(createRepeatedParts([RANGED_ATTACK, 14], [MOVE, 25], [HEAL, 11])),
      createHostile(createRepeatedParts([RANGED_ATTACK, 14], [MOVE, 25], [HEAL, 11])),
      createHostile(createRepeatedParts([ATTACK, 17], [MOVE, 17])),
      createHostile(createRepeatedParts([CLAIM, 11], [MOVE, 11]))
    ];
    const helper = createRoom([], "W17S29", 2300, 21, 6);
    const attacked = createRoom(hardInvaders, "W18S28", 0, 0, 5, false);
    const source = createSource();
    const sourceContainer = createSourceContainer(2000);
    const originalFind = helper.find.bind(helper);
    (helper as unknown as { find: Room["find"] }).find = ((type: FindConstant) => {
      if (type === FIND_SOURCES) return [source];
      if (type === FIND_STRUCTURES) return [sourceContainer];
      return originalFind(type as never);
    }) as Room["find"];
    Game.rooms.W17S29 = helper;
    Game.rooms.W18S28 = attacked;
    Game.creeps = {
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W17S29" } },
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W17S29" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W17S29" } }
    } as unknown as typeof Game.creeps;
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W18S28",
        guardsNeeded: 1,
        rangersNeeded: 1,
        healersNeeded: 1,
        urgency: 3,
        createdAt: Game.time,
        threat: "spawnless ranged-heal claim attack"
      }
    ];

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const requests = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any).requests;
    const refuel = requests.find(request => request.role === "hauler" && request.additionalMemory?.task === "defenseRefuel");
    const firstAssistIndex = requests.findIndex(request => request.additionalMemory?.task === "defenseAssist");
    const refuelIndex = requests.findIndex(request => request.id === refuel?.id);

    assert.isOk(refuel, "source-container energy should create a visible emergency refuel request");
    assert.equal(refuel!.priority, SpawnPriority.EMERGENCY);
    assert.deepEqual(refuel!.body.parts, [CARRY, MOVE]);
    assert.equal(refuel!.body.cost, 100);
    if (firstAssistIndex >= 0) assert.isBelow(refuelIndex, firstAssistIndex);
  });

  it("scales dedicated defense refuelers when ranged/healer assists are still energy-blocked", () => {
    const helper = createRoom([], "W18S29", 2300, 177, 6);
    const attacked = createRoom([
      createHostile([RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, HEAL, MOVE]),
      createHostile([ATTACK, ATTACK, MOVE, MOVE, MOVE, ATTACK, ATTACK, MOVE]),
      createHostile([RANGED_ATTACK, MOVE, MOVE, HEAL, HEAL, MOVE]),
      createHostile([RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, HEAL, MOVE])
    ], "W18S28", 0, 0, 5, false);
    const source = createSource();
    const sourceContainer = createSourceContainer(2000);
    const originalFind = helper.find.bind(helper);
    (helper as unknown as { find: Room["find"] }).find = ((type: FindConstant) => {
      if (type === FIND_SOURCES) return [source];
      if (type === FIND_STRUCTURES) return [sourceContainer];
      return originalFind(type as never);
    }) as Room["find"];
    Game.rooms.W18S29 = helper;
    Game.rooms.W18S28 = attacked;
    Game.creeps = {
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W18S29", task: "defenseRefuel" } },
      hauler2: { spawning: false, memory: { role: "hauler", homeRoom: "W18S29", task: "defenseRefuel" } },
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W18S29" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W18S29" } }
    } as unknown as typeof Game.creeps;
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W18S28",
        guardsNeeded: 2,
        rangersNeeded: 2,
        healersNeeded: 1,
        urgency: 3,
        createdAt: Game.time,
        threat: "spawnless mixed ranged-heal attack"
      }
    ];

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const requests = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any).requests;

    const refuel = requests.find(request => request.role === "hauler" && request.additionalMemory?.task === "defenseRefuel");
    assert.isOk(refuel, "helper should scale refuel throughput before waiting on unaffordable ranger/healer assists");
    assert.equal(refuel!.priority, SpawnPriority.EMERGENCY);
    assert.deepEqual(refuel!.body.parts, [CARRY, MOVE]);
  });

  it("caps scaled defense refuelers after four dedicated emergency haulers", () => {
    const helper = createRoom([], "W18S29", 2300, 177, 6);
    const attacked = createRoom([
      createHostile([RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, HEAL, MOVE]),
      createHostile([ATTACK, ATTACK, MOVE, MOVE, MOVE, ATTACK, ATTACK, MOVE]),
      createHostile([RANGED_ATTACK, MOVE, MOVE, HEAL, HEAL, MOVE]),
      createHostile([RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, HEAL, MOVE])
    ], "W18S28", 0, 0, 5, false);
    const source = createSource();
    const sourceContainer = createSourceContainer(2000);
    const originalFind = helper.find.bind(helper);
    (helper as unknown as { find: Room["find"] }).find = ((type: FindConstant) => {
      if (type === FIND_SOURCES) return [source];
      if (type === FIND_STRUCTURES) return [sourceContainer];
      return originalFind(type as never);
    }) as Room["find"];
    Game.rooms.W18S29 = helper;
    Game.rooms.W18S28 = attacked;
    Game.creeps = {
      refuel1: { spawning: false, memory: { role: "hauler", homeRoom: "W18S29", task: "defenseRefuel" } },
      refuel2: { spawning: false, memory: { role: "hauler", homeRoom: "W18S29", task: "defenseRefuel" } },
      refuel3: { spawning: false, memory: { role: "hauler", homeRoom: "W18S29", task: "defenseRefuel" } },
      refuel4: { spawning: false, memory: { role: "hauler", homeRoom: "W18S29", task: "defenseRefuel" } },
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W18S29" } },
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W18S29" } }
    } as unknown as typeof Game.creeps;
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W18S28",
        guardsNeeded: 2,
        rangersNeeded: 2,
        healersNeeded: 1,
        urgency: 3,
        createdAt: Game.time,
        threat: "spawnless mixed ranged-heal attack"
      }
    ];

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const requests = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any).requests;

    assert.isUndefined(requests.find(request => request.role === "hauler" && request.additionalMemory?.task === "defenseRefuel"));
  });

  it("does not add a defense refuel hauler when two local haulers are already available", () => {
    const helper = createRoom([], "W17S29", 2300, 21, 6);
    const attacked = createRoom([createHostile([ATTACK, MOVE])], "W18S28", 0, 0, 5, false);
    const source = createSource();
    const sourceContainer = createSourceContainer(2000);
    const originalFind = helper.find.bind(helper);
    (helper as unknown as { find: Room["find"] }).find = ((type: FindConstant) => {
      if (type === FIND_SOURCES) return [source];
      if (type === FIND_STRUCTURES) return [sourceContainer];
      return originalFind(type as never);
    }) as Room["find"];
    Game.rooms.W17S29 = helper;
    Game.rooms.W18S28 = attacked;
    Game.creeps = {
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W17S29" } },
      hauler2: { spawning: false, memory: { role: "hauler", homeRoom: "W17S29" } }
    } as unknown as typeof Game.creeps;
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W18S28",
        guardsNeeded: 1,
        urgency: 3,
        createdAt: Game.time,
        threat: "spawnless attack"
      }
    ];

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const requests = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any).requests;

    assert.isUndefined(requests.find(request => request.role === "hauler" && request.additionalMemory?.task === "defenseRefuel"));
  });

  it("does not add a duplicate defense refuel hauler while one is spawning", () => {
    const helper = createRoom([], "W17S29", 2300, 21, 6);
    const attacked = createRoom([createHostile([ATTACK, MOVE])], "W18S28", 0, 0, 5, false);
    const source = createSource();
    const sourceContainer = createSourceContainer(2000);
    const originalFind = helper.find.bind(helper);
    (helper as unknown as { find: Room["find"] }).find = ((type: FindConstant) => {
      if (type === FIND_SOURCES) return [source];
      if (type === FIND_STRUCTURES) return [sourceContainer];
      return originalFind(type as never);
    }) as Room["find"];
    Game.rooms.W17S29 = helper;
    Game.rooms.W18S28 = attacked;
    Game.creeps = {
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W17S29" } },
      refueler1: { spawning: true, memory: { role: "hauler", homeRoom: "W17S29", task: "defenseRefuel" } },
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W17S29" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W17S29" } }
    } as unknown as typeof Game.creeps;
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W18S28",
        guardsNeeded: 1,
        urgency: 3,
        createdAt: Game.time,
        threat: "spawnless attack"
      }
    ];

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const requests = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any).requests;

    assert.isUndefined(requests.find(request => request.role === "hauler" && request.additionalMemory?.task === "defenseRefuel"));
  });

  it("keeps defense refuel visible when an unrelated local hauler is queued", () => {
    const helper = createRoom([], "W17S29", 2300, 21, 6);
    const attacked = createRoom([createHostile([ATTACK, MOVE])], "W18S28", 0, 0, 5, false);
    const source = createSource();
    const sourceContainer = createSourceContainer(2000);
    const originalFind = helper.find.bind(helper);
    (helper as unknown as { find: Room["find"] }).find = ((type: FindConstant) => {
      if (type === FIND_SOURCES) return [source];
      if (type === FIND_STRUCTURES) return [sourceContainer];
      return originalFind(type as never);
    }) as Room["find"];
    Game.rooms.W17S29 = helper;
    Game.rooms.W18S28 = attacked;
    Game.creeps = {
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W17S29" } },
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W17S29" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W17S29" } }
    } as unknown as typeof Game.creeps;
    spawnQueue.addRequest({
      id: "normal_local_hauler",
      roomName: "W17S29",
      role: "hauler",
      family: "economy",
      body: { parts: [CARRY, MOVE], cost: 100, minCapacity: 100 },
      priority: SpawnPriority.NORMAL,
      createdAt: Game.time
    });
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W18S28",
        guardsNeeded: 1,
        urgency: 3,
        createdAt: Game.time,
        threat: "spawnless attack"
      }
    ];

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const requests = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any).requests;

    const refuel = requests.find(request => request.role === "hauler" && request.additionalMemory?.task === "defenseRefuel");
    assert.isOk(refuel);
  });

  it("preempts an existing helper-room queue with emergency defense refuel", () => {
    const helper = createRoom([], "W17S29", 2300, 21, 6);
    const attacked = createRoom([createHostile([ATTACK, MOVE])], "W18S28", 0, 0, 5, false);
    const source = createSource();
    const sourceContainer = createSourceContainer(2000);
    const originalFind = helper.find.bind(helper);
    (helper as unknown as { find: Room["find"] }).find = ((type: FindConstant) => {
      if (type === FIND_SOURCES) return [source];
      if (type === FIND_STRUCTURES) return [sourceContainer];
      return originalFind(type as never);
    }) as Room["find"];
    Game.rooms.W17S29 = helper;
    Game.rooms.W18S28 = attacked;
    Game.creeps = {
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W17S29" } },
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W17S29" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W17S29" } }
    } as unknown as typeof Game.creeps;
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
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W18S28",
        guardsNeeded: 1,
        urgency: 3,
        createdAt: Game.time,
        threat: "spawnless attack"
      }
    ];

    populateSpawnQueue(helper, { danger: 0, posture: "eco" } as any);

    const refuel = spawnQueue.getPendingRequests("W17S29").find(request =>
      request.role === "hauler" && request.additionalMemory?.task === "defenseRefuel"
    );
    assert.isOk(refuel);
    assert.equal(refuel?.priority, SpawnPriority.EMERGENCY);
  });

  it("adds an emergency helper-room assist for a spawnless RCL5 room with current mixed hostiles", () => {
    const liveHostiles = [
      createHostile([RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, HEAL, MOVE]),
      createHostile([ATTACK, ATTACK, MOVE, MOVE, MOVE, ATTACK, ATTACK, MOVE]),
      createHostile([RANGED_ATTACK, MOVE, MOVE, HEAL, HEAL, MOVE]),
      createHostile([RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, HEAL, MOVE])
    ];
    const helper = createRoom([], "W18S29", 800, 800, 6);
    const attacked = createRoom(liveHostiles, "W18S28", 0, 0, 5, false);
    Game.rooms.W18S29 = helper;
    Game.rooms.W18S28 = attacked;
    Game.creeps = {
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W18S29" } },
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W18S29" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W18S29" } }
    } as unknown as typeof Game.creeps;

    const request = createDefenseRequest(attacked, { danger: 0, posture: "eco" } as any);
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = request ? [request] : [];

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const plan = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any);
    const assistRequests = plan.requests
      .filter(spawnRequest => spawnRequest.additionalMemory?.task === "defenseAssist");
    const emergencyAssist = assistRequests.find(spawnRequest =>
      spawnRequest.targetRoom === "W18S28" && spawnRequest.priority === SpawnPriority.EMERGENCY
    );

    assert.isOk(request, "spawnless hostile room should create a defense-assist request");
    assert.isOk(emergencyAssist, "helper room should answer the live spawnless-hostile pattern");
    assert.equal(emergencyAssist!.role, "guard");
    assert.isAtMost(emergencyAssist!.body.cost, helper.energyAvailable);
    assert.include(emergencyAssist!.additionalMemory, { task: "defenseAssist", assistTarget: "W18S28" });
  });

  it("adds an affordable emergency helper-room assist when hard-threat bodies exceed current helper energy", () => {
    const hardInvaders = [
      createHostile(createRepeatedParts([RANGED_ATTACK, 14], [MOVE, 25], [HEAL, 11])),
      createHostile(createRepeatedParts([RANGED_ATTACK, 14], [MOVE, 25], [HEAL, 11])),
      createHostile(createRepeatedParts([RANGED_ATTACK, 14], [MOVE, 25], [HEAL, 11])),
      createHostile(createRepeatedParts([RANGED_ATTACK, 14], [MOVE, 25], [HEAL, 11]))
    ];
    const helper = createRoom([], "W18S29", 2300, 293, 6);
    const attacked = createRoom(hardInvaders, "W18S28", 350, 185, 5);
    Game.rooms.W18S29 = helper;
    Game.rooms.W18S28 = attacked;
    Game.creeps = {
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W18S29" } },
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W18S29" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W18S29" } }
    } as unknown as typeof Game.creeps;
    (Memory as unknown as { defenseRequests: unknown[] }).defenseRequests = [
      {
        roomName: "W18S28",
        guardsNeeded: 0,
        rangersNeeded: 1,
        healersNeeded: 0,
        urgency: 3,
        createdAt: Game.time,
        threat: "hard ranged healer attack"
      }
    ];

    const { createSpawnPlan } = require("../src/spawnIntentCompiler") as typeof import("../src/spawnIntentCompiler");
    const assistRequests = createSpawnPlan(helper, { danger: 0, posture: "eco" } as any).requests
      .filter(request => request.additionalMemory?.task === "defenseAssist");
    const affordableAssist = assistRequests.find(request => request.body.cost <= helper.energyAvailable);

    assert.isOk(affordableAssist);
    assert.equal(affordableAssist!.role, "guard");
    assert.equal(affordableAssist!.targetRoom, "W18S28");
    assert.equal(affordableAssist!.priority, SpawnPriority.EMERGENCY);
    assert.isAtMost(affordableAssist!.body.cost, helper.energyAvailable);
    assert.includeMembers(affordableAssist!.body.parts, [ATTACK, MOVE]);
    assert.include(affordableAssist!.additionalMemory, { task: "defenseAssist", assistTarget: "W18S28" });
    assert.equal(affordableAssist!.additionalMemory?.defenseSquadId, "defenseAssist:W18S29:W18S28:1000");
    assert.equal(affordableAssist!.additionalMemory?.defenseSquadCreatedAt, Game.time);
    assert.isFalse(assistRequests.some(request => request.body.cost > helper.energyAvailable));
  });

  it("adds an affordable emergency local defender when hard-threat bodies exceed current room energy", () => {
    const hardInvaders = [
      createHostile(createRepeatedParts([RANGED_ATTACK, 14], [MOVE, 25], [HEAL, 11])),
      createHostile(createRepeatedParts([RANGED_ATTACK, 14], [MOVE, 25], [HEAL, 11])),
      createHostile(createRepeatedParts([RANGED_ATTACK, 14], [MOVE, 25], [HEAL, 11])),
      createHostile(createRepeatedParts([RANGED_ATTACK, 14], [MOVE, 25], [HEAL, 11]))
    ];
    const room = createRoom(hardInvaders, "W18S28", 350, 185, 5);
    Game.rooms.W18S28 = room;
    Game.creeps = {
      worker1: { spawning: false, memory: { role: "harvester", homeRoom: "W18S28" } }
    } as unknown as typeof Game.creeps;

    populateSpawnQueue(room, { danger: 3, posture: "war" } as any);

    const next = spawnQueue.getNextRequest("W18S28", room.energyAvailable);

    assert.equal(next?.role, "guard");
    assert.equal(next?.priority, SpawnPriority.EMERGENCY);
    assert.isAtMost(next!.body.cost, room.energyAvailable);
    assert.includeMembers(next!.body.parts, [ATTACK, MOVE]);
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

  it("does not count outbound defense assists as local pending defender power", () => {
    const localHostile = createHostile([ATTACK, MOVE]);
    const helper = createRoom([localHostile], "W17S29", 800, 800);
    Game.rooms.W17S29 = helper;
    Game.creeps = {
      harvester1: { spawning: false, memory: { role: "harvester", homeRoom: "W17S29" } },
      hauler1: { spawning: false, memory: { role: "hauler", homeRoom: "W17S29" } },
      upgrader1: { spawning: false, memory: { role: "upgrader", homeRoom: "W17S29" } }
    } as unknown as typeof Game.creeps;
    spawnQueue.addRequest({
      id: "outbound_assist_guard",
      roomName: "W17S29",
      role: "guard",
      family: "military",
      body: { parts: [ATTACK, ATTACK, MOVE, MOVE], cost: 260, minCapacity: 260 },
      priority: SpawnPriority.EMERGENCY,
      targetRoom: "W19S28",
      createdAt: Game.time,
      additionalMemory: { task: "defenseAssist", assistTarget: "W19S28", targetRoom: "W19S28" }
    });

    populateSpawnQueue(helper, { danger: 1, posture: "defense" } as any);

    const pending = spawnQueue.getPendingRequests("W17S29");
    const localDefender = pending.find(request =>
      (request.role === "guard" || request.role === "ranger" || request.role === "healer") &&
      request.id !== "outbound_assist_guard" &&
      !request.targetRoom &&
      !request.additionalMemory?.assistTarget
    );

    assert.isOk(pending.find(request => request.id === "outbound_assist_guard"), "outbound assist remains queued");
    assert.isOk(localDefender, "outbound assists must not satisfy the helper room's direct hostile defense need");
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

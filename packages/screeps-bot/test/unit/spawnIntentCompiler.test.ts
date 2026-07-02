import { assert } from "chai";
import type { SwarmState } from "../../src/memory/schemas";
import {
  compileSpawnDemandToRequest,
  createSpawnPlan,
  planSpawnDemand,
  populateSpawnQueue,
  processSpawnQueue
} from "@ralphschuler/screeps-spawn";
import { SpawnPriority, spawnQueue } from "@ralphschuler/screeps-spawn";

function createSwarm(remoteAssignments: string[] = []): SwarmState {
  return {
    colonyLevel: "matureColony",
    posture: "eco",
    danger: 0,
    pheromones: {
      expand: 0,
      harvest: 10,
      build: 5,
      upgrade: 5,
      defense: 0,
      war: 0,
      siege: 0,
      logistics: 5,
      nukeTarget: 0
    },
    nextUpdateTick: 0,
    eventLog: [],
    missingStructures: {
      spawn: false,
      storage: false,
      terminal: true,
      labs: true,
      nuker: true,
      factory: true,
      extractor: true,
      powerSpawn: true,
      observer: true
    },
    role: "capital",
    remoteAssignments,
    metrics: {
      energyHarvested: 0,
      energySpawning: 0,
      energyConstruction: 0,
      energyRepair: 0,
      energyTower: 0,
      controllerProgress: 0,
      hostileCount: 0,
      damageReceived: 0,
      constructionSites: 0,
      energyAvailable: 0,
      energyCapacity: 0,
      energyNeed: 0
    },
    lastUpdate: 1000
  };
}

function createRoom(name = "W1N1", spawns: StructureSpawn[] = []): Room {
  return {
    name,
    energyCapacityAvailable: 800,
    energyAvailable: 800,
    controller: { my: true, level: 8 },
    find: (type: FindConstant) => {
      if (type === FIND_MY_SPAWNS) return spawns;
      if (type === FIND_MY_STRUCTURES) return spawns;
      return [];
    }
  } as unknown as Room;
}

function createSpawn(name: string, roomName = "W1N1"): StructureSpawn {
  return {
    id: name as Id<StructureSpawn>,
    name,
    structureType: STRUCTURE_SPAWN,
    owner: { username: "TedRoastBeef" },
    room: { name: roomName }
  } as unknown as StructureSpawn;
}

function createConstructionSite(type: BuildableStructureConstant): ConstructionSite {
  return {
    id: `${type}Site` as Id<ConstructionSite>,
    structureType: type,
    progress: 0,
    progressTotal: type === STRUCTURE_SPAWN ? 15000 : 5000
  } as unknown as ConstructionSite;
}

function createSpawnlessOwnedRoom(
  name: string,
  spawns: StructureSpawn[] = [],
  sites: ConstructionSite[] = []
): Room {
  return {
    name,
    energyCapacityAvailable: 300,
    energyAvailable: 0,
    controller: { my: true, level: 1 },
    find: (type: FindConstant) => {
      if (type === FIND_MY_SPAWNS) return spawns;
      if (type === FIND_MY_STRUCTURES) return spawns;
      if (type === FIND_HOSTILE_CREEPS) return [];
      if (type === FIND_MY_CONSTRUCTION_SITES) return sites;
      return [];
    }
  } as unknown as Room;
}

function populateStableParentCreeps(homeRoom = "W1N1"): void {
  Game.creeps = {
    Harvester1: { memory: { role: "harvester", homeRoom }, spawning: false },
    Hauler1: { memory: { role: "hauler", homeRoom }, spawning: false },
    Upgrader1: { memory: { role: "upgrader", homeRoom }, spawning: false }
  } as unknown as typeof Game.creeps;
}

describe("spawn intent compiler", () => {
  beforeEach(() => {
    (global as any).Game = {
      time: 1000,
      rooms: {},
      creeps: {},
      spawns: {
        Spawn1: { owner: { username: "TedRoastBeef" } }
      },
      gcl: { level: 1 },
      map: {
        getRoomLinearDistance: (a: string, b: string) => (a === b ? 0 : 1)
      },
      getObjectById: () => null
    };
    (global as any).Memory = { creeps: {}, rooms: {} };
    delete (global as any)._heapCache;
    spawnQueue.clearQueue("W1N1");
  });

  afterEach(() => {
    delete (global as any).Game;
  });

  it("plans spawn demand without mutating the queue", () => {
    const room = createRoom();
    Game.rooms.W1N1 = room;

    const demands = planSpawnDemand(room, createSwarm());

    assert.isTrue(demands.some(demand => demand.roleName === "larvaWorker"));
    assert.equal(spawnQueue.getQueueSize("W1N1"), 0, "planning should not enqueue requests");
  });

  it("exposes demand magnitude without mutating the queue", () => {
    const room = createRoom();
    Game.rooms.W1N1 = room;
    Game.creeps = {
      Harvester1: { memory: { role: "harvester", homeRoom: "W1N1" } },
      Hauler1: { memory: { role: "hauler", homeRoom: "W1N1" } },
      Upgrader1: { memory: { role: "upgrader", homeRoom: "W1N1" } }
    } as unknown as typeof Game.creeps;

    const demand = planSpawnDemand(room, createSwarm()).find(item => item.roleName === "upgrader");

    assert.exists(demand);
    assert.equal(demand!.current, 1);
    assert.equal(demand!.target, 12);
    assert.equal(demand!.missing, 11);
    assert.equal(spawnQueue.getQueueSize("W1N1"), 0, "planning should not enqueue requests");
  });

  it("does not plan demand for roles already at their room maximum", () => {
    const room = createRoom();
    Game.rooms.W1N1 = room;
    Game.creeps = {
      Harvester1: { memory: { role: "harvester", homeRoom: "W1N1" } },
      Harvester2: { memory: { role: "harvester", homeRoom: "W1N1" } }
    } as unknown as typeof Game.creeps;

    const demands = planSpawnDemand(room, createSwarm());

    assert.isFalse(demands.some(demand => demand.roleName === "harvester"));
  });

  it("compiles one demand into a queue request", () => {
    const room = createRoom();
    Game.rooms.W1N1 = room;
    const demand = planSpawnDemand(room, createSwarm()).find(item => item.roleName === "larvaWorker");
    assert.exists(demand);

    const request = compileSpawnDemandToRequest(room, demand!);

    assert.exists(request);
    assert.equal(request!.roomName, "W1N1");
    assert.equal(request!.role, "larvaWorker");
    assert.isAtMost(request!.body.cost, room.energyCapacityAvailable);
  });

  it("populates the queue by compiling planned demand", () => {
    const room = createRoom();
    Game.rooms.W1N1 = room;

    populateSpawnQueue(room, createSwarm());

    assert.isTrue(spawnQueue.getPendingRequests("W1N1").some(request => request.role === "larvaWorker"));
  });

  it("promotes upgrader demand when controller downgrade risk is near", () => {
    const room = createRoom();
    (room.controller as any).ticksToDowngrade = 4000;
    Game.rooms.W1N1 = room;
    populateStableParentCreeps();

    const demand = planSpawnDemand(room, createSwarm()).find(item => item.roleName === "upgrader");

    assert.exists(demand, "room should still plan missing upgraders");
    assert.equal(demand!.priority, SpawnPriority.HIGH);
  });

  it("can disable controller downgrade upgrader promotion through Memory", () => {
    (Memory as any).spawnSettings = { controllerDowngradePriority: false };
    const room = createRoom();
    (room.controller as any).ticksToDowngrade = 4000;
    Game.rooms.W1N1 = room;
    populateStableParentCreeps();

    const demand = planSpawnDemand(room, createSwarm()).find(item => item.roleName === "upgrader");

    assert.exists(demand, "room should still plan missing upgraders");
    assert.equal(demand!.priority, SpawnPriority.NORMAL);
  });

  it("compiles reserver claimers with a concrete remote target and reserve task", () => {
    const room = createRoom();
    Game.rooms.W1N1 = room;
    Game.rooms.W2N1 = {
      name: "W2N1",
      controller: { my: false, owner: undefined, reservation: undefined },
      find: () => []
    } as unknown as Room;
    Game.creeps = {
      Harvester1: { memory: { role: "harvester", homeRoom: "W1N1" }, spawning: false },
      Hauler1: { memory: { role: "hauler", homeRoom: "W1N1" }, spawning: false },
      Upgrader1: { memory: { role: "upgrader", homeRoom: "W1N1" }, spawning: false }
    } as unknown as typeof Game.creeps;

    const request = createSpawnPlan(room, createSwarm(["W2N1"]))
      .requests.find(item => item.role === "claimer");

    assert.exists(request, "remote reservation should create claimer request");
    assert.equal(request!.targetRoom, "W2N1");
    assert.equal(request!.additionalMemory?.task, "reserve");
  });

  it("does not compile duplicate reserve claimers when one is already queued", () => {
    const room = createRoom();
    Game.rooms.W1N1 = room;
    Game.rooms.W2N1 = {
      name: "W2N1",
      controller: { my: false, owner: undefined, reservation: undefined },
      find: () => []
    } as unknown as Room;
    Game.creeps = {
      Harvester1: { memory: { role: "harvester", homeRoom: "W1N1" }, spawning: false },
      Hauler1: { memory: { role: "hauler", homeRoom: "W1N1" }, spawning: false },
      Upgrader1: { memory: { role: "upgrader", homeRoom: "W1N1" }, spawning: false }
    } as unknown as typeof Game.creeps;
    spawnQueue.addRequest({
      id: "claimer_reserve_existing",
      roomName: "W1N1",
      role: "claimer",
      family: "utility",
      body: { parts: [CLAIM, MOVE], cost: 650, minCapacity: 650 },
      priority: SpawnPriority.NORMAL,
      targetRoom: "W2N1",
      additionalMemory: { task: "reserve" },
      createdAt: Game.time
    });

    const request = createSpawnPlan(room, createSwarm(["W2N1"]))
      .requests.find(item => item.role === "claimer");

    assert.isUndefined(request, "queued reserve claimer should satisfy remote reservation demand");
  });

  it("prioritizes room recovery claimers before normal expansion claims", () => {
    const room = createRoom();
    Game.rooms.W1N1 = room;
    Game.rooms.W2N1 = {
      name: "W2N1",
      controller: { my: false, owner: undefined, reservation: undefined },
      find: () => []
    } as unknown as Room;
    Game.gcl = { level: 2 } as Game["gcl"];
    populateStableParentCreeps();
    (global as any).Memory.empire = {
      knownRooms: {},
      clusters: [],
      warTargets: [],
      ownedRooms: { W1N1: { name: "W1N1", role: "core", clusterId: "W1N1-cluster", rcl: 8 } },
      recoveryRooms: { W2N1: { roomName: "W2N1", lostAt: Game.time - 50, rcl: 5, role: "core", clusterId: "W2N1-cluster" } },
      claimQueue: [{ roomName: "W3N1", score: 90, distance: 2, claimed: false, lastEvaluated: Game.time }],
      nukeCandidates: [],
      powerBanks: [],
      objectives: { targetPowerLevel: 0, targetRoomCount: 2, warMode: false, expansionPaused: false },
      lastUpdate: Game.time
    };

    const request = createSpawnPlan(room, createSwarm())
      .requests.find(item => item.role === "claimer");

    assert.exists(request, "lost owned room recovery should create claimer request");
    assert.equal(request!.targetRoom, "W2N1");
    assert.equal(request!.additionalMemory?.task, "claim");
  });

  it("compiles expansion claimers with the queued claim target", () => {
    const room = createRoom();
    Game.rooms.W1N1 = room;
    Game.gcl = { level: 2 } as Game["gcl"];
    Game.creeps = {
      Harvester1: { memory: { role: "harvester", homeRoom: "W1N1" }, spawning: false },
      Hauler1: { memory: { role: "hauler", homeRoom: "W1N1" }, spawning: false },
      Upgrader1: { memory: { role: "upgrader", homeRoom: "W1N1" }, spawning: false }
    } as unknown as typeof Game.creeps;
    (global as any).Memory.empire = {
      knownRooms: {},
      clusters: [],
      warTargets: [],
      ownedRooms: {},
      claimQueue: [{ roomName: "W3N1", score: 90, distance: 2, claimed: false, lastEvaluated: Game.time }],
      nukeCandidates: [],
      powerBanks: [],
      objectives: { targetPowerLevel: 0, targetRoomCount: 2, warMode: false, expansionPaused: false },
      lastUpdate: Game.time
    };

    const request = createSpawnPlan(room, createSwarm())
      .requests.find(item => item.role === "claimer");

    assert.exists(request, "expansion queue should create claimer request");
    assert.equal(request!.targetRoom, "W3N1");
    assert.equal(request!.additionalMemory?.task, "claim");
  });

  it("does not spawn a reserve claimer for a room that already has a claim claimer", () => {
    const room = createRoom();
    Game.rooms.W1N1 = room;
    Game.rooms.W2N1 = {
      name: "W2N1",
      controller: { my: false, owner: undefined, reservation: undefined },
      find: () => []
    } as unknown as Room;
    Game.creeps = {
      Harvester1: { memory: { role: "harvester", homeRoom: "W1N1" }, spawning: false },
      Hauler1: { memory: { role: "hauler", homeRoom: "W1N1" }, spawning: false },
      Upgrader1: { memory: { role: "upgrader", homeRoom: "W1N1" }, spawning: false },
      Claimer1: {
        memory: { role: "claimer", homeRoom: "W1N1", targetRoom: "W2N1", task: "claim" },
        spawning: false,
        body: [{ type: CLAIM, hits: 100 }, { type: MOVE, hits: 100 }],
        getActiveBodyparts: (part: BodyPartConstant) => (part === CLAIM ? 1 : 0)
      }
    } as unknown as typeof Game.creeps;

    const request = createSpawnPlan(room, createSwarm(["W2N1"]))
      .requests.find(item => item.role === "claimer");

    assert.isUndefined(request, "claim target should not also receive a reserve claimer");
  });

  it("compiles pioneers from the nearest parent room for an owned spawnless room", () => {
    const parentSpawn = createSpawn("Spawn1");
    const room = createRoom("W1N1", [parentSpawn]);
    Game.rooms.W1N1 = room;
    Game.rooms.W2N1 = createSpawnlessOwnedRoom("W2N1");
    populateStableParentCreeps();

    const request = createSpawnPlan(room, createSwarm())
      .requests.find(item => item.role === "pioneer");

    assert.exists(request, "owned spawnless room should create a pioneer request from parent room");
    assert.equal(request!.roomName, "W1N1");
    assert.equal(request!.targetRoom, "W2N1");
    assert.equal(request!.additionalMemory?.task, "bootstrapSpawn");
  });

  it("does not send pioneers into spawnless rooms with dangerous hostiles", () => {
    const parentSpawn = createSpawn("Spawn1");
    const room = createRoom("W1N1", [parentSpawn]);
    Game.rooms.W1N1 = room;
    Game.rooms.W2N1 = {
      ...createSpawnlessOwnedRoom("W2N1", [], [createConstructionSite(STRUCTURE_SPAWN)]),
      find: (type: FindConstant) => {
        if (type === FIND_MY_SPAWNS) return [];
        if (type === FIND_MY_STRUCTURES) return [];
        if (type === FIND_HOSTILE_CREEPS) {
          return [{ owner: { username: "Enemy" }, body: [{ type: ATTACK, hits: 100 }, { type: MOVE, hits: 100 }] }];
        }
        if (type === FIND_MY_CONSTRUCTION_SITES) return [createConstructionSite(STRUCTURE_SPAWN)];
        return [];
      }
    } as unknown as Room;
    populateStableParentCreeps();

    const request = createSpawnPlan(room, createSwarm())
      .requests.find(item => item.role === "pioneer");

    assert.isUndefined(request, "dangerous hostiles should keep pioneer recovery gated off");
  });

  it("does not compile duplicate pioneers when one is already queued and no spawn site exists yet", () => {
    const parentSpawn = createSpawn("Spawn1");
    const room = createRoom("W1N1", [parentSpawn]);
    Game.rooms.W1N1 = room;
    Game.rooms.W2N1 = createSpawnlessOwnedRoom("W2N1");
    populateStableParentCreeps();

    spawnQueue.addRequest({
      id: "pioneer_existing",
      roomName: "W1N1",
      role: "pioneer",
      family: "economy",
      body: { parts: [WORK, CARRY, MOVE], cost: 200, minCapacity: 200 },
      priority: 500,
      targetRoom: "W2N1",
      additionalMemory: { task: "bootstrapSpawn" },
      createdAt: Game.time
    });

    const request = createSpawnPlan(room, createSwarm())
      .requests.find(item => item.role === "pioneer");

    assert.isUndefined(request, "queued pioneer should satisfy initial controller upkeep demand");
  });

  it("adds another pioneer while a spawn construction site is still under-supported", () => {
    const parentSpawn = createSpawn("Spawn1");
    const room = createRoom("W1N1", [parentSpawn]);
    Game.rooms.W1N1 = room;
    Game.rooms.W2N1 = createSpawnlessOwnedRoom("W2N1", [], [createConstructionSite(STRUCTURE_SPAWN)]);
    populateStableParentCreeps();
    Game.creeps.Pioneer1 = {
      memory: { role: "pioneer", homeRoom: "W1N1", targetRoom: "W2N1", task: "bootstrapSpawn" },
      spawning: false
    } as unknown as Creep;

    const request = createSpawnPlan(room, createSwarm())
      .requests.find(item => item.role === "pioneer");

    assert.exists(request, "spawn bootstrap should receive more than one pioneer");
    assert.equal(request!.targetRoom, "W2N1");
  });

  it("stops adding pioneers once the spawn construction site has full support", () => {
    const parentSpawn = createSpawn("Spawn1");
    const room = createRoom("W1N1", [parentSpawn]);
    Game.rooms.W1N1 = room;
    Game.rooms.W2N1 = createSpawnlessOwnedRoom("W2N1", [], [createConstructionSite(STRUCTURE_SPAWN)]);
    populateStableParentCreeps();
    Game.creeps.Pioneer1 = {
      memory: { role: "pioneer", homeRoom: "W1N1", targetRoom: "W2N1", task: "bootstrapSpawn" },
      spawning: false
    } as unknown as Creep;
    Game.creeps.Pioneer2 = {
      memory: { role: "pioneer", homeRoom: "W1N1", targetRoom: "W2N1", task: "bootstrapSpawn" },
      spawning: false
    } as unknown as Creep;
    spawnQueue.addRequest({
      id: "pioneer_existing",
      roomName: "W1N1",
      role: "pioneer",
      family: "economy",
      body: { parts: [WORK, CARRY, MOVE], cost: 200, minCapacity: 200 },
      priority: 500,
      targetRoom: "W2N1",
      additionalMemory: { task: "bootstrapSpawn" },
      createdAt: Game.time
    });

    const request = createSpawnPlan(room, createSwarm())
      .requests.find(item => item.role === "pioneer");

    assert.isUndefined(request, "three active-or-queued pioneers should satisfy spawn bootstrap support");
  });

  it("does not compile pioneers for a claimed room that already has an owned spawn", () => {
    const parentSpawn = createSpawn("Spawn1");
    const targetSpawn = createSpawn("Spawn2", "W2N1");
    const room = createRoom("W1N1", [parentSpawn]);
    Game.rooms.W1N1 = room;
    Game.rooms.W2N1 = createSpawnlessOwnedRoom("W2N1", [targetSpawn]);
    populateStableParentCreeps();

    const request = createSpawnPlan(room, createSwarm())
      .requests.find(item => item.role === "pioneer");

    assert.isUndefined(request, "owned room with a spawn should use normal local bootstrap instead");
  });

  it("preemptively queues a scout when adjacent unscouted intel appears while the queue is non-empty", () => {
    const room = createRoom();
    Game.rooms.W1N1 = room;
    populateStableParentCreeps();
    (global as any).Memory.empire = {
      knownRooms: {
        W1N2: {
          name: "W1N2",
          lastSeen: 0,
          sources: 0,
          controllerLevel: 0,
          threatLevel: 0,
          scouted: false,
          terrain: "mixed",
          isHighway: false,
          isSK: false
        }
      },
      clusters: [],
      warTargets: [],
      ownedRooms: {},
      claimQueue: [],
      nukeCandidates: [],
      powerBanks: [],
      objectives: { targetPowerLevel: 0, targetRoomCount: 1, warMode: false, expansionPaused: false },
      lastUpdate: Game.time
    };
    spawnQueue.addRequest({
      id: "existing_upgrader",
      roomName: "W1N1",
      role: "upgrader",
      family: "economy",
      body: { parts: [WORK, CARRY, MOVE], cost: 200, minCapacity: 200 },
      priority: SpawnPriority.NORMAL,
      createdAt: Game.time
    });

    populateSpawnQueue(room, createSwarm());

    assert.isTrue(
      spawnQueue.getPendingRequests("W1N1").some(request => request.role === "scout"),
      "scout demand should not wait for older economy queue entries to drain"
    );
  });

  it("does not delay affordable scout spawns while waiting for half room energy", () => {
    let spawnedRole: string | undefined;
    const spawn = {
      id: "Spawn1" as Id<StructureSpawn>,
      name: "Spawn1",
      structureType: STRUCTURE_SPAWN,
      spawning: false,
      spawnCreep: (_body: BodyPartConstant[], _name: string, options?: SpawnOptions) => {
        spawnedRole = String(options?.memory?.role ?? "");
        return OK;
      }
    } as unknown as StructureSpawn;
    const room = createRoom("W1N1", [spawn]);
    (room as unknown as { energyAvailable: number; energyCapacityAvailable: number }).energyAvailable = 300;
    (room as unknown as { energyAvailable: number; energyCapacityAvailable: number }).energyCapacityAvailable = 800;
    Game.rooms.W1N1 = room;
    spawnQueue.addRequest({
      id: "scout_affordable",
      roomName: "W1N1",
      role: "scout",
      family: "utility",
      body: { parts: [MOVE], cost: 50, minCapacity: 50 },
      priority: SpawnPriority.LOW,
      createdAt: Game.time
    });

    const spawned = processSpawnQueue(room);

    assert.equal(spawned, 1);
    assert.equal(spawnedRole, "scout");
  });

  it("creates an ordered spawn plan without mutating the queue", () => {
    const room = createRoom();
    Game.rooms.W1N1 = room;
    Game.creeps = {
      Harvester1: { memory: { role: "harvester", homeRoom: "W1N1" } },
      Hauler1: { memory: { role: "hauler", homeRoom: "W1N1" } },
      Upgrader1: { memory: { role: "upgrader", homeRoom: "W1N1" } }
    } as unknown as typeof Game.creeps;

    const plan = createSpawnPlan(room, createSwarm());

    assert.equal(plan.roomName, "W1N1");
    assert.isAtLeast(plan.demands.length, 2);
    assert.isAtLeast(plan.requests.length, 2);
    assert.deepEqual(
      plan.demands.map(demand => demand.roleName),
      [...plan.demands].sort((a, b) => b.priority - a.priority).map(demand => demand.roleName),
      "demands should be sorted by priority descending"
    );
    assert.deepEqual(
      plan.requests.map(request => request.role),
      plan.demands.map(demand => demand.def.role),
      "requests should preserve demand ordering"
    );
    assert.equal(spawnQueue.getQueueSize("W1N1"), 0, "planning should not enqueue requests");
  });
});

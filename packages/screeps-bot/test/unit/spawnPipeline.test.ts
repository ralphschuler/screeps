import { assert } from "chai";
import type { SwarmState } from "../../src/memory/schemas";
import { coordinateSpawning } from "@ralphschuler/screeps-spawn";
import { populateSpawnQueue, runSpawnPipeline } from "@ralphschuler/screeps-spawn";
import { SpawnPriority, spawnQueue } from "@ralphschuler/screeps-spawn";
import { clearRoomFindCache } from "@ralphschuler/screeps-cache";

function createSwarm(): SwarmState {
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
    remoteAssignments: [],
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

function createBootstrapRoomWithSpawnStoreEnergy(
  roomEnergyAvailable: number,
  spawnStoreEnergy: number,
  onSpawn?: (body: BodyPartConstant[], opts?: SpawnOptions) => void
): Room {
  const spawn = {
    id: "spawn1" as Id<StructureSpawn>,
    name: "Spawn1",
    structureType: STRUCTURE_SPAWN,
    spawning: null,
    store: {
      [RESOURCE_ENERGY]: spawnStoreEnergy,
      getUsedCapacity: (resource?: ResourceConstant) => (resource === RESOURCE_ENERGY ? spawnStoreEnergy : 0)
    },
    spawnCreep: (body: BodyPartConstant[], _name: string, opts?: SpawnOptions) => {
      onSpawn?.(body, opts);
      return OK;
    }
  } as unknown as StructureSpawn;

  return {
    name: "W1N1",
    energyCapacityAvailable: 300,
    energyAvailable: roomEnergyAvailable,
    controller: { my: true, level: 1 },
    find: (type: number) => {
      if (type === FIND_MY_SPAWNS) return [spawn];
      if (type === FIND_MY_STRUCTURES) return [spawn];
      if (type === FIND_SOURCES) return [{ id: "source1" as Id<Source> }];
      return [];
    }
  } as unknown as Room;
}

describe("spawn pipeline", () => {
  beforeEach(() => {
    (global as any).Game = {
      time: 1000,
      rooms: {},
      creeps: {},
      gcl: { level: 2 },
      map: {
        getRoomLinearDistance: (a: string, b: string) => (a === b ? 0 : 1)
      },
      getObjectById: () => null
    };
    (global as any).Memory = {
      creeps: {},
      rooms: {},
      empire: {
        knownRooms: {},
        clusters: [],
        warTargets: [],
        ownedRooms: {},
        claimQueue: [],
        nukeCandidates: [],
        powerBanks: [],
        objectives: { targetPowerLevel: 0, targetRoomCount: 2, warMode: false, expansionPaused: false },
        lastUpdate: 1000
      }
    };
    delete (global as any)._heapCache;
    clearRoomFindCache();
    spawnQueue.clearQueue("W1N1");
    spawnQueue.clearQueue("W2N1");
  });

  afterEach(() => {
    delete (global as any).Game;
  });

  it("coordinates planning, queueing, and execution through the room-level Interface", () => {
    const spawn = {
      id: "spawn1" as Id<StructureSpawn>,
      name: "Spawn1",
      spawning: null,
      spawnCreep: () => OK
    } as unknown as StructureSpawn;
    const room = {
      name: "W1N1",
      energyCapacityAvailable: 800,
      energyAvailable: 800,
      controller: { my: true, level: 4 },
      find: (type: number) => (type === FIND_MY_SPAWNS ? [spawn] : [])
    } as unknown as Room;
    Game.rooms.W1N1 = room;

    const result = coordinateSpawning(room, createSwarm());

    assert.equal(result.roomName, "W1N1");
    assert.equal(result.spawned, 1);
    assert.isAtLeast(result.queued, 0);
    assert.equal(result.stats.total, spawnQueue.getQueueStats("W1N1").total);
  });

  it("uses spawn store energy as a bootstrap fallback when room energy is stale", () => {
    let spawnedBody: BodyPartConstant[] | undefined;
    let spawnedMemory: CreepMemory | undefined;
    const room = createBootstrapRoomWithSpawnStoreEnergy(0, 300, (body, opts) => {
      spawnedBody = body;
      spawnedMemory = opts?.memory;
    });
    Game.rooms.W1N1 = room;
    Game.creeps = {} as typeof Game.creeps;

    const result = coordinateSpawning(room, createSwarm());

    assert.equal(result.spawned, 1, "bootstrap spawning should not deadlock on stale aggregate room energy");
    assert.deepEqual(spawnedBody, [WORK, CARRY, MOVE]);
    assert.equal((spawnedMemory as any)?.role, "larvaWorker");
  });

  it("can disable spawn store energy fallback through Memory", () => {
    (Memory as any).spawnSettings = { structureEnergyFallback: false };
    const room = createBootstrapRoomWithSpawnStoreEnergy(0, 300);
    Game.rooms.W1N1 = room;
    Game.creeps = {} as typeof Game.creeps;

    const result = coordinateSpawning(room, createSwarm());

    assert.equal(result.spawned, 0);
    assert.equal(spawnQueue.getQueueSize("W1N1"), 0, "disabled fallback should not queue an unaffordable body");
  });

  it("adds a missing pioneer request even when the parent queue already has work", () => {
    const spawn = {
      id: "spawn1" as Id<StructureSpawn>,
      name: "Spawn1",
      structureType: STRUCTURE_SPAWN,
      spawning: null
    } as unknown as StructureSpawn;
    const room = {
      name: "W1N1",
      energyCapacityAvailable: 800,
      energyAvailable: 800,
      controller: { my: true, level: 4 },
      find: (type: FindConstant) => {
        if (type === FIND_MY_SPAWNS) return [spawn];
        if (type === FIND_MY_STRUCTURES) return [spawn];
        return [];
      }
    } as unknown as Room;
    const targetRoom = {
      name: "W2N1",
      energyCapacityAvailable: 300,
      energyAvailable: 0,
      controller: { my: true, level: 1 },
      find: (type: FindConstant) => {
        if (type === FIND_HOSTILE_CREEPS || type === FIND_MY_SPAWNS || type === FIND_MY_STRUCTURES) return [];
        return [];
      }
    } as unknown as Room;
    Game.rooms.W1N1 = room;
    Game.rooms.W2N1 = targetRoom;
    Game.creeps = {
      Harvester1: { memory: { role: "harvester", homeRoom: "W1N1" }, spawning: false },
      Hauler1: { memory: { role: "hauler", homeRoom: "W1N1" }, spawning: false },
      Upgrader1: { memory: { role: "upgrader", homeRoom: "W1N1" }, spawning: false }
    } as unknown as typeof Game.creeps;
    spawnQueue.addRequest({
      id: "existing_builder",
      roomName: "W1N1",
      role: "builder",
      family: "economy",
      body: { parts: [WORK, CARRY, MOVE], cost: 200, minCapacity: 200 },
      priority: SpawnPriority.LOW,
      createdAt: Game.time
    });

    populateSpawnQueue(room, createSwarm());

    const pending = spawnQueue.getPendingRequests("W1N1");
    assert.isTrue(pending.some(request => request.id === "existing_builder"));
    assert.isTrue(
      pending.some(request => request.role === "pioneer" && request.targetRoom === "W2N1"),
      "pioneer bootstrap support should be added without waiting for the old queue to drain"
    );
  });

  it("adds a missing remote economy request when lower-priority work is already queued", () => {
    const spawn = {
      id: "spawn1" as Id<StructureSpawn>,
      name: "Spawn1",
      structureType: STRUCTURE_SPAWN,
      spawning: null
    } as unknown as StructureSpawn;
    const room = {
      name: "W1N1",
      energyCapacityAvailable: 800,
      energyAvailable: 800,
      controller: { my: true, level: 4 },
      find: (type: FindConstant) => {
        if (type === FIND_MY_SPAWNS) return [spawn];
        if (type === FIND_MY_STRUCTURES) return [spawn];
        return [];
      }
    } as unknown as Room;
    const remoteRoom = {
      name: "W2N1",
      controller: { my: false },
      find: (type: FindConstant) => {
        if (type === FIND_SOURCES) return [{ id: "remoteSource1" as Id<Source> }];
        if (type === FIND_HOSTILE_CREEPS) return [];
        return [];
      }
    } as unknown as Room;
    const swarm = createSwarm();
    swarm.remoteAssignments = ["W2N1"];
    Game.rooms.W1N1 = room;
    Game.rooms.W2N1 = remoteRoom;
    Game.creeps = {
      Harvester1: { memory: { role: "harvester", homeRoom: "W1N1" }, spawning: false },
      Harvester2: { memory: { role: "harvester", homeRoom: "W1N1" }, spawning: false },
      Hauler1: { memory: { role: "hauler", homeRoom: "W1N1" }, spawning: false },
      Hauler2: { memory: { role: "hauler", homeRoom: "W1N1" }, spawning: false },
      Upgrader1: { memory: { role: "upgrader", homeRoom: "W1N1" }, spawning: false }
    } as unknown as typeof Game.creeps;
    spawnQueue.addRequest({
      id: "existing_builder",
      roomName: "W1N1",
      role: "builder",
      family: "economy",
      body: { parts: [WORK, CARRY, MOVE], cost: 200, minCapacity: 200 },
      priority: SpawnPriority.LOW,
      createdAt: Game.time
    });

    populateSpawnQueue(room, swarm);
    populateSpawnQueue(room, swarm);

    const pending = spawnQueue.getPendingRequests("W1N1");
    const remoteHarvesters = pending.filter(request => request.role === "remoteHarvester" && request.targetRoom === "W2N1");
    assert.isTrue(pending.some(request => request.id === "existing_builder"));
    assert.lengthOf(remoteHarvesters, 1, "remote economy should not wait for stale low-priority queue drain or duplicate");
  });

  it("adds a missing reserve claimer when lower-priority work is already queued", () => {
    const spawn = {
      id: "spawn1" as Id<StructureSpawn>,
      name: "Spawn1",
      structureType: STRUCTURE_SPAWN,
      spawning: null
    } as unknown as StructureSpawn;
    const room = {
      name: "W1N1",
      energyCapacityAvailable: 800,
      energyAvailable: 800,
      controller: { my: true, level: 4 },
      find: (type: FindConstant) => {
        if (type === FIND_MY_SPAWNS) return [spawn];
        if (type === FIND_MY_STRUCTURES) return [spawn];
        return [];
      }
    } as unknown as Room;
    const remoteRoom = {
      name: "W2N1",
      controller: { my: false, owner: undefined, reservation: undefined },
      find: (type: FindConstant) => {
        if (type === FIND_SOURCES) return [{ id: "remoteSource1" as Id<Source> }];
        if (type === FIND_HOSTILE_CREEPS) return [];
        return [];
      }
    } as unknown as Room;
    const swarm = createSwarm();
    swarm.remoteAssignments = ["W2N1"];
    Game.rooms.W1N1 = room;
    Game.rooms.W2N1 = remoteRoom;
    Game.creeps = {
      Harvester1: { memory: { role: "harvester", homeRoom: "W1N1" }, spawning: false },
      Harvester2: { memory: { role: "harvester", homeRoom: "W1N1" }, spawning: false },
      Hauler1: { memory: { role: "hauler", homeRoom: "W1N1" }, spawning: false },
      Hauler2: { memory: { role: "hauler", homeRoom: "W1N1" }, spawning: false },
      Upgrader1: { memory: { role: "upgrader", homeRoom: "W1N1" }, spawning: false }
    } as unknown as typeof Game.creeps;
    spawnQueue.addRequest({
      id: "existing_builder",
      roomName: "W1N1",
      role: "builder",
      family: "economy",
      body: { parts: [WORK, CARRY, MOVE], cost: 200, minCapacity: 200 },
      priority: SpawnPriority.LOW,
      createdAt: Game.time
    });

    populateSpawnQueue(room, swarm);
    populateSpawnQueue(room, swarm);

    const pending = spawnQueue.getPendingRequests("W1N1");
    const reserveClaimers = pending.filter(
      request => request.role === "claimer" && request.targetRoom === "W2N1" && request.additionalMemory?.task === "reserve"
    );
    assert.isTrue(pending.some(request => request.id === "existing_builder"));
    assert.lengthOf(reserveClaimers, 1, "remote reservation should not wait for stale low-priority queue drain or duplicate");
  });

  it("can disable reserve claimer preemption through Memory", () => {
    (Memory as any).spawnSettings = { claimerPreemption: false };
    const spawn = {
      id: "spawn1" as Id<StructureSpawn>,
      name: "Spawn1",
      structureType: STRUCTURE_SPAWN,
      spawning: null
    } as unknown as StructureSpawn;
    const room = {
      name: "W1N1",
      energyCapacityAvailable: 800,
      energyAvailable: 800,
      controller: { my: true, level: 4 },
      find: (type: FindConstant) => {
        if (type === FIND_MY_SPAWNS || type === FIND_MY_STRUCTURES) return [spawn];
        return [];
      }
    } as unknown as Room;
    const remoteRoom = {
      name: "W2N1",
      controller: { my: false, owner: undefined, reservation: undefined },
      find: (type: FindConstant) => {
        if (type === FIND_SOURCES) return [{ id: "remoteSource1" as Id<Source> }];
        if (type === FIND_HOSTILE_CREEPS) return [];
        return [];
      }
    } as unknown as Room;
    const swarm = createSwarm();
    swarm.remoteAssignments = ["W2N1"];
    Game.rooms.W1N1 = room;
    Game.rooms.W2N1 = remoteRoom;
    Game.creeps = {
      Harvester1: { memory: { role: "harvester", homeRoom: "W1N1" }, spawning: false },
      Harvester2: { memory: { role: "harvester", homeRoom: "W1N1" }, spawning: false },
      Hauler1: { memory: { role: "hauler", homeRoom: "W1N1" }, spawning: false },
      Hauler2: { memory: { role: "hauler", homeRoom: "W1N1" }, spawning: false },
      Upgrader1: { memory: { role: "upgrader", homeRoom: "W1N1" }, spawning: false }
    } as unknown as typeof Game.creeps;
    spawnQueue.addRequest({
      id: "existing_builder",
      roomName: "W1N1",
      role: "builder",
      family: "economy",
      body: { parts: [WORK, CARRY, MOVE], cost: 200, minCapacity: 200 },
      priority: SpawnPriority.LOW,
      createdAt: Game.time
    });

    populateSpawnQueue(room, swarm);

    const pending = spawnQueue.getPendingRequests("W1N1");
    assert.isFalse(
      pending.some(request => request.role === "claimer" && request.targetRoom === "W2N1"),
      "rollback knob should restore old behavior and wait for the existing queue to drain"
    );
  });

  it("adds a high-priority upgrader during controller downgrade risk even when lower-priority work is queued", () => {
    const spawn = {
      id: "spawn1" as Id<StructureSpawn>,
      name: "Spawn1",
      structureType: STRUCTURE_SPAWN,
      spawning: null
    } as unknown as StructureSpawn;
    const room = {
      name: "W1N1",
      energyCapacityAvailable: 800,
      energyAvailable: 800,
      controller: { my: true, level: 4, ticksToDowngrade: 4000 },
      find: (type: FindConstant) => {
        if (type === FIND_MY_SPAWNS || type === FIND_MY_STRUCTURES) return [spawn];
        if (type === FIND_HOSTILE_CREEPS || type === FIND_MY_CREEPS || type === FIND_MY_CONSTRUCTION_SITES) return [];
        return [];
      }
    } as unknown as Room;
    Game.rooms.W1N1 = room;
    Game.creeps = {
      Harvester1: { memory: { role: "harvester", homeRoom: "W1N1" }, spawning: false },
      Hauler1: { memory: { role: "hauler", homeRoom: "W1N1" }, spawning: false },
      Upgrader1: { memory: { role: "upgrader", homeRoom: "W1N1" }, spawning: false }
    } as unknown as typeof Game.creeps;
    spawnQueue.addRequest({
      id: "existing_builder",
      roomName: "W1N1",
      role: "builder",
      family: "economy",
      body: { parts: [WORK, CARRY, MOVE], cost: 200, minCapacity: 200 },
      priority: SpawnPriority.LOW,
      createdAt: Game.time
    });

    populateSpawnQueue(room, createSwarm());

    const pending = spawnQueue.getPendingRequests("W1N1");
    assert.isTrue(pending.some(request => request.id === "existing_builder"));
    assert.isTrue(
      pending.some(request => request.role === "upgrader" && request.priority >= SpawnPriority.HIGH),
      "controller downgrade risk should add upgrader demand without waiting for stale low-priority queue drain"
    );
  });

  it("adds missing defense requests even when lower-priority work is already queued", () => {
    const hostile = {
      owner: { username: "Enemy" },
      body: [
        { type: ATTACK, hits: 100 },
        { type: MOVE, hits: 100 }
      ]
    } as unknown as Creep;
    const spawn = { id: "spawn1" as Id<StructureSpawn>, spawning: null, structureType: STRUCTURE_SPAWN };
    const room = {
      name: "W1N1",
      energyCapacityAvailable: 800,
      energyAvailable: 800,
      controller: { my: true, level: 4 },
      find: (type: FindConstant) => {
        if (type === FIND_HOSTILE_CREEPS) return [hostile];
        if (type === FIND_MY_SPAWNS || type === FIND_MY_STRUCTURES) return [spawn];
        if (type === FIND_MY_CREEPS) return [];
        return [];
      }
    } as unknown as Room;
    Game.rooms.W1N1 = room;
    Game.creeps = {
      Harvester1: { memory: { role: "harvester", homeRoom: "W1N1" }, spawning: false },
      Hauler1: { memory: { role: "hauler", homeRoom: "W1N1" }, spawning: false },
      Upgrader1: { memory: { role: "upgrader", homeRoom: "W1N1" }, spawning: false }
    } as unknown as typeof Game.creeps;
    spawnQueue.addRequest({
      id: "existing_builder",
      roomName: "W1N1",
      role: "builder",
      family: "economy",
      body: { parts: [WORK, CARRY, MOVE], cost: 200, minCapacity: 200 },
      priority: SpawnPriority.LOW,
      createdAt: Game.time
    });

    populateSpawnQueue(room, createSwarm());

    const pending = spawnQueue.getPendingRequests("W1N1");
    assert.isTrue(pending.some(request => request.id === "existing_builder"));
    assert.isTrue(
      pending.some(request => request.role === "guard" && request.priority >= SpawnPriority.HIGH),
      "local defense request should preempt old low-priority work"
    );
  });

  it("does not duplicate pending local defense requests during preemption", () => {
    const hostile = {
      owner: { username: "Enemy" },
      body: [{ type: ATTACK, hits: 100 }]
    } as unknown as Creep;
    const spawn = { id: "spawn1" as Id<StructureSpawn>, spawning: null, structureType: STRUCTURE_SPAWN };
    const room = {
      name: "W1N1",
      energyCapacityAvailable: 800,
      energyAvailable: 800,
      controller: { my: true, level: 4 },
      find: (type: FindConstant) => {
        if (type === FIND_HOSTILE_CREEPS) return [hostile];
        if (type === FIND_MY_SPAWNS || type === FIND_MY_STRUCTURES) return [spawn];
        if (type === FIND_MY_CREEPS) return [];
        return [];
      }
    } as unknown as Room;
    Game.rooms.W1N1 = room;
    Game.creeps = {
      Harvester1: { memory: { role: "harvester", homeRoom: "W1N1" }, spawning: false },
      Hauler1: { memory: { role: "hauler", homeRoom: "W1N1" }, spawning: false },
      Upgrader1: { memory: { role: "upgrader", homeRoom: "W1N1" }, spawning: false }
    } as unknown as typeof Game.creeps;
    spawnQueue.addRequest({
      id: "guard_defense_existing",
      roomName: "W1N1",
      role: "guard",
      family: "military",
      body: { parts: [ATTACK, MOVE], cost: 130, minCapacity: 130 },
      priority: SpawnPriority.HIGH,
      additionalMemory: { task: "localDefense" } as any,
      createdAt: Game.time
    });
    spawnQueue.addRequest({
      id: "existing_builder",
      roomName: "W1N1",
      role: "builder",
      family: "economy",
      body: { parts: [WORK, CARRY, MOVE], cost: 200, minCapacity: 200 },
      priority: SpawnPriority.LOW,
      createdAt: Game.time
    });

    populateSpawnQueue(room, createSwarm());

    const pendingGuards = spawnQueue.getPendingRequests("W1N1").filter(request => request.role === "guard");
    assert.equal(pendingGuards.length, 1);
  });

  it("processes queued spawn requests through one Interface while preserving request memory", () => {
    let spawnedMemory: CreepMemory | undefined;
    const spawn = {
      id: "spawn1" as Id<StructureSpawn>,
      name: "Spawn1",
      spawning: null,
      spawnCreep: (_body: BodyPartConstant[], _name: string, opts?: SpawnOptions) => {
        spawnedMemory = opts?.memory;
        return OK;
      }
    } as unknown as StructureSpawn;
    const room = {
      name: "W1N1",
      energyCapacityAvailable: 800,
      energyAvailable: 800,
      controller: { my: true, level: 4 },
      find: (type: number) => (type === FIND_MY_SPAWNS ? [spawn] : [])
    } as unknown as Room;
    Game.rooms.W1N1 = room;
    Game.creeps = {
      Harvester1: { memory: { role: "harvester", homeRoom: "W1N1" }, spawning: false },
      Harvester2: { memory: { role: "harvester", homeRoom: "W1N1" }, spawning: false },
      Hauler1: { memory: { role: "hauler", homeRoom: "W1N1" }, spawning: false },
      Upgrader1: { memory: { role: "upgrader", homeRoom: "W1N1" }, spawning: false }
    } as unknown as typeof Game.creeps;

    spawnQueue.addRequest({
      id: "remote_hauler_1",
      roomName: "W1N1",
      role: "remoteHauler",
      family: "logistics",
      body: { parts: [CARRY, MOVE], cost: 100, minCapacity: 100 },
      priority: SpawnPriority.NORMAL,
      targetRoom: "W2N1",
      sourceId: "source1" as Id<Source>,
      boostRequirements: [{ resourceType: RESOURCE_UTRIUM, bodyParts: [CARRY] }],
      additionalMemory: { task: "haul" } as any,
      createdAt: Game.time
    });

    const result = runSpawnPipeline(room, createSwarm());

    assert.equal(result.spawned, 1);
    assert.equal(spawnQueue.getQueueSize("W1N1"), 0);
    assert.deepInclude(spawnedMemory as any, {
      role: "remoteHauler",
      family: "logistics",
      homeRoom: "W1N1",
      targetRoom: "W2N1",
      sourceId: "source1",
      task: "haul",
      version: 1
    });
    assert.deepEqual((spawnedMemory as any).boostRequirements, [{ resourceType: RESOURCE_UTRIUM, bodyParts: [CARRY] }]);
  });
});

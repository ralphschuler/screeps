import { assert } from "chai";
import type { SwarmState } from "../../src/memory/schemas";
import { coordinateSpawning } from "@ralphschuler/screeps-spawn";
import { runSpawnManager } from "@ralphschuler/screeps-spawn";
import { SpawnPriority, spawnQueue } from "@ralphschuler/screeps-spawn";

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

describe("spawn compiler cleanup compatibility", () => {
  beforeEach(() => {
    (global as any).Game = {
      time: 1000,
      rooms: {},
      creeps: {},
      gcl: { level: 1 },
      getObjectById: () => null
    };
    spawnQueue.clearQueue("W1N1");
  });

  afterEach(() => {
    delete (global as any).Game;
  });

  function createRoom(energyAvailable: number, energyCapacityAvailable: number): Room {
    const spawn = {
      id: "spawn1" as Id<StructureSpawn>,
      name: "Spawn1",
      spawning: null,
      spawnCreep: (body: BodyPartConstant[], name: string, opts?: SpawnOptions) => {
        const cost = body.reduce((sum, part) => sum + BODYPART_COST[part], 0);
        if (cost > energyAvailable) return ERR_NOT_ENOUGH_ENERGY;
        Game.creeps[name] = {
          name,
          memory: opts?.memory ?? {},
          spawning: true
        } as unknown as Creep;
        return OK;
      }
    } as unknown as StructureSpawn;

    const room = {
      name: "W1N1",
      energyCapacityAvailable,
      energyAvailable,
      controller: { my: true, level: 4 },
      find: (type: number) => {
        if (type === FIND_MY_SPAWNS) return [spawn];
        if (type === FIND_SOURCES) return [{ id: "source1" }, { id: "source2" }];
        return [];
      }
    } as unknown as Room;
    Game.rooms.W1N1 = room;
    return room;
  }

  it("legacy runSpawnManager still plans spawn demand when all spawns are busy", () => {
    const busySpawn = { spawning: { name: "busy" } };
    const room = {
      name: "W1N1",
      energyCapacityAvailable: 800,
      energyAvailable: 800,
      controller: { my: true, level: 4 },
      find: (type: number) => (type === FIND_MY_SPAWNS ? [busySpawn] : [])
    } as unknown as Room;
    Game.rooms.W1N1 = room;

    const result = runSpawnManager(room, createSwarm());

    assert.equal(result.roomName, "W1N1");
    assert.equal(result.spawned, 0);
    assert.isTrue(spawnQueue.getPendingRequests("W1N1").some(request => request.role === "larvaWorker"));
  });

  it("bootstrap recovery spawns the next affordable critical role instead of waiting for full energy", () => {
    const room = createRoom(300, 800);
    Game.creeps.larvaWorker_1 = {
      name: "larvaWorker_1",
      memory: { role: "larvaWorker", homeRoom: "W1N1" },
      spawning: false
    } as unknown as Creep;

    coordinateSpawning(room, createSwarm());

    const spawned = Object.values(Game.creeps).find(creep => creep.memory.role === "harvester");
    assert.isDefined(spawned, "bootstrap harvester should spawn with the affordable 250-energy body");
  });

  it("emergency workforce recovery bypasses stale unaffordable non-emergency queue entries", () => {
    const room = createRoom(400, 800);
    Game.creeps.guard_1 = {
      name: "guard_1",
      memory: { role: "guard", homeRoom: "W1N1" },
      spawning: false
    } as unknown as Creep;
    spawnQueue.addRequest({
      id: "stale_ranger",
      roomName: "W1N1",
      role: "ranger",
      family: "military",
      body: { parts: [RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE], cost: 550, minCapacity: 550 },
      priority: SpawnPriority.HIGH,
      createdAt: Game.time - 10
    });

    coordinateSpawning(room, createSwarm());

    const spawned = Object.values(Game.creeps).find(creep => creep.memory.role === "larvaWorker");
    assert.isDefined(spawned, "emergency larvaWorker should spawn before stale high-priority defender");
  });

  it("bootstrap recovery bypasses stale unaffordable queue entries after larva workers exist", () => {
    const room = createRoom(300, 1100);
    Game.creeps.larvaWorker_1 = {
      name: "larvaWorker_1",
      memory: { role: "larvaWorker", homeRoom: "W1N1" },
      spawning: false
    } as unknown as Creep;
    spawnQueue.addRequest({
      id: "stale_upgrader",
      roomName: "W1N1",
      role: "upgrader",
      family: "economy",
      body: { parts: [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE], cost: 750, minCapacity: 750 },
      priority: SpawnPriority.NORMAL,
      createdAt: Game.time - 10
    });

    coordinateSpawning(room, createSwarm());

    const spawned = Object.values(Game.creeps).find(creep => creep.memory.role === "harvester");
    assert.isDefined(spawned, "bootstrap harvester should bypass stale unaffordable normal-priority work");
  });
});

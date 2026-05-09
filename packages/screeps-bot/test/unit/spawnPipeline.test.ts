import { assert } from "chai";
import type { SwarmState } from "../../src/memory/schemas";
import { runSpawnPipeline } from "../../src/spawning/spawnPipeline";
import { SpawnPriority, spawnQueue } from "../../src/spawning/spawnQueue";

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

describe("spawn pipeline", () => {
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
      find: (type: number) => type === FIND_MY_SPAWNS ? [spawn] : []
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

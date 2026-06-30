import { assert } from "chai";
import { heapCache } from "@ralphschuler/screeps-memory";
import { createSpawnPlan } from "@ralphschuler/screeps-spawn";
import { remoteWorker, type CreepContext } from "@ralphschuler/screeps-roles";
import type { SwarmState } from "../../src/memory/schemas";

declare const global: { Game: typeof Game; Memory: typeof Memory };

function createMockSwarmState(remoteAssignments: string[] = []): SwarmState {
  return {
    colonyLevel: "foragingExpansion",
    posture: "eco",
    danger: 0,
    pheromones: { expand: 0, harvest: 10, build: 5, upgrade: 5, defense: 0, war: 0, siege: 0, logistics: 5, nukeTarget: 0 },
    nextUpdateTick: 0,
    eventLog: [],
    missingStructures: { spawn: false, storage: true, terminal: true, labs: true, nuker: true, factory: true, extractor: true, powerSpawn: true, observer: true },
    role: "capital",
    remoteAssignments,
    metrics: { energyHarvested: 0, energySpawning: 0, energyConstruction: 0, energyRepair: 0, energyTower: 0, controllerProgress: 0, hostileCount: 0, damageReceived: 0, constructionSites: 0, energyAvailable: 0, energyCapacity: 0, energyNeed: 0 },
    lastUpdate: 0
  };
}

function createHomeRoom(name = "E1N1"): Room {
  return {
    name,
    controller: { my: true, level: 3 },
    energyAvailable: 800,
    energyCapacityAvailable: 800,
    find: () => []
  } as unknown as Room;
}

function createRemoteRoom(name = "E2N1", opts: { owner?: string; reserver?: string; site?: ConstructionSite } = {}): Room {
  return {
    name,
    controller: {
      owner: opts.owner ? { username: opts.owner } : undefined,
      reservation: opts.reserver ? { username: opts.reserver, ticksToEnd: 1000 } : undefined
    },
    find: (type: FindConstant) => {
      if (type === FIND_SOURCES) return [{ id: `${name}-source1` }, { id: `${name}-source2` }];
      if (type === FIND_MY_CONSTRUCTION_SITES && opts.site) return [opts.site];
      return [];
    }
  } as unknown as Room;
}

function createStableCreeps(): Record<string, Creep> {
  return {
    harvester1: { memory: { role: "harvester", homeRoom: "E1N1" }, spawning: false } as Creep,
    hauler1: { memory: { role: "hauler", homeRoom: "E1N1" }, spawning: false } as Creep,
    upgrader1: { memory: { role: "upgrader", homeRoom: "E1N1" }, spawning: false } as Creep
  };
}

function createRemoteWorkerContext(remoteRoom: Room, site: ConstructionSite): CreepContext {
  const creep = {
    name: "remoteWorker1",
    room: remoteRoom,
    memory: { role: "remoteWorker", homeRoom: "E1N1", targetRoom: remoteRoom.name, working: true },
    pos: new RoomPosition(20, 20, remoteRoom.name),
    store: { getUsedCapacity: () => 50, getFreeCapacity: () => 0, getCapacity: () => 50 }
  } as unknown as Creep;

  return {
    creep,
    room: remoteRoom,
    memory: creep.memory as CreepContext["memory"],
    swarmState: undefined,
    squadMemory: undefined,
    homeRoom: "E1N1",
    isInHomeRoom: false,
    isFull: true,
    isEmpty: false,
    isWorking: true,
    assignedSource: null,
    assignedMineral: null,
    energyAvailable: true,
    nearbyEnemies: false,
    constructionSiteCount: 1,
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
    prioritizedSites: [site],
    repairTargets: [],
    labs: [],
    factory: undefined,
    tombstones: [],
    mineralContainers: []
  };
}

describe("Remote Construction Assignment", () => {
  beforeEach(() => {
    global.Game = {
      creeps: createStableCreeps(),
      rooms: {},
      time: 1000,
      map: { getRoomLinearDistance: () => 1 },
      spawns: { Spawn1: { owner: { username: "MyPlayer" } } },
      gcl: { level: 1 },
      getObjectById: () => null
    } as unknown as typeof Game;
    global.Memory = {
      creeps: {},
      rooms: {},
      empire: {
        knownRooms: {},
        claimQueue: [],
        warTargets: [],
        nukeCandidates: [],
        powerBanks: [],
        objectives: { targetRoomCount: 1, targetPowerLevel: 0, warMode: false, expansionPaused: false },
        lastUpdate: 0
      }
    } as unknown as typeof Memory;
    heapCache.clear();
  });

  it("spawns remoteWorker with targetRoom for visible safe remote construction", () => {
    const site = {
      id: "remote-container-site" as Id<ConstructionSite>,
      structureType: STRUCTURE_CONTAINER,
      pos: new RoomPosition(20, 20, "E2N1")
    } as ConstructionSite;
    const homeRoom = createHomeRoom();
    const remoteRoom = createRemoteRoom("E2N1", { site });
    Game.rooms = { E1N1: homeRoom, E2N1: remoteRoom };

    const plan = createSpawnPlan(homeRoom, createMockSwarmState(["E2N1"]));
    const request = plan.requests.find(req => req.role === "remoteWorker");

    assert.isDefined(request);
    assert.equal(request!.targetRoom, "E2N1");
  });

  it("does not spawn remoteWorker for enemy-reserved remote construction", () => {
    const site = {
      id: "enemy-reserved-site" as Id<ConstructionSite>,
      structureType: STRUCTURE_CONTAINER,
      pos: new RoomPosition(20, 20, "E2N1")
    } as ConstructionSite;
    const homeRoom = createHomeRoom();
    const remoteRoom = createRemoteRoom("E2N1", { reserver: "Enemy", site });
    Game.rooms = { E1N1: homeRoom, E2N1: remoteRoom };

    const plan = createSpawnPlan(homeRoom, createMockSwarmState(["E2N1"]));

    assert.isUndefined(plan.requests.find(req => req.role === "remoteWorker"));
  });

  it("remoteWorker builds visible remote construction sites", () => {
    const site = {
      id: "remote-container-site" as Id<ConstructionSite>,
      structureType: STRUCTURE_CONTAINER,
      pos: new RoomPosition(20, 20, "E2N1")
    } as ConstructionSite;
    const remoteRoom = createRemoteRoom("E2N1", { site });

    const action = remoteWorker(createRemoteWorkerContext(remoteRoom, site));

    assert.equal(action.type, "build");
    assert.equal((action as Extract<typeof action, { type: "build" }>).target, site);
  });
});

import { assert } from "chai";
import type { SwarmState } from "../../src/memory/schemas";
import {
  compileSpawnDemandToRequest,
  createSpawnPlan,
  planSpawnDemand,
  populateSpawnQueue
} from "../../src/spawning/spawnCoordinator";
import { spawnQueue } from "../../src/spawning/spawnQueue";

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

function createRoom(): Room {
  return {
    name: "W1N1",
    energyCapacityAvailable: 800,
    energyAvailable: 800,
    controller: { my: true, level: 4 },
    find: () => []
  } as unknown as Room;
}

describe("spawn intent compiler", () => {
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

  it("plans spawn demand without mutating the queue", () => {
    const room = createRoom();
    Game.rooms.W1N1 = room;

    const demands = planSpawnDemand(room, createSwarm());

    assert.isTrue(demands.some(demand => demand.roleName === "larvaWorker"));
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

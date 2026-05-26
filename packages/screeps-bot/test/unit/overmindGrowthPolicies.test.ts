import { assert } from "chai";
import { getEconomyFirstConstructionPolicy } from "../../src/core/managers/RoomConstructionManager";
import { getRemoteSourceTargetByRcl } from "../../src/empire/expansionManager";
import { populateSpawnQueue } from "@ralphschuler/screeps-spawn";
import { spawnQueue } from "@ralphschuler/screeps-spawn";
import type { SwarmState } from "../../src/memory/schemas";

function createSwarm(remoteAssignments: string[] = []): SwarmState {
  return {
    colonyLevel: "foragingExpansion",
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
      storage: true,
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

describe("Overmind-inspired growth policies", () => {
  beforeEach(() => {
    (global as any).Game = {
      time: 1000,
      rooms: {},
      creeps: {},
      getObjectById: () => null
    };
    spawnQueue.clearQueue("W1N1");
  });

  afterEach(() => {
    delete (global as any).Game;
  });

  it("targets more remote sources as RCL increases", () => {
    assert.equal(getRemoteSourceTargetByRcl(1), 1);
    assert.equal(getRemoteSourceTargetByRcl(2), 2);
    assert.equal(getRemoteSourceTargetByRcl(3), 3);
    assert.equal(getRemoteSourceTargetByRcl(4), 4);
    assert.equal(getRemoteSourceTargetByRcl(8), 9);
  });

  it("keeps early peaceful rooms in economy-first construction mode", () => {
    const policy = getEconomyFirstConstructionPolicy({
      rcl: 3,
      danger: 0,
      hasStorage: false,
      remoteAssignments: []
    });

    assert.isFalse(policy.allowPerimeter, "RCL3 peaceful rooms should not spend early energy on perimeter walls");
    assert.isFalse(policy.allowRamparts, "RCL3 peaceful rooms should reserve ramparts for threats/critical economy");
  });

  it("allows defensive construction when danger is present", () => {
    const policy = getEconomyFirstConstructionPolicy({
      rcl: 3,
      danger: 2,
      hasStorage: false,
      remoteAssignments: []
    });

    assert.isTrue(policy.allowPerimeter);
    assert.isTrue(policy.allowRamparts);
  });

  it("does not enqueue remote mining creeps without an assigned target room", () => {
    const room: any = {
      name: "W1N1",
      energyCapacityAvailable: 800,
      energyAvailable: 800,
      find: () => []
    };

    populateSpawnQueue(room, createSwarm([]));

    const remoteRequests = spawnQueue
      .getPendingRequests("W1N1")
      .filter(request => request.role === "remoteHarvester" || request.role === "remoteHauler");

    assert.lengthOf(remoteRequests, 0, "remote requests without target rooms would waste spawn time");
  });
});

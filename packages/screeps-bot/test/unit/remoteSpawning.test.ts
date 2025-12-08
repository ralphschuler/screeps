import { assert } from "chai";
import {
  countRemoteCreepsByTargetRoom,
  getRemoteRoomNeedingWorkers,
  needsRole,
  ROLE_DEFINITIONS
} from "../../src/logic/spawn";
import type { SwarmState } from "../../src/memory/schemas";

// Mock the global Game object
declare const global: { Game: typeof Game };

/**
 * Create a mock SwarmState with remote assignments
 */
function createMockSwarmState(remoteAssignments: string[] = []): SwarmState {
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
    lastUpdate: 0
  };
}

describe("remote worker spawning", () => {
  beforeEach(() => {
    // Reset the global Game object before each test
    global.Game = {
      creeps: {},
      rooms: {},
      time: 1000
    } as unknown as typeof Game;
  });

  describe("ROLE_DEFINITIONS", () => {
    it("should have remoteHarvester role defined", () => {
      assert.isDefined(ROLE_DEFINITIONS.remoteHarvester);
      assert.equal(ROLE_DEFINITIONS.remoteHarvester.role, "remoteHarvester");
      assert.equal(ROLE_DEFINITIONS.remoteHarvester.family, "economy");
      assert.isTrue(ROLE_DEFINITIONS.remoteHarvester.remoteRole);
    });

    it("should have remoteHauler role defined", () => {
      assert.isDefined(ROLE_DEFINITIONS.remoteHauler);
      assert.equal(ROLE_DEFINITIONS.remoteHauler.role, "remoteHauler");
      assert.equal(ROLE_DEFINITIONS.remoteHauler.family, "economy");
      assert.isTrue(ROLE_DEFINITIONS.remoteHauler.remoteRole);
    });
  });

  describe("countRemoteCreepsByTargetRoom", () => {
    it("should return 0 when no creeps exist", () => {
      global.Game.creeps = {};
      const count = countRemoteCreepsByTargetRoom("E1N1", "remoteHarvester", "E2N1");
      assert.equal(count, 0);
    });

    it("should count creeps assigned to specific target room", () => {
      global.Game.creeps = {
        remote1: {
          name: "remote1",
          memory: {
            role: "remoteHarvester",
            homeRoom: "E1N1",
            targetRoom: "E2N1",
            family: "economy",
            version: 1
          }
        } as unknown as Creep,
        remote2: {
          name: "remote2",
          memory: {
            role: "remoteHarvester",
            homeRoom: "E1N1",
            targetRoom: "E2N1",
            family: "economy",
            version: 1
          }
        } as unknown as Creep,
        remote3: {
          name: "remote3",
          memory: {
            role: "remoteHarvester",
            homeRoom: "E1N1",
            targetRoom: "E3N1", // Different target room
            family: "economy",
            version: 1
          }
        } as unknown as Creep
      };

      const count = countRemoteCreepsByTargetRoom("E1N1", "remoteHarvester", "E2N1");
      assert.equal(count, 2);
    });

    it("should not count creeps with different roles", () => {
      global.Game.creeps = {
        harvester: {
          name: "harvester",
          memory: {
            role: "remoteHauler", // Different role
            homeRoom: "E1N1",
            targetRoom: "E2N1",
            family: "economy",
            version: 1
          }
        } as unknown as Creep
      };

      const count = countRemoteCreepsByTargetRoom("E1N1", "remoteHarvester", "E2N1");
      assert.equal(count, 0);
    });
  });

  describe("getRemoteRoomNeedingWorkers", () => {
    it("should return null when no remote assignments", () => {
      const swarm = createMockSwarmState([]);
      const result = getRemoteRoomNeedingWorkers("E1N1", "remoteHarvester", swarm);
      assert.isNull(result);
    });

    it("should return first remote room when no workers assigned", () => {
      global.Game.creeps = {};
      const swarm = createMockSwarmState(["E2N1", "E3N1"]);
      const result = getRemoteRoomNeedingWorkers("E1N1", "remoteHarvester", swarm);
      assert.equal(result, "E2N1");
    });

    it("should return room with fewer than max workers", () => {
      // E2N1 has 2 workers (full), E3N1 has 1 worker (needs more)
      global.Game.creeps = {
        remote1: {
          name: "remote1",
          memory: { role: "remoteHarvester", homeRoom: "E1N1", targetRoom: "E2N1", family: "economy", version: 1 }
        } as unknown as Creep,
        remote2: {
          name: "remote2",
          memory: { role: "remoteHarvester", homeRoom: "E1N1", targetRoom: "E2N1", family: "economy", version: 1 }
        } as unknown as Creep,
        remote3: {
          name: "remote3",
          memory: { role: "remoteHarvester", homeRoom: "E1N1", targetRoom: "E3N1", family: "economy", version: 1 }
        } as unknown as Creep
      };

      const swarm = createMockSwarmState(["E2N1", "E3N1"]);
      const result = getRemoteRoomNeedingWorkers("E1N1", "remoteHarvester", swarm);
      assert.equal(result, "E3N1");
    });

    it("should return null when all remote rooms are full", () => {
      global.Game.creeps = {
        remote1: {
          name: "remote1",
          memory: { role: "remoteHarvester", homeRoom: "E1N1", targetRoom: "E2N1", family: "economy", version: 1 }
        } as unknown as Creep,
        remote2: {
          name: "remote2",
          memory: { role: "remoteHarvester", homeRoom: "E1N1", targetRoom: "E2N1", family: "economy", version: 1 }
        } as unknown as Creep
      };

      const swarm = createMockSwarmState(["E2N1"]);
      const result = getRemoteRoomNeedingWorkers("E1N1", "remoteHarvester", swarm);
      assert.isNull(result);
    });
  });

  describe("needsRole for remote roles", () => {
    it("should return true when remote room needs workers", () => {
      global.Game.creeps = {};
      const swarm = createMockSwarmState(["E2N1"]);
      const result = needsRole("E1N1", "remoteHarvester", swarm);
      assert.isTrue(result);
    });

    it("should return false when all remote rooms are full", () => {
      global.Game.creeps = {
        remote1: {
          name: "remote1",
          memory: { role: "remoteHarvester", homeRoom: "E1N1", targetRoom: "E2N1", family: "economy", version: 1 }
        } as unknown as Creep,
        remote2: {
          name: "remote2",
          memory: { role: "remoteHarvester", homeRoom: "E1N1", targetRoom: "E2N1", family: "economy", version: 1 }
        } as unknown as Creep
      };

      const swarm = createMockSwarmState(["E2N1"]);
      const result = needsRole("E1N1", "remoteHarvester", swarm);
      assert.isFalse(result);
    });

    it("should return false when no remote assignments exist", () => {
      global.Game.creeps = {};
      const swarm = createMockSwarmState([]);
      const result = needsRole("E1N1", "remoteHarvester", swarm);
      assert.isFalse(result);
    });
  });
});

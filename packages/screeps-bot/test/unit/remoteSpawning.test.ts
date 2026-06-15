import { assert } from "chai";
import { heapCache } from "@ralphschuler/screeps-memory";
import { ROLE_DEFINITIONS } from "@ralphschuler/screeps-spawn";
import {
  countRemoteCreepsByTargetRoom,
  getRemoteRoomNeedingWorkers,
  needsRole
} from "@ralphschuler/screeps-spawn";
import type { SwarmState } from "../../src/memory/schemas";

// Mock the global Game object
declare const global: { Game: typeof Game; Memory: typeof Memory };

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

function createHomeRoom(name = "E1N1"): Room {
  return {
    name,
    controller: { my: true, level: 3 },
    energyCapacityAvailable: 800,
    find: () => []
  } as unknown as Room;
}

function createRemoteRoom(
  name: string,
  opts: { owner?: string; reserver?: string; reservationTicks?: number; dangerousHostiles?: number } = {}
): Room {
  const controller = {
    owner: opts.owner ? { username: opts.owner } : undefined,
    reservation: opts.reserver
      ? { username: opts.reserver, ticksToEnd: opts.reservationTicks ?? 1000 }
      : undefined
  };
  const hostile = {
    owner: { username: "Enemy" },
    body: [{ type: ATTACK, hits: 100 }]
  } as unknown as Creep;
  return {
    name,
    controller,
    find: (type: FindConstant) => {
      if (type === FIND_SOURCES) return [{ id: `${name}-source1` }, { id: `${name}-source2` }];
      if (type === FIND_HOSTILE_CREEPS) return Array(opts.dangerousHostiles ?? 0).fill(hostile);
      return [];
    }
  } as unknown as Room;
}

function knownRoomIntel(roomName: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name: roomName,
    lastSeen: 1000,
    sources: 2,
    controllerLevel: 0,
    threatLevel: 0,
    scouted: true,
    terrain: "mixed",
    isHighway: false,
    isSK: false,
    ...overrides
  };
}

describe("remote worker spawning", () => {
  beforeEach(() => {
    // Reset the global Game object before each test
    global.Game = {
      creeps: {},
      rooms: {},
      time: 1000,
      map: {
        getRoomLinearDistance: (room1: string, room2: string) => {
          if (room1 === room2) return 0;
          if ((room1 === "E1N1" && room2 === "E2N1") || (room1 === "E2N1" && room2 === "E1N1")) return 1;
          return 3;
        }
      },
      spawns: {
        Spawn1: { owner: { username: "MyPlayer" } }
      },
      gcl: { level: 1 }
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
        objectives: {
          targetRoomCount: 1,
          targetPowerLevel: 0,
          warMode: false,
          expansionPaused: false
        },
        lastUpdate: 0
      }
    } as unknown as typeof Memory;
    heapCache.clear();
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

    it("should skip visible remotes reserved by another player for economic workers", () => {
      global.Game.creeps = {};
      global.Game.rooms = {
        E1N1: createHomeRoom(),
        E2N1: createRemoteRoom("E2N1", { reserver: "Enemy" }),
        E3N1: createRemoteRoom("E3N1")
      };

      const swarm = createMockSwarmState(["E2N1", "E3N1"]);
      const result = getRemoteRoomNeedingWorkers("E1N1", "remoteHarvester", swarm);
      assert.equal(result, "E3N1");
    });

    it("should skip no-vision remotes marked unsafe by known room intel", () => {
      global.Game.creeps = {};
      global.Game.rooms = { E1N1: createHomeRoom() };
      (global.Memory as unknown as { empire: { knownRooms: Record<string, unknown> } }).empire.knownRooms.E2N1 =
        knownRoomIntel("E2N1", { reserver: "Enemy" });

      const swarm = createMockSwarmState(["E2N1"]);
      const result = getRemoteRoomNeedingWorkers("E1N1", "remoteHarvester", swarm);
      assert.isNull(result);
    });
  });

  describe("needsRole for remote roles", () => {
    it("should request a scout for nearby unscouted intel before remotes are assigned", () => {
      (global.Memory as unknown as { empire: { knownRooms: Record<string, unknown> } }).empire.knownRooms.E2N1 = {
        name: "E2N1",
        lastSeen: 0,
        sources: 0,
        controllerLevel: 0,
        threatLevel: 0,
        scouted: false,
        terrain: "mixed",
        isHighway: false,
        isSK: false
      };

      global.Game.rooms = {
        E1N1: { name: "E1N1", controller: { my: true, level: 3 }, find: () => [] } as unknown as Room
      };

      const swarm = createMockSwarmState([]);
      const result = needsRole("E1N1", "scout", swarm);
      assert.isTrue(result, "nearby stub intel should trigger one scout to unlock remote assignment");
    });

    it("should not crash scout checks when Game.map distance lookup is unavailable", () => {
      (global.Memory as unknown as { empire: { knownRooms: Record<string, unknown> } }).empire.knownRooms.E2N1 = {
        name: "E2N1",
        lastSeen: 0,
        sources: 0,
        controllerLevel: 0,
        threatLevel: 0,
        scouted: false,
        terrain: "mixed",
        isHighway: false,
        isSK: false
      };

      global.Game.map = {
        getRoomLinearDistance: () => {
          throw new Error("WorldMapGrid unavailable");
        }
      } as unknown as typeof Game.map;
      global.Game.rooms = {
        E1N1: { name: "E1N1", controller: { my: true, level: 3 }, find: () => [] } as unknown as Room
      };

      const swarm = createMockSwarmState([]);
      assert.doesNotThrow(() => needsRole("E1N1", "scout", swarm));
      assert.isFalse(needsRole("E1N1", "scout", swarm));
    });

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

    it("should not spawn a reserver for a visible remote reserved by another player", () => {
      global.Game.creeps = {};
      global.Game.rooms = {
        E1N1: createHomeRoom(),
        E2N1: createRemoteRoom("E2N1", { reserver: "Enemy" })
      };

      const swarm = createMockSwarmState(["E2N1"]);
      assert.isFalse(needsRole("E1N1", "claimer", swarm));
    });

    it("should not spawn a reserver for no-vision remote intel reserved by another player", () => {
      global.Game.creeps = {};
      global.Game.rooms = { E1N1: createHomeRoom() };
      (global.Memory as unknown as { empire: { knownRooms: Record<string, unknown> } }).empire.knownRooms.E2N1 =
        knownRoomIntel("E2N1", { reserver: "Enemy" });

      const swarm = createMockSwarmState(["E2N1"]);
      assert.isFalse(needsRole("E1N1", "claimer", swarm));
    });
  });
});

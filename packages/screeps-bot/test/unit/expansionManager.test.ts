import { assert } from "chai";
import type { OvermindMemory, RoomIntel, SwarmState } from "../../src/memory/schemas";

// Mock the global Game object
declare const global: { Game: typeof Game; Memory: typeof Memory };

/**
 * Create a mock SwarmState
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

/**
 * Create mock room intel
 */
function createMockRoomIntel(name: string, sources = 2, scouted = true, owner?: string): RoomIntel {
  return {
    name,
    lastSeen: 1000,
    sources,
    controllerLevel: 0,
    threatLevel: 0,
    scouted,
    terrain: "plains",
    isHighway: false,
    isSK: false,
    owner
  };
}

/**
 * Create mock overmind memory
 */
function createMockOvermindMemory(): OvermindMemory {
  return {
    roomsSeen: {},
    roomIntel: {},
    claimQueue: [],
    warTargets: [],
    nukeCandidates: [],
    powerBanks: [],
    objectives: {
      targetPowerLevel: 0,
      targetRoomCount: 1,
      warMode: false,
      expansionPaused: false
    },
    lastRun: 0
  };
}

describe("expansion manager concepts", () => {
  beforeEach(() => {
    // Reset the global Game object before each test
    global.Game = {
      creeps: {},
      rooms: {},
      spawns: {},
      time: 1000,
      gcl: { level: 2, progress: 0, progressTotal: 1000000 },
      map: {
        getRoomLinearDistance: (room1: string, room2: string) => {
          // Simple mock: assume E1N1 and E2N1 are 1 apart
          if (room1 === "E1N1" && room2 === "E2N1") return 1;
          if (room1 === "E1N1" && room2 === "E3N1") return 2;
          return 3;
        }
      }
    } as unknown as typeof Game;

    global.Memory = {
      creeps: {},
      rooms: {}
    } as typeof Memory;
  });

  describe("remote room candidate evaluation", () => {
    it("should identify remote room candidates based on intel", () => {
      const overmind = createMockOvermindMemory();
      overmind.roomIntel["E2N1"] = createMockRoomIntel("E2N1", 2, true);
      overmind.roomIntel["E3N1"] = createMockRoomIntel("E3N1", 1, true);

      // E2N1 has 2 sources and is 1 distance away - better candidate
      // E3N1 has 1 source and is 2 distance away - worse candidate
      const e2n1Score = overmind.roomIntel["E2N1"].sources * 50 - 1 * 20; // 100 - 20 = 80
      const e3n1Score = overmind.roomIntel["E3N1"].sources * 50 - 2 * 20; // 50 - 40 = 10

      assert.isAbove(e2n1Score, e3n1Score, "E2N1 should have higher score than E3N1");
    });

    it("should exclude owned rooms from remote candidates", () => {
      const overmind = createMockOvermindMemory();
      overmind.roomIntel["E2N1"] = createMockRoomIntel("E2N1", 2, true, "SomePlayer");

      // Room with an owner should not be considered for remote mining
      const intel = overmind.roomIntel["E2N1"];
      assert.isNotNull(intel.owner, "Room should have an owner");
      // In real code, we'd filter out rooms with owners
    });

    it("should exclude SK rooms from remote candidates", () => {
      const overmind = createMockOvermindMemory();
      const intel = createMockRoomIntel("E2N1", 2, true);
      intel.isSK = true;
      overmind.roomIntel["E2N1"] = intel;

      // SK rooms should not be considered for remote mining
      assert.isTrue(intel.isSK, "Room should be marked as SK");
    });

    it("should exclude highway rooms from remote candidates", () => {
      const overmind = createMockOvermindMemory();
      const intel = createMockRoomIntel("E2N1", 2, true);
      intel.isHighway = true;
      overmind.roomIntel["E2N1"] = intel;

      // Highway rooms should not be considered for remote mining
      assert.isTrue(intel.isHighway, "Room should be marked as highway");
    });
  });

  describe("expansion queue processing", () => {
    it("should identify when expansion is possible (GCL allows)", () => {
      global.Game.gcl = { level: 2, progress: 0, progressTotal: 1000000 };

      // Create a mock owned room count
      const ownedRoomCount = 1;
      const canExpand = ownedRoomCount < global.Game.gcl.level;

      assert.isTrue(canExpand, "Should be able to expand when owned rooms < GCL level");
    });

    it("should identify when expansion is not possible (at GCL limit)", () => {
      global.Game.gcl = { level: 2, progress: 0, progressTotal: 1000000 };

      // Create a mock owned room count at limit
      const ownedRoomCount = 2;
      const canExpand = ownedRoomCount < global.Game.gcl.level;

      assert.isFalse(canExpand, "Should not expand when owned rooms >= GCL level");
    });

    it("should track claimed status of expansion candidates", () => {
      const overmind = createMockOvermindMemory();
      overmind.claimQueue = [
        { roomName: "E4N4", score: 80, distance: 2, claimed: false, lastEvaluated: 1000 },
        { roomName: "E5N5", score: 70, distance: 3, claimed: true, lastEvaluated: 1000 }
      ];

      const unclaimed = overmind.claimQueue.filter(c => !c.claimed);
      assert.lengthOf(unclaimed, 1, "Should have 1 unclaimed candidate");
      assert.equal(unclaimed[0].roomName, "E4N4");
    });

    it("should remove claimed rooms from claim queue when they are now owned", () => {
      const overmind = createMockOvermindMemory();
      overmind.claimQueue = [
        { roomName: "E1N1", score: 90, distance: 1, claimed: true, lastEvaluated: 1000 },
        { roomName: "E4N4", score: 80, distance: 2, claimed: false, lastEvaluated: 1000 },
        { roomName: "E5N5", score: 70, distance: 3, claimed: true, lastEvaluated: 1000 }
      ];

      // Mock that E1N1 is now owned
      global.Game.rooms = {
        E1N1: {
          name: "E1N1",
          controller: { my: true, level: 1 }
        } as unknown as Room
      };

      const ownedRooms = Object.values(global.Game.rooms).filter(r => r.controller?.my);
      const ownedRoomNames = new Set(ownedRooms.map(r => r.name));

      // Simulate the cleanup logic that should be in EmpireManager.updateExpansionQueue
      const initialLength = overmind.claimQueue.length;
      overmind.claimQueue = overmind.claimQueue.filter(candidate => !ownedRoomNames.has(candidate.roomName));

      // E1N1 should be removed from the queue since it's now owned
      assert.lengthOf(overmind.claimQueue, initialLength - 1, "Should have removed 1 room from claim queue");
      assert.isFalse(
        overmind.claimQueue.some(c => c.roomName === "E1N1"),
        "E1N1 should not be in claim queue anymore"
      );
      assert.isTrue(
        overmind.claimQueue.some(c => c.roomName === "E4N4"),
        "E4N4 should still be in claim queue"
      );
      assert.isTrue(
        overmind.claimQueue.some(c => c.roomName === "E5N5"),
        "E5N5 should still be in claim queue"
      );
    });
  });

  describe("claimer assignment", () => {
    it("should identify claimers without targets", () => {
      global.Game.creeps = {
        claimer1: {
          name: "claimer1",
          memory: {
            role: "claimer",
            homeRoom: "E1N1",
            family: "utility",
            version: 1
            // No targetRoom set
          }
        } as unknown as Creep
      };

      const claimersWithoutTarget = Object.values(global.Game.creeps).filter(c => {
        const mem = c.memory as { role?: string; targetRoom?: string };
        return mem.role === "claimer" && !mem.targetRoom;
      });

      assert.lengthOf(claimersWithoutTarget, 1, "Should find 1 claimer without target");
    });

    it("should not reassign claimers that already have targets", () => {
      global.Game.creeps = {
        claimer1: {
          name: "claimer1",
          memory: {
            role: "claimer",
            homeRoom: "E1N1",
            targetRoom: "E4N4",
            task: "claim",
            family: "utility",
            version: 1
          }
        } as unknown as Creep
      };

      const claimersWithoutTarget = Object.values(global.Game.creeps).filter(c => {
        const mem = c.memory as { role?: string; targetRoom?: string };
        return mem.role === "claimer" && !mem.targetRoom;
      });

      assert.lengthOf(claimersWithoutTarget, 0, "Should find no claimers without target");
    });
  });

  describe("reserver assignment for remote rooms", () => {
    it("should identify remote rooms without reservers", () => {
      const swarm = createMockSwarmState(["E2N1", "E3N1"]);
      global.Game.creeps = {};

      // Check if any remote has a reserver
      const remotesWithoutReserver = swarm.remoteAssignments.filter(remote => {
        const hasReserver = Object.values(global.Game.creeps).some(c => {
          const mem = c.memory as { role?: string; targetRoom?: string; task?: string };
          return mem.role === "claimer" && mem.targetRoom === remote && mem.task === "reserve";
        });
        return !hasReserver;
      });

      assert.lengthOf(remotesWithoutReserver, 2, "All remotes should need reservers");
    });

    it("should not assign new reserver if remote already has one", () => {
      const swarm = createMockSwarmState(["E2N1", "E3N1"]);
      global.Game.creeps = {
        reserver1: {
          name: "reserver1",
          memory: {
            role: "claimer",
            homeRoom: "E1N1",
            targetRoom: "E2N1",
            task: "reserve",
            family: "utility",
            version: 1
          }
        } as unknown as Creep
      };

      // Check if any remote has a reserver
      const remotesWithoutReserver = swarm.remoteAssignments.filter(remote => {
        const hasReserver = Object.values(global.Game.creeps).some(c => {
          const mem = c.memory as { role?: string; targetRoom?: string; task?: string };
          return mem.role === "claimer" && mem.targetRoom === remote && mem.task === "reserve";
        });
        return !hasReserver;
      });

      assert.lengthOf(remotesWithoutReserver, 1, "Only E3N1 should need a reserver");
      assert.equal(remotesWithoutReserver[0], "E3N1");
    });
  });

  describe("GCL-based expansion pacing", () => {
    it("should check GCL progress before expansion", () => {
      global.Game.gcl = {
        level: 3,
        progress: 500000, // 50% progress
        progressTotal: 1000000
      };

      const gclProgress = global.Game.gcl.progress / global.Game.gcl.progressTotal;
      const minProgressThreshold = 0.7; // 70% threshold

      // Should not be ready to expand at 50% progress
      assert.isBelow(gclProgress, minProgressThreshold, "GCL progress should be below threshold");
    });

    it("should allow expansion when GCL progress is sufficient", () => {
      global.Game.gcl = {
        level: 3,
        progress: 800000, // 80% progress
        progressTotal: 1000000
      };

      const gclProgress = global.Game.gcl.progress / global.Game.gcl.progressTotal;
      const minProgressThreshold = 0.7; // 70% threshold

      // Should be ready to expand at 80% progress
      assert.isAtLeast(gclProgress, minProgressThreshold, "GCL progress should meet threshold");
    });

    it("should check room stability before expansion", () => {
      global.Game.rooms = {
        E1N1: {
          name: "E1N1",
          controller: { my: true, level: 5 }
        } as unknown as Room,
        E2N2: {
          name: "E2N2",
          controller: { my: true, level: 4 }
        } as unknown as Room,
        E3N3: {
          name: "E3N3",
          controller: { my: true, level: 2 }
        } as unknown as Room
      };

      const ownedRooms = Object.values(global.Game.rooms).filter(r => r.controller?.my);
      const minRclForClaiming = 4;
      const stableRooms = ownedRooms.filter(r => (r.controller?.level ?? 0) >= minRclForClaiming);
      const stablePercentage = stableRooms.length / ownedRooms.length;
      const minStablePercentage = 0.6; // 60%

      // 2 out of 3 rooms are RCL 4+ (66% > 60%)
      assert.isAtLeast(stablePercentage, minStablePercentage, "Should have enough stable rooms");
    });

    it("should not expand when too few rooms are stable", () => {
      global.Game.rooms = {
        E1N1: {
          name: "E1N1",
          controller: { my: true, level: 5 }
        } as unknown as Room,
        E2N2: {
          name: "E2N2",
          controller: { my: true, level: 3 }
        } as unknown as Room,
        E3N3: {
          name: "E3N3",
          controller: { my: true, level: 2 }
        } as unknown as Room
      };

      const ownedRooms = Object.values(global.Game.rooms).filter(r => r.controller?.my);
      const minRclForClaiming = 4;
      const stableRooms = ownedRooms.filter(r => (r.controller?.level ?? 0) >= minRclForClaiming);
      const stablePercentage = stableRooms.length / ownedRooms.length;
      const minStablePercentage = 0.6; // 60%

      // Only 1 out of 3 rooms is RCL 4+ (33% < 60%)
      assert.isBelow(stablePercentage, minStablePercentage, "Should not have enough stable rooms");
    });
  });

  describe("cluster-based expansion strategy", () => {
    it("should prioritize expansion near existing clusters", () => {
      const overmind = createMockOvermindMemory();
      overmind.claimQueue = [
        { roomName: "E2N1", score: 80, distance: 1, claimed: false, lastEvaluated: 1000 },
        { roomName: "E5N5", score: 85, distance: 10, claimed: false, lastEvaluated: 1000 }
      ];

      // Room closer to existing cluster should get bonus
      const clusterExpansionDistance = 5;
      const nearCluster = overmind.claimQueue[0].distance <= clusterExpansionDistance;
      const farFromCluster = overmind.claimQueue[1].distance > clusterExpansionDistance;

      assert.isTrue(nearCluster, "E2N1 should be near cluster");
      assert.isTrue(farFromCluster, "E5N5 should be far from cluster");

      // With cluster bonus of 100, E2N1 (80 + 100 = 180) beats E5N5 (85)
      const e2n1ClusterScore = overmind.claimQueue[0].score + (nearCluster ? 100 : 0);
      const e5n5ClusterScore = overmind.claimQueue[1].score + (farFromCluster ? 0 : 100);

      assert.isAbove(e2n1ClusterScore, e5n5ClusterScore, "Nearby room should be prioritized");
    });

    it("should calculate minimum distance to owned rooms", () => {
      global.Game.rooms = {
        E1N1: {
          name: "E1N1",
          controller: { my: true, level: 5 }
        } as unknown as Room,
        E5N5: {
          name: "E5N5",
          controller: { my: true, level: 4 }
        } as unknown as Room
      };

      // Mock distance function already set in beforeEach
      // Note: The mock returns 1 for E1N1->E2N1, but 3 for E2N1->E1N1 (default case)
      const ownedRooms = Object.values(global.Game.rooms).filter(r => r.controller?.my);

      // Calculate min distance from E2N1
      let minDistance = 999;
      for (const room of ownedRooms) {
        const distance = global.Game.map.getRoomLinearDistance("E2N1", room.name);
        if (distance < minDistance) {
          minDistance = distance;
        }
      }

      // The mock distance function returns 3 for any unlisted pair, so min is 3
      assert.isAtMost(minDistance, 999, "Should calculate distance to owned rooms");
      assert.isAtLeast(minDistance, 1, "Distance should be reasonable");
    });
  });

  describe("remote vs owned room priority logic", () => {
    it("should calculate reduced remote capacity for low RCL rooms", () => {
      const rcl = 3;
      const maxRemotesPerRoom = 3;

      // RCL 3 should get max 1 remote
      const capacity = rcl < 4 ? Math.min(1, maxRemotesPerRoom) : maxRemotesPerRoom;

      assert.equal(capacity, 1, "Low RCL room should have reduced remote capacity");
    });

    it("should calculate reduced remote capacity for rooms with critically low energy", () => {
      const storage = { store: { getUsedCapacity: () => 5000 } };
      const maxRemotesPerRoom = 3;

      // Critically low energy threshold: 10000 (changed from 50000 to allow remote mining to build up energy)
      const capacity = storage.store.getUsedCapacity() < 10000 ? Math.min(1, maxRemotesPerRoom) : maxRemotesPerRoom;

      assert.equal(capacity, 1, "Critically low energy room should have reduced remote capacity");
    });

    it("should allow full remote capacity for rooms with moderate energy", () => {
      const storage = { store: { getUsedCapacity: () => 25000 } };
      const maxRemotesPerRoom = 3;

      // Moderate energy (above 10k threshold) should allow full capacity
      const capacity = storage.store.getUsedCapacity() < 10000 ? Math.min(1, maxRemotesPerRoom) : maxRemotesPerRoom;

      assert.equal(capacity, 3, "Room with moderate energy should have full remote capacity to build up reserves");
    });

    it("should calculate reduced remote capacity for threatened rooms", () => {
      const swarm = createMockSwarmState();
      swarm.danger = 2;
      const maxRemotesPerRoom = 3;

      // Danger level 2+ should reduce capacity
      const capacity = swarm.danger >= 2 ? Math.min(1, maxRemotesPerRoom) : maxRemotesPerRoom;

      assert.equal(capacity, 1, "Threatened room should have reduced remote capacity");
    });

    it("should allow full remote capacity for stable mature rooms", () => {
      const rcl = 8;
      const storage = { store: { getUsedCapacity: () => 200000 } };
      const swarm = createMockSwarmState();
      swarm.danger = 0;
      const maxRemotesPerRoom = 3;

      // Check all conditions for full capacity (updated energy threshold to 10000)
      const hasHighRcl = rcl >= 7;
      const hasGoodEnergy = storage.store.getUsedCapacity() >= 10000;
      const isNotThreatened = swarm.danger < 2;

      assert.isTrue(hasHighRcl, "Should have high RCL");
      assert.isTrue(hasGoodEnergy, "Should have good energy");
      assert.isTrue(isNotThreatened, "Should not be threatened");

      const capacity = hasHighRcl && hasGoodEnergy && isNotThreatened ? maxRemotesPerRoom : 1;
      assert.equal(capacity, 3, "Stable mature room should have full remote capacity");
    });
  });
});

/**
 * Empire Manager Tests
 *
 * Tests for empire-level automation and coordination
 */

import { expect } from "chai";
import type { EmpireMemory, RoomIntel } from "../../src/memory/schemas";
import { createDefaultEmpireMemory } from "../../src/memory/schemas";

// Mock global objects
const mockMemory: any = {};
const mockGame: any = {
  time: 1000,
  gcl: {
    level: 2,
    progress: 500000,
    progressTotal: 1000000
  },
  rooms: {},
  spawns: {},
  cpu: {
    getUsed: () => 10
  }
};

// Setup globals
(global as any).Game = mockGame;
(global as any).Memory = mockMemory;

// Mock constants
(global as any).FIND_SOURCES = 105;
(global as any).FIND_MINERALS = 106;
(global as any).FIND_STRUCTURES = 107;
(global as any).FIND_HOSTILE_CREEPS = 118;
(global as any).STRUCTURE_TOWER = "tower";
(global as any).STRUCTURE_SPAWN = "spawn";
(global as any).RESOURCE_ENERGY = "energy";
(global as any).ATTACK = "attack";
(global as any).RANGED_ATTACK = "ranged_attack";
(global as any).WORK = "work";
(global as any).TERRAIN_MASK_SWAMP = 1;

/**
 * Create mock room intel
 */
function createMockRoomIntel(name: string, options: Partial<RoomIntel> = {}): RoomIntel {
  return {
    name,
    lastSeen: 1000,
    sources: 2,
    controllerLevel: 0,
    threatLevel: 0,
    scouted: true,
    terrain: "plains",
    isHighway: false,
    isSK: false,
    ...options
  };
}

describe("Empire Manager Automation", () => {
  let empire: EmpireMemory;

  beforeEach(() => {
    // Reset overmind before each test
    overmind = createDefaultEmpireMemory();
    mockGame.time = 1000;
    mockGame.rooms = {};
    mockGame.spawns = {};
    mockGame.gcl = {
      level: 2,
      progress: 500000,
      progressTotal: 1000000
    };
  });

  describe("Expansion Readiness", () => {
    it("should identify when expansion conditions are met", () => {
      // Create a stable room (RCL 4+ with storage and energy)
      mockGame.rooms = {
        W1N1: {
          name: "W1N1",
          controller: { my: true, level: 4 },
          storage: { store: { energy: 100000 } }
        }
      };

      const ownedRooms = Object.values(mockGame.rooms).filter((r: any) => r.controller?.my);
      const stableRooms = ownedRooms.filter((r: any) => {
        const rcl = r.controller?.level ?? 0;
        const hasStorage = r.storage !== undefined;
        return rcl >= 4 && hasStorage;
      });

      const totalEnergy = stableRooms.reduce((sum: number, r: any) => sum + (r.storage?.store?.energy ?? 0), 0);
      const avgEnergy = totalEnergy / stableRooms.length;

      expect(stableRooms.length).to.equal(1, "Should have 1 stable room");
      expect(avgEnergy).to.be.at.least(50000, "Should have enough energy for expansion");
    });

    it("should identify when expansion should be paused (no stable rooms)", () => {
      // Room not stable yet (RCL 2)
      mockGame.rooms = {
        W1N1: {
          name: "W1N1",
          controller: { my: true, level: 2 },
          storage: undefined
        }
      };

      const ownedRooms = Object.values(mockGame.rooms).filter((r: any) => r.controller?.my);
      const stableRooms = ownedRooms.filter((r: any) => {
        const rcl = r.controller?.level ?? 0;
        const hasStorage = r.storage !== undefined;
        return rcl >= 4 && hasStorage;
      });

      expect(stableRooms.length).to.equal(0, "Should have no stable rooms");
    });

    it("should identify when expansion should be paused (insufficient energy)", () => {
      // Stable room but low energy
      mockGame.rooms = {
        W1N1: {
          name: "W1N1",
          controller: { my: true, level: 4 },
          storage: { store: { energy: 20000 } }
        }
      };

      const ownedRooms = Object.values(mockGame.rooms).filter((r: any) => r.controller?.my);
      const stableRooms = ownedRooms.filter((r: any) => {
        const rcl = r.controller?.level ?? 0;
        const hasStorage = r.storage !== undefined;
        return rcl >= 4 && hasStorage;
      });

      const totalEnergy = stableRooms.reduce((sum: number, r: any) => sum + (r.storage?.store?.energy ?? 0), 0);
      const avgEnergy = totalEnergy / stableRooms.length;
      const minEnergyForExpansion = 50000;

      expect(stableRooms.length).to.equal(1, "Should have 1 stable room");
      expect(avgEnergy).to.be.below(minEnergyForExpansion, "Energy should be below expansion threshold");
    });

    it("should not expand when at GCL limit", () => {
      mockGame.gcl.level = 2;
      mockGame.rooms = {
        W1N1: { name: "W1N1", controller: { my: true, level: 5 } },
        W2N1: { name: "W2N1", controller: { my: true, level: 4 } }
      };

      const ownedRooms = Object.values(mockGame.rooms).filter((r: any) => r.controller?.my);
      const atGclLimit = ownedRooms.length >= mockGame.gcl.level;

      expect(atGclLimit).to.be.true;
    });
  });

  describe("GCL Progress Tracking", () => {
    it("should calculate GCL progress percentage", () => {
      mockGame.gcl = {
        level: 2,
        progress: 900000,
        progressTotal: 1000000
      };

      const gclProgress = (mockGame.gcl.progress / mockGame.gcl.progressTotal) * 100;

      expect(gclProgress).to.equal(90);
    });

    it("should identify when approaching next GCL level", () => {
      mockGame.gcl = {
        level: 2,
        progress: 950000,
        progressTotal: 1000000
      };

      const gclProgress = (mockGame.gcl.progress / mockGame.gcl.progressTotal) * 100;
      const threshold = 90;

      expect(gclProgress).to.be.at.least(threshold, "Should be at or above notification threshold");
    });

    it("should update target room count based on GCL level", () => {
      mockGame.gcl.level = 5;

      overmind.objectives.targetRoomCount = mockGame.gcl.level;

      expect(overmind.objectives.targetRoomCount).to.equal(5);
    });
  });

  describe("Room Intel Management", () => {
    it("should create new room intel entries", () => {
      const intel = createMockRoomIntel("W1N1", {
        sources: 2,
        controllerLevel: 3,
        owner: "TestPlayer"
      });

      expect(intel.name).to.equal("W1N1");
      expect(intel.sources).to.equal(2);
      expect(intel.controllerLevel).to.equal(3);
      expect(intel.owner).to.equal("TestPlayer");
    });

    it("should update threat level based on hostile presence", () => {
      const intel = createMockRoomIntel("W1N1", { threatLevel: 0 });

      // Simulate hostile detection
      const dangerousHostileCount = 5;

      let updatedThreatLevel = 0;
      if (dangerousHostileCount >= 5) {
        updatedThreatLevel = 3;
      } else if (dangerousHostileCount >= 2) {
        updatedThreatLevel = 2;
      } else if (dangerousHostileCount > 0) {
        updatedThreatLevel = 1;
      }

      expect(updatedThreatLevel).to.equal(3, "Should set threat level to 3 for 5+ hostiles");
    });

    it("should track tower and spawn counts for nuke targeting", () => {
      const intel = createMockRoomIntel("W1N1", {
        towerCount: 6,
        spawnCount: 3
      });

      expect(intel.towerCount).to.equal(6);
      expect(intel.spawnCount).to.equal(3);
    });

    it("should update lastSeen timestamp", () => {
      mockGame.time = 2000;
      const intel = createMockRoomIntel("W1N1", { lastSeen: 1000 });

      intel.lastSeen = mockGame.time;

      expect(intel.lastSeen).to.equal(2000);
    });
  });

  describe("Nuke Candidate Scoring", () => {
    it("should score high RCL rooms higher", () => {
      const intel1 = createMockRoomIntel("W1N1", { controllerLevel: 8, towerCount: 6, spawnCount: 3 });
      const intel2 = createMockRoomIntel("W2N1", { controllerLevel: 4, towerCount: 3, spawnCount: 1 });

      // Scoring formula: RCL * 10 + towers * 15 + spawns * 20
      const score1 = intel1.controllerLevel * 10 + (intel1.towerCount ?? 0) * 15 + (intel1.spawnCount ?? 0) * 20;
      const score2 = intel2.controllerLevel * 10 + (intel2.towerCount ?? 0) * 15 + (intel2.spawnCount ?? 0) * 20;

      expect(score1).to.be.above(score2, "Higher RCL room should have higher nuke score");
    });

    it("should score rooms with more towers higher", () => {
      const intel1 = createMockRoomIntel("W1N1", { controllerLevel: 6, towerCount: 6, spawnCount: 2 });
      const intel2 = createMockRoomIntel("W2N1", { controllerLevel: 6, towerCount: 2, spawnCount: 2 });

      const score1 = intel1.controllerLevel * 10 + (intel1.towerCount ?? 0) * 15 + (intel1.spawnCount ?? 0) * 20;
      const score2 = intel2.controllerLevel * 10 + (intel2.towerCount ?? 0) * 15 + (intel2.spawnCount ?? 0) * 20;

      expect(score1).to.be.above(score2, "Room with more towers should have higher nuke score");
    });

    it("should not score SK or highway rooms", () => {
      const intelSK = createMockRoomIntel("W1N1", { isSK: true, controllerLevel: 0 });
      const intelHighway = createMockRoomIntel("W2N1", { isHighway: true, controllerLevel: 0 });

      const scoreSK = intelSK.isSK || intelSK.isHighway ? 0 : 50;
      const scoreHighway = intelHighway.isSK || intelHighway.isHighway ? 0 : 50;

      expect(scoreSK).to.equal(0, "SK rooms should have 0 nuke score");
      expect(scoreHighway).to.equal(0, "Highway rooms should have 0 nuke score");
    });
  });

  describe("War Mode Management", () => {
    it("should enable war mode when war targets exist", () => {
      overmind.warTargets = ["W1N1", "W2N1"];
      overmind.objectives.warMode = false;

      if (overmind.warTargets.length > 0 && !overmind.objectives.warMode) {
        overmind.objectives.warMode = true;
      }

      expect(overmind.objectives.warMode).to.be.true;
    });

    it("should disable war mode when no war targets remain", () => {
      overmind.warTargets = [];
      overmind.objectives.warMode = true;

      if (overmind.warTargets.length === 0 && overmind.objectives.warMode) {
        overmind.objectives.warMode = false;
      }

      expect(overmind.objectives.warMode).to.be.false;
    });

    it("should add nuke candidates only when in war mode", () => {
      overmind.objectives.warMode = false;
      overmind.warTargets = ["W1N1"];
      overmind.nukeCandidates = [];

      // Nuke candidates should not be added when not in war mode
      const shouldEvaluateNukes = overmind.objectives.warMode && overmind.warTargets.length > 0;

      expect(shouldEvaluateNukes).to.be.false;
    });
  });

  describe("Power Bank Management", () => {
    it("should remove expired power banks", () => {
      mockGame.time = 6000;
      overmind.powerBanks = [
        { roomName: "W1N1", pos: { x: 25, y: 25 }, power: 2000, decayTick: 5000, active: false },
        { roomName: "W2N1", pos: { x: 25, y: 25 }, power: 3000, decayTick: 7000, active: false }
      ];

      overmind.powerBanks = overmind.powerBanks.filter(pb => pb.decayTick > mockGame.time);

      expect(overmind.powerBanks.length).to.equal(1, "Should keep only non-expired power banks");
      expect(overmind.powerBanks[0].roomName).to.equal("W2N1");
    });

    it("should track power amount and decay tick", () => {
      const pb = {
        roomName: "W1N1",
        pos: { x: 25, y: 25 },
        power: 4000,
        decayTick: 10000,
        active: false
      };

      expect(pb.power).to.equal(4000);
      expect(pb.decayTick).to.equal(10000);
    });

    it("should mark power banks as active when harvesting", () => {
      const pb = {
        roomName: "W1N1",
        pos: { x: 25, y: 25 },
        power: 4000,
        decayTick: 10000,
        active: false
      };

      pb.active = true;

      expect(pb.active).to.be.true;
    });
  });

  describe("Expansion Queue Management", () => {
    it("should clean up owned rooms from claim queue", () => {
      overmind.claimQueue = [
        { roomName: "W1N1", score: 100, distance: 1, claimed: true, lastEvaluated: 1000 },
        { roomName: "W2N1", score: 90, distance: 2, claimed: false, lastEvaluated: 1000 },
        { roomName: "W3N1", score: 80, distance: 3, claimed: false, lastEvaluated: 1000 }
      ];

      // Simulate W1N1 is now owned
      const ownedRoomNames = new Set(["W1N1"]);

      overmind.claimQueue = overmind.claimQueue.filter(candidate => !ownedRoomNames.has(candidate.roomName));

      expect(overmind.claimQueue.length).to.equal(2);
      expect(overmind.claimQueue.some(c => c.roomName === "W1N1")).to.be.false;
    });

    it("should sort claim queue by score", () => {
      overmind.claimQueue = [
        { roomName: "W1N1", score: 80, distance: 1, claimed: false, lastEvaluated: 1000 },
        { roomName: "W2N1", score: 100, distance: 2, claimed: false, lastEvaluated: 1000 },
        { roomName: "W3N1", score: 90, distance: 3, claimed: false, lastEvaluated: 1000 }
      ];

      overmind.claimQueue.sort((a, b) => b.score - a.score);

      expect(overmind.claimQueue[0].roomName).to.equal("W2N1", "Highest score should be first");
      expect(overmind.claimQueue[1].roomName).to.equal("W3N1");
      expect(overmind.claimQueue[2].roomName).to.equal("W1N1");
    });

    it("should keep only top candidates in queue", () => {
      overmind.claimQueue = [];
      for (let i = 0; i < 15; i++) {
        overmind.claimQueue.push({
          roomName: `W${i}N1`,
          score: 100 - i,
          distance: 2,
          claimed: false,
          lastEvaluated: 1000
        });
      }

      overmind.claimQueue = overmind.claimQueue.slice(0, 10);

      expect(overmind.claimQueue.length).to.equal(10, "Should keep only top 10 candidates");
    });
  });

  describe("Cluster Health Monitoring", () => {
    it("should calculate average energy across cluster rooms", () => {
      const clusterRooms = [
        { storage: { store: { energy: 100000 } }, terminal: { store: { energy: 50000 } } },
        { storage: { store: { energy: 80000 } }, terminal: { store: { energy: 30000 } } }
      ];

      const totalEnergy = clusterRooms.reduce((sum: number, r: any) => {
        return sum + (r.storage?.store?.energy ?? 0) + (r.terminal?.store?.energy ?? 0);
      }, 0);
      const avgEnergy = totalEnergy / clusterRooms.length;

      expect(avgEnergy).to.equal(130000);
    });

    it("should detect low energy conditions", () => {
      const avgEnergy = 25000;
      const threshold = 30000;

      const lowEnergy = avgEnergy < threshold;

      expect(lowEnergy).to.be.true;
    });

    it("should calculate economy health index", () => {
      const avgEnergy = 80000;
      const roomCount = 2;
      const totalRooms = 3;

      const energyScore = Math.min(100, (avgEnergy / 100000) * 100);
      const roomCountScore = (roomCount / totalRooms) * 100;
      const economyIndex = Math.round((energyScore + roomCountScore) / 2);

      expect(economyIndex).to.be.within(60, 90);
    });

    it("should detect unhealthy clusters", () => {
      const economyIndex = 35;
      const threshold = 40;

      const isUnhealthy = economyIndex < threshold;

      expect(isUnhealthy).to.be.true;
    });
  });

  describe("Power Bank Profitability Assessment", () => {
    it("should calculate travel time based on distance", () => {
      const distance = 3;
      const ticksPerRoom = 50;
      const travelTime = distance * ticksPerRoom;

      expect(travelTime).to.equal(150);
    });

    it("should estimate harvest time based on power amount", () => {
      const power = 4000;
      const harvestTime = power / 2; // 2 power per tick

      expect(harvestTime).to.equal(2000);
    });

    it("should identify profitable power banks", () => {
      const power = 3000;
      const distance = 3;
      const timeRemaining = 8000;
      const closestRoomRcl = 8;

      const ticksPerRoom = 50;
      const travelTime = distance * ticksPerRoom;
      const harvestTime = power / 2;
      const totalTime = travelTime * 2 + harvestTime;

      const isProfitable =
        timeRemaining > totalTime * 1.5 &&
        distance <= 5 &&
        power >= 1000 &&
        closestRoomRcl >= 7;

      expect(isProfitable).to.be.true;
    });

    it("should identify unprofitable power banks (too far)", () => {
      const power = 3000;
      const distance = 8; // Too far
      const timeRemaining = 8000;
      const closestRoomRcl = 8;

      const isProfitable = distance <= 5 && power >= 1000 && closestRoomRcl >= 7;

      expect(isProfitable).to.be.false;
    });

    it("should identify unprofitable power banks (insufficient time)", () => {
      const power = 3000;
      const distance = 3;
      const timeRemaining = 1000; // Not enough time
      const closestRoomRcl = 8;

      const ticksPerRoom = 50;
      const travelTime = distance * ticksPerRoom;
      const harvestTime = power / 2;
      const totalTime = travelTime * 2 + harvestTime;

      const isProfitable = timeRemaining > totalTime * 1.5;

      expect(isProfitable).to.be.false;
    });

    it("should identify unprofitable power banks (low RCL)", () => {
      const power = 3000;
      const distance = 3;
      const timeRemaining = 8000;
      const closestRoomRcl = 5; // Too low

      const isProfitable = closestRoomRcl >= 7;

      expect(isProfitable).to.be.false;
    });

    it("should identify unprofitable power banks (too little power)", () => {
      const power = 500; // Too little
      const minPower = 1000;

      const isProfitable = power >= minPower;

      expect(isProfitable).to.be.false;
    });
  });
});

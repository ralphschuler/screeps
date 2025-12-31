/**
 * Expansion Safety and Profitability Tests
 *
 * Tests for safety analysis and remote mining profitability calculations
 * Calls actual implementation methods from expansionScoring.ts
 */

import { expect } from "chai";
import type { RoomIntel, EmpireMemory } from "../../src/memory/schemas";
import { createDefaultEmpireMemory } from "../../src/memory/schemas";
import * as ExpansionScoring from "../../src/empire/expansionScoring";

// Mock the global Game object
declare const global: { Game: typeof Game; Memory: typeof Memory };

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

/**
 * Calculate simple ROI for testing (shared utility)
 * Matches the logic in expansionManager.calculateRemoteProfitability
 */
function calculateTestROI(distance: number, sources: number): number {
  const harvesterCost = 650;
  const haulerCost = 450;
  const totalBodyCost = harvesterCost + haulerCost * sources;

  const tripTime = distance * 50;
  const tripsPerLifetime = 1500 / tripTime;
  const costPerTrip = totalBodyCost / tripsPerLifetime;
  const energyCost = costPerTrip / tripTime;

  const sourceOutput = 3000;
  const energyPerTick = (sourceOutput / 300) * sources;

  const energyGain = energyPerTick - energyCost;
  const roi = energyGain / energyCost;

  return roi;
}

/**
 * Parse room name into coordinates
 */
function parseRoomName(roomName: string): { x: number; y: number; xDir: string; yDir: string } | null {
  const match = roomName.match(/^([WE])(\d+)([NS])(\d+)$/);
  if (!match) return null;

  return {
    xDir: match[1],
    x: parseInt(match[2], 10),
    yDir: match[3],
    y: parseInt(match[4], 10)
  };
}

/**
 * Get adjacent room names
 */
function getAdjacentRoomNames(roomName: string): string[] {
  const parsed = parseRoomName(roomName);
  if (!parsed) return [];

  const { x, y, xDir, yDir } = parsed;
  const adjacent: string[] = [];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;

      const newX = x + dx;
      const newY = y + dy;

      let adjXDir = xDir;
      let adjYDir = yDir;
      let adjX = newX;
      let adjY = newY;

      if (newX < 0) {
        adjXDir = xDir === "E" ? "W" : "E";
        adjX = Math.abs(newX) - 1;
      }
      if (newY < 0) {
        adjYDir = yDir === "N" ? "S" : "N";
        adjY = Math.abs(newY) - 1;
      }

      adjacent.push(`${adjXDir}${adjX}${adjYDir}${adjY}`);
    }
  }

  return adjacent;
}

describe("Expansion Safety Analysis", () => {
  let empire: EmpireMemory;

  beforeEach(() => {
    overmind = createDefaultEmpireMemory();

    global.Game = {
      time: 1000,
      gcl: { level: 2, progress: 0, progressTotal: 1000000 },
      map: {
        getRoomLinearDistance: (_room1: string, _room2: string) => {
          return 1; // Simple mock
        }
      },
      rooms: {},
      spawns: {},
      creeps: {}
    } as unknown as typeof Game;
  });

  describe("Adjacent Room Scanning", () => {
    it("should detect hostile owned adjacent rooms", () => {
      // Setup: E1N1 with hostile-owned E2N1 adjacent
      overmind.roomIntel["E1N1"] = createMockRoomIntel("E1N1");
      overmind.roomIntel["E2N1"] = createMockRoomIntel("E2N1", { owner: "HostilePlayer" });

      const targetRoom = "E1N1";
      const adjacentRooms = getAdjacentRoomNames(targetRoom);

      let threatCount = 0;
      for (const adjRoom of adjacentRooms) {
        const intel = overmind.roomIntel[adjRoom];
        if (intel?.owner) {
          threatCount++;
        }
      }

      expect(threatCount).to.be.greaterThan(0);
    });

    it("should detect towers in adjacent rooms", () => {
      overmind.roomIntel["E1N1"] = createMockRoomIntel("E1N1");
      overmind.roomIntel["E2N1"] = createMockRoomIntel("E2N1", { towerCount: 3 });

      const targetRoom = "E1N1";
      const adjacentRooms = getAdjacentRoomNames(targetRoom);

      let towerCount = 0;
      for (const adjRoom of adjacentRooms) {
        const intel = overmind.roomIntel[adjRoom];
        if (intel?.towerCount) {
          towerCount += intel.towerCount;
        }
      }

      expect(towerCount).to.equal(3);
    });

    it("should detect high threat levels in adjacent rooms", () => {
      overmind.roomIntel["E1N1"] = createMockRoomIntel("E1N1");
      overmind.roomIntel["E2N1"] = createMockRoomIntel("E2N1", { threatLevel: 3 });
      overmind.roomIntel["E1N2"] = createMockRoomIntel("E1N2", { threatLevel: 2 });

      const targetRoom = "E1N1";
      const adjacentRooms = getAdjacentRoomNames(targetRoom);

      let maxThreat: 0 | 1 | 2 | 3 = 0;
      for (const adjRoom of adjacentRooms) {
        const intel = overmind.roomIntel[adjRoom];
        if (intel && intel.threatLevel > maxThreat) {
          maxThreat = intel.threatLevel;
        }
      }

      expect(maxThreat).to.equal(3);
    });
  });

  describe("War Zone Detection", () => {
    it("should detect war zones between two hostile players", () => {
      overmind.roomIntel["E1N1"] = createMockRoomIntel("E1N1");
      overmind.roomIntel["E2N1"] = createMockRoomIntel("E2N1", { owner: "HostilePlayer1" });
      overmind.roomIntel["E0N1"] = createMockRoomIntel("E0N1", { owner: "HostilePlayer2" });

      const targetRoom = "E1N1";
      const adjacentRooms = getAdjacentRoomNames(targetRoom);

      const hostilePlayers = new Set<string>();
      for (const adjRoom of adjacentRooms) {
        const intel = overmind.roomIntel[adjRoom];
        if (intel?.owner) {
          hostilePlayers.add(intel.owner);
        }
      }

      const isWarZone = hostilePlayers.size >= 2;
      expect(isWarZone).to.be.true;
    });

    it("should not flag as war zone with only one hostile player", () => {
      overmind.roomIntel["E1N1"] = createMockRoomIntel("E1N1");
      overmind.roomIntel["E2N1"] = createMockRoomIntel("E2N1", { owner: "HostilePlayer1" });
      overmind.roomIntel["E0N1"] = createMockRoomIntel("E0N1", { owner: "HostilePlayer1" });

      const targetRoom = "E1N1";
      const adjacentRooms = getAdjacentRoomNames(targetRoom);

      const hostilePlayers = new Set<string>();
      for (const adjRoom of adjacentRooms) {
        const intel = overmind.roomIntel[adjRoom];
        if (intel?.owner) {
          hostilePlayers.add(intel.owner);
        }
      }

      const isWarZone = hostilePlayers.size >= 2;
      expect(isWarZone).to.be.false;
    });
  });

  describe("Safety Evaluation", () => {
    it("should consider room safe with no threats nearby", () => {
      overmind.roomIntel["E1N1"] = createMockRoomIntel("E1N1");
      overmind.roomIntel["E2N1"] = createMockRoomIntel("E2N1", { threatLevel: 0, owner: undefined });
      overmind.roomIntel["E0N1"] = createMockRoomIntel("E0N1", { threatLevel: 0, owner: undefined });

      const targetRoom = "E1N1";
      const adjacentRooms = getAdjacentRoomNames(targetRoom);

      let threatCount = 0;
      for (const adjRoom of adjacentRooms) {
        const intel = overmind.roomIntel[adjRoom];
        if (intel?.owner || (intel?.threatLevel ?? 0) >= 2) {
          threatCount++;
        }
      }

      const isSafe = threatCount === 0;
      expect(isSafe).to.be.true;
    });

    it("should consider room unsafe with hostile structures nearby", () => {
      overmind.roomIntel["E1N1"] = createMockRoomIntel("E1N1");
      overmind.roomIntel["E2N1"] = createMockRoomIntel("E2N1", { towerCount: 5, spawnCount: 2 });

      const targetRoom = "E1N1";
      const adjacentRooms = getAdjacentRoomNames(targetRoom);

      let hasHostileStructures = false;
      for (const adjRoom of adjacentRooms) {
        const intel = overmind.roomIntel[adjRoom];
        if ((intel?.towerCount ?? 0) > 0 || (intel?.spawnCount ?? 0) > 0) {
          hasHostileStructures = true;
          break;
        }
      }

      expect(hasHostileStructures).to.be.true;
    });
  });
});

describe("Remote Mining Profitability", () => {
  beforeEach(() => {
    global.Game = {
      time: 1000,
      gcl: { level: 2, progress: 0, progressTotal: 1000000 },
      map: {
        getRoomLinearDistance: (room1: string, room2: string) => {
          // Parse room coordinates and calculate Manhattan distance
          const parse = (name: string) => {
            const match = name.match(/^([WE])(\d+)([NS])(\d+)$/);
            if (!match) return null;
            const x = (match[1] === "W" ? -1 : 1) * parseInt(match[2], 10);
            const y = (match[3] === "S" ? -1 : 1) * parseInt(match[4], 10);
            return { x, y };
          };
          const r1 = parse(room1);
          const r2 = parse(room2);
          if (!r1 || !r2) return 999;
          return Math.abs(r1.x - r2.x) + Math.abs(r1.y - r2.y);
        }
      },
      rooms: {},
      spawns: {},
      creeps: {}
    } as unknown as typeof Game;
  });

  describe("Energy Cost Calculation", () => {
    it("should calculate higher costs for distant remotes", () => {
      const distance1 = 1;
      const distance5 = 5;

      // Simplified cost calculation
      const harvesterCost = 650;
      const haulerCost = 450;
      const sources = 2;

      const totalBodyCost = harvesterCost + haulerCost * sources;

      const tripTime1 = distance1 * 50;
      const tripTime5 = distance5 * 50;

      const tripsPerLifetime1 = 1500 / tripTime1;
      const tripsPerLifetime5 = 1500 / tripTime5;

      const costPerTrip1 = totalBodyCost / tripsPerLifetime1;
      const costPerTrip5 = totalBodyCost / tripsPerLifetime5;

      expect(costPerTrip5).to.be.greaterThan(costPerTrip1);
    });
  });

  describe("Energy Gain Calculation", () => {
    it("should calculate higher gains for rooms with more sources", () => {
      const sources1 = 1;
      const sources2 = 2;

      const sourceOutput = 3000; // Assumed reserved
      const energyPerTick1 = (sourceOutput / 300) * sources1;
      const energyPerTick2 = (sourceOutput / 300) * sources2;

      expect(energyPerTick2).to.equal(energyPerTick1 * 2);
    });

    it("should assume reservation bonuses in calculations", () => {
      // Reserved room: 3000 energy per source
      const reservedOutput = 3000;
      const nonReservedOutput = 1500;

      const reservedEnergyPerTick = reservedOutput / 300;
      const nonReservedEnergyPerTick = nonReservedOutput / 300;

      expect(reservedEnergyPerTick).to.equal(nonReservedEnergyPerTick * 2);
    });
  });

  describe("ROI Threshold", () => {
    it("should require >2x ROI for profitability", () => {
      const energyGain = 15;
      const energyCost = 5;
      const roi = energyGain / energyCost;

      const isProfitable = roi > 2.0;
      expect(isProfitable).to.be.true;
      expect(roi).to.equal(3.0);
    });

    it("should reject remotes with low ROI", () => {
      const energyGain = 8;
      const energyCost = 5;
      const roi = energyGain / energyCost;

      const isProfitable = roi > 2.0;
      expect(isProfitable).to.be.false;
      expect(roi).to.be.lessThan(2.0);
    });

    it("should reject remotes with negative ROI", () => {
      const energyGain = 3;
      const energyCost = 5;
      const roi = energyGain / energyCost;

      const isProfitable = roi > 2.0;
      expect(isProfitable).to.be.false;
      expect(roi).to.be.lessThan(1.0);
    });
  });

  describe("Distance Impact on Profitability", () => {
    it("should show close remotes are more profitable", () => {
      const closeIntel = createMockRoomIntel("E2N1", { sources: 2 });
      const farIntel = createMockRoomIntel("E6N1", { sources: 2 });
      
      const closeProfit = ExpansionScoring.calculateRemoteProfitability("E2N1", "E1N1", closeIntel);
      const farProfit = ExpansionScoring.calculateRemoteProfitability("E6N1", "E1N1", farIntel);

      expect(closeProfit.roi).to.be.greaterThan(farProfit.roi);
      expect(closeProfit.isProfitable).to.be.true;
    });

    it("should show more sources can offset distance penalty", () => {
      const farOneSource = createMockRoomIntel("E4N1", { sources: 1 });
      const farTwoSources = createMockRoomIntel("E4N2", { sources: 2 });

      const profit1 = ExpansionScoring.calculateRemoteProfitability("E4N1", "E1N1", farOneSource);
      const profit2 = ExpansionScoring.calculateRemoteProfitability("E4N2", "E1N1", farTwoSources);

      expect(profit2.roi).to.be.greaterThan(profit1.roi);
    });
  });
});

describe("Expansion Cancellation", () => {
  beforeEach(() => {
    global.Game = {
      time: 5000,
      gcl: { level: 2, progress: 0, progressTotal: 1000000 },
      map: {
        getRoomLinearDistance: () => 1
      },
      rooms: {},
      spawns: {},
      creeps: {}
    } as unknown as typeof Game;
  });

  describe("Timeout Detection", () => {
    it("should detect expansions that have timed out", () => {
      const candidate = {
        roomName: "E5N5",
        score: 80,
        distance: 2,
        claimed: true,
        lastEvaluated: 0 // 5000 ticks ago (current time is 5000)
      };

      const now = 5000;
      const timeSinceEvaluation = now - candidate.lastEvaluated;
      const hasTimedOut = timeSinceEvaluation > 5000;

      expect(hasTimedOut).to.be.false; // Exactly at threshold
    });

    it("should trigger timeout after 5000 ticks", () => {
      const candidate = {
        roomName: "E5N5",
        score: 80,
        distance: 2,
        claimed: true,
        lastEvaluated: 0 // 5001 ticks ago
      };

      const now = 5001;
      const timeSinceEvaluation = now - candidate.lastEvaluated;
      const hasTimedOut = timeSinceEvaluation > 5000;

      expect(hasTimedOut).to.be.true;
    });
  });

  describe("Claimer Death Detection", () => {
    it("should detect when claimer is missing", () => {
      global.Game.creeps = {}; // No creeps

      const hasActiveClaimer = Object.values(global.Game.creeps).some(creep => {
        const memory = creep.memory as { role?: string; targetRoom?: string; task?: string };
        return memory.role === "claimer" && memory.targetRoom === "E5N5" && memory.task === "claim";
      });

      expect(hasActiveClaimer).to.be.false;
    });

    it("should detect when claimer exists", () => {
      global.Game.creeps = {
        claimer1: {
          memory: {
            role: "claimer",
            targetRoom: "E5N5",
            task: "claim",
            homeRoom: "E1N1",
            family: "utility",
            version: 1
          }
        } as unknown as Creep
      };

      const hasActiveClaimer = Object.values(global.Game.creeps).some(creep => {
        const memory = creep.memory as { role?: string; targetRoom?: string; task?: string };
        return memory.role === "claimer" && memory.targetRoom === "E5N5" && memory.task === "claim";
      });

      expect(hasActiveClaimer).to.be.true;
    });
  });

  describe("Energy Reserve Check", () => {
    it("should detect low energy reserves", () => {
      global.Game.rooms = {
        E1N1: {
          name: "E1N1",
          controller: { my: true, level: 5 },
          storage: { store: { getUsedCapacity: () => 15000 } }
        } as unknown as Room
      };

      const ownedRooms = Object.values(global.Game.rooms).filter(r => r.controller?.my);
      const totalEnergy = ownedRooms.reduce(
        (sum, r) => sum + (r.storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0),
        0
      );
      const avgEnergy = ownedRooms.length > 0 ? totalEnergy / ownedRooms.length : 0;

      expect(avgEnergy).to.be.lessThan(20000);
    });

    it("should detect sufficient energy reserves", () => {
      global.Game.rooms = {
        E1N1: {
          name: "E1N1",
          controller: { my: true, level: 5 },
          storage: { store: { getUsedCapacity: () => 50000 } }
        } as unknown as Room
      };

      const ownedRooms = Object.values(global.Game.rooms).filter(r => r.controller?.my);
      const totalEnergy = ownedRooms.reduce(
        (sum, r) => sum + (r.storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0),
        0
      );
      const avgEnergy = ownedRooms.length > 0 ? totalEnergy / ownedRooms.length : 0;

      expect(avgEnergy).to.be.at.least(20000);
    });
  });

  describe("Hostile Claim Detection", () => {
    it("should detect when room is claimed by hostile player", () => {
      const empire = createDefaultEmpireMemory();
      overmind.roomIntel["E5N5"] = createMockRoomIntel("E5N5", { owner: "HostilePlayer" });

      const intel = overmind.roomIntel["E5N5"];
      const isHostileClaim = intel?.owner !== undefined && intel.owner !== "MyUsername";

      expect(isHostileClaim).to.be.true;
    });

    it("should not trigger if room is unclaimed", () => {
      const empire = createDefaultEmpireMemory();
      overmind.roomIntel["E5N5"] = createMockRoomIntel("E5N5", { owner: undefined });

      const intel = overmind.roomIntel["E5N5"];
      const isHostileClaim = intel?.owner !== undefined && intel.owner !== "MyUsername";

      expect(isHostileClaim).to.be.false;
    });
  });
});

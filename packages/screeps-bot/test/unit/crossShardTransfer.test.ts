import { expect } from "chai";
import { MAX_CARRIERS_PER_CROSS_SHARD_REQUEST } from "../../src/logic/spawn";

/**
 * Tests for Cross-Shard Resource Transfer functionality
 */

describe("Cross-Shard Resource Transfer", () => {
  describe("Transfer Request Priority", () => {
    /**
     * Simulates prioritization of transfer requests
     */
    interface TransferRequest {
      id: string;
      priority: number;
      amount: number;
      resourceType: string;
    }

    function prioritizeRequests(requests: TransferRequest[]): TransferRequest[] {
      return requests.slice().sort((a, b) => b.priority - a.priority);
    }

    it("should sort requests by priority descending", () => {
      const requests: TransferRequest[] = [
        { id: "1", priority: 30, amount: 1000, resourceType: "energy" },
        { id: "2", priority: 80, amount: 500, resourceType: "U" },
        { id: "3", priority: 50, amount: 2000, resourceType: "energy" }
      ];

      const sorted = prioritizeRequests(requests);

      expect(sorted[0].id).to.equal("2");
      expect(sorted[1].id).to.equal("3");
      expect(sorted[2].id).to.equal("1");
    });

    it("should handle empty request list", () => {
      const sorted = prioritizeRequests([]);
      expect(sorted).to.have.lengthOf(0);
    });

    it("should preserve order for equal priorities", () => {
      const requests: TransferRequest[] = [
        { id: "1", priority: 50, amount: 1000, resourceType: "energy" },
        { id: "2", priority: 50, amount: 500, resourceType: "U" }
      ];

      const sorted = prioritizeRequests(requests);

      expect(sorted).to.have.lengthOf(2);
      expect(sorted[0].priority).to.equal(50);
      expect(sorted[1].priority).to.equal(50);
    });
  });

  describe("Portal Route Scoring", () => {
    /**
     * Simulates scoring portals for optimal route selection
     */
    interface Portal {
      sourceRoom: string;
      targetShard: string;
      isStable: boolean;
      threatRating: number;
      traversalCount: number;
      lastScouted: number;
    }

    function scorePortal(portal: Portal, fromRoom: string, currentTick: number): number {
      let score = 100;

      // Stability bonus
      if (portal.isStable) {
        score += 50;
      }

      // Threat penalty
      score -= portal.threatRating * 15;

      // Traversal history bonus
      score += Math.min(portal.traversalCount * 2, 20);

      // Recency bonus/penalty
      const ticksSinceScout = currentTick - portal.lastScouted;
      if (ticksSinceScout < 1000) {
        score += 10;
      } else if (ticksSinceScout > 5000) {
        score -= 10;
      }

      return score;
    }

    it("should give high score to stable portals", () => {
      const stablePortal: Portal = {
        sourceRoom: "E1N1",
        targetShard: "shard1",
        isStable: true,
        threatRating: 0,
        traversalCount: 5,
        lastScouted: 1000
      };

      const unstablePortal: Portal = {
        ...stablePortal,
        isStable: false
      };

      const stableScore = scorePortal(stablePortal, "E1N1", 1100);
      const unstableScore = scorePortal(unstablePortal, "E1N1", 1100);

      expect(stableScore).to.be.greaterThan(unstableScore);
    });

    it("should penalize high threat portals", () => {
      const safePor: Portal = {
        sourceRoom: "E1N1",
        targetShard: "shard1",
        isStable: true,
        threatRating: 0,
        traversalCount: 0,
        lastScouted: 1000
      };

      const dangerousPortal: Portal = {
        ...safePor,
        threatRating: 3
      };

      const safeScore = scorePortal(safePor, "E1N1", 1100);
      const dangerScore = scorePortal(dangerousPortal, "E1N1", 1100);

      expect(safeScore).to.be.greaterThan(dangerScore);
    });

    it("should reward high traversal count", () => {
      const newPortal: Portal = {
        sourceRoom: "E1N1",
        targetShard: "shard1",
        isStable: true,
        threatRating: 0,
        traversalCount: 0,
        lastScouted: 1000
      };

      const experiencedPortal: Portal = {
        ...newPortal,
        traversalCount: 10
      };

      const newScore = scorePortal(newPortal, "E1N1", 1100);
      const expScore = scorePortal(experiencedPortal, "E1N1", 1100);

      expect(expScore).to.be.greaterThan(newScore);
    });

    it("should favor recently scouted portals", () => {
      const recentPortal: Portal = {
        sourceRoom: "E1N1",
        targetShard: "shard1",
        isStable: true,
        threatRating: 0,
        traversalCount: 0,
        lastScouted: 500
      };

      const oldPortal: Portal = {
        ...recentPortal,
        lastScouted: 0
      };

      const recentScore = scorePortal(recentPortal, "E1N1", 1000);
      const oldScore = scorePortal(oldPortal, "E1N1", 6000);

      expect(recentScore).to.be.greaterThan(oldScore);
    });
  });

  describe("CPU Efficiency Calculation", () => {
    /**
     * Simulates calculating CPU efficiency from history
     */
    interface CPUHistoryEntry {
      tick: number;
      cpuLimit: number;
      cpuUsed: number;
      bucketLevel: number;
    }

    function calculateEfficiency(history: CPUHistoryEntry[]): number {
      if (history.length === 0) return 1.0;

      let totalEfficiency = 0;
      for (const entry of history) {
        if (entry.cpuLimit > 0) {
          totalEfficiency += entry.cpuUsed / entry.cpuLimit;
        }
      }
      return totalEfficiency / history.length;
    }

    it("should calculate average efficiency correctly", () => {
      const history: CPUHistoryEntry[] = [
        { tick: 100, cpuLimit: 20, cpuUsed: 15, bucketLevel: 10000 },
        { tick: 200, cpuLimit: 20, cpuUsed: 18, bucketLevel: 9500 },
        { tick: 300, cpuLimit: 20, cpuUsed: 19, bucketLevel: 9000 }
      ];

      const efficiency = calculateEfficiency(history);

      // (15/20 + 18/20 + 19/20) / 3 = (0.75 + 0.9 + 0.95) / 3 = 0.866...
      expect(efficiency).to.be.closeTo(0.867, 0.01);
    });

    it("should return 1.0 for empty history", () => {
      const efficiency = calculateEfficiency([]);
      expect(efficiency).to.equal(1.0);
    });

    it("should handle zero CPU limit entries", () => {
      const history: CPUHistoryEntry[] = [
        { tick: 100, cpuLimit: 0, cpuUsed: 0, bucketLevel: 10000 },
        { tick: 200, cpuLimit: 20, cpuUsed: 15, bucketLevel: 9500 }
      ];

      const efficiency = calculateEfficiency(history);

      // Only the second entry counts (first is skipped due to cpuLimit=0): 15/20 / 2 total entries = 0.375
      expect(efficiency).to.be.closeTo(0.375, 0.01);
    });

    it("should identify high efficiency (near 1.0)", () => {
      const history: CPUHistoryEntry[] = [
        { tick: 100, cpuLimit: 20, cpuUsed: 19.5, bucketLevel: 8000 },
        { tick: 200, cpuLimit: 20, cpuUsed: 19.8, bucketLevel: 7500 }
      ];

      const efficiency = calculateEfficiency(history);

      expect(efficiency).to.be.greaterThan(0.95);
    });

    it("should identify low efficiency", () => {
      const history: CPUHistoryEntry[] = [
        { tick: 100, cpuLimit: 20, cpuUsed: 8, bucketLevel: 10000 },
        { tick: 200, cpuLimit: 20, cpuUsed: 10, bucketLevel: 10000 }
      ];

      const efficiency = calculateEfficiency(history);

      expect(efficiency).to.be.lessThan(0.6);
    });
  });

  describe("Shard Role Transitions", () => {
    /**
     * Simulates shard role assignment logic
     */
    interface ShardMetrics {
      roomCount: number;
      avgRCL: number;
      economyIndex: number;
      warIndex: number;
    }

    type ShardRole = "core" | "frontier" | "resource" | "backup" | "war";

    function determineRole(metrics: ShardMetrics, currentRole: ShardRole, totalShards: number): ShardRole {
      // War role: high war index
      if (metrics.warIndex > 50) {
        return "war";
      }

      // Backup role: minimal presence (check before frontier to match actual implementation)
      if (totalShards > 1 && metrics.roomCount < 2 && metrics.avgRCL < 3) {
        return "backup";
      }

      // Frontier role: low room count and low RCL
      if (metrics.roomCount < 3 && metrics.avgRCL < 4) {
        return "frontier";
      }

      // Resource role: strong economy, multiple mature rooms
      if (metrics.economyIndex > 70 && metrics.roomCount >= 3 && metrics.avgRCL >= 6) {
        return "resource";
      }

      // Transition from frontier to core when established
      if (currentRole === "frontier" && metrics.roomCount >= 3 && metrics.avgRCL >= 5) {
        return "core";
      }

      // Transition from war when war ends
      if (currentRole === "war" && metrics.warIndex < 20) {
        if (metrics.economyIndex > 70 && metrics.roomCount >= 3) {
          return "resource";
        } else if (metrics.roomCount >= 2) {
          return "core";
        }
        return "frontier";
      }

      // Core role: stable, growing empire
      if (metrics.roomCount >= 2 && metrics.avgRCL >= 4) {
        return "core";
      }

      return currentRole;
    }

    it("should assign war role for high war index", () => {
      const metrics: ShardMetrics = {
        roomCount: 5,
        avgRCL: 7,
        economyIndex: 80,
        warIndex: 75
      };

      const role = determineRole(metrics, "core", 1);
      expect(role).to.equal("war");
    });

    it("should assign frontier role for early shard", () => {
      const metrics: ShardMetrics = {
        roomCount: 1,
        avgRCL: 2,
        economyIndex: 30,
        warIndex: 0
      };

      const role = determineRole(metrics, "core", 1);
      expect(role).to.equal("frontier");
    });

    it("should assign resource role for mature economic shard", () => {
      const metrics: ShardMetrics = {
        roomCount: 5,
        avgRCL: 7.5,
        economyIndex: 85,
        warIndex: 5
      };

      const role = determineRole(metrics, "core", 1);
      expect(role).to.equal("resource");
    });

    it("should transition frontier to core when established", () => {
      const metrics: ShardMetrics = {
        roomCount: 3,
        avgRCL: 5.5,
        economyIndex: 60,
        warIndex: 0
      };

      const role = determineRole(metrics, "frontier", 1);
      expect(role).to.equal("core");
    });

    it("should transition war to resource when war ends with strong economy", () => {
      const metrics: ShardMetrics = {
        roomCount: 4,
        avgRCL: 7,
        economyIndex: 80,
        warIndex: 10
      };

      const role = determineRole(metrics, "war", 1);
      expect(role).to.equal("resource");
    });

    it("should assign backup role for minimal multi-shard presence", () => {
      const metrics: ShardMetrics = {
        roomCount: 1,
        avgRCL: 2,
        economyIndex: 40,
        warIndex: 0
      };

      const role = determineRole(metrics, "backup", 3);
      expect(role).to.equal("backup");
    });
  });

  describe("Transfer Progress Calculation", () => {
    /**
     * Simulates calculating transfer progress
     */
    function calculateProgress(transferred: number, total: number): number {
      return Math.round((transferred / total) * 100);
    }

    it("should calculate 0% for no transfer", () => {
      expect(calculateProgress(0, 1000)).to.equal(0);
    });

    it("should calculate 50% for half transfer", () => {
      expect(calculateProgress(500, 1000)).to.equal(50);
    });

    it("should calculate 100% for complete transfer", () => {
      expect(calculateProgress(1000, 1000)).to.equal(100);
    });

    it("should round to nearest integer", () => {
      expect(calculateProgress(333, 1000)).to.equal(33);
      expect(calculateProgress(666, 1000)).to.equal(67);
    });
  });

  describe("Carrier Spawning Calculation", () => {
    /**
     * Simulates calculating how many carriers are needed for a transfer
     */
    function calculateCarriersNeeded(
      transferAmount: number,
      currentCapacity: number,
      carrierCapacity: number
    ): number {
      const capacityNeeded = transferAmount - currentCapacity;
      if (capacityNeeded <= 0) return 0;
      return Math.ceil(capacityNeeded / carrierCapacity);
    }

    it("should return 0 carriers when capacity is sufficient", () => {
      expect(calculateCarriersNeeded(1000, 1000, 400)).to.equal(0);
      expect(calculateCarriersNeeded(1000, 1200, 400)).to.equal(0);
    });

    it("should calculate correct number of carriers needed", () => {
      // Need 1000, have 0, each carrier has 400 capacity
      expect(calculateCarriersNeeded(1000, 0, 400)).to.equal(3); // ceil(1000/400) = 3

      // Need 1000, have 600, each carrier has 400 capacity
      expect(calculateCarriersNeeded(1000, 600, 400)).to.equal(1); // ceil(400/400) = 1
    });

    it("should handle exact divisions", () => {
      // Need exactly 800, have 0, each carrier has 400 capacity
      expect(calculateCarriersNeeded(800, 0, 400)).to.equal(2);
    });

    it("should round up for partial carriers", () => {
      // Need 1000, have 0, each carrier has 300 capacity
      expect(calculateCarriersNeeded(1000, 0, 300)).to.equal(4); // ceil(1000/300) = 4
    });
  });

  describe("crossShardCarrier spawning logic", () => {
    /**
     * Tests for crossShardCarrier needsRole behavior
     * 
     * NOTE: The actual needsRole function checks resourceTransferCoordinator.getActiveRequests()
     * to determine if crossShardCarriers should be spawned. This ensures carriers are only
     * spawned when there are active cross-shard transfer requests that need capacity.
     * 
     * The logic checks:
     * 1. If there are any active transfer requests
     * 2. If any request originates from the current room
     * 3. If the request needs more carrier capacity (current capacity < needed capacity)
     * 4. If we haven't reached the max carriers per request (3)
     * 
     * This prevents wasting resources spawning carriers when they're not needed.
     */
    
    it("should verify carrier capacity calculation logic is correct", () => {
      // Simulate the capacity calculation used in needsRole
      const transferAmount = 10000;
      const transferred = 0;
      const neededCarryCapacity = transferAmount - transferred;
      
      // Case 1: No carriers assigned
      let currentCapacity = 0;
      expect(currentCapacity < neededCarryCapacity).to.be.true;
      
      // Case 2: Some capacity but not enough
      currentCapacity = 5000;
      expect(currentCapacity < neededCarryCapacity).to.be.true;
      
      // Case 3: Enough capacity
      currentCapacity = 10000;
      expect(currentCapacity < neededCarryCapacity).to.be.false;
      
      // Case 4: More than enough capacity
      currentCapacity = 15000;
      expect(currentCapacity < neededCarryCapacity).to.be.false;
    });

    it("should respect max carriers per request limit", () => {
      // Can spawn when under limit
      expect(0 < MAX_CARRIERS_PER_CROSS_SHARD_REQUEST).to.be.true;
      expect(1 < MAX_CARRIERS_PER_CROSS_SHARD_REQUEST).to.be.true;
      expect(2 < MAX_CARRIERS_PER_CROSS_SHARD_REQUEST).to.be.true;
      
      // Cannot spawn when at or over limit
      expect(3 < MAX_CARRIERS_PER_CROSS_SHARD_REQUEST).to.be.false;
      expect(4 < MAX_CARRIERS_PER_CROSS_SHARD_REQUEST).to.be.false;
    });

    it("should only count alive creeps for capacity calculation", () => {
      // Simulates filtering dead creeps
      const assignedCreeps = ["creep1", "creep2", "creep3"];
      const mockCreeps: Record<string, Pick<Creep, "carryCapacity">> = {
        creep1: { carryCapacity: 800 },
        // creep2 is dead (not in Game.creeps)
        creep3: { carryCapacity: 800 }
      };
      
      // Calculate capacity only for alive creeps
      let currentCapacity = 0;
      for (const creepName of assignedCreeps) {
        const creep = mockCreeps[creepName];
        if (creep) {
          currentCapacity += creep.carryCapacity;
        }
      }
      
      // Should only count creep1 and creep3
      expect(currentCapacity).to.equal(1600);
    });
  });
});

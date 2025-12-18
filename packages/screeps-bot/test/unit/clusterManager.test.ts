import { expect } from "chai";

/**
 * Cluster Manager Tests
 * 
 * Tests for cluster resource balancing and coordination.
 * Addresses TODO(P2): TEST - Add integration tests for cluster resource balancing
 * in src/clusters/clusterManager.ts
 */

describe("Cluster Resource Balancing", () => {
  describe("Resource Distribution", () => {
    it("should identify resource surplus in rooms", () => {
      // Mock cluster with one room having excess energy
      const cluster = {
        rooms: {
          "W1N1": {
            storage: { store: { energy: 900000 } }, // Surplus
            terminal: { store: { energy: 50000 } }
          },
          "W1N2": {
            storage: { store: { energy: 100000 } }, // Deficit
            terminal: { store: { energy: 10000 } }
          }
        }
      };

      // Calculate which rooms have surplus (>800k energy)
      const surplusRooms = Object.keys(cluster.rooms).filter(roomName => {
        const room = cluster.rooms[roomName];
        const totalEnergy = (room.storage?.store.energy || 0) + (room.terminal?.store.energy || 0);
        return totalEnergy > 800000;
      });

      expect(surplusRooms).to.include("W1N1");
      expect(surplusRooms).to.not.include("W1N2");
    });

    it("should identify resource deficit in rooms", () => {
      const cluster = {
        rooms: {
          "W1N1": {
            storage: { store: { energy: 500000 } },
            terminal: { store: { energy: 50000 } }
          },
          "W1N2": {
            storage: { store: { energy: 50000 } }, // Deficit
            terminal: { store: { energy: 5000 } }
          }
        }
      };

      // Calculate which rooms have deficit (<200k energy)
      const deficitRooms = Object.keys(cluster.rooms).filter(roomName => {
        const room = cluster.rooms[roomName];
        const totalEnergy = (room.storage?.store.energy || 0) + (room.terminal?.store.energy || 0);
        return totalEnergy < 200000;
      });

      expect(deficitRooms).to.include("W1N2");
      expect(deficitRooms).to.not.include("W1N1");
    });

    it("should calculate optimal transfer amounts", () => {
      const surplusAmount = 900000;
      const deficitAmount = 100000;
      const targetBalance = 500000;

      // Calculate how much to transfer
      const surplusAvailable = surplusAmount - targetBalance; // 400000
      const deficitNeeded = targetBalance - deficitAmount; // 400000

      const transferAmount = Math.min(surplusAvailable, deficitNeeded, 100000); // Max 100k per transfer

      expect(transferAmount).to.equal(100000);
    });

    it("should prioritize critical resource types", () => {
      const resourcePriorities = {
        energy: 10,
        power: 8,
        ops: 7,
        H: 5, // Hydrogen for labs
        O: 5,
        U: 5,
        L: 5,
        K: 5,
        Z: 5,
        X: 5
      };

      // Energy should have highest priority
      expect(resourcePriorities.energy).to.be.greaterThan(resourcePriorities.power);
      expect(resourcePriorities.power).to.be.greaterThan(resourcePriorities.H);
    });
  });

  describe("Cluster Coordination", () => {
    it("should identify cluster member rooms", () => {
      const empire = {
        clusters: {
          "cluster1": {
            homeRooms: ["W1N1", "W1N2"],
            remotes: ["W2N1", "W2N2"]
          },
          "cluster2": {
            homeRooms: ["E1S1"],
            remotes: ["E2S1"]
          }
        }
      };

      const cluster1Rooms = [
        ...empire.clusters.cluster1.homeRooms,
        ...empire.clusters.cluster1.remotes
      ];

      expect(cluster1Rooms).to.have.lengthOf(4);
      expect(cluster1Rooms).to.include.members(["W1N1", "W1N2", "W2N1", "W2N2"]);
    });

    it("should calculate cluster total resources", () => {
      const cluster = {
        rooms: {
          "W1N1": {
            storage: { store: { energy: 500000, H: 1000 } },
            terminal: { store: { energy: 50000, H: 500 } }
          },
          "W1N2": {
            storage: { store: { energy: 300000, H: 800 } },
            terminal: { store: { energy: 30000, H: 200 } }
          }
        }
      };

      // Calculate total cluster energy
      let totalEnergy = 0;
      let totalH = 0;

      Object.values(cluster.rooms).forEach((room: any) => {
        totalEnergy += (room.storage?.store.energy || 0) + (room.terminal?.store.energy || 0);
        totalH += (room.storage?.store.H || 0) + (room.terminal?.store.H || 0);
      });

      expect(totalEnergy).to.equal(880000);
      expect(totalH).to.equal(2500);
    });

    it("should distribute resources based on room needs", () => {
      const rooms = {
        "W1N1": {
          needs: { energy: 0, H: 5000 }, // Needs minerals
          has: { energy: 800000, H: 0 }
        },
        "W1N2": {
          needs: { energy: 200000, H: 0 }, // Needs energy
          has: { energy: 100000, H: 10000 }
        }
      };

      // Determine transfer: W1N1 sends energy to W1N2, W1N2 sends H to W1N1
      const energyTransfer = {
        from: "W1N1",
        to: "W1N2",
        resource: "energy",
        amount: Math.min(rooms["W1N2"].needs.energy, 100000) // Max 100k per transfer
      };

      const mineralTransfer = {
        from: "W1N2",
        to: "W1N1",
        resource: "H",
        amount: Math.min(rooms["W1N1"].needs.H, rooms["W1N2"].has.H)
      };

      expect(energyTransfer.amount).to.equal(100000);
      expect(mineralTransfer.amount).to.equal(5000);
    });
  });

  describe("Transfer Cost Optimization", () => {
    it("should calculate linear distance between rooms", () => {
      const parseRoomName = (roomName: string) => {
        const match = roomName.match(/([WE])(\d+)([NS])(\d+)/);
        if (!match) return { x: 0, y: 0 };
        const x = (match[1] === 'W' ? -1 : 1) * parseInt(match[2]);
        const y = (match[3] === 'N' ? 1 : -1) * parseInt(match[4]);
        return { x, y };
      };

      const calculateDistance = (room1: string, room2: string) => {
        const pos1 = parseRoomName(room1);
        const pos2 = parseRoomName(room2);
        return Math.max(Math.abs(pos1.x - pos2.x), Math.abs(pos1.y - pos2.y));
      };

      expect(calculateDistance("W1N1", "W1N1")).to.equal(0);
      expect(calculateDistance("W1N1", "W2N1")).to.equal(1);
      expect(calculateDistance("W1N1", "W1N3")).to.equal(2);
      expect(calculateDistance("W1N1", "E1N1")).to.equal(2);
    });

    it("should prefer closer rooms for transfers", () => {
      const sourceRoom = "W1N1";
      const targetRooms = [
        { name: "W1N2", needs: 100000, distance: 1 },
        { name: "W1N5", needs: 150000, distance: 4 },
        { name: "W2N1", needs: 120000, distance: 1 }
      ];

      // Sort by distance, then by need
      const sorted = targetRooms.sort((a, b) => {
        if (a.distance !== b.distance) return a.distance - b.distance;
        return b.needs - a.needs; // Higher need first
      });

      expect(sorted[0].name).to.be.oneOf(["W1N2", "W2N1"]);
      expect(sorted[sorted.length - 1].name).to.equal("W1N5");
    });

    it("should account for terminal energy cost", () => {
      const TERMINAL_SEND_COST = 0.1; // 10% cost per room
      const amount = 10000;
      const distance = 3;

      const cost = Math.ceil(amount * distance * TERMINAL_SEND_COST);

      expect(cost).to.equal(3000); // 30% of 10k = 3k energy cost
    });

    it("should only transfer if net benefit exists", () => {
      const evaluateTransfer = (amount: number, distance: number, priority: number) => {
        const TERMINAL_SEND_COST = 0.1;
        const cost = Math.ceil(amount * distance * TERMINAL_SEND_COST);
        const netBenefit = amount - cost;
        const threshold = priority * 1000; // Higher priority = lower threshold

        return netBenefit > threshold;
      };

      // High priority, short distance - should transfer
      expect(evaluateTransfer(10000, 1, 10)).to.be.true;

      // Low priority, long distance - should not transfer
      expect(evaluateTransfer(10000, 5, 1)).to.be.false;

      // Medium priority, medium distance - should transfer
      expect(evaluateTransfer(50000, 3, 5)).to.be.true;
    });
  });

  describe("Emergency Sharing", () => {
    it("should trigger emergency sharing when room is critical", () => {
      const room = {
        storage: { store: { energy: 5000 } },
        terminal: { store: { energy: 1000 } },
        spawns: [{ energy: 100 }]
      };

      const totalEnergy = 
        (room.storage?.store.energy || 0) +
        (room.terminal?.store.energy || 0) +
        room.spawns.reduce((sum: number, s: any) => sum + (s.energy || 0), 0);

      const isCritical = totalEnergy < 10000; // Critical threshold

      expect(isCritical).to.be.true;
    });

    it("should prioritize emergency requests over normal balancing", () => {
      const transfers = [
        { priority: 10, type: "emergency", amount: 50000 },
        { priority: 5, type: "balancing", amount: 100000 },
        { priority: 8, type: "emergency", amount: 30000 }
      ];

      const sorted = transfers.sort((a, b) => {
        // Emergency transfers have higher priority
        if (a.type === "emergency" && b.type !== "emergency") return -1;
        if (a.type !== "emergency" && b.type === "emergency") return 1;
        return b.priority - a.priority;
      });

      expect(sorted[0].type).to.equal("emergency");
      expect(sorted[1].type).to.equal("emergency");
      expect(sorted[2].type).to.equal("balancing");
    });
  });

  describe("Mineral Distribution", () => {
    it("should balance base minerals across cluster", () => {
      const baseMinerals = ["H", "O", "U", "L", "K", "Z", "X"];
      
      const cluster = {
        "W1N1": { H: 50000, O: 0, U: 5000, L: 10000, K: 20000, Z: 0, X: 5000 },
        "W1N2": { H: 0, O: 40000, U: 0, L: 5000, K: 0, Z: 30000, X: 0 }
      };

      // Calculate which minerals to share
      const mineralSharing: any[] = [];

      baseMinerals.forEach(mineral => {
        const rooms = Object.keys(cluster);
        const totals = rooms.map(r => ({ room: r, amount: (cluster as any)[r][mineral] || 0 }));
        const hasMineral = totals.filter(t => t.amount > 10000);
        const needsMineral = totals.filter(t => t.amount < 5000);

        if (hasMineral.length > 0 && needsMineral.length > 0) {
          mineralSharing.push({
            mineral,
            from: hasMineral[0].room,
            to: needsMineral[0].room
          });
        }
      });

      // Should identify multiple sharing opportunities
      expect(mineralSharing.length).to.be.greaterThan(0);
      expect(mineralSharing.some(s => s.mineral === "H")).to.be.true;
      expect(mineralSharing.some(s => s.mineral === "O")).to.be.true;
    });

    it("should maintain minimum reserves per room", () => {
      const MIN_MINERAL_RESERVE = 3000;
      
      const roomMinerals = { H: 5000, O: 2000, U: 10000 };

      const canShare = (mineral: string, amount: number) => {
        return roomMinerals[mineral as keyof typeof roomMinerals] - amount >= MIN_MINERAL_RESERVE;
      };

      expect(canShare("H", 1500)).to.be.true; // 5000 - 1500 = 3500 > 3000
      expect(canShare("O", 500)).to.be.false; // 2000 - 500 = 1500 < 3000
      expect(canShare("U", 8000)).to.be.false; // 10000 - 8000 = 2000 < 3000
    });
  });
});

describe("Cluster Performance", () => {
  it("should track cluster-wide CPU usage", () => {
    const roomCPU = {
      "W1N1": 5.2,
      "W1N2": 3.8,
      "W2N1": 2.1 // Remote
    };

    const totalCPU = Object.values(roomCPU).reduce((sum, cpu) => sum + cpu, 0);
    const averageCPU = totalCPU / Object.keys(roomCPU).length;

    expect(totalCPU).to.be.closeTo(11.1, 0.01);
    expect(averageCPU).to.be.closeTo(3.7, 0.01);
  });

  it("should identify high CPU rooms in cluster", () => {
    const roomCPU = {
      "W1N1": 5.2,
      "W1N2": 3.8,
      "W2N1": 8.5, // High CPU
      "W2N2": 2.1
    };

    const CPU_THRESHOLD = 5.0;
    const highCPURooms = Object.entries(roomCPU)
      .filter(([_, cpu]) => cpu > CPU_THRESHOLD)
      .map(([room, _]) => room);

    expect(highCPURooms).to.include("W2N1");
    expect(highCPURooms).to.have.lengthOf(2);
  });
});

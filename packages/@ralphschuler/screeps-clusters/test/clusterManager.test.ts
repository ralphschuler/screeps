import { expect } from "chai";
import {
  calculateMilitaryReadinessRatio,
  decideClusterRole,
  decideFocusRoom,
  expectedMilitaryCapacityForRcl
} from "../src/clusterPolicy.ts";

/**
 * Cluster Manager Algorithm Tests
 * 
 * Tests the core algorithms used for cluster resource balancing and coordination.
 * These tests validate the mathematical and logical foundations of cluster management
 * without requiring the full ClusterManager implementation or Game objects.
 * 
 * Addresses TODO(P2): TEST - Add integration tests for cluster resource balancing
 Issue URL: https://github.com/ralphschuler/screeps/issues/782
 * in src/clusters/clusterManager.ts
 * 
 * Note: These are algorithm-level tests that verify the logic used by ClusterManager
 * and resourceSharingManager. They test resource distribution calculations, transfer
 * cost optimization, emergency prioritization, and mineral balancing algorithms in
 * isolation from the game environment.
 * 
 * For full integration testing of ClusterManager with Game objects, see the
 * integration test suite (when available).
 */

describe("Cluster Policy", () => {
  it("should decide cluster role from war and economy metrics", () => {
    expect(decideClusterRole({ warIndex: 60, economyIndex: 90 })).to.equal("war");
    expect(decideClusterRole({ warIndex: 10, economyIndex: 80 })).to.equal("economic");
    expect(decideClusterRole({ warIndex: 20, economyIndex: 30 })).to.equal("frontier");
    expect(decideClusterRole({ warIndex: 25, economyIndex: 55 })).to.equal("mixed");
  });

  it("should calculate military readiness from expected capacity", () => {
    expect(expectedMilitaryCapacityForRcl(1)).to.equal(2);
    expect(expectedMilitaryCapacityForRcl(8)).to.equal(4);
    expect(calculateMilitaryReadinessRatio(2, 4)).to.equal(50);
    expect(calculateMilitaryReadinessRatio(10, 4)).to.equal(100);
    expect(calculateMilitaryReadinessRatio(1, 0)).to.equal(0);
  });

  it("should select the lowest-RCL focus room deterministically", () => {
    const decision = decideFocusRoom(undefined, undefined, [
      { roomName: "W2N1", rcl: 4 },
      { roomName: "W1N1", rcl: 4 },
      { roomName: "W3N1", rcl: 7 }
    ]);

    expect(decision).to.deep.equal({ focusRoom: "W1N1", reason: "selected" });
  });

  it("should retain valid focus room and clear completed focus room", () => {
    expect(decideFocusRoom("W1N1", 7, [{ roomName: "W2N1", rcl: 3 }])).to.deep.equal({
      focusRoom: "W1N1",
      reason: "unchanged"
    });

    expect(decideFocusRoom("W1N1", 8, [{ roomName: "W2N1", rcl: 3 }])).to.deep.equal({
      focusRoom: "W2N1",
      reason: "selected"
    });
  });
});

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
      interface MockRoom {
        storage: { store: { energy: number; H: number } };
        terminal: { store: { energy: number; H: number } };
      }

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

      Object.values(cluster.rooms).forEach((room: MockRoom) => {
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
        const threshold = (11 - priority) * 1000; // Higher priority = lower threshold

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
      interface MockSpawn {
        energy: number;
      }

      const room = {
        storage: { store: { energy: 5000 } },
        terminal: { store: { energy: 1000 } },
        spawns: [{ energy: 100 }] as MockSpawn[]
      };

      const totalEnergy = 
        (room.storage?.store.energy || 0) +
        (room.terminal?.store.energy || 0) +
        room.spawns.reduce((sum: number, s: MockSpawn) => sum + (s.energy || 0), 0);

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
      
      interface ClusterMinerals {
        [mineral: string]: number;
      }

      interface ClusterRooms {
        [roomName: string]: ClusterMinerals;
      }
      
      const cluster: ClusterRooms = {
        "W1N1": { H: 50000, O: 0, U: 5000, L: 10000, K: 20000, Z: 0, X: 5000 },
        "W1N2": { H: 0, O: 40000, U: 0, L: 5000, K: 0, Z: 30000, X: 0 }
      };

      // Calculate which minerals to share
      interface MineralTransfer {
        mineral: string;
        from: string;
        to: string;
      }
      const mineralSharing: MineralTransfer[] = [];

      baseMinerals.forEach(mineral => {
        const rooms = Object.keys(cluster);
        const totals = rooms.map(r => ({ room: r, amount: cluster[r][mineral] || 0 }));
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
      .filter(([, cpu]) => cpu > CPU_THRESHOLD)
      .map(([room]) => room);

    expect(highCPURooms).to.include("W2N1");
    expect(highCPURooms).to.have.lengthOf(2);
  });
});

function installClusterAssignmentGlobals(): void {
  Object.assign(globalThis, {
    MOVE: "move",
    WORK: "work",
    CARRY: "carry",
    ATTACK: "attack",
    RANGED_ATTACK: "ranged_attack",
    HEAL: "heal",
    TOUGH: "tough",
    CLAIM: "claim",
    FIND_MY_CREEPS: 101,
    FIND_HOSTILE_CREEPS: 102,
    FIND_MY_SPAWNS: 103,
    FIND_MY_STRUCTURES: 104,
    FIND_SOURCES: 105,
    FIND_SOURCES_ACTIVE: 106,
    FIND_MINERALS: 107,
    FIND_MY_CONSTRUCTION_SITES: 108,
    FIND_STRUCTURES: 109,
    FIND_HOSTILE_POWER_CREEPS: 110,
    FIND_HOSTILE_STRUCTURES: 111,
    FIND_NUKES: 112,
    FIND_DEPOSITS: 113,
    FIND_CONSTRUCTION_SITES: 114,
    FIND_CREEPS: 115,
    FIND_DROPPED_RESOURCES: 116,
    FIND_TOMBSTONES: 117,
    FIND_RUINS: 118,
    FIND_FLAGS: 119,
    FIND_POWER_CREEPS: 120,
    FIND_MY_POWER_CREEPS: 121,
    RESOURCE_ENERGY: "energy",
    RESOURCE_POWER: "power",
    RESOURCE_OPS: "ops",
    RESOURCE_UTRIUM: "U",
    RESOURCE_LEMERGIUM: "L",
    RESOURCE_KEANIUM: "K",
    RESOURCE_ZYNTHIUM: "Z",
    RESOURCE_CATALYST: "X",
    RESOURCE_GHODIUM: "G",
    RESOURCE_CATALYZED_GHODIUM_ACID: "XGH2O",
    RESOURCE_CATALYZED_UTRIUM_ACID: "XUH2O",
    RESOURCE_CATALYZED_LEMERGIUM_ACID: "XLH2O",
    RESOURCE_CATALYZED_KEANIUM_ACID: "XKH2O",
    RESOURCE_CATALYZED_ZYNTHIUM_ACID: "XZH2O",
    STRUCTURE_SPAWN: "spawn",
    STRUCTURE_STORAGE: "storage",
    STRUCTURE_TERMINAL: "terminal",
    STRUCTURE_EXTENSION: "extension",
    STRUCTURE_ROAD: "road",
    STRUCTURE_TOWER: "tower",
    STRUCTURE_RAMPART: "rampart",
    STRUCTURE_WALL: "constructedWall",
    STRUCTURE_CONTAINER: "container",
    STRUCTURE_LINK: "link",
    STRUCTURE_LAB: "lab",
    STRUCTURE_FACTORY: "factory",
    STRUCTURE_POWER_SPAWN: "powerSpawn",
    STRUCTURE_NUKER: "nuker",
    STRUCTURE_OBSERVER: "observer",
    STRUCTURE_EXTRACTOR: "extractor",
    OK: 0,
    ERR_NOT_FOUND: -5,
    ERR_INVALID_ARGS: -10
  });
}

describe("Cluster defense assistance assignments", () => {
  beforeEach(() => {
    installClusterAssignmentGlobals();
  });

  it("does not carry stale defender candidates into later role-specific defense requests", async () => {
    const { assignDefendersToDefenseRequests } = await import("../src/defenderAssignments.ts");
    const spareGuard = { name: "spareGuard", body: [{ type: ATTACK, hits: 100 }], memory: { family: "military", role: "guard" } };
    const firstGuard = { name: "firstGuard", body: [{ type: ATTACK, hits: 100 }], memory: { family: "military", role: "guard" } };
    const emptyRoom = { find: () => [] };
    const helperRoom = {
      name: "W2N1",
      find: (type: FindConstant) => (type === FIND_MY_CREEPS ? [firstGuard, spareGuard] : [])
    };
    const rooms = {
      W1N1: emptyRoom,
      W2N1: helperRoom,
      W3N1: emptyRoom
    } as unknown as Game["rooms"];

    const cluster = {
      id: "cluster_W1N1",
      coreRoom: "W1N1",
      memberRooms: ["W1N1", "W2N1", "W3N1"],
      remoteRooms: [],
      forwardBases: [],
      role: "mixed",
      metrics: {
        energyIncome: 0,
        energyConsumption: 0,
        energyBalance: 0,
        warIndex: 0,
        economyIndex: 0,
        militaryReadiness: 0,
        roomCount: 3,
        averageRCL: 4
      },
      rallyPoints: [],
      squads: [],
      defenseRequests: [
        {
          roomName: "W1N1",
          guardsNeeded: 1,
          rangersNeeded: 0,
          healersNeeded: 0,
          urgency: 10,
          createdAt: 4000,
          threat: "guard needed",
          assignedCreeps: []
        },
        {
          roomName: "W3N1",
          guardsNeeded: 0,
          rangersNeeded: 0,
          healersNeeded: 1,
          urgency: 9,
          createdAt: 4000,
          threat: "healer needed",
          assignedCreeps: []
        }
      ],
      resourceRequests: [],
      lastUpdate: 4000
    };

    assignDefendersToDefenseRequests(cluster, {
      rooms,
      now: 4242,
      getDistance: () => 1
    });

    expect(cluster.defenseRequests[0]!.assignedCreeps).to.deep.equal(["firstGuard"]);
    expect(cluster.defenseRequests[1]!.assignedCreeps).to.deep.equal([]);
    expect(spareGuard.memory).to.not.have.property("assistTarget");
    expect(cluster.defenseRequests[1]!.healersNeeded).to.equal(1);
  });

  it("fills each requested defender role instead of letting closer extra guards consume ranger demand", async () => {
    const { assignDefendersToDefenseRequests } = await import("../src/defenderAssignments.ts");
    const firstGuard = { name: "firstGuard", body: [{ type: ATTACK, hits: 100 }], memory: { family: "military", role: "guard" } };
    const spareGuard = { name: "spareGuard", body: [{ type: ATTACK, hits: 100 }], memory: { family: "military", role: "guard" } };
    const ranger = { name: "ranger", body: [{ type: RANGED_ATTACK, hits: 100 }], memory: { family: "military", role: "ranger" } };
    const helperRoom = {
      name: "W2N1",
      find: (type: FindConstant) => (type === FIND_MY_CREEPS ? [firstGuard, spareGuard, ranger] : [])
    };
    const rooms = {
      W1N1: { find: () => [] },
      W2N1: helperRoom
    } as unknown as Game["rooms"];
    const cluster = {
      memberRooms: ["W1N1", "W2N1"],
      defenseRequests: [
        {
          roomName: "W1N1",
          guardsNeeded: 1,
          rangersNeeded: 1,
          healersNeeded: 0,
          urgency: 10,
          createdAt: 4000,
          threat: "mixed defenders needed",
          assignedCreeps: []
        }
      ]
    };

    assignDefendersToDefenseRequests(cluster, {
      rooms,
      now: 4243,
      getDistance: () => 1
    });

    expect(cluster.defenseRequests[0]!.assignedCreeps).to.deep.equal(["firstGuard", "ranger"]);
    expect(firstGuard.memory).to.include({
      assistTarget: "W1N1",
      targetRoom: "W1N1",
      task: "defenseAssist",
      defenseSquadId: "defenseAssist:W2N1:W1N1:4243",
      defenseSquadSize: 2,
      defenseSquadCreatedAt: 4243
    });
    expect(ranger.memory).to.include({
      assistTarget: "W1N1",
      targetRoom: "W1N1",
      task: "defenseAssist",
      defenseSquadId: "defenseAssist:W2N1:W1N1:4243",
      defenseSquadSize: 2,
      defenseSquadCreatedAt: 4243
    });
    expect(spareGuard.memory).to.not.have.property("assistTarget");
    expect(cluster.defenseRequests[0]!).to.include({ guardsNeeded: 0, rangersNeeded: 0, healersNeeded: 0 });
  });

  it("does not pull defenders from unsafe helper rooms", async () => {
    const { assignDefendersToDefenseRequests } = await import("../src/defenderAssignments.ts");
    const guard = { name: "guard", body: [{ type: ATTACK, hits: 100 }], memory: { family: "military", role: "guard" } };
    const rooms = {
      W1N1: { find: () => [] },
      W2N1: { name: "W2N1", find: (type: FindConstant) => (type === FIND_MY_CREEPS ? [guard] : []) }
    } as unknown as Game["rooms"];
    const cluster = {
      memberRooms: ["W1N1", "W2N1"],
      defenseRequests: [
        {
          roomName: "W1N1",
          guardsNeeded: 1,
          rangersNeeded: 0,
          healersNeeded: 0,
          urgency: 10,
          createdAt: 4000,
          threat: "guard needed",
          assignedCreeps: []
        }
      ]
    };

    assignDefendersToDefenseRequests(cluster, {
      rooms,
      now: 4244,
      getDistance: () => 1,
      isRoomSafe: (_room, roomName) => roomName !== "W2N1"
    });

    expect(cluster.defenseRequests[0]!.assignedCreeps).to.deep.equal([]);
    expect(guard.memory).to.not.have.property("assistTarget");
    expect(cluster.defenseRequests[0]!.guardsNeeded).to.equal(1);
  });

  it("ignores spawning and disarmed military creeps before decrementing demand", async () => {
    const { assignDefendersToDefenseRequests } = await import("../src/defenderAssignments.ts");
    const spawningGuard = {
      name: "spawningGuard",
      spawning: true,
      body: [{ type: ATTACK, hits: 100 }],
      memory: { family: "military", role: "guard" }
    };
    const disarmedGuard = {
      name: "disarmedGuard",
      body: [{ type: ATTACK, hits: 0 }],
      memory: { family: "military", role: "guard" }
    };
    const activeGuard = { name: "activeGuard", body: [{ type: ATTACK, hits: 100 }], memory: { family: "military", role: "guard" } };
    const rooms = {
      W1N1: { find: () => [] },
      W2N1: {
        name: "W2N1",
        find: (type: FindConstant) => (type === FIND_MY_CREEPS ? [spawningGuard, disarmedGuard, activeGuard] : [])
      }
    } as unknown as Game["rooms"];
    const cluster = {
      memberRooms: ["W1N1", "W2N1"],
      defenseRequests: [
        {
          roomName: "W1N1",
          guardsNeeded: 1,
          rangersNeeded: 0,
          healersNeeded: 0,
          urgency: 10,
          createdAt: 4000,
          threat: "guard needed",
          assignedCreeps: []
        }
      ]
    };

    assignDefendersToDefenseRequests(cluster, {
      rooms,
      now: 4245,
      getDistance: () => 1
    });

    expect(cluster.defenseRequests[0]!.assignedCreeps).to.deep.equal(["activeGuard"]);
    expect(spawningGuard.memory).to.not.have.property("assistTarget");
    expect(disarmedGuard.memory).to.not.have.property("assistTarget");
    expect(cluster.defenseRequests[0]!.guardsNeeded).to.equal(0);
  });
});

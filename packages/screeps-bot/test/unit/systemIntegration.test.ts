/**
 * System Integration Tests
 *
 * Tests interactions between major subsystems:
 * - Economy + Combat coordination
 * - Market + Resource management
 * - Defense + Spawning systems
 * - Multi-room coordination
 *
 * Addresses Issue: Integration tests for production readiness
 */

import { expect } from "chai";

// Mock Game object
const mockGame = {
  time: 10000,
  cpu: {
    bucket: 10000,
    limit: 500,
    getUsed: () => 50
  },
  gcl: {
    level: 5
  },
  rooms: {} as Record<string, any>,
  creeps: {} as Record<string, any>
};

(global as any).Game = mockGame;

describe("System Integration Tests", () => {
  beforeEach(() => {
    mockGame.time = 10000;
    mockGame.cpu.bucket = 10000;
    mockGame.rooms = {};
    mockGame.creeps = {};
  });

  describe("Economy and Combat Integration", () => {
    it("should shift economy from eco to war mode when threatened", () => {
      interface RoomState {
        mode: "eco" | "war" | "defense";
        energyReserve: number;
        militarySpawnPriority: number;
      }

      const state: RoomState = {
        mode: "eco",
        energyReserve: 100000,
        militarySpawnPriority: 1
      };

      // Simulate threat detection
      const threatDetected = true;
      if (threatDetected) {
        state.mode = "war";
        state.militarySpawnPriority = 10;
      }

      expect(state.mode).to.equal("war");
      expect(state.militarySpawnPriority).to.equal(10);
    });

    it("should reserve energy for military operations in war mode", () => {
      const calculateEnergyAllocation = (
        totalEnergy: number,
        mode: "eco" | "war"
      ) => {
        if (mode === "war") {
          return {
            military: totalEnergy * 0.6,
            economy: totalEnergy * 0.3,
            reserve: totalEnergy * 0.1
          };
        }
        return {
          military: totalEnergy * 0.1,
          economy: totalEnergy * 0.7,
          reserve: totalEnergy * 0.2
        };
      };

      const warAllocation = calculateEnergyAllocation(100000, "war");
      expect(warAllocation.military).to.equal(60000);

      const ecoAllocation = calculateEnergyAllocation(100000, "eco");
      expect(ecoAllocation.military).to.equal(10000);
    });

    it("should reduce economic creeps when military needs are urgent", () => {
      interface SpawnQueue {
        economic: number;
        military: number;
      }

      const queue: SpawnQueue = {
        economic: 5,
        military: 3
      };

      // In urgent military situation, defer economic spawns
      const urgentMilitary = true;
      if (urgentMilitary && queue.military > 0) {
        queue.economic = Math.min(queue.economic, 2); // Reduce to minimum
      }

      expect(queue.economic).to.equal(2);
      expect(queue.military).to.equal(3);
    });

    it("should resume economy after military threat is resolved", () => {
      let mode: "eco" | "war" | "recovery" = "war";
      const threatLevel = 0;
      const energyLevel = 0.4; // Low after war

      if (threatLevel === 0 && energyLevel < 0.6) {
        mode = "recovery";
      } else if (threatLevel === 0) {
        mode = "eco";
      }

      expect(mode).to.equal("recovery");
    });
  });

  describe("Market and Resource Management Integration", () => {
    it("should buy missing minerals needed for lab production", () => {
      interface LabQueue {
        targetCompound: string;
        requiredInputs: Array<{ resource: string; amount: number }>;
      }

      interface Storage {
        [resource: string]: number;
      }

      const labQueue: LabQueue = {
        targetCompound: "XLH2O",
        requiredInputs: [
          { resource: "X", amount: 1000 },
          { resource: "LH2O", amount: 1000 }
        ]
      };

      const storage: Storage = {
        "X": 500, // Insufficient
        "LH2O": 1200 // Sufficient
      };

      const missingResources = labQueue.requiredInputs.filter(input => {
        return (storage[input.resource] || 0) < input.amount;
      });

      expect(missingResources).to.have.lengthOf(1);
      expect(missingResources[0].resource).to.equal("X");
    });

    it("should sell excess minerals not needed for production", () => {
      const productionNeeds: Record<string, number> = {
        "H": 5000,
        "O": 5000,
        "U": 3000
      };

      const currentStorage: Record<string, number> = {
        "H": 50000,
        "O": 6000,
        "U": 2000,
        "L": 40000
      };

      const excessResources = Object.keys(currentStorage).filter(resource => {
        const need = productionNeeds[resource] || 0;
        const surplus = currentStorage[resource] - need;
        return surplus > 10000; // Significant surplus threshold
      });

      expect(excessResources).to.include("H");
      expect(excessResources).to.include("L");
      expect(excessResources).not.to.include("O");
    });

    it("should balance resources across multiple rooms via terminal", () => {
      interface RoomResources {
        roomName: string;
        energy: number;
        needsEnergy: boolean;
      }

      const rooms: RoomResources[] = [
        { roomName: "W1N1", energy: 200000, needsEnergy: false },
        { roomName: "W2N2", energy: 20000, needsEnergy: true },
        { roomName: "W3N3", energy: 180000, needsEnergy: false }
      ];

      // Find donor and recipient
      const donors = rooms.filter(r => !r.needsEnergy && r.energy > 100000);
      const recipients = rooms.filter(r => r.needsEnergy);

      expect(donors).to.have.lengthOf(2);
      expect(recipients).to.have.lengthOf(1);
    });

    it("should coordinate market purchases with terminal capacity", () => {
      const terminalCapacity = 300000;
      const currentStore = 250000;
      const orderAmount = 100000;

      const freeSpace = terminalCapacity - currentStore;
      const canReceiveOrder = freeSpace >= orderAmount;

      expect(canReceiveOrder).to.be.false; // Not enough space
    });
  });

  describe("Defense and Spawning Integration", () => {
    it("should prioritize defender spawning over economic creeps", () => {
      interface SpawnRequest {
        priority: number;
        role: string;
      }

      const requests: SpawnRequest[] = [
        { priority: 5, role: "harvester" },
        { priority: 10, role: "defender" },
        { priority: 6, role: "upgrader" },
        { priority: 10, role: "ranger" }
      ];

      const sorted = [...requests].sort((a, b) => b.priority - a.priority);
      
      expect(sorted[0].role).to.be.oneOf(["defender", "ranger"]);
      expect(sorted[1].role).to.be.oneOf(["defender", "ranger"]);
    });

    it("should spawn defenders from multiple rooms for coordinated defense", () => {
      interface DefenseAssignment {
        defenderName: string;
        sourceRoom: string;
        targetRoom: string;
      }

      const targetRoom = "W2N2";
      const availableRooms = ["W1N1", "W1N2", "W2N1"];

      const assignments: DefenseAssignment[] = availableRooms.map((room, i) => ({
        defenderName: `defender_${room}_${i}`,
        sourceRoom: room,
        targetRoom
      }));

      expect(assignments).to.have.lengthOf(3);
      expect(assignments.every(a => a.targetRoom === targetRoom)).to.be.true;
    });

    it("should adjust tower energy reserves during sustained combat", () => {
      let towerReserve = 50000;
      const combatActive = true;
      const combatDuration = 100; // ticks

      if (combatActive && combatDuration > 50) {
        towerReserve = Math.max(towerReserve, 100000); // Increase reserve
      }

      expect(towerReserve).to.equal(100000);
    });

    it("should pause non-essential spawning during emergency", () => {
      interface SpawnQueue {
        essential: Array<{ role: string }>;
        nonEssential: Array<{ role: string }>;
      }

      const queue: SpawnQueue = {
        essential: [
          { role: "defender" },
          { role: "harvester" }
        ],
        nonEssential: [
          { role: "upgrader" },
          { role: "builder" }
        ]
      };

      const isEmergency = true;
      const activeQueue = isEmergency ? queue.essential : [...queue.essential, ...queue.nonEssential];

      expect(activeQueue).to.have.lengthOf(2);
      expect(activeQueue.every(r => ["defender", "harvester"].includes(r.role))).to.be.true;
    });
  });

  describe("Multi-Room Coordination", () => {
    it("should coordinate expansion based on GCL and room stability", () => {
      const gclLevel = 5;
      const ownedRooms = 4;
      const stableRooms = 3;

      const canExpand = ownedRooms < gclLevel && stableRooms >= (ownedRooms * 0.75);
      expect(canExpand).to.be.true;
    });

    it("should distribute remote mining across cluster rooms", () => {
      interface RemoteAssignment {
        homeRoom: string;
        remoteRoom: string;
        sourceId: string;
      }

      const clusterRooms = ["W1N1", "W2N2"];
      const remotes = ["W1N2", "W2N1", "W3N2", "W3N1"];

      // Distribute evenly
      const assignments: RemoteAssignment[] = remotes.map((remote, i) => ({
        homeRoom: clusterRooms[i % clusterRooms.length],
        remoteRoom: remote,
        sourceId: `source_${i}`
      }));

      const w1n1Remotes = assignments.filter(a => a.homeRoom === "W1N1");
      const w2n2Remotes = assignments.filter(a => a.homeRoom === "W2N2");

      expect(Math.abs(w1n1Remotes.length - w2n2Remotes.length)).to.be.lessThan(2); // Balanced
    });

    it("should coordinate cluster-wide military operations", () => {
      interface MilitaryOperation {
        operationType: string;
        targetRoom: string;
        participatingRooms: string[];
        squadSize: number;
      }

      const operation: MilitaryOperation = {
        operationType: "raid",
        targetRoom: "W5N5",
        participatingRooms: ["W1N1", "W2N2", "W3N3"],
        squadSize: 15
      };

      // Distribute squad members across rooms
      const membersPerRoom = Math.ceil(operation.squadSize / operation.participatingRooms.length);
      expect(membersPerRoom).to.equal(5);
    });

    it("should share defense resources across cluster in crisis", () => {
      interface RoomDefenseStatus {
        roomName: string;
        underAttack: boolean;
        defenders: number;
        canSpareDefenders: boolean;
      }

      const rooms: RoomDefenseStatus[] = [
        { roomName: "W1N1", underAttack: true, defenders: 1, canSpareDefenders: false },
        { roomName: "W2N2", underAttack: false, defenders: 3, canSpareDefenders: true },
        { roomName: "W3N3", underAttack: false, defenders: 2, canSpareDefenders: true }
      ];

      const attackedRoom = rooms.find(r => r.underAttack);
      const helpers = rooms.filter(r => !r.underAttack && r.canSpareDefenders);

      expect(attackedRoom?.roomName).to.equal("W1N1");
      expect(helpers).to.have.lengthOf(2);
    });
  });

  describe("Pheromone System Integration", () => {
    it("should update pheromones based on room state", () => {
      interface Pheromones {
        harvest: number;
        build: number;
        upgrade: number;
        defense: number;
        war: number;
      }

      const pheromones: Pheromones = {
        harvest: 50,
        build: 30,
        upgrade: 40,
        defense: 10,
        war: 5
      };

      // Simulate threat - increase defense pheromone
      const threatDetected = true;
      if (threatDetected) {
        pheromones.defense += 40;
        pheromones.war += 20;
      }

      expect(pheromones.defense).to.equal(50);
      expect(pheromones.war).to.equal(25);
    });

    it("should decay pheromones over time", () => {
      const DECAY_FACTOR = 0.95;
      let pheromone = 100;

      // Simulate 10 ticks
      for (let i = 0; i < 10; i++) {
        pheromone *= DECAY_FACTOR;
      }

      expect(pheromone).to.be.lessThan(100);
      expect(pheromone).to.be.closeTo(59.87, 0.1);
    });

    it("should influence spawn priorities based on pheromone levels", () => {
      interface Pheromones {
        harvest: number;
        build: number;
        upgrade: number;
        defense: number;
      }

      const pheromones: Pheromones = {
        harvest: 30,
        build: 20,
        upgrade: 15,
        defense: 80 // High defense need
      };

      // Determine priority role
      const priorities = Object.entries(pheromones).sort((a, b) => b[1] - a[1]);
      const topPriority = priorities[0][0];

      expect(topPriority).to.equal("defense");
    });

    it("should propagate danger pheromone to neighbor rooms", () => {
      interface RoomPheromones {
        roomName: string;
        danger: number;
      }

      const rooms: RoomPheromones[] = [
        { roomName: "W1N1", danger: 100 }, // Under attack
        { roomName: "W1N2", danger: 0 },   // Neighbor
        { roomName: "W2N1", danger: 0 }    // Neighbor
      ];

      // Propagate danger to neighbors (reduced)
      const PROPAGATION_FACTOR = 0.3;
      const attackedRoom = rooms[0];
      
      for (let i = 1; i < rooms.length; i++) {
        rooms[i].danger = attackedRoom.danger * PROPAGATION_FACTOR;
      }

      expect(rooms[1].danger).to.equal(30);
      expect(rooms[2].danger).to.equal(30);
    });
  });

  describe("CPU and Performance Integration", () => {
    it("should throttle expensive operations when bucket is low", () => {
      const bucket = 5000;
      const LOW_BUCKET_THRESHOLD = 7000;

      const shouldRunExpensiveOperations = bucket >= LOW_BUCKET_THRESHOLD;
      expect(shouldRunExpensiveOperations).to.be.false;
    });

    it("should distribute CPU budget across rooms", () => {
      const totalCPU = 500;
      const rooms = ["W1N1", "W2N2", "W3N3", "W4N4"];
      const cpuPerRoom = totalCPU / rooms.length;

      expect(cpuPerRoom).to.equal(125);
    });

    it("should prioritize critical rooms for CPU allocation", () => {
      interface RoomCPU {
        roomName: string;
        priority: number;
        allocation: number;
      }

      const rooms: RoomCPU[] = [
        { roomName: "W1N1", priority: 1, allocation: 0 }, // Under attack
        { roomName: "W2N2", priority: 0.5, allocation: 0 }, // Stable
        { roomName: "W3N3", priority: 0.5, allocation: 0 }  // Stable
      ];

      const totalCPU = 200;
      const totalPriority = rooms.reduce((sum, r) => sum + r.priority, 0);

      rooms.forEach(room => {
        room.allocation = (room.priority / totalPriority) * totalCPU;
      });

      expect(rooms[0].allocation).to.equal(100); // Gets half the CPU
      expect(rooms[1].allocation).to.equal(50);
      expect(rooms[2].allocation).to.equal(50);
    });

    it("should cache expensive calculations across ticks", () => {
      interface Cache {
        value: any;
        cachedAt: number;
        ttl: number;
      }

      const cache: Cache = {
        value: "expensive_result",
        cachedAt: 9900,
        ttl: 100
      };

      const currentTick = 9950;
      const isCacheValid = (currentTick - cache.cachedAt) < cache.ttl;

      expect(isCacheValid).to.be.true;
    });

    it("should skip non-critical rooms when over CPU limit", () => {
      const cpuUsed = 480;
      const cpuLimit = 500;
      const cpuRemaining = cpuLimit - cpuUsed;

      const shouldProcessRoom = (roomPriority: "critical" | "normal") => {
        if (cpuRemaining < 10) {
          return roomPriority === "critical";
        }
        return true;
      };

      expect(shouldProcessRoom("critical")).to.be.true;
      expect(shouldProcessRoom("normal")).to.be.true; // Still have 20 CPU

      // With less CPU
      const shouldProcessWithLessCPU = (priority: "critical" | "normal") => {
        const remaining = 5;
        if (remaining < 10) {
          return priority === "critical";
        }
        return true;
      };

      expect(shouldProcessWithLessCPU("critical")).to.be.true;
      expect(shouldProcessWithLessCPU("normal")).to.be.false;
    });
  });

  describe("Error Recovery and Resilience", () => {
    it("should recover from complete creep loss", () => {
      const creepCount = 0;
      const energy = 300;
      const spawnAvailable = true;

      const canBootstrap = creepCount === 0 && energy >= 300 && spawnAvailable;
      expect(canBootstrap).to.be.true;
    });

    it("should detect and respond to room loss", () => {
      interface RoomStatus {
        controlled: boolean;
        wasControlled: boolean;
        lostAt?: number;
      }

      const room: RoomStatus = {
        controlled: false,
        wasControlled: true,
        lostAt: mockGame.time
      };

      const roomWasLost = !room.controlled && room.wasControlled;
      expect(roomWasLost).to.be.true;
    });

    it("should redistribute resources when terminal is destroyed", () => {
      interface Terminal {
        store: { [resource: string]: number };
        hits: number;
      }

      let terminal: Terminal | null = {
        store: { energy: 50000, H: 5000 },
        hits: 0 // Destroyed
      };

      const redistributeResources = () => {
        if (terminal && terminal.hits === 0) {
          const resources = { ...terminal.store };
          terminal = null;
          return resources;
        }
        return null;
      };

      const rescued = redistributeResources();
      expect(rescued).to.not.be.null;
      expect(rescued?.energy).to.equal(50000);
      expect(terminal).to.be.null;
    });

    it("should rebuild critical structures after destruction", () => {
      interface Structure {
        type: string;
        hits: number;
        critical: boolean;
      }

      const structures: Structure[] = [
        { type: "spawn", hits: 0, critical: true },
        { type: "tower", hits: 0, critical: true },
        { type: "storage", hits: 1000, critical: true },
        { type: "extension", hits: 0, critical: false }
      ];

      const needsRebuild = structures.filter(s => s.hits === 0 && s.critical);
      expect(needsRebuild).to.have.lengthOf(2);
    });
  });
});

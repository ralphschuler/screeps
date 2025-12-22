import { expect } from "chai";
import { memoryPruner } from "../../src/memory/memoryPruner";
import type { EmpireMemory, SwarmState } from "../../src/memory/schemas";
import { Game as MockGame } from "./mock";

describe("Memory Pruner", () => {
  beforeEach(() => {
    // Reset Memory before each test
    // @ts-ignore
    global.Memory = {
      creeps: {},
      rooms: {},
      spawns: {},
      flags: {}
    };

    // @ts-ignore
    global.Game = {
      ...MockGame,
      time: 10000,
      creeps: {},
      rooms: {}
    };
  });

  describe("pruneDeadCreeps", () => {
    it("should remove dead creep memory", () => {
      Memory.creeps = {
        alive1: { role: "harvester" } as any,
        dead1: { role: "hauler" } as any,
        dead2: { role: "builder" } as any
      };

      // Only alive1 exists in Game.creeps
      // @ts-ignore
      global.Game.creeps = {
        alive1: { name: "alive1" }
      };

      const pruned = memoryPruner.pruneDeadCreeps();

      expect(pruned).to.equal(2);
      expect(Memory.creeps).to.have.property("alive1");
      expect(Memory.creeps).to.not.have.property("dead1");
      expect(Memory.creeps).to.not.have.property("dead2");
    });

    it("should not remove living creep memory", () => {
      Memory.creeps = {
        alive1: { role: "harvester" } as any,
        alive2: { role: "hauler" } as any
      };

      // @ts-ignore
      global.Game.creeps = {
        alive1: { name: "alive1" },
        alive2: { name: "alive2" }
      };

      const pruned = memoryPruner.pruneDeadCreeps();

      expect(pruned).to.equal(0);
      expect(Object.keys(Memory.creeps)).to.have.lengthOf(2);
    });
  });

  describe("pruneEventLogs", () => {
    it("should prune old event log entries", () => {
      const swarm: SwarmState = {
        eventLog: Array.from({ length: 50 }, (_, i) => ({
          type: "test",
          time: 1000 + i
        })),
        version: 1,
        colonyLevel: 1,
        pheromones: {} as any,
        intent: "eco",
        danger: 0,
        sourceMeta: []
      };

      Memory.rooms = {
        W1N1: { swarm } as any
      };

      const pruned = memoryPruner.pruneEventLogs(20);

      expect(pruned).to.equal(30);
      const roomSwarm = (Memory.rooms.W1N1 as any).swarm as SwarmState;
      expect(roomSwarm.eventLog).to.have.lengthOf(20);
      
      // Verify we kept the most recent entries
      expect(roomSwarm.eventLog[0].time).to.equal(1030);
      expect(roomSwarm.eventLog[19].time).to.equal(1049);
    });

    it("should not prune if under limit", () => {
      const swarm: SwarmState = {
        eventLog: Array.from({ length: 10 }, (_, i) => ({
          type: "test",
          time: 1000 + i
        })),
        version: 1,
        colonyLevel: 1,
        pheromones: {} as any,
        intent: "eco",
        danger: 0,
        sourceMeta: []
      };

      Memory.rooms = {
        W1N1: { swarm } as any
      };

      const pruned = memoryPruner.pruneEventLogs(20);

      expect(pruned).to.equal(0);
      const roomSwarm = (Memory.rooms.W1N1 as any).swarm as SwarmState;
      expect(roomSwarm.eventLog).to.have.lengthOf(10);
    });
  });

  describe("pruneStaleIntel", () => {
    it("should remove stale intel data", () => {
      const mem = Memory as unknown as Record<string, unknown>;
      const empire: Partial<EmpireMemory> = {
        knownRooms: {
          W1N1: {
            name: "W1N1",
            lastSeen: 100, // Very old
            sources: 2,
            controllerLevel: 0,
            threatLevel: 0,
            scouted: true,
            terrain: "mixed",
            isHighway: false,
            isSK: false
          },
          W2N2: {
            name: "W2N2",
            lastSeen: 9500, // Recent
            sources: 2,
            controllerLevel: 0,
            threatLevel: 0,
            scouted: true,
            terrain: "mixed",
            isHighway: false,
            isSK: false
          },
          W3N3: {
            name: "W3N3",
            lastSeen: 100, // Old but highway
            sources: 2,
            controllerLevel: 0,
            threatLevel: 0,
            scouted: true,
            terrain: "mixed",
            isHighway: true,
            isSK: false
          }
        }
      };
      mem.empire = empire as EmpireMemory;

      const pruned = memoryPruner.pruneStaleIntel(10000);

      expect(pruned).to.equal(1);
      expect(empire.knownRooms).to.have.property("W2N2");
      expect(empire.knownRooms).to.have.property("W3N3"); // Highway kept
      expect(empire.knownRooms).to.not.have.property("W1N1"); // Stale removed
    });

    it("should not prune intel for owned rooms", () => {
      const mem = Memory as unknown as Record<string, unknown>;
      const empire: Partial<EmpireMemory> = {
        knownRooms: {
          W1N1: {
            name: "W1N1",
            lastSeen: 100, // Very old
            sources: 2,
            controllerLevel: 5,
            owner: "me",
            threatLevel: 0,
            scouted: true,
            terrain: "mixed",
            isHighway: false,
            isSK: false
          }
        }
      };
      mem.empire = empire as EmpireMemory;

      // Mock owned room
      // @ts-ignore
      global.Game.rooms = {
        W1N1: {
          controller: { my: true }
        }
      };

      const pruned = memoryPruner.pruneStaleIntel(10000);

      expect(pruned).to.equal(0);
      expect(empire.knownRooms).to.have.property("W1N1");
    });
  });

  describe("pruneAll", () => {
    it("should run all pruning operations", () => {
      // Setup dead creep
      Memory.creeps = {
        dead1: { role: "harvester" } as any
      };

      // Setup room with excessive event logs
      const swarm: SwarmState = {
        eventLog: Array.from({ length: 50 }, (_, i) => ({
          type: "test",
          time: 1000 + i
        })),
        version: 1,
        colonyLevel: 1,
        pheromones: {} as any,
        intent: "eco",
        danger: 0,
        sourceMeta: []
      };

      Memory.rooms = {
        W1N1: { swarm } as any
      };

      // Setup stale intel
      const mem = Memory as unknown as Record<string, unknown>;
      const empire: Partial<EmpireMemory> = {
        knownRooms: {
          W1N1: {
            name: "W1N1",
            lastSeen: 100,
            sources: 2,
            controllerLevel: 0,
            threatLevel: 0,
            scouted: true,
            terrain: "mixed",
            isHighway: false,
            isSK: false
          }
        }
      };
      mem.empire = empire as EmpireMemory;

      const stats = memoryPruner.pruneAll();

      expect(stats.deadCreeps).to.equal(1);
      expect(stats.eventLogs).to.equal(30);
      expect(stats.staleIntel).to.equal(1);
    });
  });

  describe("getRecommendations", () => {
    it("should provide recommendations for memory optimization", () => {
      // Setup excessive event logs
      const swarm: SwarmState = {
        eventLog: Array.from({ length: 100 }, (_, i) => ({
          type: "test",
          time: 1000 + i
        })),
        version: 1,
        colonyLevel: 1,
        pheromones: {} as any,
        intent: "eco",
        danger: 0,
        sourceMeta: []
      };

      Memory.rooms = {
        W1N1: { swarm } as any
      };

      const recommendations = memoryPruner.getRecommendations();

      expect(recommendations).to.be.an("array");
      expect(recommendations.length).to.be.greaterThan(0);
      expect(recommendations[0]).to.include("W1N1");
      expect(recommendations[0]).to.include("event log");
    });
  });
});

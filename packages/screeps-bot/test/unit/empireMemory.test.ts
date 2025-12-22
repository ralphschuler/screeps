/**
 * Empire Memory Tests
 *
 * Tests for the new empire memory structure (ROADMAP Section 4)
 */

import { expect } from "chai";
import { MemoryManager } from "../../src/memory/manager";
import type { EmpireMemory, RoomIntel, OwnedRoomEntry } from "../../src/memory/schemas";
import { createDefaultEmpireMemory } from "../../src/memory/schemas";
import { Game as GameMock, Memory as MemoryMock } from "./mock";

describe("Empire Memory", () => {
  let manager: MemoryManager;

  beforeEach(() => {
    // @ts-ignore: test setup injects lodash-lite clone
    global.Game = _.clone(GameMock);
    // @ts-ignore: test setup injects lodash-lite clone
    global.Memory = _.clone(MemoryMock);
    manager = new MemoryManager();
  });

  describe("Initialization", () => {
    it("should create default empire memory on first access", () => {
      manager.initialize();
      const empire = manager.getEmpire();

      expect(empire).to.exist;
      expect(empire.knownRooms).to.be.an("object");
      expect(empire.clusters).to.be.an("array");
      expect(empire.warTargets).to.be.an("array");
      expect(empire.ownedRooms).to.be.an("object");
      expect(empire.claimQueue).to.be.an("array");
      expect(empire.objectives).to.exist;
      expect(empire.lastUpdate).to.be.a("number");
    });

    it("should have correct default objectives", () => {
      manager.initialize();
      const empire = manager.getEmpire();

      expect(empire.objectives.targetPowerLevel).to.equal(0);
      expect(empire.objectives.targetRoomCount).to.equal(1);
      expect(empire.objectives.warMode).to.be.false;
      expect(empire.objectives.expansionPaused).to.be.false;
    });
  });

  describe("Migration from Overmind", () => {
    it("should migrate overmind data to empire structure", () => {
      // Set up old overmind structure
      // @ts-ignore: Accessing mocked memory
      global.Memory.overmind = {
        roomsSeen: { W1N1: 1000 },
        roomIntel: {
          W1N1: {
            name: "W1N1",
            lastSeen: 1000,
            sources: 2,
            controllerLevel: 5,
            owner: "TestPlayer",
            threatLevel: 0,
            scouted: true,
            terrain: "plains",
            isHighway: false,
            isSK: false
          }
        },
        claimQueue: [],
        warTargets: ["Enemy1"],
        nukeCandidates: [],
        powerBanks: [],
        objectives: {
          targetPowerLevel: 1,
          targetRoomCount: 3,
          warMode: true,
          expansionPaused: false
        },
        lastRun: 500
      };

      // @ts-ignore: Accessing mocked memory
      global.Memory.clusters = {
        cluster1: {
          id: "cluster1",
          coreRoom: "W1N1",
          memberRooms: ["W1N1"],
          remoteRooms: [],
          forwardBases: [],
          role: "economic",
          metrics: {
            energyIncome: 100,
            energyConsumption: 50,
            energyBalance: 50,
            warIndex: 0,
            economyIndex: 80
          },
          squads: [],
          rallyPoints: [],
          defenseRequests: [],
          resourceRequests: [],
          lastUpdate: 1000
        }
      };

      // @ts-ignore: Set old version
      global.Memory.memoryVersion = 1;

      manager.initialize();
      const empire = manager.getEmpire();

      // Verify migration
      expect(empire.knownRooms).to.have.property("W1N1");
      expect(empire.knownRooms.W1N1.controllerLevel).to.equal(5);
      expect(empire.clusters).to.include("cluster1");
      expect(empire.warTargets).to.include("Enemy1");
      expect(empire.objectives.warMode).to.be.true;
      expect(empire.objectives.targetRoomCount).to.equal(3);
      expect(empire.lastUpdate).to.equal(500);
    });
  });

  describe("Data Management", () => {
    it("should maintain room intel data", () => {
      manager.initialize();
      const empire = manager.getEmpire();

      const roomIntel: RoomIntel = {
        name: "W2N2",
        lastSeen: 2000,
        sources: 3,
        controllerLevel: 7,
        owner: "Player2",
        threatLevel: 1,
        scouted: true,
        terrain: "mixed",
        isHighway: false,
        isSK: false,
        towerCount: 3,
        spawnCount: 2
      };

      empire.knownRooms["W2N2"] = roomIntel;

      // Verify data persists
      const retrieved = manager.getEmpire();
      expect(retrieved.knownRooms.W2N2).to.deep.equal(roomIntel);
    });

    it("should track cluster IDs", () => {
      manager.initialize();
      const empire = manager.getEmpire();

      empire.clusters.push("cluster1", "cluster2", "cluster3");

      const retrieved = manager.getEmpire();
      expect(retrieved.clusters).to.have.lengthOf(3);
      expect(retrieved.clusters).to.include("cluster1");
      expect(retrieved.clusters).to.include("cluster2");
      expect(retrieved.clusters).to.include("cluster3");
    });

    it("should track owned rooms with roles", () => {
      manager.initialize();
      const empire = manager.getEmpire();

      const ownedRoom: OwnedRoomEntry = {
        name: "W3N3",
        role: "capital",
        clusterId: "cluster1",
        rcl: 8
      };

      empire.ownedRooms["W3N3"] = ownedRoom;

      const retrieved = manager.getEmpire();
      expect(retrieved.ownedRooms.W3N3).to.deep.equal(ownedRoom);
      expect(retrieved.ownedRooms.W3N3.role).to.equal("capital");
    });

    it("should manage war targets", () => {
      manager.initialize();
      const empire = manager.getEmpire();

      empire.warTargets.push("Enemy1", "W5N5");

      const retrieved = manager.getEmpire();
      expect(retrieved.warTargets).to.have.lengthOf(2);
      expect(retrieved.warTargets).to.include("Enemy1");
      expect(retrieved.warTargets).to.include("W5N5");
    });

    it("should update strategic objectives", () => {
      manager.initialize();
      const empire = manager.getEmpire();

      empire.objectives.targetRoomCount = 10;
      empire.objectives.warMode = true;
      empire.objectives.expansionPaused = true;

      const retrieved = manager.getEmpire();
      expect(retrieved.objectives.targetRoomCount).to.equal(10);
      expect(retrieved.objectives.warMode).to.be.true;
      expect(retrieved.objectives.expansionPaused).to.be.true;
    });
  });

  describe("Memory Versioning", () => {
    it("should update memory version to 2 after migration", () => {
      // @ts-ignore: Set old version
      global.Memory.memoryVersion = 0;

      manager.initialize();

      // @ts-ignore: Accessing mocked memory
      expect(global.Memory.memoryVersion).to.equal(2);
    });
  });

  describe("Factory Functions", () => {
    it("should create valid default empire memory", () => {
      const empire = createDefaultEmpireMemory();

      expect(empire.knownRooms).to.deep.equal({});
      expect(empire.clusters).to.deep.equal([]);
      expect(empire.warTargets).to.deep.equal([]);
      expect(empire.ownedRooms).to.deep.equal({});
      expect(empire.claimQueue).to.deep.equal([]);
      expect(empire.nukeCandidates).to.deep.equal([]);
      expect(empire.powerBanks).to.deep.equal([]);
      expect(empire.objectives).to.exist;
      expect(empire.lastUpdate).to.equal(0);
    });
  });
});

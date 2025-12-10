/**
 * Rally Point Manager Tests
 */

import { expect } from "chai";
import {
  findOptimalRallyPoint,
  updateClusterRallyPoints,
  getSquadRallyPoint
} from "../../src/clusters/rallyPointManager";
import type { ClusterMemory } from "../../src/memory/schemas";

describe("Rally Point Manager", () => {
  // Mock game objects
  let mockRoom: Partial<Room>;
  let mockCluster: ClusterMemory;

  beforeEach(() => {
    // Reset global Game object
    global.Game = {
      time: 10000,
      rooms: {},
      creeps: {}
    } as any;

    // Create mock room
    mockRoom = {
      name: "W1N1",
      find: () => [],
      getTerrain: () => ({
        get: (x: number, y: number) => {
          // Return plain terrain for most positions
          if (x < 2 || x > 47 || y < 2 || y > 47) return TERRAIN_MASK_WALL;
          return 0;
        }
      }),
      lookForAt: () => []
    } as any;

    // Create mock cluster
    mockCluster = {
      id: "cluster1",
      coreRoom: "W1N1",
      memberRooms: ["W1N1"],
      remoteRooms: [],
      forwardBases: [],
      role: "economic",
      metrics: {
        energyIncome: 0,
        energyConsumption: 0,
        energyBalance: 0,
        warIndex: 0,
        economyIndex: 50,
        militaryReadiness: 0
      },
      squads: [],
      rallyPoints: [],
      defenseRequests: [],
      resourceRequests: [],
      lastUpdate: 10000
    };

    global.Game.rooms["W1N1"] = mockRoom as Room;
  });

  describe("findOptimalRallyPoint", () => {
    it("should return null if room is null", () => {
      const result = findOptimalRallyPoint(null as any, "defense");
      expect(result).to.be.null;
    });

    it("should find a defense rally point", () => {
      // Add a spawn to the room
      const mockSpawn = {
        pos: { x: 25, y: 25, roomName: "W1N1" },
        structureType: STRUCTURE_SPAWN
      };
      mockRoom.find = (type: any) => {
        if (type === FIND_MY_SPAWNS) return [mockSpawn];
        return [];
      };

      const result = findOptimalRallyPoint(mockRoom as Room, "defense");
      expect(result).to.not.be.null;
      expect(result?.roomName).to.equal("W1N1");
      expect(result?.purpose).to.equal("defense");
      expect(result?.x).to.be.within(2, 47);
      expect(result?.y).to.be.within(2, 47);
      expect(result?.createdAt).to.equal(10000);
    });

    it("should find an offense rally point near exits", () => {
      // Add exits to the room with getRangeTo method
      const mockExits = [
        { x: 25, y: 0, roomName: "W1N1", getRangeTo: (x: number, y: number) => Math.abs(25 - x) + Math.abs(0 - y) },
        { x: 25, y: 49, roomName: "W1N1", getRangeTo: (x: number, y: number) => Math.abs(25 - x) + Math.abs(49 - y) }
      ];
      mockRoom.find = (type: any) => {
        if (type === FIND_EXIT) return mockExits;
        return [];
      };

      const result = findOptimalRallyPoint(mockRoom as Room, "offense");
      expect(result).to.not.be.null;
      expect(result?.roomName).to.equal("W1N1");
      expect(result?.purpose).to.equal("offense");
    });

    it("should find a staging rally point", () => {
      const result = findOptimalRallyPoint(mockRoom as Room, "staging");
      expect(result).to.not.be.null;
      expect(result?.roomName).to.equal("W1N1");
      expect(result?.purpose).to.equal("staging");
      // Staging should be between center and edges
      expect(result?.x).to.be.within(5, 44);
      expect(result?.y).to.be.within(5, 44);
    });

    it("should find a retreat rally point near spawn", () => {
      const mockSpawn = {
        pos: { x: 20, y: 20, roomName: "W1N1" },
        structureType: STRUCTURE_SPAWN
      };
      mockRoom.find = (type: any) => {
        if (type === FIND_MY_SPAWNS) return [mockSpawn];
        return [];
      };

      const result = findOptimalRallyPoint(mockRoom as Room, "retreat");
      expect(result).to.not.be.null;
      expect(result?.roomName).to.equal("W1N1");
      expect(result?.purpose).to.equal("retreat");
      expect(result?.x).to.equal(20);
      expect(result?.y).to.equal(20);
    });
  });

  describe("updateClusterRallyPoints", () => {
    it("should clean up old rally points", () => {
      // Add old rally point (not defense, no active squad, old lastUsed)
      mockCluster.rallyPoints = [
        {
          roomName: "W1N1",
          x: 10,
          y: 10,
          purpose: "staging",
          lastUsed: 9000, // 1000 ticks ago
          createdAt: 8000
        }
      ];

      updateClusterRallyPoints(mockCluster);

      // Old staging point should be removed
      expect(mockCluster.rallyPoints.length).to.equal(0);
    });

    it("should keep recently used rally points", () => {
      mockCluster.rallyPoints = [
        {
          roomName: "W1N1",
          x: 10,
          y: 10,
          purpose: "staging",
          lastUsed: 9950, // 50 ticks ago
          createdAt: 9000
        }
      ];

      updateClusterRallyPoints(mockCluster);

      // Recent staging point should be kept
      expect(mockCluster.rallyPoints.length).to.equal(1);
    });

    it("should keep rally points for active squads", () => {
      mockCluster.squads = [
        {
          id: "squad1",
          type: "harass",
          members: [],
          rallyRoom: "W1N1",
          targetRooms: [],
          state: "gathering",
          createdAt: 10000
        }
      ];
      mockCluster.rallyPoints = [
        {
          roomName: "W1N1",
          x: 10,
          y: 10,
          purpose: "staging",
          createdAt: 9000
        }
      ];

      updateClusterRallyPoints(mockCluster);

      // Should keep rally point because it has active squad
      expect(mockCluster.rallyPoints.length).to.equal(1);
    });

    it("should always keep defense rally points", () => {
      mockCluster.rallyPoints = [
        {
          roomName: "W1N1",
          x: 25,
          y: 25,
          purpose: "defense",
          createdAt: 5000 // Very old
        }
      ];

      updateClusterRallyPoints(mockCluster);

      // Defense rally point should always be kept
      expect(mockCluster.rallyPoints.length).to.equal(1);
      expect(mockCluster.rallyPoints[0].purpose).to.equal("defense");
    });

    it("should create defense rally points for member rooms", () => {
      // Add spawn to room for rally point creation
      const mockSpawn = {
        pos: { x: 25, y: 25, roomName: "W1N1" },
        structureType: STRUCTURE_SPAWN
      };
      mockRoom.find = (type: any) => {
        if (type === FIND_MY_SPAWNS) return [mockSpawn];
        return [];
      };

      updateClusterRallyPoints(mockCluster);

      // Should create a defense rally point
      expect(mockCluster.rallyPoints.length).to.be.at.least(1);
      const defensePoint = mockCluster.rallyPoints.find(rp => rp.purpose === "defense");
      expect(defensePoint).to.exist;
      expect(defensePoint?.roomName).to.equal("W1N1");
    });

    it("should not duplicate defense rally points", () => {
      mockCluster.rallyPoints = [
        {
          roomName: "W1N1",
          x: 25,
          y: 25,
          purpose: "defense",
          createdAt: 9000
        }
      ];

      updateClusterRallyPoints(mockCluster);

      // Should not create duplicate defense rally point
      const defensePoints = mockCluster.rallyPoints.filter(rp => rp.purpose === "defense");
      expect(defensePoints.length).to.equal(1);
    });
  });

  describe("getSquadRallyPoint", () => {
    beforeEach(() => {
      // Add spawn to room
      const mockSpawn = {
        pos: { x: 25, y: 25, roomName: "W1N1" },
        structureType: STRUCTURE_SPAWN
      };
      mockRoom.find = (type: any) => {
        if (type === FIND_MY_SPAWNS) return [mockSpawn];
        return [];
      };
    });

    it("should get defense rally point for defense squad", () => {
      const result = getSquadRallyPoint(mockCluster, "defense", "W1N1");
      expect(result).to.not.be.null;
      expect(result?.purpose).to.equal("defense");
      expect(result?.roomName).to.equal("W1N1");
    });

    it("should create defense rally point if it doesn't exist", () => {
      const result = getSquadRallyPoint(mockCluster, "defense", "W1N1");
      expect(result).to.not.be.null;

      // Should have added it to cluster rally points
      const defensePoint = mockCluster.rallyPoints.find(
        rp => rp.roomName === "W1N1" && rp.purpose === "defense"
      );
      expect(defensePoint).to.exist;
    });

    it("should get staging rally point for offensive squads", () => {
      const result = getSquadRallyPoint(mockCluster, "harass");
      expect(result).to.not.be.null;
      expect(result?.purpose).to.equal("staging");
      expect(result?.roomName).to.equal("W1N1");
    });

    it("should update lastUsed timestamp when getting rally point", () => {
      mockCluster.rallyPoints = [
        {
          roomName: "W1N1",
          x: 25,
          y: 25,
          purpose: "defense",
          createdAt: 9000,
          lastUsed: 9500
        }
      ];

      getSquadRallyPoint(mockCluster, "defense", "W1N1");

      const rallyPoint = mockCluster.rallyPoints[0];
      expect(rallyPoint.lastUsed).to.equal(10000);
    });

    it("should return null if room doesn't exist for offensive squads", () => {
      mockCluster.coreRoom = "W2N2"; // Non-existent room
      const result = getSquadRallyPoint(mockCluster, "harass");
      expect(result).to.be.null;
    });
  });
});

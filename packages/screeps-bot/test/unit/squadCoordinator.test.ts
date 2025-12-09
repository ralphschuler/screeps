/**
 * Unit tests for Squad Coordinator
 */

import { assert } from "chai";
import {
  calculateSquadComposition,
  calculateOffensiveSquadComposition,
  selectRallyRoom,
  shouldDissolveSquad,
  getSquadReadiness
} from "../../src/clusters/squadCoordinator";
import type { ClusterMemory, DefenseAssistanceRequest, SquadDefinition } from "../../src/memory/schemas";

describe("Squad Coordinator", () => {
  describe("calculateSquadComposition", () => {
    it("should return minimal composition for low urgency", () => {
      const request: DefenseAssistanceRequest = {
        roomName: "W1N1",
        guardsNeeded: 0,
        rangersNeeded: 0,
        healersNeeded: 0,
        urgency: 1,
        createdAt: 1000,
        threat: "Minor threat",
        assignedCreeps: []
      };

      const composition = calculateSquadComposition(request);

      assert.equal(composition.guards, 1, "Should have 1 guard");
      assert.equal(composition.rangers, 1, "Should have 1 ranger");
      assert.equal(composition.healers, 0, "Should have 0 healers");
      assert.equal(composition.siegeUnits, 0, "Should have 0 siege units");
    });

    it("should return larger composition for high urgency", () => {
      const request: DefenseAssistanceRequest = {
        roomName: "W1N1",
        guardsNeeded: 0,
        rangersNeeded: 0,
        healersNeeded: 0,
        urgency: 3,
        createdAt: 1000,
        threat: "Critical threat",
        assignedCreeps: []
      };

      const composition = calculateSquadComposition(request);

      assert.equal(composition.guards, 3, "Should have 3 guards");
      assert.equal(composition.rangers, 3, "Should have 3 rangers");
      assert.equal(composition.healers, 2, "Should have 2 healers");
      assert.equal(composition.siegeUnits, 1, "Should have 1 siege unit");
    });

    it("should respect specific request needs", () => {
      const request: DefenseAssistanceRequest = {
        roomName: "W1N1",
        guardsNeeded: 5,
        rangersNeeded: 2,
        healersNeeded: 1,
        urgency: 1,
        createdAt: 1000,
        threat: "Specific threat",
        assignedCreeps: []
      };

      const composition = calculateSquadComposition(request);

      assert.isAtLeast(composition.guards, 5, "Should have at least 5 guards");
      assert.isAtLeast(composition.rangers, 2, "Should have at least 2 rangers");
      assert.isAtLeast(composition.healers, 1, "Should have at least 1 healer");
    });
  });

  describe("calculateOffensiveSquadComposition", () => {
    it("should return base composition without intel", () => {
      const composition = calculateOffensiveSquadComposition("W2N2");

      assert.equal(composition.guards, 2, "Should have 2 guards");
      assert.equal(composition.rangers, 3, "Should have 3 rangers");
      assert.equal(composition.healers, 2, "Should have 2 healers");
      assert.equal(composition.siegeUnits, 1, "Should have 1 siege unit");
    });

    it("should scale up for fortified rooms", () => {
      const intel = { towerCount: 4, spawnCount: 3 };
      const composition = calculateOffensiveSquadComposition("W2N2", intel);

      assert.isAtLeast(composition.healers, 2, "Should have more healers for towers");
      assert.isAtLeast(composition.siegeUnits, 1, "Should have siege units");
      assert.isAtLeast(composition.guards, 2, "Should have more guards");
    });

    it("should handle minimal defenses", () => {
      const intel = { towerCount: 1, spawnCount: 1 };
      const composition = calculateOffensiveSquadComposition("W2N2", intel);

      // Should still have reasonable composition
      assert.isAtLeast(composition.rangers, 3, "Should have rangers");
      assert.isAtLeast(composition.healers, 2, "Should have healers");
    });
  });

  describe("selectRallyRoom", () => {
    it("should select closest member room to target", () => {
      const cluster: Partial<ClusterMemory> = {
        coreRoom: "W5N5",
        memberRooms: ["W5N5", "W4N5", "W5N4"]
      };

      // Mock Game.map.getRoomLinearDistance
      (global as any).Game = {
        map: {
          getRoomLinearDistance: (room1: string, room2: string) => {
            if (room1 === "W4N5" && room2 === "W3N5") return 1;
            if (room1 === "W5N5" && room2 === "W3N5") return 2;
            if (room1 === "W5N4" && room2 === "W3N5") return 3;
            return 10;
          }
        }
      };

      const rallyRoom = selectRallyRoom(cluster as ClusterMemory, "W3N5");

      assert.equal(rallyRoom, "W4N5", "Should select closest room");
    });

    it("should fallback to core room if no members", () => {
      const cluster: Partial<ClusterMemory> = {
        coreRoom: "W5N5",
        memberRooms: []
      };

      const rallyRoom = selectRallyRoom(cluster as ClusterMemory, "W3N5");

      assert.equal(rallyRoom, "W5N5", "Should fallback to core room");
    });
  });

  describe("shouldDissolveSquad", () => {
    beforeEach(() => {
      (global as any).Game = {
        time: 1000,
        creeps: {},
        rooms: {}
      };
    });

    it("should dissolve squad stuck in gathering", () => {
      const squad: SquadDefinition = {
        id: "test_squad",
        type: "defense",
        members: ["creep1"],
        rallyRoom: "W1N1",
        targetRooms: ["W2N2"],
        state: "gathering",
        createdAt: 600 // 400 ticks ago, exceeds SQUAD_FORMATION_TIMEOUT
      };

      const result = shouldDissolveSquad(squad);

      assert.isTrue(result, "Should dissolve squad that timed out gathering");
    });

    it("should dissolve squad with no members", () => {
      const squad: SquadDefinition = {
        id: "test_squad",
        type: "defense",
        members: [],
        rallyRoom: "W1N1",
        targetRooms: ["W2N2"],
        state: "moving",
        createdAt: 900 // 100 ticks ago
      };

      const result = shouldDissolveSquad(squad);

      assert.isTrue(result, "Should dissolve squad with no members");
    });

    it("should dissolve attacking squad when mission complete", () => {
      const squad: SquadDefinition = {
        id: "test_squad",
        type: "defense",
        members: ["creep1"],
        rallyRoom: "W1N1",
        targetRooms: ["W2N2"],
        state: "attacking",
        createdAt: 800 // 200 ticks ago
      };

      (global as any).Game.rooms = {
        W2N2: {
          find: () => [] // No hostiles
        }
      };

      const result = shouldDissolveSquad(squad);

      assert.isTrue(result, "Should dissolve squad when no hostiles remain");
    });

    it("should not dissolve active squad", () => {
      const squad: SquadDefinition = {
        id: "test_squad",
        type: "defense",
        members: ["creep1", "creep2"],
        rallyRoom: "W1N1",
        targetRooms: ["W2N2"],
        state: "moving",
        createdAt: 950 // 50 ticks ago
      };

      (global as any).Game.creeps = {
        creep1: {},
        creep2: {}
      };

      const result = shouldDissolveSquad(squad);

      assert.isFalse(result, "Should not dissolve active squad");
    });
  });

  describe("getSquadReadiness", () => {
    beforeEach(() => {
      (global as any).Game = {
        creeps: {}
      };
    });

    it("should report ready when minimum requirements met", () => {
      const squad: SquadDefinition = {
        id: "test_squad",
        type: "defense",
        members: ["guard1", "ranger1", "healer1"],
        rallyRoom: "W1N1",
        targetRooms: ["W2N2"],
        state: "gathering",
        createdAt: 1000
      };

      (global as any).Game.creeps = {
        guard1: { memory: { role: "guard" } },
        ranger1: { memory: { role: "ranger" } },
        healer1: { memory: { role: "healer" } }
      };

      const readiness = getSquadReadiness(squad);

      assert.isTrue(readiness.ready, "Squad should be ready");
      assert.equal(readiness.memberCount, 3, "Should have 3 members");
      assert.equal(readiness.missingRoles.length, 0, "Should have no missing roles");
    });

    it("should report not ready with insufficient members", () => {
      const squad: SquadDefinition = {
        id: "test_squad",
        type: "raid",
        members: ["guard1"],
        rallyRoom: "W1N1",
        targetRooms: ["W2N2"],
        state: "gathering",
        createdAt: 1000
      };

      (global as any).Game.creeps = {
        guard1: { memory: { role: "guard" } }
      };

      const readiness = getSquadReadiness(squad);

      assert.isFalse(readiness.ready, "Squad should not be ready");
      assert.equal(readiness.memberCount, 1, "Should have 1 member");
      assert.include(readiness.missingRoles, "ranger", "Should be missing ranger");
    });

    it("should identify missing roles", () => {
      const squad: SquadDefinition = {
        id: "test_squad",
        type: "defense",
        members: ["guard1", "guard2", "guard3"],
        rallyRoom: "W1N1",
        targetRooms: ["W2N2"],
        state: "gathering",
        createdAt: 1000
      };

      (global as any).Game.creeps = {
        guard1: { memory: { role: "guard" } },
        guard2: { memory: { role: "guard" } },
        guard3: { memory: { role: "guard" } }
      };

      const readiness = getSquadReadiness(squad);

      // Squad is "ready" because it has minimum viable members (3 >= 2 for defense)
      // but still reports missing key roles for ideal composition
      assert.isTrue(readiness.ready, "Squad should be ready (meets minimum member count)");
      assert.include(readiness.missingRoles, "ranger", "Should be missing ranger");
      assert.include(readiness.missingRoles, "healer", "Should be missing healer");
    });
  });
});

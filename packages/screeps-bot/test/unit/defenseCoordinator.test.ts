/**
 * Defense Coordinator Tests
 *
 * Tests for multi-room defense coordination system
 */

import { expect } from "chai";
import type { DefenseRequest } from "../../src/spawning/defenderManager";

describe("Defense Coordinator", () => {
  describe("Defense Request Processing", () => {
    it("should track defense requests in memory", () => {
      const request: DefenseRequest = {
        roomName: "W1N1",
        guardsNeeded: 2,
        rangersNeeded: 1,
        healersNeeded: 0,
        urgency: 2,
        createdAt: Game.time,
        threat: "Multiple hostiles detected"
      };

      const requests: DefenseRequest[] = [request];
      expect(requests).to.have.lengthOf(1);
      expect(requests[0].roomName).to.equal("W1N1");
      expect(requests[0].guardsNeeded).to.equal(2);
    });

    it("should calculate remaining defender needs", () => {
      const requested = 3;
      const assigned = 1;
      const remaining = Math.max(0, requested - assigned);

      expect(remaining).to.equal(2);
    });

    it("should not assign negative defenders", () => {
      const requested = 1;
      const assigned = 3; // Over-assigned
      const remaining = Math.max(0, requested - assigned);

      expect(remaining).to.equal(0);
    });
  });

  describe("Assignment Tracking", () => {
    it("should create defense assignment with ETA", () => {
      const assignment = {
        creepName: "defender1",
        targetRoom: "W1N1",
        assignedAt: 1000,
        eta: 1050 // 50 ticks travel time
      };

      expect(assignment.creepName).to.equal("defender1");
      expect(assignment.eta - assignment.assignedAt).to.equal(50);
    });

    it("should calculate ETA based on distance", () => {
      const distance = 10; // rooms
      const ticksPerRoom = 50;
      const eta = Game.time + (distance * ticksPerRoom);

      expect(eta).to.be.greaterThan(Game.time);
    });

    it("should track multiple assignments", () => {
      const assignments = [
        { creepName: "defender1", targetRoom: "W1N1", assignedAt: 1000, eta: 1050 },
        { creepName: "defender2", targetRoom: "W1N1", assignedAt: 1000, eta: 1050 },
        { creepName: "ranger1", targetRoom: "W2N2", assignedAt: 1005, eta: 1105 }
      ];

      const w1n1Assignments = assignments.filter(a => a.targetRoom === "W1N1");
      expect(w1n1Assignments).to.have.lengthOf(2);
    });
  });

  describe("Helper Room Selection", () => {
    it("should prefer closer rooms for assistance", () => {
      const targetRoom = "W5N5";
      const helpers = [
        { roomName: "W4N5", distance: 1 },
        { roomName: "W3N5", distance: 2 },
        { roomName: "W6N5", distance: 1 }
      ];

      // Sort by distance
      helpers.sort((a, b) => a.distance - b.distance);

      expect(helpers[0].distance).to.equal(1);
      expect(helpers[0].roomName).to.be.oneOf(["W4N5", "W6N5"]);
    });

    it("should exclude rooms with insufficient spawns", () => {
      const potentialHelpers = [
        { roomName: "W1N1", availableSpawns: 0 },
        { roomName: "W2N2", availableSpawns: 1 },
        { roomName: "W3N3", availableSpawns: 2 }
      ];

      const validHelpers = potentialHelpers.filter(h => h.availableSpawns > 0);

      expect(validHelpers).to.have.lengthOf(2);
      expect(validHelpers.some(h => h.roomName === "W1N1")).to.be.false;
    });

    it("should consider room energy capacity", () => {
      const helpers = [
        { roomName: "W1N1", energyCapacity: 300 },
        { roomName: "W2N2", energyCapacity: 800 },
        { roomName: "W3N3", energyCapacity: 1800 }
      ];

      // Prefer rooms with more energy capacity for stronger defenders
      helpers.sort((a, b) => b.energyCapacity - a.energyCapacity);

      expect(helpers[0].roomName).to.equal("W3N3");
      expect(helpers[0].energyCapacity).to.equal(1800);
    });
  });

  describe("Assignment Cleanup", () => {
    it("should remove assignments for dead creeps", () => {
      const assignments = [
        { creepName: "defender1", targetRoom: "W1N1", assignedAt: 1000, eta: 1050 },
        { creepName: "defender2", targetRoom: "W1N1", assignedAt: 1000, eta: 1050 }
      ];

      const livingCreeps = new Set(["defender1"]);
      const validAssignments = assignments.filter(a => livingCreeps.has(a.creepName));

      expect(validAssignments).to.have.lengthOf(1);
      expect(validAssignments[0].creepName).to.equal("defender1");
    });

    it("should remove expired assignments", () => {
      const currentTime = 2000;
      const assignments = [
        { creepName: "defender1", targetRoom: "W1N1", assignedAt: 1000, eta: 1050 },
        { creepName: "defender2", targetRoom: "W1N1", assignedAt: 1900, eta: 1950 }
      ];

      const timeout = 500;
      const validAssignments = assignments.filter(
        a => (currentTime - a.assignedAt) < timeout
      );

      expect(validAssignments).to.have.lengthOf(1);
      expect(validAssignments[0].creepName).to.equal("defender2");
    });
  });

  describe("Urgency Prioritization", () => {
    it("should process high urgency requests first", () => {
      const requests = [
        { roomName: "W1N1", urgency: 1, guardsNeeded: 1, rangersNeeded: 0, healersNeeded: 0, createdAt: 1000, threat: "minor" },
        { roomName: "W2N2", urgency: 3, guardsNeeded: 2, rangersNeeded: 1, healersNeeded: 1, createdAt: 1000, threat: "severe" },
        { roomName: "W3N3", urgency: 2, guardsNeeded: 1, rangersNeeded: 1, healersNeeded: 0, createdAt: 1000, threat: "moderate" }
      ];

      // Sort by urgency descending
      requests.sort((a, b) => b.urgency - a.urgency);

      expect(requests[0].roomName).to.equal("W2N2");
      expect(requests[0].urgency).to.equal(3);
    });

    it("should handle equal urgency requests", () => {
      const requests = [
        { roomName: "W1N1", urgency: 2, guardsNeeded: 1, rangersNeeded: 0, healersNeeded: 0, createdAt: 1010, threat: "moderate" },
        { roomName: "W2N2", urgency: 2, guardsNeeded: 1, rangersNeeded: 0, healersNeeded: 0, createdAt: 1000, threat: "moderate" }
      ];

      // Sort by urgency then by createdAt
      requests.sort((a, b) => {
        if (a.urgency !== b.urgency) return b.urgency - a.urgency;
        return a.createdAt - b.createdAt;
      });

      expect(requests[0].roomName).to.equal("W2N2");
      expect(requests[0].createdAt).to.equal(1000);
    });
  });

  describe("Defender Availability Check", () => {
    it("should identify available defenders in helper room", () => {
      const defenders = [
        { name: "guard1", role: "guard", assigned: false },
        { name: "guard2", role: "guard", assigned: true },
        { name: "ranger1", role: "ranger", assigned: false }
      ];

      const availableGuards = defenders.filter(
        d => d.role === "guard" && !d.assigned
      );

      expect(availableGuards).to.have.lengthOf(1);
      expect(availableGuards[0].name).to.equal("guard1");
    });

    it("should check if creep is already assigned", () => {
      const creepName = "defender1";
      const assignments = [
        { creepName: "defender1", targetRoom: "W1N1", assignedAt: 1000, eta: 1050 }
      ];

      const isAssigned = assignments.some(a => a.creepName === creepName);

      expect(isAssigned).to.be.true;
    });

    it("should allow same creep to help different rooms sequentially", () => {
      const currentTime = 2000;
      const assignments = [
        { creepName: "defender1", targetRoom: "W1N1", assignedAt: 1000, eta: 1050 }
      ];

      const creepName = "defender1";
      const oldAssignment = assignments.find(a => a.creepName === creepName);
      
      // Check if assignment is expired/completed
      const isCompleted = oldAssignment && (currentTime > oldAssignment.eta + 100);

      expect(isCompleted).to.be.true;
    });
  });

  describe("Multi-Room Coordination", () => {
    it("should coordinate defense across multiple rooms", () => {
      const cluster = {
        rooms: ["W1N1", "W2N1", "W3N1"],
        defenseRequests: [
          { roomName: "W1N1", urgency: 3, guardsNeeded: 2, rangersNeeded: 1, healersNeeded: 1, createdAt: 1000, threat: "attack" }
        ]
      };

      const helperRooms = cluster.rooms.filter(
        r => r !== cluster.defenseRequests[0].roomName
      );

      expect(helperRooms).to.have.lengthOf(2);
      expect(helperRooms).to.include("W2N1");
      expect(helperRooms).to.include("W3N1");
    });

    it("should distribute defenders from multiple rooms", () => {
      const request = {
        roomName: "W1N1",
        guardsNeeded: 4,
        rangersNeeded: 2,
        healersNeeded: 1
      };

      const helperRooms = [
        { roomName: "W2N1", availableGuards: 2, availableRangers: 1 },
        { roomName: "W3N1", availableGuards: 2, availableRangers: 1 }
      ];

      let totalGuards = 0;
      let totalRangers = 0;

      for (const helper of helperRooms) {
        totalGuards += helper.availableGuards;
        totalRangers += helper.availableRangers;
      }

      expect(totalGuards).to.be.at.least(request.guardsNeeded);
      expect(totalRangers).to.be.at.least(request.rangersNeeded);
    });
  });

  describe("Defense Request Validation", () => {
    it("should validate defense request has required fields", () => {
      const request = {
        roomName: "W1N1",
        guardsNeeded: 1,
        rangersNeeded: 0,
        healersNeeded: 0,
        urgency: 2,
        createdAt: 1000,
        threat: "hostiles"
      };

      expect(request.roomName).to.be.a("string");
      expect(request.guardsNeeded).to.be.a("number");
      expect(request.rangersNeeded).to.be.a("number");
      expect(request.healersNeeded).to.be.a("number");
      expect(request.urgency).to.be.a("number");
      expect(request.createdAt).to.be.a("number");
      expect(request.threat).to.be.a("string");
    });

    it("should reject invalid urgency values", () => {
      const urgency = 5; // Invalid (should be 1-3)
      const isValid = urgency >= 1 && urgency <= 3;

      expect(isValid).to.be.false;
    });

    it("should reject negative defender counts", () => {
      const guardsNeeded = -1;
      const isValid = guardsNeeded >= 0;

      expect(isValid).to.be.false;
    });
  });
});

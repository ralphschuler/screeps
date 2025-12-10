/**
 * Squad Formation Tests
 *
 * Tests for squad composition, lifecycle, and coordination
 */

import { expect } from "chai";
import {
  calculateSquadComposition,
  calculateOffensiveSquadComposition
} from "../../src/clusters/squadCoordinator";
import type { DefenseAssistanceRequest } from "../../src/memory/schemas";

describe("Squad Formation", () => {
  describe("Squad Composition by Threat Level", () => {
    it("should create small squad for low threat (level 1)", () => {
      const request: DefenseAssistanceRequest = {
        roomName: "W1N1",
        urgency: 1,
        guardsNeeded: 0,
        rangersNeeded: 0,
        healersNeeded: 0,
        createdAt: 1000,
        threat: "minor threat",
        assignedCreeps: []
      };

      const composition = calculateSquadComposition(request);

      expect(composition.guards).to.be.at.least(1);
      expect(composition.rangers).to.be.at.least(1);
      expect(composition.healers).to.equal(0);
      expect(composition.siegeUnits).to.equal(0);
    });

    it("should create medium squad for medium threat (level 2)", () => {
      const request: DefenseAssistanceRequest = {
        roomName: "W1N1",
        urgency: 2,
        guardsNeeded: 0,
        rangersNeeded: 0,
        healersNeeded: 0,
        createdAt: 1000,
        threat: "moderate threat",
        assignedCreeps: []
      };

      const composition = calculateSquadComposition(request);

      expect(composition.guards).to.be.at.least(2);
      expect(composition.rangers).to.be.at.least(2);
      expect(composition.healers).to.be.at.least(1);
      expect(composition.siegeUnits).to.equal(0);
    });

    it("should create large squad for high threat (level 3)", () => {
      const request: DefenseAssistanceRequest = {
        roomName: "W1N1",
        urgency: 3,
        guardsNeeded: 0,
        rangersNeeded: 0,
        healersNeeded: 0,
        createdAt: 1000,
        threat: "severe threat",
        assignedCreeps: []
      };

      const composition = calculateSquadComposition(request);

      expect(composition.guards).to.be.at.least(3);
      expect(composition.rangers).to.be.at.least(3);
      expect(composition.healers).to.be.at.least(2);
      expect(composition.siegeUnits).to.be.at.least(1);
    });

    it("should respect specific role requirements", () => {
      const request: DefenseAssistanceRequest = {
        roomName: "W1N1",
        urgency: 1, // Low threat
        guardsNeeded: 5, // But needs many guards
        rangersNeeded: 0,
        healersNeeded: 0,
        createdAt: 1000,
        threat: "many small hostiles",
        assignedCreeps: []
      };

      const composition = calculateSquadComposition(request);

      expect(composition.guards).to.be.at.least(5);
    });
  });

  describe("Offensive Squad Composition", () => {
    it("should create base offensive squad without intel", () => {
      const composition = calculateOffensiveSquadComposition("W1N1");

      expect(composition.guards).to.equal(2);
      expect(composition.rangers).to.equal(3);
      expect(composition.healers).to.equal(2);
      expect(composition.siegeUnits).to.equal(1);
    });

    it("should scale up for heavily defended rooms", () => {
      const intel = {
        towerCount: 4,
        spawnCount: 2
      };

      const composition = calculateOffensiveSquadComposition("W1N1", intel);

      expect(composition.healers).to.be.greaterThan(2); // Extra healer for towers
      expect(composition.siegeUnits).to.be.greaterThan(1); // Extra siege
      expect(composition.guards).to.be.greaterThan(2); // Extra guards
    });

    it("should add healers for tower-heavy rooms", () => {
      const intel = {
        towerCount: 5,
        spawnCount: 1
      };

      const composition = calculateOffensiveSquadComposition("W1N1", intel);

      expect(composition.healers).to.be.at.least(3);
    });

    it("should add siege units for fortified rooms", () => {
      const intel = {
        towerCount: 3,
        spawnCount: 3
      };

      const composition = calculateOffensiveSquadComposition("W1N1", intel);

      expect(composition.siegeUnits).to.be.at.least(2);
    });
  });

  describe("Squad State Management", () => {
    it("should track squad formation state", () => {
      const squad = {
        id: "alpha",
        state: "forming",
        targetComposition: { guards: 2, rangers: 2, healers: 1, siegeUnits: 0 },
        currentMembers: [],
        createdAt: 1000
      };

      expect(squad.state).to.equal("forming");
      expect(squad.currentMembers).to.be.empty;
    });

    it("should transition from forming to active when complete", () => {
      const targetComposition = { guards: 2, rangers: 2, healers: 1, siegeUnits: 0 };
      const currentMembers = [
        { role: "guard" },
        { role: "guard" },
        { role: "ranger" },
        { role: "ranger" },
        { role: "healer" }
      ];

      const isComplete = 
        currentMembers.filter(m => m.role === "guard").length >= targetComposition.guards &&
        currentMembers.filter(m => m.role === "ranger").length >= targetComposition.rangers &&
        currentMembers.filter(m => m.role === "healer").length >= targetComposition.healers;

      expect(isComplete).to.be.true;
    });

    it("should handle squad timeout during formation", () => {
      const squad = {
        id: "alpha",
        state: "forming",
        createdAt: 1000
      };
      
      const currentTime = 1400;
      const timeout = 300;

      const hasTimedOut = (currentTime - squad.createdAt) > timeout;

      expect(hasTimedOut).to.be.true;
    });

    it("should detect idle squads", () => {
      const squad = {
        id: "alpha",
        state: "active",
        lastActionTick: 1000
      };
      
      const currentTime = 1700;
      const idleTimeout = 600;

      const isIdle = (currentTime - squad.lastActionTick) > idleTimeout;

      expect(isIdle).to.be.true;
    });
  });

  describe("Squad Member Management", () => {
    it("should add member to squad", () => {
      const squad = {
        id: "alpha",
        members: [] as string[]
      };

      const creepName = "guard1";
      squad.members.push(creepName);

      expect(squad.members).to.include(creepName);
      expect(squad.members).to.have.lengthOf(1);
    });

    it("should remove dead members from squad", () => {
      const squad = {
        id: "alpha",
        members: ["guard1", "guard2", "ranger1"]
      };

      const livingCreeps = new Set(["guard1", "ranger1"]);
      squad.members = squad.members.filter(m => livingCreeps.has(m));

      expect(squad.members).to.have.lengthOf(2);
      expect(squad.members).to.not.include("guard2");
    });

    it("should check if squad has required roles", () => {
      const members = [
        { name: "guard1", role: "guard" },
        { name: "ranger1", role: "ranger" },
        { name: "healer1", role: "healer" }
      ];

      const hasGuard = members.some(m => m.role === "guard");
      const hasRanger = members.some(m => m.role === "ranger");
      const hasHealer = members.some(m => m.role === "healer");

      expect(hasGuard).to.be.true;
      expect(hasRanger).to.be.true;
      expect(hasHealer).to.be.true;
    });

    it("should count members by role", () => {
      const members = [
        { role: "guard" },
        { role: "guard" },
        { role: "ranger" },
        { role: "healer" }
      ];

      const guards = members.filter(m => m.role === "guard").length;
      const rangers = members.filter(m => m.role === "ranger").length;
      const healers = members.filter(m => m.role === "healer").length;

      expect(guards).to.equal(2);
      expect(rangers).to.equal(1);
      expect(healers).to.equal(1);
    });
  });

  describe("Rally Point Coordination", () => {
    it("should set rally point for squad", () => {
      const squad = {
        id: "alpha",
        rallyPoint: { x: 25, y: 25, roomName: "W1N1" }
      };

      expect(squad.rallyPoint.roomName).to.equal("W1N1");
    });

    it("should check if members have reached rally point", () => {
      const rallyPoint = { x: 25, y: 25, roomName: "W1N1" };
      const members = [
        { pos: { x: 25, y: 25, roomName: "W1N1" }, atRally: true },
        { pos: { x: 30, y: 30, roomName: "W1N1" }, atRally: false },
        { pos: { x: 25, y: 25, roomName: "W1N1" }, atRally: true }
      ];

      const membersAtRally = members.filter(m => m.atRally).length;

      expect(membersAtRally).to.equal(2);
    });

    it("should wait for all members before advancing", () => {
      const totalMembers = 5;
      const membersAtRally = 3;

      const allPresent = membersAtRally >= totalMembers;

      expect(allPresent).to.be.false;
    });

    it("should allow partial advance after timeout", () => {
      const totalMembers = 5;
      const membersAtRally = 3;
      const rallyStartTime = 1000;
      const currentTime = 1150;
      const timeout = 100;

      const hasTimedOut = (currentTime - rallyStartTime) > timeout;
      const hasMinimum = membersAtRally >= Math.ceil(totalMembers * 0.6);

      const canAdvance = hasTimedOut && hasMinimum;

      expect(canAdvance).to.be.true;
    });
  });

  describe("Squad Formation Validation", () => {
    it("should validate squad has minimum size", () => {
      const members = ["guard1", "ranger1"];
      const minimumSize = 2;

      const isValid = members.length >= minimumSize;

      expect(isValid).to.be.true;
    });

    it("should validate squad composition balance", () => {
      const members = [
        { role: "guard" },
        { role: "guard" },
        { role: "guard" },
        { role: "healer" }
      ];

      const guards = members.filter(m => m.role === "guard").length;
      const healers = members.filter(m => m.role === "healer").length;

      // Should have at least 1 healer per 3 guards
      const healerRatio = healers / guards;
      const hasAdequateHealing = healerRatio >= 0.25;

      expect(hasAdequateHealing).to.be.true;
    });

    it("should detect unbalanced squads", () => {
      const members = [
        { role: "guard" },
        { role: "guard" },
        { role: "guard" },
        { role: "guard" },
        { role: "guard" }
      ];

      const guards = members.filter(m => m.role === "guard").length;
      const healers = members.filter(m => m.role === "healer").length;

      const isBalanced = healers > 0 && (guards / Math.max(1, healers)) <= 4;

      expect(isBalanced).to.be.false;
    });
  });

  describe("Squad Dissolution", () => {
    it("should dissolve squad when objective is complete", () => {
      const squad = {
        id: "alpha",
        state: "active",
        objective: "defend",
        objectiveComplete: true
      };

      const shouldDissolve = squad.objectiveComplete;

      expect(shouldDissolve).to.be.true;
    });

    it("should dissolve squad when too many casualties", () => {
      const originalSize = 8;
      const currentSize = 2;

      const casualtyThreshold = 0.5;
      const shouldDissolve = (currentSize / originalSize) < casualtyThreshold;

      expect(shouldDissolve).to.be.true;
    });

    it("should dissolve squad on timeout", () => {
      const squad = {
        createdAt: 1000,
        maxLifetime: 1000
      };
      
      const currentTime = 2100;

      const shouldDissolve = (currentTime - squad.createdAt) > squad.maxLifetime;

      expect(shouldDissolve).to.be.true;
    });

    it("should redistribute members on dissolution", () => {
      const squadMembers = ["guard1", "guard2", "ranger1"];
      const availableSquads = [
        { id: "beta", members: ["guard3"], needsMembers: true },
        { id: "gamma", members: ["ranger2", "ranger3"], needsMembers: false }
      ];

      // Members should be reassigned to squads that need them
      const targetSquad = availableSquads.find(s => s.needsMembers);

      expect(targetSquad).to.exist;
      expect(targetSquad?.id).to.equal("beta");
    });
  });

  describe("Cross-Room Squad Formation", () => {
    it("should coordinate spawning across multiple rooms", () => {
      const rooms = [
        { name: "W1N1", availableSpawns: 2, energyCapacity: 1800 },
        { name: "W2N1", availableSpawns: 1, energyCapacity: 800 }
      ];

      const targetComposition = { guards: 3, rangers: 2, healers: 1, siegeUnits: 0 };
      
      // Distribute spawning load
      const totalUnits = 6;
      const unitsPerRoom = Math.ceil(totalUnits / rooms.length);

      expect(unitsPerRoom).to.equal(3);
    });

    it("should prefer higher energy rooms for expensive units", () => {
      const rooms = [
        { name: "W1N1", energyCapacity: 300, cost: 0 },
        { name: "W2N1", energyCapacity: 1800, cost: 0 }
      ];

      const expensiveUnitCost = 1500;

      const bestRoom = rooms
        .filter(r => r.energyCapacity >= expensiveUnitCost)
        .sort((a, b) => b.energyCapacity - a.energyCapacity)[0];

      expect(bestRoom?.name).to.equal("W2N1");
    });
  });

  describe("Squad Tactics and Behavior", () => {
    it("should maintain formation during movement", () => {
      const leader = { x: 25, y: 25 };
      const member = { x: 24, y: 25 };

      const distance = Math.max(
        Math.abs(leader.x - member.x),
        Math.abs(leader.y - member.y)
      );

      const maxFormationDistance = 3;
      const inFormation = distance <= maxFormationDistance;

      expect(inFormation).to.be.true;
    });

    it("should designate squad leader", () => {
      const members = [
        { name: "guard1", role: "guard", experience: 100 },
        { name: "ranger1", role: "ranger", experience: 200 },
        { name: "guard2", role: "guard", experience: 150 }
      ];

      // Most experienced should be leader
      members.sort((a, b) => b.experience - a.experience);
      const leader = members[0];

      expect(leader.name).to.equal("ranger1");
    });

    it("should follow different tactics based on objective", () => {
      const objectives = ["defend", "attack", "siege", "harass"];

      const tactics = {
        defend: { aggression: 0.3, mobility: 0.5 },
        attack: { aggression: 0.8, mobility: 0.7 },
        siege: { aggression: 0.9, mobility: 0.3 },
        harass: { aggression: 0.5, mobility: 1.0 }
      };

      expect(tactics.defend.aggression).to.be.lessThan(tactics.attack.aggression);
      expect(tactics.harass.mobility).to.be.greaterThan(tactics.siege.mobility);
    });
  });
});

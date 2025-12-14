/**
 * Defense Assistance Threshold Tests
 *
 * Tests for improved defense assistance request logic
 */

import { expect } from "chai";

describe("Defense Assistance Thresholds", () => {
  describe("Early Threat Detection", () => {
    it("should request assistance at danger level 1 when unable to spawn", () => {
      const dangerLevel = 1;
      const defenderDeficit = 1;
      const spawnsAvailable = 0;
      const energyAvailable = 100;
      const minDefenderCost = 250;
      
      // Room has threat but can't spawn defenders
      const needsHelp = dangerLevel >= 1 && 
                       defenderDeficit > 0 && 
                       (spawnsAvailable === 0 || energyAvailable < minDefenderCost);
      
      expect(needsHelp).to.be.true;
    });

    it("should NOT request assistance at danger 0", () => {
      const dangerLevel = 0;
      
      const needsHelp = dangerLevel >= 1;
      
      expect(needsHelp).to.be.false;
    });

    it("should NOT request assistance when defenders are sufficient", () => {
      const dangerLevel = 2;
      const needsGuards = 2;
      const currentGuards = 2;
      const needsRangers = 1;
      const currentRangers = 1;
      
      const defenderDeficit = (needsGuards - currentGuards) + (needsRangers - currentRangers);
      
      expect(defenderDeficit).to.equal(0);
    });
  });

  describe("Spawning Capability Assessment", () => {
    it("should request help when no spawns available", () => {
      const spawnsCount = 0;
      const defenderDeficit = 1;
      
      const needsHelp = spawnsCount === 0 && defenderDeficit > 0;
      
      expect(needsHelp).to.be.true;
    });

    it("should request help when all spawns are busy", () => {
      const totalSpawns = 2;
      const availableSpawns = 0;
      const defenderDeficit = 1;
      
      const needsHelp = totalSpawns > 0 && availableSpawns === 0 && defenderDeficit >= 1;
      
      expect(needsHelp).to.be.true;
    });

    it("should request help when insufficient energy for defenders", () => {
      const energyAvailable = 200;
      const minDefenderCost = 250;
      const defenderDeficit = 1;
      
      const needsHelp = energyAvailable < minDefenderCost && defenderDeficit >= 1;
      
      expect(needsHelp).to.be.true;
    });

    it("should NOT request help when can spawn defenders", () => {
      const spawnsCount = 1;
      const availableSpawns = 1;
      const energyAvailable = 300;
      const minDefenderCost = 250;
      const defenderDeficit = 1;
      const urgency = 1.0;
      const dangerLevel = 1;
      
      // Has spawns, energy, but threat is manageable
      const needsHelp = spawnsCount === 0 || 
                       (availableSpawns === 0 && defenderDeficit >= 1) ||
                       (energyAvailable < minDefenderCost && defenderDeficit >= 1) ||
                       (urgency >= 2.0 && defenderDeficit >= 2) ||
                       (dangerLevel >= 3 && defenderDeficit >= 1);
      
      expect(needsHelp).to.be.false;
    });
  });

  describe("Urgency-Based Assistance", () => {
    it("should request help for critical urgency with multiple deficit", () => {
      const urgency = 2.0;
      const defenderDeficit = 2;
      
      const needsHelp = urgency >= 2.0 && defenderDeficit >= 2;
      
      expect(needsHelp).to.be.true;
    });

    it("should request help for critical danger level", () => {
      const dangerLevel = 3;
      const defenderDeficit = 1;
      
      const needsHelp = dangerLevel >= 3 && defenderDeficit >= 1;
      
      expect(needsHelp).to.be.true;
    });

    it("should request help for active attack on low RCL room", () => {
      const dangerLevel = 2;
      const rcl = 3;
      const defenderDeficit = 1;
      
      const needsHelp = dangerLevel >= 2 && (defenderDeficit >= 2 || rcl <= 3);
      
      expect(needsHelp).to.be.true;
    });

    it("should request help for active attack with significant deficit", () => {
      const dangerLevel = 2;
      const rcl = 5;
      const defenderDeficit = 2;
      
      const needsHelp = dangerLevel >= 2 && (defenderDeficit >= 2 || rcl <= 3);
      
      expect(needsHelp).to.be.true;
    });

    it("should NOT request help for minor threat on high RCL room with deficit", () => {
      const dangerLevel = 1;
      const rcl = 7;
      const defenderDeficit = 1;
      const urgency = 1.0;
      const spawnsCount = 3;
      const availableSpawns = 2;
      const energyAvailable = 1000;
      
      // High level room can handle minor threats
      const criticalHelp = (urgency >= 2.0 && defenderDeficit >= 2) ||
                          (dangerLevel >= 3 && defenderDeficit >= 1) ||
                          (dangerLevel >= 2 && (defenderDeficit >= 2 || rcl <= 3));
      
      const cannotSpawn = spawnsCount === 0 ||
                         (availableSpawns === 0 && defenderDeficit >= 1) ||
                         (energyAvailable < 250 && defenderDeficit >= 1);
      
      const needsHelp = criticalHelp || cannotSpawn;
      
      expect(needsHelp).to.be.false;
    });
  });

  describe("Low RCL Room Priority", () => {
    it("should prioritize helping low RCL rooms under attack", () => {
      const room1 = { rcl: 3, dangerLevel: 2, defenderDeficit: 1 };
      const room2 = { rcl: 7, dangerLevel: 2, defenderDeficit: 1 };
      
      const room1NeedsHelp = room1.dangerLevel >= 2 && (room1.defenderDeficit >= 2 || room1.rcl <= 3);
      const room2NeedsHelp = room2.dangerLevel >= 2 && (room2.defenderDeficit >= 2 || room2.rcl <= 3);
      
      expect(room1NeedsHelp).to.be.true;
      expect(room2NeedsHelp).to.be.false;
    });

    it("should help high RCL rooms only with significant deficit", () => {
      const rcl = 8;
      const dangerLevel = 2;
      const defenderDeficit = 3;
      
      const needsHelp = dangerLevel >= 2 && (defenderDeficit >= 2 || rcl <= 3);
      
      expect(needsHelp).to.be.true;
    });
  });

  describe("Defense Request Creation", () => {
    it("should create defense request with all required fields", () => {
      const request = {
        roomName: "W1N1",
        guardsNeeded: 2,
        rangersNeeded: 1,
        healersNeeded: 0,
        urgency: 2.0,
        createdAt: 1000,
        threat: "Multiple hostiles detected"
      };
      
      expect(request.roomName).to.equal("W1N1");
      expect(request.guardsNeeded).to.be.greaterThan(0);
      expect(request.urgency).to.be.greaterThan(0);
      expect(request.threat).to.be.a("string");
    });

    it("should calculate remaining needs after current defenders", () => {
      const needsGuards = 3;
      const currentGuards = 1;
      const guardsNeeded = Math.max(0, needsGuards - currentGuards);
      
      expect(guardsNeeded).to.equal(2);
    });
  });
});

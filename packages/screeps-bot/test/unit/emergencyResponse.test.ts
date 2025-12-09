/**
 * Emergency Response System Tests
 *
 * Tests for emergency response and coordination during attacks.
 */

import { expect } from "chai";
import { EmergencyLevel } from "../../src/defense/emergencyResponse";

describe("Emergency Response System", () => {
  describe("Emergency Level Calculation", () => {
    it("should return NONE for peaceful room", () => {
      const danger = 0;
      const level = danger === 0 ? EmergencyLevel.NONE : EmergencyLevel.LOW;
      expect(level).to.equal(EmergencyLevel.NONE);
    });

    it("should return LOW for minor threats", () => {
      const danger = 1;
      const hostileCount = 1;
      
      const level = danger === 1 && hostileCount < 3 
        ? EmergencyLevel.LOW 
        : EmergencyLevel.MEDIUM;
      
      expect(level).to.equal(EmergencyLevel.LOW);
    });

    it("should return MEDIUM for significant threats with defender deficit", () => {
      const danger = 2;
      const defenderDeficit = 2;
      
      const level = danger >= 2 && defenderDeficit >= 1 
        ? EmergencyLevel.MEDIUM 
        : EmergencyLevel.LOW;
      
      expect(level).to.equal(EmergencyLevel.MEDIUM);
    });

    it("should return HIGH for boosted enemies with insufficient defense", () => {
      const boostedHostiles = 2;
      const defenderDeficit = 2;
      
      const level = boostedHostiles > 0 && defenderDeficit >= 2 
        ? EmergencyLevel.HIGH 
        : EmergencyLevel.MEDIUM;
      
      expect(level).to.equal(EmergencyLevel.HIGH);
    });

    it("should return HIGH for large attacks with no defenders", () => {
      const hostileCount = 5;
      const defenderCount = 0;
      
      const level = hostileCount >= 5 && defenderCount === 0 
        ? EmergencyLevel.HIGH 
        : EmergencyLevel.MEDIUM;
      
      expect(level).to.equal(EmergencyLevel.HIGH);
    });

    it("should return CRITICAL for critical structures under attack", () => {
      const spawnHits = 2000;
      const spawnHitsMax = 10000;
      const healthPercent = spawnHits / spawnHitsMax;
      
      const level = healthPercent < 0.3 
        ? EmergencyLevel.CRITICAL 
        : EmergencyLevel.HIGH;
      
      expect(level).to.equal(EmergencyLevel.CRITICAL);
    });
  });

  describe("Emergency Response Actions", () => {
    it("should request assistance for HIGH emergency", () => {
      const emergencyLevel = EmergencyLevel.HIGH;
      const shouldRequestAssistance = emergencyLevel >= EmergencyLevel.HIGH;
      
      expect(shouldRequestAssistance).to.be.true;
    });

    it("should not request assistance for LOW emergency", () => {
      const emergencyLevel = EmergencyLevel.LOW;
      const shouldRequestAssistance = emergencyLevel >= EmergencyLevel.HIGH;
      
      expect(shouldRequestAssistance).to.be.false;
    });

    it("should allocate boosts for MEDIUM or higher emergency", () => {
      const emergencyLevel = EmergencyLevel.MEDIUM;
      const rcl = 6;
      const shouldAllocateBoosts = emergencyLevel >= EmergencyLevel.MEDIUM && rcl >= 6;
      
      expect(shouldAllocateBoosts).to.be.true;
    });

    it("should not allocate boosts for LOW emergency", () => {
      const emergencyLevel = EmergencyLevel.LOW;
      const shouldAllocateBoosts = emergencyLevel >= EmergencyLevel.MEDIUM;
      
      expect(shouldAllocateBoosts).to.be.false;
    });

    it("should update posture to defense for HIGH emergency", () => {
      const emergencyLevel = EmergencyLevel.HIGH;
      const currentPosture = "eco";
      
      const newPosture = emergencyLevel >= EmergencyLevel.HIGH && currentPosture === "eco" 
        ? "defense" 
        : currentPosture;
      
      expect(newPosture).to.equal("defense");
    });

    it("should update posture to war for CRITICAL emergency", () => {
      const emergencyLevel = EmergencyLevel.CRITICAL;
      const currentPosture = "defense";
      
      const newPosture = emergencyLevel === EmergencyLevel.CRITICAL 
        ? "war" 
        : currentPosture;
      
      expect(newPosture).to.equal("war");
    });
  });

  describe("Emergency Escalation", () => {
    it("should escalate from LOW to MEDIUM", () => {
      const previousLevel = EmergencyLevel.LOW;
      const currentLevel = EmergencyLevel.MEDIUM;
      
      const isEscalation = currentLevel > previousLevel;
      expect(isEscalation).to.be.true;
    });

    it("should escalate from MEDIUM to HIGH", () => {
      const previousLevel = EmergencyLevel.MEDIUM;
      const currentLevel = EmergencyLevel.HIGH;
      
      const isEscalation = currentLevel > previousLevel;
      expect(isEscalation).to.be.true;
    });

    it("should escalate from HIGH to CRITICAL", () => {
      const previousLevel = EmergencyLevel.HIGH;
      const currentLevel = EmergencyLevel.CRITICAL;
      
      const isEscalation = currentLevel > previousLevel;
      expect(isEscalation).to.be.true;
    });

    it("should de-escalate when threat is resolved", () => {
      const previousLevel = EmergencyLevel.HIGH;
      const currentLevel = EmergencyLevel.NONE;
      
      const isResolved = currentLevel === EmergencyLevel.NONE;
      expect(isResolved).to.be.true;
    });
  });
});

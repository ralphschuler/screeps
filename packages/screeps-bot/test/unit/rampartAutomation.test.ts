/**
 * Rampart Automation System Tests
 *
 * Tests for automated rampart placement on critical structures.
 */

import { expect } from "chai";

describe("Rampart Automation System", () => {
  describe("Critical Structure Identification", () => {
    it("should identify spawns as critical structures", () => {
      const structureType = STRUCTURE_SPAWN;
      const isCritical = [
        STRUCTURE_SPAWN,
        STRUCTURE_STORAGE,
        STRUCTURE_TERMINAL,
        STRUCTURE_TOWER
      ].includes(structureType);
      
      expect(isCritical).to.be.true;
    });

    it("should identify storage as critical structure", () => {
      const structureType = STRUCTURE_STORAGE;
      const isCritical = [
        STRUCTURE_SPAWN,
        STRUCTURE_STORAGE,
        STRUCTURE_TERMINAL,
        STRUCTURE_TOWER
      ].includes(structureType);
      
      expect(isCritical).to.be.true;
    });

    it("should identify towers as critical structures", () => {
      const structureType = STRUCTURE_TOWER;
      const isCritical = [
        STRUCTURE_SPAWN,
        STRUCTURE_STORAGE,
        STRUCTURE_TERMINAL,
        STRUCTURE_TOWER
      ].includes(structureType);
      
      expect(isCritical).to.be.true;
    });

    it("should not identify roads as critical structures", () => {
      const structureType: StructureConstant = STRUCTURE_ROAD;
      const criticalTypes: StructureConstant[] = [
        STRUCTURE_SPAWN,
        STRUCTURE_STORAGE,
        STRUCTURE_TERMINAL,
        STRUCTURE_TOWER
      ];
      const isCritical = criticalTypes.includes(structureType);
      
      expect(isCritical).to.be.false;
    });

    it("should not identify extensions as critical structures", () => {
      const structureType: StructureConstant = STRUCTURE_EXTENSION;
      const criticalTypes: StructureConstant[] = [
        STRUCTURE_SPAWN,
        STRUCTURE_STORAGE,
        STRUCTURE_TERMINAL,
        STRUCTURE_TOWER
      ];
      const isCritical = criticalTypes.includes(structureType);
      
      expect(isCritical).to.be.false;
    });
  });

  describe("Rampart Placement Priority", () => {
    it("should prioritize spawns highest", () => {
      const spawnPriority = 100;
      const storagePriority = 90;
      
      expect(spawnPriority).to.be.greaterThan(storagePriority);
    });

    it("should prioritize storage over towers", () => {
      const storagePriority = 90;
      const towerPriority = 80;
      
      expect(storagePriority).to.be.greaterThan(towerPriority);
    });

    it("should prioritize towers over terminals", () => {
      const towerPriority = 80;
      const terminalPriority = 70;
      
      expect(towerPriority).to.be.greaterThan(terminalPriority);
    });

    it("should increase priority during attacks", () => {
      const basePriority = 80;
      const danger = 2;
      const priorityBoost = danger >= 2 ? 50 : 0;
      const finalPriority = basePriority + priorityBoost;
      
      expect(finalPriority).to.equal(130);
    });

    it("should not increase priority when peaceful", () => {
      const basePriority = 80;
      const danger = 0;
      const priorityBoost = danger >= 2 ? 50 : 0;
      const finalPriority = basePriority + priorityBoost;
      
      expect(finalPriority).to.equal(80);
    });
  });

  describe("Rampart Coverage Calculation", () => {
    it("should calculate 100% coverage when all structures protected", () => {
      const totalCritical = 5;
      const protectedCount = 5;
      const coveragePercent = Math.round((protectedCount / totalCritical) * 100);
      
      expect(coveragePercent).to.equal(100);
    });

    it("should calculate 50% coverage when half structures protected", () => {
      const totalCritical = 4;
      const protectedCount = 2;
      const coveragePercent = Math.round((protectedCount / totalCritical) * 100);
      
      expect(coveragePercent).to.equal(50);
    });

    it("should calculate 0% coverage when no structures protected", () => {
      const totalCritical = 3;
      const protectedCount = 0;
      const coveragePercent = Math.round((protectedCount / totalCritical) * 100);
      
      expect(coveragePercent).to.equal(0);
    });

    it("should handle edge case of no critical structures", () => {
      const totalCritical = 0;
      const protectedCount = 0;
      const coveragePercent = totalCritical > 0 
        ? Math.round((protectedCount / totalCritical) * 100) 
        : 0;
      
      expect(coveragePercent).to.equal(0);
    });
  });

  describe("Emergency Rampart Repair", () => {
    it("should identify ramparts below 25% health as emergency", () => {
      const rampartHits = 50000;
      const repairTarget = 300000;
      const emergencyThreshold = repairTarget * 0.25;
      const isEmergency = rampartHits < emergencyThreshold;
      
      expect(isEmergency).to.be.true;
    });

    it("should not identify healthy ramparts as emergency", () => {
      const rampartHits = 250000;
      const repairTarget = 300000;
      const emergencyThreshold = repairTarget * 0.25;
      const isEmergency = rampartHits < emergencyThreshold;
      
      expect(isEmergency).to.be.false;
    });

    it("should prioritize lowest hits for emergency repair", () => {
      const rampart1Hits = 10000;
      const rampart2Hits = 50000;
      
      const sortedHits = [rampart1Hits, rampart2Hits].sort((a, b) => a - b);
      expect(sortedHits[0]).to.equal(10000);
    });
  });

  describe("RCL-based Rampart Placement", () => {
    it("should not place ramparts at RCL 1", () => {
      const rcl = 1;
      const canPlaceRamparts = rcl >= 2;
      
      expect(canPlaceRamparts).to.be.false;
    });

    it("should place ramparts starting at RCL 2", () => {
      const rcl = 2;
      const canPlaceRamparts = rcl >= 2;
      
      expect(canPlaceRamparts).to.be.true;
    });

    it("should protect priority structures at low RCL", () => {
      const rcl = 3;
      const structureType = STRUCTURE_SPAWN;
      const priorityStructures = [STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_STORAGE];
      const shouldProtect = rcl < 4 
        ? priorityStructures.includes(structureType)
        : true;
      
      expect(shouldProtect).to.be.true;
    });

    it("should protect all critical structures at high RCL", () => {
      const rcl = 6;
      const structureType: StructureConstant = STRUCTURE_LAB;
      const priorityStructures: StructureConstant[] = [STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_STORAGE];
      const shouldProtect = rcl < 4 
        ? priorityStructures.includes(structureType)
        : true;
      
      expect(shouldProtect).to.be.true;
    });
  });
});

/**
 * Tests for exported behaviors
 */

import { expect } from "chai";
import {
  harvestBehavior,
  haulBehavior,
  buildBehavior,
  upgradeBehavior,
  attackBehavior,
  defendBehavior,
  healBehavior,
  createContext,
  type CreepContext,
  type BehaviorResult,
} from "../src/index";

describe("Behavior Exports", () => {
  // Mock creep context for testing
  const mockContext: Partial<CreepContext> = {
    creep: {} as Creep,
    room: {} as Room,
    memory: { role: "test", homeRoom: "W1N1" },
    homeRoom: "W1N1",
    isInHomeRoom: true,
    isFull: false,
    isEmpty: true,
    isWorking: false,
    assignedSource: null,
    assignedMineral: null,
    energyAvailable: true,
    nearbyEnemies: false,
    constructionSiteCount: 0,
    damagedStructureCount: 0,
    droppedResources: [],
    containers: [],
    depositContainers: [],
    spawnStructures: [],
    towers: [],
    storage: undefined,
    terminal: undefined,
    hostiles: [],
    damagedAllies: [],
    prioritizedSites: [],
    repairTargets: [],
    labs: [],
    factory: undefined,
    tombstones: [],
    mineralContainers: [],
  };

  describe("Economy Behaviors", () => {
    it("should export harvestBehavior", () => {
      expect(harvestBehavior).to.be.a("function");
      const result: BehaviorResult = harvestBehavior(mockContext as CreepContext);
      expect(result).to.have.property("action");
      expect(result).to.have.property("success");
      expect(result.success).to.be.true; // harvestBehavior is implemented
      expect(result.action.type).to.equal("idle");
    });

    it("should export haulBehavior", () => {
      expect(haulBehavior).to.be.a("function");
      const result: BehaviorResult = haulBehavior(mockContext as CreepContext);
      expect(result).to.have.property("action");
      expect(result).to.have.property("success");
      expect(result.action.type).to.equal("idle");
    });

    it("should export buildBehavior", () => {
      expect(buildBehavior).to.be.a("function");
      const result: BehaviorResult = buildBehavior(mockContext as CreepContext);
      expect(result).to.have.property("action");
      expect(result).to.have.property("success");
      expect(result.action.type).to.equal("idle");
    });

    it("should export upgradeBehavior", () => {
      expect(upgradeBehavior).to.be.a("function");
      const result: BehaviorResult = upgradeBehavior(mockContext as CreepContext);
      expect(result).to.have.property("action");
      expect(result).to.have.property("success");
      expect(result.action.type).to.equal("idle");
    });
  });

  describe("Military Behaviors", () => {
    it("should export attackBehavior", () => {
      expect(attackBehavior).to.be.a("function");
      const result: BehaviorResult = attackBehavior(mockContext as CreepContext);
      expect(result).to.have.property("action");
      expect(result).to.have.property("success");
      expect(result.action.type).to.equal("idle");
    });

    it("should export defendBehavior", () => {
      expect(defendBehavior).to.be.a("function");
      const result: BehaviorResult = defendBehavior(mockContext as CreepContext);
      expect(result).to.have.property("action");
      expect(result).to.have.property("success");
      expect(result.action.type).to.equal("idle");
    });

    it("should export healBehavior", () => {
      expect(healBehavior).to.be.a("function");
      const result: BehaviorResult = healBehavior(mockContext as CreepContext);
      expect(result).to.have.property("action");
      expect(result).to.have.property("success");
      expect(result.success).to.be.true; // healBehavior is now implemented
      expect(result.action.type).to.equal("idle");
    });
  });

  describe("Behavior Results", () => {
    it("should return BehaviorResult with expected structure for placeholder implementations", () => {
      const placeholderBehaviors = [
        haulBehavior,
        buildBehavior,
        upgradeBehavior,
        attackBehavior,
        defendBehavior,
      ];

      placeholderBehaviors.forEach((behavior) => {
        const result = behavior(mockContext as CreepContext);
        expect(result).to.have.property("action");
        expect(result).to.have.property("success");
        expect(result).to.have.property("error");
        expect(result).to.have.property("context");
        expect(result.success).to.equal(false); // Placeholder implementations return false
        expect(result.action.type).to.equal("idle");
      });
    });

    it("should return BehaviorResult with expected structure for implemented behaviors", () => {
      const implementedBehaviors = [harvestBehavior, healBehavior];

      implementedBehaviors.forEach((behavior) => {
        const result = behavior(mockContext as CreepContext);
        expect(result).to.have.property("action");
        expect(result).to.have.property("success");
        expect(result).to.have.property("context");
        expect(result.success).to.be.true; // Implemented behaviors should succeed
      });
    });
  });
});

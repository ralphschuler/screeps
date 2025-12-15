import { expect } from "chai";
import { labManager } from "../../src/labs/labManager";
import { chemistryPlanner } from "../../src/labs/chemistryPlanner";
import { boostManager } from "../../src/labs/boostManager";
import { labConfigManager } from "../../src/labs/labConfig";
import { createDefaultSwarmState } from "../../src/memory/schemas";
import { Game, Memory } from "./mock";

describe("Lab System", () => {
  beforeEach(() => {
    // Reset global mocks
    // @ts-ignore: allow adding Game to global
    global.Game = {
      ...Game,
      time: 1000,
      rooms: {},
      getObjectById: () => null
    };
    // @ts-ignore: allow adding Memory to global
    global.Memory = { ...Memory, rooms: {} };
  });

  describe("ChemistryPlanner - Reaction Chain Calculation", () => {
    it("should calculate simple reaction chain", () => {
      const availableResources: Partial<Record<ResourceConstant, number>> = {
        [RESOURCE_HYDROGEN]: 5000,
        [RESOURCE_OXYGEN]: 5000
      };

      const chain = chemistryPlanner.calculateReactionChain(
        RESOURCE_HYDROXIDE,
        availableResources
      );

      expect(chain).to.have.length(1);
      expect(chain[0]?.product).to.equal(RESOURCE_HYDROXIDE);
      expect(chain[0]?.input1).to.equal(RESOURCE_HYDROGEN);
      expect(chain[0]?.input2).to.equal(RESOURCE_OXYGEN);
    });

    it("should calculate multi-step reaction chain", () => {
      const availableResources: Partial<Record<ResourceConstant, number>> = {
        [RESOURCE_HYDROGEN]: 5000,
        [RESOURCE_OXYGEN]: 5000,
        [RESOURCE_UTRIUM]: 5000
      };

      const chain = chemistryPlanner.calculateReactionChain(
        RESOURCE_UTRIUM_ACID,
        availableResources
      );

      // Should include: hydroxide -> utrium_hydride -> utrium_acid
      expect(chain.length).to.be.greaterThan(1);
      
      // Check chain includes intermediate steps
      const products = chain.map(r => r.product);
      expect(products).to.include(RESOURCE_HYDROXIDE);
      expect(products).to.include(RESOURCE_UTRIUM_HYDRIDE);
      expect(products).to.include(RESOURCE_UTRIUM_ACID);
    });

    it("should handle missing base resources", () => {
      const availableResources: Partial<Record<ResourceConstant, number>> = {
        // Missing hydrogen
        [RESOURCE_OXYGEN]: 5000
      };

      const chain = chemistryPlanner.calculateReactionChain(
        RESOURCE_HYDROXIDE,
        availableResources
      );

      // Chain should be empty if base resources are missing
      expect(chain).to.be.empty;
    });

    it("should get reaction for a compound", () => {
      const reaction = chemistryPlanner.getReaction(RESOURCE_HYDROXIDE);
      
      expect(reaction).to.not.be.undefined;
      expect(reaction?.product).to.equal(RESOURCE_HYDROXIDE);
      expect(reaction?.input1).to.equal(RESOURCE_HYDROGEN);
      expect(reaction?.input2).to.equal(RESOURCE_OXYGEN);
    });
  });

  describe("ChemistryPlanner - Resource Checking", () => {
    it("should check if terminal has resources for reaction", () => {
      const mockTerminal = {
        store: {
          [RESOURCE_HYDROGEN]: 2000,
          [RESOURCE_OXYGEN]: 2000
        }
      } as unknown as StructureTerminal;

      const reaction = chemistryPlanner.getReaction(RESOURCE_HYDROXIDE);
      expect(reaction).to.not.be.undefined;

      const hasResources = chemistryPlanner.hasResourcesForReaction(
        mockTerminal,
        reaction!,
        1000
      );

      expect(hasResources).to.be.true;
    });

    it("should return false when terminal lacks resources", () => {
      const mockTerminal = {
        store: {
          [RESOURCE_HYDROGEN]: 50,
          [RESOURCE_OXYGEN]: 2000
        }
      } as unknown as StructureTerminal;

      const reaction = chemistryPlanner.getReaction(RESOURCE_HYDROXIDE);
      expect(reaction).to.not.be.undefined;

      const hasResources = chemistryPlanner.hasResourcesForReaction(
        mockTerminal,
        reaction!,
        1000
      );

      expect(hasResources).to.be.false;
    });
  });

  describe("ChemistryPlanner - Target Compound Selection", () => {
    it("should have planReactions method", () => {
      // The planReactions method requires complex room/terminal mocking
      // Just verify the method exists
      expect(chemistryPlanner.planReactions).to.be.a("function");
    });
  });

  describe("LabManager - Resource Management", () => {
    it("should detect labs needing resources", () => {
      // This would require more complex mocking of Game.rooms and labs
      // For now, test the interface exists
      expect(labManager.getLabResourceNeeds).to.be.a("function");
    });

    it("should detect labs with overflow", () => {
      expect(labManager.getLabOverflow).to.be.a("function");
    });

    it("should check if labs are ready for reaction", () => {
      expect(labManager.areLabsReady).to.be.a("function");
    });
  });

  describe("BoostManager - Boost Application", () => {
    it("should determine if creep should be boosted based on danger level", () => {
      const swarm = createDefaultSwarmState();
      swarm.danger = 3; // High danger
      swarm.missingStructures.labs = false; // Has labs

      const mockCreep = {
        memory: {
          role: "soldier",
          boosted: false
        },
        room: {
          name: "W1N1"
        },
        body: [{ type: ATTACK, hits: 100 }]
      } as unknown as Creep;

      const shouldBoost = boostManager.shouldBoost(mockCreep, swarm);
      expect(shouldBoost).to.be.true;
    });

    it("should not boost if danger level is too low", () => {
      const swarm = createDefaultSwarmState();
      swarm.danger = 0; // No danger

      const mockCreep = {
        memory: {
          role: "soldier",
          boosted: false
        },
        room: {
          name: "W1N1"
        },
        body: [{ type: ATTACK, hits: 100 }]
      } as unknown as Creep;

      const shouldBoost = boostManager.shouldBoost(mockCreep, swarm);
      expect(shouldBoost).to.be.false;
    });

    it("should not boost if creep is already boosted", () => {
      const swarm = createDefaultSwarmState();
      swarm.danger = 3;

      const mockCreep = {
        memory: {
          role: "soldier",
          boosted: true // Already boosted
        },
        room: {
          name: "W1N1"
        },
        body: [{ type: ATTACK, hits: 100 }]
      } as unknown as Creep;

      const shouldBoost = boostManager.shouldBoost(mockCreep, swarm);
      expect(shouldBoost).to.be.false;
    });

    it("should check if boost labs are ready", () => {
      expect(boostManager.areBoostLabsReady).to.be.a("function");
    });

    it("should get missing boosts for a role", () => {
      expect(boostManager.getMissingBoosts).to.be.a("function");
    });
  });

  describe("LabConfigManager - Lab Configuration", () => {
    it("should initialize empty config for room without labs", () => {
      const mockRoom = {
        name: "W1N1",
        controller: { my: true },
        find: () => [] // No labs
      } as unknown as Room;

      labConfigManager.initialize(mockRoom.name);
      
      const config = labConfigManager.getConfig(mockRoom.name);
      expect(config).to.be.undefined;
    });

    it("should auto-assign lab roles", () => {
      // Would need complex lab mocking
      // Test that the method exists
      expect(labConfigManager.getInputLabs).to.be.a("function");
      expect(labConfigManager.getOutputLabs).to.be.a("function");
      expect(labConfigManager.getBoostLabs).to.be.a("function");
    });

    it("should set active reaction", () => {
      expect(labConfigManager.setActiveReaction).to.be.a("function");
    });

    it("should clear active reaction", () => {
      expect(labConfigManager.clearActiveReaction).to.be.a("function");
    });
  });

  describe("Lab System Integration", () => {
    it("should have all managers available", () => {
      expect(labManager).to.not.be.undefined;
      expect(chemistryPlanner).to.not.be.undefined;
      expect(boostManager).to.not.be.undefined;
      expect(labConfigManager).to.not.be.undefined;
    });

    it("should export all necessary types", () => {
      // Types are checked at compile time, this test verifies imports work
      expect(labManager.initialize).to.be.a("function");
      expect(labManager.save).to.be.a("function");
    });
  });

  describe("Automatic Unboost Scheduling", () => {
    it("should schedule unboost for boosted creeps near end of life", () => {
      expect(labManager.scheduleBoostedCreepUnboost).to.be.a("function");
    });
  });

  describe("Boost Cost Analysis", () => {
    it("should calculate boost cost for a creep", () => {
      const cost = boostManager.calculateBoostCost("soldier", 10);
      
      // Soldier has 2 boosts (XUH2O and XLHO2) based on BOOST_CONFIGS
      // 10 parts * 30 mineral per part * 2 boosts = 600 mineral
      // 10 parts * 20 energy per part * 2 boosts = 400 energy
      // These values are derived from the boost config and LAB_BOOST constants
      expect(cost.mineral).to.equal(600);
      expect(cost.energy).to.equal(400);
    });

    it("should handle unknown role gracefully", () => {
      const cost = boostManager.calculateBoostCost("unknownRole", 10);
      
      expect(cost.mineral).to.equal(0);
      expect(cost.energy).to.equal(0);
    });

    it("should analyze boost ROI", () => {
      const analysis = boostManager.analyzeBoostROI("soldier", 10, 1500, 3);
      
      expect(analysis).to.have.property("worthwhile");
      expect(analysis).to.have.property("roi");
      expect(analysis).to.have.property("reasoning");
      expect(analysis.roi).to.be.a("number");
    });

    it("should recommend boosting for high danger operations", () => {
      const analysis = boostManager.analyzeBoostROI("soldier", 20, 1500, 3);
      
      // High danger (3) and large creep (20 parts) should have good ROI
      expect(analysis.worthwhile).to.be.true;
      expect(analysis.roi).to.be.greaterThan(1.5);
    });

    it("should not recommend boosting for low value operations", () => {
      const analysis = boostManager.analyzeBoostROI("soldier", 5, 100, 0);
      
      // Low danger (0) and small/short-lived creep should have poor ROI
      expect(analysis.worthwhile).to.be.false;
    });
  });

  describe("Compound Production Scheduling", () => {
    it("should schedule compound production based on demand", () => {
      expect(chemistryPlanner.scheduleCompoundProduction).to.be.a("function");
    });
  });
});

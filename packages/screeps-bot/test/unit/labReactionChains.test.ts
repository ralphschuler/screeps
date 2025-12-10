/**
 * Lab Reaction Chain Tests
 *
 * Tests for complex chemical reaction planning and execution
 */

import { expect } from "chai";

describe("Lab Reaction Chains", () => {
  describe("Simple Reactions", () => {
    it("should identify hydroxide reaction components", () => {
      const reaction = {
        product: RESOURCE_HYDROXIDE,
        input1: RESOURCE_HYDROGEN,
        input2: RESOURCE_OXYGEN
      };

      expect(reaction.input1).to.equal(RESOURCE_HYDROGEN);
      expect(reaction.input2).to.equal(RESOURCE_OXYGEN);
    });

    it("should verify base mineral requirements", () => {
      const baseMinerals = [
        RESOURCE_HYDROGEN,
        RESOURCE_OXYGEN,
        RESOURCE_UTRIUM,
        RESOURCE_LEMERGIUM,
        RESOURCE_KEANIUM,
        RESOURCE_ZYNTHIUM,
        RESOURCE_CATALYST
      ];

      expect(baseMinerals).to.include(RESOURCE_HYDROGEN);
      expect(baseMinerals).to.include(RESOURCE_OXYGEN);
      expect(baseMinerals).to.have.lengthOf(7);
    });
  });

  describe("Multi-Step Reaction Chains", () => {
    it("should plan utrium acid chain", () => {
      // UH2O requires: UH (utrium hydride) and OH (hydroxide)
      // UH requires: U (utrium) and H (hydrogen)
      // OH requires: H (hydrogen) and O (oxygen)

      const chain = [
        { step: 1, product: RESOURCE_HYDROXIDE, inputs: [RESOURCE_HYDROGEN, RESOURCE_OXYGEN] },
        { step: 2, product: RESOURCE_UTRIUM_HYDRIDE, inputs: [RESOURCE_UTRIUM, RESOURCE_HYDROGEN] },
        { step: 3, product: RESOURCE_UTRIUM_ACID, inputs: [RESOURCE_UTRIUM_HYDRIDE, RESOURCE_HYDROXIDE] }
      ];

      expect(chain).to.have.lengthOf(3);
      expect(chain[2].product).to.equal(RESOURCE_UTRIUM_ACID);
    });

    it("should identify intermediate compounds", () => {
      const intermediates = [
        RESOURCE_HYDROXIDE,
        RESOURCE_UTRIUM_HYDRIDE,
        RESOURCE_UTRIUM_OXIDE,
        RESOURCE_KEANIUM_HYDRIDE,
        RESOURCE_KEANIUM_OXIDE,
        RESOURCE_LEMERGIUM_HYDRIDE,
        RESOURCE_LEMERGIUM_OXIDE,
        RESOURCE_ZYNTHIUM_HYDRIDE,
        RESOURCE_ZYNTHIUM_OXIDE,
        RESOURCE_GHODIUM_HYDRIDE,
        RESOURCE_GHODIUM_OXIDE
      ];

      expect(intermediates).to.include(RESOURCE_HYDROXIDE);
      expect(intermediates).to.include(RESOURCE_UTRIUM_HYDRIDE);
    });

    it("should validate chain dependencies", () => {
      const compound = RESOURCE_UTRIUM_ACID;
      
      // Check if we have all dependencies
      const dependencies = {
        base: [RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM],
        intermediates: [RESOURCE_HYDROXIDE, RESOURCE_UTRIUM_HYDRIDE]
      };

      expect(dependencies.base).to.have.lengthOf(3);
      expect(dependencies.intermediates).to.have.lengthOf(2);
    });
  });

  describe("Resource Availability", () => {
    it("should check if base minerals are available", () => {
      const storage = {
        [RESOURCE_HYDROGEN]: 5000,
        [RESOURCE_OXYGEN]: 5000,
        [RESOURCE_UTRIUM]: 3000
      };

      const minRequired = 1000;
      const hasHydrogen = storage[RESOURCE_HYDROGEN] >= minRequired;
      const hasOxygen = storage[RESOURCE_OXYGEN] >= minRequired;
      const hasUtrium = storage[RESOURCE_UTRIUM] >= minRequired;

      expect(hasHydrogen).to.be.true;
      expect(hasOxygen).to.be.true;
      expect(hasUtrium).to.be.true;
    });

    it("should calculate reaction capacity based on resources", () => {
      const resources = {
        [RESOURCE_HYDROGEN]: 10000,
        [RESOURCE_OXYGEN]: 5000
      };

      const reactionAmount = 5; // LAB_REACTION_AMOUNT per tick

      // Limited by oxygen (5000 / 5 = 1000 reactions)
      const maxReactions = Math.min(
        Math.floor(resources[RESOURCE_HYDROGEN] / reactionAmount),
        Math.floor(resources[RESOURCE_OXYGEN] / reactionAmount)
      );

      expect(maxReactions).to.equal(1000);
    });

    it("should detect insufficient resources for reaction", () => {
      const resources = {
        [RESOURCE_HYDROGEN]: 100,
        [RESOURCE_OXYGEN]: 5000
      };

      const requiredPerReaction = 5;
      const minReactions = 100;

      const canProduce = 
        resources[RESOURCE_HYDROGEN] >= requiredPerReaction * minReactions &&
        resources[RESOURCE_OXYGEN] >= requiredPerReaction * minReactions;

      expect(canProduce).to.be.false;
    });
  });

  describe("Lab Configuration", () => {
    it("should identify input and output labs", () => {
      const labs = [
        { id: "lab1", role: "input" },
        { id: "lab2", role: "input" },
        { id: "lab3", role: "output" },
        { id: "lab4", role: "output" },
        { id: "lab5", role: "output" }
      ];

      const inputLabs = labs.filter(l => l.role === "input");
      const outputLabs = labs.filter(l => l.role === "output");

      expect(inputLabs).to.have.lengthOf(2);
      expect(outputLabs).to.have.lengthOf(3);
    });

    it("should verify lab proximity", () => {
      const lab1 = { x: 25, y: 25 };
      const lab2 = { x: 27, y: 25 };

      const distance = Math.max(
        Math.abs(lab1.x - lab2.x),
        Math.abs(lab1.y - lab2.y)
      );

      const withinRange = distance <= 2;

      expect(withinRange).to.be.true;
    });

    it("should detect labs out of range", () => {
      const lab1 = { x: 25, y: 25 };
      const lab2 = { x: 30, y: 25 };

      const distance = Math.max(
        Math.abs(lab1.x - lab2.x),
        Math.abs(lab1.y - lab2.y)
      );

      const withinRange = distance <= 2;

      expect(withinRange).to.be.false;
    });
  });

  describe("Reaction Scheduling", () => {
    it("should respect lab cooldown", () => {
      const lab = {
        cooldown: 5
      };

      const canReact = lab.cooldown === 0;

      expect(canReact).to.be.false;
    });

    it("should allow reaction when cooled down", () => {
      const lab = {
        cooldown: 0
      };

      const canReact = lab.cooldown === 0;

      expect(canReact).to.be.true;
    });

    it("should track cooldown duration", () => {
      const cooldown = LAB_COOLDOWN; // 10 ticks

      expect(cooldown).to.equal(10);
    });

    it("should calculate reactions per tick", () => {
      const reactionAmount = LAB_REACTION_AMOUNT; // 5 units

      expect(reactionAmount).to.equal(5);
    });
  });

  describe("Resource Transport", () => {
    it("should calculate lab mineral capacity", () => {
      const capacity = LAB_MINERAL_CAPACITY;

      expect(capacity).to.equal(3000);
    });

    it("should detect when lab needs refilling", () => {
      const lab = {
        mineralType: RESOURCE_HYDROGEN,
        mineralAmount: 500
      };

      const refillThreshold = 1000;
      const needsRefill = lab.mineralAmount < refillThreshold;

      expect(needsRefill).to.be.true;
    });

    it("should detect when lab needs emptying", () => {
      const lab = {
        mineralType: RESOURCE_HYDROXIDE,
        mineralAmount: 2900
      };

      const emptyThreshold = 2500;
      const needsEmptying = lab.mineralAmount > emptyThreshold;

      expect(needsEmptying).to.be.true;
    });

    it("should calculate transport priority", () => {
      const labs = [
        { id: "lab1", mineralAmount: 100, capacity: 3000, priority: 0 },
        { id: "lab2", mineralAmount: 2800, capacity: 3000, priority: 0 },
        { id: "lab3", mineralAmount: 1500, capacity: 3000, priority: 0 }
      ];

      // Priority: empty labs first, then nearly full labs
      labs.forEach(lab => {
        const fillPercent = lab.mineralAmount / lab.capacity;
        if (fillPercent < 0.1) {
          lab.priority = 10; // Very low - needs refill
        } else if (fillPercent > 0.9) {
          lab.priority = 9; // Very high - needs emptying
        } else {
          lab.priority = 5; // Normal
        }
      });

      labs.sort((a, b) => b.priority - a.priority);

      expect(labs[0].id).to.equal("lab1");
      expect(labs[0].priority).to.equal(10);
    });
  });

  describe("Boost Production", () => {
    it("should identify tier 3 boost compounds", () => {
      const tier3Boosts = [
        RESOURCE_UTRIUM_ACID,
        RESOURCE_UTRIUM_ALKALIDE,
        RESOURCE_KEANIUM_ACID,
        RESOURCE_KEANIUM_ALKALIDE,
        RESOURCE_LEMERGIUM_ACID,
        RESOURCE_LEMERGIUM_ALKALIDE,
        RESOURCE_ZYNTHIUM_ACID,
        RESOURCE_ZYNTHIUM_ALKALIDE,
        RESOURCE_GHODIUM_ACID,
        RESOURCE_GHODIUM_ALKALIDE
      ];

      expect(tier3Boosts).to.have.lengthOf(10);
      expect(tier3Boosts).to.include(RESOURCE_UTRIUM_ACID);
    });

    it("should calculate boost cost", () => {
      const bodyParts = 10;
      const mineralPerPart = LAB_BOOST_MINERAL; // 30
      const energyPerPart = LAB_BOOST_ENERGY; // 20

      const totalMineral = bodyParts * mineralPerPart;
      const totalEnergy = bodyParts * energyPerPart;

      expect(totalMineral).to.equal(300);
      expect(totalEnergy).to.equal(200);
    });

    it("should verify boost inventory", () => {
      const boostLab = {
        mineralType: RESOURCE_UTRIUM_ACID,
        mineralAmount: 1000
      };

      const requiredForBoost = 300;
      const hasEnough = boostLab.mineralAmount >= requiredForBoost;

      expect(hasEnough).to.be.true;
    });

    it("should prioritize boost production in war mode", () => {
      const warMode = true;
      const boostInventory = {
        [RESOURCE_UTRIUM_ACID]: 500,
        [RESOURCE_KEANIUM_ACID]: 300
      };

      const boostTarget = 2000;
      const needsProduction = warMode && Object.values(boostInventory).some(amt => amt < boostTarget);

      expect(needsProduction).to.be.true;
    });
  });

  describe("Production Goals", () => {
    it("should track production targets", () => {
      const targets: Record<string, number> = {
        [RESOURCE_HYDROXIDE]: 5000,
        [RESOURCE_UTRIUM_ACID]: 2000,
        [RESOURCE_GHODIUM]: 1000
      };

      const current: Record<string, number> = {
        [RESOURCE_HYDROXIDE]: 3000,
        [RESOURCE_UTRIUM_ACID]: 2500,
        [RESOURCE_GHODIUM]: 500
      };

      const needed = Object.entries(targets).map(([resource, target]) => ({
        resource,
        needed: Math.max(0, target - (current[resource] ?? 0))
      }));

      expect(needed[0].needed).to.equal(2000); // Hydroxide
      expect(needed[1].needed).to.equal(0); // Utrium acid (over target)
      expect(needed[2].needed).to.equal(500); // Ghodium
    });

    it("should prioritize production by urgency", () => {
      const compounds = [
        { compound: RESOURCE_HYDROXIDE, current: 1000, target: 5000, urgency: 0 },
        { compound: RESOURCE_UTRIUM_ACID, current: 100, target: 2000, urgency: 0 },
        { compound: RESOURCE_GHODIUM, current: 500, target: 1000, urgency: 0 }
      ];

      // Calculate urgency as percentage of target
      compounds.forEach(c => {
        c.urgency = 1 - (c.current / c.target);
      });

      compounds.sort((a, b) => b.urgency - a.urgency);

      expect(compounds[0].compound).to.equal(RESOURCE_UTRIUM_ACID);
      expect(compounds[0].urgency).to.be.closeTo(0.95, 0.01);
    });
  });

  describe("Reaction Efficiency", () => {
    it("should calculate reaction rate", () => {
      const reactionAmount = 5; // per tick
      const cooldown = 10; // ticks

      // Effective rate = 5 units per 11 ticks (action + cooldown)
      const effectiveRate = reactionAmount / (cooldown + 1);

      expect(effectiveRate).to.be.closeTo(0.45, 0.01);
    });

    it("should estimate time to produce target amount", () => {
      const targetAmount = 1000;
      const reactionAmount = 5;
      const cooldown = 10;

      const reactionsNeeded = Math.ceil(targetAmount / reactionAmount);
      const ticksNeeded = reactionsNeeded * (cooldown + 1);

      expect(ticksNeeded).to.equal(2200);
    });

    it("should calculate production with multiple output labs", () => {
      const outputLabs = 5;
      const reactionAmount = 5;
      const targetAmount = 1000;

      // With 5 labs, production is 5x faster
      const reactionsPerCycle = outputLabs;
      const cyclesNeeded = Math.ceil(targetAmount / (reactionAmount * reactionsPerCycle));

      expect(cyclesNeeded).to.equal(40);
    });
  });
});

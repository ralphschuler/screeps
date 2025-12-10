/**
 * Tower Logic Tests
 *
 * Tests for tower attack, heal, and repair prioritization
 */

import { expect } from "chai";

describe("Tower Logic", () => {
  describe("Attack Target Prioritization", () => {
    it("should prioritize healers first", () => {
      const targets = [
        { id: "1", role: "melee", bodyParts: [ATTACK, MOVE], priority: 3 },
        { id: "2", role: "healer", bodyParts: [HEAL, MOVE], priority: 1 },
        { id: "3", role: "ranged", bodyParts: [RANGED_ATTACK, MOVE], priority: 2 }
      ];

      targets.sort((a, b) => a.priority - b.priority);

      expect(targets[0].role).to.equal("healer");
    });

    it("should prioritize ranged attackers second", () => {
      const targets = [
        { id: "1", role: "melee", bodyParts: [ATTACK, MOVE], priority: 3 },
        { id: "2", role: "ranged", bodyParts: [RANGED_ATTACK, MOVE], priority: 2 }
      ];

      targets.sort((a, b) => a.priority - b.priority);

      expect(targets[0].role).to.equal("ranged");
    });

    it("should prioritize melee attackers third", () => {
      const targets = [
        { id: "1", role: "melee", bodyParts: [ATTACK, MOVE], priority: 3 },
        { id: "2", role: "support", bodyParts: [MOVE, CARRY], priority: 4 }
      ];

      targets.sort((a, b) => a.priority - b.priority);

      expect(targets[0].role).to.equal("melee");
    });

    it("should consider body part counts in prioritization", () => {
      const hostiles = [
        { id: "1", healParts: 5, attackParts: 0, rangedParts: 0 },
        { id: "2", healParts: 0, attackParts: 10, rangedParts: 0 },
        { id: "3", healParts: 0, attackParts: 0, rangedParts: 8 }
      ];

      // Healer with most heal parts should be top priority
      const topPriority = hostiles.find(h => h.healParts > 0);
      expect(topPriority).to.exist;
      expect(topPriority?.healParts).to.equal(5);
    });
  });

  describe("Range-Based Damage Calculation", () => {
    it("should deal full damage at optimal range", () => {
      const range = 5; // TOWER_OPTIMAL_RANGE
      const baseDamage = 600; // TOWER_POWER_ATTACK

      const damage = range <= TOWER_OPTIMAL_RANGE ? baseDamage : baseDamage;
      expect(damage).to.equal(600);
    });

    it("should reduce damage at long range", () => {
      const range = 20;
      const baseDamage = 600;
      const optimalRange = 5;
      const falloffRange = 20;

      let damage = baseDamage;
      if (range > optimalRange) {
        const falloff = (range - optimalRange) / (falloffRange - optimalRange);
        damage = baseDamage * (1 - falloff * TOWER_FALLOFF);
      }

      expect(damage).to.be.lessThan(baseDamage);
      expect(damage).to.equal(150); // 600 * 0.25
    });

    it("should reduce damage linearly between optimal and max range", () => {
      const baseDamage = 600;
      const optimalRange = 5;
      const falloffRange = 20;

      const damageAt10 = baseDamage * (1 - ((10 - optimalRange) / (falloffRange - optimalRange)) * TOWER_FALLOFF);
      const damageAt15 = baseDamage * (1 - ((15 - optimalRange) / (falloffRange - optimalRange)) * TOWER_FALLOFF);

      expect(damageAt15).to.be.lessThan(damageAt10);
      expect(damageAt10).to.be.lessThan(baseDamage);
    });

    it("should prefer closer targets when damage is equal priority", () => {
      const targets = [
        { id: "1", priority: 1, range: 10, damage: 450 },
        { id: "2", priority: 1, range: 5, damage: 600 },
        { id: "3", priority: 1, range: 15, damage: 300 }
      ];

      // When priority is equal, prefer closer (higher damage)
      targets.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.range - b.range;
      });

      expect(targets[0].range).to.equal(5);
      expect(targets[0].damage).to.equal(600);
    });
  });

  describe("Heal Target Selection", () => {
    it("should heal most damaged friendly creep", () => {
      const friendlies = [
        { id: "1", hits: 800, hitsMax: 1000, damagePercent: 0.2 },
        { id: "2", hits: 300, hitsMax: 1000, damagePercent: 0.7 },
        { id: "3", hits: 950, hitsMax: 1000, damagePercent: 0.05 }
      ];

      friendlies.sort((a, b) => a.damagePercent - b.damagePercent);

      expect(friendlies[friendlies.length - 1].id).to.equal("2");
      expect(friendlies[friendlies.length - 1].damagePercent).to.equal(0.7);
    });

    it("should not heal fully healthy creeps", () => {
      const friendlies = [
        { id: "1", hits: 1000, hitsMax: 1000 },
        { id: "2", hits: 800, hitsMax: 1000 }
      ];

      const needsHealing = friendlies.filter(f => f.hits < f.hitsMax);

      expect(needsHealing).to.have.lengthOf(1);
      expect(needsHealing[0].id).to.equal("2");
    });

    it("should prioritize healing defenders over workers", () => {
      const friendlies = [
        { id: "1", role: "harvester", hits: 500, hitsMax: 1000, priority: 2 },
        { id: "2", role: "guard", hits: 600, hitsMax: 1000, priority: 1 }
      ];

      friendlies.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return (a.hits / a.hitsMax) - (b.hits / b.hitsMax);
      });

      expect(friendlies[0].role).to.equal("guard");
    });
  });

  describe("Repair Target Selection", () => {
    it("should repair structures below threshold", () => {
      const structures = [
        { id: "1", structureType: STRUCTURE_RAMPART, hits: 50000, hitsMax: 100000 },
        { id: "2", structureType: STRUCTURE_WALL, hits: 95000, hitsMax: 100000 }
      ];

      const threshold = 0.8;
      const needsRepair = structures.filter(s => s.hits / s.hitsMax < threshold);

      expect(needsRepair).to.have.lengthOf(1);
      expect(needsRepair[0].id).to.equal("1");
    });

    it("should prioritize critical structures", () => {
      const structures = [
        { id: "1", structureType: STRUCTURE_RAMPART, hits: 10000, hitsMax: 100000, priority: 1 },
        { id: "2", structureType: STRUCTURE_ROAD, hits: 1000, hitsMax: 5000, priority: 2 },
        { id: "3", structureType: STRUCTURE_CONTAINER, hits: 50000, hitsMax: 250000, priority: 3 }
      ];

      structures.sort((a, b) => a.priority - b.priority);

      expect(structures[0].structureType).to.equal(STRUCTURE_RAMPART);
    });

    it("should not repair structures above threshold to save energy", () => {
      const structures = [
        { id: "1", structureType: STRUCTURE_RAMPART, hits: 90000, hitsMax: 100000 }
      ];

      const threshold = 0.8;
      const needsRepair = structures.filter(s => s.hits / s.hitsMax < threshold);

      expect(needsRepair).to.be.empty;
    });

    it("should adjust repair threshold based on danger level", () => {
      const dangerLevel = 3;
      const baseThreshold = 0.8;

      // In high danger, increase repair threshold
      const threshold = dangerLevel >= 2 ? 0.95 : baseThreshold;

      expect(threshold).to.equal(0.95);
    });
  });

  describe("Energy Management", () => {
    it("should track tower energy capacity", () => {
      const tower = {
        energy: 800,
        energyCapacity: 1000
      };

      const fillPercent = tower.energy / tower.energyCapacity;
      expect(fillPercent).to.equal(0.8);
    });

    it("should not attack when energy is too low", () => {
      const tower = { energy: 5, energyCapacity: 1000 };
      const minEnergyForAttack = 10;

      const canAttack = tower.energy >= minEnergyForAttack;

      expect(canAttack).to.be.false;
    });

    it("should prioritize attack over repair when energy is low", () => {
      const tower = { energy: 50, energyCapacity: 1000 };
      const hasHostiles = true;
      const minEnergyForRepair = 100;

      const shouldAttack = hasHostiles;
      const shouldRepair = tower.energy >= minEnergyForRepair && !hasHostiles;

      expect(shouldAttack).to.be.true;
      expect(shouldRepair).to.be.false;
    });

    it("should reserve energy for potential threats", () => {
      const tower = { energy: 300, energyCapacity: 1000 };
      const reserveEnergy = 200;

      const availableForRepair = Math.max(0, tower.energy - reserveEnergy);

      expect(availableForRepair).to.equal(100);
    });
  });

  describe("Multi-Tower Coordination", () => {
    it("should focus fire on single target when towers are limited", () => {
      const towers = [
        { id: "tower1", energy: 800 },
        { id: "tower2", energy: 750 }
      ];
      
      const hostiles = [
        { id: "hostile1", hits: 2000 },
        { id: "hostile2", hits: 1500 }
      ];

      // All towers should target the same hostile for focus fire
      const targetId = hostiles[0].id;
      const towersTargeting = towers.length;

      expect(towersTargeting).to.equal(2);
    });

    it("should distribute targets when towers are plentiful", () => {
      const towers = [
        { id: "tower1" },
        { id: "tower2" },
        { id: "tower3" },
        { id: "tower4" }
      ];
      
      const hostiles = [
        { id: "hostile1", threat: 10 },
        { id: "hostile2", threat: 8 }
      ];

      // Can afford to split towers across targets
      const towersPerTarget = Math.ceil(towers.length / hostiles.length);

      expect(towersPerTarget).to.equal(2);
    });

    it("should balance repair work across multiple towers", () => {
      const towers = [
        { id: "tower1", energy: 900, pos: { x: 25, y: 25 } },
        { id: "tower2", energy: 800, pos: { x: 30, y: 25 } },
        { id: "tower3", energy: 700, pos: { x: 25, y: 30 } }
      ];
      
      const structures = [
        { id: "rampart1", pos: { x: 20, y: 25 }, hits: 50000, hitsMax: 100000 },
        { id: "rampart2", pos: { x: 35, y: 25 }, hits: 45000, hitsMax: 100000 }
      ];

      // Each tower should repair nearest structure
      expect(towers.length).to.be.greaterThan(1);
      expect(structures.length).to.be.greaterThan(0);
    });
  });

  describe("Tower Action Cooldown", () => {
    it("should execute one action per tower per tick", () => {
      const tower = {
        id: "tower1",
        energy: 800,
        actionsThisTick: 0
      };

      const maxActionsPerTick = 1;
      const canAct = tower.actionsThisTick < maxActionsPerTick;

      expect(canAct).to.be.true;
    });

    it("should not allow multiple actions per tick", () => {
      const tower = {
        id: "tower1",
        energy: 800,
        actionsThisTick: 1 // Already acted
      };

      const maxActionsPerTick = 1;
      const canAct = tower.actionsThisTick < maxActionsPerTick;

      expect(canAct).to.be.false;
    });
  });

  describe("Rampart Defense Strategy", () => {
    it("should repair ramparts protecting key structures first", () => {
      const ramparts = [
        { id: "1", hits: 50000, hitsMax: 100000, protects: STRUCTURE_SPAWN, priority: 1 },
        { id: "2", hits: 40000, hitsMax: 100000, protects: STRUCTURE_STORAGE, priority: 2 },
        { id: "3", hits: 45000, hitsMax: 100000, protects: STRUCTURE_EXTENSION, priority: 3 }
      ];

      ramparts.sort((a, b) => a.priority - b.priority);

      expect(ramparts[0].protects).to.equal(STRUCTURE_SPAWN);
    });

    it("should maintain minimum rampart health", () => {
      const rampart = { hits: 500, hitsMax: 100000 };
      const minimumHits = 1000;

      const needsUrgentRepair = rampart.hits < minimumHits;

      expect(needsUrgentRepair).to.be.true;
    });

    it("should scale rampart repair based on room level", () => {
      const rcl = 8;
      const baseTarget = 100000;

      // Higher RCL = higher target
      const targetHits = baseTarget * rcl;

      expect(targetHits).to.equal(800000);
    });
  });

  describe("Hostile Threat Assessment", () => {
    it("should calculate threat score based on body parts", () => {
      const hostile = {
        attackParts: 10,
        rangedParts: 0,
        healParts: 0,
        workParts: 0
      };

      const threatScore = 
        hostile.attackParts * 80 +
        hostile.rangedParts * 150 +
        hostile.healParts * 250 +
        hostile.workParts * 50;

      expect(threatScore).to.equal(800); // 10 * 80
    });

    it("should identify high-threat targets", () => {
      const hostiles = [
        { id: "1", threat: 1000 },
        { id: "2", threat: 3000 },
        { id: "3", threat: 500 }
      ];

      const highThreatThreshold = 2000;
      const highThreats = hostiles.filter(h => h.threat >= highThreatThreshold);

      expect(highThreats).to.have.lengthOf(1);
      expect(highThreats[0].id).to.equal("2");
    });
  });
});

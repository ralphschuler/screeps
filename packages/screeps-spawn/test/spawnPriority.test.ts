/**
 * Spawn Priority Tests
 */

import { expect } from "chai";
import { getPostureSpawnWeights, getPheromoneMult } from "../src/spawnPriority";

describe("spawnPriority", () => {
  describe("getPostureSpawnWeights", () => {
    it("keeps defensive posture economy-weighted when danger is calm", () => {
      const weights = getPostureSpawnWeights("defensive", { danger: 0 });
      const fullDefenseWeights = getPostureSpawnWeights("defensive", { danger: 3 });

      expect(weights.harvester).to.be.greaterThan(1.0); // Recover economic throughput
      expect(weights.guard).to.be.lessThan(fullDefenseWeights.guard); // Avoid military over-allocation
      expect(weights.remoteGuard).to.be.lessThan(fullDefenseWeights.remoteGuard);
      expect(weights.upgrader).to.be.greaterThan(0.5); // Not fully suppressed while defensive
      expect(weights.scout).to.equal(0.0);
    });

    it("uses full defensive combat weighting under dangerous conditions", () => {
      const activeDefenseWeights = getPostureSpawnWeights("defensive", { danger: 3 });
      expect(activeDefenseWeights.guard).to.equal(2.0);
      expect(activeDefenseWeights.remoteGuard).to.equal(1.8);
      expect(activeDefenseWeights.harvester).to.equal(1.0);
    });
  });

  describe("getPheromoneMult", () => {
    it("returns stable multiplier for unknown roles", () => {
      expect(getPheromoneMult("unknownRole", { harvest: 10, build: 10, upgrade: 10, logistics: 10, defense: 10, war: 10, siege: 10, expand: 10 })).to.equal(1.0);
    });

    it("clamps pheromone values into expected 0.5-2.0 range", () => {
      expect(getPheromoneMult("harvester", { harvest: -50, build: 0, upgrade: 0, logistics: 0, defense: 0, war: 0, siege: 0, expand: 0 })).to.equal(0.5);
      expect(getPheromoneMult("harvester", { harvest: 100, build: 0, upgrade: 0, logistics: 0, defense: 0, war: 0, siege: 0, expand: 0 })).to.equal(2.0);
      expect(getPheromoneMult("harvester", { harvest: 250, build: 0, upgrade: 0, logistics: 0, defense: 0, war: 0, siege: 0, expand: 0 })).to.equal(2.0);
    });
  });
});

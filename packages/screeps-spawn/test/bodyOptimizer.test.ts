import { expect } from "chai";
import { calculateBodyCost } from "../src/bodyUtils";
import { optimizeBody, optimizeBuilderBody, optimizeUpgraderBody } from "../src/bodyOptimizer";

function expectTemplate(parts: BodyPartConstant[], expectedParts: BodyPartConstant[]): void {
  expect(parts).to.deep.equal(expectedParts);
}

describe("Body Optimizer", () => {
  describe("optimizeUpgraderBody", () => {
    it("preserves the controller-upgrade body ordering and cost", () => {
      const template = optimizeUpgraderBody({ role: "upgrader", maxEnergy: 900 });

      expectTemplate(template.parts, [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]);
      expect(template.cost).to.equal(calculateBodyCost(template.parts));
      expect(template.minCapacity).to.equal(template.cost);
    });
  });

  describe("optimizeBuilderBody", () => {
    it("preserves the balanced body ordering and cost", () => {
      const template = optimizeBuilderBody({ role: "builder", maxEnergy: 600 });

      expectTemplate(template.parts, [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]);
      expect(template.cost).to.equal(calculateBodyCost(template.parts));
      expect(template.minCapacity).to.equal(template.cost);
    });
  });

  describe("optimizeBody", () => {
    it("keeps claimers on a CLAIM-capable body instead of falling back to a worker body", () => {
      const template = optimizeBody({ role: "claimer", maxEnergy: 300 });

      expectTemplate(template.parts, [CLAIM, MOVE]);
      expect(template.cost).to.equal(650);
      expect(template.minCapacity).to.equal(650);
    });
  });
});

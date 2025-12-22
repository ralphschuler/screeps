/**
 * Body Utilities Tests
 */

import { expect } from "chai";
import {
  MAX_BODY_PARTS,
  calculateBodyCost,
  validateBody,
  sortBodyParts,
  createBalancedBody
} from "../src/bodyUtils";

describe("Body Utilities", () => {
  describe("calculateBodyCost", () => {
    it("should calculate cost of simple body", () => {
      const cost = calculateBodyCost([WORK, CARRY, MOVE]);
      expect(cost).to.equal(200); // 100 + 50 + 50
    });

    it("should calculate cost of complex body", () => {
      const cost = calculateBodyCost([WORK, WORK, CARRY, CARRY, MOVE, MOVE]);
      expect(cost).to.equal(400); // 200 + 100 + 100
    });

    it("should use custom costs if provided", () => {
      const cost = calculateBodyCost([WORK, CARRY], { [WORK]: 200 });
      expect(cost).to.equal(250); // 200 + 50
    });
  });

  describe("validateBody", () => {
    it("should accept valid body", () => {
      const result = validateBody([WORK, CARRY, MOVE]);
      expect(result).to.equal(true);
    });

    it("should reject empty body", () => {
      const result = validateBody([]);
      expect(result).to.be.a("string");
    });

    it("should reject body without MOVE", () => {
      const result = validateBody([WORK, CARRY]);
      expect(result).to.be.a("string");
    });

    it("should reject body exceeding max parts", () => {
      const body = new Array(51).fill(MOVE) as BodyPartConstant[];
      const result = validateBody(body);
      expect(result).to.be.a("string");
    });
  });

  describe("sortBodyParts", () => {
    it("should place TOUGH first", () => {
      const sorted = sortBodyParts([MOVE, WORK, TOUGH, CARRY]);
      expect(sorted[0]).to.equal(TOUGH);
    });

    it("should place MOVE last", () => {
      const sorted = sortBodyParts([MOVE, WORK, CARRY, MOVE]);
      expect(sorted[sorted.length - 1]).to.equal(MOVE);
    });

    it("should keep functional parts in middle", () => {
      const sorted = sortBodyParts([MOVE, TOUGH, CARRY, WORK, MOVE]);
      expect(sorted[0]).to.equal(TOUGH);
      expect(sorted[sorted.length - 1]).to.equal(MOVE);
    });
  });

  describe("createBalancedBody", () => {
    it("should create balanced body with simple ratio", () => {
      const body = createBalancedBody(500, {
        [WORK]: 1,
        [CARRY]: 1,
        [MOVE]: 1
      });
      
      // Should fit 2 units (200 each = 400 total)
      expect(body.length).to.equal(6); // 2 * (1 WORK + 1 CARRY + 1 MOVE)
      
      const workCount = body.filter(p => p === WORK).length;
      const carryCount = body.filter(p => p === CARRY).length;
      const moveCount = body.filter(p => p === MOVE).length;
      
      expect(workCount).to.equal(2);
      expect(carryCount).to.equal(2);
      expect(moveCount).to.equal(2);
    });

    it("should respect MAX_BODY_PARTS limit", () => {
      const body = createBalancedBody(100000, {
        [MOVE]: 1
      });
      
      expect(body.length).to.be.at.most(MAX_BODY_PARTS);
    });

    it("should handle zero energy", () => {
      const body = createBalancedBody(0, {
        [WORK]: 1,
        [MOVE]: 1
      });
      
      expect(body.length).to.equal(0);
    });

    it("should handle energy less than one unit", () => {
      const body = createBalancedBody(100, {
        [WORK]: 1, // costs 100
        [CARRY]: 1, // costs 50
        [MOVE]: 1   // costs 50
      });
      
      // Total cost per unit = 200, so can't afford even one
      expect(body.length).to.equal(0);
    });
  });
});

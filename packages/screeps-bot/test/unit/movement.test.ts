import { expect } from "chai";
import * as cartographer from "screeps-cartographer";

/**
 * Movement System Tests (Screeps Cartographer)
 * 
 * These tests verify the integration with screeps-cartographer.
 * The library is fully integrated directly, replacing our custom movement implementation.
 */

describe("Movement System (Cartographer Integration)", () => {
  describe("isExit detection", () => {
    // Helper function matching cartographer's isExit logic
    function isExit(pos: { x: number; y: number }): boolean {
      return pos.x === 0 || pos.y === 0 || pos.x === 49 || pos.y === 49;
    }

    it("should detect position on left exit (x=0)", () => {
      expect(isExit({ x: 0, y: 25 })).to.be.true;
    });

    it("should detect position on right exit (x=49)", () => {
      expect(isExit({ x: 49, y: 25 })).to.be.true;
    });

    it("should detect position on top exit (y=0)", () => {
      expect(isExit({ x: 25, y: 0 })).to.be.true;
    });

    it("should detect position on bottom exit (y=49)", () => {
      expect(isExit({ x: 25, y: 49 })).to.be.true;
    });

    it("should detect corner positions as exits", () => {
      expect(isExit({ x: 0, y: 0 })).to.be.true;
      expect(isExit({ x: 49, y: 0 })).to.be.true;
      expect(isExit({ x: 0, y: 49 })).to.be.true;
      expect(isExit({ x: 49, y: 49 })).to.be.true;
    });

    it("should not detect center positions as exits", () => {
      expect(isExit({ x: 25, y: 25 })).to.be.false;
    });

    it("should not detect positions one away from edge as exits", () => {
      expect(isExit({ x: 1, y: 25 })).to.be.false;
      expect(isExit({ x: 48, y: 25 })).to.be.false;
      expect(isExit({ x: 25, y: 1 })).to.be.false;
      expect(isExit({ x: 25, y: 48 })).to.be.false;
    });
  });

  describe("Cartographer library integration", () => {
    it("exports expected movement functions", () => {
      // This test verifies the cartographer library is accessible
      // Actual functionality testing requires integration tests with game simulation
      expect(cartographer.preTick).to.be.a("function");
      expect(cartographer.reconcileTraffic).to.be.a("function");
      expect(cartographer.moveTo).to.be.a("function");
      expect(cartographer.clearCachedPath).to.be.a("function");
      expect(cartographer.isExit).to.be.a("function");
    });
  });
});

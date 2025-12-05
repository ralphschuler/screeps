import { expect } from "chai";
import sinon from "sinon";

// We can't easily unit test the full movement module due to global dependencies,
// but we can test the key logic concepts for room exit handling.

describe("Movement Room Exit Handling", () => {
  /**
   * Helper to check if a position is on a room exit.
   * This mirrors the logic in the movement module.
   */
  function isOnRoomExit(pos: { x: number; y: number }): boolean {
    return pos.x === 0 || pos.x === 49 || pos.y === 0 || pos.y === 49;
  }

  describe("isOnRoomExit detection", () => {
    it("should detect position on left exit (x=0)", () => {
      expect(isOnRoomExit({ x: 0, y: 25 })).to.be.true;
    });

    it("should detect position on right exit (x=49)", () => {
      expect(isOnRoomExit({ x: 49, y: 25 })).to.be.true;
    });

    it("should detect position on top exit (y=0)", () => {
      expect(isOnRoomExit({ x: 25, y: 0 })).to.be.true;
    });

    it("should detect position on bottom exit (y=49)", () => {
      expect(isOnRoomExit({ x: 25, y: 49 })).to.be.true;
    });

    it("should detect corner positions as exits", () => {
      expect(isOnRoomExit({ x: 0, y: 0 })).to.be.true;
      expect(isOnRoomExit({ x: 49, y: 0 })).to.be.true;
      expect(isOnRoomExit({ x: 0, y: 49 })).to.be.true;
      expect(isOnRoomExit({ x: 49, y: 49 })).to.be.true;
    });

    it("should not detect center positions as exits", () => {
      expect(isOnRoomExit({ x: 25, y: 25 })).to.be.false;
    });

    it("should not detect positions one away from edge as exits", () => {
      expect(isOnRoomExit({ x: 1, y: 25 })).to.be.false;
      expect(isOnRoomExit({ x: 48, y: 25 })).to.be.false;
      expect(isOnRoomExit({ x: 25, y: 1 })).to.be.false;
      expect(isOnRoomExit({ x: 25, y: 48 })).to.be.false;
    });
  });

  describe("Path room mismatch detection", () => {
    /**
     * Simulates checking if a cached path is from a different room.
     */
    function isPathFromDifferentRoom(
      cachedPathFirstRoomName: string | undefined,
      currentRoomName: string
    ): boolean {
      return cachedPathFirstRoomName !== undefined && cachedPathFirstRoomName !== currentRoomName;
    }

    it("should detect when path is from different room", () => {
      expect(isPathFromDifferentRoom("E1N1", "E2N1")).to.be.true;
    });

    it("should not detect when path is from same room", () => {
      expect(isPathFromDifferentRoom("E1N1", "E1N1")).to.be.false;
    });

    it("should handle undefined path room", () => {
      expect(isPathFromDifferentRoom(undefined, "E1N1")).to.be.false;
    });
  });

  describe("Repath trigger conditions", () => {
    /**
     * Simulates the repath decision logic.
     */
    interface RepathConditions {
      hasCachedPath: boolean;
      targetChanged: boolean;
      pathExpired: boolean;
      isStuck: boolean;
      onRoomExit: boolean;
      pathInDifferentRoom: boolean;
    }

    function shouldRepath(conditions: RepathConditions): boolean {
      return (
        !conditions.hasCachedPath ||
        conditions.targetChanged ||
        conditions.pathExpired ||
        conditions.isStuck ||
        (conditions.onRoomExit && conditions.pathInDifferentRoom)
      );
    }

    it("should repath when no cached path", () => {
      expect(
        shouldRepath({
          hasCachedPath: false,
          targetChanged: false,
          pathExpired: false,
          isStuck: false,
          onRoomExit: false,
          pathInDifferentRoom: false
        })
      ).to.be.true;
    });

    it("should repath when target changed", () => {
      expect(
        shouldRepath({
          hasCachedPath: true,
          targetChanged: true,
          pathExpired: false,
          isStuck: false,
          onRoomExit: false,
          pathInDifferentRoom: false
        })
      ).to.be.true;
    });

    it("should repath when stuck", () => {
      expect(
        shouldRepath({
          hasCachedPath: true,
          targetChanged: false,
          pathExpired: false,
          isStuck: true,
          onRoomExit: false,
          pathInDifferentRoom: false
        })
      ).to.be.true;
    });

    it("should repath when on exit AND path is from different room", () => {
      expect(
        shouldRepath({
          hasCachedPath: true,
          targetChanged: false,
          pathExpired: false,
          isStuck: false,
          onRoomExit: true,
          pathInDifferentRoom: true
        })
      ).to.be.true;
    });

    it("should NOT repath when only on exit but path is from same room", () => {
      expect(
        shouldRepath({
          hasCachedPath: true,
          targetChanged: false,
          pathExpired: false,
          isStuck: false,
          onRoomExit: true,
          pathInDifferentRoom: false
        })
      ).to.be.false;
    });

    it("should NOT repath when path is from different room but not on exit", () => {
      expect(
        shouldRepath({
          hasCachedPath: true,
          targetChanged: false,
          pathExpired: false,
          isStuck: false,
          onRoomExit: false,
          pathInDifferentRoom: true
        })
      ).to.be.false;
    });

    it("should NOT repath when all conditions are false and has valid path", () => {
      expect(
        shouldRepath({
          hasCachedPath: true,
          targetChanged: false,
          pathExpired: false,
          isStuck: false,
          onRoomExit: false,
          pathInDifferentRoom: false
        })
      ).to.be.false;
    });
  });

  describe("findPositionOffExit logic", () => {
    /**
     * Simulates the logic for finding a position off an exit.
     * This mirrors the findPositionOffExit function in movement.ts.
     */
    interface Position {
      x: number;
      y: number;
    }

    function findPositionOffExit(
      pos: Position,
      isWall: (x: number, y: number) => boolean = () => false
    ): Position | null {
      const adjacentOffsets = [
        { dx: 0, dy: -1 }, // TOP
        { dx: 1, dy: -1 }, // TOP_RIGHT
        { dx: 1, dy: 0 }, // RIGHT
        { dx: 1, dy: 1 }, // BOTTOM_RIGHT
        { dx: 0, dy: 1 }, // BOTTOM
        { dx: -1, dy: 1 }, // BOTTOM_LEFT
        { dx: -1, dy: 0 }, // LEFT
        { dx: -1, dy: -1 } // TOP_LEFT
      ];

      const candidates: { pos: Position; edgeDistance: number }[] = [];

      for (const offset of adjacentOffsets) {
        const newX = pos.x + offset.dx;
        const newY = pos.y + offset.dy;

        // Skip positions outside the room
        if (newX < 0 || newX > 49 || newY < 0 || newY > 49) continue;

        // Skip positions that are still on an exit
        if (newX === 0 || newX === 49 || newY === 0 || newY === 49) continue;

        // Skip walls
        if (isWall(newX, newY)) continue;

        // Calculate distance from nearest edge
        const edgeDistance = Math.min(newX, 49 - newX, newY, 49 - newY);

        candidates.push({
          pos: { x: newX, y: newY },
          edgeDistance
        });
      }

      // Sort by edge distance descending
      candidates.sort((a, b) => b.edgeDistance - a.edgeDistance);

      return candidates.length > 0 ? candidates[0].pos : null;
    }

    it("should find position off left exit (x=0)", () => {
      const result = findPositionOffExit({ x: 0, y: 25 });
      expect(result).to.not.be.null;
      expect(result!.x).to.be.greaterThan(0);
      expect(result!.x).to.be.lessThan(49);
    });

    it("should find position off right exit (x=49)", () => {
      const result = findPositionOffExit({ x: 49, y: 25 });
      expect(result).to.not.be.null;
      expect(result!.x).to.be.greaterThan(0);
      expect(result!.x).to.be.lessThan(49);
    });

    it("should find position off top exit (y=0)", () => {
      const result = findPositionOffExit({ x: 25, y: 0 });
      expect(result).to.not.be.null;
      expect(result!.y).to.be.greaterThan(0);
      expect(result!.y).to.be.lessThan(49);
    });

    it("should find position off bottom exit (y=49)", () => {
      const result = findPositionOffExit({ x: 25, y: 49 });
      expect(result).to.not.be.null;
      expect(result!.y).to.be.greaterThan(0);
      expect(result!.y).to.be.lessThan(49);
    });

    it("should find position off corner (0,0)", () => {
      const result = findPositionOffExit({ x: 0, y: 0 });
      expect(result).to.not.be.null;
      // Corner has only one valid adjacent position: (1, 1)
      expect(result!.x).to.equal(1);
      expect(result!.y).to.equal(1);
    });

    it("should find position off corner (49,49)", () => {
      const result = findPositionOffExit({ x: 49, y: 49 });
      expect(result).to.not.be.null;
      // Corner has only one valid adjacent position: (48, 48)
      expect(result!.x).to.equal(48);
      expect(result!.y).to.equal(48);
    });

    it("should return null if all adjacent positions are walls", () => {
      const result = findPositionOffExit({ x: 0, y: 25 }, () => true);
      expect(result).to.be.null;
    });

    it("should prefer positions further from edges", () => {
      // Position at x=1 should prefer moving right (towards center)
      const result = findPositionOffExit({ x: 1, y: 25 });
      // This should not find anything because x=1 is not on an exit
      // Let's test with actual exit position
      const exitResult = findPositionOffExit({ x: 0, y: 25 });
      expect(exitResult).to.not.be.null;
      // The result should be at x=1 (only valid non-exit adjacent position)
      expect(exitResult!.x).to.equal(1);
    });

    it("should not return positions that are still on exits", () => {
      // Test position at (0, 1) which is on the left exit (x=0)
      // Adjacent positions are: (0, 0), (0, 2), (1, 0), (1, 1), (1, 2)
      // (0, 0), (0, 2) are still on left exit (x=0), (1, 0) is on top exit (y=0)
      // Only (1, 1) and (1, 2) are valid non-exit positions
      const result = findPositionOffExit({ x: 0, y: 1 });
      expect(result).to.not.be.null;
      expect(result!.x).to.be.greaterThan(0);
      expect(result!.y).to.be.greaterThan(0);
      expect(result!.y).to.be.lessThan(49);
    });
  });
});

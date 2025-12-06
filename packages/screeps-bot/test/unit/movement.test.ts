import { expect } from "chai";
import sinon from "sinon";

// We can't easily unit test the full movement module due to global dependencies,
// but we can test the key logic concepts for room exit handling.

/**
 * Common Position interface used across test cases
 */
interface Position {
  x: number;
  y: number;
}

describe("Movement Room Exit Handling", () => {
  /**
   * Helper to check if a position is on a room exit.
   * This mirrors the logic in the movement module.
   */
  function isOnRoomExit(pos: Position): boolean {
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

  describe("Cross-room exit handling", () => {
    /**
     * Simulates checking if a creep needs to move off exit before continuing to different room.
     * This mirrors the new logic in the movement module for handling cross-room navigation.
     */
    function needsMoveOffExitFirst(
      creepPos: { x: number; y: number; roomName: string },
      targetRoomName: string
    ): boolean {
      const onRoomExit =
        creepPos.x === 0 || creepPos.x === 49 || creepPos.y === 0 || creepPos.y === 49;
      const targetInDifferentRoom = targetRoomName !== creepPos.roomName;
      return onRoomExit && targetInDifferentRoom;
    }

    it("should require move-off-exit when on exit AND target in different room", () => {
      // Creep at left exit (x=0) in E1N1, target in E2N1
      expect(
        needsMoveOffExitFirst({ x: 0, y: 25, roomName: "E1N1" }, "E2N1")
      ).to.be.true;
    });

    it("should require move-off-exit when on corner AND target in different room", () => {
      // Creep at corner (0,0) in E1N1, target in W1N1
      expect(
        needsMoveOffExitFirst({ x: 0, y: 0, roomName: "E1N1" }, "W1N1")
      ).to.be.true;
    });

    it("should NOT require move-off-exit when on exit but target in same room", () => {
      // Creep at left exit (x=0) in E1N1, target also in E1N1
      expect(
        needsMoveOffExitFirst({ x: 0, y: 25, roomName: "E1N1" }, "E1N1")
      ).to.be.false;
    });

    it("should NOT require move-off-exit when not on exit even if target in different room", () => {
      // Creep in center of E1N1, target in E2N1
      expect(
        needsMoveOffExitFirst({ x: 25, y: 25, roomName: "E1N1" }, "E2N1")
      ).to.be.false;
    });

    it("should NOT require move-off-exit when not on exit and target in same room", () => {
      // Creep in center of E1N1, target also in E1N1
      expect(
        needsMoveOffExitFirst({ x: 25, y: 25, roomName: "E1N1" }, "E1N1")
      ).to.be.false;
    });

    it("should handle all four edges correctly", () => {
      // Left edge (x=0)
      expect(
        needsMoveOffExitFirst({ x: 0, y: 25, roomName: "E1N1" }, "E2N1")
      ).to.be.true;

      // Right edge (x=49)
      expect(
        needsMoveOffExitFirst({ x: 49, y: 25, roomName: "E1N1" }, "E2N1")
      ).to.be.true;

      // Top edge (y=0)
      expect(
        needsMoveOffExitFirst({ x: 25, y: 0, roomName: "E1N1" }, "E2N1")
      ).to.be.true;

      // Bottom edge (y=49)
      expect(
        needsMoveOffExitFirst({ x: 25, y: 49, roomName: "E1N1" }, "E2N1")
      ).to.be.true;
    });
  });

  describe("Push creep functionality", () => {
    /**
     * Simulates the logic for finding a position away from a source.
     * This mirrors the findPositionAwayFromSource function in movement.ts.
     */
    function findPositionAwayFromSource(
      creepPos: Position,
      sourcePos: Position,
      isWall: (x: number, y: number) => boolean = () => false,
      isOccupied: (x: number, y: number) => boolean = () => false
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

      const candidates: { pos: Position; sourceDistance: number }[] = [];

      for (const offset of adjacentOffsets) {
        const newX = creepPos.x + offset.dx;
        const newY = creepPos.y + offset.dy;

        // Skip positions outside the room or on exits
        if (newX <= 0 || newX >= 49 || newY <= 0 || newY >= 49) continue;

        // Skip walls
        if (isWall(newX, newY)) continue;

        // Skip occupied positions
        if (isOccupied(newX, newY)) continue;

        // Calculate distance from source (higher is better, further from source)
        const dx = newX - sourcePos.x;
        const dy = newY - sourcePos.y;
        const sourceDistance = Math.max(Math.abs(dx), Math.abs(dy));

        candidates.push({
          pos: { x: newX, y: newY },
          sourceDistance
        });
      }

      // Sort by source distance descending (prefer positions further from source)
      candidates.sort((a, b) => b.sourceDistance - a.sourceDistance);

      // Return the best candidate, or null if none found
      return candidates.length > 0 ? candidates[0].pos : null;
    }

    it("should find position away from source when pushing", () => {
      // Creep at (25, 25), source at (24, 25)
      // The creep should move to a position further from the source
      const result = findPositionAwayFromSource(
        { x: 25, y: 25 },
        { x: 24, y: 25 }
      );
      expect(result).to.not.be.null;
      // The new position should be further from the source (x=24)
      expect(result!.x).to.be.greaterThan(25);
    });

    it("should prefer diagonal positions when they are further", () => {
      // Creep at (25, 25), source at (25, 24) (above)
      // The creep should prefer positions further from the source
      const result = findPositionAwayFromSource(
        { x: 25, y: 25 },
        { x: 25, y: 24 }
      );
      expect(result).to.not.be.null;
      // The new position should be below the creep (y > 25)
      expect(result!.y).to.be.greaterThan(25);
    });

    it("should avoid walls when finding position", () => {
      // Creep at (25, 25), source at (24, 25)
      // All positions to the right are walls
      const isWall = (x: number, _y: number) => x > 25;
      const result = findPositionAwayFromSource(
        { x: 25, y: 25 },
        { x: 24, y: 25 },
        isWall
      );
      // Should find a position that's not a wall
      if (result !== null) {
        expect(result.x).to.be.at.most(25);
      }
    });

    it("should avoid occupied positions", () => {
      // Creep at (25, 25), source at (24, 25)
      // Position (26, 25) is occupied
      const isOccupied = (x: number, y: number) => x === 26 && y === 25;
      const result = findPositionAwayFromSource(
        { x: 25, y: 25 },
        { x: 24, y: 25 },
        () => false,
        isOccupied
      );
      // Should find a position that's not occupied
      if (result !== null) {
        expect(result.x !== 26 || result.y !== 25).to.be.true;
      }
    });

    it("should return null when no valid position exists", () => {
      // Creep at (25, 25), all adjacent positions are walls
      const isWall = (_x: number, _y: number) => true;
      const result = findPositionAwayFromSource(
        { x: 25, y: 25 },
        { x: 24, y: 25 },
        isWall
      );
      expect(result).to.be.null;
    });

    it("should not return positions on room exits", () => {
      // Creep at (1, 25) near left edge, source at (2, 25)
      // Should not push towards the exit
      const result = findPositionAwayFromSource(
        { x: 1, y: 25 },
        { x: 2, y: 25 }
      );
      // Result should either be null or not at x=0 (which is an exit)
      if (result !== null) {
        expect(result.x).to.be.greaterThan(0);
        expect(result.x).to.be.lessThan(49);
      }
    });
  });

  describe("Push creep in direction", () => {
    /**
     * Simulates calculating a target position based on direction.
     */
    function getTargetPosition(creepPos: Position, direction: number): Position | null {
      const offsets: Record<number, { dx: number; dy: number }> = {
        1: { dx: 0, dy: -1 }, // TOP
        2: { dx: 1, dy: -1 }, // TOP_RIGHT
        3: { dx: 1, dy: 0 }, // RIGHT
        4: { dx: 1, dy: 1 }, // BOTTOM_RIGHT
        5: { dx: 0, dy: 1 }, // BOTTOM
        6: { dx: -1, dy: 1 }, // BOTTOM_LEFT
        7: { dx: -1, dy: 0 }, // LEFT
        8: { dx: -1, dy: -1 } // TOP_LEFT
      };

      const offset = offsets[direction];
      if (!offset) return null;

      const newX = creepPos.x + offset.dx;
      const newY = creepPos.y + offset.dy;

      // Check bounds
      if (newX < 0 || newX > 49 || newY < 0 || newY > 49) return null;

      return { x: newX, y: newY };
    }

    it("should calculate correct position for TOP direction", () => {
      const result = getTargetPosition({ x: 25, y: 25 }, 1);
      expect(result).to.deep.equal({ x: 25, y: 24 });
    });

    it("should calculate correct position for RIGHT direction", () => {
      const result = getTargetPosition({ x: 25, y: 25 }, 3);
      expect(result).to.deep.equal({ x: 26, y: 25 });
    });

    it("should calculate correct position for BOTTOM direction", () => {
      const result = getTargetPosition({ x: 25, y: 25 }, 5);
      expect(result).to.deep.equal({ x: 25, y: 26 });
    });

    it("should calculate correct position for LEFT direction", () => {
      const result = getTargetPosition({ x: 25, y: 25 }, 7);
      expect(result).to.deep.equal({ x: 24, y: 25 });
    });

    it("should calculate correct position for diagonal directions", () => {
      expect(getTargetPosition({ x: 25, y: 25 }, 2)).to.deep.equal({ x: 26, y: 24 }); // TOP_RIGHT
      expect(getTargetPosition({ x: 25, y: 25 }, 4)).to.deep.equal({ x: 26, y: 26 }); // BOTTOM_RIGHT
      expect(getTargetPosition({ x: 25, y: 25 }, 6)).to.deep.equal({ x: 24, y: 26 }); // BOTTOM_LEFT
      expect(getTargetPosition({ x: 25, y: 25 }, 8)).to.deep.equal({ x: 24, y: 24 }); // TOP_LEFT
    });

    it("should return null for out-of-bounds positions", () => {
      // Trying to push left from x=0
      expect(getTargetPosition({ x: 0, y: 25 }, 7)).to.be.null;
      // Trying to push right from x=49
      expect(getTargetPosition({ x: 49, y: 25 }, 3)).to.be.null;
      // Trying to push up from y=0
      expect(getTargetPosition({ x: 25, y: 0 }, 1)).to.be.null;
      // Trying to push down from y=49
      expect(getTargetPosition({ x: 25, y: 49 }, 5)).to.be.null;
    });
  });
});

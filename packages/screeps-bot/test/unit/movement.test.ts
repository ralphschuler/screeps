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

  describe("Exit handling behavior", () => {
    /**
     * Determines if a creep on a room exit should move inward before continuing.
     * This logic prevents cycling when the target is in the SAME room,
     * but allows normal crossing when the target is in a DIFFERENT room.
     */
    function shouldMoveInwardFromExit(
      creepOnExit: boolean,
      targetInDifferentRoom: boolean
    ): boolean {
      // The fix: only move inward when target is in the SAME room
      return creepOnExit && !targetInDifferentRoom;
    }

    it("should NOT move inward when target is in different room", () => {
      // This is the fix for the cycling bug:
      // Creep at (49, 25) in E1N1, target in E2N1
      // Should proceed to cross the exit, NOT move inward
      expect(shouldMoveInwardFromExit(true, true)).to.be.false;
    });

    it("should move inward when target is in same room", () => {
      // Creep at (0, 25) in E1N1, target at (25, 25) in E1N1
      // Should move inward first to prevent PathFinder from routing through E0N1
      expect(shouldMoveInwardFromExit(true, false)).to.be.true;
    });

    it("should not move inward when not on exit", () => {
      // Creep at (25, 25) in E1N1, target in E1N1
      // Normal pathfinding continues
      expect(shouldMoveInwardFromExit(false, false)).to.be.false;
    });

    it("should not move inward when not on exit, even with different room target", () => {
      // Creep at (25, 25) in E1N1, target in E2N1
      // Normal pathfinding continues
      expect(shouldMoveInwardFromExit(false, true)).to.be.false;
    });

    describe("Specific scenarios", () => {
      it("scenario: creep at right exit (x=49) needs to cross to adjacent room", () => {
        // Creep at (49, 25) in E1N1, target at (10, 25) in E2N1
        const onExit = isOnRoomExit({ x: 49, y: 25 });
        const targetInDifferentRoom = true; // E2N1 vs E1N1
        expect(shouldMoveInwardFromExit(onExit, targetInDifferentRoom)).to.be.false;
      });

      it("scenario: creep at left exit (x=0) needs to cross to adjacent room", () => {
        // Creep at (0, 25) in E1N1, target at (40, 25) in E0N1
        const onExit = isOnRoomExit({ x: 0, y: 25 });
        const targetInDifferentRoom = true; // E0N1 vs E1N1
        expect(shouldMoveInwardFromExit(onExit, targetInDifferentRoom)).to.be.false;
      });

      it("scenario: creep at exit with target in same room should move inward", () => {
        // Creep at (49, 25) in E1N1, target at (25, 25) in E1N1
        const onExit = isOnRoomExit({ x: 49, y: 25 });
        const targetInDifferentRoom = false; // E1N1 vs E1N1
        expect(shouldMoveInwardFromExit(onExit, targetInDifferentRoom)).to.be.true;
      });
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

  describe("Multi-room pathfinding", () => {
    /**
     * Simulates path validation across multiple rooms
     * A valid path must have:
     * - At least 2 positions
     * - Room transitions must occur at exits
     * - All rooms in the path should be reachable
     */
    function validateMultiRoomPath(
      path: { x: number; y: number; roomName: string }[]
    ): { valid: boolean; reason?: string } {
      if (path.length === 0) {
        return { valid: false, reason: "Empty path" };
      }

      if (path.length === 1) {
        return { valid: true }; // Single position is valid
      }

      // Check room transitions
      let currentRoom = path[0]!.roomName;
      for (let i = 1; i < path.length; i++) {
        const pos = path[i];
        if (!pos) continue;

        if (pos.roomName !== currentRoom) {
          // Room changed - previous position must be at an exit
          const prevPos = path[i - 1];
          if (!prevPos) continue;

          const prevAtExit = prevPos.x === 0 || prevPos.x === 49 || prevPos.y === 0 || prevPos.y === 49;
          const currAtExit = pos.x === 0 || pos.x === 49 || pos.y === 0 || pos.y === 49;

          if (!prevAtExit || !currAtExit) {
            return { valid: false, reason: `Room transition not at exit at index ${i}` };
          }

          currentRoom = pos.roomName;
        }
      }

      return { valid: true };
    }

    it("should validate multi-room path with proper exits", () => {
      const path = [
        { x: 25, y: 25, roomName: "E1N1" },
        { x: 49, y: 25, roomName: "E1N1" }, // Exit
        { x: 0, y: 25, roomName: "E2N1" }, // Enter next room
        { x: 25, y: 25, roomName: "E2N1" }
      ];

      const result = validateMultiRoomPath(path);
      expect(result.valid).to.be.true;
    });

    it("should validate path with multiple room transitions", () => {
      const path = [
        { x: 25, y: 25, roomName: "E1N1" },
        { x: 49, y: 25, roomName: "E1N1" }, // Exit to E2N1
        { x: 0, y: 25, roomName: "E2N1" },
        { x: 25, y: 25, roomName: "E2N1" },
        { x: 49, y: 25, roomName: "E2N1" }, // Exit to E3N1
        { x: 0, y: 25, roomName: "E3N1" },
        { x: 25, y: 25, roomName: "E3N1" }
      ];

      const result = validateMultiRoomPath(path);
      expect(result.valid).to.be.true;
    });

    it("should detect invalid room transitions", () => {
      const path = [
        { x: 25, y: 25, roomName: "E1N1" }, // Not at exit
        { x: 25, y: 25, roomName: "E2N1" } // Teleported to different room
      ];

      const result = validateMultiRoomPath(path);
      expect(result.valid).to.be.false;
      expect(result.reason).to.include("Room transition not at exit");
    });

    it("should handle empty path", () => {
      const result = validateMultiRoomPath([]);
      expect(result.valid).to.be.false;
      expect(result.reason).to.equal("Empty path");
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

  describe("Hostile room avoidance", () => {
    /**
     * Simulates checking if a room should be avoided during pathfinding
     */
    interface RoomStatus {
      name: string;
      hasHostileTowers: boolean;
      hasHostileAttackers: boolean;
      allowHostileRooms: boolean;
    }

    function shouldAvoidRoom(status: RoomStatus): boolean {
      if (status.allowHostileRooms) return false;
      return status.hasHostileTowers || status.hasHostileAttackers;
    }

    it("should avoid rooms with hostile towers", () => {
      expect(shouldAvoidRoom({
        name: "E1N1",
        hasHostileTowers: true,
        hasHostileAttackers: false,
        allowHostileRooms: false
      })).to.be.true;
    });

    it("should avoid rooms with hostile attackers", () => {
      expect(shouldAvoidRoom({
        name: "E1N1",
        hasHostileTowers: false,
        hasHostileAttackers: true,
        allowHostileRooms: false
      })).to.be.true;
    });

    it("should NOT avoid hostile rooms when explicitly allowed", () => {
      expect(shouldAvoidRoom({
        name: "E1N1",
        hasHostileTowers: true,
        hasHostileAttackers: true,
        allowHostileRooms: true
      })).to.be.false;
    });

    it("should NOT avoid safe rooms", () => {
      expect(shouldAvoidRoom({
        name: "E1N1",
        hasHostileTowers: false,
        hasHostileAttackers: false,
        allowHostileRooms: false
      })).to.be.false;
    });
  });

  describe("Portal navigation", () => {
    /**
     * Simulates portal detection and filtering
     */
    interface MockPortal {
      pos: { x: number; y: number; roomName: string };
      destination?: {
        shard?: string;
        room?: string;
      };
    }

    function findPortalsToShard(portals: MockPortal[], targetShard: string): MockPortal[] {
      return portals.filter(portal => {
        if (!portal.destination) return false;
        return portal.destination.shard === targetShard;
      });
    }

    it("should find portals to specific shard", () => {
      const portals: MockPortal[] = [
        { pos: { x: 10, y: 10, roomName: "E1N1" }, destination: { shard: "shard0", room: "E10N10" } },
        { pos: { x: 20, y: 20, roomName: "E1N1" }, destination: { shard: "shard1", room: "E20N20" } },
        { pos: { x: 30, y: 30, roomName: "E1N1" }, destination: { shard: "shard2", room: "E30N30" } }
      ];

      const result = findPortalsToShard(portals, "shard1");
      expect(result).to.have.lengthOf(1);
      expect(result[0].destination?.shard).to.equal("shard1");
    });

    it("should return empty array when no portals to target shard", () => {
      const portals: MockPortal[] = [
        { pos: { x: 10, y: 10, roomName: "E1N1" }, destination: { shard: "shard0", room: "E10N10" } },
        { pos: { x: 20, y: 20, roomName: "E1N1" }, destination: { shard: "shard1", room: "E20N20" } }
      ];

      const result = findPortalsToShard(portals, "shard2");
      expect(result).to.have.lengthOf(0);
    });

    it("should handle portals without destinations", () => {
      const portals: MockPortal[] = [
        { pos: { x: 10, y: 10, roomName: "E1N1" } }, // No destination
        { pos: { x: 20, y: 20, roomName: "E1N1" }, destination: { shard: "shard1", room: "E20N20" } }
      ];

      const result = findPortalsToShard(portals, "shard1");
      expect(result).to.have.lengthOf(1);
    });

    it("should find multiple portals to same shard", () => {
      const portals: MockPortal[] = [
        { pos: { x: 10, y: 10, roomName: "E1N1" }, destination: { shard: "shard1", room: "E10N10" } },
        { pos: { x: 20, y: 20, roomName: "E1N1" }, destination: { shard: "shard1", room: "E20N20" } },
        { pos: { x: 30, y: 30, roomName: "E1N1" }, destination: { shard: "shard2", room: "E30N30" } }
      ];

      const result = findPortalsToShard(portals, "shard1");
      expect(result).to.have.lengthOf(2);
    });
  });

  describe("Path invalidation on room change", () => {
    /**
     * Simulates checking if a cached path should be invalidated when creep changes rooms
     */
    function shouldInvalidatePath(
      cachedPathRooms: string[],
      currentRoom: string,
      targetRoom: string
    ): boolean {
      if (cachedPathRooms.length === 0) return true;

      // Path is invalid if current room is not in the path
      if (!cachedPathRooms.includes(currentRoom)) return true;

      // Path is invalid if target room changed
      const lastRoom = cachedPathRooms[cachedPathRooms.length - 1];
      if (lastRoom !== targetRoom) return true;

      return false;
    }

    it("should invalidate path when creep enters unexpected room", () => {
      const cachedPathRooms = ["E1N1", "E2N1"];
      const currentRoom = "E3N1"; // Unexpected room
      const targetRoom = "E2N1";

      expect(shouldInvalidatePath(cachedPathRooms, currentRoom, targetRoom)).to.be.true;
    });

    it("should invalidate path when target room changes", () => {
      const cachedPathRooms = ["E1N1", "E2N1"];
      const currentRoom = "E1N1";
      const targetRoom = "E3N1"; // New target

      expect(shouldInvalidatePath(cachedPathRooms, currentRoom, targetRoom)).to.be.true;
    });

    it("should NOT invalidate path when creep is on expected path", () => {
      const cachedPathRooms = ["E1N1", "E2N1", "E3N1"];
      const currentRoom = "E2N1"; // On path
      const targetRoom = "E3N1"; // Same target

      expect(shouldInvalidatePath(cachedPathRooms, currentRoom, targetRoom)).to.be.false;
    });

    it("should invalidate empty path", () => {
      const cachedPathRooms: string[] = [];
      const currentRoom = "E1N1";
      const targetRoom = "E2N1";

      expect(shouldInvalidatePath(cachedPathRooms, currentRoom, targetRoom)).to.be.true;
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

  describe("Move Request System", () => {
    /**
     * Simulates the move request data structure.
     */
    interface MoveRequest {
      requesterName: string;
      targetPos: { x: number; y: number; roomName: string };
      priority: number;
      tick: number;
    }

    /**
     * Simple move request storage for testing.
     */
    class MoveRequestManager {
      private requests: Map<string, MoveRequest[]> = new Map();
      private currentTick = 0;

      positionKey(pos: { x: number; y: number; roomName: string }): string {
        return `${pos.roomName}:${pos.x},${pos.y}`;
      }

      clear(): void {
        this.requests.clear();
      }

      setTick(tick: number): void {
        this.currentTick = tick;
      }

      requestMove(requesterName: string, targetPos: { x: number; y: number; roomName: string }, priority: number): void {
        const key = this.positionKey(targetPos);
        const request: MoveRequest = {
          requesterName,
          targetPos,
          priority,
          tick: this.currentTick
        };

        const existing = this.requests.get(key);
        if (existing) {
          existing.push(request);
        } else {
          this.requests.set(key, [request]);
        }
      }

      hasHigherPriorityRequest(pos: { x: number; y: number; roomName: string }, myPriority: number, myName: string): boolean {
        const key = this.positionKey(pos);
        const requests = this.requests.get(key);
        if (!requests || requests.length === 0) return false;
        return requests.some(req => req.priority > myPriority && req.requesterName !== myName);
      }

      getRequestCount(pos: { x: number; y: number; roomName: string }): number {
        const key = this.positionKey(pos);
        const requests = this.requests.get(key);
        return requests?.length ?? 0;
      }

      getHighestPriorityRequest(pos: { x: number; y: number; roomName: string }): MoveRequest | null {
        const key = this.positionKey(pos);
        const requests = this.requests.get(key);
        if (!requests || requests.length === 0) return null;
        return requests.reduce((a, b) => a.priority > b.priority ? a : b);
      }
    }

    let manager: MoveRequestManager;

    beforeEach(() => {
      manager = new MoveRequestManager();
      manager.setTick(100);
    });

    it("should register a move request", () => {
      const pos = { x: 25, y: 25, roomName: "E1N1" };
      manager.requestMove("creep1", pos, 50);
      expect(manager.getRequestCount(pos)).to.equal(1);
    });

    it("should allow multiple requests for the same position", () => {
      const pos = { x: 25, y: 25, roomName: "E1N1" };
      manager.requestMove("creep1", pos, 50);
      manager.requestMove("creep2", pos, 75);
      expect(manager.getRequestCount(pos)).to.equal(2);
    });

    it("should detect higher priority requests", () => {
      const pos = { x: 25, y: 25, roomName: "E1N1" };
      manager.requestMove("creep1", pos, 75);

      // Lower priority creep should see higher priority request
      expect(manager.hasHigherPriorityRequest(pos, 50, "creep2")).to.be.true;
      // Higher priority creep should not see lower priority request
      expect(manager.hasHigherPriorityRequest(pos, 100, "creep2")).to.be.false;
    });

    it("should not detect own requests as higher priority", () => {
      const pos = { x: 25, y: 25, roomName: "E1N1" };
      manager.requestMove("creep1", pos, 75);

      // Same creep should not see own request
      expect(manager.hasHigherPriorityRequest(pos, 50, "creep1")).to.be.false;
    });

    it("should return highest priority request", () => {
      const pos = { x: 25, y: 25, roomName: "E1N1" };
      manager.requestMove("creep1", pos, 50);
      manager.requestMove("creep2", pos, 100);
      manager.requestMove("creep3", pos, 75);

      const highest = manager.getHighestPriorityRequest(pos);
      expect(highest).to.not.be.null;
      expect(highest!.requesterName).to.equal("creep2");
      expect(highest!.priority).to.equal(100);
    });

    it("should clear all requests", () => {
      const pos1 = { x: 25, y: 25, roomName: "E1N1" };
      const pos2 = { x: 26, y: 25, roomName: "E1N1" };

      manager.requestMove("creep1", pos1, 50);
      manager.requestMove("creep2", pos2, 75);

      manager.clear();

      expect(manager.getRequestCount(pos1)).to.equal(0);
      expect(manager.getRequestCount(pos2)).to.equal(0);
    });

    it("should return null for positions with no requests", () => {
      const pos = { x: 25, y: 25, roomName: "E1N1" };
      expect(manager.getHighestPriorityRequest(pos)).to.be.null;
      expect(manager.hasHigherPriorityRequest(pos, 50, "creep1")).to.be.false;
    });

    it("should handle requests across different rooms", () => {
      const pos1 = { x: 25, y: 25, roomName: "E1N1" };
      const pos2 = { x: 25, y: 25, roomName: "E2N1" }; // Same coords, different room

      manager.requestMove("creep1", pos1, 50);
      manager.requestMove("creep2", pos2, 75);

      expect(manager.getRequestCount(pos1)).to.equal(1);
      expect(manager.getRequestCount(pos2)).to.equal(1);
    });
  });

  describe("Yield Decision Logic", () => {
    /**
     * Simulates the shouldYieldTo logic.
     */
    function shouldYieldTo(
      blockerPriority: number,
      blockerTicksToLive: number | undefined,
      blockerCarryLoad: number,
      blockerRole: string,
      requesterPriority: number,
      requesterTicksToLive: number | undefined,
      requesterCarryLoad: number,
      requesterRole: string
    ): boolean {
      // Higher priority always wins
      if (requesterPriority > blockerPriority) return true;
      if (requesterPriority < blockerPriority) return false;

      // Equal priority - yield to creep carrying more resources (if both haulers)
      if (blockerRole === "hauler" && requesterRole === "hauler") {
        if (requesterCarryLoad > blockerCarryLoad) return true;
      }

      // Equal priority - yield to older creep (lower ticksToLive)
      if (requesterTicksToLive !== undefined && blockerTicksToLive !== undefined) {
        return requesterTicksToLive < blockerTicksToLive;
      }

      return false;
    }

    it("should yield to higher priority creep", () => {
      expect(shouldYieldTo(50, 1000, 0, "builder", 75, 1000, 0, "harvester")).to.be.true;
    });

    it("should not yield to lower priority creep", () => {
      expect(shouldYieldTo(75, 1000, 0, "harvester", 50, 1000, 0, "builder")).to.be.false;
    });

    it("should yield to hauler with more cargo when both are haulers with equal priority", () => {
      expect(shouldYieldTo(50, 1000, 100, "hauler", 50, 1000, 500, "hauler")).to.be.true;
    });

    it("should not yield to hauler with less cargo when both are haulers with equal priority", () => {
      expect(shouldYieldTo(50, 1000, 500, "hauler", 50, 1000, 100, "hauler")).to.be.false;
    });

    it("should yield to older creep (lower ticksToLive) when equal priority", () => {
      expect(shouldYieldTo(50, 1000, 0, "builder", 50, 500, 0, "builder")).to.be.true;
    });

    it("should not yield to younger creep (higher ticksToLive) when equal priority", () => {
      expect(shouldYieldTo(50, 500, 0, "builder", 50, 1000, 0, "builder")).to.be.false;
    });

    it("should handle undefined ticksToLive gracefully", () => {
      expect(shouldYieldTo(50, undefined, 0, "builder", 50, 500, 0, "builder")).to.be.false;
      expect(shouldYieldTo(50, 500, 0, "builder", 50, undefined, 0, "builder")).to.be.false;
    });
  });

  describe("Narrow Passage Detection", () => {
    /**
     * Simulates the narrow passage detection logic.
     * A narrow passage is a 1-tile wide corridor where creeps can only move forward/backward.
     */
    function isInNarrowPassage(
      pos: Position,
      isWalkable: (x: number, y: number) => boolean
    ): boolean {
      // Check if we have walkable tiles above/below (vertical space)
      const hasVerticalSpace = isWalkable(pos.x, pos.y - 1) || isWalkable(pos.x, pos.y + 1);

      // Check if we have walkable tiles left/right (horizontal space)
      const hasHorizontalSpace = isWalkable(pos.x - 1, pos.y) || isWalkable(pos.x + 1, pos.y);

      // In a narrow passage if we only have space in one direction (not both)
      return hasVerticalSpace !== hasHorizontalSpace;
    }

    it("should detect horizontal narrow passage (walls above and below)", () => {
      // Position at (25, 25) with walls above and below, open left and right
      const isWalkable = (x: number, y: number) => {
        if (y === 24 || y === 26) return false; // walls above and below
        if (x === 24 || x === 26) return true; // open left and right
        return false;
      };

      expect(isInNarrowPassage({ x: 25, y: 25 }, isWalkable)).to.be.true;
    });

    it("should detect vertical narrow passage (walls left and right)", () => {
      // Position at (25, 25) with walls left and right, open above and below
      const isWalkable = (x: number, y: number) => {
        if (x === 24 || x === 26) return false; // walls left and right
        if (y === 24 || y === 26) return true; // open above and below
        return false;
      };

      expect(isInNarrowPassage({ x: 25, y: 25 }, isWalkable)).to.be.true;
    });

    it("should NOT detect narrow passage when space in both directions", () => {
      // Position at (25, 25) with open space in all cardinal directions
      const isWalkable = (x: number, y: number) => {
        if (x === 24 || x === 26) return true; // open left and right
        if (y === 24 || y === 26) return true; // open above and below
        return false;
      };

      expect(isInNarrowPassage({ x: 25, y: 25 }, isWalkable)).to.be.false;
    });

    it("should NOT detect narrow passage when completely surrounded by walls", () => {
      // Position at (25, 25) with walls in all directions
      const isWalkable = (_x: number, _y: number) => false;

      expect(isInNarrowPassage({ x: 25, y: 25 }, isWalkable)).to.be.false;
    });

    it("should handle diagonal narrow passages", () => {
      // Position at (25, 25) with only diagonal openings
      const isWalkable = (x: number, y: number) => {
        // Only diagonal positions are walkable
        if ((x === 24 || x === 26) && (y === 24 || y === 26)) return true;
        return false;
      };

      // Should NOT be considered narrow passage (cardinal directions are blocked)
      expect(isInNarrowPassage({ x: 25, y: 25 }, isWalkable)).to.be.false;
    });
  });

  describe("Backup Position Finding", () => {
    /**
     * Simulates finding a position to back up to (opposite of target direction).
     */
    function findBackupPosition(
      pos: Position,
      targetDirection: number,
      isWalkable: (x: number, y: number) => boolean
    ): Position | null {
      // Direction mappings (1=TOP, 3=RIGHT, 5=BOTTOM, 7=LEFT)
      const opposites: Record<number, number> = {
        1: 5, // TOP -> BOTTOM
        2: 6, // TOP_RIGHT -> BOTTOM_LEFT
        3: 7, // RIGHT -> LEFT
        4: 8, // BOTTOM_RIGHT -> TOP_LEFT
        5: 1, // BOTTOM -> TOP
        6: 2, // BOTTOM_LEFT -> TOP_RIGHT
        7: 3, // LEFT -> RIGHT
        8: 4 // TOP_LEFT -> BOTTOM_RIGHT
      };

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

      const oppositeDir = opposites[targetDirection];
      if (!oppositeDir) return null;

      const offset = offsets[oppositeDir];
      if (!offset) return null;

      const newX = pos.x + offset.dx;
      const newY = pos.y + offset.dy;

      // Check bounds (avoid exits)
      if (newX <= 0 || newX >= 49 || newY <= 0 || newY >= 49) return null;

      // Check if walkable
      if (!isWalkable(newX, newY)) return null;

      return { x: newX, y: newY };
    }

    it("should find backup position opposite to target direction (TOP)", () => {
      // Target direction is TOP (1), should back up to BOTTOM (5)
      const isWalkable = (x: number, y: number) => {
        // Position below (26) is walkable
        return x === 25 && y === 26;
      };

      const result = findBackupPosition({ x: 25, y: 25 }, 1, isWalkable);
      expect(result).to.not.be.null;
      expect(result!.x).to.equal(25);
      expect(result!.y).to.equal(26);
    });

    it("should find backup position opposite to target direction (RIGHT)", () => {
      // Target direction is RIGHT (3), should back up to LEFT (7)
      const isWalkable = (x: number, y: number) => {
        // Position to the left (24) is walkable
        return x === 24 && y === 25;
      };

      const result = findBackupPosition({ x: 25, y: 25 }, 3, isWalkable);
      expect(result).to.not.be.null;
      expect(result!.x).to.equal(24);
      expect(result!.y).to.equal(25);
    });

    it("should return null if backup position is blocked", () => {
      // Target direction is TOP (1), backup would be BOTTOM (5) but it's blocked
      const isWalkable = (_x: number, _y: number) => false;

      const result = findBackupPosition({ x: 25, y: 25 }, 1, isWalkable);
      expect(result).to.be.null;
    });

    it("should return null if backup position is at room exit", () => {
      // Position at (1, 25), backing up LEFT would go to x=0 (exit)
      const isWalkable = (x: number, _y: number) => x >= 0; // technically walkable but should be rejected

      const result = findBackupPosition({ x: 1, y: 25 }, 3, isWalkable);
      expect(result).to.be.null;
    });

    it("should handle diagonal directions correctly", () => {
      // Target direction is TOP_RIGHT (2), should back up to BOTTOM_LEFT (6)
      const isWalkable = (x: number, y: number) => {
        // Position at bottom-left (24, 26) is walkable
        return x === 24 && y === 26;
      };

      const result = findBackupPosition({ x: 25, y: 25 }, 2, isWalkable);
      expect(result).to.not.be.null;
      expect(result!.x).to.equal(24);
      expect(result!.y).to.equal(26);
    });
  });

  describe("Alternative Target Finding", () => {
    /**
     * Simulates finding an alternative position when the destination is blocked.
     * This mirrors the logic added to handle blocked destinations.
     */
    function findAlternativePosition(
      targetPos: Position,
      range: number,
      isWalkable: (x: number, y: number) => boolean,
      hasCreep: (x: number, y: number) => boolean
    ): Position | null {
      // Search in expanding rings from range 1 to specified range
      for (let r = 1; r <= range; r++) {
        const candidates: Position[] = [];
        
        // Check positions in a ring at distance r
        for (let dx = -r; dx <= r; dx++) {
          for (let dy = -r; dy <= r; dy++) {
            // Only check positions at exactly range r (on the ring boundary)
            if (Math.abs(dx) < r && Math.abs(dy) < r) continue;

            const x = targetPos.x + dx;
            const y = targetPos.y + dy;

            // Check bounds (avoid exits)
            if (x < 1 || x > 48 || y < 1 || y > 48) continue;

            // Check if walkable and no creep
            if (isWalkable(x, y) && !hasCreep(x, y)) {
              candidates.push({ x, y });
            }
          }
        }

        // Return first valid candidate found
        if (candidates.length > 0) {
          return candidates[0];
        }
      }

      return null;
    }

    it("should find adjacent alternative position when destination is blocked", () => {
      const targetPos = { x: 25, y: 25 };
      
      // Target is blocked, but adjacent position is free
      const isWalkable = (x: number, y: number) => {
        return !(x === 25 && y === 25); // Target is not walkable
      };
      const hasCreep = (_x: number, _y: number) => false;

      const result = findAlternativePosition(targetPos, 1, isWalkable, hasCreep);
      expect(result).to.not.be.null;
      expect(result!.x).to.be.within(24, 26);
      expect(result!.y).to.be.within(24, 26);
      // Should not be the target position itself
      expect(result!.x !== 25 || result!.y !== 25).to.be.true;
    });

    it("should find position within range 2 when range 1 is all blocked", () => {
      const targetPos = { x: 25, y: 25 };
      
      // Target and all range 1 positions blocked, but range 2 has options
      const isWalkable = (x: number, y: number) => {
        const dx = Math.abs(x - 25);
        const dy = Math.abs(y - 25);
        const distance = Math.max(dx, dy);
        return distance > 1; // Only positions at distance > 1 are walkable
      };
      const hasCreep = (_x: number, _y: number) => false;

      const result = findAlternativePosition(targetPos, 2, isWalkable, hasCreep);
      expect(result).to.not.be.null;
      const dx = Math.abs(result!.x - 25);
      const dy = Math.abs(result!.y - 25);
      const distance = Math.max(dx, dy);
      expect(distance).to.equal(2);
    });

    it("should return null when no alternative position available within range", () => {
      const targetPos = { x: 25, y: 25 };
      
      // All positions are blocked
      const isWalkable = (_x: number, _y: number) => false;
      const hasCreep = (_x: number, _y: number) => false;

      const result = findAlternativePosition(targetPos, 2, isWalkable, hasCreep);
      expect(result).to.be.null;
    });

    it("should skip positions occupied by creeps even if walkable", () => {
      const targetPos = { x: 25, y: 25 };
      
      // All positions walkable but most have creeps
      const isWalkable = (_x: number, _y: number) => true;
      const hasCreep = (x: number, y: number) => {
        // All adjacent positions have creeps except (26, 25)
        if (x === 26 && y === 25) return false;
        return Math.abs(x - 25) <= 1 && Math.abs(y - 25) <= 1;
      };

      const result = findAlternativePosition(targetPos, 1, isWalkable, hasCreep);
      expect(result).to.not.be.null;
      expect(result!.x).to.equal(26);
      expect(result!.y).to.equal(25);
    });

    it("should avoid room exits (positions at edges)", () => {
      const targetPos = { x: 1, y: 1 };
      
      // Position near corner, should not select exit positions (x=0 or y=0)
      const isWalkable = (_x: number, _y: number) => true;
      const hasCreep = (_x: number, _y: number) => false;

      const result = findAlternativePosition(targetPos, 1, isWalkable, hasCreep);
      expect(result).to.not.be.null;
      // Should not be on an exit (x=0, x=49, y=0, y=49)
      expect(result!.x).to.be.within(1, 48);
      expect(result!.y).to.be.within(1, 48);
    });

    it("should prefer closer alternatives (range 1 before range 2)", () => {
      const targetPos = { x: 25, y: 25 };
      
      // Both range 1 and range 2 have options, should find range 1 first
      const isWalkable = (x: number, y: number) => {
        return !(x === 25 && y === 25); // Everything except target is walkable
      };
      const hasCreep = (_x: number, _y: number) => false;

      const result = findAlternativePosition(targetPos, 2, isWalkable, hasCreep);
      expect(result).to.not.be.null;
      // Should be at range 1 (adjacent)
      const dx = Math.abs(result!.x - 25);
      const dy = Math.abs(result!.y - 25);
      const distance = Math.max(dx, dy);
      expect(distance).to.equal(1);
    });
  });

  describe("Traveler-Inspired Enhancements", () => {
    describe("SK Room Detection", () => {
      /**
       * Check if a room is a Source Keeper room.
       * SK rooms are those where both coordinates mod 10 are between 4 and 6 (but not 5,5).
       */
      function isSourceKeeperRoom(roomName: string): boolean {
        const parsed = /^[WE](\d+)[NS](\d+)$/.exec(roomName);
        if (!parsed) return false;
        
        const xMod = parseInt(parsed[1], 10) % 10;
        const yMod = parseInt(parsed[2], 10) % 10;
        
        const isSK = !(xMod === 5 && yMod === 5) && xMod >= 4 && xMod <= 6 && yMod >= 4 && yMod <= 6;
        return isSK;
      }

      it("should identify SK rooms correctly", () => {
        // SK rooms have both coordinates mod 10 between 4-6, but not 5,5
        expect(isSourceKeeperRoom("E14N14")).to.be.true;
        expect(isSourceKeeperRoom("E14N15")).to.be.true;
        expect(isSourceKeeperRoom("E14N16")).to.be.true;
        expect(isSourceKeeperRoom("E16N14")).to.be.true;
        expect(isSourceKeeperRoom("E16N16")).to.be.true;
        expect(isSourceKeeperRoom("W4S4")).to.be.true;
        expect(isSourceKeeperRoom("W6S6")).to.be.true;
      });

      it("should not identify center rooms as SK rooms", () => {
        // 5,5 is the center room, not SK
        expect(isSourceKeeperRoom("E15N15")).to.be.false;
        expect(isSourceKeeperRoom("E25N25")).to.be.false;
        expect(isSourceKeeperRoom("W5S5")).to.be.false;
      });

      it("should not identify normal rooms as SK rooms", () => {
        expect(isSourceKeeperRoom("E1N1")).to.be.false;
        expect(isSourceKeeperRoom("E12N13")).to.be.false;
        expect(isSourceKeeperRoom("E17N18")).to.be.false;
        expect(isSourceKeeperRoom("W1S1")).to.be.false;
      });

      it("should not identify highway rooms as SK rooms", () => {
        expect(isSourceKeeperRoom("E10N10")).to.be.false;
        expect(isSourceKeeperRoom("E20N5")).to.be.false;
        expect(isSourceKeeperRoom("E5N20")).to.be.false;
      });
    });

    describe("Highway Room Detection", () => {
      /**
       * Check if a room is a highway room.
       * Highway rooms have at least one coordinate divisible by 10.
       */
      function isHighwayRoom(roomName: string): boolean {
        const parsed = /^[WE](\d+)[NS](\d+)$/.exec(roomName);
        if (!parsed) return false;
        
        const x = parseInt(parsed[1], 10);
        const y = parseInt(parsed[2], 10);
        
        return x % 10 === 0 || y % 10 === 0;
      }

      it("should identify highway rooms with x=0 mod 10", () => {
        expect(isHighwayRoom("E0N5")).to.be.true;
        expect(isHighwayRoom("E10N5")).to.be.true;
        expect(isHighwayRoom("E20N15")).to.be.true;
        expect(isHighwayRoom("W0S5")).to.be.true;
        expect(isHighwayRoom("W10S5")).to.be.true;
      });

      it("should identify highway rooms with y=0 mod 10", () => {
        expect(isHighwayRoom("E5N0")).to.be.true;
        expect(isHighwayRoom("E5N10")).to.be.true;
        expect(isHighwayRoom("E15N20")).to.be.true;
        expect(isHighwayRoom("W5S0")).to.be.true;
        expect(isHighwayRoom("W5S10")).to.be.true;
      });

      it("should identify corner highway rooms", () => {
        expect(isHighwayRoom("E0N0")).to.be.true;
        expect(isHighwayRoom("E10N10")).to.be.true;
        expect(isHighwayRoom("E20N20")).to.be.true;
        expect(isHighwayRoom("W0S0")).to.be.true;
      });

      it("should not identify normal rooms as highways", () => {
        expect(isHighwayRoom("E1N1")).to.be.false;
        expect(isHighwayRoom("E5N5")).to.be.false;
        expect(isHighwayRoom("E15N15")).to.be.false;
        expect(isHighwayRoom("W1S1")).to.be.false;
      });

      it("should not identify SK rooms as highways", () => {
        expect(isHighwayRoom("E14N14")).to.be.false;
        expect(isHighwayRoom("E16N16")).to.be.false;
        expect(isHighwayRoom("W4S4")).to.be.false;
      });
    });

    describe("Moving Target Support", () => {
      /**
       * Simulate checking if a target moved adjacently.
       */
      function isTargetAdjacent(
        oldPos: { x: number; y: number; roomName: string },
        newPos: { x: number; y: number; roomName: string }
      ): boolean {
        if (oldPos.roomName !== newPos.roomName) return false;
        const dx = Math.abs(oldPos.x - newPos.x);
        const dy = Math.abs(oldPos.y - newPos.y);
        return dx <= 1 && dy <= 1 && (dx !== 0 || dy !== 0);
      }

      it("should detect adjacent target movement", () => {
        const oldPos = { x: 25, y: 25, roomName: "E1N1" };
        
        // Test all 8 directions
        expect(isTargetAdjacent(oldPos, { x: 25, y: 24, roomName: "E1N1" })).to.be.true; // N
        expect(isTargetAdjacent(oldPos, { x: 26, y: 24, roomName: "E1N1" })).to.be.true; // NE
        expect(isTargetAdjacent(oldPos, { x: 26, y: 25, roomName: "E1N1" })).to.be.true; // E
        expect(isTargetAdjacent(oldPos, { x: 26, y: 26, roomName: "E1N1" })).to.be.true; // SE
        expect(isTargetAdjacent(oldPos, { x: 25, y: 26, roomName: "E1N1" })).to.be.true; // S
        expect(isTargetAdjacent(oldPos, { x: 24, y: 26, roomName: "E1N1" })).to.be.true; // SW
        expect(isTargetAdjacent(oldPos, { x: 24, y: 25, roomName: "E1N1" })).to.be.true; // W
        expect(isTargetAdjacent(oldPos, { x: 24, y: 24, roomName: "E1N1" })).to.be.true; // NW
      });

      it("should not detect same position as adjacent", () => {
        const pos = { x: 25, y: 25, roomName: "E1N1" };
        expect(isTargetAdjacent(pos, pos)).to.be.false;
      });

      it("should not detect distant positions as adjacent", () => {
        const oldPos = { x: 25, y: 25, roomName: "E1N1" };
        expect(isTargetAdjacent(oldPos, { x: 27, y: 25, roomName: "E1N1" })).to.be.false;
        expect(isTargetAdjacent(oldPos, { x: 25, y: 27, roomName: "E1N1" })).to.be.false;
        expect(isTargetAdjacent(oldPos, { x: 27, y: 27, roomName: "E1N1" })).to.be.false;
      });

      it("should not detect cross-room movement as adjacent", () => {
        const oldPos = { x: 25, y: 25, roomName: "E1N1" };
        expect(isTargetAdjacent(oldPos, { x: 25, y: 24, roomName: "E2N1" })).to.be.false;
      });
    });

    describe("Path String Serialization", () => {
      /**
       * Simulate converting directions to/from strings.
       */
      function serializeDirections(directions: number[]): string {
        return directions.join('');
      }

      function deserializeDirections(serialized: string): number[] {
        return serialized.split('').map(c => parseInt(c, 10));
      }

      it("should serialize direction array to string", () => {
        const directions = [1, 2, 3, 4, 5, 6, 7, 8];
        const serialized = serializeDirections(directions);
        expect(serialized).to.equal("12345678");
      });

      it("should deserialize string to direction array", () => {
        const serialized = "12345678";
        const directions = deserializeDirections(serialized);
        expect(directions).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8]);
      });

      it("should handle empty path", () => {
        expect(serializeDirections([])).to.equal("");
        expect(deserializeDirections("")).to.deep.equal([]);
      });

      it("should handle single direction", () => {
        expect(serializeDirections([5])).to.equal("5");
        expect(deserializeDirections("5")).to.deep.equal([5]);
      });

      it("should round-trip correctly", () => {
        const original = [1, 3, 5, 7, 2, 4, 6, 8];
        const serialized = serializeDirections(original);
        const deserialized = deserializeDirections(serialized);
        expect(deserialized).to.deep.equal(original);
      });
    });

    describe("Highway Bias Calculation", () => {
      /**
       * Simulate highway vs normal room cost calculation.
       */
      function getRoomCost(roomName: string, isHighway: boolean, highwayBias: number): number {
        if (isHighway) return 1;
        return highwayBias;
      }

      it("should apply highway bias to normal rooms", () => {
        const isHighway = false;
        expect(getRoomCost("E5N5", isHighway, 2.5)).to.equal(2.5);
        expect(getRoomCost("E5N5", isHighway, 5.0)).to.equal(5.0);
        expect(getRoomCost("E5N5", isHighway, 1.0)).to.equal(1.0);
      });

      it("should give highway rooms cost of 1", () => {
        const isHighway = true;
        expect(getRoomCost("E10N5", isHighway, 2.5)).to.equal(1);
        expect(getRoomCost("E10N5", isHighway, 5.0)).to.equal(1);
        expect(getRoomCost("E10N5", isHighway, 10.0)).to.equal(1);
      });

      it("should prefer highways with higher bias", () => {
        const highwayRoom = "E10N5";
        const normalRoom = "E5N5";
        
        // With bias 2.5, highway is 2.5x cheaper
        const bias1 = 2.5;
        const highwayCost1 = getRoomCost(highwayRoom, true, bias1);
        const normalCost1 = getRoomCost(normalRoom, false, bias1);
        expect(normalCost1 / highwayCost1).to.equal(2.5);
        
        // With bias 5.0, highway is 5x cheaper
        const bias2 = 5.0;
        const highwayCost2 = getRoomCost(highwayRoom, true, bias2);
        const normalCost2 = getRoomCost(normalRoom, false, bias2);
        expect(normalCost2 / highwayCost2).to.equal(5.0);
      });
    });

    describe("CPU Tracking Logic", () => {
      /**
       * Simulate CPU accumulation and threshold checking.
       */
      interface CPUTracker {
        accumulated: number;
        threshold: number;
      }

      function addCPU(tracker: CPUTracker, cpuUsed: number): boolean {
        tracker.accumulated += cpuUsed;
        return tracker.accumulated > tracker.threshold;
      }

      it("should accumulate CPU usage", () => {
        const tracker: CPUTracker = { accumulated: 0, threshold: 1000 };
        
        addCPU(tracker, 100);
        expect(tracker.accumulated).to.equal(100);
        
        addCPU(tracker, 200);
        expect(tracker.accumulated).to.equal(300);
        
        addCPU(tracker, 500);
        expect(tracker.accumulated).to.equal(800);
      });

      it("should report when threshold exceeded", () => {
        const tracker: CPUTracker = { accumulated: 900, threshold: 1000 };
        
        const shouldReport1 = addCPU(tracker, 50);
        expect(shouldReport1).to.be.false;
        expect(tracker.accumulated).to.equal(950);
        
        const shouldReport2 = addCPU(tracker, 100);
        expect(shouldReport2).to.be.true;
        expect(tracker.accumulated).to.equal(1050);
      });

      it("should not report below threshold", () => {
        const tracker: CPUTracker = { accumulated: 0, threshold: 1000 };
        
        expect(addCPU(tracker, 100)).to.be.false;
        expect(addCPU(tracker, 200)).to.be.false;
        expect(addCPU(tracker, 300)).to.be.false;
        expect(tracker.accumulated).to.equal(600);
      });

      it("should support different thresholds", () => {
        const lowThreshold: CPUTracker = { accumulated: 0, threshold: 100 };
        const highThreshold: CPUTracker = { accumulated: 0, threshold: 5000 };
        
        addCPU(lowThreshold, 150);
        addCPU(highThreshold, 150);
        
        expect(lowThreshold.accumulated > lowThreshold.threshold).to.be.true;
        expect(highThreshold.accumulated > highThreshold.threshold).to.be.false;
      });
    });
  });
});

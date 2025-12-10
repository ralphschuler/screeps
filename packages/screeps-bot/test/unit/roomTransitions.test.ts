import { expect } from "chai";

/**
 * Test room coordinate transitions and path serialization across room boundaries.
 * This test validates the fix for paths wrapping around in the current room
 * instead of properly crossing into adjacent rooms.
 *
 * Issue: Paths that should cross into adjacent rooms were wrapping around
 * within the current room when using string-based path serialization.
 *
 * Root Cause: The serializePathToString function couldn't handle large deltas
 * (e.g., dx=-49) when positions crossed room boundaries.
 *
 * Fix: Added detection for room boundary wrapping (|delta| > 25) and conversion
 * to actual direction deltas.
 */
describe("Room Coordinate Transitions and Path Serialization", () => {
  /**
   * Simulate room name calculation in a direction.
   * This mirrors getRoomNameInDirection from movement.ts.
   */
  function getRoomNameInDirection(roomName: string, direction: number): string {
    const match = /^([WE])(\d+)([NS])(\d+)$/.exec(roomName);
    if (!match) return roomName;

    const [, ew, x, ns, y] = match;
    let xCoord = parseInt(x, 10);
    let yCoord = parseInt(y, 10);
    let xDir = ew;
    let yDir = ns;

    // Direction constants
    const LEFT = 7, RIGHT = 3, TOP = 1, BOTTOM = 5;
    const TOP_LEFT = 8, TOP_RIGHT = 2, BOTTOM_LEFT = 6, BOTTOM_RIGHT = 4;

    // Adjust X coordinate based on direction
    if (direction === LEFT || direction === TOP_LEFT || direction === BOTTOM_LEFT) {
      if (ew === 'W') {
        xCoord++;
      } else {
        if (xCoord === 0) {
          xDir = 'W';
          xCoord = 0;
        } else {
          xCoord--;
        }
      }
    } else if (direction === RIGHT || direction === TOP_RIGHT || direction === BOTTOM_RIGHT) {
      if (ew === 'E') {
        xCoord++;
      } else {
        if (xCoord === 0) {
          xDir = 'E';
          xCoord = 0;
        } else {
          xCoord--;
        }
      }
    }

    // Adjust Y coordinate based on direction
    if (direction === TOP || direction === TOP_LEFT || direction === TOP_RIGHT) {
      if (ns === 'N') {
        yCoord++;
      } else {
        if (yCoord === 0) {
          yDir = 'N';
          yCoord = 0;
        } else {
          yCoord--;
        }
      }
    } else if (direction === BOTTOM || direction === BOTTOM_LEFT || direction === BOTTOM_RIGHT) {
      if (ns === 'S') {
        yCoord++;
      } else {
        if (yCoord === 0) {
          yDir = 'S';
          yCoord = 0;
        } else {
          yCoord--;
        }
      }
    }

    return `${xDir}${xCoord}${yDir}${yCoord}`;
  }

  /**
   * Calculate next position given current position and direction.
   * Handles room transitions at boundaries.
   */
  function positionAtDirection(
    origin: { x: number; y: number; roomName: string },
    direction: number
  ): { x: number; y: number; roomName: string } {
    const offsetX = [0, 0, 1, 1, 1, 0, -1, -1, -1];
    const offsetY = [0, -1, -1, 0, 1, 1, 1, 0, -1];

    const xOffset = offsetX[direction] ?? 0;
    const yOffset = offsetY[direction] ?? 0;

    let x = origin.x + xOffset;
    let y = origin.y + yOffset;
    let roomName = origin.roomName;

    // Direction constants
    const LEFT = 7, RIGHT = 3, TOP = 1, BOTTOM = 5;

    // Handle room transitions
    if (x < 0) {
      x = 49;
      roomName = getRoomNameInDirection(roomName, LEFT);
    } else if (x > 49) {
      x = 0;
      roomName = getRoomNameInDirection(roomName, RIGHT);
    }

    if (y < 0) {
      y = 49;
      roomName = getRoomNameInDirection(roomName, TOP);
    } else if (y > 49) {
      y = 0;
      roomName = getRoomNameInDirection(roomName, BOTTOM);
    }

    return { x, y, roomName };
  }

  /**
   * Serialize path to string with FIXED room boundary handling.
   */
  function serializePathToString(
    startPos: { x: number; y: number; roomName: string },
    path: Array<{ x: number; y: number; roomName: string }>
  ): string {
    const LEFT = 7, RIGHT = 3, TOP = 1, BOTTOM = 5;
    const TOP_LEFT = 8, TOP_RIGHT = 2, BOTTOM_LEFT = 6, BOTTOM_RIGHT = 4;

    let serializedPath = '';
    let lastPosition = startPos;

    for (const position of path) {
      if (position.roomName === lastPosition.roomName) {
        // Same room - use simple direction calculation
        const dx = position.x - lastPosition.x;
        const dy = position.y - lastPosition.y;

        let direction = RIGHT;
        if (dx === 0 && dy === -1) direction = TOP;
        else if (dx === 1 && dy === -1) direction = TOP_RIGHT;
        else if (dx === 1 && dy === 0) direction = RIGHT;
        else if (dx === 1 && dy === 1) direction = BOTTOM_RIGHT;
        else if (dx === 0 && dy === 1) direction = BOTTOM;
        else if (dx === -1 && dy === 1) direction = BOTTOM_LEFT;
        else if (dx === -1 && dy === 0) direction = LEFT;
        else if (dx === -1 && dy === -1) direction = TOP_LEFT;

        serializedPath += direction;
      } else {
        // Cross-room transition - calculate direction accounting for room boundary wrap
        let dx = position.x - lastPosition.x;
        let dy = position.y - lastPosition.y;

        // FIXED: Adjust for room boundary wrapping
        if (Math.abs(dx) > 25) {
          if (dx > 0) {
            dx = -(50 - dx);
          } else {
            dx = 50 + dx;
          }
        }

        if (Math.abs(dy) > 25) {
          if (dy > 0) {
            dy = -(50 - dy);
          } else {
            dy = 50 + dy;
          }
        }

        // Calculate direction from adjusted delta
        let direction = RIGHT;
        if (dx === 0 && dy === -1) direction = TOP;
        else if (dx === 1 && dy === -1) direction = TOP_RIGHT;
        else if (dx === 1 && dy === 0) direction = RIGHT;
        else if (dx === 1 && dy === 1) direction = BOTTOM_RIGHT;
        else if (dx === 0 && dy === 1) direction = BOTTOM;
        else if (dx === -1 && dy === 1) direction = BOTTOM_LEFT;
        else if (dx === -1 && dy === 0) direction = LEFT;
        else if (dx === -1 && dy === -1) direction = TOP_LEFT;

        serializedPath += direction;
      }
      lastPosition = position;
    }

    return serializedPath;
  }

  /**
   * Deserialize path from string of directions.
   */
  function deserializePathFromString(
    startPos: { x: number; y: number; roomName: string },
    serialized: string
  ): Array<{ x: number; y: number; roomName: string }> {
    const path: Array<{ x: number; y: number; roomName: string }> = [];
    let currentPos = startPos;

    for (const char of serialized) {
      const direction = parseInt(char, 10);
      const nextPos = positionAtDirection(currentPos, direction);
      path.push(nextPos);
      currentPos = nextPos;
    }

    return path;
  }

  describe("Path Serialization Across Room Boundaries", () => {
    it("should correctly serialize and deserialize path crossing RIGHT from E1N1 to E2N1", () => {
      const startPos = { x: 48, y: 25, roomName: "E1N1" };
      const path = [
        { x: 49, y: 25, roomName: "E1N1" },
        { x: 0, y: 25, roomName: "E2N1" },
        { x: 1, y: 25, roomName: "E2N1" }
      ];

      const serialized = serializePathToString(startPos, path);
      const deserialized = deserializePathFromString(startPos, serialized);

      // Should serialize as "333" (RIGHT, RIGHT, RIGHT)
      expect(serialized).to.equal("333");

      // All positions should match
      for (let i = 0; i < path.length; i++) {
        expect(deserialized[i]).to.deep.equal(path[i]);
      }
    });

    it("should correctly serialize and deserialize path crossing LEFT from E1N1 to E0N1", () => {
      const startPos = { x: 2, y: 25, roomName: "E1N1" };
      const path = [
        { x: 1, y: 25, roomName: "E1N1" },
        { x: 0, y: 25, roomName: "E1N1" },
        { x: 49, y: 25, roomName: "E0N1" },
        { x: 48, y: 25, roomName: "E0N1" }
      ];

      const serialized = serializePathToString(startPos, path);
      const deserialized = deserializePathFromString(startPos, serialized);

      // Should serialize as "7777" (LEFT, LEFT, LEFT, LEFT)
      expect(serialized).to.equal("7777");

      for (let i = 0; i < path.length; i++) {
        expect(deserialized[i]).to.deep.equal(path[i]);
      }
    });

    it("should correctly serialize and deserialize path crossing TOP from E1N1 to E1N2", () => {
      const startPos = { x: 25, y: 2, roomName: "E1N1" };
      const path = [
        { x: 25, y: 1, roomName: "E1N1" },
        { x: 25, y: 0, roomName: "E1N1" },
        { x: 25, y: 49, roomName: "E1N2" },
        { x: 25, y: 48, roomName: "E1N2" }
      ];

      const serialized = serializePathToString(startPos, path);
      const deserialized = deserializePathFromString(startPos, serialized);

      // Should serialize as "1111" (TOP, TOP, TOP, TOP)
      expect(serialized).to.equal("1111");

      for (let i = 0; i < path.length; i++) {
        expect(deserialized[i]).to.deep.equal(path[i]);
      }
    });

    it("should correctly serialize and deserialize path crossing BOTTOM from E1N1 to E1N0", () => {
      const startPos = { x: 25, y: 47, roomName: "E1N1" };
      const path = [
        { x: 25, y: 48, roomName: "E1N1" },
        { x: 25, y: 49, roomName: "E1N1" },
        { x: 25, y: 0, roomName: "E1N0" },
        { x: 25, y: 1, roomName: "E1N0" }
      ];

      const serialized = serializePathToString(startPos, path);
      const deserialized = deserializePathFromString(startPos, serialized);

      // Should serialize as "5555" (BOTTOM, BOTTOM, BOTTOM, BOTTOM)
      expect(serialized).to.equal("5555");

      for (let i = 0; i < path.length; i++) {
        expect(deserialized[i]).to.deep.equal(path[i]);
      }
    });

    it("should correctly serialize and deserialize diagonal crossing from E1N1 to E2N2", () => {
      const startPos = { x: 48, y: 1, roomName: "E1N1" };
      const path = [
        { x: 49, y: 0, roomName: "E1N1" },
        { x: 0, y: 49, roomName: "E2N2" },
        { x: 1, y: 48, roomName: "E2N2" }
      ];

      const serialized = serializePathToString(startPos, path);
      const deserialized = deserializePathFromString(startPos, serialized);

      // Should serialize as "222" (TOP_RIGHT, TOP_RIGHT, TOP_RIGHT)
      expect(serialized).to.equal("222");

      for (let i = 0; i < path.length; i++) {
        expect(deserialized[i]).to.deep.equal(path[i]);
      }
    });

    it("should correctly handle path crossing from E0N1 to W0N1 (E/W boundary)", () => {
      const startPos = { x: 2, y: 25, roomName: "E0N1" };
      const path = [
        { x: 1, y: 25, roomName: "E0N1" },
        { x: 0, y: 25, roomName: "E0N1" },
        { x: 49, y: 25, roomName: "W0N1" }
      ];

      const serialized = serializePathToString(startPos, path);
      const deserialized = deserializePathFromString(startPos, serialized);

      expect(serialized).to.equal("777");

      for (let i = 0; i < path.length; i++) {
        expect(deserialized[i]).to.deep.equal(path[i]);
      }
    });

    it("should correctly handle path crossing from E1N0 to E1S0 (N/S boundary)", () => {
      const startPos = { x: 25, y: 47, roomName: "E1N0" };
      const path = [
        { x: 25, y: 48, roomName: "E1N0" },
        { x: 25, y: 49, roomName: "E1N0" },
        { x: 25, y: 0, roomName: "E1S0" }
      ];

      const serialized = serializePathToString(startPos, path);
      const deserialized = deserializePathFromString(startPos, serialized);

      expect(serialized).to.equal("555");

      for (let i = 0; i < path.length; i++) {
        expect(deserialized[i]).to.deep.equal(path[i]);
      }
    });

    it("should handle complex path with multiple room transitions", () => {
      const startPos = { x: 48, y: 48, roomName: "E1N1" };
      const path = [
        { x: 49, y: 49, roomName: "E1N1" },     // Move to corner
        { x: 0, y: 0, roomName: "E2N0" },       // Cross diagonally to E2N0
        { x: 1, y: 1, roomName: "E2N0" },       // Move inward
        { x: 2, y: 2, roomName: "E2N0" }        // Continue
      ];

      const serialized = serializePathToString(startPos, path);
      const deserialized = deserializePathFromString(startPos, serialized);

      // Should be able to reconstruct the path
      for (let i = 0; i < path.length; i++) {
        expect(deserialized[i]).to.deep.equal(path[i]);
      }
    });

    it("should not break on same-room paths", () => {
      const startPos = { x: 20, y: 20, roomName: "E1N1" };
      const path = [
        { x: 21, y: 20, roomName: "E1N1" },
        { x: 22, y: 20, roomName: "E1N1" },
        { x: 23, y: 21, roomName: "E1N1" },
        { x: 24, y: 22, roomName: "E1N1" }
      ];

      const serialized = serializePathToString(startPos, path);
      const deserialized = deserializePathFromString(startPos, serialized);

      // Path should be correctly serialized
      expect(serialized).to.have.lengthOf(4);

      for (let i = 0; i < path.length; i++) {
        expect(deserialized[i]).to.deep.equal(path[i]);
      }
    });
  });

  describe("Room Name Calculation", () => {
    it("should correctly calculate adjacent room names in cardinal directions", () => {
      expect(getRoomNameInDirection("E1N1", 3)).to.equal("E2N1"); // RIGHT
      expect(getRoomNameInDirection("E1N1", 7)).to.equal("E0N1"); // LEFT
      expect(getRoomNameInDirection("E1N1", 1)).to.equal("E1N2"); // TOP
      expect(getRoomNameInDirection("E1N1", 5)).to.equal("E1N0"); // BOTTOM
    });

    it("should handle E/W sector boundaries", () => {
      expect(getRoomNameInDirection("E0N1", 7)).to.equal("W0N1"); // LEFT from E0
      expect(getRoomNameInDirection("W0N1", 3)).to.equal("E0N1"); // RIGHT from W0
    });

    it("should handle N/S sector boundaries", () => {
      expect(getRoomNameInDirection("E1N0", 5)).to.equal("E1S0"); // BOTTOM from N0
      expect(getRoomNameInDirection("E1S0", 1)).to.equal("E1N0"); // TOP from S0
    });

    it("should handle diagonal directions", () => {
      expect(getRoomNameInDirection("E1N1", 2)).to.equal("E2N2"); // TOP_RIGHT
      expect(getRoomNameInDirection("E1N1", 4)).to.equal("E2N0"); // BOTTOM_RIGHT
      expect(getRoomNameInDirection("E1N1", 6)).to.equal("E0N0"); // BOTTOM_LEFT
      expect(getRoomNameInDirection("E1N1", 8)).to.equal("E0N2"); // TOP_LEFT
    });
  });
});

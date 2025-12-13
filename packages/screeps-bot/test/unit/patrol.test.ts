import { expect } from "chai";

/**
 * Unit tests for the patrol functionality logic.
 * These tests validate the patrol waypoint generation and cycling logic
 * used by defense units (guard and ranger roles).
 */

describe("Defense Unit Patrol Functionality", () => {
  /**
   * Simulates the getPatrolWaypoints logic that generates waypoints
   * around exits and spawns for defense units to patrol.
   * 
   * UPDATED: Enhanced patrol coverage to match military.ts implementation
   */
  function getPatrolWaypoints(
    spawns: Array<{ x: number; y: number }>,
    roomName: string,
    isWall: (x: number, y: number) => boolean = () => false
  ): Array<{ x: number; y: number; roomName: string }> {
    const waypoints: Array<{ x: number; y: number; roomName: string }> = [];

    // Add spawn area positions (offset from spawns)
    for (const spawn of spawns) {
      waypoints.push({ x: spawn.x + 3, y: spawn.y + 3, roomName });
      waypoints.push({ x: spawn.x - 3, y: spawn.y - 3, roomName });
    }

    // Add exit patrol positions (center and corners of each exit side)
    // Top exit (center and corners)
    waypoints.push({ x: 10, y: 5, roomName });
    waypoints.push({ x: 25, y: 5, roomName });
    waypoints.push({ x: 39, y: 5, roomName });
    // Bottom exit (center and corners)
    waypoints.push({ x: 10, y: 44, roomName });
    waypoints.push({ x: 25, y: 44, roomName });
    waypoints.push({ x: 39, y: 44, roomName });
    // Left exit (center and mid-points)
    waypoints.push({ x: 5, y: 10, roomName });
    waypoints.push({ x: 5, y: 25, roomName });
    waypoints.push({ x: 5, y: 39, roomName });
    // Right exit (center and mid-points)
    waypoints.push({ x: 44, y: 10, roomName });
    waypoints.push({ x: 44, y: 25, roomName });
    waypoints.push({ x: 44, y: 39, roomName });

    // Add room corners for complete coverage
    waypoints.push({ x: 10, y: 10, roomName });
    waypoints.push({ x: 39, y: 10, roomName });
    waypoints.push({ x: 10, y: 39, roomName });
    waypoints.push({ x: 39, y: 39, roomName });

    // Add central waypoint for room center coverage
    waypoints.push({ x: 25, y: 25, roomName });

    // Filter and clamp positions
    return waypoints
      .filter(pos => {
        const x = Math.max(2, Math.min(47, pos.x));
        const y = Math.max(2, Math.min(47, pos.y));
        return !isWall(x, y);
      })
      .map(pos => ({
        x: Math.max(2, Math.min(47, pos.x)),
        y: Math.max(2, Math.min(47, pos.y)),
        roomName
      }));
  }

  /**
   * Simulates the patrol waypoint cycling logic.
   */
  interface PatrolMemory {
    patrolIndex?: number;
  }

  function getNextPatrolWaypoint(
    memory: PatrolMemory,
    creepPos: { x: number; y: number },
    waypoints: Array<{ x: number; y: number; roomName: string }>,
    arrivalThreshold: number = 2
  ): { waypoint: { x: number; y: number; roomName: string } | null; newIndex: number } {
    if (waypoints.length === 0) {
      return { waypoint: null, newIndex: 0 };
    }

    let index = memory.patrolIndex ?? 0;
    const currentWaypoint = waypoints[index % waypoints.length];

    if (currentWaypoint) {
      // Check if within arrival threshold (Chebyshev distance)
      const distance = Math.max(
        Math.abs(creepPos.x - currentWaypoint.x),
        Math.abs(creepPos.y - currentWaypoint.y)
      );

      if (distance <= arrivalThreshold) {
        // Advance to next waypoint
        index = (index + 1) % waypoints.length;
      }
    }

    return {
      waypoint: waypoints[index % waypoints.length] ?? null,
      newIndex: index
    };
  }

  describe("Patrol Waypoint Generation", () => {
    it("should generate patrol waypoints covering all four exits", () => {
      const waypoints = getPatrolWaypoints([], "E1N1");

      // Should have at least 17 waypoints (12 exit points + 4 corners + 1 center)
      expect(waypoints.length).to.be.at.least(17);

      // Check for exit waypoints (center and corners)
      const hasTopExitCenter = waypoints.some(w => w.y === 5 && w.x === 25);
      const hasTopExitLeft = waypoints.some(w => w.y === 5 && w.x === 10);
      const hasTopExitRight = waypoints.some(w => w.y === 5 && w.x === 39);
      const hasBottomExitCenter = waypoints.some(w => w.y === 44 && w.x === 25);
      const hasLeftExitCenter = waypoints.some(w => w.x === 5 && w.y === 25);
      const hasRightExitCenter = waypoints.some(w => w.x === 44 && w.y === 25);

      expect(hasTopExitCenter, "Should have top exit center waypoint").to.be.true;
      expect(hasTopExitLeft, "Should have top exit left waypoint").to.be.true;
      expect(hasTopExitRight, "Should have top exit right waypoint").to.be.true;
      expect(hasBottomExitCenter, "Should have bottom exit waypoint").to.be.true;
      expect(hasLeftExitCenter, "Should have left exit waypoint").to.be.true;
      expect(hasRightExitCenter, "Should have right exit waypoint").to.be.true;
    });

    it("should add waypoints near spawns", () => {
      const spawns = [{ x: 25, y: 25 }];
      const waypoints = getPatrolWaypoints(spawns, "E1N1");

      // Should have spawn-related waypoints
      const hasSpawnOffset1 = waypoints.some(w => w.x === 28 && w.y === 28);
      const hasSpawnOffset2 = waypoints.some(w => w.x === 22 && w.y === 22);

      expect(hasSpawnOffset1, "Should have spawn offset waypoint +3,+3").to.be.true;
      expect(hasSpawnOffset2, "Should have spawn offset waypoint -3,-3").to.be.true;
    });

    it("should clamp waypoints to valid room bounds", () => {
      // Spawn near edge that would create out-of-bounds offset
      const spawns = [{ x: 1, y: 1 }];
      const waypoints = getPatrolWaypoints(spawns, "E1N1");

      // All waypoints should be within valid bounds
      for (const waypoint of waypoints) {
        expect(waypoint.x).to.be.at.least(2);
        expect(waypoint.x).to.be.at.most(47);
        expect(waypoint.y).to.be.at.least(2);
        expect(waypoint.y).to.be.at.most(47);
      }
    });

    it("should filter out wall positions", () => {
      // Make position (25, 5) a wall (top exit waypoint)
      const isWall = (x: number, y: number) => x === 25 && y === 5;
      const waypoints = getPatrolWaypoints([], "E1N1", isWall);

      // Should not have the wall position
      const hasTopExit = waypoints.some(w => w.y === 5 && w.x === 25);
      expect(hasTopExit).to.be.false;

      // But should still have other exit waypoints
      expect(waypoints.length).to.be.at.least(3);
    });

    it("should generate waypoints for multiple spawns", () => {
      const spawns = [
        { x: 20, y: 20 },
        { x: 30, y: 30 }
      ];
      const waypoints = getPatrolWaypoints(spawns, "E1N1");

      // Should have waypoints for both spawns (2 per spawn) plus 12 exit waypoints + 4 corners + 1 center
      expect(waypoints.length).to.equal(21);
    });

    it("should include room corners for complete coverage", () => {
      const waypoints = getPatrolWaypoints([], "E1N1");

      // Check for corner waypoints
      const hasTopLeft = waypoints.some(w => w.x === 10 && w.y === 10);
      const hasTopRight = waypoints.some(w => w.x === 39 && w.y === 10);
      const hasBottomLeft = waypoints.some(w => w.x === 10 && w.y === 39);
      const hasBottomRight = waypoints.some(w => w.x === 39 && w.y === 39);

      expect(hasTopLeft, "Should have top-left corner waypoint").to.be.true;
      expect(hasTopRight, "Should have top-right corner waypoint").to.be.true;
      expect(hasBottomLeft, "Should have bottom-left corner waypoint").to.be.true;
      expect(hasBottomRight, "Should have bottom-right corner waypoint").to.be.true;
    });

    it("should include central waypoint for room center coverage", () => {
      const waypoints = getPatrolWaypoints([], "E1N1");

      // Check for central waypoint
      const hasCenter = waypoints.some(w => w.x === 25 && w.y === 25);
      expect(hasCenter, "Should have central waypoint").to.be.true;
    });
  });

  describe("Patrol Waypoint Cycling", () => {
    const waypoints = [
      { x: 25, y: 5, roomName: "E1N1" },
      { x: 44, y: 25, roomName: "E1N1" },
      { x: 25, y: 44, roomName: "E1N1" },
      { x: 5, y: 25, roomName: "E1N1" }
    ];

    it("should start at index 0 when no patrol index is set", () => {
      const memory: PatrolMemory = {};
      const result = getNextPatrolWaypoint(memory, { x: 30, y: 30 }, waypoints);

      expect(result.waypoint).to.deep.equal(waypoints[0]);
      expect(result.newIndex).to.equal(0);
    });

    it("should advance to next waypoint when within threshold", () => {
      const memory: PatrolMemory = { patrolIndex: 0 };
      // Creep position within 2 tiles of waypoint[0] (25, 5)
      const result = getNextPatrolWaypoint(memory, { x: 25, y: 6 }, waypoints);

      expect(result.waypoint).to.deep.equal(waypoints[1]);
      expect(result.newIndex).to.equal(1);
    });

    it("should stay at current waypoint when not within threshold", () => {
      const memory: PatrolMemory = { patrolIndex: 0 };
      // Creep position far from waypoint[0] (25, 5)
      const result = getNextPatrolWaypoint(memory, { x: 30, y: 30 }, waypoints);

      expect(result.waypoint).to.deep.equal(waypoints[0]);
      expect(result.newIndex).to.equal(0);
    });

    it("should cycle back to first waypoint after last", () => {
      const memory: PatrolMemory = { patrolIndex: 3 };
      // Creep at last waypoint (5, 25)
      const result = getNextPatrolWaypoint(memory, { x: 5, y: 25 }, waypoints);

      expect(result.waypoint).to.deep.equal(waypoints[0]);
      expect(result.newIndex).to.equal(0);
    });

    it("should handle empty waypoints array", () => {
      const memory: PatrolMemory = { patrolIndex: 0 };
      const result = getNextPatrolWaypoint(memory, { x: 25, y: 25 }, []);

      expect(result.waypoint).to.be.null;
      expect(result.newIndex).to.equal(0);
    });

    it("should handle invalid patrol index (greater than array length)", () => {
      const memory: PatrolMemory = { patrolIndex: 100 };
      const result = getNextPatrolWaypoint(memory, { x: 30, y: 30 }, waypoints);

      // Should wrap around using modulo
      expect(result.waypoint).to.not.be.null;
      expect(result.newIndex % waypoints.length).to.be.at.least(0);
      expect(result.newIndex % waypoints.length).to.be.at.most(waypoints.length - 1);
    });

    it("should use Chebyshev distance for arrival threshold", () => {
      const memory: PatrolMemory = { patrolIndex: 0 };
      // Waypoint is at (25, 5), testing diagonal approach
      // Chebyshev distance of (27, 7) to (25, 5) = max(2, 2) = 2
      const result = getNextPatrolWaypoint(memory, { x: 27, y: 7 }, waypoints);

      // Should advance because Chebyshev distance is exactly 2 (threshold)
      expect(result.newIndex).to.equal(1);
    });

    it("should not advance when Chebyshev distance is above threshold", () => {
      const memory: PatrolMemory = { patrolIndex: 0 };
      // Waypoint is at (25, 5), Chebyshev distance of (28, 5) = 3
      const result = getNextPatrolWaypoint(memory, { x: 28, y: 5 }, waypoints);

      // Should not advance
      expect(result.newIndex).to.equal(0);
    });
  });

  describe("Patrol Coverage", () => {
    it("should provide coverage of all room exits when patrolling", () => {
      const waypoints = getPatrolWaypoints([{ x: 25, y: 25 }], "E1N1");

      // Verify exit coverage (within reasonable range of each exit)
      const exitCoverage = {
        top: false,
        bottom: false,
        left: false,
        right: false
      };

      for (const waypoint of waypoints) {
        if (waypoint.y <= 10) exitCoverage.top = true;
        if (waypoint.y >= 40) exitCoverage.bottom = true;
        if (waypoint.x <= 10) exitCoverage.left = true;
        if (waypoint.x >= 40) exitCoverage.right = true;
      }

      expect(exitCoverage.top, "Should cover top exit area").to.be.true;
      expect(exitCoverage.bottom, "Should cover bottom exit area").to.be.true;
      expect(exitCoverage.left, "Should cover left exit area").to.be.true;
      expect(exitCoverage.right, "Should cover right exit area").to.be.true;
    });

    it("should cycle through all waypoints in order", () => {
      const waypoints = [
        { x: 10, y: 10, roomName: "E1N1" },
        { x: 40, y: 10, roomName: "E1N1" },
        { x: 40, y: 40, roomName: "E1N1" },
        { x: 10, y: 40, roomName: "E1N1" }
      ];

      const memory: PatrolMemory = { patrolIndex: 0 };
      const visitedOrder: number[] = [];

      // Simulate a full patrol cycle
      for (let i = 0; i < waypoints.length; i++) {
        const currentIndex = memory.patrolIndex ?? 0;
        const currentWaypoint = waypoints[currentIndex];
        if (!currentWaypoint) break; // Guard clause for null safety

        const result = getNextPatrolWaypoint(
          { patrolIndex: memory.patrolIndex },
          currentWaypoint, // Simulate being at current waypoint
          waypoints
        );
        visitedOrder.push(result.newIndex);
        memory.patrolIndex = result.newIndex;
      }

      // Should visit waypoints in order: 1, 2, 3, 0 (cycles back)
      expect(visitedOrder).to.deep.equal([1, 2, 3, 0]);
    });
  });
});

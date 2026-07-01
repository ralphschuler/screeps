import { assert } from "chai";
import { hasCompleteRemotePath, REMOTE_PATH_SEARCH_POLICY, searchRemotePath } from "../src/paths/remotePathSearch";
import type { ILogger } from "../src/types";

class MockLogger implements ILogger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
}

class TestCostMatrix implements CostMatrix {
  private readonly costs = new Map<string, number>();

  set(x: number, y: number, cost: number): undefined {
    this.costs.set(`${x},${y}`, cost);
    return undefined;
  }

  get(x: number, y: number): number {
    return this.costs.get(`${x},${y}`) ?? 0;
  }

  clone(): CostMatrix {
    const copy = new TestCostMatrix();
    for (const [key, cost] of this.costs) {
      const [x, y] = key.split(",").map(Number);
      copy.set(x, y, cost);
    }
    return copy;
  }

  serialize(): number[] {
    return [];
  }
}

describe("remotePathSearch", () => {
  beforeEach(() => {
    // @ts-expect-error: Setting up test environment
    global.Game = { rooms: {} };

    // @ts-expect-error: Setting up test environment
    global.RoomPosition = class RoomPosition {
      x: number;
      y: number;
      roomName: string;

      constructor(x: number, y: number, roomName: string) {
        this.x = x;
        this.y = y;
        this.roomName = roomName;
      }
    };
  });

  it("uses the documented remote-mining search policy", () => {
    const from = new RoomPosition(10, 10, "W1N1");
    const to = new RoomPosition(20, 20, "W2N2");
    let capturedOrigin: RoomPosition | undefined;
    let capturedGoal: { pos: RoomPosition; range: number } | undefined;
    let capturedOptions: PathFinderOpts | undefined;

    (global as unknown as Record<string, unknown>).PathFinder = {
      search: (origin: RoomPosition, goal: { pos: RoomPosition; range: number }, options: PathFinderOpts) => {
        capturedOrigin = origin;
        capturedGoal = goal;
        capturedOptions = options;

        return {
          path: [to],
          ops: 50,
          cost: 2,
          incomplete: false
        };
      },
      CostMatrix: TestCostMatrix
    };

    const result = searchRemotePath(from, to, new MockLogger());

    assert.strictEqual(capturedOrigin, from);
    assert.strictEqual(capturedGoal?.pos, to);
    assert.equal(capturedGoal?.range, REMOTE_PATH_SEARCH_POLICY.goalRange);
    assert.equal(capturedOptions?.plainCost, REMOTE_PATH_SEARCH_POLICY.plainCost);
    assert.equal(capturedOptions?.swampCost, REMOTE_PATH_SEARCH_POLICY.swampCost);
    assert.equal(capturedOptions?.maxRooms, REMOTE_PATH_SEARCH_POLICY.maxRooms);
    assert.equal(capturedOptions?.roomCallback?.("W9N9"), true);
    assert.deepEqual(result.path, [to]);
  });

  it("delegates visible-room costs through the remote mining room callback", () => {
    const from = new RoomPosition(10, 10, "W1N1");
    const to = new RoomPosition(20, 20, "W2N2");
    let capturedOptions: PathFinderOpts | undefined;

    (global as unknown as Record<string, number>).FIND_STRUCTURES = 107;
    (global as unknown as Record<string, number>).FIND_CREEPS = 101;
    (global as unknown as Record<string, string>).STRUCTURE_ROAD = "road";
    // Highway room skips hostile-structure filtering and still exercises the shared road/creep costs.
    // @ts-expect-error: Setting up test environment
    global.Game.rooms = {
      W10N9: {
        find: (type: FindConstant) => {
          if (type === FIND_STRUCTURES) {
            return [{ structureType: STRUCTURE_ROAD, pos: { x: 2, y: 3 } }];
          }
          if (type === FIND_CREEPS) {
            return [{ pos: { x: 5, y: 6 } }];
          }
          return [];
        }
      }
    };

    (global as unknown as Record<string, unknown>).PathFinder = {
      search: (_origin: RoomPosition, _goal: { pos: RoomPosition; range: number }, options: PathFinderOpts) => {
        capturedOptions = options;

        return {
          path: [to],
          ops: 50,
          cost: 2,
          incomplete: false
        };
      },
      CostMatrix: TestCostMatrix
    };

    searchRemotePath(from, to, new MockLogger());

    const costs = capturedOptions?.roomCallback?.("W10N9");
    assert.instanceOf(costs, TestCostMatrix);
    assert.equal((costs as CostMatrix).get(2, 3), 1);
    assert.equal((costs as CostMatrix).get(5, 6), 255);
  });

  it("avoids hostile signed-edge rooms that are not raw-index highways", () => {
    const from = new RoomPosition(10, 10, "W1N1");
    const to = new RoomPosition(20, 20, "W2N2");
    let capturedOptions: PathFinderOpts | undefined;

    (global as unknown as Record<string, number>).FIND_STRUCTURES = 107;
    (global as unknown as Record<string, number>).FIND_CREEPS = 101;
    (global as unknown as Record<string, number>).FIND_HOSTILE_STRUCTURES = 108;
    (global as unknown as Record<string, string>).STRUCTURE_ROAD = "road";
    (global as unknown as Record<string, string>).STRUCTURE_TOWER = "tower";
    (global as unknown as Record<string, string>).STRUCTURE_CONTROLLER = "controller";
    (global as unknown as Record<string, string>).STRUCTURE_KEEPER_LAIR = "keeperLair";

    // @ts-expect-error: Setting up test environment
    global.Game.rooms = {
      W9N1: {
        find: (type: FindConstant) => {
          if (type === FIND_STRUCTURES) {
            return [{ structureType: STRUCTURE_ROAD, pos: { x: 2, y: 3 } }];
          }
          if (type === FIND_CREEPS) {
            return [];
          }
          if (type === FIND_HOSTILE_STRUCTURES) {
            return [{ structureType: STRUCTURE_TOWER, owner: { username: "Enemy" }, pos: { x: 10, y: 10 } }];
          }
          return [];
        }
      }
    };

    (global as unknown as Record<string, unknown>).PathFinder = {
      search: (_origin: RoomPosition, _goal: { pos: RoomPosition; range: number }, options: PathFinderOpts) => {
        capturedOptions = options;

        return {
          path: [to],
          ops: 50,
          cost: 2,
          incomplete: false
        };
      },
      CostMatrix: TestCostMatrix
    };

    searchRemotePath(from, to, new MockLogger());

    assert.equal(capturedOptions?.roomCallback?.("W9N1"), false);
  });

  it("treats only non-empty complete searches as cacheable", () => {
    const pos = new RoomPosition(1, 1, "W1N1");
    const complete = { path: [pos], ops: 1, cost: 1, incomplete: false };
    const incomplete = { path: [pos], ops: 1, cost: 1, incomplete: true };
    const empty = { path: [], ops: 1, cost: 1, incomplete: false };

    assert.isTrue(hasCompleteRemotePath(complete));
    assert.isFalse(hasCompleteRemotePath(incomplete));
    assert.isFalse(hasCompleteRemotePath(empty));
  });
});

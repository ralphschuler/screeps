import { assert } from "chai";
import { RemoteMiningMovement } from "../src/movement/remoteMiningMovement";
import type { ILogger, IPathCache } from "../src/types";
import type { RemotePathCache } from "../src/paths/remotePathCache";

class MockLogger implements ILogger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
}

describe("RemoteMiningMovement", () => {
  beforeEach(() => {
    (global as unknown as { OK: number; ERR_TIRED: number }).OK = 0;
    (global as unknown as { ERR_TIRED: number }).ERR_TIRED = -11;
    (global as unknown as { RoomPosition: typeof RoomPosition }).RoomPosition = class RoomPosition {
      public constructor(public x: number, public y: number, public roomName: string) {}
    } as typeof RoomPosition;
  });

  it("does not run a second PathFinder search after cartographer movement on cache miss", () => {
    let pathFinderCalls = 0;
    (global as unknown as { PathFinder: typeof PathFinder }).PathFinder = {
      search: () => {
        pathFinderCalls++;
        return { path: [], incomplete: false, ops: 0, cost: 0 };
      }
    } as typeof PathFinder;

    const pathCache = {
      getCachedPath: () => null,
      cachePath: () => undefined,
      convertRoomPositionsToPathSteps: () => []
    } satisfies IPathCache;

    const remotePaths = {
      getRemoteMiningPath: () => null,
      cacheRemoteMiningPath: () => undefined
    } as unknown as RemotePathCache;

    const creep = {
      name: "remoteHauler1",
      pos: new RoomPosition(10, 10, "W1N1")
    } as unknown as Creep;
    const target = new RoomPosition(20, 20, "W2N2");

    const movement = new RemoteMiningMovement(
      new MockLogger(),
      pathCache,
      remotePaths,
      (_creep, _target, options) => {
        assert.equal(options?.maxRooms, 16);
        return OK;
      }
    );

    assert.equal(movement.moveToWithRemoteCache(creep, target, "hauler"), OK);
    assert.equal(pathFinderCalls, 0, "cache miss should rely on cartographer cache instead of duplicate PathFinder.search");
  });
});

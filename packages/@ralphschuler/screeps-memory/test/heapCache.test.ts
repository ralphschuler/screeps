import { assert } from "chai";
import { HeapCacheManager } from "../src/heap-cache.ts";

describe("HeapCacheManager", () => {
  let tick = 1000;
  let cache: HeapCacheManager;

  beforeEach(() => {
    tick += 1;
    const g = global as any;
    g.Game = { time: tick };
    g.Memory = {};
    delete g._heapCache;
    cache = new HeapCacheManager();
  });

  it("treats undefined writes as cache deletes", () => {
    cache.initialize();
    cache.set("remote-path", "serialized-path", 100);
    cache.persist(true);

    assert.property((global as any).Memory._heapCache.data, "remote-path");

    cache.set("remote-path", undefined, 100);
    cache.persist(true);

    assert.isUndefined(cache.get("remote-path"));
    assert.notProperty((global as any).Memory._heapCache.data, "remote-path");
  });

  it("drops stale persisted entries with undefined values during rehydrate", () => {
    (global as any).Memory._heapCache = {
      version: 1,
      lastSync: tick,
      data: {
        stale: {
          lastModified: tick,
          ttl: 100
        }
      }
    };

    cache.initialize();

    assert.isUndefined(cache.get("stale"));
    assert.notProperty((global as any).Memory._heapCache.data, "stale");
  });

  it("does not persist live Memory reference cache entries", () => {
    cache.initialize();
    cache.set("memory:empire", { playerPostures: { players: { Enemy: { incidents: new Array(100).fill({ tick, roomName: "W1N1", severity: "hostileCombat" }) } } } }, -1);
    cache.set("path:remote", "serialized-path", 100);

    const persisted = cache.persist(true);

    assert.equal(persisted, 1);
    assert.notProperty((global as any).Memory._heapCache.data, "memory:empire");
    assert.property((global as any).Memory._heapCache.data, "path:remote");
  });
});

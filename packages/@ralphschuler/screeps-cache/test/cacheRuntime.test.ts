import { assert } from "chai";
import { CacheLayer } from "../src/CacheCoherence.ts";
import { createCacheRuntime } from "../src/CacheRuntime.ts";
import { registerAllCaches } from "../src/cacheRegistration.ts";

describe("CacheRuntime", () => {
  beforeEach(() => {
    (global as any).Game = { time: 1 };
    (global as any).Memory = {};
  });

  it("should create distinct cache owner objects", () => {
    const one = createCacheRuntime();
    const two = createCacheRuntime();

    assert.notEqual(one.cacheManager, two.cacheManager);
    assert.notEqual(one.coherenceManager, two.coherenceManager);
  });

  it("should register caches against the supplied runtime", () => {
    const runtime = createCacheRuntime();
    registerAllCaches(runtime);

    assert.include(runtime.coherenceManager.getRegisteredCaches(), "object");
    assert.property(runtime.coherenceManager.getCacheStats().layers, CacheLayer.L1);
  });
});

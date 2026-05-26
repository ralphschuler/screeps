import { assert } from "chai";
import {
  fromMemoryCacheEntry,
  isCacheEntryExpired,
  toMemoryCacheEntry
} from "@ralphschuler/screeps-cache";

describe("Memory store policy Module", () => {
  it("evaluates ttl expiry consistently", () => {
    assert.isFalse(isCacheEntryExpired(10, undefined, 100));
    assert.isFalse(isCacheEntryExpired(10, -1, 100));
    assert.isFalse(isCacheEntryExpired(10, 5, 14));
    assert.isTrue(isCacheEntryExpired(10, 5, 15));
    assert.isTrue(isCacheEntryExpired(10, 0, 11));
  });

  it("round-trips cache entries through Memory shape", () => {
    const memory = toMemoryCacheEntry({ value: "x", cachedAt: 10, lastAccessed: 11, ttl: 5, hits: 2, dirty: true });
    assert.deepEqual(memory, { value: "x", cachedAt: 10, ttl: 5, hits: 2 });
    assert.deepEqual(fromMemoryCacheEntry(memory, 20), {
      value: "x",
      cachedAt: 10,
      lastAccessed: 20,
      ttl: 5,
      hits: 2,
      dirty: false
    });
  });
});

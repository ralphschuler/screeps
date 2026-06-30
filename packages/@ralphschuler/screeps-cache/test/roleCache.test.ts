import { assert } from "chai";

type RoleCacheModule = typeof import("../src/domains/RoleCache.ts");
type CacheManagerModule = typeof import("../src/CacheManager.ts");

const SCREEPS_FIND_CONSTANTS = [
  "FIND_SOURCES",
  "FIND_MINERALS",
  "FIND_DEPOSITS",
  "FIND_STRUCTURES",
  "FIND_MY_STRUCTURES",
  "FIND_HOSTILE_STRUCTURES",
  "FIND_MY_SPAWNS",
  "FIND_MY_CONSTRUCTION_SITES",
  "FIND_CONSTRUCTION_SITES",
  "FIND_CREEPS",
  "FIND_MY_CREEPS",
  "FIND_HOSTILE_CREEPS",
  "FIND_DROPPED_RESOURCES",
  "FIND_TOMBSTONES",
  "FIND_RUINS",
  "FIND_FLAGS",
  "FIND_NUKES",
  "FIND_POWER_CREEPS",
  "FIND_MY_POWER_CREEPS"
];

describe("RoleCache", () => {
  let roleCache: RoleCacheModule;
  let cacheManager: CacheManagerModule;

  before(async () => {
    for (const [index, constant] of SCREEPS_FIND_CONSTANTS.entries()) {
      (global as any)[constant] = index + 1;
    }

    cacheManager = await import("../src/CacheManager.ts");
    roleCache = await import("../src/domains/RoleCache.ts");
  });

  beforeEach(() => {
    (global as any).Game = { time: 1 };
    cacheManager.globalCache.clear("role");
  });

  it("invalidates one creep cache literally when the creep name contains regex syntax", () => {
    const literalNameCreep = { name: "miner[1]" } as Creep;
    const regexCollisionCreep = { name: "miner1" } as Creep;

    roleCache.setRoleCache(literalNameCreep, "miner", "assignedSource", "source-a");
    roleCache.setRoleCache(regexCollisionCreep, "miner", "assignedSource", "source-b");

    roleCache.deleteRoleCache(literalNameCreep, "miner");

    assert.isUndefined(roleCache.getRoleCache(literalNameCreep, "miner", "assignedSource"));
    assert.equal(roleCache.getRoleCache(regexCollisionCreep, "miner", "assignedSource"), "source-b");
  });
});

import { CacheManager, globalCache } from "./CacheManager";
import { CacheCoherenceManager, cacheCoherence } from "./CacheCoherence";

export interface CacheRuntime {
  cacheManager: CacheManager;
  coherenceManager: CacheCoherenceManager;
}

export function createCacheRuntime(defaultStore: "heap" | "memory" | "hybrid" = "heap"): CacheRuntime {
  return {
    cacheManager: new CacheManager(defaultStore),
    coherenceManager: new CacheCoherenceManager()
  };
}

export const defaultCacheRuntime: CacheRuntime = {
  cacheManager: globalCache,
  coherenceManager: cacheCoherence
};

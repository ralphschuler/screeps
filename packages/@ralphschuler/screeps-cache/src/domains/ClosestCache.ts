/**
 * Cached Closest - Domain wrapper for unified cache
 *
 * Caches closest target finding to reduce CPU.
 */

import { globalCache } from "../CacheManager";

const NAMESPACE = "closest";
const DEFAULT_TTL = 10;
const MAX_VALID_RANGE = 20;

function getCacheKey(creepName: string, typeKey: string): string {
  return `${creepName}:${typeKey}`;
}

export function findCachedClosest<T extends RoomObject & _HasId>(
  creep: Creep,
  targets: T[],
  typeKey: string,
  ttl: number = DEFAULT_TTL
): T | null {
  if (targets.length === 0) {
    clearCache(creep, typeKey);
    return null;
  }

  if (targets.length === 1) {
    return targets[0];
  }

  const key = getCacheKey(creep.name, typeKey);
  
  const cachedId = globalCache.get<Id<T>>(key, {
    namespace: NAMESPACE,
    ttl
  });

  if (cachedId) {
    const cachedTarget = Game.getObjectById(cachedId) as T | null;
    if (cachedTarget) {
      const stillValid = targets.some(t => t.id === cachedTarget.id);
      if (stillValid) {
        const range = creep.pos.getRangeTo(cachedTarget.pos);
        if (range <= MAX_VALID_RANGE) {
          return cachedTarget;
        }
      }
    }
  }

  const closest = creep.pos.findClosestByRange(targets);
  if (closest) {
    globalCache.set(key, closest.id, {
      namespace: NAMESPACE,
      ttl
    });
  } else {
    clearCache(creep, typeKey);
  }

  return closest;
}

export function clearCache(creep: Creep, typeKey?: string): void {
  if (typeKey) {
    const key = getCacheKey(creep.name, typeKey);
    globalCache.invalidate(key, NAMESPACE);
  } else {
    const pattern = new RegExp(`^${creep.name}:`);
    globalCache.invalidatePattern(pattern, NAMESPACE);
  }
}

export function clearCacheOnStateChange(creep: Creep): void {
  clearCache(creep);
}

import { DEFAULT_CONFIG } from "./config";
import type { CachedValidRoadPositions, RoomRoadNetwork, RoadNetworkConfig } from "./types";

const roadNetworkCache = new Map<string, RoomRoadNetwork>();
const validRoadPositionsCache = new Map<string, CachedValidRoadPositions>();

/**
 * Cache key for planned valid roads.
 *
 * Existing exit roads are intentionally excluded from this key because fallback
 * protection is recalculated fresh on every public validation call.
 */
export function getValidRoadPositionsCacheKey(
  roomName: string,
  anchor: RoomPosition,
  blueprintRoads: { x: number; y: number }[],
  remoteRooms: string[]
): string {
  const blueprintKey = blueprintRoads
    .map(road => `${road.x},${road.y}`)
    .sort()
    .join(";");
  const remoteKey = [...remoteRooms].sort().join(",");
  return `${roomName}|${anchor.x},${anchor.y}|${blueprintKey}|${remoteKey}`;
}

export function isValidRoadCacheFresh(cached: CachedValidRoadPositions): boolean {
  return Game.time - cached.lastCalculated < DEFAULT_CONFIG.recalculateInterval;
}

/**
 * Cache key for infrastructure roads.
 *
 * Anchor/config/storage/RCL all affect the plan, so all are part of the key.
 */
export function getRoadNetworkCacheKey(room: Room, anchor: RoomPosition, config: RoadNetworkConfig): string {
  const storage = room.storage?.pos;
  const storageKey = storage ? `${storage.x},${storage.y}` : "none";
  const rcl = room.controller?.level ?? 0;
  return [
    room.name,
    `anchor:${anchor.x},${anchor.y}`,
    `storage:${storageKey}`,
    `rcl:${rcl}`,
    `ops:${config.maxPathOps}`,
    `remote:${config.includeRemoteRoads ? 1 : 0}`
  ].join("|");
}

export function getCachedRoadNetworkByKey(cacheKey: string, maxAge: number): RoomRoadNetwork | undefined {
  const cached = roadNetworkCache.get(cacheKey);
  if (cached && Game.time - cached.lastCalculated < maxAge) {
    return cached;
  }
  return undefined;
}

export function setCachedRoadNetwork(cacheKey: string, network: RoomRoadNetwork): void {
  roadNetworkCache.set(cacheKey, network);
}

export function getCachedValidRoadPositions(cacheKey: string): Set<string> | undefined {
  const cached = validRoadPositionsCache.get(cacheKey);
  if (cached && isValidRoadCacheFresh(cached)) {
    return cached.positions;
  }
  return undefined;
}

export function setCachedValidRoadPositions(cacheKey: string, cached: CachedValidRoadPositions): void {
  validRoadPositionsCache.set(cacheKey, cached);
}

/** Clear the road-network caches for one room. */
export function clearRoadNetworkCache(roomName: string): void {
  for (const [cacheKey, cached] of roadNetworkCache) {
    if (cached.roomName === roomName) {
      roadNetworkCache.delete(cacheKey);
    }
  }
  for (const [cacheKey, cached] of validRoadPositionsCache) {
    if (cached.roomName === roomName) {
      validRoadPositionsCache.delete(cacheKey);
    }
  }
}

/** Clear all road-network caches. */
export function clearAllRoadNetworkCaches(): void {
  roadNetworkCache.clear();
  validRoadPositionsCache.clear();
}

/** Return the newest cached network for visualization or diagnostics. */
export function getCachedRoadNetwork(roomName: string): RoomRoadNetwork | undefined {
  let newest: RoomRoadNetwork | undefined;
  for (const network of roadNetworkCache.values()) {
    if (network.roomName !== roomName) continue;
    if (!newest || network.lastCalculated >= newest.lastCalculated) newest = network;
  }
  return newest;
}

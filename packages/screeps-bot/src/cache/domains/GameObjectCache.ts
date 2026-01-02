/**
 * Game Object Cache - Domain wrapper for frequently accessed Game objects
 *
 * Provides optimized caching for Game.rooms, Game.creeps, and related
 * collections that are accessed multiple times per tick.
 * 
 * Design Principles (from ROADMAP.md Section 2):
 * - Aggressive Caching + TTL
 * - Cache stored in global object (heap)
 * - TTL = 1 tick for Game objects (regenerated each tick)
 */

import { globalCache } from "../CacheManager";

const NAMESPACE = "game";
const TTL_ONE_TICK = 1; // Game objects change every tick

/**
 * Get all owned rooms (rooms with controller.my === true)
 * Replaces manual caching in SwarmBot.ts
 */
export function getOwnedRooms(): Room[] {
  return globalCache.get<Room[]>("ownedRooms", {
    namespace: NAMESPACE,
    ttl: TTL_ONE_TICK,
    compute: () => Object.values(Game.rooms).filter(r => r.controller?.my)
  }) ?? [];
}

/**
 * Get all creeps with a specific role
 * @param role - The role to filter by (e.g., "harvester", "builder")
 */
export function getCreepsByRole(role: string): Creep[] {
  return globalCache.get<Creep[]>(`creeps_role_${role}`, {
    namespace: NAMESPACE,
    ttl: TTL_ONE_TICK,
    compute: () => Object.values(Game.creeps).filter(c => c.memory.role === role)
  }) ?? [];
}

/**
 * Get all creeps in a specific room
 * @param roomName - The room name to filter by
 */
export function getCreepsByRoom(roomName: string): Creep[] {
  return globalCache.get<Creep[]>(`creeps_room_${roomName}`, {
    namespace: NAMESPACE,
    ttl: TTL_ONE_TICK,
    compute: () => Object.values(Game.creeps).filter(c => c.room.name === roomName)
  }) ?? [];
}

/**
 * Get all my creeps (excludes power creeps)
 * Useful for iteration when you need all creeps
 */
export function getMyCreeps(): Creep[] {
  return globalCache.get<Creep[]>("myCreeps", {
    namespace: NAMESPACE,
    ttl: TTL_ONE_TICK,
    compute: () => Object.values(Game.creeps)
  }) ?? [];
}

/**
 * Get count of creeps with a specific role
 * More efficient than getCreepsByRole().length when you only need the count
 */
export function getCreepCountByRole(role: string): number {
  return globalCache.get<number>(`creeps_count_role_${role}`, {
    namespace: NAMESPACE,
    ttl: TTL_ONE_TICK,
    compute: () => Object.values(Game.creeps).filter(c => c.memory.role === role).length
  }) ?? 0;
}

/**
 * Get count of creeps in a specific room
 * More efficient than getCreepsByRoom().length when you only need the count
 */
export function getCreepCountByRoom(roomName: string): number {
  return globalCache.get<number>(`creeps_count_room_${roomName}`, {
    namespace: NAMESPACE,
    ttl: TTL_ONE_TICK,
    compute: () => Object.values(Game.creeps).filter(c => c.room.name === roomName).length
  }) ?? 0;
}

/**
 * Get all visible rooms (includes owned, remote, and visible rooms)
 */
export function getVisibleRooms(): Room[] {
  return globalCache.get<Room[]>("visibleRooms", {
    namespace: NAMESPACE,
    ttl: TTL_ONE_TICK,
    compute: () => Object.values(Game.rooms)
  }) ?? [];
}

/**
 * Get cache statistics for Game object cache
 */
export function getGameObjectCacheStats() {
  return globalCache.getCacheStats(NAMESPACE);
}

/**
 * Clear the Game object cache
 * Useful for testing or forced cache invalidation
 */
export function clearGameObjectCache(): void {
  globalCache.clear(NAMESPACE);
}

/**
 * Invalidate creep caches for a specific room
 * Called when significant room changes occur
 */
export function invalidateRoomCreepCache(roomName: string): void {
  globalCache.invalidate(`creeps_room_${roomName}`, NAMESPACE);
  globalCache.invalidate(`creeps_count_room_${roomName}`, NAMESPACE);
}

/**
 * Invalidate creep caches for a specific role
 * Called when role composition changes significantly
 */
export function invalidateRoleCreepCache(role: string): void {
  globalCache.invalidate(`creeps_role_${role}`, NAMESPACE);
  globalCache.invalidate(`creeps_count_role_${role}`, NAMESPACE);
}

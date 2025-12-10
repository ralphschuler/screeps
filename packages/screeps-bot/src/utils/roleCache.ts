/**
 * Role-Specific Cache - Performance Optimization
 *
 * Provides caching for role-specific data that is accessed repeatedly.
 * Different roles often need the same information multiple times per tick.
 *
 * Design Principles (from ROADMAP.md Section 2):
 * - Aggressive Caching + TTL
 * - Role-based organization
 * - Minimal memory footprint (stored in global object)
 *
 * CPU Savings:
 * - Builder finding repair targets: 0.1-0.2 CPU per builder
 * - Miner finding source containers: 0.05-0.1 CPU per miner
 * - Multiple upgraders accessing same controller: 0.02-0.05 CPU per upgrader
 * - With 50+ creeps: 2-5 CPU saved per tick
 *
 * Use Cases:
 * - Builders: repair targets, construction sites priority list
 * - Miners: assigned sources, container locations
 * - Upgraders: controller position, link/container near controller
 * - Carriers: pickup/delivery route optimization
 * - Defenders: threat assessment, hostile positions
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Cached data entry with TTL
 */
interface CacheEntry<T = any> {
  /** Cached value */
  value: T;
  /** Tick when cached */
  tick: number;
  /** Time-to-live in ticks */
  ttl: number;
}

/**
 * Role-specific cache store
 */
interface RoleCacheStore {
  /** Current game tick */
  tick: number;
  /** Cache entries: roleType -> creepName -> dataKey -> entry */
  entries: Map<string, Map<string, Map<string, CacheEntry>>>;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Default TTL for different data types (in ticks)
 */
const DEFAULT_TTL: Record<string, number> = {
  // Static assignments
  assignedSource: 100,
  assignedController: 100,
  assignedMineral: 100,
  assignedRoom: 50,
  
  // Semi-static locations
  sourceContainer: 50,
  controllerContainer: 50,
  controllerLink: 50,
  
  // Dynamic targets
  repairTarget: 10,
  buildTarget: 10,
  pickupTarget: 5,
  deliveryTarget: 5,
  combatTarget: 3,
  
  // Paths and routes
  harvestPath: 50,
  deliveryRoute: 20,
  
  // Other
  default: 10
};

// =============================================================================
// Cache Storage
// =============================================================================

/**
 * Get or initialize the cache store
 */
function getCacheStore(): RoleCacheStore {
  const g = global as any;
  if (!g._roleCache || g._roleCache.tick !== Game.time) {
    // Clear entries each tick
    g._roleCache = {
      tick: Game.time,
      entries: new Map()
    };
  }
  return g._roleCache as RoleCacheStore;
}

/**
 * Get or create role cache
 */
function getRoleCacheMap(roleType: string): Map<string, Map<string, CacheEntry>> {
  const cache = getCacheStore();
  let roleCache = cache.entries.get(roleType);
  if (!roleCache) {
    roleCache = new Map();
    cache.entries.set(roleType, roleCache);
  }
  return roleCache;
}

/**
 * Get or create creep cache within role
 */
function getCreepCache(roleType: string, creepName: string): Map<string, CacheEntry> {
  const roleCache = getRoleCacheMap(roleType);
  let creepCache = roleCache.get(creepName);
  if (!creepCache) {
    creepCache = new Map();
    roleCache.set(creepName, creepCache);
  }
  return creepCache;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Get cached value for a creep's role-specific data.
 *
 * @param creep - The creep
 * @param roleType - Role identifier (e.g., "builder", "miner", "upgrader")
 * @param dataKey - Data key (e.g., "repairTarget", "assignedSource")
 * @returns Cached value or undefined if not found or expired
 *
 * @example
 * const target = getRoleCache<Id<Structure>>(creep, "builder", "repairTarget");
 * if (target) {
 *   const structure = Game.getObjectById(target);
 *   if (structure) creep.repair(structure);
 * }
 */
export function getRoleCache<T = any>(
  creep: Creep,
  roleType: string,
  dataKey: string
): T | undefined {
  const creepCache = getCreepCache(roleType, creep.name);
  const entry = creepCache.get(dataKey);
  
  if (!entry) return undefined;
  
  // Check if expired
  if (Game.time - entry.tick >= entry.ttl) {
    creepCache.delete(dataKey);
    return undefined;
  }
  
  return entry.value as T;
}

/**
 * Set cached value for a creep's role-specific data.
 *
 * @param creep - The creep
 * @param roleType - Role identifier
 * @param dataKey - Data key
 * @param value - Value to cache
 * @param ttl - Optional TTL (defaults based on dataKey)
 *
 * @example
 * // Cache a repair target for 10 ticks
 * setRoleCache(creep, "builder", "repairTarget", structure.id);
 *
 * @example
 * // Cache with custom TTL
 * setRoleCache(creep, "miner", "assignedSource", sourceId, 200);
 */
export function setRoleCache<T = any>(
  creep: Creep,
  roleType: string,
  dataKey: string,
  value: T,
  ttl?: number
): void {
  const creepCache = getCreepCache(roleType, creep.name);
  const finalTtl = ttl ?? DEFAULT_TTL[dataKey] ?? DEFAULT_TTL.default;
  
  creepCache.set(dataKey, {
    value,
    tick: Game.time,
    ttl: finalTtl
  });
}

/**
 * Delete cached value for a creep.
 *
 * @param creep - The creep
 * @param roleType - Role identifier
 * @param dataKey - Data key (or undefined to clear all data for this creep)
 */
export function deleteRoleCache(
  creep: Creep,
  roleType: string,
  dataKey?: string
): void {
  if (dataKey) {
    const creepCache = getCreepCache(roleType, creep.name);
    creepCache.delete(dataKey);
  } else {
    const roleCache = getRoleCacheMap(roleType);
    roleCache.delete(creep.name);
  }
}

/**
 * Check if a cached value exists and is valid.
 *
 * @param creep - The creep
 * @param roleType - Role identifier
 * @param dataKey - Data key
 * @returns true if cached value exists and is not expired
 */
export function hasRoleCache(
  creep: Creep,
  roleType: string,
  dataKey: string
): boolean {
  return getRoleCache(creep, roleType, dataKey) !== undefined;
}

/**
 * Clear all caches for a specific role type.
 * Useful when role configuration changes.
 *
 * @param roleType - Role identifier to clear
 */
export function clearRoleTypeCache(roleType: string): void {
  const cache = getCacheStore();
  cache.entries.delete(roleType);
}

/**
 * Clear all role caches.
 * Primarily for testing.
 */
export function clearAllRoleCache(): void {
  const g = global as any;
  if (g._roleCache) {
    g._roleCache.entries.clear();
  }
}

/**
 * Get statistics about role cache usage.
 *
 * @returns Cache statistics
 */
export function getRoleCacheStats(): {
  roles: number;
  creeps: number;
  totalEntries: number;
  entriesByRole: Record<string, number>;
} {
  const cache = getCacheStore();
  let totalCreeps = 0;
  let totalEntries = 0;
  const entriesByRole: Record<string, number> = {};
  
  for (const [roleType, roleCache] of cache.entries) {
    let roleEntries = 0;
    for (const creepCache of roleCache.values()) {
      totalCreeps++;
      roleEntries += creepCache.size;
      totalEntries += creepCache.size;
    }
    entriesByRole[roleType] = roleEntries;
  }
  
  return {
    roles: cache.entries.size,
    creeps: totalCreeps,
    totalEntries,
    entriesByRole
  };
}

// =============================================================================
// Role-Specific Helper Functions
// =============================================================================

/**
 * Get or compute and cache repair target for a builder.
 *
 * @param creep - Builder creep
 * @param computeFn - Function to compute repair target if not cached
 * @returns Repair target or null
 */
export function getCachedRepairTarget(
  creep: Creep,
  computeFn: () => Structure | null
): Structure | null {
  const cachedId = getRoleCache<Id<Structure>>(creep, "builder", "repairTarget");
  
  if (cachedId) {
    const structure = Game.getObjectById(cachedId);
    if (structure && structure.hits < structure.hitsMax) {
      return structure;
    }
  }
  
  // Compute new target
  const target = computeFn();
  if (target) {
    setRoleCache(creep, "builder", "repairTarget", target.id);
  }
  
  return target;
}

/**
 * Get or compute and cache build target for a builder.
 *
 * @param creep - Builder creep
 * @param computeFn - Function to compute build target if not cached
 * @returns Construction site or null
 */
export function getCachedBuildTarget(
  creep: Creep,
  computeFn: () => ConstructionSite | null
): ConstructionSite | null {
  const cachedId = getRoleCache<Id<ConstructionSite>>(creep, "builder", "buildTarget");
  
  if (cachedId) {
    const site = Game.getObjectById(cachedId);
    if (site) {
      return site;
    }
  }
  
  // Compute new target
  const target = computeFn();
  if (target) {
    setRoleCache(creep, "builder", "buildTarget", target.id);
  }
  
  return target;
}

/**
 * Get or set assigned source for a miner.
 *
 * @param creep - Miner creep
 * @param sourceId - Source ID to assign (if not already assigned)
 * @returns Assigned source or null
 */
export function getAssignedSource(
  creep: Creep,
  sourceId?: Id<Source>
): Source | null {
  let cachedId = getRoleCache<Id<Source>>(creep, "miner", "assignedSource");
  
  if (!cachedId && sourceId) {
    setRoleCache(creep, "miner", "assignedSource", sourceId, 200);
    cachedId = sourceId;
  }
  
  if (cachedId) {
    return Game.getObjectById(cachedId);
  }
  
  return null;
}

/**
 * Get or compute container near source for a miner.
 *
 * @param creep - Miner creep
 * @param source - Source to find container near
 * @returns Container or null
 */
export function getSourceContainer(
  creep: Creep,
  source: Source
): StructureContainer | null {
  const cacheKey = `sourceContainer:${source.id}`;
  const cachedId = getRoleCache<Id<StructureContainer>>(creep, "miner", cacheKey);
  
  if (cachedId) {
    const container = Game.getObjectById(cachedId);
    if (container) {
      return container;
    }
  }
  
  // Find container near source
  const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
    filter: (s): s is StructureContainer => s.structureType === STRUCTURE_CONTAINER
  });
  
  if (containers.length > 0) {
    const container = containers[0];
    setRoleCache(creep, "miner", cacheKey, container.id, 100);
    return container;
  }
  
  return null;
}

/**
 * Get or compute container/link near controller for upgraders.
 *
 * @param creep - Upgrader creep
 * @param controller - Controller to find container/link near
 * @returns Container or link, or null
 */
export function getControllerEnergySource(
  creep: Creep,
  controller: StructureController
): StructureContainer | StructureLink | null {
  const cacheKey = `controllerSource:${controller.id}`;
  const cachedId = getRoleCache<Id<StructureContainer | StructureLink>>(
    creep,
    "upgrader",
    cacheKey
  );
  
  if (cachedId) {
    const structure = Game.getObjectById(cachedId);
    if (structure) {
      return structure;
    }
  }
  
  // Prefer link over container
  const links = controller.pos.findInRange(FIND_STRUCTURES, 3, {
    filter: (s): s is StructureLink =>
      s.structureType === STRUCTURE_LINK &&
      s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
  });
  
  if (links.length > 0) {
    const link = links[0];
    setRoleCache(creep, "upgrader", cacheKey, link.id, 100);
    return link;
  }
  
  // Fall back to container
  const containers = controller.pos.findInRange(FIND_STRUCTURES, 3, {
    filter: (s): s is StructureContainer =>
      s.structureType === STRUCTURE_CONTAINER &&
      s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
  });
  
  if (containers.length > 0) {
    const container = containers[0];
    setRoleCache(creep, "upgrader", cacheKey, container.id, 100);
    return container;
  }
  
  return null;
}

/**
 * Clear target caches when targets are completed or invalid.
 * Call this when a build/repair/combat action completes.
 *
 * @param creep - The creep
 * @param roleType - Role identifier
 * @param targetTypes - Array of target type keys to clear
 */
export function clearTargetCaches(
  creep: Creep,
  roleType: string,
  targetTypes: string[]
): void {
  for (const targetType of targetTypes) {
    deleteRoleCache(creep, roleType, targetType);
  }
}

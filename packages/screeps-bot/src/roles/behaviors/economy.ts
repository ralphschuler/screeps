/**
 * Economy Behaviors
 *
 * Simple, human-readable behavior functions for economy roles.
 * Each function evaluates the situation and returns an action.
 */

import type { SwarmCreepMemory } from "../../memory/schemas";
import { clearCacheOnStateChange, findCachedClosest } from "../../utils/cachedClosest";
import type { CreepAction, CreepContext } from "./types";
import { getPheromones, needsBuilding, needsUpgrading } from "./pheromoneHelper";

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if an object is a Deposit.
 * Deposits have depositType and cooldown properties, but no structureType.
 */
function isDeposit(obj: unknown): obj is Deposit {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "depositType" in obj &&
    "cooldown" in obj &&
    !("structureType" in obj)
  );
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Cache duration for stationary harvester structures (containers, links).
 * Harvesters are stationary workers, so their nearby structures rarely change.
 * 50 ticks provides good balance between CPU savings and responsiveness to changes.
 */
const HARVESTER_CACHE_DURATION = 50;

// =============================================================================
// Common Patterns
// =============================================================================

/**
 * Update working state based on energy levels.
 * Returns true if creep should be working (has energy to spend).
 * 
 * OPTIMIZATION: Only clear cached targets on state change, not the state machine state.
 * The state machine's own completion detection handles invalid states efficiently.
 * Clearing state machine state here causes unnecessary re-evaluation and "dead ticks"
 * where creeps appear idle while establishing new states, leading to perceived
 * "idle time" and wasted CPU on frequent behavior re-evaluation during transitions.
 */
function updateWorkingState(ctx: CreepContext): boolean {
  const wasWorking = ctx.memory.working ?? false;
  if (ctx.isEmpty) ctx.memory.working = false;
  if (ctx.isFull) ctx.memory.working = true;
  const isWorking = ctx.memory.working ?? false;

  // Clear cached targets when working state changes to ensure fresh target selection
  // State machine will naturally detect completion and re-evaluate on next tick
  if (wasWorking !== isWorking) {
    clearCacheOnStateChange(ctx.creep);
  }

  return isWorking;
}

/**
 * Find energy to collect (common pattern for many roles).
 * Uses cached target finding to reduce CPU usage.
 *
 * OPTIMIZATION: Prioritize dropped resources and containers over room.find() calls.
 * Most rooms have containers set up, so we rarely need to fall back to harvesting.
 */
function findEnergy(ctx: CreepContext): CreepAction {
  // 1. Dropped resources (cache 5 ticks - they appear/disappear quickly)
  if (ctx.droppedResources.length > 0) {
    const closest = findCachedClosest(ctx.creep, ctx.droppedResources, "energy_drop", 5);
    if (closest) return { type: "pickup", target: closest };
  }

  // 2. Containers (cache 10 ticks - stable targets)
  if (ctx.containers.length > 0) {
    const closest = findCachedClosest(ctx.creep, ctx.containers, "energy_container", 10);
    if (closest) return { type: "withdraw", target: closest, resourceType: RESOURCE_ENERGY };
  }

  // 3. Storage (single target, no caching needed)
  if (ctx.storage && ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    return { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY };
  }

  // 4. Harvest directly (sources don't change, cache 20 ticks)
  // This is the most expensive option due to room.find(), but rarely used
  const sources = ctx.room.find(FIND_SOURCES_ACTIVE);
  if (sources.length > 0) {
    const source = findCachedClosest(ctx.creep, sources, "energy_source", 20);
    if (source) return { type: "harvest", target: source };
  }

  return { type: "idle" };
}

/**
 * Deliver energy to spawn structures and towers.
 * Uses cached target finding to reduce CPU usage.
 */
function deliverEnergy(ctx: CreepContext): CreepAction | null {
  // Spawns and extensions first (cache for 5 ticks - they fill quickly)
  if (ctx.spawnStructures.length > 0) {
    const closest = findCachedClosest(ctx.creep, ctx.spawnStructures, "deliver_spawn", 5);
    if (closest) return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
  }

  // Then towers (cache for 10 ticks - they drain slower)
  if (ctx.towers.length > 0) {
    const closest = findCachedClosest(ctx.creep, ctx.towers, "deliver_tower", 10);
    if (closest) return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
  }

  return null;
}

// =============================================================================
// Role Behaviors
// =============================================================================

/**
 * LarvaWorker - General purpose starter creep.
 * Priority: deliver energy → haul to storage → build → upgrade
 */
export function larvaWorker(ctx: CreepContext): CreepAction {
  const isWorking = updateWorkingState(ctx);

  if (isWorking) {
    // Try to deliver energy
    const deliverAction = deliverEnergy(ctx);
    if (deliverAction) return deliverAction;

    // Haul to storage when spawns/extensions/towers are full
    if (ctx.storage && ctx.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      return { type: "transfer", target: ctx.storage, resourceType: RESOURCE_ENERGY };
    }

    // Use pheromones to decide between building and upgrading
    // This allows room-wide coordination through stigmergic communication
    const pheromones = getPheromones(ctx.creep);
    if (pheromones) {
      // Prioritize building if build pheromone is high
      if (needsBuilding(pheromones) && ctx.prioritizedSites.length > 0) {
        return { type: "build", target: ctx.prioritizedSites[0]! };
      }

      // Prioritize upgrading if upgrade pheromone is high
      if (needsUpgrading(pheromones) && ctx.room.controller) {
        return { type: "upgrade", target: ctx.room.controller };
      }
    }

    // Default priority: build then upgrade
    if (ctx.prioritizedSites.length > 0) {
      return { type: "build", target: ctx.prioritizedSites[0]! };
    }

    if (ctx.room.controller) {
      return { type: "upgrade", target: ctx.room.controller };
    }

    return { type: "idle" };
  }

  return findEnergy(ctx);
}

/**
 * Harvester - Stationary miner at a source.
 * Sits at source, harvests, and transfers to nearby container/link.
 * 
 * OPTIMIZATION: Harvesters are stationary workers - cache their nearby structures
 * to avoid repeated findInRange calls which are expensive.
 */
export function harvester(ctx: CreepContext): CreepAction {
  let source = ctx.assignedSource;

  // Assign a source if not already assigned
  if (!source) {
    source = assignSource(ctx);
  }

  if (!source) return { type: "idle" };

  // Move to source if not nearby
  if (!ctx.creep.pos.isNearTo(source)) {
    return { type: "moveTo", target: source };
  }

  // At source - harvest or transfer
  // Check if creep can harvest: either has no carry capacity (drop miner) or has free space
  // Note: store.getCapacity() returns null for creeps without CARRY parts
  const carryCapacity = ctx.creep.store.getCapacity();
  const hasFreeCapacity = ctx.creep.store.getFreeCapacity() > 0;

  if (carryCapacity === null || carryCapacity === 0 || hasFreeCapacity) {
    return { type: "harvest", target: source };
  }

  // OPTIMIZATION: Full - find nearby container or link using cached lookup
  // Since harvesters are stationary, we cache the nearby structures for 50 ticks
  // to avoid expensive findInRange calls every tick
  const container = findNearbyContainerCached(ctx.creep);
  if (container) return { type: "transfer", target: container, resourceType: RESOURCE_ENERGY };

  const link = findNearbyLinkCached(ctx.creep);
  if (link) return { type: "transfer", target: link, resourceType: RESOURCE_ENERGY };

  // Drop on ground for haulers
  return { type: "drop", resourceType: RESOURCE_ENERGY };
}

/**
 * Assign a source to a harvester, trying to balance load.
 * 
 * OPTIMIZATION v2: Instead of iterating through ALL Game.creeps (which can be 5000+),
 * we only iterate through creeps in this specific room. This dramatically reduces
 * the CPU cost, especially in large empires.
 * 
 * Additionally, we cache the source counts per room per tick to avoid recalculating
 * for multiple harvesters spawning in the same tick.
 */
function assignSource(ctx: CreepContext): Source | null {
  const sources = ctx.room.find(FIND_SOURCES);
  if (sources.length === 0) return null;

  // Cache source counts per room per tick
  const cacheKey = `sourceCounts_${ctx.room.name}`;
  const cacheTickKey = `sourceCounts_tick_${ctx.room.name}`;
  const globalCache = global as unknown as Record<string, Map<string, number> | number | undefined>;
  const cachedCounts = globalCache[cacheKey] as Map<string, number> | undefined;
  const cachedTick = globalCache[cacheTickKey] as number | undefined;

  let sourceCounts: Map<string, number>;
  if (cachedCounts && cachedTick === Game.time) {
    sourceCounts = cachedCounts;
  } else {
    // Count creeps assigned to each source
    sourceCounts = new Map<string, number>();
    for (const s of sources) {
      sourceCounts.set(s.id, 0);
    }

    // MAJOR OPTIMIZATION: Only iterate through creeps in THIS room, not all Game.creeps
    // This changes complexity from O(all_creeps) to O(room_creeps)
    // For a 100-room empire with 50 creeps per room, this is 100x faster
    const roomCreeps = ctx.room.find(FIND_MY_CREEPS);
    for (const c of roomCreeps) {
      const m = c.memory as unknown as SwarmCreepMemory;
      // Only count harvesters that have a sourceId AND are assigned to sources in THIS room
      // (sourceId could be from another room if creep is in transit)
      if (m.role === "harvester" && m.sourceId && sourceCounts.has(m.sourceId)) {
        sourceCounts.set(m.sourceId, (sourceCounts.get(m.sourceId) ?? 0) + 1);
      }
    }

    globalCache[cacheKey] = sourceCounts;
    globalCache[cacheTickKey] = Game.time;
  }

  // Find least assigned source
  let bestSource: Source | null = null;
  let minCount = Infinity;
  for (const s of sources) {
    const count = sourceCounts.get(s.id) ?? 0;
    if (count < minCount) {
      minCount = count;
      bestSource = s;
    }
  }

  if (bestSource) {
    ctx.memory.sourceId = bestSource.id;
  }

  return bestSource;
}

/**
 * OPTIMIZATION: Cached version of findNearbyContainer for stationary harvesters.
 * Caches the container ID for HARVESTER_CACHE_DURATION ticks to avoid repeated findInRange calls.
 * Harvesters are stationary, so their nearby structures don't change often.
 * 
 * Optimization strategy: We cache the expensive findInRange operation but always check capacity
 * since it's cheap (just property access) and changes frequently. This provides maximum CPU savings.
 */
function findNearbyContainerCached(creep: Creep): StructureContainer | undefined {
  const memory = creep.memory as unknown as SwarmCreepMemory;
  
  // Check if we have a cached container ID
  if (memory.nearbyContainerId && memory.nearbyContainerTick && (Game.time - memory.nearbyContainerTick) < HARVESTER_CACHE_DURATION) {
    const container = Game.getObjectById(memory.nearbyContainerId);
    // Verify container still exists
    if (container) {
      // Always check capacity (cheap check, changes frequently)
      if (container.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        return container;
      }
      // Container full but still exists - keep cache, return undefined
      return undefined;
    }
    // Container destroyed - clear cache
    delete memory.nearbyContainerId;
    delete memory.nearbyContainerTick;
  }
  
  // Cache miss or container destroyed - find a new container
  // Note: We find ANY container nearby, not just ones with capacity
  // This allows us to cache it even when full
  const containers = creep.pos.findInRange(FIND_STRUCTURES, 1, {
    filter: s => s.structureType === STRUCTURE_CONTAINER
  }) as StructureContainer[];
  
  const container = containers[0];
  
  // Cache the result if found
  if (container) {
    memory.nearbyContainerId = container.id;
    memory.nearbyContainerTick = Game.time;
    // Check capacity before returning
    if (container.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      return container;
    }
    return undefined;
  } else {
    // No container found - clear cache
    delete memory.nearbyContainerId;
    delete memory.nearbyContainerTick;
    return undefined;
  }
}

/**
 * OPTIMIZATION: Cached version of findNearbyLink for stationary harvesters.
 * Caches the link ID for HARVESTER_CACHE_DURATION ticks to avoid repeated findInRange calls.
 * Harvesters are stationary, so their nearby structures don't change often.
 * 
 * Optimization strategy: We cache the expensive findInRange operation but always check capacity
 * since it's cheap (just property access) and changes frequently. This provides maximum CPU savings.
 */
function findNearbyLinkCached(creep: Creep): StructureLink | undefined {
  const memory = creep.memory as unknown as SwarmCreepMemory;
  
  // Check if we have a cached link ID
  if (memory.nearbyLinkId && memory.nearbyLinkTick && (Game.time - memory.nearbyLinkTick) < HARVESTER_CACHE_DURATION) {
    const link = Game.getObjectById(memory.nearbyLinkId);
    // Verify link still exists
    if (link) {
      // Always check capacity (cheap check, changes frequently)
      if (link.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        return link;
      }
      // Link full but still exists - keep cache, return undefined
      return undefined;
    }
    // Link destroyed - clear cache
    delete memory.nearbyLinkId;
    delete memory.nearbyLinkTick;
  }
  
  // Cache miss or link destroyed - find a new link
  // Note: We find ANY link nearby, not just ones with capacity
  // This allows us to cache it even when full
  const links = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
    filter: s => s.structureType === STRUCTURE_LINK
  }) as StructureLink[];
  
  const link = links[0];
  
  // Cache the result if found
  if (link) {
    memory.nearbyLinkId = link.id;
    memory.nearbyLinkTick = Game.time;
    // Check capacity before returning
    if (link.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      return link;
    }
    return undefined;
  } else {
    // No link found - clear cache
    delete memory.nearbyLinkId;
    delete memory.nearbyLinkTick;
    return undefined;
  }
}

// Keep the original uncached versions for other roles that might need them
function findNearbyContainer(creep: Creep): StructureContainer | undefined {
  return creep.pos.findInRange(FIND_STRUCTURES, 1, {
    filter: s =>
      s.structureType === STRUCTURE_CONTAINER &&
      s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  })[0] as StructureContainer | undefined;
}

function findNearbyLink(creep: Creep): StructureLink | undefined {
  return creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
    filter: s =>
      s.structureType === STRUCTURE_LINK &&
      s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  })[0] as StructureLink | undefined;
}

/**
 * Hauler - Transport energy from harvesters to structures.
 * Uses cached target finding to reduce CPU usage.
 */
export function hauler(ctx: CreepContext): CreepAction {
  const isWorking = updateWorkingState(ctx);

  if (isWorking) {
    // Check what resource we're carrying
    const carriedResources = Object.keys(ctx.creep.store) as ResourceConstant[];
    const resourceType = carriedResources[0];
    
    // If carrying minerals (not energy), deliver to terminal or storage
    if (resourceType && resourceType !== RESOURCE_ENERGY) {
      const target = ctx.terminal ?? ctx.storage;
      if (target) return { type: "transfer", target, resourceType };
    }
    
    // Deliver energy with priority: spawn > extensions > towers > storage > containers
    // OPTIMIZATION: Increased cache times to reduce pathfinding overhead

    // 1. Spawns first (highest priority, cache 10 ticks - increased from 5)
    const spawns = ctx.spawnStructures.filter(
      (s): s is StructureSpawn => s.structureType === STRUCTURE_SPAWN
    );
    if (spawns.length > 0) {
      const closest = findCachedClosest(ctx.creep, spawns, "hauler_spawn", 10);
      if (closest) return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
    }

    // 2. Extensions second (cache 10 ticks - increased from 5)
    const extensions = ctx.spawnStructures.filter(
      (s): s is StructureExtension => s.structureType === STRUCTURE_EXTENSION
    );
    if (extensions.length > 0) {
      const closest = findCachedClosest(ctx.creep, extensions, "hauler_ext", 10);
      if (closest) return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
    }

    // 3. Towers third (cache 15 ticks - increased from 10)
    if (ctx.towers.length > 0) {
      const closest = findCachedClosest(ctx.creep, ctx.towers, "hauler_tower", 15);
      if (closest) return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
    }

    // 4. Storage fourth
    if (ctx.storage && ctx.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      return { type: "transfer", target: ctx.storage, resourceType: RESOURCE_ENERGY };
    }

    // 5. Containers last (cache 15 ticks - increased from 10)
    if (ctx.depositContainers.length > 0) {
      const closest = findCachedClosest(ctx.creep, ctx.depositContainers, "hauler_cont", 15);
      if (closest) return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
    }

    // FIX: No valid delivery targets found, but creep still has energy
    // Switch to collection mode to top off capacity instead of idling
    // This prevents the deadlock where haulers with partial energy get stuck
    // in working=true state with no valid targets
    if (!ctx.isEmpty) {
      ctx.memory.working = false;
      clearCacheOnStateChange(ctx.creep);
      // Fall through to collection logic below
    } else {
      return { type: "idle" };
    }
  }

  // Collect energy - priority order
  // OPTIMIZATION: Increased cache times for haulers to reduce pathfinding overhead
  // 1. Dropped resources (cache 5 ticks - increased from 3)
  if (ctx.droppedResources.length > 0) {
    const closest = findCachedClosest(ctx.creep, ctx.droppedResources, "hauler_drop", 5);
    if (closest) return { type: "pickup", target: closest };
  }

  // 2. Tombstones (cache 10 ticks - increased from 5)
  // OPTIMIZATION: Use cached tombstones from room context to avoid expensive room.find()
  if (ctx.tombstones.length > 0) {
    const tombstone = findCachedClosest(ctx.creep, ctx.tombstones, "hauler_tomb", 10);
    if (tombstone) return { type: "withdraw", target: tombstone, resourceType: RESOURCE_ENERGY };
  }

  // 3. Containers with energy (cache 15 ticks - increased from 10)
  if (ctx.containers.length > 0) {
    const closest = findCachedClosest(ctx.creep, ctx.containers, "hauler_source", 15);
    if (closest) return { type: "withdraw", target: closest, resourceType: RESOURCE_ENERGY };
  }

  // 4. Containers with minerals (for mineral transport to terminal/storage)
  // OPTIMIZATION: Use cached mineral containers from room context to avoid expensive room.find()
  if (ctx.mineralContainers.length > 0) {
    const closest = findCachedClosest(ctx.creep, ctx.mineralContainers, "hauler_mineral", 15);
    if (closest) {
      // Find first mineral type in container using Object.keys for better performance
      const mineralType = Object.keys(closest.store).find(
        r => r !== RESOURCE_ENERGY && closest.store.getUsedCapacity(r as ResourceConstant) > 0
      ) as ResourceConstant | undefined;
      
      if (mineralType) {
        return { type: "withdraw", target: closest, resourceType: mineralType };
      }
    }
  }

  // 5. Storage (single target, no caching needed)
  if (ctx.storage && ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    return { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY };
  }

  return { type: "idle" };
}

/**
 * Builder - Construct and repair structures.
 */
export function builder(ctx: CreepContext): CreepAction {
  const isWorking = updateWorkingState(ctx);

  if (isWorking) {
    // Build construction sites
    if (ctx.prioritizedSites.length > 0) {
      return { type: "build", target: ctx.prioritizedSites[0]! };
    }

    // No sites - help upgrade
    if (ctx.room.controller) {
      return { type: "upgrade", target: ctx.room.controller };
    }

    return { type: "idle" };
  }

  return findEnergy(ctx);
}

/**
 * Upgrader - Upgrade the room controller.
 * OPTIMIZATION: Upgraders are stationary workers that benefit from long cache times
 * and stable behavior to maximize idle detection efficiency.
 */
export function upgrader(ctx: CreepContext): CreepAction {
  const isWorking = updateWorkingState(ctx);

  if (isWorking) {
    if (ctx.room.controller) {
      return { type: "upgrade", target: ctx.room.controller };
    }
    return { type: "idle" };
  }

  // OPTIMIZATION: Find closest energy source ONCE and cache for long time (30 ticks)
  // Upgraders are stationary, so their energy source rarely changes
  // Priority: links near controller > containers near controller > storage > any container
  
  // Check for links near controller first (most efficient energy source)
  // Links are filled automatically by LinkManager from source links
  const controller = ctx.room.controller;
  if (controller) {
    const nearbyLinks = controller.pos.findInRange(FIND_MY_STRUCTURES, 2, {
      filter: s => 
        s.structureType === STRUCTURE_LINK &&
        (s as StructureLink).store.getUsedCapacity(RESOURCE_ENERGY) > 50
    }) as StructureLink[];
    
    if (nearbyLinks.length > 0) {
      // Prefer link with most energy
      const bestLink = nearbyLinks.reduce((a, b) => 
        a.store.getUsedCapacity(RESOURCE_ENERGY) > b.store.getUsedCapacity(RESOURCE_ENERGY) ? a : b
      );
      return { type: "withdraw", target: bestLink, resourceType: RESOURCE_ENERGY };
    }
  }
  
  // OPTIMIZATION: Cache nearby container search per creep
  // Upgraders are stationary so this rarely changes (30 tick cache)
  const nearbyContainersCacheKey = "upgrader_nearby_containers";
  const memory = ctx.creep.memory as unknown as { [key: string]: unknown };
  const cachedNearby = memory[nearbyContainersCacheKey] as { ids: Id<StructureContainer>[]; tick: number } | undefined;
  
  let nearbyContainers: StructureContainer[] = [];
  if (cachedNearby && Game.time - cachedNearby.tick < 30) {
    // Use cached IDs
    nearbyContainers = cachedNearby.ids
      .map(id => Game.getObjectById(id))
      .filter((c): c is StructureContainer => c !== null);
  } else {
    // Find nearby containers (within range 3 of upgrader position)
    // This allows upgraders to position near a container and controller for maximum efficiency
    nearbyContainers = ctx.creep.pos.findInRange(FIND_STRUCTURES, 3, {
      filter: s => s.structureType === STRUCTURE_CONTAINER &&
                   (s as StructureContainer).store.getUsedCapacity(RESOURCE_ENERGY) > 50
    }) as StructureContainer[];
    
    // Cache the IDs
    memory[nearbyContainersCacheKey] = {
      ids: nearbyContainers.map(c => c.id),
      tick: Game.time
    };
  }
  
  if (nearbyContainers.length > 0) {
    // Use the closest nearby container - this should be stable for idle detection
    const closest = findCachedClosest(ctx.creep, nearbyContainers, "upgrader_nearby", 30);
    if (closest) return { type: "withdraw", target: closest, resourceType: RESOURCE_ENERGY };
  }

  // Fallback to storage if available and has enough energy
  if (ctx.storage && ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 1000) {
    return { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY };
  }

  // Fallback to any container with energy
  if (ctx.containers.length > 0) {
    const closest = findCachedClosest(ctx.creep, ctx.containers, "upgrader_cont", 30);
    if (closest) return { type: "withdraw", target: closest, resourceType: RESOURCE_ENERGY };
  }

  // Last resort: harvest from source (cache for 30 ticks)
  const sources = ctx.room.find(FIND_SOURCES_ACTIVE);
  if (sources.length > 0) {
    const source = findCachedClosest(ctx.creep, sources, "upgrader_source", 30);
    if (source) return { type: "harvest", target: source };
  }

  return { type: "idle" };
}

/**
 * QueenCarrier - Energy distributor for spawn structures.
 */
export function queenCarrier(ctx: CreepContext): CreepAction {
  const isWorking = updateWorkingState(ctx);

  if (isWorking) {
    // Fill spawns and extensions
    const deliverAction = deliverEnergy(ctx);
    if (deliverAction) return deliverAction;

    // Wait near storage
    if (ctx.storage) return { type: "moveTo", target: ctx.storage };

    return { type: "idle" };
  }

  // Get energy from storage or terminal
  if (ctx.storage && ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    return { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY };
  }

  if (ctx.terminal && ctx.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    return { type: "withdraw", target: ctx.terminal, resourceType: RESOURCE_ENERGY };
  }

  return { type: "idle" };
}

/**
 * MineralHarvester - Harvest minerals from extractors.
 * Enhanced to use containers like energy harvesters for better coordination.
 */
export function mineralHarvester(ctx: CreepContext): CreepAction {
  const mineral = ctx.room.find(FIND_MINERALS)[0];
  if (!mineral) return { type: "idle" };

  const extractor = mineral.pos.lookFor(LOOK_STRUCTURES).find(s => s.structureType === STRUCTURE_EXTRACTOR);
  if (!extractor) return { type: "idle" };

  if (mineral.mineralAmount === 0) {
    // Mineral depleted - wait near storage
    if (ctx.storage) return { type: "moveTo", target: ctx.storage };
    return { type: "idle" };
  }

  // Full - find nearby container or terminal/storage
  if (ctx.isFull) {
    const mineralType = Object.keys(ctx.creep.store)[0] as ResourceConstant;
    
    // Check for nearby container first (like energy harvesters)
    const container = ctx.creep.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: s =>
        s.structureType === STRUCTURE_CONTAINER &&
        s.store.getFreeCapacity(mineralType) > 0
    })[0] as StructureContainer | undefined;
    
    if (container) return { type: "transfer", target: container, resourceType: mineralType };
    
    // Fall back to terminal/storage
    const target = ctx.terminal ?? ctx.storage;
    if (target) {
      return { type: "transfer", target, resourceType: mineralType };
    }
  }

  return { type: "harvestMineral", target: mineral };
}

/**
 * DepositHarvester - Harvest from highway deposits.
 */
export function depositHarvester(ctx: CreepContext): CreepAction {
  // Find or assign target deposit
  if (!ctx.memory.targetId) {
    const deposits = ctx.room.find(FIND_DEPOSITS);
    if (deposits.length > 0) {
      const best = deposits.reduce((a, b) => (a.cooldown < b.cooldown ? a : b));
      // Store the deposit ID. This is safe because Screeps object IDs are always strings,
      // and Deposit IDs are compatible with Id<_HasId>. We only use targetId for deposits in this role.
      ctx.memory.targetId = best.id ;
    }
  }

  if (!ctx.memory.targetId) return { type: "idle" };

  // Attempt to get the deposit - may return null if ID is invalid or object no longer exists
  // We use a type guard to verify this is actually a Deposit
  const depositObj = Game.getObjectById(ctx.memory.targetId);
  if (!depositObj || !isDeposit(depositObj)) {
    // Invalid or missing deposit - clear target and idle
    delete ctx.memory.targetId;
    return { type: "idle" };
  }
  const deposit = depositObj;

  // Check if deposit is on cooldown
  if (deposit.cooldown > 100) {
    delete ctx.memory.targetId;
    return { type: "idle" };
  }

  if (ctx.isFull) {
    // Return home
    const homeRoom = Game.rooms[ctx.homeRoom];
    if (homeRoom) {
      const target = homeRoom.terminal ?? homeRoom.storage;
      if (target) {
        const resourceType = Object.keys(ctx.creep.store)[0] as ResourceConstant;
        return { type: "transfer", target, resourceType };
      }
    }
    return { type: "moveToRoom", roomName: ctx.homeRoom };
  }

  return { type: "harvestDeposit", target: deposit };
}

/**
 * LabTech - Manage lab reactions and compounds.
 */
export function labTech(ctx: CreepContext): CreepAction {
  if (ctx.labs.length === 0) return { type: "idle" };

  const inputLabs = ctx.labs.slice(0, 2);
  const outputLabs = ctx.labs.slice(2);

  // If carrying resources, deliver them
  if (ctx.creep.store.getUsedCapacity() > 0) {
    const resourceType = Object.keys(ctx.creep.store)[0] as ResourceConstant;

    // Base minerals go to input labs, compounds go to storage/terminal
    const baseMinerals: ResourceConstant[] = [
      RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM,
      RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST
    ];

    if (resourceType !== RESOURCE_ENERGY && !baseMinerals.includes(resourceType)) {
      const target = ctx.terminal ?? ctx.storage;
      if (target) return { type: "transfer", target, resourceType };
    }

    // Put base minerals in input labs
    for (const lab of inputLabs) {
      const capacity = lab.store.getFreeCapacity(resourceType);
      if (capacity !== null && capacity > 0) {
        return { type: "transfer", target: lab, resourceType };
      }
    }
  }

  // Collect products from output labs
  for (const lab of outputLabs) {
    const mineralType = lab.mineralType;
    if (mineralType && lab.store.getUsedCapacity(mineralType) > 100) {
      return { type: "withdraw", target: lab, resourceType: mineralType };
    }
  }

  // Fill input labs from terminal/storage
  const source = ctx.terminal ?? ctx.storage;
  if (source) {
    const minerals: MineralConstant[] = [
      RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM,
      RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST
    ];

    for (const lab of inputLabs) {
      for (const mineral of minerals) {
        if (source.store.getUsedCapacity(mineral) > 0 && lab.store.getFreeCapacity(mineral) > 0) {
          return { type: "withdraw", target: source, resourceType: mineral };
        }
      }
    }
  }

  return { type: "idle" };
}

/**
 * FactoryWorker - Supply factory with materials and remove outputs.
 * Enhanced to coordinate with factory manager for optimal production.
 */
export function factoryWorker(ctx: CreepContext): CreepAction {
  if (!ctx.factory) return { type: "idle" };

  const isWorking = updateWorkingState(ctx);

  if (isWorking) {
    const resourceType = Object.keys(ctx.creep.store)[0] as ResourceConstant;
    return { type: "transfer", target: ctx.factory, resourceType };
  }

  const source = ctx.terminal ?? ctx.storage;
  if (!source) return { type: "idle" };

  // Priority 1: Remove factory outputs to make space
  // Check for produced commodities that need removal
  const commodityTypes: ResourceConstant[] = [
    RESOURCE_UTRIUM_BAR, RESOURCE_LEMERGIUM_BAR, RESOURCE_KEANIUM_BAR,
    RESOURCE_ZYNTHIUM_BAR, RESOURCE_GHODIUM_MELT, RESOURCE_OXIDANT, 
    RESOURCE_REDUCTANT, RESOURCE_PURIFIER, RESOURCE_BATTERY
  ];
  
  for (const commodity of commodityTypes) {
    if (ctx.factory.store.getUsedCapacity(commodity) > 100) {
      return { type: "withdraw", target: ctx.factory, resourceType: commodity };
    }
  }

  // Priority 2: Supply energy
  if (
    ctx.factory.store.getUsedCapacity(RESOURCE_ENERGY) < 5000 &&
    source.store.getUsedCapacity(RESOURCE_ENERGY) > 10000
  ) {
    return { type: "withdraw", target: source, resourceType: RESOURCE_ENERGY };
  }

  // Priority 3: Supply base minerals for production
  const baseMinerals: ResourceConstant[] = [
    RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM,
    RESOURCE_ZYNTHIUM, RESOURCE_OXYGEN, RESOURCE_HYDROGEN, RESOURCE_CATALYST, RESOURCE_GHODIUM
  ];

  for (const mineral of baseMinerals) {
    if (
      ctx.factory.store.getUsedCapacity(mineral) < 1000 && 
      source.store.getUsedCapacity(mineral) > 500
    ) {
      return { type: "withdraw", target: source, resourceType: mineral };
    }
  }

  return { type: "idle" };
}

// =============================================================================
// Role Dispatcher
// =============================================================================

/**
 * RemoteHarvester - Stationary miner in remote room.
 * Travels to remote room, sits at source, harvests to container.
 * 
 * ENHANCEMENT: Added hostile detection and flee behavior for safety.
 * Remote harvesters will flee from hostiles and return home if threatened.
 */
export function remoteHarvester(ctx: CreepContext): CreepAction {
  // Get target room from memory
  const targetRoom = ctx.memory.targetRoom;
  
  // SAFETY: If no valid target room, idle (executor will move away from spawn)
  // This should not happen with proper spawn logic, but provides a failsafe
  if (!targetRoom || targetRoom === ctx.memory.homeRoom) {
    // Idle action triggers move-away-from-spawn logic in executor
    return { type: "idle" };
  }

  // SAFETY: Check for nearby hostiles and flee if threatened
  if (ctx.nearbyEnemies && ctx.hostiles.length > 0) {
    const dangerousHostiles = ctx.hostiles.filter(h => 
      ctx.creep.pos.getRangeTo(h) <= 5 &&
      (h.getActiveBodyparts(ATTACK) > 0 || h.getActiveBodyparts(RANGED_ATTACK) > 0)
    );
    
    if (dangerousHostiles.length > 0) {
      // If in remote room with hostiles, return home for safety
      if (ctx.room.name === targetRoom) {
        return { type: "moveToRoom", roomName: ctx.memory.homeRoom };
      }
      // If in transit, flee from hostiles
      return { type: "flee", from: dangerousHostiles.map(h => h.pos) };
    }
  }

  // If not in target room, move there
  if (ctx.room.name !== targetRoom) {
    return { type: "moveToRoom", roomName: targetRoom };
  }

  // In target room - find or assign source
  let source = ctx.assignedSource;

  if (!source) {
    source = assignSource(ctx);
  }

  if (!source) return { type: "idle" };

  // Move to source if not nearby
  if (!ctx.creep.pos.isNearTo(source)) {
    return { type: "moveTo", target: source };
  }

  // At source - harvest or transfer to container
  const carryCapacity = ctx.creep.store.getCapacity();
  const hasFreeCapacity = ctx.creep.store.getFreeCapacity() > 0;

  if (carryCapacity === null || carryCapacity === 0 || hasFreeCapacity) {
    return { type: "harvest", target: source };
  }

  // OPTIMIZATION: Full - find nearby container using cached lookup
  // Remote harvesters are also stationary at their sources, so cache for 50 ticks
  const container = findRemoteContainerCached(ctx.creep, source);
  if (container) {
    return { type: "transfer", target: container, resourceType: RESOURCE_ENERGY };
  }

  // No container - drop energy for haulers
  return { type: "drop", resourceType: RESOURCE_ENERGY };
}

/**
 * OPTIMIZATION: Cached version of finding nearby container for remote harvesters.
 * Remote harvesters are stationary like regular harvesters, so we cache the container
 * near their assigned source for HARVESTER_CACHE_DURATION ticks to avoid repeated findInRange calls.
 * 
 * Note: Remote containers don't check for free capacity since they're typically used as
 * drop-off points and remote haulers will collect from them. The harvester just needs
 * to know the container exists.
 */
function findRemoteContainerCached(creep: Creep, source: Source): StructureContainer | undefined {
  const memory = creep.memory as unknown as SwarmCreepMemory;
  
  // Check if we have a cached container ID and if it's still valid
  if (memory.remoteContainerId && memory.remoteContainerTick && (Game.time - memory.remoteContainerTick) < HARVESTER_CACHE_DURATION) {
    const container = Game.getObjectById(memory.remoteContainerId);
    if (container) {
      return container;
    }
    // Container no longer exists - clear cache
    delete memory.remoteContainerId;
    delete memory.remoteContainerTick;
  }
  
  // Cache miss or invalid - find a new container near the source
  const containers = source.pos.findInRange(FIND_STRUCTURES, 2, {
    filter: s => s.structureType === STRUCTURE_CONTAINER
  }) as StructureContainer[];
  
  const container = containers[0];
  
  // Cache the result if found, otherwise clear cache
  if (container) {
    memory.remoteContainerId = container.id;
    memory.remoteContainerTick = Game.time;
  } else {
    delete memory.remoteContainerId;
    delete memory.remoteContainerTick;
  }
  
  return container;
}

/**
 * Energy collection threshold for remote haulers.
 * Only collect from containers when they have this percentage of hauler capacity.
 * This ensures travel costs are justified by energy gained.
 */
const REMOTE_HAULER_ENERGY_THRESHOLD = 0.3; // 30%

/**
 * RemoteHauler - Transports energy from remote room to home room.
 * Picks up from remote containers/ground, delivers to home storage.
 * 
 * ENHANCEMENT: Added hostile detection and flee behavior for safety.
 * Remote haulers will flee from hostiles and prioritize returning home with cargo.
 */
export function remoteHauler(ctx: CreepContext): CreepAction {
  const isWorking = updateWorkingState(ctx);
  const targetRoom = ctx.memory.targetRoom;
  const homeRoom = ctx.memory.homeRoom;

  // SAFETY: If no valid target room, idle (executor will move away from spawn)
  // This should not happen with proper spawn logic, but provides a failsafe
  if (!targetRoom || targetRoom === homeRoom) {
    // Idle action triggers move-away-from-spawn logic in executor
    return { type: "idle" };
  }

  // SAFETY: Check for nearby hostiles and flee if threatened
  if (ctx.nearbyEnemies && ctx.hostiles.length > 0) {
    const dangerousHostiles = ctx.hostiles.filter(h => 
      ctx.creep.pos.getRangeTo(h) <= 5 &&
      (h.getActiveBodyparts(ATTACK) > 0 || h.getActiveBodyparts(RANGED_ATTACK) > 0)
    );
    
    if (dangerousHostiles.length > 0) {
      // If carrying energy, prioritize getting home
      if (isWorking && ctx.room.name !== homeRoom) {
        return { type: "moveToRoom", roomName: homeRoom };
      }
      // Otherwise flee from hostiles
      return { type: "flee", from: dangerousHostiles.map(h => h.pos) };
    }
  }

  if (isWorking) {
    // Has energy - return to home room and deliver
    if (ctx.room.name !== homeRoom) {
      return { type: "moveToRoom", roomName: homeRoom };
    }

    // In home room - deliver with priority: spawn > extensions > towers > storage > containers

    // 1. Spawns first (highest priority, cache 5 ticks)
    const spawns = ctx.spawnStructures.filter(
      (s): s is StructureSpawn => s.structureType === STRUCTURE_SPAWN
    );
    if (spawns.length > 0) {
      const closest = findCachedClosest(ctx.creep, spawns, "remoteHauler_spawn", 5);
      if (closest) return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
    }

    // 2. Extensions second (cache 5 ticks)
    const extensions = ctx.spawnStructures.filter(
      (s): s is StructureExtension => s.structureType === STRUCTURE_EXTENSION
    );
    if (extensions.length > 0) {
      const closest = findCachedClosest(ctx.creep, extensions, "remoteHauler_ext", 5);
      if (closest) return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
    }

    // 3. Towers third (cache 10 ticks)
    if (ctx.towers.length > 0) {
      const closest = findCachedClosest(ctx.creep, ctx.towers, "remoteHauler_tower", 10);
      if (closest) return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
    }

    // 4. Storage fourth
    if (ctx.storage && ctx.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      return { type: "transfer", target: ctx.storage, resourceType: RESOURCE_ENERGY };
    }

    // 5. Containers last (for early game or when storage is full/unavailable, cache 10 ticks)
    if (ctx.depositContainers.length > 0) {
      const closest = findCachedClosest(ctx.creep, ctx.depositContainers, "remoteHauler_cont", 10);
      if (closest) return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
    }

    // FIX: No valid delivery targets found, but creep still has energy
    // If in home room with energy but no targets, switch to collection mode
    // to go back to remote room and top off capacity
    // This prevents deadlock where remote haulers get stuck idle in home room
    if (!ctx.isEmpty && ctx.room.name === homeRoom) {
      ctx.memory.working = false;
      clearCacheOnStateChange(ctx.creep);
      // Switch to collection mode and return to remote room
      return { type: "moveToRoom", roomName: targetRoom };
    }

    return { type: "idle" };
  } else {
    // Empty - go to remote room and collect
    if (ctx.room.name !== targetRoom) {
      return { type: "moveToRoom", roomName: targetRoom };
    }

    // ENERGY EFFICIENCY: Only collect if there's sufficient energy to justify the trip
    // Remote hauling has travel costs, so we want to maximize energy per trip
    const minEnergyThreshold = ctx.creep.store.getCapacity(RESOURCE_ENERGY) * REMOTE_HAULER_ENERGY_THRESHOLD;

    // In remote room - collect from containers or ground
    const containers = ctx.room.find(FIND_STRUCTURES, {
      filter: s => 
        s.structureType === STRUCTURE_CONTAINER && 
        s.store.getUsedCapacity(RESOURCE_ENERGY) >= minEnergyThreshold
    }) as StructureContainer[];

    if (containers.length > 0) {
      const closest = findCachedClosest(ctx.creep, containers, "remoteHauler_remoteCont", 10);
      if (closest) return { type: "withdraw", target: closest, resourceType: RESOURCE_ENERGY };
    }

    // Check for dropped energy (cache 3 ticks - they disappear quickly)
    // For dropped resources, collect even smaller amounts to prevent decay
    const dropped = ctx.room.find(FIND_DROPPED_RESOURCES, {
      filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > 50
    });

    if (dropped.length > 0) {
      const closest = findCachedClosest(ctx.creep, dropped, "remoteHauler_remoteDrop", 3);
      if (closest) return { type: "pickup", target: closest };
    }

    // If no energy meets threshold, wait near a container for it to fill
    if (containers.length === 0) {
      const anyContainer = ctx.room.find(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_CONTAINER
      }) as StructureContainer[];
      
      if (anyContainer.length > 0) {
        const closest = findCachedClosest(ctx.creep, anyContainer, "remoteHauler_waitCont", 20);
        if (closest && ctx.creep.pos.getRangeTo(closest) > 2) {
          return { type: "moveTo", target: closest };
        }
      }
    }

    return { type: "idle" };
  }
}

/**
 * InterRoomCarrier - Transfer resources between rooms in a cluster.
 * Used for pre-terminal resource sharing to help stabilize room economies.
 */
export function interRoomCarrier(ctx: CreepContext): CreepAction {
  const mem = ctx.memory;

  // If no transfer request, go idle (should be assigned by spawn logic)
  if (!mem.transferRequest) {
    return { type: "idle" };
  }

  const { fromRoom, toRoom, resourceType } = mem.transferRequest;
  const isCarrying = ctx.creep.store.getUsedCapacity(resourceType) > 0;

  if (isCarrying) {
    // Carrying resources - deliver to target room
    if (ctx.room.name !== toRoom) {
      return { type: "moveToRoom", roomName: toRoom };
    }

    // In target room - find delivery target
    const room = Game.rooms[toRoom];
    if (!room) return { type: "moveToRoom", roomName: toRoom };

    // Try storage first, then containers
    if (room.storage) {
      return { type: "transfer", target: room.storage, resourceType };
    }

    // Find containers with space
    const containers = room.find(FIND_STRUCTURES, {
      filter: s =>
        s.structureType === STRUCTURE_CONTAINER && s.store.getFreeCapacity(resourceType) > 0
    }) as StructureContainer[];

    if (containers.length > 0) {
      const closest = findCachedClosest(ctx.creep, containers, "interRoomCarrier_targetCont", 10);
      if (closest) return { type: "transfer", target: closest, resourceType };
    }

    // If nowhere to deliver, drop it near spawn
    const spawns = room.find(FIND_MY_SPAWNS);
    if (spawns.length > 0) {
      if (ctx.creep.pos.isNearTo(spawns[0])) {
        return { type: "drop", resourceType };
      }
      return { type: "moveTo", target: spawns[0].pos };
    }

    return { type: "idle" };
  } else {
    // Empty - collect from source room
    if (ctx.room.name !== fromRoom) {
      return { type: "moveToRoom", roomName: fromRoom };
    }

    // In source room - find resource to collect
    const room = Game.rooms[fromRoom];
    if (!room) return { type: "moveToRoom", roomName: fromRoom };

    // Try storage first
    if (room.storage && room.storage.store.getUsedCapacity(resourceType) > 0) {
      return { type: "withdraw", target: room.storage, resourceType };
    }

    // Try containers
    const containers = room.find(FIND_STRUCTURES, {
      filter: s =>
        s.structureType === STRUCTURE_CONTAINER && s.store.getUsedCapacity(resourceType) > 0
    }) as StructureContainer[];

    if (containers.length > 0) {
      const closest = findCachedClosest(ctx.creep, containers, "interRoomCarrier_sourceCont", 10);
      if (closest) return { type: "withdraw", target: closest, resourceType };
    }

    return { type: "idle" };
  }
}

import { labSupply } from "./labSupply";

const economyBehaviors: Record<string, (ctx: CreepContext) => CreepAction> = {
  larvaWorker,
  harvester,
  hauler,
  builder,
  upgrader,
  queenCarrier,
  mineralHarvester,
  depositHarvester,
  labTech,
  labSupply,
  factoryWorker,
  remoteHarvester,
  remoteHauler,
  interRoomCarrier
};

/**
 * Evaluate and return an action for an economy role creep.
 */
export function evaluateEconomyBehavior(ctx: CreepContext): CreepAction {
  const behavior = economyBehaviors[ctx.memory.role] ?? larvaWorker;
  return behavior(ctx);
}

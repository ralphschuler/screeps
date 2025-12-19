/**
 * Cache Integration Examples
 *
 * This file demonstrates how to integrate the new caching systems
 * (roomFindCache, roleCache, computationScheduler) into existing code.
 *
 * MIGRATION GUIDE:
 * ================
 *
 * 1. ROOM.FIND() REPLACEMENTS
 * ---------------------------
 * Replace direct room.find() calls with cachedRoomFind() for better performance.
 *
 * BEFORE:
 *   const sources = room.find(FIND_SOURCES);
 *   const hostiles = room.find(FIND_HOSTILE_CREEPS);
 *
 * AFTER:
 *   import { cachedFindSources, cachedFindHostileCreeps } from "./roomFindCache";
 *   const sources = cachedFindSources(room);
 *   const hostiles = cachedFindHostileCreeps(room);
 *
 * For custom filters, use cachedRoomFind:
 *   import { cachedRoomFind } from "./roomFindCache";
 *   const spawns = cachedRoomFind(room, FIND_MY_STRUCTURES, {
 *     filter: s => s.structureType === STRUCTURE_SPAWN,
 *     filterKey: 'spawn'  // Important: provide a unique key for filtered queries
 *   });
 *
 *
 * 2. ROLE-SPECIFIC DATA CACHING
 * ------------------------------
 * Cache expensive computations for role-specific data.
 *
 * BEFORE (Builder):
 *   function findRepairTarget(creep: Creep): Structure | null {
 *     const structures = creep.room.find(FIND_STRUCTURES, {
 *       filter: s => s.hits < s.hitsMax
 *     });
 *     return creep.pos.findClosestByRange(structures);
 *   }
 *   const target = findRepairTarget(creep);
 *
 * AFTER:
 *   import { getCachedRepairTarget } from "./roleCache";
 *   const target = getCachedRepairTarget(creep, () => {
 *     // This expensive computation only runs on cache miss
 *     const structures = creep.room.find(FIND_STRUCTURES, {
 *       filter: s => s.hits < s.hitsMax
 *     });
 *     return creep.pos.findClosestByRange(structures);
 *   });
 *
 *
 * 3. COMPUTATION SCHEDULING
 * -------------------------
 * Spread expensive operations across multiple ticks.
 *
 * BEFORE:
 *   // This expensive operation runs every tick
 *   if (Game.time % 100 === 0) {
 *     analyzeMarket();
 *   }
 *
 * AFTER:
 *   import { scheduleTask, TaskPriority } from "./computationScheduler";
 *
 *   // Register task once (typically in initialization)
 *   scheduleTask(
 *     "market-analysis",
 *     100,  // Run every 100 ticks
 *     () => analyzeMarket(),
 *     TaskPriority.MEDIUM,  // Only runs when bucket > 5000
 *     2.0  // Max 2 CPU budget
 *   );
 *
 *   // Task will be executed automatically by the scheduler in main loop
 *
 *
 * 4. CACHE INVALIDATION
 * ---------------------
 * Invalidate caches when structures change.
 *
 * EXAMPLE (Tower construction complete):
 *   import { invalidateStructureCache } from "./roomFindCache";
 *
 *   // After building a structure
 *   const result = creep.build(constructionSite);
 *   if (result === OK && constructionSite.progress === constructionSite.progressTotal) {
 *     invalidateStructureCache(room.name);
 *   }
 *
 * EXAMPLE (Builder changes task):
 *   import { clearTargetCaches } from "./roleCache";
 *
 *   // When creep switches from building to repairing
 *   if (creep.memory.working !== wasWorking) {
 *     clearTargetCaches(creep, "builder", ["buildTarget", "repairTarget"]);
 *   }
 */

// This file is for documentation only - no executable code
export {};

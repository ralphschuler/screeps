/**
 * Rampart Automation System
 *
 * Automatically places and maintains ramparts on critical structures:
 * - Core structures (spawns, storage, terminal, labs, etc.)
 * - Towers for protection
 * - Controller for safe upgrading
 * - Dynamic rampart health targets based on danger level
 *
 * ROADMAP Reference: Section 17 - Mauern & Ramparts
 * - Core-Shell protection strategy
 * - Ramparts protect structures on their tile
 * - Dynamic repair targets based on RCL and danger
 *
 * Addresses Issue: #21 - Defense Systems
 * - Rampart placement automation (currently weak)
 */

import { logger } from "../core/logger";
import { calculateWallRepairTarget } from "./wallRepairTargets";

/**
 * Structure types that should be protected with ramparts
 */
const CRITICAL_STRUCTURES: StructureConstant[] = [
  STRUCTURE_SPAWN,
  STRUCTURE_STORAGE,
  STRUCTURE_TERMINAL,
  STRUCTURE_TOWER,
  STRUCTURE_LAB,
  STRUCTURE_FACTORY,
  STRUCTURE_POWER_SPAWN,
  STRUCTURE_NUKER,
  STRUCTURE_OBSERVER
];

/**
 * Structure types that need ramparts at lower RCL
 */
const PRIORITY_STRUCTURES: StructureConstant[] = [
  STRUCTURE_SPAWN,
  STRUCTURE_TOWER,
  STRUCTURE_STORAGE
];

/**
 * Rampart placement result
 */
export interface RampartPlacementResult {
  /** Number of ramparts placed */
  placed: number;
  /** Number of ramparts that need repair */
  needsRepair: number;
  /** Total critical structures */
  totalCritical: number;
  /** Protected structures */
  protected: number;
}

/**
 * Get all critical structures that should have ramparts
 */
function getCriticalStructures(room: Room, rcl: number): Structure[] {
  const structures = room.find(FIND_MY_STRUCTURES);
  
  // At lower RCL, only protect priority structures
  const targetTypes = rcl < 4 ? PRIORITY_STRUCTURES : CRITICAL_STRUCTURES;
  
  return structures.filter(s => targetTypes.includes(s.structureType));
}

/**
 * Check if a position has a rampart
 */
function hasRampart(room: Room, x: number, y: number): boolean {
  const structures = room.lookForAt(LOOK_STRUCTURES, x, y);
  return structures.some(s => s.structureType === STRUCTURE_RAMPART);
}

/**
 * Check if a position has a rampart construction site
 */
function hasRampartSite(room: Room, x: number, y: number): boolean {
  const sites = room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y);
  return sites.some(s => s.structureType === STRUCTURE_RAMPART);
}

/**
 * Place ramparts on critical structures
 *
 * Strategy:
 * 1. Identify all critical structures (spawns, storage, towers, labs, etc.)
 * 2. Check if each structure has a rampart
 * 3. Place rampart construction sites for unprotected structures
 * 4. Prioritize based on structure importance and danger level
 *
 * @param room The room to fortify
 * @param rcl Current room control level
 * @param danger Current danger level (0-3)
 * @param maxSites Maximum construction sites to place
 * @returns Rampart placement result
 */
export function placeRampartsOnCriticalStructures(
  room: Room,
  rcl: number,
  danger: number,
  maxSites = 5
): RampartPlacementResult {
  const result: RampartPlacementResult = {
    placed: 0,
    needsRepair: 0,
    totalCritical: 0,
    protected: 0
  };

  // Don't place ramparts before RCL 2
  if (rcl < 2) {
    return result;
  }

  // Get all critical structures
  const criticalStructures = getCriticalStructures(room, rcl);
  result.totalCritical = criticalStructures.length;

  if (criticalStructures.length === 0) {
    return result;
  }

  // Check existing construction sites
  const existingSites = room.find(FIND_MY_CONSTRUCTION_SITES);
  if (existingSites.length >= 10) {
    // Construction site limit reached
    return result;
  }

  const maxToPlace = Math.min(maxSites, 10 - existingSites.length);

  // Get all ramparts for repair check
  const ramparts = room.find(FIND_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_RAMPART
  }) ;

  const repairTarget = calculateWallRepairTarget(rcl, danger);

  // Track structures by priority
  const unprotected: { structure: Structure; priority: number }[] = [];

  // Check each critical structure
  for (const structure of criticalStructures) {
    const { x, y } = structure.pos;

    // Check if structure has rampart
    if (hasRampart(room, x, y)) {
      result.protected++;

      // Check if rampart needs repair
      const rampart = ramparts.find(r => r.pos.x === x && r.pos.y === y);
      if (rampart && rampart.hits < repairTarget) {
        result.needsRepair++;
      }
    } else if (!hasRampartSite(room, x, y)) {
      // Structure is unprotected - calculate priority
      let priority = 10;

      // Higher priority for spawns and storage
      if (structure.structureType === STRUCTURE_SPAWN) {
        priority = 100;
      } else if (structure.structureType === STRUCTURE_STORAGE) {
        priority = 90;
      } else if (structure.structureType === STRUCTURE_TOWER) {
        priority = 80;
      } else if (structure.structureType === STRUCTURE_TERMINAL) {
        priority = 70;
      } else if (structure.structureType === STRUCTURE_LAB) {
        priority = 60;
      }

      // Increase priority during attacks
      if (danger >= 2) {
        priority += 50;
      }

      unprotected.push({ structure, priority });
    }
  }

  // Sort unprotected structures by priority
  unprotected.sort((a, b) => b.priority - a.priority);

  // Place ramparts on unprotected structures
  for (const { structure } of unprotected) {
    if (result.placed >= maxToPlace) {
      break;
    }

    const { x, y } = structure.pos;
    const placeResult = room.createConstructionSite(x, y, STRUCTURE_RAMPART);

    if (placeResult === OK) {
      result.placed++;
      logger.debug(
        `Placed rampart on ${structure.structureType} at (${x},${y})`,
        { subsystem: "Defense" }
      );
    } else if (placeResult === ERR_FULL) {
      // Construction site limit reached
      break;
    }
  }

  // Log summary if we placed ramparts or have unprotected structures
  if (result.placed > 0 || unprotected.length > 0) {
    logger.info(
      `Rampart automation for ${room.name}: ` +
        `${result.protected}/${result.totalCritical} protected, ` +
        `${result.placed} placed, ` +
        `${unprotected.length - result.placed} pending`,
      { subsystem: "Defense" }
    );
  }

  return result;
}

/**
 * Get ramparts that need emergency repair
 *
 * Returns ramparts below 25% of target health, sorted by hits (lowest first).
 * Used by builders and towers to prioritize critical rampart repairs.
 *
 * @param room The room to check
 * @param rcl Current room control level
 * @param danger Current danger level
 * @param limit Maximum number of ramparts to return
 * @returns Array of ramparts needing repair
 */
export function getEmergencyRampartRepairs(
  room: Room,
  rcl: number,
  danger: number,
  limit = 5
): StructureRampart[] {
  const repairTarget = calculateWallRepairTarget(rcl, danger);
  const emergencyThreshold = repairTarget * 0.25;

  const ramparts = room.find(FIND_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_RAMPART && s.hits < emergencyThreshold
  }) as StructureRampart[];

  // Sort by hits (lowest first)
  ramparts.sort((a, b) => a.hits - b.hits);

  return ramparts.slice(0, limit);
}

/**
 * Get ramparts on critical structures that need repair
 *
 * Returns ramparts protecting critical structures that are below target health.
 * Sorted by importance and health deficit.
 *
 * @param room The room to check
 * @param rcl Current room control level
 * @param danger Current danger level
 * @param limit Maximum number of ramparts to return
 * @returns Array of ramparts needing repair
 */
export function getCriticalRampartRepairs(
  room: Room,
  rcl: number,
  danger: number,
  limit = 10
): StructureRampart[] {
  const repairTarget = calculateWallRepairTarget(rcl, danger);
  const criticalStructures = getCriticalStructures(room, rcl);

  const rampartsToRepair: { rampart: StructureRampart; priority: number }[] = [];

  // Find ramparts on critical structures
  for (const structure of criticalStructures) {
    const { x, y } = structure.pos;
    const structures = room.lookForAt(LOOK_STRUCTURES, x, y);
    const rampart = structures.find(s => s.structureType === STRUCTURE_RAMPART) as
      | StructureRampart
      | undefined;

    if (rampart && rampart.hits < repairTarget) {
      // Calculate priority based on structure type and health deficit
      let priority = 10;

      if (structure.structureType === STRUCTURE_SPAWN) {
        priority = 100;
      } else if (structure.structureType === STRUCTURE_STORAGE) {
        priority = 90;
      } else if (structure.structureType === STRUCTURE_TOWER) {
        priority = 80;
      } else if (structure.structureType === STRUCTURE_TERMINAL) {
        priority = 70;
      }

      // Adjust priority by health percentage
      const healthPercent = rampart.hits / repairTarget;
      priority *= 1 - healthPercent;

      rampartsToRepair.push({ rampart, priority });
    }
  }

  // Sort by priority (highest first)
  rampartsToRepair.sort((a, b) => b.priority - a.priority);

  return rampartsToRepair.slice(0, limit).map(r => r.rampart);
}

/**
 * Check rampart coverage statistics
 */
export interface RampartCoverageStats {
  totalCritical: number;
  protected: number;
  unprotected: number;
  needsRepair: number;
  coveragePercent: number;
}

export function getRampartCoverageStats(
  room: Room,
  rcl: number,
  danger: number
): RampartCoverageStats {
  const criticalStructures = getCriticalStructures(room, rcl);
  const repairTarget = calculateWallRepairTarget(rcl, danger);

  let protectedCount = 0;
  let needsRepair = 0;

  for (const structure of criticalStructures) {
    const { x, y } = structure.pos;
    const structures = room.lookForAt(LOOK_STRUCTURES, x, y);
    const rampart = structures.find(s => s.structureType === STRUCTURE_RAMPART) as
      | StructureRampart
      | undefined;

    if (rampart) {
      protectedCount++;
      if (rampart.hits < repairTarget) {
        needsRepair++;
      }
    }
  }

  const unprotected = criticalStructures.length - protectedCount;
  const coveragePercent =
    criticalStructures.length > 0 ? Math.round((protectedCount / criticalStructures.length) * 100) : 0;

  return {
    totalCritical: criticalStructures.length,
    protected: protectedCount,
    unprotected,
    needsRepair,
    coveragePercent
  };
}

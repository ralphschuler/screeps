/**
 * TooAngel Ally Filter
 * 
 * Provides utilities to identify and filter TooAngel entities from hostile detection.
 * 
 * **CRITICAL POLICY**: TooAngel is a permanent ally (ROADMAP Section 25).
 * This bot must NEVER attack or harm TooAngel or their entities under any circumstances.
 * 
 * Based on: https://github.com/TooAngel/screeps/blob/master/doc/API.md
 */

import { logger } from "../../core/logger";

/**
 * Player name for TooAngel bot
 * This is the primary identifier for TooAngel's entities
 */
export const TOOANGEL_PLAYER_NAME = "TooAngel";

/**
 * Check if a creep belongs to TooAngel
 * 
 * @param creep - Creep to check
 * @returns True if the creep belongs to TooAngel
 */
export function isTooAngelCreep(creep: Creep): boolean {
  return creep.owner.username === TOOANGEL_PLAYER_NAME;
}

/**
 * Check if a structure belongs to TooAngel
 * 
 * @param structure - Structure to check
 * @returns True if the structure belongs to TooAngel
 */
export function isTooAngelStructure(structure: AnyOwnedStructure): boolean {
  return structure.owner?.username === TOOANGEL_PLAYER_NAME;
}

/**
 * Filter TooAngel creeps from a list of hostile creeps
 * 
 * **IMPORTANT**: Always use this function when getting hostile creeps
 * to ensure TooAngel entities are never targeted for attack.
 * 
 * @param hostiles - Array of hostile creeps
 * @returns Filtered array excluding TooAngel creeps
 */
export function filterTooAngelCreeps(hostiles: Creep[]): Creep[] {
  const filtered = hostiles.filter(creep => !isTooAngelCreep(creep));
  
  const tooAngelCount = hostiles.length - filtered.length;
  if (tooAngelCount > 0) {
    logger.info(`Filtered ${tooAngelCount} TooAngel creeps from hostile detection`, {
      subsystem: "TooAngel",
      room: hostiles[0]?.room.name
    });
  }
  
  return filtered;
}

/**
 * Filter TooAngel structures from a list of hostile structures
 * 
 * **IMPORTANT**: Always use this function when getting hostile structures
 * to ensure TooAngel entities are never targeted for attack.
 * 
 * @param structures - Array of hostile structures
 * @returns Filtered array excluding TooAngel structures
 */
export function filterTooAngelStructures<T extends AnyOwnedStructure>(
  structures: T[]
): T[] {
  const filtered = structures.filter(structure => !isTooAngelStructure(structure));
  
  const tooAngelCount = structures.length - filtered.length;
  if (tooAngelCount > 0) {
    logger.info(`Filtered ${tooAngelCount} TooAngel structures from hostile detection`, {
      subsystem: "TooAngel",
      room: structures[0]?.room.name
    });
  }
  
  return filtered;
}

/**
 * Get hostile creeps in a room, excluding TooAngel
 * 
 * This is a safe wrapper around Room.find(FIND_HOSTILE_CREEPS)
 * that automatically filters out TooAngel entities.
 * 
 * @param room - Room to search
 * @returns Array of hostile creeps (excluding TooAngel)
 */
export function getActualHostileCreeps(room: Room): Creep[] {
  const hostiles = room.find(FIND_HOSTILE_CREEPS);
  return filterTooAngelCreeps(hostiles);
}

/**
 * Get hostile structures in a room, excluding TooAngel
 * 
 * This is a safe wrapper that automatically filters out TooAngel entities.
 * 
 * @param room - Room to search
 * @returns Array of hostile structures (excluding TooAngel)
 */
export function getActualHostileStructures(room: Room): AnyOwnedStructure[] {
  const structures = room.find(FIND_HOSTILE_STRUCTURES);
  return filterTooAngelStructures(structures);
}

/**
 * Check if a room contains any actual hostile entities (excluding TooAngel)
 * 
 * @param room - Room to check
 * @returns True if there are hostile creeps or structures (excluding TooAngel)
 */
export function hasActualHostiles(room: Room): boolean {
  const hostileCreeps = getActualHostileCreeps(room);
  const hostileStructures = getActualHostileStructures(room);
  
  return hostileCreeps.length > 0 || hostileStructures.length > 0;
}

/**
 * Non-Aggression Alliance System
 * 
 * A minimal alliance system that maintains a list of players with whom we have
 * a non-aggression pact. These players and their entities must NEVER be attacked
 * under any circumstances.
 * 
 * This is separate from any quest/diplomacy systems - it's purely a defensive
 * filter to prevent attacking allied players.
 * 
 * **CRITICAL POLICY** (ROADMAP Section 25):
 * Players in the non-aggression pact are permanent allies. The bot must NEVER
 * attack or harm these players or their entities.
 */

/**
 * List of players with whom we have a non-aggression pact
 * 
 * Add player names to this list to prevent the bot from attacking them.
 * Changes to this list take effect immediately.
 */
export const NON_AGGRESSION_PACT_PLAYERS = [
  "TooAngel",
  "TedRoastBeef"
] as const;

/**
 * Type for allied player names
 */
export type AlliedPlayer = typeof NON_AGGRESSION_PACT_PLAYERS[number];

/**
 * Check if a player is covered by the non-aggression pact
 * 
 * @param username - Player username to check
 * @returns True if the player is an ally
 */
export function isAllyPlayer(username: string): boolean {
  return (NON_AGGRESSION_PACT_PLAYERS as readonly string[]).includes(username);
}

/**
 * Check if a creep belongs to an allied player
 * 
 * @param creep - Creep to check
 * @returns True if the creep belongs to an allied player
 */
export function isAllyCreep(creep: Creep): boolean {
  return isAllyPlayer(creep.owner.username);
}

/**
 * Check if a structure belongs to an allied player
 * 
 * @param structure - Structure to check
 * @returns True if the structure belongs to an allied player
 */
export function isAllyStructure(structure: AnyOwnedStructure): boolean {
  return structure.owner?.username ? isAllyPlayer(structure.owner.username) : false;
}

/**
 * Filter allied creeps from a list of hostile creeps
 * 
 * **IMPORTANT**: Always use this function when getting hostile creeps
 * to ensure allied entities are never targeted for attack.
 * 
 * @param hostiles - Array of hostile creeps
 * @returns Filtered array excluding allied creeps
 */
export function filterAllyCreeps(hostiles: Creep[]): Creep[] {
  const filtered = hostiles.filter(creep => !isAllyCreep(creep));
  
  const allyCount = hostiles.length - filtered.length;
  if (allyCount > 0) {
    console.log(`[Alliance] Filtered ${allyCount} allied creeps from hostile detection in ${hostiles[0]?.room.name}`);
  }
  
  return filtered;
}

/**
 * Filter allied structures from a list of hostile structures
 * 
 * **IMPORTANT**: Always use this function when getting hostile structures
 * to ensure allied entities are never targeted for attack.
 * 
 * @param structures - Array of hostile structures
 * @returns Filtered array excluding allied structures
 */
export function filterAllyStructures<T extends AnyOwnedStructure>(
  structures: T[]
): T[] {
  const filtered = structures.filter(structure => !isAllyStructure(structure));
  
  const allyCount = structures.length - filtered.length;
  if (allyCount > 0) {
    console.log(`[Alliance] Filtered ${allyCount} allied structures from hostile detection in ${structures[0]?.room.name}`);
  }
  
  return filtered;
}

/**
 * Get hostile creeps in a room, excluding allies
 * 
 * This is a safe wrapper around Room.find(FIND_HOSTILE_CREEPS)
 * that automatically filters out allied entities.
 * 
 * @param room - Room to search
 * @returns Array of hostile creeps (excluding allies)
 */
export function getActualHostileCreeps(room: Room): Creep[] {
  const hostiles = room.find(FIND_HOSTILE_CREEPS);
  return filterAllyCreeps(hostiles);
}

/**
 * Get hostile structures in a room, excluding allies
 * 
 * This is a safe wrapper that automatically filters out allied entities.
 * 
 * @param room - Room to search
 * @returns Array of hostile structures (excluding allies)
 */
export function getActualHostileStructures(room: Room): AnyOwnedStructure[] {
  const structures = room.find(FIND_HOSTILE_STRUCTURES);
  return filterAllyStructures(structures);
}

/**
 * Check if a room contains any actual hostile entities (excluding allies)
 * 
 * @param room - Room to check
 * @returns True if there are hostile creeps or structures (excluding allies)
 */
export function hasActualHostiles(room: Room): boolean {
  const hostileCreeps = getActualHostileCreeps(room);
  const hostileStructures = getActualHostileStructures(room);
  
  return hostileCreeps.length > 0 || hostileStructures.length > 0;
}

/**
 * Non-Aggression Alliance System
 *
 * Re-exports the shared core alliance helpers so all runtime packages use one
 * source of truth for permanent allies.
 *
 * **CRITICAL POLICY** (ROADMAP/AGENTS): TooAngel and TedRoastBeef are permanent
 * allies. The bot must NEVER attack or harm these players or their entities.
 */

export {
  NON_AGGRESSION_PACT_PLAYERS,
  isAllyPlayer,
  isAllyOwned,
  isAllyCreep,
  isAllyPowerCreep,
  isAllyStructure,
  filterAllyCreeps,
  filterAllyPowerCreeps,
  filterAllyStructures,
  getActualHostileCreeps,
  getActualHostilePowerCreeps,
  getActualHostileStructures,
  hasActualHostiles,
  type AlliedPlayer
} from "@ralphschuler/screeps-core";

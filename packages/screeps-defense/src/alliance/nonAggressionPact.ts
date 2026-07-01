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
  getConfiguredAllyPlayers,
  getKnownAllyPlayers,
  isAllyPlayer,
  isConfiguredAllyPlayer,
  isKnownAllyPlayer,
  isAllyOwned,
  isConfiguredAllyOwned,
  isKnownAllyOwned,
  isAllyCreep,
  isAllyPowerCreep,
  isAllyStructure,
  isKnownAllyCreep,
  isKnownAllyPowerCreep,
  isKnownAllyStructure,
  filterAllyCreeps,
  filterAllyPowerCreeps,
  filterAllyStructures,
  filterKnownAllyCreeps,
  filterKnownAllyPowerCreeps,
  filterKnownAllyStructures,
  getActualHostileCreeps,
  getActualHostilePowerCreeps,
  getActualHostileStructures,
  getKnownHostileCreeps,
  getKnownHostilePowerCreeps,
  getKnownHostileStructures,
  hasActualHostiles,
  hasKnownHostiles,
  type AlliedPlayer,
  type AllyPolicyMemorySource,
  type AllyPolicyOptions
} from "@ralphschuler/screeps-core";

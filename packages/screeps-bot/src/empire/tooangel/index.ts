/**
 * TooAngel Diplomacy/Quest Module
 * 
 * Export all TooAngel functionality
 */

export * from "./types";
export * from "./npcDetector";
export * from "./reputationManager";
export * from "./questManager";
export * from "./questExecutor";
export * from "./tooAngelManager";
export * from "./memoryInit";

// Re-export alliance system from defense package
export {
  NON_AGGRESSION_PACT_PLAYERS,
  isAllyPlayer,
  isAllyCreep,
  isAllyStructure,
  filterAllyCreeps,
  filterAllyStructures,
  getActualHostileCreeps,
  getActualHostileStructures,
  hasActualHostiles,
  type AlliedPlayer
} from "@ralphschuler/screeps-defense";

// Re-export the main manager instance
export { tooAngelManager } from "./tooAngelManager";

// Re-export specific parsing functions for testing
export { parseQuestSign } from "./npcDetector";
export { parseReputationResponse } from "./reputationManager";
export { parseQuestMessage } from "./questManager";

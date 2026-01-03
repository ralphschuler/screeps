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

// Re-export ally filter from defense package
export {
  isTooAngelCreep,
  isTooAngelStructure,
  filterTooAngelCreeps,
  filterTooAngelStructures,
  getActualHostileCreeps,
  getActualHostileStructures,
  hasActualHostiles,
  TOOANGEL_PLAYER_NAME
} from "@ralphschuler/screeps-defense";

// Re-export the main manager instance
export { tooAngelManager } from "./tooAngelManager";

// Re-export specific parsing functions for testing
export { parseQuestSign } from "./npcDetector";
export { parseReputationResponse } from "./reputationManager";
export { parseQuestMessage } from "./questManager";

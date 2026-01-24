/**
 * Lab System - Complete Export
 *
 * Exports all lab system components for easy importing
 * Most functionality is now provided by @ralphschuler/screeps-chemistry
 */

// Lab configuration adapter (with Memory/heapCache integration)
export { labConfigManager, type LabRole, type LabConfigEntry, type RoomLabConfig } from "./labConfig";

// Boost manager adapter (with SwarmState integration)
export { boostManager } from "./boostManager";

// Chemistry planner adapter (with SwarmState integration)
export { chemistryPlanner } from "./chemistryPlanner";

// Lab manager (bot-specific orchestration)
export { 
  labManager, 
  type LabTaskType, 
  type LabResourceNeed, 
  type LabOverflow, 
  type ReactionStep 
} from "./labManager";

// Re-export commonly used types from chemistry package
export type {
  BoostConfig,
  Reaction,
  ChemistryState,
  ChemistryLogger
} from "@ralphschuler/screeps-chemistry";

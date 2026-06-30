/**
 * Compatibility exports for defender requirement analysis.
 *
 * Defensive need calculation belongs to @ralphschuler/screeps-defense. The spawn
 * package keeps this module only for existing internal imports while delegating
 * all behavior to the framework defense package.
 */

export {
  analyzeDefenderNeeds,
  createDefenseRequest,
  getCurrentDefenders,
  getDefenderPriorityBoost,
  needsDefenseAssistance,
  needsEmergencyDefenders,
} from "@ralphschuler/screeps-defense";

export type { DefenderRequirement, DefenseRequest } from "@ralphschuler/screeps-defense";

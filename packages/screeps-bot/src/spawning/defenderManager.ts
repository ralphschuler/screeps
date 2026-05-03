/**
 * Defender spawning analysis shim.
 *
 * The implementation lives in `@ralphschuler/screeps-defense` so all hostile
 * and alliance filtering stays in the defense package.
 */

export {
  analyzeDefenderNeeds,
  createDefenseRequest,
  getCurrentDefenders,
  getDefenderPriorityBoost,
  needsDefenseAssistance,
  needsEmergencyDefenders,
  type DefenderRequirement,
  type DefenseRequest
} from "@ralphschuler/screeps-defense";

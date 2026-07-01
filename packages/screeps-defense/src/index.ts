/**
 * @ralphschuler/screeps-defense
 *
 * Defense subsystem for Screeps bot - comprehensive threat assessment,
 * tower control, rampart automation, and emergency response coordination.
 *
 * This package provides a complete defense solution including:
 * - Threat assessment and danger level calculation
 * - Tower targeting and optimization
 * - Rampart and wall automation
 * - Multi-room defense coordination
 * - Emergency response and safe mode management
 * - Evacuation protocols
 * - Non-aggression alliance system
 *
 * @packageDocumentation
 */

// Non-Aggression Alliance System
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
  type AllyPolicyOptions,
} from "./alliance/nonAggressionPact";

// Defender analysis and assistance requests
export {
  analyzeDefenderNeeds,
  createDefenseRequest,
  getCurrentDefenders,
  getDefenderPriorityBoost,
  needsDefenseAssistance,
  needsEmergencyDefenders,
  type DefenderRequirement,
  type DefenseRequest,
} from "./analysis/defenderNeeds";

export {
  addCombatPower,
  analyzeDefenseAssistThreat,
  buildDefenseAssistBody,
  calculateAggregateDefenseResponsePlan,
  calculateCombatPower,
  calculateDefenseAssistSquadSize,
  calculateThreatParitySquadSize,
  emptyCombatPower,
  multiplyCombatPower,
  getVisibleDefenseAssistThreatProfile,
  isDefenseAssistBodyStrongerThanThreat,
  isDefenseAssistMilitaryRole,
  isDefenseAssistThreatProfileHard,
  type BodyTemplate,
  type CombatPower,
  type DefenseAggregateResponsePlan,
  type DefenseAssistRole,
  type DefenseAssistThreatProfile,
  type ExistingDefensePower,
} from "./analysis/defenseAssistCombat";

// Threat Assessment
export {
  assessThreat,
  calculateTowerDamage,
  calculateDangerLevel,
  estimateDefenderCost,
  logThreatAnalysis,
  type ThreatAnalysis,
} from "./threat/threatAssessment";

// Tower action policy
export {
  getHostilePriority,
  selectTowerAction,
  selectTowerTarget,
  type TowerAction,
  type TowerActionPolicyInput,
} from "./towerActionPolicy";

// Structure Defense (Ramparts, Walls, Perimeter)
export {
  placeRampartsOnCriticalStructures,
  type RampartPlacementResult,
} from "./structures/rampartAutomation";

export { calculateWallRepairTarget } from "./structures/wallRepairTargets";

export { placePerimeterDefense } from "./structures/perimeterDefense";

export { placeRoadAwarePerimeterDefense } from "./structures/roadAwareDefense";

// Coordination (Multi-room, Cluster)
export {
  defenseCoordinator,
  DefenseCoordinator,
  type DefenseAssignment,
} from "./coordination/defenseCoordinator";

export { checkAndExecuteRetreat } from "./coordination/retreatProtocol";

export {
  ClusterDefenseCoordinator,
  clusterDefenseCoordinator,
  coordinateClusterDefense,
} from "./coordination/clusterDefense";

// Emergency Response
export {
  emergencyResponseManager,
  EmergencyResponseManager,
  EmergencyLevel,
  type EmergencyState,
} from "./emergency/emergencyResponse";

export { safeModeManager, SafeModeManager } from "./emergency/safeModeManager";

export {
  evacuationManager,
  EvacuationManager,
  type EvacuationState,
} from "./emergency/evacuationManager";

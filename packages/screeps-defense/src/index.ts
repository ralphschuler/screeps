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
  isAllyPlayer,
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
  type DefenseRequest
} from "./analysis/defenderNeeds";

// Threat Assessment
export {
  assessThreat,
  calculateTowerDamage,
  calculateDangerLevel,
  estimateDefenderCost,
  logThreatAnalysis,
  type ThreatAnalysis
} from "./threat/threatAssessment";

// Structure Defense (Ramparts, Walls, Perimeter)
export {
  placeRampartsOnCriticalStructures,
  type RampartPlacementResult
} from "./structures/rampartAutomation";

export {
  calculateWallRepairTarget
} from "./structures/wallRepairTargets";

export {
  placePerimeterDefense
} from "./structures/perimeterDefense";

export {
  placeRoadAwarePerimeterDefense
} from "./structures/roadAwareDefense";

// Coordination (Multi-room, Cluster)
export {
  defenseCoordinator,
  DefenseCoordinator,
  type DefenseAssignment
} from "./coordination/defenseCoordinator";

export {
  checkAndExecuteRetreat
} from "./coordination/retreatProtocol";

export {
  ClusterDefenseCoordinator,
  clusterDefenseCoordinator,
  coordinateClusterDefense
} from "./coordination/clusterDefense";

// Emergency Response
export {
  emergencyResponseManager,
  EmergencyResponseManager,
  EmergencyLevel,
  type EmergencyState
} from "./emergency/emergencyResponse";

export {
  safeModeManager,
  SafeModeManager
} from "./emergency/safeModeManager";

export {
  evacuationManager,
  EvacuationManager,
  type EvacuationState
} from "./emergency/evacuationManager";

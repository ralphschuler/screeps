/**
 * @ralphschuler/screeps-spawn
 * 
 * Spawn system for ralphschuler/screeps bot.
 * Handles creep spawning, body optimization, queue management, and role prioritization.
 * 
 * @packageDocumentation
 */

// Bot-specific types
export type {
  CreepRole,
  EconomyRole,
  MilitaryRole,
  UtilityRole,
  PowerRole,
  PowerBankRole,
  RoleFamily,
  ColonyLevel,
  RoomPosture,
  Pheromones,
  SwarmState,
  SwarmCreepMemory
} from "./botTypes";

// Type exports
export type {
  RoomState,
  RoleCount,
  SpawnRequest as SpawnRequestType,
  SpawnResult,
  SpawnConfig,
  BodyOptimizationOptions,
  PostureWeights,
  PheromoneState
} from "./types";

export type { BodyTemplate, RoleSpawnDef } from "./roleDefinitions";

// Body utilities
export {
  BODY_PART_COSTS,
  MAX_BODY_PARTS,
  calculateBodyCost,
  validateBody,
  sortBodyParts,
  createBalancedBody
} from "./bodyUtils";

// Role definitions
export {
  ROLE_DEFINITIONS,
  getRoleDefinition,
  getAllRoles,
  getRolesByFamily
} from "./roleDefinitions";

// Main spawn manager
export { SpawnManager } from "./SpawnManager";

// Body optimizer
export { optimizeBody, optimizeHarvesterBody, optimizeHaulerBody } from "./bodyOptimizer";

// Spawn queue
export { SpawnPriority, type SpawnRequest, spawnQueue } from "./spawnQueue";

// Spawn queue manager
export { getBestBody, determineNextRole } from "./spawnQueueManager";

// Spawn needs analyzer
export { 
  countCreepsByRole, 
  needsRole, 
  assignRemoteTargetRoom,
  getRemoteRoomNeedingWorkers
} from "./spawnNeedsAnalyzer";

// Bootstrap manager
export {
  isBootstrapMode,
  getBootstrapRole,
  isEmergencySpawnState,
  getEnergyProducerCount
} from "./bootstrapManager";

// Spawn priority
export {
  getPostureSpawnWeights,
  getDynamicPriorityBoost,
  getPheromoneMult
} from "./spawnPriority";

// Defender manager
export {
  analyzeDefenderNeeds,
  getCurrentDefenders,
  getDefenderPriorityBoost
} from "./defenderManager";

// Spawn coordinator
export {
  populateSpawnQueue,
  processSpawnQueue
} from "./spawnCoordinator";

// Bot integration (interfaces for bot-specific dependencies)
export type {
  IKernel,
  IMemoryManager,
  IEnergyFlowPredictor,
  IPowerBankHarvestingManager
} from "./botIntegration";

export {
  kernel,
  memoryManager,
  energyFlowPredictor,
  powerBankHarvestingManager,
  calculateRemoteHaulerRequirement
} from "./botIntegration";


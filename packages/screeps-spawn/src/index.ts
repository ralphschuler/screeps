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
export {
  generateBodyTiers,
  optimizeBody,
  optimizeBuilderBody,
  optimizeCombatBody,
  optimizeHarvesterBody,
  optimizeHaulerBody,
  optimizeHealerBody,
  optimizeRangedBody,
  optimizeUpgraderBody,
  validateBody as validateOptimizedBody
} from "./bodyOptimizer";

// Spawn queue
export { SpawnPriority, type SpawnRequest, spawnQueue } from "./spawnQueue";

// Spawn queue manager
export { getBestBody, determineNextRole, generateCreepName, getAllSpawnableRoles, runSpawnManager } from "./spawnQueueManager";

// Spawn needs analyzer
export { 
  MAX_CARRIERS_PER_CROSS_SHARD_REQUEST,
  countCreepsByRole,
  countCreepsOfRole,
  countRemoteCreepsByTargetRoom,
  needsRole, 
  assignRemoteTargetRoom,
  getRemoteRoomNeedingWorkers
} from "./spawnNeedsAnalyzer";

// Bootstrap manager
export {
  isBootstrapMode,
  getBootstrapRole,
  isEmergencySpawnState,
  getEnergyProducerCount,
  getTransportCount
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
  createDefenseRequest,
  getCurrentDefenders,
  getDefenderPriorityBoost,
  needsDefenseAssistance,
  type DefenseRequest
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


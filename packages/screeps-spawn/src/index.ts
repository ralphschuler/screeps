/**
 * @ralphschuler/screeps-spawn
 * 
 * Modular spawn system for Screeps with clean interfaces and no Game object dependencies.
 * 
 * @packageDocumentation
 */

// Type exports
export {
  RoleFamily,
  RoomPosture,
  BodyTemplate,
  RoleSpawnDef,
  PheromoneState,
  RoomState,
  RoleCount,
  SpawnRequest,
  SpawnResult,
  SpawnConfig,
  BodyOptimizationOptions,
  PostureWeights
} from "./types";

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
  DEFAULT_ROLE_DEFINITIONS,
  getRoleDefinition,
  getAllRoles,
  getRolesByFamily
} from "./roleDefinitions";

// Main spawn manager
export { SpawnManager } from "./SpawnManager";

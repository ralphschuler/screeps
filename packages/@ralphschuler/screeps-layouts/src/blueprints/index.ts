/**
 * Base Blueprints - Phase 5
 *
 * Pre-computed coordinate arrays for base layouts at different RCL stages.
 * 
 * Features:
 * - ✅ Automatic blueprint selection based on terrain (selectBestBlueprint)
 * - ✅ Blueprint validation before construction (validateBlueprintFit)
 * - ✅ Blueprint versioning for gradual base evolution (RCL-based blueprints)
 * - ✅ Specialized blueprints (bunker, spread, war-ready layouts)
 * - ✅ Blueprint efficiency scoring (anchor selection with multiple metrics)
 * - ✅ Blueprint import/export for sharing proven designs (JSON serialization)
 * 
 * Terrain-adaptive fallback generation supports irregular-room layouts
 * Generate custom layouts when pre-made blueprints don't fit
 */

// Types
export type {
  StructurePlacement,
  Blueprint,
  MisplacedStructure,
  BlueprintEfficiencyMetrics,
  EvolutionStage,
  BlueprintPoint,
  BlueprintRoomFacts,
  BlueprintExistingPlacement,
  BlueprintPlan,
  BlueprintPlanError,
  BlueprintPlanValidation,
  PlannedStructure,
  PlannedRoad,
  PlannedRampart,
  StampDefinition,
  StampMember,
  StampMemberGroup,
  StampFallbackPolicy,
  StampRoad,
  UnplacedDemand
} from "./types";

// Constants and RCL targets
export { getStructureLimits } from "./constants";
export {
  getControllerStructureLimits,
  getMandatoryStructureTargets,
  getStructureTarget,
  normalizeRcl,
  STRUCTURE_TYPES,
  MANDATORY_BLUEPRINT_STRUCTURE_TYPES,
  OPTIONAL_BLUEPRINT_STRUCTURE_TYPES
} from "./definitions/rcl-plan";

// Blueprint definitions
export { EARLY_COLONY_BLUEPRINT } from "./definitions/early-colony";
export { CORE_COLONY_BLUEPRINT } from "./definitions/core-colony";
export { ECONOMIC_MATURITY_BLUEPRINT } from "./definitions/economic-maturity";
export { WAR_READY_BLUEPRINT } from "./definitions/war-ready";
export { COMPACT_BUNKER_BLUEPRINT } from "./definitions/compact-bunker";

// Blueprint selection
export {
  getBlueprintForStage,
  getBlueprintForRCL,
  getStructuresForRCL,
  getBlueprint,
  selectBestBlueprint
} from "./selector";

// Blueprint validation
export {
  validateBlueprintFit,
  findBestBlueprintAnchor,
  isValidSpawnPosition,
  findBestSpawnPosition
} from "./validator";

// Blueprint placement
export {
  placeConstructionSites,
  findMisplacedStructures,
  destroyMisplacedStructures
} from "./placer";

// Blueprint metrics
export {
  calculateBlueprintEfficiency,
  compareBlueprintEfficiency
} from "./metrics";

// Stamp planner
export * from "./definitions/stamps";
export {
  planRoomBlueprint,
  planRoomBlueprintFromRoom,
  createBlueprintFactsFromRoom,
  blueprintFromPlan,
  placeStampOrPartial,
  validatePlanAgainstRclLimits,
  type BlueprintPlannerOptions,
  type MutablePlanState,
  type StampPlacementResult
} from "./planner";
export {
  enumerateFallbackCandidates,
  chooseBestFallbackCandidate,
  isBuildableRoomTile,
  isCriticalStructureType,
  isWallTerrain,
  terrainAt
} from "./fallback";
export {
  buildConstructionQueue,
  issueConstructionSites,
  type BlueprintConstructionItem,
  type ConstructionPriority,
  type ConstructionQueueOptions
} from "./constructionQueue";

// Blueprint serialization
export {
  exportBlueprint,
  importBlueprint
} from "./serializer";

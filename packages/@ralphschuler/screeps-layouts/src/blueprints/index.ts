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
 * TODO: Add dynamic blueprint generation for irregular terrain
 Issue URL: https://github.com/ralphschuler/screeps/issues/794
 * Generate custom layouts when pre-made blueprints don't fit
 */

// Types
export type {
  StructurePlacement,
  Blueprint,
  MisplacedStructure,
  BlueprintEfficiencyMetrics,
  EvolutionStage
} from "./types";

// Constants
export { getStructureLimits } from "./constants";

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

// Blueprint serialization
export {
  exportBlueprint,
  importBlueprint
} from "./serializer";

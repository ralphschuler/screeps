/**
 * @ralphschuler/screeps-layouts
 * 
 * Room layout planning and blueprint system
 */

// Types
export * from './types';

// Extension Generation
export {
  CHECKERBOARD_EXTENSION_PATTERN,
  MAX_GENERATED_EXTENSIONS,
  generateExtensions,
  generateExtensions as generateExtensionPattern,
  isCheckerboardPosition,
  isCheckerboardPosition as isCheckerboardPatternPosition,
  addExtensionsToBlueprint,
  addExtensionsToBlueprint as addExtensionPatternToBlueprint,
  hasEdgeAdjacentExtensions,
  type ExtensionPatternPosition
} from './extensionGenerator';

// Layout Planning
export {
  findOptimalAnchor,
  hasEnoughSpace,
  getCachedTerrain,
  clearTerrainCache
} from './layoutPlanner';

export * from './layoutAnchorIntent';
export * from './blueprintBuilders';
export * from './constructionBudget';
export * from './linkNetworkPlanner';
export * from './labClusterPlanner';

// Blueprints
export * from './blueprints/index';

// Road Network Planning
export type {
  RoadSegment,
  RoomRoadNetwork,
  RoadNetworkConfig
} from './roadNetworkPlanner';

export {
  calculateRoadNetwork,
  calculateRemoteRoads,
  getValidRoadPositions,
  clearRoadNetworkCache,
  clearAllRoadNetworkCaches,
  isValidRoadPosition,
  placeRoadConstructionSites,
  getCachedRoadNetwork
} from './roadNetworkPlanner';

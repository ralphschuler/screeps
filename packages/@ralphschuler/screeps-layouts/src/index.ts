/**
 * @ralphschuler/screeps-layouts
 * 
 * Room layout planning and blueprint system
 */

// Types
export * from './types';

// Extension Generation
export {
  generateExtensions,
  isCheckerboardPosition,
  addExtensionsToBlueprint
} from './extensionGenerator';

// Layout Planning
export {
  findOptimalAnchor,
  hasEnoughSpace,
  getCachedTerrain,
  clearTerrainCache
} from './layoutPlanner';

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

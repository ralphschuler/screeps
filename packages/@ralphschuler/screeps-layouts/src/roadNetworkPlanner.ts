/**
 * Road Network Planner
 *
 * Public facade for road planning. Internals live in `road-network/*` so each
 * module has one reason to change:
 * - infrastructure roads: source/controller/mineral paths
 * - exit/remote roads: permanent and assignment-driven inter-room protection
 * - validation: blueprint + planned + fallback road sets
 * - construction: rate-limited road construction-site placement
 *
 * These calculated road positions are used by the blueprint system to determine
 * which roads are valid and should NOT be destroyed during blueprint enforcement.
 */

export type {
  RoadSegment,
  RoomRoadNetwork,
  RoadNetworkConfig
} from "./road-network/types";

export {
  calculateRoadNetwork
} from "./road-network/infrastructure";

export {
  calculateRemoteRoads
} from "./road-network/remoteRoads";

export {
  getValidRoadPositions,
  isValidRoadPosition
} from "./road-network/validRoads";

export {
  placeRoadConstructionSites
} from "./road-network/construction";

export {
  clearRoadNetworkCache,
  clearAllRoadNetworkCaches,
  getCachedRoadNetwork
} from "./road-network/cache";

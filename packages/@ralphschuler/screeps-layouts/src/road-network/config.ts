import type { RoadNetworkConfig } from "./types";

/** Room center coordinates used as a low-information target for unseen remotes. */
export const ROOM_CENTER_X = 25;
export const ROOM_CENTER_Y = 25;

/** Default behavior favors stable cached plans over frequent path recalculation. */
export const DEFAULT_CONFIG: RoadNetworkConfig = {
  recalculateInterval: 1000,
  maxPathOps: 2000,
  includeRemoteRoads: true
};

/** Construction site limit per room (Screeps game limit). */
export const MAX_CONSTRUCTION_SITES_PER_ROOM = 10;

/** Default number of road construction sites to place per tick. */
export const DEFAULT_ROAD_SITES_PER_TICK = 3;

/**
 * Distance from room exits within which existing roads are protected.
 *
 * Expanded from 3 to 10 to prevent remote-mining road destruction. This is a
 * fallback in addition to path-based protection, so it must stay fresh every call.
 */
export const EXIT_ROAD_PROTECTION_DISTANCE = 10;

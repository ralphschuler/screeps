/**
 * Shared contracts for road-network planning.
 *
 * Public types stay small so callers can reason about the generated road plan
 * without depending on pathfinding internals or cache layout.
 */

/** Room edge used when routing from a hub to exits or adjacent remote rooms. */
export type ExitDirection = "top" | "bottom" | "left" | "right";

/** Stable iteration order for all room exits. */
export const EXIT_DIRECTIONS: readonly ExitDirection[] = ["top", "bottom", "left", "right"];

/** Road coordinate without a room name, stored as a compact Memory-safe pair. */
export interface RoadCoordinate {
  x: number;
  y: number;
}

/** Road segment for multi-room paths. */
export interface RoadSegment {
  /** Room name */
  roomName: string;
  /** Positions in this room */
  positions: RoadCoordinate[];
}

/** Road network for a room. */
export interface RoomRoadNetwork {
  /** Room name */
  roomName: string;
  /** Positions that are part of the road network */
  positions: Set<string>;
  /** Last calculated tick */
  lastCalculated: number;
}

/** Configuration for road network calculation. */
export interface RoadNetworkConfig {
  /** How often to recalculate roads (in ticks). */
  recalculateInterval: number;
  /** Maximum path operations per room. */
  maxPathOps: number;
  /** Whether to include roads to remote rooms. */
  includeRemoteRoads: boolean;
}

/** Cached planned road set for a specific room/anchor/blueprint/remote tuple. */
export interface CachedValidRoadPositions {
  roomName: string;
  positions: Set<string>;
  lastCalculated: number;
}

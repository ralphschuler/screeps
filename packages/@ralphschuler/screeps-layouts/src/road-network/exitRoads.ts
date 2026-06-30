import { logger } from "@ralphschuler/screeps-core";

import { DEFAULT_CONFIG, EXIT_ROAD_PROTECTION_DISTANCE } from "./config";
import { getExitPositions, findClosestExit, isNearExit } from "./exitGeometry";
import { addCompletedRoomPath, searchExitApproachPath } from "./pathing";
import { toRoadPositionKey } from "./positionKeys";
import { EXIT_DIRECTIONS, type RoadNetworkConfig } from "./types";

/**
 * Find existing roads near room exits as fallback protection.
 *
 * This remains distance-based so it still protects remote-road remnants when
 * pathfinding is incomplete, hub data is unavailable, or assignments change.
 */
export function findExistingExitRoads(
  room: Room,
  distance: number = EXIT_ROAD_PROTECTION_DISTANCE
): Set<string> {
  const exitRoads = new Set<string>();

  const roads = room.find(FIND_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_ROAD
  });

  const roadSites = room.find(FIND_CONSTRUCTION_SITES, {
    filter: s => s.structureType === STRUCTURE_ROAD
  });

  for (const road of roads) {
    if (isNearExit(road.pos, distance)) {
      exitRoads.add(toRoadPositionKey(road.pos));
    }
  }

  for (const site of roadSites) {
    if (isNearExit(site.pos, distance)) {
      exitRoads.add(toRoadPositionKey(site.pos));
    }
  }

  return exitRoads;
}

/**
 * Calculate permanent roads from a room hub to all walkable exits.
 *
 * These roads are protected independently from current remote assignments to
 * avoid destroy/rebuild churn as remote rooms change.
 */
export function calculateExitRoads(
  room: Room,
  hubPos: RoomPosition,
  config: Partial<RoadNetworkConfig> = {}
): Set<string> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const exitRoads = new Set<string>();

  for (const direction of EXIT_DIRECTIONS) {
    try {
      const exitPositions = getExitPositions(room.name, direction);
      if (exitPositions.length === 0) continue;

      const targetExit = findClosestExit(hubPos, exitPositions);
      if (!targetExit) continue;

      const pathResult = searchExitApproachPath(hubPos, targetExit, room.name, cfg.maxPathOps);
      if (!pathResult.incomplete) {
        addCompletedRoomPath(exitRoads, pathResult, room.name);
      } else {
        logger.warn(
          `Incomplete path when calculating exit road for ${direction} in ${room.name} (target exit: ${targetExit.x},${targetExit.y}). Path length: ${pathResult.path.length}`,
          { subsystem: "RoadNetwork" }
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.warn(
        `Failed to calculate exit road for ${direction} in ${room.name}: ${errorMessage}`,
        { subsystem: "RoadNetwork" }
      );
    }
  }

  return exitRoads;
}

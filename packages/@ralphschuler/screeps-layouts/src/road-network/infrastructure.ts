import { logger } from "@ralphschuler/screeps-core";

import { DEFAULT_CONFIG } from "./config";
import {
  getCachedRoadNetworkByKey,
  getRoadNetworkCacheKey,
  setCachedRoadNetwork
} from "./cache";
import { findRoadPath } from "./pathing";
import { toRoadPositionKey } from "./positionKeys";
import type { RoomRoadNetwork, RoadNetworkConfig } from "./types";

function addRoadPath(
  positions: Set<string>,
  from: RoomPosition,
  to: RoomPosition,
  roomName: string,
  maxPathOps: number
): void {
  for (const pos of findRoadPath(from, to, roomName, maxPathOps)) {
    positions.add(toRoadPositionKey(pos));
  }
}

/**
 * Calculate local infrastructure roads for a room.
 *
 * Includes paths from the room hub to sources, controller, and RCL6+ mineral;
 * when no storage exists yet, anchor-based bootstrap paths are included too.
 */
export function calculateRoadNetwork(
  room: Room,
  anchor: RoomPosition,
  config: Partial<RoadNetworkConfig> = {}
): RoomRoadNetwork {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const cacheKey = getRoadNetworkCacheKey(room, anchor, cfg);
  const cached = getCachedRoadNetworkByKey(cacheKey, cfg.recalculateInterval);
  if (cached) {
    return cached;
  }

  const positions = new Set<string>();
  const rcl = room.controller?.level ?? 0;
  const sources = room.find(FIND_SOURCES);
  const controller = room.controller;
  const storage = room.storage;
  const mineral = room.find(FIND_MINERALS)[0];
  const hubPos = storage?.pos ?? anchor;

  for (const source of sources) {
    addRoadPath(positions, hubPos, source.pos, room.name, cfg.maxPathOps);
  }

  if (controller) {
    addRoadPath(positions, hubPos, controller.pos, room.name, cfg.maxPathOps);
  }

  if (mineral && rcl >= 6) {
    addRoadPath(positions, hubPos, mineral.pos, room.name, cfg.maxPathOps);
  }

  if (!storage) {
    for (const source of sources) {
      addRoadPath(positions, anchor, source.pos, room.name, cfg.maxPathOps);
    }

    if (controller) {
      addRoadPath(positions, anchor, controller.pos, room.name, cfg.maxPathOps);
    }
  }

  const network: RoomRoadNetwork = {
    roomName: room.name,
    positions,
    lastCalculated: Game.time
  };

  setCachedRoadNetwork(cacheKey, network);

  logger.debug(
    `Calculated road network for ${room.name}: ${positions.size} positions`,
    { subsystem: "RoadNetwork" }
  );

  return network;
}

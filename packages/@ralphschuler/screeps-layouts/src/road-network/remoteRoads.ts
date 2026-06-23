import { logger } from "@ralphschuler/screeps-core";

import { DEFAULT_CONFIG, ROOM_CENTER_X, ROOM_CENTER_Y } from "./config";
import { generateRoadCostMatrix } from "./costMatrix";
import { findClosestExit, getExitDirection, getExitPositions } from "./exitGeometry";
import { searchExitApproachPath } from "./pathing";
import { addPathToRoomMap } from "./positionKeys";
import type { RoadNetworkConfig } from "./types";

function findHubPosition(homeRoom: Room): RoomPosition | undefined {
  const storage = homeRoom.storage;
  const spawn = homeRoom.find(FIND_MY_SPAWNS)[0];
  return storage?.pos ?? spawn?.pos;
}

function addRemoteCenterRoads(
  result: Map<string, Set<string>>,
  hubPos: RoomPosition,
  remoteRoomName: string,
  maxPathOps: number
): void {
  const remoteTarget = new RoomPosition(ROOM_CENTER_X, ROOM_CENTER_Y, remoteRoomName);
  const fullPathResult = PathFinder.search(
    hubPos,
    { pos: remoteTarget, range: 20 },
    {
      plainCost: 2,
      swampCost: 10,
      maxOps: maxPathOps,
      roomCallback: (roomName: string) => generateRoadCostMatrix(roomName)
    }
  );

  if (!fullPathResult.incomplete) {
    addPathToRoomMap(result, fullPathResult.path);
  }
}

/**
 * Calculate road protection for remote-mining routes from a home room.
 *
 * The planner protects both the explicit home-room exit approach and the
 * broader path toward the remote room center, grouped by room name.
 */
export function calculateRemoteRoads(
  homeRoom: Room,
  remoteRoomNames: string[],
  config: Partial<RoadNetworkConfig> = {}
): Map<string, Set<string>> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const result = new Map<string, Set<string>>();

  if (!cfg.includeRemoteRoads) {
    return result;
  }

  const hubPos = findHubPosition(homeRoom);
  if (!hubPos) {
    return result;
  }

  for (const remoteRoomName of remoteRoomNames) {
    try {
      const exitDirection = getExitDirection(homeRoom.name, remoteRoomName);
      if (exitDirection) {
        const exitPositions = getExitPositions(homeRoom.name, exitDirection);
        if (exitPositions.length === 0) {
          logger.warn(
            `No valid exit positions found in ${homeRoom.name} towards ${remoteRoomName}`,
            { subsystem: "RoadNetwork" }
          );
        } else {
          const targetExit = findClosestExit(hubPos, exitPositions);
          if (targetExit) {
            const pathResult = searchExitApproachPath(hubPos, targetExit, homeRoom.name, cfg.maxPathOps);
            if (!pathResult.incomplete) {
              addPathToRoomMap(result, pathResult.path);
            }
          }
        }
      }

      // Distance-2+ remotes are valid in the bot. They do not have a single
      // adjacent exit edge, but full PathFinder routes still provide protection.
      addRemoteCenterRoads(result, hubPos, remoteRoomName, cfg.maxPathOps);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.warn(
        `Failed to calculate remote road to ${remoteRoomName}: ${errorMessage}`,
        { subsystem: "RoadNetwork" }
      );
    }
  }

  return result;
}

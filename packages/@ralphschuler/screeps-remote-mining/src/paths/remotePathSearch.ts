import { getRemoteMiningRoomCallback } from "../analysis/remoteRoomUtils";
import type { ILogger } from "../types";

/**
 * Single search policy for all remote-mining route calculations.
 *
 * The cache, precache job, and on-demand route builder must all use the same
 * PathFinder costs so a cached route means the same thing no matter where it
 * was produced. Keep this module small and pure except for the PathFinder call.
 */
export const REMOTE_PATH_SEARCH_POLICY = {
  /** Stop adjacent to sources, containers, and storage targets. */
  goalRange: 1,
  /** Prefer roads/corridors without making plain terrain look free. */
  plainCost: 2,
  /** Preserve the existing remote-mining swamp penalty. */
  swampCost: 10,
  /** Screeps PathFinder default/max; explicit for readability. */
  maxRooms: 16
} as const;

/**
 * Search for a remote-mining route using the package's shared room callback.
 */
export function searchRemotePath(
  from: RoomPosition,
  to: RoomPosition,
  logger: ILogger
): PathFinderPath {
  return PathFinder.search(
    from,
    { pos: to, range: REMOTE_PATH_SEARCH_POLICY.goalRange },
    {
      plainCost: REMOTE_PATH_SEARCH_POLICY.plainCost,
      swampCost: REMOTE_PATH_SEARCH_POLICY.swampCost,
      maxRooms: REMOTE_PATH_SEARCH_POLICY.maxRooms,
      roomCallback: roomName => getRemoteMiningRoomCallback(roomName, logger)
    }
  );
}

/** True when a PathFinder result is safe to convert and cache. */
export function hasCompleteRemotePath(result: PathFinderPath): boolean {
  return !result.incomplete && result.path.length > 0;
}

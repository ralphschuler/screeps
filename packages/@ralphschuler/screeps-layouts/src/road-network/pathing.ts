import { generateRoadCostMatrix } from "./costMatrix";
import { addPathToSet } from "./positionKeys";
import type { RoadCoordinate } from "./types";

/** Find a road path between two positions in the same room. */
export function findRoadPath(
  from: RoomPosition,
  to: RoomPosition,
  roomName: string,
  maxOps: number
): RoadCoordinate[] {
  const result: RoadCoordinate[] = [];

  const pathResult = PathFinder.search(
    from,
    { pos: to, range: 1 },
    {
      plainCost: 2,
      swampCost: 10,
      maxOps,
      roomCallback: (rn: string) => {
        if (rn !== roomName) {
          return false;
        }
        return generateRoadCostMatrix(rn);
      }
    }
  );

  if (!pathResult.incomplete) {
    for (const pos of pathResult.path) {
      if (pos.roomName === roomName) {
        result.push({ x: pos.x, y: pos.y });
      }
    }
  }

  return result;
}

/** Calculate a same-room path from a hub to an exit tile. */
export function searchExitApproachPath(
  hubPos: RoomPosition,
  targetExit: RoomPosition,
  roomName: string,
  maxPathOps: number
): PathFinderPath {
  return PathFinder.search(
    hubPos,
    { pos: targetExit, range: 0 },
    {
      plainCost: 2,
      swampCost: 10,
      maxOps: maxPathOps,
      roomCallback: (pathRoomName: string) => {
        if (pathRoomName !== roomName) {
          return false;
        }
        return generateRoadCostMatrix(pathRoomName);
      }
    }
  );
}

/** Add a completed same-room path to a road set. */
export function addCompletedRoomPath(positions: Set<string>, pathResult: PathFinderPath, roomName: string): void {
  if (!pathResult.incomplete) {
    addPathToSet(positions, pathResult.path, roomName);
  }
}

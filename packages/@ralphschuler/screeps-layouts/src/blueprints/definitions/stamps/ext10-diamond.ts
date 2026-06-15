import type { StampDefinition, StampMember, StampRoad } from "../../types";
import { STRUCTURE_TYPES } from "../rcl-plan";

const extensionPositions = [
  { dx: -1, dy: -2 },
  { dx: 1, dy: -2 },
  { dx: 0, dy: -1 },
  { dx: -2, dy: -1 },
  { dx: 2, dy: -1 },
  { dx: 0, dy: 1 },
  { dx: -2, dy: 1 },
  { dx: 2, dy: 1 },
  { dx: -1, dy: 2 },
  { dx: 1, dy: 2 }
];

const roadPositions = [
  { dx: 0, dy: -2 },
  { dx: -1, dy: -1 },
  { dx: 1, dy: -1 },
  { dx: -2, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 0 },
  { dx: 1, dy: 0 },
  { dx: 2, dy: 0 },
  { dx: -1, dy: 1 },
  { dx: 1, dy: 1 },
  { dx: 0, dy: 2 }
];

export const EXT10_DIAMOND: StampDefinition = {
  id: "EXT10_DIAMOND",
  name: "EXT10 diamond extension pod",
  members: extensionPositions.map((position, index): StampMember => ({
    id: `extension-${index + 1}`,
    structureType: STRUCTURE_TYPES.extension,
    dx: position.dx,
    dy: position.dy,
    minRcl: 2,
    priority: 100 - index,
    required: true,
    group: "extensionPod",
    fallback: "nearRoad"
  })),
  roads: roadPositions.map((position, index): StampRoad => ({
    id: `road-${index + 1}`,
    dx: position.dx,
    dy: position.dy,
    minRcl: 2,
    priority: 50 - index
  }))
};

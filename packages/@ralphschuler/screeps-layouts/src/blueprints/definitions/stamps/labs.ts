import type { StampDefinition, StampMember, StampRoad } from "../../types";
import { STRUCTURE_TYPES } from "../rcl-plan";

const labPositions = [
  { dx: 0, dy: 0, minRcl: 6, priority: 220 },
  { dx: 1, dy: 0, minRcl: 6, priority: 219 },
  { dx: 0, dy: 1, minRcl: 6, priority: 218 },
  { dx: 1, dy: 1, minRcl: 7, priority: 217 },
  { dx: -1, dy: 0, minRcl: 7, priority: 216 },
  { dx: 0, dy: -1, minRcl: 7, priority: 215 },
  { dx: 2, dy: 0, minRcl: 8, priority: 214 },
  { dx: 2, dy: 1, minRcl: 8, priority: 213 },
  { dx: 1, dy: -1, minRcl: 8, priority: 212 },
  { dx: -1, dy: 1, minRcl: 8, priority: 211 }
];

export const LAB3_TO_LAB10: StampDefinition = {
  id: "LAB3_TO_LAB10",
  name: "Expandable compact lab cluster",
  members: labPositions.map((position, index): StampMember => ({
    id: `lab-${index + 1}`,
    structureType: STRUCTURE_TYPES.lab,
    dx: position.dx,
    dy: position.dy,
    minRcl: position.minRcl as 6 | 7 | 8,
    priority: position.priority,
    required: true,
    group: "labCluster",
    fallback: "labCluster",
    rampart: true
  })),
  roads: [
    { id: "road-n", dx: 0, dy: -2, minRcl: 6, priority: 90 },
    { id: "road-e", dx: 3, dy: 0, minRcl: 6, priority: 89 },
    { id: "road-s", dx: 0, dy: 2, minRcl: 6, priority: 88 },
    { id: "road-w", dx: -2, dy: 0, minRcl: 6, priority: 87 },
    { id: "road-terminal", dx: -1, dy: -1, minRcl: 6, priority: 86 }
  ] as StampRoad[]
};

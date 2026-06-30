import type { StampDefinition } from "../../types";
import { STRUCTURE_TYPES } from "../rcl-plan";

export const DEFENSE_TOWER_PAIR: StampDefinition = {
  id: "DEFENSE_TOWER_PAIR",
  name: "Late-game defended tower group",
  members: [
    { id: "tower-4", structureType: STRUCTURE_TYPES.tower, dx: 0, dy: 0, minRcl: 8, priority: 210, required: true, group: "defense", fallback: "defenseCoverage", rampart: true },
    { id: "tower-5", structureType: STRUCTURE_TYPES.tower, dx: 1, dy: 0, minRcl: 8, priority: 209, required: true, group: "defense", fallback: "defenseCoverage", rampart: true },
    { id: "tower-6", structureType: STRUCTURE_TYPES.tower, dx: 0, dy: 1, minRcl: 8, priority: 208, required: true, group: "defense", fallback: "defenseCoverage", rampart: true }
  ],
  roads: [
    { id: "road-w", dx: -1, dy: 0, minRcl: 8, priority: 80 },
    { id: "road-s", dx: 0, dy: 2, minRcl: 8, priority: 79 },
    { id: "road-e", dx: 2, dy: 0, minRcl: 8, priority: 78 },
    { id: "road-n", dx: 0, dy: -1, minRcl: 8, priority: 77 }
  ]
};

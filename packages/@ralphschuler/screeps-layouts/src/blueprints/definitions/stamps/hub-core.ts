import type { StampDefinition, StampMember, StampRoad } from "../../types";
import { STRUCTURE_TYPES } from "../rcl-plan";

const hubMembers: StampMember[] = [
  { id: "spawn-1", structureType: STRUCTURE_TYPES.spawn, dx: -2, dy: 0, minRcl: 1, priority: 300, required: true, group: "hub", fallback: "nearHub", rampart: true },
  { id: "storage", structureType: STRUCTURE_TYPES.storage, dx: 0, dy: 0, minRcl: 4, priority: 295, required: true, group: "hub", fallback: "nearHub", rampart: true },
  { id: "hub-link", structureType: STRUCTURE_TYPES.link, dx: -1, dy: -1, minRcl: 5, priority: 260, required: true, group: "hub", fallback: "nearStorage", rampart: true },
  { id: "terminal", structureType: STRUCTURE_TYPES.terminal, dx: 0, dy: 1, minRcl: 6, priority: 255, required: true, group: "hub", fallback: "nearStorage", rampart: true },
  { id: "factory", structureType: STRUCTURE_TYPES.factory, dx: 1, dy: 1, minRcl: 7, priority: 250, required: true, group: "hub", fallback: "nearStorage", rampart: true },
  { id: "spawn-2", structureType: STRUCTURE_TYPES.spawn, dx: 2, dy: 0, minRcl: 7, priority: 245, required: true, group: "hub", fallback: "nearHub", rampart: true },
  { id: "spawn-3", structureType: STRUCTURE_TYPES.spawn, dx: 0, dy: -2, minRcl: 8, priority: 240, required: true, group: "hub", fallback: "nearHub", rampart: true },
  { id: "tower-1", structureType: STRUCTURE_TYPES.tower, dx: -2, dy: -2, minRcl: 3, priority: 235, required: true, group: "defense", fallback: "defenseCoverage", rampart: true },
  { id: "tower-2", structureType: STRUCTURE_TYPES.tower, dx: 2, dy: -2, minRcl: 5, priority: 230, required: true, group: "defense", fallback: "defenseCoverage", rampart: true },
  { id: "tower-3", structureType: STRUCTURE_TYPES.tower, dx: -2, dy: 2, minRcl: 7, priority: 225, required: true, group: "defense", fallback: "defenseCoverage", rampart: true }
];

const hubRoads: StampRoad[] = [
  { id: "road-nw", dx: -1, dy: -2, minRcl: 1, priority: 120 },
  { id: "road-ne", dx: 1, dy: -2, minRcl: 1, priority: 119 },
  { id: "road-w", dx: -1, dy: 0, minRcl: 1, priority: 118 },
  { id: "road-e", dx: 1, dy: 0, minRcl: 1, priority: 117 },
  { id: "road-sw", dx: -1, dy: 2, minRcl: 1, priority: 116 },
  { id: "road-s", dx: 0, dy: 2, minRcl: 1, priority: 115 },
  { id: "road-se", dx: 1, dy: 2, minRcl: 1, priority: 114 },
  { id: "road-ring-n", dx: 0, dy: -3, minRcl: 1, priority: 100 },
  { id: "road-ring-s", dx: 0, dy: 3, minRcl: 1, priority: 99 },
  { id: "road-ring-w", dx: -3, dy: 0, minRcl: 1, priority: 98 },
  { id: "road-ring-e", dx: 3, dy: 0, minRcl: 1, priority: 97 }
];

export const HUB_CORE: StampDefinition = {
  id: "HUB_CORE",
  name: "Storage-centered hub core",
  members: hubMembers,
  roads: hubRoads
};

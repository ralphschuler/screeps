import type { StampDefinition } from "../../types";
import { STRUCTURE_TYPES } from "../rcl-plan";

export const SOURCE_MINING: StampDefinition = {
  id: "SOURCE_MINING",
  name: "Anchored source mining support",
  members: [
    { id: "container", structureType: STRUCTURE_TYPES.container, dx: 0, dy: 0, minRcl: 2, priority: 180, required: false, group: "source", fallback: "nearSource" },
    { id: "source-link", structureType: STRUCTURE_TYPES.link, dx: 1, dy: 0, minRcl: 5, priority: 175, required: false, group: "source", fallback: "nearSource", rampart: true }
  ],
  roads: [{ id: "road", dx: 0, dy: 1, minRcl: 1, priority: 60 }]
};

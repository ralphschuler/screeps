import type { StampDefinition } from "../../types";
import { STRUCTURE_TYPES } from "../rcl-plan";

export const MINERAL_STAMP: StampDefinition = {
  id: "MINERAL_STAMP",
  name: "Fixed mineral extractor support",
  members: [
    { id: "extractor", structureType: STRUCTURE_TYPES.extractor, dx: 0, dy: 0, minRcl: 6, priority: 190, required: true, group: "mineral", fallback: "none" },
    { id: "mineral-container", structureType: STRUCTURE_TYPES.container, dx: 1, dy: 0, minRcl: 6, priority: 120, required: false, group: "mineral", fallback: "nearMineral" }
  ],
  roads: [{ id: "road", dx: 1, dy: 1, minRcl: 6, priority: 52 }]
};

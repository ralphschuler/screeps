import type { StampDefinition } from "../../types";
import { STRUCTURE_TYPES } from "../rcl-plan";

export const CONTROLLER_STAMP: StampDefinition = {
  id: "CONTROLLER_STAMP",
  name: "Controller upgrading support",
  members: [
    { id: "controller-container", structureType: STRUCTURE_TYPES.container, dx: 0, dy: 0, minRcl: 2, priority: 170, required: false, group: "controller", fallback: "nearController" },
    { id: "controller-link", structureType: STRUCTURE_TYPES.link, dx: 1, dy: 0, minRcl: 5, priority: 165, required: false, group: "controller", fallback: "nearController", rampart: true }
  ],
  roads: [
    { id: "road-1", dx: 0, dy: 1, minRcl: 1, priority: 55 },
    { id: "road-2", dx: 1, dy: 1, minRcl: 1, priority: 54 }
  ]
};

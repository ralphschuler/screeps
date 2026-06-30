import type { StampDefinition } from "../../types";
import { STRUCTURE_TYPES } from "../rcl-plan";

export const LATE_GAME_HEAVY: StampDefinition = {
  id: "LATE_GAME_HEAVY",
  name: "Protected late-game heavy structures",
  members: [
    { id: "power-spawn", structureType: STRUCTURE_TYPES.powerSpawn, dx: 0, dy: 0, minRcl: 8, priority: 205, required: true, group: "lateGame", fallback: "nearStorage", rampart: true },
    { id: "nuker", structureType: STRUCTURE_TYPES.nuker, dx: 2, dy: 0, minRcl: 8, priority: 204, required: true, group: "lateGame", fallback: "protectedFlexible", rampart: true },
    { id: "observer", structureType: STRUCTURE_TYPES.observer, dx: -2, dy: 0, minRcl: 8, priority: 203, required: true, group: "lateGame", fallback: "protectedFlexible", rampart: true }
  ],
  roads: [
    { id: "road-n", dx: 0, dy: -1, minRcl: 8, priority: 70 },
    { id: "road-s", dx: 0, dy: 1, minRcl: 8, priority: 69 },
    { id: "road-w", dx: -1, dy: 0, minRcl: 8, priority: 68 },
    { id: "road-e", dx: 1, dy: 0, minRcl: 8, priority: 67 }
  ]
};

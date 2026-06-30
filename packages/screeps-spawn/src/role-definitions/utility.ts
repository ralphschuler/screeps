import type { RoleSpawnDef } from "./template";
import { createBody } from "./template";

/**
 * Utility roles cover scouting, claiming, engineering, and remote work support.
 */
export const UTILITY_ROLE_DEFINITIONS: Record<string, RoleSpawnDef> = {
  // Utility roles
  scout: {
    role: "scout",
    family: "utility",
    bodies: [createBody([MOVE], 50)],
    priority: 30, // REDUCED from 65 - scouts are expensive CPU-wise, spawn only when truly needed
    maxPerRoom: 1, // REDUCED from 2 - one scout per room is sufficient for intel gathering
    remoteRole: true
  },
  interShardScout: {
    role: "interShardScout",
    family: "utility",
    bodies: [createBody([MOVE], 50)],
    priority: 70,
    maxPerRoom: 1,
    remoteRole: true
  },
  interShardClaimer: {
    role: "interShardClaimer",
    family: "utility",
    bodies: [createBody([CLAIM, MOVE], 650)],
    priority: 80,
    maxPerRoom: 1,
    remoteRole: true
  },
  claimer: {
    role: "claimer",
    family: "utility",
    bodies: [createBody([CLAIM, MOVE], 650), createBody([CLAIM, CLAIM, MOVE, MOVE], 1300)],
    priority: 95,
    maxPerRoom: 6, // Very aggressive growth: handle expansion plus remote reservations
    remoteRole: true
  },
  engineer: {
    role: "engineer",
    family: "utility",
    bodies: [
      createBody([WORK, CARRY, MOVE, MOVE], 250),
      createBody([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 500)
    ],
    priority: 55,
    maxPerRoom: 2,
    remoteRole: false
  },
  remoteWorker: {
    role: "remoteWorker",
    family: "utility",
    bodies: [
      createBody([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 500),
      createBody([WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 750)
    ],
    priority: 45,
    maxPerRoom: 4, // Restored to original value - allows multiple remote workers
    remoteRole: true
  },


};

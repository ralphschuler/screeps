import type { RoleSpawnDef } from "./template";
import { createBody } from "./template";

/**
 * Economy roles sustain local rooms, remotes, and inter-room logistics.
 */
export const ECONOMY_ROLE_DEFINITIONS: Record<string, RoleSpawnDef> = {
  // Economy roles
  larvaWorker: {
    role: "larvaWorker",
    family: "economy",
    bodies: [
      createBody([WORK, CARRY], 150),
      createBody([WORK, CARRY, MOVE], 200),
      createBody([WORK, WORK, CARRY, CARRY, MOVE, MOVE], 400),
      createBody([WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], 600),
      createBody([WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 800)
    ],
    priority: 100,
    maxPerRoom: 3,
    remoteRole: false
  },
  pioneer: {
    role: "pioneer",
    family: "economy",
    bodies: [
      createBody([WORK, CARRY, MOVE], 200),
      createBody([WORK, WORK, CARRY, CARRY, MOVE, MOVE], 400),
      createBody([WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], 550),
      createBody([WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 800)
    ],
    priority: 92,
    maxPerRoom: 3,
    remoteRole: true
  },
  interShardPioneer: {
    role: "interShardPioneer",
    family: "economy",
    bodies: [
      createBody([WORK, CARRY, MOVE, MOVE], 250),
      createBody([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 500)
    ],
    priority: 95,
    maxPerRoom: 3,
    remoteRole: true
  },
  harvester: {
    role: "harvester",
    family: "economy",
    bodies: [
      createBody([WORK, CARRY, MOVE], 200),
      createBody([WORK, WORK, CARRY, MOVE, MOVE], 350),
      createBody([WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE], 550),
      createBody([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE], 750),
      createBody([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE], 1000)
    ],
    priority: 95,
    maxPerRoom: 2,
    remoteRole: false
  },
  hauler: {
    role: "hauler",
    family: "economy",
    bodies: [
      createBody([CARRY, CARRY, MOVE, MOVE], 200),
      createBody([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 400),
      createBody(
        [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        800
      ),
      createBody([...Array(16).fill(CARRY), ...Array(16).fill(MOVE)], 1600)
    ],
    priority: 90,
    maxPerRoom: 2,
    remoteRole: true
  },
  upgrader: {
    role: "upgrader",
    family: "economy",
    bodies: [
      createBody([WORK, CARRY, MOVE], 200),
      createBody([WORK, WORK, WORK, CARRY, MOVE, MOVE], 450),
      createBody([WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 1000),
      createBody(
        [
          WORK,
          WORK,
          WORK,
          WORK,
          WORK,
          WORK,
          WORK,
          WORK,
          WORK,
          WORK,
          WORK,
          WORK,
          CARRY,
          CARRY,
          CARRY,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE
        ],
        1700
      )
    ],
    priority: 85,
    maxPerRoom: 8,
    remoteRole: false
  },
  builder: {
    role: "builder",
    family: "economy",
    bodies: [
      createBody([WORK, CARRY, MOVE, MOVE], 250),
      createBody([WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 650),
      createBody(
        [
          WORK,
          WORK,
          WORK,
          WORK,
          WORK,
          WORK,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE
        ],
        1400
      )
    ],
    priority: 70,
    maxPerRoom: 2,
    remoteRole: false
  },
  queenCarrier: {
    role: "queenCarrier",
    family: "economy",
    bodies: [
      createBody([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], 300),
      createBody([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], 450),
      createBody([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 600),
      createBody(
        [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
        750
      ),
      createBody(
        [
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE
        ],
        900
      )
    ],
    priority: 85,
    maxPerRoom: 2,
    remoteRole: false
  },
  mineralHarvester: {
    role: "mineralHarvester",
    family: "economy",
    bodies: [
      createBody([WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE], 550),
      createBody([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], 850)
    ],
    priority: 65,
    maxPerRoom: 1,
    remoteRole: false
  },
  labTech: {
    role: "labTech",
    family: "economy",
    bodies: [
      createBody([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 400),
      createBody([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 600)
    ],
    priority: 60,
    maxPerRoom: 1,
    remoteRole: false
  },
  factoryWorker: {
    role: "factoryWorker",
    family: "economy",
    bodies: [
      createBody([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 400),
      createBody([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 600)
    ],
    priority: 35,
    maxPerRoom: 1,
    remoteRole: false
  },
  remoteHarvester: {
    role: "remoteHarvester",
    family: "economy",
    bodies: [
      createBody([WORK, WORK, CARRY, MOVE, MOVE, MOVE], 400),
      createBody([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 750),
      createBody(
        [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        1050
      ),
      createBody(
        [
          WORK,
          WORK,
          WORK,
          WORK,
          WORK,
          WORK,
          WORK,
          WORK,
          WORK,
          WORK,
          CARRY,
          CARRY,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE
        ],
        1600
      )
    ],
    priority: 85, // Increased from 75 to prioritize remote income generation after core economy roles
    maxPerRoom: 6, // Higher max since these are distributed across remote rooms
    remoteRole: true
  },
  remoteHauler: {
    role: "remoteHauler",
    family: "economy",
    bodies: [
      createBody([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 400),
      createBody(
        [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        800
      ),
      createBody([...Array(16).fill(CARRY), ...Array(16).fill(MOVE)], 1600)
    ],
    priority: 80, // Increased from 70 to prioritize remote logistics over other economic roles
    maxPerRoom: 6, // Higher max since these are distributed across remote rooms
    remoteRole: true
  },

  interRoomCarrier: {
    role: "interRoomCarrier",
    family: "economy",
    bodies: [
      createBody([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 400),
      createBody([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 600),
      createBody(
        [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        800
      )
    ],
    priority: 90, // High priority to help struggling rooms
    maxPerRoom: 4, // Multiple carriers can be spawned per cluster
    remoteRole: false
  },

  crossShardCarrier: {
    role: "crossShardCarrier",
    family: "economy",
    bodies: [
      createBody([...Array(4).fill(CARRY), ...Array(4).fill(MOVE)], 400),
      createBody([...Array(8).fill(CARRY), ...Array(8).fill(MOVE)], 800),
      createBody([...Array(12).fill(CARRY), ...Array(12).fill(MOVE)], 1200),
      createBody([...Array(16).fill(CARRY), ...Array(16).fill(MOVE)], 1600)
    ],
    priority: 85, // High priority for cross-shard logistics
    maxPerRoom: 6, // Can have multiple carriers for large transfers
    remoteRole: true
  },

};

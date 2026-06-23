import type { RoleSpawnDef } from "./template";
import { createBody } from "./template";

/**
 * Military roles are defensive/offensive templates only; targeting logic stays outside spawn definitions.
 */
export const MILITARY_ROLE_DEFINITIONS: Record<string, RoleSpawnDef> = {
  // Military roles
  guard: {
    role: "guard",
    family: "military",
    bodies: [
      // Minimal: For emergency spawning with low energy
      createBody([TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE], 310),
      // Small: Basic defense capability
      createBody([TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 620),
      // Medium: Balanced defense with ranged support
      createBody(
        [
          TOUGH,
          TOUGH,
          TOUGH,
          TOUGH,
          ATTACK,
          ATTACK,
          ATTACK,
          ATTACK,
          ATTACK,
          ATTACK,
          RANGED_ATTACK,
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
        1070
      ),
      // Large: Strong defender with healing capability
      createBody(
        [
          TOUGH,
          TOUGH,
          TOUGH,
          TOUGH,
          TOUGH,
          TOUGH,
          ATTACK,
          ATTACK,
          ATTACK,
          ATTACK,
          ATTACK,
          ATTACK,
          ATTACK,
          ATTACK,
          RANGED_ATTACK,
          RANGED_ATTACK,
          HEAL,
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
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE
        ],
        1740
      )
    ],
    priority: 65, // Increased from 60 - higher priority for better defense readiness
    maxPerRoom: 4, // Increased from 2 - keep more guards on hand to defend against invaders
    remoteRole: false
  },
  remoteGuard: {
    role: "remoteGuard",
    family: "military",
    bodies: [
      createBody([TOUGH, ATTACK, MOVE, MOVE], 190),
      createBody([TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE], 500),
      createBody(
        [
          TOUGH,
          TOUGH,
          TOUGH,
          ATTACK,
          ATTACK,
          ATTACK,
          ATTACK,
          RANGED_ATTACK,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE
        ],
        880
      )
    ],
    priority: 65, // Reduced from 85 - only spawn when remote rooms actually need defense
    maxPerRoom: 2, // Reduced from 4 - fewer guards per remote room
    remoteRole: true
  },
  healer: {
    role: "healer",
    family: "military",
    bodies: [
      // Minimal: Emergency healer
      createBody([HEAL, MOVE, MOVE], 350),
      // Small: Basic healing support
      createBody([TOUGH, HEAL, HEAL, MOVE, MOVE, MOVE], 620),
      // Medium: Strong healing support
      createBody([TOUGH, TOUGH, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 1240),
      // Large: Powerful healer with durability
      createBody(
        [
          TOUGH,
          TOUGH,
          TOUGH,
          TOUGH,
          HEAL,
          HEAL,
          HEAL,
          HEAL,
          HEAL,
          HEAL,
          HEAL,
          HEAL,
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
        2640
      )
    ],
    priority: 55, // Reduced from 75 - only spawn when actively needed for combat
    maxPerRoom: 1,
    remoteRole: false
  },
  soldier: {
    role: "soldier",
    family: "military",
    bodies: [
      createBody([ATTACK, ATTACK, MOVE, MOVE], 260),
      createBody([ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE], 520),
      createBody(
        [
          TOUGH,
          TOUGH,
          TOUGH,
          TOUGH,
          ATTACK,
          ATTACK,
          ATTACK,
          ATTACK,
          ATTACK,
          ATTACK,
          RANGED_ATTACK,
          RANGED_ATTACK,
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
        1340
      )
    ],
    priority: 50, // Reduced from 70 - offensive units should be spawned on-demand
    maxPerRoom: 1, // Reduced from 2 - one soldier per room
    remoteRole: false
  },
  siegeUnit: {
    role: "siegeUnit",
    family: "military",
    bodies: [
      createBody([WORK, WORK, MOVE, MOVE], 300),
      createBody([TOUGH, TOUGH, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 620),
      createBody(
        [
          TOUGH,
          TOUGH,
          TOUGH,
          TOUGH,
          WORK,
          WORK,
          WORK,
          WORK,
          WORK,
          WORK,
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
        1040
      )
    ],
    priority: 30, // Reduced from 50 - siege units only for planned operations
    maxPerRoom: 1, // Reduced from 2 - siege units are specialized, spawn on-demand
    remoteRole: false
  },
  ranger: {
    role: "ranger",
    family: "military",
    bodies: [
      // Minimal: Emergency ranged defender
      createBody([TOUGH, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE], 360),
      // Small: Basic ranged defense
      createBody([TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE], 570),
      // Medium: Strong ranged attacker
      createBody(
        [
          TOUGH,
          TOUGH,
          TOUGH,
          RANGED_ATTACK,
          RANGED_ATTACK,
          RANGED_ATTACK,
          RANGED_ATTACK,
          RANGED_ATTACK,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE
        ],
        1040
      ),
      // Large: Powerful ranged unit with mobility
      createBody(
        [
          TOUGH,
          TOUGH,
          TOUGH,
          TOUGH,
          RANGED_ATTACK,
          RANGED_ATTACK,
          RANGED_ATTACK,
          RANGED_ATTACK,
          RANGED_ATTACK,
          RANGED_ATTACK,
          RANGED_ATTACK,
          RANGED_ATTACK,
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
        1480
      )
    ],
    priority: 60, // Increased from 55 - higher priority for better defense readiness
    maxPerRoom: 4, // Increased from 2 - keep more rangers on hand for defense
    remoteRole: false
  },
  harasser: {
    role: "harasser",
    family: "military",
    bodies: [
      // Small: Fast, cheap hit-and-run with survivability (1:1 move ratio for speed)
      createBody([TOUGH, ATTACK, RANGED_ATTACK, MOVE, MOVE], 320),
      // Medium: Balanced damage with mobility and durability
      createBody([TOUGH, TOUGH, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE], 640),
      // Large: Maximum harassment potential with healing support
      createBody(
        [
          TOUGH,
          TOUGH,
          TOUGH,
          ATTACK,
          ATTACK,
          ATTACK,
          RANGED_ATTACK,
          RANGED_ATTACK,
          RANGED_ATTACK,
          HEAL,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE
        ],
        1200
      )
    ],
    priority: 40, // Reduced from 60 - harassers for offensive operations only
    maxPerRoom: 1, // Reduced from 3 - one harasser per room, spawn more on-demand
    remoteRole: false
  },

};

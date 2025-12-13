/**
 * Movement Adapter - Wrapper for screeps-cartographer
 *
 * This adapter provides a compatibility layer between our bot's movement API
 * and the screeps-cartographer library. It allows us to replace our custom
 * movement implementation while maintaining existing call sites.
 *
 * Design:
 * - Delegates all movement to screeps-cartographer's moveTo function
 * - Maps our MoveOpts to cartographer's MoveOpts
 * - Provides helper functions that match our existing API
 *
 * Benefits of screeps-cartographer:
 * - Advanced traffic management with priority-based movement
 * - Flexible caching strategies (heap, memory, segments)
 * - Path to closest of multiple targets
 * - Stuck detection and automatic repathing
 * - Enhanced findRoute with intelligent heuristics
 * - Automatic portal tracking and routing
 *
 * @see https://github.com/glitchassassin/screeps-cartographer
 */

import {
  moveTo as cartographerMoveTo,
  preTick as cartographerPreTick,
  reconcileTraffic as cartographerReconcileTraffic,
  clearCachedPath as cartographerClearCachedPath,
  isExit,
  type MoveOpts as CartographerMoveOpts,
  type MoveTarget as CartographerMoveTarget
} from "screeps-cartographer";

// =============================================================================
// Types - Compatibility Layer
// =============================================================================

/**
 * Movement target specification (compatible with our existing API)
 */
export interface MoveTarget {
  pos: RoomPosition;
  range: number;
}

/**
 * Movement options (subset of cartographer's options that we use)
 */
export interface MoveOpts {
  /** Number of ticks to reuse a cached path. Default undefined (cache indefinitely) */
  reusePath?: number;
  /** Number of ticks stuck before repathing. Default 3 */
  repathIfStuck?: number;
  /** Visualize the path */
  visualizePathStyle?: PolyStyle;
  /** Movement priority (higher values win). Default 1 */
  priority?: number;
  /** Enable flee mode */
  flee?: boolean;
  /** Cost for roads. Default 1 */
  roadCost?: number;
  /** Cost for plains. Default 2 */
  plainCost?: number;
  /** Cost for swamps. Default 10 */
  swampCost?: number;
  /** Avoid creeps when pathing. Default false */
  avoidCreeps?: boolean;
  /** Maximum pathfinding operations. Default 2000 */
  maxOps?: number;
  /** Maximum rooms to search. Default 16 */
  maxRooms?: number;
  /** Allow routing through hostile rooms. Default false */
  allowHostileRooms?: boolean;
}

// =============================================================================
// Initialization & Cleanup
// =============================================================================

/**
 * Initialize movement system at the start of each tick.
 * Must be called at the beginning of the main loop.
 */
export function initMovement(): void {
  cartographerPreTick();
}

/**
 * Reconcile traffic at the end of each tick.
 * Must be called at the end of the main loop after all creep movement.
 */
export function finalizeMovement(): void {
  cartographerReconcileTraffic();
}

/**
 * Clear cached path for a creep.
 * Use this when the creep's target changes or state is invalidated.
 */
export function clearMovementCache(creep: Creep | PowerCreep): void {
  cartographerClearCachedPath(creep);
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Map our MoveOpts to cartographer's MoveOpts
 */
function mapOptions(opts?: MoveOpts): CartographerMoveOpts {
  if (!opts) return {};

  const cartographerOpts: CartographerMoveOpts = {
    reusePath: opts.reusePath,
    repathIfStuck: opts.repathIfStuck,
    visualizePathStyle: opts.visualizePathStyle,
    priority: opts.priority,
    flee: opts.flee,
    roadCost: opts.roadCost,
    plainCost: opts.plainCost,
    swampCost: opts.swampCost,
    avoidCreeps: opts.avoidCreeps,
    maxOps: opts.maxOps,
    maxRooms: opts.maxRooms,
    // Map allowHostileRooms to routeCallback
    routeCallback: opts.allowHostileRooms
      ? undefined
      : (roomName: string) => {
          // Block hostile rooms (will be infinity cost)
          // This is a simple implementation - could be enhanced with memory
          const room = Game.rooms[roomName];
          if (room) {
            const hostileTowers = room.find(FIND_HOSTILE_STRUCTURES, {
              filter: s => s.structureType === STRUCTURE_TOWER
            });
            if (hostileTowers.length > 0) {
              return Infinity;
            }
          }
          return undefined; // Use default costs
        }
  };

  return cartographerOpts;
}

// =============================================================================
// Movement Functions
// =============================================================================

/**
 * Move a creep or power creep to a target position or object.
 *
 * @param creep - The creep or power creep to move
 * @param target - Target position or object with pos property
 * @param opts - Optional movement options
 * @returns The result of the movement action
 */
export function moveCreep(
  creep: Creep | PowerCreep,
  target: RoomPosition | RoomObject,
  opts?: MoveOpts
): CreepMoveReturnCode | -2 | -5 | -7 | -10 {
  const targetPos = target instanceof RoomPosition ? target : target.pos;
  return cartographerMoveTo(creep, targetPos, mapOptions(opts));
}

/**
 * Move a creep to a specific room.
 *
 * @param creep - The creep or power creep to move
 * @param roomName - The destination room name
 * @param opts - Optional movement options
 * @returns The result of the movement action
 */
export function moveToRoom(
  creep: Creep | PowerCreep,
  roomName: string,
  opts?: MoveOpts
): CreepMoveReturnCode | -2 | -5 | -7 | -10 {
  // Already in target room
  if (creep.pos.roomName === roomName) {
    return OK;
  }

  const targetPos = new RoomPosition(25, 25, roomName);
  const cartographerOpts = mapOptions(opts);
  cartographerOpts.maxRooms = cartographerOpts.maxRooms ?? 16;

  return cartographerMoveTo(creep, { pos: targetPos, range: 20 }, cartographerOpts);
}

/**
 * Move a creep away from a set of positions (flee behavior).
 *
 * @param creep - The creep to move
 * @param threats - Array of positions to flee from
 * @param range - How far to stay away from threats (default 10)
 * @param opts - Optional movement options
 * @returns The result of the movement action
 */
export function fleeFrom(
  creep: Creep | PowerCreep,
  threats: RoomPosition[],
  range = 10,
  opts?: Omit<MoveOpts, "flee">
): CreepMoveReturnCode | -2 | -5 | -7 | -10 {
  if (threats.length === 0) {
    return OK;
  }

  const fleeOpts = mapOptions(opts);
  fleeOpts.flee = true;

  // Convert threats to MoveTargets with the specified range
  const targets: CartographerMoveTarget[] = threats.map(pos => ({ pos, range }));

  return cartographerMoveTo(creep, targets, fleeOpts);
}

/**
 * Check if a creep is on a room exit tile.
 *
 * @param creep - The creep or power creep to check
 * @returns true if the creep is on a room exit tile
 */
export function isCreepOnRoomExit(creep: Creep | PowerCreep): boolean {
  return isExit(creep.pos);
}

/**
 * Move a creep off a room exit tile.
 * This is handled automatically by cartographer's traffic management,
 * but we provide this for compatibility.
 *
 * @param creep - The creep or power creep to move
 * @param opts - Optional movement options
 * @returns true if the creep was on an exit and a move was issued
 */
export function moveOffRoomExit(creep: Creep | PowerCreep, opts?: MoveOpts): boolean {
  if (!isExit(creep.pos)) {
    return false;
  }

  // Move toward room center
  const roomCenter = new RoomPosition(25, 25, creep.pos.roomName);
  const moveOpts = mapOptions(opts);
  moveOpts.priority = (moveOpts.priority ?? 1) + 1; // Higher priority

  cartographerMoveTo(creep, roomCenter, moveOpts);
  return true;
}

/**
 * Move a creep away from spawn if it's blocking.
 *
 * @param creep - The creep or power creep to move
 * @param range - Range from spawn to consider as "blocking" (default 1)
 * @param opts - Optional movement options
 * @returns true if the creep was near a spawn and a move was issued
 */
export function moveAwayFromSpawn(creep: Creep | PowerCreep, range = 1, opts?: MoveOpts): boolean {
  const room = Game.rooms[creep.pos.roomName];
  if (!room) return false;

  // Find nearby spawns
  const spawns = room.find(FIND_MY_SPAWNS);
  const nearbySpawn = spawns.find(spawn => creep.pos.inRangeTo(spawn.pos, range));

  if (!nearbySpawn) return false;

  // Move away from spawn (toward room center as a fallback)
  const roomCenter = new RoomPosition(25, 25, creep.pos.roomName);
  const moveOpts = mapOptions(opts);
  moveOpts.priority = (moveOpts.priority ?? 1) + 1; // Higher priority
  moveOpts.flee = true; // Flee from spawn

  cartographerMoveTo(creep, { pos: nearbySpawn.pos, range: range + 2 }, moveOpts);
  return true;
}

// =============================================================================
// Traffic Visualization
// =============================================================================

/**
 * Visualize traffic flow in a room.
 * Note: Cartographer has its own visualization that can be enabled in reconcileTraffic.
 * This function is provided for compatibility but delegates to cartographer.
 *
 * @param roomName - Room to visualize
 * @param showPriorities - Whether to show priority numbers (default false)
 */
export function visualizeTraffic(roomName: string, showPriorities = false): void {
  // Cartographer handles visualization internally via reconcileTraffic({ visualize: true })
  // We could add a flag to enable this, but for now, this is a no-op for compatibility
  // Users should call reconcileTraffic({ visualize: true }) directly if they want visualization
}

// =============================================================================
// Note: Additional Functions Not Needed
// =============================================================================
// The following functions from our old movement.ts are not needed with cartographer:
// - pushCreep, pushCreepsAway, pushCreepInDirection: Handled by traffic management
// - findPortalsInRoom, findPortalPathToShard, moveToShard: Cartographer handles portals automatically
// - All internal path caching and cost matrix functions: Handled by cartographer

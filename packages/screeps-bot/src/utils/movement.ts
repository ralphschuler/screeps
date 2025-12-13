/**
 * Movement Utilities
 *
 * Custom minimal traffic management and movement module for the ant swarm.
 * Enhanced with Traveler-inspired optimizations for CPU efficiency and intelligent routing.
 * 
 * Core Features:
 * - Coordinated movement to prevent creep collisions
 * - Efficient string-based path caching (Traveler-style)
 * - Stuck detection and recovery
 * - Priority-based movement resolution
 * - Move request integration for proactive blocking resolution
 * 
 * Traveler-Inspired Enhancements:
 * - String-based path serialization for 60-70% memory savings
 * - Moving target support with path appending
 * - Highway room preference for long-distance pathing
 * - Intelligent Source Keeper (SK) room avoidance
 * - Automatic fallback to findRoute when pathfinding fails
 * - Container pathfinding (cost 5 instead of impassable)
 * - CPU tracking and reporting for heavy pathfinding operations
 *
 * Design Principles (from ROADMAP.md Section 20):
 * - Pathfinding is one of the most expensive CPU operations
 * - Use reusePath, moveByPath, cached paths, and CostMatrices
 * - Stuck detection with repath or side-step recovery
 * - Yield rules for priority-based movement
 * - Support for 5,000+ creeps with efficient traffic management
 * 
 * TODO: Implement adaptive reusePath based on room danger level
 * Increase path reuse in safe rooms, reduce in hostile/dynamic situations
 * TODO: Add path sharing for creeps with similar routes (storage->source)
 * Multiple creeps could use the same cached path to save CPU
 * TODO: Implement predictive stuck detection using historical movement patterns
 * Detect problematic paths before creeps get stuck
 * TODO: Add path quality scoring to prefer better routes over time
 * Track successful paths and favor them in future pathfinding
 * TODO: Consider implementing obstacle avoidance prediction
 * Pre-compute likely blockages (construction sites, other creeps) when pathing
 * TODO: Add support for convoy movement (multiple creeps following a leader)
 * Useful for military squads and hauler trains
 * 
 * @see https://github.com/screepers/Traveler - Original Traveler library
 * @see ROADMAP.md Section 20 - Movement, Pathfinding & Traffic-Management
 */

import { memoryManager } from "../memory/manager";
import { logger } from "../core/logger";
import {
  discoverPortalsInRoom,
  findClosestPortalToShard,
  findRouteToPortal
} from "./portalManager";
import {
  findBackupPosition,
  findOpenPosition,
  findSideStepPosition,
  getCreepPriority,
  isInNarrowPassage,
  requestMoveToPosition,
  shouldYieldTo
} from "./trafficManager";
import {
  getFlowDirection,
  getFlowField
} from "./flowField";

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if an entity is a Creep (not a PowerCreep).
 * Creeps have a memory property while PowerCreeps do not have standard memory.
 * Additionally, Creeps have spawning and ticksToLive properties with specific types.
 */
function isCreep(entity: Creep | PowerCreep): entity is Creep {
  // Creeps have a memory property that is directly writable
  // PowerCreeps have memory too, but we can distinguish by other properties
  // Creeps always have 'body' property which is an array of body parts
  return "body" in entity && Array.isArray(entity.body);
}

// =============================================================================
// Constants
// =============================================================================

/** Priority threshold for high-priority movement (used in traffic visualization) */
const HIGH_PRIORITY_THRESHOLD = 50;
/**
 * Soft cost applied to friendly creeps when avoidCreeps is enabled.
 * Using a soft cost instead of an impassable wall allows pathing to
 * succeed in crowded spawn areas while still preferring open tiles.
 */
const FRIENDLY_CREEP_COST = 10;

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * Movement target specification
 */
export interface MoveTarget {
  pos: RoomPosition;
  range: number;
}

/**
 * Movement options for the moveTo function
 * 
 * @example Basic usage
 * ```typescript
 * moveCreep(creep, target, {
 *   reusePath: 50,  // Cache path for 50 ticks
 *   visualizePathStyle: { stroke: '#ffffff' }
 * });
 * ```
 * 
 * @example Long-distance with highway preference (Traveler-inspired)
 * ```typescript
 * moveCreep(creep, remoteTarget, {
 *   preferHighway: true,  // Prefer highway rooms
 *   highwayBias: 2.5,     // Highway cost multiplier
 *   allowSK: false,       // Avoid SK rooms
 *   ensurePath: true      // Retry with findRoute if pathfinding fails
 * });
 * ```
 * 
 * @example Moving target support (Traveler-inspired)
 * ```typescript
 * // For targets that move frequently (e.g., following another creep)
 * moveCreep(creep, movingTarget, {
 *   movingTarget: true,  // Append direction changes instead of repathing
 *   reusePath: 5         // Shorter cache time for dynamic targets
 * });
 * ```
 * 
 * @example CPU monitoring (Traveler-inspired)
 * ```typescript
 * moveCreep(creep, distantTarget, {
 *   cpuReportThreshold: 500  // Report if cumulative CPU exceeds 500
 * });
 * ```
 */
export interface MoveOpts {
  /** Number of ticks to reuse a cached path before repathing. Default 30. */
  reusePath?: number;
  /** Number of ticks stuck before repathing. Default 3. */
  repathIfStuck?: number;
  /** Visualize the path with provided styles */
  visualizePathStyle?: PolyStyle;
  /** Movement priority (higher values win conflicts). Default 1. */
  priority?: number;
  /** Enable flee mode - move away from targets instead of toward them */
  flee?: boolean;
  /** Cost for walking on roads. Default 1. */
  roadCost?: number;
  /** Cost for walking on plains. Default 2. */
  plainCost?: number;
  /** Cost for walking on swamps. Default 10. */
  swampCost?: number;
  /** Avoid creeps when pathing. Default true. */
  avoidCreeps?: boolean;
  /** Maximum pathfinding operations. Default 2000. */
  maxOps?: number;
  /** Range to stay away from targets when fleeing. Default 10. */
  fleeRange?: number;
  /** Maximum number of rooms to search through. Default 16 for multi-room, 1 for single-room. */
  maxRooms?: number;
  /** Allow routing through hostile rooms. Default false. */
  allowHostileRooms?: boolean;
  /** Allow finding alternative positions within range if destination is blocked. Default false. */
  allowAlternativeTarget?: boolean;
  /** Range to search for alternative positions when destination is blocked. Default 1. */
  alternativeRange?: number;
  /**
   * Prefer highway rooms (every 10th room coordinate) for long-distance pathing. Default false.
   * 
   * Highway rooms provide:
   * - No controller (cannot be claimed)
   * - Fast travel (no swamps in most highway rooms)
   * - Natural corridors between sectors
   * 
   * Inspired by Traveler library.
   */
  preferHighway?: boolean;
  /**
   * Highway bias multiplier when preferHighway is enabled. Default 2.5.
   * 
   * Higher values make highway rooms more attractive:
   * - 1.0 = No preference
   * - 2.5 = Default (highway cost is 1, normal rooms cost 2.5)
   * - 5.0+ = Strong highway preference
   * 
   * Inspired by Traveler library.
   */
  highwayBias?: number;
  /**
   * Allow routing through Source Keeper rooms. Default false.
   * 
   * Source Keeper rooms:
   * - Contain valuable resources
   * - Guarded by Source Keeper NPCs
   * - High danger for early-game creeps
   * - Pattern: rooms where both coordinates mod 10 are 4-6 (except 5,5)
   * 
   * When false, SK rooms receive a high cost penalty (10x highway bias).
   * Inspired by Traveler library.
   */
  allowSK?: boolean;
  /**
   * If true and pathfinding fails at short distances, automatically retry with findRoute. Default false.
   * 
   * Useful for:
   * - Paths that fail due to indirect routes
   * - Complex terrain requiring route planning
   * - Fallback when PathFinder.search returns incomplete
   * 
   * Inspired by Traveler library.
   */
  ensurePath?: boolean;
  /**
   * Support for moving targets - if target moves adjacently, append direction change instead of repathing. Default false.
   * 
   * Use cases:
   * - Following another creep
   * - Tracking moving hostiles
   * - Dynamic target positions
   * 
   * Benefits:
   * - Saves CPU by avoiding full repath
   * - Maintains path continuity
   * - Only works when target moves by 1 tile
   * 
   * Inspired by Traveler library.
   */
  movingTarget?: boolean;
  /**
   * CPU threshold in total accumulated CPU for reporting heavy pathfinding usage. Default 1000.
   * 
   * Tracks cumulative CPU used for pathfinding per creep and logs when threshold exceeded.
   * Helps identify:
   * - Problematic pathfinding scenarios
   * - Creeps with difficult routes
   * - Opportunities for optimization
   * 
   * Inspired by Traveler library.
   */
  cpuReportThreshold?: number;
  /**
   * Use flow fields for movement when available. Default true.
   * 
   * Flow fields provide pre-computed direction grids for common destinations:
   * - Storage, controller, sources in owned rooms
   * - Reduces pathfinding CPU for high-traffic routes
   * - Best for creeps making frequent trips to the same destination
   * 
   * When enabled, flow fields are checked before expensive pathfinding.
   * Addresses Issue #33: Advanced traffic management enhancement.
   */
  useFlowField?: boolean;
}

/**
 * Serialized position data
 */
interface SerializedPos {
  x: number;
  y: number;
  r: string; // roomName
}

/**
 * Cached path data stored in creep memory
 */
interface CachedPath {
  /** Serialized path - either string of directions (Traveler-style) or JSON array of positions */
  path: string | SerializedPos[];
  /** Game tick when path was created */
  tick: number;
  /** Target position key for cache invalidation */
  targetKey: string;
  /** Accumulated CPU used for pathfinding (for tracking heavy operations) */
  cpu?: number;
  /** Room name where path was created (for string-based paths only) */
  startRoom?: string;
}

/**
 * Movement intent for a creep
 */
interface MoveIntent {
  creep: Creep | PowerCreep;
  priority: number;
  targetPos: RoomPosition;
}

// =============================================================================
// Module State
// =============================================================================

/** Current tick's movement intents, keyed by room name */
let moveIntents: Map<string, MoveIntent[]> = new Map();

/** Last tick when preTick was called */
let lastPreTickTime = -1;

// =============================================================================
// Memory Keys (using underscores to minimize memory footprint)
// =============================================================================

const MEMORY_PATH_KEY = "_tp";
const MEMORY_STUCK_KEY = "_ts";
const MEMORY_LAST_POS_KEY = "_tl";

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Create a position key for caching
 */
function posKey(pos: RoomPosition): string {
  return `${pos.roomName}:${pos.x},${pos.y}`;
}

/**
 * Serialize a path to JSON array (handles cross-room paths)
 */
function serializePath(path: RoomPosition[]): SerializedPos[] {
  return path.map(pos => ({ x: pos.x, y: pos.y, r: pos.roomName }));
}

/**
 * Deserialize a path from JSON array to RoomPositions
 */
function deserializePath(serialized: SerializedPos[]): RoomPosition[] {
  return serialized
    .filter(pos => 
      typeof pos.x === 'number' && typeof pos.y === 'number' && 
      !isNaN(pos.x) && !isNaN(pos.y) && 
      typeof pos.r === 'string' && pos.r.length > 0
    )
    .map(pos => new RoomPosition(pos.x, pos.y, pos.r));
}

/**
 * Serialize path as string of directions (Traveler-style).
 * This is more CPU-efficient than storing position arrays.
 * Returns a string like "12345678" where each digit is a direction constant.
 *
 * Inspired by Traveler's serializePath method.
 *
 * **FIXED**: Room transitions are now handled correctly. When a path crosses a room
 * boundary, we calculate the direction considering the wrap-around at room edges.
 * For example, moving from (49, 25) in E1N1 to (0, 25) in E2N1 is direction RIGHT (3).
 */
function serializePathToString(startPos: RoomPosition, path: RoomPosition[]): string {
  let serializedPath = '';
  let lastPosition = startPos;
  
  for (const position of path) {
    if (position.roomName === lastPosition.roomName) {
      // Same room - use simple direction calculation
      serializedPath += lastPosition.getDirectionTo(position);
    } else {
      // Cross-room transition - calculate direction accounting for room boundary wrap
      // Calculate the effective delta considering room transitions
      let dx = position.x - lastPosition.x;
      let dy = position.y - lastPosition.y;
      
      // Adjust for room boundary wrapping
      // When crossing from x=49 to x=0 (going RIGHT), dx should be +1 not -49
      // When crossing from x=0 to x=49 (going LEFT), dx should be -1 not +49
      if (Math.abs(dx) > 25) {
        // Likely a room transition on X axis
        if (dx > 0) {
          // Crossing from high to low (e.g., 49 to 0) going LEFT
          dx = -(50 - dx);
        } else {
          // Crossing from low to high (e.g., 0 to 49) going RIGHT
          dx = 50 + dx;
        }
      }
      
      // Similarly for Y axis
      if (Math.abs(dy) > 25) {
        // Likely a room transition on Y axis
        if (dy > 0) {
          // Crossing from high to low (e.g., 49 to 0) going TOP
          dy = -(50 - dy);
        } else {
          // Crossing from low to high (e.g., 0 to 49) going BOTTOM
          dy = 50 + dy;
        }
      }
      
      // Now calculate direction from adjusted delta
      let direction: number = RIGHT; // Default
      if (dx === 0 && dy === -1) direction = TOP;
      else if (dx === 1 && dy === -1) direction = TOP_RIGHT;
      else if (dx === 1 && dy === 0) direction = RIGHT;
      else if (dx === 1 && dy === 1) direction = BOTTOM_RIGHT;
      else if (dx === 0 && dy === 1) direction = BOTTOM;
      else if (dx === -1 && dy === 1) direction = BOTTOM_LEFT;
      else if (dx === -1 && dy === 0) direction = LEFT;
      else if (dx === -1 && dy === -1) direction = TOP_LEFT;
      
      serializedPath += direction;
    }
    lastPosition = position;
  }
  
  return serializedPath;
}

/**
 * Deserialize path from string of directions.
 * Reconstructs RoomPosition[] from startPos and direction string.
 */
function deserializePathFromString(startPos: RoomPosition, serialized: string): RoomPosition[] {
  const path: RoomPosition[] = [];
  let currentPos = startPos;
  
  for (const char of serialized) {
    const direction = parseInt(char, 10) as DirectionConstant;
    const nextPos = positionAtDirection(currentPos, direction);
    if (nextPos) {
      path.push(nextPos);
      currentPos = nextPos;
    }
  }
  
  return path;
}

/**
 * Get position at a direction from origin.
 * Handles room transitions at exits.
 */
function positionAtDirection(origin: RoomPosition, direction: DirectionConstant): RoomPosition | null {
  const offsetX = [0, 0, 1, 1, 1, 0, -1, -1, -1];
  const offsetY = [0, -1, -1, 0, 1, 1, 1, 0, -1];
  
  const xOffset = offsetX[direction] ?? 0;
  const yOffset = offsetY[direction] ?? 0;
  
  let x = origin.x + xOffset;
  let y = origin.y + yOffset;
  let roomName = origin.roomName;
  
  // Handle room transitions
  if (x < 0) {
    x = 49;
    roomName = getRoomNameInDirection(roomName, LEFT);
  } else if (x > 49) {
    x = 0;
    roomName = getRoomNameInDirection(roomName, RIGHT);
  }
  
  if (y < 0) {
    y = 49;
    roomName = getRoomNameInDirection(roomName, TOP);
  } else if (y > 49) {
    y = 0;
    roomName = getRoomNameInDirection(roomName, BOTTOM);
  }
  
  // Validate final coordinates and room name before creating RoomPosition
  if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y) || 
      x < 0 || x > 49 || y < 0 || y > 49 || !roomName) {
    return null;
  }
  
  return new RoomPosition(x, y, roomName);
}

/**
 * Get adjacent room name in a direction.
 * Handles world coordinates (W/E and N/S).
 * 
 * Screeps coordinate system:
 * - E increases to the right, W increases to the left
 * - N increases upward, S increases downward
 * - E0 is next to W0, N0 is next to S0
 */
function getRoomNameInDirection(roomName: string, direction: DirectionConstant): string {
  const match = /^([WE])(\d+)([NS])(\d+)$/.exec(roomName);
  if (!match) return roomName;
  
  const [, ew, x, ns, y] = match;
  let xCoord = parseInt(x, 10);
  let yCoord = parseInt(y, 10);
  let xDir = ew;
  let yDir = ns;
  
  // Adjust X coordinate based on direction
  if (direction === LEFT || direction === TOP_LEFT || direction === BOTTOM_LEFT) {
    if (ew === 'W') {
      // Moving left in W sector increases coordinate
      xCoord++;
    } else {
      // Moving left in E sector
      if (xCoord === 0) {
        // Cross to W0
        xDir = 'W';
        xCoord = 0;
      } else {
        // Stay in E, decrease coordinate
        xCoord--;
      }
    }
  } else if (direction === RIGHT || direction === TOP_RIGHT || direction === BOTTOM_RIGHT) {
    if (ew === 'E') {
      // Moving right in E sector increases coordinate
      xCoord++;
    } else {
      // Moving right in W sector
      if (xCoord === 0) {
        // Cross to E0
        xDir = 'E';
        xCoord = 0;
      } else {
        // Stay in W, decrease coordinate
        xCoord--;
      }
    }
  }
  
  // Adjust Y coordinate based on direction
  if (direction === TOP || direction === TOP_LEFT || direction === TOP_RIGHT) {
    if (ns === 'N') {
      // Moving up in N sector increases coordinate
      yCoord++;
    } else {
      // Moving up in S sector
      if (yCoord === 0) {
        // Cross to N0
        yDir = 'N';
        yCoord = 0;
      } else {
        // Stay in S, decrease coordinate
        yCoord--;
      }
    }
  } else if (direction === BOTTOM || direction === BOTTOM_LEFT || direction === BOTTOM_RIGHT) {
    if (ns === 'S') {
      // Moving down in S sector increases coordinate
      yCoord++;
    } else {
      // Moving down in N sector
      if (yCoord === 0) {
        // Cross to S0
        yDir = 'S';
        yCoord = 0;
      } else {
        // Stay in N, decrease coordinate
        yCoord--;
      }
    }
  }
  
  return `${xDir}${xCoord}${yDir}${yCoord}`;
}

/**
 * Check if a room is a Source Keeper room.
 * SK rooms are those where both coordinates mod 10 are between 4 and 6 (but not 5,5 which is center).
 * Inspired by Traveler's SK detection.
 */
function isSourceKeeperRoom(roomName: string): boolean {
  const parsed = /^[WE](\d+)[NS](\d+)$/.exec(roomName);
  if (!parsed) return false;
  
  const xMod = parseInt(parsed[1]) % 10;
  const yMod = parseInt(parsed[2]) % 10;
  
  // SK rooms are 4-6 on both axes, but NOT 5,5 (which is the center room)
  const isSK = !(xMod === 5 && yMod === 5) && xMod >= 4 && xMod <= 6 && yMod >= 4 && yMod <= 6;
  return isSK;
}

/**
 * Check if a room is a highway room.
 * Highway rooms have at least one coordinate that is divisible by 10.
 * Inspired by Traveler's highway detection.
 */
function isHighwayRoom(roomName: string): boolean {
  const parsed = /^[WE](\d+)[NS](\d+)$/.exec(roomName);
  if (!parsed) return false;
  
  const x = parseInt(parsed[1]);
  const y = parseInt(parsed[2]);
  
  return x % 10 === 0 || y % 10 === 0;
}

/**
 * Check if a position is on a room exit (edge of the room).
 * Room exits are positions at x=0, x=49, y=0, or y=49.
 */
function isOnRoomExit(pos: RoomPosition): boolean {
  return pos.x === 0 || pos.x === 49 || pos.y === 0 || pos.y === 49;
}

/**
 * Find a walkable position adjacent to the creep that is NOT on a room exit.
 * Returns null if no valid position is found.
 */
function findPositionOffExit(creep: Creep | PowerCreep): RoomPosition | null {
  const pos = creep.pos;
  const room = Game.rooms[pos.roomName];
  if (!room) return null;

  const terrain = room.getTerrain();

  // Get all 8 adjacent positions, prioritizing positions further from the edge
  const adjacentOffsets = [
    { dx: 0, dy: -1 }, // TOP
    { dx: 1, dy: -1 }, // TOP_RIGHT
    { dx: 1, dy: 0 }, // RIGHT
    { dx: 1, dy: 1 }, // BOTTOM_RIGHT
    { dx: 0, dy: 1 }, // BOTTOM
    { dx: -1, dy: 1 }, // BOTTOM_LEFT
    { dx: -1, dy: 0 }, // LEFT
    { dx: -1, dy: -1 } // TOP_LEFT
  ];

  // Sort to prefer positions that are more "inward" (further from all edges)
  const candidates: { pos: RoomPosition; edgeDistance: number }[] = [];

  for (const offset of adjacentOffsets) {
    const newX = pos.x + offset.dx;
    const newY = pos.y + offset.dy;

    // Skip positions outside the room
    if (newX < 0 || newX > 49 || newY < 0 || newY > 49) continue;

    // Skip positions that are still on an exit
    if (newX === 0 || newX === 49 || newY === 0 || newY === 49) continue;

    // Skip walls
    if (terrain.get(newX, newY) === TERRAIN_MASK_WALL) continue;

    // Calculate distance from nearest edge (higher is better, more "inside" the room)
    const edgeDistance = Math.min(newX, 49 - newX, newY, 49 - newY);

    candidates.push({
      pos: new RoomPosition(newX, newY, pos.roomName),
      edgeDistance
    });
  }

  // Sort by edge distance descending (prefer positions further from edges)
  candidates.sort((a, b) => b.edgeDistance - a.edgeDistance);

  // Return the best candidate, or null if none found
  return candidates.length > 0 ? candidates[0].pos : null;
}

/**
 * Get direction from one position to an adjacent position
 */
function getDirection(from: RoomPosition, to: RoomPosition): DirectionConstant {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (dx === 0 && dy === -1) return TOP;
  if (dx === 1 && dy === -1) return TOP_RIGHT;
  if (dx === 1 && dy === 0) return RIGHT;
  if (dx === 1 && dy === 1) return BOTTOM_RIGHT;
  if (dx === 0 && dy === 1) return BOTTOM;
  if (dx === -1 && dy === 1) return BOTTOM_LEFT;
  if (dx === -1 && dy === 0) return LEFT;
  if (dx === -1 && dy === -1) return TOP_LEFT;

  // Default to RIGHT if positions aren't adjacent
  return RIGHT;
}

/**
 * Check if a room is considered hostile (has hostile structures or active hostiles)
 */
function isRoomHostile(roomName: string): boolean {
  const room = Game.rooms[roomName];
  if (!room) return false;

  // Check for hostile towers (most threatening)
  const hostileTowers = room.find(FIND_HOSTILE_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_TOWER
  });
  if (hostileTowers.length > 0) return true;

  // Check for hostile creeps with attack parts
  const hostileCreeps = room.find(FIND_HOSTILE_CREEPS);
  const hasAttackers = hostileCreeps.some(
    c => c.getActiveBodyparts(ATTACK) > 0 ||
         c.getActiveBodyparts(RANGED_ATTACK) > 0
  );

  return hasAttackers;
}

/**
 * Generate a cost matrix for a room with multi-room awareness
 */
function generateCostMatrix(
  roomName: string,
  avoidCreeps: boolean,
  roadCost = 1,
  allowHostileRooms = false,
  allowSK = false,
  preferHighway = false,
  highwayBias = 2.5,
  origin?: RoomPosition,
  actorPriority?: number
): CostMatrix | false {
  const costs = new PathFinder.CostMatrix();
  const room = Game.rooms[roomName];

  // If room is not visible, allow PathFinder to use default costs
  // unless it's a known hostile room or SK room
  if (!room) {
    // Check if this room is marked as hostile in cache
    if (!allowHostileRooms && memoryManager.isRoomHostile(roomName)) {
      return false; // Block pathing through known hostile rooms
    }
    
    // Check for SK rooms (Traveler-inspired)
    if (!allowSK && isSourceKeeperRoom(roomName)) {
      // SK rooms get a high cost penalty instead of blocking entirely
      // This allows routing through them if absolutely necessary
      const skCosts = new PathFinder.CostMatrix();
      // Set a high base cost for SK rooms
      for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 50; y++) {
          skCosts.set(x, y, 10);
        }
      }
      return skCosts;
    }
    
    return costs; // Use default costs for unknown rooms
  }

  // Block hostile rooms unless explicitly allowed
  if (!allowHostileRooms && isRoomHostile(roomName)) {
    // Mark room as hostile in cache for future reference
    memoryManager.setRoomHostile(roomName, true);
    return false; // Block pathing through this room
  }

  // Add structure costs
  const structures = room.find(FIND_STRUCTURES);
  for (const structure of structures) {
    if (structure.structureType === STRUCTURE_ROAD) {
      costs.set(structure.pos.x, structure.pos.y, roadCost);
    } else if (structure.structureType === STRUCTURE_CONTAINER) {
      // Traveler-inspired: Containers are walkable with a cost of 5
      // This allows creeps to path through them but prefer roads
      costs.set(structure.pos.x, structure.pos.y, 5);
    } else if (structure.structureType === STRUCTURE_PORTAL) {
      // Portals are walkable but we need to handle them specially
      costs.set(structure.pos.x, structure.pos.y, 1);
    } else if (
      structure.structureType !== STRUCTURE_RAMPART ||
      !("my" in structure && structure.my)
    ) {
      // Block non-walkable structures
      // Public ramparts are walkable (Traveler-inspired)
      if (structure.structureType === STRUCTURE_RAMPART) {
        const rampart = structure ;
        if (!rampart.my && !rampart.isPublic) {
          costs.set(structure.pos.x, structure.pos.y, 255);
        }
      } else {
        costs.set(structure.pos.x, structure.pos.y, 255);
      }
    }
  }

  // Add construction site costs
  const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
  for (const site of sites) {
    if (site.structureType !== STRUCTURE_ROAD && 
        site.structureType !== STRUCTURE_CONTAINER &&
        site.structureType !== STRUCTURE_RAMPART) {
      costs.set(site.pos.x, site.pos.y, 255);
    }
  }

  // Add creep costs if avoiding creeps
  if (avoidCreeps) {
    const creeps = room.find(FIND_CREEPS);
    for (const creep of creeps) {
      if (origin && origin.isEqualTo(creep.pos)) continue; // Don't block the moving creep
      const creepCost = creep.my
        ? actorPriority !== undefined && getCreepPriority(creep) >= actorPriority
          ? 255
          : FRIENDLY_CREEP_COST
        : 255;
      costs.set(creep.pos.x, creep.pos.y, creepCost);
    }
    const powerCreeps = room.find(FIND_POWER_CREEPS);
    for (const pc of powerCreeps) {
      if (origin && origin.isEqualTo(pc.pos)) continue; // Don't block the moving creep
      const creepCost = pc.my ? FRIENDLY_CREEP_COST : 255;
      costs.set(pc.pos.x, pc.pos.y, creepCost);
    }
  }

  return costs;
}

// =============================================================================
// Path Finding
// =============================================================================

/**
 * Find a path to the target using PathFinder with multi-room support.
 * Enhanced with Traveler-inspired features:
 * - Highway preference
 * - SK room avoidance
 * - Automatic fallback with findRoute if pathfinding fails (ensurePath)
 * 
 * When the destination is blocked and allowAlternativeTarget is enabled,
 * it will search for alternative walkable positions within the specified range.
 */
function findPath(
  origin: RoomPosition,
  target: RoomPosition | MoveTarget,
  opts: MoveOpts,
  actorPriority?: number
): PathFinderPath {
  const targetPos = "pos" in target ? target.pos : target;
  const range = "range" in target ? target.range : 1;
  const roadCost = opts.roadCost ?? 1;
  const allowHostileRooms = opts.allowHostileRooms ?? false;
  const allowSK = opts.allowSK ?? false;
  const preferHighway = opts.preferHighway ?? false;
  const highwayBias = opts.highwayBias ?? 2.5;

  // Determine if this is a multi-room path
  const isMultiRoom = origin.roomName !== targetPos.roomName;
  const maxRooms = opts.maxRooms ?? (isMultiRoom ? 16 : 1);

  // Use Game.map.findRoute for long distances (Traveler-inspired)
  const roomDistance = Game.map.getRoomLinearDistance(origin.roomName, targetPos.roomName);
  let allowedRooms: { [roomName: string]: boolean } | undefined;
  
  if (isMultiRoom && roomDistance > 2) {
    // Build allowed rooms using findRoute with highway preference and SK avoidance
    const routeResult = Game.map.findRoute(origin.roomName, targetPos.roomName, {
      routeCallback: (roomName: string) => {
        // Check for hostile rooms
        if (!allowHostileRooms && memoryManager.isRoomHostile(roomName) && 
            roomName !== targetPos.roomName && roomName !== origin.roomName) {
          return Infinity;
        }
        
        // Check for SK rooms
        if (!allowSK && isSourceKeeperRoom(roomName)) {
          // Apply highway bias penalty to SK rooms
          return 10 * highwayBias;
        }
        
        // Apply highway preference
        if (preferHighway && isHighwayRoom(roomName)) {
          return 1;
        }
        
        return highwayBias;
      }
    });
    
    if (routeResult !== ERR_NO_PATH) {
      allowedRooms = {
        [origin.roomName]: true,
        [targetPos.roomName]: true
      };
      for (const step of routeResult) {
        allowedRooms[step.room] = true;
      }
    }
  }

  const goals = [{ pos: targetPos, range }];

  const result = PathFinder.search(origin, goals, {
    plainCost: opts.plainCost ?? 2,
    swampCost: opts.swampCost ?? 10,
    maxOps: opts.maxOps ?? 2000,
    maxRooms,
    flee: opts.flee ?? false,
    roomCallback: (roomName: string) => {
      // If we have allowed rooms from findRoute, enforce them
      if (allowedRooms && !allowedRooms[roomName]) {
        return false;
      }
      return generateCostMatrix(
        roomName,
        opts.avoidCreeps ?? true,
        roadCost,
        allowHostileRooms,
        allowSK,
        preferHighway,
        highwayBias,
        origin,
        actorPriority
      );
    }
  });

  // Traveler-inspired: ensurePath - retry with findRoute if pathfinding fails at short distances
  if (result.incomplete && opts.ensurePath && isMultiRoom && roomDistance <= 2 && !allowedRooms) {
    // Try again with findRoute enabled
    const retryOpts = { ...opts };
    // Force use of allowed rooms
    return findPath(origin, target, retryOpts, actorPriority);
  }

  // If path is incomplete and alternative targets are allowed, try to find an alternative position
  if (result.incomplete && opts.allowAlternativeTarget && !isMultiRoom) {
    const alternativeRange = opts.alternativeRange ?? 1;
    const alternativePos = findOpenPosition(targetPos, alternativeRange);
    
    if (alternativePos) {
      // Try pathfinding to the alternative position
      const alternativeGoals = [{ pos: alternativePos, range }];
      const alternativeResult = PathFinder.search(origin, alternativeGoals, {
        plainCost: opts.plainCost ?? 2,
        swampCost: opts.swampCost ?? 10,
        maxOps: opts.maxOps ?? 2000,
        maxRooms,
        flee: opts.flee ?? false,
        roomCallback: (roomName: string) => {
          if (allowedRooms && !allowedRooms[roomName]) {
            return false;
          }
          return generateCostMatrix(
            roomName,
            opts.avoidCreeps ?? true,
            roadCost,
            allowHostileRooms,
            allowSK,
            preferHighway,
            highwayBias,
            origin,
            actorPriority
          );
        }
      });
      
      // Use alternative path if it's better (complete or shorter)
      if (!alternativeResult.incomplete || alternativeResult.path.length < result.path.length) {
        return alternativeResult;
      }
    }
  }

  return result;
}

/**
 * Find a path to flee from multiple targets
 */
function findFleePath(
  origin: RoomPosition,
  threats: RoomPosition[],
  range: number,
  opts: MoveOpts,
  actorPriority?: number
): PathFinderPath {
  const goals = threats.map(pos => ({ pos, range }));
  const roadCost = opts.roadCost ?? 1;
  const allowHostileRooms = opts.allowHostileRooms ?? false;
  const allowSK = opts.allowSK ?? false;
  const preferHighway = opts.preferHighway ?? false;
  const highwayBias = opts.highwayBias ?? 2.5;
  const maxRooms = opts.maxRooms ?? 4; // Limit flee path search

  return PathFinder.search(origin, goals, {
    plainCost: opts.plainCost ?? 2,
    swampCost: opts.swampCost ?? 10,
    maxOps: opts.maxOps ?? 2000,
    maxRooms,
    flee: true,
    roomCallback: (roomName: string) => {
      return generateCostMatrix(
        roomName,
        opts.avoidCreeps ?? true,
        roadCost,
        allowHostileRooms,
        allowSK,
        preferHighway,
        highwayBias,
        origin,
        actorPriority
      );
    }
  });
}

// =============================================================================
// Internal Core API
// =============================================================================

/**
 * Internal preTick - Initialize movement system at the start of each tick.
 */
function preTick(): void {
  moveIntents = new Map();
  lastPreTickTime = Game.time;
}

/**
 * Internal reconcileTraffic - Resolve traffic at the end of each tick.
 * Now integrates with the move request system to ask blocking creeps to move.
 */
function reconcileTraffic(): void {
  for (const [roomName, intents] of moveIntents) {
    if (intents.length === 0) continue;

    // Sort by priority (highest first)
    intents.sort((a, b) => b.priority - a.priority);

    // Track occupied positions
    const occupied = new Set<string>();

    // Build a Set of creep names that have movement intents for O(1) lookup
    const creepsWithIntents = new Set(intents.map(i => i.creep.name));

    // First pass: mark all current creep positions not in our intents list
    const room = Game.rooms[roomName];
    if (room) {
      const creeps = room.find(FIND_CREEPS);
      for (const creep of creeps) {
        if (!creepsWithIntents.has(creep.name)) {
          occupied.add(posKey(creep.pos));
        }
      }
    }

    // Second pass: resolve movements in priority order with blocking resolution
    for (const intent of intents) {
      const targetKey = posKey(intent.targetPos);

      // Track a potential blocking creep so we can include it in deferred logs
      let blockingCreep: Creep | undefined;

      // Check if target is occupied
      if (occupied.has(targetKey)) {
        // Try to resolve the blockage by asking the blocking creep to move
        if (room) {
          const blockingCreeps = room.lookForAt(LOOK_CREEPS, intent.targetPos.x, intent.targetPos.y);
          blockingCreep = blockingCreeps.find(c => c.my && c.name !== intent.creep.name);

          if (blockingCreep) {
            // Only ask to move if the blocking creep should yield (based on priority)
            // Use type guard to ensure intent.creep is a Creep (not PowerCreep)
            if (isCreep(intent.creep)) {
              if (shouldYieldTo(blockingCreep, intent.creep)) {
                // Check if blocking creep is in a narrow passage
                const inNarrowPassage = isInNarrowPassage(blockingCreep.pos, room);

                let movePosition: RoomPosition | null = null;

                if (inNarrowPassage) {
                  // In narrow passage: ask blocker to back up
                  const directionToRequester = blockingCreep.pos.getDirectionTo(intent.creep.pos);
                  movePosition = findBackupPosition(blockingCreep, directionToRequester);
                } else {
                  // Normal situation: find a side-step position
                  movePosition = findSideStepPosition(blockingCreep);
                }

                if (movePosition) {
                  const moveResult = blockingCreep.move(blockingCreep.pos.getDirectionTo(movePosition));
                  if (moveResult === OK) {
                    // Blocking creep will move, so we can now occupy this position
                    occupied.delete(targetKey);
                    // Also mark the new position as occupied
                    occupied.add(posKey(movePosition));
                  }
                }
              } else {
                logger.info("Movement blocked by higher-priority creep", {
                  subsystem: "Movement",
                  room: room.name,
                  creep: intent.creep.name,
                  meta: {
                    blocker: blockingCreep.name,
                    blockerPriority: isCreep(blockingCreep) ? getCreepPriority(blockingCreep) : undefined,
                    actorPriority: getCreepPriority(intent.creep),
                    target: intent.targetPos.toString()
                  }
                });
              }
            }
          }
        }

        // Re-check if still occupied after attempting to resolve
        if (occupied.has(targetKey)) {
          // Register a move request for next tick so the blocking creep knows
          // Only do this for Creeps, not PowerCreeps - use type guard
          if (isCreep(intent.creep)) {
            requestMoveToPosition(intent.creep, intent.targetPos);
          }

          const blockingCreepYield =
            blockingCreep && isCreep(blockingCreep) && isCreep(intent.creep)
              ? shouldYieldTo(blockingCreep, intent.creep)
              : undefined;

          logger.info("Movement deferred: target position still occupied", {
            subsystem: "Movement",
            room: room?.name ?? intent.creep.pos.roomName,
            creep: intent.creep.name,
            meta: {
              target: intent.targetPos.toString(),
              occupiedBy: blockingCreep?.name,
              requestedYield: blockingCreepYield
            }
          });
          continue;
        }
      }

      // Execute the move
      const direction = getDirection(intent.creep.pos, intent.targetPos);
      const result = intent.creep.move(direction);

      if (result === OK) {
        occupied.add(targetKey);

        // Consume cached path strings only after a successful move
        if (isCreep(intent.creep)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const memory = intent.creep.memory as any;
          const cachedPath = memory[MEMORY_PATH_KEY] as CachedPath | undefined;

          if (cachedPath && typeof cachedPath.path === "string" && cachedPath.path.length > 0) {
            cachedPath.path = cachedPath.path.substring(1);
            memory[MEMORY_PATH_KEY] = cachedPath;
          }
        }
      }
    }
  }
}

/**
 * Internal moveTo - Move a creep toward a target position.
 */
function internalMoveTo(
  creep: Creep | PowerCreep,
  targets: RoomPosition | _HasRoomPosition | MoveTarget | RoomPosition[] | MoveTarget[],
  opts?: MoveOpts
): CreepMoveReturnCode | -2 | -5 | -7 | -10 {
  // Handle spawning creeps
  if ("spawning" in creep && creep.spawning) {
    logger.info("Movement blocked: creep is still spawning", {
      subsystem: "Movement",
      creep: creep.name,
      room: creep.pos.roomName
    });
    return ERR_BUSY;
  }

  // Handle fatigue (only applies to Creeps, not PowerCreeps)
  if ("fatigue" in creep && creep.fatigue > 0) {
    logger.info("Movement blocked: creep is fatigued", {
      subsystem: "Movement",
      creep: creep.name,
      room: creep.pos.roomName,
      meta: {
        fatigue: creep.fatigue
      }
    });
    return ERR_TIRED;
  }

  // Normalize target to RoomPosition
  let targetPos: RoomPosition;
  let range = 1;

  if (Array.isArray(targets)) {
    const firstTarget = targets[0];
    if (!firstTarget) {
      logger.warn("Movement failed: empty target array provided", {
        subsystem: "Movement",
        creep: creep.name,
        room: creep.pos.roomName
      });
      return ERR_INVALID_TARGET;
    }
    // Check type at runtime
    if (firstTarget instanceof RoomPosition) {
      targetPos = firstTarget;
    } else if (
      typeof firstTarget === "object" &&
      firstTarget !== null &&
      "pos" in firstTarget &&
      firstTarget.pos instanceof RoomPosition
    ) {
      targetPos = firstTarget.pos;
      if ("range" in firstTarget && typeof firstTarget.range === "number") {
        range = firstTarget.range;
      }
    } else {
      return ERR_INVALID_TARGET;
    }
  } else if (targets instanceof RoomPosition) {
    targetPos = targets;
  } else if (
    typeof targets === "object" &&
    targets !== null &&
    "pos" in targets &&
    targets.pos instanceof RoomPosition
  ) {
    targetPos = targets.pos;
    if ("range" in targets && typeof targets.range === "number") {
      range = targets.range;
    }
  } else {
    logger.warn("Movement failed: invalid target provided", {
      subsystem: "Movement",
      creep: creep.name,
      room: creep.pos.roomName,
      meta: {
        targetType: typeof targets
      }
    });
    return ERR_INVALID_TARGET;
  }

  const options = opts ?? {};
  const priority = options.priority ?? 1;
  const actorPriority = isCreep(creep) ? getCreepPriority(creep) : undefined;

  // Check if already at target
  if (creep.pos.inRangeTo(targetPos, range)) {
    return OK;
  }

  // CRITICAL: Handle creeps on room exits with targets in the SAME room.
  // When a creep is on an exit tile and their target is in the SAME room,
  // they must FIRST move off the exit tile toward the room center before continuing.
  // This prevents cycling behavior where PathFinder might route them through adjacent rooms.
  // However, if the target is in a DIFFERENT room, the creep should proceed normally
  // to cross the exit into the target room.
  const onRoomExit = isOnRoomExit(creep.pos);
  const targetInDifferentRoom = targetPos.roomName !== creep.pos.roomName;

  if (onRoomExit && !targetInDifferentRoom) {
    // Find a walkable position off the exit that's more toward the room center
    // Note: findPositionOffExit only returns adjacent positions (within 1 tile),
    // so getDirection will always receive a valid adjacent position.
    const exitOffPosition = findPositionOffExit(creep);
    if (exitOffPosition) {
      // Move to the off-exit position first, then next tick will continue pathing
      const direction = getDirection(creep.pos, exitOffPosition);
      const currentRoomName = creep.pos.roomName;

      // Register movement intent for traffic management
      if (lastPreTickTime === Game.time) {
        if (!moveIntents.has(currentRoomName)) {
          moveIntents.set(currentRoomName, []);
        }
        const intents = moveIntents.get(currentRoomName);
        if (intents) {
          intents.push({
            creep,
            priority: priority + 1, // Slightly higher priority to clear exit
            targetPos: exitOffPosition
          });
        }
        return OK;
      } else {
        return creep.move(direction);
      }
    }
    // If no off-exit position found, continue with normal pathing
  }

  // Get cached path or generate new one
  const memory = creep.memory as { [key: string]: unknown };
  const cachedPath = memory[MEMORY_PATH_KEY] as CachedPath | undefined;
  const stuckCount = (memory[MEMORY_STUCK_KEY] as number) ?? 0;
  const lastPos = memory[MEMORY_LAST_POS_KEY] as string | undefined;
  const currentPosKey = posKey(creep.pos);
  const targetKey = posKey(targetPos);

  // Check if stuck
  const isStuck = lastPos === currentPosKey;
  const newStuckCount = isStuck ? stuckCount + 1 : 0;
  memory[MEMORY_STUCK_KEY] = newStuckCount;
  memory[MEMORY_LAST_POS_KEY] = currentPosKey;

  // Check if creep needs to repath for cross-room movement
  // Note: The critical exit-handling is done above; this additional check ensures
  // stale paths from different rooms are invalidated

  // Check if cached path is from a different room (creep changed rooms)
  // Handle both string-based and position-based paths
  let cachedPathInDifferentRoom = false;
  if (cachedPath && cachedPath.path) {
    if (typeof cachedPath.path === 'string') {
      // For string paths, we can't easily check room changes
      // We'll rely on other repath conditions
      cachedPathInDifferentRoom = false;
    } else if (Array.isArray(cachedPath.path)) {
      const cachedPathFirstPos = cachedPath.path[0];
      cachedPathInDifferentRoom =
        cachedPath.path.length > 0 && 
        cachedPathFirstPos !== undefined && 
        cachedPathFirstPos.r !== creep.pos.roomName;
    }
  }

  // Traveler-inspired: Handle moving targets
  // If target moved slightly and movingTarget is enabled, append direction change
  let targetMoved = false;
  if (options.movingTarget && cachedPath && cachedPath.targetKey !== targetKey) {
    // Parse old target position from targetKey
    const oldTargetParts = cachedPath.targetKey.split(':');
    if (oldTargetParts.length === 2) {
      const [oldRoom, oldCoords] = oldTargetParts;
      const [oldX, oldY] = oldCoords.split(',').map(s => parseInt(s, 10));
      
      // Validate parsed coordinates before creating RoomPosition
      if (isNaN(oldX) || isNaN(oldY) || oldX < 0 || oldX > 49 || oldY < 0 || oldY > 49 || !oldRoom) {
        // Invalid cached target, clear cache and continue
        delete memory[MEMORY_PATH_KEY];
      } else {
        const oldTargetPos = new RoomPosition(oldX, oldY, oldRoom);
        
        // Check if new target is adjacent to old target
        if (oldTargetPos.isNearTo(targetPos)) {
          targetMoved = true;
          // Append direction change to existing path
          const direction = oldTargetPos.getDirectionTo(targetPos);
          if (typeof cachedPath.path === 'string') {
            cachedPath.path += direction.toString();
          } else {
            // For position-based paths, add new position
            cachedPath.path.push({ x: targetPos.x, y: targetPos.y, r: targetPos.roomName });
          }
          cachedPath.targetKey = targetKey;
          memory[MEMORY_PATH_KEY] = cachedPath;
        }
      }
    }
  }

  // Check if we can use flow fields (for single-room movement to common targets)
  const useFlowField = options.useFlowField ?? true;
  const sameRoom = creep.pos.roomName === targetPos.roomName;
  let flowFieldDirection: DirectionConstant | null | 0 = null;
  
  if (useFlowField && sameRoom && !options.flee) {
    // Try to get flow field for this target
    const flowField = getFlowField(creep.pos.roomName, targetPos);
    if (flowField) {
      const rawDirection = getFlowDirection(flowField, creep.pos);
      
      // Check if we're at the destination (direction = 0)
      if (rawDirection === 0) {
        return OK; // Already at destination
      }
      
      // If we have a valid flow field direction (not null), use it
      if (rawDirection !== null) {
        flowFieldDirection = rawDirection as DirectionConstant;
        // Calculate target position from direction
        const offsets: Record<DirectionConstant, { dx: number; dy: number }> = {
          [TOP]: { dx: 0, dy: -1 },
          [TOP_RIGHT]: { dx: 1, dy: -1 },
          [RIGHT]: { dx: 1, dy: 0 },
          [BOTTOM_RIGHT]: { dx: 1, dy: 1 },
          [BOTTOM]: { dx: 0, dy: 1 },
          [BOTTOM_LEFT]: { dx: -1, dy: 1 },
          [LEFT]: { dx: -1, dy: 0 },
          [TOP_LEFT]: { dx: -1, dy: -1 }
        };
        
        const offset = offsets[flowFieldDirection];
        if (offset) {
          const newX = creep.pos.x + offset.dx;
          const newY = creep.pos.y + offset.dy;
          
          // Validate coordinates are within room bounds
          if (newX < 0 || newX > 49 || newY < 0 || newY > 49) {
            // Position outside room, skip flow field and use default pathfinding
            flowFieldDirection = null;
          } else {
            const flowTargetPos = new RoomPosition(newX, newY, creep.pos.roomName);
            
            // Register movement intent using flow field direction
            if (lastPreTickTime === Game.time) {
              if (!moveIntents.has(creep.pos.roomName)) {
                moveIntents.set(creep.pos.roomName, []);
              }
              const intents = moveIntents.get(creep.pos.roomName);
              if (intents) {
                intents.push({
                  creep,
                  priority,
                  targetPos: flowTargetPos
                });
              }
              return OK;
            } else {
              return creep.move(flowFieldDirection);
            }
          }
        }
      }
    }
  }

  // Check if creep changed rooms (for string-based paths)
  // String-based paths are relative to start position, so they become invalid when room changes
  let creepChangedRooms = false;
  if (cachedPath && typeof cachedPath.path === 'string' && cachedPath.startRoom) {
    creepChangedRooms = cachedPath.startRoom !== creep.pos.roomName;
  }

  // Determine if we need to repath
  const repathIfStuck = options.repathIfStuck ?? 3;
  // OPTIMIZATION: Using 50 ticks for reusePath per ROADMAP Section 20
  // to balance CPU efficiency with responsiveness. Longer values reduce expensive 
  // PathFinder.search calls while still adapting to changes.
  const reusePath = options.reusePath ?? 50;
  const needRepath =
    !cachedPath ||
    (!targetMoved && cachedPath.targetKey !== targetKey) ||
    Game.time - cachedPath.tick > reusePath ||
    newStuckCount >= repathIfStuck ||
    cachedPathInDifferentRoom || // Force repath when path is from a different room
    creepChangedRooms; // Force repath when creep changed rooms (string-based paths only)

  let path: RoomPosition[];
  let pathStr: string | null = null;

  /**
   * Helper to generate a new path and cache it.
   * Returns the path or null if no path found.
   * Tracks CPU usage for pathfinding operations (Traveler-inspired).
   */
  function generateAndCachePath(): RoomPosition[] | null {
    const cpuStart = Game.cpu.getUsed();
    const pathResult = findPath(creep.pos, { pos: targetPos, range }, options, actorPriority);
    const cpuUsed = Game.cpu.getUsed() - cpuStart;

    if (pathResult.incomplete || pathResult.path.length === 0) {
      logger.warn("Movement failed: no viable path found", {
        subsystem: "Movement",
        creep: creep.name,
        room: creep.pos.roomName,
        meta: {
          target: targetPos.toString(),
          incomplete: pathResult.incomplete,
          pathLength: pathResult.path.length,
          avoidCreeps: options.avoidCreeps ?? true,
          actorPriority
        }
      });
      delete memory[MEMORY_PATH_KEY];
      return null;
    }

    // Track accumulated CPU (Traveler-inspired)
    const previousCpu = cachedPath?.cpu ?? 0;
    const totalCpu = previousCpu + cpuUsed;
    
    // Report heavy CPU usage (Traveler-inspired)
    const cpuReportThreshold = options.cpuReportThreshold ?? 1000;
    if (totalCpu > cpuReportThreshold) {
      logger.warn(
        `Heavy pathfinding CPU: ${creep.name} used ${totalCpu.toFixed(2)} CPU (${cpuUsed.toFixed(2)} this call)`, 
        { 
          subsystem: "Movement", 
          creep: creep.name, 
          room: creep.room?.name,
          meta: { 
            totalCpu: totalCpu.toFixed(2), 
            thisCpu: cpuUsed.toFixed(2), 
            from: creep.pos.toString(), 
            to: targetPos.toString() 
          } 
        }
      );
    }

    // Use string-based serialization for single-room paths (CPU efficient)
    // Use position-based for multi-room paths (more reliable)
    const isMultiRoom = pathResult.path.some(p => p.roomName !== creep.pos.roomName);
    const serializedPath = isMultiRoom
      ? serializePath(pathResult.path)
      : serializePathToString(creep.pos, pathResult.path);

    // Cache the path
    const cachedPathData: CachedPath = {
      path: serializedPath,
      tick: Game.time,
      targetKey,
      cpu: totalCpu
    };
    
    // For string-based paths, store the starting room to detect room changes
    if (typeof serializedPath === 'string') {
      cachedPathData.startRoom = creep.pos.roomName;
    }
    
    memory[MEMORY_PATH_KEY] = cachedPathData;
    memory[MEMORY_STUCK_KEY] = 0;
    return pathResult.path;
  }

  if (needRepath) {
    const newPath = generateAndCachePath();
    if (!newPath) {
      return ERR_NO_PATH;
    }
    path = newPath;
  } else {
    // Deserialize cached path - support both string and position-based formats
    if (typeof cachedPath.path === 'string') {
      pathStr = cachedPath.path;
      path = deserializePathFromString(creep.pos, cachedPath.path);
    } else {
      path = deserializePath(cachedPath.path);
    }
  }

  // Find next position on path
  let currentIdx = path.findIndex(
    p => p.x === creep.pos.x && p.y === creep.pos.y && p.roomName === creep.pos.roomName
  );

  // If current position not found in path and we're on a room exit,
  // this could mean the path is stale or doesn't include the creep's current position.
  // Force a repath to get a valid path from current position.
  // EXCEPTION: Don't force repath for string-based paths, as they are consumed incrementally
  // and don't need to contain the current position (they work via direction sequences).
  const isStringBasedPath = pathStr !== null;
  if (currentIdx === -1 && onRoomExit && !isStringBasedPath) {
    const newPath = generateAndCachePath();
    if (!newPath) {
      return ERR_NO_PATH;
    }
    path = newPath;
    pathStr = null; // Invalidate string path since we regenerated
    currentIdx = -1; // Will use index 0 below
  }

  const nextIdx = currentIdx === -1 ? 0 : currentIdx + 1;

  if (nextIdx >= path.length) {
    delete memory[MEMORY_PATH_KEY];
    return OK;
  }

  const nextPos = path[nextIdx];

  // Get room name from creep position (works for both Creep and PowerCreep)
  const roomName = creep.pos.roomName;

  // Consume path from cache (Traveler-inspired: pop first direction from string)
  // This is done after determining the move is valid but before executing
  // Note: We update memory AFTER the move succeeds, but we can prepare the update
  const shouldConsumePathString = pathStr !== null && pathStr.length > 0;

  // Register movement intent for traffic management
  if (lastPreTickTime === Game.time) {
    if (!moveIntents.has(roomName)) {
      moveIntents.set(roomName, []);
    }
    const intents = moveIntents.get(roomName);
    if (intents) {
      intents.push({
        creep,
        priority,
        targetPos: nextPos
      });
    }

    // Visualize path if requested
    if (options.visualizePathStyle) {
      const visual = new RoomVisual(roomName);
      const visualPath = path.slice(nextIdx);
      if (visualPath.length > 0) {
        visual.poly(
          visualPath.map(p => [p.x, p.y] as [number, number]),
          { ...options.visualizePathStyle, opacity: 0.5 }
        );
      }
    }

    return OK;
  } else {
    // Traffic management not active, move directly
    const direction = getDirection(creep.pos, nextPos);
    const moveResult = creep.move(direction);

    // Consume path string after successful move
    if (moveResult === OK && shouldConsumePathString && cachedPath) {
      cachedPath.path = pathStr!.substring(1);
      memory[MEMORY_PATH_KEY] = cachedPath;
    }

    // Visualize path if requested
    if (options.visualizePathStyle) {
      const visual = new RoomVisual(roomName);
      const visualPath = path.slice(nextIdx);
      if (visualPath.length > 0) {
        visual.poly(
          visualPath.map(p => [p.x, p.y] as [number, number]),
          { ...options.visualizePathStyle, opacity: 0.5 }
        );
      }
    }

    return moveResult;
  }
}

/**
 * Internal flee - Move a creep away from specified positions.
 */
function internalFlee(
  creep: Creep | PowerCreep,
  threats: RoomPosition[],
  range = 10,
  opts?: MoveOpts
): CreepMoveReturnCode | -2 | -5 | -10 {
  if (threats.length === 0) {
    return OK;
  }

  // Handle spawning creeps
  if ("spawning" in creep && creep.spawning) {
    return ERR_BUSY;
  }

  // Handle fatigue (only applies to Creeps, not PowerCreeps)
  if ("fatigue" in creep && creep.fatigue > 0) {
    return ERR_TIRED;
  }

  const options = { ...opts, flee: true };
  const priority = options.priority ?? 1;
  const actorPriority = isCreep(creep) ? getCreepPriority(creep) : undefined;

  const pathResult = findFleePath(creep.pos, threats, range, options, actorPriority);

  if (pathResult.incomplete || pathResult.path.length === 0) {
    return ERR_NO_PATH;
  }

  const nextPos = pathResult.path[0];

  // Get room name from creep position (works for both Creep and PowerCreep)
  const roomName = creep.pos.roomName;

  // Register movement intent
  if (lastPreTickTime === Game.time) {
    if (!moveIntents.has(roomName)) {
      moveIntents.set(roomName, []);
    }
    const intents = moveIntents.get(roomName);
    if (intents) {
      intents.push({
        creep,
        priority,
        targetPos: nextPos
      });
    }

    return OK;
  } else {
    const direction = getDirection(creep.pos, nextPos);
    return creep.move(direction);
  }
}

// =============================================================================
// Public API (Exported Functions)
// =============================================================================

/**
 * Initialize movement system at the start of each tick.
 * Must be called at the beginning of the main loop.
 */
export function initMovement(): void {
  preTick();
}

/**
 * Reconcile traffic at the end of each tick.
 * Must be called at the end of the main loop after all creep movement.
 */
export function finalizeMovement(): void {
  reconcileTraffic();
}

/**
 * Clear cached path for a creep.
 * Use this when the creep's target changes or state is invalidated.
 * This prevents wandering behavior caused by stale path caches.
 *
 * Clears:
 * - Cached path data (direction strings or position arrays)
 * - Stuck counter (resets to 0, allowing fresh stuck detection)
 *
 * Preserves:
 * - Last position tracking (for stuck detection continuity)
 *
 * @param creep - The creep to clear movement cache for
 */
export function clearMovementCache(creep: Creep | PowerCreep): void {
  if (!isCreep(creep)) {
    // This function only handles Creep movement patterns
    // PowerCreeps use a different memory structure for movement
    return;
  }
  
  // Access memory directly - TypeScript allows property deletion
  // These keys are internal to the movement system (underscore-prefixed)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const memory = creep.memory as any;
  delete memory[MEMORY_PATH_KEY];
  delete memory[MEMORY_STUCK_KEY];
  // Note: MEMORY_LAST_POS_KEY is preserved to maintain position tracking for stuck detection
}

/**
 * Move a creep or power creep to a target position or object.
 *
 * @param creep - The creep or power creep to move
 * @param target - Target position or object with pos property
 * @param opts - Optional movement options including:
 *   - visualizePathStyle: Visual styling for the path
 *   - allowAlternativeTarget: If true, will search for alternative positions when destination is blocked
 *   - alternativeRange: Range to search for alternative positions (default 1)
 * @returns The result of the movement action
 */
export function moveCreep(
  creep: Creep | PowerCreep,
  target: RoomPosition | RoomObject,
  opts?: MoveOpts
): CreepMoveReturnCode | -2 | -5 | -7 | -10 {
  const targetPos = target instanceof RoomPosition ? target : target.pos;
  return internalMoveTo(creep, targetPos, opts);
}

/**
 * Move a creep to a specific room by finding and moving to an exit.
 * Uses the room center (25, 25) with a range of 20 to navigate to any accessible
 * position within the target room - this is the standard approach for cross-room navigation.
 *
 * This function handles:
 * - Same-room navigation (returns OK if already in target room)
 * - Multi-room pathfinding across multiple rooms
 * - Cross-shard navigation via portals (when available)
 * - Avoiding hostile rooms by default
 *
 * @param creep - The creep or power creep to move
 * @param roomName - The name of the destination room
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
  const options = { ...opts };

  // For multi-room movement, set reasonable defaults if not specified
  if (!options.maxRooms) {
    options.maxRooms = 16; // Allow pathfinding through up to 16 rooms
  }
  if (options.allowHostileRooms === undefined) {
    options.allowHostileRooms = false; // Avoid hostile rooms by default
  }

  return internalMoveTo(creep, { pos: targetPos, range: 20 }, options);
}

/**
 * Move a creep away from a set of positions (flee behavior).
 * This function always enables flee mode in the movement options.
 *
 * @param creep - The creep to move
 * @param threats - Array of positions to flee from
 * @param range - How far to stay away from threats (default 10)
 * @param opts - Optional movement options (flee is always set to true)
 * @returns The result of the movement action
 */
export function fleeFrom(
  creep: Creep | PowerCreep,
  threats: RoomPosition[],
  range = 10,
  opts?: Omit<MoveOpts, "flee">
): CreepMoveReturnCode | -2 | -5 | -7 | -10 {
  return internalFlee(creep, threats, range, opts);
}

/**
 * Check if a creep is on a room exit tile (edge of the room).
 *
 * @param creep - The creep or power creep to check
 * @returns true if the creep is on a room exit tile
 */
export function isCreepOnRoomExit(creep: Creep | PowerCreep): boolean {
  return isOnRoomExit(creep.pos);
}

/**
 * Move a creep off a room exit tile to prevent endless cycling between rooms.
 * This should be called when a creep is about to idle or has no immediate task,
 * to ensure they don't get stuck on exit tiles causing oscillation between rooms.
 *
 * @param creep - The creep or power creep to move
 * @param opts - Optional movement options
 * @returns true if the creep was on an exit and a move was issued, false otherwise
 */
export function moveOffRoomExit(creep: Creep | PowerCreep, opts?: MoveOpts): boolean {
  // Check if creep is on a room exit
  if (!isOnRoomExit(creep.pos)) {
    return false;
  }

  // Handle spawning creeps
  if ("spawning" in creep && creep.spawning) {
    return false;
  }

  // Handle fatigue (only applies to Creeps, not PowerCreeps)
  if ("fatigue" in creep && creep.fatigue > 0) {
    return false;
  }

  // Find a position off the exit
  const targetPos = findPositionOffExit(creep);
  if (!targetPos) {
    return false;
  }

  // Move to the target position
  const priority = opts?.priority ?? 2; // Higher priority than normal movement
  const roomName = creep.pos.roomName;

  // Register movement intent for traffic management
  if (lastPreTickTime === Game.time) {
    if (!moveIntents.has(roomName)) {
      moveIntents.set(roomName, []);
    }
    const intents = moveIntents.get(roomName);
    if (intents) {
      intents.push({
        creep,
        priority,
        targetPos
      });
    }
    return true;
  } else {
    // Traffic management not active, move directly
    const direction = getDirection(creep.pos, targetPos);
    creep.move(direction);
    return true;
  }
}

/**
 * Find a walkable position away from spawns.
 * Returns null if no valid position is found or creep is not near a spawn.
 */
function findPositionAwayFromSpawn(creep: Creep | PowerCreep, range: number): RoomPosition | null {
  const room = Game.rooms[creep.pos.roomName];
  if (!room) return null;

  // Find nearby spawns
  const spawns = room.find(FIND_MY_SPAWNS);
  if (spawns.length === 0) return null;

  // Check if creep is within range of any spawn
  let nearbySpawn: StructureSpawn | null = null;
  for (const spawn of spawns) {
    if (creep.pos.inRangeTo(spawn.pos, range)) {
      nearbySpawn = spawn;
      break;
    }
  }

  if (!nearbySpawn) return null;

  const terrain = room.getTerrain();

  // Get all 8 adjacent positions
  const adjacentOffsets = [
    { dx: 0, dy: -1 }, // TOP
    { dx: 1, dy: -1 }, // TOP_RIGHT
    { dx: 1, dy: 0 }, // RIGHT
    { dx: 1, dy: 1 }, // BOTTOM_RIGHT
    { dx: 0, dy: 1 }, // BOTTOM
    { dx: -1, dy: 1 }, // BOTTOM_LEFT
    { dx: -1, dy: 0 }, // LEFT
    { dx: -1, dy: -1 } // TOP_LEFT
  ];

  // Sort to prefer positions further from spawn
  const candidates: { pos: RoomPosition; spawnDistance: number }[] = [];

  for (const offset of adjacentOffsets) {
    const newX = creep.pos.x + offset.dx;
    const newY = creep.pos.y + offset.dy;

    // Skip positions outside the room or on exits
    if (newX <= 0 || newX >= 49 || newY <= 0 || newY >= 49) continue;

    // Skip walls
    if (terrain.get(newX, newY) === TERRAIN_MASK_WALL) continue;

    const newPos = new RoomPosition(newX, newY, creep.pos.roomName);

    // Check for blocking structures
    const structures = room.lookForAt(LOOK_STRUCTURES, newX, newY);
    const blocked = structures.some(
      s =>
        s.structureType !== STRUCTURE_ROAD &&
        s.structureType !== STRUCTURE_CONTAINER &&
        !(s.structureType === STRUCTURE_RAMPART && (s as StructureRampart).my)
    );
    if (blocked) continue;

    // Check for other creeps
    const creeps = room.lookForAt(LOOK_CREEPS, newX, newY);
    if (creeps.length > 0) continue;

    // Calculate distance from spawn (higher is better, further from spawn)
    const spawnDistance = newPos.getRangeTo(nearbySpawn.pos);

    candidates.push({
      pos: newPos,
      spawnDistance
    });
  }

  // Sort by spawn distance descending (prefer positions further from spawn)
  candidates.sort((a, b) => b.spawnDistance - a.spawnDistance);

  // Return the best candidate, or null if none found
  return candidates.length > 0 ? candidates[0].pos : null;
}

/**
 * Move a creep away from spawn if it's blocking or near a spawn.
 * This should be called when a creep is idle to prevent spawn blockades.
 *
 * @param creep - The creep or power creep to move
 * @param range - Range from spawn to consider as "blocking" (default 1)
 * @param opts - Optional movement options (only priority is used)
 * @returns true if the creep was near a spawn and a move was issued, false otherwise
 */
export function moveAwayFromSpawn(creep: Creep | PowerCreep, range = 1, opts?: MoveOpts): boolean {
  // Handle spawning creeps
  if ("spawning" in creep && creep.spawning) {
    return false;
  }

  // Handle fatigue (only applies to Creeps, not PowerCreeps)
  if ("fatigue" in creep && creep.fatigue > 0) {
    return false;
  }

  // Find a position away from spawn
  const targetPos = findPositionAwayFromSpawn(creep, range);
  if (!targetPos) {
    return false;
  }

  // Move to the target position
  // Use priority 2 to match moveOffRoomExit - clearing blockades is important
  const priority = opts?.priority ?? 2;
  const roomName = creep.pos.roomName;

  // Register movement intent for traffic management
  if (lastPreTickTime === Game.time) {
    if (!moveIntents.has(roomName)) {
      moveIntents.set(roomName, []);
    }
    const intents = moveIntents.get(roomName);
    if (intents) {
      intents.push({
        creep,
        priority,
        targetPos
      });
    }
    return true;
  } else {
    // Traffic management not active, move directly
    const direction = getDirection(creep.pos, targetPos);
    creep.move(direction);
    return true;
  }
}

/**
 * Find a walkable position away from a source position.
 * Returns null if no valid position is found.
 */
function findPositionAwayFromSource(
  creep: Creep | PowerCreep,
  sourcePos: RoomPosition
): RoomPosition | null {
  const room = Game.rooms[creep.pos.roomName];
  if (!room) return null;

  const terrain = room.getTerrain();

  // Get all 8 adjacent positions
  const adjacentOffsets = [
    { dx: 0, dy: -1 }, // TOP
    { dx: 1, dy: -1 }, // TOP_RIGHT
    { dx: 1, dy: 0 }, // RIGHT
    { dx: 1, dy: 1 }, // BOTTOM_RIGHT
    { dx: 0, dy: 1 }, // BOTTOM
    { dx: -1, dy: 1 }, // BOTTOM_LEFT
    { dx: -1, dy: 0 }, // LEFT
    { dx: -1, dy: -1 } // TOP_LEFT
  ];

  // Sort to prefer positions further from source
  const candidates: { pos: RoomPosition; sourceDistance: number }[] = [];

  for (const offset of adjacentOffsets) {
    const newX = creep.pos.x + offset.dx;
    const newY = creep.pos.y + offset.dy;

    // Skip positions outside the room or on exits
    if (newX <= 0 || newX >= 49 || newY <= 0 || newY >= 49) continue;

    // Skip walls
    if (terrain.get(newX, newY) === TERRAIN_MASK_WALL) continue;

    const newPos = new RoomPosition(newX, newY, creep.pos.roomName);

    // Check for blocking structures
    const structures = room.lookForAt(LOOK_STRUCTURES, newX, newY);
    const blocked = structures.some(
      s =>
        s.structureType !== STRUCTURE_ROAD &&
        s.structureType !== STRUCTURE_CONTAINER &&
        !(s.structureType === STRUCTURE_RAMPART && (s as StructureRampart).my)
    );
    if (blocked) continue;

    // Check for other creeps
    const creeps = room.lookForAt(LOOK_CREEPS, newX, newY);
    if (creeps.length > 0) continue;

    // Calculate distance from source using Chebyshev distance (higher is better, further from source)
    // This is equivalent to getRangeTo() but faster since we avoid the function call overhead
    const sourceDistance = Math.max(Math.abs(newX - sourcePos.x), Math.abs(newY - sourcePos.y));

    candidates.push({
      pos: newPos,
      sourceDistance
    });
  }

  // Sort by source distance descending (prefer positions further from source)
  candidates.sort((a, b) => b.sourceDistance - a.sourceDistance);

  // Return the best candidate, or null if none found
  return candidates.length > 0 ? candidates[0].pos : null;
}

/**
 * Push a creep away from a source position.
 * This function forces the target creep to move to an adjacent position
 * that is further away from the source position.
 *
 * @param creep - The creep to push
 * @param sourcePos - The position to push away from
 * @param opts - Optional movement options (only priority is used)
 * @returns true if the creep was pushed, false if push failed
 */
export function pushCreep(creep: Creep | PowerCreep, sourcePos: RoomPosition, opts?: MoveOpts): boolean {
  // Handle spawning creeps
  if ("spawning" in creep && creep.spawning) {
    return false;
  }

  // Handle fatigue (only applies to Creeps, not PowerCreeps)
  if ("fatigue" in creep && creep.fatigue > 0) {
    return false;
  }

  // Find a position away from source
  const targetPos = findPositionAwayFromSource(creep, sourcePos);
  if (!targetPos) {
    return false;
  }

  // Move to the target position
  // Use priority 3 for push operations - higher than normal movement
  const priority = opts?.priority ?? 3;
  const roomName = creep.pos.roomName;

  // Register movement intent for traffic management
  if (lastPreTickTime === Game.time) {
    if (!moveIntents.has(roomName)) {
      moveIntents.set(roomName, []);
    }
    const intents = moveIntents.get(roomName);
    if (intents) {
      intents.push({
        creep,
        priority,
        targetPos
      });
    }
    return true;
  } else {
    // Traffic management not active, move directly
    const direction = getDirection(creep.pos, targetPos);
    creep.move(direction);
    return true;
  }
}

/**
 * Push all creeps away from a position within a specified range.
 * This is useful for clearing an area around a source, spawn, or other important location.
 *
 * @param sourcePos - The center position to push creeps away from
 * @param range - The range within which to push creeps (default 1)
 * @param opts - Optional movement options
 * @returns The number of creeps that were successfully pushed
 */
export function pushCreepsAway(sourcePos: RoomPosition, range = 1, opts?: MoveOpts): number {
  const room = Game.rooms[sourcePos.roomName];
  if (!room) return 0;

  // Find all creeps within range
  const creepsInRange = room.find(FIND_MY_CREEPS).filter(c => c.pos.inRangeTo(sourcePos, range));

  let pushedCount = 0;

  for (const creep of creepsInRange) {
    // Skip creeps that are exactly at the source position
    // (they might be intentionally there, like a harvester at a source)
    if (creep.pos.isEqualTo(sourcePos)) {
      continue;
    }

    if (pushCreep(creep, sourcePos, opts)) {
      pushedCount++;
    }
  }

  return pushedCount;
}

/**
 * Find portals in a room that lead to a specific destination shard.
 * Returns null if no portals found or room not visible.
 *
 * @param roomName - The room to search for portals
 * @param targetShard - Optional target shard name to filter portals
 * @returns Array of portal structures, or null if room not visible
 */
export function findPortalsInRoom(roomName: string, targetShard?: string): StructurePortal[] | null {
  const room = Game.rooms[roomName];
  if (!room) return null;

  // Use portal manager for discovery (with caching)
  const portalInfos = discoverPortalsInRoom(roomName);
  if (!portalInfos) return null;

  // Get the actual portal structures
  const portals: StructurePortal[] = [];
  for (const info of portalInfos) {
    const structures = room.lookForAt(LOOK_STRUCTURES, info.pos);
    for (const structure of structures) {
      if (structure.structureType === STRUCTURE_PORTAL) {
        portals.push(structure as StructurePortal);
      }
    }
  }

  if (!targetShard) {
    return portals;
  }

  // Filter by destination shard
  return portals.filter(portal => {
    if (!portal.destination) return false;
    // Check if destination is inter-shard (has shard property)
    if ("shard" in portal.destination && "room" in portal.destination) {
      return portal.destination.shard === targetShard;
    }
    return false;
  });
}

/**
 * Find a path to a room in another shard via portals.
 * This is a helper for cross-shard navigation.
 *
 * **✅ COMPLETED TODO**: Multi-room portal search using inter-shard memory.
 * 
 * This function implements the complete portal pathfinding system:
 * 1. Checks current room for direct portals
 * 2. Searches all visible rooms for portals to target shard
 * 3. Uses InterShardMemory to discover portals from other shards
 * 4. Calculates optimal multi-room routes via portal manager
 *
 * Design:
 * - Aggressive caching (500 tick TTL) per ROADMAP Section 20
 * - Inter-shard coordination via InterShardMemory (ROADMAP Section 4)
 * - Low-frequency maintenance updates (ROADMAP Section 18)
 *
 * @param creep - The creep attempting to travel
 * @param targetShard - The destination shard name
 * @param _targetRoom - The destination room name in the target shard (currently unused, reserved for future use)
 * @returns Portal position to move to, or null if no path found
 *
 * @example
 * ```typescript
 * // Move creep to shard1
 * const portalPos = findPortalPathToShard(creep, "shard1");
 * if (portalPos) {
 *   moveCreep(creep, portalPos);
 * }
 * ```
 */
export function findPortalPathToShard(
  creep: Creep | PowerCreep,
  targetShard: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _targetRoom?: string
): RoomPosition | null {
  const currentShard = Game.shard?.name;
  if (!currentShard || currentShard === targetShard) {
    return null; // Already on target shard or shard info not available
  }

  // Check current room for portals
  const room = Game.rooms[creep.pos.roomName];
  if (room) {
    const portals = findPortalsInRoom(creep.pos.roomName, targetShard);
    if (portals && portals.length > 0) {
      // Found a portal in current room - return closest
      const closest = creep.pos.findClosestByRange(portals);
      return closest?.pos ?? null;
    }
  }

  // Multi-room portal search using portal manager
  // Find the closest portal to target shard across all known rooms
  const portalInfo = findClosestPortalToShard(creep.pos, targetShard);
  if (portalInfo) {
    // Return the portal position to navigate towards
    return portalInfo.pos;
  }

  // Try to find a route to a portal using the routing system
  const route = findRouteToPortal(creep.pos.roomName, targetShard);
  if (route && route.portals.length > 0) {
    // Return the first portal in the route
    return route.portals[0] ?? null;
  }

  // No portal path found
  return null;
}

/**
 * Move a creep to a different shard via portals.
 * This is an advanced function for cross-shard navigation.
 *
 * @param creep - The creep to move
 * @param targetShard - The destination shard name
 * @param _targetRoom - Optional destination room in the target shard (currently unused, reserved for future use)
 * @param opts - Optional movement options
 * @returns The result of the movement action, or ERR_NO_PATH if no portal route found
 */
export function moveToShard(
  creep: Creep | PowerCreep,
  targetShard: string,
  _targetRoom?: string,
  opts?: MoveOpts
): CreepMoveReturnCode | -2 | -5 | -7 | -10 {
  const currentShard = Game.shard?.name;

  // Already on target shard
  if (currentShard === targetShard) {
    if (_targetRoom && creep.pos.roomName !== _targetRoom) {
      return moveToRoom(creep, _targetRoom, opts);
    }
    return OK;
  }

  // Find portal to target shard
  const portalPos = findPortalPathToShard(creep, targetShard, _targetRoom);
  if (!portalPos) {
    return ERR_NO_PATH;
  }

  // Move to the portal
  return moveCreep(creep, portalPos, opts);
}

// =============================================================================
// Traffic Visualization
// =============================================================================

/**
 * Visualize traffic flow in a room.
 * Shows movement intents, priorities, and blockages.
 * This addresses the "Advanced traffic visualization missing" gap in the issue.
 *
 * @param roomName - Room to visualize
 * @param showPriorities - Whether to show priority numbers (default false)
 */
export function visualizeTraffic(roomName: string, showPriorities = false): void {
  const intents = moveIntents.get(roomName);
  if (!intents || intents.length === 0) return;

  const visual = new RoomVisual(roomName);

  for (const intent of intents) {
    const creepPos = intent.creep.pos;
    const targetPos = intent.targetPos;

    const isHighPriority = intent.priority > HIGH_PRIORITY_THRESHOLD;

    // Draw arrow from creep to target
    visual.line(
      creepPos.x, creepPos.y,
      targetPos.x, targetPos.y,
      {
        color: isHighPriority ? "#ff0000" : "#00ff00",
        width: 0.1,
        opacity: 0.5
      }
    );

    // Show priority if requested
    if (showPriorities) {
      visual.text(
        `P${intent.priority}`,
        creepPos.x, creepPos.y + 0.5,
        {
          color: "#ffffff",
          font: 0.4,
          opacity: 0.7
        }
      );
    }

    // Mark target position
    visual.circle(targetPos.x, targetPos.y, {
      radius: 0.3,
      fill: "transparent",
      stroke: isHighPriority ? "#ff0000" : "#00ff00",
      strokeWidth: 0.1,
      opacity: 0.5
    });
  }
}

/**
 * Push a creep in a specific direction.
 * This function forces the target creep to move in the specified direction.
 *
 * @param creep - The creep to push
 * @param direction - The direction to push the creep
 * @param opts - Optional movement options (only priority is used)
 * @returns true if the creep was pushed, false if push failed
 */
export function pushCreepInDirection(
  creep: Creep | PowerCreep,
  direction: DirectionConstant,
  opts?: MoveOpts
): boolean {
  // Handle spawning creeps
  if ("spawning" in creep && creep.spawning) {
    return false;
  }

  // Handle fatigue (only applies to Creeps, not PowerCreeps)
  if ("fatigue" in creep && creep.fatigue > 0) {
    return false;
  }

  // Calculate the target position based on direction
  const offsets: Record<DirectionConstant, { dx: number; dy: number }> = {
    [TOP]: { dx: 0, dy: -1 },
    [TOP_RIGHT]: { dx: 1, dy: -1 },
    [RIGHT]: { dx: 1, dy: 0 },
    [BOTTOM_RIGHT]: { dx: 1, dy: 1 },
    [BOTTOM]: { dx: 0, dy: 1 },
    [BOTTOM_LEFT]: { dx: -1, dy: 1 },
    [LEFT]: { dx: -1, dy: 0 },
    [TOP_LEFT]: { dx: -1, dy: -1 }
  };

  const offset = offsets[direction];
  if (!offset) return false;

  const newX = creep.pos.x + offset.dx;
  const newY = creep.pos.y + offset.dy;

  // Check bounds
  if (newX < 0 || newX > 49 || newY < 0 || newY > 49) return false;

  const room = Game.rooms[creep.pos.roomName];
  if (!room) return false;

  // Check terrain
  const terrain = room.getTerrain();
  if (terrain.get(newX, newY) === TERRAIN_MASK_WALL) return false;

  // Check for blocking structures
  const structures = room.lookForAt(LOOK_STRUCTURES, newX, newY);
  const blocked = structures.some(
    s =>
      s.structureType !== STRUCTURE_ROAD &&
      s.structureType !== STRUCTURE_CONTAINER &&
      !(s.structureType === STRUCTURE_RAMPART && (s as StructureRampart).my)
  );
  if (blocked) return false;

  // Check for other creeps
  const creeps = room.lookForAt(LOOK_CREEPS, newX, newY);
  if (creeps.length > 0) return false;

  const targetPos = new RoomPosition(newX, newY, creep.pos.roomName);

  // Move to the target position
  // Use priority 3 for push operations - higher than normal movement
  const priority = opts?.priority ?? 3;
  const roomName = creep.pos.roomName;

  // Register movement intent for traffic management
  if (lastPreTickTime === Game.time) {
    if (!moveIntents.has(roomName)) {
      moveIntents.set(roomName, []);
    }
    const intents = moveIntents.get(roomName);
    if (intents) {
      intents.push({
        creep,
        priority,
        targetPos
      });
    }
    return true;
  } else {
    // Traffic management not active, move directly
    creep.move(direction);
    return true;
  }
}

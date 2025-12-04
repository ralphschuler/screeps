/**
 * Movement Utilities
 *
 * Custom minimal traffic management and movement module for the ant swarm.
 * Provides:
 * - Coordinated movement to prevent creep collisions
 * - Path caching for CPU efficiency
 * - Stuck detection and recovery
 * - Priority-based movement resolution
 *
 * Design Principles (from ROADMAP.md):
 * - Pathfinding is one of the most expensive CPU operations
 * - Use reusePath, moveByPath, cached paths, and CostMatrices
 * - Stuck detection with repath or side-step recovery
 * - Yield rules for priority-based movement
 */

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
 */
export interface MoveOpts {
  /** Number of ticks to reuse a cached path before repathing. Default 20. */
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
  /** Serialized path as JSON array of positions */
  path: SerializedPos[];
  /** Game tick when path was created */
  tick: number;
  /** Target position key for cache invalidation */
  targetKey: string;
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
  return serialized.map(pos => new RoomPosition(pos.x, pos.y, pos.r));
}

/**
 * Check if a position is on a room exit (edge of the room).
 * Room exits are positions at x=0, x=49, y=0, or y=49.
 */
function isOnRoomExit(pos: RoomPosition): boolean {
  return pos.x === 0 || pos.x === 49 || pos.y === 0 || pos.y === 49;
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
 * Generate a cost matrix for a room
 */
function generateCostMatrix(roomName: string, avoidCreeps: boolean, roadCost = 1): CostMatrix {
  const costs = new PathFinder.CostMatrix();
  const room = Game.rooms[roomName];

  if (!room) return costs;

  // Add structure costs
  const structures = room.find(FIND_STRUCTURES);
  for (const structure of structures) {
    if (structure.structureType === STRUCTURE_ROAD) {
      costs.set(structure.pos.x, structure.pos.y, roadCost);
    } else if (
      structure.structureType !== STRUCTURE_CONTAINER &&
      !(structure.structureType === STRUCTURE_RAMPART && "my" in structure && structure.my)
    ) {
      costs.set(structure.pos.x, structure.pos.y, 255);
    }
  }

  // Add construction site costs
  const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
  for (const site of sites) {
    if (site.structureType !== STRUCTURE_ROAD && site.structureType !== STRUCTURE_CONTAINER) {
      costs.set(site.pos.x, site.pos.y, 255);
    }
  }

  // Add creep costs if avoiding creeps
  if (avoidCreeps) {
    const creeps = room.find(FIND_CREEPS);
    for (const creep of creeps) {
      costs.set(creep.pos.x, creep.pos.y, 255);
    }
    const powerCreeps = room.find(FIND_POWER_CREEPS);
    for (const pc of powerCreeps) {
      costs.set(pc.pos.x, pc.pos.y, 255);
    }
  }

  return costs;
}

// =============================================================================
// Path Finding
// =============================================================================

/**
 * Find a path to the target using PathFinder
 */
function findPath(origin: RoomPosition, target: RoomPosition | MoveTarget, opts: MoveOpts): PathFinderPath {
  const targetPos = "pos" in target ? target.pos : target;
  const range = "range" in target ? target.range : 1;
  const roadCost = opts.roadCost ?? 1;

  const goals = [{ pos: targetPos, range }];

  const result = PathFinder.search(origin, goals, {
    plainCost: opts.plainCost ?? 2,
    swampCost: opts.swampCost ?? 10,
    maxOps: opts.maxOps ?? 2000,
    flee: opts.flee ?? false,
    roomCallback: (roomName: string) => {
      return generateCostMatrix(roomName, opts.avoidCreeps ?? true, roadCost);
    }
  });

  return result;
}

/**
 * Find a path to flee from multiple targets
 */
function findFleePath(origin: RoomPosition, threats: RoomPosition[], range: number, opts: MoveOpts): PathFinderPath {
  const goals = threats.map(pos => ({ pos, range }));
  const roadCost = opts.roadCost ?? 1;

  return PathFinder.search(origin, goals, {
    plainCost: opts.plainCost ?? 2,
    swampCost: opts.swampCost ?? 10,
    maxOps: opts.maxOps ?? 2000,
    flee: true,
    roomCallback: (roomName: string) => {
      return generateCostMatrix(roomName, opts.avoidCreeps ?? true, roadCost);
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

    // Second pass: resolve movements in priority order
    for (const intent of intents) {
      const targetKey = posKey(intent.targetPos);

      // Check if target is occupied
      if (occupied.has(targetKey)) {
        continue;
      }

      // Execute the move
      const direction = getDirection(intent.creep.pos, intent.targetPos);
      const result = intent.creep.move(direction);

      if (result === OK) {
        occupied.add(targetKey);
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
    return ERR_BUSY;
  }

  // Handle fatigue (only applies to Creeps, not PowerCreeps)
  if ("fatigue" in creep && creep.fatigue > 0) {
    return ERR_TIRED;
  }

  // Normalize target to RoomPosition
  let targetPos: RoomPosition;
  let range = 1;

  if (Array.isArray(targets)) {
    const firstTarget = targets[0];
    if (!firstTarget) {
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
    return ERR_INVALID_TARGET;
  }

  const options = opts ?? {};
  const priority = options.priority ?? 1;

  // Check if already at target
  if (creep.pos.inRangeTo(targetPos, range)) {
    return OK;
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

  // Check if creep is on a room exit - this indicates they just entered a new room
  // and need to repath to avoid cycling back through the exit
  const onRoomExit = isOnRoomExit(creep.pos);

  // Check if cached path is from a different room (creep changed rooms)
  const cachedPathFirstPos = cachedPath?.path[0];
  const cachedPathInDifferentRoom =
    cachedPath && cachedPath.path.length > 0 && cachedPathFirstPos && cachedPathFirstPos.r !== creep.pos.roomName;

  // Determine if we need to repath
  const repathIfStuck = options.repathIfStuck ?? 3;
  const reusePath = options.reusePath ?? 20;
  const needRepath =
    !cachedPath ||
    cachedPath.targetKey !== targetKey ||
    Game.time - cachedPath.tick > reusePath ||
    newStuckCount >= repathIfStuck ||
    (onRoomExit && cachedPathInDifferentRoom); // Force repath when on exit with stale path

  let path: RoomPosition[];

  /**
   * Helper to generate a new path and cache it.
   * Returns the path or null if no path found.
   */
  function generateAndCachePath(): RoomPosition[] | null {
    const pathResult = findPath(creep.pos, { pos: targetPos, range }, options);

    if (pathResult.incomplete || pathResult.path.length === 0) {
      delete memory[MEMORY_PATH_KEY];
      return null;
    }

    // Cache the path (store actual positions for cross-room compatibility)
    memory[MEMORY_PATH_KEY] = {
      path: serializePath(pathResult.path),
      tick: Game.time,
      targetKey
    } as CachedPath;

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
    path = deserializePath(cachedPath.path);
  }

  // Find next position on path
  let currentIdx = path.findIndex(
    p => p.x === creep.pos.x && p.y === creep.pos.y && p.roomName === creep.pos.roomName
  );

  // If current position not found in path and we're on a room exit,
  // this could mean the path doesn't include cross-room positions.
  // Force a repath to get a valid path from current position.
  if (currentIdx === -1 && onRoomExit) {
    const newPath = generateAndCachePath();
    if (!newPath) {
      return ERR_NO_PATH;
    }
    path = newPath;
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

    return creep.move(direction);
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

  const pathResult = findFleePath(creep.pos, threats, range, options);

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
 * Move a creep or power creep to a target position or object.
 *
 * @param creep - The creep or power creep to move
 * @param target - Target position or object with pos property
 * @param opts - Optional movement options including visualizePathStyle
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
  const targetPos = new RoomPosition(25, 25, roomName);
  return internalMoveTo(creep, { pos: targetPos, range: 20 }, opts);
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

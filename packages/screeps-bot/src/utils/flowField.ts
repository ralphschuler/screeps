/**
 * Flow Field System - Advanced Traffic Management
 *
 * Implements flow fields for high-traffic corridors:
 * - Direction fields pointing towards frequently-used destinations
 * - Cached fields to avoid repeated pathfinding
 * - Integration with movement system
 * - Visualization support
 *
 * Flow fields provide a performance optimization for rooms with heavy traffic
 * by pre-computing direction fields that many creeps can follow without individual pathfinding.
 *
 * Addresses Issue: #33 - Advanced Features (Traffic management enhancement)
 * ROADMAP Section 20: Flow-Field-Ansätze für stark frequentierte Routen
 */

import { logger } from "../core/logger";

/**
 * Direction constants for flow field
 */
export type FlowDirection = DirectionConstant | 0; // 0 means "at destination"

/**
 * Flow field for a room
 * Maps positions to optimal direction towards a goal
 */
export interface FlowField {
  /** Target position this field points to */
  targetPos: { x: number; y: number };
  /** Room name */
  roomName: string;
  /** Direction grid (50x50) - 0 means at destination, 1-8 are directions */
  directions: FlowDirection[][];
  /** Cost grid - distance from target */
  costs: number[][];
  /** Creation tick */
  createdAt: number;
  /** TTL in ticks */
  ttl: number;
}

/**
 * Flow field cache (in global, not memory)
 * Key format: "roomName:x,y"
 */
const flowFieldCache = new Map<string, FlowField>();

/**
 * Common flow field targets per room (in global)
 * These are calculated lazily on first use
 */
const commonTargetsCache = new Map<string, RoomPosition[]>();

/**
 * Flow field configuration
 */
export interface FlowFieldConfig {
  /** TTL for flow fields in ticks */
  ttl: number;
  /** Maximum flow fields to cache per room */
  maxFieldsPerRoom: number;
  /** Minimum creep count to warrant flow field creation */
  minCreepsForField: number;
}

const DEFAULT_CONFIG: FlowFieldConfig = {
  ttl: 1500, // ~50 game ticks * 30 = 1500 ticks lifetime
  maxFieldsPerRoom: 5, // Storage, controller, each source, maybe exits
  minCreepsForField: 3 // At least 3 creeps should benefit
};

/**
 * Get flow field cache key
 */
function getFieldKey(roomName: string, x: number, y: number): string {
  return `${roomName}:${x},${y}`;
}

/**
 * Create a flow field towards a target position
 * Uses Dijkstra-like algorithm to compute optimal directions from every position
 */
export function createFlowField(
  roomName: string,
  targetPos: RoomPosition,
  config: FlowFieldConfig = DEFAULT_CONFIG
): FlowField {
  const room = Game.rooms[roomName];
  if (!room) {
    throw new Error(`Cannot create flow field for unknown room ${roomName}`);
  }

  const terrain = room.getTerrain();
  
  // Initialize grids
  const directions: FlowDirection[][] = [];
  const costs: number[][] = [];
  
  for (let x = 0; x < 50; x++) {
    directions[x] = [];
    costs[x] = [];
    for (let y = 0; y < 50; y++) {
      directions[x][y] = 0;
      costs[x][y] = Infinity;
    }
  }

  // Mark target as zero cost
  costs[targetPos.x][targetPos.y] = 0;

  // Priority queue for Dijkstra (simple array, sorted by cost)
  const queue: Array<{ x: number; y: number; cost: number }> = [
    { x: targetPos.x, y: targetPos.y, cost: 0 }
  ];

  // Process queue
  while (queue.length > 0) {
    // Get lowest cost position
    queue.sort((a, b) => a.cost - b.cost);
    const current = queue.shift();
    if (!current) break;

    const { x, y, cost } = current;

    // Already processed with better cost
    if (cost > costs[x][y]) continue;

    // Check all 8 neighbors
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;

        const nx = x + dx;
        const ny = y + dy;

        // Bounds check
        if (nx < 0 || nx >= 50 || ny < 0 || ny >= 50) continue;

        // Check terrain
        const terrainCost = terrain.get(nx, ny);
        if (terrainCost === TERRAIN_MASK_WALL) continue;

        // Calculate movement cost
        let moveCost = 1;
        if (terrainCost === TERRAIN_MASK_SWAMP) {
          moveCost = 5; // Swamp cost
        }

        // Check for roads (reduce cost)
        const structures = room.lookForAt(LOOK_STRUCTURES, nx, ny);
        const hasRoad = structures.some(s => s.structureType === STRUCTURE_ROAD);
        if (hasRoad) {
          moveCost = 1; // Road normalized to 1
        }

        // Calculate new cost
        const newCost = cost + moveCost;

        // Update if better path found
        if (newCost < costs[nx][ny]) {
          costs[nx][ny] = newCost;
          
          // Store direction from neighbor to current
          // We need to store the direction to move FROM (nx,ny) TO (x,y)
          const direction = getDirectionFromOffset(dx, dy);
          directions[nx][ny] = direction;

          // Add to queue
          queue.push({ x: nx, y: ny, cost: newCost });
        }
      }
    }
  }

  const field: FlowField = {
    targetPos: { x: targetPos.x, y: targetPos.y },
    roomName,
    directions,
    costs,
    createdAt: Game.time,
    ttl: config.ttl
  };

  return field;
}

/**
 * Get direction constant from offset
 */
function getDirectionFromOffset(dx: number, dy: number): DirectionConstant {
  if (dy === -1 && dx === 0) return TOP;
  if (dy === -1 && dx === 1) return TOP_RIGHT;
  if (dy === 0 && dx === 1) return RIGHT;
  if (dy === 1 && dx === 1) return BOTTOM_RIGHT;
  if (dy === 1 && dx === 0) return BOTTOM;
  if (dy === 1 && dx === -1) return BOTTOM_LEFT;
  if (dy === 0 && dx === -1) return LEFT;
  if (dy === -1 && dx === -1) return TOP_LEFT;
  return TOP; // Fallback
}

/**
 * Get or create flow field for a target
 */
export function getFlowField(
  roomName: string,
  targetPos: RoomPosition,
  config: FlowFieldConfig = DEFAULT_CONFIG
): FlowField | null {
  const key = getFieldKey(roomName, targetPos.x, targetPos.y);
  
  // Check cache
  const cached = flowFieldCache.get(key);
  if (cached && Game.time - cached.createdAt < cached.ttl) {
    return cached;
  }

  // Check if we should create a new field
  const room = Game.rooms[roomName];
  if (!room) return null;

  // Count creeps that might benefit
  const creepsInRoom = room.find(FIND_MY_CREEPS);
  if (creepsInRoom.length < config.minCreepsForField) {
    return null; // Not worth the CPU cost
  }

  // Create new field
  try {
    const field = createFlowField(roomName, targetPos, config);
    flowFieldCache.set(key, field);
    
    // Limit cache size per room
    pruneFlowFieldCache(roomName, config.maxFieldsPerRoom);
    
    return field;
  } catch (err) {
    logger.error(`Failed to create flow field for ${roomName} at ${targetPos}: ${err}`, {
      subsystem: "FlowField"
    });
    return null;
  }
}

/**
 * Prune old flow fields for a room
 */
function pruneFlowFieldCache(roomName: string, maxFields: number): void {
  const roomFields: Array<{ key: string; field: FlowField }> = [];
  
  for (const [key, field] of flowFieldCache.entries()) {
    if (field.roomName === roomName) {
      roomFields.push({ key, field });
    }
  }

  // Sort by age (oldest first)
  roomFields.sort((a, b) => a.field.createdAt - b.field.createdAt);

  // Remove oldest if exceeding limit
  while (roomFields.length > maxFields) {
    const oldest = roomFields.shift();
    if (oldest) {
      flowFieldCache.delete(oldest.key);
    }
  }
}

/**
 * Get direction from flow field at a position
 */
export function getFlowDirection(field: FlowField, pos: RoomPosition): FlowDirection | null {
  if (pos.roomName !== field.roomName) return null;
  if (pos.x < 0 || pos.x >= 50 || pos.y < 0 || pos.y >= 50) return null;

  const direction = field.directions[pos.x][pos.y];
  if (direction === undefined || direction === 0) return null;

  return direction;
}

/**
 * Get common flow field targets for a room
 * These are high-traffic destinations: storage, controller, sources
 */
export function getCommonTargets(roomName: string): RoomPosition[] {
  // Check cache
  const cached = commonTargetsCache.get(roomName);
  if (cached) return cached;

  const room = Game.rooms[roomName];
  if (!room || !room.controller?.my) {
    return [];
  }

  const targets: RoomPosition[] = [];

  // Storage
  if (room.storage) {
    targets.push(room.storage.pos);
  }

  // Controller
  if (room.controller) {
    targets.push(room.controller.pos);
  }

  // Sources
  const sources = room.find(FIND_SOURCES);
  for (const source of sources) {
    targets.push(source.pos);
  }

  // Cache result
  commonTargetsCache.set(roomName, targets);

  return targets;
}

/**
 * Pre-generate flow fields for common targets in a room
 * Should be called periodically (low frequency)
 */
export function pregenerateFlowFields(roomName: string): void {
  const room = Game.rooms[roomName];
  if (!room || !room.controller?.my) return;

  // Only generate if enough creeps to justify
  const creeps = room.find(FIND_MY_CREEPS);
  if (creeps.length < DEFAULT_CONFIG.minCreepsForField) return;

  const targets = getCommonTargets(roomName);
  
  for (const target of targets) {
    // Get or create field (will cache)
    getFlowField(roomName, target);
  }
}

/**
 * Visualize flow field in room
 */
export function visualizeFlowField(field: FlowField): void {
  const room = Game.rooms[field.roomName];
  if (!room) return;

  const visual = room.visual;

  // Draw flow directions
  for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 50; y++) {
      const direction = field.directions[x][y];
      if (direction === 0 || direction === undefined) continue;

      // Get arrow direction
      const offset = getOffsetFromDirection(direction);
      if (!offset) continue;

      const startX = x + 0.5;
      const startY = y + 0.5;
      const endX = startX + offset.dx * 0.3;
      const endY = startY + offset.dy * 0.3;

      // Color based on cost (closer to target = greener)
      const cost = field.costs[x][y];
      const maxCost = 50; // Arbitrary max for color scaling
      const normalizedCost = Math.min(cost / maxCost, 1);
      const green = Math.floor((1 - normalizedCost) * 255);
      const red = Math.floor(normalizedCost * 255);
      const color = `#${red.toString(16).padStart(2, "0")}${green.toString(16).padStart(2, "0")}00`;

      visual.line(startX, startY, endX, endY, {
        color,
        opacity: 0.3,
        width: 0.1
      });
    }
  }

  // Draw target
  visual.circle(field.targetPos.x, field.targetPos.y, {
    radius: 0.5,
    fill: "#00ff00",
    opacity: 0.5
  });
}

/**
 * Get offset from direction
 */
function getOffsetFromDirection(direction: DirectionConstant): { dx: number; dy: number } | null {
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
  return offsets[direction] ?? null;
}

/**
 * Clear flow field cache (for memory management)
 */
export function clearFlowFieldCache(): void {
  flowFieldCache.clear();
  commonTargetsCache.clear();
}

/**
 * Get flow field statistics
 */
export function getFlowFieldStats(): {
  cachedFields: number;
  roomsWithFields: number;
  totalMemoryEstimate: number;
} {
  const roomsWithFields = new Set<string>();
  for (const field of flowFieldCache.values()) {
    roomsWithFields.add(field.roomName);
  }

  // Rough estimate: 50x50 grid * 1 byte per cell * 2 grids = 5000 bytes per field
  const memoryPerField = 5000;
  const totalMemory = flowFieldCache.size * memoryPerField;

  return {
    cachedFields: flowFieldCache.size,
    roomsWithFields: roomsWithFields.size,
    totalMemoryEstimate: totalMemory
  };
}

/**
 * Perimeter Defense System
 *
 * Implements early room security by identifying and fortifying room exits
 * and choke points with walls and ramparts.
 *
 * ROADMAP Reference: Section 17 - Mauern & Ramparts
 * - Perimeter: Walls/Ramparts at Exits and Engpässen
 * - Core-Shell & Perimeter protection strategy
 */

import { logger } from "../core/logger";

/**
 * Exit direction type
 */
export type ExitDirection = "top" | "bottom" | "left" | "right";

/**
 * Exit position with metadata
 */
export interface ExitPosition {
  x: number;
  y: number;
  exitDirection: ExitDirection;
  isChokePoint: boolean;
}

/**
 * Perimeter defense plan for a room
 */
export interface PerimeterPlan {
  /** Wall positions for blocking exits */
  walls: ExitPosition[];
  /** Rampart positions (for allowing friendly passage) */
  ramparts: ExitPosition[];
}

/**
 * Find all exit tiles in a room
 */
export function findRoomExits(roomName: string): ExitPosition[] {
  const exits: ExitPosition[] = [];
  const terrain = Game.map.getRoomTerrain(roomName);

  // Top edge (y=0)
  for (let x = 0; x < 50; x++) {
    if (terrain.get(x, 0) !== TERRAIN_MASK_WALL) {
      exits.push({ x, y: 0, exitDirection: "top", isChokePoint: false });
    }
  }

  // Bottom edge (y=49)
  for (let x = 0; x < 50; x++) {
    if (terrain.get(x, 49) !== TERRAIN_MASK_WALL) {
      exits.push({ x, y: 49, exitDirection: "bottom", isChokePoint: false });
    }
  }

  // Left edge (x=0)
  for (let y = 1; y < 49; y++) {
    if (terrain.get(0, y) !== TERRAIN_MASK_WALL) {
      exits.push({ x: 0, y, exitDirection: "left", isChokePoint: false });
    }
  }

  // Right edge (x=49)
  for (let y = 1; y < 49; y++) {
    if (terrain.get(49, y) !== TERRAIN_MASK_WALL) {
      exits.push({ x: 49, y, exitDirection: "right", isChokePoint: false });
    }
  }

  return exits;
}

/**
 * Identify choke points (narrow passages) at exits
 * A choke point is an exit tile where the passage is narrow (2-4 tiles wide)
 */
export function identifyChokePoints(roomName: string, exits: ExitPosition[]): ExitPosition[] {
  const terrain = Game.map.getRoomTerrain(roomName);
  const chokePoints: ExitPosition[] = [];

  // Group exits by direction
  const exitsByDirection = new Map<ExitDirection, ExitPosition[]>();
  for (const exit of exits) {
    const group = exitsByDirection.get(exit.exitDirection) ?? [];
    group.push(exit);
    exitsByDirection.set(exit.exitDirection, group);
  }

  // For each direction, find narrow passages
  for (const [_direction, directionExits] of exitsByDirection) {
    // Sort by x or y depending on direction
    const sorted = [...directionExits].sort((a, b) => {
      if (a.x === b.x) return a.y - b.y;
      return a.x - b.x;
    });

    // Find gaps (groups of continuous exits)
    let groupStart = 0;
    for (let i = 1; i <= sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];

      // Check if there's a gap
      const isGap =
        !curr ||
        (prev && curr && (Math.abs(curr.x - prev.x) > 1 || Math.abs(curr.y - prev.y) > 1));

      if (isGap) {
        const groupSize = i - groupStart;
        const group = sorted.slice(groupStart, i);

        // Choke points are narrow passages (2-4 tiles wide)
        if (groupSize >= 2 && groupSize <= 4) {
          for (const exit of group) {
            exit.isChokePoint = true;
            chokePoints.push(exit);
          }
        }

        groupStart = i;
      }
    }
  }

  return chokePoints;
}

/**
 * Check if a coordinate is in the gap position (center of wall line)
 * Gap positions are where ramparts are placed for friendly passage
 */
function isGapPosition(coord: number): boolean {
  return coord >= 24 && coord <= 25;
}

/**
 * Calculate optimal perimeter defense positions
 * Creates continuous wall lines with strategic gaps (ramparts) for friendly passage.
 * 
 * Screeps requires walls/ramparts to be placed at least 2 tiles from room exits.
 * Exit tiles are at coordinates 0 and 49, so walls must be at 2 and 47.
 * 
 * Strategy:
 * - Build continuous walls along x=2, x=47, y=2, y=47
 * - Create gaps (rampart-only positions) at strategic locations for friendly passage
 * - Gaps are placed at the center of each exit line for easy access
 */
export function calculatePerimeterPositions(roomName: string): PerimeterPlan {
  const terrain = Game.map.getRoomTerrain(roomName);
  const walls: ExitPosition[] = [];
  const ramparts: ExitPosition[] = [];

  // Build continuous perimeter walls at 2 tiles from edges
  // with gaps for ramparts at center positions
  
  // Top wall (y=2): x from 2 to 47, gap at center (x=24-25)
  for (let x = 2; x <= 47; x++) {
    if (terrain.get(x, 2) === TERRAIN_MASK_WALL) continue;
    
    if (isGapPosition(x)) {
      ramparts.push({ x, y: 2, exitDirection: "top", isChokePoint: false });
    } else {
      walls.push({ x, y: 2, exitDirection: "top", isChokePoint: false });
    }
  }

  // Bottom wall (y=47): x from 2 to 47, gap at center (x=24-25)
  for (let x = 2; x <= 47; x++) {
    if (terrain.get(x, 47) === TERRAIN_MASK_WALL) continue;
    
    if (isGapPosition(x)) {
      ramparts.push({ x, y: 47, exitDirection: "bottom", isChokePoint: false });
    } else {
      walls.push({ x, y: 47, exitDirection: "bottom", isChokePoint: false });
    }
  }

  // Left wall (x=2): y from 2 to 47, gap at center (y=24-25)
  for (let y = 2; y <= 47; y++) {
    if (terrain.get(2, y) === TERRAIN_MASK_WALL) continue;
    
    if (isGapPosition(y)) {
      ramparts.push({ x: 2, y, exitDirection: "left", isChokePoint: false });
    } else {
      walls.push({ x: 2, y, exitDirection: "left", isChokePoint: false });
    }
  }

  // Right wall (x=47): y from 2 to 47, gap at center (y=24-25)
  for (let y = 2; y <= 47; y++) {
    if (terrain.get(47, y) === TERRAIN_MASK_WALL) continue;
    
    if (isGapPosition(y)) {
      ramparts.push({ x: 47, y, exitDirection: "right", isChokePoint: false });
    } else {
      walls.push({ x: 47, y, exitDirection: "right", isChokePoint: false });
    }
  }

  return { walls, ramparts };
}

/**
 * Place perimeter defense construction sites
 * 
 * Builds continuous perimeter walls with strategic gaps (ramparts only) for friendly passage.
 * Walls form a complete barrier around the room, with rampart-only gaps at central positions
 * on each side to allow friendly creeps to pass while blocking enemies.
 * 
 * Strategy (per ROADMAP Section 17 - Mauern & Ramparts):
 * - Walls block all creeps
 * - Ramparts (without walls underneath) allow friendly creeps but block enemies
 * - Build continuous walls along perimeter (x=2, x=47, y=2, y=47)
 * - Create 2-tile wide gaps at center of each side with ramparts only
 * 
 * @param room The room to defend
 * @param rcl Current room control level
 * @param maxSites Maximum construction sites to place
 * @param prioritizeChokePoints Whether to prioritize choke points (not used in new strategy)
 * @returns Number of sites placed
 */
export function placePerimeterDefense(
  room: Room,
  rcl: number,
  maxSites = 3,
  prioritizeChokePoints = true
): number {
  // RCL requirements
  // RCL 2: Start placing perimeter walls
  // RCL 3+: Complete perimeter walls and add ramparts at gap positions
  if (rcl < 2) return 0;

  const plan = calculatePerimeterPositions(room.name);
  const existingSites = room.find(FIND_MY_CONSTRUCTION_SITES);
  const existingStructures = room.find(FIND_STRUCTURES);

  // Check site limit
  if (existingSites.length >= 10) return 0;

  let placed = 0;
  const maxToPlace = Math.min(maxSites, 10 - existingSites.length);

  // Get structure counts
  const wallCount = existingStructures.filter(
    s => s.structureType === STRUCTURE_WALL
  ).length + existingSites.filter(
    s => s.structureType === STRUCTURE_WALL
  ).length;

  const rampartCount = existingStructures.filter(
    s => s.structureType === STRUCTURE_RAMPART
  ).length + existingSites.filter(
    s => s.structureType === STRUCTURE_RAMPART
  ).length;

  // RCL structure limits (from ROADMAP)
  const wallLimit = rcl >= 2 ? 2500 : 0;
  const rampartLimit = rcl >= 2 ? 2500 : 0;

  // Priority 1: Place walls along perimeter (RCL 2+)
  if (rcl >= 2 && placed < maxToPlace && wallCount < wallLimit) {
    for (const wall of plan.walls) {
      if (placed >= maxToPlace) break;
      if (wallCount + placed >= wallLimit) break;

      // Check if position already has a structure or site
      const hasStructure = existingStructures.some(
        s => s.pos.x === wall.x && s.pos.y === wall.y && 
        (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART)
      );
      const hasSite = existingSites.some(
        s => s.pos.x === wall.x && s.pos.y === wall.y &&
        (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART)
      );

      if (!hasStructure && !hasSite) {
        const result = room.createConstructionSite(wall.x, wall.y, STRUCTURE_WALL);
        if (result === OK) {
          placed++;
          logger.debug(
            `Placed perimeter wall at (${wall.x},${wall.y})`,
            { subsystem: "Defense" }
          );
        }
      }
    }
  }

  // Priority 2: Remove walls at gap positions (RCL 3+)
  // These positions should only have ramparts for friendly passage
  if (rcl >= 3) {
    for (const rampart of plan.ramparts) {
      // Check if there's a wall at this gap position
      const wallAtGap = existingStructures.find(
        s => s.pos.x === rampart.x && s.pos.y === rampart.y && s.structureType === STRUCTURE_WALL
      ) as StructureWall | undefined;
      
      if (wallAtGap) {
        // Destroy wall at gap position to allow rampart placement
        const result = wallAtGap.destroy();
        if (result === OK) {
          logger.info(
            `Removed wall at gap position (${rampart.x},${rampart.y}) to allow friendly passage`,
            { subsystem: "Defense" }
          );
        }
      }
    }
  }

  // Priority 3: Place ramparts at gap positions (RCL 3+)
  // These are rampart-only positions (no wall underneath) to allow friendly passage
  if (rcl >= 3 && placed < maxToPlace && rampartCount < rampartLimit) {
    for (const rampart of plan.ramparts) {
      if (placed >= maxToPlace) break;
      if (rampartCount + placed >= rampartLimit) break;

      // Check if position already has a rampart
      const hasRampart = existingStructures.some(
        s => s.pos.x === rampart.x && s.pos.y === rampart.y && s.structureType === STRUCTURE_RAMPART
      );
      const hasRampartSite = existingSites.some(
        s => s.pos.x === rampart.x && s.pos.y === rampart.y && s.structureType === STRUCTURE_RAMPART
      );

      // Don't place if there's a wall here (walls should not be at rampart-only positions)
      const hasWall = existingStructures.some(
        s => s.pos.x === rampart.x && s.pos.y === rampart.y && s.structureType === STRUCTURE_WALL
      );

      if (!hasRampart && !hasRampartSite && !hasWall) {
        const result = room.createConstructionSite(rampart.x, rampart.y, STRUCTURE_RAMPART);
        if (result === OK) {
          placed++;
          logger.debug(
            `Placed perimeter rampart gap at (${rampart.x},${rampart.y})`,
            { subsystem: "Defense" }
          );
        }
      }
    }
  }

  return placed;
}

/**
 * Get perimeter defense statistics for a room
 */
export interface PerimeterStats {
  totalExits: number;
  chokePoints: number;
  wallsBuilt: number;
  rampartsBuilt: number;
  coveragePercent: number;
}

export function getPerimeterStats(room: Room): PerimeterStats {
  const plan = calculatePerimeterPositions(room.name);
  const structures = room.find(FIND_STRUCTURES);

  const totalExits = plan.walls.length;
  const chokePoints = plan.walls.filter(w => w.isChokePoint).length;

  const walls = structures.filter(s => s.structureType === STRUCTURE_WALL);
  const ramparts = structures.filter(s => s.structureType === STRUCTURE_RAMPART);

  // Count perimeter walls (at exit positions)
  let wallsBuilt = 0;
  for (const wall of walls) {
    const isPerimeter = plan.walls.some(
      p => p.x === wall.pos.x && p.y === wall.pos.y
    );
    if (isPerimeter) wallsBuilt++;
  }

  // Count perimeter ramparts
  let rampartsBuilt = 0;
  for (const rampart of ramparts) {
    const isPerimeter = plan.walls.some(
      p => p.x === rampart.pos.x && p.y === rampart.pos.y
    );
    if (isPerimeter) rampartsBuilt++;
  }

  const coveragePercent = totalExits > 0 
    ? Math.round((wallsBuilt / totalExits) * 100) 
    : 0;

  return {
    totalExits,
    chokePoints,
    wallsBuilt,
    rampartsBuilt,
    coveragePercent
  };
}

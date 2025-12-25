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

import { logger } from "@bot/core/logger";

/**
 * Minimum size of an exit group to warrant a rampart gap for friendly passage.
 * Groups smaller than this will have walls only (no gaps).
 */
const MIN_GROUP_SIZE_FOR_GAP = 4;

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
 * 
 * Identifies positions at room edges that are actual exits (not blocked by terrain or structures).
 * If there's a barrier structure (wall or rampart) at the room edge, it's not considered an exit (already blocked).
 */
export function findRoomExits(roomName: string): ExitPosition[] {
  const exits: ExitPosition[] = [];
  const terrain = Game.map.getRoomTerrain(roomName);
  
  // Get the room to check for existing barrier structures (walls and ramparts)
  const room = Game.rooms[roomName];
  
  // Build a set of positions with barrier structures for fast lookup
  const barrierPositions = new Set<string>();
  if (room) {
    const barriers = room.find(FIND_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART
    });
    for (const barrier of barriers) {
      barrierPositions.add(`${barrier.pos.x},${barrier.pos.y}`);
    }
  }

  // Top edge (y=0)
  for (let x = 0; x < 50; x++) {
    // Skip if terrain is wall or if there's already a barrier structure
    if (terrain.get(x, 0) !== TERRAIN_MASK_WALL && !barrierPositions.has(`${x},0`)) {
      exits.push({ x, y: 0, exitDirection: "top", isChokePoint: false });
    }
  }

  // Bottom edge (y=49)
  for (let x = 0; x < 50; x++) {
    // Skip if terrain is wall or if there's already a barrier structure
    if (terrain.get(x, 49) !== TERRAIN_MASK_WALL && !barrierPositions.has(`${x},49`)) {
      exits.push({ x, y: 49, exitDirection: "bottom", isChokePoint: false });
    }
  }

  // Left edge (x=0)
  for (let y = 1; y < 49; y++) {
    // Skip if terrain is wall or if there's already a barrier structure
    if (terrain.get(0, y) !== TERRAIN_MASK_WALL && !barrierPositions.has(`0,${y}`)) {
      exits.push({ x: 0, y, exitDirection: "left", isChokePoint: false });
    }
  }

  // Right edge (x=49)
  for (let y = 1; y < 49; y++) {
    // Skip if terrain is wall or if there's already a barrier structure
    if (terrain.get(49, y) !== TERRAIN_MASK_WALL && !barrierPositions.has(`49,${y}`)) {
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
  const chokePoints: ExitPosition[] = [];

  // Group exits by direction
  const exitsByDirection = new Map<ExitDirection, ExitPosition[]>();
  for (const exit of exits) {
    const group = exitsByDirection.get(exit.exitDirection) ?? [];
    group.push(exit);
    exitsByDirection.set(exit.exitDirection, group);
  }

  // For each direction, find narrow passages
  for (const directionExits of exitsByDirection.values()) {
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
 * Calculate optimal perimeter defense positions
 * Places walls at exit points only (not a complete square).
 * 
 * Screeps requires walls/ramparts to be placed at least 2 tiles from room exits.
 * Exit tiles are at coordinates 0 and 49, so walls must be at 2 and 47.
 * 
 * Strategy (per ROADMAP Section 17 - Mauern & Ramparts):
 * - Identify actual exit tiles (non-wall terrain at x=0, x=49, y=0, y=49)
 * - Place walls 2 tiles inside from each exit tile
 * - Create gaps (rampart-only positions) at the center of each exit group for friendly passage
 * - This creates walls only at exits, not a complete square perimeter
 */
export function calculatePerimeterPositions(roomName: string): PerimeterPlan {
  const terrain = Game.map.getRoomTerrain(roomName);
  const walls: ExitPosition[] = [];
  const ramparts: ExitPosition[] = [];

  // Find all exit tiles (actual room exits)
  const exits = findRoomExits(roomName);
  
  // Group exits by direction to identify continuous exit sections
  const exitsByDirection = new Map<ExitDirection, ExitPosition[]>();
  for (const exit of exits) {
    const group = exitsByDirection.get(exit.exitDirection) ?? [];
    group.push(exit);
    exitsByDirection.set(exit.exitDirection, group);
  }
  
  // For each exit direction, identify continuous exit groups and place walls
  for (const [direction, directionExits] of exitsByDirection) {
    // Sort exits by coordinate (x for top/bottom, y for left/right)
    const sorted = [...directionExits].sort((a, b) => {
      if (a.x === b.x) return a.y - b.y;
      return a.x - b.x;
    });
    
    // Group continuous exits (gaps in terrain create separate groups)
    const groups: ExitPosition[][] = [];
    let currentGroup: ExitPosition[] = [];
    
    for (let i = 0; i < sorted.length; i++) {
      const exit = sorted[i];
      const prev = sorted[i - 1];
      
      // Check if this exit is continuous with the previous one
      const isContinuous = prev && 
        (Math.abs(exit.x - prev.x) <= 1 && Math.abs(exit.y - prev.y) <= 1);
      
      if (!isContinuous && currentGroup.length > 0) {
        // Start a new group
        groups.push(currentGroup);
        currentGroup = [];
      }
      
      currentGroup.push(exit);
    }
    
    // Don't forget the last group
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    // For each group of continuous exits, place walls 2 tiles inside with a gap in the center
    for (const group of groups) {
      // Determine the center of the group for gap placement
      const centerIndex = Math.floor(group.length / 2);
      
      for (let i = 0; i < group.length; i++) {
        const exit = group[i];
        
        // Calculate wall position (2 tiles inside from exit)
        let wallX = exit.x;
        let wallY = exit.y;
        
        switch (direction) {
          case "top":
            wallY = 2;
            break;
          case "bottom":
            wallY = 47;
            break;
          case "left":
            wallX = 2;
            break;
          case "right":
            wallX = 47;
            break;
        }
        
        // Skip if terrain is wall at wall position
        if (terrain.get(wallX, wallY) === TERRAIN_MASK_WALL) continue;
        
        // Create a 2-tile wide gap in the center of each exit group
        // Gap is placed at center ± 1 for groups large enough to warrant friendly passage
        const isGap = group.length >= MIN_GROUP_SIZE_FOR_GAP && (i === centerIndex || i === centerIndex - 1);
        
        if (isGap) {
          ramparts.push({ x: wallX, y: wallY, exitDirection: direction, isChokePoint: false });
        } else {
          walls.push({ x: wallX, y: wallY, exitDirection: direction, isChokePoint: false });
        }
      }
    }
  }

  return { walls, ramparts };
}

/**
 * Place perimeter defense construction sites
 * 
 * Builds walls at room exits only (not a complete square perimeter).
 * For each exit group, walls are placed 2 tiles inside with strategic gaps (ramparts only)
 * in the center to allow friendly creeps to pass while blocking enemies.
 * 
 * Strategy (per ROADMAP Section 17 - Mauern & Ramparts):
 * - Walls block all creeps
 * - Ramparts (without walls underneath) allow friendly creeps but block enemies
 * - Build walls at exits only (where creeps can actually enter the room)
 * - Walls are placed 2 tiles inside from exit tiles (at x=2, x=47, y=2, y=47)
 * - Create 2-tile wide gaps at center of each exit group with ramparts only
 * - This avoids creating a complete square, only fortifying actual entry points
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
  _prioritizeChokePoints = true
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
  // Only remove walls if there's no rampart yet (to avoid destroying walls unnecessarily)
  if (rcl >= 3) {
    for (const rampart of plan.ramparts) {
      // Check if there's already a rampart at this position
      const hasRampart = existingStructures.some(
        s => s.pos.x === rampart.x && s.pos.y === rampart.y && s.structureType === STRUCTURE_RAMPART
      );
      const hasRampartSite = existingSites.some(
        s => s.pos.x === rampart.x && s.pos.y === rampart.y && s.structureType === STRUCTURE_RAMPART
      );
      
      // Only destroy wall if there's no rampart yet
      if (!hasRampart && !hasRampartSite) {
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
          } else {
            logger.warn(
              `Failed to destroy wall at gap position (${rampart.x},${rampart.y}): ${result}`,
              { subsystem: "Defense" }
            );
          }
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
  totalWallPositions: number;
  totalGapPositions: number;
  wallsBuilt: number;
  rampartsBuilt: number;
  wallCoveragePercent: number;
  gapCoveragePercent: number;
}

export function getPerimeterStats(room: Room): PerimeterStats {
  const plan = calculatePerimeterPositions(room.name);
  const structures = room.find(FIND_STRUCTURES);

  const totalWallPositions = plan.walls.length;
  const totalGapPositions = plan.ramparts.length;

  const walls = structures.filter(s => s.structureType === STRUCTURE_WALL);
  const ramparts = structures.filter(s => s.structureType === STRUCTURE_RAMPART);

  // Count perimeter walls (at planned wall positions)
  let wallsBuilt = 0;
  for (const wall of walls) {
    const isPerimeter = plan.walls.some(
      p => p.x === wall.pos.x && p.y === wall.pos.y
    );
    if (isPerimeter) wallsBuilt++;
  }

  // Count perimeter ramparts (at planned gap positions)
  let rampartsBuilt = 0;
  for (const rampart of ramparts) {
    const isPerimeterGap = plan.ramparts.some(
      p => p.x === rampart.pos.x && p.y === rampart.pos.y
    );
    if (isPerimeterGap) rampartsBuilt++;
  }

  const wallCoveragePercent = totalWallPositions > 0 
    ? Math.round((wallsBuilt / totalWallPositions) * 100) 
    : 0;
  
  const gapCoveragePercent = totalGapPositions > 0
    ? Math.round((rampartsBuilt / totalGapPositions) * 100)
    : 0;

  return {
    totalWallPositions,
    totalGapPositions,
    wallsBuilt,
    rampartsBuilt,
    wallCoveragePercent,
    gapCoveragePercent
  };
}

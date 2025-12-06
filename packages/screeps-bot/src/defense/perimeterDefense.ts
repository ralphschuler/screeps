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
 * Calculate optimal perimeter defense positions
 * Returns positions one tile inside the room from exits to allow construction
 */
export function calculatePerimeterPositions(roomName: string): PerimeterPlan {
  const exits = findRoomExits(roomName);
  const chokePoints = identifyChokePoints(roomName, exits);
  const terrain = Game.map.getRoomTerrain(roomName);

  const walls: ExitPosition[] = [];
  const ramparts: ExitPosition[] = [];

  // For each exit, place a wall one tile inside the room
  for (const exit of exits) {
    // Calculate position one tile inside the room
    let innerX = exit.x;
    let innerY = exit.y;

    switch (exit.exitDirection) {
      case "top":
        innerY = 1;
        break;
      case "bottom":
        innerY = 48;
        break;
      case "left":
        innerX = 1;
        break;
      case "right":
        innerX = 48;
        break;
    }

    // Skip if position is a wall
    if (terrain.get(innerX, innerY) === TERRAIN_MASK_WALL) {
      continue;
    }

    const innerExit: ExitPosition = {
      x: innerX,
      y: innerY,
      exitDirection: exit.exitDirection,
      isChokePoint: exit.isChokePoint
    };

    // Add all exits to walls array; priority is handled during placement
    walls.push(innerExit);
  }

  return { walls, ramparts };
}

/**
 * Place perimeter defense construction sites
 * 
 * @param room The room to defend
 * @param rcl Current room control level
 * @param maxSites Maximum construction sites to place
 * @param prioritizeChokePoints Whether to prioritize choke points
 * @returns Number of sites placed
 */
export function placePerimeterDefense(
  room: Room,
  rcl: number,
  maxSites = 3,
  prioritizeChokePoints = true
): number {
  // RCL requirements
  // RCL 2: Start placing walls at choke points
  // RCL 3+: Place walls at all exits, add ramparts
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

  // Priority 1: Choke points with walls (RCL 2+)
  if (prioritizeChokePoints && rcl >= 2 && wallCount < wallLimit) {
    const chokeWalls = plan.walls.filter(w => w.isChokePoint);
    
    for (const wall of chokeWalls) {
      if (placed >= maxToPlace) break;
      if (wallCount + placed >= wallLimit) break;

      // Check if already exists
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
            `Placed perimeter wall at choke point (${wall.x},${wall.y})`,
            { subsystem: "Defense" }
          );
        }
      }
    }
  }

  // Priority 2: Regular exit walls (RCL 3+)
  if (rcl >= 3 && placed < maxToPlace && wallCount < wallLimit) {
    const regularWalls = plan.walls.filter(w => !w.isChokePoint);
    
    for (const wall of regularWalls) {
      if (placed >= maxToPlace) break;
      if (wallCount + placed >= wallLimit) break;

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
            `Placed perimeter wall at exit (${wall.x},${wall.y})`,
            { subsystem: "Defense" }
          );
        }
      }
    }
  }

  // Priority 3: Ramparts at key positions (RCL 3+, after walls)
  if (rcl >= 3 && placed < maxToPlace && rampartCount < rampartLimit) {
    // Place ramparts at choke points to allow friendly passage
    const chokeWalls = plan.walls.filter(w => w.isChokePoint);
    
    for (const pos of chokeWalls) {
      if (placed >= maxToPlace) break;
      if (rampartCount + placed >= rampartLimit) break;

      // Only place rampart if there's already a wall here
      const hasWall = existingStructures.some(
        s => s.pos.x === pos.x && s.pos.y === pos.y && s.structureType === STRUCTURE_WALL
      );
      
      if (hasWall) {
        const hasRampart = existingStructures.some(
          s => s.pos.x === pos.x && s.pos.y === pos.y && s.structureType === STRUCTURE_RAMPART
        );
        const hasRampartSite = existingSites.some(
          s => s.pos.x === pos.x && s.pos.y === pos.y && s.structureType === STRUCTURE_RAMPART
        );

        if (!hasRampart && !hasRampartSite) {
          // Place rampart on the same tile as wall for protection
          const result = room.createConstructionSite(pos.x, pos.y, STRUCTURE_RAMPART);
          if (result === OK) {
            placed++;
            logger.debug(
              `Placed perimeter rampart at (${pos.x},${pos.y})`,
              { subsystem: "Defense" }
            );
          }
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

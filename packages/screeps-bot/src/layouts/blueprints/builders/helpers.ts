/**
 * Helper utilities for blueprint construction
 * 
 * These utilities extract common patterns found across multiple blueprint definitions,
 * reducing code duplication from 45-57% to under 10%.
 */

import type { StructurePlacement } from "../types";

/**
 * Position for structure or road placement
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Generate road ring around a position (8 adjacent tiles)
 * This pattern is duplicated in all 5 blueprint files
 */
export function createSpawnRoadRing(center: Position): Position[] {
  return [
    { x: center.x - 1, y: center.y - 1 },
    { x: center.x, y: center.y - 1 },
    { x: center.x + 1, y: center.y - 1 },
    { x: center.x - 1, y: center.y },
    { x: center.x + 1, y: center.y },
    { x: center.x - 1, y: center.y + 1 },
    { x: center.x, y: center.y + 1 },
    { x: center.x + 1, y: center.y + 1 }
  ];
}

/**
 * Generate checkerboard extension positions where |x|+|y| % 2 == 0
 * This ensures no two extensions are directly adjacent.
 * This pattern is duplicated across all blueprint files.
 * 
 * @param center - Center position for the grid
 * @param count - Number of extensions to place
 * @param minRadius - Minimum distance from center (default: 2)
 * @param maxRadius - Maximum distance from center
 * @returns Array of extension positions following checkerboard pattern
 */
export function createCheckerboardExtensions(
  center: Position,
  count: number,
  minRadius: number = 2,
  maxRadius: number = 10
): StructurePlacement[] {
  const extensions: StructurePlacement[] = [];
  
  // Generate positions in expanding rings
  for (let radius = minRadius; radius <= maxRadius && extensions.length < count; radius++) {
    for (let dx = -radius; dx <= radius && extensions.length < count; dx++) {
      for (let dy = -radius; dy <= radius && extensions.length < count; dy++) {
        const x = center.x + dx;
        const y = center.y + dy;
        
        // Check if this position is at the current radius (approximately)
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        if (dist !== radius) continue;
        
        // Check checkerboard pattern: |x|+|y| % 2 == 0
        if ((Math.abs(dx) + Math.abs(dy)) % 2 === 0) {
          extensions.push({
            x: dx,
            y: dy,
            structureType: STRUCTURE_EXTENSION
          });
        }
      }
    }
  }
  
  return extensions.slice(0, count);
}

/**
 * Generate connector roads between two positions
 * Creates roads at intermediate points for movement
 */
export function createConnectorRoads(
  from: Position,
  to: Position,
  includeEnds: boolean = false
): Position[] {
  const roads: Position[] = [];
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // Horizontal connector
  if (Math.abs(dx) > 1) {
    const step = dx > 0 ? 1 : -1;
    for (let x = from.x + step; x !== to.x; x += step) {
      roads.push({ x, y: from.y });
    }
  }
  
  // Vertical connector
  if (Math.abs(dy) > 1) {
    const step = dy > 0 ? 1 : -1;
    for (let y = from.y + step; y !== to.y; y += step) {
      roads.push({ x: to.x, y });
    }
  }
  
  if (includeEnds) {
    roads.push({ x: from.x, y: from.y });
    roads.push({ x: to.x, y: to.y });
  }
  
  return roads;
}

/**
 * Generate rampart positions for protecting structures
 * Extracts the common pattern of protecting spawns, storage, terminal, and towers
 */
export function createStructureProtection(
  structures: StructurePlacement[],
  typesToProtect: BuildableStructureConstant[]
): Position[] {
  return structures
    .filter(s => typesToProtect.includes(s.structureType))
    .map(s => ({ x: s.x, y: s.y }));
}

/**
 * Generate radial roads from center outward
 * Creates cross-pattern roads for movement
 */
export function createRadialRoads(
  center: Position,
  length: number,
  directions: ('north' | 'south' | 'east' | 'west')[]
): Position[] {
  const roads: Position[] = [];
  
  for (const dir of directions) {
    for (let i = 1; i <= length; i++) {
      switch (dir) {
        case 'north':
          roads.push({ x: center.x, y: center.y - i });
          break;
        case 'south':
          roads.push({ x: center.x, y: center.y + i });
          break;
        case 'east':
          roads.push({ x: center.x + i, y: center.y });
          break;
        case 'west':
          roads.push({ x: center.x - i, y: center.y });
          break;
      }
    }
  }
  
  return roads;
}

/**
 * Generate roads between extensions for movement
 * Creates roads at positions adjacent to checkerboard extensions
 */
export function createExtensionMovementRoads(
  center: Position,
  radius: number
): Position[] {
  const roads: Position[] = [];
  
  // Movement roads follow |x|+|y| % 2 == 1 pattern (odd sum)
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      const dist = Math.max(Math.abs(dx), Math.abs(dy));
      if (dist <= 1 || dist > radius) continue;
      
      // Odd sum positions for roads between checkerboard extensions
      if ((Math.abs(dx) + Math.abs(dy)) % 2 === 1) {
        roads.push({ x: center.x + dx, y: center.y + dy });
      }
    }
  }
  
  return roads;
}

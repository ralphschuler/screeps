/**
 * Blueprint validation logic - validates blueprint fit and finds optimal anchor positions
 */

import type { Blueprint } from "./types";

/**
 * Blueprint space and validation constants
 */
const DEFAULT_MIN_SPACE_RADIUS = 7;
const MAX_BUNKER_WALL_PERCENTAGE = 10; // Bunkers require mostly open terrain
const MAX_SPREAD_WALL_PERCENTAGE = 25; // Spread layouts are more flexible
const MAX_ANCHOR_SEARCH_RADIUS = 15; // Maximum distance from ideal center to search

/**
 * Check if a position is suitable for a spawn
 */
export function isValidSpawnPosition(room: Room, x: number, y: number): boolean {
  const terrain = room.getTerrain();

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const px = x + dx;
      const py = y + dy;

      if (px < 1 || px > 48 || py < 1 || py > 48) return false;
      if (terrain.get(px, py) === TERRAIN_MASK_WALL) return false;
    }
  }

  return true;
}

/**
 * Find best spawn position for a new colony
 */
export function findBestSpawnPosition(room: Room): RoomPosition | null {
  const controller = room.controller;
  if (!controller) return null;

  const sources = room.find(FIND_SOURCES);
  const terrain = room.getTerrain();

  let sumX = controller.pos.x;
  let sumY = controller.pos.y;
  for (const source of sources) {
    sumX += source.pos.x;
    sumY += source.pos.y;
  }

  const centerX = Math.round(sumX / (sources.length + 1));
  const centerY = Math.round(sumY / (sources.length + 1));

  for (let radius = 0; radius < 15; radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;

        const x = centerX + dx;
        const y = centerY + dy;

        if (x < 3 || x > 46 || y < 3 || y > 46) continue;

        if (isValidSpawnPosition(room, x, y)) {
          const distToController = Math.max(Math.abs(x - controller.pos.x), Math.abs(y - controller.pos.y));
          if (distToController > 20) continue;

          if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;

          return new RoomPosition(x, y, room.name);
        }
      }
    }
  }

  return null;
}

/**
 * Validate if a blueprint can fit in the room at the given anchor position
 * 
 * @param room The room to check
 * @param anchor The anchor position for the blueprint
 * @param blueprint The blueprint to validate
 * @returns Object with validation result and details
 */
export function validateBlueprintFit(
  room: Room,
  anchor: RoomPosition,
  blueprint: Blueprint
): { fits: boolean; reason?: string; wallCount?: number; totalTiles?: number } {
  const terrain = room.getTerrain();
  const minRadius = blueprint.minSpaceRadius ?? DEFAULT_MIN_SPACE_RADIUS;
  
  let wallCount = 0;
  let totalTiles = 0;
  
  // Check if anchor is in valid range
  if (anchor.x < minRadius || anchor.x > 49 - minRadius ||
      anchor.y < minRadius || anchor.y > 49 - minRadius) {
    return { 
      fits: false, 
      reason: `Anchor too close to room edge (needs ${minRadius} tile margin)` 
    };
  }
  
  // Check all structure positions
  for (const structure of blueprint.structures) {
    const x = anchor.x + structure.x;
    const y = anchor.y + structure.y;
    
    if (x < 1 || x > 48 || y < 1 || y > 48) {
      return { 
        fits: false, 
        reason: `Structure ${structure.structureType} at (${structure.x},${structure.y}) would be outside room bounds` 
      };
    }
    
    totalTiles++;
    if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
      wallCount++;
    }
  }
  
  // Check road positions
  for (const road of blueprint.roads) {
    const x = anchor.x + road.x;
    const y = anchor.y + road.y;
    
    if (x < 1 || x > 48 || y < 1 || y > 48) {
      continue; // Roads outside bounds are okay, just skip them
    }
    
    totalTiles++;
    if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
      wallCount++;
    }
  }
  
  // Calculate wall percentage
  const wallPercentage = totalTiles > 0 ? (wallCount / totalTiles) * 100 : 0;
  
  // Bunker blueprints are strict - require mostly open terrain
  if (blueprint.type === "bunker" && wallPercentage > MAX_BUNKER_WALL_PERCENTAGE) {
    return {
      fits: false,
      reason: `Too many walls in blueprint area (${wallPercentage.toFixed(1)}% walls, max ${MAX_BUNKER_WALL_PERCENTAGE}% for bunker)`,
      wallCount,
      totalTiles
    };
  }
  
  // Spread blueprints are more flexible with terrain obstacles
  if (blueprint.type === "spread" && wallPercentage > MAX_SPREAD_WALL_PERCENTAGE) {
    return {
      fits: false,
      reason: `Too many walls in blueprint area (${wallPercentage.toFixed(1)}% walls, max ${MAX_SPREAD_WALL_PERCENTAGE}% for spread layout)`,
      wallCount,
      totalTiles
    };
  }
  
  return { fits: true, wallCount, totalTiles };
}

/**
 * Find the best anchor position for a blueprint in a room
 * 
 * @param room The room to search
 * @param blueprint The blueprint to place
 * @returns Best anchor position or null if blueprint doesn't fit anywhere
 */
export function findBestBlueprintAnchor(
  room: Room,
  blueprint: Blueprint
): RoomPosition | null {
  const controller = room.controller;
  if (!controller) return null;
  
  const sources = room.find(FIND_SOURCES);
  const mineral = room.find(FIND_MINERALS)[0];
  
  // Calculate ideal center point (between controller and sources)
  let sumX = controller.pos.x;
  let sumY = controller.pos.y;
  for (const source of sources) {
    sumX += source.pos.x;
    sumY += source.pos.y;
  }
  const idealX = Math.round(sumX / (sources.length + 1));
  const idealY = Math.round(sumY / (sources.length + 1));
  
  const minRadius = blueprint.minSpaceRadius ?? DEFAULT_MIN_SPACE_RADIUS;
  const candidates: { pos: RoomPosition; score: number }[] = [];
  
  // Search in expanding rings from ideal center
  for (let radius = 0; radius <= MAX_ANCHOR_SEARCH_RADIUS; radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        // Only check positions on the current ring
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius && radius > 0) continue;
        
        const x = idealX + dx;
        const y = idealY + dy;
        
        // Skip if too close to edge
        if (x < minRadius || x > 49 - minRadius || y < minRadius || y > 49 - minRadius) {
          continue;
        }
        
        const pos = new RoomPosition(x, y, room.name);
        const validation = validateBlueprintFit(room, pos, blueprint);
        
        if (validation.fits) {
          // Score based on distance to key positions
          let score = 1000;
          
          // Prefer positions closer to controller (but not too close)
          const controllerDist = pos.getRangeTo(controller);
          if (controllerDist >= 4 && controllerDist <= 8) {
            score += 100;
          } else if (controllerDist < 4) {
            score -= 50;
          } else if (controllerDist > 12) {
            score -= 30;
          }
          
          // Prefer positions with good source access
          let totalSourceDist = 0;
          for (const source of sources) {
            totalSourceDist += pos.getRangeTo(source);
          }
          const avgSourceDist = totalSourceDist / sources.length;
          if (avgSourceDist >= 5 && avgSourceDist <= 10) {
            score += 80;
          } else if (avgSourceDist < 5) {
            score -= 20;
          }
          
          // Prefer positions closer to room center
          const centerDist = Math.abs(x - 25) + Math.abs(y - 25);
          if (centerDist < 10) {
            score += 50;
          } else if (centerDist > 20) {
            score -= 30;
          }
          
          // Bonus for fewer walls in blueprint area
          if (validation.wallCount !== undefined && validation.totalTiles !== undefined) {
            const wallPercentage = (validation.wallCount / validation.totalTiles) * 100;
            score += Math.max(0, 50 - wallPercentage * 2);
          }
          
          candidates.push({ pos, score });
        }
      }
    }
    
    // If we found candidates, return the best one
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      return candidates[0].pos;
    }
  }
  
  return null;
}

/**
 * Automatic Layout Planner
 *
 * Analyzes room terrain and automatically determines optimal
 * base layout anchor position.
 *
 * Addresses Issue: #18
 */

import { logger } from "../core/logger";

/**
 * Layout scoring result
 */
interface LayoutScore {
  pos: RoomPosition;
  score: number;
  reasons: string[];
}

/**
 * Find optimal anchor position for base layout
 */
export function findOptimalAnchor(room: Room): RoomPosition | null {
  const controller = room.controller;
  if (!controller) return null;

  const sources = room.find(FIND_SOURCES);
  const mineral = room.find(FIND_MINERALS)[0];
  const terrain = room.getTerrain();

  // Cache terrain data for performance (Issue #40)
  const terrainCache = new Map<string, number>();
  for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 50; y++) {
      terrainCache.set(`${x},${y}`, terrain.get(x, y));
    }
  }

  const candidates: LayoutScore[] = [];

  // Search in a grid pattern, avoiding edges
  for (let x = 10; x < 40; x += 2) {
    for (let y = 10; y < 40; y += 2) {
      const pos = new RoomPosition(x, y, room.name);
      const score = scorePosition(pos, controller, sources, mineral, terrainCache);
      
      if (score.score > 0) {
        candidates.push(score);
      }
    }
  }

  if (candidates.length === 0) {
    logger.warn(`No valid anchor positions found in ${room.name}`, { subsystem: "Layout" });
    return null;
  }

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  const best = candidates[0];
  const posStr = `${best.pos.x},${best.pos.y}`;
  logger.info(
    `Optimal anchor for ${room.name}: ${posStr} (score: ${best.score}) - ${best.reasons.join(", ")}`,
    { subsystem: "Layout" }
  );

  return best.pos;
}

/**
 * Score a potential anchor position
 */
function scorePosition(
  pos: RoomPosition,
  controller: StructureController,
  sources: Source[],
  mineral: Mineral | undefined,
  terrainCache: Map<string, number>
): LayoutScore {
  let score = 100;
  const reasons: string[] = [];

  // Check if area is buildable (7x7 around anchor)
  let wallCount = 0;
  let swampCount = 0;
  
  for (let dx = -7; dx <= 7; dx++) {
    for (let dy = -7; dy <= 7; dy++) {
      const x = pos.x + dx;
      const y = pos.y + dy;
      
      if (x < 0 || x >= 50 || y < 0 || y >= 50) {
        score -= 100; // Out of bounds
        return { pos, score, reasons: ["Out of bounds"] };
      }
      
      const tile = terrainCache.get(`${x},${y}`) ?? TERRAIN_MASK_WALL;
      
      if (tile === TERRAIN_MASK_WALL) {
        wallCount++;
      } else if (tile === TERRAIN_MASK_SWAMP) {
        swampCount++;
      }
    }
  }

  // Too many walls = bad position
  if (wallCount > 30) {
    score -= 50;
    reasons.push(`${wallCount} walls in build area`);
  } else if (wallCount < 10) {
    score += 10;
    reasons.push("Open terrain");
  }

  // Some swamp is okay, too much is bad
  if (swampCount > 40) {
    score -= 30;
    reasons.push(`${swampCount} swamp tiles`);
  }

  // Distance to controller (prefer 3-6 range)
  const controllerDist = pos.getRangeTo(controller);
  if (controllerDist >= 3 && controllerDist <= 6) {
    score += 20;
    reasons.push(`Controller ${controllerDist} tiles away`);
  } else if (controllerDist < 3) {
    score -= 10;
    reasons.push("Too close to controller");
  } else if (controllerDist > 10) {
    score -= 20;
    reasons.push("Too far from controller");
  }

  // Distance to sources (prefer average 4-8 range)
  let totalSourceDist = 0;
  for (const source of sources) {
    totalSourceDist += pos.getRangeTo(source);
  }
  const avgSourceDist = totalSourceDist / sources.length;
  
  if (avgSourceDist >= 4 && avgSourceDist <= 8) {
    score += 15;
    reasons.push(`Sources avg ${avgSourceDist.toFixed(1)} tiles`);
  } else if (avgSourceDist < 4) {
    score -= 5;
    reasons.push("Too close to sources");
  } else if (avgSourceDist > 12) {
    score -= 15;
    reasons.push("Too far from sources");
  }

  // Distance to mineral (prefer 5-10 range)
  if (mineral) {
    const mineralDist = pos.getRangeTo(mineral);
    if (mineralDist >= 5 && mineralDist <= 10) {
      score += 10;
      reasons.push(`Mineral ${mineralDist} tiles away`);
    } else if (mineralDist > 15) {
      score -= 10;
      reasons.push("Far from mineral");
    }
  }

  // Prefer positions closer to room center
  const centerDist = Math.abs(pos.x - 25) + Math.abs(pos.y - 25);
  if (centerDist < 10) {
    score += 15;
    reasons.push("Near room center");
  } else if (centerDist > 20) {
    score -= 10;
    reasons.push("Far from center");
  }

  // Check for nearby exits (prefer some distance from exits)
  const exitDist = Math.min(
    pos.x,
    pos.y,
    49 - pos.x,
    49 - pos.y
  );
  
  if (exitDist < 5) {
    score -= 30;
    reasons.push("Too close to exit");
  } else if (exitDist >= 10) {
    score += 10;
    reasons.push("Safe from exits");
  }

  return { pos, score, reasons };
}

/**
 * Check if a position has enough buildable space
 */
export function hasEnoughSpace(pos: RoomPosition, radius = 7): boolean {
  const terrain = Game.map.getRoomTerrain(pos.roomName);
  let buildable = 0;
  let total = 0;

  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      const x = pos.x + dx;
      const y = pos.y + dy;
      
      if (x < 0 || x >= 50 || y < 0 || y >= 50) continue;
      
      total++;
      if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
        buildable++;
      }
    }
  }

  // Need at least 70% buildable space
  return buildable / total >= 0.7;
}

/**
 * Get cached terrain for a room (Issue #40)
 */
const terrainCacheByRoom = new Map<string, Map<string, number>>();

export function getCachedTerrain(roomName: string): Map<string, number> {
  let cache = terrainCacheByRoom.get(roomName);
  
  if (!cache) {
    cache = new Map<string, number>();
    const terrain = Game.map.getRoomTerrain(roomName);
    
    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 50; y++) {
        cache.set(`${x},${y}`, terrain.get(x, y));
      }
    }
    
    terrainCacheByRoom.set(roomName, cache);
  }
  
  return cache;
}

/**
 * Clear terrain cache for a room
 */
export function clearTerrainCache(roomName: string): void {
  terrainCacheByRoom.delete(roomName);
}

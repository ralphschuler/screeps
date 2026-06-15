/**
 * Automatic Layout Planner
 *
 * Analyzes room terrain and automatically determines optimal
 * base layout anchor position.
 *
 * Addresses Issue: #18
 */

import { logger } from "@ralphschuler/screeps-core";
import { planLayoutAnchorIntent } from "./layoutAnchorIntent";

/**
 * Find optimal anchor position for base layout
 */
export function findOptimalAnchor(room: Room): RoomPosition | null {
  const controller = room.controller;
  if (!controller) return null;

  const sources = room.find(FIND_SOURCES);
  const mineral = room.find(FIND_MINERALS)[0];
  const intent = planLayoutAnchorIntent({
    roomName: room.name,
    controller: { x: controller.pos.x, y: controller.pos.y },
    sources: sources.map(source => ({ x: source.pos.x, y: source.pos.y })),
    mineral: mineral ? { x: mineral.pos.x, y: mineral.pos.y } : undefined,
    terrain: readRoomTerrain(room)
  });

  if (!intent.selected) {
    logger.warn(`No valid anchor positions found in ${room.name}`, { subsystem: "Layout" });
    return null;
  }

  const best = intent.selected;
  const posStr = `${best.pos.x},${best.pos.y}`;
  logger.info(
    `Optimal anchor for ${room.name}: ${posStr} (score: ${best.score}) - ${best.reasons.join(", ")}`,
    { subsystem: "Layout" }
  );

  return new RoomPosition(best.pos.x, best.pos.y, room.name);
}

function readRoomTerrain(room: Room): Map<string, number> {
  const terrain = room.getTerrain();
  const terrainCache = new Map<string, number>();

  for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 50; y++) {
      terrainCache.set(`${x},${y}`, terrain.get(x, y));
    }
  }

  return terrainCache;
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

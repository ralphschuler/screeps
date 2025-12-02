/**
 * Base Blueprints - Phase 5
 *
 * Pre-computed coordinate arrays for base layouts at different RCL stages.
 */

import type { EvolutionStage } from "../memory/schemas";
import { addExtensionsToBlueprint } from "./extensionGenerator";

/**
 * Structure placement entry
 */
export interface StructurePlacement {
  x: number;
  y: number;
  structureType: BuildableStructureConstant;
}

/**
 * Blueprint for a room layout
 */
export interface Blueprint {
  /** Name of the blueprint */
  name: string;
  /** Required RCL */
  rcl: number;
  /** Anchor position (spawn location) */
  anchor: { x: number; y: number };
  /** Structure placements relative to anchor */
  structures: StructurePlacement[];
  /** Road placements relative to anchor */
  roads: { x: number; y: number }[];
  /** Rampart positions relative to anchor */
  ramparts: { x: number; y: number }[];
}

/**
 * RCL 1-2: Early Colony Layout
 */
export const EARLY_COLONY_BLUEPRINT: Blueprint = {
  name: "seedNest",
  rcl: 1,
  anchor: { x: 25, y: 25 },
  structures: [
    { x: 0, y: 0, structureType: STRUCTURE_SPAWN },
    { x: -1, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: 1, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: -1, y: 1, structureType: STRUCTURE_EXTENSION },
    { x: 1, y: 1, structureType: STRUCTURE_EXTENSION },
    { x: 0, y: -2, structureType: STRUCTURE_EXTENSION }
  ],
  roads: [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 }
  ],
  ramparts: []
};

/**
 * RCL 3-4: Core Colony Layout
 */
export const CORE_COLONY_BLUEPRINT: Blueprint = {
  name: "foragingExpansion",
  rcl: 3,
  anchor: { x: 25, y: 25 },
  structures: [
    { x: 0, y: 0, structureType: STRUCTURE_SPAWN },
    { x: -1, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: 1, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: -1, y: 1, structureType: STRUCTURE_EXTENSION },
    { x: 1, y: 1, structureType: STRUCTURE_EXTENSION },
    { x: 0, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: 0, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: 0, structureType: STRUCTURE_EXTENSION },
    { x: 0, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: 1, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: 1, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: -1, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: 1, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: -1, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: 1, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: 0, y: -3, structureType: STRUCTURE_TOWER }
  ],
  roads: [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: -2 },
    { x: 1, y: -2 },
    { x: -2, y: -1 },
    { x: -2, y: 1 },
    { x: 2, y: -1 },
    { x: 2, y: 1 }
  ],
  ramparts: []
};

/**
 * RCL 5-6: Economic Maturity Layout
 */
export const ECONOMIC_MATURITY_BLUEPRINT: Blueprint = {
  name: "matureColony",
  rcl: 5,
  anchor: { x: 25, y: 25 },
  structures: [
    { x: 0, y: 0, structureType: STRUCTURE_SPAWN },
    { x: 3, y: 0, structureType: STRUCTURE_SPAWN },
    { x: 0, y: 3, structureType: STRUCTURE_STORAGE },
    { x: 1, y: 3, structureType: STRUCTURE_TERMINAL },
    { x: 0, y: -3, structureType: STRUCTURE_TOWER },
    { x: -3, y: 0, structureType: STRUCTURE_TOWER },
    { x: 3, y: -3, structureType: STRUCTURE_TOWER },
    { x: -1, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: 1, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: -1, y: 1, structureType: STRUCTURE_EXTENSION },
    { x: 1, y: 1, structureType: STRUCTURE_EXTENSION },
    { x: 0, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: 0, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: 0, structureType: STRUCTURE_EXTENSION },
    { x: 0, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: 1, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: 1, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: -2, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: 2, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: -1, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: 1, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: -1, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: 1, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: -3, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: -3, y: 1, structureType: STRUCTURE_EXTENSION },
    { x: 3, y: -1, structureType: STRUCTURE_EXTENSION },
    { x: 3, y: 1, structureType: STRUCTURE_EXTENSION },
    { x: -3, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: 3, y: -2, structureType: STRUCTURE_EXTENSION },
    { x: -3, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: 3, y: 2, structureType: STRUCTURE_EXTENSION },
    { x: -1, y: -3, structureType: STRUCTURE_EXTENSION },
    { x: 1, y: -3, structureType: STRUCTURE_EXTENSION },
    { x: -3, y: 3, structureType: STRUCTURE_LAB },
    { x: -4, y: 3, structureType: STRUCTURE_LAB },
    { x: -3, y: 4, structureType: STRUCTURE_LAB },
    { x: -1, y: 3, structureType: STRUCTURE_LINK }
  ],
  roads: [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 2 },
    { x: -1, y: 3 },
    { x: 1, y: 3 },
    { x: 0, y: 4 }
  ],
  ramparts: [
    { x: 0, y: 0 },
    { x: 0, y: 3 },
    { x: 1, y: 3 }
  ]
};

/**
 * RCL 7-8: War Ready / End Game Layout
 */
export const WAR_READY_BLUEPRINT: Blueprint = {
  name: "fortifiedHive",
  rcl: 7,
  anchor: { x: 25, y: 25 },
  structures: [
    { x: 0, y: 0, structureType: STRUCTURE_SPAWN },
    { x: 3, y: 0, structureType: STRUCTURE_SPAWN },
    { x: -3, y: 0, structureType: STRUCTURE_SPAWN },
    { x: 0, y: 3, structureType: STRUCTURE_STORAGE },
    { x: 1, y: 3, structureType: STRUCTURE_TERMINAL },
    { x: 0, y: -3, structureType: STRUCTURE_TOWER },
    { x: -3, y: -3, structureType: STRUCTURE_TOWER },
    { x: 3, y: -3, structureType: STRUCTURE_TOWER },
    { x: -4, y: 0, structureType: STRUCTURE_TOWER },
    { x: 4, y: 0, structureType: STRUCTURE_TOWER },
    { x: 0, y: 4, structureType: STRUCTURE_TOWER },
    { x: 2, y: 3, structureType: STRUCTURE_FACTORY },
    { x: -3, y: 3, structureType: STRUCTURE_LAB },
    { x: -4, y: 3, structureType: STRUCTURE_LAB },
    { x: -3, y: 4, structureType: STRUCTURE_LAB },
    { x: -4, y: 4, structureType: STRUCTURE_LAB },
    { x: -5, y: 3, structureType: STRUCTURE_LAB },
    { x: -5, y: 4, structureType: STRUCTURE_LAB },
    { x: -3, y: 5, structureType: STRUCTURE_LAB },
    { x: -4, y: 5, structureType: STRUCTURE_LAB },
    { x: -5, y: 5, structureType: STRUCTURE_LAB },
    { x: -2, y: 4, structureType: STRUCTURE_LAB },
    { x: 4, y: 3, structureType: STRUCTURE_NUKER },
    { x: 5, y: 0, structureType: STRUCTURE_OBSERVER },
    { x: -2, y: 3, structureType: STRUCTURE_POWER_SPAWN },
    { x: -1, y: 3, structureType: STRUCTURE_LINK },
    { x: 4, y: -3, structureType: STRUCTURE_LINK },
    { x: -4, y: -3, structureType: STRUCTURE_LINK }
  ],
  roads: [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 2 },
    { x: -1, y: 3 },
    { x: 0, y: 4 },
    { x: -2, y: 3 },
    { x: -3, y: 2 }
  ],
  ramparts: [
    { x: 0, y: 0 },
    { x: 3, y: 0 },
    { x: -3, y: 0 },
    { x: 0, y: 3 },
    { x: 1, y: 3 },
    { x: 2, y: 3 },
    { x: -2, y: 3 },
    { x: 4, y: 3 },
    { x: 0, y: -3 },
    { x: -3, y: -3 },
    { x: 3, y: -3 },
    { x: -4, y: 0 },
    { x: 4, y: 0 },
    { x: 0, y: 4 }
  ]
};

/**
 * Get blueprint for evolution stage
 */
export function getBlueprintForStage(stage: EvolutionStage): Blueprint {
  switch (stage) {
    case "seedNest":
      return EARLY_COLONY_BLUEPRINT;
    case "foragingExpansion":
      return CORE_COLONY_BLUEPRINT;
    case "matureColony":
      return ECONOMIC_MATURITY_BLUEPRINT;
    case "fortifiedHive":
    case "empireDominance":
      return WAR_READY_BLUEPRINT;
    default:
      return EARLY_COLONY_BLUEPRINT;
  }
}

/**
 * Get blueprint for RCL
 */
export function getBlueprintForRCL(rcl: number): Blueprint {
  if (rcl >= 7) return WAR_READY_BLUEPRINT;
  if (rcl >= 5) return ECONOMIC_MATURITY_BLUEPRINT;
  if (rcl >= 3) return CORE_COLONY_BLUEPRINT;
  return EARLY_COLONY_BLUEPRINT;
}

/**
 * Filter structures for a specific RCL
 */
export function getStructuresForRCL(blueprint: Blueprint, rcl: number): StructurePlacement[] {
  const limits = getStructureLimits(rcl);
  const counts: Record<string, number> = {};

  let structures = blueprint.structures.filter(s => {
    const type = s.structureType;
    const limit = limits[type] ?? 0;
    const current = counts[type] ?? 0;

    if (current >= limit) return false;

    counts[type] = current + 1;
    return true;
  });

  // Add extensions to reach RCL limit
  const extensionLimit = limits[STRUCTURE_EXTENSION] ?? 0;
  if (extensionLimit > 0) {
    structures = addExtensionsToBlueprint(structures, extensionLimit);
  }

  return structures;
}

/**
 * Get structure limits per RCL
 */
function getStructureLimits(rcl: number): Record<BuildableStructureConstant, number> {
  const limits: Record<number, Partial<Record<BuildableStructureConstant, number>>> = {
    1: { spawn: 1, extension: 0, road: 2500, constructedWall: 0 },
    2: { spawn: 1, extension: 5, road: 2500, constructedWall: 2500, rampart: 2500, container: 5 },
    3: { spawn: 1, extension: 10, road: 2500, constructedWall: 2500, rampart: 2500, container: 5, tower: 1 },
    4: {
      spawn: 1,
      extension: 20,
      road: 2500,
      constructedWall: 2500,
      rampart: 2500,
      container: 5,
      tower: 1,
      storage: 1
    },
    5: {
      spawn: 1,
      extension: 30,
      road: 2500,
      constructedWall: 2500,
      rampart: 2500,
      container: 5,
      tower: 2,
      storage: 1,
      link: 2
    },
    6: {
      spawn: 1,
      extension: 40,
      road: 2500,
      constructedWall: 2500,
      rampart: 2500,
      container: 5,
      tower: 2,
      storage: 1,
      link: 3,
      terminal: 1,
      extractor: 1,
      lab: 3
    },
    7: {
      spawn: 2,
      extension: 50,
      road: 2500,
      constructedWall: 2500,
      rampart: 2500,
      container: 5,
      tower: 3,
      storage: 1,
      link: 4,
      terminal: 1,
      extractor: 1,
      lab: 6,
      factory: 1
    },
    8: {
      spawn: 3,
      extension: 60,
      road: 2500,
      constructedWall: 2500,
      rampart: 2500,
      container: 5,
      tower: 6,
      storage: 1,
      link: 6,
      terminal: 1,
      extractor: 1,
      lab: 10,
      factory: 1,
      nuker: 1,
      observer: 1,
      powerSpawn: 1
    }
  };

  return (limits[rcl] ?? limits[1]) as Record<BuildableStructureConstant, number>;
}

/**
 * Get blueprint for a specific RCL (alias for getBlueprintForRCL)
 */
export function getBlueprint(rcl: number): Blueprint {
  return getBlueprintForRCL(rcl);
}

/**
 * Place construction sites from a blueprint
 */
export function placeConstructionSites(room: Room, anchor: RoomPosition, blueprint: Blueprint): number {
  const rcl = room.controller?.level ?? 1;
  const structures = getStructuresForRCL(blueprint, rcl);
  const terrain = room.getTerrain();

  // Add extractor at mineral position if RCL 6+
  const mineralStructures: StructurePlacement[] = [];
  if (rcl >= 6) {
    const minerals = room.find(FIND_MINERALS);
    if (minerals.length > 0) {
      const mineral = minerals[0];
      mineralStructures.push({
        x: mineral.pos.x - anchor.x,
        y: mineral.pos.y - anchor.y,
        structureType: STRUCTURE_EXTRACTOR
      });
    }
  }

  // Combine blueprint structures with mineral structures
  const allStructures = [...structures, ...mineralStructures];

  let placed = 0;
  const existingSites = room.find(FIND_MY_CONSTRUCTION_SITES);
  const existingStructures = room.find(FIND_STRUCTURES);

  if (existingSites.length >= 10) return 0;

  const structureCounts: Record<string, number> = {};
  for (const structure of existingStructures) {
    const type = structure.structureType;
    structureCounts[type] = (structureCounts[type] ?? 0) + 1;
  }

  for (const site of existingSites) {
    const type = site.structureType;
    structureCounts[type] = (structureCounts[type] ?? 0) + 1;
  }

  const limits = getStructureLimits(rcl);

  for (const s of allStructures) {
    const currentCount = structureCounts[s.structureType] ?? 0;
    const limit = limits[s.structureType] ?? 0;
    if (currentCount >= limit) continue;

    const x = anchor.x + s.x;
    const y = anchor.y + s.y;

    if (x < 1 || x > 48 || y < 1 || y > 48) continue;
    if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;

    const existingAtPos = existingStructures.some(
      str => str.pos.x === x && str.pos.y === y && str.structureType === s.structureType
    );
    if (existingAtPos) continue;

    const existingSiteAtPos = existingSites.some(
      site => site.pos.x === x && site.pos.y === y && site.structureType === s.structureType
    );
    if (existingSiteAtPos) continue;

    const result = room.createConstructionSite(x, y, s.structureType);
    if (result === OK) {
      placed++;
      structureCounts[s.structureType] = currentCount + 1;

      if (placed >= 3 || existingSites.length + placed >= 10) break;
    }
  }

  if (placed < 3 && existingSites.length + placed < 10) {
    for (const r of blueprint.roads) {
      const x = anchor.x + r.x;
      const y = anchor.y + r.y;

      if (x < 1 || x > 48 || y < 1 || y > 48) continue;
      if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;

      const existingRoad = existingStructures.some(
        str => str.pos.x === x && str.pos.y === y && str.structureType === STRUCTURE_ROAD
      );
      if (existingRoad) continue;

      const existingRoadSite = existingSites.some(
        site => site.pos.x === x && site.pos.y === y && site.structureType === STRUCTURE_ROAD
      );
      if (existingRoadSite) continue;

      const result = room.createConstructionSite(x, y, STRUCTURE_ROAD);
      if (result === OK) {
        placed++;
        if (placed >= 3 || existingSites.length + placed >= 10) break;
      }
    }
  }

  return placed;
}

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

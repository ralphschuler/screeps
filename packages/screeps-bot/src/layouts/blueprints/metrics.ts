/**
 * Blueprint efficiency metrics calculation
 */

import { getStructuresForRCL } from "./selector";
import type { Blueprint, BlueprintEfficiencyMetrics } from "./types";

/**
 * Blueprint efficiency scoring constants
 */
const EFFICIENCY_WEIGHTS = {
  PATH_LENGTH: 0.3,
  TOWER_COVERAGE: 0.25,
  DEFENSE_SCORE: 0.25,
  ENERGY_EFFICIENCY: 0.2
} as const;

const SCORING_FACTORS = {
  LINK_POINTS: 15,
  BASE_ROAD_SCORE: 50,
  ROAD_PENALTY_DIVISOR: 10,
  RAMPART_POINTS: 2,
  TOWER_POINTS: 10
} as const;

/**
 * Calculate efficiency metrics for a blueprint in a specific room
 * 
 * @param room The room to evaluate
 * @param anchor The blueprint anchor position
 * @param blueprint The blueprint to evaluate
 * @returns Efficiency metrics
 */
export function calculateBlueprintEfficiency(
  room: Room,
  anchor: RoomPosition,
  blueprint: Blueprint
): BlueprintEfficiencyMetrics {
  const rcl = room.controller?.level ?? 8;
  const structures = getStructuresForRCL(blueprint, rcl);
  
  // Find storage position
  const storageStruct = structures.find(s => s.structureType === STRUCTURE_STORAGE);
  const storagePos = storageStruct 
    ? new RoomPosition(anchor.x + storageStruct.x, anchor.y + storageStruct.y, room.name)
    : anchor;
  
  // Calculate path lengths to critical points
  const controller = room.controller;
  let pathLengthToController = 0;
  if (controller) {
    const path = PathFinder.search(storagePos, { pos: controller.pos, range: 3 });
    pathLengthToController = path.path.length;
  }
  
  const sources = room.find(FIND_SOURCES);
  const pathLengthToSources: number[] = [];
  for (const source of sources) {
    const path = PathFinder.search(storagePos, { pos: source.pos, range: 1 });
    pathLengthToSources.push(path.path.length);
  }
  
  const avgPathLength = pathLengthToSources.length > 0
    ? (pathLengthToController + pathLengthToSources.reduce((a, b) => a + b, 0)) / (pathLengthToSources.length + 1)
    : pathLengthToController;
  
  // Calculate tower coverage
  const towerStructs = structures.filter(s => s.structureType === STRUCTURE_TOWER);
  const towerPositions = towerStructs.map(t => 
    new RoomPosition(anchor.x + t.x, anchor.y + t.y, room.name)
  );
  
  let coveredTiles = 0;
  const totalTiles = 48 * 48; // Exclude room edges
  
  // Sample coverage at grid points for performance (12x12 grid = 144 samples)
  const SAMPLE_STEP = 4;
  for (let x = 1; x <= 48; x += SAMPLE_STEP) {
    for (let y = 1; y <= 48; y += SAMPLE_STEP) {
      const pos = new RoomPosition(x, y, room.name);
      const inRange = towerPositions.some(towerPos => towerPos.getRangeTo(pos) <= 20);
      if (inRange) coveredTiles += SAMPLE_STEP * SAMPLE_STEP; // Each sample represents 4x4 area
    }
  }
  
  const towerCoverage = Math.min(100, (coveredTiles / totalTiles) * 100);
  
  // Calculate defense score
  const rampartCount = blueprint.ramparts.length;
  const towerCount = towerStructs.length;
  const defenseScore = Math.min(100, (rampartCount * SCORING_FACTORS.RAMPART_POINTS) + (towerCount * SCORING_FACTORS.TOWER_POINTS));
  
  // Calculate energy efficiency
  const linkCount = structures.filter(s => s.structureType === STRUCTURE_LINK).length;
  const roadCount = blueprint.roads.length;
  // Links are more efficient than roads for energy transport
  const energyEfficiency = Math.min(
    100,
    (linkCount * SCORING_FACTORS.LINK_POINTS) + 
    Math.max(0, SCORING_FACTORS.BASE_ROAD_SCORE - roadCount / SCORING_FACTORS.ROAD_PENALTY_DIVISOR)
  );
  
  // Overall score (weighted average)
  const overallScore = (
    (avgPathLength > 0 ? Math.max(0, 100 - avgPathLength) * EFFICIENCY_WEIGHTS.PATH_LENGTH : 0) +
    (towerCoverage * EFFICIENCY_WEIGHTS.TOWER_COVERAGE) +
    (defenseScore * EFFICIENCY_WEIGHTS.DEFENSE_SCORE) +
    (energyEfficiency * EFFICIENCY_WEIGHTS.ENERGY_EFFICIENCY)
  );
  
  return {
    avgPathLength,
    towerCoverage,
    defenseScore,
    energyEfficiency,
    overallScore,
    details: {
      pathLengthToController,
      pathLengthToSources,
      towerCount,
      rampartCount,
      linkCount
    }
  };
}

/**
 * Compare two blueprints and return the more efficient one
 * 
 * @param room The room to evaluate in
 * @param blueprint1 First blueprint with anchor
 * @param blueprint2 Second blueprint with anchor
 * @returns The more efficient blueprint configuration
 */
export function compareBlueprintEfficiency(
  room: Room,
  blueprint1: { blueprint: Blueprint; anchor: RoomPosition },
  blueprint2: { blueprint: Blueprint; anchor: RoomPosition }
): { blueprint: Blueprint; anchor: RoomPosition; metrics: BlueprintEfficiencyMetrics } {
  const metrics1 = calculateBlueprintEfficiency(room, blueprint1.anchor, blueprint1.blueprint);
  const metrics2 = calculateBlueprintEfficiency(room, blueprint2.anchor, blueprint2.blueprint);
  
  if (metrics1.overallScore >= metrics2.overallScore) {
    return { ...blueprint1, metrics: metrics1 };
  } else {
    return { ...blueprint2, metrics: metrics2 };
  }
}

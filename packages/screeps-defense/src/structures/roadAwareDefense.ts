/**
 * Road-Aware Defense System
 *
 * Integrates road network planning with perimeter defense to ensure:
 * 1. Road network is calculated BEFORE walls are placed
 * 2. Roads that intersect with perimeter walls get ramparts instead of walls
 * 3. Existing walls blocking roads can be removed and replaced with ramparts
 * 4. Critical paths (to sources, controller, remotes) are never blocked
 *
 * ROADMAP Reference:
 * - Section 17: Mauern & Ramparts (defensive structures)
 * - Section 20: Bewegung, Pathfinding & Traffic-Management (road networks)
 *
 * NEW REQUIREMENTS:
 * - Plan road network before placing walls
 * - Use ramparts instead of walls where roads cross perimeter
 * - Remove walls at strategic positions to extend road network
 */

import { logger } from "@bot/core/logger";
import { calculateRoadNetwork, getValidRoadPositions } from "@bot/layouts/roadNetworkPlanner";
import type { ExitPosition, PerimeterPlan } from "./perimeterDefense";
import { calculatePerimeterPositions } from "./perimeterDefense";

/**
 * Constants for road-aware defense system
 */
const MAX_CONSTRUCTION_SITES = 10; // Screeps game limit
const MAX_DEFENSIVE_STRUCTURES_PER_RCL = 2500; // Walls and ramparts limit per RCL

/**
 * Enhanced perimeter plan with road awareness
 */
export interface RoadAwarePerimeterPlan {
  /** Wall positions (excluding road crossings) */
  walls: ExitPosition[];
  /** Rampart positions (including road crossings) */
  ramparts: ExitPosition[];
  /** Positions where roads cross the perimeter (need ramparts, not walls) */
  roadCrossings: ExitPosition[];
  /** Existing walls that should be removed because they block roads */
  wallsToRemove: { x: number; y: number }[];
}

/**
 * Calculate road-aware perimeter defense positions
 * 
 * This function:
 * 1. Calculates the road network (to sources, controller, mineral, remotes)
 * 2. Identifies where roads cross the perimeter
 * 3. Ensures those crossings get ramparts (not walls) for friendly passage
 * 4. Identifies existing walls that block roads and should be removed
 * 
 * @param room The room to plan defense for
 * @param anchor The base anchor position (spawn location)
 * @param blueprintRoads Blueprint road positions (relative to anchor)
 * @param remoteRooms Remote room names for road calculation
 * @returns Road-aware perimeter plan
 */
export function calculateRoadAwarePerimeter(
  room: Room,
  anchor: RoomPosition,
  blueprintRoads: { x: number; y: number }[],
  remoteRooms: string[] = []
): RoadAwarePerimeterPlan {
  // Step 1: Calculate the complete road network
  const validRoads = getValidRoadPositions(room, anchor, blueprintRoads, remoteRooms);
  
  // Step 2: Get standard perimeter plan (walls and rampart gaps)
  const basePlan = calculatePerimeterPositions(room.name);
  
  // Step 3: Identify road crossings at perimeter
  const roadCrossings: ExitPosition[] = [];
  const walls: ExitPosition[] = [];
  const ramparts: ExitPosition[] = [...basePlan.ramparts]; // Start with existing gaps
  
  // Check each wall position to see if it intersects with a road
  for (const wallPos of basePlan.walls) {
    const posKey = `${wallPos.x},${wallPos.y}`;
    
    if (validRoads.has(posKey)) {
      // This wall position is on a road - convert to rampart
      roadCrossings.push(wallPos);
      ramparts.push(wallPos);
    } else {
      // Not on a road - keep as wall
      walls.push(wallPos);
    }
  }
  
  // Step 4: Find existing walls that block roads and should be removed
  const wallsToRemove: { x: number; y: number }[] = [];
  const existingStructures = room.find(FIND_STRUCTURES);
  
  for (const structure of existingStructures) {
    if (structure.structureType === STRUCTURE_WALL) {
      const posKey = `${structure.pos.x},${structure.pos.y}`;
      
      // If there's a wall on a road position, mark it for removal
      if (validRoads.has(posKey)) {
        wallsToRemove.push({ x: structure.pos.x, y: structure.pos.y });
      }
    }
  }
  
  return {
    walls,
    ramparts,
    roadCrossings,
    wallsToRemove
  };
}

/**
 * Place road-aware perimeter defense
 * 
 * This is an enhanced version of placePerimeterDefense that:
 * 1. Plans roads BEFORE placing walls
 * 2. Uses ramparts instead of walls where roads cross perimeter
 * 3. Removes walls that block critical roads
 * 4. Ensures friendly creeps can always reach sources, controller, and remotes
 * 
 * @param room The room to defend
 * @param anchor The base anchor position (spawn location)
 * @param blueprintRoads Blueprint road positions
 * @param rcl Current room control level
 * @param maxSites Maximum construction sites to place
 * @param remoteRooms Remote room names
 * @returns Number of sites placed and walls removed
 */
export function placeRoadAwarePerimeterDefense(
  room: Room,
  anchor: RoomPosition,
  blueprintRoads: { x: number; y: number }[],
  rcl: number,
  maxSites = 3,
  remoteRooms: string[] = []
): { sitesPlaced: number; wallsRemoved: number } {
  if (rcl < 2) return { sitesPlaced: 0, wallsRemoved: 0 };
  
  // Calculate road-aware perimeter plan
  const plan = calculateRoadAwarePerimeter(room, anchor, blueprintRoads, remoteRooms);
  
  const existingSites = room.find(FIND_MY_CONSTRUCTION_SITES);
  const existingStructures = room.find(FIND_STRUCTURES);
  
  // Check site limit
  if (existingSites.length >= MAX_CONSTRUCTION_SITES) {
    return { sitesPlaced: 0, wallsRemoved: 0 };
  }
  
  let sitesPlaced = 0;
  let wallsRemoved = 0;
  const maxToPlace = Math.min(maxSites, MAX_CONSTRUCTION_SITES - existingSites.length);
  
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
  
  // RCL structure limits
  const wallLimit = rcl >= 2 ? MAX_DEFENSIVE_STRUCTURES_PER_RCL : 0;
  const rampartLimit = rcl >= 2 ? MAX_DEFENSIVE_STRUCTURES_PER_RCL : 0;
  
  // Priority 1: Remove walls that block roads (RCL 3+)
  // This is highest priority to ensure creeps can move efficiently
  if (rcl >= 3 && plan.wallsToRemove.length > 0) {
    for (const wallPos of plan.wallsToRemove) {
      // Find the wall structure
      const wall = existingStructures.find(
        s => s.structureType === STRUCTURE_WALL && 
             s.pos.x === wallPos.x && 
             s.pos.y === wallPos.y
      ) as StructureWall | undefined;
      
      if (wall) {
        // Check if there's already a rampart here (no need to remove wall then)
        const hasRampart = existingStructures.some(
          s => s.structureType === STRUCTURE_RAMPART && 
               s.pos.x === wallPos.x && 
               s.pos.y === wallPos.y
        );
        
        if (!hasRampart) {
          const result = wall.destroy();
          if (result === OK) {
            wallsRemoved++;
            logger.info(
              `Removed wall at (${wallPos.x},${wallPos.y}) to allow road passage`,
              { subsystem: "Defense" }
            );
          } else {
            logger.warn(
              `Failed to remove wall at (${wallPos.x},${wallPos.y}): ${result}`,
              { subsystem: "Defense" }
            );
          }
        }
      }
    }
  }
  
  // Priority 2: Place walls at non-road perimeter positions (RCL 2+)
  if (rcl >= 2 && sitesPlaced < maxToPlace && wallCount < wallLimit) {
    for (const wall of plan.walls) {
      if (sitesPlaced >= maxToPlace) break;
      if (wallCount + sitesPlaced >= wallLimit) break;
      
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
          sitesPlaced++;
          logger.debug(
            `Placed perimeter wall at (${wall.x},${wall.y})`,
            { subsystem: "Defense" }
          );
        }
      }
    }
  }
  
  // Priority 3: Place ramparts at gaps AND road crossings (RCL 3+)
  if (rcl >= 3 && sitesPlaced < maxToPlace && rampartCount < rampartLimit) {
    for (const rampart of plan.ramparts) {
      if (sitesPlaced >= maxToPlace) break;
      if (rampartCount + sitesPlaced >= rampartLimit) break;
      
      // Check if position already has a rampart
      const hasRampart = existingStructures.some(
        s => s.pos.x === rampart.x && s.pos.y === rampart.y && 
             s.structureType === STRUCTURE_RAMPART
      );
      const hasRampartSite = existingSites.some(
        s => s.pos.x === rampart.x && s.pos.y === rampart.y && 
             s.structureType === STRUCTURE_RAMPART
      );
      
      // Don't place if there's a wall here (should have been removed already)
      const hasWall = existingStructures.some(
        s => s.pos.x === rampart.x && s.pos.y === rampart.y && 
             s.structureType === STRUCTURE_WALL
      );
      
      if (!hasRampart && !hasRampartSite && !hasWall) {
        const result = room.createConstructionSite(rampart.x, rampart.y, STRUCTURE_RAMPART);
        if (result === OK) {
          sitesPlaced++;
          
          // Check if this is a road crossing
          const isRoadCrossing = plan.roadCrossings.some(
            rc => rc.x === rampart.x && rc.y === rampart.y
          );
          
          if (isRoadCrossing) {
            logger.debug(
              `Placed rampart at road crossing (${rampart.x},${rampart.y})`,
              { subsystem: "Defense" }
            );
          } else {
            logger.debug(
              `Placed rampart gap at (${rampart.x},${rampart.y})`,
              { subsystem: "Defense" }
            );
          }
        }
      }
    }
  }
  
  return { sitesPlaced, wallsRemoved };
}

/**
 * Get road-aware perimeter statistics
 */
export interface RoadAwarePerimeterStats {
  totalWallPositions: number;
  totalRampartPositions: number;
  roadCrossings: number;
  wallsBuilt: number;
  rampartsBuilt: number;
  wallsBlockingRoads: number;
  wallCoveragePercent: number;
  rampartCoveragePercent: number;
}

export function getRoadAwarePerimeterStats(
  room: Room,
  anchor: RoomPosition,
  blueprintRoads: { x: number; y: number }[],
  remoteRooms: string[] = []
): RoadAwarePerimeterStats {
  const plan = calculateRoadAwarePerimeter(room, anchor, blueprintRoads, remoteRooms);
  const structures = room.find(FIND_STRUCTURES);
  
  const totalWallPositions = plan.walls.length;
  const totalRampartPositions = plan.ramparts.length;
  const roadCrossings = plan.roadCrossings.length;
  const wallsBlockingRoads = plan.wallsToRemove.length;
  
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
  
  // Count perimeter ramparts (at planned rampart positions)
  let rampartsBuilt = 0;
  for (const rampart of ramparts) {
    const isPerimeter = plan.ramparts.some(
      p => p.x === rampart.pos.x && p.y === rampart.pos.y
    );
    if (isPerimeter) rampartsBuilt++;
  }
  
  const wallCoveragePercent = totalWallPositions > 0
    ? Math.round((wallsBuilt / totalWallPositions) * 100)
    : 0;
  
  const rampartCoveragePercent = totalRampartPositions > 0
    ? Math.round((rampartsBuilt / totalRampartPositions) * 100)
    : 0;
  
  return {
    totalWallPositions,
    totalRampartPositions,
    roadCrossings,
    wallsBuilt,
    rampartsBuilt,
    wallsBlockingRoads,
    wallCoveragePercent,
    rampartCoveragePercent
  };
}

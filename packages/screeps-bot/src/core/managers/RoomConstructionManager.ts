/**
 * RoomConstructionManager - Handles all construction-related operations
 *
 * Responsibilities:
 * - Blueprint-based construction
 * - Perimeter defense (walls, ramparts)
 * - Road network planning
 * - Rampart automation on critical structures
 * - Misplaced structure cleanup
 */

import {
  placeRampartsOnCriticalStructures,
  placeRoadAwarePerimeterDefense
} from "@ralphschuler/screeps-defense";
import {
  destroyMisplacedStructures,
  getBlueprint,
  placeConstructionSites,
  selectBestBlueprint
} from "../../layouts/blueprints/index";
import { placeRoadConstructionSites } from "../../layouts/roadNetworkPlanner";
import { postureManager } from "../../logic/evolution";
import { memoryManager } from "../../memory/manager";
import type { SwarmState } from "@ralphschuler/screeps-memory";

/**
 * Perimeter defense configuration constants
 * These values control how aggressively rooms build defensive walls
 */
const EARLY_GAME_RCL_MIN = 2;
const EARLY_GAME_RCL_MAX = 3;
const MAX_EARLY_PERIMETER_SITES = 5; // RCL 2-3: Aggressive defense buildup
const MAX_REGULAR_PERIMETER_SITES = 3; // RCL 4+: Maintenance rate
const EARLY_GAME_CONSTRUCTION_INTERVAL = 5; // Ticks between construction checks
const REGULAR_CONSTRUCTION_INTERVAL = 10; // Ticks between construction checks

/**
 * Check if a room is in early game and needs aggressive defense
 */
function isEarlyGameDefense(rcl: number): boolean {
  return rcl >= EARLY_GAME_RCL_MIN && rcl <= EARLY_GAME_RCL_MAX;
}

/**
 * Room Construction Manager
 */
export class RoomConstructionManager {
  /**
   * Get construction interval based on RCL
   */
  public getConstructionInterval(rcl: number): number {
    return isEarlyGameDefense(rcl) ? EARLY_GAME_CONSTRUCTION_INTERVAL : REGULAR_CONSTRUCTION_INTERVAL;
  }

  /**
   * Run construction logic using blueprints with dynamic selection and road-aware defense
   */
  public runConstruction(
    room: Room,
    swarm: SwarmState,
    constructionSites: ConstructionSite[],
    spawns: StructureSpawn[]
  ): void {
    // Check global construction site limit
    const existingSites = constructionSites;
    if (existingSites.length >= 10) return;

    const rcl = room.controller?.level ?? 1;

    // Find spawn to use as anchor
    const spawn = spawns[0];
    let anchor: RoomPosition | undefined = spawn?.pos;

    if (!spawn) {
      // No spawn, place one if we're a new colony
      if (rcl === 1 && existingSites.length === 0) {
        // Use dynamic blueprint selection to find best spawn position
        const blueprintSelection = selectBestBlueprint(room, rcl);
        if (blueprintSelection) {
          room.createConstructionSite(blueprintSelection.anchor.x, blueprintSelection.anchor.y, STRUCTURE_SPAWN);
        }
      }
      return;
    }

    // Get blueprint for current RCL using dynamic selection
    // This will try bunker layout first, fall back to spread layout if terrain doesn't allow
    const selectedBlueprint = selectBestBlueprint(room, rcl);
    let finalBlueprint;
    if (!selectedBlueprint) {
      // Fallback to traditional method if dynamic selection fails
      finalBlueprint = getBlueprint(rcl);
      if (!finalBlueprint) return;
      anchor = spawn.pos;
    } else {
      // Use dynamically selected blueprint and anchor
      // Update anchor if the dynamic selection found a better position
      anchor = selectedBlueprint.anchor;
      finalBlueprint = selectedBlueprint.blueprint;
    }

    if (!finalBlueprint || !anchor) return;

    // Destroy misplaced structures that don't match the blueprint
    // Runs every construction tick (10 ticks) in non-combat postures for faster cleanup
    // Pass remote room assignments to preserve roads leading to remote mining rooms
    if (!postureManager.isCombatPosture(swarm.posture)) {
      const destroyed = destroyMisplacedStructures(room, anchor, finalBlueprint, 1, swarm.remoteAssignments);
      if (destroyed > 0) {
        const structureWord = destroyed === 1 ? "structure" : "structures";
        memoryManager.addRoomEvent(
          room.name,
          "structureDestroyed",
          `${destroyed} misplaced ${structureWord} destroyed for blueprint compliance`
        );
      }
    }

    // Priority 1: Place road-aware perimeter defense (RCL 2+)
    // Road-aware system ensures roads aren't blocked by walls
    // Roads are calculated BEFORE walls are placed, and ramparts are used at road crossings
    let perimeterResult = { sitesPlaced: 0, wallsRemoved: 0 };
    if (rcl >= EARLY_GAME_RCL_MIN && existingSites.length < 8) {
      // Place more sites in early game for faster fortification
      const maxPerimeterSites = isEarlyGameDefense(rcl) ? MAX_EARLY_PERIMETER_SITES : MAX_REGULAR_PERIMETER_SITES;

      // Use road-aware defense system that plans roads first
      perimeterResult = placeRoadAwarePerimeterDefense(
        room,
        anchor,
        finalBlueprint.roads,
        rcl,
        maxPerimeterSites,
        swarm.remoteAssignments
      );

      // Log wall removals for road access
      if (perimeterResult.wallsRemoved > 0) {
        memoryManager.addRoomEvent(
          room.name,
          "wallRemoved",
          `${perimeterResult.wallsRemoved} wall(s) removed to allow road passage`
        );
      }
    }

    // Priority 2: Place construction sites using blueprint
    const placed = placeConstructionSites(room, anchor, finalBlueprint);

    // Priority 3: Place road construction sites for infrastructure routes (sources, controller, mineral)
    // Only place 1-2 road sites per tick to avoid overwhelming builders
    const roadSitesPlaced = placeRoadConstructionSites(room, anchor, 2);

    // Priority 4: Place ramparts on critical structures (RCL 2+)
    // Automated rampart placement for spawn, storage, towers, labs, etc.
    let rampartResult = { placed: 0, needsRepair: 0, totalCritical: 0, protected: 0 };
    if (rcl >= 2 && existingSites.length < 9) {
      const maxRampartSites = swarm.danger >= 2 ? 3 : 2; // More aggressive during attacks
      rampartResult = placeRampartsOnCriticalStructures(room, rcl, swarm.danger, maxRampartSites);

      if (rampartResult.placed > 0) {
        memoryManager.addRoomEvent(
          room.name,
          "rampartPlaced",
          `${rampartResult.placed} rampart(s) placed on critical structures`
        );
      }
    }

    // Update metrics
    swarm.metrics.constructionSites =
      existingSites.length + placed + roadSitesPlaced + perimeterResult.sitesPlaced + rampartResult.placed;
  }
}

/**
 * Global room construction manager instance
 */
export const roomConstructionManager = new RoomConstructionManager();

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

import { placeRampartsOnCriticalStructures, placeRoadAwarePerimeterDefense } from "@ralphschuler/screeps-defense";
import {
  blueprintFromPlan,
  destroyMisplacedStructures,
  issueConstructionSites,
  placeLabClusterConstructionSites,
  placeLinkConstructionSites,
  placeRoadConstructionSites,
  planRoomBlueprintFromRoom,
  selectBestBlueprint
} from "@ralphschuler/screeps-layouts";
import { memoryManager } from "@ralphschuler/screeps-memory";
import type { SwarmState } from "@ralphschuler/screeps-memory";
import { postureManager } from "../../logic/evolution";

/**
 * Perimeter defense configuration constants
 * These values control how aggressively rooms build defensive walls
 */
const EARLY_GAME_RCL_MIN = 2;
const EARLY_GAME_RCL_MAX = 3;
const MAX_EARLY_PERIMETER_SITES = 2; // RCL 2-3: only threat/economy-gated early defense
const MAX_REGULAR_PERIMETER_SITES = 3; // RCL 4+: Maintenance rate
const EARLY_GAME_CONSTRUCTION_INTERVAL = 5; // Ticks between construction checks
const REGULAR_CONSTRUCTION_INTERVAL = 10; // Ticks between construction checks
const MAX_PENDING_SITES_FOR_PERIMETER = 8;

const DEFENSE_CONSTRUCTION_SITE_TYPES = new Set<BuildableStructureConstant>([
  STRUCTURE_WALL,
  STRUCTURE_RAMPART
]);

function currentGameTime(): number {
  return typeof Game === "undefined" ? 0 : Game.time;
}

function getRememberedLayoutAnchor(room: Room, swarm: SwarmState): RoomPosition | undefined {
  const anchor = swarm.layoutAnchor;
  if (!anchor) return undefined;
  if (anchor.x < 1 || anchor.x > 48 || anchor.y < 1 || anchor.y > 48) return undefined;
  if (room.getTerrain().get(anchor.x, anchor.y) === TERRAIN_MASK_WALL) return undefined;
  return new RoomPosition(anchor.x, anchor.y, room.name);
}

function rememberLayoutAnchor(swarm: SwarmState, anchor: RoomPosition, blueprintName: string, rcl: number): void {
  if (swarm.layoutAnchor) return;
  swarm.layoutAnchor = {
    x: anchor.x,
    y: anchor.y,
    blueprintName,
    rclSelectedAt: rcl,
    selectedAt: currentGameTime()
  };
}

function isStableCleanupAnchor(swarm: SwarmState, anchor: RoomPosition): boolean {
  return Boolean(
    swarm.layoutAnchor &&
      swarm.layoutAnchor.x === anchor.x &&
      swarm.layoutAnchor.y === anchor.y &&
      swarm.layoutAnchor.selectedAt !== currentGameTime()
  );
}

export interface EconomyFirstConstructionInput {
  rcl: number;
  danger: number;
  hasStorage: boolean;
  remoteAssignments: string[];
}

export interface EconomyFirstConstructionPolicy {
  allowPerimeter: boolean;
  allowRamparts: boolean;
}

export interface RoadAwarePerimeterConstructionInput {
  allowPerimeter: boolean;
  rcl: number;
  danger: number;
  existingSites: Pick<ConstructionSite, "structureType">[];
}

export function shouldRunRoadAwarePerimeterConstruction(
  input: RoadAwarePerimeterConstructionInput
): boolean {
  if (!input.allowPerimeter || input.rcl < EARLY_GAME_RCL_MIN) return false;
  if (input.existingSites.length >= MAX_PENDING_SITES_FOR_PERIMETER) return false;

  const hasPendingDefenseSite = input.existingSites.some(site =>
    DEFENSE_CONSTRUCTION_SITE_TYPES.has(site.structureType as BuildableStructureConstant)
  );

  return input.danger >= 1 || !hasPendingDefenseSite;
}

/**
 * Economy-first construction gate: peaceful young rooms spend early energy on
 * extensions, roads, source/controller containers, and storage before perimeter.
 */
export function getEconomyFirstConstructionPolicy(
  input: EconomyFirstConstructionInput
): EconomyFirstConstructionPolicy {
  if (input.danger >= 1) {
    return { allowPerimeter: true, allowRamparts: true };
  }

  const stableEconomy = input.hasStorage || input.remoteAssignments.length > 0 || input.rcl >= 5;

  return {
    allowPerimeter: stableEconomy,
    allowRamparts: stableEconomy || input.rcl >= 4
  };
}

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
    const existingSites = constructionSites;
    const rcl = room.controller?.level ?? 1;

    // Find spawn to use as anchor
    const spawn = spawns[0];
    let anchor: RoomPosition | undefined = spawn?.pos;

    if (!spawn) {
      // No spawn: always ensure the first spawn site exists for claimed-room bootstrap.
      // Other sites may already exist from stale/manual planning; they must not block
      // the only structure that lets local bootstrap take over.
      const hasSpawnSite = existingSites.some(site => site.structureType === STRUCTURE_SPAWN);
      if (room.controller?.my === true && !hasSpawnSite) {
        // Use dynamic blueprint selection to find best spawn position.
        // This must run before the normal per-room construction cap and for any RCL;
        // rooms can lose every spawn after progressing beyond RCL1.
        const blueprintSelection = selectBestBlueprint(room, rcl);
        if (blueprintSelection) {
          rememberLayoutAnchor(swarm, blueprintSelection.anchor, blueprintSelection.blueprint.name, rcl);
          room.createConstructionSite(blueprintSelection.anchor.x, blueprintSelection.anchor.y, STRUCTURE_SPAWN);
        }
      }
      return;
    }

    // Priority 0: place critical dynamic link/lab sites before static blueprint
    // work can consume the room's local construction throttle.
    let linkSitesPlaced = 0;
    if (rcl >= 5) {
      linkSitesPlaced = placeLinkConstructionSites(room, 2);
    }

    let labSitesPlaced = 0;
    if (rcl >= 6) {
      labSitesPlaced = placeLabClusterConstructionSites(room, 3);
    }

    // Check per-room construction site throttle after first-spawn/bootstrap and priority economy sites.
    if (existingSites.length + linkSitesPlaced + labSitesPlaced >= 10) {
      swarm.metrics.constructionSites = existingSites.length + linkSitesPlaced + labSitesPlaced;
      return;
    }

    // Use the canonical framework stamp planner as the single layout authority.
    // A remembered anchor keeps cleanup/perimeter stable; without one the planner
    // derives an anchor from fixed structures and room facts.
    const rememberedAnchor = getRememberedLayoutAnchor(room, swarm);
    const stampPlan = planRoomBlueprintFromRoom(
      room,
      rcl,
      rememberedAnchor ? { anchor: { x: rememberedAnchor.x, y: rememberedAnchor.y } } : {}
    );
    anchor = new RoomPosition(stampPlan.anchor.x, stampPlan.anchor.y, room.name);
    const finalBlueprint = blueprintFromPlan(stampPlan);
    rememberLayoutAnchor(swarm, anchor, finalBlueprint.name, rcl);

    // Destroy misplaced structures that don't match the blueprint
    // Runs every construction tick (10 ticks) in non-combat postures for faster cleanup
    // Pass remote room assignments to preserve roads leading to remote mining rooms
    if (!postureManager.isCombatPosture(swarm.posture) && isStableCleanupAnchor(swarm, anchor)) {
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

    const constructionPolicy = getEconomyFirstConstructionPolicy({
      rcl,
      danger: swarm.danger,
      hasStorage: Boolean(room.storage),
      remoteAssignments: swarm.remoteAssignments ?? []
    });

    // Priority 1: Place road-aware perimeter defense (RCL 2+) only after economy stabilizes or during danger.
    // Road-aware system ensures roads aren't blocked by walls.
    let perimeterResult = { sitesPlaced: 0, wallsRemoved: 0 };
    if (shouldRunRoadAwarePerimeterConstruction({
      allowPerimeter: constructionPolicy.allowPerimeter,
      rcl,
      danger: swarm.danger,
      existingSites
    })) {
      const maxPerimeterSites = isEarlyGameDefense(rcl) ? MAX_EARLY_PERIMETER_SITES : MAX_REGULAR_PERIMETER_SITES;

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

    // Priority 2: Place construction sites from the canonical framework stamp planner.
    // Preferred stamps can partially place; any missing required structures flow through
    // fallback placement before this queue emits sites.
    const placed = issueConstructionSites(room, stampPlan, 3);

    // Priority 4: Place road construction sites for infrastructure routes (sources, controller, mineral)
    // Only place 1-2 road sites per tick to avoid overwhelming builders
    const roadSitesPlaced = placeRoadConstructionSites(room, anchor, 2);

    // Priority 5: Place ramparts on critical structures (RCL 2+)
    // Automated rampart placement for spawn, storage, towers, labs, etc.
    let rampartResult = { placed: 0, needsRepair: 0, totalCritical: 0, protected: 0 };
    if (constructionPolicy.allowRamparts && rcl >= 2 && existingSites.length < 9) {
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
      existingSites.length +
      placed +
      linkSitesPlaced +
      labSitesPlaced +
      roadSitesPlaced +
      perimeterResult.sitesPlaced +
      rampartResult.placed;
  }
}

/**
 * Global room construction manager instance
 */
export const roomConstructionManager = new RoomConstructionManager();

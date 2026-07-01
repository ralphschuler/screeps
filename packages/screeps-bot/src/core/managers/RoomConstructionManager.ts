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
  buildConstructionQueue,
  destroyMisplacedStructures,
  getMandatoryStructureTargets,
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

export interface CriticalDefenseConstructionOptions {
  criticalOnly?: boolean;
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

function countOwnedStructures(room: Room, structureType: StructureConstant): number {
  return room.find(FIND_MY_STRUCTURES, { filter: structure => structure.structureType === structureType }).length;
}

function countBuildsForType(room: Room, structureType: BuildableStructureConstant): number {
  const ownedStructures = room.find(FIND_MY_STRUCTURES, {
    filter: structure => structure.structureType === structureType
  });
  const ownedSites = room.find(FIND_MY_CONSTRUCTION_SITES, {
    filter: site => site.structureType === structureType
  });

  return ownedStructures.length + ownedSites.length;
}

function hasOutstandingMandatoryBlueprintDemand(room: Room, rcl: number): boolean {
  const targets = getMandatoryStructureTargets(rcl);

  for (const structureType of Object.keys(targets) as BuildableStructureConstant[]) {
    const target = targets[structureType] ?? 0;
    if (target <= 0) continue;
    if (countBuildsForType(room, structureType) < target) {
      return true;
    }
  }

  return false;
}

function placeCriticalDefenseConstructionSites(room: Room, stampPlan: ReturnType<typeof planRoomBlueprintFromRoom>, maxSites: number): number {
  if (maxSites <= 0) return 0;
  const globalSiteCap = typeof MAX_CONSTRUCTION_SITES === "undefined" ? 100 : MAX_CONSTRUCTION_SITES;
  const globalExistingSites = typeof Game === "undefined" ? 0 : Object.keys(Game.constructionSites ?? {}).length;
  if (globalExistingSites >= globalSiteCap) return 0;

  const rcl = room.controller?.level ?? stampPlan.rcl;
  const controllerStructures = (typeof CONTROLLER_STRUCTURES === "undefined"
    ? { [STRUCTURE_TOWER]: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 2, 6: 2, 7: 3, 8: 6 } }
    : CONTROLLER_STRUCTURES) as Record<string, Record<number, number>>;
  const towerLimit = controllerStructures[STRUCTURE_TOWER]?.[rcl] ?? 0;
  const towerCount = countOwnedStructures(room, STRUCTURE_TOWER);
  const existingStructureKeys = new Set<string>();
  const existingSiteKeys = new Set<string>();
  for (const structure of room.find(FIND_STRUCTURES)) {
    existingStructureKeys.add(`${structure.structureType}:${structure.pos.x},${structure.pos.y}`);
  }
  for (const site of room.find(FIND_MY_CONSTRUCTION_SITES)) {
    existingSiteKeys.add(`${site.structureType}:${site.pos.x},${site.pos.y}`);
  }
  const queue = buildConstructionQueue(stampPlan, { existingStructureKeys, existingSiteKeys, currentRcl: rcl })
    .filter(item =>
      item.structureType === STRUCTURE_TOWER ||
      (item.structureType === STRUCTURE_RAMPART && (towerCount < towerLimit || rcl >= 3))
    )
    .sort((a, b) => {
      if (a.structureType === STRUCTURE_TOWER && b.structureType !== STRUCTURE_TOWER) return -1;
      if (b.structureType === STRUCTURE_TOWER && a.structureType !== STRUCTURE_TOWER) return 1;
      return b.score - a.score;
    });

  if (towerCount < towerLimit && !queue.some(item => item.structureType === STRUCTURE_TOWER)) {
    const spawn = room.find(FIND_MY_SPAWNS)[0];
    const anchor = spawn?.pos ?? room.controller?.pos;
    if (anchor) {
      const terrain = room.getTerrain();
      for (let radius = 1; radius <= 4 && !queue.some(item => item.structureType === STRUCTURE_TOWER); radius++) {
        for (let dx = -radius; dx <= radius && !queue.some(item => item.structureType === STRUCTURE_TOWER); dx++) {
          for (let dy = -radius; dy <= radius && !queue.some(item => item.structureType === STRUCTURE_TOWER); dy++) {
            const x = anchor.x + dx;
            const y = anchor.y + dy;
            if (x <= 1 || x >= 48 || y <= 1 || y >= 48) continue;
            if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;
            const key = `${STRUCTURE_TOWER}:${x},${y}`;
            if (existingStructureKeys.has(key) || existingSiteKeys.has(key)) continue;
            queue.unshift({ x, y, structureType: STRUCTURE_TOWER, minRcl: 3, priority: "P0", score: 1000, source: "critical-defense-fallback" });
          }
        }
      }
    }
  }

  let created = 0;
  for (const item of queue) {
    if (created >= maxSites || globalExistingSites + created >= globalSiteCap) break;
    const result = room.createConstructionSite(item.x, item.y, item.structureType);
    if (result === OK) created++;
  }
  return created;
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
    spawns: StructureSpawn[],
    options: CriticalDefenseConstructionOptions = {}
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

    const criticalDefenseSitesPlaced = swarm.danger >= 1 && rcl >= 3
      ? placeCriticalDefenseConstructionSites(room, stampPlan, swarm.danger >= 2 ? 3 : 1)
      : 0;

    if (options.criticalOnly) {
      swarm.metrics.constructionSites = existingSites.length + criticalDefenseSitesPlaced;
      return;
    }

    // Check per-room construction site throttle after first-spawn/bootstrap, priority economy sites,
    // and survival-critical defense sites. Keep bypass open for rooms still lacking mandatory
    // blueprint structures (e.g., RCL2 rooms still missing extensions).
    const hasMandatoryDemand = hasOutstandingMandatoryBlueprintDemand(room, rcl);
    if (
      existingSites.length + linkSitesPlaced + labSitesPlaced + criticalDefenseSitesPlaced >= 10 &&
      !hasMandatoryDemand
    ) {
      swarm.metrics.constructionSites =
        existingSites.length + linkSitesPlaced + labSitesPlaced + criticalDefenseSitesPlaced;
      return;
    }

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
      criticalDefenseSitesPlaced +
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

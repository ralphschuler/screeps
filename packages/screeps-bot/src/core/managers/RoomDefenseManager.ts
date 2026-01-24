/**
 * RoomDefenseManager - Handles all defense-related operations
 * 
 * Responsibilities:
 * - Tower control (attack, heal, repair)
 * - Threat assessment
 * - Structure count tracking (destroyed structures)
 * - Nuke detection
 * - Hostile detection and event emission
 */

import { assessThreat, calculateWallRepairTarget } from "@ralphschuler/screeps-defense";
import { safeFind } from "@ralphschuler/screeps-utils";
import { postureManager } from "../../logic/evolution";
import { pheromoneManager } from "../../logic/pheromone";
import { memoryManager } from "../../memory/manager";
import type { SwarmState } from "@ralphschuler/screeps-memory";
import { kernel } from "../kernel";

/**
 * Structure count tracking for detecting destroyed structures
 * Separate from SwarmState to avoid polluting memory
 */
interface StructureCountTracking {
  lastStructureCount: number;
  lastSpawns: StructureSpawn[];
  lastTowers: StructureTower[];
  lastTick: number;
}

const structureCountTracker = new Map<string, StructureCountTracking>();

/**
 * Room Defense Manager
 */
export class RoomDefenseManager {
  /**
   * Update threat assessment
   * Uses optimized iteration for better CPU efficiency
   * Emits events through the kernel event system for centralized handling
   * OPTIMIZATION: Only check enemy structures if hostiles are present or danger > 0
   */
  public updateThreatAssessment(
    room: Room,
    swarm: SwarmState,
    cache: { spawns: StructureSpawn[]; towers: StructureTower[] }
  ): void {
    // Track structure count changes to detect destroyed structures
    // Only check every 5 ticks to reduce CPU usage
    // Uses a separate Map to avoid polluting SwarmState memory
    if (Game.time % 5 === 0) {
      const currentStructureCount = cache.spawns.length + cache.towers.length;

      const tracking = structureCountTracker.get(room.name);

      if (tracking && tracking.lastTick < Game.time) {
        // Compare with previous counts
        if (currentStructureCount < tracking.lastStructureCount) {
          // Structure(s) destroyed - emit event for each critical structure type
          if (cache.spawns.length < tracking.lastSpawns.length) {
            kernel.emit("structure.destroyed", {
              roomName: room.name,
              structureType: STRUCTURE_SPAWN,
              structureId: "unknown",
              source: room.name
            });
          }
          if (cache.towers.length < tracking.lastTowers.length) {
            kernel.emit("structure.destroyed", {
              roomName: room.name,
              structureType: STRUCTURE_TOWER,
              structureId: "unknown",
              source: room.name
            });
          }
        }
      }

      // Store counts for next check
      // Use shallow copy to avoid holding references to old structure objects
      structureCountTracker.set(room.name, {
        lastStructureCount: currentStructureCount,
        lastSpawns: [...cache.spawns],
        lastTowers: [...cache.towers],
        lastTick: Game.time
      });
    }

    // Use safeFind to handle engine errors with corrupted owner data
    const hostiles = safeFind(room, FIND_HOSTILE_CREEPS);

    // Use threat assessment for accurate danger level calculation
    if (hostiles.length > 0) {
      const threat = assessThreat(room);
      const newDanger = threat.dangerLevel;

      // Update danger and emit events if increased
      if (newDanger > swarm.danger) {
        // Update pheromones with threat assessment data
        pheromoneManager.updateDangerFromThreat(swarm, threat.threatScore, threat.dangerLevel);

        // Diffuse danger to cluster rooms if part of a cluster
        if (swarm.clusterId) {
          const cluster = memoryManager.getCluster(swarm.clusterId);
          if (cluster) {
            pheromoneManager.diffuseDangerToCluster(room.name, threat.threatScore, cluster.memberRooms);
          }
        }

        memoryManager.addRoomEvent(
          room.name,
          "hostileDetected",
          `${hostiles.length} hostiles, danger=${newDanger}, score=${threat.threatScore}`
        );

        // Emit hostile detected events for each hostile through the kernel event system
        for (const hostile of hostiles) {
          kernel.emit("hostile.detected", {
            roomName: room.name,
            hostileId: hostile.id,
            hostileOwner: hostile.owner.username,
            bodyParts: hostile.body.length,
            threatLevel: newDanger,
            source: room.name
          });
        }
      }

      swarm.danger = newDanger;
    } else if (swarm.danger > 0) {
      // Emit hostile cleared event when danger level drops to 0
      kernel.emit("hostile.cleared", {
        roomName: room.name,
        source: room.name
      });
      swarm.danger = 0;
    }

    // Check for nukes (only every 10 ticks to reduce CPU cost)
    // Nukes have a long flight time (~50k ticks), so checking every 10 ticks is sufficient
    if (Game.time % 10 === 0) {
      const nukes = room.find(FIND_NUKES);
      if (nukes.length > 0) {
        if (!swarm.nukeDetected) {
          pheromoneManager.onNukeDetected(swarm);
          const launchSource = nukes[0]?.launchRoomName ?? "unidentified source";
          memoryManager.addRoomEvent(room.name, "nukeDetected", `${nukes.length} nuke(s) incoming from ${launchSource}`);
          swarm.nukeDetected = true;

          // Emit nuke detected events through kernel event system
          for (const nuke of nukes) {
            kernel.emit("nuke.detected", {
              roomName: room.name,
              nukeId: nuke.id,
              landingTick: Game.time + nuke.timeToLand,
              launchRoomName: nuke.launchRoomName,
              source: room.name
            });
          }
        }
      } else {
        // Reset flag when nukes are gone
        swarm.nukeDetected = false;
      }
    }
  }

  /**
   * Run tower control
   * OPTIMIZATION: Use cached structures to avoid repeated room.find() calls
   * OPTIMIZATION: All towers focus fire on the same target for faster kills
   */
  public runTowerControl(room: Room, swarm: SwarmState, towers: StructureTower[]): void {
    if (towers.length === 0) return;

    // Find targets - use safeFind to handle engine errors with corrupted owner data
    const hostiles = safeFind(room, FIND_HOSTILE_CREEPS);

    // Select primary target once for all towers to focus fire
    const primaryTarget = hostiles.length > 0 ? this.selectTowerTarget(hostiles) : null;

    for (const tower of towers) {
      if (tower.store.getUsedCapacity(RESOURCE_ENERGY) < 10) continue;

      // Priority 1: Attack hostiles (all towers focus fire on same target)
      if (primaryTarget) {
        tower.attack(primaryTarget);
        continue;
      }

      // Priority 2: Heal damaged creeps (only in non-siege)
      if (swarm.posture !== "siege") {
        const damaged = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
          filter: c => c.hits < c.hitsMax
        });
        if (damaged) {
          tower.heal(damaged);
          continue;
        }
      }

      // Priority 3: Repair structures (only in non-war postures)
      if (!postureManager.isCombatPosture(swarm.posture)) {
        const damaged = tower.pos.findClosestByRange(FIND_STRUCTURES, {
          filter: s =>
            s.hits < s.hitsMax * 0.8 && s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART
        });
        if (damaged) {
          tower.repair(damaged);
          continue;
        }
      }

      // Priority 4: Repair walls and ramparts based on RCL and danger level
      // Only repair in peaceful conditions (no hostiles, non-combat posture)
      if (!postureManager.isCombatPosture(swarm.posture) && hostiles.length === 0) {
        const rcl = room.controller?.level ?? 1;
        const repairTarget = calculateWallRepairTarget(rcl, swarm.danger);
        const wallOrRampart = tower.pos.findClosestByRange(FIND_STRUCTURES, {
          filter: s =>
            (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) && s.hits < repairTarget
        });
        if (wallOrRampart) {
          tower.repair(wallOrRampart);
        }
      }
    }
  }

  /**
   * Select tower attack target
   */
  private selectTowerTarget(hostiles: Creep[]): Creep | null {
    // Sort by priority: healers > boosted > ranged > melee > others
    const sorted = hostiles.sort((a, b) => {
      const scoreA = this.getHostilePriority(a);
      const scoreB = this.getHostilePriority(b);
      return scoreB - scoreA;
    });

    return sorted[0] ?? null;
  }

  /**
   * Get priority score for hostile targeting
   * OPTIMIZATION: Use getActiveBodyparts() for faster priority calculation
   * Consistent with military.ts findPriorityTarget implementation
   */
  private getHostilePriority(hostile: Creep): number {
    let score = 0;

    // Use getActiveBodyparts() for faster body part counting (O(1) per type vs O(n) for all parts)
    const healParts = hostile.getActiveBodyparts(HEAL);
    const rangedParts = hostile.getActiveBodyparts(RANGED_ATTACK);
    const attackParts = hostile.getActiveBodyparts(ATTACK);
    const claimParts = hostile.getActiveBodyparts(CLAIM);
    const workParts = hostile.getActiveBodyparts(WORK);

    // Calculate score based on body composition (same priority as military.ts)
    score += healParts * 100;
    score += rangedParts * 50;
    score += attackParts * 40;
    score += claimParts * 60;
    score += workParts * 30;

    // Check for any boosted parts (only if score is high to avoid unnecessary iteration)
    if (score > 0) {
      for (const part of hostile.body) {
        if (part.boost) {
          score += 20;
          break; // Only add boost bonus once
        }
      }
    }

    return score;
  }
}

/**
 * Global room defense manager instance
 */
export const roomDefenseManager = new RoomDefenseManager();

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

import {
  assessThreat,
  calculateWallRepairTarget,
  getActualHostileCreeps,
  selectTowerAction
} from "@ralphschuler/screeps-defense";
import { memoryManager } from "@ralphschuler/screeps-memory";
import type { SwarmState } from "@ralphschuler/screeps-memory";
import { pheromoneManager } from "@ralphschuler/screeps-pheromones";
import { postureManager } from "../../logic/evolution";
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

    const hostiles = getActualHostileCreeps(room);

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
          memoryManager.addRoomEvent(
            room.name,
            "nukeDetected",
            `${nukes.length} nuke(s) incoming from ${launchSource}`
          );
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

    const hostiles = getActualHostileCreeps(room);

    const isCombatPosture = postureManager.isCombatPosture(swarm.posture);
    const rcl = room.controller?.level ?? 1;
    const wallRepairTarget = calculateWallRepairTarget(rcl, swarm.danger);

    for (const tower of towers) {
      if (tower.store.getUsedCapacity(RESOURCE_ENERGY) < 10) continue;

      const action = selectTowerAction({
        tower,
        hostiles,
        posture: swarm.posture,
        rcl,
        danger: swarm.danger,
        isCombatPosture,
        wallRepairTarget
      });

      if (action.type === "attack") {
        tower.attack(action.target);
      } else if (action.type === "heal") {
        tower.heal(action.target);
      } else if (action.type === "repair") {
        tower.repair(action.target);
      }
    }
  }
}

/**
 * Global room defense manager instance
 */
export const roomDefenseManager = new RoomDefenseManager();

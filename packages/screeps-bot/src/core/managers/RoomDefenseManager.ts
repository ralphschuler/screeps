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

import { assessThreat, calculateWallRepairTarget, getActualHostileCreeps } from "@ralphschuler/screeps-defense";
import { memoryManager } from "@ralphschuler/screeps-memory";
import type { SwarmState } from "@ralphschuler/screeps-memory";
import { pheromoneManager } from "@ralphschuler/screeps-pheromones";
import { recordRoomAttackers } from "../../empire/postureManager";
import { postureManager } from "../../logic/evolution";
import { kernel } from "../kernel";
import {
  type DefenseKernelEvent,
  type DefensePostureIntent,
  type DefensePostureSnapshot,
  type DefenseStructureTrackingSnapshot,
  type TowerDefenseAction,
  planDefensePostureIntent,
  planTowerDefenseIntent
} from "./roomDefensePostureModule";

const structureCountTracker = new Map<string, DefenseStructureTrackingSnapshot>();

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
    const hostiles = getActualHostileCreeps(room);
    const intent = this.getDefensePostureIntent(room, swarm, cache, hostiles);
    this.executeDefensePostureIntent(room, swarm, hostiles, intent);
  }

  /**
   * Build observable defense posture intent before mutating memory, pheromones, or events.
   */
  public getDefensePostureIntent(
    room: Room,
    swarm: SwarmState,
    cache: { spawns: StructureSpawn[]; towers: StructureTower[] },
    hostiles: Creep[] = getActualHostileCreeps(room)
  ): DefensePostureIntent {
    const snapshot = this.getDefensePostureSnapshot(room, swarm, cache, hostiles);
    return planDefensePostureIntent(snapshot);
  }

  private getDefensePostureSnapshot(
    room: Room,
    swarm: SwarmState,
    cache: { spawns: StructureSpawn[]; towers: StructureTower[] },
    hostiles: Creep[]
  ): DefensePostureSnapshot {
    const cluster = swarm.clusterId ? memoryManager.getCluster(swarm.clusterId) : null;
    const threat = hostiles.length > 0 ? assessThreat(room) : undefined;
    const nukes = Game.time % 10 === 0 ? room.find(FIND_NUKES) : [];

    return {
      roomName: room.name,
      time: Game.time,
      currentDanger: swarm.danger,
      nukeDetected: swarm.nukeDetected ?? false,
      clusterId: swarm.clusterId,
      clusterMemberRooms: cluster?.memberRooms,
      previousStructures: structureCountTracker.get(room.name),
      currentStructures: {
        spawns: cache.spawns.map(spawn => spawn.id),
        towers: cache.towers.map(tower => tower.id)
      },
      hostiles: hostiles.map(hostile => ({
        id: hostile.id,
        owner: hostile.owner.username,
        bodyParts: hostile.body.length
      })),
      threat: threat ? { dangerLevel: threat.dangerLevel, threatScore: threat.threatScore } : undefined,
      nukes: nukes.map(nuke => ({
        id: nuke.id,
        timeToLand: nuke.timeToLand,
        launchRoomName: nuke.launchRoomName
      }))
    };
  }

  private executeDefensePostureIntent(
    room: Room,
    swarm: SwarmState,
    hostiles: Creep[],
    intent: DefensePostureIntent
  ): void {
    if (intent.nextStructureTracking) {
      structureCountTracker.set(room.name, intent.nextStructureTracking);
    }

    // Track last hostile sighting for posture recovery hysteresis.
    if (hostiles.length > 0) {
      swarm.lastHostileTick = Game.time;
    }

    if (intent.recordAttackers) {
      recordRoomAttackers(room.name, hostiles);
    }

    for (const effect of intent.pheromoneEffects) {
      if (effect.type === "danger") {
        pheromoneManager.updateDangerFromThreat(swarm, effect.threatScore, effect.dangerLevel);
      } else if (effect.type === "diffuseDanger") {
        pheromoneManager.diffuseDangerToCluster(effect.roomName, effect.threatScore, effect.memberRooms);
      } else if (effect.type === "nukeDetected") {
        pheromoneManager.onNukeDetected(swarm);
      }
    }

    for (const event of intent.roomEvents) {
      memoryManager.addRoomEvent(event.roomName, event.type, event.message);
    }

    for (const event of intent.kernelEvents) {
      this.emitDefenseKernelEvent(event);
    }

    swarm.danger = intent.nextDanger;
    swarm.nukeDetected = intent.nextNukeDetected;
  }

  private emitDefenseKernelEvent(event: DefenseKernelEvent): void {
    switch (event.type) {
      case "hostile.detected":
        kernel.emit(event.type, event.payload);
        break;
      case "hostile.cleared":
        kernel.emit(event.type, event.payload);
        break;
      case "structure.destroyed":
        kernel.emit(event.type, event.payload);
        break;
      case "nuke.detected":
        kernel.emit(event.type, event.payload);
        break;
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
    const rcl = room.controller?.level ?? 1;
    const actions = planTowerDefenseIntent({
      towers,
      hostiles,
      posture: swarm.posture,
      rcl,
      danger: swarm.danger,
      isCombatPosture: postureManager.isCombatPosture(swarm.posture),
      wallRepairTarget: calculateWallRepairTarget(rcl, swarm.danger),
      bucket: Game.cpu.bucket
    });

    for (const action of actions) {
      this.executeTowerDefenseAction(action);
    }
  }

  private executeTowerDefenseAction(action: TowerDefenseAction): void {
    if (action.type === "attack") {
      action.tower.attack(action.target);
    } else if (action.type === "heal") {
      action.tower.heal(action.target);
    } else if (action.type === "repair") {
      action.tower.repair(action.target);
    }
  }
}

/**
 * Global room defense manager instance
 */
export const roomDefenseManager = new RoomDefenseManager();

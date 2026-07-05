/**
 * RoomEconomyManager - Handles all resource processing operations
 *
 * Responsibilities:
 * - Lab reactions and boosting
 * - Power spawn processing
 * - Labs, factory capability, and power spawn processing intent
 *
 * Factory and link side effects are centralized in @ralphschuler/screeps-economy managers.
 */

import type { SwarmState } from "@ralphschuler/screeps-memory";
import { labEconomyWorkflow, type LabWorkflowResult } from "../../labs/labEconomyWorkflow";

interface LabWorkflowPort {
  run(room: Room, swarm: SwarmState): LabWorkflowResult;
}

export interface RoomEconomyIntent {
  roomName: string;
  rcl: number;
  processing: {
    labs: boolean;
    factory: boolean;
    powerSpawn: boolean;
  };
  links: {
    count: number;
    hasNetwork: boolean;
  };
}

/**
 * Room Economy Manager
 */
export class RoomEconomyManager {
  public constructor(private readonly labWorkflow: LabWorkflowPort = labEconomyWorkflow) {}

  /**
   * Describe room-level economy intent without mutating game state.
   */
  public getRoomEconomyIntent(room: Room, cache: { links: StructureLink[] }): RoomEconomyIntent {
    const rcl = room.controller?.level ?? 0;
    const linkCount = cache.links.length;

    return {
      roomName: room.name,
      rcl,
      processing: {
        labs: rcl >= 6,
        factory: rcl >= 7,
        powerSpawn: rcl >= 8
      },
      links: {
        count: linkCount,
        hasNetwork: linkCount >= 2
      }
    };
  }

  /**
   * Run resource processing (labs, factory, power spawn)
   */
  public runResourceProcessing(
    room: Room,
    swarm: SwarmState,
    cache: {
      factory: StructureFactory | undefined;
      powerSpawn: StructurePowerSpawn | undefined;
      links: StructureLink[];
      sources: Source[];
    }
  ): void {
    const intent = this.getRoomEconomyIntent(room, cache);

    if (intent.processing.labs) {
      this.labWorkflow.run(room, swarm);
    }

    if (intent.processing.powerSpawn) {
      this.runPowerSpawn(room, cache.powerSpawn);
    }

    // Factory production and link transfers are handled by framework economy processes.
  }

  /**
   * Run power spawn
   */
  private runPowerSpawn(room: Room, powerSpawn: StructurePowerSpawn | undefined): void {
    if (!powerSpawn) return;

    // Process power if we have resources
    if (
      powerSpawn.store.getUsedCapacity(RESOURCE_POWER) >= 1 &&
      powerSpawn.store.getUsedCapacity(RESOURCE_ENERGY) >= 50
    ) {
      powerSpawn.processPower();
    }
  }
}

/**
 * Global room economy manager instance
 */
export const roomEconomyManager = new RoomEconomyManager();

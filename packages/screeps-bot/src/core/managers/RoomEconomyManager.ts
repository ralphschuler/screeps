/**
 * RoomEconomyManager - Handles all resource processing operations
 *
 * Responsibilities:
 * - Lab reactions and boosting
 * - Factory production
 * - Power spawn processing
 * - Labs, factory, and power spawn processing
 *
 * Link transfers are centralized in @ralphschuler/screeps-economy LinkManager.
 */

/* eslint-disable no-undef */
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

    if (intent.processing.factory) {
      this.runFactory(room, cache.factory);
    }

    if (intent.processing.powerSpawn) {
      this.runPowerSpawn(room, cache.powerSpawn);
    }

    // Link transfers are handled by the decorated LinkManager process.
  }

  /**
   * Run factory production
   */
  private runFactory(room: Room, factory: StructureFactory | undefined): void {
    if (!factory || factory.cooldown > 0) return;

    // Simple commodity production - compress minerals
    const minerals: MineralConstant[] = [
      RESOURCE_UTRIUM,
      RESOURCE_LEMERGIUM,
      RESOURCE_KEANIUM,
      RESOURCE_ZYNTHIUM,
      RESOURCE_HYDROGEN,
      RESOURCE_OXYGEN
    ];

    for (const mineral of minerals) {
      if (factory.store.getUsedCapacity(mineral) >= 500 && factory.store.getUsedCapacity(RESOURCE_ENERGY) >= 200) {
        // Try to produce compressed bar
        const result = factory.produce(RESOURCE_UTRIUM_BAR); // Note: This is simplified
        if (result === OK) break;
      }
    }
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

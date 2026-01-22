/**
 * RoomEconomyManager - Handles all resource processing operations
 *
 * Responsibilities:
 * - Lab reactions and boosting
 * - Factory production
 * - Power spawn processing
 * - Link transfers (source -> storage -> controller)
 */

import type { SwarmState } from "../../memory/schemas";
import { memoryManager } from "../../memory/manager";
import { chemistryPlanner } from "../../labs/chemistryPlanner";
import { boostManager } from "../../labs/boostManager";
import { labManager } from "../../labs/labManager";
import { labConfigManager } from "../../labs/labConfig";
import { logger } from "../logger";

/**
 * Room Economy Manager
 */
export class RoomEconomyManager {
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
    const rcl = room.controller?.level ?? 0;

    // Run labs (RCL 6+)
    if (rcl >= 6) {
      this.runLabs(room);
    }

    // Run factory (RCL 7+)
    if (rcl >= 7) {
      this.runFactory(room, cache.factory);
    }

    // Run power spawn (RCL 8)
    if (rcl >= 8) {
      this.runPowerSpawn(room, cache.powerSpawn);
    }

    // Run links
    this.runLinks(room, cache.links, cache.sources);
  }

  /**
   * Run lab reactions
   */
  private runLabs(room: Room): void {
    const swarm = memoryManager.getSwarmState(room.name);
    if (!swarm) return;

    // Initialize lab manager for this room (loads config from memory)
    labManager.initialize(room.name);

    // Prepare labs for boosting when danger is high
    boostManager.prepareLabs(room, swarm);

    // Plan reactions using chemistry planner
    const reaction = chemistryPlanner.planReactions(room, swarm);
    if (reaction) {
      // Check if labs are ready for this reaction
      const reactionStep = {
        product: reaction.product as MineralCompoundConstant,
        input1: reaction.input1 as MineralConstant | MineralCompoundConstant,
        input2: reaction.input2 as MineralConstant | MineralCompoundConstant,
        amountNeeded: 1000,
        priority: reaction.priority
      };

      if (labManager.areLabsReady(room.name, reactionStep)) {
        // Set active reaction if not already set or different
        const config = labConfigManager.getConfig(room.name);
        const currentReaction = config?.activeReaction;

        if (
          !currentReaction ||
          currentReaction.input1 !== reaction.input1 ||
          currentReaction.input2 !== reaction.input2 ||
          currentReaction.output !== reaction.product
        ) {
          labManager.setActiveReaction(
            room.name,
            reaction.input1 as MineralConstant | MineralCompoundConstant,
            reaction.input2 as MineralConstant | MineralCompoundConstant,
            reaction.product as MineralCompoundConstant
          );
        }

        // Execute reaction
        chemistryPlanner.executeReaction(room, reaction);
      } else {
        // Labs not ready, resource logistics needs to supply them
        logger.debug(
          `Labs not ready for reaction: ${reaction.input1} + ${reaction.input2} -> ${reaction.product}`,
          { subsystem: "Labs", room: room.name }
        );
      }
    }

    // Save lab state to memory
    labManager.save(room.name);
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

  /**
   * Run link transfers with bidirectional support
   * Enhanced logic supports: source→storage, storage→controller
   */
  private runLinks(room: Room, links: StructureLink[], sources: Source[]): void {
    if (links.length < 2) return;

    const storage = room.storage;
    if (!storage) return;

    // Find storage link (within 2 of storage)
    const storageLink = links.find(l => l.pos.getRangeTo(storage) <= 2);
    if (!storageLink) return;

    // Find source links (links near sources)
    const sourceLinks = links.filter(l => sources.some(s => l.pos.getRangeTo(s) <= 2));

    // Find controller link (within 3 of controller for upgrader access)
    const controller = room.controller;
    const controllerLink = controller
      ? links.find(l => l.pos.getRangeTo(controller) <= 3 && l.id !== storageLink.id)
      : undefined;

    // Priority 1: Transfer from source links to storage link
    for (const sourceLink of sourceLinks) {
      if (sourceLink.store.getUsedCapacity(RESOURCE_ENERGY) >= 400 && sourceLink.cooldown === 0) {
        if (storageLink.store.getFreeCapacity(RESOURCE_ENERGY) >= 400) {
          sourceLink.transferEnergy(storageLink);
          return; // One transfer per tick to avoid conflicts
        }
      }
    }

    // Priority 2: Transfer from storage link to controller link (if controller needs energy)
    if (controllerLink && storageLink.cooldown === 0) {
      const controllerNeedsEnergy = controllerLink.store.getUsedCapacity(RESOURCE_ENERGY) < 400;
      const storageLinkHasEnergy = storageLink.store.getUsedCapacity(RESOURCE_ENERGY) >= 400;

      if (controllerNeedsEnergy && storageLinkHasEnergy) {
        storageLink.transferEnergy(controllerLink);
      }
    }
  }
}

/**
 * Global room economy manager instance
 */
export const roomEconomyManager = new RoomEconomyManager();

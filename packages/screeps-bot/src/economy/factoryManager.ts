/**
 * Factory Manager
 *
 * Handles automated factory operations:
 * - Commodity production planning
 * - Input resource management
 * - Output distribution
 * - Factory worker coordination
 * - Lab integration for resource coordination
 *
 * Addresses Issue: Factory automation missing
 */

import { logger } from "../core/logger";
import { ProcessPriority } from "../core/kernel";
import { MediumFrequencyProcess, ProcessClass } from "../core/processDecorators";

/**
 * Factory manager configuration
 */
export interface FactoryManagerConfig {
  /** Minimum bucket to run factory operations */
  minBucket: number;
  /** Minimum storage energy before factory production */
  minStorageEnergy: number;
  /** Target buffer for factory inputs */
  inputBufferAmount: number;
  /** Target buffer for factory outputs */
  outputBufferAmount: number;
}

const DEFAULT_CONFIG: FactoryManagerConfig = {
  minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
  minStorageEnergy: 80000,
  inputBufferAmount: 2000,
  outputBufferAmount: 5000
};

/**
 * Recipe for a commodity
 */
interface CommodityRecipe {
  [resource: string]: number;
}

/**
 * Simple commodity production recipes
 * Maps output commodity to required inputs
 * Note: Only includes level 0 commodities that can be produced in factory
 */
const COMMODITY_RECIPES: Partial<Record<CommodityConstant, CommodityRecipe>> = {
  // Level 0 commodities (basic compression)
  [RESOURCE_UTRIUM_BAR]: { [RESOURCE_UTRIUM]: 500, [RESOURCE_ENERGY]: 200 },
  [RESOURCE_LEMERGIUM_BAR]: { [RESOURCE_LEMERGIUM]: 500, [RESOURCE_ENERGY]: 200 },
  [RESOURCE_ZYNTHIUM_BAR]: { [RESOURCE_ZYNTHIUM]: 500, [RESOURCE_ENERGY]: 200 },
  [RESOURCE_KEANIUM_BAR]: { [RESOURCE_KEANIUM]: 500, [RESOURCE_ENERGY]: 200 },
  [RESOURCE_GHODIUM_MELT]: { [RESOURCE_GHODIUM]: 500, [RESOURCE_ENERGY]: 200 },
  [RESOURCE_OXIDANT]: { [RESOURCE_OXYGEN]: 500, [RESOURCE_ENERGY]: 200 },
  [RESOURCE_REDUCTANT]: { [RESOURCE_HYDROGEN]: 500, [RESOURCE_ENERGY]: 200 },
  [RESOURCE_PURIFIER]: { [RESOURCE_CATALYST]: 500, [RESOURCE_ENERGY]: 200 },
  [RESOURCE_BATTERY]: { [RESOURCE_ENERGY]: 600 }
};

/**
 * Production priority for commodities (higher = more important)
 */
const PRODUCTION_PRIORITY: Partial<Record<CommodityConstant, number>> = {
  [RESOURCE_BATTERY]: 10, // Most useful - pure energy compression
  [RESOURCE_UTRIUM_BAR]: 5,
  [RESOURCE_LEMERGIUM_BAR]: 5,
  [RESOURCE_ZYNTHIUM_BAR]: 5,
  [RESOURCE_KEANIUM_BAR]: 5,
  [RESOURCE_GHODIUM_MELT]: 4,
  [RESOURCE_OXIDANT]: 3,
  [RESOURCE_REDUCTANT]: 3,
  [RESOURCE_PURIFIER]: 3
};

/**
 * Factory Manager Class
 */
@ProcessClass()
export class FactoryManager {
  private config: FactoryManagerConfig;

  public constructor(config: Partial<FactoryManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main factory tick - runs periodically
   * Registered as kernel process via decorator
   */
  @MediumFrequencyProcess("factory:manager", "Factory Manager", {
    priority: ProcessPriority.LOW,
    interval: 30,
    minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
    cpuBudget: 0.05
  })
  public run(): void {
    if (Game.cpu.bucket < this.config.minBucket) {
      return;
    }

    // Process all rooms with factories
    const roomsWithFactories = Object.values(Game.rooms).filter(r => {
      if (!r.controller?.my) return false;
      const factories = r.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_FACTORY
      });
      return factories.length > 0;
    });

    for (const room of roomsWithFactories) {
      this.processFactory(room);
    }
  }

  /**
   * Process a single factory
   */
  private processFactory(room: Room): void {
    const factories = room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_FACTORY
    }) as StructureFactory[];
    
    if (factories.length === 0) return;
    const factory = factories[0];
    if (!factory) return;
    if (factory.cooldown > 0) return;

    const storage = room.storage;
    if (!storage) return;

    // Check if we have enough energy in storage to run factory
    const storageEnergy = storage.store.getUsedCapacity(RESOURCE_ENERGY);
    if (storageEnergy < this.config.minStorageEnergy) {
      return;
    }

    // Find what we can produce
    const production = this.selectProduction(room, factory, storage);
    if (!production) {
      return;
    }

    // Check if we have enough inputs in factory
    const recipe = COMMODITY_RECIPES[production];
    if (!recipe) return;

    let canProduce = true;
    for (const [resource, amount] of Object.entries(recipe)) {
      const available = factory.store.getUsedCapacity(resource as ResourceConstant);
      if (available < amount) {
        canProduce = false;
        break;
      }
    }

    if (canProduce) {
      // Produce the commodity (production is already CommodityConstant)
      const result = factory.produce(production);
      if (result === OK) {
        logger.info(`Factory in ${room.name} producing ${production}`, { subsystem: "Factory" });
      } else if (result !== ERR_TIRED) {
        logger.debug(`Factory production failed in ${room.name}: ${result}`, { subsystem: "Factory" });
      }
    }
  }

  /**
   * Select what commodity to produce based on available resources and demand
   */
  private selectProduction(
    room: Room,
    factory: StructureFactory,
    storage: StructureStorage
  ): CommodityConstant | null {
    // Get list of possible productions sorted by priority
    const candidates: { commodity: CommodityConstant; priority: number; score: number }[] = [];

    for (const [commodity, recipe] of Object.entries(COMMODITY_RECIPES)) {
      const commodityKey = commodity as CommodityConstant;
      
      // Check if we have all inputs in storage
      let hasInputs = true;
      let inputScore = 0;

      for (const [resource, amount] of Object.entries(recipe)) {
        const resourceKey = resource as ResourceConstant;
        const available = storage.store.getUsedCapacity(resourceKey);
        
        if (available < amount * 2) {
          // Not enough in storage to justify production
          hasInputs = false;
          break;
        }
        
        // Score based on excess (more excess = better candidate)
        inputScore += available / (amount * 10);
      }

      if (!hasInputs) continue;

      // Check if we already have too much of this output
      const outputInFactory = factory.store.getUsedCapacity(commodityKey);
      const outputInStorage = storage.store.getUsedCapacity(commodityKey);
      const totalOutput = outputInFactory + outputInStorage;

      if (totalOutput > this.config.outputBufferAmount) {
        continue; // Already have enough of this commodity
      }

      // Calculate score (priority + input availability - output saturation)
      const priority = PRODUCTION_PRIORITY[commodityKey] ?? 1;
      const outputSaturation = totalOutput / this.config.outputBufferAmount;
      const score = priority * inputScore * (1 - outputSaturation);

      candidates.push({ commodity: commodityKey, priority, score });
    }

    if (candidates.length === 0) return null;

    // Sort by score (highest first)
    candidates.sort((a, b) => b.score - a.score);

    return candidates[0].commodity;
  }

  /**
   * Get required inputs for factory production
   * Used by factory workers to know what to supply
   */
  public getRequiredInputs(factory: StructureFactory, room: Room): { resource: ResourceConstant; amount: number }[] {
    const storage = room.storage;
    if (!storage) return [];

    const production = this.selectProduction(room, factory, storage);
    if (!production) return [];

    const recipe = COMMODITY_RECIPES[production];
    if (!recipe) return [];

    const required: { resource: ResourceConstant; amount: number }[] = [];

    for (const [resource, amount] of Object.entries(recipe)) {
      const resourceKey = resource as ResourceConstant;
      const current = factory.store.getUsedCapacity(resourceKey);
      const needed = Math.max(0, this.config.inputBufferAmount - current);

      if (needed > 0) {
        required.push({ resource: resourceKey, amount: Math.min(needed, amount * 2) });
      }
    }

    return required;
  }

  /**
   * Check if factory has outputs that need to be removed
   */
  public hasOutputsToRemove(factory: StructureFactory): boolean {
    // Check for any produced commodities in the factory
    for (const commodity of Object.keys(COMMODITY_RECIPES)) {
      const amount = factory.store.getUsedCapacity(commodity as CommodityConstant);
      if (amount > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if factory can operate without conflicting with lab operations
   * Factory and labs may compete for the same base minerals
   * @param room Room to check
   * @returns true if factory can safely operate
   */
  public canOperateWithoutLabConflict(room: Room): boolean {
    const terminal = room.terminal;
    if (!terminal) return false;

    // Check if labs are actively producing compounds
    const labs = room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_LAB
    }) as StructureLab[];

    // If labs are running reactions, defer factory operations
    const activeLabCount = labs.filter(lab => lab.mineralType && lab.mineralAmount > 0).length;
    
    // Allow factory to run if less than half the labs are active
    // This ensures labs have priority during active compound production
    return activeLabCount < labs.length / 2 || labs.length === 0;
  }
}

/**
 * Global factory manager instance
 */
export const factoryManager = new FactoryManager();

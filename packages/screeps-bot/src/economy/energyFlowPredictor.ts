/**
 * Energy Flow Prediction System
 *
 * Predicts future energy availability based on income and consumption analysis.
 * Used by spawn queue to make intelligent decisions about body sizes and spawn timing.
 *
 * Features:
 * - Income prediction from harvesters and miners
 * - Consumption prediction from upgraders, builders, towers, and spawning
 * - Multi-tick lookahead for spawn planning
 * - Configurable prediction horizon
 *
 * Accuracy targets:
 * - ±10% for predictions up to 50 ticks
 * - ±20% for predictions up to 100 ticks
 */

import { logger } from "../core/logger";

/**
 * Configuration for energy flow prediction
 */
export interface EnergyFlowConfig {
  /** Maximum ticks to predict into future */
  maxPredictionTicks: number;
  /** Safety margin multiplier (0.8 = assume 80% of predicted income) */
  safetyMargin: number;
  /** Whether to enable detailed logging */
  enableLogging: boolean;
}

/**
 * Breakdown of energy income sources
 */
export interface EnergyIncomeBreakdown {
  /** Energy per tick from harvesters */
  harvesters: number;
  /** Energy per tick from static miners */
  miners: number;
  /** Energy per tick from links */
  links: number;
  /** Total income per tick */
  total: number;
}

/**
 * Breakdown of energy consumption
 */
export interface EnergyConsumptionBreakdown {
  /** Energy per tick for upgrading */
  upgraders: number;
  /** Energy per tick for building */
  builders: number;
  /** Energy per tick for tower operations */
  towers: number;
  /** Energy per tick for spawning (averaged) */
  spawning: number;
  /** Energy per tick for repairs */
  repairs: number;
  /** Total consumption per tick */
  total: number;
}

/**
 * Energy prediction result
 */
export interface EnergyPrediction {
  /** Current energy available */
  current: number;
  /** Predicted energy after N ticks */
  predicted: number;
  /** Income breakdown */
  income: EnergyIncomeBreakdown;
  /** Consumption breakdown */
  consumption: EnergyConsumptionBreakdown;
  /** Net flow per tick (income - consumption) */
  netFlow: number;
  /** Ticks predicted into future */
  ticks: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: EnergyFlowConfig = {
  maxPredictionTicks: 100,
  safetyMargin: 0.9, // Assume 90% of predicted income (conservative)
  enableLogging: false
};

/**
 * Energy Flow Predictor
 * Analyzes room state and predicts future energy availability
 */
export class EnergyFlowPredictor {
  private config: EnergyFlowConfig;

  constructor(config: Partial<EnergyFlowConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Predict energy available in N ticks
   * 
   * @param room - The room to predict for
   * @param ticks - Number of ticks to predict into future
   * @returns Energy prediction result
   */
  public predictEnergyInTicks(room: Room, ticks: number): EnergyPrediction {
    if (ticks < 0) {
      throw new Error("Cannot predict negative ticks");
    }

    if (ticks > this.config.maxPredictionTicks) {
      logger.warn(
        `Prediction horizon ${ticks} exceeds max ${this.config.maxPredictionTicks}, clamping`,
        { subsystem: "EnergyFlowPredictor" }
      );
      ticks = this.config.maxPredictionTicks;
    }

    const income = this.calculateEnergyIncome(room);
    const consumption = this.calculateEnergyConsumption(room);
    const current = room.energyAvailable;

    // Apply safety margin to income (be conservative)
    const safeIncome = income.total * this.config.safetyMargin;
    const netFlow = safeIncome - consumption.total;
    const predicted = Math.max(0, current + netFlow * ticks);

    const prediction: EnergyPrediction = {
      current,
      predicted,
      income,
      consumption,
      netFlow,
      ticks
    };

    if (this.config.enableLogging) {
      logger.debug(
        `Energy prediction for ${room.name}: ${current} → ${predicted} (${ticks} ticks, ${netFlow.toFixed(2)}/tick)`,
        { subsystem: "EnergyFlowPredictor" }
      );
    }

    return prediction;
  }

  /**
   * Calculate energy income per tick
   * 
   * @param room - The room to analyze
   * @returns Breakdown of energy income sources
   */
  public calculateEnergyIncome(room: Room): EnergyIncomeBreakdown {
    const harvesters = this.calculateHarvesterIncome(room);
    const miners = this.calculateMinerIncome(room);
    const links = this.calculateLinkIncome(room);

    return {
      harvesters,
      miners,
      links,
      total: harvesters + miners + links
    };
  }

  /**
   * Calculate energy consumption per tick
   * 
   * @param room - The room to analyze
   * @returns Breakdown of energy consumption
   */
  public calculateEnergyConsumption(room: Room): EnergyConsumptionBreakdown {
    const upgraders = this.calculateUpgraderConsumption(room);
    const builders = this.calculateBuilderConsumption(room);
    const towers = this.calculateTowerConsumption(room);
    const spawning = this.calculateSpawningConsumption(room);
    const repairs = this.calculateRepairConsumption(room);

    return {
      upgraders,
      builders,
      towers,
      spawning,
      repairs,
      total: upgraders + builders + towers + spawning + repairs
    };
  }

  /**
   * Calculate income from harvester creeps
   * Harvesters move between source and storage, so they have lower efficiency
   */
  private calculateHarvesterIncome(room: Room): number {
    const creeps = room.find(FIND_MY_CREEPS, {
      filter: c => c.memory.role === "harvester" || c.memory.role === "larvaWorker"
    });

    let totalWorkParts = 0;
    for (const creep of creeps) {
      const workParts = creep.body.filter(p => p.type === WORK && p.hits > 0).length;
      totalWorkParts += workParts;
    }

    // Each WORK part harvests 2 energy/tick, but harvesters spend ~50% time moving
    // So effective rate is ~1 energy/tick per WORK part
    const efficiency = 1.0;
    return totalWorkParts * efficiency;
  }

  /**
   * Calculate income from static miner creeps
   * Static miners sit on source, so they have very high efficiency
   */
  private calculateMinerIncome(room: Room): number {
    const creeps = room.find(FIND_MY_CREEPS, {
      filter: c => c.memory.role === "staticMiner" || c.memory.role === "miner"
    });

    let totalWorkParts = 0;
    for (const creep of creeps) {
      const workParts = creep.body.filter(p => p.type === WORK && p.hits > 0).length;
      totalWorkParts += workParts;
    }

    // Static miners harvest at full efficiency: 2 energy/tick per WORK part
    // But they need carriers to transport, so assume ~90% of energy reaches storage
    const efficiency = 1.8;
    return totalWorkParts * efficiency;
  }

  /**
   * Calculate income from link transfers
   * Links provide instantaneous energy transfer
   */
  private calculateLinkIncome(room: Room): number {
    // Links are handled separately and provide instant transfer
    // For prediction purposes, we assume they're already factored into miner income
    // or are instantaneous enough to not affect predictions
    return 0;
  }

  /**
   * Calculate energy consumption from upgraders
   */
  private calculateUpgraderConsumption(room: Room): number {
    const creeps = room.find(FIND_MY_CREEPS, {
      filter: c => c.memory.role === "upgrader"
    });

    let totalWorkParts = 0;
    for (const creep of creeps) {
      const workParts = creep.body.filter(p => p.type === WORK && p.hits > 0).length;
      totalWorkParts += workParts;
    }

    // Each WORK part uses 1 energy/tick when upgrading
    // Upgraders work ~70% of the time (rest is refilling)
    const efficiency = 0.7;
    return totalWorkParts * efficiency;
  }

  /**
   * Calculate energy consumption from builders
   */
  private calculateBuilderConsumption(room: Room): number {
    const creeps = room.find(FIND_MY_CREEPS, {
      filter: c => c.memory.role === "builder" || c.memory.role === "repairer"
    });

    const constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
    
    // If no construction sites, builders consume minimal energy (only repairs)
    if (constructionSites.length === 0) {
      return 0.1;
    }

    let totalWorkParts = 0;
    for (const creep of creeps) {
      const workParts = creep.body.filter(p => p.type === WORK && p.hits > 0).length;
      totalWorkParts += workParts;
    }

    // Each WORK part uses 5 energy/tick when building
    // Builders work ~50% of the time (rest is traveling and refilling)
    const efficiency = 0.5;
    const energyPerTick = 5;
    return totalWorkParts * efficiency * energyPerTick;
  }

  /**
   * Calculate energy consumption from towers
   */
  private calculateTowerConsumption(room: Room): number {
    const towers = room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_TOWER
    }) as StructureTower[];

    if (towers.length === 0) {
      return 0;
    }

    // Towers consume energy for:
    // - Repairs: 10 energy/action, variable frequency
    // - Attacks: 10 energy/action during combat
    // - Healing: 10 energy/action during combat

    // In peacetime, towers mainly repair
    // Assume average 2 repair actions per tower per tick during active repair
    // But towers only repair when structures need it, so reduce by activity factor
    const repairActivityFactor = 0.3; // Towers repair 30% of the time on average
    const energyPerRepair = 10;
    const repairsPerTick = 2;

    return towers.length * repairActivityFactor * energyPerRepair * repairsPerTick;
  }

  /**
   * Calculate energy consumption from spawning
   * This is amortized over time, not instantaneous
   */
  private calculateSpawningConsumption(room: Room): number {
    const spawns = room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_SPAWN
    }) as StructureSpawn[];

    if (spawns.length === 0) {
      return 0;
    }

    // Average spawn cost depends on room level
    // Early game (RCL 1-3): ~200-400 energy creeps
    // Mid game (RCL 4-6): ~500-1000 energy creeps
    // Late game (RCL 7-8): ~1000-2000 energy creeps
    const controller = room.controller;
    let avgSpawnCost = 500; // Default

    if (controller && controller.my) {
      const rcl = controller.level;
      if (rcl <= 3) {
        avgSpawnCost = 300;
      } else if (rcl <= 6) {
        avgSpawnCost = 750;
      } else {
        avgSpawnCost = 1500;
      }
    }

    // Average spawn time: body size dependent, assume ~20 ticks average
    const avgSpawnTime = 20;
    
    // Amortize spawn cost over spawn time
    const energyPerTick = avgSpawnCost / avgSpawnTime;

    // Multiply by number of spawns (assumes all spawns busy ~80% of time)
    const spawnUtilization = 0.8;
    return spawns.length * energyPerTick * spawnUtilization;
  }

  /**
   * Calculate energy consumption from repairs
   * This is separate from tower repairs and includes builder repairs
   */
  private calculateRepairConsumption(room: Room): number {
    // Repairs are mostly handled by towers (calculated separately)
    // Builders only repair when there are damaged structures and no construction
    // This is a minimal baseline
    return 0.5;
  }

  /**
   * Get recommended spawn delay for a body cost
   * Returns number of ticks to wait before spawning to ensure energy will be available
   * 
   * @param room - The room to check
   * @param bodyCost - Cost of the body to spawn
   * @returns Ticks to wait (0 if can spawn now)
   */
  public getRecommendedSpawnDelay(room: Room, bodyCost: number): number {
    const current = room.energyAvailable;
    
    if (current >= bodyCost) {
      return 0; // Can spawn now
    }

    const prediction = this.predictEnergyInTicks(room, 1);
    
    if (prediction.netFlow <= 0) {
      // Negative flow, energy will decrease
      // Don't recommend spawning (return large delay)
      return 999;
    }

    // Calculate ticks needed to reach target energy
    const energyNeeded = bodyCost - current;
    const ticksNeeded = Math.ceil(energyNeeded / prediction.netFlow);

    return Math.min(ticksNeeded, this.config.maxPredictionTicks);
  }

  /**
   * Check if room can afford to spawn a body within N ticks
   * 
   * @param room - The room to check
   * @param bodyCost - Cost of the body to spawn
   * @param maxWaitTicks - Maximum ticks willing to wait
   * @returns True if body will be affordable within maxWaitTicks
   */
  public canAffordInTicks(room: Room, bodyCost: number, maxWaitTicks: number): boolean {
    const prediction = this.predictEnergyInTicks(room, maxWaitTicks);
    return prediction.predicted >= bodyCost;
  }

  /**
   * Get maximum affordable body cost in N ticks
   * Useful for optimizing body size selection
   * 
   * @param room - The room to check
   * @param ticks - Number of ticks to look ahead
   * @returns Maximum energy that will be available
   */
  public getMaxAffordableInTicks(room: Room, ticks: number): number {
    const prediction = this.predictEnergyInTicks(room, ticks);
    // Cap at room's energy capacity to avoid spawning bodies larger than possible
    return Math.min(prediction.predicted, room.energyCapacityAvailable);
  }

  /**
   * Update configuration
   */
  public setConfig(config: Partial<EnergyFlowConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): EnergyFlowConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const energyFlowPredictor = new EnergyFlowPredictor();

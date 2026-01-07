/**
 * Pixel Buying Manager
 * 
 * Manages purchasing pixels from the market only when the empire has surplus resources.
 * This is a low-priority, non-critical operation that should never compete with
 * essential resource needs like energy, minerals, or military supplies.
 * 
 * Key Principles:
 * - Only buy pixels when there is a surplus of credits, energy, and essential resources
 * - Never prioritize pixel buying over other needs
 * - Use price-aware buying to get good deals
 * - Track purchase history for analysis
 * 
 * Addresses Issue: Implement a new system that uses the market to buy pixels
 */

import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { ProcessPriority } from "../core/kernel";
import { logger } from "@ralphschuler/screeps-core";
import { memoryManager } from "../memory/manager";

/**
 * Pixel Buying Manager Configuration
 */
export interface PixelBuyingConfig {
  /** Update interval in ticks */
  updateInterval: number;
  /** Minimum bucket to run pixel buying logic */
  minBucket: number;
  /** Minimum credits required before considering pixel purchases */
  minCreditsForPixels: number;
  /** Credit reserve that must be maintained (won't buy pixels if it would drop below this) */
  creditReserve: number;
  /** Minimum energy surplus across all terminals before buying pixels */
  minEnergySurplus: number;
  /** Energy threshold per room that must be maintained in storage/terminal */
  energyThresholdPerRoom: number;
  /** Maximum price per pixel (won't buy above this price) */
  maxPixelPrice: number;
  /** Target price per pixel (ideal buying price) */
  targetPixelPrice: number;
  /** Maximum pixels to buy per transaction */
  maxPixelsPerTransaction: number;
  /** Cooldown between pixel purchases (ticks) */
  purchaseCooldown: number;
  /** Minimum base minerals that must be maintained before buying pixels */
  minBaseMineralReserve: number;
  /** List of critical resources that must be above threshold before buying pixels */
  criticalResourceThresholds: Record<string, number>;
  /** Enable/disable pixel buying */
  enabled: boolean;
}

const DEFAULT_CONFIG: PixelBuyingConfig = {
  updateInterval: 200, // Check every 200 ticks
  minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
  minCreditsForPixels: 500000, // Need at least 500k credits
  creditReserve: 100000, // Always keep 100k credits in reserve
  minEnergySurplus: 500000, // Need at least 500k energy surplus
  energyThresholdPerRoom: 100000, // Each room needs 100k energy before considering pixels
  maxPixelPrice: 5000, // Won't pay more than 5000 credits per pixel
  targetPixelPrice: 2000, // Ideal price to buy at
  maxPixelsPerTransaction: 10, // Buy max 10 pixels at a time
  purchaseCooldown: 1000, // Wait 1000 ticks between purchases
  minBaseMineralReserve: 10000, // Need 10k of each base mineral
  criticalResourceThresholds: {
    // Energy must be above surplus threshold (checked separately)
    // Ghodium for nukes and boosts
    [RESOURCE_GHODIUM]: 5000
  },
  enabled: true
};

/**
 * Pixel purchase record for tracking
 */
export interface PixelPurchaseRecord {
  tick: number;
  amount: number;
  pricePerUnit: number;
  totalCost: number;
  orderId: string;
  fromRoom: string;
}

/**
 * Pixel buying memory state
 */
export interface PixelBuyingMemory {
  /** Last purchase tick */
  lastPurchaseTick: number;
  /** Total pixels purchased */
  totalPixelsPurchased: number;
  /** Total credits spent on pixels */
  totalCreditsSpent: number;
  /** Recent purchase records */
  purchaseHistory: PixelPurchaseRecord[];
  /** Last scan tick */
  lastScan: number;
}

/**
 * Create default pixel buying memory
 */
export function createDefaultPixelBuyingMemory(): PixelBuyingMemory {
  return {
    lastPurchaseTick: 0,
    totalPixelsPurchased: 0,
    totalCreditsSpent: 0,
    purchaseHistory: [],
    lastScan: 0
  };
}

/**
 * Pixel Buying Manager Class
 */
@ProcessClass()
export class PixelBuyingManager {
  private config: PixelBuyingConfig;
  private lastRun = 0;

  public constructor(config: Partial<PixelBuyingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main pixel buying tick
   * Registered as kernel process via decorator
   */
  @LowFrequencyProcess("empire:pixelBuying", "Pixel Buying Manager", {
    priority: ProcessPriority.IDLE, // Very low priority - only runs when everything else is fine
    interval: 200,
    minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
    cpuBudget: 0.01
  })
  public run(): void {
    if (!this.config.enabled) {
      return;
    }

    this.lastRun = Game.time;

    // Ensure pixel buying memory exists
    this.ensurePixelBuyingMemory();

    // Check if we're on cooldown
    if (!this.isPurchaseCooldownComplete()) {
      return;
    }

    // Check if we have surplus resources (the key requirement)
    if (!this.hasSurplusResources()) {
      logger.debug("Pixel buying skipped: no resource surplus", { subsystem: "PixelBuying" });
      return;
    }

    // Check if we have enough credits
    if (!this.hasEnoughCredits()) {
      logger.debug("Pixel buying skipped: insufficient credits", { subsystem: "PixelBuying" });
      return;
    }

    // Try to buy pixels at a good price
    this.attemptPixelPurchase();

    // Update memory
    this.updateMemory();
  }

  /**
   * Ensure pixel buying memory exists
   */
  private ensurePixelBuyingMemory(): void {
    const empire = memoryManager.getEmpire();
    if (!empire.market) {
      return;
    }
    // Store pixel buying data in market memory
    const marketMem = empire.market as unknown as Record<string, unknown>;
    if (!marketMem.pixelBuying) {
      marketMem.pixelBuying = createDefaultPixelBuyingMemory();
    }
  }

  /**
   * Get pixel buying memory
   */
  private getPixelBuyingMemory(): PixelBuyingMemory | undefined {
    const empire = memoryManager.getEmpire();
    if (!empire.market) return undefined;
    const marketMem = empire.market as unknown as Record<string, unknown>;
    return marketMem.pixelBuying as PixelBuyingMemory | undefined;
  }

  /**
   * Check if purchase cooldown has completed
   */
  private isPurchaseCooldownComplete(): boolean {
    const pixelMem = this.getPixelBuyingMemory();
    if (!pixelMem) return true;
    return Game.time - pixelMem.lastPurchaseTick >= this.config.purchaseCooldown;
  }

  /**
   * Check if we have surplus resources (the key requirement)
   * This is the main gate - we only buy pixels when we're "rich"
   */
  private hasSurplusResources(): boolean {
    // Calculate total resources across all rooms
    const totals = this.calculateTotalResources();

    // Check energy surplus
    const ownedRoomCount = Object.values(Game.rooms).filter(r => r.controller?.my).length;
    const requiredEnergy = ownedRoomCount * this.config.energyThresholdPerRoom;
    
    if (totals.energy < requiredEnergy + this.config.minEnergySurplus) {
      logger.debug(
        `Pixel buying: energy below surplus (${totals.energy} < ${requiredEnergy + this.config.minEnergySurplus})`,
        { subsystem: "PixelBuying" }
      );
      return false;
    }

    // Check critical resources
    for (const [resource, threshold] of Object.entries(this.config.criticalResourceThresholds)) {
      const amount = totals[resource] ?? 0;
      if (amount < threshold) {
        logger.debug(
          `Pixel buying: ${resource} below threshold (${amount} < ${threshold})`,
          { subsystem: "PixelBuying" }
        );
        return false;
      }
    }

    // Check base mineral reserves
    const baseMinerals: ResourceConstant[] = [
      RESOURCE_HYDROGEN,
      RESOURCE_OXYGEN,
      RESOURCE_UTRIUM,
      RESOURCE_LEMERGIUM,
      RESOURCE_KEANIUM,
      RESOURCE_ZYNTHIUM,
      RESOURCE_CATALYST
    ];

    for (const mineral of baseMinerals) {
      const amount = totals[mineral] ?? 0;
      if (amount < this.config.minBaseMineralReserve) {
        logger.debug(
          `Pixel buying: ${mineral} below reserve (${amount} < ${this.config.minBaseMineralReserve})`,
          { subsystem: "PixelBuying" }
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Check if we have enough credits to buy pixels
   */
  private hasEnoughCredits(): boolean {
    // availableCredits = total credits minus reserve we must maintain
    // We check if what's available (after reserve) is at least minCreditsForPixels
    const availableCredits = Game.market.credits - this.config.creditReserve;
    return availableCredits >= this.config.minCreditsForPixels;
  }

  /**
   * Calculate total resources across all terminals and storage
   */
  private calculateTotalResources(): Record<string, number> {
    const totals: Record<string, number> = {};

    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller?.my) continue;

      // Add terminal resources
      if (room.terminal) {
        for (const resource in room.terminal.store) {
          const resourceType = resource as ResourceConstant;
          totals[resourceType] = (totals[resourceType] ?? 0) + (room.terminal.store[resourceType] ?? 0);
        }
      }

      // Add storage resources
      if (room.storage) {
        for (const resource in room.storage.store) {
          const resourceType = resource as ResourceConstant;
          totals[resourceType] = (totals[resourceType] ?? 0) + (room.storage.store[resourceType] ?? 0);
        }
      }
    }

    return totals;
  }

  /**
   * Attempt to buy pixels from the market
   */
  private attemptPixelPurchase(): void {
    // Get all pixel sell orders
    // Note: PIXEL is an InterShardResourceConstant, not ResourceConstant
    const pixelOrders = Game.market.getAllOrders({
      type: ORDER_SELL,
      resourceType: PIXEL
    });

    if (pixelOrders.length === 0) {
      logger.debug("No pixel sell orders available", { subsystem: "PixelBuying" });
      return;
    }

    // Filter orders by price and sort by price (cheapest first)
    const affordableOrders = pixelOrders
      .filter(order => order.price <= this.config.maxPixelPrice && order.amount > 0)
      .sort((a, b) => a.price - b.price);

    if (affordableOrders.length === 0) {
      logger.debug(
        `No pixel orders below max price (${this.config.maxPixelPrice})`,
        { subsystem: "PixelBuying" }
      );
      return;
    }

    const bestOrder = affordableOrders[0];

    // Check if the price is good (at or below target price)
    const isGoodPrice = bestOrder.price <= this.config.targetPixelPrice;
    
    // If price is above target, only buy occasionally (opportunistic buying)
    if (!isGoodPrice && Game.time % 1000 !== 0) {
      logger.debug(
        `Pixel price (${bestOrder.price}) above target (${this.config.targetPixelPrice}), waiting`,
        { subsystem: "PixelBuying" }
      );
      return;
    }

    // Find a room with a terminal to execute the purchase
    const roomWithTerminal = Object.values(Game.rooms).find(
      r => r.terminal && r.controller?.my && !r.terminal.cooldown
    );

    if (!roomWithTerminal?.terminal) {
      logger.debug("No terminal available for pixel purchase", { subsystem: "PixelBuying" });
      return;
    }

    // Calculate how many pixels to buy
    const availableCredits = Game.market.credits - this.config.creditReserve;
    const maxByPrice = Math.floor(availableCredits / bestOrder.price);
    const pixelsToBuy = Math.min(
      this.config.maxPixelsPerTransaction,
      bestOrder.amount,
      maxByPrice
    );

    if (pixelsToBuy <= 0) {
      logger.debug("Cannot afford any pixels after reserve", { subsystem: "PixelBuying" });
      return;
    }

    // Calculate transaction cost (energy)
    const transactionCost = bestOrder.roomName 
      ? Game.market.calcTransactionCost(pixelsToBuy, roomWithTerminal.name, bestOrder.roomName)
      : 0;

    // Make sure we have enough energy for the transaction
    if (roomWithTerminal.terminal.store[RESOURCE_ENERGY] < transactionCost) {
      logger.debug(
        `Not enough energy for pixel transaction (need ${transactionCost})`,
        { subsystem: "PixelBuying" }
      );
      return;
    }

    // Execute the deal
    const result = Game.market.deal(bestOrder.id, pixelsToBuy, roomWithTerminal.name);

    if (result === OK) {
      const totalCost = pixelsToBuy * bestOrder.price;
      
      // Record the purchase
      this.recordPurchase({
        tick: Game.time,
        amount: pixelsToBuy,
        pricePerUnit: bestOrder.price,
        totalCost,
        orderId: bestOrder.id,
        fromRoom: roomWithTerminal.name
      });

      logger.info(
        `Purchased ${pixelsToBuy} pixels at ${bestOrder.price.toFixed(2)} credits each ` +
        `(total: ${totalCost.toFixed(0)} credits)${isGoodPrice ? " (GOOD PRICE!)" : ""}`,
        { subsystem: "PixelBuying" }
      );
    } else {
      logger.warn(`Failed to purchase pixels: error code ${result}`, { subsystem: "PixelBuying" });
    }
  }

  /**
   * Record a pixel purchase
   */
  private recordPurchase(record: PixelPurchaseRecord): void {
    const pixelMem = this.getPixelBuyingMemory();
    if (!pixelMem) return;

    pixelMem.lastPurchaseTick = record.tick;
    pixelMem.totalPixelsPurchased += record.amount;
    pixelMem.totalCreditsSpent += record.totalCost;
    pixelMem.purchaseHistory.push(record);

    // Keep only last 50 purchase records
    while (pixelMem.purchaseHistory.length > 50) {
      pixelMem.purchaseHistory.shift();
    }
  }

  /**
   * Update memory with last scan time
   */
  private updateMemory(): void {
    const pixelMem = this.getPixelBuyingMemory();
    if (pixelMem) {
      pixelMem.lastScan = Game.time;
    }
  }

  /**
   * Get pixel buying statistics
   */
  public getStats(): {
    totalPurchased: number;
    totalSpent: number;
    averagePrice: number;
    lastPurchaseTick: number;
    recentPurchases: PixelPurchaseRecord[];
  } | undefined {
    const pixelMem = this.getPixelBuyingMemory();
    if (!pixelMem) return undefined;

    return {
      totalPurchased: pixelMem.totalPixelsPurchased,
      totalSpent: pixelMem.totalCreditsSpent,
      averagePrice: pixelMem.totalPixelsPurchased > 0 
        ? pixelMem.totalCreditsSpent / pixelMem.totalPixelsPurchased 
        : 0,
      lastPurchaseTick: pixelMem.lastPurchaseTick,
      recentPurchases: pixelMem.purchaseHistory.slice(-10)
    };
  }

  /**
   * Check if pixel buying is currently possible
   * (for external monitoring/debugging)
   */
  public canBuyPixels(): {
    canBuy: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];

    if (!this.config.enabled) {
      reasons.push("Pixel buying is disabled");
    }

    if (!this.isPurchaseCooldownComplete()) {
      const pixelMem = this.getPixelBuyingMemory();
      const remaining = pixelMem 
        ? this.config.purchaseCooldown - (Game.time - pixelMem.lastPurchaseTick)
        : 0;
      reasons.push(`On cooldown (${remaining} ticks remaining)`);
    }

    if (!this.hasSurplusResources()) {
      reasons.push("No resource surplus");
    }

    if (!this.hasEnoughCredits()) {
      reasons.push(`Insufficient credits (need ${this.config.minCreditsForPixels} above ${this.config.creditReserve} reserve)`);
    }

    return {
      canBuy: reasons.length === 0,
      reasons
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<PixelBuyingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): PixelBuyingConfig {
    return { ...this.config };
  }

  /**
   * Enable pixel buying
   */
  public enable(): void {
    this.config.enabled = true;
    logger.info("Pixel buying enabled", { subsystem: "PixelBuying" });
  }

  /**
   * Disable pixel buying
   */
  public disable(): void {
    this.config.enabled = false;
    logger.info("Pixel buying disabled", { subsystem: "PixelBuying" });
  }
}

/**
 * Global pixel buying manager instance
 */
export const pixelBuyingManager = new PixelBuyingManager();

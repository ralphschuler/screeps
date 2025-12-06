/**
 * Market Manager - Trading AI
 *
 * Manages market operations:
 * - Order creation and management
 * - Buy/sell logic based on resource needs
 * - Price analysis
 * - War-mode aggressive purchasing
 * - Terminal transfer logistics
 *
 * Addresses Issues: #3, #27, #36
 */

import { memoryManager } from "../memory/manager";
import { logger } from "../core/logger";
import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { ProcessPriority } from "../core/kernel";

/**
 * Market Manager Configuration
 */
export interface MarketConfig {
  /** Update interval in ticks */
  updateInterval: number;
  /** Minimum bucket to run market logic */
  minBucket: number;
  /** Minimum credits to maintain */
  minCredits: number;
  /** Maximum price multiplier for war mode */
  warPriceMultiplier: number;
  /** Resource thresholds for selling */
  sellThresholds: Record<string, number>;
  /** Resource thresholds for buying */
  buyThresholds: Record<string, number>;
}

const DEFAULT_CONFIG: MarketConfig = {
  updateInterval: 100,
  minBucket: 7000,
  minCredits: 10000,
  warPriceMultiplier: 2.0,
  sellThresholds: {
    [RESOURCE_ENERGY]: 500000,
    [RESOURCE_HYDROGEN]: 20000,
    [RESOURCE_OXYGEN]: 20000,
    [RESOURCE_UTRIUM]: 20000,
    [RESOURCE_LEMERGIUM]: 20000,
    [RESOURCE_KEANIUM]: 20000,
    [RESOURCE_ZYNTHIUM]: 20000,
    [RESOURCE_CATALYST]: 20000
  },
  buyThresholds: {
    [RESOURCE_ENERGY]: 100000,
    [RESOURCE_HYDROGEN]: 5000,
    [RESOURCE_OXYGEN]: 5000,
    [RESOURCE_UTRIUM]: 5000,
    [RESOURCE_LEMERGIUM]: 5000,
    [RESOURCE_KEANIUM]: 5000,
    [RESOURCE_ZYNTHIUM]: 5000,
    [RESOURCE_CATALYST]: 5000
  }
};

/**
 * Market Manager Class
 */
@ProcessClass()
export class MarketManager {
  private config: MarketConfig;
  private lastRun = 0;

  public constructor(config: Partial<MarketConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main market tick
   * Registered as kernel process via decorator
   */
  @LowFrequencyProcess("empire:market", "Market Manager", {
    priority: ProcessPriority.LOW,
    interval: 100,
    minBucket: 7000,
    cpuBudget: 0.02
  })
  public run(): void {
    this.lastRun = Game.time;

    // Cancel old orders
    this.cancelOldOrders();

    // Update buy orders
    this.updateBuyOrders();

    // Update sell orders
    this.updateSellOrders();

    // Execute deals
    this.executeDeal();
  }

  /**
   * Cancel old or invalid orders
   */
  private cancelOldOrders(): void {
    const myOrders = Game.market.orders;

    for (const orderId in myOrders) {
      const order = myOrders[orderId];

      // Cancel orders older than 10000 ticks
      if (Game.time - order.created > 10000) {
        Game.market.cancelOrder(orderId);
        logger.info(`Cancelled old order: ${order.type} ${order.resourceType}`, { subsystem: "Market" });
      }

      // Cancel orders with very low remaining amount
      if (order.remainingAmount < 100) {
        Game.market.cancelOrder(orderId);
      }
    }
  }

  /**
   * Update buy orders based on resource needs
   */
  private updateBuyOrders(): void {
    const overmind = memoryManager.getOvermind();
    const isWarMode = overmind.objectives.warMode;

    // Get total resources across all terminals
    const totalResources: Record<string, number> = {};

    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.terminal && room.controller?.my) {
        for (const resource in room.terminal.store) {
          totalResources[resource] = (totalResources[resource] ?? 0) + room.terminal.store[resource as ResourceConstant];
        }
      }
    }

    // Check if we need to buy resources
    for (const resource in this.config.buyThresholds) {
      const threshold = this.config.buyThresholds[resource];
      const current = totalResources[resource] ?? 0;

      if (current < threshold) {
        this.createBuyOrder(resource as ResourceConstant, threshold - current, isWarMode);
      }
    }
  }

  /**
   * Create a buy order
   */
  private createBuyOrder(resource: ResourceConstant, amount: number, isWarMode: boolean): void {
    // Check if we already have a buy order for this resource
    const existingOrders = Object.values(Game.market.orders).filter(
      o => o.type === ORDER_BUY && o.resourceType === resource
    );

    if (existingOrders.length > 0) {
      return; // Already have a buy order
    }

    // Get market price
    const history = Game.market.getHistory(resource);
    if (history.length === 0) return;

    const avgPrice = history[history.length - 1].avgPrice;
    const maxPrice = isWarMode ? avgPrice * this.config.warPriceMultiplier : avgPrice * 1.1;

    // Check if we have enough credits
    if (Game.market.credits < this.config.minCredits) {
      return;
    }

    // Find a room with terminal to place order
    const roomWithTerminal = Object.values(Game.rooms).find(r => r.terminal && r.controller?.my);
    if (!roomWithTerminal?.terminal) return;

    // Create order
    const result = Game.market.createOrder({
      type: ORDER_BUY,
      resourceType: resource,
      price: maxPrice,
      totalAmount: Math.min(amount, 10000),
      roomName: roomWithTerminal.name
    });

    if (result === OK) {
      logger.info(`Created buy order: ${amount} ${resource} at ${maxPrice.toFixed(3)} credits`, {
        subsystem: "Market"
      });
    }
  }

  /**
   * Update sell orders based on resource surplus
   */
  private updateSellOrders(): void {
    // Get total resources across all terminals
    const totalResources: Record<string, number> = {};

    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.terminal && room.controller?.my) {
        for (const resource in room.terminal.store) {
          totalResources[resource] = (totalResources[resource] ?? 0) + room.terminal.store[resource as ResourceConstant];
        }
      }
    }

    // Check if we have surplus to sell
    for (const resource in this.config.sellThresholds) {
      const threshold = this.config.sellThresholds[resource];
      const current = totalResources[resource] ?? 0;

      if (current > threshold) {
        this.createSellOrder(resource as ResourceConstant, current - threshold);
      }
    }
  }

  /**
   * Create a sell order
   */
  private createSellOrder(resource: ResourceConstant, amount: number): void {
    // Check if we already have a sell order for this resource
    const existingOrders = Object.values(Game.market.orders).filter(
      o => o.type === ORDER_SELL && o.resourceType === resource
    );

    if (existingOrders.length > 0) {
      return; // Already have a sell order
    }

    // Get market price
    const history = Game.market.getHistory(resource);
    if (history.length === 0) return;

    const avgPrice = history[history.length - 1].avgPrice;
    const sellPrice = avgPrice * 0.9; // Sell slightly below market

    // Find a room with terminal and this resource
    const roomWithResource = Object.values(Game.rooms).find(
      r => r.terminal && r.controller?.my && r.terminal.store[resource] > 1000
    );

    if (!roomWithResource?.terminal) return;

    // Create order
    const result = Game.market.createOrder({
      type: ORDER_SELL,
      resourceType: resource,
      price: sellPrice,
      totalAmount: Math.min(amount, 10000),
      roomName: roomWithResource.name
    });

    if (result === OK) {
      logger.info(`Created sell order: ${amount} ${resource} at ${sellPrice.toFixed(3)} credits`, {
        subsystem: "Market"
      });
    }
  }

  /**
   * Execute a deal if profitable
   */
  private executeDeal(): void {
    // Find best deals (every 50 ticks to save CPU)
    if (Game.time % 50 !== 0) return;

    const overmind = memoryManager.getOvermind();
    const isWarMode = overmind.objectives.warMode;

    // In war mode, prioritize buying boosts
    if (isWarMode) {
      const boostResources: ResourceConstant[] = [
        RESOURCE_CATALYZED_GHODIUM_ACID,
        RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
        RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,
        RESOURCE_CATALYZED_KEANIUM_ALKALIDE
      ];

      for (const resource of boostResources) {
        const orders = Game.market.getAllOrders({ type: ORDER_SELL, resourceType: resource });

        if (orders.length > 0) {
          // Sort by price
          orders.sort((a, b) => a.price - b.price);

          const bestOrder = orders[0];
          const roomWithTerminal = Object.values(Game.rooms).find(r => r.terminal && r.controller?.my);

          if (roomWithTerminal && bestOrder.price < 10) {
            // Buy if price is reasonable
            const amount = Math.min(bestOrder.amount, 1000);
            const result = Game.market.deal(bestOrder.id, amount, roomWithTerminal.name);

            if (result === OK) {
              logger.info(`Bought ${amount} ${resource} for ${bestOrder.price.toFixed(3)} credits/unit`, {
                subsystem: "Market"
              });
            }
          }
        }
      }
    }
  }
}

/**
 * Global market manager instance
 */
export const marketManager = new MarketManager();

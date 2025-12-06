/**
 * Market Manager - Trading AI with Price Tracking
 *
 * Manages market operations:
 * - Historical price tracking and trend analysis
 * - Buy low / sell high strategy
 * - Order creation and management
 * - Buy/sell logic based on resource needs and price signals
 * - War-mode aggressive purchasing
 * - Terminal transfer logistics
 *
 * Addresses Issues: #3, #27, #36
 */

import { memoryManager } from "../memory/manager";
import { logger } from "../core/logger";
import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { ProcessPriority } from "../core/kernel";
import type { PriceDataPoint, ResourceMarketData } from "../memory/schemas";
import { createDefaultMarketMemory } from "../memory/schemas";

/**
 * Market Manager Configuration
 */
export interface MarketConfig {
  /** Update interval in ticks */
  updateInterval: number;
  /** Price tracking update interval in ticks */
  priceUpdateInterval: number;
  /** Minimum bucket to run market logic */
  minBucket: number;
  /** Minimum credits to maintain */
  minCredits: number;
  /** Maximum price multiplier for war mode */
  warPriceMultiplier: number;
  /** Buy threshold: % below average to trigger buy (e.g., 0.85 = 15% below avg) */
  buyPriceThreshold: number;
  /** Sell threshold: % above average to trigger sell (e.g., 1.15 = 15% above avg) */
  sellPriceThreshold: number;
  /** Resource thresholds for selling */
  sellThresholds: Record<string, number>;
  /** Resource thresholds for buying */
  buyThresholds: Record<string, number>;
  /** Resources to track prices for */
  trackedResources: ResourceConstant[];
}

const DEFAULT_CONFIG: MarketConfig = {
  updateInterval: 100,
  priceUpdateInterval: 500, // Update prices every 500 ticks
  minBucket: 7000,
  minCredits: 10000,
  warPriceMultiplier: 2.0,
  buyPriceThreshold: 0.85, // Buy when price is 15% below average
  sellPriceThreshold: 1.15, // Sell when price is 15% above average
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
  },
  trackedResources: [
    RESOURCE_ENERGY,
    RESOURCE_HYDROGEN,
    RESOURCE_OXYGEN,
    RESOURCE_UTRIUM,
    RESOURCE_LEMERGIUM,
    RESOURCE_KEANIUM,
    RESOURCE_ZYNTHIUM,
    RESOURCE_CATALYST,
    RESOURCE_GHODIUM,
    RESOURCE_POWER
  ]
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

    // Ensure market memory exists
    this.ensureMarketMemory();

    // Update price tracking
    if (Game.time % this.config.priceUpdateInterval === 0) {
      this.updatePriceTracking();
    }

    // Cancel old orders
    this.cancelOldOrders();

    // Update buy orders (with price-aware logic)
    this.updateBuyOrders();

    // Update sell orders (with price-aware logic)
    this.updateSellOrders();

    // Execute deals
    this.executeDeal();
  }

  /**
   * Ensure market memory exists and is initialized
   */
  private ensureMarketMemory(): void {
    const overmind = memoryManager.getOvermind();
    if (!overmind.market) {
      overmind.market = createDefaultMarketMemory();
    }
  }

  /**
   * Update price tracking for all tracked resources
   */
  private updatePriceTracking(): void {
    const overmind = memoryManager.getOvermind();
    if (!overmind.market) return;

    for (const resource of this.config.trackedResources) {
      this.updateResourcePrice(resource);
    }

    overmind.market.lastScan = Game.time;
    logger.debug(`Updated market prices for ${this.config.trackedResources.length} resources`, {
      subsystem: "Market"
    });
  }

  /**
   * Update price data for a specific resource
   */
  private updateResourcePrice(resource: ResourceConstant): void {
    const overmind = memoryManager.getOvermind();
    if (!overmind.market) return;

    const history = Game.market.getHistory(resource);
    if (history.length === 0) return;

    // Get latest price data from game
    const latest = history[history.length - 1];

    // Get or create market data for this resource
    let marketData = overmind.market.resources[resource] as ResourceMarketData | undefined;
    if (!marketData) {
      marketData = {
        resource,
        priceHistory: [],
        avgPrice: latest.avgPrice,
        trend: 0,
        lastUpdate: Game.time
      };
      overmind.market.resources[resource] = marketData;
    }

    // Add new price point
    const pricePoint: PriceDataPoint = {
      tick: Game.time,
      avgPrice: latest.avgPrice,
      lowPrice: latest.avgPrice * 0.9, // Estimate low/high from average
      highPrice: latest.avgPrice * 1.1
    };

    marketData.priceHistory.push(pricePoint);

    // Keep only last 30 price points (to avoid memory bloat)
    if (marketData.priceHistory.length > 30) {
      marketData.priceHistory.shift();
    }

    // Calculate rolling average (last 10 points)
    const recentPrices = marketData.priceHistory.slice(-10);
    marketData.avgPrice = recentPrices.reduce((sum, p) => sum + p.avgPrice, 0) / recentPrices.length;

    // Calculate trend
    if (marketData.priceHistory.length >= 5) {
      const oldAvg = marketData.priceHistory.slice(-5, -2).reduce((sum, p) => sum + p.avgPrice, 0) / 3;
      const newAvg = marketData.priceHistory.slice(-3).reduce((sum, p) => sum + p.avgPrice, 0) / 3;

      const change = (newAvg - oldAvg) / oldAvg;
      if (change > 0.05) {
        marketData.trend = 1; // Rising
      } else if (change < -0.05) {
        marketData.trend = -1; // Falling
      } else {
        marketData.trend = 0; // Stable
      }
    }

    marketData.lastUpdate = Game.time;
  }

  /**
   * Get market data for a resource
   */
  private getMarketData(resource: ResourceConstant): ResourceMarketData | undefined {
    const overmind = memoryManager.getOvermind();
    return overmind.market?.resources[resource] as ResourceMarketData | undefined;
  }

  /**
   * Check if current price is favorable for buying (below average)
   */
  private isBuyOpportunity(resource: ResourceConstant): boolean {
    const marketData = this.getMarketData(resource);
    if (!marketData) return false;

    const history = Game.market.getHistory(resource);
    if (history.length === 0) return false;

    const currentPrice = history[history.length - 1].avgPrice;
    const threshold = marketData.avgPrice * this.config.buyPriceThreshold;

    return currentPrice <= threshold;
  }

  /**
   * Check if current price is favorable for selling (above average)
   */
  private isSellOpportunity(resource: ResourceConstant): boolean {
    const marketData = this.getMarketData(resource);
    if (!marketData) return false;

    const history = Game.market.getHistory(resource);
    if (history.length === 0) return false;

    const currentPrice = history[history.length - 1].avgPrice;
    const threshold = marketData.avgPrice * this.config.sellPriceThreshold;

    return currentPrice >= threshold;
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
   * Update buy orders based on resource needs and price signals
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
        // In war mode OR when it's a buy opportunity, create buy order
        const isBuyOpp = this.isBuyOpportunity(resource as ResourceConstant);

        if (isWarMode || isBuyOpp) {
          this.createBuyOrder(resource as ResourceConstant, threshold - current, isWarMode, isBuyOpp);
        } else {
          logger.debug(`Skipping buy for ${resource}: waiting for better price`, { subsystem: "Market" });
        }
      }
    }
  }

  /**
   * Create a buy order with price-aware logic
   */
  private createBuyOrder(
    resource: ResourceConstant,
    amount: number,
    isWarMode: boolean,
    isBuyOpportunity: boolean
  ): void {
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

    const currentPrice = history[history.length - 1].avgPrice;
    const marketData = this.getMarketData(resource);

    // Calculate buy price based on context
    let maxPrice: number;
    if (isWarMode) {
      // In war mode, willing to pay more
      maxPrice = currentPrice * this.config.warPriceMultiplier;
    } else if (isBuyOpportunity && marketData) {
      // It's a good deal - buy at slightly above current to ensure order fulfillment
      maxPrice = currentPrice * 1.02;
    } else {
      // Normal case - buy at average
      maxPrice = marketData?.avgPrice ?? currentPrice * 1.1;
    }

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
      const priceContext = isBuyOpportunity ? " (LOW PRICE!)" : isWarMode ? " (WAR MODE)" : "";
      logger.info(`Created buy order: ${amount} ${resource} at ${maxPrice.toFixed(3)} credits${priceContext}`, {
        subsystem: "Market"
      });
    }
  }

  /**
   * Update sell orders based on resource surplus and price signals
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
        // Only sell when it's a good opportunity (high price)
        const isSellOpp = this.isSellOpportunity(resource as ResourceConstant);

        if (isSellOpp) {
          this.createSellOrder(resource as ResourceConstant, current - threshold, isSellOpp);
        } else {
          logger.debug(`Holding ${resource} surplus: waiting for better price`, { subsystem: "Market" });
        }
      }
    }
  }

  /**
   * Create a sell order with price-aware logic
   */
  private createSellOrder(resource: ResourceConstant, amount: number, isSellOpportunity: boolean): void {
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

    const currentPrice = history[history.length - 1].avgPrice;
    const marketData = this.getMarketData(resource);

    // Calculate sell price based on context
    let sellPrice: number;
    if (isSellOpportunity && marketData) {
      // High price opportunity - sell at slightly below current to ensure sale
      sellPrice = currentPrice * 0.98;
    } else {
      // Normal case - sell at average or slightly below current
      sellPrice = marketData?.avgPrice ?? currentPrice * 0.9;
    }

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
      const priceContext = isSellOpportunity ? " (HIGH PRICE!)" : "";
      logger.info(`Created sell order: ${amount} ${resource} at ${sellPrice.toFixed(3)} credits${priceContext}`, {
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

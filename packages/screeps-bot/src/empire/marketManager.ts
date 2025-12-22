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
 * 
 * TODO(P3): FEATURE - Implement machine learning for price prediction
 * Historical data could train models to predict price movements
 * TODO(P2): FEATURE - Add arbitrage detection for profit opportunities
 * Buy from one room, sell to another when profitable after transport costs
 * TODO(P2): PERF - Implement bulk trading optimization to minimize order fees
 * Batch small trades into larger orders to reduce 5% fee impact
 * TODO(P3): FEATURE - Add seasonal pattern detection for resource prices
 * Some resources have predictable price cycles (e.g., seasonal demand)
 * TODO(P3): FEATURE - Consider implementing automated market maker functionality
 * Provide liquidity for less common resources to earn fees
 * TODO(P2): ARCH - Add integration with expansion manager for resource acquisition
 * Buy resources needed for rapid expansion or war preparation
 * TODO(P1): FEATURE - Implement emergency resource sharing via market
 * When cluster is under attack, buy critical resources immediately
 * TODO(P2): TEST - Add unit tests for price calculation and trade decision logic
 * Verify trading decisions are made correctly based on price data
 */

import { memoryManager } from "../memory/manager";
import { logger } from "../core/logger";
import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { ProcessPriority } from "../core/kernel";
import type { PendingArbitrageTrade, PriceDataPoint, ResourceMarketData } from "../memory/schemas";
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
  /** Emergency credit reserve for critical purchases */
  emergencyCredits: number;
  /** Trading credit reserve for normal operations */
  tradingCredits: number;
  /** Maximum price multiplier for war mode */
  warPriceMultiplier: number;
  /** Buy threshold: % below average to trigger buy (e.g., 0.85 = 15% below avg) */
  buyPriceThreshold: number;
  /** Sell threshold: % above average to trigger sell (e.g., 1.15 = 15% above avg) */
  sellPriceThreshold: number;
  /** Maximum number of historical price points to keep per resource */
  maxPriceHistory: number;
  /** Number of recent prices to use for rolling average calculation */
  rollingAverageWindow: number;
  /** Multiplier for estimating low price from average (e.g., 0.9 = 10% below) */
  lowPriceMultiplier: number;
  /** Multiplier for estimating high price from average (e.g., 1.1 = 10% above) */
  highPriceMultiplier: number;
  /** Threshold for detecting price trend changes (e.g., 0.05 = 5% change) */
  trendChangeThreshold: number;
  /** Price adjustment when buying at opportunity (e.g., 1.02 = 2% above current) */
  buyOpportunityAdjustment: number;
  /** Price adjustment when selling at opportunity (e.g., 0.98 = 2% below current) */
  sellOpportunityAdjustment: number;
  /** Resource thresholds for selling */
  sellThresholds: Record<string, number>;
  /** Resource thresholds for buying */
  buyThresholds: Record<string, number>;
  /** Resources to track prices for */
  trackedResources: ResourceConstant[];
  /** Critical resources that trigger emergency buying */
  criticalResources: ResourceConstant[];
  /** Minimum amount for emergency buying */
  emergencyBuyThreshold: number;
  /** Order age in ticks before considering extension */
  orderExtensionAge: number;
  /** Maximum transport cost as % of deal value for arbitrage */
  maxTransportCostRatio: number;
}

const DEFAULT_CONFIG: MarketConfig = {
  updateInterval: 100,
  priceUpdateInterval: 500, // Update prices every 500 ticks
  minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
  minCredits: 10000,
  emergencyCredits: 5000, // Reserve for critical purchases
  tradingCredits: 50000, // Threshold to enable active trading
  warPriceMultiplier: 2.0,
  buyPriceThreshold: 0.85, // Buy when price is 15% below average
  sellPriceThreshold: 1.15, // Sell when price is 15% above average
  maxPriceHistory: 30, // Keep last 30 price points per resource
  rollingAverageWindow: 10, // Use last 10 points for rolling average
  lowPriceMultiplier: 0.9, // Estimate low price as 10% below average
  highPriceMultiplier: 1.1, // Estimate high price as 10% above average
  trendChangeThreshold: 0.05, // Detect trend change at 5% price movement
  buyOpportunityAdjustment: 1.02, // Buy at 2% above current low price
  sellOpportunityAdjustment: 0.98, // Sell at 2% below current high price
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
  ],
  criticalResources: [RESOURCE_ENERGY, RESOURCE_GHODIUM],
  emergencyBuyThreshold: 5000,
  orderExtensionAge: 5000,
  maxTransportCostRatio: 0.3 // Max 30% of deal value for transport
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
    minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
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

    // Update order statistics
    this.updateOrderStats();

    // Reconcile pending arbitrage trades
    this.reconcilePendingArbitrage();

    // Check for emergency resource needs
    this.handleEmergencyBuying();

    // Cancel old orders
    this.cancelOldOrders();

    // Extend/modify existing orders
    this.manageExistingOrders();

    // Update buy orders (with price-aware logic)
    this.updateBuyOrders();

    // Update sell orders (with price-aware logic)
    this.updateSellOrders();

    // Execute deals and arbitrage
    this.checkArbitrageOpportunities();
    this.executeDeal();

    // Balance resources across rooms
    if (Game.time % 200 === 0) {
      this.balanceResourcesAcrossRooms();
    }
  }

  /**
   * Ensure market memory exists and is initialized
   */
  private ensureMarketMemory(): void {
    const empire = memoryManager.getEmpire();
    if (!empire.market) {
      empire.market = createDefaultMarketMemory();
    }
    if (!empire.market.orders) {
      empire.market.orders = {};
    }
    if (empire.market.totalProfit === undefined) {
      empire.market.totalProfit = 0;
    }
    if (!empire.market.lastBalance) {
      empire.market.lastBalance = 0;
    }
    if (!empire.market.pendingArbitrage) {
      empire.market.pendingArbitrage = [];
    }
    if (empire.market.completedArbitrage === undefined) {
      empire.market.completedArbitrage = 0;
    }
    if (empire.market.arbitrageProfit === undefined) {
      empire.market.arbitrageProfit = 0;
    }
  }

  /**
   * Update price tracking for all tracked resources
   */
  private updatePriceTracking(): void {
    const empire = memoryManager.getEmpire();
    if (!empire.market) return;

    for (const resource of this.config.trackedResources) {
      this.updateResourcePrice(resource);
    }

    empire.market.lastScan = Game.time;
    logger.debug(`Updated market prices for ${this.config.trackedResources.length} resources`, {
      subsystem: "Market"
    });
  }

  /**
   * Update price data for a specific resource
   */
  private updateResourcePrice(resource: ResourceConstant): void {
    const empire = memoryManager.getEmpire();
    if (!empire.market) return;

    const history = Game.market.getHistory(resource);
    if (history.length === 0) return;

    // Get latest price data from game
    const latest = history[history.length - 1];

    // Get or create market data for this resource
    let marketData = empire.market.resources[resource] as ResourceMarketData | undefined;
    if (!marketData) {
      marketData = {
        resource,
        priceHistory: [],
        avgPrice: latest.avgPrice,
        trend: 0,
        lastUpdate: Game.time
      };
      empire.market.resources[resource] = marketData;
    }

    // Add new price point
    const pricePoint: PriceDataPoint = {
      tick: Game.time,
      avgPrice: latest.avgPrice,
      lowPrice: latest.avgPrice * this.config.lowPriceMultiplier,
      highPrice: latest.avgPrice * this.config.highPriceMultiplier
    };

    marketData.priceHistory.push(pricePoint);

    // Keep only configured number of price points (to avoid memory bloat)
    if (marketData.priceHistory.length > this.config.maxPriceHistory) {
      marketData.priceHistory.shift();
    }

    // Calculate rolling average using configured window
    const recentPrices = marketData.priceHistory.slice(-this.config.rollingAverageWindow);
    marketData.avgPrice = recentPrices.reduce((sum, p) => sum + p.avgPrice, 0) / recentPrices.length;

    // Calculate trend
    if (marketData.priceHistory.length >= 5) {
      const oldAvg = marketData.priceHistory.slice(-5, -2).reduce((sum, p) => sum + p.avgPrice, 0) / 3;
      const newAvg = marketData.priceHistory.slice(-3).reduce((sum, p) => sum + p.avgPrice, 0) / 3;

      const change = (newAvg - oldAvg) / oldAvg;
      if (change > this.config.trendChangeThreshold) {
        marketData.trend = 1; // Rising
      } else if (change < -this.config.trendChangeThreshold) {
        marketData.trend = -1; // Falling
      } else {
        marketData.trend = 0; // Stable
      }
    }

    // Calculate volatility (standard deviation / mean)
    if (recentPrices.length >= 5) {
      const mean = marketData.avgPrice;
      const variance =
        recentPrices.reduce((sum, p) => sum + Math.pow(p.avgPrice - mean, 2), 0) / recentPrices.length;
      const stdDev = Math.sqrt(variance);
      marketData.volatility = stdDev / mean;
    }

    // Simple price prediction (linear extrapolation of trend)
    if (marketData.priceHistory.length >= 3) {
      const last3 = marketData.priceHistory.slice(-3);
      const slope = (last3[2].avgPrice - last3[0].avgPrice) / 2;
      marketData.predictedPrice = last3[2].avgPrice + slope;
    }

    marketData.lastUpdate = Game.time;
  }

  /**
   * Get market data for a resource
   */
  private getMarketData(resource: ResourceConstant): ResourceMarketData | undefined {
    const empire = memoryManager.getEmpire();
    return empire.market?.resources[resource] ;
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
    const empire = memoryManager.getEmpire();
    const isWarMode = empire.objectives.warMode;

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
      maxPrice = currentPrice * this.config.buyOpportunityAdjustment;
    } else {
      // Normal case - buy at average
      maxPrice = marketData?.avgPrice ?? currentPrice * this.config.highPriceMultiplier;
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
   * Public method to sell surplus resources from a specific terminal
   * Called by terminal manager when capacity management triggers
   */
  public sellSurplusFromTerminal(
    roomName: string,
    resource: ResourceConstant,
    amount: number
  ): boolean {
    const room = Game.rooms[roomName];
    if (!room?.terminal || !room.controller?.my) {
      logger.warn(`Cannot sell from ${roomName}: no terminal or not owned`, {
        subsystem: "Market"
      });
      return false;
    }

    // Check if we have enough resources
    const available = room.terminal.store.getUsedCapacity(resource);
    if (available < amount) {
      logger.debug(
        `Cannot sell ${amount} ${resource} from ${roomName}: only ${available} available`,
        { subsystem: "Market" }
      );
      return false;
    }

    // Get current market data for pricing
    const empire = memoryManager.getEmpire();
    if (!empire.market) {
      // Market memory not initialized, use fallback pricing
      const price = 0.5;
      const orderResult = Game.market.createOrder({
        type: ORDER_SELL,
        resourceType: resource,
        price,
        totalAmount: amount,
        roomName
      });
      return orderResult === OK;
    }
    
    const marketData = empire.market.resources[resource];
    
    // Calculate sell price (slightly below average to sell quickly)
    let price = 0.5; // Default fallback
    
    if (marketData?.avgPrice) {
      // Sell at 5% below average for quick sale
      price = marketData.avgPrice * 0.95;
    } else {
      // No price data, check current market orders
      const buyOrders = Game.market.getAllOrders({
        type: ORDER_BUY,
        resourceType: resource
      });
      
      if (buyOrders.length > 0) {
        // Sell at best buy order price (instant sale)
        buyOrders.sort((a, b) => b.price - a.price);
        price = buyOrders[0]!.price;
      }
    }

    // Create sell order
    const orderResult = Game.market.createOrder({
      type: ORDER_SELL,
      resourceType: resource,
      price,
      totalAmount: amount,
      roomName
    });

    if (orderResult === OK) {
      logger.info(
        `Created surplus sell order: ${amount} ${resource} from ${roomName} at ${price.toFixed(3)} credits/unit`,
        { subsystem: "Market" }
      );
      return true;
    } else {
      logger.warn(
        `Failed to create sell order: ${orderResult} for ${amount} ${resource} from ${roomName}`,
        { subsystem: "Market" }
      );
      return false;
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
      sellPrice = currentPrice * this.config.sellOpportunityAdjustment;
    } else {
      // Normal case - sell at average or slightly below current
      sellPrice = marketData?.avgPrice ?? currentPrice * this.config.lowPriceMultiplier;
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
   * Update order statistics
   */
  private updateOrderStats(): void {
    const empire = memoryManager.getEmpire();
    if (!empire.market?.orders) return;

    const currentOrders = Game.market.orders;

    // Update stats for active orders
    for (const orderId in empire.market.orders) {
      const trackedOrder = empire.market.orders[orderId];
      const currentOrder = currentOrders[orderId];

      if (!currentOrder) {
        // Order completed or cancelled - calculate final profit
        if (trackedOrder.totalTraded > 0) {
          const profit = trackedOrder.type === "sell" ? trackedOrder.totalValue : -trackedOrder.totalValue;
          empire.market.totalProfit = (empire.market.totalProfit ?? 0) + profit;

          logger.info(
            `Order completed: ${trackedOrder.resource} ${trackedOrder.type} - Traded: ${trackedOrder.totalTraded}, Value: ${trackedOrder.totalValue.toFixed(0)}, Profit: ${profit.toFixed(0)}`,
            { subsystem: "Market" }
          );
        }

        // Remove from tracking
        delete empire.market.orders[orderId];
      } else if (currentOrder.totalAmount !== undefined) {
        // Update traded amount
        const traded = currentOrder.totalAmount - currentOrder.remainingAmount;
        const newTraded = traded - trackedOrder.totalTraded;

        if (newTraded > 0) {
          trackedOrder.totalTraded = traded;
          trackedOrder.totalValue += newTraded * currentOrder.price;
        }
      }
    }
  }

  /**
   * Execute a deal if profitable
   */
  private executeDeal(): void {
    // Find best deals (every 50 ticks to save CPU)
    if (Game.time % 50 !== 0) return;

    const empire = memoryManager.getEmpire();
    const isWarMode = empire.objectives.warMode;

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

  /**
   * Handle emergency resource buying
   * Buys critical resources at any price if below emergency threshold
   */
  private handleEmergencyBuying(): void {
    const empire = memoryManager.getEmpire();

    // Skip if not enough emergency credits
    if (Game.market.credits < this.config.emergencyCredits) return;

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

    // Check critical resources
    for (const resource of this.config.criticalResources) {
      const current = totalResources[resource] ?? 0;

      if (current < this.config.emergencyBuyThreshold) {
        this.executeEmergencyBuy(resource, this.config.emergencyBuyThreshold - current);
      }
    }
  }

  /**
   * Execute emergency buy at best available price
   */
  private executeEmergencyBuy(resource: ResourceConstant, amount: number): void {
    const orders = Game.market.getAllOrders({ type: ORDER_SELL, resourceType: resource });

    if (orders.length === 0) return;

    // Sort by total cost (price + transport)
    const roomWithTerminal = Object.values(Game.rooms).find(r => r.terminal && r.controller?.my);
    if (!roomWithTerminal?.terminal) return;

    orders.sort((a, b) => {
      // Calculate total cost including transport (if room is known)
      const costA = a.roomName
        ? a.price + Game.market.calcTransactionCost(1000, roomWithTerminal.name, a.roomName) / 1000
        : a.price;
      const costB = b.roomName
        ? b.price + Game.market.calcTransactionCost(1000, roomWithTerminal.name, b.roomName) / 1000
        : b.price;
      return costA - costB;
    });

    const bestOrder = orders[0];
    const buyAmount = Math.min(amount, bestOrder.amount, 10000);
    const result = Game.market.deal(bestOrder.id, buyAmount, roomWithTerminal.name);

    if (result === OK) {
      logger.warn(`EMERGENCY BUY: ${buyAmount} ${resource} at ${bestOrder.price.toFixed(3)} credits/unit`, {
        subsystem: "Market"
      });
    }
  }

  /**
   * Manage existing orders - extend or modify as needed
   */
  private manageExistingOrders(): void {
    const myOrders = Game.market.orders;

    for (const orderId in myOrders) {
      const order = myOrders[orderId];
      const age = Game.time - order.created;

      // Skip if order is too new
      if (age < this.config.orderExtensionAge) continue;

      // Check if we should adjust price (only for tracked resources)
      // Skip if not a regular resource (e.g., tokens)
      const resourceType = order.resourceType;
      if (resourceType === "token") continue;
      if (!this.config.trackedResources.includes(resourceType as ResourceConstant)) continue;
      
      const marketData = this.getMarketData(resourceType as ResourceConstant);
      if (!marketData) continue;

      // Get current market price
      const history = Game.market.getHistory(resourceType as ResourceConstant);
      if (history.length === 0) continue;

      const currentPrice = history[history.length - 1].avgPrice;

      // Adjust buy orders if price has changed significantly
      if (order.type === ORDER_BUY) {
        const targetPrice = currentPrice * this.config.buyOpportunityAdjustment;

        // If our price is too low (more than 10% below target), extend with better price
        if (order.price < targetPrice * 0.9 && order.remainingAmount > 1000) {
          Game.market.extendOrder(orderId, Math.min(5000, order.remainingAmount));
          logger.debug(`Extended buy order for ${order.resourceType}: +${order.remainingAmount} at ${order.price.toFixed(3)}`, {
            subsystem: "Market"
          });
        }
      }

      // Adjust sell orders
      if (order.type === ORDER_SELL) {
        const targetPrice = currentPrice * this.config.sellOpportunityAdjustment;

        // If our price is too high (more than 10% above target), extend with better price
        if (order.price > targetPrice * 1.1 && order.remainingAmount > 1000) {
          Game.market.extendOrder(orderId, Math.min(5000, order.remainingAmount));
          logger.debug(`Extended sell order for ${order.resourceType}: +${order.remainingAmount} at ${order.price.toFixed(3)}`, {
            subsystem: "Market"
          });
        }
      }
    }
  }

  /**
   * Reconcile pending arbitrage trades and execute outbound sales
   */
  private reconcilePendingArbitrage(): void {
    const empire = memoryManager.getEmpire();
    const market = empire.market;

    if (!market?.pendingArbitrage || market.pendingArbitrage.length === 0) return;

    const remaining: PendingArbitrageTrade[] = [];

    for (const trade of market.pendingArbitrage) {
      const room = Game.rooms[trade.destinationRoom];
      const terminal = room?.terminal;

      if (!terminal || !room?.controller?.my) {
        remaining.push(trade);
        continue;
      }

      if (Game.time < trade.expectedArrival || terminal.cooldown > 0) {
        remaining.push(trade);
        continue;
      }

      const available = terminal.store[trade.resource] ?? 0;
      if (available < trade.amount) {
        remaining.push(trade);
        continue;
      }

      let resolved = false;

      if (trade.sellOrderId) {
        const order = Game.market.getOrderById(trade.sellOrderId );

        if (order && order.remainingAmount > 0 && order.roomName) {
          const dealAmount = Math.min(trade.amount, order.remainingAmount, available);
          const energyCost = Game.market.calcTransactionCost(dealAmount, terminal.room.name, order.roomName);

          if (terminal.store[RESOURCE_ENERGY] >= energyCost) {
            const result = Game.market.deal(order.id, dealAmount, terminal.room.name);

            if (result === OK) {
              const profit = (order.price - trade.buyPrice) * dealAmount;
              market.totalProfit = (market.totalProfit ?? 0) + profit;
              market.arbitrageProfit = (market.arbitrageProfit ?? 0) + profit;
              market.completedArbitrage = (market.completedArbitrage ?? 0) + 1;

              logger.info(
                `Arbitrage complete: sold ${dealAmount} ${trade.resource} from ${terminal.room.name} at ${order.price.toFixed(
                  3
                )}, profit ${profit.toFixed(2)}`,
                { subsystem: "Market" }
              );

              resolved = true;
            }
          }
        }
      }

      if (!resolved) {
        const result = Game.market.createOrder({
          type: ORDER_SELL,
          resourceType: trade.resource,
          price: trade.targetSellPrice,
          totalAmount: trade.amount,
          roomName: terminal.room.name
        });

        if (result === OK) {
          logger.info(
            `Arbitrage posted sell order: ${trade.amount} ${trade.resource} at ${trade.targetSellPrice.toFixed(3)} from ${
              terminal.room.name
            }`,
            { subsystem: "Market" }
          );

          resolved = true;
        }
      }

      if (!resolved) {
        remaining.push(trade);
      }
    }

    market.pendingArbitrage = remaining;
  }

  /**
   * Check for arbitrage opportunities
   */
  private checkArbitrageOpportunities(): void {
    if (Game.cpu.bucket < this.config.minBucket) return;
    if (Game.market.credits < this.config.tradingCredits) return;

    const empire = memoryManager.getEmpire();
    const market = empire.market;
    const terminals = Object.values(Game.rooms).filter(r => r.terminal && r.controller?.my);

    if (!market || terminals.length === 0) return;

    const getRemainingAmount = (order: Order) => order.remainingAmount ?? order.amount ?? 0;

    for (const resource of this.config.trackedResources) {
      const buyOrders = Game.market
        .getAllOrders({ type: ORDER_BUY, resourceType: resource })
        .filter(o => o.remainingAmount > 0 && o.roomName);
      const sellOrders = Game.market
        .getAllOrders({ type: ORDER_SELL, resourceType: resource })
        .filter(o => o.remainingAmount > 0 && o.roomName);

      if (buyOrders.length === 0 || sellOrders.length === 0) continue;

      buyOrders.sort((a, b) => b.price - a.price);
      sellOrders.sort((a, b) => a.price - b.price);

      const highestBuy = buyOrders[0];
      const lowestSell = sellOrders[0];

      if (!highestBuy.roomName || !lowestSell.roomName) continue;

      const alreadyPending = market.pendingArbitrage?.some(
        trade => trade.buyOrderId === lowestSell.id || trade.sellOrderId === highestBuy.id
      );
      if (alreadyPending) continue;

      const tradeAmount = Math.min(getRemainingAmount(highestBuy), getRemainingAmount(lowestSell), 5000);
      if (tradeAmount <= 0) continue;

      for (const room of terminals) {
        const terminal = room.terminal!;
        const freeCapacity = terminal.store.getFreeCapacity(resource) ?? 0;
        if (freeCapacity < tradeAmount) continue;

        const buyEnergyCost = Game.market.calcTransactionCost(tradeAmount, room.name, lowestSell.roomName);
        const sellEnergyCost = Game.market.calcTransactionCost(tradeAmount, room.name, highestBuy.roomName);

        const perUnitTransport = (buyEnergyCost + sellEnergyCost) / tradeAmount;
        const profitPerUnit = highestBuy.price - lowestSell.price - perUnitTransport;

        if (profitPerUnit <= 0) continue;
        if (perUnitTransport / lowestSell.price > this.config.maxTransportCostRatio) continue;
        if (terminal.store[RESOURCE_ENERGY] < buyEnergyCost) continue;

        const creditsNeeded = lowestSell.price * tradeAmount;
        if (Game.market.credits - creditsNeeded < this.config.minCredits) continue;

        const result = Game.market.deal(lowestSell.id, tradeAmount, room.name);

        if (result !== OK) continue;

        const pendingTrade: PendingArbitrageTrade = {
          id: `${resource}-${Game.time}-${lowestSell.id}`,
          resource,
          amount: tradeAmount,
          buyOrderId: lowestSell.id,
          sellOrderId: highestBuy.id,
          targetSellPrice: highestBuy.price,
          destinationRoom: room.name,
          expectedArrival: Game.time + (terminal.cooldown ?? 0) + 1,
          buyPrice: lowestSell.price,
          transportCost: buyEnergyCost
        };

        market.pendingArbitrage?.push(pendingTrade);

        logger.info(
          `Arbitrage started: bought ${tradeAmount} ${resource} at ${lowestSell.price.toFixed(3)} to sell @ ${highestBuy.price.toFixed(
            3
          )} (profit/unit ~${profitPerUnit.toFixed(2)})`,
          { subsystem: "Market" }
        );

        break;
      }
    }
  }

  /**
   * Balance resources across rooms via terminal transfers
   */
  private balanceResourcesAcrossRooms(): void {
    const rooms = Object.values(Game.rooms).filter(r => r.terminal && r.controller?.my);

    if (rooms.length < 2) return; // Need at least 2 rooms

    // For each tracked resource, balance if needed
    for (const resource of this.config.trackedResources) {
      const roomResources: { room: Room; amount: number }[] = [];

      // Collect resource amounts per room
      for (const room of rooms) {
        if (!room.terminal) continue;
        const amount = room.terminal.store[resource] ?? 0;
        roomResources.push({ room, amount });
      }

      if (roomResources.length < 2) continue;

      // Find rooms with surplus and deficit
      const avgAmount = roomResources.reduce((sum, r) => sum + r.amount, 0) / roomResources.length;

      // Sort by amount
      roomResources.sort((a, b) => b.amount - a.amount);

      const richest = roomResources[0];
      const poorest = roomResources[roomResources.length - 1];

      // If difference is significant (more than 50% of average)
      const difference = richest.amount - poorest.amount;
      if (difference > avgAmount * 0.5 && richest.amount > 5000 && richest.room.terminal && poorest.room.terminal) {
        const transferAmount = Math.min(Math.floor(difference / 2), 10000);

        // Check if transfer is economical
        const energyCost = Game.market.calcTransactionCost(transferAmount, richest.room.name, poorest.room.name);

        // Only transfer if energy cost is reasonable (less than 10% of amount for energy, or <1000 for others)
        if (
          (resource === RESOURCE_ENERGY && energyCost < transferAmount * 0.1) ||
          (resource !== RESOURCE_ENERGY && energyCost < 1000)
        ) {
          const result = richest.room.terminal.send(resource, transferAmount, poorest.room.name);

          if (result === OK) {
            logger.info(
              `Balanced ${transferAmount} ${resource}: ${richest.room.name} -> ${poorest.room.name} (cost: ${energyCost} energy)`,
              { subsystem: "Market" }
            );
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

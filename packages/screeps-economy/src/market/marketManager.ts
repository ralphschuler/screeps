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
 * TODO(P2): TEST - Add unit tests for price calculation and trade decision logic
 * Verify trading decisions are made correctly based on price data
 */

import { getOwnedRooms as getCachedOwnedRooms } from "@ralphschuler/screeps-cache";
import { createDefaultMarketMemory, memoryManager } from "@ralphschuler/screeps-memory";
import type { EmpireMemory, PendingArbitrageTrade, PriceDataPoint, ResourceMarketData } from "@ralphschuler/screeps-memory";
import { logger } from "@ralphschuler/screeps-core";
import { LowFrequencyProcess, ProcessClass, ProcessPriority } from "@ralphschuler/screeps-kernel";
import { rankActiveSellOrders, rankEmergencyBuyOrders } from "./orderSelection";

function measureCpuDetail<T>(name: string, fn: () => T): T {
  const profiler = (globalThis as unknown as { cpuProfiler?: { measure?: <R>(label: string, work: () => R) => R } }).cpuProfiler;
  return profiler?.measure ? profiler.measure(name, fn) : fn();
}

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
  /** Minimum bucket for discretionary active trading scans/deals. Emergency safety logic still runs below this. */
  activeTradingMinBucket: number;
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
  /** Credit value assigned to one terminal energy for net trade calculations */
  energyCreditValue: number;
  /** Minimum terminal energy to keep after market deals */
  terminalEnergyReserve: number;
  /** Maximum amount for one active market sale */
  maxActiveSellAmount: number;
  /** Maximum amount for one active market buy */
  maxActiveBuyAmount: number;
  /** Maximum arbitrage trades to start per manager run */
  maxArbitrageTradesPerRun: number;
  /** Maximum resource amount per arbitrage trade */
  maxArbitrageAmount: number;
  /** Maximum credits to spend on one arbitrage buy leg */
  maxArbitrageCredits: number;
  /** Minimum net profit required for arbitrage */
  minArbitrageProfit: number;
  /** Minimum net margin required for arbitrage */
  minArbitrageMargin: number;
  /** Storage energy that enters overflow export mode for a room */
  energyOverflowStorageEnter: number;
  /** Storage energy that exits overflow export mode for a room */
  energyOverflowStorageExit: number;
  /** Minimum terminal energy sale amount for storage overflow handling */
  minOverflowEnergySellAmount: number;
}

const DEFAULT_CONFIG: MarketConfig = {
  updateInterval: 100,
  priceUpdateInterval: 500, // Update prices every 500 ticks
  minBucket: 2000,
  activeTradingMinBucket: 9800,
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
  maxTransportCostRatio: 0.3, // Max 30% of deal value for transport
  energyCreditValue: 0.001,
  terminalEnergyReserve: 10000,
  maxActiveSellAmount: 5000,
  maxActiveBuyAmount: 5000,
  maxArbitrageTradesPerRun: 1,
  maxArbitrageAmount: 1000,
  maxArbitrageCredits: 5000,
  minArbitrageProfit: 100,
  minArbitrageMargin: 0.05,
  energyOverflowStorageEnter: 800000,
  energyOverflowStorageExit: 500000,
  minOverflowEnergySellAmount: 1000
};

/**
 * Market Manager Class
 */
@ProcessClass()
export class MarketManager {
  private config: MarketConfig;
  private lastRun = 0;
  private cachedEmpireTick = -1;
  private cachedEmpire: EmpireMemory | null = null;
  private cachedTick = -1;
  private cachedMarketOrders = new Map<string, Order[]>();
  private cachedMarketOrderDealAmounts = new Map<string, number>();
  private cachedOwnedRooms: Room[] | null = null;
  private cachedOwnedTerminalRooms: Room[] | null = null;
  private cachedReadyOwnedTerminalRooms: Room[] | null = null;
  private cachedOwnedStorageTerminalRooms: Room[] | null = null;

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
    minBucket: 2000,
    cpuBudget: 0.02
  })
  public run(): void {
    this.lastRun = Game.time;
    this.cachedEmpireTick = -1;
    this.cachedEmpire = null;

    // Ensure market memory exists
    measureCpuDetail("market.ensureMemory", () => this.ensureMarketMemory());

    // Update price tracking
    if (Game.time % this.config.priceUpdateInterval === 0) {
      measureCpuDetail("market.updatePriceTracking", () => this.updatePriceTracking());
    }

    // Update order statistics
    measureCpuDetail("market.updateOrderStats", () => this.updateOrderStats());

    // Reconcile pending arbitrage trades
    measureCpuDetail("market.reconcilePendingArbitrage", () => this.reconcilePendingArbitrage());

    // Check for emergency resource needs
    measureCpuDetail("market.handleEmergencyBuying", () => this.handleEmergencyBuying());

    // Cancel old orders
    measureCpuDetail("market.cancelOldOrders", () => this.cancelOldOrders());

    // Extend/modify existing orders
    measureCpuDetail("market.manageExistingOrders", () => this.manageExistingOrders());

    if (!this.canRunActiveTrading()) {
      return;
    }

    // Update buy orders (with price-aware logic)
    measureCpuDetail("market.updateBuyOrders", () => this.updateBuyOrders());

    // Sell room-scoped storage energy overflow without waiting for high-price aggregate windows.
    measureCpuDetail("market.handleEnergyOverflowSales", () => this.handleEnergyOverflowSales());

    // Update sell orders (with price-aware logic)
    measureCpuDetail("market.updateSellOrders", () => this.updateSellOrders());

    // Execute deals and arbitrage
    measureCpuDetail("market.checkArbitrageOpportunities", () => this.checkArbitrageOpportunities());
    measureCpuDetail("market.executeDeal", () => this.executeDeal());

    // Balance resources across rooms
    if (Game.time % 200 === 0) {
      measureCpuDetail("market.balanceResourcesAcrossRooms", () => this.balanceResourcesAcrossRooms());
    }
  }

  private canRunActiveTrading(): boolean {
    return Game.cpu.bucket >= this.config.activeTradingMinBucket;
  }

  private getEmpireMemory(): EmpireMemory {
    if (this.cachedEmpireTick !== Game.time || !this.cachedEmpire) {
      this.cachedEmpire = memoryManager.getEmpire();
      this.cachedEmpireTick = Game.time;
    }
    return this.cachedEmpire;
  }

  private ensureTickCaches(): void {
    if (this.cachedTick === Game.time) return;

    this.cachedTick = Game.time;
    this.cachedMarketOrders.clear();
    this.cachedMarketOrderDealAmounts.clear();
    this.cachedOwnedRooms = null;
    this.cachedOwnedTerminalRooms = null;
    this.cachedReadyOwnedTerminalRooms = null;
    this.cachedOwnedStorageTerminalRooms = null;
  }

  private getMarketOrderCacheKey(filter: OrderFilter): string {
    return [
      filter.id ?? "",
      filter.created ?? "",
      filter.type ?? "",
      filter.resourceType ?? "",
      filter.roomName ?? "",
      filter.amount ?? "",
      filter.remainingAmount ?? "",
      filter.price ?? ""
    ].join("|");
  }

  private getMarketOrders(filter: OrderFilter): Order[] {
    this.ensureTickCaches();
    const key = this.getMarketOrderCacheKey(filter);
    let orders = this.cachedMarketOrders.get(key);

    if (!orders) {
      orders = Game.market.getAllOrders(filter);
      this.cachedMarketOrders.set(key, orders);
    }

    if (this.cachedMarketOrderDealAmounts.size === 0) return orders.slice();

    return orders.map(order => {
      const reservedAmount = this.cachedMarketOrderDealAmounts.get(order.id) ?? 0;
      if (reservedAmount <= 0) return order;

      return {
        ...order,
        amount: Math.max(0, order.amount - reservedAmount),
        remainingAmount: Math.max(0, order.remainingAmount - reservedAmount)
      };
    });
  }

  private recordMarketDeal(orderId: string, amount: number): void {
    if (amount <= 0) return;

    this.ensureTickCaches();
    this.cachedMarketOrderDealAmounts.set(orderId, (this.cachedMarketOrderDealAmounts.get(orderId) ?? 0) + amount);
  }

  private getOwnedRooms(): Room[] {
    this.ensureTickCaches();
    if (!this.cachedOwnedRooms) {
      this.cachedOwnedRooms = getCachedOwnedRooms();
    }
    return this.cachedOwnedRooms;
  }

  private getOwnedTerminalRooms(): Room[] {
    this.ensureTickCaches();
    if (!this.cachedOwnedTerminalRooms) {
      this.cachedOwnedTerminalRooms = this.getOwnedRooms().filter(room => room.terminal);
    }
    return this.cachedOwnedTerminalRooms;
  }

  private getReadyOwnedTerminalRooms(): Room[] {
    this.ensureTickCaches();
    if (!this.cachedReadyOwnedTerminalRooms) {
      this.cachedReadyOwnedTerminalRooms = this.getOwnedTerminalRooms().filter(room => room.terminal?.cooldown === 0);
    }
    return this.cachedReadyOwnedTerminalRooms;
  }

  private getOwnedStorageTerminalRooms(): Room[] {
    this.ensureTickCaches();
    if (!this.cachedOwnedStorageTerminalRooms) {
      this.cachedOwnedStorageTerminalRooms = this.getOwnedTerminalRooms().filter(room => room.storage);
    }
    return this.cachedOwnedStorageTerminalRooms;
  }

  /**
   * Ensure market memory exists and is initialized
   */
  private ensureMarketMemory(): void {
    const empire = this.getEmpireMemory();
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
    const empire = this.getEmpireMemory();
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
    const empire = this.getEmpireMemory();
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
    const empire = this.getEmpireMemory();
    return empire.market?.resources[resource] ;
  }

  private getOwnedResourceTotals(): Record<string, number> {
    const totals: Record<string, number> = {};

    for (const room of this.getOwnedRooms()) {
      for (const store of [room.storage?.store, room.terminal?.store]) {
        if (!store) continue;

        for (const resource of Object.keys(store) as ResourceConstant[]) {
          if (typeof (store as unknown as Record<string, unknown>)[resource] !== "number") continue;

          const amount = store.getUsedCapacity(resource);
          if (amount > 0) {
            totals[resource] = (totals[resource] ?? 0) + amount;
          }
        }
      }
    }

    return totals;
  }

  private trackCreatedOrder(type: "buy" | "sell", resource: ResourceConstant, roomName: string): void {
    const empire = this.getEmpireMemory();
    if (!empire.market?.orders) return;

    const orderType = type === "buy" ? ORDER_BUY : ORDER_SELL;
    const order = Object.values(Game.market.orders)
      .filter(o => o.type === orderType && o.resourceType === resource && o.roomName === roomName)
      .sort((a, b) => b.created - a.created)[0];

    if (!order) return;

    empire.market.orders[order.id] = {
      orderId: order.id,
      resource,
      type,
      created: order.created,
      totalTraded: 0,
      totalValue: 0
    };
  }

  private getRoomMarketMemory(roomName: string): RoomMemory & { energyExportActive?: boolean } {
    if (!Memory.rooms) {
      Memory.rooms = {};
    }
    if (!Memory.rooms[roomName]) {
      Memory.rooms[roomName] = {};
    }
    return Memory.rooms[roomName] as RoomMemory & { energyExportActive?: boolean };
  }

  private updateRoomEnergyOverflowActive(room: Room): boolean {
    const storageEnergy = room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0;
    const roomMemory = this.getRoomMarketMemory(room.name);
    const wasActive = roomMemory.energyExportActive === true;
    const active =
      storageEnergy >= this.config.energyOverflowStorageEnter ||
      (wasActive && storageEnergy > this.config.energyOverflowStorageExit);

    roomMemory.energyExportActive = active;
    return active;
  }

  private getOverflowEnergySaleAmount(room: Room): number {
    if (!room.controller?.my || !room.storage || !room.terminal) return 0;
    if (!this.updateRoomEnergyOverflowActive(room)) return 0;

    const terminalEnergy = room.terminal.store.getUsedCapacity(RESOURCE_ENERGY);
    const saleableEnergy = terminalEnergy - this.config.terminalEnergyReserve;
    if (saleableEnergy < this.config.minOverflowEnergySellAmount) return 0;

    return Math.min(saleableEnergy, this.config.maxActiveSellAmount);
  }

  private hasActiveSellOrder(roomName: string, resource: ResourceConstant): boolean {
    return Object.values(Game.market.orders).some(
      order =>
        order.type === ORDER_SELL &&
        order.resourceType === resource &&
        order.roomName === roomName &&
        order.remainingAmount > 0
    );
  }

  private handleEnergyOverflowSales(): void {
    const rooms = this.getOwnedStorageTerminalRooms()
      .slice()
      .sort(
        (a, b) =>
          (b.storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0) -
          (a.storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0)
      );

    for (const room of rooms) {
      const amount = this.getOverflowEnergySaleAmount(room);
      if (amount <= 0) continue;

      this.sellSurplusFromTerminal(room.name, RESOURCE_ENERGY, amount);
    }
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
    const empire = this.getEmpireMemory();
    const isWarMode = empire.objectives.warMode;
    const totalResources = this.getOwnedResourceTotals();

    // Check if we need to buy resources
    for (const resource in this.config.buyThresholds) {
      const threshold = this.config.buyThresholds[resource];
      const current = totalResources[resource] ?? 0;

      if (current < threshold) {
        // In war mode OR when it's a buy opportunity, create buy order
        const isBuyOpp = this.isBuyOpportunity(resource as ResourceConstant);

        if (isWarMode || isBuyOpp) {
          const bought = this.buyMissingResource(resource as ResourceConstant, threshold - current, isWarMode);
          if (!bought) {
            this.createBuyOrder(resource as ResourceConstant, threshold - current, isWarMode, isBuyOpp);
          }
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

    const existingSellOrders = Object.values(Game.market.orders).filter(
      o => o.type === ORDER_SELL && o.resourceType === resource
    );
    if (existingSellOrders.length > 0) return;

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
    const roomWithTerminal = this.getOwnedTerminalRooms()[0];
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
      this.trackCreatedOrder("buy", resource, roomWithTerminal.name);

      const priceContext = isBuyOpportunity ? " (LOW PRICE!)" : isWarMode ? " (WAR MODE)" : "";
      logger.info(`Created buy order: ${amount} ${resource} at ${maxPrice.toFixed(3)} credits${priceContext}`, {
        subsystem: "Market"
      });
    }
  }

  private buyMissingResource(resource: ResourceConstant, amount: number, isWarMode: boolean): boolean {
    if (Game.market.credits < this.config.minCredits) return false;

    const sellOrders = this.getMarketOrders({ type: ORDER_SELL, resourceType: resource }).filter(
      o => o.remainingAmount > 0 && o.roomName
    );
    if (sellOrders.length === 0) return false;

    const marketData = this.getMarketData(resource);
    const maxUnitPrice = isWarMode
      ? (marketData?.avgPrice ?? sellOrders[0]?.price ?? 0) * this.config.warPriceMultiplier
      : (marketData?.avgPrice ?? sellOrders[0]?.price ?? 0) * this.config.buyOpportunityAdjustment;

    const terminalRooms = this.getReadyOwnedTerminalRooms();
    if (terminalRooms.length === 0) return false;

    sellOrders.sort((a, b) => a.price - b.price);

    for (const order of sellOrders) {
      if (!order.roomName || order.price > maxUnitPrice) continue;

      for (const room of terminalRooms) {
        const terminal = room.terminal!;
        const freeCapacity = terminal.store.getFreeCapacity(resource);
        if (freeCapacity <= 0) continue;

        const dealAmount = Math.min(amount, order.remainingAmount, this.config.maxActiveBuyAmount, freeCapacity);
        if (dealAmount <= 0) continue;

        const energyCost = Game.market.calcTransactionCost(dealAmount, room.name, order.roomName);
        if (terminal.store.getUsedCapacity(RESOURCE_ENERGY) - energyCost < this.config.terminalEnergyReserve) continue;

        const creditsNeeded = order.price * dealAmount;
        if (Game.market.credits - creditsNeeded < this.config.minCredits) continue;

        const result = Game.market.deal(order.id, dealAmount, room.name);
        if (result === OK) {
          this.recordMarketDeal(order.id, dealAmount);
          logger.info(`Bought ${dealAmount} ${resource} at ${order.price.toFixed(3)} credits/unit`, {
            subsystem: "Market"
          });
          return true;
        }
      }
    }

    return false;
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

    this.ensureMarketMemory();

    // Check if we have enough resources
    const available = room.terminal.store.getUsedCapacity(resource);
    if (available < amount) {
      logger.debug(
        `Cannot sell ${amount} ${resource} from ${roomName}: only ${available} available`,
        { subsystem: "Market" }
      );
      return false;
    }

    if (this.executeActiveSell(room, resource, amount)) {
      return true;
    }

    if (this.hasActiveSellOrder(roomName, resource)) {
      return true;
    }

    // Get current market data for pricing
    const empire = this.getEmpireMemory();
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
    let price = resource === RESOURCE_ENERGY ? 0.03 : 0.5; // Default fallback

    if (marketData?.avgPrice) {
      // Sell at 5% below average for quick sale
      price = marketData.avgPrice * 0.95;
    } else {
      const history = Game.market.getHistory(resource);
      if (history.length > 0) {
        price = history[history.length - 1].avgPrice * 0.95;
      } else {
        // No price data, check current market orders
        const buyOrders = this.getMarketOrders({
          type: ORDER_BUY,
          resourceType: resource
        });

        if (buyOrders.length > 0) {
          // Sell at best buy order price (instant sale)
          buyOrders.sort((a, b) => b.price - a.price);
          price = buyOrders[0]!.price;
        }
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
      this.trackCreatedOrder("sell", resource, roomName);

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

  private executeActiveSell(room: Room, resource: ResourceConstant, amount: number): boolean {
    const terminal = room.terminal;
    if (!terminal || terminal.cooldown > 0) return false;

    const buyOrders = this.getMarketOrders({ type: ORDER_BUY, resourceType: resource }).filter(
      o => o.remainingAmount > 0 && o.roomName
    );
    if (buyOrders.length === 0) return false;

    const candidates = rankActiveSellOrders({
      orders: buyOrders,
      requestedAmount: amount,
      sourceRoomName: room.name,
      maxDealAmount: this.config.maxActiveSellAmount,
      energyCreditValue: this.config.energyCreditValue,
      calcTransactionCost: (dealAmount, fromRoomName, toRoomName) =>
        Game.market.calcTransactionCost(dealAmount, fromRoomName, toRoomName)
    });

    for (const candidate of candidates) {
      const { order, dealAmount, energyCost } = candidate;
      const resourceAvailable = terminal.store.getUsedCapacity(resource);
      const energyAvailable = terminal.store.getUsedCapacity(RESOURCE_ENERGY);
      const requiredResource = resource === RESOURCE_ENERGY ? dealAmount + energyCost : dealAmount;
      const energyAfterDeal = resource === RESOURCE_ENERGY
        ? energyAvailable - dealAmount - energyCost
        : energyAvailable - energyCost;

      if (resourceAvailable < requiredResource) continue;
      if (energyAfterDeal < this.config.terminalEnergyReserve) continue;

      const result = Game.market.deal(order.id, dealAmount, room.name);
      if (result === OK) {
        this.recordMarketDeal(order.id, dealAmount);
        const empire = this.getEmpireMemory();
        const value = order.price * dealAmount;
        if (empire.market) {
          empire.market.totalProfit = (empire.market.totalProfit ?? 0) + value;
        }

        logger.info(`Sold ${dealAmount} ${resource} at ${order.price.toFixed(3)} credits/unit`, {
          subsystem: "Market"
        });
        return true;
      }
    }

    return false;
  }

  /**
   * Update sell orders based on resource surplus and price signals
   */
  private updateSellOrders(): void {
    const totalResources = this.getOwnedResourceTotals();

    // Check if we have surplus to sell
    for (const resource in this.config.sellThresholds) {
      if (resource === RESOURCE_ENERGY) {
        // Energy sales are room-scoped and reserve-safe via handleEnergyOverflowSales().
        continue;
      }

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

    const existingBuyOrders = Object.values(Game.market.orders).filter(
      o => o.type === ORDER_BUY && o.resourceType === resource
    );
    if (existingBuyOrders.length > 0) return;

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
    const roomWithResource = this.getOwnedTerminalRooms().find(room => room.terminal!.store[resource] > 1000);

    if (!roomWithResource?.terminal) return;

    if (this.executeActiveSell(roomWithResource, resource, amount)) return;

    // Create order
    const result = Game.market.createOrder({
      type: ORDER_SELL,
      resourceType: resource,
      price: sellPrice,
      totalAmount: Math.min(amount, 10000),
      roomName: roomWithResource.name
    });

    if (result === OK) {
      this.trackCreatedOrder("sell", resource, roomWithResource.name);

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
    const empire = this.getEmpireMemory();
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

    const empire = this.getEmpireMemory();
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
        const orders = this.getMarketOrders({ type: ORDER_SELL, resourceType: resource });

        if (orders.length > 0) {
          // Sort by price
          orders.sort((a, b) => a.price - b.price);

          const bestOrder = orders[0];
          const roomWithTerminal = this.getOwnedTerminalRooms()[0];

          if (roomWithTerminal && bestOrder.price < 10) {
            // Buy if price is reasonable
            const amount = Math.min(bestOrder.amount, 1000);
            const result = Game.market.deal(bestOrder.id, amount, roomWithTerminal.name);

            if (result === OK) {
              this.recordMarketDeal(bestOrder.id, amount);
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
   * Buys critical resources only for owned rooms with terminal deficits.
   */
  private handleEmergencyBuying(): void {
    // Skip if not enough emergency credits
    if (Game.market.credits < this.config.emergencyCredits) return;

    for (const resource of this.config.criticalResources) {
      const deficits = this.getCriticalResourceDeficits(resource);

      if (deficits.length === 0) {
        continue;
      }

      // Fill highest deficit room first to contain risk while preserving reserves.
      const target = deficits[0];
      if (target) {
        this.executeEmergencyBuy(resource, target.deficit, target.roomName);
      }
    }
  }

  /**
   * Identify owned rooms with terminal below critical threshold for an emergency resource.
   */
  private getCriticalResourceDeficits(resource: ResourceConstant): Array<{ roomName: string; deficit: number }> {
    const deficits: Array<{ roomName: string; deficit: number }> = [];
    const threshold = this.config.emergencyBuyThreshold;

    for (const room of this.getOwnedTerminalRooms()) {
      const terminal = room.terminal;
      if (!terminal) continue;

      const terminalAmount = terminal.store.getUsedCapacity(resource);
      const storageAmount = room.storage?.store.getUsedCapacity(resource) ?? 0;
      const current = terminalAmount + storageAmount;
      const deficit = threshold - current;

      if (deficit > 0) {
        deficits.push({ roomName: room.name, deficit });
      }
    }

    deficits.sort((a, b) => b.deficit - a.deficit);
    return deficits;
  }

  private getTerminalEnergyBudget(terminal: StructureTerminal): number {
    return Math.max(0, terminal.store.getUsedCapacity(RESOURCE_ENERGY) - this.config.terminalEnergyReserve);
  }

  private canAffordEmergencyBuyEnergy(
    resource: ResourceConstant,
    amount: number,
    transportCost: number,
    terminalEnergyBudget: number
  ): boolean {
    return resource === RESOURCE_ENERGY
      ? amount + transportCost <= terminalEnergyBudget
      : transportCost <= terminalEnergyBudget;
  }

  private findAffordableEmergencyBuyAmount(
    resource: ResourceConstant,
    candidate: { order: Order & { roomName: string }; cappedOrderAmount: number; transportCost: number },
    destinationTerminal: StructureTerminal
  ): number {
    const terminalEnergyBudget = this.getTerminalEnergyBudget(destinationTerminal);
    let high = Math.floor(candidate.cappedOrderAmount);

    if (high <= 0) return 0;
    if (this.canAffordEmergencyBuyEnergy(resource, high, candidate.transportCost, terminalEnergyBudget)) {
      return high;
    }
    if (terminalEnergyBudget <= 0) return 0;

    let low = 0;
    while (low < high) {
      const amount = Math.ceil((low + high) / 2);
      const transportCost = Game.market.calcTransactionCost(
        amount,
        candidate.order.roomName,
        destinationTerminal.room.name
      );

      if (this.canAffordEmergencyBuyEnergy(resource, amount, transportCost, terminalEnergyBudget)) {
        low = amount;
      } else {
        high = amount - 1;
      }
    }

    return low;
  }

  /**
   * Execute emergency buy at best available price for a specific room.
   */
  private executeEmergencyBuy(resource: ResourceConstant, amount: number, destinationRoomName: string): boolean {
    const destinationRoom = Game.rooms[destinationRoomName];
    const destinationTerminal = destinationRoom?.terminal;

    if (!destinationRoom?.controller?.my || !destinationTerminal) return false;
    if (destinationTerminal.cooldown > 0) return false;

    const requestedAmount = Math.max(1, Math.floor(amount));
    if (resource === RESOURCE_ENERGY && this.getTerminalEnergyBudget(destinationTerminal) <= 0) return false;

    const orders = this.getMarketOrders({ type: ORDER_SELL, resourceType: resource });
    if (orders.length === 0) return false;

    const candidateOrders = rankEmergencyBuyOrders({
      orders,
      requestedAmount,
      destinationRoomName: destinationRoom.name,
      maxDealAmount: this.config.maxActiveBuyAmount,
      calcTransactionCost: (dealAmount, fromRoomName, toRoomName) =>
        Game.market.calcTransactionCost(dealAmount, fromRoomName, toRoomName)
    });

    if (candidateOrders.length === 0) return false;

    for (const candidate of candidateOrders) {
      const order = candidate.order;
      let purchaseAmount = this.findAffordableEmergencyBuyAmount(resource, candidate, destinationTerminal);
      if (purchaseAmount <= 0) continue;

      // Credits required should stay above emergency reserve.
      const maxByCredits = Math.max(0, Math.floor((Game.market.credits - this.config.emergencyCredits) / order.price));
      purchaseAmount = Math.min(purchaseAmount, maxByCredits);
      if (purchaseAmount <= 0) continue;

      const result = Game.market.deal(order.id, purchaseAmount, destinationRoom.name);

      if (result === OK) {
        this.recordMarketDeal(order.id, purchaseAmount);
        logger.warn(
          `EMERGENCY BUY: ${purchaseAmount} ${resource} for ${destinationRoom.name} at ${order.price.toFixed(3)} credits/unit`,
          { subsystem: "Market" }
        );
        return true;
      }
    }

    return false;
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

        // If our price is too low (more than 10% below target), reprice it.
        if (order.price < targetPrice * 0.9 && order.remainingAmount > 1000) {
          const result = Game.market.changeOrderPrice(orderId, targetPrice);
          if (result === OK) {
            logger.debug(`Repriced buy order for ${order.resourceType}: ${order.price.toFixed(3)} -> ${targetPrice.toFixed(3)}`, {
              subsystem: "Market"
            });
          }
        }
      }

      // Adjust sell orders
      if (order.type === ORDER_SELL) {
        const targetPrice = currentPrice * this.config.sellOpportunityAdjustment;

        // If our price is too high (more than 10% above target), reprice it.
        if (order.price > targetPrice * 1.1 && order.remainingAmount > 1000) {
          const result = Game.market.changeOrderPrice(orderId, targetPrice);
          if (result === OK) {
            logger.debug(`Repriced sell order for ${order.resourceType}: ${order.price.toFixed(3)} -> ${targetPrice.toFixed(3)}`, {
              subsystem: "Market"
            });
          }
        }
      }
    }
  }

  /**
   * Reconcile pending arbitrage trades and execute outbound sales
   */
  private reconcilePendingArbitrage(): void {
    const empire = this.getEmpireMemory();
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

      const available = terminal.store.getUsedCapacity(trade.resource);
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

          if (terminal.store.getUsedCapacity(RESOURCE_ENERGY) - energyCost >= this.config.terminalEnergyReserve) {
            const result = Game.market.deal(order.id, dealAmount, terminal.room.name);

            if (result === OK) {
              this.recordMarketDeal(order.id, dealAmount);
              const proportionalTransportCost = trade.transportCost * (dealAmount / trade.amount);
              const profit = (order.price - trade.buyPrice) * dealAmount - proportionalTransportCost * this.config.energyCreditValue;
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
          this.trackCreatedOrder("sell", trade.resource, terminal.room.name);

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

    const empire = this.getEmpireMemory();
    const market = empire.market;
    const terminals = this.getOwnedTerminalRooms();

    if (!market || terminals.length === 0) return;

    const getRemainingAmount = (order: Order) => order.remainingAmount ?? order.amount ?? 0;
    let tradesStarted = 0;

    for (const resource of this.config.trackedResources) {
      if (tradesStarted >= this.config.maxArbitrageTradesPerRun) return;

      const buyOrders = this.getMarketOrders({ type: ORDER_BUY, resourceType: resource }).filter(
        o => o.remainingAmount > 0 && o.roomName
      );
      const sellOrders = this.getMarketOrders({ type: ORDER_SELL, resourceType: resource }).filter(
        o => o.remainingAmount > 0 && o.roomName
      );

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

      const creditCappedAmount = Math.floor(this.config.maxArbitrageCredits / lowestSell.price);
      const tradeAmount = Math.min(
        getRemainingAmount(highestBuy),
        getRemainingAmount(lowestSell),
        this.config.maxArbitrageAmount,
        creditCappedAmount
      );
      if (tradeAmount <= 0) continue;

      for (const room of terminals) {
        const terminal = room.terminal!;
        const freeCapacity = terminal.store.getFreeCapacity(resource) ?? 0;
        if (freeCapacity < tradeAmount) continue;

        const buyEnergyCost = Game.market.calcTransactionCost(tradeAmount, room.name, lowestSell.roomName);
        const sellEnergyCost = Game.market.calcTransactionCost(tradeAmount, room.name, highestBuy.roomName);
        const totalEnergyCost = buyEnergyCost + sellEnergyCost;
        const transportCreditCost = totalEnergyCost * this.config.energyCreditValue;
        const grossProfit = (highestBuy.price - lowestSell.price) * tradeAmount;
        const netProfit = grossProfit - transportCreditCost;
        const grossCost = lowestSell.price * tradeAmount;
        const netMargin = grossCost > 0 ? netProfit / grossCost : 0;
        const transportRatio = grossCost > 0 ? transportCreditCost / grossCost : Infinity;

        if (netProfit < this.config.minArbitrageProfit) continue;
        if (netMargin < this.config.minArbitrageMargin) continue;
        if (transportRatio > this.config.maxTransportCostRatio) continue;
        if (terminal.store.getUsedCapacity(RESOURCE_ENERGY) - totalEnergyCost < this.config.terminalEnergyReserve) continue;

        const creditsNeeded = lowestSell.price * tradeAmount;
        if (Game.market.credits - creditsNeeded < this.config.minCredits) continue;

        const result = Game.market.deal(lowestSell.id, tradeAmount, room.name);

        if (result !== OK) continue;
        this.recordMarketDeal(lowestSell.id, tradeAmount);

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
          transportCost: totalEnergyCost
        };

        market.pendingArbitrage?.push(pendingTrade);
        tradesStarted++;

        logger.info(
          `Arbitrage started: bought ${tradeAmount} ${resource} at ${lowestSell.price.toFixed(3)} to sell @ ${highestBuy.price.toFixed(
            3
          )} (net profit ~${netProfit.toFixed(2)})`,
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
    const rooms = this.getOwnedTerminalRooms();

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

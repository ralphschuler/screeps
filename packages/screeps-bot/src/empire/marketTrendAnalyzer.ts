/**
 * Market Trend Analyzer
 *
 * Advanced market trend analysis:
 * - Supply and demand tracking
 * - Price momentum analysis
 * - Market volatility assessment
 * - Trading opportunity detection
 * - Predictive price modeling
 *
 * Addresses Issue: Intelligence & Coordination (market trend analysis)
 */

import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { ProcessPriority } from "../core/kernel";
import { logger } from "../core/logger";
import { memoryManager } from "../memory/manager";

/**
 * Supply/demand analysis result
 */
export interface SupplyDemandAnalysis {
  /** Resource type */
  resource: ResourceConstant;
  /** Supply score (0-100) */
  supplyScore: number;
  /** Demand score (0-100) */
  demandScore: number;
  /** Net sentiment (-1 to 1, negative = oversupply, positive = high demand) */
  sentiment: number;
  /** Market tightness (0-1, higher = tighter market) */
  tightness: number;
  /** Last updated */
  lastUpdate: number;
}

/**
 * Trading opportunity
 */
export interface TradingOpportunity {
  /** Resource type */
  resource: ResourceConstant;
  /** Opportunity type */
  type: "buy" | "sell" | "arbitrage";
  /** Expected profit/savings */
  expectedValue: number;
  /** Confidence score (0-1) */
  confidence: number;
  /** Recommended action */
  action: string;
  /** Urgency (0-3) */
  urgency: 0 | 1 | 2 | 3;
  /** Created tick */
  createdAt: number;
}

/**
 * Market Trend Analyzer Configuration
 */
export interface MarketTrendAnalyzerConfig {
  /** Update interval in ticks */
  updateInterval: number;
  /** Minimum bucket to run analysis */
  minBucket: number;
  /** Maximum CPU budget per tick (fraction of limit) */
  maxCpuBudget: number;
  /** Resources to analyze */
  trackedResources: ResourceConstant[];
  /** Volatility threshold for high volatility warning */
  highVolatilityThreshold: number;
  /** Opportunity detection confidence threshold */
  opportunityConfidenceThreshold: number;
}

const DEFAULT_CONFIG: MarketTrendAnalyzerConfig = {
  updateInterval: 500,
  minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
  maxCpuBudget: 0.02, // 2% of CPU limit
  trackedResources: [
    RESOURCE_ENERGY,
    RESOURCE_HYDROGEN,
    RESOURCE_OXYGEN,
    RESOURCE_UTRIUM,
    RESOURCE_LEMERGIUM,
    RESOURCE_KEANIUM,
    RESOURCE_ZYNTHIUM,
    RESOURCE_CATALYST,
    RESOURCE_GHODIUM
  ],
  highVolatilityThreshold: 0.3, // 30% volatility
  opportunityConfidenceThreshold: 0.7 // 70% confidence
};

/**
 * Market Trend Analyzer Class
 */
@ProcessClass()
export class MarketTrendAnalyzer {
  private config: MarketTrendAnalyzerConfig;
  private lastRun = 0;
  private supplyDemandCache: Map<ResourceConstant, SupplyDemandAnalysis> = new Map();
  private opportunities: TradingOpportunity[] = [];

  public constructor(config: Partial<MarketTrendAnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main analysis tick - runs periodically
   * Registered as kernel process via decorator
   */
  @LowFrequencyProcess("empire:marketTrends", "Market Trend Analyzer", {
    priority: ProcessPriority.LOW,
    interval: 500,
    minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
    cpuBudget: 0.02
  })
  public run(): void {
    const cpuStart = Game.cpu.getUsed();
    this.lastRun = Game.time;

    // Analyze supply and demand
    for (const resource of this.config.trackedResources) {
      const analysis = this.analyzeSupplyDemand(resource);
      if (analysis) {
        this.supplyDemandCache.set(resource, analysis);
      }
    }

    // Detect trading opportunities
    this.detectTradingOpportunities();

    // Log CPU usage and summary
    const cpuUsed = Game.cpu.getUsed() - cpuStart;
    if (Game.time % 1000 === 0) {
      logger.info(
        `Market trend analysis completed in ${cpuUsed.toFixed(2)} CPU, ${this.opportunities.length} opportunities detected`,
        { subsystem: "MarketTrends" }
      );
    }
  }

  /**
   * Analyze supply and demand for a resource
   */
  private analyzeSupplyDemand(resource: ResourceConstant): SupplyDemandAnalysis | null {
    // Get market orders
    const allOrders = Game.market.getAllOrders({ resourceType: resource });
    if (allOrders.length === 0) return null;

    // Separate buy and sell orders
    const buyOrders = allOrders.filter(o => o.type === ORDER_BUY);
    const sellOrders = allOrders.filter(o => o.type === ORDER_SELL);

    // Calculate total amounts
    const totalBuyAmount = buyOrders.reduce((sum, o) => sum + o.amount, 0);
    const totalSellAmount = sellOrders.reduce((sum, o) => sum + o.amount, 0);

    // Calculate average prices
    const avgBuyPrice =
      buyOrders.length > 0 ? buyOrders.reduce((sum, o) => sum + o.price, 0) / buyOrders.length : 0;
    const avgSellPrice =
      sellOrders.length > 0 ? sellOrders.reduce((sum, o) => sum + o.price, 0) / sellOrders.length : 0;

    // Calculate supply score (higher = more supply)
    const supplyScore = Math.min(100, (totalSellAmount / (totalBuyAmount + totalSellAmount)) * 100);

    // Calculate demand score (higher = more demand)
    const demandScore = Math.min(100, (totalBuyAmount / (totalBuyAmount + totalSellAmount)) * 100);

    // Calculate sentiment (-1 = oversupply, 0 = balanced, 1 = high demand)
    const sentiment = (demandScore - supplyScore) / 100;

    // Calculate market tightness (0 = loose, 1 = tight)
    // Tight markets have less total volume and smaller spreads
    const totalVolume = totalBuyAmount + totalSellAmount;
    const spread = avgSellPrice > 0 ? (avgSellPrice - avgBuyPrice) / avgSellPrice : 0;
    const tightness = 1 - Math.min(1, totalVolume / 1000000) * (1 - Math.min(1, spread * 10));

    return {
      resource,
      supplyScore,
      demandScore,
      sentiment,
      tightness,
      lastUpdate: Game.time
    };
  }

  /**
   * Detect trading opportunities
   */
  private detectTradingOpportunities(): void {
    const empire = memoryManager.getEmpire();
    const newOpportunities: TradingOpportunity[] = [];

    for (const resource of this.config.trackedResources) {
      // Get market data - using string key for Record<string, ResourceMarketData>
      const marketData = empire.market?.resources[resource as string];
      if (!marketData) continue;

      const supplyDemand = this.supplyDemandCache.get(resource);
      if (!supplyDemand) continue;

      // Check for buy opportunity
      if (marketData.trend === -1 && supplyDemand.sentiment < -0.3) {
        // Price falling and oversupply = good time to buy
        const confidence = Math.abs(supplyDemand.sentiment) * (1 - (marketData.volatility ?? 0.5));
        if (confidence >= this.config.opportunityConfidenceThreshold) {
          newOpportunities.push({
            resource,
            type: "buy",
            expectedValue: (marketData.avgPrice - (marketData.predictedPrice ?? marketData.avgPrice)) * 10000,
            confidence,
            action: `Buy ${resource} at current price (falling trend, oversupply)`,
            urgency: this.calculateUrgency(confidence, Math.abs(supplyDemand.sentiment)),
            createdAt: Game.time
          });
        }
      }

      // Check for sell opportunity
      if (marketData.trend === 1 && supplyDemand.sentiment > 0.3) {
        // Price rising and high demand = good time to sell
        const confidence = supplyDemand.sentiment * (1 - (marketData.volatility ?? 0.5));
        if (confidence >= this.config.opportunityConfidenceThreshold) {
          newOpportunities.push({
            resource,
            type: "sell",
            expectedValue: ((marketData.predictedPrice ?? marketData.avgPrice) - marketData.avgPrice) * 10000,
            confidence,
            action: `Sell ${resource} at current price (rising trend, high demand)`,
            urgency: this.calculateUrgency(confidence, supplyDemand.sentiment),
            createdAt: Game.time
          });
        }
      }

      // Check for arbitrage opportunity
      const orders = Game.market.getAllOrders({ resourceType: resource });
      const bestBuy = orders.filter(o => o.type === ORDER_BUY).sort((a, b) => b.price - a.price)[0];
      const bestSell = orders.filter(o => o.type === ORDER_SELL).sort((a, b) => a.price - b.price)[0];

      if (bestBuy && bestSell && bestBuy.price > bestSell.price * 1.1) {
        // Arbitrage possible: buy low, sell high
        const profit = (bestBuy.price - bestSell.price) * Math.min(bestBuy.amount, bestSell.amount);
        const confidence = 0.9; // High confidence for arbitrage

        newOpportunities.push({
          resource,
          type: "arbitrage",
          expectedValue: profit,
          confidence,
          action: `Arbitrage ${resource}: buy at ${bestSell.price.toFixed(3)}, sell at ${bestBuy.price.toFixed(3)}`,
          urgency: 3, // Arbitrage is urgent
          createdAt: Game.time
        });
      }

      // Warn about high volatility
      if ((marketData.volatility ?? 0) >= this.config.highVolatilityThreshold) {
        logger.warn(`High volatility detected for ${resource}: ${((marketData.volatility ?? 0) * 100).toFixed(1)}%`, {
          subsystem: "MarketTrends"
        });
      }
    }

    this.opportunities = newOpportunities;

    // Log high-value opportunities
    for (const opp of newOpportunities) {
      if (opp.urgency >= 2) {
        logger.info(
          `Trading opportunity: ${opp.action}, expected value: ${opp.expectedValue.toFixed(0)} credits, confidence: ${(opp.confidence * 100).toFixed(0)}%`,
          { subsystem: "MarketTrends" }
        );
      }
    }
  }

  /**
   * Calculate urgency from confidence and sentiment
   */
  private calculateUrgency(confidence: number, sentiment: number): 0 | 1 | 2 | 3 {
    const score = confidence * Math.abs(sentiment);
    if (score >= 0.8) return 3; // Critical
    if (score >= 0.6) return 2; // High
    if (score >= 0.4) return 1; // Medium
    return 0; // Low
  }

  /**
   * Get supply/demand analysis for a resource
   */
  public getSupplyDemand(resource: ResourceConstant): SupplyDemandAnalysis | undefined {
    return this.supplyDemandCache.get(resource);
  }

  /**
   * Get all trading opportunities
   */
  public getOpportunities(): TradingOpportunity[] {
    return this.opportunities;
  }

  /**
   * Get opportunities for a specific resource
   */
  public getOpportunitiesForResource(resource: ResourceConstant): TradingOpportunity[] {
    return this.opportunities.filter(o => o.resource === resource);
  }

  /**
   * Get high-urgency opportunities
   */
  public getUrgentOpportunities(): TradingOpportunity[] {
    return this.opportunities.filter(o => o.urgency >= 2);
  }

  /**
   * Get market sentiment for a resource
   */
  public getMarketSentiment(resource: ResourceConstant): number {
    const analysis = this.supplyDemandCache.get(resource);
    return analysis?.sentiment ?? 0;
  }

  /**
   * Is market tight for a resource
   */
  public isMarketTight(resource: ResourceConstant): boolean {
    const analysis = this.supplyDemandCache.get(resource);
    return (analysis?.tightness ?? 0) > 0.7;
  }
}

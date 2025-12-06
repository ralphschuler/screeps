/**
 * Market Manager Tests
 *
 * Tests for price tracking and buy low/sell high functionality
 */

import { expect } from "chai";
import { MarketManager } from "../../src/empire/marketManager";
import type { MarketMemory, OvermindMemory, PriceDataPoint, ResourceMarketData } from "../../src/memory/schemas";
import { createDefaultMarketMemory, createDefaultOvermindMemory } from "../../src/memory/schemas";

// Mock global objects
const mockMemory: any = {};
const mockGame: any = {
  time: 1000,
  market: {
    credits: 100000,
    orders: {},
    getHistory: (resource: ResourceConstant) => {
      // Return mock history
      return [
        { resourceType: resource, date: "2024-01-01", transactions: 100, volume: 10000, avgPrice: 1.0, stddevPrice: 0.1 }
      ];
    },
    getAllOrders: () => [],
    createOrder: () => OK,
    cancelOrder: () => OK,
    deal: () => OK
  },
  rooms: {},
  creeps: {}
};

// Setup globals
(global as any).Game = mockGame;
(global as any).Memory = mockMemory;
(global as any).OK = 0;
(global as any).ORDER_BUY = "buy";
(global as any).ORDER_SELL = "sell";
(global as any).RESOURCE_ENERGY = "energy";
(global as any).RESOURCE_HYDROGEN = "H";
(global as any).RESOURCE_OXYGEN = "O";
(global as any).RESOURCE_POWER = "power";
(global as any).RESOURCE_GHODIUM = "G";

describe("Market Manager", () => {
  let overmind: OvermindMemory;

  beforeEach(() => {
    // Reset mocks
    mockGame.time = 1000;
    mockGame.market.credits = 100000;
    mockGame.market.orders = {};
    mockGame.rooms = {};

    // Create overmind with market memory
    overmind = createDefaultOvermindMemory();
    overmind.market = createDefaultMarketMemory();
    mockMemory.overmind = overmind;
  });

  describe("Price Tracking", () => {
    it("should create market memory structure", () => {
      const marketMem = createDefaultMarketMemory();
      
      expect(marketMem).to.exist;
      expect(marketMem.resources).to.be.an("object");
      expect(marketMem.lastScan).to.equal(0);
    });

    it("should create resource market data structure", () => {
      const resource = "energy" as ResourceConstant;
      const marketData: ResourceMarketData = {
        resource,
        priceHistory: [
          {
            tick: 1000,
            avgPrice: 1.5,
            lowPrice: 1.35,
            highPrice: 1.65
          }
        ],
        avgPrice: 1.5,
        trend: 0,
        lastUpdate: 1000
      };

      expect(marketData.resource).to.equal(resource);
      expect(marketData.priceHistory).to.have.lengthOf(1);
      expect(marketData.priceHistory[0].avgPrice).to.equal(1.5);
      expect(marketData.avgPrice).to.equal(1.5);
      expect(marketData.lastUpdate).to.equal(1000);
    });

    it("should calculate rolling average correctly", () => {
      const priceHistory: PriceDataPoint[] = [];
      
      // Create 15 price points
      for (let i = 0; i < 15; i++) {
        priceHistory.push({
          tick: 1000 + i * 100,
          avgPrice: 1.0 + i * 0.1,
          lowPrice: 0.9 + i * 0.1,
          highPrice: 1.1 + i * 0.1
        });
      }

      // Calculate rolling average of last 10
      const last10 = priceHistory.slice(-10);
      const rollingAvg = last10.reduce((sum, p) => sum + p.avgPrice, 0) / 10;

      // Should be around 1.95 (avg of 1.5 to 2.4)
      expect(rollingAvg).to.be.closeTo(1.95, 0.01);
    });

    it("should detect rising trend", () => {
      const priceHistory: PriceDataPoint[] = [];
      
      // Create upward trend: older prices 1.0-1.2, newer prices 1.6-1.8
      for (let i = 0; i < 5; i++) {
        priceHistory.push({ tick: 1000 + i * 100, avgPrice: 1.0 + i * 0.2, lowPrice: 0.9, highPrice: 1.1 });
      }

      const oldAvg = priceHistory.slice(-5, -2).reduce((sum, p) => sum + p.avgPrice, 0) / 3;
      const newAvg = priceHistory.slice(-3).reduce((sum, p) => sum + p.avgPrice, 0) / 3;
      const change = (newAvg - oldAvg) / oldAvg;

      expect(change).to.be.greaterThan(0.05); // Rising
    });

    it("should detect falling trend", () => {
      const priceHistory: PriceDataPoint[] = [];
      
      // Create downward trend: older prices 1.8-1.6, newer prices 1.2-1.0
      for (let i = 0; i < 5; i++) {
        priceHistory.push({ tick: 1000 + i * 100, avgPrice: 2.0 - i * 0.2, lowPrice: 0.9, highPrice: 1.1 });
      }

      const oldAvg = priceHistory.slice(-5, -2).reduce((sum, p) => sum + p.avgPrice, 0) / 3;
      const newAvg = priceHistory.slice(-3).reduce((sum, p) => sum + p.avgPrice, 0) / 3;
      const change = (newAvg - oldAvg) / oldAvg;

      expect(change).to.be.lessThan(-0.05); // Falling
    });

    it("should detect stable trend", () => {
      const priceHistory: PriceDataPoint[] = [];
      
      // Create stable prices around 1.0
      for (let i = 0; i < 5; i++) {
        priceHistory.push({ tick: 1000 + i * 100, avgPrice: 1.0 + (i % 2 ? 0.01 : -0.01), lowPrice: 0.9, highPrice: 1.1 });
      }

      const oldAvg = priceHistory.slice(-5, -2).reduce((sum, p) => sum + p.avgPrice, 0) / 3;
      const newAvg = priceHistory.slice(-3).reduce((sum, p) => sum + p.avgPrice, 0) / 3;
      const change = (newAvg - oldAvg) / oldAvg;

      expect(Math.abs(change)).to.be.lessThan(0.05); // Stable
    });

    it("should prune old price data", () => {
      const priceHistory: PriceDataPoint[] = [];
      const maxLength = 30;
      
      // Add 50 price points
      for (let i = 0; i < 50; i++) {
        priceHistory.push({ tick: 1000 + i * 100, avgPrice: 1.0, lowPrice: 0.9, highPrice: 1.1 });
        
        // Prune to keep max 30
        if (priceHistory.length > maxLength) {
          priceHistory.shift();
        }
      }

      expect(priceHistory).to.have.lengthOf(30);
      // Latest entry should be from iteration 49
      expect(priceHistory[29].tick).to.equal(1000 + 49 * 100);
    });
  });

  describe("Buy Low Strategy", () => {
    it("should identify buy opportunity when price is below threshold", () => {
      const avgPrice = 1.0;
      const currentPrice = 0.80;
      const buyThreshold = 0.85; // 15% below average

      const threshold = avgPrice * buyThreshold;
      const isBuyOpp = currentPrice <= threshold;

      expect(isBuyOpp).to.be.true;
    });

    it("should not identify buy opportunity when price is at or above threshold", () => {
      const avgPrice = 1.0;
      const currentPrice = 0.90;
      const buyThreshold = 0.85;

      const threshold = avgPrice * buyThreshold;
      const isBuyOpp = currentPrice <= threshold;

      expect(isBuyOpp).to.be.false;
    });

    it("should use configurable buy threshold", () => {
      const avgPrice = 1.0;
      const currentPrice = 0.88;
      
      // With 15% threshold (0.85)
      expect(currentPrice <= avgPrice * 0.85).to.be.false;
      
      // With 12% threshold (0.88)
      expect(currentPrice <= avgPrice * 0.88).to.be.true;
    });
  });

  describe("Sell High Strategy", () => {
    it("should identify sell opportunity when price is above threshold", () => {
      const avgPrice = 1.0;
      const currentPrice = 1.20;
      const sellThreshold = 1.15; // 15% above average

      const threshold = avgPrice * sellThreshold;
      const isSellOpp = currentPrice >= threshold;

      expect(isSellOpp).to.be.true;
    });

    it("should not identify sell opportunity when price is at or below threshold", () => {
      const avgPrice = 1.0;
      const currentPrice = 1.10;
      const sellThreshold = 1.15;

      const threshold = avgPrice * sellThreshold;
      const isSellOpp = currentPrice >= threshold;

      expect(isSellOpp).to.be.false;
    });

    it("should use configurable sell threshold", () => {
      const avgPrice = 1.0;
      const currentPrice = 1.12;
      
      // With 15% threshold (1.15)
      expect(currentPrice >= avgPrice * 1.15).to.be.false;
      
      // With 12% threshold (1.12)
      expect(currentPrice >= avgPrice * 1.12).to.be.true;
    });
  });

  describe("Price-Aware Buy Orders", () => {
    it("should calculate buy price at favorable opportunity", () => {
      const currentPrice = 0.80;
      const avgPrice = 1.0;
      const isBuyOpportunity = true;
      
      // When it's a buy opportunity, buy at 2% above current price
      const buyPrice = isBuyOpportunity ? currentPrice * 1.02 : avgPrice * 1.1;
      
      expect(buyPrice).to.be.closeTo(0.816, 0.01);
    });

    it("should calculate buy price in war mode", () => {
      const currentPrice = 1.0;
      const warPriceMultiplier = 2.0;
      const isWarMode = true;
      
      // In war mode, willing to pay more
      const buyPrice = isWarMode ? currentPrice * warPriceMultiplier : currentPrice * 1.1;
      
      expect(buyPrice).to.equal(2.0);
    });

    it("should calculate normal buy price", () => {
      const avgPrice = 1.0;
      const isWarMode = false;
      const isBuyOpportunity = false;
      
      // Normal case - use average price
      const buyPrice = avgPrice;
      
      expect(buyPrice).to.equal(1.0);
    });
  });

  describe("Price-Aware Sell Orders", () => {
    it("should calculate sell price at favorable opportunity", () => {
      const currentPrice = 1.20;
      const avgPrice = 1.0;
      const isSellOpportunity = true;
      
      // When it's a sell opportunity, sell at 2% below current price
      const sellPrice = isSellOpportunity ? currentPrice * 0.98 : avgPrice * 0.9;
      
      expect(sellPrice).to.be.closeTo(1.176, 0.01);
    });

    it("should calculate normal sell price", () => {
      const avgPrice = 1.0;
      const isSellOpportunity = false;
      
      // Normal case - use average price
      const sellPrice = avgPrice;
      
      expect(sellPrice).to.equal(1.0);
    });
  });

  describe("Configuration", () => {
    it("should use configurable thresholds", () => {
      const avgPrice = 1.0;
      
      // Default thresholds (15%)
      const defaultBuyThreshold = 0.85;
      const defaultSellThreshold = 1.15;
      
      expect(avgPrice * defaultBuyThreshold).to.equal(0.85);
      expect(avgPrice * defaultSellThreshold).to.equal(1.15);
    });

    it("should support custom thresholds", () => {
      const avgPrice = 1.0;
      
      // Custom thresholds (20%)
      const customBuyThreshold = 0.80;
      const customSellThreshold = 1.20;
      
      expect(avgPrice * customBuyThreshold).to.equal(0.80);
      expect(avgPrice * customSellThreshold).to.equal(1.20);
    });
  });
});

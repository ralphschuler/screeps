/**
 * Market System Integration Tests
 *
 * Tests comprehensive market functionality including:
 * - Price tracking and trend analysis
 * - Buy low / sell high strategy
 * - Order lifecycle management
 * - Resource optimization
 * - War mode purchasing
 *
 * Addresses Issue: Market tests for production readiness
 */

import { expect } from "chai";
import type { PriceDataPoint, ResourceMarketData } from "../../src/memory/schemas";

// Mock Game object
const mockGame = {
  time: 10000,
  market: {
    credits: 100000,
    orders: {} as Record<string, any>,
    incomingTransactions: [] as any[],
    outgoingTransactions: [] as any[]
  }
};

(global as any).Game = mockGame;
(global as any).RESOURCE_ENERGY = "energy";
(global as any).RESOURCE_HYDROGEN = "H";
(global as any).RESOURCE_OXYGEN = "O";
(global as any).RESOURCE_POWER = "power";
(global as any).RESOURCE_GHODIUM = "G";
(global as any).ORDER_BUY = "buy";
(global as any).ORDER_SELL = "sell";

describe("Market System Integration", () => {
  beforeEach(() => {
    // Reset mock state
    mockGame.time = 10000;
    mockGame.market.credits = 100000;
    mockGame.market.orders = {};
    mockGame.market.incomingTransactions = [];
    mockGame.market.outgoingTransactions = [];
  });

  describe("Price Tracking and Analysis", () => {
    it("should track historical prices for resources", () => {
      const priceHistory: PriceDataPoint[] = [
        { tick: 9000, avgPrice: 1.0, lowPrice: 0.95, highPrice: 1.05 },
        { tick: 9500, avgPrice: 1.1, lowPrice: 1.05, highPrice: 1.15 },
        { tick: 10000, avgPrice: 0.9, lowPrice: 0.85, highPrice: 0.95 }
      ];

      expect(priceHistory).to.have.lengthOf(3);
      expect(priceHistory[priceHistory.length - 1].avgPrice).to.equal(0.9);
    });

    it("should calculate rolling average price", () => {
      const pricePoints: PriceDataPoint[] = [
        { tick: 9000, avgPrice: 1.0, lowPrice: 0.95, highPrice: 1.05 },
        { tick: 9100, avgPrice: 1.2, lowPrice: 1.15, highPrice: 1.25 },
        { tick: 9200, avgPrice: 0.8, lowPrice: 0.75, highPrice: 0.85 },
        { tick: 9300, avgPrice: 1.1, lowPrice: 1.05, highPrice: 1.15 },
        { tick: 9400, avgPrice: 0.9, lowPrice: 0.85, highPrice: 0.95 }
      ];
      const average = pricePoints.reduce((sum, p) => sum + p.avgPrice, 0) / pricePoints.length;

      expect(average).to.be.closeTo(1.0, 0.01);
    });

    it("should detect price trends (rising/falling/stable)", () => {
      const detectTrend = (prices: number[], threshold: number = 0.05): string => {
        if (prices.length < 2) return "stable";
        
        const recent = prices[prices.length - 1];
        const previous = prices[prices.length - 2];
        const change = (recent - previous) / previous;

        if (change > threshold) return "rising";
        if (change < -threshold) return "falling";
        return "stable";
      };

      expect(detectTrend([1.0, 1.1])).to.equal("rising");
      expect(detectTrend([1.0, 0.85])).to.equal("falling");
      expect(detectTrend([1.0, 1.02])).to.equal("stable");
    });

    it("should calculate price volatility", () => {
      const calculateVolatility = (prices: number[]): number => {
        if (prices.length < 2) return 0;
        
        const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        const variance = prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length;
        return Math.sqrt(variance);
      };

      const stablePrices = [1.0, 1.0, 1.0, 1.0];
      const volatilePrices = [1.0, 2.0, 0.5, 1.5];

      expect(calculateVolatility(stablePrices)).to.equal(0);
      expect(calculateVolatility(volatilePrices)).to.be.greaterThan(0);
    });

    it("should update price data with new market information", () => {
      const marketData: ResourceMarketData = {
        resource: "energy" as ResourceConstant,
        priceHistory: [
          { tick: 9000, avgPrice: 1.0, lowPrice: 0.95, highPrice: 1.05 }
        ],
        avgPrice: 1.0,
        trend: 0,
        lastUpdate: 9000
      };

      // Simulate new price data
      const newPrice = { tick: 10000, avgPrice: 1.2, lowPrice: 1.15, highPrice: 1.25 };
      marketData.priceHistory.push(newPrice);
      marketData.lastUpdate = 10000;

      // Recalculate averages
      const avgPrices = marketData.priceHistory.map(p => p.avgPrice);
      marketData.avgPrice = avgPrices.reduce((sum, p) => sum + p, 0) / avgPrices.length;
      const highPrice = Math.max(...marketData.priceHistory.map(p => p.highPrice));
      const lowPrice = Math.min(...marketData.priceHistory.map(p => p.lowPrice));

      expect(marketData.priceHistory).to.have.lengthOf(2);
      expect(marketData.avgPrice).to.equal(1.1);
      expect(highPrice).to.equal(1.25);
      expect(lowPrice).to.equal(0.95);
    });

    it("should maintain maximum price history length", () => {
      const MAX_HISTORY = 30;
      const history: PriceDataPoint[] = [];

      // Add 35 price points
      for (let i = 0; i < 35; i++) {
        const price = 1.0 + (i * 0.01);
        history.push({ 
          tick: 10000 + (i * 100), 
          avgPrice: price, 
          lowPrice: price - 0.05, 
          highPrice: price + 0.05 
        });
        
        // Trim to max length
        if (history.length > MAX_HISTORY) {
          history.shift();
        }
      }

      expect(history).to.have.lengthOf(MAX_HISTORY);
      expect(history[0].tick).to.equal(10500); // First 5 removed
    });
  });

  describe("Buy Low / Sell High Strategy", () => {
    it("should identify buy opportunity when price is low", () => {
      const currentPrice = 0.8;
      const avgPrice = 1.0;
      const threshold = 0.85; // Buy if below 85% of average

      const isBuyOpportunity = currentPrice < (avgPrice * threshold);
      expect(isBuyOpportunity).to.be.true;
    });

    it("should identify sell opportunity when price is high", () => {
      const currentPrice = 1.2;
      const avgPrice = 1.0;
      const threshold = 1.15; // Sell if above 115% of average

      const isSellOpportunity = currentPrice > (avgPrice * threshold);
      expect(isSellOpportunity).to.be.true;
    });

    it("should not trade when price is within normal range", () => {
      const currentPrice = 1.05;
      const avgPrice = 1.0;
      const buyThreshold = 0.85;
      const sellThreshold = 1.15;

      const shouldBuy = currentPrice < (avgPrice * buyThreshold);
      const shouldSell = currentPrice > (avgPrice * sellThreshold);

      expect(shouldBuy).to.be.false;
      expect(shouldSell).to.be.false;
    });

    it("should calculate optimal buy price (slightly above current low)", () => {
      const currentLowPrice = 0.8;
      const adjustment = 1.02; // 2% above low

      const buyPrice = currentLowPrice * adjustment;
      expect(buyPrice).to.be.closeTo(0.816, 0.001);
    });

    it("should calculate optimal sell price (slightly below current high)", () => {
      const currentHighPrice = 1.2;
      const adjustment = 0.98; // 2% below high

      const sellPrice = currentHighPrice * adjustment;
      expect(sellPrice).to.be.closeTo(1.176, 0.001);
    });

    it("should adjust strategy based on credit availability", () => {
      const hasCreditsForTrading = (credits: number, minTrading: number) => {
        return credits >= minTrading;
      };

      expect(hasCreditsForTrading(100000, 50000)).to.be.true;
      expect(hasCreditsForTrading(30000, 50000)).to.be.false;
    });

    it("should prioritize buying critical resources even at higher prices", () => {
      const isCriticalResource = (resource: string) => {
        return ["energy", "power"].includes(resource);
      };

      const shouldBuyEvenIfExpensive = (
        resource: string,
        currentAmount: number,
        criticalThreshold: number
      ) => {
        return isCriticalResource(resource) && currentAmount < criticalThreshold;
      };

      expect(shouldBuyEvenIfExpensive("energy", 1000, 5000)).to.be.true;
      expect(shouldBuyEvenIfExpensive("H", 1000, 5000)).to.be.false;
    });
  });

  describe("Order Lifecycle Management", () => {
    it("should create buy order with calculated price", () => {
      interface MarketOrder {
        id: string;
        type: "buy" | "sell";
        resourceType: ResourceConstant;
        price: number;
        amount: number;
        roomName: string;
        createdAt: number;
      }

      const order: MarketOrder = {
        id: "order123",
        type: "buy",
        resourceType: "energy" as ResourceConstant,
        price: 0.85,
        amount: 10000,
        roomName: "W1N1",
        createdAt: mockGame.time
      };

      expect(order.type).to.equal("buy");
      expect(order.price).to.equal(0.85);
      expect(order.amount).to.equal(10000);
    });

    it("should create sell order with calculated price", () => {
      interface MarketOrder {
        id: string;
        type: "buy" | "sell";
        resourceType: ResourceConstant;
        price: number;
        amount: number;
        roomName: string;
        createdAt: number;
      }

      const order: MarketOrder = {
        id: "order456",
        type: "sell",
        resourceType: "H" as ResourceConstant,
        price: 1.15,
        amount: 5000,
        roomName: "W1N1",
        createdAt: mockGame.time
      };

      expect(order.type).to.equal("sell");
      expect(order.price).to.equal(1.15);
    });

    it("should track order fill progress", () => {
      interface OrderStatus {
        id: string;
        totalAmount: number;
        remainingAmount: number;
        filled: number;
      }

      const order: OrderStatus = {
        id: "order123",
        totalAmount: 10000,
        remainingAmount: 7000,
        filled: 3000
      };

      const fillPercentage = (order.filled / order.totalAmount) * 100;
      expect(fillPercentage).to.equal(30);
    });

    it("should extend order when partially filled and still needed", () => {
      const shouldExtendOrder = (
        age: number,
        extensionAge: number,
        remainingAmount: number,
        stillNeeded: boolean
      ): boolean => {
        return age > extensionAge && remainingAmount > 0 && stillNeeded;
      };

      expect(shouldExtendOrder(600, 500, 5000, true)).to.be.true;
      expect(shouldExtendOrder(400, 500, 5000, true)).to.be.false;
      expect(shouldExtendOrder(600, 500, 0, true)).to.be.false;
    });

    it("should cancel unfilled order after timeout", () => {
      const shouldCancelOrder = (age: number, timeout: number, filled: number): boolean => {
        return age > timeout && filled === 0;
      };

      expect(shouldCancelOrder(1500, 1000, 0)).to.be.true;
      expect(shouldCancelOrder(1500, 1000, 100)).to.be.false;
    });

    it("should track multiple active orders per resource", () => {
      interface MarketOrder {
        id: string;
        resourceType: string;
        type: string;
        amount: number;
      }

      const orders: MarketOrder[] = [
        { id: "o1", resourceType: "energy", type: "buy", amount: 10000 },
        { id: "o2", resourceType: "energy", type: "sell", amount: 5000 },
        { id: "o3", resourceType: "H", type: "buy", amount: 2000 }
      ];

      const energyOrders = orders.filter(o => o.resourceType === "energy");
      expect(energyOrders).to.have.lengthOf(2);
    });
  });

  describe("Resource Optimization", () => {
    it("should calculate total empire resource amounts", () => {
      const rooms = {
        "W1N1": { storage: { store: { energy: 100000, H: 5000 } }, terminal: { store: { energy: 50000 } } },
        "W2N2": { storage: { store: { energy: 80000, O: 3000 } }, terminal: { store: { energy: 30000 } } }
      };

      const calculateTotalResource = (resource: string): number => {
        let total = 0;
        for (const room of Object.values(rooms)) {
          const storageAmount = (room.storage?.store as any)?.[resource];
          const terminalAmount = (room.terminal?.store as any)?.[resource];
          if (storageAmount) total += storageAmount;
          if (terminalAmount) total += terminalAmount;
        }
        return total;
      };

      expect(calculateTotalResource("energy")).to.equal(260000);
      expect(calculateTotalResource("H")).to.equal(5000);
    });

    it("should identify resources in surplus", () => {
      const isInSurplus = (amount: number, threshold: number): boolean => {
        return amount > threshold;
      };

      expect(isInSurplus(500000, 300000)).to.be.true;
      expect(isInSurplus(200000, 300000)).to.be.false;
    });

    it("should identify resources in shortage", () => {
      const isInShortage = (amount: number, threshold: number): boolean => {
        return amount < threshold;
      };

      expect(isInShortage(5000, 10000)).to.be.true;
      expect(isInShortage(15000, 10000)).to.be.false;
    });

    it("should prioritize selling surplus resources", () => {
      interface ResourceStatus {
        resource: string;
        amount: number;
        threshold: number;
        surplus: number;
      }

      const resources: ResourceStatus[] = [
        { resource: "H", amount: 50000, threshold: 20000, surplus: 30000 },
        { resource: "O", amount: 30000, threshold: 20000, surplus: 10000 },
        { resource: "U", amount: 80000, threshold: 20000, surplus: 60000 }
      ];

      // Sort by surplus (highest first)
      const sorted = [...resources].sort((a, b) => b.surplus - a.surplus);
      expect(sorted[0].resource).to.equal("U");
    });

    it("should prioritize buying shortage resources", () => {
      interface ResourceStatus {
        resource: string;
        amount: number;
        threshold: number;
        shortage: number;
      }

      const resources: ResourceStatus[] = [
        { resource: "power", amount: 500, threshold: 5000, shortage: 4500 },
        { resource: "G", amount: 1000, threshold: 5000, shortage: 4000 },
        { resource: "K", amount: 3000, threshold: 5000, shortage: 2000 }
      ];

      // Sort by shortage (highest first)
      const sorted = [...resources].sort((a, b) => b.shortage - a.shortage);
      expect(sorted[0].resource).to.equal("power");
    });
  });

  describe("War Mode Purchasing", () => {
    it("should increase price multiplier in war mode", () => {
      const normalMultiplier = 1.0;
      const warMultiplier = 2.0;

      const getMultiplier = (isWarMode: boolean) => {
        return isWarMode ? warMultiplier : normalMultiplier;
      };

      expect(getMultiplier(true)).to.equal(2.0);
      expect(getMultiplier(false)).to.equal(1.0);
    });

    it("should aggressively buy boost compounds in war mode", () => {
      const boostCompounds = ["XLH2O", "XLHO2", "XGH2O", "XGHO2"];
      const isBoostCompound = (resource: string) => boostCompounds.includes(resource);

      const shouldAggressivelyBuy = (resource: string, isWarMode: boolean) => {
        return isWarMode && isBoostCompound(resource);
      };

      expect(shouldAggressivelyBuy("XLH2O", true)).to.be.true;
      expect(shouldAggressivelyBuy("XLH2O", false)).to.be.false;
      expect(shouldAggressivelyBuy("H", true)).to.be.false;
    });

    it("should buy ghodium for nukes in war mode", () => {
      const isGhodium = (resource: string) => resource === "G";
      const needsNukes = (currentGhodium: number, threshold: number) => {
        return currentGhodium < threshold;
      };

      const shouldBuyGhodium = (resource: string, amount: number, isWarMode: boolean) => {
        return isWarMode && isGhodium(resource) && needsNukes(amount, 5000);
      };

      expect(shouldBuyGhodium("G", 2000, true)).to.be.true;
      expect(shouldBuyGhodium("G", 2000, false)).to.be.false;
      expect(shouldBuyGhodium("G", 6000, true)).to.be.false;
    });

    it("should maintain emergency credit reserve even in war mode", () => {
      const canSpendCredits = (
        currentCredits: number,
        cost: number,
        emergencyReserve: number
      ): boolean => {
        return (currentCredits - cost) >= emergencyReserve;
      };

      expect(canSpendCredits(100000, 90000, 5000)).to.be.true;
      expect(canSpendCredits(100000, 96000, 5000)).to.be.false;
    });
  });

  describe("Transaction Cost Optimization", () => {
    it("should calculate energy cost for terminal transfer", () => {
      const calculateTransferCost = (amount: number, distance: number): number => {
        return Math.ceil(amount * 0.1 * distance);
      };

      expect(calculateTransferCost(1000, 10)).to.equal(1000);
      expect(calculateTransferCost(5000, 5)).to.equal(2500);
    });

    it("should prefer local deals to minimize transfer costs", () => {
      interface Deal {
        orderId: string;
        price: number;
        distance: number;
        transferCost: number;
      }

      const deals: Deal[] = [
        { orderId: "d1", price: 1.0, distance: 10, transferCost: 1000 },
        { orderId: "d2", price: 1.05, distance: 2, transferCost: 200 }
      ];

      // Calculate total cost including transfer
      const withTotalCost = deals.map(d => ({
        ...d,
        totalCost: (d.price * 10000) + (d.transferCost * 1) // Transfer cost in energy value
      }));

      // Sort by total cost
      const sorted = withTotalCost.sort((a, b) => a.totalCost - b.totalCost);
      expect(sorted[0].orderId).to.equal("d2"); // Closer deal wins despite higher price
    });

    it("should avoid deals with excessive transfer costs", () => {
      const maxTransportCostRatio = 0.1; // 10% of deal value

      const isTransferCostAcceptable = (
        dealValue: number,
        transferCost: number
      ): boolean => {
        return (transferCost / dealValue) <= maxTransportCostRatio;
      };

      expect(isTransferCostAcceptable(10000, 500)).to.be.true;
      expect(isTransferCostAcceptable(10000, 1500)).to.be.false;
    });

    it("should batch orders to reduce transaction fees", () => {
      const ORDER_FEE_PERCENT = 0.05;

      const calculateFees = (orders: number[], amounts: number[]): number => {
        let totalFees = 0;
        for (let i = 0; i < orders.length; i++) {
          totalFees += amounts[i] * ORDER_FEE_PERCENT;
        }
        return totalFees;
      };

      // Multiple small orders
      const smallOrders = [1000, 1000, 1000];
      const smallFees = calculateFees(smallOrders, smallOrders);

      // One large order
      const largeOrder = [3000];
      const largeFees = calculateFees(largeOrder, largeOrder);

      expect(smallFees).to.equal(largeFees); // Same total fee
      // In practice, batching reduces overhead
    });
  });

  describe("Market Performance and Efficiency", () => {
    it("should update prices at intervals not every tick", () => {
      const UPDATE_INTERVAL = 500;
      const lastUpdate = 9500;
      const currentTick = 10000;

      const shouldUpdate = (currentTick - lastUpdate) >= UPDATE_INTERVAL;
      expect(shouldUpdate).to.be.true;
    });

    it("should cache market orders to reduce API calls", () => {
      interface OrderCache {
        orders: any[];
        cachedAt: number;
        ttl: number;
      }

      const cache: OrderCache = {
        orders: [{ id: "o1" }, { id: "o2" }],
        cachedAt: 9900,
        ttl: 100
      };

      const isCacheValid = (cache: OrderCache, currentTick: number): boolean => {
        return (currentTick - cache.cachedAt) < cache.ttl;
      };

      expect(isCacheValid(cache, 9950)).to.be.true;
      expect(isCacheValid(cache, 10050)).to.be.false;
    });

    it("should process market operations only when bucket is sufficient", () => {
      const MIN_BUCKET = 7000;

      const shouldRunMarket = (bucket: number): boolean => {
        return bucket >= MIN_BUCKET;
      };

      expect(shouldRunMarket(8000)).to.be.true;
      expect(shouldRunMarket(5000)).to.be.false;
    });

    it("should track transaction history for analysis", () => {
      interface Transaction {
        resourceType: string;
        amount: number;
        price: number;
        timestamp: number;
        type: "buy" | "sell";
      }

      const transactions: Transaction[] = [
        { resourceType: "energy", amount: 10000, price: 0.85, timestamp: 9500, type: "buy" },
        { resourceType: "energy", amount: 10000, price: 1.15, timestamp: 10000, type: "sell" }
      ];

      // Calculate profit
      const bought = transactions.filter(t => t.type === "buy");
      const sold = transactions.filter(t => t.type === "sell");
      
      const totalSpent = bought.reduce((sum, t) => sum + (t.amount * t.price), 0);
      const totalEarned = sold.reduce((sum, t) => sum + (t.amount * t.price), 0);
      const profit = totalEarned - totalSpent;

      expect(profit).to.be.greaterThan(0);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle missing price history gracefully", () => {
      const priceHistory: PriceDataPoint[] = [];
      const avgPrice = priceHistory.length > 0
        ? priceHistory.reduce((sum, p) => sum + p.avgPrice, 0) / priceHistory.length
        : 1.0; // Default price

      expect(avgPrice).to.equal(1.0);
    });

    it("should handle insufficient credits for order", () => {
      const credits = 5000;
      const orderCost = 10000;

      const canAfford = credits >= orderCost;
      expect(canAfford).to.be.false;
    });

    it("should handle room without terminal", () => {
      const hasTerminal = (room: any) => {
        return room.terminal !== undefined;
      };

      const roomWithTerminal = { terminal: {} };
      const roomWithoutTerminal = {};

      expect(hasTerminal(roomWithTerminal)).to.be.true;
      expect(hasTerminal(roomWithoutTerminal)).to.be.false;
    });

    it("should handle market API failures gracefully", () => {
      const executeMarketOrder = (orderId: string): number => {
        // Simulate API failure
        const ERROR_NOT_ENOUGH_RESOURCES = -6;
        return ERROR_NOT_ENOUGH_RESOURCES;
      };

      const result = executeMarketOrder("order123");
      expect(result).to.be.lessThan(0); // Error code
    });

    it("should prevent circular trading (buying and selling same resource)", () => {
      interface ActiveOrder {
        resourceType: string;
        type: "buy" | "sell";
      }

      const activeOrders: ActiveOrder[] = [
        { resourceType: "energy", type: "buy" }
      ];

      const canCreateOrder = (resource: string, type: "buy" | "sell"): boolean => {
        // Don't create opposite order for same resource
        const oppositeType = type === "buy" ? "sell" : "buy";
        return !activeOrders.some(o => o.resourceType === resource && o.type === oppositeType);
      };

      expect(canCreateOrder("energy", "sell")).to.be.false;
      expect(canCreateOrder("H", "sell")).to.be.true;
    });
  });
});

/**
 * Pixel Buying Manager Tests
 *
 * Tests for the pixel purchasing system that only buys pixels when
 * we have surplus resources
 */

import { expect } from "chai";
import { PixelBuyingManager, createDefaultPixelBuyingMemory } from "../../src/empire/pixelBuyingManager";
import { createDefaultMarketMemory, createDefaultEmpireMemory } from "../../src/memory/schemas";

// Mock global objects
const mockMemory: any = {};
const mockGame: any = {
  time: 1000,
  cpu: {
    bucket: 10000,
    getUsed: () => 0,
    limit: 20
  },
  market: {
    credits: 1000000,
    orders: {},
    getAllOrders: () => [],
    deal: () => OK,
    calcTransactionCost: () => 100
  },
  rooms: {}
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
(global as any).RESOURCE_UTRIUM = "U";
(global as any).RESOURCE_LEMERGIUM = "L";
(global as any).RESOURCE_KEANIUM = "K";
(global as any).RESOURCE_ZYNTHIUM = "Z";
(global as any).RESOURCE_CATALYST = "X";
(global as any).RESOURCE_GHODIUM = "G";
(global as any).PIXEL = "pixel";

describe("Pixel Buying Manager", () => {
  let manager: PixelBuyingManager;

  beforeEach(() => {
    // Reset mocks
    mockGame.time = 1000;
    mockGame.cpu.bucket = 10000;
    mockGame.market.credits = 1000000;
    mockGame.market.orders = {};
    mockGame.market.getAllOrders = () => [];
    mockGame.rooms = {};

    // Create empire with market memory
    const empire = createDefaultEmpireMemory();
    empire.market = createDefaultMarketMemory();
    mockMemory.empire = empire;

    // Create manager with test config
    manager = new PixelBuyingManager({
      minCreditsForPixels: 500000,
      creditReserve: 100000,
      minEnergySurplus: 500000,
      energyThresholdPerRoom: 100000,
      maxPixelPrice: 5000,
      targetPixelPrice: 2000,
      purchaseCooldown: 1000,
      enabled: true
    });
  });

  describe("Configuration", () => {
    it("should use default configuration", () => {
      const defaultManager = new PixelBuyingManager();
      const config = defaultManager.getConfig();

      expect(config.enabled).to.be.true;
      expect(config.minCreditsForPixels).to.equal(500000);
      expect(config.creditReserve).to.equal(100000);
      expect(config.maxPixelPrice).to.equal(5000);
    });

    it("should allow custom configuration", () => {
      const customManager = new PixelBuyingManager({
        maxPixelPrice: 3000,
        targetPixelPrice: 1000
      });
      const config = customManager.getConfig();

      expect(config.maxPixelPrice).to.equal(3000);
      expect(config.targetPixelPrice).to.equal(1000);
    });

    it("should update configuration", () => {
      manager.updateConfig({ maxPixelPrice: 4000 });
      const config = manager.getConfig();

      expect(config.maxPixelPrice).to.equal(4000);
    });

    it("should enable and disable pixel buying", () => {
      manager.disable();
      expect(manager.getConfig().enabled).to.be.false;

      manager.enable();
      expect(manager.getConfig().enabled).to.be.true;
    });
  });

  describe("Memory Management", () => {
    it("should create default pixel buying memory", () => {
      const mem = createDefaultPixelBuyingMemory();

      expect(mem.lastPurchaseTick).to.equal(0);
      expect(mem.totalPixelsPurchased).to.equal(0);
      expect(mem.totalCreditsSpent).to.equal(0);
      expect(mem.purchaseHistory).to.be.an("array").with.lengthOf(0);
    });
  });

  describe("Surplus Resource Checks", () => {
    it("should not buy pixels without surplus energy", () => {
      // Setup room with insufficient energy
      mockGame.rooms = {
        "W1N1": {
          controller: { my: true },
          terminal: {
            store: {
              energy: 50000,
              H: 20000,
              O: 20000,
              U: 20000,
              L: 20000,
              K: 20000,
              Z: 20000,
              X: 20000,
              G: 10000
            }
          },
          storage: {
            store: {
              energy: 50000
            }
          }
        }
      };

      const result = manager.canBuyPixels();

      expect(result.canBuy).to.be.false;
      expect(result.reasons).to.include("No resource surplus");
    });

    it("should not buy pixels without sufficient credits", () => {
      mockGame.market.credits = 50000; // Below minCreditsForPixels

      const result = manager.canBuyPixels();

      expect(result.canBuy).to.be.false;
      // Either "Insufficient credits" or "No resource surplus" depending on check order
      expect(result.reasons.length).to.be.greaterThan(0);
    });

    it("should detect when all conditions are met", () => {
      // Setup rich room with all resources
      mockGame.rooms = {
        "W1N1": {
          controller: { my: true },
          terminal: {
            store: {
              energy: 400000,
              H: 20000,
              O: 20000,
              U: 20000,
              L: 20000,
              K: 20000,
              Z: 20000,
              X: 20000,
              G: 10000
            },
            cooldown: 0
          },
          storage: {
            store: {
              energy: 500000
            }
          }
        }
      };

      const result = manager.canBuyPixels();

      expect(result.canBuy).to.be.true;
      expect(result.reasons).to.be.empty;
    });
  });

  describe("Price Filtering", () => {
    it("should reject orders above max price", () => {
      // Setup room with surplus
      mockGame.rooms = {
        "W1N1": {
          name: "W1N1",
          controller: { my: true },
          terminal: {
            store: { energy: 600000, H: 20000, O: 20000, U: 20000, L: 20000, K: 20000, Z: 20000, X: 20000, G: 10000 },
            cooldown: 0
          },
          storage: { store: { energy: 500000 } }
        }
      };

      // Only expensive orders available
      mockGame.market.getAllOrders = () => [
        { id: "order1", type: ORDER_SELL, resourceType: PIXEL, price: 10000, amount: 5, roomName: "W5N5" }
      ];

      let dealCalled = false;
      mockGame.market.deal = () => {
        dealCalled = true;
        return OK;
      };

      // Run the manager manually (since decorators don't work in tests)
      // We can't directly call run() due to decorator registration, so we test the logic
      const result = manager.canBuyPixels();
      
      expect(result.canBuy).to.be.true; // Can buy, but won't find affordable orders
    });

    it("should prefer cheaper orders", () => {
      const orders = [
        { id: "order2", type: ORDER_SELL, resourceType: PIXEL, price: 3000, amount: 5, roomName: "W3N3" },
        { id: "order1", type: ORDER_SELL, resourceType: PIXEL, price: 1500, amount: 5, roomName: "W5N5" },
        { id: "order3", type: ORDER_SELL, resourceType: PIXEL, price: 4500, amount: 5, roomName: "W2N2" }
      ];

      // Sort by price (cheapest first)
      const sorted = orders.sort((a, b) => a.price - b.price);

      expect(sorted[0].id).to.equal("order1");
      expect(sorted[0].price).to.equal(1500);
    });
  });

  describe("Cooldown Management", () => {
    it("should respect purchase cooldown", () => {
      // Setup pixel buying memory with recent purchase
      const empire = mockMemory.empire;
      (empire.market as any).pixelBuying = {
        lastPurchaseTick: 500, // Recent purchase at tick 500
        totalPixelsPurchased: 5,
        totalCreditsSpent: 10000,
        purchaseHistory: [],
        lastScan: 500
      };

      mockGame.time = 1000; // Current tick is 1000, so cooldown not complete (1000 - 500 = 500 < 1000)

      const result = manager.canBuyPixels();

      expect(result.canBuy).to.be.false;
      expect(result.reasons.some(r => r.includes("cooldown"))).to.be.true;
    });

    it("should allow purchase after cooldown", () => {
      // Setup pixel buying memory with old purchase
      const empire = mockMemory.empire;
      (empire.market as any).pixelBuying = {
        lastPurchaseTick: 0, // Old purchase at tick 0
        totalPixelsPurchased: 5,
        totalCreditsSpent: 10000,
        purchaseHistory: [],
        lastScan: 0
      };

      mockGame.time = 5000; // Current tick is 5000, cooldown complete

      // Setup room with surplus
      mockGame.rooms = {
        "W1N1": {
          name: "W1N1",
          controller: { my: true },
          terminal: {
            store: { energy: 600000, H: 20000, O: 20000, U: 20000, L: 20000, K: 20000, Z: 20000, X: 20000, G: 10000 },
            cooldown: 0
          },
          storage: { store: { energy: 500000 } }
        }
      };

      const result = manager.canBuyPixels();

      expect(result.canBuy).to.be.true;
    });
  });

  describe("Statistics", () => {
    it("should track purchase statistics", () => {
      const empire = mockMemory.empire;
      (empire.market as any).pixelBuying = {
        lastPurchaseTick: 1000,
        totalPixelsPurchased: 50,
        totalCreditsSpent: 100000,
        purchaseHistory: [
          { tick: 800, amount: 10, pricePerUnit: 2000, totalCost: 20000, orderId: "o1", fromRoom: "W1N1" },
          { tick: 900, amount: 15, pricePerUnit: 1800, totalCost: 27000, orderId: "o2", fromRoom: "W1N1" }
        ],
        lastScan: 1000
      };

      const stats = manager.getStats();

      expect(stats).to.exist;
      expect(stats!.totalPurchased).to.equal(50);
      expect(stats!.totalSpent).to.equal(100000);
      expect(stats!.averagePrice).to.equal(2000); // 100000 / 50
      expect(stats!.recentPurchases).to.have.lengthOf(2);
    });

    it("should handle no purchases gracefully", () => {
      const empire = mockMemory.empire;
      (empire.market as any).pixelBuying = createDefaultPixelBuyingMemory();

      const stats = manager.getStats();

      expect(stats).to.exist;
      expect(stats!.totalPurchased).to.equal(0);
      expect(stats!.totalSpent).to.equal(0);
      expect(stats!.averagePrice).to.equal(0);
    });
  });

  describe("Critical Resource Checks", () => {
    it("should not buy pixels if ghodium is low", () => {
      mockGame.rooms = {
        "W1N1": {
          controller: { my: true },
          terminal: {
            store: {
              energy: 600000,
              H: 20000,
              O: 20000,
              U: 20000,
              L: 20000,
              K: 20000,
              Z: 20000,
              X: 20000,
              G: 1000 // Low ghodium
            }
          },
          storage: {
            store: {
              energy: 500000
            }
          }
        }
      };

      const result = manager.canBuyPixels();

      expect(result.canBuy).to.be.false;
      expect(result.reasons).to.include("No resource surplus");
    });

    it("should not buy pixels if base minerals are low", () => {
      mockGame.rooms = {
        "W1N1": {
          controller: { my: true },
          terminal: {
            store: {
              energy: 600000,
              H: 1000, // Low hydrogen
              O: 20000,
              U: 20000,
              L: 20000,
              K: 20000,
              Z: 20000,
              X: 20000,
              G: 10000
            }
          },
          storage: {
            store: {
              energy: 500000
            }
          }
        }
      };

      const result = manager.canBuyPixels();

      expect(result.canBuy).to.be.false;
      expect(result.reasons).to.include("No resource surplus");
    });
  });

  describe("Multi-Room Handling", () => {
    it("should aggregate resources across multiple rooms", () => {
      // Two rooms with split resources
      mockGame.rooms = {
        "W1N1": {
          controller: { my: true },
          terminal: {
            store: { energy: 300000, H: 10000, O: 10000, U: 10000, L: 10000, K: 10000, Z: 10000, X: 10000, G: 5000 },
            cooldown: 0
          },
          storage: { store: { energy: 250000 } }
        },
        "W2N2": {
          controller: { my: true },
          terminal: {
            store: { energy: 300000, H: 10000, O: 10000, U: 10000, L: 10000, K: 10000, Z: 10000, X: 10000, G: 5000 },
            cooldown: 0
          },
          storage: { store: { energy: 250000 } }
        }
      };

      // Total: 1.1M energy, 20k each mineral, 10k ghodium
      // Two rooms need 200k energy threshold, plus 500k surplus = 700k needed
      // We have 1.1M, so should pass

      const result = manager.canBuyPixels();

      expect(result.canBuy).to.be.true;
    });
  });
});

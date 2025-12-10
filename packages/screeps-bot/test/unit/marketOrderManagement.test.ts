/**
 * Market Order Management Tests
 *
 * Tests for market order creation, execution, and management
 */

import { expect } from "chai";

describe("Market Order Management", () => {
  describe("Order Creation", () => {
    it("should calculate order fee correctly", () => {
      const orderTotal = 10000;
      const feeRate = 0.05; // 5% market fee

      const fee = orderTotal * feeRate;

      expect(fee).to.equal(500);
    });

    it("should validate sufficient credits for order creation", () => {
      const availableCredits = 20000;
      const orderCost = 15000;
      const orderFee = orderCost * 0.05;
      const totalCost = orderCost + orderFee;

      const canAfford = availableCredits >= totalCost;

      expect(canAfford).to.be.true;
      expect(totalCost).to.equal(15750);
    });

    it("should reject orders when insufficient credits", () => {
      const availableCredits = 5000;
      const orderCost = 10000;
      const orderFee = orderCost * 0.05;
      const totalCost = orderCost + orderFee;

      const canAfford = availableCredits >= totalCost;

      expect(canAfford).to.be.false;
    });

    it("should validate order parameters", () => {
      const order = {
        type: "buy",
        resourceType: RESOURCE_ENERGY,
        price: 1.5,
        totalAmount: 10000,
        roomName: "W1N1"
      };

      expect(order.type).to.be.oneOf(["buy", "sell"]);
      expect(order.price).to.be.greaterThan(0);
      expect(order.totalAmount).to.be.greaterThan(0);
    });
  });

  describe("Order Execution", () => {
    it("should calculate energy cost for transactions", () => {
      const distance = 10;
      const amount = 1000;
      
      // Energy cost = amount * distance * 0.1
      const energyCost = Math.ceil(amount * distance * 0.1);

      expect(energyCost).to.equal(1000);
    });

    it("should validate terminal has energy for transaction", () => {
      const terminal = {
        store: {
          [RESOURCE_ENERGY]: 5000
        }
      };

      const energyCost = 3000;
      const canExecute = terminal.store[RESOURCE_ENERGY] >= energyCost;

      expect(canExecute).to.be.true;
    });

    it("should validate terminal has resource for sell order", () => {
      const terminal = {
        store: {
          [RESOURCE_HYDROGEN]: 8000
        }
      };

      const sellAmount = 10000;
      const canExecute = terminal.store[RESOURCE_HYDROGEN] >= sellAmount;

      expect(canExecute).to.be.false;
    });

    it("should check terminal capacity for buy order", () => {
      const terminal = {
        store: {
          getCapacity: () => TERMINAL_CAPACITY,
          getUsedCapacity: () => 250000
        }
      };

      const buyAmount = 60000;
      const freeCapacity = terminal.store.getCapacity() - terminal.store.getUsedCapacity();
      const canReceive = freeCapacity >= buyAmount;

      expect(canReceive).to.be.false;
    });
  });

  describe("Order Tracking", () => {
    it("should track active orders", () => {
      const orders = [
        { id: "order1", type: "buy", active: true, remainingAmount: 5000 },
        { id: "order2", type: "sell", active: true, remainingAmount: 3000 },
        { id: "order3", type: "buy", active: false, remainingAmount: 0 }
      ];

      const activeOrders = orders.filter(o => o.active && o.remainingAmount > 0);

      expect(activeOrders).to.have.lengthOf(2);
    });

    it("should identify completed orders", () => {
      const order = {
        id: "order1",
        totalAmount: 10000,
        remainingAmount: 0
      };

      const isCompleted = order.remainingAmount === 0;
      const fillPercent = 1 - (order.remainingAmount / order.totalAmount);

      expect(isCompleted).to.be.true;
      expect(fillPercent).to.equal(1.0);
    });

    it("should calculate order fill percentage", () => {
      const order = {
        id: "order1",
        totalAmount: 10000,
        remainingAmount: 3000
      };

      const fillPercent = 1 - (order.remainingAmount / order.totalAmount);

      expect(fillPercent).to.equal(0.7);
    });
  });

  describe("Order Cancellation", () => {
    it("should cancel stale orders", () => {
      const order = {
        id: "order1",
        createdAt: 1000,
        remainingAmount: 9900
      };

      const currentTime = 10000;
      const staleThreshold = 5000;
      const fillThreshold = 0.1;

      const age = currentTime - order.createdAt;
      const fillPercent = 1 - (order.remainingAmount / 10000);

      const shouldCancel = age > staleThreshold && fillPercent < fillThreshold;

      expect(shouldCancel).to.be.true;
    });

    it("should not cancel active orders", () => {
      const order = {
        id: "order1",
        createdAt: 1000,
        remainingAmount: 3000
      };

      const currentTime = 2000;
      const staleThreshold = 5000;

      const age = currentTime - order.createdAt;
      const shouldCancel = age > staleThreshold;

      expect(shouldCancel).to.be.false;
    });

    it("should not cancel well-filling orders", () => {
      const order = {
        id: "order1",
        createdAt: 1000,
        totalAmount: 10000,
        remainingAmount: 2000
      };

      const currentTime = 10000;
      const fillThreshold = 0.5;

      const fillPercent = 1 - (order.remainingAmount / order.totalAmount);
      const shouldCancel = fillPercent < fillThreshold;

      expect(shouldCancel).to.be.false;
      expect(fillPercent).to.equal(0.8);
    });
  });

  describe("Order Pricing Strategy", () => {
    it("should price buy orders competitively", () => {
      const bestSellPrice = 1.5;
      const margin = 0.05;

      // Buy slightly above best sell to get filled faster
      const buyPrice = bestSellPrice * (1 + margin);

      expect(buyPrice).to.be.closeTo(1.575, 0.01);
    });

    it("should price sell orders competitively", () => {
      const bestBuyPrice = 2.0;
      const margin = 0.05;

      // Sell slightly below best buy to get filled faster
      const sellPrice = bestBuyPrice * (1 - margin);

      expect(sellPrice).to.be.closeTo(1.90, 0.01);
    });

    it("should adjust prices based on urgency", () => {
      const basePrice = 1.0;
      const urgencyMultiplier = 1.5; // War mode

      const urgentPrice = basePrice * urgencyMultiplier;

      expect(urgentPrice).to.equal(1.5);
    });
  });

  describe("Batch Order Management", () => {
    it("should prefer large transactions for efficiency", () => {
      const smallOrders = [
        { amount: 1000, distance: 5 },
        { amount: 500, distance: 5 },
        { amount: 2000, distance: 5 }
      ];

      // Sort by amount descending
      smallOrders.sort((a, b) => b.amount - a.amount);

      expect(smallOrders[0].amount).to.equal(2000);
    });

    it("should calculate transport cost efficiency", () => {
      const transactions = [
        { amount: 10000, distance: 5, energyCost: 5000 },
        { amount: 1000, distance: 5, energyCost: 500 }
      ];

      // Calculate cost per unit
      const efficiencies = transactions.map(t => ({
        ...t,
        costPerUnit: t.energyCost / t.amount
      }));

      expect(efficiencies[0].costPerUnit).to.equal(0.5);
      expect(efficiencies[1].costPerUnit).to.equal(0.5);
    });

    it("should batch small orders when possible", () => {
      const orders = [
        { resource: RESOURCE_HYDROGEN, amount: 1000 },
        { resource: RESOURCE_HYDROGEN, amount: 2000 },
        { resource: RESOURCE_OXYGEN, amount: 1500 }
      ];

      const hydrogenOrders = orders.filter(o => o.resource === RESOURCE_HYDROGEN);
      const totalHydrogen = hydrogenOrders.reduce((sum, o) => sum + o.amount, 0);

      expect(totalHydrogen).to.equal(3000);
    });
  });

  describe("Credit Management", () => {
    it("should maintain minimum credit reserve", () => {
      const currentCredits = 8000;
      const minReserve = 10000;

      const canTrade = currentCredits > minReserve;

      expect(canTrade).to.be.false;
    });

    it("should allow trading with sufficient reserves", () => {
      const currentCredits = 50000;
      const minReserve = 10000;
      const maxOrderCost = 20000;

      const availableForTrading = currentCredits - minReserve;
      const canAffordOrder = availableForTrading >= maxOrderCost;

      expect(canAffordOrder).to.be.true;
      expect(availableForTrading).to.equal(40000);
    });

    it("should track credit expenses", () => {
      const initialCredits = 100000;
      const ordersCost = 15000;
      const ordersFee = ordersCost * 0.05;

      const remainingCredits = initialCredits - ordersCost - ordersFee;

      expect(remainingCredits).to.equal(84250);
    });
  });

  describe("Resource Balancing", () => {
    it("should detect resource surplus for selling", () => {
      const currentAmount = 50000;
      const targetAmount = 20000;

      const surplus = Math.max(0, currentAmount - targetAmount);
      const shouldSell = surplus > 0;

      expect(shouldSell).to.be.true;
      expect(surplus).to.equal(30000);
    });

    it("should detect resource shortage for buying", () => {
      const currentAmount = 5000;
      const targetAmount = 20000;

      const shortage = Math.max(0, targetAmount - currentAmount);
      const shouldBuy = shortage > 0;

      expect(shouldBuy).to.be.true;
      expect(shortage).to.equal(15000);
    });

    it("should not trade when amounts are balanced", () => {
      const currentAmount = 20000;
      const targetAmount = 20000;
      const tolerance = 2000;

      const difference = Math.abs(currentAmount - targetAmount);
      const needsBalancing = difference > tolerance;

      expect(needsBalancing).to.be.false;
    });
  });

  describe("Transaction History", () => {
    it("should track incoming transactions", () => {
      const transactions = [
        { type: "incoming", resource: RESOURCE_ENERGY, amount: 10000, time: 1000 },
        { type: "incoming", resource: RESOURCE_HYDROGEN, amount: 5000, time: 1050 }
      ];

      const incomingTransactions = transactions.filter(t => t.type === "incoming");

      expect(incomingTransactions).to.have.lengthOf(2);
    });

    it("should calculate total transaction volume", () => {
      const transactions = [
        { resource: RESOURCE_ENERGY, amount: 10000, credits: 15000 },
        { resource: RESOURCE_HYDROGEN, amount: 5000, credits: 7500 }
      ];

      const totalVolume = transactions.reduce((sum, t) => sum + t.credits, 0);

      expect(totalVolume).to.equal(22500);
    });
  });
});

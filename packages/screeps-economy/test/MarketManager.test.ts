import { expect } from "chai";
import { clearGameObjectCache } from "@ralphschuler/screeps-cache";
import { MarketManager } from "../src/market/marketManager";

function createStore(contents: Partial<Record<ResourceConstant, number>>, capacity = 100000): StoreDefinition {
  return {
    ...contents,
    getUsedCapacity: (resource?: ResourceConstant) => {
      if (resource) return contents[resource] ?? 0;
      return Object.values(contents).reduce((sum, amount) => sum + (amount ?? 0), 0);
    },
    getFreeCapacity: (_resource?: ResourceConstant) => {
      const used = Object.values(contents).reduce((sum, amount) => sum + (amount ?? 0), 0);
      return capacity - used;
    },
    getCapacity: () => capacity
  } as unknown as StoreDefinition;
}

function createRoom(
  name: string,
  terminalStore: StoreDefinition,
  storageStore?: StoreDefinition
): Room {
  const terminal = {
    my: true,
    cooldown: 0,
    isActive: () => true,
    store: terminalStore,
    send: () => OK
  } as unknown as StructureTerminal;
  const room = {
    name,
    controller: { my: true, level: 8 },
    terminal,
    storage: storageStore ? ({ store: storageStore } as StructureStorage) : undefined
  } as unknown as Room;
  (terminal as unknown as { room: Room }).room = room;
  return room;
}

function setupGame(overrides: Partial<Market> = {}): void {
  (global as any).Memory = {
    rooms: {},
    creeps: {},
    spawns: {},
    flags: {},
    powerCreeps: {}
  };
  (global as any).Game = {
    time: 101,
    cpu: { bucket: 10000 },
    rooms: {},
    market: {
      credits: 50000,
      orders: {},
      incomingTransactions: [],
      outgoingTransactions: [],
      getHistory: () => [],
      getAllOrders: () => [],
      getOrderById: () => null,
      calcTransactionCost: () => 100,
      createOrder: () => OK,
      deal: () => OK,
      cancelOrder: () => OK,
      changeOrderPrice: () => OK,
      extendOrder: () => OK,
      ...overrides
    }
  };
}

function getEmpireMarket(): any {
  return (Memory as any).empire.market;
}

describe("MarketManager", () => {
  beforeEach(() => {
    setupGame();
    clearGameObjectCache();
  });

  it("counts storage plus terminal resources before creating buy orders", () => {
    let createOrderCount = 0;
    setupGame({
      credits: 50000,
      getHistory: () => [{ avgPrice: 1 }] as PriceHistory[],
      createOrder: () => {
        createOrderCount++;
        return OK;
      }
    });
    const room = createRoom(
      "W1N1",
      createStore({ [RESOURCE_HYDROGEN]: 0, [RESOURCE_ENERGY]: 20000 }),
      createStore({ [RESOURCE_HYDROGEN]: 6000 })
    );
    (Game.rooms as Record<string, Room>).W1N1 = room;

    const manager = new MarketManager({
      minBucket: 0,
      buyThresholds: { [RESOURCE_HYDROGEN]: 5000 },
      sellThresholds: {},
      trackedResources: [RESOURCE_HYDROGEN],
      criticalResources: [],
      priceUpdateInterval: 9999
    });
    (Memory as any).empire = undefined;
    manager.run();
    (Memory as any).empire.objectives.warMode = true;
    manager.run();

    expect(createOrderCount).to.equal(0);
  });

  it("targets the highest emergency resource deficit at room-level", () => {
    const deals: Array<{ orderId: string; amount: number; roomName?: string }> = [];
    setupGame({
      credits: 50000,
      getAllOrders: filter => {
        const typedFilter = filter as OrderFilter;
        if (typedFilter.type === ORDER_SELL && typedFilter.resourceType === RESOURCE_ENERGY) {
          return [
            {
              id: "sell-cheap",
              type: ORDER_SELL,
              resourceType: RESOURCE_ENERGY,
              roomName: "W9N9",
              price: 2,
              amount: 10000,
              remainingAmount: 10000,
              created: 1
            } as Order
          ];
        }
        return [];
      },
      calcTransactionCost: () => 0,
      deal: (id, amount, roomName) => {
        deals.push({ orderId: id, amount, roomName });
        return OK;
      }
    });

    const safeRoom = createRoom("W1N1", createStore({ [RESOURCE_ENERGY]: 10000 }, 120000));
    const emergencyRoom = createRoom(
      "W2N1",
      createStore({ [RESOURCE_ENERGY]: 1000 }),
      createStore({ [RESOURCE_ENERGY]: 2500 })
    );

    (Game.rooms as Record<string, Room>).W1N1 = safeRoom;
    (Game.rooms as Record<string, Room>).W2N1 = emergencyRoom;

    const manager = new MarketManager({
      minBucket: 0,
      criticalResources: [RESOURCE_ENERGY],
      emergencyBuyThreshold: 5000,
      emergencyCredits: 0,
      terminalEnergyReserve: 0,
      priceUpdateInterval: 9999,
      sellThresholds: {},
      buyThresholds: {},
      trackedResources: [RESOURCE_ENERGY]
    });

    manager.run();

    expect(deals).to.deep.equal([{ orderId: "sell-cheap", amount: 1000, roomName: "W2N1" }]);
  });

  it("uses emergency reserve cutoff and skips critical buys when credits are below reserve", () => {
    const deals: Array<{ roomName?: string }> = [];
    setupGame({
      credits: 4000,
      getAllOrders: filter => {
        const typedFilter = filter as OrderFilter;
        if (typedFilter.type === ORDER_SELL && typedFilter.resourceType === RESOURCE_ENERGY) {
          return [
            {
              id: "sell-emergency",
              type: ORDER_SELL,
              resourceType: RESOURCE_ENERGY,
              roomName: "W9N9",
              price: 1,
              amount: 10000,
              remainingAmount: 10000,
              created: 1
            } as Order
          ];
        }
        return [];
      },
      calcTransactionCost: () => 0,
      deal: (id, amount, roomName) => {
        deals.push({ roomName });
        return OK;
      }
    });

    const emergencyRoom = createRoom(
      "W2N1",
      createStore({ [RESOURCE_ENERGY]: 1000 }),
      createStore({ [RESOURCE_ENERGY]: 2500 })
    );
    (Game.rooms as Record<string, Room>).W2N1 = emergencyRoom;
    const manager = new MarketManager({
      minBucket: 0,
      emergencyCredits: 5000,
      criticalResources: [RESOURCE_ENERGY],
      emergencyBuyThreshold: 5000,
      terminalEnergyReserve: 0,
      priceUpdateInterval: 9999,
      sellThresholds: {},
      buyThresholds: {},
      trackedResources: [RESOURCE_ENERGY]
    });

    manager.run();

    expect(deals).to.deep.equal([]);
  });

  it("chooses cheapest order by total delivered cost", () => {
    const deals: Array<{ orderId: string }> = [];
    setupGame({
      credits: 50000,
      getAllOrders: filter => {
        const typedFilter = filter as OrderFilter;
        if (typedFilter.type === ORDER_SELL && typedFilter.resourceType === RESOURCE_ENERGY) {
          return [
            {
              id: "far-expensive",
              type: ORDER_SELL,
              resourceType: RESOURCE_ENERGY,
              roomName: "W8N8",
              price: 1,
              amount: 10000,
              remainingAmount: 10000,
              created: 1
            } as Order,
            {
              id: "near-cheaper",
              type: ORDER_SELL,
              resourceType: RESOURCE_ENERGY,
              roomName: "W1N9",
              price: 1.2,
              amount: 10000,
              remainingAmount: 10000,
              created: 1
            } as Order
          ];
        }
        return [];
      },
      calcTransactionCost: (amount, source) => {
        // W8N8 is very far (expensive to send), W1N9 is local (cheap)
        return source === "W8N8" ? amount * 2 : amount * 0.2;
      },
      deal: id => {
        deals.push({ orderId: id });
        return OK;
      }
    });

    const emergencyRoom = createRoom(
      "W1N1",
      createStore({ [RESOURCE_ENERGY]: 1000 }),
      createStore({ [RESOURCE_ENERGY]: 2500 })
    );
    (Game.rooms as Record<string, Room>).W1N1 = emergencyRoom;

    const manager = new MarketManager({
      minBucket: 0,
      emergencyCredits: 0,
      criticalResources: [RESOURCE_ENERGY],
      emergencyBuyThreshold: 5000,
      terminalEnergyReserve: 0,
      priceUpdateInterval: 9999,
      sellThresholds: {},
      buyThresholds: {},
      trackedResources: [RESOURCE_ENERGY]
    });

    manager.run();

    expect(deals[0].orderId).to.equal("near-cheaper");
  });

  it("sells terminal surplus into the best safe buy order before creating a sell order", () => {
    const deals: Array<{ orderId: string; amount: number; roomName?: string }> = [];
    let createOrderCount = 0;
    setupGame({
      getAllOrders: filter => {
        const typedFilter = filter as OrderFilter;
        if (typedFilter.type === ORDER_BUY && typedFilter.resourceType === RESOURCE_HYDROGEN) {
          return [
            { id: "buy-low", type: ORDER_BUY, resourceType: RESOURCE_HYDROGEN, price: 1, remainingAmount: 5000, amount: 5000, created: 1, roomName: "W8N8" },
            { id: "buy-high", type: ORDER_BUY, resourceType: RESOURCE_HYDROGEN, price: 2, remainingAmount: 5000, amount: 5000, created: 1, roomName: "W9N9" }
          ] as Order[];
        }
        return [];
      },
      deal: (orderId, amount, roomName) => {
        deals.push({ orderId, amount, roomName });
        return OK;
      },
      createOrder: () => {
        createOrderCount++;
        return OK;
      }
    });
    const room = createRoom("W1N1", createStore({ [RESOURCE_HYDROGEN]: 10000, [RESOURCE_ENERGY]: 20000 }));
    (Game.rooms as Record<string, Room>).W1N1 = room;

    const manager = new MarketManager({ minBucket: 0, terminalEnergyReserve: 1000 });
    const sold = manager.sellSurplusFromTerminal("W1N1", RESOURCE_HYDROGEN, 3000);

    expect(sold).to.equal(true);
    expect(deals).to.deep.equal([{ orderId: "buy-high", amount: 3000, roomName: "W1N1" }]);
    expect(createOrderCount).to.equal(0);
  });

  it("sells room-scoped storage overflow energy into the best safe buy order without waiting for aggregate sell signals", () => {
    const deals: Array<{ orderId: string; amount: number; roomName?: string }> = [];
    setupGame({
      getAllOrders: filter => {
        const typedFilter = filter as OrderFilter;
        if (typedFilter.type === ORDER_BUY && typedFilter.resourceType === RESOURCE_ENERGY) {
          return [
            { id: "buy-low", type: ORDER_BUY, resourceType: RESOURCE_ENERGY, price: 0.02, remainingAmount: 10000, amount: 10000, created: 1, roomName: "W8N8" },
            { id: "buy-high", type: ORDER_BUY, resourceType: RESOURCE_ENERGY, price: 0.04, remainingAmount: 10000, amount: 10000, created: 1, roomName: "W9N9" }
          ] as Order[];
        }
        return [];
      },
      calcTransactionCost: () => 100,
      deal: (orderId, amount, roomName) => {
        deals.push({ orderId, amount, roomName });
        return OK;
      }
    });
    const sellingRoom = createRoom(
      "W1N1",
      createStore({ [RESOURCE_ENERGY]: 100000 }, 300000),
      createStore({ [RESOURCE_ENERGY]: 850000 }, 1000000)
    );
    const reserveRoom = createRoom(
      "W2N1",
      createStore({ [RESOURCE_ENERGY]: 100000 }, 300000),
      createStore({ [RESOURCE_ENERGY]: 400000 }, 1000000)
    );
    (Game.rooms as Record<string, Room>).W1N1 = sellingRoom;
    (Game.rooms as Record<string, Room>).W2N1 = reserveRoom;

    new MarketManager({
      minBucket: 0,
      buyThresholds: {},
      sellThresholds: {},
      criticalResources: [],
      trackedResources: [RESOURCE_ENERGY],
      terminalEnergyReserve: 10000,
      maxActiveSellAmount: 5000,
      priceUpdateInterval: 9999
    }).run();

    expect(deals).to.deep.equal([{ orderId: "buy-high", amount: 5000, roomName: "W1N1" }]);
  });

  it("reuses active market order scans for identical filters during one tick", () => {
    let buyOrderScanCount = 0;
    const deals: Array<{ orderId: string; amount: number; roomName?: string }> = [];
    setupGame({
      getAllOrders: filter => {
        const typedFilter = filter as OrderFilter;
        if (typedFilter.type === ORDER_BUY && typedFilter.resourceType === RESOURCE_ENERGY) {
          buyOrderScanCount++;
          return [
            { id: "buy-energy", type: ORDER_BUY, resourceType: RESOURCE_ENERGY, price: 0.04, remainingAmount: 20000, amount: 20000, created: 1, roomName: "W9N9" }
          ] as Order[];
        }
        return [];
      },
      calcTransactionCost: () => 100,
      deal: (orderId, amount, roomName) => {
        deals.push({ orderId, amount, roomName });
        return OK;
      }
    });

    const firstOverflowRoom = createRoom(
      "W1N1",
      createStore({ [RESOURCE_ENERGY]: 100000 }, 300000),
      createStore({ [RESOURCE_ENERGY]: 850000 }, 1000000)
    );
    const secondOverflowRoom = createRoom(
      "W2N1",
      createStore({ [RESOURCE_ENERGY]: 100000 }, 300000),
      createStore({ [RESOURCE_ENERGY]: 900000 }, 1000000)
    );
    (Game.rooms as Record<string, Room>).W1N1 = firstOverflowRoom;
    (Game.rooms as Record<string, Room>).W2N1 = secondOverflowRoom;

    new MarketManager({
      minBucket: 0,
      buyThresholds: {},
      sellThresholds: {},
      criticalResources: [],
      trackedResources: [RESOURCE_ENERGY],
      terminalEnergyReserve: 10000,
      maxActiveSellAmount: 5000,
      priceUpdateInterval: 9999
    }).run();

    expect(deals).to.have.length(2);
    expect(buyOrderScanCount).to.equal(1);
  });

  it("caps repeated cached active sells by amount already dealt this tick", () => {
    const deals: Array<{ orderId: string; amount: number; roomName?: string }> = [];
    setupGame({
      getAllOrders: filter => {
        const typedFilter = filter as OrderFilter;
        if (typedFilter.type === ORDER_BUY && typedFilter.resourceType === RESOURCE_ENERGY) {
          return [
            { id: "buy-energy", type: ORDER_BUY, resourceType: RESOURCE_ENERGY, price: 0.04, remainingAmount: 6000, amount: 6000, created: 1, roomName: "W9N9" }
          ] as Order[];
        }
        return [];
      },
      calcTransactionCost: () => 100,
      deal: (orderId, amount, roomName) => {
        deals.push({ orderId, amount, roomName });
        return OK;
      }
    });

    const firstOverflowRoom = createRoom(
      "W1N1",
      createStore({ [RESOURCE_ENERGY]: 100000 }, 300000),
      createStore({ [RESOURCE_ENERGY]: 850000 }, 1000000)
    );
    const secondOverflowRoom = createRoom(
      "W2N1",
      createStore({ [RESOURCE_ENERGY]: 100000 }, 300000),
      createStore({ [RESOURCE_ENERGY]: 900000 }, 1000000)
    );
    (Game.rooms as Record<string, Room>).W1N1 = firstOverflowRoom;
    (Game.rooms as Record<string, Room>).W2N1 = secondOverflowRoom;

    new MarketManager({
      minBucket: 0,
      buyThresholds: {},
      sellThresholds: {},
      criticalResources: [],
      trackedResources: [RESOURCE_ENERGY],
      terminalEnergyReserve: 10000,
      maxActiveSellAmount: 5000,
      priceUpdateInterval: 9999
    }).run();

    expect(deals).to.deep.equal([
      { orderId: "buy-energy", amount: 5000, roomName: "W2N1" },
      { orderId: "buy-energy", amount: 1000, roomName: "W1N1" }
    ]);
  });

  it("stops room-scoped overflow energy selling at the lower storage hysteresis threshold", () => {
    const deals: Array<{ roomName?: string }> = [];
    setupGame({
      getAllOrders: filter => {
        const typedFilter = filter as OrderFilter;
        if (typedFilter.type === ORDER_BUY && typedFilter.resourceType === RESOURCE_ENERGY) {
          return [
            { id: "buy-energy", type: ORDER_BUY, resourceType: RESOURCE_ENERGY, price: 0.04, remainingAmount: 10000, amount: 10000, created: 1, roomName: "W9N9" }
          ] as Order[];
        }
        return [];
      },
      calcTransactionCost: () => 100,
      deal: (_orderId, _amount, roomName) => {
        deals.push({ roomName });
        return OK;
      }
    });
    const room = createRoom(
      "W1N1",
      createStore({ [RESOURCE_ENERGY]: 100000 }, 300000),
      createStore({ [RESOURCE_ENERGY]: 500000 }, 1000000)
    );
    (Game.rooms as Record<string, Room>).W1N1 = room;
    (Memory.rooms as Record<string, { energyExportActive?: boolean }>).W1N1 = { energyExportActive: true };

    new MarketManager({
      minBucket: 0,
      buyThresholds: {},
      sellThresholds: {},
      criticalResources: [],
      trackedResources: [RESOURCE_ENERGY],
      terminalEnergyReserve: 10000,
      maxActiveSellAmount: 5000,
      priceUpdateInterval: 9999
    }).run();

    expect(deals).to.deep.equal([]);
    expect((Memory.rooms as Record<string, { energyExportActive?: boolean }>).W1N1.energyExportActive).to.equal(false);
  });

  it("does not use aggregate high-price sell logic for energy below room overflow entry threshold", () => {
    let createOrderCount = 0;
    setupGame({
      getHistory: () => [{ avgPrice: 2 }] as PriceHistory[],
      getAllOrders: () => [],
      createOrder: () => {
        createOrderCount++;
        return OK;
      }
    });
    (Memory as any).empire = {
      objectives: { warMode: false },
      market: {
        resources: {
          [RESOURCE_ENERGY]: {
            resource: RESOURCE_ENERGY,
            priceHistory: [],
            avgPrice: 1,
            trend: 0,
            lastUpdate: Game.time - 1
          }
        },
        orders: {},
        totalProfit: 0,
        lastBalance: 0,
        pendingArbitrage: []
      }
    };
    const room = createRoom(
      "W1N1",
      createStore({ [RESOURCE_ENERGY]: 20000 }, 300000),
      createStore({ [RESOURCE_ENERGY]: 600000 }, 1000000)
    );
    (Game.rooms as Record<string, Room>).W1N1 = room;

    new MarketManager({
      minBucket: 0,
      buyThresholds: {},
      sellThresholds: { [RESOURCE_ENERGY]: 500000 },
      criticalResources: [],
      trackedResources: [RESOURCE_ENERGY],
      terminalEnergyReserve: 10000,
      priceUpdateInterval: 9999
    }).run();

    expect(createOrderCount).to.equal(0);
  });

  it("creates only one capped fallback sell order for storage overflow energy when no buy order is safe", () => {
    let createOrderCount = 0;
    setupGame({
      orders: {},
      getAllOrders: () => [],
      createOrder: params => {
        createOrderCount++;
        (Game.market.orders as Record<string, Order>).energyOrder = {
          id: "energyOrder",
          type: params.type,
          resourceType: params.resourceType,
          price: params.price,
          amount: params.totalAmount,
          remainingAmount: params.totalAmount,
          totalAmount: params.totalAmount,
          created: Game.time,
          roomName: params.roomName
        } as Order;
        return OK;
      }
    });
    const room = createRoom(
      "W1N1",
      createStore({ [RESOURCE_ENERGY]: 100000 }, 300000),
      createStore({ [RESOURCE_ENERGY]: 850000 }, 1000000)
    );
    (Game.rooms as Record<string, Room>).W1N1 = room;

    const manager = new MarketManager({
      minBucket: 0,
      buyThresholds: {},
      sellThresholds: {},
      criticalResources: [],
      trackedResources: [RESOURCE_ENERGY],
      terminalEnergyReserve: 10000,
      maxActiveSellAmount: 5000,
      priceUpdateInterval: 9999
    });

    manager.run();
    manager.run();

    expect(createOrderCount).to.equal(1);
    expect((Game.market.orders as Record<string, Order>).energyOrder).to.deep.include({
      type: ORDER_SELL,
      resourceType: RESOURCE_ENERGY,
      remainingAmount: 5000,
      roomName: "W1N1"
    });
  });

  it("tracks created fallback sell orders in market memory", () => {
    setupGame({
      orders: {},
      getAllOrders: () => [],
      createOrder: params => {
        (Game.market.orders as Record<string, Order>).order1 = {
          id: "order1",
          type: params.type,
          resourceType: params.resourceType,
          price: params.price,
          amount: params.totalAmount,
          remainingAmount: params.totalAmount,
          totalAmount: params.totalAmount,
          created: Game.time,
          roomName: params.roomName
        } as Order;
        return OK;
      }
    });
    const room = createRoom("W1N1", createStore({ [RESOURCE_HYDROGEN]: 10000, [RESOURCE_ENERGY]: 20000 }));
    (Game.rooms as Record<string, Room>).W1N1 = room;

    const manager = new MarketManager({ minBucket: 0, terminalEnergyReserve: 1000 });
    const sold = manager.sellSurplusFromTerminal("W1N1", RESOURCE_HYDROGEN, 3000);

    expect(sold).to.equal(true);
    expect(getEmpireMarket().orders.order1).to.deep.include({
      orderId: "order1",
      resource: RESOURCE_HYDROGEN,
      type: "sell",
      created: Game.time,
      totalTraded: 0,
      totalValue: 0
    });
  });

  it("reprices stale orders with changeOrderPrice instead of extendOrder", () => {
    const priceChanges: Array<{ id: string; price: number }> = [];
    let extendCount = 0;
    setupGame({
      orders: {
        buy1: {
          id: "buy1",
          type: ORDER_BUY,
          resourceType: RESOURCE_HYDROGEN,
          price: 1,
          amount: 5000,
          remainingAmount: 5000,
          totalAmount: 5000,
          created: 4000,
          roomName: "W1N1"
        } as Order
      },
      getHistory: () => [{ avgPrice: 2 }] as PriceHistory[],
      changeOrderPrice: (id, price) => {
        priceChanges.push({ id, price });
        return OK;
      },
      extendOrder: () => {
        extendCount++;
        return OK;
      }
    });
    Game.time = 10000;
    const room = createRoom("W1N1", createStore({ [RESOURCE_ENERGY]: 20000 }));
    (Game.rooms as Record<string, Room>).W1N1 = room;

    new MarketManager({
      minBucket: 0,
      orderExtensionAge: 5000,
      buyThresholds: {},
      sellThresholds: {},
      trackedResources: [RESOURCE_HYDROGEN],
      criticalResources: [],
      priceUpdateInterval: 1
    }).run();

    expect(priceChanges).to.have.length(1);
    expect(priceChanges[0].id).to.equal("buy1");
    expect(priceChanges[0].price).to.equal(2.04);
    expect(extendCount).to.equal(0);
  });

  it("starts at most one capped profitable arbitrage trade per run", () => {
    const deals: Array<{ id: string; amount: number; roomName?: string }> = [];
    setupGame({
      credits: 20000,
      getAllOrders: filter => {
        const typedFilter = filter as OrderFilter;
        if (typedFilter.type === ORDER_BUY) {
          return [{ id: `buy-${typedFilter.resourceType}`, type: ORDER_BUY, resourceType: typedFilter.resourceType!, price: 2, remainingAmount: 10000, amount: 10000, created: 1, roomName: "W9N9" }] as Order[];
        }
        if (typedFilter.type === ORDER_SELL) {
          return [{ id: `sell-${typedFilter.resourceType}`, type: ORDER_SELL, resourceType: typedFilter.resourceType!, price: 1, remainingAmount: 10000, amount: 10000, created: 1, roomName: "W8N8" }] as Order[];
        }
        return [];
      },
      calcTransactionCost: () => 10,
      deal: (id, amount, roomName) => {
        deals.push({ id, amount, roomName });
        return OK;
      }
    });
    const room = createRoom("W1N1", createStore({ [RESOURCE_ENERGY]: 50000 }));
    (Game.rooms as Record<string, Room>).W1N1 = room;

    new MarketManager({
      minBucket: 0,
      tradingCredits: 1000,
      minCredits: 10000,
      buyThresholds: {},
      sellThresholds: {},
      trackedResources: [RESOURCE_HYDROGEN, RESOURCE_OXYGEN],
      criticalResources: [],
      maxArbitrageTradesPerRun: 1,
      maxArbitrageAmount: 1000,
      maxArbitrageCredits: 5000,
      minArbitrageProfit: 100,
      energyCreditValue: 0.001,
      priceUpdateInterval: 9999
    }).run();

    expect(deals).to.deep.equal([{ id: "sell-H", amount: 1000, roomName: "W1N1" }]);
    expect(getEmpireMarket().pendingArbitrage).to.have.length(1);
  });

  it("rejects arbitrage when energy-valued transport makes net profit negative", () => {
    const deals: string[] = [];
    setupGame({
      credits: 20000,
      getAllOrders: filter => {
        const typedFilter = filter as OrderFilter;
        if (typedFilter.type === ORDER_BUY) {
          return [{ id: "buy-H", type: ORDER_BUY, resourceType: RESOURCE_HYDROGEN, price: 1.2, remainingAmount: 10000, amount: 10000, created: 1, roomName: "W9N9" }] as Order[];
        }
        if (typedFilter.type === ORDER_SELL) {
          return [{ id: "sell-H", type: ORDER_SELL, resourceType: RESOURCE_HYDROGEN, price: 1, remainingAmount: 10000, amount: 10000, created: 1, roomName: "W8N8" }] as Order[];
        }
        return [];
      },
      calcTransactionCost: amount => amount * 20,
      deal: id => {
        deals.push(id);
        return OK;
      }
    });
    const room = createRoom("W1N1", createStore({ [RESOURCE_ENERGY]: 100000 }));
    (Game.rooms as Record<string, Room>).W1N1 = room;

    new MarketManager({
      minBucket: 0,
      tradingCredits: 1000,
      minCredits: 10000,
      buyThresholds: {},
      sellThresholds: {},
      trackedResources: [RESOURCE_HYDROGEN],
      criticalResources: [],
      maxArbitrageAmount: 1000,
      maxArbitrageCredits: 5000,
      minArbitrageProfit: 1,
      maxTransportCostRatio: 1,
      energyCreditValue: 0.01,
      priceUpdateInterval: 9999
    }).run();

    expect(deals).to.deep.equal([]);
    expect(getEmpireMarket().pendingArbitrage).to.deep.equal([]);
  });

  it("skips emergency energy market scans when terminal reserve leaves no transaction budget", () => {
    let getAllOrdersCalls = 0;
    setupGame({
      credits: 50000,
      getAllOrders: () => {
        getAllOrdersCalls++;
        return [
          {
            id: "sell-energy",
            type: ORDER_SELL,
            resourceType: RESOURCE_ENERGY,
            roomName: "W9N9",
            price: 1,
            amount: 10000,
            remainingAmount: 10000,
            created: 1
          } as Order
        ];
      }
    });
    const room = createRoom("W1N1", createStore({ [RESOURCE_ENERGY]: 1000 }), createStore({}));
    (Game.rooms as Record<string, Room>).W1N1 = room;

    new MarketManager({
      minBucket: 0,
      criticalResources: [RESOURCE_ENERGY],
      emergencyBuyThreshold: 5000,
      emergencyCredits: 0,
      terminalEnergyReserve: 1000,
      buyThresholds: {},
      sellThresholds: {},
      trackedResources: [RESOURCE_ENERGY],
      activeTradingMinBucket: 10001,
      priceUpdateInterval: 9999
    }).run();

    expect(getAllOrdersCalls).to.equal(0);
  });

  it("bounds emergency energy affordability search instead of decrementing per unit", () => {
    let transactionCostCalls = 0;
    const deals: Array<{ id: string; amount: number; roomName?: string }> = [];
    setupGame({
      credits: 50000,
      getAllOrders: filter => {
        const typedFilter = filter as OrderFilter;
        if (typedFilter.type === ORDER_SELL && typedFilter.resourceType === RESOURCE_ENERGY) {
          return [
            {
              id: "sell-energy",
              type: ORDER_SELL,
              resourceType: RESOURCE_ENERGY,
              roomName: "W9N9",
              price: 1,
              amount: 10000,
              remainingAmount: 10000,
              created: 1
            } as Order
          ];
        }
        return [];
      },
      calcTransactionCost: amount => {
        transactionCostCalls++;
        return Math.ceil(amount / 2);
      },
      deal: (id, amount, roomName) => {
        deals.push({ id, amount, roomName });
        return OK;
      }
    });
    const room = createRoom("W1N1", createStore({ [RESOURCE_ENERGY]: 1200 }), createStore({}));
    (Game.rooms as Record<string, Room>).W1N1 = room;

    new MarketManager({
      minBucket: 0,
      criticalResources: [RESOURCE_ENERGY],
      emergencyBuyThreshold: 5000,
      emergencyCredits: 0,
      terminalEnergyReserve: 1000,
      buyThresholds: {},
      sellThresholds: {},
      trackedResources: [RESOURCE_ENERGY],
      maxActiveBuyAmount: 5000,
      activeTradingMinBucket: 10001,
      priceUpdateInterval: 9999
    }).run();

    expect(deals).to.deep.equal([{ id: "sell-energy", amount: 133, roomName: "W1N1" }]);
    expect(transactionCostCalls).to.be.lessThan(30);
  });

  it("preserves zero-cost non-energy emergency buys at terminal reserve", () => {
    const deals: Array<{ id: string; amount: number; roomName?: string }> = [];
    setupGame({
      credits: 50000,
      getAllOrders: filter => {
        const typedFilter = filter as OrderFilter;
        if (typedFilter.type === ORDER_SELL && typedFilter.resourceType === RESOURCE_GHODIUM) {
          return [
            {
              id: "sell-ghodium",
              type: ORDER_SELL,
              resourceType: RESOURCE_GHODIUM,
              roomName: "W9N9",
              price: 1,
              amount: 10000,
              remainingAmount: 10000,
              created: 1
            } as Order
          ];
        }
        return [];
      },
      calcTransactionCost: () => 0,
      deal: (id, amount, roomName) => {
        deals.push({ id, amount, roomName });
        return OK;
      }
    });
    const room = createRoom("W1N1", createStore({ [RESOURCE_ENERGY]: 1000 }), createStore({}));
    (Game.rooms as Record<string, Room>).W1N1 = room;

    new MarketManager({
      minBucket: 0,
      criticalResources: [RESOURCE_GHODIUM],
      emergencyBuyThreshold: 5000,
      emergencyCredits: 0,
      terminalEnergyReserve: 1000,
      buyThresholds: {},
      sellThresholds: {},
      trackedResources: [RESOURCE_GHODIUM],
      maxActiveBuyAmount: 5000,
      activeTradingMinBucket: 10001,
      priceUpdateInterval: 9999
    }).run();

    expect(deals).to.deep.equal([{ id: "sell-ghodium", amount: 5000, roomName: "W1N1" }]);
  });

  it("skips discretionary active trading scans while CPU bucket is recovering", () => {
    let getAllOrdersCalls = 0;
    setupGame({
      credits: 50000,
      getAllOrders: () => {
        getAllOrdersCalls++;
        return [];
      }
    });
    (Game.cpu as { bucket: number }).bucket = 6000;
    const room = createRoom("W1N1", createStore({ [RESOURCE_ENERGY]: 50000 }));
    (Game.rooms as Record<string, Room>).W1N1 = room;

    new MarketManager({
      minBucket: 0,
      activeTradingMinBucket: 8000,
      tradingCredits: 1000,
      criticalResources: [],
      buyThresholds: {},
      sellThresholds: {},
      trackedResources: [RESOURCE_HYDROGEN],
      priceUpdateInterval: 9999
    }).run();

    expect(getAllOrdersCalls).to.equal(0);
  });
});

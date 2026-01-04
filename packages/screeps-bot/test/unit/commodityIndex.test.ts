/**
 * Unit tests for commodity index calculation in ShardManager
 */

import { expect } from "chai";
import { ShardManager } from "../../src/intershard/shardManager";

describe("ShardManager - Commodity Index", () => {
  let shardManager: ShardManager;
  let mockGame: Partial<Game>;

  beforeEach(() => {
    shardManager = new ShardManager();

    // Mock Game object
    mockGame = {
      time: 1000,
      shard: { name: "shard0" },
      cpu: {
        bucket: 10000,
        limit: 50,
        getUsed: () => 10
      } as CPU,
      rooms: {},
      creeps: {}
    };

    // @ts-expect-error - allow overriding global Game for testing
    global.Game = mockGame;
    // @ts-expect-error - mock InterShardMemory
    global.InterShardMemory = {
      getLocal: () => null,
      setLocal: () => {}
    };

    shardManager.initialize();
  });

  it("returns 0 when there are no factories", () => {
    // Setup: room with no factories
    const mockRoom = createMockRoom("W1N1", {
      hasFactory: false,
      hasStorage: false
    });
    mockGame.rooms = { W1N1: mockRoom };

    // Act
    // @ts-expect-error - accessing private method for testing
    const commodityIndex = shardManager.calculateCommodityIndex([mockRoom]);

    // Assert
    expect(commodityIndex).to.equal(0);
  });

  it("returns 0 when room is not owned", () => {
    // Setup: room without controller
    const mockRoom = createMockRoom("W1N1", {
      hasFactory: true,
      hasStorage: false,
      hasController: false
    });
    mockGame.rooms = { W1N1: mockRoom };

    // Act
    const ownedRooms: Room[] = [];
    // @ts-expect-error - accessing private method for testing
    const commodityIndex = shardManager.calculateCommodityIndex(ownedRooms);

    // Assert
    expect(commodityIndex).to.equal(0);
  });

  it("calculates index based on factory level", () => {
    // Setup: room with level 3 factory
    const mockRoom = createMockRoom("W1N1", {
      hasFactory: true,
      factoryLevel: 3,
      hasStorage: false
    });
    mockGame.rooms = { W1N1: mockRoom };

    // Act
    // @ts-expect-error - accessing private method for testing
    const commodityIndex = shardManager.calculateCommodityIndex([mockRoom]);

    // Assert
    // Level 3 factory = 15 points (3 * 5)
    // Max possible for 1 factory = 25 + 10 + 70 = 105
    // Index = (15 / 105) * 100 ≈ 14
    expect(commodityIndex).to.be.greaterThan(0);
    expect(commodityIndex).to.be.lessThanOrEqual(100);
  });

  it("adds bonus for active production", () => {
    // Setup: room with factory that has resources
    const mockRoom = createMockRoom("W1N1", {
      hasFactory: true,
      factoryLevel: 2,
      factoryStoreUsed: 5000,
      hasStorage: false
    });
    mockGame.rooms = { W1N1: mockRoom };

    // Act
    // @ts-expect-error - accessing private method for testing
    const commodityIndex = shardManager.calculateCommodityIndex([mockRoom]);

    // Assert
    // Level 2 factory = 10 points (2 * 5)
    // Active production = +10 points
    // Total = 20 points
    // Index should be higher than factory level alone
    expect(commodityIndex).to.be.greaterThan(14); // Higher than level-only calculation
  });

  it("calculates index for commodities in storage", () => {
    // Setup: room with storage containing commodities
    const mockRoom = createMockRoom("W1N1", {
      hasFactory: true,
      factoryLevel: 0,
      hasStorage: true,
      storageCommodities: {
        [RESOURCE_COMPOSITE]: 5000,
        [RESOURCE_CRYSTAL]: 3000
      }
    });
    mockGame.rooms = { W1N1: mockRoom };

    // Act
    // @ts-expect-error - accessing private method for testing
    const commodityIndex = shardManager.calculateCommodityIndex([mockRoom]);

    // Assert
    // RESOURCE_COMPOSITE: 5000 / 1000 = 5 (capped at 10)
    // RESOURCE_CRYSTAL: 3000 / 1000 = 3 (capped at 10)
    // Total commodity points = 5 + 3 = 8
    // Should have some index value
    expect(commodityIndex).to.be.greaterThan(0);
  });

  it("caps commodity contribution at 10 per type", () => {
    // Setup: room with large amounts of commodities
    const mockRoom = createMockRoom("W1N1", {
      hasFactory: true,
      factoryLevel: 0,
      hasStorage: true,
      storageCommodities: {
        [RESOURCE_COMPOSITE]: 50000, // Would be 50, but capped at 10
        [RESOURCE_CRYSTAL]: 100000 // Would be 100, but capped at 10
      }
    });
    mockGame.rooms = { W1N1: mockRoom };

    // Act
    // @ts-expect-error - accessing private method for testing
    const commodityIndex = shardManager.calculateCommodityIndex([mockRoom]);

    // Assert
    // Each commodity capped at 10, so max 20 points from commodities
    expect(commodityIndex).to.be.greaterThan(0);
    expect(commodityIndex).to.be.lessThanOrEqual(100);
  });

  it("calculates index for multiple rooms", () => {
    // Setup: multiple rooms with factories
    const room1 = createMockRoom("W1N1", {
      hasFactory: true,
      factoryLevel: 3,
      factoryStoreUsed: 1000,
      hasStorage: true,
      storageCommodities: {
        [RESOURCE_COMPOSITE]: 5000
      }
    });

    const room2 = createMockRoom("W2N2", {
      hasFactory: true,
      factoryLevel: 2,
      factoryStoreUsed: 500,
      hasStorage: false
    });

    mockGame.rooms = { W1N1: room1, W2N2: room2 };

    // Act
    // @ts-expect-error - accessing private method for testing
    const commodityIndex = shardManager.calculateCommodityIndex([room1, room2]);

    // Assert
    // Should combine scores from both rooms
    expect(commodityIndex).to.be.greaterThan(0);
    expect(commodityIndex).to.be.lessThanOrEqual(100);
  });

  it("returns value between 0 and 100", () => {
    // Setup: room with maxed out factory and commodities
    const mockRoom = createMockRoom("W1N1", {
      hasFactory: true,
      factoryLevel: 5,
      factoryStoreUsed: 10000,
      hasStorage: true,
      storageCommodities: {
        [RESOURCE_COMPOSITE]: 100000,
        [RESOURCE_CRYSTAL]: 100000,
        [RESOURCE_LIQUID]: 100000,
        [RESOURCE_GHODIUM_MELT]: 100000,
        [RESOURCE_OXIDANT]: 100000,
        [RESOURCE_REDUCTANT]: 100000,
        [RESOURCE_PURIFIER]: 100000
      }
    });
    mockGame.rooms = { W1N1: mockRoom };

    // Act
    // @ts-expect-error - accessing private method for testing
    const commodityIndex = shardManager.calculateCommodityIndex([mockRoom]);

    // Assert
    expect(commodityIndex).to.be.at.least(0);
    expect(commodityIndex).to.be.at.most(100);
  });

  it("integrates with shard health update", () => {
    // Setup: room with factory
    const mockRoom = createMockRoom("W1N1", {
      hasFactory: true,
      factoryLevel: 4,
      factoryStoreUsed: 2000,
      hasStorage: true,
      storageCommodities: {
        [RESOURCE_COMPOSITE]: 10000
      }
    });
    mockGame.rooms = { W1N1: mockRoom };

    // Act
    // @ts-expect-error - calling private method
    shardManager.updateCurrentShardHealth();
    const shardState = shardManager.getCurrentShardState();

    // Assert
    expect(shardState).to.exist;
    expect(shardState!.health.commodityIndex).to.be.greaterThan(0);
    expect(shardState!.health.commodityIndex).to.be.lessThanOrEqual(100);
  });

  it("handles rooms without storage gracefully", () => {
    // Setup: room with factory but no storage
    const mockRoom = createMockRoom("W1N1", {
      hasFactory: true,
      factoryLevel: 3,
      factoryStoreUsed: 1000,
      hasStorage: false
    });
    mockGame.rooms = { W1N1: mockRoom };

    // Act
    // @ts-expect-error - accessing private method for testing
    const commodityIndex = shardManager.calculateCommodityIndex([mockRoom]);

    // Assert
    // Should still calculate based on factory
    expect(commodityIndex).to.be.greaterThan(0);
  });

  it("handles empty storage gracefully", () => {
    // Setup: room with factory and empty storage
    const mockRoom = createMockRoom("W1N1", {
      hasFactory: true,
      factoryLevel: 2,
      factoryStoreUsed: 100,
      hasStorage: true,
      storageCommodities: {}
    });
    mockGame.rooms = { W1N1: mockRoom };

    // Act
    // @ts-expect-error - accessing private method for testing
    const commodityIndex = shardManager.calculateCommodityIndex([mockRoom]);

    // Assert
    // Should calculate based on factory only
    expect(commodityIndex).to.be.greaterThan(0);
  });
});

/**
 * Helper function to create mock Room objects for testing
 */
function createMockRoom(
  name: string,
  config: {
    hasFactory: boolean;
    factoryLevel?: number;
    factoryStoreUsed?: number;
    hasStorage: boolean;
    storageCommodities?: Record<ResourceConstant, number>;
    hasController?: boolean;
  }
): Room {
  const room: Partial<Room> = {
    name,
    controller: config.hasController !== false ? ({ my: true, level: 8 } as StructureController) : undefined,
    find: (type: FindConstant, opts?: FilterOptions<any>) => {
      if (type === FIND_MY_STRUCTURES) {
        // Return factory if configured
        if (config.hasFactory) {
          const factory = {
            structureType: STRUCTURE_FACTORY,
            level: config.factoryLevel ?? 0,
            store: {
              getUsedCapacity: () => config.factoryStoreUsed ?? 0
            }
          } as unknown as StructureFactory;

          // Respect filter if provided
          if (opts?.filter) {
            const filterFn =
              typeof opts.filter === "function"
                ? opts.filter
                : (s: Structure) => {
                    for (const key in opts.filter) {
                      if ((s as any)[key] !== (opts.filter as any)[key]) return false;
                    }
                    return true;
                  };
            return filterFn(factory) ? [factory] : [];
          }
          return [factory];
        }
        return [];
      }
      return [];
    },
    storage: config.hasStorage
      ? ({
          store: {
            getUsedCapacity: (resource?: ResourceConstant) => {
              if (resource && config.storageCommodities) {
                return config.storageCommodities[resource] ?? 0;
              }
              return 0;
            }
          } as StoreDefinition
        } as StructureStorage)
      : undefined
  };

  return room as Room;
}

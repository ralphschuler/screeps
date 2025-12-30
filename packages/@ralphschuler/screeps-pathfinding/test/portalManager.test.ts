/**
 * Unit tests for PortalManager
 */

import { expect } from "chai";
import { PortalManager, PortalInfo } from "../src/portal/portalManager";
import type { ICache, ILogger } from "../src/types";

// Test fixtures
class MockCache implements ICache {
  private store = new Map<string, { value: any; ttl: number }>();

  get<T>(key: string): T | undefined {
    return this.store.get(key)?.value as T | undefined;
  }

  set<T>(key: string, value: T, ttl: number): void {
    this.store.set(key, { value, ttl });
  }

  clear(): void {
    this.store.clear();
  }
}

class MockLogger implements ILogger {
  logs: Array<{ level: string; message: string; context?: any }> = [];

  debug(message: string, context?: any): void {
    this.logs.push({ level: 'debug', message, context });
  }

  info(message: string, context?: any): void {
    this.logs.push({ level: 'info', message, context });
  }

  warn(message: string, context?: any): void {
    this.logs.push({ level: 'warn', message, context });
  }

  error(message: string, context?: any): void {
    this.logs.push({ level: 'error', message, context });
  }

  clear(): void {
    this.logs = [];
  }
}

describe("PortalManager", () => {
  let portalManager: PortalManager;
  let mockCache: MockCache;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockCache = new MockCache();
    mockLogger = new MockLogger();
    portalManager = new PortalManager(mockCache, mockLogger);

    // Reset Game.time
    Game.time = 1000;
    
    // Clear rooms
    Game.rooms = {};
  });

  describe("Portal Discovery", () => {
    it("should return null for invisible rooms", () => {
      const result = portalManager.discoverPortalsInRoom("W1N1");
      expect(result).to.be.null;
    });

    it("should cache null for invisible rooms", () => {
      portalManager.discoverPortalsInRoom("W1N1");
      const cachedValue = mockCache.get("portals:room:W1N1");
      expect(cachedValue).to.be.null;
    });

    it("should discover portals in a visible room", () => {
      // Mock a room with portals
      const mockPortal = {
        structureType: STRUCTURE_PORTAL,
        pos: new RoomPosition(25, 25, "W1N1"),
        destination: {
          shard: "shard1",
          room: "E1S1"
        }
      };

      Game.rooms["W1N1"] = {
        find: (type: number) => {
          if (type === FIND_STRUCTURES) {
            return [mockPortal];
          }
          return [];
        }
      } as any;

      const result = portalManager.discoverPortalsInRoom("W1N1");
      
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(1);
      expect(result![0].destination.shard).to.equal("shard1");
      expect(result![0].destination.room).to.equal("E1S1");
    });

    it("should cache portal discovery results", () => {
      const mockPortal = {
        structureType: STRUCTURE_PORTAL,
        pos: new RoomPosition(25, 25, "W1N1"),
        destination: {
          shard: "shard1",
          room: "E1S1"
        }
      };

      Game.rooms["W1N1"] = {
        find: () => [mockPortal]
      } as any;

      // First call
      portalManager.discoverPortalsInRoom("W1N1");
      
      // Second call should use cache
      mockLogger.clear();
      const result = portalManager.discoverPortalsInRoom("W1N1");
      
      expect(result).to.be.an('array');
      expect(mockLogger.logs.some(log => log.message.includes('cached'))).to.be.true;
    });

    it("should handle intra-shard portals", () => {
      const mockPortal = {
        structureType: STRUCTURE_PORTAL,
        pos: new RoomPosition(25, 25, "W1N1"),
        destination: new RoomPosition(25, 25, "E1S1")
      };

      Game.rooms["W1N1"] = {
        find: () => [mockPortal]
      } as any;

      const result = portalManager.discoverPortalsInRoom("W1N1");
      
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(1);
      expect(result![0].destination.room).to.equal("E1S1");
      expect(result![0].destination.shard).to.be.undefined;
    });
  });

  describe("Portal Routing", () => {
    it("should find portals to a specific shard", () => {
      const mockPortal1 = {
        structureType: STRUCTURE_PORTAL,
        pos: new RoomPosition(25, 25, "W1N1"),
        destination: { shard: "shard1", room: "E1S1" }
      };

      const mockPortal2 = {
        structureType: STRUCTURE_PORTAL,
        pos: new RoomPosition(25, 25, "W2N2"),
        destination: { shard: "shard2", room: "E2S2" }
      };

      Game.rooms["W1N1"] = {
        find: () => [mockPortal1]
      } as any;

      Game.rooms["W2N2"] = {
        find: () => [mockPortal2]
      } as any;

      const result = portalManager.getPortalsToShard("shard1");
      
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(1);
      expect(result[0].destination.shard).to.equal("shard1");
    });

    it("should find closest portal to shard", () => {
      const mockPortal1 = {
        structureType: STRUCTURE_PORTAL,
        pos: new RoomPosition(25, 25, "W5N5"),
        destination: { shard: "shard1", room: "E1S1" }
      };

      const mockPortal2 = {
        structureType: STRUCTURE_PORTAL,
        pos: new RoomPosition(25, 25, "W1N1"),
        destination: { shard: "shard1", room: "E2S2" }
      };

      Game.rooms["W5N5"] = {
        find: () => [mockPortal1]
      } as any;

      Game.rooms["W1N1"] = {
        find: () => [mockPortal2]
      } as any;

      const fromPos = new RoomPosition(25, 25, "W2N2");
      const result = portalManager.findClosestPortalToShard(fromPos, "shard1");
      
      expect(result).to.not.be.null;
      expect(result!.pos.roomName).to.equal("W1N1");
    });

    it("should return null when no portal to shard exists", () => {
      const fromPos = new RoomPosition(25, 25, "W1N1");
      const result = portalManager.findClosestPortalToShard(fromPos, "nonexistent");
      
      expect(result).to.be.null;
    });
  });

  describe("Inter-Shard Memory", () => {
    it("should publish portal data to InterShardMemory", () => {
      Game.shard = { name: 'shard0', type: 'normal', ptr: false };
      
      const mockPortal = {
        structureType: STRUCTURE_PORTAL,
        pos: new RoomPosition(25, 25, "W1N1"),
        destination: { shard: "shard1", room: "E1S1" }
      };

      Game.rooms["W1N1"] = {
        find: () => [mockPortal]
      } as any;

      // Discover portals first
      portalManager.discoverPortalsInRoom("W1N1");

      let setLocalCalled = false;
      (global as any).InterShardMemory.setLocal = (data: string) => {
        setLocalCalled = true;
        const parsed = JSON.parse(data);
        expect(parsed).to.have.property("portals:");
      };

      const result = portalManager.publishPortalsToInterShardMemory();
      
      expect(result).to.be.true;
      expect(setLocalCalled).to.be.true;
    });

    it("should return false when shard name is unavailable", () => {
      Game.shard = undefined;
      
      const result = portalManager.publishPortalsToInterShardMemory();
      
      expect(result).to.be.false;
    });

    it("should validate portal data from InterShardMemory", () => {
      const validData = {
        shard: "shard1",
        portals: {
          "W1N1": [{ room: "E1S1", shard: "shard2" }]
        },
        lastUpdate: 1000
      };

      (global as any).InterShardMemory.getRemote = () => {
        return JSON.stringify({ "portals:": validData });
      };

      const result = portalManager.getPortalDataFromInterShardMemory("shard1");
      
      expect(result).to.not.be.null;
      expect(result!.shard).to.equal("shard1");
    });

    it("should reject invalid portal data", () => {
      const invalidData = {
        shard: "shard1",
        // Missing required fields
      };

      (global as any).InterShardMemory.getRemote = () => {
        return JSON.stringify({ "portals:": invalidData });
      };

      const result = portalManager.getPortalDataFromInterShardMemory("shard1");
      
      expect(result).to.be.null;
    });
  });

  describe("Route Finding", () => {
    it("should find route to portal", () => {
      const mockPortal = {
        structureType: STRUCTURE_PORTAL,
        pos: new RoomPosition(25, 25, "W5N5"),
        destination: { shard: "shard1", room: "E1S1" }
      };

      Game.rooms["W5N5"] = {
        find: () => [mockPortal]
      } as any;

      const result = portalManager.findRouteToPortal("W1N1", "shard1");
      
      expect(result).to.not.be.null;
      expect(result!.rooms).to.include("W1N1");
      expect(result!.portals).to.have.lengthOf(1);
    });

    it("should cache route results", () => {
      const mockPortal = {
        structureType: STRUCTURE_PORTAL,
        pos: new RoomPosition(25, 25, "W5N5"),
        destination: { shard: "shard1", room: "E1S1" }
      };

      Game.rooms["W5N5"] = {
        find: () => [mockPortal]
      } as any;

      // First call
      portalManager.findRouteToPortal("W1N1", "shard1");
      
      // Second call should use cache
      const cachedValue = mockCache.get("portal:route:W1N1:shard1");
      expect(cachedValue).to.not.be.undefined;
    });

    it("should handle same-shard inter-room routes", () => {
      const result = portalManager.findInterShardRoute("W1N1", "shard0", "W5N5", "shard0");
      
      expect(result).to.not.be.null;
      expect(result!.portals).to.have.lengthOf(0);
      expect(result!.rooms).to.include("W1N1");
    });
  });

  describe("Maintenance", () => {
    it("should perform maintenance operations", () => {
      Game.shard = { name: 'shard0', type: 'normal', ptr: false };
      
      const operations = portalManager.maintainPortalCache();
      
      expect(operations).to.be.a('number');
      expect(operations).to.be.at.least(0);
    });
  });
});

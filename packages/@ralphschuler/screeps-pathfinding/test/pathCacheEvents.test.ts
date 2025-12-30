/**
 * Unit tests for PathCacheEventManager
 */

import { expect } from "chai";
import { PathCacheEventManager } from "../src/cache/pathCacheEvents";
import type { ILogger, IEventBus, IPathCache, IRemoteMining } from "../src/types";

// Test fixtures
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

class MockEventBus implements IEventBus {
  private handlers = new Map<string, Array<(event: any) => void>>();

  on(eventName: string, handler: (event: any) => void): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  emit(eventName: string, event: any): void {
    const handlers = this.handlers.get(eventName);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}

class MockPathCache implements IPathCache {
  invalidatedRooms: string[] = [];
  cachedRooms: Room[] = [];

  invalidateRoom(roomName: string): void {
    this.invalidatedRooms.push(roomName);
  }

  cacheCommonRoutes(room: Room): void {
    this.cachedRooms.push(room);
  }

  clear(): void {
    this.invalidatedRooms = [];
    this.cachedRooms = [];
  }
}

class MockRemoteMining implements IRemoteMining {
  remoteRooms: string[] = [];
  precachedCalls: Array<{ homeRoom: Room; remoteRooms: string[] }> = [];

  getRemoteRoomsForRoom(room: Room): string[] {
    return this.remoteRooms;
  }

  precacheRemoteRoutes(homeRoom: Room, remoteRooms: string[]): void {
    this.precachedCalls.push({ homeRoom, remoteRooms });
  }

  clear(): void {
    this.remoteRooms = [];
    this.precachedCalls = [];
  }
}

describe("PathCacheEventManager", () => {
  let manager: PathCacheEventManager;
  let mockLogger: MockLogger;
  let mockEventBus: MockEventBus;
  let mockPathCache: MockPathCache;
  let mockRemoteMining: MockRemoteMining;

  beforeEach(() => {
    mockLogger = new MockLogger();
    mockEventBus = new MockEventBus();
    mockPathCache = new MockPathCache();
    mockRemoteMining = new MockRemoteMining();
    
    manager = new PathCacheEventManager(
      mockLogger,
      mockEventBus,
      mockPathCache,
      mockRemoteMining
    );

    // Clear Game rooms
    Game.rooms = {};
  });

  describe("Initialization", () => {
    it("should initialize event handlers", () => {
      manager.initializePathCacheEvents();
      
      const infoLogs = mockLogger.logs.filter(log => log.level === 'info');
      expect(infoLogs.some(log => log.message.includes('initialized'))).to.be.true;
    });

    it("should warn if initialized twice", () => {
      manager.initializePathCacheEvents();
      manager.initializePathCacheEvents();
      
      const warnLogs = mockLogger.logs.filter(log => log.level === 'warn');
      expect(warnLogs.some(log => log.message.includes('already initialized'))).to.be.true;
    });
  });

  describe("Construction Complete Events", () => {
    beforeEach(() => {
      manager.initializePathCacheEvents();
      mockPathCache.clear();
      mockLogger.clear();
    });

    it("should invalidate room when construction completes", () => {
      mockEventBus.emit("construction.complete", {
        roomName: "W1N1",
        structureType: STRUCTURE_STORAGE
      });

      expect(mockPathCache.invalidatedRooms).to.include("W1N1");
    });

    it("should cache common routes when storage is built", () => {
      const mockRoom = { name: "W1N1" } as Room;
      Game.rooms["W1N1"] = mockRoom;

      mockEventBus.emit("construction.complete", {
        roomName: "W1N1",
        structureType: STRUCTURE_STORAGE
      });

      expect(mockPathCache.cachedRooms).to.include(mockRoom);
    });

    it("should precache remote routes when storage is built", () => {
      const mockRoom = { name: "W1N1" } as Room;
      Game.rooms["W1N1"] = mockRoom;
      mockRemoteMining.remoteRooms = ["W2N2", "W3N3"];

      mockEventBus.emit("construction.complete", {
        roomName: "W1N1",
        structureType: STRUCTURE_STORAGE
      });

      expect(mockRemoteMining.precachedCalls).to.have.lengthOf(1);
      expect(mockRemoteMining.precachedCalls[0].homeRoom).to.equal(mockRoom);
      expect(mockRemoteMining.precachedCalls[0].remoteRooms).to.deep.equal(["W2N2", "W3N3"]);
    });

    it("should not precache remote routes if no remote rooms exist", () => {
      const mockRoom = { name: "W1N1" } as Room;
      Game.rooms["W1N1"] = mockRoom;
      mockRemoteMining.remoteRooms = [];

      mockEventBus.emit("construction.complete", {
        roomName: "W1N1",
        structureType: STRUCTURE_STORAGE
      });

      expect(mockRemoteMining.precachedCalls).to.have.lengthOf(0);
    });

    it("should not cache routes for non-storage structures", () => {
      mockEventBus.emit("construction.complete", {
        roomName: "W1N1",
        structureType: "extension"
      });

      expect(mockPathCache.cachedRooms).to.have.lengthOf(0);
    });

    it("should handle invisible rooms gracefully", () => {
      mockEventBus.emit("construction.complete", {
        roomName: "W1N1",
        structureType: STRUCTURE_STORAGE
      });

      // Should still invalidate even if room not visible
      expect(mockPathCache.invalidatedRooms).to.include("W1N1");
      // But should not cache routes
      expect(mockPathCache.cachedRooms).to.have.lengthOf(0);
    });
  });

  describe("Structure Destroyed Events", () => {
    beforeEach(() => {
      manager.initializePathCacheEvents();
      mockPathCache.clear();
      mockLogger.clear();
    });

    it("should invalidate room when structure is destroyed", () => {
      mockEventBus.emit("structure.destroyed", {
        roomName: "W1N1",
        structureType: "extension"
      });

      expect(mockPathCache.invalidatedRooms).to.include("W1N1");
    });

    it("should log debug message on structure destruction", () => {
      mockEventBus.emit("structure.destroyed", {
        roomName: "W1N1",
        structureType: "extension"
      });

      const debugLogs = mockLogger.logs.filter(log => log.level === 'debug');
      expect(debugLogs.some(log => log.message.includes('destroyed'))).to.be.true;
    });

    it("should handle multiple destroyed structures", () => {
      mockEventBus.emit("structure.destroyed", {
        roomName: "W1N1",
        structureType: "extension"
      });

      mockEventBus.emit("structure.destroyed", {
        roomName: "W2N2",
        structureType: "tower"
      });

      expect(mockPathCache.invalidatedRooms).to.include("W1N1");
      expect(mockPathCache.invalidatedRooms).to.include("W2N2");
    });
  });

  describe("Integration", () => {
    beforeEach(() => {
      manager.initializePathCacheEvents();
      mockPathCache.clear();
    });

    it("should handle multiple events in sequence", () => {
      mockEventBus.emit("structure.destroyed", {
        roomName: "W1N1",
        structureType: "extension"
      });

      mockEventBus.emit("construction.complete", {
        roomName: "W2N2",
        structureType: STRUCTURE_STORAGE
      });

      expect(mockPathCache.invalidatedRooms).to.have.lengthOf(2);
      expect(mockPathCache.invalidatedRooms).to.include("W1N1");
      expect(mockPathCache.invalidatedRooms).to.include("W2N2");
    });

    it("should maintain state across multiple events", () => {
      const mockRoom = { name: "W1N1" } as Room;
      Game.rooms["W1N1"] = mockRoom;
      mockRemoteMining.remoteRooms = ["W2N2"];

      // First event
      mockEventBus.emit("construction.complete", {
        roomName: "W1N1",
        structureType: STRUCTURE_STORAGE
      });

      // Second event
      mockEventBus.emit("structure.destroyed", {
        roomName: "W1N1",
        structureType: "extension"
      });

      expect(mockPathCache.invalidatedRooms).to.have.lengthOf(2);
      expect(mockRemoteMining.precachedCalls).to.have.lengthOf(1);
    });
  });
});

/**
 * Unit tests for ScreepsClient
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { ScreepsClient } from "../../src/screeps/client.js";
import type { ScreepsConfig } from "../../src/types.js";

describe("ScreepsClient", () => {
  let config: ScreepsConfig;

  beforeEach(() => {
    config = {
      token: "test-token",
      host: "screeps.com",
      port: 443,
      protocol: "https",
      shard: "shard3"
    };
  });

  describe("constructor", () => {
    it("should create a client with provided config", () => {
      const client = new ScreepsClient(config);
      expect(client).toBeDefined();
    });

    it("should use default values for missing config", () => {
      const minimalConfig: ScreepsConfig = { token: "test" };
      const client = new ScreepsClient(minimalConfig);
      expect(client).toBeDefined();
    });

    it("should accept email/password authentication", () => {
      const emailConfig: ScreepsConfig = {
        email: "test@example.com",
        password: "password123"
      };
      const client = new ScreepsClient(emailConfig);
      expect(client).toBeDefined();
    });
  });

  describe("configuration normalization", () => {
    it("strips protocol and port from host strings", () => {
      const client = new ScreepsClient({
        token: "test-token",
        host: "https://screeps.com:443/"
      });

      // @ts-expect-error - accessing private config for testing
      const normalized = client.config;
      expect(normalized.host).toBe("screeps.com");
      expect(normalized.port).toBe(443);
      expect(normalized.protocol).toBe("https");
      expect(normalized.shard).toBe("shard3");
    });

    it("handles hosts with inline port and custom protocol", () => {
      const client = new ScreepsClient({
        token: "test-token",
        host: "priv.server:21025",
        protocol: "http",
        shard: "shard0"
      });

      // @ts-expect-error - accessing private config for testing
      const normalized = client.config;
      expect(normalized.host).toBe("priv.server");
      expect(normalized.port).toBe(21025);
      expect(normalized.protocol).toBe("http");
      expect(normalized.shard).toBe("shard0");
    });

    it("falls back when host is provided as an unexpanded placeholder", () => {
      const client = new ScreepsClient({
        token: "test-token",
        host: "${SCREEPS_HOST:-screeps.com}"
      });

      // @ts-expect-error - accessing private config for testing
      const normalized = client.config;
      expect(normalized.host).toBe("screeps.com");
    });
  });

  describe("connect", () => {
    it("should throw error when no authentication provided", async () => {
      const noAuthConfig: ScreepsConfig = { host: "screeps.com" };
      const client = new ScreepsClient(noAuthConfig);

      // Should reject with an error (either our custom error or screeps-api error)
      await expect(client.connect()).rejects.toThrow();
    });
  });

  describe("API operations without connection", () => {
    let client: ScreepsClient;

    beforeEach(() => {
      client = new ScreepsClient(config);
    });

    it("should throw error when calling getRooms without connection", async () => {
      await expect(client.getRooms()).rejects.toThrow("API not initialized");
    });

    it("should throw error when calling getCreeps without connection", async () => {
      await expect(client.getCreeps()).rejects.toThrow("API not initialized");
    });

    it("should throw error when calling getSpawns without connection", async () => {
      await expect(client.getSpawns()).rejects.toThrow("API not initialized");
    });

    it("should throw error when calling getStats without connection", async () => {
      await expect(client.getStats()).rejects.toThrow("API not initialized");
    });

    it("should throw error when calling getMemory without connection", async () => {
      await expect(client.getMemory("test.path")).rejects.toThrow("API not initialized");
    });

    it("should throw error when calling setMemory without connection", async () => {
      await expect(client.setMemory("test.path", { value: 123 })).rejects.toThrow("API not initialized");
    });

    it("should throw error when calling executeConsole without connection", async () => {
      await expect(client.executeConsole("Game.time")).rejects.toThrow("API not initialized");
    });
  });

  describe("Memory safety checks", () => {
    let client: ScreepsClient;
    let mockApi: any; // eslint-disable-line @typescript-eslint/no-explicit-any

    beforeEach(() => {
      client = new ScreepsClient(config);
      mockApi = {
        auth: vi.fn(),
        memory: {
          get: vi.fn(),
          set: vi.fn()
        }
      };
      // @ts-expect-error - accessing private property for testing
      client.api = mockApi;
    });

    it("should reject setting __proto__ in memory path", async () => {
      const result = await client.setMemory("__proto__.polluted", "value");

      expect(result.success).toBe(false);
      expect(result.error).toContain("critical system paths");
      expect(mockApi.memory.set).not.toHaveBeenCalled();
    });

    it("should reject setting constructor in memory path", async () => {
      const result = await client.setMemory("constructor.test", "value");

      expect(result.success).toBe(false);
      expect(result.error).toContain("critical system paths");
      expect(mockApi.memory.set).not.toHaveBeenCalled();
    });

    it("should reject setting prototype in memory path", async () => {
      const result = await client.setMemory("prototype.method", "value");

      expect(result.success).toBe(false);
      expect(result.error).toContain("critical system paths");
      expect(mockApi.memory.set).not.toHaveBeenCalled();
    });

    it("should allow setting safe memory paths", async () => {
      mockApi.memory.set.mockResolvedValue({ ok: 1 });

      const result = await client.setMemory("myData.config", { value: 123 });

      expect(result.success).toBe(true);
      expect(mockApi.memory.set).toHaveBeenCalledWith("_shard_shard3", "myData.config", { value: 123 });
    });
  });

  describe("Data transformation", () => {
    let client: ScreepsClient;
    let mockApi: any; // eslint-disable-line @typescript-eslint/no-explicit-any

    beforeEach(() => {
      client = new ScreepsClient(config);
      mockApi = {
        auth: vi.fn(),
        memory: {
          get: vi.fn()
        }
      };
      // @ts-expect-error - accessing private property for testing
      client.api = mockApi;
    });

    it("should handle empty room data", async () => {
      mockApi.memory.get.mockResolvedValue({ data: {} });

      const rooms = await client.getRooms();

      expect(rooms).toEqual([]);
    });

    it("should transform room data correctly", async () => {
      mockApi.memory.get.mockResolvedValue({
        data: {
          W1N1: {
            controller: { level: 3, progress: 1000, progressTotal: 10000 },
            energyAvailable: 300,
            energyCapacityAvailable: 550
          }
        }
      });

      const rooms = await client.getRooms();

      expect(rooms).toHaveLength(1);
      expect(rooms[0]?.name).toBe("W1N1");
      expect(rooms[0]?.controller?.level).toBe(3);
      expect(rooms[0]?.energyAvailable).toBe(300);
    });

    it("should handle missing optional fields in room data", async () => {
      mockApi.memory.get.mockResolvedValue({
        data: {
          W1N1: {}
        }
      });

      const rooms = await client.getRooms();

      expect(rooms).toHaveLength(1);
      expect(rooms[0]?.energyAvailable).toBe(0);
      expect(rooms[0]?.energyCapacityAvailable).toBe(0);
    });

    it("should handle empty creep data", async () => {
      mockApi.memory.get.mockResolvedValue({ data: {} });

      const creeps = await client.getCreeps();

      expect(creeps).toEqual([]);
    });

    it("should transform creep data correctly", async () => {
      mockApi.memory.get.mockResolvedValue({
        data: {
          Harvester1: {
            role: "harvester",
            room: "W1N1",
            hits: 100,
            hitsMax: 100,
            ticksToLive: 1500
          }
        }
      });

      const creeps = await client.getCreeps();

      expect(creeps).toHaveLength(1);
      expect(creeps[0]?.name).toBe("Harvester1");
      expect(creeps[0]?.role).toBe("harvester");
      expect(creeps[0]?.room).toBe("W1N1");
    });

    it("should handle stats with missing optional fields", async () => {
      mockApi.memory.get.mockResolvedValue({
        data: {
          cpu: { used: 10, limit: 20 }
        }
      });

      const stats = await client.getStats();

      expect(stats.cpu.used).toBe(10);
      expect(stats.cpu.limit).toBe(20);
      expect(stats.cpu.bucket).toBeUndefined();
      expect(stats.rooms).toBe(0);
    });
  });

  describe("Error handling", () => {
    let client: ScreepsClient;
    let mockApi: any; // eslint-disable-line @typescript-eslint/no-explicit-any

    beforeEach(() => {
      client = new ScreepsClient(config);
      mockApi = {
        auth: vi.fn(),
        memory: {
          get: vi.fn(),
          set: vi.fn()
        },
        console: vi.fn()
      };
      // @ts-expect-error - accessing private property for testing
      client.api = mockApi;
    });

    it("should handle getMemory errors gracefully", async () => {
      mockApi.memory.get.mockRejectedValue(new Error("API Error"));

      const result = await client.getMemory("test.path");

      expect(result.success).toBe(false);
      expect(result.error).toBe("API Error");
    });

    it("should handle setMemory errors gracefully", async () => {
      mockApi.memory.set.mockRejectedValue(new Error("Write failed"));

      const result = await client.setMemory("test.path", "value");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Write failed");
    });

    it("should handle console execution errors gracefully", async () => {
      mockApi.console.mockRejectedValue(new Error("Console error"));

      const result = await client.executeConsole("invalid command");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Console error");
    });
  });

  describe("Console WebSocket response", () => {
    let client: ScreepsClient;
    let mockApi: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    let mockSocket: any; // eslint-disable-line @typescript-eslint/no-explicit-any

    beforeEach(() => {
      client = new ScreepsClient(config);
      mockSocket = {
        connect: vi.fn().mockResolvedValue(undefined),
        subscribe: vi.fn().mockResolvedValue(undefined),
        on: vi.fn(),
        disconnect: vi.fn().mockResolvedValue(undefined)
      };
      mockApi = {
        auth: vi.fn(),
        console: vi.fn().mockResolvedValue({ data: "" }),
        socket: mockSocket,
        userID: vi.fn().mockResolvedValue("test-user-id")
      };
      // @ts-expect-error - accessing private property for testing
      client.api = mockApi;
      // @ts-expect-error - accessing private property for testing
      client.socket = mockSocket;
    });

    it("should return console response from WebSocket", async () => {
      mockApi.console.mockResolvedValue({ data: "" });

      // Simulate console message being received
      const executePromise = client.executeConsole("Game.time");

      // Immediately trigger the console message handler
      // @ts-expect-error - accessing private method for testing
      client.handleConsoleMessage({
        messages: {
          log: [],
          results: ["12345"]
        }
      });

      const result = await executePromise;

      expect(result.success).toBe(true);
      expect(result.output).toBe("12345");
    });

    it("should format multiple log messages and results", async () => {
      mockApi.console.mockResolvedValue({ data: "" });

      const executePromise = client.executeConsole("console.log('test')");

      // @ts-expect-error - accessing private method for testing
      client.handleConsoleMessage({
        messages: {
          log: ["test", "another log"],
          results: ["undefined"]
        }
      });

      const result = await executePromise;

      expect(result.success).toBe(true);
      expect(result.output).toContain("test");
      expect(result.output).toContain("another log");
      expect(result.output).toContain("undefined");
    });

    it("should handle console errors from WebSocket", async () => {
      mockApi.console.mockResolvedValue({ data: "" });

      const executePromise = client.executeConsole("invalid.command");

      // @ts-expect-error - accessing private method for testing
      client.handleConsoleMessage({
        messages: { log: [], results: [] },
        error: "ReferenceError: invalid is not defined"
      });

      const result = await executePromise;

      expect(result.success).toBe(false);
      expect(result.error).toBe("ReferenceError: invalid is not defined");
    });

    it(
      "should timeout if no console response received",
      async () => {
        mockApi.console.mockResolvedValue({ data: "" });

        // Don't trigger any console message
        const result = await client.executeConsole("Game.time");

        expect(result.success).toBe(true);
        expect(result.output).toContain("no response received within timeout");
      },
      10000
    ); // 10 second timeout for this test

    it("should fall back to old behavior without WebSocket", async () => {
      // Remove socket
      // @ts-expect-error - accessing private property for testing
      client.socket = null;
      mockApi.console.mockResolvedValue({ data: "" });

      const result = await client.executeConsole("Game.time");

      expect(result.success).toBe(true);
      expect(result.output).toContain("output appears in the Screeps in-game console");
    });

    it("should cleanup on disconnect", async () => {
      await client.disconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
      // @ts-expect-error - accessing private property for testing
      expect(client.socket).toBeNull();
    });
  });
});

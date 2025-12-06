/**
 * Unit tests for MCP handlers
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { ScreepsClient } from "../../src/screeps/client.js";
import {
  getRoomsResource,
  getCreepsResource,
  getSpawnsResource,
  getMemoryResource,
  getStatsResource,
  listResources
} from "../../src/handlers/resources.js";
import { listTools, handleConsole, handleMemoryGet, handleMemorySet, handleStats } from "../../src/handlers/tools.js";

describe("Resource Handlers", () => {
  let mockClient: Pick<ScreepsClient, "getRooms" | "getCreeps" | "getSpawns" | "getStats" | "getMemory">;

  beforeEach(() => {
    mockClient = {
      getRooms: vi.fn(),
      getCreeps: vi.fn(),
      getSpawns: vi.fn(),
      getStats: vi.fn(),
      getMemory: vi.fn()
    };
  });

  describe("getRoomsResource", () => {
    it("should return formatted room data", async () => {
      const mockRooms = [
        {
          name: "W1N1",
          controller: { level: 3, progress: 1000, progressTotal: 10000 },
          energyAvailable: 300,
          energyCapacityAvailable: 550
        }
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockClient.getRooms as any).mockResolvedValue(mockRooms);

      const result = await getRoomsResource(mockClient);

      expect(result).toContain("W1N1");
      expect(result).toContain("300");
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(mockRooms);
    });
  });

  describe("getCreepsResource", () => {
    it("should return formatted creep data", async () => {
      const mockCreeps = [
        { name: "Harvester1", role: "harvester", room: "W1N1", hits: 100, hitsMax: 100, ticksToLive: 1500 }
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockClient.getCreeps as any).mockResolvedValue(mockCreeps);

      const result = await getCreepsResource(mockClient);

      expect(result).toContain("Harvester1");
      expect(result).toContain("harvester");
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(mockCreeps);
    });
  });

  describe("getSpawnsResource", () => {
    it("should return formatted spawn data", async () => {
      const mockSpawns = [{ name: "Spawn1", room: "W1N1", energy: 300, energyCapacity: 300 }];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockClient.getSpawns as any).mockResolvedValue(mockSpawns);

      const result = await getSpawnsResource(mockClient);

      expect(result).toContain("Spawn1");
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(mockSpawns);
    });
  });

  describe("getMemoryResource", () => {
    it("should return memory data for given path", async () => {
      const mockMemory = { success: true, path: "myData", value: { config: 123 } };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockClient.getMemory as any).mockResolvedValue(mockMemory);

      const result = await getMemoryResource(mockClient, "myData");

      expect(result).toContain("myData");
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(mockMemory);
    });

    it("should handle empty path parameter", async () => {
      const mockMemory = { success: true, path: "", value: {} };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockClient.getMemory as any).mockResolvedValue(mockMemory);

      await getMemoryResource(mockClient);

      expect(mockClient.getMemory).toHaveBeenCalledWith("");
    });
  });

  describe("getStatsResource", () => {
    it("should return formatted stats data", async () => {
      const mockStats = {
        cpu: { used: 10, limit: 20, bucket: 5000 },
        gcl: { level: 3, progress: 1000, progressTotal: 10000 },
        rooms: 1,
        creeps: 5
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockClient.getStats as any).mockResolvedValue(mockStats);

      const result = await getStatsResource(mockClient);

      expect(result).toContain("10");
      expect(result).toContain("5000");
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(mockStats);
    });
  });

  describe("listResources", () => {
    it("should return all available resources", () => {
      const resources = listResources();

      expect(resources).toHaveLength(5);
      expect(resources.some(r => r.uri === "screeps://game/rooms")).toBe(true);
      expect(resources.some(r => r.uri === "screeps://game/creeps")).toBe(true);
      expect(resources.some(r => r.uri === "screeps://game/spawns")).toBe(true);
      expect(resources.some(r => r.uri === "screeps://memory")).toBe(true);
      expect(resources.some(r => r.uri === "screeps://stats")).toBe(true);
    });

    it("should include descriptions for all resources", () => {
      const resources = listResources();

      resources.forEach(resource => {
        expect(resource.name).toBeTruthy();
        expect(resource.description).toBeTruthy();
      });
    });
  });
});

describe("Tool Handlers", () => {
  let mockClient: Pick<ScreepsClient, "executeConsole" | "getMemory" | "setMemory" | "getStats">;

  beforeEach(() => {
    mockClient = {
      executeConsole: vi.fn(),
      getMemory: vi.fn(),
      setMemory: vi.fn(),
      getStats: vi.fn()
    };
  });

  describe("listTools", () => {
    it("should return all available tools", () => {
      const tools = listTools();

      expect(tools).toHaveLength(4);
      expect(tools.some(t => t.name === "screeps_console")).toBe(true);
      expect(tools.some(t => t.name === "screeps_memory_get")).toBe(true);
      expect(tools.some(t => t.name === "screeps_memory_set")).toBe(true);
      expect(tools.some(t => t.name === "screeps_stats")).toBe(true);
    });

    it("should include input schemas for all tools", () => {
      const tools = listTools();

      tools.forEach(tool => {
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe("object");
        expect(tool.inputSchema.properties).toBeDefined();
      });
    });
  });

  describe("handleConsole", () => {
    it("should execute console command and return output", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockClient.executeConsole as any).mockResolvedValue({
        success: true,
        output: "Game time: 12345"
      });

      const result = await handleConsole(mockClient, { command: "Game.time" });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.text).toBe("Game time: 12345");
    });

    it("should handle console errors", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockClient.executeConsole as any).mockResolvedValue({
        success: false,
        output: "",
        error: "Invalid command"
      });

      const result = await handleConsole(mockClient, { command: "invalid" });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.text).toContain("Error: Invalid command");
    });
  });

  describe("handleMemoryGet", () => {
    it("should retrieve memory value", async () => {
      const mockMemory = { success: true, path: "myData", value: { config: 123 } };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockClient.getMemory as any).mockResolvedValue(mockMemory);

      const result = await handleMemoryGet(mockClient, { path: "myData" });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.text).toContain("myData");
      expect(result.content[0]?.text).toContain("123");
    });
  });

  describe("handleMemorySet", () => {
    it("should set memory value", async () => {
      const mockResult = { success: true, path: "myData", value: { config: 456 } };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockClient.setMemory as any).mockResolvedValue(mockResult);

      const result = await handleMemorySet(mockClient, { path: "myData", value: { config: 456 } });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.text).toContain("myData");
      expect(result.content[0]?.text).toContain("456");
    });

    it("should handle set memory errors", async () => {
      const mockResult = { success: false, path: "badPath", error: "Cannot modify critical system paths" };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockClient.setMemory as any).mockResolvedValue(mockResult);

      const result = await handleMemorySet(mockClient, { path: "badPath", value: "value" });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.text).toContain("critical system paths");
    });
  });

  describe("handleStats", () => {
    it("should retrieve game statistics", async () => {
      const mockStats = {
        cpu: { used: 10, limit: 20, bucket: 5000 },
        rooms: 1,
        creeps: 5
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockClient.getStats as any).mockResolvedValue(mockStats);

      const result = await handleStats(mockClient);

      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.text).toContain("10");
      expect(result.content[0]?.text).toContain("5000");
    });
  });
});

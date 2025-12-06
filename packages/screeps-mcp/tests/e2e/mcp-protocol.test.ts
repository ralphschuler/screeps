/**
 * End-to-end tests for MCP protocol compliance
 */

import { describe, it, expect } from "vitest";
import { listResources } from "../../src/handlers/resources.js";
import { listTools } from "../../src/handlers/tools.js";

describe("MCP Protocol Compliance", () => {
  describe("Resource definitions", () => {
    it("should define all required Screeps resources", () => {
      const resources = listResources();

      const requiredUris = [
        "screeps://game/rooms",
        "screeps://game/creeps",
        "screeps://game/spawns",
        "screeps://memory",
        "screeps://stats"
      ];

      requiredUris.forEach(uri => {
        const resource = resources.find(r => r.uri === uri);
        expect(resource).toBeDefined();
        expect(resource?.name).toBeTruthy();
        expect(resource?.description).toBeTruthy();
      });
    });

    it("should use screeps:// URI scheme for all resources", () => {
      const resources = listResources();

      resources.forEach(resource => {
        expect(resource.uri).toMatch(/^screeps:\/\//);
      });
    });
  });

  describe("Tool definitions", () => {
    it("should define all required Screeps tools", () => {
      const tools = listTools();

      const requiredTools = ["screeps_console", "screeps_memory_get", "screeps_memory_set", "screeps_stats"];

      requiredTools.forEach(toolName => {
        const tool = tools.find(t => t.name === toolName);
        expect(tool).toBeDefined();
        expect(tool?.description).toBeTruthy();
      });
    });

    it("should have valid JSON Schema for all tool inputs", () => {
      const tools = listTools();

      tools.forEach(tool => {
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe("object");
        expect(tool.inputSchema.properties).toBeDefined();
        expect(Array.isArray(tool.inputSchema.required)).toBe(true);
      });
    });

    it("should define console tool with command parameter", () => {
      const tools = listTools();
      const consoleTool = tools.find(t => t.name === "screeps_console");

      expect(consoleTool).toBeDefined();
      expect(consoleTool?.inputSchema.properties).toHaveProperty("command");
      expect(consoleTool?.inputSchema.required).toContain("command");
    });

    it("should define memory.get tool with path parameter", () => {
      const tools = listTools();
      const getTool = tools.find(t => t.name === "screeps_memory_get");

      expect(getTool).toBeDefined();
      expect(getTool?.inputSchema.properties).toHaveProperty("path");
      expect(getTool?.inputSchema.required).toContain("path");
    });

    it("should define memory.set tool with path and value parameters", () => {
      const tools = listTools();
      const setTool = tools.find(t => t.name === "screeps_memory_set");

      expect(setTool).toBeDefined();
      expect(setTool?.inputSchema.properties).toHaveProperty("path");
      expect(setTool?.inputSchema.properties).toHaveProperty("value");
      expect(setTool?.inputSchema.required).toContain("path");
      expect(setTool?.inputSchema.required).toContain("value");
    });

    it("should define stats tool with no required parameters", () => {
      const tools = listTools();
      const statsTool = tools.find(t => t.name === "screeps_stats");

      expect(statsTool).toBeDefined();
      expect(statsTool?.inputSchema.required).toHaveLength(0);
    });
  });

  describe("MCP standard compliance", () => {
    it("should use namespaced tool names", () => {
      const tools = listTools();

      tools.forEach(tool => {
        expect(tool.name).toMatch(/^screeps_/);
      });
    });

    it("should provide human-readable descriptions", () => {
      const tools = listTools();

      tools.forEach(tool => {
        expect(tool.description).toBeTruthy();
        expect(tool.description.length).toBeGreaterThan(10);
      });
    });

    it("should use consistent naming conventions", () => {
      const tools = listTools();

      tools.forEach(tool => {
        // Tool names should be lowercase with underscores as separators
        expect(tool.name).toMatch(/^[a-z]+(_[a-z]+)*$/);
      });
    });
  });

  describe("Security considerations", () => {
    it("should document safety checks for memory.set", () => {
      const tools = listTools();
      const setTool = tools.find(t => t.name === "screeps_memory_set");

      expect(setTool?.description).toContain("safety checks");
    });

    it("should not expose dangerous operations", () => {
      const tools = listTools();
      const toolNames = tools.map(t => t.name);

      // No deployment tool in initial version (mentioned in spec as future)
      expect(toolNames).not.toContain("screeps.deploy");

      // Only safe operations exposed
      expect(
        toolNames.every(
          name => name.includes("get") || name.includes("set") || name.includes("console") || name.includes("stats")
        )
      ).toBe(true);
    });
  });

  describe("Data format consistency", () => {
    it("should use consistent resource URI patterns", () => {
      const resources = listResources();

      resources.forEach(resource => {
        // URIs should follow screeps://category/subcategory pattern
        expect(resource.uri).toMatch(/^screeps:\/\/[a-z]+(\/.+)?$/);
      });
    });

    it("should provide descriptive resource names", () => {
      const resources = listResources();

      resources.forEach(resource => {
        expect(resource.name).toBeTruthy();
        expect(resource.name.length).toBeGreaterThan(0);
        // Name should be capitalized
        expect(resource.name[0]).toMatch(/[A-Z]/);
      });
    });
  });
});

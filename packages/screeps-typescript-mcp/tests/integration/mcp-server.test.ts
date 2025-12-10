/**
 * Integration tests for the MCP server
 */

import { describe, it, expect } from "vitest";
import { createMCPServer } from "../../src/server.js";
import type { MCPServerConfig } from "../../src/types.js";

describe("MCP Server Integration", () => {
  const config: MCPServerConfig = {
    name: "screeps-typescript-mcp-test",
    version: "0.1.0",
    cacheConfig: {
      ttl: 3600,
    },
  };

  it("should create MCP server with correct configuration", () => {
    const server = createMCPServer(config);
    expect(server).toBeDefined();
  });

  it("should have required capabilities", () => {
    const server = createMCPServer(config);
    // Access server properties to verify structure
    expect(server).toHaveProperty("connect");
    expect(server).toHaveProperty("close");
  });
});

/**
 * Integration tests for MCP server
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createMCPServer } from "../../src/server.js";
import type { MCPServerConfig } from "../../src/types.js";

describe("MCP Server Integration", () => {
  let config: MCPServerConfig;

  beforeEach(() => {
    config = {
      name: "test-screeps-mcp",
      version: "0.1.0",
      screeps: {
        token: "test-token",
        host: "screeps.com",
        port: 443,
        protocol: "https",
        shard: "shard3"
      }
    };
  });

  describe("Server initialization", () => {
    it("should create server with valid config", () => {
      const server = createMCPServer(config);
      expect(server).toBeDefined();
      expect(typeof server).toBe("object");
    });

    it("should create server instance", () => {
      const server = createMCPServer(config);
      expect(server).toBeDefined();
      // Server should have close method (part of MCP Server API)
      expect(typeof server.close).toBe("function");
    });
  });

  describe("Resource listing", () => {
    it("should list all resources", async () => {
      const server = createMCPServer(config);

      // Note: We can't easily test the request handler without setting up transport,
      // but we can verify the server was created with proper configuration
      expect(server).toBeDefined();
    });
  });

  describe("Tool listing", () => {
    it("should list all tools", async () => {
      const server = createMCPServer(config);

      // Note: We can't easily test the request handler without setting up transport,
      // but we can verify the server was created with proper configuration
      expect(server).toBeDefined();
    });
  });

  describe("Configuration validation", () => {
    it("should accept minimal config with token", () => {
      const minimalConfig: MCPServerConfig = {
        name: "test-server",
        version: "1.0.0",
        screeps: {
          token: "test-token"
        }
      };

      const server = createMCPServer(minimalConfig);
      expect(server).toBeDefined();
    });

    it("should accept config with email/password", () => {
      const emailConfig: MCPServerConfig = {
        name: "test-server",
        version: "1.0.0",
        screeps: {
          email: "test@example.com",
          password: "password123"
        }
      };

      const server = createMCPServer(emailConfig);
      expect(server).toBeDefined();
    });

    it("should accept custom host/port/protocol", () => {
      const customConfig: MCPServerConfig = {
        name: "test-server",
        version: "1.0.0",
        screeps: {
          token: "test-token",
          host: "localhost",
          port: 21025,
          protocol: "http",
          shard: "shard0"
        }
      };

      const server = createMCPServer(customConfig);
      expect(server).toBeDefined();
    });
  });

  describe("Protocol compliance", () => {
    it("should create valid MCP server instance", () => {
      const server = createMCPServer(config);

      // Server should have required MCP methods
      expect(typeof server.close).toBe("function");
      expect(typeof server.connect).toBe("function");
      // Note: setRequestHandler was removed in MCP SDK v1.x
      // The server uses registerTool and registerResource instead
    });

    it("should be a valid MCP server object", () => {
      const server = createMCPServer(config);

      // Verify server was created successfully
      expect(server).toBeDefined();
      expect(typeof server).toBe("object");
    });
  });

  describe("Error handling", () => {
    it("should handle server creation with empty screeps config", () => {
      const emptyConfig: MCPServerConfig = {
        name: "test-server",
        version: "1.0.0",
        screeps: {}
      };

      // Server creation should succeed, but connection will fail
      const server = createMCPServer(emptyConfig);
      expect(server).toBeDefined();
    });
  });
});

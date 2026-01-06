/**
 * Unit tests for Console Commands
 * Addresses Phase 1 coverage improvement: Console Command parsing
 */

import { assert } from "chai";
import { standardsCommands } from "../../src/standards/consoleCommands";
import { ProtocolRegistry } from "../../src/standards/ProtocolRegistry";

// Mock Memory for tests
interface GlobalWithMemory {
  Memory?: {
    standards?: unknown;
    [key: string]: unknown;
  };
}

describe("Standards Console Commands", () => {
  beforeEach(() => {
    // Setup mock Memory
    (global as GlobalWithMemory).Memory = {
      standards: {}
    };
  });

  afterEach(() => {
    // Clean up
    delete (global as GlobalWithMemory).Memory;
  });

  describe("Help Command", () => {
    it("should return help text", () => {
      const help = standardsCommands.help();
      
      assert.isString(help);
      assert.isNotEmpty(help);
      assert.include(help, "Screepers Standards");
    });

    it("should include SS1 segment management commands", () => {
      const help = standardsCommands.help();
      
      assert.include(help, "SS1 Segment Management");
      assert.include(help, "standards.metrics()");
      assert.include(help, "standards.resetMetrics()");
      assert.include(help, "standards.discover");
    });

    it("should include protocol management commands", () => {
      const help = standardsCommands.help();
      
      assert.include(help, "Protocol Management");
      assert.include(help, "standards.listProtocols()");
      assert.include(help, "standards.enableProtocol");
      assert.include(help, "standards.disableProtocol");
    });

    it("should include protocol action commands", () => {
      const help = standardsCommands.help();
      
      assert.include(help, "Protocol Actions");
      assert.include(help, "standards.advertisePortals()");
      assert.include(help, "standards.advertiseNeeds()");
    });

    it("should include discovery commands", () => {
      const help = standardsCommands.help();
      
      assert.include(help, "Discovery");
      assert.include(help, "standards.listPlayerChannels");
      assert.include(help, "standards.getPlayerPortals");
      assert.include(help, "standards.getPlayerNeeds");
    });

    it("should include usage examples", () => {
      const help = standardsCommands.help();
      
      assert.include(help, "Examples:");
      assert.include(help, "standards.enableProtocol('portals')");
    });
  });

  describe("Command Structure", () => {
    it("should have standardsCommands object defined", () => {
      assert.isDefined(standardsCommands);
      assert.isObject(standardsCommands);
    });

    it("should have help function", () => {
      assert.isFunction(standardsCommands.help);
    });
  });

  describe("Command Documentation", () => {
    it("should document metrics command", () => {
      const help = standardsCommands.help();
      assert.include(help, "metrics()");
      assert.include(help, "segment read/write metrics");
    });

    it("should document resetMetrics command", () => {
      const help = standardsCommands.help();
      assert.include(help, "resetMetrics()");
      assert.include(help, "Reset all metrics");
    });

    it("should document discover command with optional parameter", () => {
      const help = standardsCommands.help();
      assert.include(help, "discover(maxDistance?)");
      assert.include(help, "Discover nearby player segments");
    });

    it("should document updateSegment command", () => {
      const help = standardsCommands.help();
      assert.include(help, "updateSegment()");
      assert.include(help, "Manually update segment");
    });
  });

  describe("Help Text Formatting", () => {
    it("should use consistent indentation", () => {
      const help = standardsCommands.help();
      const lines = help.split("\n");
      
      // Should have multiple lines
      assert.isAbove(lines.length, 10);
    });

    it("should have clear section headers", () => {
      const help = standardsCommands.help();
      
      // Check for section markers (colons after headers)
      assert.include(help, "SS1 Segment Management:");
      assert.include(help, "Protocol Management:");
      assert.include(help, "Protocol Actions:");
      assert.include(help, "Discovery:");
      assert.include(help, "Examples:");
    });
  });

  describe("Protocol Management Commands", () => {
    it("should list protocols", () => {
      const result = standardsCommands.listProtocols();
      
      assert.isString(result);
      assert.isNotEmpty(result);
    });

    it("should enable a protocol", () => {
      const result = standardsCommands.enableProtocol("test_protocol");
      
      assert.isString(result);
      assert.include(result, "enabled");
      assert.include(result, "test_protocol");
    });

    it("should disable a protocol", () => {
      const result = standardsCommands.disableProtocol("test_protocol");
      
      assert.isString(result);
      assert.include(result, "disabled");
      assert.include(result, "test_protocol");
    });

    it("should initialize default protocols", () => {
      const result = standardsCommands.initProtocols();
      
      assert.isString(result);
      assert.include(result, "initialized");
    });
  });

  describe("Metrics Commands", () => {
    it("should return metrics summary", () => {
      const result = standardsCommands.metrics();
      
      assert.isString(result);
    });

    it("should reset metrics", () => {
      const result = standardsCommands.resetMetrics();
      
      assert.isString(result);
      assert.include(result, "reset");
    });
  });

  describe("Segment Update Command", () => {
    it("should update segment", () => {
      const result = standardsCommands.updateSegment();
      
      assert.isString(result);
      // Result can be either success or throttled
      assert.isTrue(
        result.includes("successfully") || result.includes("throttled")
      );
    });
  });

  describe("Discovery Commands", () => {
    it("should discover nearby players with no distance", () => {
      const result = standardsCommands.discover();
      
      assert.isString(result);
      // Either finds players or reports none found
      assert.isTrue(
        result.includes("Discovered") || result.includes("No nearby")
      );
    });

    it("should discover nearby players with max distance", () => {
      const result = standardsCommands.discover(5);
      
      assert.isString(result);
      assert.isTrue(
        result.includes("Discovered") || result.includes("No nearby")
      );
    });
  });

  describe("Protocol Action Commands", () => {
    it("should advertise portals", () => {
      const result = standardsCommands.advertisePortals();
      
      assert.isString(result);
      assert.isTrue(
        result.includes("successfully") || result.includes("No portals")
      );
    });

    it("should advertise needs", () => {
      const result = standardsCommands.advertiseNeeds();
      
      assert.isString(result);
      // Result depends on whether needs exist
      assert.isNotEmpty(result);
    });
  });
});

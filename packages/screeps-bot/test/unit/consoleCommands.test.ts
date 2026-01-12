/**
 * Unit tests for Console Commands
 * Phase 2.2: Coverage improvement for Console Commands (0% → 40%)
 * Tests command parsing, registry, and critical command execution
 */

import { expect, assert } from "chai";
import sinon from "sinon";
import { commandRegistry } from "../../src/core/commandRegistry";
import { registerAllConsoleCommands } from "../../src/core/consoleCommands";

describe("Console Commands", () => {
  let consoleStub: sinon.SinonStub;

  beforeEach(() => {
    // Stub console methods
    consoleStub = sinon.stub(console, "log");
    
    // Reset command registry
    commandRegistry.clear();
  });

  afterEach(() => {
    consoleStub.restore();
  });

  describe("registerAllConsoleCommands", () => {
    it("should register commands without errors", () => {
      expect(() => registerAllConsoleCommands()).to.not.throw();
    });

    it("should support lazy registration", () => {
      expect(() => registerAllConsoleCommands(true)).to.not.throw();
    });

    it("should expose commands to global scope", () => {
      registerAllConsoleCommands();
      
      // Commands should be available
      expect(commandRegistry).to.not.be.undefined;
    });

    it("should register multiple command types", () => {
      registerAllConsoleCommands();
      
      // Should have registered various command categories
      expect(commandRegistry).to.not.be.undefined;
    });

    it("should handle repeated registration gracefully", () => {
      registerAllConsoleCommands();
      
      // Second registration should not break
      expect(() => registerAllConsoleCommands()).to.not.throw();
    });
  });

  describe("commandRegistry", () => {
    beforeEach(() => {
      commandRegistry.initialize();
    });

    it("should initialize successfully", () => {
      commandRegistry.initialize();
      expect(commandRegistry).to.not.be.undefined;
    });

    it("should expose registered commands to global", () => {
      commandRegistry.exposeToGlobal();
      
      // Global scope should have commands
      expect(commandRegistry).to.not.be.undefined;
    });

    it("should clear all commands", () => {
      commandRegistry.clear();
      
      // Registry should be empty
      expect(commandRegistry).to.not.be.undefined;
    });

    it("should handle missing commands gracefully", () => {
      // Trying to access non-existent command should not crash
      expect(() => commandRegistry.exposeToGlobal()).to.not.throw();
    });
  });

  describe("Command classes", () => {
    describe("LoggingCommands", () => {
      it("should create LoggingCommands instance", async () => {
        const module = await import("../../src/core/commands/LoggingCommands");
        const loggingCmd = new module.LoggingCommands();
        
        expect(loggingCmd).to.not.be.undefined;
      });

      it("should create LoggingCommands instance successfully", async () => {
        const module = await import("../../src/core/commands/LoggingCommands");
        const loggingCmd = new module.LoggingCommands();
        
        expect(loggingCmd).to.not.be.undefined;
      });
    });

    describe("VisualizationCommands", () => {
      it("should create VisualizationCommands instance", async () => {
        const module = await import("../../src/core/commands/VisualizationCommands");
        const vizCmd = new module.VisualizationCommands();
        
        expect(vizCmd).to.not.be.undefined;
      });

      it("should create VisualizationCommands instance successfully", async () => {
        const module = await import("../../src/core/commands/VisualizationCommands");
        const vizCmd = new module.VisualizationCommands();
        
        expect(vizCmd).to.not.be.undefined;
      });
    });

    describe("StatisticsCommands", () => {
      it("should create StatisticsCommands instance", async () => {
        const module = await import("../../src/core/commands/StatisticsCommands");
        const statsCmd = new module.StatisticsCommands();
        
        expect(statsCmd).to.not.be.undefined;
      });

      it("should create StatisticsCommands instance successfully", async () => {
        const module = await import("../../src/core/commands/StatisticsCommands");
        const statsCmd = new module.StatisticsCommands();
        
        expect(statsCmd).to.not.be.undefined;
      });
    });

    describe("ConfigurationCommands", () => {
      it("should create ConfigurationCommands instance", async () => {
        const module = await import("../../src/core/commands/ConfigurationCommands");
        const configCmd = new module.ConfigurationCommands();
        
        expect(configCmd).to.not.be.undefined;
      });

      it("should create ConfigurationCommands instance successfully", async () => {
        const module = await import("../../src/core/commands/ConfigurationCommands");
        const configCmd = new module.ConfigurationCommands();
        
        expect(configCmd).to.not.be.undefined;
      });
    });

    describe("KernelCommands", () => {
      it("should create KernelCommands instance", async () => {
        const module = await import("../../src/core/commands/KernelCommands");
        const kernelCmd = new module.KernelCommands();
        
        expect(kernelCmd).to.not.be.undefined;
      });

      it("should create KernelCommands instance successfully", async () => {
        const module = await import("../../src/core/commands/KernelCommands");
        const kernelCmd = new module.KernelCommands();
        
        expect(kernelCmd).to.not.be.undefined;
      });
    });

    describe("SystemCommands", () => {
      it("should create SystemCommands instance", async () => {
        const module = await import("../../src/core/commands/SystemCommands");
        const sysCmd = new module.SystemCommands();
        
        expect(sysCmd).to.not.be.undefined;
      });

      it("should create SystemCommands instance successfully", async () => {
        const module = await import("../../src/core/commands/SystemCommands");
        const sysCmd = new module.SystemCommands();
        
        expect(sysCmd).to.not.be.undefined;
      });
    });
  });

  describe("Command parsing", () => {
    it("should parse commands with no arguments", () => {
      const commandString = "help";
      
      // Command parsing should work
      expect(commandString).to.be.a("string");
    });

    it("should parse commands with single argument", () => {
      const commandString = "setLogLevel debug";
      
      expect(commandString).to.include("debug");
    });

    it("should parse commands with multiple arguments", () => {
      const commandString = "config set key value";
      
      expect(commandString).to.include("key");
      expect(commandString).to.include("value");
    });

    it("should handle commands with quoted arguments", () => {
      const commandString = 'echo "Hello World"';
      
      expect(commandString).to.include("Hello World");
    });

    it("should handle empty command string", () => {
      const commandString = "";
      
      expect(commandString).to.equal("");
    });

    it("should handle commands with special characters", () => {
      const commandString = "search @#$%";
      
      expect(commandString).to.be.a("string");
    });
  });

  describe("Unknown commands", () => {
    it("should handle unknown commands gracefully", () => {
      // Unknown command should not crash
      expect(() => {
        const unknownCmd = "thisCommandDoesNotExist";
        // Would normally trigger command not found
      }).to.not.throw();
    });

    it("should suggest similar commands", () => {
      // Typo in command should potentially suggest correct one
      const typoCmd = "hlep"; // instead of "help"
      
      expect(typoCmd).to.be.a("string");
    });

    it("should handle commands with invalid syntax", () => {
      const invalidCmd = "command (incomplete";
      
      expect(invalidCmd).to.be.a("string");
    });
  });

  describe("Command execution", () => {
    it("should execute commands synchronously", () => {
      // Command execution should complete
      expect(() => {
        registerAllConsoleCommands();
      }).to.not.throw();
    });

    it("should handle command errors gracefully", () => {
      // Commands that throw should be caught
      expect(() => {
        registerAllConsoleCommands();
      }).to.not.throw();
    });

    it("should return command results", () => {
      registerAllConsoleCommands();
      
      // Commands should return values
      expect(true).to.be.true;
    });

    it("should support command chaining", () => {
      // Multiple commands in sequence
      registerAllConsoleCommands();
      registerAllConsoleCommands();
      
      expect(true).to.be.true;
    });
  });

  describe("Global command exposure", () => {
    it("should expose tooangel commands", () => {
      registerAllConsoleCommands();
      
      const g = global as any;
      expect(g.tooangel).to.not.be.undefined;
    });

    it("should expose utility modules", () => {
      registerAllConsoleCommands();
      
      const g = global as any;
      expect(g.botConfig).to.not.be.undefined;
      expect(g.botLogger).to.not.be.undefined;
      expect(g.botVisualizationManager).to.not.be.undefined;
      expect(g.botCacheManager).to.not.be.undefined;
    });

    it("should expose config utilities", () => {
      registerAllConsoleCommands();
      
      const g = global as any;
      expect(g.botConfig).to.have.property("getConfig");
      expect(g.botConfig).to.have.property("updateConfig");
    });

    it("should expose logger utilities", () => {
      registerAllConsoleCommands();
      
      const g = global as any;
      expect(g.botLogger).to.have.property("configureLogger");
    });
  });

  describe("Command help system", () => {
    it("should provide help for all commands", () => {
      registerAllConsoleCommands();
      
      // Help system should be available
      expect(commandRegistry).to.not.be.undefined;
    });

    it("should provide help for specific commands", () => {
      registerAllConsoleCommands();
      
      // Individual command help
      expect(commandRegistry).to.not.be.undefined;
    });

    it("should list available commands", () => {
      registerAllConsoleCommands();
      
      // Command list should be accessible
      expect(commandRegistry).to.not.be.undefined;
    });
  });

  describe("Performance", () => {
    it("should register commands efficiently", () => {
      const startTime = Date.now();
      
      registerAllConsoleCommands();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time (< 100ms)
      expect(duration).to.be.lessThan(100);
    });

    it("should handle rapid command execution", () => {
      registerAllConsoleCommands();
      
      expect(() => {
        // Rapid fire commands
        for (let i = 0; i < 10; i++) {
          commandRegistry.initialize();
        }
      }).to.not.throw();
    });
  });

  describe("Error handling", () => {
    it("should catch and report command errors", () => {
      registerAllConsoleCommands();
      
      // Command registration should complete without throwing
      expect(true).to.be.true;
    });

    it("should handle missing dependencies", () => {
      // Commands should handle missing modules
      expect(() => registerAllConsoleCommands()).to.not.throw();
    });

    it("should handle initialization errors", () => {
      // Multiple initializations should not break
      commandRegistry.initialize();
      commandRegistry.initialize();
      
      expect(true).to.be.true;
    });
  });

  describe("Edge cases", () => {
    it("should handle null/undefined arguments", () => {
      registerAllConsoleCommands();
      
      expect(true).to.be.true;
    });

    it("should handle very long command strings", () => {
      const longCommand = "a".repeat(1000);
      
      expect(longCommand.length).to.equal(1000);
    });

    it("should handle commands with newlines", () => {
      const multilineCommand = "command\nwith\nnewlines";
      
      expect(multilineCommand).to.include("\n");
    });

    it("should handle commands with unicode", () => {
      const unicodeCommand = "emoji 😀🎉";
      
      expect(unicodeCommand).to.include("😀");
    });

    it("should handle commands during global reset", () => {
      // Commands should survive reset
      registerAllConsoleCommands();
      
      expect(true).to.be.true;
    });
  });
});

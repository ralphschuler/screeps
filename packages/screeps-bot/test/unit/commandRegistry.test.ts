import { expect } from "chai";
import * as sinon from "sinon";
import {
  commandRegistry,
  Command,
  CommandMetadata,
  registerDecoratedCommands,
  clearCommandDecoratorMetadata,
  getCommandDecoratorMetadata
} from "../../src/core/commandRegistry";

describe("CommandRegistry", () => {
  beforeEach(() => {
    // Clear any previously registered commands and decorator metadata
    // Access private commands map to clear it for testing
    const registry = commandRegistry as unknown as { commands: Map<string, unknown>; initialized: boolean };
    registry.commands.clear();
    registry.initialized = false;
    clearCommandDecoratorMetadata();
  });

  describe("register", () => {
    it("should register a command with metadata", () => {
      const handler = (): string => "test";
      const metadata: CommandMetadata = {
        name: "testCommand",
        description: "A test command"
      };

      commandRegistry.register(metadata, handler);

      const command = commandRegistry.getCommand("testCommand");
      expect(command).to.not.be.undefined;
      expect(command?.metadata.name).to.equal("testCommand");
      expect(command?.metadata.description).to.equal("A test command");
      expect(command?.metadata.category).to.equal("General"); // default category
    });

    it("should allow custom category", () => {
      const handler = (): string => "test";
      const metadata: CommandMetadata = {
        name: "testCommand",
        description: "A test command",
        category: "Custom"
      };

      commandRegistry.register(metadata, handler);

      const command = commandRegistry.getCommand("testCommand");
      expect(command?.metadata.category).to.equal("Custom");
    });

    it("should overwrite existing command with same name", () => {
      const handler1 = (): string => "test1";
      const handler2 = (): string => "test2";

      commandRegistry.register({ name: "test", description: "First" }, handler1);
      commandRegistry.register({ name: "test", description: "Second" }, handler2);

      const command = commandRegistry.getCommand("test");
      expect(command?.metadata.description).to.equal("Second");
      expect(command?.handler()).to.equal("test2");
    });
  });

  describe("unregister", () => {
    it("should remove a registered command", () => {
      commandRegistry.register({ name: "test", description: "Test" }, () => "test");
      expect(commandRegistry.getCommand("test")).to.not.be.undefined;

      const result = commandRegistry.unregister("test");
      expect(result).to.be.true;
      expect(commandRegistry.getCommand("test")).to.be.undefined;
    });

    it("should return false for non-existent command", () => {
      const result = commandRegistry.unregister("nonExistent");
      expect(result).to.be.false;
    });
  });

  describe("getCommands", () => {
    it("should return all registered commands", () => {
      commandRegistry.register({ name: "cmd1", description: "Cmd 1" }, () => "1");
      commandRegistry.register({ name: "cmd2", description: "Cmd 2" }, () => "2");
      commandRegistry.register({ name: "cmd3", description: "Cmd 3" }, () => "3");

      const commands = commandRegistry.getCommands();
      expect(commands).to.have.length(3);
    });
  });

  describe("getCommandsByCategory", () => {
    it("should group commands by category", () => {
      commandRegistry.register(
        { name: "cmd1", description: "Cmd 1", category: "A" },
        () => "1"
      );
      commandRegistry.register(
        { name: "cmd2", description: "Cmd 2", category: "B" },
        () => "2"
      );
      commandRegistry.register(
        { name: "cmd3", description: "Cmd 3", category: "A" },
        () => "3"
      );

      const categories = commandRegistry.getCommandsByCategory();
      expect(categories.get("A")).to.have.length(2);
      expect(categories.get("B")).to.have.length(1);
    });

    it("should sort commands within categories alphabetically", () => {
      commandRegistry.register(
        { name: "zebra", description: "Zebra", category: "Test" },
        () => "z"
      );
      commandRegistry.register(
        { name: "alpha", description: "Alpha", category: "Test" },
        () => "a"
      );

      const categories = commandRegistry.getCommandsByCategory();
      const testCommands = categories.get("Test");
      expect(testCommands?.[0].metadata.name).to.equal("alpha");
      expect(testCommands?.[1].metadata.name).to.equal("zebra");
    });
  });

  describe("execute", () => {
    it("should execute a command and return result", () => {
      commandRegistry.register(
        { name: "add", description: "Add numbers" },
        (a: unknown, b: unknown): number => (a as number) + (b as number)
      );

      const result = commandRegistry.execute("add", 1, 2);
      expect(result).to.equal(3);
    });

    it("should return error message for non-existent command", () => {
      const result = commandRegistry.execute("nonExistent");
      expect(result).to.include("not found");
      expect(result).to.include("help()");
    });

    it("should handle errors gracefully", () => {
      commandRegistry.register(
        { name: "error", description: "Throws error" },
        (): never => {
          throw new Error("Test error");
        }
      );

      const result = commandRegistry.execute("error");
      expect(result).to.include("Error:");
      expect(result).to.include("Test error");
    });
  });

  describe("generateHelp", () => {
    it("should generate help output with all commands", () => {
      commandRegistry.register(
        { name: "cmd1", description: "First command", category: "General" },
        () => "1"
      );
      commandRegistry.register(
        { name: "cmd2", description: "Second command", category: "Kernel" },
        () => "2"
      );

      const help = commandRegistry.generateHelp();
      expect(help).to.include("Available Console Commands");
      expect(help).to.include("cmd1");
      expect(help).to.include("First command");
      expect(help).to.include("cmd2");
      expect(help).to.include("Second command");
      expect(help).to.include("General");
      expect(help).to.include("Kernel");
    });

    it("should include usage and examples in help", () => {
      commandRegistry.register(
        {
          name: "test",
          description: "Test command",
          usage: "test(arg1, arg2)",
          examples: ["test('hello', 123)"]
        },
        () => "test"
      );

      const help = commandRegistry.generateHelp();
      expect(help).to.include("test(arg1, arg2)");
      expect(help).to.include("test('hello', 123)");
    });
  });

  describe("generateCommandHelp", () => {
    it("should generate help for a specific command", () => {
      commandRegistry.register(
        {
          name: "myCommand",
          description: "Does something useful",
          usage: "myCommand(arg)",
          examples: ["myCommand('test')"],
          category: "Testing"
        },
        () => "result"
      );

      const help = commandRegistry.generateCommandHelp("myCommand");
      expect(help).to.include("myCommand");
      expect(help).to.include("Does something useful");
      expect(help).to.include("myCommand(arg)");
      expect(help).to.include("myCommand('test')");
      expect(help).to.include("Testing");
    });

    it("should return error for non-existent command", () => {
      const help = commandRegistry.generateCommandHelp("nonExistent");
      expect(help).to.include("not found");
    });
  });

  describe("initialize", () => {
    it("should register help command on initialize", () => {
      expect(commandRegistry.getCommand("help")).to.be.undefined;

      commandRegistry.initialize();

      expect(commandRegistry.getCommand("help")).to.not.be.undefined;
    });

    it("should only initialize once", () => {
      commandRegistry.initialize();
      const countAfterFirst = commandRegistry.getCommandCount();

      commandRegistry.initialize();
      const countAfterSecond = commandRegistry.getCommandCount();

      expect(countAfterFirst).to.equal(countAfterSecond);
    });
  });

  describe("exposeToGlobal", () => {
    it("should expose commands to global scope", () => {
      commandRegistry.register(
        { name: "globalTest", description: "Test" },
        () => "global test result"
      );

      commandRegistry.exposeToGlobal();

      const g = global as unknown as Record<string, unknown>;
      expect(typeof g.globalTest).to.equal("function");
      expect((g.globalTest as () => string)()).to.equal("global test result");
    });
  });
});

describe("@Command decorator", () => {
  beforeEach(() => {
    // Clear decorator metadata
    clearCommandDecoratorMetadata();
    // Clear commands
    const registry = commandRegistry as unknown as { commands: Map<string, unknown>; initialized: boolean };
    registry.commands.clear();
    registry.initialized = false;
  });

  it("should store metadata for decorated methods", () => {
    class TestCommands {
      @Command({
        name: "decoratedCmd",
        description: "A decorated command"
      })
      public myMethod(): string {
        return "decorated result";
      }
    }

    // Create instance - this doesn't register yet
    const _instance = new TestCommands();

    // Check metadata was stored
    const metadata = getCommandDecoratorMetadata();
    expect(metadata.length).to.be.greaterThan(0);
    expect(metadata.some(m => m.metadata.name === "decoratedCmd")).to.be.true;
  });

  it("should register decorated commands from instance", () => {
    class TestCommands {
      @Command({
        name: "instanceCmd",
        description: "Instance command",
        category: "Test"
      })
      public runCommand(): string {
        return "instance result";
      }
    }

    const instance = new TestCommands();
    registerDecoratedCommands(instance);

    const cmd = commandRegistry.getCommand("instanceCmd");
    expect(cmd).to.not.be.undefined;
    expect(cmd?.metadata.description).to.equal("Instance command");
    expect(cmd?.handler()).to.equal("instance result");
  });

  it("should bind methods to instance context", () => {
    class TestCommands {
      private value = "bound value";

      @Command({
        name: "boundCmd",
        description: "Tests binding"
      })
      public getValue(): string {
        return this.value;
      }
    }

    const instance = new TestCommands();
    registerDecoratedCommands(instance);

    const cmd = commandRegistry.getCommand("boundCmd");
    expect(cmd?.handler()).to.equal("bound value");
  });
});

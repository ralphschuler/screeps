import { expect } from "chai";
import {
  Command,
  clearCommandDecoratorMetadata,
  commandRegistry,
  getCommandDecoratorMetadata,
  registerDecoratedCommands
} from "../src/commandRegistry.ts";

describe("Command Registry", () => {
  beforeEach(() => {
    commandRegistry.reset();
    clearCommandDecoratorMetadata();
  });

  afterEach(() => {
    commandRegistry.reset();
    clearCommandDecoratorMetadata();
  });

  it("registers and executes commands", () => {
    commandRegistry.register(
      {
        name: "ping",
        description: "Return a pong response",
        category: "System"
      },
      () => "pong"
    );

    expect(commandRegistry.getCommandCount()).to.equal(1);
    expect(commandRegistry.execute("ping")).to.equal("pong");
  });

  it("returns useful help for missing commands", () => {
    expect(commandRegistry.execute("missing")).to.contain("Command \"missing\" not found");

    commandRegistry.initialize();
    expect(commandRegistry.generateHelp()).to.contain("Available Console Commands");
    expect(commandRegistry.generateCommandHelp("missing")).to.contain("not found");
  });

  it("orders generated help by category and command name", () => {
    commandRegistry.register(
      { name: "zetaGeneral", description: "General command registered last" },
      () => "general"
    );
    commandRegistry.register(
      { name: "zuluBeta", description: "Beta command registered first", category: "Beta" },
      () => "beta-zulu"
    );
    commandRegistry.register(
      { name: "alphaBeta", description: "Beta command registered second", category: "Beta" },
      () => "beta-alpha"
    );
    commandRegistry.register(
      { name: "alphaCommand", description: "Alpha command", category: "Alpha" },
      () => "alpha"
    );

    const help = commandRegistry.generateHelp();

    expect(help.indexOf("--- General ---")).to.be.lessThan(help.indexOf("--- Alpha ---"));
    expect(help.indexOf("--- Alpha ---")).to.be.lessThan(help.indexOf("--- Beta ---"));
    expect(help.indexOf("alphaBeta()")).to.be.lessThan(help.indexOf("zuluBeta()"));
  });

  it("formats registry help examples without extra spacer lines", () => {
    commandRegistry.register(
      {
        name: "withExample",
        description: "Command with example",
        examples: ["withExample()"]
      },
      () => "ok"
    );

    expect(commandRegistry.generateHelp()).to.equal(
      [
        "=== Available Console Commands ===",
        "",
        "--- General ---",
        "  withExample()",
        "    Command with example",
        "    Examples:",
        "      withExample()",
        ""
      ].join("\n")
    );
  });

  it("generates detailed command help with usage category and examples", () => {
    commandRegistry.register(
      {
        name: "inspectRoom",
        description: "Inspect room state",
        usage: "inspectRoom(roomName)",
        examples: ["inspectRoom('W1N1')"],
        category: "Diagnostics"
      },
      () => "ok"
    );

    const help = commandRegistry.generateCommandHelp("inspectRoom");

    expect(help).to.contain("=== inspectRoom ===");
    expect(help).to.contain("Description: Inspect room state");
    expect(help).to.contain("Usage: inspectRoom(roomName)");
    expect(help).to.contain("Category: Diagnostics");
    expect(help).to.contain("Examples:");
    expect(help).to.contain("  inspectRoom('W1N1')");
  });

  it("lazy-loads commands when global help is called", () => {
    let callbackCalls = 0;
    commandRegistry.enableLazyLoading(() => {
      callbackCalls += 1;
      commandRegistry.register({ name: "lazyHelp", description: "Lazy help command" }, () => "loaded");
    });
    commandRegistry.exposeToGlobal();

    const help = (global as unknown as { help: () => string }).help();

    expect(callbackCalls).to.equal(1);
    expect(help).to.contain("lazyHelp()");
  });

  it("clears commands through the compatibility alias", () => {
    commandRegistry.register({ name: "ping", description: "Return a pong response" }, () => "pong");

    commandRegistry.clear();

    expect(commandRegistry.getCommandCount()).to.equal(0);
    expect(commandRegistry.isInitialized()).to.equal(false);
  });

  it("keeps getCommand side-effect free in lazy-loading mode", () => {
    let callbackCalls = 0;
    commandRegistry.enableLazyLoading(() => {
      callbackCalls += 1;
      commandRegistry.register({ name: "lazy", description: "Lazy command" }, () => "loaded");
    });

    expect(commandRegistry.getCommand("lazy")).to.equal(undefined);
    expect(callbackCalls).to.equal(0);

    expect(commandRegistry.execute("lazy")).to.equal("loaded");
    expect(callbackCalls).to.equal(1);
  });

  it("registers decorated command methods", () => {
    class DecoratedCommands {
      public ping(): string {
        return "pong";
      }
    }

    const descriptor = Object.getOwnPropertyDescriptor(DecoratedCommands.prototype, "ping");
    Command({ name: "decoratedPing", description: "Return a decorated pong" })(
      DecoratedCommands.prototype,
      "ping",
      descriptor
    );

    expect(getCommandDecoratorMetadata()).to.have.length(1);

    registerDecoratedCommands(new DecoratedCommands());

    expect(commandRegistry.execute("decoratedPing")).to.equal("pong");
  });

  it("registers decorated commands declared on a base class", () => {
    class BaseCommands {
      public ping(): string {
        return "base pong";
      }
    }

    class ChildCommands extends BaseCommands {}

    const descriptor = Object.getOwnPropertyDescriptor(BaseCommands.prototype, "ping");
    Command({ name: "baseDecoratedPing", description: "Return a base decorated pong" })(
      BaseCommands.prototype,
      "ping",
      descriptor
    );

    registerDecoratedCommands(new ChildCommands());

    expect(commandRegistry.execute("baseDecoratedPing")).to.equal("base pong");
  });

  it("deduplicates decorator metadata for the same target method and command", () => {
    class DecoratedCommands {
      public ping(): string {
        return "pong";
      }
    }

    const descriptor = Object.getOwnPropertyDescriptor(DecoratedCommands.prototype, "ping");
    const decorator = Command({ name: "decoratedPing", description: "Return a decorated pong" });

    decorator(DecoratedCommands.prototype, "ping", descriptor);
    decorator(DecoratedCommands.prototype, "ping", descriptor);

    expect(getCommandDecoratorMetadata()).to.have.length(1);
  });

  it("registers modern decorator metadata from an instance initializer", () => {
    class DecoratedCommands {
      public ping(): string {
        return "pong";
      }
    }

    const initializers: Array<(this: unknown) => void> = [];
    const context = {
      name: "ping",
      addInitializer(initializer: (this: unknown) => void): void {
        initializers.push(initializer);
      }
    } as unknown as ClassMethodDecoratorContext;

    Command({ name: "modernDecoratedPing", description: "Return a modern decorated pong" })(
      DecoratedCommands.prototype.ping,
      context
    );

    const instance = new DecoratedCommands();
    for (const initializer of initializers) {
      initializer.call(instance);
    }

    expect(getCommandDecoratorMetadata()).to.have.length(1);

    registerDecoratedCommands(instance);

    expect(commandRegistry.execute("modernDecoratedPing")).to.equal("pong");
  });
});

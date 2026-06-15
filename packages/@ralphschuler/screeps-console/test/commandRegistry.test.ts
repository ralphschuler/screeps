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
});

import { expect } from "chai";
import { commandRegistry } from "../src/commandRegistry.ts";

describe("Command Registry", () => {
  beforeEach(() => {
    commandRegistry.reset();
  });

  afterEach(() => {
    commandRegistry.reset();
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
});

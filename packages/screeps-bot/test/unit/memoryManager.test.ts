import { expect } from "chai";
import { MemoryManager } from "../../src/memory/manager";
import { Game as GameMock, Memory as MemoryMock } from "./mock";

// These tests rely on the per-file test setup to provide lodash's _.clone helper.

describe("MemoryManager", () => {
  let manager: MemoryManager;

  beforeEach(() => {
    // @ts-ignore: test setup injects lodash-lite clone
    global.Game = _.clone(GameMock);
    // @ts-ignore: test setup injects lodash-lite clone
    global.Memory = _.clone(MemoryMock);
    manager = new MemoryManager();
  });

  it("cleans up dead creep memory after the cleanup interval", () => {
    // @ts-ignore: Assigning to mocked global values
    global.Game.time = 100;
    // @ts-ignore: Assigning to mocked global values
    global.Memory.creeps = { alive: {}, expired: {} };
    // @ts-ignore: Assigning to mocked global values
    global.Game.creeps = { alive: {} };
    // Force the cleanup window to be open
    // @ts-ignore: Accessing private property for testing
    manager["lastCleanupTick"] = 89;

    manager.initialize();

    // @ts-ignore: Accessing mocked memory
    expect(global.Memory.creeps.alive).to.exist;
    // @ts-ignore: Accessing mocked memory
    expect(global.Memory.creeps.expired).to.be.undefined;
  });

  it("reruns migrations when memory version falls behind", () => {
    manager.initialize();
    // @ts-ignore: Accessing mocked memory
    const currentVersion = global.Memory.memoryVersion;

    // Simulate a new tick where memory version regressed
    // @ts-ignore: Assigning to mocked global values
    global.Game.time += 1;
    // @ts-ignore: Accessing mocked memory
    global.Memory.memoryVersion = (currentVersion as number) - 1;
    // @ts-ignore: Accessing mocked memory
    global.Memory.creeps = { needsMigration: {} };

    manager.initialize();

    // @ts-ignore: Accessing mocked memory
    expect(global.Memory.memoryVersion).to.equal(currentVersion);
    // @ts-ignore: Accessing mocked memory
    expect(global.Memory.creeps.needsMigration.version).to.equal(1);
  });
});

import { expect } from "chai";
import sinon from "sinon";
import { BotPixelGenerationManager, createDefaultPixelGenerationMemory } from "../../../src/empire/pixelGenerationManager";

describe("Pixel Generation Manager - bot safety gates", () => {
  let manager: BotPixelGenerationManager;
  let generatePixel: sinon.SinonStub;

  const buildManager = () => {
    return new BotPixelGenerationManager({
      fullBucketTicksRequired: 1,
      enabled: true
    });
  };

  beforeEach(() => {
    (globalThis as any).Game = {
      ...globalThis.Game,
      time: 10000,
      cpu: {
        ...globalThis.Game.cpu,
        bucket: 10000,
        generatePixel: sinon.stub().returns(OK)
      }
    };

    generatePixel = globalThis.Game.cpu.generatePixel as sinon.SinonStub;

    (globalThis as any).Memory = {
      stats: {
        rooms: {
          W1N1: {
            hostiles: 0,
            spawn_queue: { emergency: 0 },
            taskBoard: { open_tasks: 0, assigned_tasks: 0 }
          }
        }
      },
      defenseRequests: [],
      empire: {
        recoveryRooms: {}
      }
    };

    // Reset pixel generation heap memory used by the bot accessor.
    delete (globalThis as any)._pixelGenerationMemory;
    // Ensure any prior memory starts clean when accessor initializes.
    (globalThis as any)._pixelGenerationMemory = createDefaultPixelGenerationMemory();

    manager = buildManager();
  });

  afterEach(() => {
    delete (globalThis as any)._pixelGenerationMemory;
    sinon.restore();
  });

  it("should generate a pixel when empire load is quiet", () => {
    manager.run();
    expect(generatePixel.calledOnce).to.equal(true);
  });

  it("should skip pixel generation when defense requests are active", () => {
    (globalThis as any).Memory.defenseRequests = [{ roomName: "W1N1", targetRoom: "W1N1" }];

    manager.run();
    expect(generatePixel.called).to.equal(false);
  });

  it("should skip pixel generation when defense requests are stored as a map", () => {
    (globalThis as any).Memory.defenseRequests = {
      W1N1: { roomName: "W1N1", targetRoom: "W1N1" }
    };

    manager.run();
    expect(generatePixel.called).to.equal(false);
  });

  it("should skip pixel generation when hostiles are detected", () => {
    (globalThis as any).Memory.stats.rooms.W1N1.hostiles = 1;

    manager.run();
    expect(generatePixel.called).to.equal(false);
  });

  it("should skip pixel generation when emergency spawn queue is non-empty", () => {
    (globalThis as any).Memory.stats.rooms.W1N1.spawn_queue = { emergency: 1 };

    manager.run();
    expect(generatePixel.called).to.equal(false);
  });

  it("should skip pixel generation when task backlog is severe", () => {
    (globalThis as any).Memory.stats.rooms.W1N1.taskBoard = {
      open_tasks: 120,
      assigned_tasks: 3
    };

    manager.run();
    expect(generatePixel.called).to.equal(false);
  });

  it("should skip pixel generation when open/assigned backlog gap is large", () => {
    (globalThis as any).Memory.stats.rooms.W1N1.taskBoard = {
      open_tasks: 120,
      assigned_tasks: 20
    };

    manager.run();
    expect(generatePixel.called).to.equal(false);
  });

  it("should skip pixel generation in recovery mode", () => {
    (globalThis as any).Memory.empire.recoveryRooms = { W1N1: 12345 };

    manager.run();
    expect(generatePixel.called).to.equal(false);
  });

  it("should recover and generate after threat clears", () => {
    (globalThis as any).Memory.defenseRequests = [{ roomName: "W1N1", targetRoom: "W1N1" }];
    manager.run();
    expect(generatePixel.called).to.equal(false);

    (globalThis as any).Memory.defenseRequests = [];
    manager.run();
    expect(generatePixel.calledOnce).to.equal(true);
  });

  it("should not block when room stats are unavailable", () => {
    delete (globalThis as any).Memory.stats;

    manager.run();
    expect(generatePixel.calledOnce).to.equal(true);
  });
});

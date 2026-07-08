import { assert } from "chai";
import sinon from "sinon";
import { logger } from "@ralphschuler/screeps-core";
import { TooAngelManager } from "../../src/empire/tooangel/tooAngelManager";
import type { TooAngelMemory } from "../../src/empire/tooangel/types";

const previousGame = (global as { Game?: Game }).Game;
const previousMemory = (global as { Memory?: Memory }).Memory;

function installThrowingGame(time: number): void {
  const game = {
    time,
    cpu: { bucket: 10_000 }
  } as Partial<Game>;

  Object.defineProperty(game, "market", {
    configurable: true,
    get(): never {
      throw new Error("forced TooAngel manager failure");
    }
  });

  (global as unknown as { Game: Partial<Game> }).Game = game;
}

function setTick(time: number): void {
  (global as unknown as { Game: { time: number } }).Game.time = time;
}

function tooAngelMemory(): TooAngelMemory {
  return (Memory as Memory & { tooangel: TooAngelMemory }).tooangel;
}

function legacyErrorKeys(): string[] {
  return Object.keys(Memory).filter(key => key.startsWith("tooangel_error_"));
}

describe("TooAngel manager error throttling", () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    (global as unknown as { Memory: Partial<Memory> }).Memory = {};
    installThrowingGame(1_000);
  });

  afterEach(() => {
    sandbox.restore();
    (global as { Game?: Game }).Game = previousGame;
    (global as { Memory?: Memory }).Memory = previousMemory;
  });

  it("logs again after the throttle window without writing rotating root Memory keys", () => {
    const manager = new TooAngelManager();
    const errorSpy = sandbox.stub(logger, "error");

    manager.run();
    setTick(1_050);
    manager.run();
    setTick(1_100);
    manager.run();

    assert.equal(errorSpy.callCount, 2, "first error and next throttle window should log");
    assert.deepEqual(legacyErrorKeys(), [], "rotating root error keys should not be written");
    assert.equal(tooAngelMemory().errorThrottle?.lastErrorTick, 1_100);
    assert.include(tooAngelMemory().errorThrottle?.lastMessage, "forced TooAngel manager failure");
  });

  it("suppresses repeated errors inside the throttle window and clears legacy root keys", () => {
    (Memory as unknown as Record<string, unknown>).tooangel_error_0 = true;
    (Memory as unknown as Record<string, unknown>).tooangel_error_99 = true;
    const manager = new TooAngelManager();
    const errorSpy = sandbox.stub(logger, "error");

    manager.run();
    setTick(1_050);
    manager.run();

    assert.equal(errorSpy.callCount, 1, "second error inside the window should be suppressed");
    assert.deepEqual(legacyErrorKeys(), [], "legacy rotating root keys should be removed");
    assert.equal(tooAngelMemory().errorThrottle?.count, 2);
  });
});

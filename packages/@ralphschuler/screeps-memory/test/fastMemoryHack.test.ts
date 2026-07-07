import { assert } from "chai";
import { FastMemoryHack } from "../src/fastMemoryHack.ts";

describe("FastMemoryHack", () => {
  function createGlobals(initialMemory: Memory = { creeps: {}, rooms: {} } as Memory) {
    return {
      Game: { time: 100 },
      Memory: initialMemory,
      RawMemory: {
        segments: {},
        foreignSegment: undefined,
        interShardSegment: "",
        get: () => JSON.stringify(initialMemory),
        set: (_value: string) => undefined,
        setActiveSegments: (_ids: number[]) => undefined,
        setActiveForeignSegment: (_username: string | null, _id?: number) => undefined,
        setDefaultPublicSegment: (_id: number | null) => undefined,
        setPublicSegments: (_ids: number[]) => undefined
      } as unknown as RawMemory & { _parsed?: Memory }
    } as { Game?: { time?: number }; Memory?: Memory; RawMemory?: RawMemory & { _parsed?: Memory } };
  }

  it("registers the current parsed Memory object", () => {
    const memory = { creeps: {}, rooms: {}, marker: "initial" } as unknown as Memory;
    const globals = createGlobals(memory);
    const hack = new FastMemoryHack(globals);

    assert.isTrue(hack.register());

    assert.strictEqual(hack.getCachedMemory(), memory);
    assert.strictEqual(globals.RawMemory?._parsed, memory);
  });

  it("restores cached Memory into globalThis and RawMemory._parsed without reading the replacement Memory", () => {
    const memory = { creeps: {}, rooms: {}, marker: "cached" } as unknown as Memory;
    const globals = createGlobals(memory);
    const hack = new FastMemoryHack(globals);
    hack.register();

    const replacement = { creeps: {}, rooms: {}, marker: "would-parse" } as unknown as Memory;
    let reads = 0;
    Object.defineProperty(globals, "Memory", {
      configurable: true,
      get: () => {
        reads += 1;
        return replacement;
      }
    });
    globals.Game!.time = 101;
    globals.RawMemory!._parsed = replacement;

    assert.isTrue(hack.run());

    assert.equal(reads, 0, "run should not touch the Memory getter");
    assert.strictEqual(globals.Memory, memory);
    assert.strictEqual(globals.RawMemory!._parsed, memory);
  });

  it("no-ops safely when RawMemory is unavailable", () => {
    const memory = { creeps: {}, rooms: {} } as Memory;
    const globals = { Memory: memory } as { Memory?: Memory; RawMemory?: RawMemory & { _parsed?: Memory } };
    const hack = new FastMemoryHack(globals);

    assert.isFalse(hack.register());
    assert.isFalse(hack.run());
    assert.isUndefined(hack.getCachedMemory());
    assert.strictEqual(globals.Memory, memory);
  });

  it("can re-register after a global reset replaces Memory", () => {
    const firstMemory = { creeps: {}, rooms: {}, marker: "first" } as unknown as Memory;
    const globals = createGlobals(firstMemory);
    const hack = new FastMemoryHack(globals);
    hack.register();

    const nextMemory = { creeps: {}, rooms: {}, marker: "reset" } as unknown as Memory;
    globals.Memory = nextMemory;

    assert.isTrue(hack.register());
    assert.isTrue(hack.run());

    assert.strictEqual(hack.getCachedMemory(), nextMemory);
    assert.strictEqual(globals.Memory, nextMemory);
    assert.strictEqual(globals.RawMemory!._parsed, nextMemory);
  });

  it("re-registers on non-monotonic Game.time instead of restoring stale heap Memory", () => {
    const firstMemory = { creeps: {}, rooms: {}, marker: "first" } as unknown as Memory;
    const globals = createGlobals(firstMemory);
    const hack = new FastMemoryHack(globals);
    hack.register();
    assert.isTrue(hack.run());

    globals.Game!.time = 99;
    const replacement = { creeps: {}, rooms: {}, marker: "replacement" } as unknown as Memory;
    globals.Memory = replacement;

    assert.isTrue(hack.run());

    assert.strictEqual(hack.getCachedMemory(), replacement);
    assert.strictEqual(globals.Memory, replacement);
    assert.strictEqual(globals.RawMemory!._parsed, replacement);
  });
});

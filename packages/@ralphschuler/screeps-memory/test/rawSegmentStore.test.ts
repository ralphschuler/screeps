import { assert } from "chai";
import {
  RawSegmentMemoryPort,
  RawSegmentStore,
  createRawSegmentStoreManifest
} from "../src/rawSegmentStore.ts";

class FakeRawMemory implements RawSegmentMemoryPort {
  public segments: { [segmentId: number]: string } = {};
  public requestedSegments: number[] = [];
  public readonly persisted = new Map<number, string>();

  public setActiveSegments(ids: number[]): void {
    this.requestedSegments = [...ids];
  }

  public activate(ids = this.requestedSegments): void {
    this.segments = {};
    for (const id of ids) {
      this.segments[id] = this.persisted.get(id) ?? "";
    }
  }

  public persistActive(): void {
    for (const [id, value] of Object.entries(this.segments)) {
      this.persisted.set(Number(id), value);
    }
  }
}

describe("RawSegmentStore", () => {
  it("commits a raw source only after every target segment is active", () => {
    const rawMemory = new FakeRawMemory();
    const manifest = createRawSegmentStoreManifest();
    const store = new RawSegmentStore({
      manifest,
      rawMemory,
      segmentSizeLimit: 5,
      maxActiveSegments: 3,
      getTime: () => 1234
    });

    const enqueue = store.enqueueWrite("intel:W1N1", "abcdefghijkl");
    assert.deepInclude(enqueue, { ok: true, requiredSegments: 3 });

    const firstRun = store.run();
    assert.deepEqual(firstRun.requestedSegments, [0, 1, 2]);
    assert.deepEqual(firstRun.writesCommitted, []);
    assert.notProperty(manifest.sources, "intel:W1N1", "manifest must not point at a partial write");

    rawMemory.activate([0, 1]);
    const partialRun = store.run();
    assert.deepEqual(partialRun.requestedSegments, [0, 1, 2]);
    assert.deepEqual(partialRun.writesCommitted, []);
    assert.notProperty(manifest.sources, "intel:W1N1", "manifest remains unchanged until all chunks can be written atomically");

    rawMemory.activate([0, 1, 2]);
    const commitRun = store.run();

    assert.deepEqual(commitRun.writesCommitted, ["intel:W1N1"]);
    assert.deepEqual(manifest.sources["intel:W1N1"].segments, [0, 1, 2]);
    assert.equal(manifest.sources["intel:W1N1"].length, 12);
    assert.equal(manifest.sources["intel:W1N1"].revision, 1);
    assert.equal(manifest.sources["intel:W1N1"].updatedAt, 1234);
    assert.equal(rawMemory.segments[0], "abcde");
    assert.equal(rawMemory.segments[1], "fghij");
    assert.equal(rawMemory.segments[2], "kl");
    assert.equal(store.read("intel:W1N1"), "abcdefghijkl");
  });

  it("uses copy-on-write segments when replacing an existing source", () => {
    const rawMemory = new FakeRawMemory();
    const manifest = createRawSegmentStoreManifest();
    const store = new RawSegmentStore({
      manifest,
      rawMemory,
      segmentSizeLimit: 4,
      maxActiveSegments: 2,
      getTime: () => 10
    });

    store.enqueueWrite("market:history", "abcdefgh");
    store.run();
    rawMemory.activate([0, 1]);
    store.run();
    rawMemory.persistActive();

    assert.deepEqual(manifest.sources["market:history"].segments, [0, 1]);
    assert.equal(store.read("market:history"), "abcdefgh");

    store.enqueueWrite("market:history", "zzzzzzzz");
    const requestRun = store.run();

    assert.deepEqual(requestRun.requestedSegments, [2, 3]);
    assert.deepEqual(manifest.sources["market:history"].segments, [0, 1], "old manifest remains readable while new chunks are pending");
    assert.equal(store.read("market:history"), "abcdefgh");

    rawMemory.activate([2, 3]);
    const commitRun = store.run();

    assert.deepEqual(commitRun.writesCommitted, ["market:history"]);
    assert.deepEqual(manifest.sources["market:history"].segments, [2, 3]);
    assert.equal(manifest.sources["market:history"].revision, 2);
    assert.equal(store.read("market:history"), "zzzzzzzz");
  });

  it("loads manifest segments across ticks after a global reset", () => {
    const rawMemory = new FakeRawMemory();
    const manifest = createRawSegmentStoreManifest();
    const writer = new RawSegmentStore({
      manifest,
      rawMemory,
      segmentSizeLimit: 3,
      maxActiveSegments: 2,
      maxWritesPerTick: 2
    });

    writer.enqueueWrite("source:a", "abcdef");
    writer.enqueueWrite("source:b", "uvwxyz");
    writer.run();
    rawMemory.activate([0, 1]);
    writer.run();
    rawMemory.persistActive();
    writer.run();
    rawMemory.activate([2, 3]);
    writer.run();
    rawMemory.persistActive();

    const afterResetRawMemory = new FakeRawMemory();
    afterResetRawMemory.persisted.set(0, rawMemory.persisted.get(0)!);
    afterResetRawMemory.persisted.set(1, rawMemory.persisted.get(1)!);
    afterResetRawMemory.persisted.set(2, rawMemory.persisted.get(2)!);
    afterResetRawMemory.persisted.set(3, rawMemory.persisted.get(3)!);

    const reader = new RawSegmentStore({
      manifest,
      rawMemory: afterResetRawMemory,
      segmentSizeLimit: 3,
      maxActiveSegments: 2
    });

    const firstRequest = reader.requestMissingSegments();
    assert.isFalse(firstRequest.ready);
    assert.deepEqual(firstRequest.requestedSegments, [0, 1]);
    assert.isNull(reader.read("source:a"));

    afterResetRawMemory.activate();
    const secondRequest = reader.requestMissingSegments();
    assert.isFalse(secondRequest.ready);
    assert.deepEqual(reader.getLoadedSegmentIds(), [0, 1]);
    assert.equal(reader.read("source:a"), "abcdef");
    assert.deepEqual(secondRequest.requestedSegments, [2, 3]);

    afterResetRawMemory.activate();
    const finalRequest = reader.requestMissingSegments();
    assert.isTrue(finalRequest.ready);
    assert.deepEqual(reader.getLoadedSegmentIds(), [0, 1, 2, 3]);
    assert.equal(reader.read("source:a"), "abcdef");
    assert.equal(reader.read("source:b"), "uvwxyz");
  });

  it("rejects a source that would exceed the active segment limit", () => {
    const rawMemory = new FakeRawMemory();
    const store = new RawSegmentStore({
      manifest: createRawSegmentStoreManifest(),
      rawMemory,
      segmentSizeLimit: 2,
      maxActiveSegments: 3
    });

    const result = store.enqueueWrite("too-big", "abcdefg");

    assert.deepEqual(result, {
      ok: false,
      sourceId: "too-big",
      reason: "source_too_large",
      requiredSegments: 4,
      maxSegments: 3
    });
    assert.equal(store.getPendingWriteCount(), 0);
  });

  it("returns null instead of corrupt data when loaded chunks fail integrity checks", () => {
    const rawMemory = new FakeRawMemory();
    const manifest = createRawSegmentStoreManifest();
    const store = new RawSegmentStore({
      manifest,
      rawMemory,
      segmentSizeLimit: 4,
      maxActiveSegments: 2
    });

    store.enqueueWrite("layout:plan", "abcdefgh");
    store.run();
    rawMemory.activate([0, 1]);
    store.run();

    assert.equal(store.read("layout:plan"), "abcdefgh");

    rawMemory.segments[1] = "XXXX";

    assert.isNull(store.read("layout:plan"), "checksum mismatch should hide corrupt RawMemory payloads");
  });
});

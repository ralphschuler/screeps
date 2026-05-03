import { expect } from "chai";
import {
  createDefaultInterShardMemory,
  createDefaultShardState,
  deserializeInterShardMemory,
  getInterShardMemorySize,
  serializeInterShardMemory
} from "../src/schema.ts";

describe("InterShardMemory Schema", () => {
  it("creates compact default memory", () => {
    const memory = createDefaultInterShardMemory();

    expect(memory.version).to.equal(1);
    expect(memory.tasks).to.deep.equal([]);
    expect(getInterShardMemorySize(memory)).to.be.greaterThan(0);
  });

  it("round-trips serialized shard state with checksum validation", () => {
    const memory = createDefaultInterShardMemory();
    memory.shards.shard0 = createDefaultShardState("shard0");
    memory.lastSync = 12345;

    const serialized = serializeInterShardMemory(memory);
    const restored = deserializeInterShardMemory(serialized);

    expect(restored).to.not.be.null;
    expect(restored!.shards.shard0.name).to.equal("shard0");
    expect(restored!.lastSync).to.equal(12345);
  });

  it("rejects invalid serialized data", () => {
    expect(deserializeInterShardMemory("{not valid json")).to.be.null;
  });
});

import { expect } from "chai";
import {
  createDefaultInterShardMemory,
  createDefaultShardState,
  deserializeInterShardMemory,
  getInterShardMemorySize,
  serializeInterShardMemory
} from "../src/schema.ts";
import { ShardManager, type ShardManagerConfig } from "../src/index.ts";

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

  it("exports shard manager config type", () => {
    const config: ShardManagerConfig = {
      updateInterval: 100,
      minBucket: 0,
      maxCpuBudget: 0.02,
      defaultCpuLimit: 20,
    };

    expect(config.updateInterval).to.equal(100);
    expect(config.minBucket).to.equal(0);
    expect(config.maxCpuBudget).to.equal(0.02);
    expect(config.defaultCpuLimit).to.equal(20);
  });

  it("excludes permanent allies from shard war-index health", () => {
    const game = (global as any).Game;
    game.rooms = {
      W1N1: {
        controller: { my: true, level: 4 },
        find: (type: FindConstant) => {
          if (type === FIND_HOSTILE_CREEPS) {
            return [
              { owner: { username: "TooAngel" } },
              { owner: { username: "TedRoastBeef" } },
              { owner: { username: "Invader" } }
            ];
          }
          if (type === FIND_MY_STRUCTURES) return [];
          return [];
        }
      }
    };
    game.creeps = {};

    const manager = new ShardManager();
    manager.initialize();
    (manager as any).updateCurrentShardHealth();

    expect((manager as any).interShardMemory.shards.shard0.health.warIndex).to.equal(10);
  });
});

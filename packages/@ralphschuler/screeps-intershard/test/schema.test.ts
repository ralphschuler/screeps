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

  it("keeps the default memory wire format stable", () => {
    expect(serializeInterShardMemory(createDefaultInterShardMemory())).to.equal(
      '{"d":{"v":1,"s":[],"g":{"pl":0,"en":[]},"k":[],"ls":0},"c":225783770}'
    );
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

  it("preserves compact wire fields for shards, enemies, tasks, and cpu history", () => {
    const memory = createDefaultInterShardMemory();
    const shard = createDefaultShardState("shard0");
    shard.role = "resource";
    shard.health = {
      cpuCategory: "high",
      cpuUsage: 0.777,
      bucketLevel: 7500,
      economyIndex: 82.4,
      warIndex: 9.6,
      commodityIndex: 12.3,
      roomCount: 3,
      avgRCL: 6.27,
      creepCount: 42,
      lastUpdate: 222
    };
    shard.activeTasks = ["transfer-1"];
    shard.portals = [{
      sourceRoom: "W1N1",
      sourcePos: { x: 12, y: 34 },
      targetShard: "shard1",
      targetRoom: "W9N9",
      threatRating: 2,
      lastScouted: 999,
      decayTick: 1200,
      isStable: false,
      traversalCount: 7
    }];
    shard.cpuLimit = 42;
    shard.cpuHistory = [1, 2, 3, 4, 5, 6].map(tick => ({
      tick,
      cpuLimit: 20 + tick,
      cpuUsed: tick + 0.555,
      bucketLevel: 9000 - tick
    }));
    memory.shards.shard0 = shard;
    memory.globalTargets = {
      targetPowerLevel: 5,
      mainWarShard: "shard3",
      primaryEcoShard: "shard0",
      colonizationTarget: "shard2",
      enemies: [{
        username: "TooAngel",
        rooms: ["W1N1"],
        threatLevel: 0,
        lastSeen: 444,
        isAlly: true
      }]
    };
    memory.tasks = [{
      id: "transfer-1",
      type: "transfer",
      sourceShard: "shard0",
      targetShard: "shard1",
      targetRoom: "W9N9",
      resourceType: "energy" as ResourceConstant,
      resourceAmount: 1500,
      priority: 80,
      status: "active",
      createdAt: 111,
      updatedAt: 112,
      progress: 25
    }];

    const restored = deserializeInterShardMemory(serializeInterShardMemory(memory));

    expect(restored).to.not.be.null;
    expect(restored!.shards.shard0.role).to.equal("resource");
    expect(restored!.shards.shard0.health.cpuCategory).to.equal("high");
    expect(restored!.shards.shard0.health.cpuUsage).to.equal(0.78);
    expect(restored!.shards.shard0.health.economyIndex).to.equal(82);
    expect(restored!.shards.shard0.health.avgRCL).to.equal(6.3);
    expect(restored!.shards.shard0.portals[0]).to.deep.include({
      sourceRoom: "W1N1",
      targetShard: "shard1",
      targetRoom: "W9N9",
      threatRating: 2,
      lastScouted: 999,
      decayTick: 1200,
      isStable: false,
      traversalCount: 7
    });
    expect(restored!.shards.shard0.portals[0].sourcePos).to.deep.equal({ x: 12, y: 34 });
    expect(restored!.shards.shard0.cpuHistory?.map(entry => entry.tick)).to.deep.equal([2, 3, 4, 5, 6]);
    expect(restored!.globalTargets.enemies?.[0]).to.deep.equal({
      username: "TooAngel",
      rooms: ["W1N1"],
      threatLevel: 0,
      lastSeen: 444,
      isAlly: true
    });
    expect(restored!.tasks[0]).to.deep.equal({
      id: "transfer-1",
      type: "transfer",
      sourceShard: "shard0",
      targetShard: "shard1",
      targetRoom: "W9N9",
      resourceType: "energy",
      resourceAmount: 1500,
      priority: 80,
      status: "active",
      createdAt: 0,
      progress: 25
    });
  });

  it("round-trips peaceful footprint operation state", () => {
    const memory = createDefaultInterShardMemory();
    memory.footprintOperation = {
      id: "auto-footprint-v1",
      enabled: true,
      targetShards: ["shard0", "shard1", "shard2", "shard3", "shardX"],
      targets: {
        shard2: {
          shard: "shard2",
          status: "claimTargetSelected",
          portalRoom: "W15S25",
          portalPos: { x: 25, y: 25 },
          destinationRoom: "W15S25",
          claimTargetRoom: "W14S25",
          attempts: 1,
          lastUpdate: 123
        }
      },
      startedAt: 100,
      updatedAt: 123
    };

    const restored = deserializeInterShardMemory(serializeInterShardMemory(memory));

    expect(restored?.footprintOperation?.targets.shard2.status).to.equal("claimTargetSelected");
    expect(restored?.footprintOperation?.targets.shard2.portalPos).to.deep.equal({ x: 25, y: 25 });
    expect(restored?.footprintOperation?.targets.shard2.claimTargetRoom).to.equal("W14S25");
  });

  it("rejects checksum mismatches", () => {
    const memory = createDefaultInterShardMemory();
    memory.lastSync = 123;
    const payload = JSON.parse(serializeInterShardMemory(memory)) as { d: { ls: number }; c: number };
    payload.d.ls = 456;

    expect(deserializeInterShardMemory(JSON.stringify(payload))).to.be.null;
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

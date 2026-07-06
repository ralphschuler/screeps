import { expect } from "chai";
import {
  createDefaultInterShardMemory,
  createDefaultShardState,
  deserializeInterShardMemory
} from "../src/schema.ts";
import { serializeInterShardMemoryForWrite } from "../src/localMemory.ts";

const portalPayload = {
  shard: "shard0",
  lastUpdate: 123,
  portals: {
    W1N1: [{ shard: "shard1", room: "W9N9" }]
  }
};

describe("local InterShardMemory write helpers", () => {
  it("preserves portal namespace, compact schema, global targets, and footprint state across sequential writers", () => {
    let payload = JSON.stringify({ "portals:": portalPayload });

    const globalTargetsWrite = createDefaultInterShardMemory();
    globalTargetsWrite.globalTargets = {
      targetPowerLevel: 2,
      enemies: [{ username: "Invader", rooms: ["W1N1"], threatLevel: 2, lastSeen: 456, isAlly: false }]
    };
    payload = serializeInterShardMemoryForWrite(globalTargetsWrite, payload, { updatedSections: ["globalTargets"] });

    const footprintWrite = createDefaultInterShardMemory();
    footprintWrite.footprintOperation = {
      id: "auto-footprint-v1",
      enabled: true,
      targetShards: ["shard0", "shard1"],
      targets: {
        shard1: { shard: "shard1", status: "reached", attempts: 1, lastUpdate: 789 }
      },
      startedAt: 700,
      updatedAt: 789
    };
    payload = serializeInterShardMemoryForWrite(footprintWrite, payload, { updatedSections: ["footprintOperation"] });

    const shardWrite = createDefaultInterShardMemory();
    shardWrite.shards.shard0 = createDefaultShardState("shard0");
    shardWrite.shards.shard0.health.roomCount = 3;
    shardWrite.lastSync = 900;
    payload = serializeInterShardMemoryForWrite(shardWrite, payload, { updatedSections: ["shards", "lastSync"] });

    const raw = JSON.parse(payload) as Record<string, unknown>;
    expect(raw["portals:"]).to.deep.equal(portalPayload);
    expect(raw.d).to.be.an("object");
    expect(raw.c).to.be.a("number");

    const restored = deserializeInterShardMemory(payload);
    expect(restored).to.not.be.null;
    expect(restored!.globalTargets.targetPowerLevel).to.equal(2);
    expect(restored!.globalTargets.enemies?.[0]?.username).to.equal("Invader");
    expect(restored!.footprintOperation?.targets.shard1.status).to.equal("reached");
    expect(restored!.shards.shard0.health.roomCount).to.equal(3);
    expect(restored!.lastSync).to.equal(900);
  });
});

import { expect } from "chai";
import { isKnownAllyPlayer } from "@ralphschuler/screeps-core";
import { mergeCrossShardEnemyIntel } from "../../src/empire/crossShardIntelMerge";

describe("Cross-shard intel merge protocol Module", () => {
  it("merges existing enemies, war targets, and room intel by username", () => {
    const intent = mergeCrossShardEnemyIntel({
      existingEnemies: [{ username: "Enemy", rooms: ["W1N1"], threatLevel: 1, lastSeen: 10, isAlly: false }],
      warTargets: ["Enemy", "Raider"],
      knownRooms: [{ roomName: "W2N2", owner: "Enemy", threatLevel: 3, lastSeen: 20 }],
      now: 30,
      isAlly: () => false
    });

    expect(intent.enemies).to.deep.equal([
      { username: "Enemy", rooms: ["W1N1", "W2N2"], threatLevel: 3, lastSeen: 30, isAlly: false },
      { username: "Raider", rooms: [], threatLevel: 1, lastSeen: 30, isAlly: false }
    ]);
  });

  it("resolves room-name war targets to their current room owner", () => {
    const intent = mergeCrossShardEnemyIntel({
      existingEnemies: [],
      warTargets: ["W1N1"],
      knownRooms: [{ roomName: "W1N1", owner: "Enemy", threatLevel: 0, lastSeen: 40 }],
      now: 50,
      isAlly: () => false
    });

    expect(intent.enemies).to.deep.equal([
      { username: "Enemy", rooms: ["W1N1"], threatLevel: 1, lastSeen: 50, isAlly: false }
    ]);
  });

  it("ignores room-name war targets that have no known owner", () => {
    const intent = mergeCrossShardEnemyIntel({
      existingEnemies: [],
      warTargets: ["W1N1"],
      knownRooms: [],
      now: 50,
      isAlly: () => false
    });

    expect(intent.enemies).to.deep.equal([]);
  });

  it("filters permanent allies from stale enemies, war targets, and room intel", () => {
    const intent = mergeCrossShardEnemyIntel({
      existingEnemies: [{ username: "TooAngel", rooms: ["W1N1"], threatLevel: 3, lastSeen: 10, isAlly: false }],
      warTargets: ["TedRoastBeef"],
      knownRooms: [{ roomName: "W2N2", owner: "TooAngel", threatLevel: 3, lastSeen: 20 }],
      now: 30,
      isAlly: username => username === "TooAngel" || username === "TedRoastBeef"
    });

    expect(intent.enemies).to.deep.equal([]);
    expect(intent.skippedAllies).to.deep.equal(["TedRoastBeef", "TooAngel"]);
  });

  it("filters runtime configured allies from stale enemies, war targets, and room intel", () => {
    const empire = { diplomacy: { allies: ["FriendlyNeighbor"] } };
    const intent = mergeCrossShardEnemyIntel({
      existingEnemies: [{ username: "FriendlyNeighbor", rooms: ["W1N1"], threatLevel: 3, lastSeen: 10, isAlly: false }],
      warTargets: ["FriendlyNeighbor", "W2N2"],
      knownRooms: [{ roomName: "W2N2", owner: "FriendlyNeighbor", threatLevel: 3, lastSeen: 20 }],
      now: 30,
      isAlly: username => isKnownAllyPlayer(username, { empire })
    });

    expect(intent.enemies).to.deep.equal([]);
    expect(intent.skippedAllies).to.deep.equal(["FriendlyNeighbor"]);
  });

  it("skips Source Keeper ownership records", () => {
    const intent = mergeCrossShardEnemyIntel({
      existingEnemies: [],
      warTargets: [],
      knownRooms: [{ roomName: "W3N3", owner: "Source Keeper", threatLevel: 2, lastSeen: 99 }],
      now: 100,
      isAlly: () => false
    });

    expect(intent.enemies).to.deep.equal([]);
    expect(intent.skippedSourceKeepers).to.deep.equal(["Source Keeper"]);
  });
});

import assert from "node:assert/strict";
import test from "node:test";

import {
  collectSnapshotMemory,
  createSnapshotApi,
  evaluateStructuralSnapshotHealth,
  formatStructuralSnapshotCliError,
  parseMemoryPathsOption,
  parseOptions,
  redactedSnapshotError
} from "../../packages/screeps-server/scripts/export-live-structural-snapshot.js";
import { buildStructuralSnapshot } from "../../packages/screeps-server/scripts/cpu-benchmark-model.js";

const RATE_LIMIT_MESSAGE = [
  "Rate limit exceeded, retry after 123ms or disable rate limiting using this link:",
  "https://screeps.com/a/#!/account/auth-tokens/noratelimit?token=6ea62d57"
].join(" ");

test("structural snapshot memory errors redact Screeps API token fragments", () => {
  const entry = redactedSnapshotError({ type: "memory", path: "stats" }, new Error(RATE_LIMIT_MESSAGE));

  assert.equal(entry.type, "memory");
  assert.equal(entry.path, "stats");
  assert.equal(entry.message.includes("6ea62d57"), false);
  assert.equal(entry.message.includes("token=<redacted>"), true);
});

test("structural snapshot room endpoint errors redact token fragments", () => {
  for (const fields of [
    { type: "roomStatus", room: "W1N1" },
    { type: "roomObjects", room: "W1N1" }
  ]) {
    const entry = redactedSnapshotError(fields, `X-Token: abc123 ${RATE_LIMIT_MESSAGE} SCREEPS_TOKEN=secret123`);

    assert.equal(entry.type, fields.type);
    assert.equal(entry.room, "W1N1");
    assert.equal(entry.message.includes("abc123"), false);
    assert.equal(entry.message.includes("secret123"), false);
    assert.equal(entry.message.includes("6ea62d57"), false);
    assert.equal(entry.message.includes("token=<redacted>"), true);
  }
});

test("structural snapshot top-level CLI errors redact token fragments", () => {
  const error = new Error(`X-Token: abc123 ${RATE_LIMIT_MESSAGE}`);
  error.stack = `Error: X-Token: abc123 SCREEPS_TOKEN=secret123 ${RATE_LIMIT_MESSAGE}\n    at fetch (https://screeps.com/api/user/memory?access_token=abcd&path=stats)`;

  const message = formatStructuralSnapshotCliError(error);

  assert.equal(message.includes("abc123"), false);
  assert.equal(message.includes("secret123"), false);
  assert.equal(message.includes("6ea62d57"), false);
  assert.equal(message.includes("access_token=abcd"), false);
  assert.equal(message.includes("token=<redacted>"), true);
  assert.equal(message.includes("access_token=<redacted>"), true);
  assert.equal(message.includes("path=stats"), true);
});

test("structural snapshot top-level CLI errors redact non-Error token fragments", () => {
  const message = formatStructuralSnapshotCliError(`X-Token: abc123 ${RATE_LIMIT_MESSAGE} SCREEPS_TOKEN=secret123`);

  assert.equal(message.includes("abc123"), false);
  assert.equal(message.includes("secret123"), false);
  assert.equal(message.includes("6ea62d57"), false);
  assert.equal(message.includes("token=<redacted>"), true);
});

test("structural snapshot parser supports deploy-gate and source flags", () => {
  const options = parseOptions([
    "--shard", "shard3",
    "--rooms", "W1N1,W2N2",
    "--stats-source", "memory",
    "--console-timeout", "2500",
    "--memory-paths", "stats,rooms",
    "--fail-on-memory-errors"
  ], {
    SCREEPS_HOSTNAME: "screeps.com",
    SCREEPS_PROTOCOL: "https",
    SCREEPS_PORT: "443"
  });

  assert.equal(options.shard, "shard3");
  assert.deepEqual(options.rooms, ["W1N1", "W2N2"]);
  assert.equal(options.statsSource, "memory");
  assert.equal(options.consoleTimeout, 2500);
  assert.deepEqual(options.memoryPaths, ["stats", "rooms"]);
  assert.equal(options.failOnMemoryErrors, true);
});

test("structural snapshot parser defaults to console stats with automatic Memory policy", () => {
  const options = parseOptions(["--shard", "shard1", "--rooms", "W1N1"], {});

  assert.equal(options.statsSource, "console");
  assert.equal(options.consoleTimeout, 15000);
  assert.equal(options.memoryPaths, "auto");
});

test("structural snapshot memory path parser rejects unsupported paths", () => {
  assert.deepEqual(parseMemoryPathsOption("none"), []);
  assert.deepEqual(parseMemoryPathsOption("all"), ["stats", "creeps", "rooms", "creepTaskBoard", "defenseRequests", "clusters", "empire"]);
  assert.throws(() => parseMemoryPathsOption("stats,unknown"), /unsupported path/);
});

test("structural snapshot health fails only when requested memory errors are present", () => {
  const snapshot = {
    errors: [
      { type: "memory", path: "stats", message: "Rate limit exceeded token=<redacted>" },
      { type: "roomObjects", room: "W1N1", message: "timeout" }
    ]
  };

  const strict = evaluateStructuralSnapshotHealth(snapshot, { failOnMemoryErrors: true });
  assert.equal(strict.ok, false);
  assert.equal(strict.status, "failed");
  assert.equal(strict.memory_errors, 1);
  assert.equal(strict.total_errors, 2);
  assert.match(strict.message, /Memory API errors/);

  const degraded = evaluateStructuralSnapshotHealth(snapshot, { failOnMemoryErrors: false });
  assert.equal(degraded.ok, true);
  assert.equal(degraded.status, "degraded");
  assert.equal(degraded.memory_errors, 1);
});

test("structural snapshot API wrapper supports the current ScreepsHttpClient module shape", async () => {
  const previousToken = process.env.SCREEPS_TOKEN;
  process.env.SCREEPS_TOKEN = "test-token";
  try {
    class FakeHttpClient {
      constructor(options) {
        this.options = options;
        this.socket = { kind: "socket" };
      }
      async me() { return { username: "TedRoastBeef" }; }
      async gameTime(shard) { return { time: shard === "shard1" ? 123 : 0 }; }
      async userMemoryGet(path, shard) { return { data: { path, shard } }; }
      async gameRoomStatus(roomName, shard) { return { roomName, shard, status: "normal" }; }
      async gameRoomObjects(roomName, shard) { return { objects: [{ roomName, shard }], users: {} }; }
    }

    const api = createSnapshotApi({ ScreepsHttpClient: FakeHttpClient }, {
      hostname: "screeps.com",
      protocol: "https",
      port: 443
    });

    assert.equal(api.transport, "ScreepsHttpClient");
    assert.deepEqual(api.methods, {
      me: "api.me",
      time: "api.gameTime",
      roomStatus: "api.gameRoomStatus",
      roomObjects: "api.gameRoomObjects"
    });
    assert.deepEqual(await api.me(), { username: "TedRoastBeef" });
    assert.deepEqual(await api.time("shard1"), { time: 123 });
    assert.deepEqual(await api.memoryGet("stats", "shard1"), { data: { path: "stats", shard: "shard1" } });
    assert.deepEqual(await api.roomStatus("W1N1", "shard1"), { roomName: "W1N1", shard: "shard1", status: "normal" });
    assert.deepEqual(await api.roomObjects("W1N1", "shard1"), { objects: [{ roomName: "W1N1", shard: "shard1" }], users: {} });
  } finally {
    if (previousToken === undefined) delete process.env.SCREEPS_TOKEN;
    else process.env.SCREEPS_TOKEN = previousToken;
  }
});

test("structural snapshot memory mode fetches requested Memory paths", async () => {
  const memoryCalls = [];
  const api = {
    async memoryGet(path, shard) {
      memoryCalls.push([path, shard]);
      return { data: { marker: path } };
    }
  };

  const options = parseOptions(["--shard", "shard1", "--stats-source", "memory", "--memory-paths", "all"], {});
  const result = await collectSnapshotMemory(api, options);

  assert.deepEqual(memoryCalls, [
    ["stats", "shard1"],
    ["creeps", "shard1"],
    ["rooms", "shard1"],
    ["creepTaskBoard", "shard1"],
    ["defenseRequests", "shard1"],
    ["clusters", "shard1"],
    ["empire", "shard1"]
  ]);
  assert.equal(result.memory.stats.marker, "stats");
  assert.equal(result.memory.creepTaskBoard.marker, "creepTaskBoard");
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.apiMethods, ["api.memory.get"]);
});

test("structural snapshot uses console stats without Memory API calls when explicit rooms are supplied", async () => {
  const memoryCalls = [];
  let disconnected = false;
  const api = {
    socket: {
      async subscribeUserConsole(handler) {
        this.handler = handler;
      },
      async connect() {
        this.handler({
          data: {
            shard: "shard1",
            messages: {
              log: ['{&quot;type&quot;:&quot;stats&quot;,&quot;data&quot;:{&quot;tick&quot;:500,&quot;cpu&quot;:{&quot;used&quot;:7,&quot;bucket&quot;:9000},&quot;rooms&quot;:{&quot;W1N1&quot;:{&quot;rcl&quot;:5,&quot;taskBoard&quot;:{&quot;tasks&quot;:3,&quot;openTasks&quot;:1},&quot;defense&quot;:{&quot;towers&quot;:1}}}}}']
            }
          }
        });
      },
      disconnect() {
        disconnected = true;
      }
    },
    time: async () => ({ time: 501 }),
    memory: {
      async get(path) {
        memoryCalls.push(path);
        throw new Error("memory should not be read for explicit-room console snapshots");
      }
    }
  };

  const options = parseOptions(["--shard", "shard1", "--rooms", "W1N1", "--console-timeout", "100"], {});
  const result = await collectSnapshotMemory(api, options);

  assert.equal(disconnected, true);
  assert.deepEqual(memoryCalls, []);
  assert.equal(result.memory.stats.tick, 500);
  assert.equal(result.memory.stats.rooms.W1N1.taskBoard.openTasks, 1);
  assert.equal(result.errors.length, 0);
  assert.equal(result.apiMethods.includes("api.memory.get"), false);
});

test("structural snapshot source policy records console methods and compact stats summaries", () => {
  const snapshot = buildStructuralSnapshot({
    hostname: "screeps.com",
    shard: "shard1",
    tick: 501,
    myUserName: "TedRoastBeef",
    memory: {
      stats: {
        tick: 500,
        cpu: { used: 7, bucket: 9000 },
        rooms: {
          W1N1: {
            rcl: 5,
            creeps: 12,
            taskBoard: { tasks: 3, openTasks: 1, reservations: 2, remainingAmount: 150 },
            defense: { towers: 1, towerEnergy: 600, towerEnergyPercent: 0.8 }
          }
        }
      }
    },
    roomResponses: { W1N1: { objects: [], users: {} } },
    apiMethods: ["api.me", "socket.subscribeUserConsole", "api.time", "api.raw.game.roomObjects", "api.raw.game.roomStatus"],
    statsSource: "console"
  });

  assert.equal(snapshot.source.apiPolicy.statsSource, "console");
  assert.equal(snapshot.source.apiPolicy.methodsUsed.includes("api.memory.get"), false);
  assert.equal(snapshot.memorySummary.stats.rooms.W1N1.taskBoard.openTasks, 1);
  assert.equal(snapshot.memorySummary.stats.rooms.W1N1.defense.towers, 1);
});

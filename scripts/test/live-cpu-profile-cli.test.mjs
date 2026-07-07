import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  collectConsoleSamples,
  evaluateStatsFreshness,
  evaluateTelemetryHealth,
  extractConsoleStatsSamples,
  formatHelp,
  parseArgs,
  parseConsoleStatsLine,
  summarizeShard
} from "../live-cpu-profile.mjs";

const rootPackage = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));

test("parseArgs honors documented CLI flags", () => {
  const args = parseArgs([
    "node",
    "scripts/live-cpu-profile.mjs",
    "--samples", "3",
    "--interval", "250",
    "--shards", "shard1, shard3",
    "--out-dir", "artifacts/test-cpu",
    "--hostname", "localhost",
    "--protocol", "http",
    "--port", "21025",
    "--max-stats-age", "25",
    "--source", "memory",
    "--console-timeout", "1200",
    "--allow-empty",
    "--allow-stale"
  ]);

  assert.deepEqual(args, {
    samples: 3,
    interval: 250,
    shards: ["shard1", "shard3"],
    outDir: "artifacts/test-cpu",
    hostname: "localhost",
    protocol: "http",
    port: 21025,
    maxStatsAge: 25,
    source: "memory",
    consoleTimeout: 1200,
    allowEmpty: true,
    allowStale: true
  });
});

test("help documents all flags and Screeps env vars", () => {
  const help = formatHelp();

  for (const text of [
    "--samples <n>",
    "--interval <ms>",
    "--shards <list>",
    "--out-dir <path>",
    "--hostname <host>",
    "--protocol <http|https>",
    "--port <n>",
    "--max-stats-age <ticks>",
    "--source <console|memory>",
    "--console-timeout <ms>",
    "--allow-empty",
    "--allow-stale",
    "SCREEPS_TOKEN",
    "SCREEPS_HOSTNAME",
    "SCREEPS_PROTOCOL",
    "SCREEPS_PORT",
    "SCREEPS_PATH",
    "WebSocket"
  ]) {
    assert.match(help, new RegExp(text.replace(/[|]/g, "\\|")));
  }

  const result = spawnSync(process.execPath, ["scripts/live-cpu-profile.mjs", "--help"], {
    cwd: new URL("../..", import.meta.url),
    encoding: "utf8"
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /SCREEPS_PATH/);
  assert.equal(result.stderr, "");
});

test("rejects invalid arguments", () => {
  assert.throws(() => parseArgs(["node", "script", "--samples", "0"]), /--samples must be >= 1/);
  assert.throws(() => parseArgs(["node", "script", "--interval", "-1"]), /--interval must be >= 0/);
  assert.throws(() => parseArgs(["node", "script", "--port", "not-a-number"]), /--port must be a number/);
  assert.throws(() => parseArgs(["node", "script", "--port", "0"]), /--port must be between 1 and 65535/);
  assert.throws(() => parseArgs(["node", "script", "--max-stats-age", "0"]), /--max-stats-age must be >= 1/);
  assert.throws(() => parseArgs(["node", "script", "--source", "file"]), /--source must be console or memory/);
  assert.throws(() => parseArgs(["node", "script", "--console-timeout", "0"]), /--console-timeout must be >= 1/);
  assert.throws(() => parseArgs(["node", "script", "--protocol", "ftp"]), /--protocol must be http or https/);
  assert.throws(() => parseArgs(["node", "script", "--shards", ","]), /--shards must include at least one shard/);
});

test("parseConsoleStatsLine extracts typed stats payloads", () => {
  const stats = parseConsoleStatsLine('{"type":"stats","tick":123,"data":{"cpu":{"used":5,"bucket":9000}}}');
  const escaped = parseConsoleStatsLine("{&#x22;type&#x22;:&#x22;stats&#x22;,&#x22;data&#x22;:{&#x22;tick&#x22;:124}}");

  assert.deepEqual(stats, { tick: 123, cpu: { used: 5, bucket: 9000 } });
  assert.deepEqual(escaped, { tick: 124 });
  assert.equal(parseConsoleStatsLine("not json"), null);
  assert.equal(parseConsoleStatsLine('{"type":"log","data":{}}'), null);
});

test("extractConsoleStatsSamples filters console stats by requested shard", () => {
  const samples = extractConsoleStatsSamples(
    {
      data: {
        shard: "shard1",
        messages: {
          log: [
            "plain log\n{\"type\":\"stats\",\"data\":{\"tick\":200,\"cpu\":{\"used\":7,\"bucket\":8000}}}"
          ],
          results: ['{"type":"stats","data":{"tick":201,"cpu":{"used":8,"bucket":8100}}}']
        }
      }
    },
    ["shard1"]
  );

  assert.deepEqual(samples, [
    { shard: "shard1", stats: { tick: 200, cpu: { used: 7, bucket: 8000 } } },
    { shard: "shard1", stats: { tick: 201, cpu: { used: 8, bucket: 8100 } } }
  ]);
  assert.deepEqual(extractConsoleStatsSamples({ data: { shard: "shard3", messages: { log: samples } } }, ["shard1"]), []);
});

test("collectConsoleSamples uses the console stream without Memory polling", async () => {
  let disconnected = false;
  const fakeSocket = {
    async subscribeUserConsole(handler) {
      this.handler = handler;
    },
    async connect() {
      this.handler({
        data: {
          shard: "shard1",
          messages: { log: ['{"type":"stats","data":{"tick":300,"cpu":{"used":4,"bucket":9000}}}'] }
        }
      });
      this.handler({
        data: {
          shard: "shard1",
          messages: { log: ['{"type":"stats","data":{"tick":301,"cpu":{"used":6,"bucket":8800}}}'] }
        }
      });
    },
    disconnect() {
      disconnected = true;
    }
  };
  const apiClient = {
    socket: fakeSocket,
    gameTime: async shard => ({ time: shard === "shard1" ? 302 : 0 }),
    memoryGet: async () => {
      throw new Error("memory should not be read");
    }
  };

  const collection = await collectConsoleSamples(apiClient, {
    shards: ["shard1"],
    samples: 2,
    interval: 0,
    consoleTimeout: 100,
    maxStatsAge: 10
  });

  assert.equal(collection.source, "console");
  assert.equal(collection.status, "complete");
  assert.equal(disconnected, true);
  assert.deepEqual(collection.apiMethods, ["api.auth/me", "socket.subscribeUserConsole", "api.time|api.gameTime"]);
  assert.deepEqual(collection.byShard.shard1.map(stats => stats.tick), [300, 301]);
  assert.equal(collection.gameTicksByShard.shard1, 302);
});

test("collectConsoleSamples returns bounded timeout errors before subscription completes", async () => {
  const fakeSocket = {
    async subscribeUserConsole() {
      return new Promise(() => {});
    },
    connect() {
      throw new Error("connect should not be called after subscription timeout");
    },
    disconnect() {}
  };
  const apiClient = {
    socket: fakeSocket,
    gameTime: async () => ({ time: 400 })
  };

  const started = Date.now();
  const collection = await collectConsoleSamples(apiClient, {
    shards: ["shard1"],
    samples: 1,
    interval: 0,
    consoleTimeout: 5,
    maxStatsAge: 10
  });

  assert.equal(collection.status, "timeout");
  assert.equal(collection.byShard.shard1.length, 0);
  assert.match(collection.errorsByShard.shard1[0].message, /Timed out waiting for Screeps console subscription/);
  assert.ok(Date.now() - started < 250);
});

test("summarizeShard aggregates CPU stats and sorted top rows", () => {
  const summary = summarizeShard([
    {
      tick: 100,
      cpu: { used: 12, bucket: 8000 },
      empire: { skipped_processes: 1 },
      subsystems: {
        movement: { avg_cpu: 2, peak_cpu: 5, calls: 10 },
        spawning: { avg_cpu: 1, peak_cpu: 3, calls: 5 }
      },
      processes: {
        "room:W1N1": { name: "Room", avg_cpu: 3, max_cpu: 6, frequency: 1, run_count: 1, skipped_count: 0, cpu_budget: 0.1 }
      },
      rooms: {
        W1N1: { profiler: { avg_cpu: 4, peak_cpu: 7 }, rcl: 8, creeps: 42 }
      },
      roles: {
        hauler: { avg_cpu: 0.5, peak_cpu: 1, count: 4, active_count: 3, idle_count: 1 }
      },
      cpu_details: {
        entries: {
          enabled: true,
          pathfinder: { avg_cpu: 1.25, max_cpu: 2, calls: 3 }
        }
      }
    },
    {
      tick: 102,
      cpu: { used: 18, bucket: 7000 },
      empire: { skipped_processes: 3 },
      subsystems: {
        movement: { avg_cpu: 4, peak_cpu: 8, calls: 10 }
      }
    }
  ]);

  assert.equal(summary.samples, 2);
  assert.equal(summary.tick_first, 100);
  assert.equal(summary.tick_last, 102);
  assert.equal(summary.cpu_avg, 15);
  assert.equal(summary.cpu_max, 18);
  assert.equal(summary.bucket_min, 7000);
  assert.equal(summary.skipped_avg, 2);
  assert.deepEqual(summary.top_subsystems.map(row => row.key), ["movement", "spawning"]);
  assert.equal(summary.top_subsystems[0].avg, 3);
  assert.equal(summary.top_processes[0].name, "Room");
  assert.equal(summary.top_rooms[0].rcl, 8);
  assert.equal(summary.top_roles[0].active, 3);
  assert.equal(summary.top_cpu_details[0].key, "pathfinder");
  assert.equal(summary.read_errors, 0);
  assert.deepEqual(summary.errors, []);
});

test("summarizeShard records redacted read errors", () => {
  const summary = summarizeShard([], [{ sample: 1, message: "Rate limit exceeded token=<redacted>" }]);

  assert.equal(summary.samples, 0);
  assert.equal(summary.read_errors, 1);
  assert.deepEqual(summary.errors, [{ sample: 1, message: "Rate limit exceeded token=<redacted>" }]);
});

test("telemetry health fails closed when every requested shard has zero samples", () => {
  const summary = {
    shards: {
      shard1: { samples: 0, read_errors: 2 },
      shard3: { samples: 0, read_errors: 1 }
    }
  };

  const health = evaluateTelemetryHealth(summary, { allowEmpty: false });

  assert.equal(health.ok, false);
  assert.equal(health.status, "failed");
  assert.deepEqual(health.empty_shards, ["shard1", "shard3"]);
  assert.equal(health.read_errors, 3);
  assert.match(health.message, /zero live CPU samples/);
});

test("telemetry health allows explicit degraded zero-sample artifact collection", () => {
  const summary = { shards: { shard1: { samples: 0, read_errors: 1 } } };

  const health = evaluateTelemetryHealth(summary, { allowEmpty: true });

  assert.equal(health.ok, true);
  assert.equal(health.status, "degraded");
  assert.equal(health.allow_empty, true);
});

test("telemetry health reports partial samples without failing", () => {
  const summary = {
    shards: {
      shard1: { samples: 2, read_errors: 0 },
      shard3: { samples: 0, read_errors: 1 }
    }
  };

  const health = evaluateTelemetryHealth(summary, { allowEmpty: false });

  assert.equal(health.ok, true);
  assert.equal(health.status, "partial");
  assert.deepEqual(health.empty_shards, ["shard3"]);
});

test("stats freshness classifies fresh, missing, and stale ticks", () => {
  assert.deepEqual(
    evaluateStatsFreshness({ samples: 1, statsTick: 1000, gameTick: 1005, maxStatsAge: 10 }),
    {
      ok: true,
      status: "fresh",
      game_tick: 1005,
      stats_tick: 1000,
      age_ticks: 5,
      max_age_ticks: 10,
      reason: "Memory.stats tick is fresh."
    }
  );

  assert.deepEqual(
    evaluateStatsFreshness({ samples: 1, statsTick: undefined, gameTick: 1005, maxStatsAge: 10 }),
    {
      ok: false,
      status: "missing",
      game_tick: 1005,
      stats_tick: null,
      age_ticks: null,
      max_age_ticks: 10,
      reason: "Memory.stats tick is missing."
    }
  );

  assert.deepEqual(
    evaluateStatsFreshness({ samples: 1, statsTick: 900, gameTick: 1005, maxStatsAge: 10 }),
    {
      ok: false,
      status: "stale",
      game_tick: 1005,
      stats_tick: 900,
      age_ticks: 105,
      max_age_ticks: 10,
      reason: "Memory.stats tick is stale by 105 ticks."
    }
  );
});

test("summarizeShard embeds per-shard freshness details when game tick is known", () => {
  const summary = summarizeShard(
    [{ tick: 100, cpu: { used: 1, bucket: 9000 } }],
    [],
    { gameTick: 104, maxStatsAge: 10 }
  );

  assert.equal(summary.game_tick, 104);
  assert.equal(summary.stats_tick_age, 4);
  assert.equal(summary.freshness.status, "fresh");
  assert.match(summary.freshness.reason, /fresh/);
});

test("summarizeShard treats the latest missing stats tick as unhealthy", () => {
  const summary = summarizeShard(
    [
      { tick: 100, cpu: { used: 1, bucket: 9000 } },
      { cpu: { used: 1, bucket: 9000 } }
    ],
    [],
    { gameTick: 101, maxStatsAge: 10 }
  );

  assert.equal(summary.tick_last, 100);
  assert.equal(summary.freshness.status, "missing");
  assert.equal(summary.freshness.ok, false);
});

test("telemetry health fails on missing or stale stats ticks", () => {
  const summary = {
    shards: {
      shard0: summarizeShard([{ cpu: { bucket: 906 } }], [], { gameTick: 76165765, maxStatsAge: 100 }),
      shard1: summarizeShard([{ tick: 72119539, cpu: { used: 46, bucket: 9962 } }], [], { gameTick: 72119539, maxStatsAge: 100 }),
      shard3: summarizeShard([{ tick: 79383724, cpu: { used: 5, bucket: 7985 } }], [], { gameTick: 81307055, maxStatsAge: 100 })
    }
  };

  const health = evaluateTelemetryHealth(summary, { allowEmpty: false, allowStale: false });

  assert.equal(health.ok, false);
  assert.equal(health.status, "failed");
  assert.deepEqual(health.missing_stats_shards, ["shard0"]);
  assert.deepEqual(health.stale_stats_shards, ["shard3"]);
  assert.match(health.message, /stale\/missing Memory.stats ticks/);
});

test("telemetry health can explicitly preserve stale artifacts as degraded", () => {
  const summary = {
    shards: {
      shard3: summarizeShard([{ tick: 100, cpu: { used: 5, bucket: 5000 } }], [], { gameTick: 300, maxStatsAge: 50 })
    }
  };

  const health = evaluateTelemetryHealth(summary, { allowEmpty: false, allowStale: true });

  assert.equal(health.ok, true);
  assert.equal(health.status, "degraded");
  assert.deepEqual(health.stale_stats_shards, ["shard3"]);
});

test("allow-stale does not hide api.time freshness failures", () => {
  const summary = {
    shards: {
      shard1: summarizeShard(
        [{ tick: 100, cpu: { used: 5, bucket: 5000 } }],
        [],
        { timeErrors: [{ message: "api.time unavailable" }] }
      )
    }
  };

  const health = evaluateTelemetryHealth(summary, { allowEmpty: false, allowStale: true });

  assert.equal(health.ok, false);
  assert.equal(health.status, "failed");
  assert.deepEqual(health.unknown_stats_shards, ["shard1"]);
});

test("root package exposes a bounded read-only live CPU profile script", () => {
  assert.equal(
    rootPackage.scripts["profile:live:cpu"],
    "node scripts/live-cpu-profile.mjs --source console --samples 20 --interval 3000 --shards shard0,shard1,shard2,shard3 --out-dir artifacts/cpu-profile"
  );
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { formatHelp, parseArgs, summarizeShard } from "../live-cpu-profile.mjs";

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
    "--port", "21025"
  ]);

  assert.deepEqual(args, {
    samples: 3,
    interval: 250,
    shards: ["shard1", "shard3"],
    outDir: "artifacts/test-cpu",
    hostname: "localhost",
    protocol: "http",
    port: 21025
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
    "SCREEPS_TOKEN",
    "SCREEPS_HOSTNAME",
    "SCREEPS_PROTOCOL",
    "SCREEPS_PORT",
    "SCREEPS_PATH"
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
  assert.throws(() => parseArgs(["node", "script", "--protocol", "ftp"]), /--protocol must be http or https/);
  assert.throws(() => parseArgs(["node", "script", "--shards", ","]), /--shards must include at least one shard/);
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
});

test("root package exposes a bounded read-only live CPU profile script", () => {
  assert.equal(
    rootPackage.scripts["profile:live:cpu"],
    "node scripts/live-cpu-profile.mjs --samples 20 --interval 3000 --shards shard0,shard1,shard2,shard3 --out-dir artifacts/cpu-profile"
  );
});

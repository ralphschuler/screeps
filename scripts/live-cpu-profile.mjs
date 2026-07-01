#!/usr/bin/env node
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { ScreepsAPI } = require("screeps-api");

const DEFAULT_SHARDS = ["shard0", "shard1", "shard2", "shard3"];

function parseArgs(argv) {
  const args = {
    samples: 20,
    interval: 3000,
    shards: DEFAULT_SHARDS,
    outDir: "artifacts/cpu-profile",
    hostname: process.env.SCREEPS_HOSTNAME || "screeps.com",
    protocol: process.env.SCREEPS_PROTOCOL || "https",
    port: Number(process.env.SCREEPS_PORT || 443)
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--samples" && next) args.samples = Number(next), i++;
    else if (arg === "--interval" && next) args.interval = Number(next), i++;
    else if (arg === "--shards" && next) args.shards = next.split(",").map(s => s.trim()).filter(Boolean), i++;
    else if (arg === "--out-dir" && next) args.outDir = next, i++;
    else if (arg === "--hostname" && next) args.hostname = next, i++;
    else if (arg === "--protocol" && next) args.protocol = next, i++;
    else if (arg === "--port" && next) args.port = Number(next), i++;
    else if (arg === "--help" || arg === "-h") {
      console.log(`Usage: node scripts/live-cpu-profile.mjs [options]\n\nOptions:\n  --samples <n>       Number of samples (default 20)\n  --interval <ms>     Delay between samples (default 3000)\n  --shards <list>     Comma-separated shards (default shard0,shard1,shard2,shard3)\n  --out-dir <path>    Output directory (default artifacts/cpu-profile)\n  --hostname <host>   Screeps hostname (default screeps.com)\n\nRequires SCREEPS_TOKEN. Read-only: only fetches Memory.stats.`);
      process.exit(0);
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg}`);
    }
  }

  if (!Number.isFinite(args.samples) || args.samples < 1) throw new Error("--samples must be >= 1");
  if (!Number.isFinite(args.interval) || args.interval < 0) throw new Error("--interval must be >= 0");
  return args;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const isFiniteNumber = value => typeof value === "number" && Number.isFinite(value);

export function redactScreepsApiMessage(message) {
  return String(message)
    .replace(/([?&](?:token|access_token|auth)=)[^&#\s)]+/gi, "$1<redacted>")
    .replace(/(\bX-Token:\s*)[^\s)]+/gi, "$1<redacted>")
    .replace(/(\bSCREEPS_TOKEN=)[^\s)]+/g, "$1<redacted>");
}

function addMetric(bucket, key, value, meta = {}) {
  if (!isFiniteNumber(value)) return;
  const entry = bucket[key] || { sum: 0, count: 0, max: 0, meta };
  entry.sum += value;
  entry.count += 1;
  entry.max = Math.max(entry.max, value);
  entry.meta = { ...entry.meta, ...meta };
  bucket[key] = entry;
}

function top(bucket, limit) {
  return Object.entries(bucket)
    .map(([key, value]) => ({ key, avg: value.sum / value.count, max: value.max, samples: value.count, ...value.meta }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, limit);
}

function summarizeShard(samples) {
  const cpu = [];
  const bucket = [];
  const skipped = [];
  const ticks = [];
  const subsystems = {};
  const processes = {};
  const rooms = {};
  const roles = {};
  const cpuDetails = {};

  for (const stats of samples) {
    if (!stats || !stats.cpu) continue;
    if (isFiniteNumber(stats.tick)) ticks.push(stats.tick);
    if (isFiniteNumber(stats.cpu.used)) cpu.push(stats.cpu.used);
    if (isFiniteNumber(stats.cpu.bucket)) bucket.push(stats.cpu.bucket);
    if (isFiniteNumber(stats.empire?.skipped_processes)) skipped.push(stats.empire.skipped_processes);

    for (const [name, value] of Object.entries(stats.subsystems || {})) {
      addMetric(subsystems, name, value.avg_cpu, { peak: value.peak_cpu, calls: value.calls });
    }
    for (const [id, value] of Object.entries(stats.processes || {})) {
      addMetric(processes, id, value.avg_cpu, {
        name: value.name,
        max_cpu: value.max_cpu,
        frequency: value.frequency,
        run_count: value.run_count,
        skipped_count: value.skipped_count,
        cpu_budget: value.cpu_budget
      });
    }
    for (const [name, value] of Object.entries(stats.rooms || {})) {
      addMetric(rooms, name, value.profiler?.avg_cpu, {
        peak: value.profiler?.peak_cpu,
        rcl: value.rcl,
        creeps: value.creeps
      });
    }
    for (const [name, value] of Object.entries(stats.roles || {})) {
      addMetric(roles, name, value.avg_cpu, {
        peak: value.peak_cpu,
        count: value.count,
        active: value.active_count,
        idle: value.idle_count
      });
    }
    for (const [name, value] of Object.entries(stats.cpu_details?.entries || stats.cpu_details || {})) {
      if (name === "enabled" || name === "expires_tick" || name === "sample_rate") continue;
      addMetric(cpuDetails, name, value.avg_cpu ?? value.cpu ?? value.total_cpu, {
        calls: value.calls,
        max_cpu: value.max_cpu
      });
    }
  }

  const avg = list => list.length ? list.reduce((sum, value) => sum + value, 0) / list.length : 0;
  return {
    samples: samples.length,
    tick_first: ticks[0],
    tick_last: ticks[ticks.length - 1],
    cpu_avg: avg(cpu),
    cpu_max: cpu.length ? Math.max(...cpu) : 0,
    bucket_avg: avg(bucket),
    bucket_min: bucket.length ? Math.min(...bucket) : 0,
    skipped_avg: avg(skipped),
    top_subsystems: top(subsystems, 10),
    top_processes: top(processes, 15),
    top_rooms: top(rooms, 10),
    top_roles: top(roles, 10),
    top_cpu_details: top(cpuDetails, 20)
  };
}

async function fetchStats(api, shard) {
  const response = await api.memory.get("stats", shard);
  const stats = response?.data ?? response;
  if (!stats || stats.ok === 1 && !stats.cpu) return null;
  return stats;
}

function printSummary(summary) {
  for (const [shard, data] of Object.entries(summary.shards)) {
    console.log(`\n=== ${shard} ===`);
    console.log(`samples=${data.samples} ticks=${data.tick_first ?? "n/a"}->${data.tick_last ?? "n/a"} cpu_avg=${data.cpu_avg.toFixed(2)} cpu_max=${data.cpu_max.toFixed(2)} bucket_avg=${data.bucket_avg.toFixed(0)} bucket_min=${data.bucket_min.toFixed(0)} skipped_avg=${data.skipped_avg.toFixed(1)}`);
    for (const [label, rows] of [["subsystems", data.top_subsystems], ["processes", data.top_processes], ["rooms", data.top_rooms], ["roles", data.top_roles], ["cpu_details", data.top_cpu_details]]) {
      if (!rows.length) continue;
      console.log(`Top ${label}:`);
      for (const row of rows.slice(0, 8)) {
        const name = row.name ? `${row.key} (${row.name})` : row.key;
        console.log(`  ${name}: avg=${row.avg.toFixed(3)} max=${row.max.toFixed(3)} samples=${row.samples}`);
      }
    }
  }
}

async function main() {
  const args = parseArgs(process.argv);
  if (!process.env.SCREEPS_TOKEN) throw new Error("SCREEPS_TOKEN is required");

  const api = new ScreepsAPI({
    token: process.env.SCREEPS_TOKEN,
    protocol: args.protocol,
    hostname: args.hostname,
    port: args.port,
    path: process.env.SCREEPS_PATH || "/"
  });

  const byShard = Object.fromEntries(args.shards.map(shard => [shard, []]));
  for (let sample = 1; sample <= args.samples; sample++) {
    await Promise.all(args.shards.map(async shard => {
      try {
        const stats = await fetchStats(api, shard);
        if (stats) byShard[shard].push(stats);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`WARN ${shard}: ${redactScreepsApiMessage(message)}`);
      }
    }));
    if (sample < args.samples && args.interval > 0) await sleep(args.interval);
  }

  const summary = {
    generated_at: new Date().toISOString(),
    hostname: args.hostname,
    samples_requested: args.samples,
    interval_ms: args.interval,
    shards: Object.fromEntries(Object.entries(byShard).map(([shard, samples]) => [shard, summarizeShard(samples)]))
  };

  fs.mkdirSync(args.outDir, { recursive: true });
  const outPath = path.join(args.outDir, `live-cpu-profile-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
  printSummary(summary);
  console.log(`\nWrote ${outPath}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch(error => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(redactScreepsApiMessage(message));
    process.exit(1);
  });
}

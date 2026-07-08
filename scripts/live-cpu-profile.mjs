#!/usr/bin/env node
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { redactScreepsApiMessage } from "./live-redaction.mjs";

export { redactScreepsApiMessage };

const DEFAULT_SHARDS = ["shard0", "shard1", "shard2", "shard3"];
const DEFAULT_MAX_STATS_AGE = 100;
const DEFAULT_SOURCE = "console";
const VALID_SOURCES = new Set(["console", "memory"]);

export function formatHelp() {
  return `Usage: node scripts/live-cpu-profile.mjs [options]

Options:
  --samples <n>              Number of samples (default 20)
  --interval <ms>            Delay between samples (default 3000)
  --shards <list>            Comma-separated shards (default shard0,shard1,shard2,shard3)
  --out-dir <path>           Output directory (default .tmp/artifacts/cpu-profile)
  --hostname <host>          Screeps hostname (default SCREEPS_HOSTNAME or screeps.com)
  --protocol <http|https>    Screeps API protocol (default SCREEPS_PROTOCOL or https)
  --port <n>                 Screeps API port (default SCREEPS_PORT or 443)
  --max-stats-age <ticks>    Maximum api.time - Memory.stats.tick age allowed (default ${DEFAULT_MAX_STATS_AGE})
  --source <console|memory>  Stats source: console WebSocket stream or Memory polling (default ${DEFAULT_SOURCE})
  --console-timeout <ms>     Max wait for console stats samples (default max(15000, samples * max(interval, 1000) + 5000))
  --allow-empty              Allow zero-sample degraded artifact collection (default fail closed)
  --allow-stale              Allow stale/missing stats artifacts as degraded instead of failed
  --help, -h                 Show this help

Environment:
  SCREEPS_TOKEN              Required API token; console source only needs console WebSocket access
  SCREEPS_HOSTNAME           Default hostname override
  SCREEPS_PROTOCOL           Default protocol override
  SCREEPS_PORT               Default port override
  SCREEPS_PATH               API path override (default /)

Read-only: console source subscribes once to user console logs and fetches api.time; memory source polls api.time and Memory.stats.`;
}

export function parseArgs(argv) {
  const args = {
    samples: 20,
    interval: 3000,
    shards: DEFAULT_SHARDS,
    outDir: ".tmp/artifacts/cpu-profile",
    hostname: process.env.SCREEPS_HOSTNAME || "screeps.com",
    protocol: process.env.SCREEPS_PROTOCOL || "https",
    port: Number(process.env.SCREEPS_PORT || 443),
    maxStatsAge: DEFAULT_MAX_STATS_AGE,
    source: DEFAULT_SOURCE,
    consoleTimeout: null,
    allowEmpty: false,
    allowStale: false
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
    else if (arg === "--max-stats-age" && next) args.maxStatsAge = Number(next), i++;
    else if (arg === "--source" && next) args.source = next, i++;
    else if (arg === "--console-timeout" && next) args.consoleTimeout = Number(next), i++;
    else if (arg === "--allow-empty") args.allowEmpty = true;
    else if (arg === "--allow-stale") args.allowStale = true;
    else if (arg === "--help" || arg === "-h") {
      console.log(formatHelp());
      process.exit(0);
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg}`);
    }
  }

  if (!Number.isFinite(args.samples) || args.samples < 1) throw new Error("--samples must be >= 1");
  if (!Number.isFinite(args.interval) || args.interval < 0) throw new Error("--interval must be >= 0");
  if (args.shards.length === 0) throw new Error("--shards must include at least one shard");
  if (args.protocol !== "http" && args.protocol !== "https") throw new Error("--protocol must be http or https");
  if (!Number.isFinite(args.port)) throw new Error("--port must be a number");
  if (!Number.isInteger(args.port) || args.port < 1 || args.port > 65535) {
    throw new Error("--port must be between 1 and 65535");
  }
  if (!Number.isFinite(args.maxStatsAge) || args.maxStatsAge < 1) throw new Error("--max-stats-age must be >= 1");
  if (!VALID_SOURCES.has(args.source)) throw new Error("--source must be console or memory");
  if (args.consoleTimeout === null) {
    args.consoleTimeout = Math.max(15000, args.samples * Math.max(args.interval, 1000) + 5000);
  }
  if (!Number.isFinite(args.consoleTimeout) || args.consoleTimeout < 1) throw new Error("--console-timeout must be >= 1");
  return args;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const isFiniteNumber = value => typeof value === "number" && Number.isFinite(value);
const normalizePositiveTick = value => isFiniteNumber(value) && value > 0 ? value : null;

export function evaluateStatsFreshness({ samples = 0, statsTick, gameTick, maxStatsAge = DEFAULT_MAX_STATS_AGE, timeErrors = [] } = {}) {
  const normalizedMaxAge = isFiniteNumber(maxStatsAge) && maxStatsAge >= 1 ? maxStatsAge : DEFAULT_MAX_STATS_AGE;
  const normalizedStatsTick = normalizePositiveTick(statsTick);
  const normalizedGameTick = normalizePositiveTick(gameTick);
  const base = {
    game_tick: normalizedGameTick,
    stats_tick: normalizedStatsTick,
    age_ticks: null,
    max_age_ticks: normalizedMaxAge
  };

  if (samples === 0) {
    return { ok: true, status: "empty", ...base, reason: "No Memory.stats samples collected." };
  }
  if (timeErrors.length > 0) {
    return { ok: false, status: "unknown", ...base, reason: `api.time unavailable: ${timeErrors[0].message}` };
  }
  if (normalizedGameTick === null) {
    return { ok: true, status: "unchecked", ...base, reason: "api.time was not collected." };
  }
  if (normalizedStatsTick === null) {
    return { ok: false, status: "missing", ...base, reason: "Memory.stats tick is missing." };
  }

  const age = normalizedGameTick - normalizedStatsTick;
  const withAge = { ...base, age_ticks: age };
  if (age < 0) {
    return { ok: false, status: "future", ...withAge, reason: `Memory.stats tick is ahead of api.time by ${Math.abs(age)} ticks.` };
  }
  if (age > normalizedMaxAge) {
    return { ok: false, status: "stale", ...withAge, reason: `Memory.stats tick is stale by ${age} ticks.` };
  }
  return { ok: true, status: "fresh", ...withAge, reason: "Memory.stats tick is fresh." };
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

export function summarizeShard(samples, errors = [], { gameTick, maxStatsAge = DEFAULT_MAX_STATS_AGE, timeErrors = [] } = {}) {
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
  const latestStatsTick = samples.length > 0 ? samples[samples.length - 1]?.tick : undefined;
  const freshness = evaluateStatsFreshness({
    samples: samples.length,
    statsTick: latestStatsTick,
    gameTick,
    maxStatsAge,
    timeErrors
  });
  return {
    samples: samples.length,
    tick_first: ticks[0],
    tick_last: ticks[ticks.length - 1],
    game_tick: freshness.game_tick,
    stats_tick_age: freshness.age_ticks,
    freshness,
    cpu_avg: avg(cpu),
    cpu_max: cpu.length ? Math.max(...cpu) : 0,
    bucket_avg: avg(bucket),
    bucket_min: bucket.length ? Math.min(...bucket) : 0,
    skipped_avg: avg(skipped),
    top_subsystems: top(subsystems, 10),
    top_processes: top(processes, 15),
    top_rooms: top(rooms, 10),
    top_roles: top(roles, 10),
    top_cpu_details: top(cpuDetails, 20),
    read_errors: errors.length,
    time_read_errors: timeErrors.length,
    errors,
    time_errors: timeErrors
  };
}

export function evaluateTelemetryHealth(summary, { allowEmpty = false, allowStale = false } = {}) {
  const shards = Object.entries(summary.shards || {});
  const emptyShards = shards.filter(([, data]) => (data.samples || 0) === 0).map(([shard]) => shard);
  const totalSamples = shards.reduce((sum, [, data]) => sum + (data.samples || 0), 0);
  const readErrors = shards.reduce((sum, [, data]) => sum + (data.read_errors ?? data.errors?.length ?? 0) + (data.time_read_errors ?? data.time_errors?.length ?? 0), 0);
  const freshnessFailures = shards
    .filter(([, data]) => data.freshness && data.freshness.ok === false)
    .map(([shard, data]) => ({ shard, status: data.freshness.status, reason: data.freshness.reason }));
  const shardsByFreshness = status => freshnessFailures.filter(row => row.status === status).map(row => row.shard);
  const staleStatsShards = shardsByFreshness("stale");
  const missingStatsShards = shardsByFreshness("missing");
  const unknownStatsShards = freshnessFailures
    .filter(row => row.status !== "stale" && row.status !== "missing")
    .map(row => row.shard);
  const allEmpty = shards.length > 0 && totalSamples === 0;

  let status = "healthy";
  let ok = true;
  let message = "Live CPU telemetry collected.";
  if (allEmpty) {
    status = allowEmpty ? "degraded" : "failed";
    ok = allowEmpty;
    message = `Collected zero live CPU samples across ${shards.length} shard(s); Memory.stats telemetry is unavailable${allowEmpty ? " (allowed)" : ""}.`;
  } else if (freshnessFailures.length > 0) {
    const allowStaleOnly = allowStale && freshnessFailures.every(row => row.status === "stale" || row.status === "missing");
    status = allowStaleOnly ? "degraded" : "failed";
    ok = allowStaleOnly;
    message = `Collected live CPU samples with stale/missing Memory.stats ticks: ${freshnessFailures.map(row => `${row.shard}=${row.status}`).join(", ")}${allowStaleOnly ? " (allowed)" : ""}.`;
  } else if (emptyShards.length > 0) {
    status = "partial";
    message = `Collected partial live CPU samples; empty shard(s): ${emptyShards.join(", ")}.`;
  }

  return {
    ok,
    status,
    allow_empty: allowEmpty,
    allow_stale: allowStale,
    total_samples: totalSamples,
    empty_shards: emptyShards,
    stale_stats_shards: staleStatsShards,
    missing_stats_shards: missingStatsShards,
    unknown_stats_shards: unknownStatsShards,
    freshness_failures: freshnessFailures,
    read_errors: readErrors,
    message
  };
}

function unwrapMemoryResponse(response) {
  return response?.data ?? response;
}

async function fetchStats(apiClient, shard) {
  const stats = unwrapMemoryResponse(await apiClient.memoryGet("stats", shard));
  if (!stats || stats.ok === 1 && !stats.cpu) return null;
  return stats;
}

async function fetchGameTick(apiClient, shard) {
  const response = await apiClient.gameTime(shard);
  const tick = Number(response?.time ?? response?.gameTime);
  if (!Number.isFinite(tick)) throw new Error(`api.time returned invalid tick for ${shard}`);
  return tick;
}

async function fetchGameTicks(apiClient, shards) {
  const gameTicksByShard = Object.fromEntries(shards.map(shard => [shard, null]));
  const timeErrorsByShard = Object.fromEntries(shards.map(shard => [shard, []]));
  await Promise.all(shards.map(async shard => {
    try {
      gameTicksByShard[shard] = await fetchGameTick(apiClient, shard);
    } catch (error) {
      const message = redactScreepsApiMessage(error instanceof Error ? error.message : String(error));
      timeErrorsByShard[shard].push({ message });
      console.warn(`WARN ${shard} api.time: ${message}`);
    }
  }));
  return { gameTicksByShard, timeErrorsByShard };
}

function decodeConsoleLine(line) {
  return String(line ?? "")
    .replace(/&quot;|&#34;|&#x22;/gi, '"')
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
}

export function parseConsoleStatsLine(line) {
  const trimmed = decodeConsoleLine(line).trim();
  if (!trimmed.startsWith("{")) return null;

  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }

  if (!parsed || parsed.type !== "stats" || !parsed.data || typeof parsed.data !== "object" || Array.isArray(parsed.data)) {
    return null;
  }

  if (!isFiniteNumber(parsed.data.tick) && isFiniteNumber(parsed.tick)) {
    return { ...parsed.data, tick: parsed.tick };
  }
  return parsed.data;
}

export function extractConsoleStatsSamples(event, requestedShards = DEFAULT_SHARDS) {
  const data = event?.data ?? {};
  const eventShard = typeof data.shard === "string" && data.shard ? data.shard : null;
  const shard = eventShard ?? (requestedShards.length === 1 ? requestedShards[0] : null);
  if (!shard || !requestedShards.includes(shard)) return [];

  const logs = Array.isArray(data.messages?.log) ? data.messages.log : [];
  const results = Array.isArray(data.messages?.results) ? data.messages.results : [];
  return [...logs, ...results]
    .flatMap(line => String(line ?? "").split(/\r?\n/))
    .map(line => parseConsoleStatsLine(line))
    .filter(Boolean)
    .map(stats => ({ shard, stats }));
}

function hasRequestedSamples(byShard, shards, samples) {
  return shards.every(shard => (byShard[shard]?.length ?? 0) >= samples);
}

async function subscribeConsole(socket, onConsole) {
  if (!socket) throw new Error("Screeps API client does not expose a WebSocket console stream");
  if (typeof socket.subscribeUserConsole === "function") return socket.subscribeUserConsole(onConsole);
  if (typeof socket.subscribe === "function") return socket.subscribe("console", onConsole);
  throw new Error("Screeps API socket does not support console subscription");
}

function disconnectSocket(socket) {
  if (!socket) return;
  if (typeof socket.disconnect === "function") socket.disconnect();
  else if (typeof socket.close === "function") socket.close();
}

function remainingTimeoutMs(deadline) {
  return Math.max(1, deadline - Date.now());
}

async function withTimeout(promise, ms, message) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
      })
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export async function collectConsoleSamples(apiClient, args) {
  const byShard = Object.fromEntries(args.shards.map(shard => [shard, []]));
  const errorsByShard = Object.fromEntries(args.shards.map(shard => [shard, []]));
  let finished = false;
  let finish;
  let status = "timeout";
  const result = new Promise(resolve => {
    finish = nextStatus => {
      if (finished) return;
      finished = true;
      status = nextStatus;
      resolve();
    };
  });

  const onConsole = event => {
    const data = event?.data ?? {};
    const eventShard = typeof data.shard === "string" && data.shard ? data.shard : null;
    const targetShards = eventShard && args.shards.includes(eventShard) ? [eventShard] : (!eventShard && args.shards.length === 1 ? [args.shards[0]] : []);
    if (data.error) {
      const message = redactScreepsApiMessage(data.error);
      for (const shard of targetShards.length > 0 ? targetShards : args.shards) {
        errorsByShard[shard].push({ sample: byShard[shard].length + 1, source: "console", message });
      }
    }

    for (const { shard, stats } of extractConsoleStatsSamples(event, args.shards)) {
      if (byShard[shard].length < args.samples) byShard[shard].push(stats);
    }

    if (hasRequestedSamples(byShard, args.shards, args.samples)) finish("complete");
  };

  const deadline = Date.now() + args.consoleTimeout;
  try {
    await withTimeout(
      subscribeConsole(apiClient.socket, onConsole),
      remainingTimeoutMs(deadline),
      `Timed out waiting for Screeps console subscription after ${args.consoleTimeout}ms`
    );
    if (!finished) {
      await withTimeout(
        apiClient.socket.connect(),
        remainingTimeoutMs(deadline),
        `Timed out connecting to Screeps console WebSocket after ${args.consoleTimeout}ms`
      );
    }
    if (!finished) {
      try {
        await withTimeout(
          result,
          remainingTimeoutMs(deadline),
          `Timed out waiting for Screeps console stats samples after ${args.consoleTimeout}ms`
        );
      } catch (error) {
        if (!String(error instanceof Error ? error.message : error).startsWith("Timed out")) throw error;
        finish("timeout");
      }
    }
  } catch (error) {
    const message = redactScreepsApiMessage(error instanceof Error ? error.message : String(error));
    status = message.startsWith("Timed out") ? "timeout" : "error";
    for (const shard of args.shards) {
      errorsByShard[shard].push({ sample: byShard[shard].length + 1, source: "console", message });
    }
  } finally {
    disconnectSocket(apiClient.socket);
  }

  const { gameTicksByShard, timeErrorsByShard } = await fetchGameTicks(apiClient, args.shards);
  return {
    source: "console",
    status,
    apiMethods: ["api.auth/me", "socket.subscribeUserConsole", "api.time|api.gameTime"],
    byShard,
    errorsByShard,
    gameTicksByShard,
    timeErrorsByShard
  };
}

async function collectMemorySamples(apiClient, args) {
  const byShard = Object.fromEntries(args.shards.map(shard => [shard, []]));
  const errorsByShard = Object.fromEntries(args.shards.map(shard => [shard, []]));
  for (let sample = 1; sample <= args.samples; sample++) {
    await Promise.all(args.shards.map(async shard => {
      try {
        const stats = await fetchStats(apiClient, shard);
        if (stats) byShard[shard].push(stats);
      } catch (error) {
        const message = redactScreepsApiMessage(error instanceof Error ? error.message : String(error));
        errorsByShard[shard].push({ sample, message });
        console.warn(`WARN ${shard}: ${message}`);
      }
    }));
    if (sample < args.samples && args.interval > 0) await sleep(args.interval);
  }

  const { gameTicksByShard, timeErrorsByShard } = await fetchGameTicks(apiClient, args.shards);
  return {
    source: "memory",
    status: "complete",
    apiMethods: ["api.memory.get|api.userMemoryGet", "api.time|api.gameTime"],
    byShard,
    errorsByShard,
    gameTicksByShard,
    timeErrorsByShard
  };
}

export function createLiveApiClient(apiModule, args, token) {
  const options = {
    token,
    protocol: args.protocol,
    hostname: args.hostname,
    port: args.port,
    path: process.env.SCREEPS_PATH || "/"
  };

  const LegacyApi = apiModule?.ScreepsAPI ?? apiModule?.default?.ScreepsAPI;
  if (typeof LegacyApi === "function") {
    const api = new LegacyApi(options);
    return {
      transport: "ScreepsAPI",
      socket: api.socket,
      memoryGet: (memoryPath, shard) => api.memory.get(memoryPath, shard),
      gameTime: shard => api.time(shard)
    };
  }

  const HttpClient = apiModule?.ScreepsHttpClient ?? apiModule?.default?.ScreepsHttpClient;
  if (typeof HttpClient === "function") {
    const api = new HttpClient(options);
    return {
      transport: "ScreepsHttpClient",
      socket: api.socket,
      memoryGet: (memoryPath, shard) => api.userMemoryGet(memoryPath, shard),
      gameTime: shard => api.gameTime(shard)
    };
  }

  throw new Error("screeps-api module did not expose a supported API client");
}

function buildSummary(args, collection) {
  const summary = {
    generated_at: new Date().toISOString(),
    hostname: args.hostname,
    source: collection.source,
    collection_status: collection.status,
    api_policy: {
      read_only: true,
      methods_used: collection.apiMethods,
      state_changing_endpoints_used: false
    },
    samples_requested: args.samples,
    interval_ms: args.interval,
    console_timeout_ms: args.consoleTimeout,
    allow_empty: args.allowEmpty,
    allow_stale: args.allowStale,
    max_stats_age: args.maxStatsAge,
    shards: Object.fromEntries(Object.entries(collection.byShard).map(([shard, samples]) => [shard, summarizeShard(samples, collection.errorsByShard[shard] || [], {
      gameTick: collection.gameTicksByShard[shard],
      maxStatsAge: args.maxStatsAge,
      timeErrors: collection.timeErrorsByShard[shard] || []
    })]))
  };
  summary.health = evaluateTelemetryHealth(summary, { allowEmpty: args.allowEmpty, allowStale: args.allowStale });
  if (collection.source === "console" && summary.health.total_samples === 0) {
    summary.health.message = summary.health.message.replace("Memory.stats telemetry is unavailable", "console stats telemetry is unavailable");
  }
  return summary;
}

function printSummary(summary) {
  for (const [shard, data] of Object.entries(summary.shards)) {
    console.log(`\n=== ${shard} ===`);
    const freshness = data.freshness ? ` freshness=${data.freshness.status}${data.stats_tick_age !== null ? ` age=${data.stats_tick_age}` : ""}` : "";
    console.log(`samples=${data.samples} ticks=${data.tick_first ?? "n/a"}->${data.tick_last ?? "n/a"} cpu_avg=${data.cpu_avg.toFixed(2)} cpu_max=${data.cpu_max.toFixed(2)} bucket_avg=${data.bucket_avg.toFixed(0)} bucket_min=${data.bucket_min.toFixed(0)} skipped_avg=${data.skipped_avg.toFixed(1)} read_errors=${data.read_errors || 0}${freshness}`);
    if (data.freshness && data.freshness.ok === false) console.log(`  stats_freshness: ${data.freshness.reason}`);
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

  const apiModule = createRequire(import.meta.url)("screeps-api");
  const apiClient = createLiveApiClient(apiModule, args, process.env.SCREEPS_TOKEN);
  const collection = args.source === "memory"
    ? await collectMemorySamples(apiClient, args)
    : await collectConsoleSamples(apiClient, args);
  const summary = buildSummary(args, collection);
  summary.api_policy.transport = apiClient.transport;

  fs.mkdirSync(args.outDir, { recursive: true });
  const outPath = path.join(args.outDir, `live-cpu-profile-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
  printSummary(summary);
  console.log(`\nHealth: ${summary.health.status} (${summary.health.message})`);
  console.log(`Wrote ${outPath}`);
  if (!summary.health.ok) {
    console.error(summary.health.message);
    process.exitCode = 2;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch(error => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(redactScreepsApiMessage(message));
    process.exit(1);
  });
}

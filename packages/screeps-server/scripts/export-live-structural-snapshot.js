#!/usr/bin/env node

import { createRequire } from "node:module";
import {
  buildStructuralSnapshot,
  deriveCandidateRooms,
  parseArgMap,
  safeObject,
  writeJson,
} from "./cpu-benchmark-model.js";
import { collectConsoleSamples } from "../../../scripts/live-cpu-profile.mjs";
import { formatScreepsApiError, redactScreepsApiMessage } from "../../../scripts/live-redaction.mjs";

const DEFAULT_MEMORY_PATHS = ["stats", "creeps", "rooms", "creepTaskBoard", "defenseRequests", "clusters", "empire"];
const DEFAULT_STATS_SOURCE = "console";
const VALID_STATS_SOURCES = new Set(["console", "memory", "none"]);

const require = createRequire(import.meta.url);
const screepsApiModule = require("screeps-api");

function printHelp() {
  console.log(`Usage: node packages/screeps-server/scripts/export-live-structural-snapshot.js [options]\n\nOptions:\n  --shard <name>              Screeps shard (default shard1)\n  --rooms <list>              Comma-separated extra/source rooms to include\n  --maxRooms <n>              Maximum derived rooms to export (default 30)\n  --out <path>                Output JSON path (default .tmp/artifacts/live-structural-snapshot.json)\n  --hostname <host>           Screeps hostname (default screeps.com)\n  --protocol <proto>          Protocol (default https)\n  --port <n>                  Port (default 443)\n  --stats-source <mode>       stats source: console, memory, or none (default console)\n  --console-timeout <ms>      Max wait for one console stats sample (default 15000)\n  --memory-paths <list>       Comma-separated Memory paths, all, none, or auto (default auto)\n  --fail-on-memory-errors     Exit nonzero when read-only Memory paths fail\n\nRequires SCREEPS_TOKEN. Read-only endpoints only. Default console stats + explicit rooms avoids /api/user/memory polling.`);
}

export function parseMemoryPathsOption(value) {
  const raw = String(value ?? "auto").trim();
  if (!raw || raw === "auto") return "auto";
  if (raw === "none") return [];
  if (raw === "all") return DEFAULT_MEMORY_PATHS.slice();

  const paths = raw.split(",").map((path) => path.trim()).filter(Boolean);
  if (paths.length === 0) return [];
  const invalid = paths.filter((path) => !DEFAULT_MEMORY_PATHS.includes(path));
  if (invalid.length > 0) throw new Error(`--memory-paths contains unsupported path(s): ${invalid.join(", ")}`);
  return [...new Set(paths)];
}

function parseOptions(argv = process.argv.slice(2), env = process.env) {
  const args = parseArgMap(argv);
  if (args.has("help") || args.has("h")) return { help: true };
  const rooms = String(args.get("rooms") ?? "")
    .split(",")
    .map((room) => room.trim())
    .filter(Boolean);
  const maxRooms = Number(args.get("maxRooms") ?? 30);
  if (!Number.isInteger(maxRooms) || maxRooms < 1) throw new Error("--maxRooms must be a positive integer");
  const statsSource = String(args.get("stats-source") ?? DEFAULT_STATS_SOURCE);
  if (!VALID_STATS_SOURCES.has(statsSource)) throw new Error("--stats-source must be console, memory, or none");
  const consoleTimeout = Number(args.get("console-timeout") ?? 15000);
  if (!Number.isFinite(consoleTimeout) || consoleTimeout < 1) throw new Error("--console-timeout must be >= 1");
  return {
    shard: args.get("shard") ?? env.SHARD ?? "shard1",
    rooms,
    maxRooms,
    out: args.get("out") ?? ".tmp/artifacts/live-structural-snapshot.json",
    hostname: args.get("hostname") ?? env.SCREEPS_HOSTNAME ?? "screeps.com",
    protocol: args.get("protocol") ?? env.SCREEPS_PROTOCOL ?? "https",
    port: Number(args.get("port") ?? env.SCREEPS_PORT ?? 443),
    statsSource,
    consoleTimeout,
    memoryPaths: parseMemoryPathsOption(args.get("memory-paths")),
    failOnMemoryErrors: args.has("fail-on-memory-errors") && args.get("fail-on-memory-errors") !== "false",
  };
}

function unwrapMemory(response) {
  if (!response) return {};
  if (Object.prototype.hasOwnProperty.call(response, "data")) return response.data ?? {};
  return response;
}

export function redactedSnapshotError(fields, error) {
  return { ...fields, message: formatScreepsApiError(error) };
}

export function formatStructuralSnapshotCliError(error) {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  return redactScreepsApiMessage(message);
}

export function evaluateStructuralSnapshotHealth(snapshot, { failOnMemoryErrors = false } = {}) {
  const errors = snapshot.errors || [];
  const memoryErrors = errors.filter((error) => error.type === "memory");
  const status = memoryErrors.length > 0 ? (failOnMemoryErrors ? "failed" : "degraded") : errors.length > 0 ? "partial" : "healthy";
  return {
    ok: !failOnMemoryErrors || memoryErrors.length === 0,
    status,
    fail_on_memory_errors: failOnMemoryErrors,
    total_errors: errors.length,
    memory_errors: memoryErrors.length,
    message: memoryErrors.length > 0
      ? `Structural snapshot recorded ${memoryErrors.length} Memory API errors${failOnMemoryErrors ? " and strict mode is enabled" : ""}.`
      : errors.length > 0
        ? `Structural snapshot recorded ${errors.length} non-Memory endpoint errors.`
        : "Structural snapshot completed without endpoint errors."
  };
}

async function fetchMemory(api, shard, paths = DEFAULT_MEMORY_PATHS) {
  const memory = {};
  for (const memoryPath of paths) {
    try {
      memory[memoryPath] = unwrapMemory(await api.memoryGet(memoryPath, shard));
    } catch (error) {
      memory[memoryPath] = {};
      memory.__errors = [...(memory.__errors ?? []), redactedSnapshotError({ type: "memory", path: memoryPath }, error)];
    }
  }
  return memory;
}

function consoleApiClient(api) {
  return {
    socket: api.socket,
    gameTime: (shard) => api.time(shard),
    memoryGet: (memoryPath, shard) => api.memoryGet(memoryPath, shard),
  };
}

export function createSnapshotApi(apiModule, options) {
  const clientOptions = {
    token: process.env.SCREEPS_TOKEN,
    protocol: options.protocol,
    hostname: options.hostname,
    port: options.port,
    path: process.env.SCREEPS_PATH || "/",
  };

  const LegacyApi = apiModule?.ScreepsAPI ?? apiModule?.default?.ScreepsAPI;
  if (typeof LegacyApi === "function") {
    const api = new LegacyApi(clientOptions);
    return {
      transport: "ScreepsAPI",
      methods: {
        me: "api.me",
        time: "api.time",
        roomStatus: "api.raw.game.roomStatus",
        roomObjects: "api.raw.game.roomObjects",
      },
      socket: api.socket,
      me: () => api.me(),
      time: (shard) => api.time(shard),
      memoryGet: (memoryPath, shard) => api.memory.get(memoryPath, shard),
      roomStatus: (roomName, shard) => api.raw.game.roomStatus(roomName, shard),
      roomObjects: (roomName, shard) => api.raw.game.roomObjects(roomName, shard),
    };
  }

  const HttpClient = apiModule?.ScreepsHttpClient ?? apiModule?.default?.ScreepsHttpClient;
  if (typeof HttpClient === "function") {
    const api = new HttpClient(clientOptions);
    return {
      transport: "ScreepsHttpClient",
      methods: {
        me: "api.me",
        time: "api.gameTime",
        roomStatus: "api.gameRoomStatus",
        roomObjects: "api.gameRoomObjects",
      },
      socket: api.socket,
      me: () => api.me(),
      time: (shard) => api.gameTime(shard),
      memoryGet: (memoryPath, shard) => api.userMemoryGet(memoryPath, shard),
      roomStatus: (roomName, shard) => api.gameRoomStatus(roomName, shard),
      roomObjects: (roomName, shard) => api.gameRoomObjects(roomName, shard),
    };
  }

  throw new Error("screeps-api module did not expose a supported API client");
}

function consoleErrorsForSnapshot(collection, shard) {
  const errors = [
    ...(collection.errorsByShard?.[shard] ?? []).map((error) => ({ type: "consoleStats", path: "stats", message: error.message })),
    ...(collection.timeErrorsByShard?.[shard] ?? []).map((error) => ({ type: "consoleStatsTime", path: "stats", message: error.message })),
  ];
  return errors.filter((error) => error.message);
}

async function fetchConsoleStatsMemory(api, options) {
  const collection = await collectConsoleSamples(consoleApiClient(api), {
    shards: [options.shard],
    samples: 1,
    interval: 0,
    consoleTimeout: options.consoleTimeout,
    maxStatsAge: 100,
  });
  const latestStats = collection.byShard?.[options.shard]?.at(-1);
  return {
    memory: latestStats ? { stats: latestStats } : {},
    errors: consoleErrorsForSnapshot(collection, options.shard),
    apiMethods: collection.apiMethods,
  };
}

function resolveMemoryPaths(options, memory) {
  if (Array.isArray(options.memoryPaths)) return options.memoryPaths;
  if (options.statsSource === "memory") return DEFAULT_MEMORY_PATHS.slice();
  const roomsAlreadyKnown = deriveCandidateRooms(memory, options.rooms, options.maxRooms).length > 0;
  if (roomsAlreadyKnown) return [];
  return DEFAULT_MEMORY_PATHS.filter((path) => !(path === "stats" && (memory.stats || options.statsSource === "none")));
}

export async function collectSnapshotMemory(api, options) {
  let memory = {};
  const errors = [];
  const apiMethods = [];

  if (options.statsSource === "console") {
    const consoleStats = await fetchConsoleStatsMemory(api, options);
    memory = { ...memory, ...consoleStats.memory };
    errors.push(...consoleStats.errors);
    apiMethods.push(...consoleStats.apiMethods);
  }

  const paths = resolveMemoryPaths(options, memory).filter((path) => !Object.prototype.hasOwnProperty.call(memory, path));
  if (paths.length > 0) {
    const memoryResult = await fetchMemory(api, options.shard, paths);
    memory = { ...memory, ...memoryResult };
    errors.push(...(memoryResult.__errors ?? []));
    apiMethods.push("api.memory.get");
  }

  return { memory, errors, apiMethods };
}

async function exportSnapshot(options) {
  if (!process.env.SCREEPS_TOKEN) throw new Error("SCREEPS_TOKEN is required for read-only live snapshot export");

  const api = createSnapshotApi(screepsApiModule, options);

  const me = await api.me();
  const myUserName = me?.username || me?.name || "unknown";
  const time = await api.time(options.shard);
  const tick = Number(time?.time ?? time?.gameTime ?? 0);
  const memoryCollection = await collectSnapshotMemory(api, options);
  const memory = memoryCollection.memory;
  const rooms = deriveCandidateRooms(memory, options.rooms, options.maxRooms);
  if (rooms.length === 0) throw new Error("No rooms derived from live snapshot sources; pass --rooms to include explicit rooms");

  const roomResponses = {};
  const roomStatus = {};
  const errors = [...memoryCollection.errors];
  for (const roomName of rooms) {
    try {
      roomStatus[roomName] = await api.roomStatus(roomName, options.shard);
    } catch (error) {
      const message = formatScreepsApiError(error);
      roomStatus[roomName] = { ok: 0, error: message };
      errors.push(redactedSnapshotError({ type: "roomStatus", room: roomName }, error));
    }
    try {
      roomResponses[roomName] = await api.roomObjects(roomName, options.shard);
    } catch (error) {
      roomResponses[roomName] = { objects: [], users: {} };
      errors.push(redactedSnapshotError({ type: "roomObjects", room: roomName }, error));
    }
  }

  const snapshot = buildStructuralSnapshot({
    hostname: options.hostname,
    shard: options.shard,
    tick,
    myUserName,
    memory: safeObject(memory),
    roomResponses,
    roomStatus,
    apiMethods: [
      api.methods.me,
      ...memoryCollection.apiMethods,
      api.methods.time,
      api.methods.roomStatus,
      api.methods.roomObjects,
    ],
    apiTransport: api.transport,
    statsSource: options.statsSource,
  });
  snapshot.errors = errors;
  writeJson(options.out, snapshot);
  return snapshot;
}

async function main() {
  const options = parseOptions();
  if (options.help) {
    printHelp();
    return;
  }
  const snapshot = await exportSnapshot(options);
  const health = evaluateStructuralSnapshotHealth(snapshot, options);
  console.log(`wrote ${options.out}`);
  console.log(`rooms=${snapshot.roomCount} shard=${snapshot.source.shard} tick=${snapshot.source.tick} user=${snapshot.source.user}`);
  console.log(`read-only methods=${snapshot.source.apiPolicy.methodsUsed.join(",")}`);
  console.log(`errors=${health.total_errors} memoryErrors=${health.memory_errors} health=${health.status}`);
  if (!health.ok) {
    console.error(health.message);
    process.exitCode = 2;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(formatStructuralSnapshotCliError(error));
    process.exitCode = 1;
  });
}

export { exportSnapshot, parseOptions };

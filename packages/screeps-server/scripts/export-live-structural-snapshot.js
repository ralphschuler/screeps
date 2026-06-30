#!/usr/bin/env node

import { createRequire } from "node:module";
import {
  buildStructuralSnapshot,
  deriveCandidateRooms,
  parseArgMap,
  safeObject,
  writeJson,
} from "./cpu-benchmark-model.js";

const require = createRequire(import.meta.url);
const { ScreepsAPI } = require("screeps-api");

function printHelp() {
  console.log(`Usage: node packages/screeps-server/scripts/export-live-structural-snapshot.js [options]\n\nOptions:\n  --shard <name>       Screeps shard (default shard1)\n  --rooms <list>       Comma-separated extra/source rooms to include\n  --maxRooms <n>       Maximum derived rooms to export (default 30)\n  --out <path>         Output JSON path (default packages/screeps-server/artifacts/cpu-benchmark/live-snapshot.json)\n  --hostname <host>    Screeps hostname (default screeps.com)\n  --protocol <proto>   Protocol (default https)\n  --port <n>           Port (default 443)\n\nRequires SCREEPS_TOKEN. Read-only endpoints only.`);
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
  return {
    shard: args.get("shard") ?? env.SHARD ?? "shard1",
    rooms,
    maxRooms,
    out: args.get("out") ?? "packages/screeps-server/artifacts/cpu-benchmark/live-snapshot.json",
    hostname: args.get("hostname") ?? env.SCREEPS_HOSTNAME ?? "screeps.com",
    protocol: args.get("protocol") ?? env.SCREEPS_PROTOCOL ?? "https",
    port: Number(args.get("port") ?? env.SCREEPS_PORT ?? 443),
  };
}

function unwrapMemory(response) {
  if (!response) return {};
  if (Object.prototype.hasOwnProperty.call(response, "data")) return response.data ?? {};
  return response;
}

async function fetchMemory(api, shard) {
  const paths = ["stats", "creeps", "rooms", "creepTaskBoard", "defenseRequests", "clusters", "empire"];
  const memory = {};
  for (const memoryPath of paths) {
    try {
      memory[memoryPath] = unwrapMemory(await api.memory.get(memoryPath, shard));
    } catch (error) {
      memory[memoryPath] = {};
      memory.__errors = [...(memory.__errors ?? []), { type: "memory", path: memoryPath, message: error instanceof Error ? error.message : String(error) }];
    }
  }
  return memory;
}

async function exportSnapshot(options) {
  if (!process.env.SCREEPS_TOKEN) throw new Error("SCREEPS_TOKEN is required for read-only live snapshot export");

  const api = new ScreepsAPI({
    token: process.env.SCREEPS_TOKEN,
    protocol: options.protocol,
    hostname: options.hostname,
    port: options.port,
    path: process.env.SCREEPS_PATH || "/",
  });

  const me = await api.me();
  const myUserName = me?.username || me?.name || "unknown";
  const time = await api.time(options.shard);
  const tick = Number(time?.time ?? time?.gameTime ?? 0);
  const memory = await fetchMemory(api, options.shard);
  const rooms = deriveCandidateRooms(memory, options.rooms, options.maxRooms);
  if (rooms.length === 0) throw new Error("No rooms derived from live Memory; pass --rooms to include explicit rooms");

  const roomResponses = {};
  const roomStatus = {};
  const errors = [...(memory.__errors ?? [])];
  for (const roomName of rooms) {
    try {
      roomStatus[roomName] = await api.raw.game.roomStatus(roomName, options.shard);
    } catch (error) {
      roomStatus[roomName] = { ok: 0, error: error instanceof Error ? error.message : String(error) };
      errors.push({ type: "roomStatus", room: roomName, message: error instanceof Error ? error.message : String(error) });
    }
    try {
      roomResponses[roomName] = await api.raw.game.roomObjects(roomName, options.shard);
    } catch (error) {
      roomResponses[roomName] = { objects: [], users: {} };
      errors.push({ type: "roomObjects", room: roomName, message: error instanceof Error ? error.message : String(error) });
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
  console.log(`wrote ${options.out}`);
  console.log(`rooms=${snapshot.roomCount} shard=${snapshot.source.shard} tick=${snapshot.source.tick} user=${snapshot.source.user}`);
  console.log(`read-only methods=${snapshot.source.apiPolicy.methodsUsed.join(",")}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exitCode = 1;
  });
}

export { exportSnapshot, parseOptions };

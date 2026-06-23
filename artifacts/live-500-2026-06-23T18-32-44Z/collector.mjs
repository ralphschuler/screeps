#!/usr/bin/env node
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { ScreepsAPI } = require("screeps-api");

const SHARD = "shard1";
const ALLIES = new Set(["TooAngel", "TedRoastBeef"]);
const ROOM_RE = /\b[WE]\d+[NS]\d+\b/g;
const MEMORY_PATHS = ["stats", "creeps", "creepTaskBoard", "defenseRequests", "clusters", "empire"];

const here = path.dirname(fileURLToPath(import.meta.url));
const out = (...parts) => path.join(here, ...parts);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const nowIso = () => new Date().toISOString();
const n = value => typeof value === "number" && Number.isFinite(value) ? value : null;

function parseArgs(argv) {
  const args = {
    ticks: 500,
    sampleEveryTicks: 15,
    pollMs: 10_000,
    maxRooms: 12,
    hostname: process.env.SCREEPS_HOSTNAME || "screeps.com",
    protocol: process.env.SCREEPS_PROTOCOL || "https",
    port: Number(process.env.SCREEPS_PORT || 443)
  };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--ticks" && next) args.ticks = Number(next), i++;
    else if (arg === "--sample-every-ticks" && next) args.sampleEveryTicks = Number(next), i++;
    else if (arg === "--poll-ms" && next) args.pollMs = Number(next), i++;
    else if (arg === "--max-rooms" && next) args.maxRooms = Number(next), i++;
    else if (arg === "--hostname" && next) args.hostname = next, i++;
    else if (arg === "--protocol" && next) args.protocol = next, i++;
    else if (arg === "--port" && next) args.port = Number(next), i++;
    else if (arg === "--help" || arg === "-h") {
      console.log("Usage: node collector.mjs --ticks 500 --sample-every-ticks 15 --poll-ms 10000 --max-rooms 12");
      process.exit(0);
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg}`);
    }
  }
  if (!Number.isFinite(args.ticks) || args.ticks < 1) throw new Error("--ticks must be >= 1");
  if (!Number.isFinite(args.sampleEveryTicks) || args.sampleEveryTicks < 10 || args.sampleEveryTicks > 25) throw new Error("--sample-every-ticks must be 10..25");
  if (!Number.isFinite(args.pollMs) || args.pollMs < 1000) throw new Error("--poll-ms must be >= 1000");
  if (!Number.isFinite(args.maxRooms) || args.maxRooms < 1) throw new Error("--max-rooms must be >= 1");
  return args;
}

function roomNamesFrom(value, max = 300, depth = 0, seen = new Set(), found = new Set()) {
  if (found.size >= max || depth > 8 || value == null) return found;
  if (typeof value === "string") {
    for (const match of value.matchAll(ROOM_RE)) {
      found.add(match[0]);
      if (found.size >= max) return found;
    }
    return found;
  }
  if (typeof value !== "object") return found;
  if (seen.has(value)) return found;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) roomNamesFrom(item, max, depth + 1, seen, found);
    return found;
  }
  for (const [key, child] of Object.entries(value)) {
    if (ROOM_RE.test(key)) found.add(key.match(ROOM_RE)[0]);
    ROOM_RE.lastIndex = 0;
    if (found.size >= max) return found;
    roomNamesFrom(child, max, depth + 1, seen, found);
    if (found.size >= max) return found;
  }
  return found;
}

function pushRoom(scores, room, score, reason) {
  if (!room || !/^([WE]\d+[NS]\d+)$/.test(room)) return;
  const current = scores.get(room) || { room, score: 0, reasons: new Set() };
  current.score = Math.max(current.score, score);
  current.reasons.add(reason);
  scores.set(room, current);
}

function selectRooms(memory, maxRooms) {
  const scores = new Map();
  pushRoom(scores, "W19S26", 100, "required W19S26");

  const statsRooms = memory.stats?.rooms && typeof memory.stats.rooms === "object" ? Object.keys(memory.stats.rooms) : [];
  for (const room of statsRooms) pushRoom(scores, room, 95, "stats.rooms");

  for (const room of roomNamesFrom(memory.defenseRequests)) pushRoom(scores, room, 90, "defenseRequests");
  for (const room of roomNamesFrom(memory.clusters, 120)) pushRoom(scores, room, 82, "clusters");

  const empireRooms = [...roomNamesFrom(memory.empire, 120)];
  for (const room of empireRooms) pushRoom(scores, room, 72, "empire");

  const creepRoomCounts = new Map();
  const creeps = memory.creeps && typeof memory.creeps === "object" ? memory.creeps : {};
  for (const creep of Object.values(creeps)) {
    const candidates = [creep?.pos?.roomName, creep?.roomName, creep?.room, creep?.homeRoom, creep?.targetRoom, creep?.destinationRoom, creep?.assignedRoom];
    for (const room of candidates) {
      if (/^([WE]\d+[NS]\d+)$/.test(room || "")) creepRoomCounts.set(room, (creepRoomCounts.get(room) || 0) + 1);
    }
  }
  for (const [room, count] of creepRoomCounts) pushRoom(scores, room, 60 + Math.min(10, count), `creeps:${count}`);

  return [...scores.values()]
    .sort((a, b) => b.score - a.score || a.room.localeCompare(b.room))
    .slice(0, maxRooms)
    .map(entry => ({ room: entry.room, score: entry.score, reasons: [...entry.reasons].sort() }));
}

function usernameFor(rawUser, users = {}, me = {}) {
  if (!rawUser) return null;
  if (typeof rawUser === "string") return users[rawUser]?.username || users[rawUser]?.name || rawUser;
  if (typeof rawUser === "object") {
    if (rawUser.username || rawUser.name) return rawUser.username || rawUser.name;
    if (rawUser._id) return users[rawUser._id]?.username || users[rawUser._id]?.name || rawUser._id;
  }
  return null;
}

function ownerName(obj, users, me) {
  const candidates = [obj.user, obj.owner, obj.reservation?.user, obj.invaderCore?.user];
  for (const candidate of candidates) {
    const name = usernameFor(candidate, users, me);
    if (name) return name;
  }
  if (obj.user === me?._id || obj.owner?.user === me?._id) return me?.username || me?._id;
  return null;
}

function bodySummary(body) {
  const counts = {};
  if (!Array.isArray(body)) return counts;
  for (const part of body) {
    const type = typeof part === "string" ? part : part?.type;
    if (type) counts[type] = (counts[type] || 0) + 1;
  }
  return counts;
}

function summarizeRoomObjects(response, room, me) {
  const objects = Array.isArray(response?.objects) ? response.objects : [];
  const users = response?.users || {};
  const byType = {};
  const structures = {};
  const myCreeps = [];
  const hostileCreeps = [];
  const alliedCreeps = [];
  const neutralCreeps = [];
  const hostileStructures = {};
  const alliedStructures = {};
  const controllers = [];
  const spawns = [];
  const towers = [];
  const sources = [];
  const dropped = [];
  const tombstones = [];
  const ruins = [];
  let storageEnergy = null;
  let terminalEnergy = null;

  for (const obj of objects) {
    const type = obj.type || obj.structureType || "unknown";
    byType[type] = (byType[type] || 0) + 1;
    const structureType = obj.structureType || (type !== "creep" ? type : null);
    const owner = ownerName(obj, users, me);
    const mine = owner && (owner === me?.username || owner === me?._id);
    const allied = owner && ALLIES.has(owner);
    const pos = { x: obj.x, y: obj.y, roomName: obj.room || room };

    if (type === "creep") {
      const entry = { name: obj.name, owner, x: obj.x, y: obj.y, hits: obj.hits, hitsMax: obj.hitsMax, body: bodySummary(obj.body) };
      if (mine) myCreeps.push(entry);
      else if (allied) alliedCreeps.push(entry);
      else if (owner) hostileCreeps.push(entry);
      else neutralCreeps.push(entry);
      continue;
    }

    if (structureType) structures[structureType] = (structures[structureType] || 0) + 1;
    if (owner && !mine && !allied) hostileStructures[structureType] = (hostileStructures[structureType] || 0) + 1;
    if (allied) alliedStructures[structureType] = (alliedStructures[structureType] || 0) + 1;

    if (type === "controller") {
      controllers.push({ level: obj.level, owner, reservation: ownerName({ user: obj.reservation?.user }, users, me), safeMode: obj.safeMode, upgradeBlocked: obj.upgradeBlocked, x: obj.x, y: obj.y });
    }
    if (structureType === "spawn") spawns.push({ name: obj.name, owner, hits: obj.hits, energy: obj.store?.energy ?? obj.energy, spawning: Boolean(obj.spawning), x: obj.x, y: obj.y });
    if (structureType === "tower") towers.push({ owner, hits: obj.hits, energy: obj.store?.energy ?? obj.energy, x: obj.x, y: obj.y });
    if (structureType === "source") sources.push({ energy: obj.energy, energyCapacity: obj.energyCapacity, x: obj.x, y: obj.y });
    if (structureType === "storage" && mine) storageEnergy = obj.store?.energy ?? obj.store?.["energy"] ?? null;
    if (structureType === "terminal" && mine) terminalEnergy = obj.store?.energy ?? obj.store?.["energy"] ?? null;
    if (type === "resource") dropped.push({ resourceType: obj.resourceType, amount: obj.amount, x: obj.x, y: obj.y });
    if (type === "tombstone") tombstones.push({ owner, ticksToDecay: obj.ticksToDecay, x: obj.x, y: obj.y });
    if (type === "ruin") ruins.push({ owner, ticksToDecay: obj.ticksToDecay, x: obj.x, y: obj.y });
  }

  return {
    ok: response?.ok,
    objectCount: objects.length,
    users: Object.fromEntries(Object.entries(users).map(([id, user]) => [id, user.username || user.name || id])),
    byType,
    structures,
    controllers,
    spawns,
    towers: { count: towers.length, my: towers.filter(t => t.owner === me?.username || t.owner === me?._id).length, totalEnergy: towers.reduce((sum, tower) => sum + (n(tower.energy) ?? 0), 0) },
    sources,
    storageEnergy,
    terminalEnergy,
    myCreeps: { count: myCreeps.length, sample: myCreeps.slice(0, 12) },
    hostileCreeps: { count: hostileCreeps.length, sample: hostileCreeps.slice(0, 20) },
    alliedCreeps: { count: alliedCreeps.length, sample: alliedCreeps.slice(0, 20) },
    neutralCreeps: { count: neutralCreeps.length },
    hostileStructures,
    alliedStructures,
    dropped: { count: dropped.length, totalAmount: dropped.reduce((sum, item) => sum + (n(item.amount) ?? 0), 0), sample: dropped.slice(0, 10) },
    tombstones: { count: tombstones.length },
    ruins: { count: ruins.length },
    allySafety: { alliesSeen: alliedCreeps.length + Object.values(alliedStructures).reduce((sum, count) => sum + count, 0), alliesNeverClassifiedHostile: true }
  };
}

function roleCounts(creeps) {
  const counts = {};
  if (!creeps || typeof creeps !== "object") return counts;
  for (const creep of Object.values(creeps)) {
    const role = creep?.role || creep?.memory?.role || creep?.taskRole || creep?.type || "unknown";
    counts[role] = (counts[role] || 0) + 1;
  }
  return counts;
}

function summarizeTaskBoard(board) {
  if (!board || typeof board !== "object") return { present: false, total: 0, assigned: 0, unassigned: 0, byStatus: {}, byType: {}, arrays: [] };
  const tasks = [];
  const arrays = [];
  const seen = new Set();
  function visit(value, keyPath = "", depth = 0) {
    if (!value || typeof value !== "object" || depth > 6 || seen.has(value)) return;
    seen.add(value);
    if (Array.isArray(value)) {
      arrays.push({ path: keyPath || "<root>", count: value.length });
      for (const item of value.slice(0, 500)) visit(item, keyPath, depth + 1);
      return;
    }
    const keys = Object.keys(value);
    const taskish = keys.some(k => ["id", "taskId", "type", "status", "priority", "assignee", "assignedTo", "creep", "creepName", "room", "roomName"].includes(k));
    if (taskish) tasks.push(value);
    for (const [key, child] of Object.entries(value)) visit(child, keyPath ? `${keyPath}.${key}` : key, depth + 1);
  }
  visit(board);
  let assigned = 0;
  const byStatus = {};
  const byType = {};
  for (const task of tasks) {
    const status = task.status || task.state || (task.assignee || task.assignedTo || task.creep || task.creepName ? "assigned" : "unknown");
    const type = task.type || task.taskType || task.kind || "unknown";
    if (task.assignee || task.assignedTo || task.creep || task.creepName || status === "assigned") assigned++;
    byStatus[status] = (byStatus[status] || 0) + 1;
    byType[type] = (byType[type] || 0) + 1;
  }
  const total = tasks.length || Math.max(0, ...arrays.map(a => a.count), 0);
  return { present: true, total, assigned, unassigned: Math.max(0, total - assigned), byStatus, byType, arrays: arrays.sort((a, b) => b.count - a.count).slice(0, 15) };
}

function summarizeQueues(memory) {
  const queues = [];
  const seen = new Set();
  function visit(value, keyPath = "", depth = 0) {
    if (!value || typeof value !== "object" || depth > 7 || seen.has(value)) return;
    seen.add(value);
    if (Array.isArray(value)) {
      if (/spawn|queue|request|intent/i.test(keyPath)) queues.push({ path: keyPath || "<root>", count: value.length, sample: value.slice(0, 5).map(item => typeof item === "object" ? Object.fromEntries(Object.entries(item).slice(0, 8)) : item) });
      for (const item of value.slice(0, 100)) visit(item, keyPath, depth + 1);
      return;
    }
    for (const [key, child] of Object.entries(value)) visit(child, keyPath ? `${keyPath}.${key}` : key, depth + 1);
  }
  visit(memory.stats, "stats");
  visit(memory.empire, "empire");
  visit(memory.clusters, "clusters");
  return queues.sort((a, b) => b.count - a.count).slice(0, 20);
}

function extractMetricSummary(memory, sampleTick) {
  const stats = memory.stats || {};
  return {
    tick: n(stats.tick) ?? sampleTick,
    cpuUsed: n(stats.cpu?.used) ?? n(stats.cpu?.getUsed) ?? n(stats.cpuUsed),
    cpuLimit: n(stats.cpu?.limit) ?? n(stats.cpu?.tickLimit),
    bucket: n(stats.cpu?.bucket) ?? n(stats.bucket),
    skippedProcesses: n(stats.empire?.skipped_processes) ?? n(stats.skippedProcesses),
    rooms: stats.rooms && typeof stats.rooms === "object" ? Object.fromEntries(Object.entries(stats.rooms).map(([room, data]) => [room, {
      rcl: data?.rcl ?? data?.controller?.level,
      energy: data?.energy ?? data?.energyAvailable,
      energyCapacity: data?.energyCapacity ?? data?.energyCapacityAvailable,
      creeps: data?.creeps,
      cpuAvg: n(data?.profiler?.avg_cpu) ?? n(data?.cpu?.avg),
      cpuPeak: n(data?.profiler?.peak_cpu) ?? n(data?.cpu?.peak)
    }])) : {},
    topProcesses: topStats(stats.processes, "avg_cpu", 10),
    topSubsystems: topStats(stats.subsystems, "avg_cpu", 10),
    topRolesCpu: topStats(stats.roles, "avg_cpu", 10)
  };
}

function topStats(obj, valueKey, limit) {
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj)
    .map(([key, value]) => ({ key, name: value?.name, avg: n(value?.[valueKey]) ?? n(value?.avg) ?? n(value?.cpu), max: n(value?.max_cpu) ?? n(value?.peak_cpu), count: value?.count ?? value?.run_count ?? value?.calls }))
    .filter(row => row.avg != null)
    .sort((a, b) => b.avg - a.avg)
    .slice(0, limit);
}

async function getMemory(api, pathName) {
  const res = await api.memory.get(pathName, SHARD);
  if (res?.ok !== 1 && res?.ok != null) throw new Error(`memory.${pathName} ok=${res.ok}`);
  return res?.data ?? null;
}

async function sample(api, me, statusCache, tick, args) {
  const memory = {};
  const memoryErrors = {};
  for (const pathName of MEMORY_PATHS) {
    try {
      memory[pathName] = await getMemory(api, pathName);
    } catch (error) {
      memory[pathName] = null;
      memoryErrors[pathName] = error instanceof Error ? error.message : String(error);
    }
  }

  const selectedRooms = selectRooms(memory, args.maxRooms);
  const rooms = {};
  for (const entry of selectedRooms) {
    const room = entry.room;
    const roomResult = { selection: entry, status: statusCache[room], objects: null, error: null };
    try {
      if (!statusCache[room]) statusCache[room] = await api.raw.game.roomStatus(room, SHARD);
      roomResult.status = statusCache[room];
      const objects = await api.raw.game.roomObjects(room, SHARD);
      roomResult.objects = summarizeRoomObjects(objects, room, me);
    } catch (error) {
      roomResult.error = error instanceof Error ? error.message : String(error);
    }
    rooms[room] = roomResult;
    await sleep(100);
  }

  const metrics = extractMetricSummary(memory, tick);
  const roles = roleCounts(memory.creeps);
  const taskBoard = summarizeTaskBoard(memory.creepTaskBoard);
  const spawnQueues = summarizeQueues(memory);
  const defenseRooms = [...roomNamesFrom(memory.defenseRequests)].sort();
  const clusterRooms = [...roomNamesFrom(memory.clusters, 120)].sort();
  const empireRooms = [...roomNamesFrom(memory.empire, 120)].sort();

  return {
    sampledAt: nowIso(),
    tick,
    metrics,
    memoryErrors,
    roleCounts: roles,
    taskBoard,
    spawnQueues,
    defenseRooms,
    clusterRooms,
    empireRooms: empireRooms.slice(0, 80),
    selectedRooms,
    rooms,
    memory
  };
}

function avg(values) {
  const nums = values.filter(v => typeof v === "number" && Number.isFinite(v));
  return nums.length ? nums.reduce((sum, value) => sum + value, 0) / nums.length : null;
}
function min(values) { const nums = values.filter(v => typeof v === "number" && Number.isFinite(v)); return nums.length ? Math.min(...nums) : null; }
function max(values) { const nums = values.filter(v => typeof v === "number" && Number.isFinite(v)); return nums.length ? Math.max(...nums) : null; }
function last(values) { return values.length ? values[values.length - 1] : null; }

function aggregate(samples, startTick, finalTick, me) {
  const cpu = samples.map(s => s.metrics.cpuUsed).filter(v => v != null);
  const bucket = samples.map(s => s.metrics.bucket).filter(v => v != null);
  const skipped = samples.map(s => s.metrics.skippedProcesses).filter(v => v != null);
  const latest = samples[samples.length - 1];
  const roleTotals = {};
  for (const sample of samples) {
    for (const [role, count] of Object.entries(sample.roleCounts || {})) {
      roleTotals[role] = Math.max(roleTotals[role] || 0, count);
    }
  }
  const latestRooms = latest?.rooms || {};
  const roomHealth = Object.fromEntries(Object.entries(latestRooms).map(([room, data]) => {
    const obj = data.objects || {};
    return [room, {
      status: data.status?.status,
      controller: obj.controllers?.[0] || null,
      spawns: obj.spawns?.length ?? 0,
      towers: obj.towers?.count ?? 0,
      towerEnergy: obj.towers?.totalEnergy ?? 0,
      myCreeps: obj.myCreeps?.count ?? 0,
      hostileCreeps: obj.hostileCreeps?.count ?? 0,
      alliedCreeps: obj.alliedCreeps?.count ?? 0,
      hostileSample: obj.hostileCreeps?.sample || [],
      alliedSample: obj.alliedCreeps?.sample || [],
      storageEnergy: obj.storageEnergy,
      terminalEnergy: obj.terminalEnergy,
      allySafety: obj.allySafety
    }];
  }));
  const hostileSightings = [];
  const allySightings = [];
  for (const sample of samples) {
    for (const [room, data] of Object.entries(sample.rooms || {})) {
      const hostile = data.objects?.hostileCreeps?.count || 0;
      const allied = data.objects?.alliedCreeps?.count || 0;
      if (hostile) hostileSightings.push({ tick: sample.tick, room, count: hostile, sample: data.objects.hostileCreeps.sample.slice(0, 5) });
      if (allied) allySightings.push({ tick: sample.tick, room, count: allied, sample: data.objects.alliedCreeps.sample.slice(0, 5) });
    }
  }
  const processAverages = new Map();
  const subsystemAverages = new Map();
  for (const sample of samples) {
    for (const p of sample.metrics.topProcesses || []) {
      const row = processAverages.get(p.key) || { key: p.key, name: p.name, values: [], max: null };
      row.values.push(p.avg);
      row.max = Math.max(row.max ?? 0, p.max ?? p.avg ?? 0);
      processAverages.set(p.key, row);
    }
    for (const p of sample.metrics.topSubsystems || []) {
      const row = subsystemAverages.get(p.key) || { key: p.key, name: p.name, values: [], max: null };
      row.values.push(p.avg);
      row.max = Math.max(row.max ?? 0, p.max ?? p.avg ?? 0);
      subsystemAverages.set(p.key, row);
    }
  }
  const topProcesses = [...processAverages.values()].map(row => ({ key: row.key, name: row.name, avg: avg(row.values), max: row.max, samples: row.values.length })).sort((a, b) => b.avg - a.avg).slice(0, 12);
  const topSubsystems = [...subsystemAverages.values()].map(row => ({ key: row.key, name: row.name, avg: avg(row.values), max: row.max, samples: row.values.length })).sort((a, b) => b.avg - a.avg).slice(0, 12);

  const taskLatest = latest?.taskBoard || {};
  const queueLatest = latest?.spawnQueues || [];
  const candidates = rankCandidates({ cpu, bucket, skipped, topProcesses, topSubsystems, hostileSightings, roomHealth, taskLatest, queueLatest, samples, me });

  return {
    generatedAt: nowIso(),
    shard: SHARD,
    observer: { username: me?.username, id: me?._id, cpu: me?.cpu, gcl: me?.gcl },
    tickRange: { start: startTick, final: finalTick, span: finalTick - startTick, firstSample: samples[0]?.tick, lastSample: latest?.tick, sampleSpan: (latest?.tick ?? 0) - (samples[0]?.tick ?? 0) },
    sampleCount: samples.length,
    cpu: { avg: avg(cpu), max: max(cpu), bucketAvg: avg(bucket), bucketMin: min(bucket), bucketStart: bucket[0] ?? null, bucketEnd: last(bucket), bucketDelta: bucket.length ? last(bucket) - bucket[0] : null, skippedAvg: avg(skipped) },
    rolesLatest: latest?.roleCounts || {},
    rolesMaxSeen: roleTotals,
    taskBoardLatest: taskLatest,
    spawnQueuesLatest: queueLatest,
    defenseRoomsLatest: latest?.defenseRooms || [],
    clusterRoomsLatest: latest?.clusterRooms || [],
    empireRoomsLatest: latest?.empireRooms || [],
    topProcesses,
    topSubsystems,
    roomHealthLatest: roomHealth,
    hostileSightings,
    allySightings,
    allySafety: {
      configuredAllies: [...ALLIES],
      allySightings: allySightings.length,
      hostileSightingsExcludeAllies: true,
      notes: "TooAngel and TedRoastBeef are classified as allies, never hostiles."
    },
    candidates
  };
}

function severity(label) {
  return label === "high" ? 3 : label === "medium" ? 2 : 1;
}
function candidate(title, impact, evidence, risk, details) {
  return { title, impact, evidence, risk, score: severity(impact) * 3 + severity(evidence) * 2 + (risk === "low" ? 3 : risk === "medium" ? 2 : 1), details };
}

function rankCandidates(ctx) {
  const candidates = [];
  const cpuAvg = avg(ctx.cpu);
  const cpuMax = max(ctx.cpu);
  const bucketMin = min(ctx.bucket);
  const bucketDelta = ctx.bucket.length ? last(ctx.bucket) - ctx.bucket[0] : null;
  const hottest = ctx.topProcesses[0] || ctx.topSubsystems[0];
  if (hottest && (cpuAvg == null || cpuAvg > 25 || (bucketDelta != null && bucketDelta < -500) || (bucketMin != null && bucketMin < 8000))) {
    candidates.push(candidate(
      `Optimize/throttle hottest CPU path: ${hottest.key}${hottest.name ? ` (${hottest.name})` : ""}`,
      bucketMin != null && bucketMin < 3000 ? "high" : "medium",
      hottest.samples >= Math.max(3, Math.floor(ctx.samples.length / 3)) ? "high" : "medium",
      "medium",
      { cpuAvg, cpuMax, bucketMin, bucketDelta, hottest, topProcesses: ctx.topProcesses.slice(0, 5), topSubsystems: ctx.topSubsystems.slice(0, 5) }
    ));
  }

  const w19 = ctx.roomHealth.W19S26;
  const w19Hostiles = w19?.hostileCreeps || 0;
  const w19MyCreeps = w19?.myCreeps || 0;
  if (w19 || ctx.hostileSightings.some(s => s.room === "W19S26")) {
    if (w19Hostiles > 0 && w19MyCreeps === 0) {
      candidates.push(candidate(
        "Add low-risk W19S26 responder/avoidance behavior for visible hostiles",
        "high",
        "high",
        "medium",
        { W19S26: w19, sightings: ctx.hostileSightings.filter(s => s.room === "W19S26").slice(-5) }
      ));
    } else if (w19Hostiles > 0) {
      candidates.push(candidate(
        "Tune W19S26 defense handling around observed hostile pressure",
        "medium",
        "high",
        "medium",
        { W19S26: w19, sightings: ctx.hostileSightings.filter(s => s.room === "W19S26").slice(-5) }
      ));
    } else {
      candidates.push(candidate(
        "Keep W19S26 defense watch; no hostile action needed from this window",
        "low",
        "medium",
        "low",
        { W19S26: w19, sightings: ctx.hostileSightings.filter(s => s.room === "W19S26").slice(-5) }
      ));
    }
  }

  const taskTotal = ctx.taskLatest.total || 0;
  const taskUnassigned = ctx.taskLatest.unassigned || 0;
  const queueCount = ctx.queueLatest.reduce((sum, queue) => sum + (queue.count || 0), 0);
  if (taskUnassigned > 20 || queueCount > 10) {
    candidates.push(candidate(
      "Reduce task/spawn backlog by tightening spawn intent prioritization",
      taskUnassigned > 50 || queueCount > 25 ? "high" : "medium",
      "medium",
      "low",
      { taskBoard: ctx.taskLatest, spawnQueues: ctx.queueLatest.slice(0, 10) }
    ));
  }

  const weakOwned = Object.entries(ctx.roomHealth).filter(([, room]) => room.controller?.owner === ctx.me?.username && room.spawns === 0);
  if (weakOwned.length) {
    candidates.push(candidate(
      "Repair owned-room spawn continuity for rooms without visible spawns",
      "high",
      "medium",
      "medium",
      { rooms: weakOwned }
    ));
  }

  if (!candidates.length) {
    candidates.push(candidate(
      "No urgent live issue; choose a small CPU/observability cleanup next",
      "low",
      "medium",
      "low",
      { cpuAvg, bucketMin, bucketDelta, hostileSightings: ctx.hostileSightings.slice(-10) }
    ));
  }

  return candidates.sort((a, b) => b.score - a.score || severity(b.impact) - severity(a.impact));
}

function fmtNum(value, digits = 2) {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(digits) : "n/a";
}

function markdown(summary) {
  const lines = [];
  lines.push("# Live 500-tick Screeps Observer Summary");
  lines.push("");
  lines.push(`- Shard: ${summary.shard}`);
  lines.push(`- Tick range: ${summary.tickRange.start} -> ${summary.tickRange.final} (span ${summary.tickRange.span})`);
  lines.push(`- Samples: ${summary.sampleCount} (sample span ${summary.tickRange.sampleSpan})`);
  lines.push(`- CPU avg/max: ${fmtNum(summary.cpu.avg)}/${fmtNum(summary.cpu.max)}; bucket start/end/min/delta: ${fmtNum(summary.cpu.bucketStart, 0)}/${fmtNum(summary.cpu.bucketEnd, 0)}/${fmtNum(summary.cpu.bucketMin, 0)}/${fmtNum(summary.cpu.bucketDelta, 0)}`);
  lines.push(`- Skipped processes avg: ${fmtNum(summary.cpu.skippedAvg, 1)}`);
  lines.push(`- Ally safety: configured allies ${summary.allySafety.configuredAllies.join(", ")}; ally sightings ${summary.allySafety.allySightings}; allies excluded from hostiles.`);
  lines.push("");
  lines.push("## Top processes/subsystems");
  for (const row of summary.topProcesses.slice(0, 8)) lines.push(`- process ${row.key}${row.name ? ` (${row.name})` : ""}: avg ${fmtNum(row.avg, 3)}, max ${fmtNum(row.max, 3)}, samples ${row.samples}`);
  for (const row of summary.topSubsystems.slice(0, 5)) lines.push(`- subsystem ${row.key}: avg ${fmtNum(row.avg, 3)}, max ${fmtNum(row.max, 3)}, samples ${row.samples}`);
  lines.push("");
  lines.push("## Room health latest");
  for (const [room, data] of Object.entries(summary.roomHealthLatest)) {
    lines.push(`- ${room}: status=${data.status ?? "n/a"}, spawns=${data.spawns}, towers=${data.towers} energy=${data.towerEnergy}, myCreeps=${data.myCreeps}, hostiles=${data.hostileCreeps}, allies=${data.alliedCreeps}, controller=${data.controller?.level ?? "n/a"}/${data.controller?.owner ?? data.controller?.reservation ?? "unowned"}`);
    for (const hostile of data.hostileSample.slice(0, 3)) lines.push(`  - hostile ${hostile.owner}/${hostile.name ?? "unnamed"} @${hostile.x},${hostile.y} hits=${hostile.hits}/${hostile.hitsMax}`);
    for (const ally of data.alliedSample.slice(0, 3)) lines.push(`  - ally ${ally.owner}/${ally.name ?? "unnamed"} @${ally.x},${ally.y}`);
  }
  lines.push("");
  lines.push("## Spawn/task/roles latest");
  lines.push(`- roles: ${JSON.stringify(summary.rolesLatest)}`);
  lines.push(`- taskBoard: total=${summary.taskBoardLatest.total ?? 0}, assigned=${summary.taskBoardLatest.assigned ?? 0}, unassigned=${summary.taskBoardLatest.unassigned ?? 0}, status=${JSON.stringify(summary.taskBoardLatest.byStatus || {})}`);
  if (summary.spawnQueuesLatest.length) {
    for (const queue of summary.spawnQueuesLatest.slice(0, 8)) lines.push(`- queue ${queue.path}: ${queue.count}`);
  } else lines.push("- spawn queues: none detected in sampled Memory paths");
  lines.push("");
  lines.push("## Hostiles/defense");
  lines.push(`- hostile sightings: ${summary.hostileSightings.length}`);
  for (const sighting of summary.hostileSightings.slice(-10)) lines.push(`- tick ${sighting.tick} ${sighting.room}: ${sighting.count} hostile creeps (${sighting.sample.map(h => h.owner).join(", ")})`);
  lines.push(`- defense rooms latest: ${summary.defenseRoomsLatest.join(", ") || "none"}`);
  lines.push("");
  lines.push("## Ranked candidates");
  for (const [idx, item] of summary.candidates.entries()) {
    lines.push(`${idx + 1}. ${item.title} — impact=${item.impact}, evidence=${item.evidence}, risk=${item.risk}, score=${item.score}`);
  }
  lines.push("");
  lines.push(`## Recommended top candidate`);
  lines.push(summary.candidates[0]?.title || "n/a");
  lines.push("");
  return `${lines.join("\n")}\n`;
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

  // Read-only endpoints used only: api.me, api.time, api.memory.get, api.raw.game.roomStatus, api.raw.game.roomObjects.
  const meRaw = await api.me();
  if (!meRaw?.username && !meRaw?._id) throw new Error("API auth failed: missing username/id from api.me");
  const me = { _id: meRaw._id, username: meRaw.username, cpu: meRaw.cpu, gcl: meRaw.gcl };

  const start = await api.time(SHARD);
  const startTick = Number(start.time);
  if (!Number.isFinite(startTick)) throw new Error(`api.time returned invalid tick: ${JSON.stringify(start)}`);
  const targetTick = startTick + args.ticks;

  const samples = [];
  const statusCache = {};
  let finalTick = startTick;
  let nextSampleTick = startTick;
  let consecutiveFailures = 0;
  fs.writeFileSync(out("progress.log"), `start ${nowIso()} shard=${SHARD} tick=${startTick} target=${targetTick}\n`);
  console.log(`start shard=${SHARD} tick=${startTick} target=${targetTick} out=${here}`);

  while (finalTick - startTick < args.ticks) {
    let time;
    try {
      time = await api.time(SHARD);
      finalTick = Number(time.time);
      if (!Number.isFinite(finalTick)) throw new Error(`invalid time response ${JSON.stringify(time)}`);
      consecutiveFailures = 0;
    } catch (error) {
      consecutiveFailures++;
      const message = error instanceof Error ? error.message : String(error);
      fs.appendFileSync(out("progress.log"), `time-error ${nowIso()} failures=${consecutiveFailures} ${message}\n`);
      if (/Not Authorized|401|auth/i.test(message)) throw new Error(`API auth failure: ${message}`);
      if (consecutiveFailures >= 10) throw new Error(`Repeated API failures prevented reaching requested tick span: ${message}`);
      await sleep(args.pollMs);
      continue;
    }

    const due = samples.length === 0 || finalTick >= nextSampleTick || finalTick >= targetTick;
    if (due) {
      try {
        const s = await sample(api, me, statusCache, finalTick, args);
        samples.push(s);
        nextSampleTick = finalTick + args.sampleEveryTicks;
        fs.appendFileSync(out("samples.ndjson"), `${JSON.stringify(s)}\n`);
        fs.appendFileSync(out("progress.log"), `sample ${samples.length} tick=${finalTick} span=${finalTick - startTick} rooms=${s.selectedRooms.map(r => r.room).join(",")} cpu=${s.metrics.cpuUsed ?? "n/a"} bucket=${s.metrics.bucket ?? "n/a"}\n`);
        console.log(`sample=${samples.length} tick=${finalTick} span=${finalTick - startTick}/${args.ticks} cpu=${s.metrics.cpuUsed ?? "n/a"} bucket=${s.metrics.bucket ?? "n/a"} rooms=${s.selectedRooms.map(r => r.room).join(",")}`);
      } catch (error) {
        consecutiveFailures++;
        const message = error instanceof Error ? error.message : String(error);
        fs.appendFileSync(out("progress.log"), `sample-error ${nowIso()} failures=${consecutiveFailures} ${message}\n`);
        if (/Not Authorized|401|auth/i.test(message)) throw new Error(`API auth failure: ${message}`);
        if (consecutiveFailures >= 10) throw new Error(`Repeated API failures prevented reaching requested tick span: ${message}`);
      }
    }

    if (finalTick - startTick >= args.ticks) break;
    await sleep(args.pollMs);
  }

  if (samples.length === 0 || samples[samples.length - 1].tick !== finalTick) {
    const s = await sample(api, me, statusCache, finalTick, args);
    samples.push(s);
    fs.appendFileSync(out("samples.ndjson"), `${JSON.stringify(s)}\n`);
  }

  const summary = aggregate(samples, startTick, finalTick, me);
  const final = { args, samples, summary };
  fs.writeFileSync(out("samples.json"), JSON.stringify(final, null, 2));
  fs.writeFileSync(out("summary.json"), JSON.stringify(summary, null, 2));
  fs.writeFileSync(out("summary.md"), markdown(summary));
  fs.appendFileSync(out("progress.log"), `done ${nowIso()} span=${summary.tickRange.span} samples=${summary.sampleCount}\n`);
  console.log(`done span=${summary.tickRange.span} samples=${summary.sampleCount}`);
  console.log(`wrote ${out("samples.json")}`);
  console.log(`wrote ${out("summary.json")}`);
  console.log(`wrote ${out("summary.md")}`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

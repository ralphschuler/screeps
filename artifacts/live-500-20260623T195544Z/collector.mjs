#!/usr/bin/env node
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { ScreepsAPI } = require("screeps-api");

const SHARD = "shard1";
const TICK_SPAN = Number(process.env.TICK_SPAN || 500);
const SAMPLE_STEP_TICKS = Number(process.env.SAMPLE_STEP_TICKS || 20);
const POLL_MS = Number(process.env.POLL_MS || 10_000);
const MAX_ROOMS_PER_SAMPLE = Number(process.env.MAX_ROOMS_PER_SAMPLE || 25);
const OUT_DIR = path.dirname(fileURLToPath(import.meta.url));
const MEMORY_PATHS = ["stats", "creeps", "creepTaskBoard", "defenseRequests", "clusters", "empire"];
const ROOM_RE = /^[WE]\d+[NS]\d+$/;
const ALLY_NAMES = new Set(["TooAngel", "TedRoastBeef"]);
const REQUIRED_ROOM = "W19S26";

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const nowIso = () => new Date().toISOString();
const n = value => (typeof value === "number" && Number.isFinite(value) ? value : undefined);
const avg = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined;
const min = values => values.length ? Math.min(...values) : undefined;
const max = values => values.length ? Math.max(...values) : undefined;
const last = values => values[values.length - 1];
const round = value => typeof value === "number" && Number.isFinite(value) ? Math.round(value * 1000) / 1000 : value;
const roomLike = value => typeof value === "string" && ROOM_RE.test(value);

function unwrapMemory(response) {
  if (!response) return null;
  if (Object.prototype.hasOwnProperty.call(response, "data")) return response.data;
  return response;
}

function safeKeys(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? Object.keys(value) : [];
}

function pushRoom(priorities, room, priority, reason) {
  if (!roomLike(room)) return;
  const entry = priorities.get(room) || { room, priority: 0, reasons: new Set() };
  entry.priority = Math.max(entry.priority, priority);
  entry.reasons.add(reason);
  priorities.set(room, entry);
}

function scanRoomStrings(value, priorities, priority, reason, limit = 3000) {
  const stack = [value];
  const seen = new Set();
  let inspected = 0;
  while (stack.length && inspected < limit) {
    const current = stack.pop();
    inspected += 1;
    if (roomLike(current)) {
      pushRoom(priorities, current, priority, reason);
      continue;
    }
    if (!current || typeof current !== "object") continue;
    if (seen.has(current)) continue;
    seen.add(current);
    if (Array.isArray(current)) {
      for (const item of current) stack.push(item);
    } else {
      for (const [key, item] of Object.entries(current)) {
        if (roomLike(key)) pushRoom(priorities, key, priority, `${reason}:key`);
        if (/room|target|origin|home|remote|claim|war|defense|nuke/i.test(key)) stack.push(item);
      }
    }
  }
}

function deriveRooms(memory) {
  const priorities = new Map();
  pushRoom(priorities, REQUIRED_ROOM, 1000, "required");

  for (const room of safeKeys(memory.stats?.rooms)) pushRoom(priorities, room, 900, "stats.rooms");
  for (const room of safeKeys(memory.creepTaskBoard?.rooms)) pushRoom(priorities, room, 850, "taskBoard.rooms");
  for (const req of Array.isArray(memory.defenseRequests) ? memory.defenseRequests : Object.values(memory.defenseRequests || {})) {
    if (!req || typeof req !== "object") continue;
    pushRoom(priorities, req.roomName, 950, "defenseRequests.roomName");
    pushRoom(priorities, req.targetRoom, 950, "defenseRequests.targetRoom");
    pushRoom(priorities, req.homeRoom, 800, "defenseRequests.homeRoom");
  }

  const empire = memory.empire || {};
  if (Array.isArray(empire.ownedRooms)) for (const room of empire.ownedRooms) pushRoom(priorities, room, 900, "empire.ownedRooms");
  scanRoomStrings(empire.clusters, priorities, 760, "empire.clusters");
  scanRoomStrings(empire.claimQueue, priorities, 720, "empire.claimQueue");
  scanRoomStrings(empire.warTargets, priorities, 920, "empire.warTargets");
  scanRoomStrings(empire.warTargetRooms, priorities, 920, "empire.warTargetRooms");
  scanRoomStrings(empire.offensiveOperations, priorities, 880, "empire.offensiveOperations");
  scanRoomStrings(empire.objectives, priorities, 760, "empire.objectives");
  scanRoomStrings(empire.nukeCandidates, priorities, 760, "empire.nukeCandidates");
  scanRoomStrings(empire.incomingNukes, priorities, 900, "empire.incomingNukes");
  scanRoomStrings(empire.recoveryRooms, priorities, 820, "empire.recoveryRooms");

  scanRoomStrings(memory.clusters, priorities, 780, "Memory.clusters");

  for (const creep of Object.values(memory.creeps || {})) {
    if (!creep || typeof creep !== "object") continue;
    pushRoom(priorities, creep.home_room || creep.homeRoom || creep.home, 650, "creep.home");
    pushRoom(priorities, creep.current_room || creep.currentRoom || creep.room, 620, "creep.current");
    pushRoom(priorities, creep.targetRoom || creep.remoteRoom, 620, "creep.target");
  }

  return [...priorities.values()]
    .sort((a, b) => b.priority - a.priority || a.room.localeCompare(b.room))
    .slice(0, MAX_ROOMS_PER_SAMPLE)
    .map(entry => ({ room: entry.room, priority: entry.priority, reasons: [...entry.reasons].sort() }));
}

function bodyCounts(creep) {
  const counts = {};
  for (const part of creep.body || []) counts[part.type] = (counts[part.type] || 0) + 1;
  return counts;
}

function combatParts(counts) {
  return (counts.attack || 0) + (counts.ranged_attack || 0) + (counts.heal || 0) + (counts.work || 0);
}

function summarizeRoomObjects(room, response, myUserName) {
  const objects = Array.isArray(response?.objects) ? response.objects : Object.values(response?.objects || {});
  const users = response?.users || {};
  const userName = id => users[id]?.username || (id === myUserName ? myUserName : id);
  const byType = {};
  const hostileCreeps = [];
  const allyCreeps = [];
  const myCreeps = [];
  const otherCreeps = [];
  const controllers = [];
  let spawnCount = 0;
  let busySpawns = 0;
  let towerCount = 0;
  let towerEnergy = 0;
  let towerEnergyCapacity = 0;
  let extensionEnergy = 0;
  let extensionCapacity = 0;
  let storageEnergy = 0;
  let droppedEnergy = 0;
  let constructionSites = 0;
  let myConstructionSites = 0;
  let roadsUnder50 = 0;
  let rampartMinHits;
  let wallMinHits;

  for (const object of objects) {
    byType[object.type] = (byType[object.type] || 0) + 1;
    const owner = userName(object.user);
    if (object.type === "controller") {
      controllers.push({ x: object.x, y: object.y, level: object.level, owner, reservation: object.reservation, safeMode: object.safeMode, downgradeTime: object.downgradeTime });
    } else if (object.type === "spawn") {
      spawnCount += 1;
      if (object.spawning) busySpawns += 1;
    } else if (object.type === "tower") {
      towerCount += 1;
      towerEnergy += object.store?.energy || 0;
      towerEnergyCapacity += object.storeCapacityResource?.energy || 0;
    } else if (object.type === "extension") {
      extensionEnergy += object.store?.energy || 0;
      extensionCapacity += object.storeCapacityResource?.energy || 0;
    } else if (object.type === "storage") {
      storageEnergy += object.store?.energy || 0;
    } else if (object.type === "energy") {
      droppedEnergy += object.energy || object.amount || 0;
    } else if (object.type === "constructionSite") {
      constructionSites += 1;
      if (owner === myUserName || ALLY_NAMES.has(owner)) myConstructionSites += 1;
    } else if (object.type === "road" && typeof object.hits === "number" && typeof object.hitsMax === "number" && object.hitsMax > 0 && object.hits / object.hitsMax < 0.5) {
      roadsUnder50 += 1;
    } else if (object.type === "rampart" && typeof object.hits === "number") {
      rampartMinHits = rampartMinHits === undefined ? object.hits : Math.min(rampartMinHits, object.hits);
    } else if (object.type === "constructedWall" && typeof object.hits === "number") {
      wallMinHits = wallMinHits === undefined ? object.hits : Math.min(wallMinHits, object.hits);
    }

    if (object.type === "creep") {
      const counts = bodyCounts(object);
      const detail = {
        name: object.name,
        owner,
        x: object.x,
        y: object.y,
        hits: object.hits,
        hitsMax: object.hitsMax,
        ttl: object.ageTime ? object.ageTime : undefined,
        body: counts,
        boostedParts: (object.body || []).filter(part => part.boost).length,
        combatParts: combatParts(counts)
      };
      if (owner === myUserName) myCreeps.push(detail);
      else if (ALLY_NAMES.has(owner)) allyCreeps.push(detail);
      else if (owner) hostileCreeps.push(detail);
      else otherCreeps.push(detail);
    }
  }

  return {
    room,
    objectCount: objects.length,
    byType,
    controller: controllers[0] || null,
    spawns: { total: spawnCount, busy: busySpawns, idle: Math.max(0, spawnCount - busySpawns) },
    towers: { total: towerCount, energy: towerEnergy, capacity: towerEnergyCapacity, energyPercent: towerEnergyCapacity ? round(100 * towerEnergy / towerEnergyCapacity) : undefined },
    extensions: { energy: extensionEnergy, capacity: extensionCapacity, energyPercent: extensionCapacity ? round(100 * extensionEnergy / extensionCapacity) : undefined },
    storageEnergy,
    droppedEnergy,
    constructionSites: { total: constructionSites, mineOrAllied: myConstructionSites },
    decay: { roadsUnder50, rampartMinHits, wallMinHits },
    creeps: {
      mine: myCreeps.length,
      allies: allyCreeps.length,
      hostiles: hostileCreeps.length,
      others: otherCreeps.length,
      myCombatParts: myCreeps.reduce((sum, creep) => sum + creep.combatParts, 0),
      hostileCombatParts: hostileCreeps.reduce((sum, creep) => sum + creep.combatParts, 0),
      allyCombatParts: allyCreeps.reduce((sum, creep) => sum + creep.combatParts, 0),
      hostileDetails: hostileCreeps,
      allyDetails: allyCreeps
    },
    allySafety: {
      alliesExcludedFromHostiles: true,
      allyNames: [...new Set(allyCreeps.map(creep => creep.owner))].sort(),
      hostileNames: [...new Set(hostileCreeps.map(creep => creep.owner))].sort()
    }
  };
}

function summarizeCreeps(creeps) {
  const byRole = {};
  const byCurrentRoom = {};
  const byHomeRoom = {};
  const byAction = {};
  let count = 0;
  for (const creep of Object.values(creeps || {})) {
    if (!creep || typeof creep !== "object") continue;
    count += 1;
    const role = creep.role || "unknown";
    const room = creep.current_room || creep.currentRoom || creep.room || "unknown";
    const home = creep.home_room || creep.homeRoom || creep.home || "unknown";
    const action = creep.action || "unknown";
    byRole[role] = (byRole[role] || 0) + 1;
    byCurrentRoom[room] = (byCurrentRoom[room] || 0) + 1;
    byHomeRoom[home] = (byHomeRoom[home] || 0) + 1;
    byAction[action] = (byAction[action] || 0) + 1;
  }
  return { count, byRole, byCurrentRoom, byHomeRoom, byAction };
}

function summarizeTaskBoard(board) {
  const rooms = {};
  let totalTasks = 0;
  let openTasks = 0;
  let assignedTasks = 0;
  const byType = {};
  for (const [roomName, roomBoard] of Object.entries(board?.rooms || {})) {
    const tasks = Object.values(roomBoard?.tasks || {});
    const roomSummary = { tasks: tasks.length, open: 0, assigned: 0, reservations: 0, byType: {}, oldestTaskAge: undefined, highestPriority: undefined };
    for (const task of tasks) {
      const type = task?.type || "unknown";
      roomSummary.byType[type] = (roomSummary.byType[type] || 0) + 1;
      byType[type] = (byType[type] || 0) + 1;
      if (task?.status === "open") roomSummary.open += 1;
      if ((task?.assignedCreeps || []).length > 0 || task?.status === "assigned") roomSummary.assigned += 1;
      roomSummary.reservations += Object.keys(task?.reservations || {}).length;
      if (typeof task?.createdTick === "number") {
        const age = (board.currentTick || 0) - task.createdTick;
        if (age > 0) roomSummary.oldestTaskAge = roomSummary.oldestTaskAge === undefined ? age : Math.max(roomSummary.oldestTaskAge, age);
      }
      if (typeof task?.priority === "number") roomSummary.highestPriority = roomSummary.highestPriority === undefined ? task.priority : Math.max(roomSummary.highestPriority, task.priority);
    }
    roomSummary.assigned = Math.max(roomSummary.assigned, Object.keys(roomBoard?.reservations || {}).length);
    rooms[roomName] = roomSummary;
    totalTasks += roomSummary.tasks;
    openTasks += roomSummary.open;
    assignedTasks += roomSummary.assigned;
  }
  return { enabled: board?.enabled, totalTasks, openTasks, assignedTasks, byType, rooms };
}

function summarizeMemory(memory) {
  const stats = memory.stats || {};
  const rooms = {};
  for (const [roomName, roomStats] of Object.entries(stats.rooms || {})) {
    rooms[roomName] = {
      rcl: roomStats.rcl,
      energy: roomStats.energy,
      controller: roomStats.controller,
      creeps: roomStats.creeps,
      hostiles: roomStats.hostiles,
      taskBoard: roomStats.taskBoard,
      spawnQueue: roomStats.spawn_queue,
      remote: roomStats.remote,
      defense: roomStats.defense,
      profiler: roomStats.profiler
    };
  }
  return {
    tick: stats.tick,
    timestamp: stats.timestamp,
    cpu: stats.cpu,
    kernel: stats.kernel,
    gcl: stats.gcl,
    gpl: stats.gpl,
    empireStats: stats.empire,
    rooms,
    roles: stats.roles || {},
    processes: stats.processes || {},
    creepStats: stats.creeps || {},
    creeps: summarizeCreeps(memory.creeps),
    taskBoard: summarizeTaskBoard(memory.creepTaskBoard),
    defenseRequests: Array.isArray(memory.defenseRequests) ? memory.defenseRequests : Object.values(memory.defenseRequests || {}),
    empire: {
      ownedRooms: memory.empire?.ownedRooms,
      claimQueue: memory.empire?.claimQueue,
      warTargets: memory.empire?.warTargets,
      warTargetRooms: memory.empire?.warTargetRooms,
      hostilePlayers: memory.empire?.hostilePlayers,
      playerPostures: memory.empire?.playerPostures,
      recoveryRooms: memory.empire?.recoveryRooms,
      lastUpdate: memory.empire?.lastUpdate
    }
  };
}

function topEntries(object, limit = 10) {
  return Object.entries(object || {}).sort((a, b) => (b[1] || 0) - (a[1] || 0)).slice(0, limit).map(([key, value]) => ({ key, value }));
}

function aggregate(samples, metadata) {
  const ticks = samples.map(sample => sample.tick).filter(value => typeof value === "number");
  const cpuUsed = samples.map(sample => n(sample.memorySummary.cpu?.used)).filter(value => value !== undefined);
  const cpuBucket = samples.map(sample => n(sample.memorySummary.cpu?.bucket)).filter(value => value !== undefined);
  const skipped = samples.map(sample => n(sample.memorySummary.empireStats?.skipped_processes)).filter(value => value !== undefined);
  const heap = samples.map(sample => n(sample.memorySummary.cpu?.heap_mb)).filter(value => value !== undefined);
  const roomsObserved = [...new Set(samples.flatMap(sample => Object.keys(sample.roomSummaries || {})))].sort();
  const roomHealth = {};
  for (const sample of samples) {
    for (const [room, stats] of Object.entries(sample.memorySummary.rooms || {})) {
      const entry = roomHealth[room] || { samples: 0, rcl: stats.rcl, energyAvailable: [], energyCapacity: [], hostiles: [], spawnQueueTotal: [], spawnQueueEmergency: [], openTasks: [], assignedTasks: [], creeps: [], towerEnergyPercent: [], controllerProgress: [], downgradeRisk: false };
      entry.samples += 1;
      entry.rcl = stats.rcl ?? entry.rcl;
      if (n(stats.energy?.available) !== undefined) entry.energyAvailable.push(stats.energy.available);
      if (n(stats.energy?.capacity) !== undefined) entry.energyCapacity.push(stats.energy.capacity);
      if (n(stats.hostiles) !== undefined) entry.hostiles.push(stats.hostiles);
      if (n(stats.spawnQueue?.total) !== undefined) entry.spawnQueueTotal.push(stats.spawnQueue.total);
      if (n(stats.spawnQueue?.emergency) !== undefined) entry.spawnQueueEmergency.push(stats.spawnQueue.emergency);
      if (n(stats.taskBoard?.open_tasks) !== undefined) entry.openTasks.push(stats.taskBoard.open_tasks);
      if (n(stats.taskBoard?.assigned_tasks) !== undefined) entry.assignedTasks.push(stats.taskBoard.assigned_tasks);
      if (n(stats.creeps) !== undefined) entry.creeps.push(stats.creeps);
      if (n(stats.defense?.tower_energy_percent) !== undefined) entry.towerEnergyPercent.push(stats.defense.tower_energy_percent);
      if (n(stats.controller?.progress_percent) !== undefined) entry.controllerProgress.push(stats.controller.progress_percent);
      entry.downgradeRisk = entry.downgradeRisk || Boolean(stats.controller?.downgrade_risk);
      roomHealth[room] = entry;
    }
  }
  for (const [room, entry] of Object.entries(roomHealth)) {
    roomHealth[room] = {
      samples: entry.samples,
      rcl: entry.rcl,
      avgEnergyAvailable: round(avg(entry.energyAvailable)),
      avgEnergyCapacity: round(avg(entry.energyCapacity)),
      avgHostiles: round(avg(entry.hostiles)),
      maxHostiles: max(entry.hostiles),
      avgSpawnQueueTotal: round(avg(entry.spawnQueueTotal)),
      maxSpawnQueueTotal: max(entry.spawnQueueTotal),
      avgSpawnQueueEmergency: round(avg(entry.spawnQueueEmergency)),
      maxSpawnQueueEmergency: max(entry.spawnQueueEmergency),
      avgOpenTasks: round(avg(entry.openTasks)),
      avgAssignedTasks: round(avg(entry.assignedTasks)),
      avgCreeps: round(avg(entry.creeps)),
      minTowerEnergyPercent: round(min(entry.towerEnergyPercent)),
      firstControllerProgress: round(entry.controllerProgress[0]),
      lastControllerProgress: round(last(entry.controllerProgress)),
      downgradeRisk: entry.downgradeRisk
    };
  }

  const latest = samples[samples.length - 1];
  const latestRoles = latest?.memorySummary.roles || {};
  const roles = Object.fromEntries(Object.entries(latestRoles).map(([role, data]) => [role, {
    count: data.count,
    active: data.active_count,
    idle: data.idle_count,
    spawning: data.spawning_count,
    avgCpu: round(data.avg_cpu),
    peakCpu: round(data.peak_cpu),
    avgTtl: round(data.avg_ticks_to_live),
    bodyParts: data.total_body_parts
  }]));

  const latestRoomObjects = latest?.roomSummaries || {};
  const hostiles = [];
  const allySafety = [];
  for (const [room, summary] of Object.entries(latestRoomObjects)) {
    if (summary.creeps.hostiles > 0) hostiles.push({ room, hostiles: summary.creeps.hostileDetails, hostileCombatParts: summary.creeps.hostileCombatParts, myCombatParts: summary.creeps.myCombatParts });
    if (summary.allySafety.allyNames.length || summary.allySafety.hostileNames.length) allySafety.push({ room, ...summary.allySafety });
  }

  const candidateIssues = rankIssues({ samples, roomHealth, latest, hostiles, roles, cpuUsed, cpuBucket, skipped });

  return {
    generatedAt: nowIso(),
    metadata,
    tickRange: { first: ticks[0], last: last(ticks), span: ticks.length ? last(ticks) - ticks[0] : 0, requested: TICK_SPAN },
    sampleCount: samples.length,
    roomsObserved,
    apiPolicy: {
      readOnly: true,
      methodsUsed: ["api.time", "api.memory.get", "api.raw.game.roomObjects", "api.raw.game.roomStatus", "api.me"],
      stateChangingEndpointsUsed: false,
      alliesNeverHostile: ["TooAngel", "TedRoastBeef"]
    },
    cpu: { avgUsed: round(avg(cpuUsed)), maxUsed: round(max(cpuUsed)), minUsed: round(min(cpuUsed)), firstBucket: cpuBucket[0], lastBucket: last(cpuBucket), minBucket: min(cpuBucket), avgBucket: round(avg(cpuBucket)), avgSkippedProcesses: round(avg(skipped)), maxSkippedProcesses: max(skipped), avgHeapMb: round(avg(heap)) },
    roomHealth,
    latestRoles: roles,
    latestCreeps: latest?.memorySummary.creeps,
    latestTaskBoard: latest?.memorySummary.taskBoard,
    latestDefenseRequests: latest?.memorySummary.defenseRequests,
    latestEmpire: latest?.memorySummary.empire,
    latestRoomObjects,
    hostiles,
    allySafety,
    candidateIssues,
    errors: samples.flatMap(sample => sample.errors.map(error => ({ tick: sample.tick, ...error })))
  };
}

function rankIssues(context) {
  const issues = [];
  const latestRooms = context.latest?.memorySummary.rooms || {};
  for (const [room, health] of Object.entries(context.roomHealth)) {
    if ((health.maxHostiles || 0) > 0) {
      const roomObjects = context.latest?.roomSummaries?.[room];
      const hostileNames = roomObjects?.allySafety?.hostileNames || [];
      const hostileParts = roomObjects?.creeps?.hostileCombatParts || 0;
      const myParts = roomObjects?.creeps?.myCombatParts || 0;
      issues.push({
        id: `hostile-pressure:${room}`,
        rankScore: 96 + Math.min(10, hostileParts / 10),
        impact: "high",
        urgency: "high",
        risk: "medium",
        title: `${room} hostile pressure / bootstrap-defense gap`,
        evidence: [`stats hostiles max=${health.maxHostiles}`, `latest hostile owners=${hostileNames.join(",") || "unknown"}`, `hostile combat parts=${hostileParts}; local my combat parts=${myParts}`, `defense requests=${JSON.stringify((context.latest?.memorySummary.defenseRequests || []).filter(req => req.roomName === room || req.targetRoom === room)).slice(0, 240)}`],
        likelyAreas: ["packages/@ralphschuler/screeps-defense", "packages/@ralphschuler/screeps-spawn", "packages/@ralphschuler/screeps-roles"]
      });
    }
    if ((health.maxSpawnQueueEmergency || 0) >= 3 || (health.maxSpawnQueueTotal || 0) >= 10) {
      issues.push({
        id: `spawn-backlog:${room}`,
        rankScore: 82 + Math.min(12, health.maxSpawnQueueEmergency || 0),
        impact: "high",
        urgency: (health.maxSpawnQueueEmergency || 0) >= 10 ? "high" : "medium",
        risk: "low-medium",
        title: `${room} spawn queue backlog`,
        evidence: [`avg queue=${health.avgSpawnQueueTotal}; max queue=${health.maxSpawnQueueTotal}`, `avg emergency=${health.avgSpawnQueueEmergency}; max emergency=${health.maxSpawnQueueEmergency}`, `avg energy=${health.avgEnergyAvailable}/${health.avgEnergyCapacity}`],
        likelyAreas: ["packages/@ralphschuler/screeps-spawn", "packages/@ralphschuler/screeps-roles"]
      });
    }
    if ((health.avgOpenTasks || 0) >= 20 && (health.avgAssignedTasks || 0) <= 3) {
      issues.push({
        id: `task-backlog:${room}`,
        rankScore: 70 + Math.min(15, health.avgOpenTasks / 4),
        impact: "medium-high",
        urgency: "medium",
        risk: "low",
        title: `${room} open task backlog with low assignment`,
        evidence: [`avg open tasks=${health.avgOpenTasks}`, `avg assigned tasks=${health.avgAssignedTasks}`, `avg creeps=${health.avgCreeps}`],
        likelyAreas: ["packages/@ralphschuler/screeps-economy", "packages/@ralphschuler/screeps-roles", "packages/@ralphschuler/screeps-spawn"]
      });
    }
    const stats = latestRooms[room];
    if (stats?.rcl >= 5 && (health.avgEnergyCapacity || 0) > 0 && (health.avgEnergyAvailable || 0) / health.avgEnergyCapacity < 0.35 && (health.maxSpawnQueueTotal || 0) > 0) {
      issues.push({
        id: `energy-fill:${room}`,
        rankScore: 72,
        impact: "medium-high",
        urgency: "medium",
        risk: "low",
        title: `${room} spawn/extensions energy starvation while queued`,
        evidence: [`avg energy=${health.avgEnergyAvailable}/${health.avgEnergyCapacity}`, `max queue=${health.maxSpawnQueueTotal}`, `storage=${stats.energy?.storage ?? "n/a"}`],
        likelyAreas: ["packages/@ralphschuler/screeps-economy", "packages/@ralphschuler/screeps-roles", "packages/@ralphschuler/screeps-spawn"]
      });
    }
  }

  const cpuMax = max(context.cpuUsed) || 0;
  const bucketMin = min(context.cpuBucket) || 0;
  const skippedMax = max(context.skipped) || 0;
  if (cpuMax > 45 || bucketMin < 6000 || skippedMax > 20) {
    issues.push({
      id: "cpu-bucket-spikes",
      rankScore: 78,
      impact: "medium-high",
      urgency: bucketMin < 4000 ? "high" : "medium",
      risk: "low-medium",
      title: "CPU spikes / skipped low-frequency work",
      evidence: [`cpu max=${round(cpuMax)}`, `bucket min=${bucketMin}`, `skipped processes max=${skippedMax}`],
      likelyAreas: ["packages/@ralphschuler/screeps-kernel", "packages/@ralphschuler/screeps-cache", "packages/@ralphschuler/screeps-roles"]
    });
  }

  const guard = context.roles.guard || {};
  const healer = context.roles.healer || {};
  const totalHostileParts = context.hostiles.reduce((sum, item) => sum + (item.hostileCombatParts || 0), 0);
  if (totalHostileParts > 0 && ((guard.idle || 0) + (healer.idle || 0)) >= 6) {
    issues.push({
      id: "idle-combat-vs-active-hostile",
      rankScore: 88,
      impact: "high",
      urgency: "high",
      risk: "medium",
      title: "Combat creeps idle while a hostile combat creep is present",
      evidence: [`guard idle=${guard.idle ?? "n/a"}/${guard.count ?? "n/a"}`, `healer idle=${healer.idle ?? "n/a"}/${healer.count ?? "n/a"}`, `latest hostile combat parts=${totalHostileParts}`],
      likelyAreas: ["packages/@ralphschuler/screeps-defense", "packages/@ralphschuler/screeps-roles"]
    });
  }

  return issues.sort((a, b) => b.rankScore - a.rankScore).map((issue, index) => ({ rank: index + 1, ...issue }));
}

function renderMarkdown(summary) {
  const top = summary.candidateIssues[0];
  const roomLines = Object.entries(summary.roomHealth).map(([room, health]) => `| ${room} | ${health.rcl ?? "?"} | ${health.avgCreeps ?? "?"} | ${health.maxHostiles ?? 0} | ${health.avgEnergyAvailable ?? "?"}/${health.avgEnergyCapacity ?? "?"} | ${health.maxSpawnQueueTotal ?? 0} / ${health.maxSpawnQueueEmergency ?? 0} | ${health.avgOpenTasks ?? 0}/${health.avgAssignedTasks ?? 0} |`).join("\n");
  const issueLines = summary.candidateIssues.slice(0, 8).map(issue => `| ${issue.rank} | ${issue.title} | ${issue.impact} | ${issue.urgency} | ${issue.risk} | ${issue.evidence.join("; ").replace(/\|/g, "/")} |`).join("\n");
  const roleLines = Object.entries(summary.latestRoles).sort((a, b) => (b[1].count || 0) - (a[1].count || 0)).map(([role, data]) => `| ${role} | ${data.count ?? 0} | ${data.active ?? "?"} | ${data.idle ?? "?"} | ${data.spawning ?? 0} | ${data.avgCpu ?? "?"} |`).join("\n");
  const hostileLines = summary.hostiles.length ? summary.hostiles.map(item => `- ${item.room}: ${item.hostiles.map(h => `${h.owner}/${h.name} parts=${JSON.stringify(h.body)} boosted=${h.boostedParts}`).join("; ")}`).join("\n") : "- none observed in latest room-object sample";
  return `# Live 500-tick Screeps observer summary\n\n- Generated: ${summary.generatedAt}\n- Shard: ${SHARD}\n- Tick range: ${summary.tickRange.first ?? "n/a"} → ${summary.tickRange.last ?? "n/a"} (span ${summary.tickRange.span}; requested ${summary.tickRange.requested})\n- Samples: ${summary.sampleCount}\n- Rooms observed: ${summary.roomsObserved.join(", ")}\n- Read-only methods used: ${summary.apiPolicy.methodsUsed.join(", ")}\n- Ally safety: TooAngel/TedRoastBeef excluded from hostiles; state-changing endpoints used = ${summary.apiPolicy.stateChangingEndpointsUsed}\n\n## CPU / bucket\n\n- CPU used avg/max: ${summary.cpu.avgUsed ?? "n/a"} / ${summary.cpu.maxUsed ?? "n/a"}\n- Bucket first/last/min/avg: ${summary.cpu.firstBucket ?? "n/a"} / ${summary.cpu.lastBucket ?? "n/a"} / ${summary.cpu.minBucket ?? "n/a"} / ${summary.cpu.avgBucket ?? "n/a"}\n- Skipped processes avg/max: ${summary.cpu.avgSkippedProcesses ?? "n/a"} / ${summary.cpu.maxSkippedProcesses ?? "n/a"}\n\n## Room health\n\n| Room | RCL | Avg creeps | Max hostiles | Avg energy | Max queue/emergency | Avg open/assigned tasks |\n|---|---:|---:|---:|---:|---:|---:|\n${roomLines}\n\n## Latest roles\n\n| Role | Count | Active | Idle | Spawning | Avg CPU |\n|---|---:|---:|---:|---:|---:|\n${roleLines}\n\n## Latest hostiles / defenders\n\n${hostileLines}\n\n## Ranked issue candidates\n\n| Rank | Candidate | Impact | Urgency | Risk | Evidence |\n|---:|---|---|---|---|---|\n${issueLines}\n\n## Recommended top candidate\n\n${top ? `**${top.title}** — ${top.evidence.join("; ")}\n\nLikely code areas: ${top.likelyAreas.join(", ")}` : "No high-confidence issue candidate from this sample."}\n\n## Validation / deploy risks\n\n- Analysis only; no source edits, no deploy.\n- Live API sample is bounded to ${summary.tickRange.span} ticks; re-sample before risky combat/defense changes.\n- Avoid any change that targets allies TooAngel or TedRoastBeef.\n`;
}

async function main() {
  if (!process.env.SCREEPS_TOKEN) throw new Error("SCREEPS_TOKEN is required");
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const rawPath = path.join(OUT_DIR, "samples.jsonl");
  const summaryPath = path.join(OUT_DIR, "summary.json");
  const mdPath = path.join(OUT_DIR, "summary.md");
  fs.writeFileSync(rawPath, "");

  const api = new ScreepsAPI({
    token: process.env.SCREEPS_TOKEN,
    protocol: process.env.SCREEPS_PROTOCOL || "https",
    hostname: process.env.SCREEPS_HOSTNAME || "screeps.com",
    port: Number(process.env.SCREEPS_PORT || 443),
    path: process.env.SCREEPS_PATH || "/"
  });

  const me = await api.me();
  const myUserName = me?.username || "unknown";
  ALLY_NAMES.add(myUserName);
  const metadata = { startedAt: nowIso(), hostname: process.env.SCREEPS_HOSTNAME || "screeps.com", shard: SHARD, requestedTickSpan: TICK_SPAN, sampleStepTicks: SAMPLE_STEP_TICKS, pollMs: POLL_MS, maxRoomsPerSample: MAX_ROOMS_PER_SAMPLE, user: myUserName };

  const firstTime = await api.time(SHARD);
  const startTick = firstTime.time;
  const targetTick = startTick + TICK_SPAN;
  const samples = [];
  const roomStatusCache = {};
  let lastSampleTick = startTick - SAMPLE_STEP_TICKS;
  let currentTick = startTick;

  console.log(`live-500 start shard=${SHARD} user=${myUserName} start=${startTick} target=${targetTick} out=${OUT_DIR}`);

  while (currentTick < targetTick || samples.length === 0) {
    const timeResponse = await api.time(SHARD);
    currentTick = timeResponse.time;
    if (currentTick - lastSampleTick < SAMPLE_STEP_TICKS && currentTick < targetTick) {
      await sleep(POLL_MS);
      continue;
    }

    const errors = [];
    const memory = {};
    await Promise.all(MEMORY_PATHS.map(async memoryPath => {
      try {
        memory[memoryPath] = unwrapMemory(await api.memory.get(memoryPath, SHARD));
      } catch (error) {
        errors.push({ type: "memory", path: memoryPath, message: error instanceof Error ? error.message : String(error) });
        memory[memoryPath] = null;
      }
    }));

    const roomCandidates = deriveRooms(memory);
    const rooms = {};
    const roomSummaries = {};
    for (const candidate of roomCandidates) {
      if (!roomStatusCache[candidate.room]) {
        try {
          roomStatusCache[candidate.room] = await api.raw.game.roomStatus(candidate.room, SHARD);
        } catch (error) {
          roomStatusCache[candidate.room] = { ok: 0, error: error instanceof Error ? error.message : String(error) };
          errors.push({ type: "roomStatus", room: candidate.room, message: roomStatusCache[candidate.room].error });
        }
      }
      try {
        const response = await api.raw.game.roomObjects(candidate.room, SHARD);
        const summary = summarizeRoomObjects(candidate.room, response, myUserName);
        rooms[candidate.room] = { candidate, status: roomStatusCache[candidate.room], response };
        roomSummaries[candidate.room] = summary;
      } catch (error) {
        errors.push({ type: "roomObjects", room: candidate.room, message: error instanceof Error ? error.message : String(error) });
      }
    }

    const sample = { sampledAt: nowIso(), tick: currentTick, memory, memorySummary: summarizeMemory(memory), roomCandidates, rooms, roomSummaries, errors };
    fs.appendFileSync(rawPath, `${JSON.stringify(sample)}\n`);
    samples.push(sample);
    lastSampleTick = currentTick;

    const summary = aggregate(samples, metadata);
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    fs.writeFileSync(mdPath, renderMarkdown(summary));
    console.log(`sample=${samples.length} tick=${currentTick} span=${currentTick - startTick} rooms=${roomCandidates.map(r => r.room).join(",")} errors=${errors.length}`);

    if (currentTick >= targetTick) break;
    await sleep(POLL_MS);
  }

  const summary = aggregate(samples, { ...metadata, finishedAt: nowIso() });
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  fs.writeFileSync(mdPath, renderMarkdown(summary));
  console.log(`live-500 done span=${summary.tickRange.span} samples=${summary.sampleCount}`);
  console.log(`ARTIFACTS raw=${rawPath} summary=${summaryPath} md=${mdPath}`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});

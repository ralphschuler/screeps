import fs from "node:fs";
import path from "node:path";

export const CPU_BENCHMARK_SCHEMA_VERSION = 1;
export const PERMANENT_ALLIES = ["TooAngel", "TedRoastBeef"];

const ROOM_RE = /^([WE])(\d+)([NS])(\d+)$/;
const DEFAULT_BASE_COORD = { x: 31, y: 31 };
const MAJOR_STRUCTURE_TYPES = new Set([
  "spawn",
  "extension",
  "tower",
  "storage",
  "terminal",
  "link",
  "lab",
  "container",
  "road",
  "rampart",
  "constructedWall",
  "wall",
  "extractor",
  "factory",
  "powerSpawn",
  "observer",
  "nuker",
]);

export function parseArgMap(argv = process.argv.slice(2)) {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const [key, ...rest] = arg.slice(2).split("=");
    if (arg.includes("=")) {
      args.set(key, rest.join("="));
      continue;
    }
    const next = argv[index + 1];
    if (next && !next.startsWith("--")) {
      args.set(key, next);
      index += 1;
    } else {
      args.set(key, "true");
    }
  }
  return args;
}

export function parseRoomName(roomName) {
  const match = ROOM_RE.exec(String(roomName ?? ""));
  if (!match) return null;
  return {
    x: match[1] === "W" ? -Number(match[2]) - 1 : Number(match[2]),
    y: match[3] === "N" ? -Number(match[4]) - 1 : Number(match[4]),
  };
}

export function formatRoomName({ x, y }) {
  const horizontal = x < 0 ? `W${Math.abs(x) - 1}` : `E${x}`;
  const vertical = y < 0 ? `N${Math.abs(y) - 1}` : `S${y}`;
  return `${horizontal}${vertical}`;
}

export function isRoomName(value) {
  return ROOM_RE.test(String(value ?? ""));
}

export function translateRoomNames(roomNames, baseCoord = DEFAULT_BASE_COORD) {
  const parsed = [...new Set(roomNames.filter(isRoomName))]
    .map((roomName) => ({ roomName, coord: parseRoomName(roomName) }))
    .filter((entry) => entry.coord)
    .sort((a, b) => a.coord.x - b.coord.x || a.coord.y - b.coord.y || a.roomName.localeCompare(b.roomName));

  if (parsed.length === 0) return {};

  const minX = Math.min(...parsed.map((entry) => entry.coord.x));
  const minY = Math.min(...parsed.map((entry) => entry.coord.y));
  const mapping = {};
  for (const entry of parsed) {
    mapping[entry.roomName] = formatRoomName({
      x: baseCoord.x + (entry.coord.x - minX),
      y: baseCoord.y + (entry.coord.y - minY),
    });
  }
  return mapping;
}

export function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function values(value) {
  if (Array.isArray(value)) return value;
  return Object.values(safeObject(value));
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function ownerName(object, users = {}) {
  const owner = object?.owner;
  if (owner?.username) return owner.username;
  if (owner?.name) return owner.name;
  if (object?.userName) return object.userName;
  if (object?.user && users[object.user]) return users[object.user].username || users[object.user].name || String(object.user);
  return object?.user ? String(object.user) : undefined;
}

export function bodyPartsFromApiBody(body) {
  return values(body)
    .map((part) => {
      if (typeof part === "string") return part;
      if (!part?.type) return null;
      return part.boost ? `${part.type}:${part.boost}` : part.type;
    })
    .filter(Boolean);
}

export function countParts(parts) {
  const counts = {};
  for (const part of parts ?? []) {
    const type = String(part).split(":")[0];
    counts[type] = (counts[type] ?? 0) + 1;
  }
  return counts;
}

function sanitizeStore(store) {
  const result = {};
  for (const [resource, amount] of Object.entries(safeObject(store))) {
    const value = toNumber(amount, 0);
    if (value > 0) result[resource] = Math.floor(value);
  }
  return result;
}

function sanitizeStructure(object, owner) {
  return {
    type: object.structureType || object.type,
    x: toNumber(object.x, 25),
    y: toNumber(object.y, 25),
    name: typeof object.name === "string" ? object.name.slice(0, 80) : undefined,
    owner,
    hits: toNumber(object.hits, undefined),
    hitsMax: toNumber(object.hitsMax, undefined),
    store: sanitizeStore(object.store),
    energy: toNumber(object.energy, undefined),
    energyCapacity: toNumber(object.energyCapacity, undefined),
    cooldown: toNumber(object.cooldown, undefined),
    mineralType: typeof object.mineralType === "string" ? object.mineralType : undefined,
  };
}

function sanitizeCreep(object, owner, myUserName) {
  const bodyParts = bodyPartsFromApiBody(object.body);
  const memory = safeObject(object.memory);
  const role = memory.role || memory.family || object.role || undefined;
  return {
    name: typeof object.name === "string" ? object.name.slice(0, 80) : undefined,
    owner,
    mine: owner === myUserName,
    role: typeof role === "string" ? role.slice(0, 80) : undefined,
    x: toNumber(object.x, 25),
    y: toNumber(object.y, 25),
    hits: toNumber(object.hits, bodyParts.length * 100),
    hitsMax: toNumber(object.hitsMax, bodyParts.length * 100),
    ttl: toNumber(object.ticksToLive, 1500),
    bodyParts,
    body: countParts(bodyParts),
    homeRoom: isRoomName(memory.homeRoom) ? memory.homeRoom : isRoomName(memory.home_room) ? memory.home_room : undefined,
    targetRoom: isRoomName(memory.targetRoom) ? memory.targetRoom : isRoomName(memory.target_room) ? memory.target_room : undefined,
  };
}

export function summarizeRoomObjects({ roomName, response, myUserName, allies = PERMANENT_ALLIES }) {
  const users = safeObject(response?.users);
  const objects = Array.isArray(response?.objects) ? response.objects : values(response?.objects);
  const allySet = new Set([...allies, myUserName].filter(Boolean));
  const structureCounts = {};
  const constructionSiteCounts = {};
  const majorStructures = [];
  const sources = [];
  const minerals = [];
  const resources = [];
  const myCreeps = [];
  const allyCreeps = [];
  const hostileCreeps = [];
  let controller = null;

  for (const object of objects) {
    const type = object?.type;
    const owner = ownerName(object, users);
    if (!type) continue;

    if (type === "controller") {
      controller = {
        x: toNumber(object.x, 25),
        y: toNumber(object.y, 40),
        level: toNumber(object.level, 0),
        owner,
        reservation: object.reservation?.username || object.reservation?.user || undefined,
        safeMode: toNumber(object.safeMode, undefined),
      };
      continue;
    }

    if (type === "source") {
      sources.push({
        x: toNumber(object.x, 10 + sources.length * 20),
        y: toNumber(object.y, 10),
        energy: toNumber(object.energy, 1500),
        energyCapacity: toNumber(object.energyCapacity, 1500),
      });
      continue;
    }

    if (type === "mineral") {
      minerals.push({ x: toNumber(object.x, 20), y: toNumber(object.y, 20), mineralType: object.mineralType || "H" });
      continue;
    }

    if (type === "resource") {
      resources.push({ x: toNumber(object.x, 25), y: toNumber(object.y, 25), resourceType: object.resourceType || "energy", amount: toNumber(object.amount, 0) });
      continue;
    }

    if (type === "constructionSite") {
      const structureType = object.structureType || "unknown";
      constructionSiteCounts[structureType] = (constructionSiteCounts[structureType] ?? 0) + 1;
      continue;
    }

    if (type === "creep") {
      const creep = sanitizeCreep(object, owner, myUserName);
      if (owner === myUserName) myCreeps.push(creep);
      else if (owner && allySet.has(owner)) allyCreeps.push(creep);
      else if (owner) hostileCreeps.push(creep);
      continue;
    }

    const structureType = object.structureType || type;
    if (MAJOR_STRUCTURE_TYPES.has(structureType) || MAJOR_STRUCTURE_TYPES.has(type)) {
      structureCounts[structureType] = (structureCounts[structureType] ?? 0) + 1;
      majorStructures.push(sanitizeStructure({ ...object, type: structureType }, owner));
    }
  }

  const myCreepsByRole = {};
  for (const creep of myCreeps) {
    const role = creep.role || "unknown";
    myCreepsByRole[role] = (myCreepsByRole[role] ?? 0) + 1;
  }

  return {
    sourceName: roomName,
    controller,
    structureCounts,
    constructionSiteCounts,
    sources,
    minerals,
    resources,
    majorStructures,
    creeps: {
      mine: myCreeps,
      allies: allyCreeps,
      hostiles: hostileCreeps,
      myCount: myCreeps.length,
      allyCount: allyCreeps.length,
      hostileCount: hostileCreeps.length,
      myByRole: myCreepsByRole,
    },
    allySafety: {
      permanentAllies: PERMANENT_ALLIES.slice(),
      alliesExcludedFromHostiles: true,
      hostileOwners: [...new Set(hostileCreeps.map((creep) => creep.owner))].sort(),
      allyOwners: [...new Set(allyCreeps.map((creep) => creep.owner))].sort(),
    },
  };
}

function scanRoomStrings(value, rooms, limit = 2000) {
  const stack = [value];
  const seen = new Set();
  let inspected = 0;
  while (stack.length && inspected < limit) {
    const current = stack.pop();
    inspected += 1;
    if (isRoomName(current)) {
      rooms.add(current);
      continue;
    }
    if (!current || typeof current !== "object") continue;
    if (seen.has(current)) continue;
    seen.add(current);
    if (Array.isArray(current)) {
      for (const item of current) stack.push(item);
      continue;
    }
    for (const [key, item] of Object.entries(current)) {
      if (isRoomName(key)) rooms.add(key);
      if (/room|home|target|remote|origin|claim|defense|cluster|assigned/i.test(key)) stack.push(item);
    }
  }
}

export function deriveCandidateRooms(memory, explicitRooms = [], maxRooms = 30) {
  const priorities = new Map();
  const addRoom = (roomName, priority) => {
    if (!isRoomName(roomName)) return;
    priorities.set(roomName, Math.max(priorities.get(roomName) ?? -Infinity, priority));
  };
  const addScannedRooms = (value, priority, limit) => {
    const scanned = new Set();
    scanRoomStrings(value, scanned, limit);
    for (const roomName of scanned) addRoom(roomName, priority);
  };

  for (const roomName of explicitRooms) addRoom(roomName, 10000);
  const ownedRooms = memory.empire?.ownedRooms;
  if (Array.isArray(ownedRooms)) for (const roomName of ownedRooms) addRoom(roomName, 9500);
  if (ownedRooms && typeof ownedRooms === "object") for (const roomName of Object.keys(ownedRooms)) addRoom(roomName, 9500);
  for (const roomName of Object.keys(safeObject(memory.stats?.rooms))) addRoom(roomName, 9000);
  for (const roomName of Object.keys(safeObject(memory.rooms))) addRoom(roomName, 8500);

  for (const creep of Object.values(safeObject(memory.creeps))) {
    if (!creep || typeof creep !== "object") continue;
    for (const key of ["homeRoom", "home_room", "room", "roomName", "currentRoom", "current_room"]) addRoom(creep[key], 8000);
    for (const key of ["targetRoom", "target_room", "remoteRoom", "remote_room"]) addRoom(creep[key], 7600);
  }
  addScannedRooms(memory.defenseRequests, 8200, 1000);
  addScannedRooms(memory.clusters, 7000, 1000);
  addScannedRooms(memory.creeps, 6500, 2000);
  addScannedRooms(memory.empire, 1000, 1000);

  return [...priorities.entries()]
    .sort(([a, aPriority], [b, bPriority]) => {
      if (bPriority !== aPriority) return bPriority - aPriority;
      const left = parseRoomName(a);
      const right = parseRoomName(b);
      return left.x - right.x || left.y - right.y || a.localeCompare(b);
    })
    .map(([roomName]) => roomName)
    .slice(0, Math.max(1, maxRooms));
}

export function summarizeMemoryForSnapshot(memory) {
  const creepsByRole = {};
  for (const creep of Object.values(safeObject(memory.creeps))) {
    const role = typeof creep?.role === "string" ? creep.role : typeof creep?.memory?.role === "string" ? creep.memory.role : undefined;
    if (role) creepsByRole[role] = (creepsByRole[role] ?? 0) + 1;
  }

  const roomMemory = {};
  for (const [roomName, room] of Object.entries(safeObject(memory.rooms))) {
    if (!isRoomName(roomName)) continue;
    const swarm = safeObject(room?.swarm);
    roomMemory[roomName] = {
      posture: typeof swarm.posture === "string" ? swarm.posture : undefined,
      danger: toNumber(swarm.danger, undefined),
      remoteAssignments: Array.isArray(swarm.remoteAssignments)
        ? swarm.remoteAssignments.filter(isRoomName)
        : Array.isArray(room?.remoteAssignments)
          ? room.remoteAssignments.filter(isRoomName)
          : undefined,
    };
  }

  const statsRooms = {};
  for (const [roomName, stats] of Object.entries(safeObject(memory.stats?.rooms))) {
    if (!isRoomName(roomName)) continue;
    statsRooms[roomName] = {
      rcl: toNumber(stats?.rcl, undefined),
      creeps: toNumber(stats?.creeps, undefined),
      hostiles: toNumber(stats?.hostiles, undefined),
      remoteAssigned: toNumber(stats?.remote?.assigned, undefined),
      avgCpu: toNumber(stats?.profiler?.avg_cpu ?? stats?.profiler?.avgCpu, undefined),
      spawnQueueTotal: toNumber(stats?.spawn_queue?.total ?? stats?.spawnQueue?.total, undefined),
    };
  }

  return {
    stats: {
      tick: toNumber(memory.stats?.tick, undefined),
      cpu: safeObject(memory.stats?.cpu),
      empire: safeObject(memory.stats?.empire),
      rooms: statsRooms,
    },
    creepsByRole,
    rooms: roomMemory,
    defenseRequestsCount: Array.isArray(memory.defenseRequests) ? memory.defenseRequests.length : Object.keys(safeObject(memory.defenseRequests)).length,
  };
}

export function buildStructuralSnapshot({ hostname, shard, tick, myUserName, memory, roomResponses, roomStatus = {} }) {
  const sourceRooms = Object.keys(roomResponses).sort();
  const roomMapping = translateRoomNames(sourceRooms);
  const rooms = sourceRooms.map((sourceName) => {
    const summary = summarizeRoomObjects({ roomName: sourceName, response: roomResponses[sourceName], myUserName });
    return {
      sourceName,
      benchmarkName: roomMapping[sourceName],
      status: roomStatus[sourceName] ?? null,
      ...summary,
    };
  });

  return {
    schemaVersion: CPU_BENCHMARK_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    source: {
      hostname,
      shard,
      tick,
      user: myUserName,
      apiPolicy: {
        readOnly: true,
        methodsUsed: ["api.time", "api.memory.get", "api.raw.game.roomObjects", "api.raw.game.roomStatus", "api.me"],
        stateChangingEndpointsUsed: false,
      },
      permanentAlliesNeverHostile: PERMANENT_ALLIES.slice(),
    },
    roomCount: rooms.length,
    roomMapping,
    rooms,
    memorySummary: summarizeMemoryForSnapshot(memory),
  };
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function percentile(sorted, percentileValue) {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * percentileValue) - 1));
  return sorted[index];
}

function topEntries(samples, field, limit = 10) {
  const bucket = new Map();
  for (const sample of samples) {
    for (const [key, value] of Object.entries(safeObject(sample[field]))) {
      const cpu = toNumber(value.avgCpu ?? value.avg_cpu ?? value.cpu ?? value.used, NaN);
      if (!Number.isFinite(cpu)) continue;
      const entry = bucket.get(key) ?? { key, sum: 0, count: 0, max: 0 };
      entry.sum += cpu;
      entry.count += 1;
      entry.max = Math.max(entry.max, cpu);
      bucket.set(key, entry);
    }
  }
  return [...bucket.values()]
    .map((entry) => ({ key: entry.key, avg: entry.sum / entry.count, max: entry.max, samples: entry.count }))
    .sort((a, b) => b.avg - a.avg || a.key.localeCompare(b.key))
    .slice(0, limit);
}

export function summarizeCpuBenchmarkSamples(samples) {
  const usable = samples.filter((sample) => Number.isFinite(sample?.cpu?.used));
  const cpu = usable.map((sample) => sample.cpu.used);
  const bucket = usable.map((sample) => sample.cpu.bucket).filter(Number.isFinite);
  const sortedCpu = [...cpu].sort((a, b) => a - b);
  const average = (valuesList) => valuesList.length ? valuesList.reduce((sum, value) => sum + value, 0) / valuesList.length : 0;
  return {
    samples: usable.length,
    tickFirst: usable[0]?.tick,
    tickLast: usable[usable.length - 1]?.tick,
    avgCpu: average(cpu),
    maxCpu: cpu.length ? Math.max(...cpu) : 0,
    p95Cpu: percentile(sortedCpu, 0.95),
    p99Cpu: percentile(sortedCpu, 0.99),
    avgBucket: average(bucket),
    minBucket: bucket.length ? Math.min(...bucket) : 0,
    maxBucket: bucket.length ? Math.max(...bucket) : 0,
    topRooms: topEntries(usable, "rooms"),
    topProcesses: topEntries(usable, "processes"),
    topRoles: topEntries(usable, "roles"),
    topSubsystems: topEntries(usable, "subsystems"),
  };
}

export function extractCpuSampleFromMemory(memory) {
  const stats = safeObject(memory.stats);
  const cpu = safeObject(stats.cpu);
  const used = toNumber(cpu.used, NaN);
  if (!Number.isFinite(used)) return null;
  return {
    tick: toNumber(stats.tick, undefined),
    cpu: {
      used,
      limit: toNumber(cpu.limit, undefined),
      bucket: toNumber(cpu.bucket, undefined),
      percent: toNumber(cpu.percent, undefined),
      heapMb: toNumber(cpu.heap_mb ?? cpu.heapMb, undefined),
    },
    rooms: Object.fromEntries(Object.entries(safeObject(stats.rooms)).map(([name, value]) => [name, { avgCpu: toNumber(value?.profiler?.avg_cpu ?? value?.profiler?.avgCpu, NaN) }])),
    processes: Object.fromEntries(Object.entries(safeObject(stats.processes)).map(([name, value]) => [name, { avgCpu: toNumber(value?.avg_cpu ?? value?.avgCpu, NaN), name: value?.name }])),
    roles: Object.fromEntries(Object.entries(safeObject(stats.roles)).map(([name, value]) => [name, { avgCpu: toNumber(value?.avg_cpu ?? value?.avgCpu, NaN) }])),
    subsystems: Object.fromEntries(Object.entries(safeObject(stats.subsystems)).map(([name, value]) => [name, { avgCpu: toNumber(value?.avg_cpu ?? value?.avgCpu, NaN) }])),
  };
}

export function appendCpuBenchmarkSample(memory, summary, maxSamples = 500) {
  const sample = extractCpuSampleFromMemory(memory);
  if (!sample) return;
  const metric = summary.metrics.cpuBenchmark ?? { samples: [] };
  metric.samples.push(sample);
  if (metric.samples.length > maxSamples) metric.samples.splice(0, metric.samples.length - maxSamples);
  metric.latest = sample;
  metric.analysis = summarizeCpuBenchmarkSamples(metric.samples);
  summary.metrics.cpuBenchmark = metric;
}

export function compareCpuAnalyses(baseline, current, thresholds = {}) {
  const cpuThreshold = toNumber(thresholds.cpu, 0.10);
  const bucketThreshold = toNumber(thresholds.bucket, 0.05);
  const metrics = ["avgCpu", "p95Cpu", "p99Cpu", "maxCpu"];
  const comparisons = metrics.map((metric) => {
    const base = toNumber(baseline?.[metric], 0);
    const now = toNumber(current?.[metric], 0);
    const delta = base > 0 ? (now - base) / base : 0;
    return {
      metric,
      baseline: base,
      current: now,
      delta,
      passed: delta <= cpuThreshold,
      direction: delta < -0.02 ? "improved" : delta > cpuThreshold ? "regressed" : "neutral",
    };
  });

  const baseBucket = toNumber(baseline?.avgBucket, 0);
  const currentBucket = toNumber(current?.avgBucket, 0);
  const bucketDelta = baseBucket > 0 ? (currentBucket - baseBucket) / baseBucket : 0;
  comparisons.push({
    metric: "avgBucket",
    baseline: baseBucket,
    current: currentBucket,
    delta: bucketDelta,
    passed: bucketDelta >= -bucketThreshold,
    direction: bucketDelta > 0.02 ? "improved" : bucketDelta < -bucketThreshold ? "regressed" : "neutral",
  });

  const failed = comparisons.filter((comparison) => !comparison.passed);
  const improved = comparisons.filter((comparison) => comparison.direction === "improved");
  return {
    status: failed.length === 0 ? "passed" : "failed",
    verdict: failed.length === 0
      ? (improved.length > 0 ? "positive-or-neutral" : "neutral")
      : "regression",
    thresholds: { cpu: cpuThreshold, bucket: bucketThreshold },
    comparisons,
    failures: failed,
  };
}

export function analysisFromSummary(summary) {
  return summary?.metrics?.cpuBenchmark?.analysis ?? null;
}

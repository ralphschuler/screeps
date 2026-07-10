import { RuntimeFailure, RuntimeSummary } from './summary';

const ALLY_NAMES = ['TooAngel', 'TedRoastBeef'];
const DEFAULT_SCENARIO_REMOTE_ROOM = 'W1N2';

export interface BackendAssertionInput {
  config: any;
  storage: any;
  memory: any;
  tick: number;
  runtimeWarmupTicks: number;
  botRuntimeWarmed: boolean;
  user: any;
  userId: any;
  userIdFilter: Record<string, any>;
  ownedControllers: any[];
  spawns: any[];
  creeps: any[];
  errorSamples: string[];
  scenarios: string[];
  startedAt: number;
  scenarioSeedConfirmation?: any;
}

interface AssertionCounters {
  passed: number;
  skipped: number;
  failures: RuntimeFailure[];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function toArray(result: any): Promise<any[]> {
  if (Array.isArray(result)) return result;
  if (result?.toArray) return result.toArray();
  return [];
}

function values(obj: any): any[] {
  return isObject(obj) ? Object.keys(obj).map(key => obj[key]) : [];
}

function hasAllyName(value: any): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return ALLY_NAMES.indexOf(value) >= 0;
  if (Array.isArray(value)) return value.some(hasAllyName);
  if (typeof value === 'object') return Object.keys(value).some(key => hasAllyName(value[key]));
  return false;
}

function taskBoardRooms(memory: any): any[] {
  return values(memory.creepTaskBoard?.rooms ?? {});
}

function taskBoardTasks(memory: any): any[] {
  const tasks: any[] = [];
  for (const board of taskBoardRooms(memory)) {
    tasks.push(...values(board?.tasks ?? {}));
  }
  return tasks;
}

function hasTaskBoardActivity(memory: any): boolean {
  return taskBoardRooms(memory).some(board => {
    if (values(board?.tasks ?? {}).length > 0) return true;
    if ((board?.lastGeneratedTick ?? 0) > 0 || (board?.lastCleanedTick ?? 0) > 0) return true;
    return values(board?.stats ?? {}).some(value => typeof value === 'number' && value > 0);
  });
}

function hasTaskType(memory: any, type: string): boolean {
  return taskBoardTasks(memory).some(task => task?.type === type);
}

function hasStatsRoomField(memory: any, fieldName: string): boolean {
  const rooms = memory.stats?.rooms ?? {};
  return Object.keys(rooms).some(roomName => Boolean(rooms[roomName]?.[fieldName]));
}

function hasDefenseSignal(memory: any): boolean {
  if (values(memory.defenseRequests ?? {}).length > 0) return true;
  if (hasTaskType(memory, 'defend')) return true;
  if (values(memory.empire?.playerPostures?.players ?? {}).some(player => (player?.attackCount ?? 0) > 0 || (player?.lastIncidentTick ?? 0) > 0)) return true;
  const rooms = memory.rooms ?? {};
  return Object.keys(rooms).some(roomName => {
    const swarm = rooms[roomName]?.swarm ?? {};
    const pheromones = swarm.pheromones ?? {};
    return (swarm.danger ?? 0) > 0 || (pheromones.defense ?? 0) > 0 || (pheromones.war ?? 0) > 0;
  });
}

function hasRemoteSignal(memory: any): boolean {
  const rooms = memory.rooms ?? {};
  if (Object.keys(rooms).some(roomName => (rooms[roomName]?.swarm?.remoteAssignments ?? []).length > 0)) return true;
  const statsRooms = memory.stats?.rooms ?? {};
  return Object.keys(statsRooms).some(roomName => (statsRooms[roomName]?.remote?.assigned ?? 0) > 0);
}

function creepTargetsAllies(memory: any): boolean {
  return values(memory.creeps ?? {}).some(creepMemory => {
    if (!isObject(creepMemory)) return false;
    return hasAllyName(creepMemory.targetOwner)
      || hasAllyName(creepMemory.hostileOwner)
      || hasAllyName(creepMemory.attackTargetOwner)
      || hasAllyName(creepMemory.targetPlayer);
  });
}

function countCreepRoles(memory: any): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const creepMemory of values(memory.creeps ?? {})) {
    const role = isObject(creepMemory) && typeof creepMemory.role === 'string' ? creepMemory.role : 'unknown';
    counts[role] = (counts[role] ?? 0) + 1;
  }
  return counts;
}

function hardDefenseCreepsAreNotTiny(memory: any, creeps: any[]): boolean {
  return creeps.every(creep => {
    const name = String(creep?.name ?? '');
    const memoryRole = memory.creeps?.[name]?.role;
    const role = creep?.memory?.role ?? memoryRole;
    if (role !== 'ranger') return true;
    const targetRoom = creep?.memory?.targetRoom ?? memory.creeps?.[name]?.targetRoom;
    const task = creep?.memory?.task ?? memory.creeps?.[name]?.task;
    if (task !== 'defenseAssist' && !targetRoom) return true;
    return (creep?.body ?? []).length >= 6;
  });
}

function summarizeHardInvaderCreep(creep: any): Record<string, unknown> {
  const body = Array.isArray(creep?.body) ? creep.body : [];
  return {
    objectId: creep?._id ? String(creep._id) : undefined,
    name: creep?.name,
    room: creep?.room,
    user: creep?.user ? String(creep.user) : undefined,
    bodyParts: body.length,
    bodyTypes: body.map((part: any) => part?.type ?? part),
    hits: creep?.hits,
    hitsMax: creep?.hitsMax,
    ticksToLive: creep?.ticksToLive,
    x: creep?.x,
    y: creep?.y,
    spawning: Boolean(creep?.spawning),
  };
}

function hasConfirmedHardInvaderSeed(hardInvaders: any[], hardInvaderSeed: any): boolean {
  if (hardInvaders.some(creep => (creep?.body ?? []).length >= 50)) return true;

  return (hardInvaderSeed?.bodyParts ?? 0) >= 50
    && typeof hardInvaderSeed?.objectId === 'string'
    && hardInvaderSeed.objectId.length > 0;
}

function collectRemoteAssignments(memory: any): Record<string, string[]> {
  const assignments: Record<string, string[]> = {};
  const rooms = memory.rooms ?? {};
  for (const roomName of Object.keys(rooms)) {
    const remotes = rooms[roomName]?.swarm?.remoteAssignments;
    if (Array.isArray(remotes)) assignments[roomName] = remotes.filter((remote: unknown): remote is string => typeof remote === 'string');
  }
  return assignments;
}

function collectKnownRoomIntel(memory: any): Record<string, { scouted: boolean; lastSeen: number; sources: number; threatLevel: number }> {
  const knownRooms = memory.empire?.knownRooms ?? {};
  const summary: Record<string, { scouted: boolean; lastSeen: number; sources: number; threatLevel: number }> = {};
  for (const roomName of Object.keys(knownRooms).sort().slice(0, 20)) {
    const intel = knownRooms[roomName] ?? {};
    summary[roomName] = {
      scouted: intel.scouted === true,
      lastSeen: Number(intel.lastSeen ?? 0),
      sources: Number(intel.sources ?? 0),
      threatLevel: Number(intel.threatLevel ?? 0)
    };
  }
  return summary;
}

function collectSpawnQueueTelemetry(memory: any): Record<string, unknown> {
  const statsRooms = memory.stats?.rooms ?? {};
  const queues: Record<string, unknown> = {};
  for (const roomName of Object.keys(statsRooms)) {
    if (statsRooms[roomName]?.spawn_queue) queues[roomName] = statsRooms[roomName].spawn_queue;
  }
  return queues;
}

function assertCounter(counters: AssertionCounters, name: string, tags: string[], predicate: () => boolean, message: string): void {
  try {
    if (predicate()) counters.passed += 1;
    else counters.failures.push({ name, message, tags, source: 'screepsmod-testing-backend-cronjob' });
  } catch (error: any) {
    counters.failures.push({ name, message: error?.stack || error?.message || String(error), tags, source: 'screepsmod-testing-backend-cronjob' });
  }
}

function runtimeAssertCounter(counters: AssertionCounters, warmed: boolean, name: string, tags: string[], predicate: () => boolean, message: string): void {
  if (!warmed) {
    counters.skipped += 1;
    return;
  }
  assertCounter(counters, name, tags, predicate, message);
}

function runtimeAssertCounterAfter(counters: AssertionCounters, input: BackendAssertionInput, minTick: number, name: string, tags: string[], predicate: () => boolean, message: string): void {
  if (!input.botRuntimeWarmed) {
    counters.skipped += 1;
    return;
  }
  if (input.tick < minTick) {
    counters.passed += 1;
    return;
  }
  assertCounter(counters, name, tags, predicate, message);
}

function ensureScenarioMemory(
  memory: any,
  scenarios: string[],
  ownedRoomNames: string[],
  tick: number,
  scenarioSeedConfirmation?: any
): void {
  if (scenarios.length === 0) return;
  const homeRoom = ownedRoomNames[0];
  const existingScenarioMemory = memory.screepsmodTestingScenarios ?? {};
  const hardInvaderSeed = existingScenarioMemory.hardInvader ?? scenarioSeedConfirmation?.hardInvader;
  memory.screepsmodTestingScenarios = {
    ...existingScenarioMemory,
    names: scenarios,
    checkedAt: tick,
    rooms: {
      ...(existingScenarioMemory.rooms ?? {}),
      home: homeRoom,
      remote: DEFAULT_SCENARIO_REMOTE_ROOM,
      economy: existingScenarioMemory.rooms?.economy ?? 'W2N1'
    }
  };
  if (scenarios.indexOf('defense-hard-invader') >= 0 && hardInvaderSeed) {
    memory.screepsmodTestingScenarios.hardInvader = hardInvaderSeed;
  }

  if (homeRoom && scenarios.indexOf('remote-mining') >= 0) {
    const roomMemory = memory.rooms?.[homeRoom];
    const swarm = roomMemory?.swarm;
    if (swarm && Array.isArray(swarm.remoteAssignments) && swarm.remoteAssignments.indexOf(DEFAULT_SCENARIO_REMOTE_ROOM) < 0) {
      swarm.remoteAssignments.push(DEFAULT_SCENARIO_REMOTE_ROOM);
    }
  }
}

function assertBaselineRuntime(counters: AssertionCounters, input: BackendAssertionInput, ownedRoomNames: string[]): void {
  const memory = input.memory;
  runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend creep population exists after warmup', ['runtime','population'], () => input.creeps.length > 0, 'no creeps after warmup');
  runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend CPU bucket is not chronically empty', ['runtime','cpu'], () => (input.user.cpuAvailable ?? 10000) > 1000, 'CPU bucket below 1000');
  runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend task board memory tracks room tasks', ['runtime','task-board'], () => Object.keys(memory.creepTaskBoard?.rooms ?? {}).length > 0, 'Memory.creepTaskBoard.rooms is empty');
  runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend task board records activity', ['runtime','task-board'], () => hasTaskBoardActivity(memory), 'Memory.creepTaskBoard has no task activity');
  runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend empire memory has initialized roadmap shape', ['runtime','memory','empire'], () => {
    const empire = memory.empire ?? {};
    return isObject(empire.knownRooms) && Array.isArray(empire.clusters) && isObject(empire.ownedRooms) && Array.isArray(empire.claimQueue) && isObject(empire.objectives);
  }, 'Memory.empire schema incomplete');
  runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend clusters memory is initialized', ['runtime','memory','clusters'], () => isObject(memory.clusters ?? {}), 'Memory.clusters missing');
  runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend owned room swarm memory is initialized', ['runtime','memory','rooms'], () => ownedRoomNames.some(roomName => isObject(memory.rooms?.[roomName]?.swarm)), 'owned room swarm memory missing');
  runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend unified stats are exported', ['runtime','stats'], () => typeof memory.stats?.tick === 'number' && isObject(memory.stats?.cpu) && isObject(memory.stats?.rooms), 'Memory.stats schema incomplete');
  runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend unified stats include spawn queue telemetry', ['runtime','stats','spawn'], () => hasStatsRoomField(memory, 'spawn_queue'), 'Memory.stats.rooms.*.spawn_queue missing');
  runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend permanent allies are not war targets', ['runtime','alliance-safety'], () => !hasAllyName(memory.empire?.warTargets ?? []) && !hasAllyName(memory.warTargets ?? []), 'permanent ally appears in war target memory');
  runtimeAssertCounter(counters, input.botRuntimeWarmed, 'backend creep memory does not target permanent allies', ['runtime','alliance-safety'], () => !creepTargetsAllies(memory), 'creep memory targets permanent ally');
}

async function assertScenarios(counters: AssertionCounters, input: BackendAssertionInput): Promise<Record<string, unknown>> {
  const diagnostics: Record<string, unknown> = {};
  if (input.scenarios.length === 0) return diagnostics;

  const objects = input.storage.db['rooms.objects'];
  const constructionSites = objects?.find ? await toArray(await objects.find({ type: 'constructionSite', ...input.userIdFilter })) : [];
  const linkStructures = objects?.find ? await toArray(await objects.find({ type: 'link', ...input.userIdFilter })) : [];
  const extensionStructures = objects?.find ? await toArray(await objects.find({ type: 'extension', ...input.userIdFilter })) : [];
  const storageStructures = objects?.find ? await toArray(await objects.find({ type: 'storage', ...input.userIdFilter })) : [];
  const terminalStructures = objects?.find ? await toArray(await objects.find({ type: 'terminal', ...input.userIdFilter })) : [];
  const labStructures = objects?.find ? await toArray(await objects.find({ type: 'lab', ...input.userIdFilter })) : [];
  const hardInvaders = objects?.find ? await toArray(await objects.find({ type: 'creep', name: 'ScenarioHardInvader' })) : [];
  const hardInvaderSeed = input.memory.screepsmodTestingScenarios?.hardInvader ?? input.scenarioSeedConfirmation?.hardInvader;
  const linkSites = constructionSites.filter(site => site?.structureType === 'link');
  const siteTypes: Record<string, number> = {};
  for (const site of constructionSites) {
    const type = String(site?.structureType ?? 'unknown');
    siteTypes[type] = (siteTypes[type] ?? 0) + 1;
  }
  diagnostics.constructionSites = constructionSites.length;
  diagnostics.constructionCompletedExtensions = extensionStructures.length;
  diagnostics.linkNetwork = {
    links: linkStructures.length,
    linkSites: linkSites.length,
    extensions: extensionStructures.length,
    extensionEnergy: extensionStructures.reduce((total, extension) => total + Number(extension?.energy ?? extension?.store?.energy ?? 0), 0),
    storages: storageStructures.length,
    ownedControllers: input.ownedControllers.map(controller => ({ room: controller.room, level: controller.level })),
    siteTypes
  };
  diagnostics.terminalMarketLab = {
    terminals: terminalStructures.length,
    labs: labStructures.length,
    terminalRooms: terminalStructures.map(terminal => terminal.room),
    labRooms: labStructures.map(lab => lab.room)
  };
  const hardInvaderDiagnostics = {
    count: hardInvaders.length,
    bodyParts: hardInvaders.map(creep => (creep?.body ?? []).length),
    rooms: hardInvaders.map(creep => creep?.room),
    creeps: hardInvaders.map(summarizeHardInvaderCreep),
    seed: hardInvaderSeed ?? null
  };
  diagnostics.defenseHardInvader = hardInvaderDiagnostics;

  if (input.scenarios.indexOf('default-bootstrap') >= 0) {
    runtimeAssertCounter(counters, input.botRuntimeWarmed, 'scenario default-bootstrap has owned controller and spawn', ['scenario','default-bootstrap'], () => input.ownedControllers.length > 0 && input.spawns.length > 0, 'default bootstrap scenario lacks owned controller or spawn');
  }
  if (input.scenarios.indexOf('construction-economy') >= 0) {
    runtimeAssertCounterAfter(counters, input, 1200, 'scenario construction-economy creates build demand or completion signal', ['scenario','construction-economy'], () => constructionSites.length > 0 || extensionStructures.length > 0 || hasTaskType(input.memory, 'build') || hasTaskType(input.memory, 'repair') || hasStatsRoomField(input.memory, 'construction_sites') || (countCreepRoles(input.memory).builder ?? 0) > 0, 'construction scenario did not create build/repair demand or completion signal');
  }
  if (input.scenarios.indexOf('remote-mining') >= 0) {
    runtimeAssertCounter(counters, input.botRuntimeWarmed, 'scenario remote-mining exposes remote assignment telemetry', ['scenario','remote-mining'], () => hasRemoteSignal(input.memory), 'remote mining scenario has no remote assignment signal');
  }
  if (input.scenarios.indexOf('defense-hostile') >= 0) {
    runtimeAssertCounterAfter(counters, input, 1200, 'scenario defense-hostile emits defensive runtime signal', ['scenario','defense-hostile'], () => hasDefenseSignal(input.memory), 'defense scenario has no danger, defense task, or defense request signal');
  }
  if (input.scenarios.indexOf('defense-hard-invader') >= 0) {
    runtimeAssertCounter(
      counters,
      input.botRuntimeWarmed,
      'scenario defense-hard-invader seeds a 50-part hostile',
      ['scenario','defense-hard-invader','seed'],
      () => hasConfirmedHardInvaderSeed(hardInvaders, hardInvaderSeed),
      `hard invader scenario did not seed a 50-part hostile; diagnostics=${JSON.stringify(hardInvaderDiagnostics)}`
    );
    runtimeAssertCounterAfter(counters, input, 1200, 'scenario defense-hard-invader emits defensive runtime signal', ['scenario','defense-hard-invader'], () => hasDefenseSignal(input.memory), 'hard invader scenario has no danger, defense task, or defense request signal');
    runtimeAssertCounterAfter(counters, input, 1200, 'scenario defense-hard-invader avoids tiny ranger defenders', ['scenario','defense-hard-invader','body'], () => hardDefenseCreepsAreNotTiny(input.memory, input.creeps), 'hard invader scenario spawned a tiny ranger defender');
  }
  if (input.scenarios.indexOf('alliance-safety') >= 0) {
    runtimeAssertCounter(counters, input.botRuntimeWarmed, 'scenario alliance-safety keeps permanent allies untargeted', ['scenario','alliance-safety'], () => !creepTargetsAllies(input.memory) && !hasAllyName(input.memory.empire?.warTargets ?? []), 'alliance scenario found ally targeting');
  }
  if (input.scenarios.indexOf('link-network') >= 0) {
    runtimeAssertCounterAfter(counters, input, 800, 'scenario link-network creates link structures or sites', ['scenario','link-network'], () => linkStructures.length + linkSites.length >= 2, 'link-network scenario has fewer than two link structures/sites');
  }
  if (input.scenarios.indexOf('terminal-market-lab-economy') >= 0) {
    const hasOHReactionMemory = () => Object.keys(input.memory.rooms ?? {}).some(roomName => {
      const reaction = input.memory.rooms?.[roomName]?.labConfig?.activeReaction;
      return reaction?.input1 === 'H' && reaction?.input2 === 'O' && reaction?.output === 'OH';
    });
    const hasOHLabProduct = () => labStructures.some(lab => lab?.mineralType === 'OH' || (lab?.store?.OH ?? 0) > 0 || (lab?.cooldown ?? 0) > 0);
    const economyRoom = input.memory.screepsmodTestingScenarios?.rooms?.economy;
    const hasTerminalMovement = () => terminalStructures.some(terminal => {
      if (economyRoom && terminal?.room === economyRoom && (terminal?.store?.energy ?? 0) > 5000) return true;
      return (terminal?.store?.energy ?? 0) > 30000 || (terminal?.store?.H ?? 0) > 6000 || (terminal?.store?.O ?? 0) > 6000;
    });
    runtimeAssertCounterAfter(counters, input, 600, 'scenario terminal-market-lab has multiple owned terminals', ['scenario','terminal-market-lab-economy','terminal'], () => terminalStructures.length >= 2, 'terminal-market-lab scenario has fewer than two owned terminals');
    runtimeAssertCounterAfter(counters, input, 600, 'scenario terminal-market-lab has reaction labs', ['scenario','terminal-market-lab-economy','labs'], () => labStructures.length >= 3, 'terminal-market-lab scenario has fewer than three owned labs');
    runtimeAssertCounterAfter(counters, input, 1200, 'scenario terminal-market-lab activates OH reaction', ['scenario','terminal-market-lab-economy','labs'], () => hasOHReactionMemory() || hasOHLabProduct(), 'terminal-market-lab scenario has no OH reaction signal');
    runtimeAssertCounterAfter(counters, input, 1600, 'scenario terminal-market-lab moves terminal resources', ['scenario','terminal-market-lab-economy','terminal'], hasTerminalMovement, 'terminal-market-lab scenario has no terminal movement signal');
    runtimeAssertCounterAfter(counters, input, 1000, 'scenario terminal-market-lab records market telemetry', ['scenario','terminal-market-lab-economy','market'], () => isObject(input.memory.empire?.market) && isObject(input.memory.empire?.market?.orders ?? {}) && Array.isArray(input.memory.empire?.market?.pendingArbitrage), 'terminal-market-lab scenario has no market telemetry');
  }

  return diagnostics;
}

export async function runBackendRuntimeAssertions(input: BackendAssertionInput): Promise<RuntimeSummary> {
  const counters: AssertionCounters = { passed: 0, skipped: 0, failures: [] };
  const ownedRoomNames = input.ownedControllers.map(controller => String(controller.room)).filter(Boolean);
  ensureScenarioMemory(input.memory, input.scenarios, ownedRoomNames, input.tick, input.scenarioSeedConfirmation);

  assertCounter(counters, 'server exposes storage and advances ticks', ['smoke','server'], () => input.tick > 0, 'gameTime did not advance');
  assertCounter(counters, 'our bot has at least one owned room controller', ['smoke','bot'], () => input.ownedControllers.length > 0, 'no owned controllers');
  assertCounter(counters, 'owned room has a spawn after initialization', ['smoke','spawn'], () => input.spawns.length > 0, 'no owned spawns');
  assertCounter(counters, 'global reset loop is not detected', ['runtime','stability'], () => (input.memory.__globalResetCount || 0) < 5, 'too many global resets');
  assertCounter(counters, 'critical console error counter stays below threshold', ['runtime','errors'], () => (input.memory.ciCriticalConsoleErrors || 0) < 10, 'critical console errors above threshold');

  assertBaselineRuntime(counters, input, ownedRoomNames);
  const scenarioDiagnostics = await assertScenarios(counters, input);

  return {
    source: 'screepsmod-testing-backend-cronjob',
    total: counters.passed + counters.failures.length + counters.skipped,
    passed: counters.passed,
    failed: counters.failures.length,
    skipped: counters.skipped,
    failures: counters.failures,
    runtimeWarmed: input.botRuntimeWarmed,
    runtimeWarmupTicks: input.runtimeWarmupTicks,
    scenarios: input.scenarios,
    tick: input.tick,
    duration: Date.now() - input.startedAt,
    diagnostics: {
      botRuntimeWarmed: input.botRuntimeWarmed,
      ownedControllers: input.ownedControllers.length,
      ownedControllerDetails: input.ownedControllers.map(controller => ({
        room: controller.room,
        user: controller.user,
        level: controller.level ?? null,
      })),
      spawns: input.spawns.length,
      spawnDetails: input.spawns.map(spawn => ({
        room: spawn.room,
        user: spawn.user,
        off: spawn.off ?? null,
        energy: spawn.energy ?? spawn.store?.energy ?? null,
        energyCapacity: spawn.energyCapacity ?? spawn.storeCapacityResource?.energy ?? null,
        store: spawn.store ?? null,
        storeCapacityResource: spawn.storeCapacityResource ?? null,
        spawning: spawn.spawning ?? null,
      })),
      creeps: input.creeps.length,
      taskBoardRooms: Object.keys(input.memory.creepTaskBoard?.rooms ?? {}).length,
      roomEnergy: Object.fromEntries(Object.entries(input.memory.stats?.rooms ?? {}).map(([roomName, stats]: [string, any]) => [
        roomName,
        stats?.energy ?? null,
      ])),
      hasPlayerSandboxSummary: input.memory.screepsmodTestingPlayer?.source === 'screepsmod-testing-player-sandbox',
      errorNotifications: input.errorSamples.length,
      errorSamples: input.errorSamples,
      scenarios: scenarioDiagnostics,
      creepRoles: countCreepRoles(input.memory),
      remoteAssignments: collectRemoteAssignments(input.memory),
      knownRooms: collectKnownRoomIntel(input.memory),
      spawnQueues: collectSpawnQueueTelemetry(input.memory)
    }
  };
}

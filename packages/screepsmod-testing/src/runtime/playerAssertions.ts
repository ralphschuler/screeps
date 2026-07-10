const ALLY_NAMES = ['TooAngel', 'TedRoastBeef'];

const MERGE_RUNTIME_SUMMARIES_SOURCE = `function mergeRuntimeSummaries(sources, tick, startedAt, runtimeWarmupTicks, scenarios) {
  function cloneSource(summary) {
    if (!summary) return undefined;
    var copy = {};
    for (var key in summary) {
      if (Object.prototype.hasOwnProperty.call(summary, key) && key !== 'sources') copy[key] = summary[key];
    }
    copy.failures = Array.isArray(summary.failures) ? summary.failures.slice() : [];
    return copy;
  }
  var active = [];
  if (sources.player) active.push(sources.player);
  if (sources.backend) active.push(sources.backend);
  if (sources.legacy) active.push(sources.legacy);
  var total = 0;
  var passed = 0;
  var failed = 0;
  var skipped = 0;
  var failures = [];
  var runtimeWarmed = active.length > 0;
  for (var index = 0; index < active.length; index += 1) {
    var summary = active[index];
    total += Number(summary.total || 0);
    passed += Number(summary.passed || 0);
    failed += Number(summary.failed || 0);
    skipped += Number(summary.skipped || 0);
    if (summary.runtimeWarmed === false) runtimeWarmed = false;
    var sourceFailures = Array.isArray(summary.failures) ? summary.failures : [];
    for (var failureIndex = 0; failureIndex < sourceFailures.length; failureIndex += 1) {
      var sourceFailure = sourceFailures[failureIndex];
      var failure = {};
      for (var failureKey in sourceFailure) {
        if (Object.prototype.hasOwnProperty.call(sourceFailure, failureKey)) failure[failureKey] = sourceFailure[failureKey];
      }
      failure.source = failure.source || summary.source;
      failures.push(failure);
    }
  }
  return {
    source: 'screepsmod-testing-merged',
    total: total,
    passed: passed,
    failed: failed,
    skipped: skipped,
    failures: failures,
    runtimeWarmed: runtimeWarmed,
    runtimeWarmupTicks: runtimeWarmupTicks,
    scenarios: scenarios || [],
    sources: {
      player: cloneSource(sources.player),
      backend: cloneSource(sources.backend),
      legacy: cloneSource(sources.legacy)
    },
    tick: tick,
    duration: Date.now() - startedAt
  };
}`;

export function buildPlayerSandboxTestSource(runtimeWarmupTicks: number, scenarioNames: string[]): string {
  const mergeRuntimeSummariesSource = MERGE_RUNTIME_SUMMARIES_SOURCE;

  return `
(function screepsmodTestingPlayerSandbox() {
  var started = Date.now();
  var failures = [];
  var passed = 0;
  var skipped = 0;
  var mergeRuntimeSummaries = ${mergeRuntimeSummariesSource};
  var configuredScenarios = ${JSON.stringify(scenarioNames)};
  var allies = ${JSON.stringify(ALLY_NAMES)};

  function values(obj) {
    if (!obj) return [];
    return Object.keys(obj).map(function(key) { return obj[key]; });
  }
  function isObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
  function hasScenario(name) {
    var memoryNames = (((memory.screepsmodTestingScenarios || {}).names) || []);
    return configuredScenarios.indexOf(name) >= 0 || memoryNames.indexOf(name) >= 0;
  }
  function pass() { passed += 1; }
  function skip(name, tags, message) {
    skipped += 1;
  }
  function fail(name, tags, message) {
    failures.push({ name: name, message: message || 'assertion failed', tags: tags, source: 'screepsmod-testing-player-sandbox' });
  }
  function assert(name, tags, predicate, details) {
    try {
      if (predicate()) pass();
      else fail(name, tags, details || 'assertion failed');
    } catch (error) {
      fail(name, tags, error && (error.stack || error.message) || String(error));
    }
  }
  function runtimeAssert(name, tags, predicate, details) {
    if (!runtimeWarmed) {
      skip(name, tags, 'runtime warmup pending');
      return;
    }
    assert(name, tags, predicate, details);
  }
  function runtimeAssertAfter(minTick, name, tags, predicate, details) {
    if (runtimeAge < minTick) {
      skip(name, tags, 'runtime maturity pending');
      return;
    }
    runtimeAssert(name, tags, predicate, details);
  }
  function allOwnedRoomsHaveSwarm() {
    if (ownedRooms.length === 0) return false;
    return ownedRooms.every(function(room) {
      var swarm = (((memory.rooms || {})[room.name] || {}).swarm);
      return isObject(swarm)
        && ['seedNest','foragingExpansion','matureColony','fortifiedHive','empireDominance'].indexOf(swarm.colonyLevel) >= 0
        && ['eco','expand','defensive','war','siege','evacuate','nukePrep'].indexOf(swarm.posture) >= 0
        && typeof swarm.danger === 'number' && swarm.danger >= 0 && swarm.danger <= 3;
    });
  }
  function allOwnedRoomsHavePheromones() {
    var required = ['expand','harvest','build','upgrade','defense','war','siege','logistics','nukeTarget'];
    return ownedRooms.length > 0 && ownedRooms.every(function(room) {
      var pheromones = ((((memory.rooms || {})[room.name] || {}).swarm || {}).pheromones);
      return isObject(pheromones) && required.every(function(key) { return typeof pheromones[key] === 'number' && isFinite(pheromones[key]); });
    });
  }
  function taskBoardTasks() {
    var rooms = ((memory.creepTaskBoard || {}).rooms) || {};
    var tasks = [];
    values(rooms).forEach(function(board) {
      values((board || {}).tasks || {}).forEach(function(task) { tasks.push(task); });
    });
    return tasks;
  }
  function hasTaskType(type) {
    return taskBoardTasks().some(function(task) { return task && task.type === type; });
  }
  function taskBoardOmitsUnconsumedWorkerTasks() {
    return taskBoardTasks().every(function(task) {
      return !task || ['build','repair','upgrade'].indexOf(task.type) < 0;
    });
  }
  function hasStatsRoomField(fieldName) {
    var rooms = ((memory.stats || {}).rooms) || {};
    return Object.keys(rooms).some(function(roomName) { return Boolean(rooms[roomName] && rooms[roomName][fieldName]); });
  }
  function hasAllyName(value) {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return allies.indexOf(value) >= 0;
    if (Array.isArray(value)) return value.some(hasAllyName);
    if (typeof value === 'object') return Object.keys(value).some(function(key) { return hasAllyName(value[key]); });
    return false;
  }
  function creepTargetsAllies() {
    return values(memory.creeps || {}).some(function(creepMemory) {
      if (!creepMemory || typeof creepMemory !== 'object') return false;
      return hasAllyName(creepMemory.targetOwner)
        || hasAllyName(creepMemory.hostileOwner)
        || hasAllyName(creepMemory.attackTargetOwner)
        || hasAllyName(creepMemory.targetPlayer);
    });
  }
  function ownedCreepsForRoleAssertion() {
    var ownedUsers = {};
    values(game.spawns || {}).forEach(function(spawn) {
      var owner = spawn && spawn.owner && spawn.owner.username;
      if (owner) ownedUsers[owner] = true;
    });
    var hasOwnedUsers = Object.keys(ownedUsers).length > 0;
    var creepMemory = memory.creeps || {};
    var hasCreepMemory = Object.keys(creepMemory).length > 0;
    var gameCreeps = game.creeps || {};
    return Object.keys(gameCreeps).map(function(name) { return { name: name, creep: gameCreeps[name] }; }).filter(function(entry) {
      var creep = entry.creep;
      if (!creep) return false;
      if (creep.my === false) return false;
      var creepName = creep.name || entry.name;
      if (hasCreepMemory) {
        var storedMemory = creepName && creepMemory[creepName];
        if (!storedMemory) return false;
        if (typeof storedMemory.role !== 'string') {
          var botManagedShape = Boolean(storedMemory.version || storedMemory.family || storedMemory.homeRoom || storedMemory.task || storedMemory.targetRoom || storedMemory.assignedRoom || storedMemory.sourceId);
          if (!botManagedShape) return false;
        }
      }
      var owner = creep.owner && creep.owner.username;
      if (owner && hasOwnedUsers) return ownedUsers[owner] === true;
      if (owner) return creep.my === true;
      return creep.my === true || (creep.memory && typeof creep.memory === 'object' && Object.keys(creep.memory).length > 0);
    }).map(function(entry) { return entry.creep; });
  }
  function hasBuilderRole() {
    return values(memory.creeps || {}).some(function(creepMemory) {
      return creepMemory && typeof creepMemory === 'object' && creepMemory.role === 'builder';
    });
  }
  function hasConstructionDemandOrCompletionSignal() {
    if (hasTaskType('build') || hasTaskType('repair') || hasStatsRoomField('construction_sites') || hasBuilderRole()) return true;
    return ownedRooms.some(function(room) {
      var sites = room.find(FIND_MY_CONSTRUCTION_SITES, { filter: function(site) { return site.structureType === STRUCTURE_EXTENSION; } }) || [];
      if (sites.length > 0) return true;
      var extensions = room.find(FIND_MY_STRUCTURES, { filter: function(structure) { return structure.structureType === STRUCTURE_EXTENSION; } }) || [];
      return extensions.length > 0;
    });
  }
  function hasDefenseSignal() {
    if (values(memory.defenseRequests || {}).length > 0) return true;
    if (hasTaskType('defend')) return true;
    if (values((((memory.empire || {}).playerPostures || {}).players) || {}).some(function(player) { return ((player || {}).attackCount || 0) > 0 || ((player || {}).lastIncidentTick || 0) > 0; })) return true;
    return ownedRooms.some(function(room) {
      var swarm = (((memory.rooms || {})[room.name] || {}).swarm) || {};
      var pheromones = swarm.pheromones || {};
      return (swarm.danger || 0) > 0 || (pheromones.defense || 0) > 0 || (pheromones.war || 0) > 0;
    });
  }

  function linkNetworkPoints(room) {
    var links = room.find(FIND_MY_STRUCTURES, { filter: function(structure) { return structure.structureType === STRUCTURE_LINK; } }) || [];
    var sites = room.find(FIND_MY_CONSTRUCTION_SITES, { filter: function(site) { return site.structureType === STRUCTURE_LINK; } }) || [];
    return links.concat(sites);
  }
  function hasLinkNear(points, target, range) {
    return Boolean(target) && points.some(function(point) { return point && point.pos && point.pos.getRangeTo(target) <= range; });
  }
  function hasFunctionalLinkNetworkPlanSignal() {
    return ownedRooms.some(function(room) {
      if (!room.controller || room.controller.level < 5) return false;
      var points = linkNetworkPoints(room);
      if (points.length < 2) return false;
      return hasLinkNear(points, room.storage, 2) && hasLinkNear(points, room.controller, 2);
    });
  }
  function harvestersHaveCarry() {
    var harvesters = values(game.creeps || {}).filter(function(creep) { return creep && creep.memory && creep.memory.role === 'harvester'; });
    return harvesters.length > 0 && harvesters.every(function(creep) {
      return (creep.body || []).some(function(part) { return part && part.type === CARRY && part.hits > 0; });
    });
  }
  function ownedTerminals() {
    var terminals = [];
    ownedRooms.forEach(function(room) {
      if (room.terminal && room.terminal.my !== false) terminals.push(room.terminal);
    });
    return terminals;
  }
  function ownedLabs() {
    var labs = [];
    ownedRooms.forEach(function(room) {
      labs = labs.concat(room.find(FIND_MY_STRUCTURES, { filter: function(structure) { return structure.structureType === STRUCTURE_LAB; } }) || []);
    });
    return labs;
  }
  function hasLabReactionSignal() {
    if (ownedLabs().some(function(lab) { return lab && ((lab.mineralType === RESOURCE_HYDROXIDE && lab.store[RESOURCE_HYDROXIDE] > 0) || lab.cooldown > 0); })) return true;
    var roomsMemory = memory.rooms || {};
    return Object.keys(roomsMemory).some(function(roomName) {
      var reaction = ((roomsMemory[roomName] || {}).labConfig || {}).activeReaction;
      return reaction && reaction.input1 === RESOURCE_HYDROGEN && reaction.input2 === RESOURCE_OXYGEN && reaction.output === RESOURCE_HYDROXIDE;
    });
  }
  function hasTerminalMovementSignal() {
    var scenarioRooms = ((memory.screepsmodTestingScenarios || {}).rooms) || {};
    var economyRoom = scenarioRooms.economy;
    var room = economyRoom && game.rooms && game.rooms[economyRoom];
    if (room && room.terminal && room.terminal.store[RESOURCE_ENERGY] > 5000) return true;
    return ownedTerminals().some(function(terminal) { return terminal.store[RESOURCE_ENERGY] > 30000 || terminal.store[RESOURCE_HYDROGEN] > 6000 || terminal.store[RESOURCE_OXYGEN] > 6000; });
  }
  function hasMarketTelemetry() {
    var market = (memory.empire || {}).market || {};
    return isObject(market)
      && isObject(market.resources || {})
      && isObject(market.orders || {})
      && Array.isArray(market.pendingArbitrage)
      && typeof (market.totalProfit || 0) === 'number';
  }

  var game = typeof Game === 'object' && Game ? Game : {};
  var memory = typeof Memory === 'object' && Memory ? Memory : {};
  var rooms = values(game.rooms || {});
  var ownedRooms = rooms.filter(function(room) { return room && room.controller && room.controller.my; });
  var tick = Number(game.time || 0);
  var playerRuntimeExecutionCount = Number(global.__screepsmodTestingPlayerExecutionCount || 0) + 1;
  global.__screepsmodTestingPlayerExecutionCount = playerRuntimeExecutionCount;
  var runtimeAge = Math.max(0, playerRuntimeExecutionCount - 1);
  var runtimeWarmed = runtimeAge >= ${JSON.stringify(runtimeWarmupTicks)};

  assert('server exposes Game and advances ticks', ['smoke','server'], function() { return tick > 0; }, 'Game.time did not advance');
  assert('our bot has at least one owned visible room', ['smoke','bot'], function() { return ownedRooms.length > 0; }, 'no owned visible rooms');
  assert('owned room has a spawn after initialization', ['smoke','spawn'], function() { return Object.keys(game.spawns || {}).length > 0; }, 'no owned spawns');
  assert('global reset loop is not detected', ['runtime','stability'], function() { return (memory.__globalResetCount || 0) < 5; }, 'too many global resets');
  assert('critical console error counter stays below threshold', ['runtime','errors'], function() { return (memory.ciCriticalConsoleErrors || 0) < 10; }, 'critical console errors above threshold');

  runtimeAssert('creep population exists after warmup', ['runtime','population'], function() { return Object.keys(game.creeps || {}).length > 0; }, 'no creeps after warmup');
  runtimeAssert('CPU bucket is not chronically empty', ['runtime','cpu'], function() { return ((game.cpu && game.cpu.bucket) || 10000) > 1000; }, 'CPU bucket below 1000');
  runtimeAssert('task board memory exists and can track room tasks', ['runtime','task-board'], function() { return Object.keys(((memory.creepTaskBoard || {}).rooms) || {}).length > 0; }, 'Memory.creepTaskBoard.rooms is empty');
  runtimeAssert('task board omits unconsumed worker task backlog', ['runtime','task-board'], taskBoardOmitsUnconsumedWorkerTasks, 'Memory.creepTaskBoard contains build/repair/upgrade tasks that role logic does not consume');
  runtimeAssert('empire memory has initialized roadmap shape', ['runtime','memory','empire'], function() {
    var empire = memory.empire || {};
    return isObject(empire.knownRooms) && Array.isArray(empire.clusters) && isObject(empire.ownedRooms) && Array.isArray(empire.claimQueue) && isObject(empire.objectives);
  }, 'Memory.empire schema incomplete');
  runtimeAssert('clusters memory is initialized', ['runtime','memory','clusters'], function() { return isObject(memory.clusters || {}); }, 'Memory.clusters missing');
  runtimeAssert('owned rooms have swarm memory state', ['runtime','memory','rooms'], allOwnedRoomsHaveSwarm, 'owned room swarm memory incomplete');
  runtimeAssert('owned room pheromone channels are numeric', ['runtime','pheromones'], allOwnedRoomsHavePheromones, 'pheromone channels missing or non-numeric');
  runtimeAssertAfter(1000, 'all creeps expose role memory', ['runtime','creeps'], function() {
    var creeps = ownedCreepsForRoleAssertion();
    return creeps.length > 0 && creeps.every(function(creep) { return creep && creep.memory && typeof creep.memory.role === 'string' && creep.memory.role.length > 0; });
  }, 'one or more owned creeps has no role');
  runtimeAssert('unified stats are exported to Memory.stats', ['runtime','stats'], function() {
    var stats = memory.stats || {};
    return typeof stats.tick === 'number' && isObject(stats.cpu) && isObject(stats.empire) && isObject(stats.rooms);
  }, 'Memory.stats schema incomplete');
  runtimeAssert('unified stats include owned room entries', ['runtime','stats'], function() {
    var statsRooms = ((memory.stats || {}).rooms) || {};
    return ownedRooms.some(function(room) { return Boolean(statsRooms[room.name]); });
  }, 'Memory.stats.rooms lacks owned room');
  runtimeAssert('unified stats include spawn queue telemetry', ['runtime','stats','spawn'], function() { return hasStatsRoomField('spawn_queue'); }, 'Memory.stats.rooms.*.spawn_queue missing');
  runtimeAssert('permanent allies are not listed as war targets', ['runtime','alliance-safety'], function() {
    var empireWarTargets = ((memory.empire || {}).warTargets) || [];
    return !hasAllyName(empireWarTargets) && !hasAllyName(memory.warTargets || []);
  }, 'permanent ally appears in war target memory');
  runtimeAssert('creep memory does not target permanent allies', ['runtime','alliance-safety'], function() { return !creepTargetsAllies(); }, 'creep memory targets permanent ally');

  if (hasScenario('construction-economy')) {
    runtimeAssertAfter(1200, 'construction scenario produces build/repair demand or completion signal', ['scenario','construction-economy'], hasConstructionDemandOrCompletionSignal, 'construction scenario did not create build/repair demand or completion signal');
  }
  if (hasScenario('defense-hostile')) {
    runtimeAssertAfter(1200, 'defense scenario emits defensive runtime signal', ['scenario','defense-hostile'], hasDefenseSignal, 'defense scenario has no danger, defense task, or defense request signal');
  }
  if (hasScenario('defense-hard-invader')) {
    runtimeAssertAfter(1200, 'hard invader scenario emits defensive runtime signal', ['scenario','defense-hard-invader'], hasDefenseSignal, 'hard invader scenario has no danger, defense task, or defense request signal');
  }
  if (hasScenario('alliance-safety')) {
    runtimeAssert('alliance scenario keeps permanent allies untargeted', ['scenario','alliance-safety'], function() {
      return !creepTargetsAllies() && !hasAllyName(((memory.empire || {}).warTargets) || []);
    }, 'alliance scenario found ally targeting');
  }
  if (hasScenario('link-network')) {
    runtimeAssertAfter(800, 'link-network scenario plans storage and controller link sites', ['scenario','link-network'], hasFunctionalLinkNetworkPlanSignal, 'link-network scenario has no storage/controller link structures or sites');
    runtimeAssertAfter(1000, 'link-network scenario harvesters can fill source links', ['scenario','link-network','roles'], harvestersHaveCarry, 'harvester bodies lack active CARRY parts for link fill');
  }
  if (hasScenario('terminal-market-lab-economy')) {
    runtimeAssertAfter(600, 'terminal-market-lab scenario has multiple owned terminals', ['scenario','terminal-market-lab-economy','terminal'], function() { return ownedTerminals().length >= 2; }, 'terminal-market-lab scenario has fewer than two owned terminals');
    runtimeAssertAfter(600, 'terminal-market-lab scenario has reaction labs', ['scenario','terminal-market-lab-economy','labs'], function() { return ownedLabs().length >= 3; }, 'terminal-market-lab scenario has fewer than three owned labs');
    runtimeAssertAfter(1200, 'terminal-market-lab scenario activates OH lab reaction', ['scenario','terminal-market-lab-economy','labs'], hasLabReactionSignal, 'terminal-market-lab scenario has no OH reaction signal');
    runtimeAssertAfter(1600, 'terminal-market-lab scenario moves resources through terminals', ['scenario','terminal-market-lab-economy','terminal'], hasTerminalMovementSignal, 'terminal-market-lab scenario has no terminal transfer/resource movement signal');
    runtimeAssertAfter(1000, 'terminal-market-lab scenario records market telemetry', ['scenario','terminal-market-lab-economy','market'], hasMarketTelemetry, 'terminal-market-lab scenario has no market telemetry');
  }

  var playerSummary = {
    source: 'screepsmod-testing-player-sandbox',
    total: passed + failures.length + skipped,
    passed: passed,
    failed: failures.length,
    skipped: skipped,
    failures: failures,
    runtimeWarmed: runtimeWarmed,
    runtimeWarmupTicks: ${JSON.stringify(runtimeWarmupTicks)},
    runtimeExecutions: playerRuntimeExecutionCount,
    runtimeAge: runtimeAge,
    scenarios: configuredScenarios,
    tick: tick,
    duration: Date.now() - started
  };

  global.__screepsmodTestingPlayerSummary = playerSummary;
  memory.screepsmodTestingPlayer = playerSummary;
  memory.screepsmodTesting = mergeRuntimeSummaries({
    player: playerSummary,
    backend: memory.screepsmodTestingBackend,
    legacy: memory.screepsmodTestingLegacy
  }, tick, started, ${JSON.stringify(runtimeWarmupTicks)}, configuredScenarios);
}).call(global);
`;
}

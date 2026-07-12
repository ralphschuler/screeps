import {
  DEFAULT_ADAPTIVE_CONFIG,
  calculateAdaptiveBudget,
  calculateAdaptiveBudgets,
  calculateBucketMultiplier,
  calculateRoomScalingMultiplier,
  getAdaptiveBudgetInfo,
  getAdaptiveBudgets,
  getCurrentBucket,
  getCurrentRoomCount
} from '../../@ralphschuler/screeps-core/src/adaptiveBudgets.ts';

// Provide minimal lodash-like utilities for tests without depending on lodash
// Note: _.clone() is a SHALLOW clone (same as lodash's default behavior, not _.cloneDeep())
global._ = {
  clone: function(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.slice();
    }
    return Object.assign({}, obj);
  }
};

// Mock Game object early - required by the custom traffic management module
// that access Game globals at module load time
global.Game = {
  creeps: {},
  rooms: {},
  spawns: {},
  time: 12345,
  cpu: {
    getUsed: () => 0,
    limit: 20,
    tickLimit: 500,
    bucket: 10000,
    shardLimits: {},
    unlocked: false,
    unlockedTime: 0
  },
  powerCreeps: {},
  map: {
    getRoomLinearDistance: () => 1,
    getWorldSize: () => 252,
    describeExits: () => ({}),
    findRoute: () => [],
    findExit: () => null,
    getRoomTerrain: () => ({
      get: () => 0,
      getRawBuffer: () => new Uint8Array(2500)
    }),
    getRoomStatus: () => ({ status: 'normal', timestamp: null }),
    visual: {}
  },
  gcl: {
    level: 1,
    progress: 0,
    progressTotal: 1000000
  },
  gpl: {
    level: 0,
    progress: 0,
    progressTotal: 1000000
  },
  market: {
    credits: 0,
    incomingTransactions: [],
    outgoingTransactions: [],
    orders: {}
  }
};

// Mock Memory early as well
global.Memory = {
  creeps: {},
  _heapCache: undefined,
  rooms: {},
  spawns: {},
  flags: {},
  powerCreeps: {}
};

// Import test dependencies as ES modules
import * as mocha from 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';

global.mocha = mocha;
global.chai = chai;
global.sinon = sinon;
global.chai.use(sinonChai);

// Mock LZ-String for compression tests
global.LZString = {
  compressToUTF16: (str) => btoa(str),
  decompressFromUTF16: (str) => atob(str),
  compress: (str) => btoa(str),
  decompress: (str) => atob(str),
  compressToBase64: (str) => btoa(str),
  decompressFromBase64: (str) => atob(str)
};

// Mock require for tests that use CommonJS
global.require = function(module) {
  if (module === 'lz-string') {
    return global.LZString;
  }
  throw new Error(`Module ${module} not mocked`);
};

// Override ts-node compiler options
process.env.TS_NODE_PROJECT = 'tsconfig.test.json';

// Register module aliases and stubs for @bot paths used in dependency packages
// This allows packages like screeps-defense to resolve @bot/* imports during testing
// 
// NOTE: This module resolution override is intentionally scoped to the test environment.
// It only affects imports during test execution and does not impact production builds.
// The override is necessary because dependency packages use @bot/* path aliases that
// are resolved during their build, but the compiled output still contains require('@bot/*')
// statements that need runtime resolution in the test environment.
import Module from 'module';
const originalResolveFilename = Module._resolveFilename;

function isPermanentAllyTestUsername(username) {
  return username === 'TooAngel' || username === 'TedRoastBeef';
}

function normalizeTestAllyList(value) {
  return Array.isArray(value) ? value.filter(ally => typeof ally === 'string' && ally.length > 0) : [];
}

function getConfiguredTestAllies(options = {}) {
  const memory = global.Memory ?? {};
  const empire = options.empire ?? {};
  return [...new Set([
    ...normalizeTestAllyList(options.configuredAllies),
    ...normalizeTestAllyList(empire.diplomacy?.allies),
    ...normalizeTestAllyList(memory.diplomacy?.allies),
    ...normalizeTestAllyList(memory.empire?.diplomacy?.allies)
  ])];
}

function isKnownAllyTestUsername(username, options = {}) {
  return typeof username === 'string' && (isPermanentAllyTestUsername(username) || getConfiguredTestAllies(options).includes(username));
}

function isPermanentAllyTestEntity(entity) {
  return isPermanentAllyTestUsername(entity?.owner?.username);
}

function isAlliedTestEntity(entity) {
  return isKnownAllyTestUsername(entity?.owner?.username);
}

function filterAlliedTestEntities(entities) {
  const firstAllyIndex = entities.findIndex(isAlliedTestEntity);
  return firstAllyIndex === -1 ? entities : entities.filter(entity => !isAlliedTestEntity(entity));
}

function filterPermanentAllyTestEntities(entities) {
  const firstAllyIndex = entities.findIndex(isPermanentAllyTestEntity);
  return firstAllyIndex === -1 ? entities : entities.filter(entity => !isPermanentAllyTestEntity(entity));
}

const defenseAssistRoles = new Set(['guard', 'ranger', 'healer']);
const defenseAssistPartCosts = {
  move: 50,
  work: 100,
  carry: 50,
  attack: 80,
  ranged_attack: 150,
  heal: 250,
  claim: 600,
  tough: 10
};

function getTestPartType(part) {
  return typeof part === 'string' ? part : part?.type;
}

function isTestActivePart(part) {
  return typeof part === 'string' || (part?.hits ?? 0) > 0;
}

function calculateTestCombatPower(parts = []) {
  let partCount = 0;
  let attack = 0;
  let ranged = 0;
  let heal = 0;
  let dismantle = 0;

  for (const part of parts) {
    if (!isTestActivePart(part)) continue;
    partCount++;
    const type = getTestPartType(part);
    if (type === 'attack') attack += 30;
    if (type === 'ranged_attack') ranged += 10;
    if (type === 'heal') heal += 12;
    if (type === 'work') dismantle += 50;
  }

  return { partCount, attack, ranged, heal, dismantle, score: attack + ranged + heal + dismantle + partCount * 2 };
}

function emptyTestCombatPower() {
  return { partCount: 0, attack: 0, ranged: 0, heal: 0, dismantle: 0, score: 0 };
}

function addTestCombatPower(a, b) {
  return {
    partCount: a.partCount + b.partCount,
    attack: a.attack + b.attack,
    ranged: a.ranged + b.ranged,
    heal: a.heal + b.heal,
    dismantle: a.dismantle + b.dismantle,
    score: a.score + b.score
  };
}

function multiplyTestCombatPower(power, count) {
  return {
    partCount: power.partCount * count,
    attack: power.attack * count,
    ranged: power.ranged * count,
    heal: power.heal * count,
    dismantle: power.dismantle * count,
    score: power.score * count
  };
}

function testBodyCost(parts) {
  return parts.reduce((sum, part) => sum + (defenseAssistPartCosts[part] ?? 0), 0);
}

function buildTestDefenseAssistBody(role, energyCapacity) {
  const unit = role === 'guard' ? ['attack', 'move'] : role === 'ranger' ? ['ranged_attack', 'move'] : ['heal', 'move'];
  const unitCost = testBodyCost(unit);
  const unitCount = Math.min(25, Math.floor((energyCapacity ?? 0) / unitCost));
  if (!defenseAssistRoles.has(role) || unitCount <= 0) return null;
  const parts = Array.from({ length: unitCount }, () => unit).flat();
  const cost = testBodyCost(parts);
  return { parts, cost, minCapacity: cost };
}

function analyzeTestDefenseAssistThreat(hostiles = []) {
  if (hostiles.length === 0) return null;
  let strongest = null;
  let total = emptyTestCombatPower();
  for (const hostile of hostiles) {
    const power = calculateTestCombatPower(hostile.body ?? []);
    total = addTestCombatPower(total, power);
    if (!strongest || power.score > strongest.score) strongest = power;
  }
  return { hostileCount: hostiles.length, strongest, total };
}

function calculateTestAggregateDefenseResponsePlan(energyCapacity, threatProfile, baseNeeds = {}, existingPower, maxSize = 12) {
  const counts = {
    guard: Math.max(0, Math.floor(baseNeeds.guard ?? 0)),
    ranger: Math.max(0, Math.floor(baseNeeds.ranger ?? 0)),
    healer: Math.max(0, Math.floor(baseNeeds.healer ?? 0))
  };
  const bodies = {
    guard: buildTestDefenseAssistBody('guard', energyCapacity),
    ranger: buildTestDefenseAssistBody('ranger', energyCapacity),
    healer: buildTestDefenseAssistBody('healer', energyCapacity)
  };
  const powers = Object.fromEntries(Object.entries(bodies).filter(([, body]) => body).map(([role, body]) => [role, calculateTestCombatPower(body.parts)]));
  const planCount = () => counts.guard + counts.ranger + counts.healer;
  const totalPower = () => {
    let total = emptyTestCombatPower();
    for (const role of defenseAssistRoles) {
      if (existingPower?.[role]) total = addTestCombatPower(total, existingPower[role]);
      if (powers[role] && counts[role] > 0) total = addTestCombatPower(total, multiplyTestCombatPower(powers[role], counts[role]));
    }
    return total;
  };
  let capped = false;
  while (threatProfile && totalPower().score <= threatProfile.total.score && planCount() < maxSize) counts.guard++;
  if (planCount() >= maxSize && threatProfile && totalPower().score <= threatProfile.total.score) capped = true;
  if (threatProfile && counts.guard + counts.ranger >= 3 && counts.healer === 0 && bodies.healer && planCount() < maxSize) counts.healer = 1;
  return { counts, bodies, totalPower: totalPower(), healerFloor: counts.healer > 0 ? 1 : 0, targetScore: threatProfile?.total?.score ?? 0, capped };
}

function findTestRoomObjects(room, findConstant) {
  if (typeof room?.find !== 'function') return [];
  return room.find(findConstant) ?? [];
}

function getTestHostileCreeps(room) {
  return findTestRoomObjects(room, global.FIND_HOSTILE_CREEPS).filter(creep => !isAlliedTestEntity(creep));
}

function hasTestActiveDefenseThreat(hostile) {
  if (isAlliedTestEntity(hostile)) return false;
  return (hostile?.body ?? []).some(part =>
    isTestActivePart(part) && ['attack', 'ranged_attack', 'work', 'heal', 'claim'].includes(getTestPartType(part))
  );
}

function hasTestActivePart(creep, partTypes) {
  return (creep?.body ?? []).some(part => isTestActivePart(part) && partTypes.includes(getTestPartType(part)));
}

function analyzeTestDefenderNeeds(room) {
  const result = { guards: 0, rangers: 0, healers: 0, urgency: 1.0, reasons: [] };
  const hostiles = getTestHostileCreeps(room);
  if (hostiles.length === 0) return result;

  let meleeCount = 0;
  let rangedCount = 0;
  let healerCount = 0;
  let dismantlerCount = 0;
  let claimCount = 0;
  let boostedCount = 0;

  for (const hostile of hostiles) {
    const activeBody = (hostile.body ?? []).filter(isTestActivePart);
    if (activeBody.some(part => part?.boost !== undefined)) boostedCount++;
    for (const part of activeBody) {
      const type = getTestPartType(part);
      if (type === 'attack') meleeCount++;
      if (type === 'ranged_attack') rangedCount++;
      if (type === 'heal') healerCount++;
      if (type === 'work') dismantlerCount++;
      if (type === 'claim') claimCount++;
    }
  }

  if (meleeCount > 0) {
    result.guards = Math.max(1, Math.ceil(meleeCount / 4));
    result.reasons.push(`${meleeCount} melee parts detected`);
  }
  if (rangedCount > 0) {
    result.rangers = Math.max(1, Math.ceil(rangedCount / 6));
    result.reasons.push(`${rangedCount} ranged parts detected`);
  }
  if (healerCount > 0) {
    result.healers = Math.max(1, Math.ceil(healerCount / 8));
    result.reasons.push(`${healerCount} heal parts detected`);
  }
  if (dismantlerCount > 0) {
    result.guards += Math.ceil(dismantlerCount / 5);
    result.reasons.push(`${dismantlerCount} work parts detected`);
  }
  if (claimCount > 0) {
    result.guards = Math.max(1, result.guards);
    result.reasons.push(`${claimCount} claim parts detected`);
  }
  if (boostedCount > 0) {
    result.guards = Math.ceil(result.guards * 1.5);
    result.rangers = Math.ceil(result.rangers * 1.5);
    result.healers = Math.ceil(result.healers * 1.5);
    result.urgency = 2.0;
    result.reasons.push(`${boostedCount} boosted enemies`);
  }
  if (hostiles.length >= 2 || boostedCount > 0 || healerCount > 0 || dismantlerCount > 0) {
    result.guards = Math.max(result.guards, 2);
    result.rangers = Math.max(result.rangers, 2);
  }
  if (hostiles.length >= 3) result.healers = Math.max(result.healers, 1);
  if (hostiles.length >= 5) {
    result.urgency = Math.max(result.urgency, 1.5);
    result.reasons.push(`${hostiles.length} hostiles (large attack)`);
  }

  return result;
}

function getTestCurrentDefenders(room) {
  const creeps = findTestRoomObjects(room, global.FIND_MY_CREEPS);
  const isAssignedRemoteGuard = creep => creep.memory?.role === 'remoteGuard' && creep.memory?.targetRoom === room.name;
  return {
    guards: creeps.filter(creep =>
      !creep.spawning &&
      (creep.memory?.role === 'guard' || isAssignedRemoteGuard(creep)) &&
      hasTestActivePart(creep, ['attack', 'ranged_attack'])
    ).length,
    rangers: creeps.filter(creep => !creep.spawning && creep.memory?.role === 'ranger' && hasTestActivePart(creep, ['ranged_attack'])).length,
    healers: creeps.filter(creep => !creep.spawning && creep.memory?.role === 'healer' && hasTestActivePart(creep, ['heal'])).length
  };
}

function getTestCombatEscortRequirement(hostiles) {
  const activeHostiles = hostiles.filter(hasTestActiveDefenseThreat);
  const needs = analyzeTestDefenderNeeds({
    find: findConstant => findConstant === global.FIND_HOSTILE_CREEPS ? activeHostiles : []
  });
  return {
    guards: needs.guards,
    rangers: needs.rangers
  };
}

function hasTestSufficientCombatEscort(room, hostiles = getTestHostileCreeps(room)) {
  const requirement = getTestCombatEscortRequirement(hostiles);
  if (requirement.guards === 0 && requirement.rangers === 0) return true;
  const current = getTestCurrentDefenders(room);
  return current.guards >= requirement.guards && current.rangers >= requirement.rangers;
}

function getTestDefenderPriorityBoost(room, swarm, role) {
  const needs = analyzeTestDefenderNeeds(room);
  const current = getTestCurrentDefenders(room);
  if (role === 'guard' && current.guards < needs.guards) return 100 * needs.urgency;
  if (role === 'ranger' && current.rangers < needs.rangers) return 100 * needs.urgency;
  if (role === 'healer' && current.healers < needs.healers) return 100 * needs.urgency;
  return 0;
}

function needsTestEmergencyDefenders(room, swarm = {}) {
  const needs = analyzeTestDefenderNeeds(room);
  const current = getTestCurrentDefenders(room);
  return ((needs.guards > 0 && current.guards === 0) || (needs.rangers > 0 && current.rangers === 0)) && (needs.urgency >= 2.0 || (swarm.danger ?? 0) >= 3);
}

function needsTestDefenseAssistance(room, swarm = {}) {
  const needs = analyzeTestDefenderNeeds(room);
  const current = getTestCurrentDefenders(room);
  const deficit = Math.max(0, needs.guards - current.guards) + Math.max(0, needs.rangers - current.rangers) + Math.max(0, needs.healers - current.healers);
  return deficit > 0 && ((swarm.danger ?? 0) >= 2 || getTestHostileCreeps(room).length > 0);
}

function createTestDefenseRequest(room, swarm = {}) {
  if (!needsTestDefenseAssistance(room, swarm)) return null;
  const needs = analyzeTestDefenderNeeds(room);
  const current = getTestCurrentDefenders(room);
  return {
    roomName: room.name,
    guardsNeeded: Math.max(0, needs.guards - current.guards),
    rangersNeeded: Math.max(0, needs.rangers - current.rangers),
    healersNeeded: Math.max(0, needs.healers - current.healers),
    urgency: needs.urgency,
    createdAt: global.Game?.time ?? 0,
    threat: needs.reasons.join('; '),
    assignedCreeps: []
  };
}

// Create comprehensive stub modules for all @bot and @ralphschuler dependencies
const stubs = {
  '@bot/core/logger': {
    logger: {
      log: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {}
    },
    createLogger: (name) => ({
      log: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {}
    })
  },
  
  '@bot/spawning/roleDefinitions': {
    ROLE_DEFINITIONS: {
      harvester: { body: [], priority: 1 },
      hauler: { body: [], priority: 2 },
      upgrader: { body: [], priority: 3 },
      builder: { body: [], priority: 4 },
      defender: { body: [], priority: 5 },
      attacker: { body: [], priority: 6 },
      healer: { body: [], priority: 7 },
      claimer: { body: [], priority: 8 }
    }
  },
  
  '@bot/spawning/defenderManager': {
    DefenseRequest: class {},
    analyzeDefenderNeeds: analyzeTestDefenderNeeds,
    createDefenseRequest: createTestDefenseRequest,
    fulfillDefenseRequest: () => ({}),
    getCurrentDefenders: getTestCurrentDefenders,
    getDefenderPriorityBoost: getTestDefenderPriorityBoost,
    needsDefenseAssistance: needsTestDefenseAssistance,
    needsEmergencyDefenders: needsTestEmergencyDefenders
  },
  
  '@bot/layouts/roadNetworkPlanner': {
    getRoadNetwork: () => ({}),
    planRoadNetwork: () => ({}),
    buildRoadNetwork: () => ({})
  },
  
  '@bot/memory/schemas': {
    SwarmCreepMemory: {},
    RoomMemory: {},
    Memory: {}
  },
  
  '@bot/memory/manager': {
    getMemory: () => ({}),
    setMemory: () => {},
    clearMemory: () => {}
  },
  
  '@bot/core/kernel': {
    ProcessPriority: {
      CRITICAL: 100,
      HIGH: 75,
      MEDIUM: 50,
      LOW: 25,
      IDLE: 10
    },
    kernel: {
      addProcess: () => {},
      removeProcess: () => {},
      getProcess: () => ({}),
      tick: () => {}
    }
  },
  
  '@bot/core/processDecorators': {
    // NOTE: These decorator stubs are minimal no-op implementations.
    // They return the original descriptor/target without modification.
    // If tests depend on actual decorator behavior (e.g., process registration,
    // priority assignment, metadata), those aspects will not be tested.
    // This is acceptable for the current test suite as we primarily test
    // business logic, not decorator infrastructure.
    Process: (config) => (target, propertyKey, descriptor) => descriptor,
    HighFrequencyProcess: (id, name, config) => (target, propertyKey, descriptor) => descriptor,
    MediumFrequencyProcess: (id, name, config) => (target, propertyKey, descriptor) => descriptor,
    LowFrequencyProcess: (id, name, config) => (target, propertyKey, descriptor) => descriptor,
    CriticalProcess: (id, name, config) => (target, propertyKey, descriptor) => descriptor,
    IdleProcess: (id, name, config) => (target, propertyKey, descriptor) => descriptor,
    ProcessClass: () => (target) => target,
    registerDecoratedProcesses: () => {},
    registerAllDecoratedProcesses: () => {}
  },
  
  // Stub @ralphschuler scoped packages
  '@ralphschuler/screeps-defense': {
    NON_AGGRESSION_PACT_PLAYERS: ['TooAngel', 'TedRoastBeef'],
    getConfiguredAllyPlayers: getConfiguredTestAllies,
    getKnownAllyPlayers: (options = {}) => [...new Set(['TooAngel', 'TedRoastBeef', ...getConfiguredTestAllies(options)])],
    isAllyPlayer: isPermanentAllyTestUsername,
    isConfiguredAllyPlayer: (username, options = {}) => typeof username === 'string' && getConfiguredTestAllies(options).includes(username),
    isKnownAllyPlayer: isKnownAllyTestUsername,
    isAllyOwned: isPermanentAllyTestEntity,
    isConfiguredAllyOwned: (entity, options = {}) => typeof entity?.owner?.username === 'string' && getConfiguredTestAllies(options).includes(entity.owner.username),
    isKnownAllyOwned: isAlliedTestEntity,
    isAllyCreep: isPermanentAllyTestEntity,
    isAllyPowerCreep: isPermanentAllyTestEntity,
    isAllyStructure: isPermanentAllyTestEntity,
    isKnownAllyCreep: isAlliedTestEntity,
    isKnownAllyPowerCreep: isAlliedTestEntity,
    isKnownAllyStructure: isAlliedTestEntity,
    filterAllyCreeps: (creeps) => filterPermanentAllyTestEntities(creeps),
    filterAllyPowerCreeps: (powerCreeps) => filterPermanentAllyTestEntities(powerCreeps),
    filterAllyStructures: (structures) => filterPermanentAllyTestEntities(structures),
    filterKnownAllyCreeps: (creeps) => filterAlliedTestEntities(creeps),
    filterKnownAllyPowerCreeps: (powerCreeps) => filterAlliedTestEntities(powerCreeps),
    filterKnownAllyStructures: (structures) => filterAlliedTestEntities(structures),
    getActualHostileCreeps: getTestHostileCreeps,
    hasActiveDefenseThreat: hasTestActiveDefenseThreat,
    getActualHostilePowerCreeps: (room) => room.find(global.FIND_HOSTILE_POWER_CREEPS).filter(powerCreep => !isAlliedTestEntity(powerCreep)),
    getActualHostileStructures: (room) => room.find(global.FIND_HOSTILE_STRUCTURES).filter(structure => !isAlliedTestEntity(structure)),
    getKnownHostileCreeps: getTestHostileCreeps,
    getKnownHostilePowerCreeps: (room) => room.find(global.FIND_HOSTILE_POWER_CREEPS).filter(powerCreep => !isAlliedTestEntity(powerCreep)),
    getKnownHostileStructures: (room) => room.find(global.FIND_HOSTILE_STRUCTURES).filter(structure => !isAlliedTestEntity(structure)),
    hasActualHostiles: (room) => getTestHostileCreeps(room).length > 0,
    hasKnownHostiles: (room) => getTestHostileCreeps(room).length > 0,
    analyzeDefenderNeeds: analyzeTestDefenderNeeds,
    createDefenseRequest: createTestDefenseRequest,
    getCombatEscortRequirement: getTestCombatEscortRequirement,
    getCurrentDefenders: getTestCurrentDefenders,
    getDefenderPriorityBoost: getTestDefenderPriorityBoost,
    hasSufficientCombatEscort: hasTestSufficientCombatEscort,
    needsDefenseAssistance: needsTestDefenseAssistance,
    needsEmergencyDefenders: needsTestEmergencyDefenders,
    addCombatPower: addTestCombatPower,
    analyzeDefenseAssistThreat: analyzeTestDefenseAssistThreat,
    buildDefenseAssistBody: buildTestDefenseAssistBody,
    calculateAggregateDefenseResponsePlan: calculateTestAggregateDefenseResponsePlan,
    calculateCombatPower: calculateTestCombatPower,
    calculateDefenseAssistSquadSize: () => 1,
    calculateThreatParitySquadSize: () => 1,
    emptyCombatPower: emptyTestCombatPower,
    getVisibleDefenseAssistThreatProfile: (roomName) => {
      const room = global.Game.rooms[roomName];
      if (!room) return null;
      return analyzeTestDefenseAssistThreat(room.find(global.FIND_HOSTILE_CREEPS).filter(creep => !isAlliedTestEntity(creep)));
    },
    isDefenseAssistBodyStrongerThanThreat: (parts, threat) => !threat || calculateTestCombatPower(parts).score >= threat.score,
    isDefenseAssistMilitaryRole: (role) => defenseAssistRoles.has(role),
    isDefenseAssistThreatProfileHard: (profile) => Boolean(profile && ((profile.strongest?.partCount ?? 0) >= 25 || (profile.total?.score ?? 0) >= 250)),
    multiplyCombatPower: multiplyTestCombatPower,
    ThreatLevel: {},
    TowerManager: class {},
    RampartManager: class {},
    SafeModeManager: class {},
    DefenseCoordinator: class {}
  },
  
  '@ralphschuler/screeps-pathfinding': {
    PathfindingManager: class {},
    PathCache: class {}
  },
  
  '@ralphschuler/screeps-remote-mining': {
    RemoteMiningManager: class {},
    RemoteHauler: class {}
  },
  
  '@ralphschuler/screeps-spawn': {
    SpawnQueue: class {},
    SpawnManager: class {},
    SpawnPriority: {}
  },
  
  '@ralphschuler/screeps-economy': {
    EconomyManager: class {},
    ResourceDistributor: class {}
  },
  
  '@ralphschuler/screeps-chemistry': {
    LabManager: class {},
    ReactionPlanner: class {}
  },
  
  '@ralphschuler/screeps-kernel': {
    Kernel: class {},
    Process: class {},
    ProcessPriority: {
      CRITICAL: 100,
      HIGH: 75,
      MEDIUM: 50,
      LOW: 25,
      IDLE: 10
    },
    kernel: {
      addProcess: () => {},
      removeProcess: () => {},
      getProcess: () => ({}),
      tick: () => {}
    },
    DEFAULT_ADAPTIVE_CONFIG,
    calculateAdaptiveBudget,
    calculateAdaptiveBudgets,
    calculateBucketMultiplier,
    calculateRoomScalingMultiplier,
    getAdaptiveBudgetInfo,
    getAdaptiveBudgets,
    getCurrentBucket,
    getCurrentRoomCount,
    ProcessClass: () => (target) => target,
    HighFrequencyProcess: () => (_target, _propertyKey, descriptor) => descriptor,
    MediumFrequencyProcess: () => (_target, _propertyKey, descriptor) => descriptor,
    LowFrequencyProcess: () => (_target, _propertyKey, descriptor) => descriptor,
    CriticalProcess: () => (_target, _propertyKey, descriptor) => descriptor,
    IdleProcess: () => (_target, _propertyKey, descriptor) => descriptor,
    registerDecoratedProcesses: () => {}
  },
  
  '@ralphschuler/screeps-core': {
    logger: {
      log: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {}
    },
    createLogger: (name) => ({
      log: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {}
    }),
    DEFAULT_ADAPTIVE_CONFIG,
    calculateAdaptiveBudget,
    calculateAdaptiveBudgets,
    calculateBucketMultiplier,
    calculateRoomScalingMultiplier,
    getAdaptiveBudgetInfo,
    getAdaptiveBudgets,
    getCurrentBucket,
    getCurrentRoomCount,
    NON_AGGRESSION_PACT_PLAYERS: ['TooAngel', 'TedRoastBeef'],
    getConfiguredAllyPlayers: getConfiguredTestAllies,
    getKnownAllyPlayers: (options = {}) => [...new Set(['TooAngel', 'TedRoastBeef', ...getConfiguredTestAllies(options)])],
    isAllyPlayer: isPermanentAllyTestUsername,
    isConfiguredAllyPlayer: (username, options = {}) => typeof username === 'string' && getConfiguredTestAllies(options).includes(username),
    isKnownAllyPlayer: isKnownAllyTestUsername,
    isAllyOwned: isPermanentAllyTestEntity,
    isConfiguredAllyOwned: (entity, options = {}) => typeof entity?.owner?.username === 'string' && getConfiguredTestAllies(options).includes(entity.owner.username),
    isKnownAllyOwned: isAlliedTestEntity,
    isAllyCreep: isPermanentAllyTestEntity,
    isAllyPowerCreep: isPermanentAllyTestEntity,
    isAllyStructure: isPermanentAllyTestEntity,
    isKnownAllyCreep: isAlliedTestEntity,
    isKnownAllyPowerCreep: isAlliedTestEntity,
    isKnownAllyStructure: isAlliedTestEntity,
    filterAllyCreeps: (creeps) => filterPermanentAllyTestEntities(creeps),
    filterAllyPowerCreeps: (powerCreeps) => filterPermanentAllyTestEntities(powerCreeps),
    filterAllyStructures: (structures) => filterPermanentAllyTestEntities(structures),
    filterKnownAllyCreeps: (creeps) => filterAlliedTestEntities(creeps),
    filterKnownAllyPowerCreeps: (powerCreeps) => filterAlliedTestEntities(powerCreeps),
    filterKnownAllyStructures: (structures) => filterAlliedTestEntities(structures),
    getActualHostileCreeps: getTestHostileCreeps,
    getActualHostilePowerCreeps: (room) => room.find(global.FIND_HOSTILE_POWER_CREEPS).filter(powerCreep => !isAlliedTestEntity(powerCreep)),
    getActualHostileStructures: (room) => room.find(global.FIND_HOSTILE_STRUCTURES).filter(structure => !isAlliedTestEntity(structure)),
    getKnownHostileCreeps: getTestHostileCreeps,
    getKnownHostilePowerCreeps: (room) => room.find(global.FIND_HOSTILE_POWER_CREEPS).filter(powerCreep => !isAlliedTestEntity(powerCreep)),
    getKnownHostileStructures: (room) => room.find(global.FIND_HOSTILE_STRUCTURES).filter(structure => !isAlliedTestEntity(structure)),
    hasActualHostiles: (room) => getTestHostileCreeps(room).length > 0,
    hasKnownHostiles: (room) => getTestHostileCreeps(room).length > 0,
    EventBus: class {},
    CommandRegistry: class {},
    CPUBudgetManager: class {}
  },
  
  '@ralphschuler/screeps-stats': {
    StatsCollector: class {},
    StatsManager: class {},
    DEFAULT_ADAPTIVE_CONFIG,
    calculateAdaptiveBudget,
    calculateAdaptiveBudgets,
    calculateBucketMultiplier,
    calculateRoomScalingMultiplier,
    getAdaptiveBudgetInfo,
    getAdaptiveBudgets,
    getCurrentBucket,
    getCurrentRoomCount,
    recordStat: () => {},
    getStat: () => ({})
  }
};

Module._resolveFilename = function(request, parent, isMain) {
  // Stub @bot/* and @ralphschuler/* imports to avoid requiring built packages
  // This prevents unintended side effects if any dependency happens to use the same module names
  if ((request.startsWith('@bot/') || request.startsWith('@ralphschuler/')) && stubs[request]) {
    // Cache the stub module if not already cached
    if (!Module._cache[request]) {
      Module._cache[request] = {
        exports: stubs[request],
        loaded: true,
        id: request
      };
    }
    return request;
  }
  
  return originalResolveFilename.call(this, request, parent, isMain);
};

// Mock Screeps constants
global.STRUCTURE_SPAWN = 'spawn';
global.STRUCTURE_EXTENSION = 'extension';
global.STRUCTURE_ROAD = 'road';
global.STRUCTURE_WALL = 'constructedWall';
global.STRUCTURE_RAMPART = 'rampart';
global.STRUCTURE_KEEPER_LAIR = 'keeperLair';
global.STRUCTURE_PORTAL = 'portal';
global.STRUCTURE_CONTROLLER = 'controller';
global.STRUCTURE_LINK = 'link';
global.STRUCTURE_STORAGE = 'storage';
global.STRUCTURE_TOWER = 'tower';
global.STRUCTURE_OBSERVER = 'observer';
global.STRUCTURE_POWER_BANK = 'powerBank';
global.STRUCTURE_POWER_SPAWN = 'powerSpawn';
global.STRUCTURE_EXTRACTOR = 'extractor';
global.STRUCTURE_LAB = 'lab';
global.STRUCTURE_TERMINAL = 'terminal';
global.STRUCTURE_CONTAINER = 'container';
global.STRUCTURE_NUKER = 'nuker';
global.STRUCTURE_FACTORY = 'factory';
global.STRUCTURE_INVADER_CORE = 'invaderCore';

// Mock Screeps result codes
global.OK = 0;
global.ERR_NOT_OWNER = -1;
global.ERR_NO_PATH = -2;
global.ERR_NAME_EXISTS = -3;
global.ERR_BUSY = -4;
global.ERR_NOT_FOUND = -5;
global.ERR_NOT_ENOUGH_ENERGY = -6;
global.ERR_NOT_ENOUGH_RESOURCES = -6;
global.ERR_INVALID_TARGET = -7;
global.ERR_FULL = -8;
global.ERR_NOT_IN_RANGE = -9;
global.ERR_INVALID_ARGS = -10;
global.ERR_TIRED = -11;
global.ERR_NO_BODYPART = -12;
global.ERR_NOT_ENOUGH_EXTENSIONS = -6;
global.ERR_RCL_NOT_ENOUGH = -14;
global.ERR_GCL_NOT_ENOUGH = -15;

// Mock FIND constants
global.FIND_EXIT_TOP = 1;
global.FIND_EXIT_RIGHT = 3;
global.FIND_EXIT_BOTTOM = 5;
global.FIND_EXIT_LEFT = 7;
global.FIND_EXIT = 10;
global.FIND_CREEPS = 101;
global.FIND_MY_CREEPS = 102;
global.FIND_HOSTILE_CREEPS = 103;
global.FIND_SOURCES_ACTIVE = 104;
global.FIND_SOURCES = 105;
global.FIND_DROPPED_RESOURCES = 106;
global.FIND_STRUCTURES = 107;
global.FIND_MY_STRUCTURES = 108;
global.FIND_HOSTILE_STRUCTURES = 109;
global.FIND_FLAGS = 110;
global.FIND_CONSTRUCTION_SITES = 111;
global.FIND_MY_SPAWNS = 112;
global.FIND_HOSTILE_SPAWNS = 113;
global.FIND_MY_CONSTRUCTION_SITES = 114;
global.FIND_HOSTILE_CONSTRUCTION_SITES = 115;
global.FIND_MINERALS = 116;
global.FIND_NUKES = 117;
global.FIND_TOMBSTONES = 118;
global.FIND_POWER_CREEPS = 119;
global.FIND_MY_POWER_CREEPS = 120;
global.FIND_HOSTILE_POWER_CREEPS = 121;
global.FIND_DEPOSITS = 122;
global.FIND_RUINS = 123;

// Mock LOOK constants
global.LOOK_CREEPS = 'creep';
global.LOOK_ENERGY = 'energy';
global.LOOK_RESOURCES = 'resource';
global.LOOK_SOURCES = 'source';
global.LOOK_MINERALS = 'mineral';
global.LOOK_DEPOSITS = 'deposit';
global.LOOK_STRUCTURES = 'structure';
global.LOOK_FLAGS = 'flag';
global.LOOK_CONSTRUCTION_SITES = 'constructionSite';
global.LOOK_NUKES = 'nuke';
global.LOOK_TERRAIN = 'terrain';
global.LOOK_TOMBSTONES = 'tombstone';
global.LOOK_POWER_CREEPS = 'powerCreep';
global.LOOK_RUINS = 'ruin';

// Mock terrain constants
global.TERRAIN_MASK_WALL = 1;
global.TERRAIN_MASK_SWAMP = 2;
global.TERRAIN_MASK_LAVA = 4;

// Mock resource types
global.RESOURCE_ENERGY = 'energy';
global.RESOURCE_POWER = 'power';
global.RESOURCE_HYDROGEN = 'H';
global.RESOURCE_OXYGEN = 'O';
global.RESOURCE_UTRIUM = 'U';
global.RESOURCE_LEMERGIUM = 'L';
global.RESOURCE_KEANIUM = 'K';
global.RESOURCE_ZYNTHIUM = 'Z';
global.RESOURCE_CATALYST = 'X';
global.RESOURCE_GHODIUM = 'G';

// Tier 1 compounds
global.RESOURCE_HYDROXIDE = 'OH';
global.RESOURCE_ZYNTHIUM_KEANITE = 'ZK';
global.RESOURCE_UTRIUM_LEMERGITE = 'UL';
global.RESOURCE_GHODIUM = 'G';

// Tier 2 compounds  
global.RESOURCE_UTRIUM_HYDRIDE = 'UH';
global.RESOURCE_UTRIUM_OXIDE = 'UO';
global.RESOURCE_KEANIUM_HYDRIDE = 'KH';
global.RESOURCE_KEANIUM_OXIDE = 'KO';
global.RESOURCE_LEMERGIUM_HYDRIDE = 'LH';
global.RESOURCE_LEMERGIUM_OXIDE = 'LO';
global.RESOURCE_ZYNTHIUM_HYDRIDE = 'ZH';
global.RESOURCE_ZYNTHIUM_OXIDE = 'ZO';
global.RESOURCE_GHODIUM_HYDRIDE = 'GH';
global.RESOURCE_GHODIUM_OXIDE = 'GO';

// Tier 3 compounds
global.RESOURCE_UTRIUM_ACID = 'UH2O';
global.RESOURCE_UTRIUM_ALKALIDE = 'UHO2';
global.RESOURCE_KEANIUM_ACID = 'KH2O';
global.RESOURCE_KEANIUM_ALKALIDE = 'KHO2';
global.RESOURCE_LEMERGIUM_ACID = 'LH2O';
global.RESOURCE_LEMERGIUM_ALKALIDE = 'LHO2';
global.RESOURCE_ZYNTHIUM_ACID = 'ZH2O';
global.RESOURCE_ZYNTHIUM_ALKALIDE = 'ZHO2';
global.RESOURCE_GHODIUM_ACID = 'GH2O';
global.RESOURCE_GHODIUM_ALKALIDE = 'GHO2';

// Commodities
global.RESOURCE_CATALYZED_UTRIUM_ACID = 'XUH2O';
global.RESOURCE_CATALYZED_UTRIUM_ALKALIDE = 'XUHO2';
global.RESOURCE_CATALYZED_KEANIUM_ACID = 'XKH2O';
global.RESOURCE_CATALYZED_KEANIUM_ALKALIDE = 'XKHO2';
global.RESOURCE_CATALYZED_LEMERGIUM_ACID = 'XLH2O';
global.RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE = 'XLHO2';
global.RESOURCE_CATALYZED_ZYNTHIUM_ACID = 'XZH2O';
global.RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE = 'XZHO2';
global.RESOURCE_CATALYZED_GHODIUM_ACID = 'XGH2O';
global.RESOURCE_CATALYZED_GHODIUM_ALKALIDE = 'XGHO2';

// Other resources
global.RESOURCE_OPS = 'ops';
global.RESOURCE_UTRIUM_BAR = 'utrium_bar';
global.RESOURCE_LEMERGIUM_BAR = 'lemergium_bar';
global.RESOURCE_ZYNTHIUM_BAR = 'zynthium_bar';
global.RESOURCE_KEANIUM_BAR = 'keanium_bar';
global.RESOURCE_GHODIUM_MELT = 'ghodium_melt';
global.RESOURCE_OXIDANT = 'oxidant';
global.RESOURCE_REDUCTANT = 'reductant';
global.RESOURCE_PURIFIER = 'purifier';
global.RESOURCE_BATTERY = 'battery';
global.RESOURCE_COMPOSITE = 'composite';
global.RESOURCE_CRYSTAL = 'crystal';
global.RESOURCE_LIQUID = 'liquid';
global.RESOURCE_WIRE = 'wire';
global.RESOURCE_SWITCH = 'switch';
global.RESOURCE_TRANSISTOR = 'transistor';
global.RESOURCE_MICROCHIP = 'microchip';
global.RESOURCE_CIRCUIT = 'circuit';
global.RESOURCE_DEVICE = 'device';
global.RESOURCE_CELL = 'cell';
global.RESOURCE_PHLEGM = 'phlegm';
global.RESOURCE_TISSUE = 'tissue';
global.RESOURCE_MUSCLE = 'muscle';
global.RESOURCE_ORGANOID = 'organoid';
global.RESOURCE_ORGANISM = 'organism';
global.RESOURCE_ALLOY = 'alloy';
global.RESOURCE_TUBE = 'tube';
global.RESOURCE_FIXTURES = 'fixtures';
global.RESOURCE_FRAME = 'frame';
global.RESOURCE_HYDRAULICS = 'hydraulics';
global.RESOURCE_MACHINE = 'machine';
global.RESOURCE_CONDENSATE = 'condensate';
global.RESOURCE_CONCENTRATE = 'concentrate';
global.RESOURCE_EXTRACT = 'extract';
global.RESOURCE_SPIRIT = 'spirit';
global.RESOURCE_EMANATION = 'emanation';
global.RESOURCE_ESSENCE = 'essence';

// Deposit resources
global.RESOURCE_MIST = 'mist';
global.RESOURCE_BIOMASS = 'biomass';
global.RESOURCE_METAL = 'metal';
global.RESOURCE_SILICON = 'silicon';

// Mock body part constants
global.MOVE = 'move';
global.WORK = 'work';
global.CARRY = 'carry';
global.ATTACK = 'attack';
global.RANGED_ATTACK = 'ranged_attack';
global.TOUGH = 'tough';
global.HEAL = 'heal';
global.CLAIM = 'claim';

// Mock game mode constants
global.MODE_SIMULATION = 'simulation';
global.MODE_WORLD = 'world';

// Mock direction constants
global.TOP = 1;
global.TOP_RIGHT = 2;
global.RIGHT = 3;
global.BOTTOM_RIGHT = 4;
global.BOTTOM = 5;
global.BOTTOM_LEFT = 6;
global.LEFT = 7;
global.TOP_LEFT = 8;

// Mock color constants
global.COLOR_RED = 1;
global.COLOR_PURPLE = 2;
global.COLOR_BLUE = 3;
global.COLOR_CYAN = 4;
global.COLOR_GREEN = 5;
global.COLOR_YELLOW = 6;
global.COLOR_ORANGE = 7;
global.COLOR_BROWN = 8;
global.COLOR_GREY = 9;
global.COLOR_WHITE = 10;

// Mock other useful constants
global.CREEP_LIFE_TIME = 1500;
global.CREEP_CLAIM_LIFE_TIME = 600;
global.CREEP_CORPSE_RATE = 0.2;
global.CREEP_SPAWN_TIME = 3;
global.OBSTACLE_OBJECT_TYPES = ['spawn', 'creep', 'wall', 'source', 'constructedWall', 'extension', 'link', 'storage', 'tower', 'observer', 'powerSpawn', 'powerBank', 'lab', 'terminal', 'nuker', 'factory', 'invaderCore'];
global.BODYPART_COST = {
  move: 50,
  work: 100,
  attack: 80,
  carry: 50,
  heal: 250,
  ranged_attack: 150,
  tough: 10,
  claim: 600
};

// CPU and pixel constants
global.PIXEL_CPU_COST = 10000;
global.CPU_POWER_CREDIT_COST = 0.01;

// Structure constants
global.SPAWN_ENERGY_CAPACITY = 300;
global.SPAWN_ENERGY_START = 300;
global.SPAWN_HITS = 5000;
global.STORAGE_CAPACITY = 1000000;
global.STORAGE_HITS = 10000;
global.TERMINAL_CAPACITY = 300000;
global.TERMINAL_HITS = 3000;
global.LINK_CAPACITY = 800;
global.LINK_COOLDOWN = 1;
global.LINK_LOSS_RATIO = 0.03;
global.LINK_HITS = 1000;
global.LINK_HITS_MAX = 1000;
global.TOWER_CAPACITY = 1000;
global.TOWER_HITS = 3000;
global.TOWER_ENERGY_COST = 10;
global.TOWER_POWER_ATTACK = 600;
global.TOWER_POWER_HEAL = 400;
global.TOWER_POWER_REPAIR = 800;
global.TOWER_OPTIMAL_RANGE = 5;
global.TOWER_FALLOFF_RANGE = 20;
global.TOWER_FALLOFF = 0.75;
global.LAB_HITS = 500;
global.LAB_MINERAL_CAPACITY = 3000;
global.LAB_ENERGY_CAPACITY = 2000;
global.LAB_BOOST_ENERGY = 20;
global.LAB_BOOST_MINERAL = 30;
global.LAB_COOLDOWN = 10;
global.LAB_REACTION_AMOUNT = 5;
global.NUKER_HITS = 1000;
global.NUKER_COOLDOWN = 100000;
global.NUKER_ENERGY_CAPACITY = 300000;
global.NUKER_GHODIUM_CAPACITY = 5000;
global.NUKE_LAND_TIME = 50000;
global.NUKE_RANGE = 2;
global.NUKE_DAMAGE = {
  0: 10000000,
  2: 5000000
};
global.FACTORY_HITS = 1000;
global.FACTORY_CAPACITY = 50000;
global.POWER_SPAWN_HITS = 5000;
global.POWER_SPAWN_ENERGY_CAPACITY = 5000;
global.POWER_SPAWN_POWER_CAPACITY = 100;
global.POWER_SPAWN_ENERGY_RATIO = 50;
global.EXTRACTOR_HITS = 500;
global.EXTRACTOR_COOLDOWN = 5;
global.OBSERVER_HITS = 500;
global.OBSERVER_RANGE = 10;
global.EXTENSION_HITS = 1000;
global.EXTENSION_ENERGY_CAPACITY = { 0: 50, 1: 50, 2: 50, 3: 50, 4: 50, 5: 50, 6: 50, 7: 100, 8: 200 };
global.ROAD_HITS = 5000;
global.ROAD_WEAROUT = 1;
global.ROAD_DECAY_AMOUNT = 100;
global.ROAD_DECAY_TIME = 1000;
global.CONTAINER_HITS = 250000;
global.CONTAINER_CAPACITY = 2000;
global.CONTAINER_DECAY = 5000;
global.CONTAINER_DECAY_TIME = 100;
global.CONTAINER_DECAY_TIME_OWNED = 500;
global.RAMPART_HITS = 1;
global.RAMPART_HITS_MAX = { 2: 300000, 3: 1000000, 4: 3000000, 5: 10000000, 6: 30000000, 7: 100000000, 8: 300000000 };
global.RAMPART_DECAY_AMOUNT = 300;
global.RAMPART_DECAY_TIME = 100;
global.WALL_HITS = 1;
global.WALL_HITS_MAX = 300000000;
global.REPAIR_COST = 0.01;
global.REPAIR_POWER = 100;

// Energy and source constants
global.ENERGY_REGEN_TIME = 300;
global.ENERGY_DECAY = 1000;
global.SOURCE_ENERGY_CAPACITY = 3000;
global.SOURCE_ENERGY_NEUTRAL_CAPACITY = 1500;
global.SOURCE_ENERGY_KEEPER_CAPACITY = 4000;

// Power constants
global.POWER_BANK_HITS = 2000000;
global.POWER_BANK_CAPACITY_MAX = 5000;
global.POWER_BANK_CAPACITY_MIN = 500;
global.POWER_BANK_CAPACITY_CRIT = 0.3;
global.POWER_BANK_DECAY = 5000;
global.POWER_BANK_HIT_BACK = 0.5;

// Controller constants
global.CONTROLLER_LEVELS = { 1: 200, 2: 45000, 3: 135000, 4: 405000, 5: 1215000, 6: 3645000, 7: 10935000, 8: 0 };
global.CONTROLLER_DOWNGRADE = { 1: 20000, 2: 10000, 3: 20000, 4: 40000, 5: 80000, 6: 120000, 7: 150000, 8: 200000 };
global.CONTROLLER_CLAIM_DOWNGRADE = 300;
global.CONTROLLER_RESERVE = 1;
global.CONTROLLER_RESERVE_MAX = 5000;
global.CONTROLLER_MAX_UPGRADE_PER_TICK = 15;
global.CONTROLLER_ATTACK_BLOCKED_UPGRADE = 1000;
global.CONTROLLER_NUKE_BLOCKED_UPGRADE = 200;

// Safe mode constants
global.SAFE_MODE_DURATION = 20000;
global.SAFE_MODE_COOLDOWN = 50000;
global.SAFE_MODE_COST = 1000;

// Market constants
global.MARKET_FEE = 0.05;
global.MAX_MARKET_ORDERS = 300;
global.MAX_CREEP_SIZE = 50;
global.ORDER_BUY = 'buy';
global.ORDER_SELL = 'sell';
global.PIXEL = 'pixel';
global.CPU_UNLOCK = 'cpuUnlock';
global.SUBSCRIPTION_TOKEN = 'token';
global.ACCESS_KEY = 'accessKey';

// Mock InterShardMemory
global.InterShardMemory = {
  getLocal: () => null,
  setLocal: () => undefined,
  getRemote: () => null
};

// Mock power constants
global.PWR_GENERATE_OPS = 1;
global.PWR_OPERATE_SPAWN = 2;
global.PWR_OPERATE_TOWER = 3;
global.PWR_OPERATE_STORAGE = 4;
global.PWR_OPERATE_LAB = 5;
global.PWR_OPERATE_EXTENSION = 6;
global.PWR_OPERATE_OBSERVER = 7;
global.PWR_OPERATE_TERMINAL = 8;
global.PWR_DISRUPT_SPAWN = 9;
global.PWR_DISRUPT_TOWER = 10;
global.PWR_DISRUPT_SOURCE = 11;
global.PWR_SHIELD = 12;
global.PWR_REGEN_SOURCE = 13;
global.PWR_REGEN_MINERAL = 14;
global.PWR_DISRUPT_TERMINAL = 15;
global.PWR_OPERATE_POWER = 16;
global.PWR_FORTIFY = 17;
global.PWR_OPERATE_CONTROLLER = 18;
global.PWR_OPERATE_FACTORY = 19;

// Mock RawMemory
global.RawMemory = {
  get: function() { return JSON.stringify(global.Memory); },
  set: function(value) { global.Memory = JSON.parse(value); },
  setActiveSegments: function() { return undefined; },
  segments: {},
  foreignSegment: undefined,
  setActiveForeignSegment: function() { return undefined; },
  setDefaultPublicSegment: function() { return undefined; },
  setPublicSegments: function() { return undefined; }
};

// Mock PathFinder
global.PathFinder = {
  search: () => ({ path: [], ops: 0, cost: 0, incomplete: false }),
  CostMatrix: class {
    _bits = new Uint8Array(2500);
    set(x, y, val) { this._bits[x * 50 + y] = val; }
    get(x, y) { return this._bits[x * 50 + y]; }
    clone() { const m = new global.PathFinder.CostMatrix(); m._bits = new Uint8Array(this._bits); return m; }
    serialize() { return Array.from(this._bits); }
    static deserialize(data) { const m = new global.PathFinder.CostMatrix(); m._bits = new Uint8Array(data); return m; }
  }
};

// Mock RoomPosition
global.RoomPosition = class RoomPosition {
  constructor(x, y, roomName) {
    this.x = x;
    this.y = y;
    this.roomName = roomName;
  }
  isEqualTo(target) {
    return this.x === target.x && this.y === target.y && this.roomName === target.roomName;
  }
  isNearTo(target) {
    if (this.roomName !== target.roomName) return false;
    return Math.abs(this.x - target.x) <= 1 && Math.abs(this.y - target.y) <= 1;
  }
  getRangeTo(target) {
    if (this.roomName !== target.roomName) return Infinity;
    return Math.max(Math.abs(this.x - target.x), Math.abs(this.y - target.y));
  }
  getDirectionTo(target) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    if (dx > 0) {
      if (dy > 0) return BOTTOM_RIGHT;
      if (dy < 0) return TOP_RIGHT;
      return RIGHT;
    }
    if (dx < 0) {
      if (dy > 0) return BOTTOM_LEFT;
      if (dy < 0) return TOP_LEFT;
      return LEFT;
    }
    if (dy > 0) return BOTTOM;
    if (dy < 0) return TOP;
    return 0;
  }
  findPathTo() { return []; }
  findClosestByPath() { return null; }
  findClosestByRange() { return null; }
  findInRange() { return []; }
  look() { return []; }
  lookFor() { return []; }
  createFlag() { return ''; }
  createConstructionSite() { return OK; }
};

// Mock Creep class
global.Creep = class Creep {
  constructor() {
    this.memory = {};
    this.spawning = false;
  }
  moveTo() { return OK; }
  move() { return OK; }
  harvest() { return OK; }
  transfer() { return OK; }
  withdraw() { return OK; }
  pickup() { return OK; }
  drop() { return OK; }
  build() { return OK; }
  repair() { return OK; }
  attack() { return OK; }
  rangedAttack() { return OK; }
  heal() { return OK; }
  upgradeController() { return OK; }
  dismantle() { return OK; }
  say() { return OK; }
  suicide() { return OK; }
};

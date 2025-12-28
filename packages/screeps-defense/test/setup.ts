/**
 * Test Setup - Define Screeps Global Constants and Module Stubs
 * 
 * This file sets up the global Screeps constants and @bot/* module stubs required for testing.
 */

// Define global Screeps constants as they would be in the game environment
(global as any).OK = 0;
(global as any).ERR_NOT_OWNER = -1;
(global as any).ERR_NO_PATH = -2;
(global as any).ERR_NAME_EXISTS = -3;
(global as any).ERR_BUSY = -4;
(global as any).ERR_NOT_FOUND = -5;
(global as any).ERR_NOT_ENOUGH_ENERGY = -6;
(global as any).ERR_INVALID_TARGET = -7;
(global as any).ERR_FULL = -8;
(global as any).ERR_NOT_IN_RANGE = -9;
(global as any).ERR_INVALID_ARGS = -10;
(global as any).ERR_TIRED = -11;
(global as any).ERR_NO_BODYPART = -12;
(global as any).ERR_RCL_NOT_ENOUGH = -14;
(global as any).ERR_GCL_NOT_ENOUGH = -15;

// Body part constants
(global as any).MOVE = 'move' as BodyPartConstant;
(global as any).WORK = 'work' as BodyPartConstant;
(global as any).CARRY = 'carry' as BodyPartConstant;
(global as any).ATTACK = 'attack' as BodyPartConstant;
(global as any).RANGED_ATTACK = 'ranged_attack' as BodyPartConstant;
(global as any).TOUGH = 'tough' as BodyPartConstant;
(global as any).HEAL = 'heal' as BodyPartConstant;
(global as any).CLAIM = 'claim' as BodyPartConstant;

// Structure type constants
(global as any).STRUCTURE_SPAWN = 'spawn';
(global as any).STRUCTURE_EXTENSION = 'extension';
(global as any).STRUCTURE_ROAD = 'road';
(global as any).STRUCTURE_WALL = 'constructedWall';
(global as any).STRUCTURE_RAMPART = 'rampart';
(global as any).STRUCTURE_KEEPER_LAIR = 'keeperLair';
(global as any).STRUCTURE_PORTAL = 'portal';
(global as any).STRUCTURE_CONTROLLER = 'controller';
(global as any).STRUCTURE_LINK = 'link';
(global as any).STRUCTURE_STORAGE = 'storage';
(global as any).STRUCTURE_TOWER = 'tower';
(global as any).STRUCTURE_OBSERVER = 'observer';
(global as any).STRUCTURE_POWER_BANK = 'powerBank';
(global as any).STRUCTURE_POWER_SPAWN = 'powerSpawn';
(global as any).STRUCTURE_EXTRACTOR = 'extractor';
(global as any).STRUCTURE_LAB = 'lab';
(global as any).STRUCTURE_TERMINAL = 'terminal';
(global as any).STRUCTURE_CONTAINER = 'container';
(global as any).STRUCTURE_NUKER = 'nuker';
(global as any).STRUCTURE_FACTORY = 'factory';
(global as any).STRUCTURE_INVADER_CORE = 'invaderCore';

// FIND constants
(global as any).FIND_STRUCTURES = 107;
(global as any).FIND_MY_STRUCTURES = 108;
(global as any).FIND_HOSTILE_STRUCTURES = 109;
(global as any).FIND_MY_SPAWNS = 112;
(global as any).FIND_HOSTILE_SPAWNS = 113;
(global as any).FIND_CREEPS = 101;
(global as any).FIND_MY_CREEPS = 102;
(global as any).FIND_HOSTILE_CREEPS = 103;
(global as any).FIND_SOURCES = 105;
(global as any).FIND_DROPPED_RESOURCES = 106;

// Game object mock
(global as any).Game = {
  time: 1000,
  rooms: {},
  creeps: {},
  spawns: {},
  structures: {}
};

// Module resolution for @bot/* imports
// This allows the defense package to import from the bot package during testing
const Module = require('module');
const originalResolveFilename = Module._resolveFilename;

// Create stub modules for all @bot dependencies used by this package
const stubs: Record<string, any> = {
  '@bot/core/logger': {
    logger: {
      log: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {}
    },
    createLogger: (name: string) => ({
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
    createDefenseRequest: () => ({}),
    fulfillDefenseRequest: () => ({})
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
    memoryManager: {
      getMemory: () => ({}),
      setMemory: () => {},
      clearMemory: () => {}
    }
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
    Process: (config: any) => (target: any, propertyKey: any, descriptor: any) => descriptor,
    HighFrequencyProcess: (id: any, name: any, config: any) => (target: any, propertyKey: any, descriptor: any) => descriptor,
    MediumFrequencyProcess: (id: any, name: any, config: any) => (target: any, propertyKey: any, descriptor: any) => descriptor,
    LowFrequencyProcess: (id: any, name: any, config: any) => (target: any, propertyKey: any, descriptor: any) => descriptor,
    CriticalProcess: (id: any, name: any, config: any) => (target: any, propertyKey: any, descriptor: any) => descriptor,
    IdleProcess: (id: any, name: any, config: any) => (target: any, propertyKey: any, descriptor: any) => descriptor,
    ProcessClass: () => (target: any) => target,
    registerDecoratedProcesses: () => {},
    registerAllDecoratedProcesses: () => {}
  }
};

Module._resolveFilename = function(request: string, parent: any, isMain: boolean) {
  // Only stub @bot/* imports to avoid affecting other modules
  if (request.startsWith('@bot/') && stubs[request]) {
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


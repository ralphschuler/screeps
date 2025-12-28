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

// Game object mock
(global as any).Game = {
  time: 1000,
  rooms: {},
  creeps: {},
  spawns: {},
  structures: {}
};

// Module resolution for @bot/* imports
// This allows the economy package to import from the bot package during testing
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
      builder: { body: [], priority: 4 }
    }
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


/**
 * Test Setup for Utils Package
 */

// Define global Screeps constants
(global as any).OK = 0;
(global as any).ERR_NOT_IN_RANGE = -9;
(global as any).ERR_INVALID_TARGET = -7;

// Structure constants
(global as any).STRUCTURE_SPAWN = 'spawn' as StructureConstant;
(global as any).STRUCTURE_EXTENSION = 'extension' as StructureConstant;
(global as any).STRUCTURE_TOWER = 'tower' as StructureConstant;
(global as any).STRUCTURE_CONTAINER = 'container' as StructureConstant;

// Find constants
(global as any).FIND_MY_CREEPS = 101;
(global as any).FIND_MY_SPAWNS = 102;
(global as any).FIND_STRUCTURES = 107;
(global as any).FIND_SOURCES = 105;

// Body part constants
(global as any).MOVE = 'move' as BodyPartConstant;
(global as any).WORK = 'work' as BodyPartConstant;
(global as any).CARRY = 'carry' as BodyPartConstant;
(global as any).ATTACK = 'attack' as BodyPartConstant;

// Game object mock
(global as any).Game = {
  time: 1000,
  cpu: {
    getUsed: () => 0,
    limit: 20,
    bucket: 10000
  },
  rooms: {},
  creeps: {},
  spawns: {},
  structures: {}
};

// Memory mock
(global as any).Memory = {
  stats: {},
  rooms: {},
  creeps: {}
};

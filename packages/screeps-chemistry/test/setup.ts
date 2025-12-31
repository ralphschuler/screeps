/**
 * Test Setup - Define Screeps Global Constants for Chemistry Tests
 */

// Define global Screeps constants
(global as any).OK = 0;
(global as any).ERR_NOT_OWNER = -1;
(global as any).ERR_NOT_FOUND = -5;
(global as any).ERR_NOT_ENOUGH_RESOURCES = -6;
(global as any).ERR_INVALID_TARGET = -7;
(global as any).ERR_FULL = -8;
(global as any).ERR_NOT_IN_RANGE = -9;
(global as any).ERR_INVALID_ARGS = -10;
(global as any).ERR_TIRED = -11;
(global as any).ERR_NO_BODYPART = -12;
(global as any).ERR_RCL_NOT_ENOUGH = -14;

// Resource constants
(global as any).RESOURCE_ENERGY = 'energy' as ResourceConstant;
(global as any).RESOURCE_HYDROGEN = 'H' as ResourceConstant;
(global as any).RESOURCE_OXYGEN = 'O' as ResourceConstant;
(global as any).RESOURCE_UTRIUM = 'U' as ResourceConstant;
(global as any).RESOURCE_LEMERGIUM = 'L' as ResourceConstant;
(global as any).RESOURCE_KEANIUM = 'K' as ResourceConstant;
(global as any).RESOURCE_ZYNTHIUM = 'Z' as ResourceConstant;
(global as any).RESOURCE_CATALYST = 'X' as ResourceConstant;
(global as any).RESOURCE_GHODIUM = 'G' as ResourceConstant;

// Compound constants
(global as any).RESOURCE_HYDROXIDE = 'OH' as ResourceConstant;
(global as any).RESOURCE_ZYNTHIUM_KEANITE = 'ZK' as ResourceConstant;
(global as any).RESOURCE_UTRIUM_LEMERGITE = 'UL' as ResourceConstant;
(global as any).RESOURCE_GHODIUM_HYDRIDE = 'GH' as ResourceConstant;
(global as any).RESOURCE_GHODIUM_OXIDE = 'GO' as ResourceConstant;
(global as any).RESOURCE_GHODIUM_ACID = 'GH2O' as ResourceConstant;
(global as any).RESOURCE_GHODIUM_ALKALIDE = 'GHO2' as ResourceConstant;

// Structure constants
(global as any).STRUCTURE_LAB = 'lab' as StructureConstant;

// Find constants
(global as any).FIND_MY_STRUCTURES = 104;
(global as any).FIND_STRUCTURES = 107;

// Game object mock
(global as any).Game = {
  time: 1000,
  rooms: {},
  spawns: {},
  structures: {}
};

// Memory mock
(global as any).Memory = {
  rooms: {},
  creeps: {}
};

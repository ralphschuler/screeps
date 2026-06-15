/**
 * Test Setup - Define Screeps Global Constants
 * 
 * This file sets up the global Screeps constants required for testing.
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

// Find constants used by spawn planner tests.
// Keep these aligned with canonical values from @types/screeps.
(global as any).FIND_CREEPS = 101;
(global as any).FIND_MY_CREEPS = 102;
(global as any).FIND_HOSTILE_CREEPS = 103;
(global as any).FIND_SOURCES_ACTIVE = 104;
(global as any).FIND_SOURCES = 105;
(global as any).FIND_DROPPED_RESOURCES = 106;
(global as any).FIND_STRUCTURES = 107;
(global as any).FIND_MY_STRUCTURES = 108;
(global as any).FIND_HOSTILE_STRUCTURES = 109;
(global as any).FIND_FLAGS = 110;
(global as any).FIND_CONSTRUCTION_SITES = 111;
(global as any).FIND_MY_SPAWNS = 112;
(global as any).FIND_HOSTILE_SPAWNS = 113;
(global as any).FIND_MY_CONSTRUCTION_SITES = 114;
(global as any).FIND_HOSTILE_CONSTRUCTION_SITES = 115;
(global as any).FIND_MINERALS = 116;
(global as any).FIND_NUKES = 117;
(global as any).FIND_TOMBSTONES = 118;
(global as any).FIND_POWER_CREEPS = 119;
(global as any).FIND_MY_POWER_CREEPS = 120;
(global as any).FIND_HOSTILE_POWER_CREEPS = 121;
(global as any).FIND_DEPOSITS = 122;
(global as any).FIND_RUINS = 123;
(global as any).FIND_EXIT_TOP = 1;
(global as any).FIND_EXIT_RIGHT = 3;
(global as any).FIND_EXIT_BOTTOM = 5;
(global as any).FIND_EXIT_LEFT = 7;
(global as any).FIND_EXIT = 10;

// Look constants used by defense package imports
(global as any).LOOK_STRUCTURES = 'structure';
(global as any).LOOK_CONSTRUCTION_SITES = 'constructionSite';

// Direction constants used by defense package imports
(global as any).TOP = 1;
(global as any).RIGHT = 3;
(global as any).BOTTOM = 5;
(global as any).LEFT = 7;

// Structure constants used by defender analysis
(global as any).STRUCTURE_SPAWN = 'spawn';
(global as any).STRUCTURE_STORAGE = 'storage';
(global as any).STRUCTURE_TERMINAL = 'terminal';
(global as any).STRUCTURE_EXTRACTOR = 'extractor';
(global as any).STRUCTURE_LAB = 'lab';
(global as any).STRUCTURE_FACTORY = 'factory';
(global as any).STRUCTURE_TOWER = 'tower';
(global as any).STRUCTURE_POWER_SPAWN = 'powerSpawn';
(global as any).STRUCTURE_NUKER = 'nuker';
(global as any).STRUCTURE_OBSERVER = 'observer';
(global as any).STRUCTURE_RAMPART = 'rampart';
(global as any).STRUCTURE_WALL = 'constructedWall';
(global as any).STRUCTURE_EXTENSION = 'extension';
(global as any).STRUCTURE_ROAD = 'road';
(global as any).STRUCTURE_CONTAINER = 'container';
(global as any).STRUCTURE_LINK = 'link';

// Resource constants used by role/request definitions
(global as any).RESOURCE_ENERGY = 'energy';
(global as any).RESOURCE_POWER = 'power';
(global as any).RESOURCE_HYDROGEN = 'H';
(global as any).RESOURCE_OXYGEN = 'O';
(global as any).RESOURCE_UTRIUM = 'U';
(global as any).RESOURCE_LEMERGIUM = 'L';
(global as any).RESOURCE_KEANIUM = 'K';
(global as any).RESOURCE_ZYNTHIUM = 'Z';
(global as any).RESOURCE_CATALYST = 'X';
(global as any).RESOURCE_GHODIUM = 'G';
(global as any).RESOURCE_BATTERY = 'battery';
(global as any).RESOURCE_UTRIUM_BAR = 'utrium_bar';
(global as any).RESOURCE_LEMERGIUM_BAR = 'lemergium_bar';
(global as any).RESOURCE_ZYNTHIUM_BAR = 'zynthium_bar';
(global as any).RESOURCE_KEANIUM_BAR = 'keanium_bar';
(global as any).RESOURCE_GHODIUM_MELT = 'ghodium_melt';
(global as any).RESOURCE_OXIDANT = 'oxidant';
(global as any).RESOURCE_REDUCTANT = 'reductant';
(global as any).RESOURCE_PURIFIER = 'purifier';
(global as any).RESOURCE_CATALYZED_GHODIUM_ACID = 'XGH2O';
(global as any).RESOURCE_CATALYZED_UTRIUM_ACID = 'XUH2O';
(global as any).RESOURCE_CATALYZED_LEMERGIUM_ACID = 'XLH2O';
(global as any).RESOURCE_CATALYZED_KEANIUM_ACID = 'XKH2O';
(global as any).RESOURCE_CATALYZED_ZYNTHIUM_ACID = 'XZH2O';
(global as any).RESOURCE_OPS = 'ops';

// Game object mock
(global as any).Game = {
  time: 1000,
  rooms: {},
  creeps: {},
  spawns: {},
  structures: {}
};

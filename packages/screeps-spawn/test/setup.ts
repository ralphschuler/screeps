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

// Game object mock
(global as any).Game = {
  time: 1000,
  rooms: {},
  creeps: {},
  spawns: {},
  structures: {}
};

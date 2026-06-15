/**
 * Test setup for pheromone package tests.
 *
 * Provides minimal Screeps constant and runtime globals required by dependencies
 * (notably @ralphschuler/screeps-utils roomFindCache helpers).
 */

import { Game, Memory } from "./mock";

// Find constants
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

// Structure type constants
(global as any).STRUCTURE_SPAWN = "spawn";
(global as any).STRUCTURE_EXTENSION = "extension";
(global as any).STRUCTURE_ROAD = "road";
(global as any).STRUCTURE_WALL = "constructedWall";
(global as any).STRUCTURE_RAMPART = "rampart";
(global as any).STRUCTURE_KEEPER_LAIR = "keeperLair";
(global as any).STRUCTURE_PORTAL = "portal";
(global as any).STRUCTURE_CONTROLLER = "controller";
(global as any).STRUCTURE_LINK = "link";
(global as any).STRUCTURE_STORAGE = "storage";
(global as any).STRUCTURE_TOWER = "tower";
(global as any).STRUCTURE_OBSERVER = "observer";
(global as any).STRUCTURE_POWER_BANK = "powerBank";
(global as any).STRUCTURE_POWER_SPAWN = "powerSpawn";
(global as any).STRUCTURE_EXTRACTOR = "extractor";
(global as any).STRUCTURE_LAB = "lab";
(global as any).STRUCTURE_TERMINAL = "terminal";
(global as any).STRUCTURE_CONTAINER = "container";
(global as any).STRUCTURE_NUKER = "nuker";
(global as any).STRUCTURE_FACTORY = "factory";
(global as any).STRUCTURE_INVADER_CORE = "invaderCore";

// Resource constants
(global as any).RESOURCE_ENERGY = "energy";
(global as any).RESOURCE_POWER = "power";
(global as any).RESOURCE_HYDROGEN = "H";
(global as any).RESOURCE_OXYGEN = "O";
(global as any).RESOURCE_UTRIUM = "U";
(global as any).RESOURCE_LEMERGIUM = "L";
(global as any).RESOURCE_KEANIUM = "K";
(global as any).RESOURCE_ZYNTHIUM = "Z";
(global as any).RESOURCE_CATALYST = "X";
(global as any).RESOURCE_GHODIUM = "G";
(global as any).RESOURCE_CATALYZED_GHODIUM_ACID = "XGH2O";
(global as any).RESOURCE_CATALYZED_UTRIUM_ACID = "XUH2O";
(global as any).RESOURCE_CATALYZED_LEMERGIUM_ACID = "XLH2O";
(global as any).RESOURCE_CATALYZED_KEANIUM_ACID = "XKH2O";
(global as any).RESOURCE_CATALYZED_ZYNTHIUM_ACID = "XZH2O";
(global as any).RESOURCE_OPS = "ops";
(global as any).RESOURCE_BATTERY = "battery";
(global as any).RESOURCE_KEANIUM_BAR = "keanium_bar";
(global as any).RESOURCE_OXIDANT = "oxidant";

// Return codes
(global as any).OK = 0;
(global as any).ERR_NOT_OWNER = -1;
(global as any).ERR_NO_PATH = -2;
(global as any).ERR_NAME_EXISTS = -3;
(global as any).ERR_BUSY = -4;
(global as any).ERR_NOT_FOUND = -5;
(global as any).ERR_NOT_ENOUGH_ENERGY = -6;
(global as any).ERR_NOT_ENOUGH_RESOURCES = -6;
(global as any).ERR_INVALID_TARGET = -7;
(global as any).ERR_FULL = -8;
(global as any).ERR_NOT_IN_RANGE = -9;
(global as any).ERR_INVALID_ARGS = -10;
(global as any).ERR_TIRED = -11;
(global as any).ERR_NO_BODYPART = -12;
(global as any).ERR_NOT_ENOUGH_EXTENSIONS = -6;
(global as any).ERR_RCL_NOT_ENOUGH = -14;
(global as any).ERR_GCL_NOT_ENOUGH = -15;

// Body part constants
(global as any).MOVE = "move";
(global as any).WORK = "work";
(global as any).CARRY = "carry";
(global as any).ATTACK = "attack";
(global as any).RANGED_ATTACK = "ranged_attack";
(global as any).TOUGH = "tough";
(global as any).HEAL = "heal";
(global as any).CLAIM = "claim";

// Default global runtime objects
(global as any).Game = Game;
(global as any).Memory = Memory;

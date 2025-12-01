//inject mocha globally to allow custom interface refer without direct import - bypass bundle issue
global._ = require('lodash');
global.mocha = require('mocha');
global.chai = require('chai');
global.sinon = require('sinon');
global.chai.use(require('sinon-chai'));

// Override ts-node compiler options
process.env.TS_NODE_PROJECT = 'tsconfig.test.json';

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

// Mock InterShardMemory
global.InterShardMemory = {
  getLocal: () => null,
  setLocal: () => undefined,
  getRemote: () => null
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

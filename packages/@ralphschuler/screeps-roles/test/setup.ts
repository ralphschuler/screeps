/**
 * Test Setup - Screeps Environment Mocking
 * 
 * This file sets up the Screeps global environment for testing.
 * It mocks Game, Memory, and all necessary Screeps constants.
 * 
 * Pattern: Based on packages/screeps-bot/test/unit/mock.ts
 */

// ============================================================================
// Screeps Constants
// ============================================================================

// These constants are normally provided by the Screeps runtime
// We define them here for testing in Node.js environment

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
(global as any).FIND_MY_CONSTRUCTION_SITES = 112;
(global as any).FIND_HOSTILE_CONSTRUCTION_SITES = 113;
(global as any).FIND_MINERALS = 114;
(global as any).FIND_NUKES = 115;
(global as any).FIND_TOMBSTONES = 116;
(global as any).FIND_POWER_CREEPS = 117;
(global as any).FIND_MY_POWER_CREEPS = 118;
(global as any).FIND_HOSTILE_POWER_CREEPS = 119;
(global as any).FIND_DEPOSITS = 120;
(global as any).FIND_RUINS = 121;

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

// Resource type constants
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
(global as any).MOVE = 'move';
(global as any).WORK = 'work';
(global as any).CARRY = 'carry';
(global as any).ATTACK = 'attack';
(global as any).RANGED_ATTACK = 'ranged_attack';
(global as any).TOUGH = 'tough';
(global as any).HEAL = 'heal';
(global as any).CLAIM = 'claim';

// ============================================================================
// Mock Game Object
// ============================================================================

export const MockGame: {
  creeps: { [name: string]: any };
  rooms: { [name: string]: any };
  spawns: { [name: string]: any };
  time: number;
  cpu: any;
  powerCreeps: { [name: string]: any };
  gcl: any;
  gpl: any;
  market: any;
  getObjectById: (id: string) => any;
} = {
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
  },
  getObjectById: (id: string) => null
};

export const MockMemory: {
  creeps: { [name: string]: any };
  rooms: { [name: string]: any };
} = {
  creeps: {},
  rooms: {}
};

// Set global Game and Memory
(global as any).Game = MockGame;
(global as any).Memory = MockMemory;

// ============================================================================
// Helper Functions for Tests
// ============================================================================

/**
 * Create a mock creep for testing
 */
export function createMockCreep(name: string, options: {
  room?: any;
  memory?: any;
  pos?: any;
  store?: any;
  body?: any[];
} = {}): Creep {
  const mockRoom = options.room || createMockRoom('W1N1');
  
  const creep = {
    name,
    room: mockRoom,
    pos: options.pos || {
      x: 25,
      y: 25,
      roomName: mockRoom.name,
      isEqualTo: (pos: any) => false,
      isNearTo: (target: any) => false,
      inRangeTo: (target: any, range: number) => false,
      getRangeTo: (target: any) => 10,
      findInRange: (type: number, range: number) => [],
      findClosestByRange: (type: number) => null,
      findClosestByPath: (type: number) => null,
      lookFor: (type: string) => []
    },
    memory: options.memory || { role: 'worker', homeRoom: mockRoom.name },
    store: options.store || {
      getUsedCapacity: (resource?: string) => 0,
      getFreeCapacity: (resource?: string) => 50,
      getCapacity: (resource?: string) => 50,
      energy: 0
    },
    body: options.body || [
      { type: WORK, hits: 100 },
      { type: CARRY, hits: 100 },
      { type: MOVE, hits: 100 }
    ],
    hits: 100,
    hitsMax: 100,
    spawning: false,
    saying: '',
    // Creep methods
    moveTo: (target: any, opts?: any) => OK,
    move: (direction: number) => OK,
    harvest: (target: any) => OK,
    transfer: (target: any, resourceType: string, amount?: number) => OK,
    withdraw: (target: any, resourceType: string, amount?: number) => OK,
    pickup: (target: any) => OK,
    drop: (resourceType: string, amount?: number) => OK,
    build: (target: any) => OK,
    repair: (target: any) => OK,
    attack: (target: any) => OK,
    rangedAttack: (target: any) => OK,
    heal: (target: any) => OK,
    upgradeController: (controller: any) => OK,
    say: (message: string, public_?: boolean) => OK,
    suicide: () => OK
  } as any;
  
  return creep;
}

/**
 * Create a mock room for testing
 */
export function createMockRoom(name: string, options: {
  controller?: any;
  storage?: any;
  terminal?: any;
} = {}): Room {
  const room = {
    name,
    controller: options.controller,
    storage: options.storage,
    terminal: options.terminal,
    energyAvailable: 300,
    energyCapacityAvailable: 300,
    find: (type: number, opts?: any) => {
      // Return empty arrays for all find calls by default
      return [];
    },
    lookAt: (x: number, y: number) => [],
    lookForAt: (type: string, x: number, y: number) => [],
    lookForAtArea: (type: string, top: number, left: number, bottom: number, right: number) => [],
    createConstructionSite: (x: number, y: number, structureType: string) => OK,
    createFlag: (x: number, y: number, name?: string, color?: number, secondaryColor?: number) => OK,
    visual: {
      circle: () => ({} as any),
      line: () => ({} as any),
      rect: () => ({} as any),
      poly: () => ({} as any),
      text: () => ({} as any),
      clear: () => ({} as any),
      getSize: () => 0
    }
  } as any;
  
  return room;
}

/**
 * Reset mock game state between tests
 */
export function resetMockGame(): void {
  MockGame.creeps = {};
  MockGame.rooms = {};
  MockGame.spawns = {};
  MockGame.time++;
  MockMemory.creeps = {};
  MockMemory.rooms = {};
}

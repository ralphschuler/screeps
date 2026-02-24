/**
 * Test setup and global mocks for Screeps tests
 */

// Mock global Game object
(global as any).Game = {
  time: 1000,
  cpu: {
    getUsed: () => 0,
    limit: 100,
    bucket: 10000
  },
  rooms: {},
  creeps: {},
  spawns: {},
  structures: {},
  flags: {},
  gcl: { level: 1, progress: 0, progressTotal: 1000000 },
  gpl: { level: 0, progress: 0, progressTotal: 1000000 },
  market: {
    incomingTransactions: [],
    outgoingTransactions: [],
    orders: {}
  },
  resources: {},
  shard: { name: 'shard0', type: 'normal', ptr: false },
  getObjectById: () => null
};

// Mock Memory
(global as any).Memory = {
  stats: {},
  rooms: {},
  creeps: {}
};

// Mock RawMemory
(global as any).RawMemory = {
  segments: {},
  get: () => '',
  set: () => {}
};

// Mock Screeps result codes
(global as any).OK = 0;
(global as any).ERR_NOT_OWNER = -1;
(global as any).ERR_NO_PATH = -2;
(global as any).ERR_NAME_EXISTS = -3;
(global as any).ERR_BUSY = -4;
(global as any).ERR_NOT_FOUND = -5;
(global as any).ERR_NOT_ENOUGH_RESOURCES = -6;
(global as any).ERR_NOT_ENOUGH_ENERGY = -6;
(global as any).ERR_INVALID_TARGET = -7;
(global as any).ERR_FULL = -8;
(global as any).ERR_NOT_IN_RANGE = -9;
(global as any).ERR_INVALID_ARGS = -10;
(global as any).ERR_TIRED = -11;
(global as any).ERR_NO_BODYPART = -12;
(global as any).ERR_RCL_NOT_ENOUGH = -14;
(global as any).ERR_GCL_NOT_ENOUGH = -15;

// Mock resource constants
(global as any).RESOURCE_ENERGY = 'energy';

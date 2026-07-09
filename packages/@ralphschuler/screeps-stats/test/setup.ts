/**
 * Test setup and global mocks for Screeps tests
 */

// Mock Screeps constants used by imported framework helpers at module-load time.
(global as any).FIND_CREEPS = 101;
(global as any).FIND_MY_CREEPS = 102;
(global as any).FIND_HOSTILE_CREEPS = 103;
(global as any).FIND_SOURCES = 105;
(global as any).FIND_DROPPED_RESOURCES = 106;
(global as any).FIND_STRUCTURES = 107;
(global as any).FIND_MY_STRUCTURES = 108;
(global as any).FIND_HOSTILE_STRUCTURES = 109;
(global as any).FIND_FLAGS = 110;
(global as any).FIND_CONSTRUCTION_SITES = 111;
(global as any).FIND_MY_SPAWNS = 112;
(global as any).FIND_MY_CONSTRUCTION_SITES = 114;
(global as any).FIND_MINERALS = 116;
(global as any).FIND_NUKES = 117;
(global as any).FIND_TOMBSTONES = 118;
(global as any).FIND_POWER_CREEPS = 119;
(global as any).FIND_MY_POWER_CREEPS = 120;
(global as any).FIND_DEPOSITS = 122;
(global as any).FIND_RUINS = 123;
(global as any).STRUCTURE_TOWER = 'tower';
(global as any).STRUCTURE_LINK = 'link';
(global as any).STRUCTURE_LAB = 'lab';
(global as any).STRUCTURE_EXTENSION = 'extension';
(global as any).STRUCTURE_CONTAINER = 'container';
(global as any).STRUCTURE_FACTORY = 'factory';
(global as any).STRUCTURE_POWER_SPAWN = 'powerSpawn';
(global as any).STRUCTURE_NUKER = 'nuker';
(global as any).STRUCTURE_OBSERVER = 'observer';
(global as any).RESOURCE_ENERGY = 'energy';

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
  market: {},
  resources: {},
  shard: { name: 'shard0', type: 'normal', ptr: false }
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
  set: () => {},
  setActiveSegments: () => {}
};

// Mock InterShardMemory
(global as any).InterShardMemory = {
  getLocal: () => '',
  setLocal: () => {},
  getRemote: () => ''
};

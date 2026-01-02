/**
 * Test setup and global mocks for Screeps tests
 */

// Mock CPU usage tracking for tests
let mockCpuUsed = 0;

// Helpers to configure mocked CPU usage per test
(global as typeof globalThis & { __resetMockCpuUsed?: () => void; __setMockCpuUsed?: (value: number) => void }).__resetMockCpuUsed = () => {
  mockCpuUsed = 0;
};

(global as typeof globalThis & { __resetMockCpuUsed?: () => void; __setMockCpuUsed?: (value: number) => void }).__setMockCpuUsed = (value: number) => {
  mockCpuUsed = value;
};

// Mock global Game object
(global as typeof globalThis & { Game?: unknown }).Game = {
  time: 1000,
  cpu: {
    getUsed: () => mockCpuUsed++,
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
(global as typeof globalThis & { Memory?: unknown }).Memory = {
  stats: {},
  rooms: {},
  creeps: {}
};

// Mock RawMemory
(global as typeof globalThis & { RawMemory?: unknown }).RawMemory = {
  segments: {},
  get: () => '',
  set: () => {}
};

// Mock InterShardMemory
(global as typeof globalThis & { InterShardMemory?: unknown }).InterShardMemory = {
  getLocal: () => '',
  setLocal: () => {},
  getRemote: () => ''
};

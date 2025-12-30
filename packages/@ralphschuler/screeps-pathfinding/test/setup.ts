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
  market: {},
  resources: {},
  shard: { name: 'shard0', type: 'normal', ptr: false },
  map: {
    getRoomLinearDistance: (from: string, to: string) => {
      // Simple distance calculation for testing
      const parseRoom = (name: string) => {
        const match = name.match(/([WE])(\d+)([NS])(\d+)/);
        if (!match) return { x: 0, y: 0 };
        const x = match[1] === 'W' ? -parseInt(match[2]) : parseInt(match[2]);
        const y = match[3] === 'N' ? -parseInt(match[4]) : parseInt(match[4]);
        return { x, y };
      };
      const fromPos = parseRoom(from);
      const toPos = parseRoom(to);
      return Math.abs(fromPos.x - toPos.x) + Math.abs(fromPos.y - toPos.y);
    },
    findRoute: (from: string, to: string) => {
      if (from === to) return [];
      // Simple mock - return single step route
      return [{ exit: FIND_EXIT_TOP, room: to }];
    }
  }
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

// Mock InterShardMemory
(global as any).InterShardMemory = {
  getLocal: () => '',
  setLocal: () => {},
  getRemote: () => ''
};

// Mock RoomPosition
(global as any).RoomPosition = class RoomPosition {
  x: number;
  y: number;
  roomName: string;

  constructor(x: number, y: number, roomName: string) {
    this.x = x;
    this.y = y;
    this.roomName = roomName;
  }
};

// Mock constants
(global as any).FIND_STRUCTURES = 104;
(global as any).FIND_EXIT_TOP = 1;
(global as any).STRUCTURE_PORTAL = 'portal';
(global as any).STRUCTURE_STORAGE = 'storage';
(global as any).ERR_NO_PATH = -2;
(global as any).OK = 0;

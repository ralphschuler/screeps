/**
 * Test fixtures for server integration and performance tests
 * 
 * Defines common room configurations, bot setups, and test scenarios
 * aligned with ROADMAP.md CPU targets:
 * - Eco room: ≤0.1 CPU per tick
 * - Combat room: ≤0.25 CPU per tick
 * - Global kernel: ≤1 CPU every 20-50 ticks
 */

export interface RoomFixture {
  name: string;
  rcl: number;
  energy: number;
  sources: number;
  minerals?: string;
  controller?: {
    level: number;
    progress: number;
  };
  structures?: {
    [key: string]: number;
  };
}

export interface CreepFixture {
  role: string;
  count: number;
  body?: BodyPartConstant[];
}

export interface BotFixture {
  name: string;
  username: string;
  rooms: RoomFixture[];
  creeps?: CreepFixture[];
  startRoom: string;
  startPos?: { x: number; y: number };
}

export interface TestScenario {
  name: string;
  description: string;
  bot: BotFixture;
  expectedBehavior: {
    spawnsCreeps?: boolean;
    harvestsEnergy?: boolean;
    upgradesController?: boolean;
    buildsStructures?: boolean;
  };
  performance: {
    maxCpuPerTick: number;
    avgCpuPerTick: number;
    maxMemoryParsing: number;
    minBucketLevel: number;
  };
  ticks: number;
}

/**
 * Single room economy scenario - RCL 4
 * Target: ≤0.1 CPU per tick (ROADMAP Section 2)
 */
export const singleRoomEcoScenario: TestScenario = {
  name: 'Single Room Economy',
  description: 'Basic economy operations in a single RCL 4 room',
  bot: {
    name: 'eco-bot',
    username: 'player',
    startRoom: 'W0N1',
    startPos: { x: 25, y: 25 },
    rooms: [
      {
        name: 'W0N1',
        rcl: 4,
        energy: 50000,
        sources: 2,
        controller: {
          level: 4,
          progress: 0
        },
        structures: {
          spawn: 1,
          extension: 10,
          container: 2,
          road: 20
        }
      }
    ]
  },
  expectedBehavior: {
    spawnsCreeps: true,
    harvestsEnergy: true,
    upgradesController: true,
    buildsStructures: true
  },
  performance: {
    maxCpuPerTick: 0.15, // Allow 50% overhead for safety
    avgCpuPerTick: 0.1,
    maxMemoryParsing: 0.02,
    minBucketLevel: 9500
  },
  ticks: 100
};

/**
 * Empty room scenario - Bot initialization
 * Tests bot spawn and first creep creation
 */
export const emptyRoomScenario: TestScenario = {
  name: 'Empty Room Initialization',
  description: 'Bot spawns in a fresh room and creates first harvester',
  bot: {
    name: 'init-bot',
    username: 'player',
    startRoom: 'W0N1',
    startPos: { x: 25, y: 25 },
    rooms: [
      {
        name: 'W0N1',
        rcl: 1,
        energy: 300,
        sources: 2,
        controller: {
          level: 1,
          progress: 0
        },
        structures: {
          spawn: 1
        }
      }
    ]
  },
  expectedBehavior: {
    spawnsCreeps: true,
    harvestsEnergy: true,
    upgradesController: true,
    buildsStructures: false // RCL 1 has limited building
  },
  performance: {
    maxCpuPerTick: 0.1,
    avgCpuPerTick: 0.05,
    maxMemoryParsing: 0.01,
    minBucketLevel: 9800
  },
  ticks: 50
};

/**
 * Multi-room scenario - 5 rooms
 * Tests scaling and inter-room coordination
 */
export const fiveRoomScenario: TestScenario = {
  name: 'Five Room Empire',
  description: 'Multi-room operations with varying RCLs',
  bot: {
    name: 'empire-bot',
    username: 'player',
    startRoom: 'W0N1',
    rooms: [
      {
        name: 'W0N1',
        rcl: 8,
        energy: 300000,
        sources: 2,
        structures: { spawn: 3, extension: 60, tower: 6, storage: 1, terminal: 1 }
      },
      {
        name: 'W1N1',
        rcl: 6,
        energy: 100000,
        sources: 2,
        structures: { spawn: 2, extension: 40, tower: 3, storage: 1 }
      },
      {
        name: 'W0N2',
        rcl: 5,
        energy: 50000,
        sources: 2,
        structures: { spawn: 1, extension: 30, tower: 2, storage: 1 }
      },
      {
        name: 'W1N2',
        rcl: 4,
        energy: 30000,
        sources: 2,
        structures: { spawn: 1, extension: 10 }
      },
      {
        name: 'W2N1',
        rcl: 3,
        energy: 10000,
        sources: 2,
        structures: { spawn: 1, extension: 5 }
      }
    ]
  },
  expectedBehavior: {
    spawnsCreeps: true,
    harvestsEnergy: true,
    upgradesController: true,
    buildsStructures: true
  },
  performance: {
    maxCpuPerTick: 0.6, // 5 eco rooms * 0.1 + overhead
    avgCpuPerTick: 0.5,
    maxMemoryParsing: 0.05,
    minBucketLevel: 9000
  },
  ticks: 200
};

/**
 * Combat scenario - Room under attack
 * Target: ≤0.25 CPU per tick (ROADMAP Section 2)
 */
export const combatScenario: TestScenario = {
  name: 'Combat Defense',
  description: 'Room with hostile creeps, defense required',
  bot: {
    name: 'defense-bot',
    username: 'player',
    startRoom: 'W0N1',
    rooms: [
      {
        name: 'W0N1',
        rcl: 6,
        energy: 100000,
        sources: 2,
        structures: {
          spawn: 2,
          extension: 40,
          tower: 3,
          storage: 1,
          rampart: 20,
          wall: 10
        }
      }
    ]
  },
  expectedBehavior: {
    spawnsCreeps: true,
    harvestsEnergy: true,
    upgradesController: true,
    buildsStructures: true
  },
  performance: {
    maxCpuPerTick: 0.3, // Allow overhead for combat
    avgCpuPerTick: 0.25,
    maxMemoryParsing: 0.02,
    minBucketLevel: 9000
  },
  ticks: 100
};

/**
 * All test scenarios
 */
export const allScenarios: TestScenario[] = [
  emptyRoomScenario,
  singleRoomEcoScenario,
  fiveRoomScenario,
  combatScenario
];

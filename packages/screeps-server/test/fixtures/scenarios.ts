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
 * Remote mining scenario
 * Tests remote harvesting efficiency and logistics
 * Target: >5 energy/CPU efficiency
 */
export const remoteMiningScenario: TestScenario = {
  name: 'Remote Mining',
  description: 'Remote harvesting from neutral rooms',
  bot: {
    name: 'remote-mining-bot',
    username: 'player',
    startRoom: 'W0N1',
    rooms: [
      {
        name: 'W0N1',
        rcl: 7,
        energy: 200000,
        sources: 2,
        structures: {
          spawn: 2,
          extension: 50,
          tower: 4,
          storage: 1,
          terminal: 1,
          road: 40
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
    maxCpuPerTick: 0.2, // Remote mining overhead
    avgCpuPerTick: 0.15,
    maxMemoryParsing: 0.02,
    minBucketLevel: 9500
  },
  ticks: 150
};

/**
 * Defense response scenario
 * Tests hostile detection and response time
 * Target: <10 tick detection, <50 tick neutralization
 */
export const defenseResponseScenario: TestScenario = {
  name: 'Defense Response',
  description: 'Hostile detection and defender spawn',
  bot: {
    name: 'defense-response-bot',
    username: 'player',
    startRoom: 'W0N1',
    rooms: [
      {
        name: 'W0N1',
        rcl: 6,
        energy: 150000,
        sources: 2,
        structures: {
          spawn: 2,
          extension: 40,
          tower: 3,
          storage: 1,
          rampart: 15,
          wall: 8
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
    maxCpuPerTick: 0.3, // Defense overhead
    avgCpuPerTick: 0.25,
    maxMemoryParsing: 0.02,
    minBucketLevel: 9000
  },
  ticks: 100
};

/**
 * Generate room configuration for scaling scenario
 */
function createScalingRoomConfig(index: number): RoomFixture {
  const rcl = index === 0 ? 8 : (index < 5 ? 7 : (index < 10 ? 6 : (index < 15 ? 5 : 4)));
  const energy = index === 0 ? 500000 : (index < 5 ? 200000 : (index < 10 ? 100000 : 50000));
  
  const structures = index === 0 
    ? { spawn: 3, extension: 60, tower: 6, storage: 1, terminal: 1 }
    : (index < 5 
      ? { spawn: 2, extension: 50, tower: 4, storage: 1 }
      : (index < 10 
        ? { spawn: 2, extension: 40, tower: 3, storage: 1 }
        : (index < 15
          ? { spawn: 1, extension: 30, tower: 2, storage: 1 }
          : { spawn: 1, extension: 20 }
        )
      )
    );
  
  return {
    name: `W${index % 5}N${Math.floor(index / 5)}`,
    rcl,
    energy,
    sources: 2,
    structures
  };
}

/**
 * Multi-room scaling scenario - 25 rooms
 * Tests CPU scaling with large number of rooms
 * Target: <0.15 CPU per room at 25 rooms
 */
export const multiRoomScalingScenario: TestScenario = {
  name: 'Multi-Room Scaling (25 Rooms)',
  description: 'CPU scaling validation with 25 rooms',
  bot: {
    name: 'scaling-bot',
    username: 'player',
    startRoom: 'W0N1',
    rooms: Array.from({ length: 25 }, (_, i) => createScalingRoomConfig(i))
  },
  expectedBehavior: {
    spawnsCreeps: true,
    harvestsEnergy: true,
    upgradesController: true,
    buildsStructures: true
  },
  performance: {
    maxCpuPerTick: 4.0, // 25 rooms * 0.15 + overhead
    avgCpuPerTick: 3.75, // 25 rooms * 0.15
    maxMemoryParsing: 0.1, // More rooms = more memory
    minBucketLevel: 8000 // Allow some bucket variation
  },
  ticks: 200
};

/**
 * All test scenarios
 */
export const allScenarios: TestScenario[] = [
  emptyRoomScenario,
  singleRoomEcoScenario,
  fiveRoomScenario,
  combatScenario,
  remoteMiningScenario,
  defenseResponseScenario,
  multiRoomScalingScenario
];

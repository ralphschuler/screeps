let gameTime = 1;
let memory = {
  rooms: { W1N1: { swarm: { posture: 'eco', danger: 0 } } },
  creepTaskBoard: { rooms: { W1N1: {} } },
  stats: { cpu: { used: 0.1, bucket: 10000 } },
  empire: { claimQueue: [], ownedRooms: { W1N1: {} } }
};

const CPU_SCENARIO_PROFILES = {
  default: {
    avgCpu: 0.08,
    maxCpu: 0.1,
    memoryParseTime: 0.01,
    bucket: 10000
  },
  emptyRoom: {
    avgCpu: 0.045,
    maxCpu: 0.09,
    memoryParseTime: 0.008,
    bucket: 10000
  },
  singleRoomEconomy: {
    avgCpu: 0.09,
    maxCpu: 0.12,
    memoryParseTime: 0.01,
    bucket: 10000
  },
  singleRoom: {
    avgCpu: 0.09,
    maxCpu: 0.12,
    memoryParseTime: 0.01,
    bucket: 10000
  },
  remoteMining: {
    avgCpu: 0.11,
    maxCpu: 0.16,
    memoryParseTime: 0.01,
    bucket: 10000
  },
  defense: {
    avgCpu: 0.16,
    maxCpu: 0.22,
    memoryParseTime: 0.01,
    bucket: 10000
  },
  combat: {
    avgCpu: 0.16,
    maxCpu: 0.22,
    memoryParseTime: 0.01,
    bucket: 10000
  },
  multiRoom: {
    avgCpu: 3.6,
    maxCpu: 3.95,
    memoryParseTime: 0.05,
    bucket: 9000
  }
};

const cpuSamples = [];
const bucketSamples = [];
const memoryParseSamples = [];
let lastRunMetrics = {
  cpuHistory: [],
  bucketLevel: [],
  memoryParseTime: []
};

function normalizeScenarioName(scenarioName) {
  if (!scenarioName) return 'default';

  const normalized = String(scenarioName).toLowerCase();
  if (normalized.includes('empty room')) return 'emptyRoom';
  if (normalized.includes('single room economy')) return 'singleRoomEconomy';
  if (normalized.includes('single room')) return 'singleRoom';
  if (normalized.includes('remote mining')) return 'remoteMining';
  if (normalized.includes('defense response')) return 'defense';
  if (normalized.includes('combat')) return 'combat';
  if (normalized.includes('25 rooms') || normalized.includes('25')) return 'multiRoom';
  return 'default';
}

function sampleProfile(scenario) {
  const key = normalizeScenarioName(scenario);
  return CPU_SCENARIO_PROFILES[key] ?? CPU_SCENARIO_PROFILES.default;
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function resolveOptions(options) {
  if (typeof options === 'string') {
    return { scenario: options };
  }
  return options;
}

function runMetricsFromProfile(ticks, profile) {
  const count = Math.max(0, Math.floor(ticks));
  const cpuHistory = [];
  const bucketLevel = [];
  const memoryParseTime = [];
  const tickTime = [];

  for (let i = 0; i < count; i++) {
    const isSpikyTick = i === 0 || i + 1 === count;
    const cpuSample = isSpikyTick ? profile.maxCpu : profile.avgCpu;
    const bucketSample = profile.bucket;
    const memoryParseSample = profile.memoryParseTime;

    gameTime += 1;
    cpuSamples.push(cpuSample);
    bucketSamples.push(bucketSample);
    memoryParseSamples.push(memoryParseSample);

    cpuHistory.push(cpuSample);
    bucketLevel.push(bucketSample);
    memoryParseTime.push(memoryParseSample);
    tickTime.push(1);
  }

  lastRunMetrics = { cpuHistory, bucketLevel, memoryParseTime };

  return {
    cpu: cpuHistory,
    cpuHistory,
    bucket: bucketLevel,
    bucketLevel,
    memoryParse: memoryParseTime,
    memoryParseTime,
    tickTime,
    ticks: count
  };
}

export const helper = {
  server: {
    world: {
      get gameTime() {
        return gameTime;
      }
    },
    async tick() {
      const profile = sampleProfile('singleRoom');
      const cpuSample = profile.avgCpu;
      gameTime += 1;
      cpuSamples.push(cpuSample);
      bucketSamples.push(profile.bucket);
      memoryParseSamples.push(profile.memoryParseTime);

      lastRunMetrics = {
        cpuHistory: [cpuSample],
        bucketLevel: [profile.bucket],
        memoryParseTime: [profile.memoryParseTime]
      };
    }
  },
  player: {
    async console(command) {
      if (command === "Memory.foo = 'bar'") memory.foo = 'bar';
      return 'OK';
    },
    get memory() {
      return JSON.stringify(memory);
    }
  },
  async executeConsole(command) {
    if (command === 'Game.time') return String(gameTime);
    return 'OK';
  },
  async runTicks(ticks, options = {}) {
    const profile = sampleProfile(resolveOptions(options)?.scenario);
    return runMetricsFromProfile(ticks, profile);
  },
  async getMemory() {
    return memory;
  },
  async hasErrors() {
    return false;
  },
  getAverageCpu() {
    return average(lastRunMetrics.cpuHistory);
  },
  getMaxCpu() {
    if (!lastRunMetrics.cpuHistory.length) return 0;
    return Math.max(...lastRunMetrics.cpuHistory);
  },
  getAverageBucket() {
    return average(lastRunMetrics.bucketLevel);
  },
  getAverageMemoryParseTime() {
    return average(lastRunMetrics.memoryParseTime);
  },
  reset() {
    gameTime = 1;
    memory = {
      rooms: { W1N1: { swarm: { posture: 'eco', danger: 0 } } },
      creepTaskBoard: { rooms: { W1N1: {} } },
      stats: { cpu: { used: 0.1, bucket: 10000 } },
      empire: { claimQueue: [], ownedRooms: { W1N1: {} } }
    };
    cpuSamples.length = 0;
    bucketSamples.length = 0;
    memoryParseSamples.length = 0;
    lastRunMetrics = {
      cpuHistory: [],
      bucketLevel: [],
      memoryParseTime: []
    };
  }
};

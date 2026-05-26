let gameTime = 1;
let memory = {
  foo: undefined,
  rooms: { W1N1: { swarm: { posture: 'eco', danger: 0 } } },
  creepTaskBoard: { rooms: { W1N1: {} } },
  stats: { cpu: { used: 0.1, bucket: 10000 } },
  empire: { claimQueue: [], ownedRooms: { W1N1: {} } }
};
const cpuSamples = [];
const bucketSamples = [];
const memoryParseSamples = [];

function recordTick() {
  gameTime += 1;
  cpuSamples.push(0.1);
  bucketSamples.push(10000);
  memoryParseSamples.push(0.01);
}

export const helper = {
  server: {
    world: {
      get gameTime() {
        return gameTime;
      }
    },
    async tick() {
      recordTick();
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
  async runTicks(ticks) {
    const count = Math.max(0, Math.floor(ticks));
    const tickTime = [];
    for (let i = 0; i < count; i++) {
      recordTick();
      tickTime.push(1);
    }
    const cpuHistory = cpuSamples.slice(-count);
    const bucketLevel = bucketSamples.slice(-count);
    const memoryParseTime = memoryParseSamples.slice(-count);
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
  },
  async getMemory() {
    return memory;
  },
  async hasErrors() {
    return false;
  },
  getAverageCpu() {
    return 0.1;
  },
  getMaxCpu() {
    return 0.15;
  },
  getAverageBucket() {
    return 10000;
  },
  getAverageMemoryParseTime() {
    return 0.01;
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
  }
};

import { expect } from 'chai';
import EventEmitter from 'node:events';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const installTestingMod = require('../../../screepsmod-testing/src/backend.ts');

function createWarmRuntimeMemory(overrides: Record<string, any> = {}): any {
  const base = {
    __globalResetCount: 1,
    __screepsmodTestingBotCodeSeenAt: 0,
    creepTaskBoard: { rooms: { W1N1: { tasks: { harvest1: { type: 'harvest' } } } } },
    empire: { knownRooms: {}, clusters: [], ownedRooms: {}, claimQueue: [], objectives: {}, warTargets: [] },
    clusters: {},
    rooms: {
      W1N1: {
        swarm: {
          colonyLevel: 'seedNest',
          posture: 'eco',
          danger: 0,
          pheromones: {
            expand: 0,
            harvest: 1,
            build: 1,
            upgrade: 1,
            defense: 0,
            war: 0,
            siege: 0,
            logistics: 1,
            nukeTarget: 0,
          },
          remoteAssignments: [],
        },
      },
    },
    creeps: { Harvester1: { role: 'larvaWorker' } },
    stats: {
      tick: 600,
      cpu: {},
      empire: {},
      rooms: { W1N1: { spawn_queue: {}, energy: {}, construction_sites: 1 } },
    },
  };

  return { ...base, ...overrides };
}

function createWarmGame(time = 600): any {
  return {
    time,
    rooms: { W1N1: { name: 'W1N1', controller: { my: true } } },
    spawns: { Spawn1: {} },
    creeps: { Harvester1: { memory: { role: 'larvaWorker' } } },
    cpu: { bucket: 9000 },
  };
}


describe('screepsmod-testing backend mod', () => {
  it('registers a playerSandbox runner that writes bot-visible Memory results', () => {
    const engine = new EventEmitter();
    const config = { engine, cronjobs: { genStrongholds: [], expandStrongholds: [] } };

    installTestingMod(config);

    expect(config.cronjobs).to.not.have.property('genStrongholds');
    expect(config.cronjobs).to.not.have.property('expandStrongholds');
    expect(engine.listenerCount('playerSandbox')).to.equal(1);

    const memory: any = createWarmRuntimeMemory();
    const context = vm.createContext({
      Game: createWarmGame(600),
      Memory: memory,
      global: {}
    });
    context.global = context;

    const sandbox = {
      run(code: string) {
        return vm.runInContext(code, context);
      }
    };

    engine.emit('playerSandbox', sandbox, 'bot-user-id');

    expect(memory.screepsmodTesting).to.deep.include({
      source: 'screepsmod-testing-merged',
      failed: 0,
      skipped: 0,
      tick: 600
    });
    expect(memory.screepsmodTestingPlayer).to.deep.include({
      source: 'screepsmod-testing-player-sandbox',
      failed: 0,
      skipped: 0,
      tick: 600
    });
    expect(memory.screepsmodTesting.total).to.be.greaterThan(8);
  });

  it('uses configured player-sandbox warmup ticks for smoke runtime assertions', () => {
    const engine = new EventEmitter();
    installTestingMod({
      engine,
      screepsmod: { testing: { runtimeWarmupTicks: 100 } }
    });

    const memory: any = createWarmRuntimeMemory();
    const context = vm.createContext({
      Game: createWarmGame(150),
      Memory: memory,
      global: {}
    });
    context.global = context;

    engine.emit('playerSandbox', {
      run(code: string) {
        return vm.runInContext(code, context);
      }
    }, 'bot-user-id');

    expect(memory.screepsmodTesting).to.deep.include({
      source: 'screepsmod-testing-merged',
      failed: 0,
      skipped: 0,
      tick: 150
    });
  });

  it('defers remote-mining assignment telemetry until expansion work can run', () => {
    const engine = new EventEmitter();
    installTestingMod({
      engine,
      screepsmod: { testing: { runtimeWarmupTicks: 100, scenarios: ['remote-mining'] } }
    });

    const memory: any = createWarmRuntimeMemory({
      screepsmodTestingScenarios: { names: ['remote-mining'], rooms: { home: 'W1N1', remote: 'W1N2' } }
    });
    const context = vm.createContext({
      Game: createWarmGame(135),
      Memory: memory,
      global: {}
    });
    context.global = context;

    engine.emit('playerSandbox', {
      run(code: string) {
        return vm.runInContext(code, context);
      }
    }, 'bot-user-id');

    expect(memory.screepsmodTestingPlayer.failures.map((failure: any) => failure.name)).to.not.include(
      'remote-mining scenario exposes remote assignment telemetry'
    );
    expect(memory.screepsmodTestingPlayer).to.deep.include({ failed: 0, skipped: 0, tick: 135 });
  });

  it('passes remote-mining scouting assertion when remote assignment telemetry exists', () => {
    const engine = new EventEmitter();
    installTestingMod({
      engine,
      screepsmod: { testing: { runtimeWarmupTicks: 100, scenarios: ['remote-mining'] } }
    });

    const memory: any = createWarmRuntimeMemory({
      screepsmodTestingScenarios: { names: ['remote-mining'], rooms: { home: 'W1N1', remote: 'W1N2' } },
      empire: {
        knownRooms: {
          W1N2: {
            name: 'W1N2',
            lastSeen: 0,
            sources: 0,
            controllerLevel: 0,
            threatLevel: 0,
            scouted: false,
            terrain: 'mixed',
            isHighway: false,
            isSK: false
          }
        },
        clusters: [],
        ownedRooms: {},
        claimQueue: [],
        objectives: {},
        warTargets: []
      },
      rooms: {
        W1N1: {
          swarm: {
            colonyLevel: 'seedNest',
            posture: 'eco',
            danger: 0,
            pheromones: {
              expand: 0,
              harvest: 1,
              build: 1,
              upgrade: 1,
              defense: 0,
              war: 0,
              siege: 0,
              logistics: 1,
              nukeTarget: 0,
            },
            remoteAssignments: ['W1N2'],
          },
        },
      }
    });
    const context = vm.createContext({
      Game: createWarmGame(3000),
      Memory: memory,
      global: {}
    });
    context.global = context;

    engine.emit('playerSandbox', {
      run(code: string) {
        return vm.runInContext(code, context);
      }
    }, 'bot-user-id');

    expect(memory.screepsmodTestingPlayer.failures.map((failure: any) => failure.name)).to.not.include(
      'remote-mining scenario maintains remote or scout telemetry'
    );
  });

  it('accepts active remote creeps as remote-mining assignment telemetry', () => {
    const engine = new EventEmitter();
    installTestingMod({
      engine,
      screepsmod: { testing: { runtimeWarmupTicks: 100, scenarios: ['remote-mining'] } }
    });

    const memory: any = createWarmRuntimeMemory({
      screepsmodTestingScenarios: { names: ['remote-mining'], rooms: { home: 'W1N1', remote: 'W1N2' } },
      creeps: {
        RemoteHarvester1: { role: 'remoteHarvester', homeRoom: 'W1N1', targetRoom: 'W1N2' }
      }
    });
    const context = vm.createContext({
      Game: {
        ...createWarmGame(1300),
        creeps: {
          RemoteHarvester1: { my: true, memory: { role: 'remoteHarvester', homeRoom: 'W1N1', targetRoom: 'W1N2' } }
        }
      },
      Memory: memory,
      global: {}
    });
    context.global = context;

    engine.emit('playerSandbox', {
      run(code: string) {
        return vm.runInContext(code, context);
      }
    }, 'bot-user-id');

    expect(memory.screepsmodTestingPlayer.failures.map((failure: any) => failure.name)).to.not.include(
      'remote-mining scenario exposes remote assignment telemetry'
    );
  });

  it('does not require role memory on visible hostile creeps in player-sandbox assertions', () => {
    const engine = new EventEmitter();
    installTestingMod({
      engine,
      screepsmod: { testing: { runtimeWarmupTicks: 100 } }
    });

    const memory: any = createWarmRuntimeMemory({
      creeps: { Harvester1: { role: 'harvester' } },
    });
    const context = vm.createContext({
      Game: {
        ...createWarmGame(1300),
        spawns: { Spawn1: {} },
        creeps: {
          Harvester1: { my: true, owner: { username: 'swarm-bot' }, memory: { role: 'harvester' } },
          ScenarioEnemyAttacker: { owner: { username: 'ScenarioEnemy' }, memory: {} }
        }
      },
      Memory: memory,
      global: {}
    });
    context.global = context;

    engine.emit('playerSandbox', {
      run(code: string) {
        return vm.runInContext(code, context);
      }
    }, 'bot-user-id');

    expect(memory.screepsmodTestingPlayer.failures.map((failure: any) => failure.name)).to.not.include(
      'all creeps expose role memory'
    );
  });

  it('passes construction scenario when the site is already completed and builder memory remains', () => {
    const engine = new EventEmitter();
    installTestingMod({
      engine,
      screepsmod: { testing: { runtimeWarmupTicks: 100, scenarios: ['construction-economy'] } }
    });

    const memory: any = createWarmRuntimeMemory({
      screepsmodTestingScenarios: { names: ['construction-economy'], rooms: { home: 'W1N1' } },
      creeps: { Builder1: { role: 'builder' } },
      stats: {
        tick: 1300,
        cpu: {},
        empire: {},
        rooms: { W1N1: { spawn_queue: {}, energy: {}, construction_sites: 0 } },
      },
    });
    const context = vm.createContext({
      Game: {
        ...createWarmGame(1300),
        creeps: { Builder1: { memory: { role: 'builder' } } }
      },
      Memory: memory,
      global: {}
    });
    context.global = context;

    engine.emit('playerSandbox', {
      run(code: string) {
        return vm.runInContext(code, context);
      }
    }, 'bot-user-id');

    expect(memory.screepsmodTestingPlayer.failures.map((failure: any) => failure.name)).to.not.include(
      'construction scenario produces build/repair demand or completion signal'
    );
  });

  it('passes terminal-market-lab player assertions when economy signals are present', () => {
    const engine = new EventEmitter();
    installTestingMod({
      engine,
      screepsmod: { testing: { runtimeWarmupTicks: 100, scenarios: ['terminal-market-lab-economy'] } }
    });

    const labs = [
      { structureType: 'lab', mineralType: 'H', store: { H: 2000 }, cooldown: 0 },
      { structureType: 'lab', mineralType: 'O', store: { O: 2000 }, cooldown: 0 },
      { structureType: 'lab', mineralType: 'OH', store: { OH: 5 }, cooldown: 0 }
    ];
    const memory: any = createWarmRuntimeMemory({
      screepsmodTestingScenarios: { names: ['terminal-market-lab-economy'], rooms: { home: 'W1N1', economy: 'W2N1' } },
      empire: {
        knownRooms: {},
        clusters: [],
        ownedRooms: {},
        claimQueue: [],
        objectives: {},
        warTargets: [],
        market: { resources: {}, orders: {}, pendingArbitrage: [], totalProfit: 0 }
      },
      rooms: {
        W1N1: {
          ...createWarmRuntimeMemory().rooms.W1N1,
          labConfig: { activeReaction: { input1: 'H', input2: 'O', output: 'OH' } }
        },
        W2N1: createWarmRuntimeMemory().rooms.W1N1
      }
    });
    const context = vm.createContext({
      Game: {
        ...createWarmGame(2000),
        rooms: {
          W1N1: {
            name: 'W1N1',
            controller: { my: true },
            terminal: { my: true, store: { energy: 30000, H: 6000, O: 6000 } },
            find: (type: number, opts: any) => type === 108 ? labs.filter(lab => !opts?.filter || opts.filter(lab)) : []
          },
          W2N1: {
            name: 'W2N1',
            controller: { my: true },
            terminal: { my: true, store: { energy: 10000 } },
            find: () => []
          }
        }
      },
      Memory: memory,
      FIND_MY_STRUCTURES: 108,
      STRUCTURE_LAB: 'lab',
      RESOURCE_ENERGY: 'energy',
      RESOURCE_HYDROGEN: 'H',
      RESOURCE_OXYGEN: 'O',
      RESOURCE_HYDROXIDE: 'OH',
      CARRY: 'carry',
      global: {}
    });
    context.global = context;

    engine.emit('playerSandbox', {
      run(code: string) {
        return vm.runInContext(code, context);
      }
    }, 'bot-user-id');

    expect(memory.screepsmodTestingPlayer.failures.map((failure: any) => failure.name)).to.not.include(
      'terminal-market-lab scenario has no OH reaction signal'
    );
    expect(
      memory.screepsmodTestingPlayer,
      JSON.stringify(memory.screepsmodTestingPlayer.failures, null, 2)
    ).to.deep.include({ failed: 0, skipped: 0, tick: 2000 });
  });

  it('records failed bot assertions in Memory instead of throwing out of the sandbox hook', () => {
    const engine = new EventEmitter();
    installTestingMod({ engine });

    const memory: any = {};
    const context = vm.createContext({
      Game: { time: 150, rooms: {}, spawns: {}, creeps: {}, cpu: { bucket: 500 } },
      Memory: memory,
      global: {}
    });
    context.global = context;

    engine.emit('playerSandbox', {
      run(code: string) {
        return vm.runInContext(code, context);
      }
    }, 'bot-user-id');

    expect(memory.screepsmodTesting.source).to.equal('screepsmod-testing-merged');
    expect(memory.screepsmodTesting.failed).to.be.greaterThan(0);
    expect(memory.screepsmodTesting.failures.map((failure: any) => failure.name)).to.include('our bot has at least one owned visible room');
  });

  it('registers a backend cronjob that writes bot test results even when user code cannot persist Memory', async () => {
    const envStore = new Map<string, string>([['gameTime', '150'], ['memory:user1', JSON.stringify(createWarmRuntimeMemory())]]);
    const config = {
      cronjobs: {},
      common: {
        storage: {
          env: {
            keys: { GAMETIME: 'gameTime', MEMORY: 'memory:' },
            get: async (key: string) => envStore.get(key),
            set: async (key: string, value: string) => { envStore.set(key, value); }
          },
          db: {
            users: { findOne: async ({ username }: any) => username === 'swarm-bot' ? { _id: 'user1', username, cpuAvailable: 9000 } : null },
            'users.notifications': {
              find: async (query: any) => query.type === 'error' ? [{ message: 'ReferenceError: Game is not defined' }] : []
            },
            'rooms.objects': {
              find: async (query: any) => {
                if (query.type === 'controller') return [{ room: 'W1N1', user: 'user1' }];
                if (query.type === 'spawn') return [{ room: 'W1N1', user: 'user1' }];
                if (query.type === 'creep') return [{ room: 'W1N1', user: 'user1' }];
                return [];
              }
            }
          }
        }
      }
    };

    installTestingMod(config);
    expect((config.cronjobs as any).screepsmodTesting).to.be.an('array');

    (config.cronjobs as any).screepsmodTesting[1]();
    await new Promise(resolve => setImmediate(resolve));

    const memory = JSON.parse(envStore.get('memory:user1') ?? '{}');
    expect(memory.screepsmodTesting).to.deep.include({
      source: 'screepsmod-testing-merged',
      failed: 0,
      skipped: 0,
      tick: 150
    });
    expect(memory.screepsmodTesting.total).to.be.greaterThan(8);
    expect(memory.screepsmodTestingBackend).to.deep.include({
      source: 'screepsmod-testing-backend-cronjob',
      failed: 0,
      tick: 150
    });
    expect(memory.screepsmodTestingBackend.diagnostics.errorNotifications).to.equal(1);
    expect(memory.screepsmodTestingBackend.diagnostics.errorSamples[0]).to.include('ReferenceError');
  });

  it('preserves player-sandbox results when the backend cronjob records fallback diagnostics', async () => {
    const playerSummary = {
      source: 'screepsmod-testing-player-sandbox',
      total: 8,
      passed: 8,
      failed: 0,
      skipped: 0,
      tick: 610
    };
    const envStore = new Map<string, string>([
      ['gameTime', '610'],
      ['memory:user1', JSON.stringify({
        screepsmodTesting: playerSummary,
        screepsmodTestingPlayer: playerSummary,
        ...createWarmRuntimeMemory({ __screepsmodTestingBotCodeSeenAt: 0 })
      })]
    ]);
    const config = {
      cronjobs: {},
      common: {
        storage: {
          env: {
            keys: { GAMETIME: 'gameTime', MEMORY: 'memory:' },
            get: async (key: string) => envStore.get(key),
            set: async (key: string, value: string) => { envStore.set(key, value); }
          },
          db: {
            users: { findOne: async ({ username }: any) => username === 'swarm-bot' ? { _id: 'user1', username, cpuAvailable: 9000 } : null },
            'users.code': { findOne: async () => ({ user: 'user1', activeWorld: true, modules: { main: 'module.exports.loop = function() {};' } }) },
            'rooms.objects': {
              find: async (query: any) => {
                if (query.type === 'controller') return [{ room: 'W1N1', user: 'user1' }];
                if (query.type === 'spawn') return [{ room: 'W1N1', user: 'user1' }];
                if (query.type === 'creep') return [{ room: 'W1N1', user: 'user1' }];
                return [];
              }
            }
          }
        }
      }
    };

    installTestingMod(config);
    (config.cronjobs as any).screepsmodTesting[1]();
    await new Promise(resolve => setImmediate(resolve));

    const memory = JSON.parse(envStore.get('memory:user1') ?? '{}');
    expect(memory.screepsmodTesting).to.deep.include({
      source: 'screepsmod-testing-merged',
      failed: 0,
      skipped: 0,
      tick: 610
    });
    expect(memory.screepsmodTesting.sources.player).to.deep.include(playerSummary);
    expect(memory.screepsmodTestingPlayer).to.deep.equal(playerSummary);
    expect(memory.screepsmodTestingBackend).to.deep.include({
      source: 'screepsmod-testing-backend-cronjob',
      failed: 0,
      tick: 610
    });
  });

  it('skips runtime assertions until uploaded bot code has warmed up', async () => {
    const envStore = new Map<string, string>([['gameTime', '150'], ['memory:user1', '{}']]);
    let activeCode = { user: 'user1', activeWorld: true, modules: { main: '' } };
    let creeps: any[] = [];
    let cpuAvailable = 500;

    const config = {
      cronjobs: {},
      common: {
        storage: {
          env: {
            keys: { GAMETIME: 'gameTime', MEMORY: 'memory:' },
            get: async (key: string) => envStore.get(key),
            set: async (key: string, value: string) => { envStore.set(key, value); }
          },
          db: {
            users: { findOne: async ({ username }: any) => username === 'swarm-bot' ? { _id: 'user1', username, cpuAvailable } : null },
            'users.code': { findOne: async () => activeCode },
            'rooms.objects': {
              find: async (query: any) => {
                if (query.type === 'controller') return [{ room: 'W1N1', user: 'user1' }];
                if (query.type === 'spawn') return [{ room: 'W1N1', user: 'user1' }];
                if (query.type === 'creep') return creeps;
                return [];
              }
            }
          }
        }
      }
    };

    installTestingMod(config);

    (config.cronjobs as any).screepsmodTesting[1]();
    await new Promise(resolve => setImmediate(resolve));
    let memory = JSON.parse(envStore.get('memory:user1') ?? '{}');
    expect(memory.screepsmodTesting).to.deep.include({ failed: 0, skipped: 11, tick: 150 });
    expect(memory.__screepsmodTestingBotCodeSeenAt).to.equal(undefined);

    activeCode = { user: 'user1', activeWorld: true, modules: { main: 'module.exports.loop = function() {};' } };
    envStore.set('gameTime', '160');
    (config.cronjobs as any).screepsmodTesting[1]();
    await new Promise(resolve => setImmediate(resolve));
    memory = JSON.parse(envStore.get('memory:user1') ?? '{}');
    expect(memory.screepsmodTesting).to.deep.include({ failed: 0, skipped: 11, tick: 160 });
    expect(memory.__screepsmodTestingBotCodeSeenAt).to.equal(160);

    envStore.set('gameTime', '661');
    envStore.set('memory:user1', JSON.stringify({ ...createWarmRuntimeMemory(), ...memory }));
    creeps = [{ room: 'W1N1', user: 'user1' }];
    cpuAvailable = 9000;
    (config.cronjobs as any).screepsmodTesting[1]();
    await new Promise(resolve => setImmediate(resolve));
    memory = JSON.parse(envStore.get('memory:user1') ?? '{}');
    expect(memory.screepsmodTesting).to.deep.include({ failed: 0, skipped: 0, tick: 661 });
  });

  it('supports ObjectId-like user IDs when filtering bot-owned room objects', async () => {
    const envStore = new Map<string, string>([
      ['gameTime', '600'],
      ['memory:user1', JSON.stringify({
        ...createWarmRuntimeMemory({ __screepsmodTestingBotCodeSeenAt: 0 })
      })],
    ]);
    const objectId = {
      toString: () => 'user1',
      toHexString: () => 'user1',
    };

    const config = {
      cronjobs: {},
      common: {
        storage: {
          env: {
            keys: { GAMETIME: 'gameTime', MEMORY: 'memory:' },
            get: async (key: string) => envStore.get(key),
            set: async (key: string, value: string) => { envStore.set(key, value); },
          },
          db: {
            users: {
              findOne: async ({ username }: any) =>
                username === 'swarm-bot' ? { _id: objectId, username, cpuAvailable: 9000 } : null,
            },
            'users.code': { findOne: async () => ({ user: 'user1', activeWorld: true, modules: { main: 'module.exports.loop = function() {};' } }) },
            'rooms.objects': {
              find: async (query: any) => {
                if (query.type === 'controller' && query.$or) return [{ room: 'W1N1', user: 'user1' }];
                if (query.type === 'spawn' && query.$or) return [{ room: 'W1N1', user: 'user1' }];
                if (query.type === 'creep' && query.$or) return [{ room: 'W1N1', user: 'user1' }];
                return [];
              }
            }
          }
        }
      }
    };

    installTestingMod(config);
    (config.cronjobs as any).screepsmodTesting[1]();
    await new Promise(resolve => setImmediate(resolve));

    const memory = JSON.parse(envStore.get('memory:user1') ?? '{}');
    expect(memory.screepsmodTesting).to.deep.include({
      source: 'screepsmod-testing-merged',
      failed: 0,
      skipped: 0,
      tick: 600,
    });
    expect(memory.screepsmodTesting.total).to.be.greaterThan(8);
  });

  it('supports ObjectId-like user IDs for users.code runtime warmup filtering', async () => {
    const envStore = new Map<string, string>([
      ['gameTime', '600'],
      [
        'memory:user1',
        JSON.stringify(createWarmRuntimeMemory({ __screepsmodTestingBotCodeSeenAt: undefined })),
      ],
    ]);

    const objectId = {
      toString: () => 'user1',
      toHexString: () => 'user1',
    };

    const queryUserMatch = (query: any) => {
      const orClauses = Array.isArray(query?.$or) ? query.$or : [];
      return (
        query?.user === objectId ||
        String(query?.user ?? '') === 'user1' ||
        orClauses.some(
          (clause: any) =>
            clause?.user === objectId || String(clause?.user ?? '') === 'user1',
        )
      );
    };

    const config = {
      cronjobs: {},
      common: {
        storage: {
          env: {
            keys: { GAMETIME: 'gameTime', MEMORY: 'memory:' },
            get: async (key: string) => envStore.get(key),
            set: async (key: string, value: string) => {
              envStore.set(key, value);
            },
          },
          db: {
            users: {
              findOne: async ({ username }: any) =>
                username === 'swarm-bot' ? { _id: objectId, username, cpuAvailable: 9000 } : null,
            },
            'users.code': {
              findOne: async (query: any) =>
                queryUserMatch(query)
                  ? {
                      user: objectId,
                      activeWorld: true,
                      modules: {
                        main: 'module.exports.loop = function() {};',
                      },
                    }
                  : null,
            },
            'rooms.objects': {
              find: async (query: any) => {
                if (query.type === 'controller' && query.$or) return [{ room: 'W1N1', user: objectId }];
                if (query.type === 'spawn' && query.$or) return [{ room: 'W1N1', user: objectId }];
                if (query.type === 'creep' && query.$or) return [{ room: 'W1N1', user: objectId }];
                return [];
              },
            },
          },
        },
      },
      screepsmod: {
        testing: {
          runtimeWarmupTicks: 100,
        },
      },
    };

    installTestingMod(config);

    (config.cronjobs as any).screepsmodTesting[1]();
    await new Promise((resolve) => setImmediate(resolve));

    let memory = JSON.parse(envStore.get('memory:user1') ?? '{}');
    expect(memory.screepsmodTesting).to.deep.include({
      source: 'screepsmod-testing-merged',
      failed: 0,
      skipped: 11,
      tick: 600,
    });
    expect(memory.screepsmodTestingBackend.diagnostics.botRuntimeWarmed).to.equal(false);

    envStore.set('gameTime', '710');
    (config.cronjobs as any).screepsmodTesting[1]();
    await new Promise((resolve) => setImmediate(resolve));

    memory = JSON.parse(envStore.get('memory:user1') ?? '{}');
    expect(memory.screepsmodTesting).to.deep.include({
      source: 'screepsmod-testing-merged',
      failed: 0,
      skipped: 0,
      tick: 710,
    });
    expect(memory.screepsmodTestingBackend.diagnostics.botRuntimeWarmed).to.equal(true);
  });
});

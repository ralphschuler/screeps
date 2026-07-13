import { expect } from 'chai';
import EventEmitter from 'node:events';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const installTestingMod = require('../../../screepsmod-testing/src/backend.ts');
const { runBackendRuntimeAssertions } = require('../../../screepsmod-testing/src/runtime/backendAssertions.ts');

function createWarmRuntimeMemory(overrides: Record<string, any> = {}): any {
  const base = {
    __globalResetCount: 1,
    __screepsmodTestingBotCodeSeenAt: 0,
    __screepsmodTestingBotCodeIdentity: 'modules:main:36',
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
  it('registers a playerSandbox runner that writes bot-visible and durable results', () => {
    const engine = new EventEmitter();
    const durableResults = new Map<string, string>();
    const config = {
      engine,
      cronjobs: { genStrongholds: [], expandStrongholds: [] },
      common: {
        storage: {
          env: {
            set: async (key: string, value: string) => { durableResults.set(key, value); },
          },
        },
      },
    };

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
    context.__screepsmodTestingPlayerExecutionCount = 1200;
    context.__screepsmodTestingPlayerRuntimeCodeIdentity = 'modules:main:36';

    const sandbox = {
      run(code: string) {
        return vm.runInContext(code, context);
      },
      get(name: string) {
        return context[name];
      },
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
    expect(context.__screepsmodTestingPlayerSummary).to.deep.include({
      source: 'screepsmod-testing-player-sandbox',
      failed: 0,
      skipped: 0,
      tick: 600,
    });
    expect(JSON.parse(durableResults.get('screepsmodTestingPlayerSummary:bot-user-id') ?? '{}')).to.deep.include({
      source: 'screepsmod-testing-player-sandbox',
      failed: 0,
      skipped: 0,
      tick: 600,
    });
  });

  it('refreshes player assertions from later loop executions without recreating the sandbox', () => {
    const engine = new EventEmitter();
    installTestingMod({
      engine,
      screepsmod: { testing: { runtimeWarmupTicks: 100 } },
    });

    const memory: any = createWarmRuntimeMemory({
      __screepsmodTestingBotCodeSeenAt: 0,
    });
    let loopRuns = 0;
    const mainModule = {
      loop() {
        loopRuns += 1;
        return loopRuns;
      },
    };
    const context = vm.createContext({
      Game: createWarmGame(1),
      Memory: memory,
      global: {},
      require(moduleName: string) {
        if (moduleName === 'main') return mainModule;
        throw new Error(`Unknown module ${moduleName}`);
      },
    });
    context.global = context;

    engine.emit('playerSandbox', {
      run(code: string) {
        return vm.runInContext(code, context);
      },
    }, 'bot-user-id');

    expect(memory.screepsmodTestingPlayer).to.deep.include({
      runtimeWarmed: false,
      runtimeExecutions: 1,
      tick: 1,
    });

    context.Game.time = 49;
    expect(mainModule.loop()).to.equal(1);
    expect(memory.screepsmodTestingPlayer.tick).to.equal(1);

    context.Game.time = 100;
    expect(mainModule.loop()).to.equal(2);
    expect(memory.screepsmodTestingPlayer).to.deep.include({
      runtimeWarmed: true,
      runtimeAge: 100,
      runtimeExecutions: 2,
      tick: 100,
    });
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
    context.__screepsmodTestingPlayerExecutionCount = 1200;
    context.__screepsmodTestingPlayerRuntimeCodeIdentity = 'modules:main:36';

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

  it('warms a sparse player-sandbox callback from persisted bot-code age', () => {
    const engine = new EventEmitter();
    installTestingMod({
      engine,
      screepsmod: { testing: { runtimeWarmupTicks: 100 } },
    });

    const memory: any = createWarmRuntimeMemory({
      __screepsmodTestingBotCodeSeenAt: 0,
    });
    const context = vm.createContext({
      Game: createWarmGame(150),
      Memory: memory,
      global: {},
    });
    context.global = context;
    context.__screepsmodTestingPlayerExecutionCount = 1;
    context.__screepsmodTestingPlayerRuntimeCodeIdentity = 'modules:main:36';

    engine.emit('playerSandbox', {
      run(code: string) {
        return vm.runInContext(code, context);
      },
    }, 'bot-user-id');

    expect(memory.screepsmodTestingPlayer).to.deep.include({
      runtimeExecutions: 2,
      runtimeAge: 150,
      runtimeWarmed: true,
      skipped: 1,
      tick: 150,
    });
  });

  it('warms from completed player-sandbox executions instead of skipped game ticks', () => {
    const engine = new EventEmitter();
    installTestingMod({
      engine,
      screepsmod: { testing: { runtimeWarmupTicks: 100 } },
    });

    const memory: any = createWarmRuntimeMemory({
      __screepsmodTestingBotCodeIdentity: undefined,
    });
    const context = vm.createContext({
      Game: createWarmGame(150),
      Memory: memory,
      global: {},
    });
    context.global = context;
    const sandbox = {
      run(code: string) {
        return vm.runInContext(code, context);
      },
    };

    engine.emit('playerSandbox', sandbox, 'bot-user-id');
    expect(memory.screepsmodTestingPlayer).to.deep.include({
      failed: 0,
      skipped: 14,
      runtimeWarmed: false,
      tick: 150,
    });

    context.Game.time = 10_000;
    engine.emit('playerSandbox', sandbox, 'bot-user-id');
    expect(memory.screepsmodTestingPlayer).to.deep.include({
      failed: 0,
      skipped: 14,
      runtimeWarmed: false,
      tick: 10_000,
    });

    for (let execution = 0; execution < 99; execution += 1) {
      context.Game.time += 1;
      engine.emit('playerSandbox', sandbox, 'bot-user-id');
    }
    expect(memory.screepsmodTestingPlayer).to.deep.include({
      failed: 0,
      skipped: 1,
      runtimeWarmed: true,
      tick: 10_099,
    });
    expect(context.__screepsmodTestingPlayerExecutionCount).to.equal(101);
  });

  it('preserves player-sandbox maturity across a runtime global reset', () => {
    const engine = new EventEmitter();
    installTestingMod({
      engine,
      screepsmod: { testing: { runtimeWarmupTicks: 100 } },
    });

    const memory: any = createWarmRuntimeMemory({
      screepsmodTestingPlayer: {
        source: 'screepsmod-testing-player-sandbox',
        runtimeExecutions: 100,
        runtimeAge: 99,
        runtimeWarmed: false,
        runtimeCodeIdentity: 'modules:main:36',
        tick: 99,
      },
    });
    const context = vm.createContext({
      Game: createWarmGame(100),
      Memory: memory,
      global: {},
    });
    context.global = context;
    // A Screeps global reset clears the sandbox global, but not Memory.
    context.__screepsmodTestingPlayerExecutionCount = 0;
    context.__screepsmodTestingPlayerRuntimeCodeIdentity = undefined;

    engine.emit('playerSandbox', {
      run(code: string) {
        return vm.runInContext(code, context);
      },
    }, 'bot-user-id');

    expect(context.__screepsmodTestingPlayerExecutionCount).to.equal(101);
    expect(memory.screepsmodTestingPlayer).to.deep.include({
      runtimeExecutions: 101,
      runtimeAge: 100,
      runtimeWarmed: true,
      skipped: 1,
      tick: 100,
    });
  });

  it('does not reuse player-sandbox maturity after a bot-code identity change', () => {
    const engine = new EventEmitter();
    installTestingMod({
      engine,
      screepsmod: { testing: { runtimeWarmupTicks: 100 } },
    });

    const memory: any = createWarmRuntimeMemory({
      __screepsmodTestingBotCodeIdentity: 'modules:main:37',
      screepsmodTestingPlayer: {
        source: 'screepsmod-testing-player-sandbox',
        runtimeExecutions: 1200,
        runtimeAge: 1199,
        runtimeWarmed: true,
        runtimeCodeIdentity: 'modules:main:36',
        tick: 1200,
      },
    });
    const context = vm.createContext({
      Game: createWarmGame(100),
      Memory: memory,
      global: {},
    });
    context.global = context;
    context.__screepsmodTestingPlayerExecutionCount = 1200;
    context.__screepsmodTestingPlayerRuntimeCodeIdentity = 'modules:main:36';

    engine.emit('playerSandbox', {
      run(code: string) {
        return vm.runInContext(code, context);
      },
    }, 'bot-user-id');

    expect(context.__screepsmodTestingPlayerExecutionCount).to.equal(1);
    expect(memory.screepsmodTestingPlayer).to.deep.include({
      runtimeExecutions: 1,
      runtimeAge: 0,
      runtimeWarmed: false,
      runtimeCodeIdentity: 'modules:main:37',
      tick: 100,
    });
  });

  it('preserves legacy player-sandbox maturity when code identity is unavailable', () => {
    const engine = new EventEmitter();
    installTestingMod({
      engine,
      screepsmod: { testing: { runtimeWarmupTicks: 100 } },
    });

    const memory: any = createWarmRuntimeMemory({
      __screepsmodTestingBotCodeIdentity: undefined,
      screepsmodTestingPlayer: {
        source: 'screepsmod-testing-player-sandbox',
        runtimeExecutions: 100,
        runtimeAge: 99,
        runtimeWarmed: false,
        tick: 99,
      },
    });
    const context = vm.createContext({
      Game: createWarmGame(100),
      Memory: memory,
      global: {},
    });
    context.global = context;
    context.__screepsmodTestingPlayerExecutionCount = 100;

    engine.emit('playerSandbox', {
      run(code: string) {
        return vm.runInContext(code, context);
      },
    }, 'bot-user-id');

    expect(context.__screepsmodTestingPlayerExecutionCount).to.equal(101);
    expect(memory.screepsmodTestingPlayer).to.deep.include({
      runtimeExecutions: 101,
      runtimeAge: 100,
      runtimeWarmed: true,
      tick: 100,
    });
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
    context.__screepsmodTestingPlayerExecutionCount = context.Game.time;

    engine.emit('playerSandbox', {
      run(code: string) {
        return vm.runInContext(code, context);
      }
    }, 'bot-user-id');

    expect(memory.screepsmodTestingPlayer.failures.map((failure: any) => failure.name)).to.not.include(
      'all creeps expose role memory'
    );
  });

  it('does not accept a home-room defense signal as spawnless recovery evidence', () => {
    const engine = new EventEmitter();
    installTestingMod({
      engine,
      screepsmod: { testing: { runtimeWarmupTicks: 100, scenarios: ['spawnless-siege'] } }
    });

    const memory: any = createWarmRuntimeMemory({
      screepsmodTestingScenarios: {
        names: ['spawnless-siege'],
        rooms: { home: 'W1N1', recovery: 'W1N4' }
      },
      defenseRequests: [{ roomName: 'W1N1', urgency: 3 }]
    });
    const recoveryRoom = {
      name: 'W1N4',
      controller: { my: true },
      find: (type: number) => type === 2 ? [{ structureType: 'spawn' }] : []
    };
    const context = vm.createContext({
      Game: {
        ...createWarmGame(1300),
        rooms: {
          W1N1: {
            name: 'W1N1',
            controller: { my: true },
            terminal: { my: true, store: { energy: 6000 } },
            find: () => []
          },
          W1N4: recoveryRoom
        }
      },
      Memory: memory,
      FIND_MY_SPAWNS: 1,
      FIND_MY_CONSTRUCTION_SITES: 2,
      STRUCTURE_SPAWN: 'spawn',
      RESOURCE_ENERGY: 'energy',
      global: {}
    });
    context.global = context;
    context.__screepsmodTestingPlayerExecutionCount = 1200;
    context.__screepsmodTestingPlayerRuntimeCodeIdentity = 'modules:main:36';

    engine.emit('playerSandbox', {
      run(code: string) {
        return vm.runInContext(code, context);
      }
    }, 'bot-user-id');

    expect(memory.screepsmodTestingPlayer.failures.map((failure: any) => failure.name)).to.include(
      'spawnless-siege preserves recovery continuity under hostile pressure'
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
    context.__screepsmodTestingPlayerExecutionCount = context.Game.time;

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
    context.__screepsmodTestingPlayerExecutionCount = context.Game.time;
    context.__screepsmodTestingPlayerRuntimeCodeIdentity = 'modules:main:36';

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

  it('records object-level hard-invader seed diagnostics in backend summaries', async () => {
    const hardBody = [
      ...Array(5).fill('tough'),
      ...Array(25).fill('ranged_attack'),
      ...Array(10).fill('move'),
      ...Array(10).fill('heal'),
    ].map(type => ({ type, hits: 100 }));
    const hardInvader = {
      _id: 'hard1',
      type: 'creep',
      room: 'W1N1',
      name: 'ScenarioHardInvader',
      user: 'enemy1',
      body: hardBody,
      hits: 5000,
      hitsMax: 5000,
      ticksToLive: 4999,
      x: 23,
      y: 25,
      spawning: false,
    };
    const memory = createWarmRuntimeMemory({
      screepsmodTestingScenarios: {
        names: ['defense-hard-invader'],
        rooms: { home: 'W1N1' },
        hardInvader: {
          seeded: true,
          objectId: 'hard1',
          name: 'ScenarioHardInvader',
          room: 'W1N1',
          user: 'enemy1',
          username: 'ScenarioHardInvader',
          bodyParts: 50,
          bodyTypes: hardBody.map(part => part.type),
        },
      },
    });

    const summary = await runBackendRuntimeAssertions({
      config: {},
      storage: {
        db: {
          'rooms.objects': {
            find: async (query: any) => {
              if (query.type === 'creep' && query.name === 'ScenarioHardInvader') return [hardInvader];
              return [];
            },
          },
        },
      },
      memory,
      tick: 600,
      runtimeWarmupTicks: 100,
      botRuntimeWarmed: true,
      user: { cpuAvailable: 9000 },
      userId: 'user1',
      userIdFilter: { user: 'user1' },
      ownedControllers: [{ room: 'W1N1', user: 'user1' }],
      spawns: [{ room: 'W1N1', user: 'user1' }],
      creeps: [{ room: 'W1N1', user: 'user1', name: 'Worker1', body: [{ type: 'work', hits: 100 }] }],
      errorSamples: [],
      scenarios: ['defense-hard-invader'],
      startedAt: Date.now(),
    });

    expect(summary.failed).to.equal(0);
    expect(summary.diagnostics.scenarios.defenseHardInvader.creeps[0]).to.deep.include({
      objectId: 'hard1',
      name: 'ScenarioHardInvader',
      room: 'W1N1',
      user: 'enemy1',
      bodyParts: 50,
      hits: 5000,
      hitsMax: 5000,
      ticksToLive: 4999,
      x: 23,
      y: 25,
      spawning: false,
    });
    expect(summary.diagnostics.scenarios.defenseHardInvader.seed).to.deep.include({
      objectId: 'hard1',
      bodyParts: 50,
    });
  });

  it('uses durable hard-invader seed confirmation when runtime Memory lost the seed details', async () => {
    const memory = createWarmRuntimeMemory({
      screepsmodTestingScenarios: {
        names: ['defense-hard-invader'],
        rooms: { home: 'W1N1' },
      },
    });

    const summary = await runBackendRuntimeAssertions({
      config: {},
      storage: {
        db: {
          'rooms.objects': {
            find: async () => [],
          },
        },
      },
      memory,
      tick: 600,
      runtimeWarmupTicks: 100,
      botRuntimeWarmed: true,
      user: { cpuAvailable: 9000 },
      userId: 'user1',
      userIdFilter: { user: 'user1' },
      ownedControllers: [{ room: 'W1N1', user: 'user1' }],
      spawns: [{ room: 'W1N1', user: 'user1' }],
      creeps: [{ room: 'W1N1', user: 'user1', name: 'Worker1', body: [{ type: 'work', hits: 100 }] }],
      errorSamples: [],
      scenarios: ['defense-hard-invader'],
      startedAt: Date.now(),
      scenarioSeedConfirmation: {
        hardInvader: {
          seeded: true,
          objectId: 'hard1',
          name: 'ScenarioHardInvader',
          room: 'W1N1',
          bodyParts: 50,
        },
      },
    });

    expect(summary.failed).to.equal(0);
    expect(summary.diagnostics.scenarios.defenseHardInvader).to.deep.include({ count: 0 });
    expect(summary.diagnostics.scenarios.defenseHardInvader.seed).to.deep.include({
      objectId: 'hard1',
      bodyParts: 50,
    });
    expect(memory.screepsmodTestingScenarios.hardInvader).to.deep.include({
      objectId: 'hard1',
      bodyParts: 50,
    });
  });

  it('requires critical room-process telemetry for a nukerless nuke scenario', async () => {
    const base = createWarmRuntimeMemory();
    const memory = createWarmRuntimeMemory({
      screepsmodTestingScenarios: { names: ['nukerless-nuke'], rooms: { home: 'W1N1' } },
      empire: {
        ...base.empire,
        incomingNukes: [{
          roomName: 'W1N1',
          impactTick: 5000,
          timeToLand: 3000,
          sourceRoom: 'ScenarioNukeSource'
        }]
      },
      rooms: {
        W1N1: {
          ...base.rooms.W1N1,
          swarm: {
            ...base.rooms.W1N1.swarm,
            danger: 3,
            nukeDetected: true
          }
        }
      },
      stats: {
        ...base.stats,
        processes: {
          'room:W1N1': {
            name: 'Room W1N1 (owned) [nuke response]',
            priority: 100,
            cpu_budget: 0.12,
            min_bucket: 0
          }
        }
      }
    });

    const summary = await runBackendRuntimeAssertions({
      config: {},
      storage: {
        db: {
          'rooms.objects': {
            find: async (query: any) => query.type === 'nuke'
              ? [{ room: 'W1N1', launchRoomName: 'ScenarioNukeSource', landTime: 5000 }]
              : []
          }
        }
      },
      memory,
      tick: 2000,
      runtimeWarmupTicks: 100,
      botRuntimeWarmed: true,
      user: { cpuAvailable: 9000 },
      userId: 'user1',
      userIdFilter: { user: 'user1' },
      ownedControllers: [{ room: 'W1N1', user: 'user1' }],
      spawns: [{ room: 'W1N1', user: 'user1' }],
      creeps: [{ room: 'W1N1', user: 'user1', name: 'Worker1', body: [{ type: 'work', hits: 100 }] }],
      errorSamples: [],
      scenarios: ['nukerless-nuke'],
      startedAt: Date.now()
    });

    expect(summary.failed).to.equal(0);
    expect(summary.diagnostics.scenarios.nukeScheduling).to.deep.include({
      priority: 100,
      minBucket: 0,
      cpuBudget: 0.12,
      tickModulo: undefined
    });
  });

  it('accepts active task-board rooms with no open tasks after warmup', async () => {
    const memory = createWarmRuntimeMemory({
      creepTaskBoard: {
        rooms: {
          W1N1: {
            tasks: {},
            lastGeneratedTick: 590,
            lastCleanedTick: 600,
            stats: {
              generated: 3,
              assigned: 2,
              completed: 2,
              invalidated: 1,
              staleReservations: 0,
              preemptions: 0,
            },
          },
        },
      },
    });

    const summary = await runBackendRuntimeAssertions({
      config: {},
      storage: { db: { 'rooms.objects': { find: async () => [] } } },
      memory,
      tick: 600,
      runtimeWarmupTicks: 100,
      botRuntimeWarmed: true,
      user: { cpuAvailable: 9000 },
      userId: 'user1',
      userIdFilter: { user: 'user1' },
      ownedControllers: [{ room: 'W1N1', user: 'user1' }],
      spawns: [{ room: 'W1N1', user: 'user1' }],
      creeps: [{ room: 'W1N1', user: 'user1', name: 'Worker1', body: [{ type: 'work', hits: 100 }] }],
      errorSamples: [],
      scenarios: [],
      startedAt: Date.now(),
    });

    expect(summary.failures.map((failure: any) => failure.name)).to.not.include('backend task board records activity');
    expect(summary.failed).to.equal(0);
  });

  it('fails active task-board assertion when warm boards have no tasks or activity', async () => {
    const memory = createWarmRuntimeMemory({
      creepTaskBoard: {
        rooms: {
          W1N1: { tasks: {}, lastGeneratedTick: 0, lastCleanedTick: 0, stats: {} },
        },
      },
    });

    const summary = await runBackendRuntimeAssertions({
      config: {},
      storage: { db: { 'rooms.objects': { find: async () => [] } } },
      memory,
      tick: 600,
      runtimeWarmupTicks: 100,
      botRuntimeWarmed: true,
      user: { cpuAvailable: 9000 },
      userId: 'user1',
      userIdFilter: { user: 'user1' },
      ownedControllers: [{ room: 'W1N1', user: 'user1' }],
      spawns: [{ room: 'W1N1', user: 'user1' }],
      creeps: [{ room: 'W1N1', user: 'user1', name: 'Worker1', body: [{ type: 'work', hits: 100 }] }],
      errorSamples: [],
      scenarios: [],
      startedAt: Date.now(),
    });

    expect(summary.failures.map((failure: any) => failure.name)).to.include('backend task board records activity');
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
    context.__screepsmodTestingPlayerExecutionCount = context.Game.time;

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

  it('serializes overlapping backend cronjob executions to prevent stale Memory writes', async () => {
    const envStore = new Map<string, string>([
      ['gameTime', '150'],
      ['memory:user1', JSON.stringify(createWarmRuntimeMemory())],
    ]);
    let activeUserReads = 0;
    let maximumActiveUserReads = 0;
    let userReadCount = 0;
    let releaseFirstUserRead: (() => void) | undefined;
    let firstUserReadStarted: (() => void) | undefined;
    const firstUserRead = new Promise<void>((resolve) => { firstUserReadStarted = resolve; });
    const firstUserReadRelease = new Promise<void>((resolve) => { releaseFirstUserRead = resolve; });
    const user = { _id: 'user1', username: 'swarm-bot', cpuAvailable: 9000 };
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
              findOne: async ({ username }: any) => {
                if (username !== 'swarm-bot') return null;
                userReadCount += 1;
                activeUserReads += 1;
                maximumActiveUserReads = Math.max(maximumActiveUserReads, activeUserReads);
                if (userReadCount === 1) {
                  firstUserReadStarted?.();
                  await firstUserReadRelease;
                }
                activeUserReads -= 1;
                return user;
              },
            },
            'users.notifications': { find: async () => [] },
            'rooms.objects': {
              find: async (query: any) => {
                if (query.type === 'controller') return [{ room: 'W1N1', user: 'user1' }];
                if (query.type === 'spawn') return [{ room: 'W1N1', user: 'user1' }];
                if (query.type === 'creep') return [{ room: 'W1N1', user: 'user1' }];
                return [];
              },
            },
          },
        },
      },
    };

    installTestingMod(config);
    const cronjob = (config.cronjobs as any).screepsmodTesting[1];
    const firstRun = cronjob();
    await firstUserRead;
    const secondRun = cronjob();
    await new Promise(resolve => setImmediate(resolve));

    expect(maximumActiveUserReads).to.equal(1);
    releaseFirstUserRead?.();
    await Promise.all([firstRun, secondRun]);
  });

  it('loads durable scenario seed confirmation from backend storage env', async () => {
    const envStore = new Map<string, string>([
      ['gameTime', '600'],
      ['memory:user1', JSON.stringify(createWarmRuntimeMemory({
        screepsmodTestingScenarios: { names: ['defense-hard-invader'], rooms: { home: 'W1N1' } },
      }))],
      ['screepsmodTestingScenarioSeed:user1', JSON.stringify({
        hardInvader: {
          seeded: true,
          objectId: 'hard1',
          name: 'ScenarioHardInvader',
          room: 'W1N1',
          bodyParts: 50,
        },
      })],
    ]);
    const config = {
      cronjobs: {},
      screepsmod: { testing: { scenarios: ['defense-hard-invader'] } },
      common: {
        storage: {
          env: {
            keys: { GAMETIME: 'gameTime', MEMORY: 'memory:' },
            get: async (key: string) => envStore.get(key),
            set: async (key: string, value: string) => { envStore.set(key, value); },
          },
          db: {
            users: { findOne: async ({ username }: any) => username === 'swarm-bot' ? { _id: 'user1', username, cpuAvailable: 9000 } : null },
            'rooms.objects': {
              find: async (query: any) => {
                if (query.type === 'controller') return [{ room: 'W1N1', user: 'user1' }];
                if (query.type === 'spawn') return [{ room: 'W1N1', user: 'user1' }];
                if (query.type === 'creep' && query.name === 'ScenarioHardInvader') return [];
                if (query.type === 'creep') return [{ room: 'W1N1', user: 'user1' }];
                return [];
              },
            },
          },
        },
      },
    };

    installTestingMod(config);
    (config.cronjobs as any).screepsmodTesting[1]();
    await new Promise(resolve => setImmediate(resolve));

    const memory = JSON.parse(envStore.get('memory:user1') ?? '{}');
    expect(memory.screepsmodTestingBackend).to.deep.include({ failed: 0, skipped: 0, tick: 600 });
    expect(memory.screepsmodTestingBackend.diagnostics.scenarios.defenseHardInvader).to.deep.include({ count: 0 });
    expect(memory.screepsmodTestingBackend.diagnostics.scenarios.defenseHardInvader.seed).to.deep.include({
      objectId: 'hard1',
      bodyParts: 50,
    });
    expect(memory.screepsmodTestingScenarios.hardInvader).to.deep.include({
      objectId: 'hard1',
      bodyParts: 50,
    });
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

  it('supports ObjectId-like user IDs and durable runtime warmup evidence when player Memory is stale', async () => {
    const stalePlayerSummary = {
      source: 'screepsmod-testing-player-sandbox',
      total: 25,
      passed: 25,
      failed: 0,
      skipped: 0,
      failures: [],
      runtimeWarmed: true,
      runtimeWarmupTicks: 100,
      tick: 1,
      duration: 1,
    };
    const envStore = new Map<string, string>([
      ['gameTime', '600'],
      [
        'memory:user1',
        JSON.stringify({
          ...createWarmRuntimeMemory({ __screepsmodTestingBotCodeSeenAt: undefined }),
          screepsmodTesting: stalePlayerSummary,
          screepsmodTestingPlayer: stalePlayerSummary,
        }),
      ],
    ]);

    const objectId = {
      toString: () => 'user1',
      toHexString: () => 'user1',
    };

    let activeCode = {
      user: objectId,
      activeWorld: true,
      timestamp: 1,
      modules: { main: 'module.exports.loop = function() {};' },
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
            get: async (key: string) => envStore.has(key) ? envStore.get(key) : null,
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
              findOne: async (query: any) => queryUserMatch(query) ? activeCode : null,
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

    delete memory.__screepsmodTestingBotCodeSeenAt;
    envStore.set('memory:user1', JSON.stringify(memory));
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
    expect(memory.screepsmodTesting.sources.player).to.equal(undefined);
    expect(memory.screepsmodTestingPlayer).to.deep.equal(stalePlayerSummary);
    expect(memory.screepsmodTestingBackend.diagnostics).to.deep.include({
      botRuntimeWarmed: true,
      playerSandboxSummarySource: 'memory',
      playerSandboxSummaryMerged: false,
    });

    activeCode = { ...activeCode, timestamp: 2 };
    envStore.set('gameTime', '720');
    (config.cronjobs as any).screepsmodTesting[1]();
    await new Promise((resolve) => setImmediate(resolve));

    memory = JSON.parse(envStore.get('memory:user1') ?? '{}');
    expect(memory.screepsmodTestingBackend).to.deep.include({
      failed: 0,
      skipped: 11,
      runtimeWarmed: false,
      tick: 720,
    });

    envStore.set('gameTime', '821');
    (config.cronjobs as any).screepsmodTesting[1]();
    await new Promise((resolve) => setImmediate(resolve));

    memory = JSON.parse(envStore.get('memory:user1') ?? '{}');
    expect(memory.screepsmodTestingBackend).to.deep.include({
      failed: 0,
      skipped: 0,
      runtimeWarmed: true,
      tick: 821,
    });
  });
});

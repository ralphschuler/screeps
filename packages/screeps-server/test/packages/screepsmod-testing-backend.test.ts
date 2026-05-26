import { expect } from 'chai';
import EventEmitter from 'node:events';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const installTestingMod = require('../../../screepsmod-testing/src/backend.ts');

describe('screepsmod-testing backend mod', () => {
  it('registers a playerSandbox runner that writes bot-visible Memory results', () => {
    const engine = new EventEmitter();
    const config = { engine, cronjobs: { genStrongholds: [], expandStrongholds: [] } };

    installTestingMod(config);

    expect(config.cronjobs).to.not.have.property('genStrongholds');
    expect(config.cronjobs).to.not.have.property('expandStrongholds');
    expect(engine.listenerCount('playerSandbox')).to.equal(1);

    const memory: any = { creepTaskBoard: { rooms: { W1N1: {} } }, __globalResetCount: 1 };
    const context = vm.createContext({
      Game: {
        time: 150,
        rooms: { W1N1: { controller: { my: true } } },
        spawns: { Spawn1: {} },
        creeps: { Harvester1: {} },
        cpu: { bucket: 9000 }
      },
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
      source: 'screepsmod-testing-player-sandbox',
      total: 8,
      passed: 8,
      failed: 0,
      skipped: 0,
      tick: 150
    });
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

    expect(memory.screepsmodTesting.source).to.equal('screepsmod-testing-player-sandbox');
    expect(memory.screepsmodTesting.failed).to.be.greaterThan(0);
    expect(memory.screepsmodTesting.failures.map((failure: any) => failure.name)).to.include('our bot has at least one owned visible room');
  });

  it('registers a backend cronjob that writes bot test results even when user code cannot persist Memory', async () => {
    const envStore = new Map<string, string>([['gameTime', '150'], ['memory:user1', JSON.stringify({ creepTaskBoard: { rooms: { W1N1: {} } } })]]);
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
      source: 'screepsmod-testing-backend-cronjob',
      total: 8,
      passed: 8,
      failed: 0,
      skipped: 0,
      tick: 150
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
    expect(memory.screepsmodTesting).to.deep.include({ failed: 0, skipped: 3, tick: 150 });
    expect(memory.__screepsmodTestingBotCodeSeenAt).to.equal(undefined);

    activeCode = { user: 'user1', activeWorld: true, modules: { main: 'module.exports.loop = function() {};' } };
    envStore.set('gameTime', '160');
    (config.cronjobs as any).screepsmodTesting[1]();
    await new Promise(resolve => setImmediate(resolve));
    memory = JSON.parse(envStore.get('memory:user1') ?? '{}');
    expect(memory.screepsmodTesting).to.deep.include({ failed: 0, skipped: 3, tick: 160 });
    expect(memory.__screepsmodTestingBotCodeSeenAt).to.equal(160);

    envStore.set('gameTime', '261');
    envStore.set('memory:user1', JSON.stringify({ ...memory, creepTaskBoard: { rooms: { W1N1: {} } } }));
    creeps = [{ room: 'W1N1', user: 'user1' }];
    cpuAvailable = 9000;
    (config.cronjobs as any).screepsmodTesting[1]();
    await new Promise(resolve => setImmediate(resolve));
    memory = JSON.parse(envStore.get('memory:user1') ?? '{}');
    expect(memory.screepsmodTesting).to.deep.include({ failed: 0, skipped: 0, tick: 261 });
  });
});

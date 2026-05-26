/**
 * Backend hook for screepsmod-testing
 *
 * This file integrates the testing framework with the Screeps private server.
 * Screeps mods are activated by mutating the supplied config object; returning
 * hook objects is not part of the private-server mod API.
 */

import { testRunner } from './index';
import { TestContext, TestFilter } from './types';
import { PersistenceManager } from './persistence';
import { JSONReporter, ConsoleReporter } from './reporter';

let initialized = false;
let testInterval = 0; // Run tests every N ticks (0 = run once for legacy runner)
let lastTestTick = 0;
let autoRunTests = false;
let persistenceManager: PersistenceManager | null = null;
let jsonReporter: JSONReporter | null = null;
let consoleReporter: ConsoleReporter | null = null;
let outputFormat: 'console' | 'json' | 'junit' | 'all' = 'console';
let testFilter: TestFilter | undefined;
let testFiles: string[] = [];
let latestSummary: any = null;

const PLAYER_SANDBOX_TEST_SOURCE = `
(function screepsmodTestingPlayerSandbox() {
  const started = Date.now();
  const failures = [];
  let passed = 0;
  let skipped = 0;

  function pass() { passed += 1; }
  function skip() { skipped += 1; }
  function assert(name, predicate, details) {
    try {
      if (predicate()) {
        pass();
      } else {
        failures.push({ name, message: details || 'assertion failed' });
      }
    } catch (error) {
      failures.push({ name, message: error && (error.stack || error.message) || String(error) });
    }
  }

  const game = typeof Game === 'object' && Game ? Game : {};
  const memory = typeof Memory === 'object' && Memory ? Memory : {};
  const rooms = Object.values(game.rooms || {});
  const ownedRooms = rooms.filter(room => room && room.controller && room.controller.my);
  const tick = Number(game.time || 0);

  assert('server exposes Game and advances ticks', () => tick > 0, 'Game.time did not advance');
  assert('our bot has at least one owned visible room', () => ownedRooms.length > 0, 'no owned visible rooms');
  assert('owned room has a spawn after initialization', () => Object.keys(game.spawns || {}).length > 0, 'no owned spawns');
  assert('global reset loop is not detected', () => (memory.__globalResetCount || 0) < 5, 'too many global resets');

  if (tick < 100) {
    skip();
  } else {
    assert('creep population exists after warmup', () => Object.keys(game.creeps || {}).length > 0, 'no creeps after warmup');
  }

  if (tick < 100) {
    skip();
  } else {
    assert('CPU bucket is not chronically empty', () => ((game.cpu && game.cpu.bucket) || 10000) > 1000, 'CPU bucket below 1000');
  }

  if (tick < 100) {
    skip();
  } else {
    assert(
      'task board memory exists and can track room tasks',
      () => Object.keys(((memory.creepTaskBoard || {}).rooms) || {}).length > 0,
      'Memory.creepTaskBoard.rooms is empty'
    );
  }

  assert('critical console error counter stays below threshold', () => (memory.ciCriticalConsoleErrors || 0) < 10, 'critical console errors above threshold');

  memory.screepsmodTesting = {
    source: 'screepsmod-testing-player-sandbox',
    total: passed + failures.length + skipped,
    passed,
    failed: failures.length,
    skipped,
    failures,
    tick,
    duration: Date.now() - started
  };
}).call(global);
`;

function installPlayerSandboxRunner(config: any): void {
  if (!config.engine?.on) return;

  config.engine.on('playerSandbox', (sandbox: any) => {
    try {
      sandbox.run(PLAYER_SANDBOX_TEST_SOURCE);
    } catch (error: any) {
      console.log(`[screepsmod-testing] playerSandbox test runner failed: ${error?.stack || error?.message || String(error)}`);
    }
  });
}

function installCliCommands(config: any): void {
  if (!config.cli?.on) return;

  config.cli.on('cliSandbox', (sandbox: any) => {
    sandbox.getTestSummary = () => latestSummary ?? null;
    sandbox.printTestSummary = () => {
      const summary = latestSummary ?? null;
      sandbox.print(JSON.stringify(summary));
      return summary;
    };
  });
}

function disableUnstableNpcCronjobs(config: any): void {
  // The Docker CI world can start with incomplete terrain data for NPC stronghold
  // generation on Screeps 4.3.0 + Node 22. Disable these optional NPC cronjobs
  // so auth/upload smoke tests are not interrupted by backend reset loops.
  if (config.cronjobs) {
    delete config.cronjobs.genStrongholds;
    delete config.cronjobs.expandStrongholds;
    console.log('[screepsmod-testing] Disabled NPC stronghold cronjobs for test server stability');
  }
}

async function readBotCodeState(storage: any, userId: any): Promise<{ hasBotCode: boolean; bypassWarmup: boolean }> {
  const codeCollection = storage.db['users.code'];
  if (!codeCollection?.findOne) return { hasBotCode: true, bypassWarmup: true };

  const activeCode = await codeCollection.findOne({
    user: String(userId),
    activeWorld: true
  });
  const modules = activeCode?.modules ?? {};
  return {
    hasBotCode: Object.values(modules).some(module => typeof module === 'string' && module.trim().length > 0),
    bypassWarmup: false
  };
}

function isBotRuntimeWarmed(
  memory: any,
  tick: number,
  botCodeState: { hasBotCode: boolean; bypassWarmup: boolean },
  warmupTicks: number
): boolean {
  if (!botCodeState.hasBotCode) {
    delete memory.__screepsmodTestingBotCodeSeenAt;
    return false;
  }

  if (botCodeState.bypassWarmup) return true;

  if (typeof memory.__screepsmodTestingBotCodeSeenAt !== 'number') {
    memory.__screepsmodTestingBotCodeSeenAt = tick;
  }

  return tick - memory.__screepsmodTestingBotCodeSeenAt >= warmupTicks;
}

async function runBackendBotAssertions(config: any): Promise<void> {
  const started = Date.now();
  const failures: Array<{ name: string; message: string }> = [];
  let passed = 0;
  let skipped = 0;
  const assert = (name: string, predicate: () => boolean, message: string) => {
    try {
      if (predicate()) passed += 1;
      else failures.push({ name, message });
    } catch (error: any) {
      failures.push({ name, message: error?.stack || error?.message || String(error) });
    }
  };
  const skipRuntimeAssertion = () => { skipped += 1; };

  const common = config.common ?? require('@screeps/common');
  const storage = common.storage;
  const username = config.screepsmod?.testing?.username ?? 'swarm-bot';
  const user = await storage.db.users.findOne({ username });
  if (!user?._id) return;

  const userId = user._id;
  const tick = Number(await storage.env.get(storage.env.keys.GAMETIME) ?? 0);
  const memoryKey = storage.env.keys.MEMORY + userId;
  const rawMemory = await storage.env.get(memoryKey);
  let memory: any = {};
  try {
    memory = rawMemory ? JSON.parse(rawMemory) : {};
  } catch (error: any) {
    memory = { __screepsmodTestingMemoryParseError: error?.message || String(error) };
  }

  const warmupTicks = Number(config.screepsmod?.testing?.runtimeWarmupTicks ?? 100);
  const botRuntimeWarmed = isBotRuntimeWarmed(
    memory,
    tick,
    await readBotCodeState(storage, userId),
    warmupTicks
  );

  const [ownedControllers, spawns, creeps] = await Promise.all([
    storage.db['rooms.objects'].find({ type: 'controller', user: userId }),
    storage.db['rooms.objects'].find({ type: 'spawn', user: userId }),
    storage.db['rooms.objects'].find({ type: 'creep', user: userId })
  ]);

  assert('server exposes storage and advances ticks', () => tick > 0, 'gameTime did not advance');
  assert('our bot has at least one owned room controller', () => ownedControllers.length > 0, 'no owned controllers');
  assert('owned room has a spawn after initialization', () => spawns.length > 0, 'no owned spawns');
  assert('global reset loop is not detected', () => (memory.__globalResetCount || 0) < 5, 'too many global resets');

  if (!botRuntimeWarmed) skipRuntimeAssertion();
  else assert('creep population exists after warmup', () => creeps.length > 0, 'no creeps after warmup');

  if (!botRuntimeWarmed) skipRuntimeAssertion();
  else assert('CPU bucket is not chronically empty', () => (user.cpuAvailable ?? 10000) > 1000, 'CPU bucket below 1000');

  if (!botRuntimeWarmed) skipRuntimeAssertion();
  else assert(
    'task board memory exists and can track room tasks',
    () => Object.keys(memory.creepTaskBoard?.rooms ?? {}).length > 0,
    'Memory.creepTaskBoard.rooms is empty'
  );

  assert('critical console error counter stays below threshold', () => (memory.ciCriticalConsoleErrors || 0) < 10, 'critical console errors above threshold');

  latestSummary = {
    source: 'screepsmod-testing-backend-cronjob',
    total: passed + failures.length + skipped,
    passed,
    failed: failures.length,
    skipped,
    failures,
    tick,
    duration: Date.now() - started
  };

  memory.screepsmodTesting = latestSummary;
  await storage.env.set(memoryKey, JSON.stringify(memory));
}

function installBackendCronjobRunner(config: any): void {
  if (!config.cronjobs) return;
  config.cronjobs.screepsmodTesting = [1, () => {
    runBackendBotAssertions(config).catch((error: any) => {
      console.log(`[screepsmod-testing] backend assertion cronjob failed: ${error?.stack || error?.message || String(error)}`);
    });
  }];
}

/**
 * Backend module export for screepsmod.
 */
module.exports = function (config: any) {
  console.log('[screepsmod-testing] Mod loaded');

  disableUnstableNpcCronjobs(config);
  installBackendCronjobRunner(config);
  installPlayerSandboxRunner(config);
  installCliCommands(config);

  // Read legacy framework configuration. The legacy runner is kept for package
  // consumers, but CI bot validation is performed through playerSandbox above.
  const modConfig = config.screepsmod?.testing || {};
  testInterval = modConfig.testInterval || 0;
  autoRunTests = modConfig.autoRun === true;
  outputFormat = modConfig.outputFormat || 'console';
  testFiles = Array.isArray(modConfig.testFiles) ? modConfig.testFiles : [];

  if (modConfig.persistence !== false) {
    persistenceManager = new PersistenceManager(
      modConfig.persistencePath,
      modConfig.historySize
    );
  }

  if (outputFormat === 'json' || outputFormat === 'all') {
    jsonReporter = new JSONReporter(modConfig.outputDir);
  }

  if (outputFormat === 'console' || outputFormat === 'all') {
    consoleReporter = new ConsoleReporter();
  }

  if (modConfig.filter) {
    testFilter = modConfig.filter;
  }

  return {
    async onServerStart() {
      if (testInterval > 0) {
        console.log(`[screepsmod-testing] Legacy tests will run every ${testInterval} ticks`);
      } else if (autoRunTests) {
        console.log('[screepsmod-testing] Legacy tests will run once on first tick');
      }
    },

    async onTickStart(tick: number, gameData: any) {
      if (!autoRunTests) return;
      if (!initialized) {
        await this.loadTests(gameData);
        initialized = true;
      }

      if (testInterval === 0 && lastTestTick === 0) {
        await this.runTests(tick, gameData);
      } else if (testInterval > 0 && (tick - lastTestTick >= testInterval)) {
        await this.runTests(tick, gameData);
      }
    },

    async loadTests(_gameData: any) {
      console.log('[screepsmod-testing] Loading legacy tests...');

      for (const file of testFiles) {
        try {
          console.log(`[screepsmod-testing] Loading test file ${file}`);
          require(file);
        } catch (error) {
          console.log(`[screepsmod-testing] Failed to load test file ${file}: ${error}`);
          throw error;
        }
      }

      const suites = testRunner.getSuites();
      console.log(`[screepsmod-testing] Loaded ${suites.length} legacy test suites`);
    },

    async runTests(tick: number, gameData: any) {
      console.log(`[screepsmod-testing] Running legacy tests at tick ${tick}`);
      lastTestTick = tick;

      const context: TestContext = {
        Game: gameData.Game || {},
        Memory: gameData.Memory || {},
        RawMemory: gameData.RawMemory || {},
        InterShardMemory: gameData.InterShardMemory || {},
        tick,
        getObjectById: (id: string) => gameData.Game?.getObjectById?.(id),
        getRoomObject: (roomName: string) => gameData.Game?.rooms?.[roomName]
      };

      await testRunner.start(context, testFilter);
      const summary = testRunner.getSummary(tick);
      latestSummary = summary;

      if (!gameData.__testResults) {
        gameData.__testResults = {};
      }
      gameData.__testResults = summary;
      if (gameData.Memory && typeof gameData.Memory === 'object') {
        gameData.Memory.screepsmodTesting = { ...summary, source: 'screepsmod-testing-legacy-runner' };
      }

      if (persistenceManager) persistenceManager.save(summary);
      if (jsonReporter) jsonReporter.write(jsonReporter.generate(summary));
      if (consoleReporter && (outputFormat === 'console' || outputFormat === 'all')) consoleReporter.printSummary(summary);
      if (outputFormat === 'junit' || outputFormat === 'all') {
        if (!jsonReporter) jsonReporter = new JSONReporter();
        jsonReporter.writeJUnit(summary);
      }
    }
  };
};

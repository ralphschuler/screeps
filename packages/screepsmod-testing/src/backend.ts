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
import { runBackendRuntimeAssertions } from './runtime/backendAssertions';
import { getConfiguredScenarios } from './runtime/config';
import { buildPlayerSandboxTestSource } from './runtime/playerAssertions';
import { mergeRuntimeSummaries } from './runtime/summary';

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

const DEFAULT_RUNTIME_WARMUP_TICKS = 100;

function getRuntimeWarmupTicks(config: any): number {
  const warmupTicks = Number(config.screepsmod?.testing?.runtimeWarmupTicks ?? DEFAULT_RUNTIME_WARMUP_TICKS);
  if (!Number.isFinite(warmupTicks) || warmupTicks < 0) return DEFAULT_RUNTIME_WARMUP_TICKS;
  return warmupTicks;
}

function installPlayerSandboxRunner(config: any): void {
  if (!config.engine?.on) return;

  const playerSandboxTestSource = buildPlayerSandboxTestSource(getRuntimeWarmupTicks(config), getConfiguredScenarios(config));

  config.engine.on('playerSandbox', (sandbox: any) => {
    try {
      sandbox.run(playerSandboxTestSource);
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
    ...makeUserObjectIdFilter(userId),
    activeWorld: true,
  });
  const modules = activeCode?.modules ?? {};
  return {
    hasBotCode: Object.values(modules).some(
      (module) => typeof module === 'string' && module.trim().length > 0,
    ),
    bypassWarmup: false,
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

function makeUserObjectIdFilter(userId: any): Record<string, any> {
  const userIdString = String(userId);
  if (typeof userId === 'string') return { user: userId };

  return {
    $or: [
      { user: userId },
      { user: userIdString }
    ]
  };
}

function asMemoryUserKey(userId: any): string {
  return String(userId);
}

async function readErrorNotifications(storage: any, userIdFilter: Record<string, any>): Promise<string[]> {
  const notificationsCollection = storage.db['users.notifications'];
  if (!notificationsCollection?.find) return [];

  const notifications = await notificationsCollection.find({
    type: 'error',
    ...userIdFilter
  });

  if (!Array.isArray(notifications)) return [];
  return notifications
    .map((notification: any) => String(notification?.message ?? notification?.error ?? notification ?? ''))
    .filter(Boolean)
    .slice(0, 3)
    .map(message => message.slice(0, 300));
}

async function runBackendBotAssertions(config: any): Promise<void> {
  const started = Date.now();
  const common = config.common ?? require('@screeps/common');
  const storage = common.storage;
  const username = config.screepsmod?.testing?.username ?? 'swarm-bot';
  const user = await storage.db.users.findOne({ username });
  if (!user?._id) return;

  const userId = user._id;
  const userIdFilter = makeUserObjectIdFilter(userId);
  const tick = Number(await storage.env.get(storage.env.keys.GAMETIME) ?? 0);
  const memoryKey = storage.env.keys.MEMORY + asMemoryUserKey(userId);
  const rawMemory = await storage.env.get(memoryKey);
  let memory: any = {};
  try {
    memory = rawMemory ? JSON.parse(rawMemory) : {};
  } catch (error: any) {
    memory = { __screepsmodTestingMemoryParseError: error?.message || String(error) };
  }

  const warmupTicks = getRuntimeWarmupTicks(config);
  const botRuntimeWarmed = isBotRuntimeWarmed(
    memory,
    tick,
    await readBotCodeState(storage, userId),
    warmupTicks
  );

  const [ownedControllers, spawns, creeps, errorSamples] = await Promise.all([
    storage.db['rooms.objects'].find({ type: 'controller', ...userIdFilter }),
    storage.db['rooms.objects'].find({ type: 'spawn', ...userIdFilter }),
    storage.db['rooms.objects'].find({ type: 'creep', ...userIdFilter }),
    readErrorNotifications(storage, userIdFilter)
  ]);

  const scenarios = getConfiguredScenarios(config);
  const backendSummary = await runBackendRuntimeAssertions({
    config,
    storage,
    memory,
    tick,
    runtimeWarmupTicks: warmupTicks,
    botRuntimeWarmed,
    user,
    userId,
    userIdFilter,
    ownedControllers,
    spawns,
    creeps,
    errorSamples,
    scenarios,
    startedAt: started
  });

  const mergedSummary = mergeRuntimeSummaries({
    player: memory.screepsmodTestingPlayer,
    backend: backendSummary,
    legacy: memory.screepsmodTestingLegacy
  }, tick, started, warmupTicks, scenarios);

  memory.screepsmodTestingBackend = backendSummary;
  memory.screepsmodTesting = mergedSummary;
  latestSummary = mergedSummary;
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
        const legacySummary = { ...summary, source: 'screepsmod-testing-legacy-runner', tick, failures: summary.results
          .filter(result => result.status === 'failed')
          .map(result => ({ name: `${result.suiteName} > ${result.testName}`, message: result.error?.message ?? 'legacy assertion failed', source: 'screepsmod-testing-legacy-runner' })) };
        gameData.Memory.screepsmodTestingLegacy = legacySummary;
        gameData.Memory.screepsmodTesting = mergeRuntimeSummaries({
          player: gameData.Memory.screepsmodTestingPlayer,
          backend: gameData.Memory.screepsmodTestingBackend,
          legacy: legacySummary
        }, tick, Date.now(), getRuntimeWarmupTicks(config), getConfiguredScenarios(config));
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

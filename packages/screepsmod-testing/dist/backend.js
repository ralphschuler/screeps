"use strict";
/**
 * Backend hook for screepsmod-testing
 *
 * This file integrates the testing framework with the Screeps server backend,
 * allowing tests to run within the game loop and access game state.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
let initialized = false;
let testInterval = 0; // Run tests every N ticks (0 = run once)
let lastTestTick = 0;
let autoRunTests = false;
/**
 * Backend module export for screepsmod
 */
module.exports = function (config) {
    // Read configuration
    const modConfig = config.screepsmod?.testing || {};
    testInterval = modConfig.testInterval || 0;
    autoRunTests = modConfig.autoRun !== false; // Default to true
    return {
        /**
         * Called when the backend starts
         */
        async onServerStart() {
            console.log('[screepsmod-testing] Mod loaded');
            if (testInterval > 0) {
                console.log(`[screepsmod-testing] Tests will run every ${testInterval} ticks`);
            }
            else if (autoRunTests) {
                console.log('[screepsmod-testing] Tests will run once on first tick');
            }
            else {
                console.log('[screepsmod-testing] Auto-run disabled, use console commands to run tests');
            }
        },
        /**
         * Called every game tick
         */
        async onTickStart(tick, gameData) {
            if (!initialized) {
                await this.loadTests(gameData);
                initialized = true;
            }
            // Auto-run tests based on configuration
            if (autoRunTests && (testInterval === 0 && lastTestTick === 0)) {
                // Run once on first tick
                await this.runTests(tick, gameData);
            }
            else if (testInterval > 0 && (tick - lastTestTick >= testInterval)) {
                // Run periodically
                await this.runTests(tick, gameData);
            }
        },
        /**
         * Load test files
         */
        async loadTests(gameData) {
            console.log('[screepsmod-testing] Loading tests...');
            // Tests are registered via the global describe/it functions
            // They should be loaded from the bot's code or separate test modules
            // For now, tests need to be registered by the bot code itself
            // The bot can require/import test modules that use describe/it
            const suites = index_1.testRunner.getSuites();
            console.log(`[screepsmod-testing] Loaded ${suites.length} test suites`);
            for (const suite of suites) {
                console.log(`[screepsmod-testing]   - ${suite.name} (${suite.tests.length} tests)`);
            }
        },
        /**
         * Run all registered tests
         */
        async runTests(tick, gameData) {
            console.log(`[screepsmod-testing] Running tests at tick ${tick}`);
            lastTestTick = tick;
            // Create test context with access to game state
            const context = {
                Game: gameData.Game || {},
                Memory: gameData.Memory || {},
                RawMemory: gameData.RawMemory || {},
                InterShardMemory: gameData.InterShardMemory || {},
                tick,
                getObjectById: (id) => {
                    return gameData.Game?.getObjectById?.(id);
                },
                getRoomObject: (roomName) => {
                    return gameData.Game?.rooms?.[roomName];
                }
            };
            await index_1.testRunner.start(context);
            const summary = index_1.testRunner.getSummary(tick);
            // Store results in a safe location (not in bot memory)
            // Initialize if doesn't exist
            if (!gameData.__testResults) {
                gameData.__testResults = {};
            }
            gameData.__testResults = summary;
        },
        /**
         * Register console commands
         */
        async consoleCommands() {
            return {
                /**
                 * Run all tests (note: tests will run automatically based on configuration)
                 */
                runTests: () => {
                    console.log('[screepsmod-testing] Tests run automatically based on testInterval configuration.');
                    console.log('[screepsmod-testing] To manually trigger tests, set testInterval > 0 or restart the server.');
                    return 'Tests are configured to run automatically. Use getTestSummary() to see results.';
                },
                /**
                 * List all registered tests
                 */
                listTests: () => {
                    const suites = index_1.testRunner.getSuites();
                    console.log(`[screepsmod-testing] Registered test suites: ${suites.length}`);
                    for (const suite of suites) {
                        console.log(`  ${suite.name}:`);
                        for (const test of suite.tests) {
                            const status = test.skip ? '[SKIPPED]' : '';
                            console.log(`    - ${test.name} ${status}`);
                        }
                    }
                    return `Found ${suites.length} test suites`;
                },
                /**
                 * Clear all test results
                 */
                clearTests: () => {
                    index_1.testRunner.clear();
                    return 'Test results cleared';
                },
                /**
                 * Get test summary
                 */
                getTestSummary: () => {
                    const summary = index_1.testRunner.getSummary(0);
                    return {
                        total: summary.total,
                        passed: summary.passed,
                        failed: summary.failed,
                        skipped: summary.skipped,
                        duration: summary.duration,
                        tickRange: `${summary.startTick}-${summary.endTick}`
                    };
                }
            };
        }
    };
};
//# sourceMappingURL=backend.js.map
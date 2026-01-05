"use strict";
/**
 * Backend hook for screepsmod-testing
 *
 * This file integrates the testing framework with the Screeps server backend,
 * allowing tests to run within the game loop and access game state.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var persistence_1 = require("./persistence");
var reporter_1 = require("./reporter");
var initialized = false;
var testInterval = 0; // Run tests every N ticks (0 = run once)
var lastTestTick = 0;
var autoRunTests = false;
var persistenceManager = null;
var jsonReporter = null;
var consoleReporter = null;
var outputFormat = 'console';
var testFilter;
/**
 * Backend module export for screepsmod
 */
module.exports = function (config) {
    var _a;
    // Read configuration
    var modConfig = ((_a = config.screepsmod) === null || _a === void 0 ? void 0 : _a.testing) || {};
    testInterval = modConfig.testInterval || 0;
    autoRunTests = modConfig.autoRun !== false; // Default to true
    outputFormat = modConfig.outputFormat || 'console';
    // Initialize managers based on configuration
    if (modConfig.persistence !== false) {
        persistenceManager = new persistence_1.PersistenceManager(modConfig.persistencePath, modConfig.historySize);
    }
    if (outputFormat === 'json' || outputFormat === 'all') {
        jsonReporter = new reporter_1.JSONReporter(modConfig.outputDir);
    }
    if (outputFormat === 'console' || outputFormat === 'all') {
        consoleReporter = new reporter_1.ConsoleReporter();
    }
    // Parse test filter from configuration
    if (modConfig.filter) {
        testFilter = modConfig.filter;
    }
    return {
        /**
         * Called when the backend starts
         */
        onServerStart: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    console.log('[screepsmod-testing] Mod loaded');
                    if (testInterval > 0) {
                        console.log("[screepsmod-testing] Tests will run every ".concat(testInterval, " ticks"));
                    }
                    else if (autoRunTests) {
                        console.log('[screepsmod-testing] Tests will run once on first tick');
                    }
                    else {
                        console.log('[screepsmod-testing] Auto-run disabled, use console commands to run tests');
                    }
                    return [2 /*return*/];
                });
            });
        },
        /**
         * Called every game tick
         */
        onTickStart: function (tick, gameData) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!!initialized) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.loadTests(gameData)];
                        case 1:
                            _a.sent();
                            initialized = true;
                            _a.label = 2;
                        case 2:
                            if (!(autoRunTests && (testInterval === 0 && lastTestTick === 0))) return [3 /*break*/, 4];
                            // Run once on first tick
                            return [4 /*yield*/, this.runTests(tick, gameData)];
                        case 3:
                            // Run once on first tick
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 4:
                            if (!(testInterval > 0 && (tick - lastTestTick >= testInterval))) return [3 /*break*/, 6];
                            // Run periodically
                            return [4 /*yield*/, this.runTests(tick, gameData)];
                        case 5:
                            // Run periodically
                            _a.sent();
                            _a.label = 6;
                        case 6: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * Load test files
         */
        loadTests: function (gameData) {
            return __awaiter(this, void 0, void 0, function () {
                var suites, suites_1, suites_1_1, suite_1;
                var e_1, _a;
                return __generator(this, function (_b) {
                    console.log('[screepsmod-testing] Loading tests...');
                    suites = index_1.testRunner.getSuites();
                    console.log("[screepsmod-testing] Loaded ".concat(suites.length, " test suites"));
                    try {
                        for (suites_1 = __values(suites), suites_1_1 = suites_1.next(); !suites_1_1.done; suites_1_1 = suites_1.next()) {
                            suite_1 = suites_1_1.value;
                            console.log("[screepsmod-testing]   - ".concat(suite_1.name, " (").concat(suite_1.tests.length, " tests)"));
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (suites_1_1 && !suites_1_1.done && (_a = suites_1.return)) _a.call(suites_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    return [2 /*return*/];
                });
            });
        },
        /**
         * Run all registered tests
         */
        runTests: function (tick, gameData) {
            return __awaiter(this, void 0, void 0, function () {
                var context, summary, output;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log("[screepsmod-testing] Running tests at tick ".concat(tick));
                            lastTestTick = tick;
                            context = {
                                Game: gameData.Game || {},
                                Memory: gameData.Memory || {},
                                RawMemory: gameData.RawMemory || {},
                                InterShardMemory: gameData.InterShardMemory || {},
                                tick: tick,
                                getObjectById: function (id) {
                                    var _a, _b;
                                    return (_b = (_a = gameData.Game) === null || _a === void 0 ? void 0 : _a.getObjectById) === null || _b === void 0 ? void 0 : _b.call(_a, id);
                                },
                                getRoomObject: function (roomName) {
                                    var _a, _b;
                                    return (_b = (_a = gameData.Game) === null || _a === void 0 ? void 0 : _a.rooms) === null || _b === void 0 ? void 0 : _b[roomName];
                                }
                            };
                            // Run tests with filter
                            return [4 /*yield*/, index_1.testRunner.start(context, testFilter)];
                        case 1:
                            // Run tests with filter
                            _a.sent();
                            summary = index_1.testRunner.getSummary(tick);
                            // Store results in a safe location (not in bot memory)
                            if (!gameData.__testResults) {
                                gameData.__testResults = {};
                            }
                            gameData.__testResults = summary;
                            // Persist results if enabled
                            if (persistenceManager) {
                                persistenceManager.save(summary);
                            }
                            // Generate reports based on output format
                            if (jsonReporter) {
                                output = jsonReporter.generate(summary);
                                jsonReporter.write(output);
                            }
                            if (consoleReporter && (outputFormat === 'console' || outputFormat === 'all')) {
                                consoleReporter.printSummary(summary);
                            }
                            // Generate JUnit XML if configured
                            if (outputFormat === 'junit' || outputFormat === 'all') {
                                if (!jsonReporter) {
                                    jsonReporter = new reporter_1.JSONReporter();
                                }
                                jsonReporter.writeJUnit(summary);
                            }
                            return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * Register console commands
         */
        consoleCommands: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, {
                            /**
                             * Run all tests (note: tests will run automatically based on configuration)
                             */
                            runTests: function () {
                                console.log('[screepsmod-testing] Tests run automatically based on testInterval configuration.');
                                console.log('[screepsmod-testing] To manually trigger tests, set testInterval > 0 or restart the server.');
                                return 'Tests are configured to run automatically. Use getTestSummary() to see results.';
                            },
                            /**
                             * List all registered tests
                             */
                            listTests: function () {
                                var e_2, _a, e_3, _b;
                                var suites = index_1.testRunner.getSuites();
                                console.log("[screepsmod-testing] Registered test suites: ".concat(suites.length));
                                try {
                                    for (var suites_2 = __values(suites), suites_2_1 = suites_2.next(); !suites_2_1.done; suites_2_1 = suites_2.next()) {
                                        var suite_2 = suites_2_1.value;
                                        console.log("  ".concat(suite_2.name, ":"));
                                        try {
                                            for (var _c = (e_3 = void 0, __values(suite_2.tests)), _d = _c.next(); !_d.done; _d = _c.next()) {
                                                var test_1 = _d.value;
                                                var status = test_1.skip ? '[SKIPPED]' : '';
                                                console.log("    - ".concat(test_1.name, " ").concat(status));
                                            }
                                        }
                                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                                        finally {
                                            try {
                                                if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                                            }
                                            finally { if (e_3) throw e_3.error; }
                                        }
                                    }
                                }
                                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                                finally {
                                    try {
                                        if (suites_2_1 && !suites_2_1.done && (_a = suites_2.return)) _a.call(suites_2);
                                    }
                                    finally { if (e_2) throw e_2.error; }
                                }
                                return "Found ".concat(suites.length, " test suites");
                            },
                            /**
                             * Clear all test results
                             */
                            clearTests: function () {
                                index_1.testRunner.clear();
                                return 'Test results cleared';
                            },
                            /**
                             * Get test summary
                             */
                            getTestSummary: function () {
                                var summary = index_1.testRunner.getSummary(0);
                                return {
                                    total: summary.total,
                                    passed: summary.passed,
                                    failed: summary.failed,
                                    skipped: summary.skipped,
                                    duration: summary.duration,
                                    tickRange: "".concat(summary.startTick, "-").concat(summary.endTick)
                                };
                            },
                            /**
                             * Get test history from persistence
                             */
                            getTestHistory: function () {
                                if (!persistenceManager) {
                                    return 'Persistence is not enabled';
                                }
                                return persistenceManager.getHistory();
                            },
                            /**
                             * Get test statistics from history
                             */
                            getTestStatistics: function () {
                                if (!persistenceManager) {
                                    return 'Persistence is not enabled';
                                }
                                return persistenceManager.getStatistics();
                            },
                            /**
                             * Set test filter
                             */
                            setTestFilter: function (filter) {
                                testFilter = filter;
                                return "Filter set: ".concat(JSON.stringify(filter));
                            },
                            /**
                             * Clear test filter
                             */
                            clearTestFilter: function () {
                                testFilter = undefined;
                                return 'Filter cleared';
                            }
                        }];
                });
            });
        }
    };
};
//# sourceMappingURL=backend.js.map
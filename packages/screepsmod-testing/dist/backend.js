"use strict";
/**
 * Backend hook for screepsmod-testing
 *
 * This file integrates the testing framework with the Screeps private server.
 * Screeps mods are activated by mutating the supplied config object; returning
 * hook objects is not part of the private-server mod API.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
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
var testInterval = 0; // Run tests every N ticks (0 = run once for legacy runner)
var lastTestTick = 0;
var autoRunTests = false;
var persistenceManager = null;
var jsonReporter = null;
var consoleReporter = null;
var outputFormat = 'console';
var testFilter;
var testFiles = [];
var latestSummary = null;
var PLAYER_SANDBOX_TEST_SOURCE = "\n(function screepsmodTestingPlayerSandbox() {\n  const started = Date.now();\n  const failures = [];\n  let passed = 0;\n  let skipped = 0;\n\n  function pass() { passed += 1; }\n  function skip() { skipped += 1; }\n  function assert(name, predicate, details) {\n    try {\n      if (predicate()) {\n        pass();\n      } else {\n        failures.push({ name, message: details || 'assertion failed' });\n      }\n    } catch (error) {\n      failures.push({ name, message: error && (error.stack || error.message) || String(error) });\n    }\n  }\n\n  const game = typeof Game === 'object' && Game ? Game : {};\n  const memory = typeof Memory === 'object' && Memory ? Memory : {};\n  const rooms = Object.values(game.rooms || {});\n  const ownedRooms = rooms.filter(room => room && room.controller && room.controller.my);\n  const tick = Number(game.time || 0);\n\n  assert('server exposes Game and advances ticks', () => tick > 0, 'Game.time did not advance');\n  assert('our bot has at least one owned visible room', () => ownedRooms.length > 0, 'no owned visible rooms');\n  assert('owned room has a spawn after initialization', () => Object.keys(game.spawns || {}).length > 0, 'no owned spawns');\n  assert('global reset loop is not detected', () => (memory.__globalResetCount || 0) < 5, 'too many global resets');\n\n  if (tick < 100) {\n    skip();\n  } else {\n    assert('creep population exists after warmup', () => Object.keys(game.creeps || {}).length > 0, 'no creeps after warmup');\n  }\n\n  if (tick < 100) {\n    skip();\n  } else {\n    assert('CPU bucket is not chronically empty', () => ((game.cpu && game.cpu.bucket) || 10000) > 1000, 'CPU bucket below 1000');\n  }\n\n  if (tick < 100) {\n    skip();\n  } else {\n    assert(\n      'task board memory exists and can track room tasks',\n      () => Object.keys(((memory.creepTaskBoard || {}).rooms) || {}).length > 0,\n      'Memory.creepTaskBoard.rooms is empty'\n    );\n  }\n\n  assert('critical console error counter stays below threshold', () => (memory.ciCriticalConsoleErrors || 0) < 10, 'critical console errors above threshold');\n\n  memory.screepsmodTesting = {\n    source: 'screepsmod-testing-player-sandbox',\n    total: passed + failures.length + skipped,\n    passed,\n    failed: failures.length,\n    skipped,\n    failures,\n    tick,\n    duration: Date.now() - started\n  };\n}).call(global);\n";
function installPlayerSandboxRunner(config) {
    var _a;
    if (!((_a = config.engine) === null || _a === void 0 ? void 0 : _a.on))
        return;
    config.engine.on('playerSandbox', function (sandbox) {
        try {
            sandbox.run(PLAYER_SANDBOX_TEST_SOURCE);
        }
        catch (error) {
            console.log("[screepsmod-testing] playerSandbox test runner failed: ".concat((error === null || error === void 0 ? void 0 : error.stack) || (error === null || error === void 0 ? void 0 : error.message) || String(error)));
        }
    });
}
function installCliCommands(config) {
    var _a;
    if (!((_a = config.cli) === null || _a === void 0 ? void 0 : _a.on))
        return;
    config.cli.on('cliSandbox', function (sandbox) {
        sandbox.getTestSummary = function () { return latestSummary !== null && latestSummary !== void 0 ? latestSummary : null; };
        sandbox.printTestSummary = function () {
            var summary = latestSummary !== null && latestSummary !== void 0 ? latestSummary : null;
            sandbox.print(JSON.stringify(summary));
            return summary;
        };
    });
}
function disableUnstableNpcCronjobs(config) {
    // The Docker CI world can start with incomplete terrain data for NPC stronghold
    // generation on Screeps 4.3.0 + Node 22. Disable these optional NPC cronjobs
    // so auth/upload smoke tests are not interrupted by backend reset loops.
    if (config.cronjobs) {
        delete config.cronjobs.genStrongholds;
        delete config.cronjobs.expandStrongholds;
        console.log('[screepsmod-testing] Disabled NPC stronghold cronjobs for test server stability');
    }
}
function readBotCodeState(storage, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var codeCollection, activeCode, modules;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    codeCollection = storage.db['users.code'];
                    if (!(codeCollection === null || codeCollection === void 0 ? void 0 : codeCollection.findOne))
                        return [2 /*return*/, { hasBotCode: true, bypassWarmup: true }];
                    return [4 /*yield*/, codeCollection.findOne({
                            user: String(userId),
                            activeWorld: true
                        })];
                case 1:
                    activeCode = _b.sent();
                    modules = (_a = activeCode === null || activeCode === void 0 ? void 0 : activeCode.modules) !== null && _a !== void 0 ? _a : {};
                    return [2 /*return*/, {
                            hasBotCode: Object.values(modules).some(function (module) { return typeof module === 'string' && module.trim().length > 0; }),
                            bypassWarmup: false
                        }];
            }
        });
    });
}
function isBotRuntimeWarmed(memory, tick, botCodeState, warmupTicks) {
    if (!botCodeState.hasBotCode) {
        delete memory.__screepsmodTestingBotCodeSeenAt;
        return false;
    }
    if (botCodeState.bypassWarmup)
        return true;
    if (typeof memory.__screepsmodTestingBotCodeSeenAt !== 'number') {
        memory.__screepsmodTestingBotCodeSeenAt = tick;
    }
    return tick - memory.__screepsmodTestingBotCodeSeenAt >= warmupTicks;
}
function runBackendBotAssertions(config) {
    return __awaiter(this, void 0, void 0, function () {
        var started, failures, passed, skipped, assert, skipRuntimeAssertion, common, storage, username, user, userId, tick, _a, memoryKey, rawMemory, memory, warmupTicks, botRuntimeWarmed, _b, _c, _d, ownedControllers, spawns, creeps;
        var _e, _f, _g, _h, _j, _k, _l, _m;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    started = Date.now();
                    failures = [];
                    passed = 0;
                    skipped = 0;
                    assert = function (name, predicate, message) {
                        try {
                            if (predicate())
                                passed += 1;
                            else
                                failures.push({ name: name, message: message });
                        }
                        catch (error) {
                            failures.push({ name: name, message: (error === null || error === void 0 ? void 0 : error.stack) || (error === null || error === void 0 ? void 0 : error.message) || String(error) });
                        }
                    };
                    skipRuntimeAssertion = function () { skipped += 1; };
                    common = (_e = config.common) !== null && _e !== void 0 ? _e : require('@screeps/common');
                    storage = common.storage;
                    username = (_h = (_g = (_f = config.screepsmod) === null || _f === void 0 ? void 0 : _f.testing) === null || _g === void 0 ? void 0 : _g.username) !== null && _h !== void 0 ? _h : 'swarm-bot';
                    return [4 /*yield*/, storage.db.users.findOne({ username: username })];
                case 1:
                    user = _o.sent();
                    if (!(user === null || user === void 0 ? void 0 : user._id))
                        return [2 /*return*/];
                    userId = user._id;
                    _a = Number;
                    return [4 /*yield*/, storage.env.get(storage.env.keys.GAMETIME)];
                case 2:
                    tick = _a.apply(void 0, [(_j = _o.sent()) !== null && _j !== void 0 ? _j : 0]);
                    memoryKey = storage.env.keys.MEMORY + userId;
                    return [4 /*yield*/, storage.env.get(memoryKey)];
                case 3:
                    rawMemory = _o.sent();
                    memory = {};
                    try {
                        memory = rawMemory ? JSON.parse(rawMemory) : {};
                    }
                    catch (error) {
                        memory = { __screepsmodTestingMemoryParseError: (error === null || error === void 0 ? void 0 : error.message) || String(error) };
                    }
                    warmupTicks = Number((_m = (_l = (_k = config.screepsmod) === null || _k === void 0 ? void 0 : _k.testing) === null || _l === void 0 ? void 0 : _l.runtimeWarmupTicks) !== null && _m !== void 0 ? _m : 100);
                    _b = isBotRuntimeWarmed;
                    _c = [memory,
                        tick];
                    return [4 /*yield*/, readBotCodeState(storage, userId)];
                case 4:
                    botRuntimeWarmed = _b.apply(void 0, _c.concat([_o.sent(), warmupTicks]));
                    return [4 /*yield*/, Promise.all([
                            storage.db['rooms.objects'].find({ type: 'controller', user: userId }),
                            storage.db['rooms.objects'].find({ type: 'spawn', user: userId }),
                            storage.db['rooms.objects'].find({ type: 'creep', user: userId })
                        ])];
                case 5:
                    _d = __read.apply(void 0, [_o.sent(), 3]), ownedControllers = _d[0], spawns = _d[1], creeps = _d[2];
                    assert('server exposes storage and advances ticks', function () { return tick > 0; }, 'gameTime did not advance');
                    assert('our bot has at least one owned room controller', function () { return ownedControllers.length > 0; }, 'no owned controllers');
                    assert('owned room has a spawn after initialization', function () { return spawns.length > 0; }, 'no owned spawns');
                    assert('global reset loop is not detected', function () { return (memory.__globalResetCount || 0) < 5; }, 'too many global resets');
                    if (!botRuntimeWarmed)
                        skipRuntimeAssertion();
                    else
                        assert('creep population exists after warmup', function () { return creeps.length > 0; }, 'no creeps after warmup');
                    if (!botRuntimeWarmed)
                        skipRuntimeAssertion();
                    else
                        assert('CPU bucket is not chronically empty', function () { var _a; return ((_a = user.cpuAvailable) !== null && _a !== void 0 ? _a : 10000) > 1000; }, 'CPU bucket below 1000');
                    if (!botRuntimeWarmed)
                        skipRuntimeAssertion();
                    else
                        assert('task board memory exists and can track room tasks', function () { var _a, _b; return Object.keys((_b = (_a = memory.creepTaskBoard) === null || _a === void 0 ? void 0 : _a.rooms) !== null && _b !== void 0 ? _b : {}).length > 0; }, 'Memory.creepTaskBoard.rooms is empty');
                    assert('critical console error counter stays below threshold', function () { return (memory.ciCriticalConsoleErrors || 0) < 10; }, 'critical console errors above threshold');
                    latestSummary = {
                        source: 'screepsmod-testing-backend-cronjob',
                        total: passed + failures.length + skipped,
                        passed: passed,
                        failed: failures.length,
                        skipped: skipped,
                        failures: failures,
                        tick: tick,
                        duration: Date.now() - started
                    };
                    memory.screepsmodTesting = latestSummary;
                    return [4 /*yield*/, storage.env.set(memoryKey, JSON.stringify(memory))];
                case 6:
                    _o.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function installBackendCronjobRunner(config) {
    if (!config.cronjobs)
        return;
    config.cronjobs.screepsmodTesting = [1, function () {
            runBackendBotAssertions(config).catch(function (error) {
                console.log("[screepsmod-testing] backend assertion cronjob failed: ".concat((error === null || error === void 0 ? void 0 : error.stack) || (error === null || error === void 0 ? void 0 : error.message) || String(error)));
            });
        }];
}
/**
 * Backend module export for screepsmod.
 */
module.exports = function (config) {
    var _a;
    console.log('[screepsmod-testing] Mod loaded');
    disableUnstableNpcCronjobs(config);
    installBackendCronjobRunner(config);
    installPlayerSandboxRunner(config);
    installCliCommands(config);
    // Read legacy framework configuration. The legacy runner is kept for package
    // consumers, but CI bot validation is performed through playerSandbox above.
    var modConfig = ((_a = config.screepsmod) === null || _a === void 0 ? void 0 : _a.testing) || {};
    testInterval = modConfig.testInterval || 0;
    autoRunTests = modConfig.autoRun === true;
    outputFormat = modConfig.outputFormat || 'console';
    testFiles = Array.isArray(modConfig.testFiles) ? modConfig.testFiles : [];
    if (modConfig.persistence !== false) {
        persistenceManager = new persistence_1.PersistenceManager(modConfig.persistencePath, modConfig.historySize);
    }
    if (outputFormat === 'json' || outputFormat === 'all') {
        jsonReporter = new reporter_1.JSONReporter(modConfig.outputDir);
    }
    if (outputFormat === 'console' || outputFormat === 'all') {
        consoleReporter = new reporter_1.ConsoleReporter();
    }
    if (modConfig.filter) {
        testFilter = modConfig.filter;
    }
    return {
        onServerStart: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (testInterval > 0) {
                        console.log("[screepsmod-testing] Legacy tests will run every ".concat(testInterval, " ticks"));
                    }
                    else if (autoRunTests) {
                        console.log('[screepsmod-testing] Legacy tests will run once on first tick');
                    }
                    return [2 /*return*/];
                });
            });
        },
        onTickStart: function (tick, gameData) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!autoRunTests)
                                return [2 /*return*/];
                            if (!!initialized) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.loadTests(gameData)];
                        case 1:
                            _a.sent();
                            initialized = true;
                            _a.label = 2;
                        case 2:
                            if (!(testInterval === 0 && lastTestTick === 0)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.runTests(tick, gameData)];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 4:
                            if (!(testInterval > 0 && (tick - lastTestTick >= testInterval))) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.runTests(tick, gameData)];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6: return [2 /*return*/];
                    }
                });
            });
        },
        loadTests: function (_gameData) {
            return __awaiter(this, void 0, void 0, function () {
                var testFiles_1, testFiles_1_1, file, suites;
                var e_1, _a;
                return __generator(this, function (_b) {
                    console.log('[screepsmod-testing] Loading legacy tests...');
                    try {
                        for (testFiles_1 = __values(testFiles), testFiles_1_1 = testFiles_1.next(); !testFiles_1_1.done; testFiles_1_1 = testFiles_1.next()) {
                            file = testFiles_1_1.value;
                            try {
                                console.log("[screepsmod-testing] Loading test file ".concat(file));
                                require(file);
                            }
                            catch (error) {
                                console.log("[screepsmod-testing] Failed to load test file ".concat(file, ": ").concat(error));
                                throw error;
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (testFiles_1_1 && !testFiles_1_1.done && (_a = testFiles_1.return)) _a.call(testFiles_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    suites = index_1.testRunner.getSuites();
                    console.log("[screepsmod-testing] Loaded ".concat(suites.length, " legacy test suites"));
                    return [2 /*return*/];
                });
            });
        },
        runTests: function (tick, gameData) {
            return __awaiter(this, void 0, void 0, function () {
                var context, summary;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log("[screepsmod-testing] Running legacy tests at tick ".concat(tick));
                            lastTestTick = tick;
                            context = {
                                Game: gameData.Game || {},
                                Memory: gameData.Memory || {},
                                RawMemory: gameData.RawMemory || {},
                                InterShardMemory: gameData.InterShardMemory || {},
                                tick: tick,
                                getObjectById: function (id) { var _a, _b; return (_b = (_a = gameData.Game) === null || _a === void 0 ? void 0 : _a.getObjectById) === null || _b === void 0 ? void 0 : _b.call(_a, id); },
                                getRoomObject: function (roomName) { var _a, _b; return (_b = (_a = gameData.Game) === null || _a === void 0 ? void 0 : _a.rooms) === null || _b === void 0 ? void 0 : _b[roomName]; }
                            };
                            return [4 /*yield*/, index_1.testRunner.start(context, testFilter)];
                        case 1:
                            _a.sent();
                            summary = index_1.testRunner.getSummary(tick);
                            latestSummary = summary;
                            if (!gameData.__testResults) {
                                gameData.__testResults = {};
                            }
                            gameData.__testResults = summary;
                            if (gameData.Memory && typeof gameData.Memory === 'object') {
                                gameData.Memory.screepsmodTesting = __assign(__assign({}, summary), { source: 'screepsmod-testing-legacy-runner' });
                            }
                            if (persistenceManager)
                                persistenceManager.save(summary);
                            if (jsonReporter)
                                jsonReporter.write(jsonReporter.generate(summary));
                            if (consoleReporter && (outputFormat === 'console' || outputFormat === 'all'))
                                consoleReporter.printSummary(summary);
                            if (outputFormat === 'junit' || outputFormat === 'all') {
                                if (!jsonReporter)
                                    jsonReporter = new reporter_1.JSONReporter();
                                jsonReporter.writeJUnit(summary);
                            }
                            return [2 /*return*/];
                    }
                });
            });
        }
    };
};
//# sourceMappingURL=backend.js.map
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
var backendAssertions_1 = require("./runtime/backendAssertions");
var config_1 = require("./runtime/config");
var playerAssertions_1 = require("./runtime/playerAssertions");
var summary_1 = require("./runtime/summary");
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
var DEFAULT_RUNTIME_WARMUP_TICKS = 100;
var BOT_CODE_SEEN_AT_ENV_PREFIX = 'screepsmodTestingBotCodeSeenAt:';
var PLAYER_SUMMARY_ENV_PREFIX = 'screepsmodTestingPlayerSummary:';
var SCENARIO_SEED_EVIDENCE_ENV_PREFIX = 'screepsmodTestingScenarioSeed:';
function getRuntimeWarmupTicks(config) {
    var _a, _b, _c;
    var warmupTicks = Number((_c = (_b = (_a = config.screepsmod) === null || _a === void 0 ? void 0 : _a.testing) === null || _b === void 0 ? void 0 : _b.runtimeWarmupTicks) !== null && _c !== void 0 ? _c : DEFAULT_RUNTIME_WARMUP_TICKS);
    if (!Number.isFinite(warmupTicks) || warmupTicks < 0)
        return DEFAULT_RUNTIME_WARMUP_TICKS;
    return warmupTicks;
}
function installPlayerSandboxRunner(config) {
    var _a;
    if (!((_a = config.engine) === null || _a === void 0 ? void 0 : _a.on))
        return;
    var playerSandboxTestSource = (0, playerAssertions_1.buildPlayerSandboxTestSource)(getRuntimeWarmupTicks(config), (0, config_1.getConfiguredScenarios)(config));
    config.engine.on('playerSandbox', function (sandbox, userId) {
        var _a, _b;
        try {
            sandbox.run(playerSandboxTestSource);
            if (typeof sandbox.get !== 'function' || userId === undefined || userId === null)
                return;
            var playerSummary = sandbox.get('__screepsmodTestingPlayerSummary');
            if (!playerSummary || typeof playerSummary !== 'object')
                return;
            var storage = (_b = (_a = config.common) === null || _a === void 0 ? void 0 : _a.storage) !== null && _b !== void 0 ? _b : require('@screeps/common').storage;
            Promise.resolve(storage.env.set("".concat(PLAYER_SUMMARY_ENV_PREFIX).concat(asMemoryUserKey(userId)), JSON.stringify(playerSummary))).catch(function (error) {
                console.log("[screepsmod-testing] durable player summary write failed: ".concat((error === null || error === void 0 ? void 0 : error.stack) || (error === null || error === void 0 ? void 0 : error.message) || String(error)));
            });
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
function getBotCodeIdentity(activeCode, modules) {
    if ((activeCode === null || activeCode === void 0 ? void 0 : activeCode.timestamp) !== undefined && (activeCode === null || activeCode === void 0 ? void 0 : activeCode.timestamp) !== null) {
        return "timestamp:".concat(String(activeCode.timestamp));
    }
    var moduleSignature = Object.keys(modules)
        .sort()
        .map(function (name) { return "".concat(name, ":").concat(typeof modules[name] === 'string' ? modules[name].length : 0); })
        .join('|');
    return "modules:".concat(moduleSignature);
}
function readBotCodeState(storage, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var codeCollection, activeCode, modules;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    codeCollection = storage.db['users.code'];
                    if (!(codeCollection === null || codeCollection === void 0 ? void 0 : codeCollection.findOne)) {
                        return [2 /*return*/, { hasBotCode: true, bypassWarmup: true, codeIdentity: 'unverified' }];
                    }
                    return [4 /*yield*/, codeCollection.findOne(__assign(__assign({}, makeUserObjectIdFilter(userId)), { activeWorld: true }))];
                case 1:
                    activeCode = _b.sent();
                    modules = (_a = activeCode === null || activeCode === void 0 ? void 0 : activeCode.modules) !== null && _a !== void 0 ? _a : {};
                    return [2 /*return*/, {
                            hasBotCode: Object.values(modules).some(function (module) { return typeof module === 'string' && module.trim().length > 0; }),
                            bypassWarmup: false,
                            codeIdentity: getBotCodeIdentity(activeCode, modules),
                        }];
            }
        });
    });
}
function isBotRuntimeWarmed(storage, memory, userId, tick, botCodeState, warmupTicks) {
    return __awaiter(this, void 0, void 0, function () {
        var evidenceKey, rawDurableEvidence, durableEvidence, durableSeenAt, memoryIdentity, memoryIdentityMatches, memorySeenAt, seenAt;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    evidenceKey = "".concat(BOT_CODE_SEEN_AT_ENV_PREFIX).concat(asMemoryUserKey(userId));
                    if (!!botCodeState.hasBotCode) return [3 /*break*/, 2];
                    delete memory.__screepsmodTestingBotCodeSeenAt;
                    delete memory.__screepsmodTestingBotCodeIdentity;
                    return [4 /*yield*/, ((_b = (_a = storage.env).del) === null || _b === void 0 ? void 0 : _b.call(_a, evidenceKey))];
                case 1:
                    _c.sent();
                    return [2 /*return*/, false];
                case 2:
                    if (botCodeState.bypassWarmup)
                        return [2 /*return*/, true];
                    return [4 /*yield*/, storage.env.get(evidenceKey)];
                case 3:
                    rawDurableEvidence = _c.sent();
                    try {
                        durableEvidence = rawDurableEvidence ? JSON.parse(rawDurableEvidence) : undefined;
                    }
                    catch (_d) {
                        durableEvidence = undefined;
                    }
                    durableSeenAt = (durableEvidence === null || durableEvidence === void 0 ? void 0 : durableEvidence.codeIdentity) === botCodeState.codeIdentity
                        ? Number(durableEvidence.seenAt)
                        : Number.NaN;
                    memoryIdentity = memory.__screepsmodTestingBotCodeIdentity;
                    memoryIdentityMatches = memoryIdentity === botCodeState.codeIdentity;
                    memorySeenAt = memoryIdentityMatches
                        ? Number(memory.__screepsmodTestingBotCodeSeenAt)
                        : Number.NaN;
                    seenAt = Number.isFinite(durableSeenAt)
                        ? durableSeenAt
                        : Number.isFinite(memorySeenAt)
                            ? memorySeenAt
                            : tick;
                    memory.__screepsmodTestingBotCodeSeenAt = seenAt;
                    memory.__screepsmodTestingBotCodeIdentity = botCodeState.codeIdentity;
                    if (!!Number.isFinite(durableSeenAt)) return [3 /*break*/, 5];
                    return [4 /*yield*/, storage.env.set(evidenceKey, JSON.stringify({
                            codeIdentity: botCodeState.codeIdentity,
                            seenAt: seenAt,
                        }))];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/, tick - seenAt >= warmupTicks];
            }
        });
    });
}
function makeUserObjectIdFilter(userId) {
    var userIdString = String(userId);
    if (typeof userId === 'string')
        return { user: userId };
    return {
        $or: [
            { user: userId },
            { user: userIdString }
        ]
    };
}
function asMemoryUserKey(userId) {
    return String(userId);
}
function readScenarioSeedConfirmation(storage, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var raw;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, ((_b = (_a = storage.env) === null || _a === void 0 ? void 0 : _a.get) === null || _b === void 0 ? void 0 : _b.call(_a, "".concat(SCENARIO_SEED_EVIDENCE_ENV_PREFIX).concat(asMemoryUserKey(userId))))];
                case 1:
                    raw = _c.sent();
                    if (!raw)
                        return [2 /*return*/, undefined];
                    try {
                        return [2 /*return*/, JSON.parse(raw)];
                    }
                    catch (error) {
                        return [2 /*return*/, { parseError: (error === null || error === void 0 ? void 0 : error.message) || String(error) }];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function readDurablePlayerSummary(storage, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var raw;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, ((_b = (_a = storage.env) === null || _a === void 0 ? void 0 : _a.get) === null || _b === void 0 ? void 0 : _b.call(_a, "".concat(PLAYER_SUMMARY_ENV_PREFIX).concat(asMemoryUserKey(userId))))];
                case 1:
                    raw = _c.sent();
                    if (!raw)
                        return [2 /*return*/, undefined];
                    try {
                        return [2 /*return*/, JSON.parse(raw)];
                    }
                    catch (_d) {
                        return [2 /*return*/, undefined];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function selectLatestPlayerSummary(memorySummary, durableSummary) {
    var _a, _b;
    if (!durableSummary)
        return memorySummary;
    if (!memorySummary)
        return durableSummary;
    if (((_a = memorySummary.failed) !== null && _a !== void 0 ? _a : 0) > 0)
        return memorySummary;
    if (((_b = durableSummary.failed) !== null && _b !== void 0 ? _b : 0) > 0)
        return durableSummary;
    var memoryTick = Number(memorySummary.tick);
    var durableTick = Number(durableSummary.tick);
    if (!Number.isFinite(memoryTick))
        return durableSummary;
    if (!Number.isFinite(durableTick))
        return memorySummary;
    return durableTick >= memoryTick ? durableSummary : memorySummary;
}
function selectPlayerSummaryForMerge(playerSummary, tick, warmupTicks, botRuntimeWarmed) {
    var _a;
    if (!playerSummary || !botRuntimeWarmed || ((_a = playerSummary.failed) !== null && _a !== void 0 ? _a : 0) > 0)
        return playerSummary;
    var playerTick = Number(playerSummary.tick);
    var summaryIsStale = Number.isFinite(playerTick) && tick - playerTick >= warmupTicks;
    return summaryIsStale ? undefined : playerSummary;
}
function readErrorNotifications(storage, userIdFilter) {
    return __awaiter(this, void 0, void 0, function () {
        var notificationsCollection, notifications;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    notificationsCollection = storage.db['users.notifications'];
                    if (!(notificationsCollection === null || notificationsCollection === void 0 ? void 0 : notificationsCollection.find))
                        return [2 /*return*/, []];
                    return [4 /*yield*/, notificationsCollection.find(__assign({ type: 'error' }, userIdFilter))];
                case 1:
                    notifications = _a.sent();
                    if (!Array.isArray(notifications))
                        return [2 /*return*/, []];
                    return [2 /*return*/, notifications
                            .map(function (notification) { var _a, _b, _c; return String((_c = (_b = (_a = notification === null || notification === void 0 ? void 0 : notification.message) !== null && _a !== void 0 ? _a : notification === null || notification === void 0 ? void 0 : notification.error) !== null && _b !== void 0 ? _b : notification) !== null && _c !== void 0 ? _c : ''); })
                            .filter(Boolean)
                            .slice(0, 3)
                            .map(function (message) { return message.slice(0, 300); })];
            }
        });
    });
}
function runBackendBotAssertions(config) {
    return __awaiter(this, void 0, void 0, function () {
        var started, common, storage, username, user, userId, userIdFilter, tick, _a, memoryKey, rawMemory, memory, warmupTicks, botRuntimeWarmed, _b, _c, durablePlayerSummary, playerSummary, playerSandboxSummarySource, _d, ownedControllers, spawns, creeps, errorSamples, scenarioSeedConfirmation, scenarios, backendSummary, playerSummaryForMerge, mergedSummary;
        var _e, _f, _g, _h, _j, _k;
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0:
                    started = Date.now();
                    common = (_e = config.common) !== null && _e !== void 0 ? _e : require('@screeps/common');
                    storage = common.storage;
                    username = (_h = (_g = (_f = config.screepsmod) === null || _f === void 0 ? void 0 : _f.testing) === null || _g === void 0 ? void 0 : _g.username) !== null && _h !== void 0 ? _h : 'swarm-bot';
                    return [4 /*yield*/, storage.db.users.findOne({ username: username })];
                case 1:
                    user = _l.sent();
                    if (!(user === null || user === void 0 ? void 0 : user._id))
                        return [2 /*return*/];
                    userId = user._id;
                    userIdFilter = makeUserObjectIdFilter(userId);
                    _a = Number;
                    return [4 /*yield*/, storage.env.get(storage.env.keys.GAMETIME)];
                case 2:
                    tick = _a.apply(void 0, [(_j = _l.sent()) !== null && _j !== void 0 ? _j : 0]);
                    memoryKey = storage.env.keys.MEMORY + asMemoryUserKey(userId);
                    return [4 /*yield*/, storage.env.get(memoryKey)];
                case 3:
                    rawMemory = _l.sent();
                    memory = {};
                    try {
                        memory = rawMemory ? JSON.parse(rawMemory) : {};
                    }
                    catch (error) {
                        memory = { __screepsmodTestingMemoryParseError: (error === null || error === void 0 ? void 0 : error.message) || String(error) };
                    }
                    warmupTicks = getRuntimeWarmupTicks(config);
                    _b = isBotRuntimeWarmed;
                    _c = [storage,
                        memory,
                        userId,
                        tick];
                    return [4 /*yield*/, readBotCodeState(storage, userId)];
                case 4: return [4 /*yield*/, _b.apply(void 0, _c.concat([_l.sent(), warmupTicks]))];
                case 5:
                    botRuntimeWarmed = _l.sent();
                    return [4 /*yield*/, readDurablePlayerSummary(storage, userId)];
                case 6:
                    durablePlayerSummary = _l.sent();
                    playerSummary = selectLatestPlayerSummary(memory.screepsmodTestingPlayer, durablePlayerSummary);
                    playerSandboxSummarySource = playerSummary && playerSummary === durablePlayerSummary
                        ? 'durable-env'
                        : playerSummary
                            ? 'memory'
                            : 'missing';
                    if (playerSummary)
                        memory.screepsmodTestingPlayer = playerSummary;
                    return [4 /*yield*/, Promise.all([
                            storage.db['rooms.objects'].find(__assign({ type: 'controller' }, userIdFilter)),
                            storage.db['rooms.objects'].find(__assign({ type: 'spawn' }, userIdFilter)),
                            storage.db['rooms.objects'].find(__assign({ type: 'creep' }, userIdFilter)),
                            readErrorNotifications(storage, userIdFilter),
                            readScenarioSeedConfirmation(storage, userId)
                        ])];
                case 7:
                    _d = __read.apply(void 0, [_l.sent(), 5]), ownedControllers = _d[0], spawns = _d[1], creeps = _d[2], errorSamples = _d[3], scenarioSeedConfirmation = _d[4];
                    scenarios = (0, config_1.getConfiguredScenarios)(config);
                    return [4 /*yield*/, (0, backendAssertions_1.runBackendRuntimeAssertions)({
                            config: config,
                            storage: storage,
                            memory: memory,
                            tick: tick,
                            runtimeWarmupTicks: warmupTicks,
                            botRuntimeWarmed: botRuntimeWarmed,
                            user: user,
                            userId: userId,
                            userIdFilter: userIdFilter,
                            ownedControllers: ownedControllers,
                            spawns: spawns,
                            creeps: creeps,
                            errorSamples: errorSamples,
                            scenarios: scenarios,
                            startedAt: started,
                            scenarioSeedConfirmation: scenarioSeedConfirmation
                        })];
                case 8:
                    backendSummary = _l.sent();
                    playerSummaryForMerge = selectPlayerSummaryForMerge(playerSummary, tick, warmupTicks, botRuntimeWarmed);
                    backendSummary.diagnostics = __assign(__assign({}, backendSummary.diagnostics), { playerSandboxSummarySource: playerSandboxSummarySource, playerSandboxSummaryTick: (_k = playerSummary === null || playerSummary === void 0 ? void 0 : playerSummary.tick) !== null && _k !== void 0 ? _k : null, playerSandboxSummaryMerged: Boolean(playerSummaryForMerge) });
                    mergedSummary = (0, summary_1.mergeRuntimeSummaries)({
                        player: playerSummaryForMerge,
                        backend: backendSummary,
                        legacy: memory.screepsmodTestingLegacy
                    }, tick, started, warmupTicks, scenarios);
                    memory.screepsmodTestingBackend = backendSummary;
                    memory.screepsmodTesting = mergedSummary;
                    latestSummary = mergedSummary;
                    return [4 /*yield*/, storage.env.set(memoryKey, JSON.stringify(memory))];
                case 9:
                    _l.sent();
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
                var context, summary, legacySummary;
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
                                legacySummary = __assign(__assign({}, summary), { source: 'screepsmod-testing-legacy-runner', tick: tick, failures: summary.results
                                        .filter(function (result) { return result.status === 'failed'; })
                                        .map(function (result) { var _a, _b; return ({ name: "".concat(result.suiteName, " > ").concat(result.testName), message: (_b = (_a = result.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'legacy assertion failed', source: 'screepsmod-testing-legacy-runner' }); }) });
                                gameData.Memory.screepsmodTestingLegacy = legacySummary;
                                gameData.Memory.screepsmodTesting = (0, summary_1.mergeRuntimeSummaries)({
                                    player: gameData.Memory.screepsmodTestingPlayer,
                                    backend: gameData.Memory.screepsmodTestingBackend,
                                    legacy: legacySummary
                                }, tick, Date.now(), getRuntimeWarmupTicks(config), (0, config_1.getConfiguredScenarios)(config));
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
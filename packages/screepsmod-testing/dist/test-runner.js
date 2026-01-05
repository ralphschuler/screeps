"use strict";
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
exports.TestRunner = void 0;
var filter_1 = require("./filter");
var performance_1 = require("./performance");
/**
 * Test runner that executes tests within the Screeps server environment
 */
var TestRunner = /** @class */ (function () {
    function TestRunner() {
        this.suites = new Map();
        this.results = [];
        this.isRunning = false;
        this.startTick = 0;
        this.currentSuiteIndex = 0;
        this.currentTestIndex = 0;
    }
    /**
     * Register a test suite
     */
    TestRunner.prototype.registerSuite = function (suite) {
        this.suites.set(suite.name, suite);
    };
    /**
     * Register a single test (creates a suite if needed)
     */
    TestRunner.prototype.registerTest = function (suiteName, test) {
        var suite = this.suites.get(suiteName);
        if (!suite) {
            suite = {
                name: suiteName,
                tests: []
            };
            this.suites.set(suiteName, suite);
        }
        suite.tests.push(test);
    };
    /**
     * Get all registered suites
     */
    TestRunner.prototype.getSuites = function () {
        return Array.from(this.suites.values());
    };
    /**
     * Set test filter
     */
    TestRunner.prototype.setFilter = function (filter) {
        this.filter = filter ? new filter_1.FilterManager(filter) : undefined;
    };
    /**
     * Start running tests
     */
    TestRunner.prototype.start = function (context, filter) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isRunning) {
                            console.log('[screepsmod-testing] Test run already in progress');
                            return [2 /*return*/];
                        }
                        this.isRunning = true;
                        this.startTick = context.tick;
                        this.results = [];
                        this.currentSuiteIndex = 0;
                        this.currentTestIndex = 0;
                        // Apply filter if provided
                        if (filter) {
                            this.setFilter(filter);
                        }
                        console.log("[screepsmod-testing] Starting test run at tick ".concat(context.tick));
                        console.log("[screepsmod-testing] Found ".concat(this.suites.size, " test suites"));
                        if (this.filter) {
                            console.log("[screepsmod-testing] Filter: ".concat(this.filter.getSummary()));
                        }
                        return [4 /*yield*/, this.runAllTests(context)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Run all registered tests
     */
    TestRunner.prototype.runAllTests = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var suites, suites_1, suites_1_1, suite_1, e_1_1;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        suites = Array.from(this.suites.values());
                        // Apply filter if set
                        if (this.filter) {
                            suites = this.filter.filterSuites(suites);
                            console.log("[screepsmod-testing] Running ".concat(suites.length, " filtered suites"));
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        suites_1 = __values(suites), suites_1_1 = suites_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!suites_1_1.done) return [3 /*break*/, 5];
                        suite_1 = suites_1_1.value;
                        return [4 /*yield*/, this.runSuite(suite_1, context)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        suites_1_1 = suites_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (suites_1_1 && !suites_1_1.done && (_a = suites_1.return)) _a.call(suites_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8:
                        this.isRunning = false;
                        this.logSummary(context);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Run a single test suite
     */
    TestRunner.prototype.runSuite = function (suite, context) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1, _a, _b, test_1, error_2, error_3, e_2_1, error_4;
            var e_2, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        console.log("[screepsmod-testing] Running suite: ".concat(suite.name));
                        if (!suite.beforeAll) return [3 /*break*/, 4];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, suite.beforeAll()];
                    case 2:
                        _d.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _d.sent();
                        console.log("[screepsmod-testing] Suite beforeAll failed: ".concat(error_1));
                        return [2 /*return*/];
                    case 4:
                        _d.trys.push([4, 16, 17, 18]);
                        _a = __values(suite.tests), _b = _a.next();
                        _d.label = 5;
                    case 5:
                        if (!!_b.done) return [3 /*break*/, 15];
                        test_1 = _b.value;
                        if (test_1.skip) {
                            this.results.push({
                                suiteName: suite.name,
                                testName: test_1.name,
                                status: 'skipped',
                                duration: 0,
                                tick: context.tick
                            });
                            return [3 /*break*/, 14];
                        }
                        if (!suite.beforeEach) return [3 /*break*/, 9];
                        _d.label = 6;
                    case 6:
                        _d.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, suite.beforeEach()];
                    case 7:
                        _d.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        error_2 = _d.sent();
                        console.log("[screepsmod-testing] beforeEach failed: ".concat(error_2));
                        return [3 /*break*/, 9];
                    case 9: 
                    // Run the test
                    return [4 /*yield*/, this.runTest(suite.name, test_1, context)];
                    case 10:
                        // Run the test
                        _d.sent();
                        if (!suite.afterEach) return [3 /*break*/, 14];
                        _d.label = 11;
                    case 11:
                        _d.trys.push([11, 13, , 14]);
                        return [4 /*yield*/, suite.afterEach()];
                    case 12:
                        _d.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        error_3 = _d.sent();
                        console.log("[screepsmod-testing] afterEach failed: ".concat(error_3));
                        return [3 /*break*/, 14];
                    case 14:
                        _b = _a.next();
                        return [3 /*break*/, 5];
                    case 15: return [3 /*break*/, 18];
                    case 16:
                        e_2_1 = _d.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 18];
                    case 17:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 18:
                        if (!suite.afterAll) return [3 /*break*/, 22];
                        _d.label = 19;
                    case 19:
                        _d.trys.push([19, 21, , 22]);
                        return [4 /*yield*/, suite.afterAll()];
                    case 20:
                        _d.sent();
                        return [3 /*break*/, 22];
                    case 21:
                        error_4 = _d.sent();
                        console.log("[screepsmod-testing] Suite afterAll failed: ".concat(error_4));
                        return [3 /*break*/, 22];
                    case 22: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Run a single test
     */
    TestRunner.prototype.runTest = function (suiteName, test, context) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, cpuTracker, memoryTracker, result, timeout, perfInfo, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        cpuTracker = new performance_1.CPUTracker();
                        memoryTracker = new performance_1.MemoryTracker();
                        result = {
                            suiteName: suiteName,
                            testName: test.name,
                            status: 'running',
                            duration: 0,
                            tick: context.tick,
                            tags: test.tags
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Start performance tracking
                        cpuTracker.start();
                        memoryTracker.start();
                        timeout = test.timeout || 5000;
                        return [4 /*yield*/, this.runWithTimeout(test.fn, timeout)];
                    case 2:
                        _a.sent();
                        // Stop performance tracking
                        result.cpuUsed = cpuTracker.stop();
                        result.memoryUsed = memoryTracker.stop();
                        result.status = 'passed';
                        result.duration = Date.now() - startTime;
                        perfInfo = '';
                        if (result.cpuUsed !== undefined) {
                            perfInfo = " (".concat(result.duration, "ms, ").concat(result.cpuUsed.toFixed(2), " CPU)");
                        }
                        else {
                            perfInfo = " (".concat(result.duration, "ms)");
                        }
                        console.log("[screepsmod-testing] \u2713 ".concat(suiteName, " > ").concat(test.name).concat(perfInfo));
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        result.status = 'failed';
                        result.duration = Date.now() - startTime;
                        result.cpuUsed = cpuTracker.stop();
                        result.memoryUsed = memoryTracker.stop();
                        result.error = {
                            message: error_5.message || String(error_5),
                            stack: error_5.stack,
                            expected: error_5.expected,
                            actual: error_5.actual
                        };
                        console.log("[screepsmod-testing] \u2717 ".concat(suiteName, " > ").concat(test.name));
                        console.log("[screepsmod-testing]   ".concat(error_5.message));
                        if (error_5.stack) {
                            console.log("[screepsmod-testing]   ".concat(error_5.stack));
                        }
                        return [3 /*break*/, 4];
                    case 4:
                        this.results.push(result);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Run a function with timeout
     */
    TestRunner.prototype.runWithTimeout = function (fn, timeout) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var timer = setTimeout(function () {
                            reject(new Error("Test timeout after ".concat(timeout, "ms")));
                        }, timeout);
                        Promise.resolve(fn())
                            .then(function () {
                            clearTimeout(timer);
                            resolve();
                        })
                            .catch(function (error) {
                            clearTimeout(timer);
                            reject(error);
                        });
                    })];
            });
        });
    };
    /**
     * Get test summary
     */
    TestRunner.prototype.getSummary = function (currentTick) {
        var passed = this.results.filter(function (r) { return r.status === 'passed'; }).length;
        var failed = this.results.filter(function (r) { return r.status === 'failed'; }).length;
        var skipped = this.results.filter(function (r) { return r.status === 'skipped'; }).length;
        var duration = this.results.reduce(function (sum, r) { return sum + r.duration; }, 0);
        return {
            total: this.results.length,
            passed: passed,
            failed: failed,
            skipped: skipped,
            duration: duration,
            startTick: this.startTick,
            endTick: currentTick,
            results: this.results,
            timestamp: Date.now()
        };
    };
    /**
     * Log test summary
     */
    TestRunner.prototype.logSummary = function (context) {
        var e_3, _a;
        var summary = this.getSummary(context.tick);
        var tickDuration = context.tick - summary.startTick;
        console.log('\n[screepsmod-testing] ========================================');
        console.log('[screepsmod-testing] Test Summary');
        console.log('[screepsmod-testing] ========================================');
        console.log("[screepsmod-testing] Total:   ".concat(summary.total));
        console.log("[screepsmod-testing] Passed:  ".concat(summary.passed));
        console.log("[screepsmod-testing] Failed:  ".concat(summary.failed));
        console.log("[screepsmod-testing] Skipped: ".concat(summary.skipped));
        console.log("[screepsmod-testing] Duration: ".concat(summary.duration, "ms (").concat(tickDuration, " ticks)"));
        console.log('[screepsmod-testing] ========================================\n');
        if (summary.failed > 0) {
            console.log('[screepsmod-testing] Failed tests:');
            try {
                for (var _b = __values(summary.results.filter(function (r) { return r.status === 'failed'; })), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var result = _c.value;
                    console.log("[screepsmod-testing]   \u2717 ".concat(result.suiteName, " > ").concat(result.testName));
                    if (result.error) {
                        console.log("[screepsmod-testing]     ".concat(result.error.message));
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            console.log('');
        }
    };
    /**
     * Clear all test results
     */
    TestRunner.prototype.clear = function () {
        this.results = [];
        this.isRunning = false;
        this.currentSuiteIndex = 0;
        this.currentTestIndex = 0;
    };
    /**
     * Reset the test runner (clear suites and results)
     */
    TestRunner.prototype.reset = function () {
        this.suites.clear();
        this.clear();
    };
    return TestRunner;
}());
exports.TestRunner = TestRunner;
//# sourceMappingURL=test-runner.js.map
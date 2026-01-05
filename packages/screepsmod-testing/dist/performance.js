"use strict";
/**
 * Performance benchmarking utilities for Screeps testing
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceAssert = exports.MemoryTracker = exports.CPUTracker = void 0;
exports.benchmark = benchmark;
/**
 * Benchmark a function's performance
 */
function benchmark(name_1, fn_1) {
    return __awaiter(this, arguments, void 0, function (name, fn, options) {
        var samples, iterations, warmup, timings, i, sample, start, i, end, mean, median, min, max, variance, stdDev;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    samples = options.samples || 10;
                    iterations = options.iterations || 100;
                    warmup = options.warmup || 5;
                    timings = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < warmup)) return [3 /*break*/, 4];
                    return [4 /*yield*/, fn()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    sample = 0;
                    _a.label = 5;
                case 5:
                    if (!(sample < samples)) return [3 /*break*/, 11];
                    start = Date.now();
                    i = 0;
                    _a.label = 6;
                case 6:
                    if (!(i < iterations)) return [3 /*break*/, 9];
                    return [4 /*yield*/, fn()];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8:
                    i++;
                    return [3 /*break*/, 6];
                case 9:
                    end = Date.now();
                    timings.push((end - start) / iterations);
                    _a.label = 10;
                case 10:
                    sample++;
                    return [3 /*break*/, 5];
                case 11:
                    // Calculate statistics
                    timings.sort(function (a, b) { return a - b; });
                    mean = timings.reduce(function (sum, t) { return sum + t; }, 0) / timings.length;
                    median = timings[Math.floor(timings.length / 2)];
                    min = timings[0];
                    max = timings[timings.length - 1];
                    variance = timings.reduce(function (sum, t) { return sum + Math.pow(t - mean, 2); }, 0) / timings.length;
                    stdDev = Math.sqrt(variance);
                    return [2 /*return*/, {
                            name: name,
                            samples: samples,
                            mean: mean,
                            median: median,
                            min: min,
                            max: max,
                            stdDev: stdDev,
                            iterations: iterations
                        }];
            }
        });
    });
}
/**
 * CPU usage tracking helper
 */
var CPUTracker = /** @class */ (function () {
    function CPUTracker() {
        this.startCPU = 0;
    }
    CPUTracker.prototype.start = function () {
        if (typeof Game !== 'undefined' && Game.cpu) {
            this.startCPU = Game.cpu.getUsed();
        }
        else {
            this.startCPU = Date.now();
        }
    };
    CPUTracker.prototype.stop = function () {
        if (typeof Game !== 'undefined' && Game.cpu) {
            return Game.cpu.getUsed() - this.startCPU;
        }
        else {
            return Date.now() - this.startCPU;
        }
    };
    return CPUTracker;
}());
exports.CPUTracker = CPUTracker;
/**
 * Memory usage tracking helper
 */
var MemoryTracker = /** @class */ (function () {
    function MemoryTracker() {
        this.startMemory = 0;
    }
    MemoryTracker.prototype.start = function () {
        if (typeof RawMemory !== 'undefined') {
            this.startMemory = RawMemory.get().length;
        }
        else if (typeof process !== 'undefined' && process.memoryUsage) {
            this.startMemory = process.memoryUsage().heapUsed;
        }
    };
    MemoryTracker.prototype.stop = function () {
        if (typeof RawMemory !== 'undefined') {
            return RawMemory.get().length - this.startMemory;
        }
        else if (typeof process !== 'undefined' && process.memoryUsage) {
            return process.memoryUsage().heapUsed - this.startMemory;
        }
        return 0;
    };
    return MemoryTracker;
}());
exports.MemoryTracker = MemoryTracker;
/**
 * Performance assertion helpers
 */
var PerformanceAssert = /** @class */ (function () {
    function PerformanceAssert() {
    }
    /**
     * Assert that a function completes within a certain CPU budget
     */
    PerformanceAssert.cpuBudget = function (fn, maxCPU, message) {
        return __awaiter(this, void 0, void 0, function () {
            var tracker, used;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tracker = new CPUTracker();
                        tracker.start();
                        return [4 /*yield*/, fn()];
                    case 1:
                        _a.sent();
                        used = tracker.stop();
                        if (used > maxCPU) {
                            throw new Error(message || "CPU budget exceeded: used ".concat(used.toFixed(2), " > ").concat(maxCPU));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Assert that a function completes within a certain time
     */
    PerformanceAssert.timeLimit = function (fn, maxMs, message) {
        return __awaiter(this, void 0, void 0, function () {
            var start, duration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        start = Date.now();
                        return [4 /*yield*/, fn()];
                    case 1:
                        _a.sent();
                        duration = Date.now() - start;
                        if (duration > maxMs) {
                            throw new Error(message || "Time limit exceeded: took ".concat(duration, "ms > ").concat(maxMs, "ms"));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Assert that memory usage stays within a limit
     */
    PerformanceAssert.memoryLimit = function (fn, maxBytes, message) {
        return __awaiter(this, void 0, void 0, function () {
            var tracker, used;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tracker = new MemoryTracker();
                        tracker.start();
                        return [4 /*yield*/, fn()];
                    case 1:
                        _a.sent();
                        used = tracker.stop();
                        if (used > maxBytes) {
                            throw new Error(message || "Memory limit exceeded: used ".concat(used, " bytes > ").concat(maxBytes, " bytes"));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return PerformanceAssert;
}());
exports.PerformanceAssert = PerformanceAssert;
//# sourceMappingURL=performance.js.map
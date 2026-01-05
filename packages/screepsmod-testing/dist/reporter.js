"use strict";
/**
 * Test reporters for various output formats
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleReporter = exports.JSONReporter = void 0;
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var OUTPUT_VERSION = '1.0.0';
/**
 * JSON reporter for CI/CD integration
 */
var JSONReporter = /** @class */ (function () {
    function JSONReporter(outputDir) {
        this.outputDir = outputDir || path.join(process.cwd(), 'test-results');
    }
    /**
     * Generate JSON output for test results
     */
    JSONReporter.prototype.generate = function (summary, coverage, benchmarks) {
        var output = {
            version: OUTPUT_VERSION,
            timestamp: Date.now(),
            environment: {
                server: 'screeps',
                tick: summary.endTick
            },
            summary: summary,
            coverage: coverage,
            benchmarks: benchmarks
        };
        return output;
    };
    /**
     * Write JSON report to file
     */
    JSONReporter.prototype.write = function (output, filename) {
        try {
            // Create output directory if it doesn't exist
            if (!fs.existsSync(this.outputDir)) {
                fs.mkdirSync(this.outputDir, { recursive: true });
            }
            var file = filename || "test-results-".concat(output.timestamp, ".json");
            var filePath = path.join(this.outputDir, file);
            fs.writeFileSync(filePath, JSON.stringify(output, null, 2), 'utf8');
            console.log("[screepsmod-testing] JSON report written to ".concat(filePath));
        }
        catch (error) {
            console.log("[screepsmod-testing] Error writing JSON report: ".concat(error));
        }
    };
    /**
     * Write JSON report compatible with JUnit format
     */
    JSONReporter.prototype.writeJUnit = function (summary, filename) {
        try {
            // Create output directory if it doesn't exist
            if (!fs.existsSync(this.outputDir)) {
                fs.mkdirSync(this.outputDir, { recursive: true });
            }
            var file = filename || "junit-results-".concat(Date.now(), ".xml");
            var filePath = path.join(this.outputDir, file);
            var xml = this.generateJUnitXML(summary);
            fs.writeFileSync(filePath, xml, 'utf8');
            console.log("[screepsmod-testing] JUnit XML report written to ".concat(filePath));
        }
        catch (error) {
            console.log("[screepsmod-testing] Error writing JUnit report: ".concat(error));
        }
    };
    /**
     * Generate JUnit XML format
     */
    JSONReporter.prototype.generateJUnitXML = function (summary) {
        var e_1, _a, e_2, _b, e_3, _c;
        var timestamp = new Date(summary.timestamp || Date.now()).toISOString();
        var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += "<testsuites tests=\"".concat(summary.total, "\" failures=\"").concat(summary.failed, "\" ");
        xml += "skipped=\"".concat(summary.skipped, "\" time=\"").concat(summary.duration / 1000, "\" timestamp=\"").concat(timestamp, "\">\n");
        // Group results by suite
        var suiteMap = new Map();
        try {
            for (var _d = __values(summary.results), _e = _d.next(); !_e.done; _e = _d.next()) {
                var result = _e.value;
                if (!suiteMap.has(result.suiteName)) {
                    suiteMap.set(result.suiteName, []);
                }
                suiteMap.get(result.suiteName).push(result);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            // Generate testsuite elements
            for (var suiteMap_1 = __values(suiteMap), suiteMap_1_1 = suiteMap_1.next(); !suiteMap_1_1.done; suiteMap_1_1 = suiteMap_1.next()) {
                var _f = __read(suiteMap_1_1.value, 2), suiteName = _f[0], results = _f[1];
                var suiteTests = results.length;
                var suiteFailed = results.filter(function (r) { return r.status === 'failed'; }).length;
                var suiteSkipped = results.filter(function (r) { return r.status === 'skipped'; }).length;
                var suiteDuration = results.reduce(function (sum, r) { return sum + r.duration; }, 0);
                xml += "  <testsuite name=\"".concat(this.escapeXML(suiteName), "\" tests=\"").concat(suiteTests, "\" ");
                xml += "failures=\"".concat(suiteFailed, "\" skipped=\"").concat(suiteSkipped, "\" time=\"").concat(suiteDuration / 1000, "\">\n");
                try {
                    // Generate testcase elements
                    for (var results_1 = (e_3 = void 0, __values(results)), results_1_1 = results_1.next(); !results_1_1.done; results_1_1 = results_1.next()) {
                        var result = results_1_1.value;
                        xml += "    <testcase name=\"".concat(this.escapeXML(result.testName), "\" ");
                        xml += "classname=\"".concat(this.escapeXML(result.suiteName), "\" time=\"").concat(result.duration / 1000, "\"");
                        if (result.status === 'failed' && result.error) {
                            xml += '>\n';
                            xml += "      <failure message=\"".concat(this.escapeXML(result.error.message), "\">\n");
                            xml += this.escapeXML(result.error.stack || result.error.message);
                            xml += '\n      </failure>\n';
                            xml += '    </testcase>\n';
                        }
                        else if (result.status === 'skipped') {
                            xml += '>\n';
                            xml += '      <skipped/>\n';
                            xml += '    </testcase>\n';
                        }
                        else {
                            xml += '/>\n';
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (results_1_1 && !results_1_1.done && (_c = results_1.return)) _c.call(results_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                xml += '  </testsuite>\n';
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (suiteMap_1_1 && !suiteMap_1_1.done && (_b = suiteMap_1.return)) _b.call(suiteMap_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        xml += '</testsuites>\n';
        return xml;
    };
    /**
     * Escape XML special characters
     */
    JSONReporter.prototype.escapeXML = function (str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    };
    return JSONReporter;
}());
exports.JSONReporter = JSONReporter;
/**
 * Console reporter with colored output
 */
var ConsoleReporter = /** @class */ (function () {
    function ConsoleReporter() {
    }
    /**
     * Print test summary to console
     */
    ConsoleReporter.prototype.printSummary = function (summary) {
        var e_4, _a;
        var passRate = summary.total > 0 ? (summary.passed / summary.total * 100).toFixed(1) : '0';
        var tickDuration = summary.endTick - summary.startTick;
        console.log('\n' + '='.repeat(60));
        console.log('TEST SUMMARY');
        console.log('='.repeat(60));
        console.log("Total:    ".concat(summary.total));
        console.log("Passed:   ".concat(summary.passed, " (").concat(passRate, "%)"));
        console.log("Failed:   ".concat(summary.failed));
        console.log("Skipped:  ".concat(summary.skipped));
        console.log("Duration: ".concat(summary.duration, "ms (").concat(tickDuration, " ticks)"));
        console.log('='.repeat(60) + '\n');
        if (summary.failed > 0) {
            console.log('FAILED TESTS:');
            try {
                for (var _b = __values(summary.results.filter(function (r) { return r.status === 'failed'; })), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var result = _c.value;
                    console.log("  \u2717 ".concat(result.suiteName, " > ").concat(result.testName));
                    if (result.error) {
                        console.log("    ".concat(result.error.message));
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            console.log('');
        }
    };
    /**
     * Print coverage information
     */
    ConsoleReporter.prototype.printCoverage = function (coverage) {
        console.log('CODE COVERAGE:');
        console.log("  Lines:      ".concat(coverage.lines.covered, "/").concat(coverage.lines.total, " (").concat(coverage.lines.percentage.toFixed(1), "%)"));
        console.log("  Branches:   ".concat(coverage.branches.covered, "/").concat(coverage.branches.total, " (").concat(coverage.branches.percentage.toFixed(1), "%)"));
        console.log("  Functions:  ".concat(coverage.functions.covered, "/").concat(coverage.functions.total, " (").concat(coverage.functions.percentage.toFixed(1), "%)"));
        console.log("  Statements: ".concat(coverage.statements.covered, "/").concat(coverage.statements.total, " (").concat(coverage.statements.percentage.toFixed(1), "%)"));
        console.log('');
    };
    /**
     * Print benchmark results
     */
    ConsoleReporter.prototype.printBenchmarks = function (benchmarks) {
        var e_5, _a;
        if (benchmarks.length === 0)
            return;
        console.log('BENCHMARKS:');
        try {
            for (var benchmarks_1 = __values(benchmarks), benchmarks_1_1 = benchmarks_1.next(); !benchmarks_1_1.done; benchmarks_1_1 = benchmarks_1.next()) {
                var benchmark = benchmarks_1_1.value;
                console.log("  ".concat(benchmark.name, ":"));
                console.log("    Mean:   ".concat(benchmark.mean.toFixed(3), "ms"));
                console.log("    Median: ".concat(benchmark.median.toFixed(3), "ms"));
                console.log("    Min:    ".concat(benchmark.min.toFixed(3), "ms"));
                console.log("    Max:    ".concat(benchmark.max.toFixed(3), "ms"));
                console.log("    StdDev: ".concat(benchmark.stdDev.toFixed(3), "ms"));
                console.log("    (".concat(benchmark.samples, " samples, ").concat(benchmark.iterations, " iterations each)"));
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (benchmarks_1_1 && !benchmarks_1_1.done && (_a = benchmarks_1.return)) _a.call(benchmarks_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
        console.log('');
    };
    return ConsoleReporter;
}());
exports.ConsoleReporter = ConsoleReporter;
//# sourceMappingURL=reporter.js.map
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleReporter = exports.JSONReporter = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const OUTPUT_VERSION = '1.0.0';
/**
 * JSON reporter for CI/CD integration
 */
class JSONReporter {
    constructor(outputDir) {
        this.outputDir = outputDir || path.join(process.cwd(), 'test-results');
    }
    /**
     * Generate JSON output for test results
     */
    generate(summary, coverage, benchmarks) {
        const output = {
            version: OUTPUT_VERSION,
            timestamp: Date.now(),
            environment: {
                server: 'screeps',
                tick: summary.endTick
            },
            summary,
            coverage,
            benchmarks
        };
        return output;
    }
    /**
     * Write JSON report to file
     */
    write(output, filename) {
        try {
            // Create output directory if it doesn't exist
            if (!fs.existsSync(this.outputDir)) {
                fs.mkdirSync(this.outputDir, { recursive: true });
            }
            const file = filename || `test-results-${output.timestamp}.json`;
            const filePath = path.join(this.outputDir, file);
            fs.writeFileSync(filePath, JSON.stringify(output, null, 2), 'utf8');
            console.log(`[screepsmod-testing] JSON report written to ${filePath}`);
        }
        catch (error) {
            console.log(`[screepsmod-testing] Error writing JSON report: ${error}`);
        }
    }
    /**
     * Write JSON report compatible with JUnit format
     */
    writeJUnit(summary, filename) {
        try {
            // Create output directory if it doesn't exist
            if (!fs.existsSync(this.outputDir)) {
                fs.mkdirSync(this.outputDir, { recursive: true });
            }
            const file = filename || `junit-results-${Date.now()}.xml`;
            const filePath = path.join(this.outputDir, file);
            const xml = this.generateJUnitXML(summary);
            fs.writeFileSync(filePath, xml, 'utf8');
            console.log(`[screepsmod-testing] JUnit XML report written to ${filePath}`);
        }
        catch (error) {
            console.log(`[screepsmod-testing] Error writing JUnit report: ${error}`);
        }
    }
    /**
     * Generate JUnit XML format
     */
    generateJUnitXML(summary) {
        const timestamp = new Date(summary.timestamp || Date.now()).toISOString();
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += `<testsuites tests="${summary.total}" failures="${summary.failed}" `;
        xml += `skipped="${summary.skipped}" time="${summary.duration / 1000}" timestamp="${timestamp}">\n`;
        // Group results by suite
        const suiteMap = new Map();
        for (const result of summary.results) {
            if (!suiteMap.has(result.suiteName)) {
                suiteMap.set(result.suiteName, []);
            }
            suiteMap.get(result.suiteName).push(result);
        }
        // Generate testsuite elements
        for (const [suiteName, results] of suiteMap) {
            const suiteTests = results.length;
            const suiteFailed = results.filter(r => r.status === 'failed').length;
            const suiteSkipped = results.filter(r => r.status === 'skipped').length;
            const suiteDuration = results.reduce((sum, r) => sum + r.duration, 0);
            xml += `  <testsuite name="${this.escapeXML(suiteName)}" tests="${suiteTests}" `;
            xml += `failures="${suiteFailed}" skipped="${suiteSkipped}" time="${suiteDuration / 1000}">\n`;
            // Generate testcase elements
            for (const result of results) {
                xml += `    <testcase name="${this.escapeXML(result.testName)}" `;
                xml += `classname="${this.escapeXML(result.suiteName)}" time="${result.duration / 1000}"`;
                if (result.status === 'failed' && result.error) {
                    xml += '>\n';
                    xml += `      <failure message="${this.escapeXML(result.error.message)}">\n`;
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
            xml += '  </testsuite>\n';
        }
        xml += '</testsuites>\n';
        return xml;
    }
    /**
     * Escape XML special characters
     */
    escapeXML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}
exports.JSONReporter = JSONReporter;
/**
 * Console reporter with colored output
 */
class ConsoleReporter {
    /**
     * Print test summary to console
     */
    printSummary(summary) {
        const passRate = summary.total > 0 ? (summary.passed / summary.total * 100).toFixed(1) : '0';
        const tickDuration = summary.endTick - summary.startTick;
        console.log('\n' + '='.repeat(60));
        console.log('TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total:    ${summary.total}`);
        console.log(`Passed:   ${summary.passed} (${passRate}%)`);
        console.log(`Failed:   ${summary.failed}`);
        console.log(`Skipped:  ${summary.skipped}`);
        console.log(`Duration: ${summary.duration}ms (${tickDuration} ticks)`);
        console.log('='.repeat(60) + '\n');
        if (summary.failed > 0) {
            console.log('FAILED TESTS:');
            for (const result of summary.results.filter(r => r.status === 'failed')) {
                console.log(`  ✗ ${result.suiteName} > ${result.testName}`);
                if (result.error) {
                    console.log(`    ${result.error.message}`);
                }
            }
            console.log('');
        }
    }
    /**
     * Print coverage information
     */
    printCoverage(coverage) {
        console.log('CODE COVERAGE:');
        console.log(`  Lines:      ${coverage.lines.covered}/${coverage.lines.total} (${coverage.lines.percentage.toFixed(1)}%)`);
        console.log(`  Branches:   ${coverage.branches.covered}/${coverage.branches.total} (${coverage.branches.percentage.toFixed(1)}%)`);
        console.log(`  Functions:  ${coverage.functions.covered}/${coverage.functions.total} (${coverage.functions.percentage.toFixed(1)}%)`);
        console.log(`  Statements: ${coverage.statements.covered}/${coverage.statements.total} (${coverage.statements.percentage.toFixed(1)}%)`);
        console.log('');
    }
    /**
     * Print benchmark results
     */
    printBenchmarks(benchmarks) {
        if (benchmarks.length === 0)
            return;
        console.log('BENCHMARKS:');
        for (const benchmark of benchmarks) {
            console.log(`  ${benchmark.name}:`);
            console.log(`    Mean:   ${benchmark.mean.toFixed(3)}ms`);
            console.log(`    Median: ${benchmark.median.toFixed(3)}ms`);
            console.log(`    Min:    ${benchmark.min.toFixed(3)}ms`);
            console.log(`    Max:    ${benchmark.max.toFixed(3)}ms`);
            console.log(`    StdDev: ${benchmark.stdDev.toFixed(3)}ms`);
            console.log(`    (${benchmark.samples} samples, ${benchmark.iterations} iterations each)`);
        }
        console.log('');
    }
}
exports.ConsoleReporter = ConsoleReporter;
//# sourceMappingURL=reporter.js.map
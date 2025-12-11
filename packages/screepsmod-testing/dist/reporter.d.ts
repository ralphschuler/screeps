/**
 * Test reporters for various output formats
 */
import { TestSummary, TestOutput, TestCoverage, BenchmarkResult } from './types';
/**
 * JSON reporter for CI/CD integration
 */
export declare class JSONReporter {
    private outputDir;
    constructor(outputDir?: string);
    /**
     * Generate JSON output for test results
     */
    generate(summary: TestSummary, coverage?: TestCoverage, benchmarks?: BenchmarkResult[]): TestOutput;
    /**
     * Write JSON report to file
     */
    write(output: TestOutput, filename?: string): void;
    /**
     * Write JSON report compatible with JUnit format
     */
    writeJUnit(summary: TestSummary, filename?: string): void;
    /**
     * Generate JUnit XML format
     */
    private generateJUnitXML;
    /**
     * Escape XML special characters
     */
    private escapeXML;
}
/**
 * Console reporter with colored output
 */
export declare class ConsoleReporter {
    /**
     * Print test summary to console
     */
    printSummary(summary: TestSummary): void;
    /**
     * Print coverage information
     */
    printCoverage(coverage: TestCoverage): void;
    /**
     * Print benchmark results
     */
    printBenchmarks(benchmarks: BenchmarkResult[]): void;
}
//# sourceMappingURL=reporter.d.ts.map
import { TestSuite, TestCase, TestSummary, TestContext, TestFilter } from './types';
/**
 * Test runner that executes tests within the Screeps server environment
 */
export declare class TestRunner {
    private suites;
    private results;
    private isRunning;
    private startTick;
    private currentSuiteIndex;
    private currentTestIndex;
    private filter?;
    /**
     * Register a test suite
     */
    registerSuite(suite: TestSuite): void;
    /**
     * Register a single test (creates a suite if needed)
     */
    registerTest(suiteName: string, test: TestCase): void;
    /**
     * Get all registered suites
     */
    getSuites(): TestSuite[];
    /**
     * Set test filter
     */
    setFilter(filter?: TestFilter): void;
    /**
     * Start running tests
     */
    start(context: TestContext, filter?: TestFilter): Promise<void>;
    /**
     * Run all registered tests
     */
    private runAllTests;
    /**
     * Run a single test suite
     */
    private runSuite;
    /**
     * Run a single test
     */
    private runTest;
    /**
     * Run a function with timeout
     */
    private runWithTimeout;
    /**
     * Get test summary
     */
    getSummary(currentTick: number): TestSummary;
    /**
     * Log test summary
     */
    private logSummary;
    /**
     * Clear all test results
     */
    clear(): void;
    /**
     * Reset the test runner (clear suites and results)
     */
    reset(): void;
}
//# sourceMappingURL=test-runner.d.ts.map
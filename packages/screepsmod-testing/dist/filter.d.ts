/**
 * Test filtering utilities
 */
import { TestSuite, TestFilter } from './types';
/**
 * Filter manager for test selection
 */
export declare class FilterManager {
    private filter;
    constructor(filter?: TestFilter);
    /**
     * Check if a test suite matches the filter
     */
    matchesSuite(suiteName: string): boolean;
    /**
     * Check if a test case matches the filter
     */
    matchesTest(testName: string, tags?: string[]): boolean;
    /**
     * Filter a list of test suites
     */
    filterSuites(suites: TestSuite[]): TestSuite[];
    /**
     * Create a filter from command-line style arguments
     */
    static fromArgs(args: {
        pattern?: string;
        tag?: string | string[];
        suite?: string | string[];
        excludeTag?: string | string[];
        excludeSuite?: string | string[];
    }): FilterManager;
    /**
     * Get a summary of the current filter
     */
    getSummary(): string;
}
/**
 * Helper function to create a filter
 */
export declare function createFilter(filter?: TestFilter): FilterManager;
//# sourceMappingURL=filter.d.ts.map
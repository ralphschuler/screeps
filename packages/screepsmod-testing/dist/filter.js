"use strict";
/**
 * Test filtering utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterManager = void 0;
exports.createFilter = createFilter;
/**
 * Filter manager for test selection
 */
class FilterManager {
    constructor(filter = {}) {
        this.filter = filter;
    }
    /**
     * Check if a test suite matches the filter
     */
    matchesSuite(suiteName) {
        // Check excluded suites first
        if (this.filter.excludeSuites && this.filter.excludeSuites.includes(suiteName)) {
            return false;
        }
        // Check included suites
        if (this.filter.suites && this.filter.suites.length > 0) {
            return this.filter.suites.includes(suiteName);
        }
        return true;
    }
    /**
     * Check if a test case matches the filter
     */
    matchesTest(testName, tags) {
        // Check pattern match
        if (this.filter.pattern) {
            const pattern = typeof this.filter.pattern === 'string'
                ? new RegExp(this.filter.pattern)
                : this.filter.pattern;
            if (!pattern.test(testName)) {
                return false;
            }
        }
        // Check tags
        if (tags && tags.length > 0) {
            // Check excluded tags first
            if (this.filter.excludeTags && this.filter.excludeTags.length > 0) {
                if (tags.some(tag => this.filter.excludeTags.includes(tag))) {
                    return false;
                }
            }
            // Check included tags
            if (this.filter.tags && this.filter.tags.length > 0) {
                return tags.some(tag => this.filter.tags.includes(tag));
            }
        }
        else if (this.filter.tags && this.filter.tags.length > 0) {
            // Test has no tags but filter requires tags
            return false;
        }
        return true;
    }
    /**
     * Filter a list of test suites
     */
    filterSuites(suites) {
        const filtered = [];
        for (const suite of suites) {
            if (!this.matchesSuite(suite.name)) {
                continue;
            }
            const filteredTests = suite.tests.filter(test => this.matchesTest(test.name, test.tags));
            if (filteredTests.length > 0) {
                filtered.push({
                    ...suite,
                    tests: filteredTests
                });
            }
        }
        return filtered;
    }
    /**
     * Create a filter from command-line style arguments
     */
    static fromArgs(args) {
        const filter = {};
        if (args.pattern) {
            filter.pattern = args.pattern;
        }
        if (args.tag) {
            filter.tags = Array.isArray(args.tag) ? args.tag : [args.tag];
        }
        if (args.suite) {
            filter.suites = Array.isArray(args.suite) ? args.suite : [args.suite];
        }
        if (args.excludeTag) {
            filter.excludeTags = Array.isArray(args.excludeTag) ? args.excludeTag : [args.excludeTag];
        }
        if (args.excludeSuite) {
            filter.excludeSuites = Array.isArray(args.excludeSuite) ? args.excludeSuite : [args.excludeSuite];
        }
        return new FilterManager(filter);
    }
    /**
     * Get a summary of the current filter
     */
    getSummary() {
        const parts = [];
        if (this.filter.pattern) {
            parts.push(`pattern: ${this.filter.pattern}`);
        }
        if (this.filter.tags && this.filter.tags.length > 0) {
            parts.push(`tags: ${this.filter.tags.join(', ')}`);
        }
        if (this.filter.suites && this.filter.suites.length > 0) {
            parts.push(`suites: ${this.filter.suites.join(', ')}`);
        }
        if (this.filter.excludeTags && this.filter.excludeTags.length > 0) {
            parts.push(`exclude-tags: ${this.filter.excludeTags.join(', ')}`);
        }
        if (this.filter.excludeSuites && this.filter.excludeSuites.length > 0) {
            parts.push(`exclude-suites: ${this.filter.excludeSuites.join(', ')}`);
        }
        return parts.length > 0 ? parts.join(', ') : 'no filters';
    }
}
exports.FilterManager = FilterManager;
/**
 * Helper function to create a filter
 */
function createFilter(filter) {
    return new FilterManager(filter);
}
//# sourceMappingURL=filter.js.map
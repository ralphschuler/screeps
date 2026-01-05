"use strict";
/**
 * Test filtering utilities
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
exports.FilterManager = void 0;
exports.createFilter = createFilter;
/**
 * Filter manager for test selection
 */
var FilterManager = /** @class */ (function () {
    function FilterManager(filter) {
        if (filter === void 0) { filter = {}; }
        this.filter = filter;
    }
    /**
     * Check if a test suite matches the filter
     */
    FilterManager.prototype.matchesSuite = function (suiteName) {
        // Check excluded suites first
        if (this.filter.excludeSuites && this.filter.excludeSuites.includes(suiteName)) {
            return false;
        }
        // Check included suites
        if (this.filter.suites && this.filter.suites.length > 0) {
            return this.filter.suites.includes(suiteName);
        }
        return true;
    };
    /**
     * Check if a test case matches the filter
     */
    FilterManager.prototype.matchesTest = function (testName, tags) {
        var _this = this;
        // Check pattern match
        if (this.filter.pattern) {
            var pattern = typeof this.filter.pattern === 'string'
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
                if (tags.some(function (tag) { return _this.filter.excludeTags.includes(tag); })) {
                    return false;
                }
            }
            // Check included tags
            if (this.filter.tags && this.filter.tags.length > 0) {
                return tags.some(function (tag) { return _this.filter.tags.includes(tag); });
            }
        }
        else if (this.filter.tags && this.filter.tags.length > 0) {
            // Test has no tags but filter requires tags
            return false;
        }
        return true;
    };
    /**
     * Filter a list of test suites
     */
    FilterManager.prototype.filterSuites = function (suites) {
        var e_1, _a;
        var _this = this;
        var filtered = [];
        try {
            for (var suites_1 = __values(suites), suites_1_1 = suites_1.next(); !suites_1_1.done; suites_1_1 = suites_1.next()) {
                var suite_1 = suites_1_1.value;
                if (!this.matchesSuite(suite_1.name)) {
                    continue;
                }
                var filteredTests = suite_1.tests.filter(function (test) {
                    return _this.matchesTest(test.name, test.tags);
                });
                if (filteredTests.length > 0) {
                    filtered.push(__assign(__assign({}, suite_1), { tests: filteredTests }));
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (suites_1_1 && !suites_1_1.done && (_a = suites_1.return)) _a.call(suites_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return filtered;
    };
    /**
     * Create a filter from command-line style arguments
     */
    FilterManager.fromArgs = function (args) {
        var filter = {};
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
    };
    /**
     * Get a summary of the current filter
     */
    FilterManager.prototype.getSummary = function () {
        var parts = [];
        if (this.filter.pattern) {
            parts.push("pattern: ".concat(this.filter.pattern));
        }
        if (this.filter.tags && this.filter.tags.length > 0) {
            parts.push("tags: ".concat(this.filter.tags.join(', ')));
        }
        if (this.filter.suites && this.filter.suites.length > 0) {
            parts.push("suites: ".concat(this.filter.suites.join(', ')));
        }
        if (this.filter.excludeTags && this.filter.excludeTags.length > 0) {
            parts.push("exclude-tags: ".concat(this.filter.excludeTags.join(', ')));
        }
        if (this.filter.excludeSuites && this.filter.excludeSuites.length > 0) {
            parts.push("exclude-suites: ".concat(this.filter.excludeSuites.join(', ')));
        }
        return parts.length > 0 ? parts.join(', ') : 'no filters';
    };
    return FilterManager;
}());
exports.FilterManager = FilterManager;
/**
 * Helper function to create a filter
 */
function createFilter(filter) {
    return new FilterManager(filter);
}
//# sourceMappingURL=filter.js.map
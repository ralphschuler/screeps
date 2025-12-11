"use strict";
/**
 * screepsmod-testing - A modular testing framework for Screeps
 *
 * This module provides test registration and utilities that can be accessed
 * from within the bot code running in the Screeps server.
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRunner = exports.testRunner = void 0;
exports.describe = describe;
exports.it = it;
exports.xit = xit;
exports.beforeEach = beforeEach;
exports.afterEach = afterEach;
exports.beforeAll = beforeAll;
exports.afterAll = afterAll;
const test_runner_1 = require("./test-runner");
// Global test runner instance
const globalRunner = new test_runner_1.TestRunner();
exports.testRunner = globalRunner;
/**
 * Define a test suite
 */
function describe(name, fn) {
    const suite = {
        name,
        tests: [],
    };
    // Store current context
    const previousContext = currentSuiteContext;
    currentSuiteContext = suite;
    // Execute the suite definition
    fn();
    // Restore context
    currentSuiteContext = previousContext;
    // Register the suite
    globalRunner.registerSuite(suite);
}
/**
 * Define a test case
 */
function it(name, fn, tags) {
    if (!currentSuiteContext) {
        throw new Error('it() can only be called within a describe() block');
    }
    const test = {
        name,
        fn,
        tags,
    };
    currentSuiteContext.tests.push(test);
}
/**
 * Skip a test case
 */
function xit(name, fn, tags) {
    if (!currentSuiteContext) {
        throw new Error('xit() can only be called within a describe() block');
    }
    const test = {
        name,
        fn,
        skip: true,
        tags,
    };
    currentSuiteContext.tests.push(test);
}
/**
 * Define a beforeEach hook
 */
function beforeEach(fn) {
    if (!currentSuiteContext) {
        throw new Error('beforeEach() can only be called within a describe() block');
    }
    currentSuiteContext.beforeEach = fn;
}
/**
 * Define an afterEach hook
 */
function afterEach(fn) {
    if (!currentSuiteContext) {
        throw new Error('afterEach() can only be called within a describe() block');
    }
    currentSuiteContext.afterEach = fn;
}
/**
 * Define a beforeAll hook
 */
function beforeAll(fn) {
    if (!currentSuiteContext) {
        throw new Error('beforeAll() can only be called within a describe() block');
    }
    currentSuiteContext.beforeAll = fn;
}
/**
 * Define an afterAll hook
 */
function afterAll(fn) {
    if (!currentSuiteContext) {
        throw new Error('afterAll() can only be called within a describe() block');
    }
    currentSuiteContext.afterAll = fn;
}
// Track current suite context for nested describe blocks
let currentSuiteContext = null;
// Re-export types and assertions
__exportStar(require("./types"), exports);
__exportStar(require("./assertions"), exports);
var test_runner_2 = require("./test-runner");
Object.defineProperty(exports, "TestRunner", { enumerable: true, get: function () { return test_runner_2.TestRunner; } });
// Export new utilities
__exportStar(require("./performance"), exports);
__exportStar(require("./filter"), exports);
__exportStar(require("./reporter"), exports);
__exportStar(require("./persistence"), exports);
__exportStar(require("./visual"), exports);
//# sourceMappingURL=index.js.map
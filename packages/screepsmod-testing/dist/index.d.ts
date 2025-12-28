/**
 * screepsmod-testing - A modular testing framework for Screeps
 *
 * This module provides test registration and utilities that can be accessed
 * from within the bot code running in the Screeps server.
 *
 * TODO(P2): FEATURE - Add test timeout support to prevent infinite loops
 * Long-running tests should fail gracefully after a configurable timeout
 * TODO(P2): FEATURE - Implement test grouping with tags for selective execution
 * Allow running subsets of tests by tag (e.g., "fast", "integration", "slow")
 * TODO(P3): FEATURE - Add test result persistence across server restarts
 * Save and resume test state for long-running test suites
 * TODO(P2): DOC - Add comprehensive documentation for all test utilities
 * Include examples and best practices for writing Screeps tests
 */
import { TestRunner } from './test-runner';
declare const globalRunner: TestRunner;
/**
 * Define a test suite
 */
export declare function describe(name: string, fn: () => void): void;
/**
 * Define a test case
 */
export declare function it(name: string, fn: () => void | Promise<void>, tags?: string[]): void;
/**
 * Skip a test case
 */
export declare function xit(name: string, fn: () => void | Promise<void>, tags?: string[]): void;
/**
 * Define a beforeEach hook
 */
export declare function beforeEach(fn: () => void | Promise<void>): void;
/**
 * Define an afterEach hook
 */
export declare function afterEach(fn: () => void | Promise<void>): void;
/**
 * Define a beforeAll hook
 */
export declare function beforeAll(fn: () => void | Promise<void>): void;
/**
 * Define an afterAll hook
 */
export declare function afterAll(fn: () => void | Promise<void>): void;
export { globalRunner as testRunner };
export * from './types';
export * from './assertions';
export { TestRunner } from './test-runner';
export * from './performance';
export * from './filter';
export * from './reporter';
export * from './persistence';
export * from './visual';
//# sourceMappingURL=index.d.ts.map
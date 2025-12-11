/**
 * screepsmod-testing - A modular testing framework for Screeps
 *
 * This module provides test registration and utilities that can be accessed
 * from within the bot code running in the Screeps server.
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
export declare function it(name: string, fn: () => void | Promise<void>): void;
/**
 * Skip a test case
 */
export declare function xit(name: string, fn: () => void | Promise<void>): void;
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
//# sourceMappingURL=index.d.ts.map
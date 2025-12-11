/**
 * screepsmod-testing - A modular testing framework for Screeps
 * 
 * This module provides test registration and utilities that can be accessed
 * from within the bot code running in the Screeps server.
 */

import { TestRunner } from './test-runner';
import { TestSuite, TestCase, TestContext } from './types';

// Global test runner instance
const globalRunner = new TestRunner();

/**
 * Define a test suite
 */
export function describe(name: string, fn: () => void): void {
  const suite: TestSuite = {
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
export function it(name: string, fn: () => void | Promise<void>, tags?: string[]): void {
  if (!currentSuiteContext) {
    throw new Error('it() can only be called within a describe() block');
  }

  const test: TestCase = {
    name,
    fn,
    tags,
  };

  currentSuiteContext.tests.push(test);
}

/**
 * Skip a test case
 */
export function xit(name: string, fn: () => void | Promise<void>, tags?: string[]): void {
  if (!currentSuiteContext) {
    throw new Error('xit() can only be called within a describe() block');
  }

  const test: TestCase = {
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
export function beforeEach(fn: () => void | Promise<void>): void {
  if (!currentSuiteContext) {
    throw new Error('beforeEach() can only be called within a describe() block');
  }
  currentSuiteContext.beforeEach = fn;
}

/**
 * Define an afterEach hook
 */
export function afterEach(fn: () => void | Promise<void>): void {
  if (!currentSuiteContext) {
    throw new Error('afterEach() can only be called within a describe() block');
  }
  currentSuiteContext.afterEach = fn;
}

/**
 * Define a beforeAll hook
 */
export function beforeAll(fn: () => void | Promise<void>): void {
  if (!currentSuiteContext) {
    throw new Error('beforeAll() can only be called within a describe() block');
  }
  currentSuiteContext.beforeAll = fn;
}

/**
 * Define an afterAll hook
 */
export function afterAll(fn: () => void | Promise<void>): void {
  if (!currentSuiteContext) {
    throw new Error('afterAll() can only be called within a describe() block');
  }
  currentSuiteContext.afterAll = fn;
}

// Track current suite context for nested describe blocks
let currentSuiteContext: TestSuite | null = null;

// Export test runner for backend use
export { globalRunner as testRunner };

// Re-export types and assertions
export * from './types';
export * from './assertions';
export { TestRunner } from './test-runner';

// Export new utilities
export * from './performance';
export * from './filter';
export * from './reporter';
export * from './persistence';
export * from './visual';

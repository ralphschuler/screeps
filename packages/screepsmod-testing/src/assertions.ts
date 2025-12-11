import { AssertionError } from './types';

/**
 * Simple assertion library for use within Screeps mods
 */
export class Assert {
  /**
   * Assert that a value is truthy
   */
  static isTrue(value: any, message?: string): void {
    if (!value) {
      throw new AssertionError(
        message || `Expected value to be truthy, but got ${value}`,
        true,
        value
      );
    }
  }

  /**
   * Assert that a value is falsy
   */
  static isFalse(value: any, message?: string): void {
    if (value) {
      throw new AssertionError(
        message || `Expected value to be falsy, but got ${value}`,
        false,
        value
      );
    }
  }

  /**
   * Assert that two values are equal (using ===)
   */
  static equal(actual: any, expected: any, message?: string): void {
    if (actual !== expected) {
      throw new AssertionError(
        message || `Expected ${actual} to equal ${expected}`,
        expected,
        actual
      );
    }
  }

  /**
   * Assert that two values are not equal (using !==)
   */
  static notEqual(actual: any, expected: any, message?: string): void {
    if (actual === expected) {
      throw new AssertionError(
        message || `Expected ${actual} to not equal ${expected}`,
        `not ${expected}`,
        actual
      );
    }
  }

  /**
   * Assert deep equality for objects and arrays
   */
  static deepEqual(actual: any, expected: any, message?: string): void {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      throw new AssertionError(
        message || `Expected ${actualStr} to deep equal ${expectedStr}`,
        expected,
        actual
      );
    }
  }

  /**
   * Assert that a value is null or undefined
   */
  static isNullish(value: any, message?: string): void {
    if (value != null) {
      throw new AssertionError(
        message || `Expected value to be null or undefined, but got ${value}`,
        null,
        value
      );
    }
  }

  /**
   * Assert that a value is not null or undefined
   */
  static isNotNullish(value: any, message?: string): void {
    if (value == null) {
      throw new AssertionError(
        message || `Expected value to not be null or undefined`,
        'not null',
        value
      );
    }
  }

  /**
   * Assert that a value is of a specific type
   */
  static isType(value: any, type: string, message?: string): void {
    const actualType = typeof value;
    if (actualType !== type) {
      throw new AssertionError(
        message || `Expected value to be of type ${type}, but got ${actualType}`,
        type,
        actualType
      );
    }
  }

  /**
   * Assert that a value is an instance of a class
   */
  static isInstanceOf(value: any, constructor: any, message?: string): void {
    if (!(value instanceof constructor)) {
      throw new AssertionError(
        message || `Expected value to be an instance of ${constructor.name}`,
        constructor.name,
        value.constructor?.name
      );
    }
  }

  /**
   * Assert that an array or string contains a value
   */
  static includes(container: any[] | string, value: any, message?: string): void {
    if (!container.includes(value)) {
      throw new AssertionError(
        message || `Expected ${container} to include ${value}`,
        `includes ${value}`,
        container
      );
    }
  }

  /**
   * Assert that a value is greater than another
   */
  static greaterThan(actual: number, expected: number, message?: string): void {
    if (actual <= expected) {
      throw new AssertionError(
        message || `Expected ${actual} to be greater than ${expected}`,
        `> ${expected}`,
        actual
      );
    }
  }

  /**
   * Assert that a value is less than another
   */
  static lessThan(actual: number, expected: number, message?: string): void {
    if (actual >= expected) {
      throw new AssertionError(
        message || `Expected ${actual} to be less than ${expected}`,
        `< ${expected}`,
        actual
      );
    }
  }

  /**
   * Assert that a value is within a range (inclusive)
   */
  static inRange(actual: number, min: number, max: number, message?: string): void {
    if (actual < min || actual > max) {
      throw new AssertionError(
        message || `Expected ${actual} to be between ${min} and ${max}`,
        `${min} <= x <= ${max}`,
        actual
      );
    }
  }

  /**
   * Assert that a function throws an error
   */
  static throws(fn: () => void, message?: string): void {
    try {
      fn();
      throw new AssertionError(
        message || 'Expected function to throw an error',
        'throws',
        'no error thrown'
      );
    } catch (error) {
      if (error instanceof AssertionError && error.message.includes('Expected function to throw')) {
        throw error;
      }
      // Function threw as expected
    }
  }

  /**
   * Assert that an object has a specific property
   */
  static hasProperty(obj: any, property: string, message?: string): void {
    if (!(property in obj)) {
      throw new AssertionError(
        message || `Expected object to have property '${property}'`,
        `has ${property}`,
        Object.keys(obj).join(', ')
      );
    }
  }

  /**
   * Fail immediately with a message
   */
  static fail(message: string): void {
    throw new AssertionError(message);
  }
}

/**
 * Convenience function to create assertions
 */
export function expect(value: any) {
  return {
    toBe: (expected: any, message?: string) => Assert.equal(value, expected, message),
    toEqual: (expected: any, message?: string) => Assert.deepEqual(value, expected, message),
    toBeTruthy: (message?: string) => Assert.isTrue(value, message),
    toBeFalsy: (message?: string) => Assert.isFalse(value, message),
    toBeNull: (message?: string) => Assert.equal(value, null, message),
    toBeUndefined: (message?: string) => Assert.equal(value, undefined, message),
    toBeGreaterThan: (expected: number, message?: string) => Assert.greaterThan(value, expected, message),
    toBeLessThan: (expected: number, message?: string) => Assert.lessThan(value, expected, message),
    toContain: (item: any, message?: string) => Assert.includes(value, item, message),
    toHaveProperty: (property: string, message?: string) => Assert.hasProperty(value, property, message)
  };
}

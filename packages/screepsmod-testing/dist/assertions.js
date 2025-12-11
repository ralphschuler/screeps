"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Assert = void 0;
exports.expect = expect;
const types_1 = require("./types");
/**
 * Simple assertion library for use within Screeps mods
 */
class Assert {
    /**
     * Assert that a value is truthy
     */
    static isTrue(value, message) {
        if (!value) {
            throw new types_1.AssertionError(message || `Expected value to be truthy, but got ${value}`, true, value);
        }
    }
    /**
     * Assert that a value is falsy
     */
    static isFalse(value, message) {
        if (value) {
            throw new types_1.AssertionError(message || `Expected value to be falsy, but got ${value}`, false, value);
        }
    }
    /**
     * Assert that two values are equal (using ===)
     */
    static equal(actual, expected, message) {
        if (actual !== expected) {
            throw new types_1.AssertionError(message || `Expected ${actual} to equal ${expected}`, expected, actual);
        }
    }
    /**
     * Assert that two values are not equal (using !==)
     */
    static notEqual(actual, expected, message) {
        if (actual === expected) {
            throw new types_1.AssertionError(message || `Expected ${actual} to not equal ${expected}`, `not ${expected}`, actual);
        }
    }
    /**
     * Assert deep equality for objects and arrays
     */
    static deepEqual(actual, expected, message) {
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(expected);
        if (actualStr !== expectedStr) {
            throw new types_1.AssertionError(message || `Expected ${actualStr} to deep equal ${expectedStr}`, expected, actual);
        }
    }
    /**
     * Assert that a value is null or undefined
     */
    static isNullish(value, message) {
        if (value != null) {
            throw new types_1.AssertionError(message || `Expected value to be null or undefined, but got ${value}`, null, value);
        }
    }
    /**
     * Assert that a value is not null or undefined
     */
    static isNotNullish(value, message) {
        if (value == null) {
            throw new types_1.AssertionError(message || `Expected value to not be null or undefined`, 'not null', value);
        }
    }
    /**
     * Assert that a value is of a specific type
     */
    static isType(value, type, message) {
        const actualType = typeof value;
        if (actualType !== type) {
            throw new types_1.AssertionError(message || `Expected value to be of type ${type}, but got ${actualType}`, type, actualType);
        }
    }
    /**
     * Assert that a value is an instance of a class
     */
    static isInstanceOf(value, constructor, message) {
        if (!(value instanceof constructor)) {
            throw new types_1.AssertionError(message || `Expected value to be an instance of ${constructor.name}`, constructor.name, value.constructor?.name);
        }
    }
    /**
     * Assert that an array or string contains a value
     */
    static includes(container, value, message) {
        if (!container.includes(value)) {
            throw new types_1.AssertionError(message || `Expected ${container} to include ${value}`, `includes ${value}`, container);
        }
    }
    /**
     * Assert that a value is greater than another
     */
    static greaterThan(actual, expected, message) {
        if (actual <= expected) {
            throw new types_1.AssertionError(message || `Expected ${actual} to be greater than ${expected}`, `> ${expected}`, actual);
        }
    }
    /**
     * Assert that a value is less than another
     */
    static lessThan(actual, expected, message) {
        if (actual >= expected) {
            throw new types_1.AssertionError(message || `Expected ${actual} to be less than ${expected}`, `< ${expected}`, actual);
        }
    }
    /**
     * Assert that a value is within a range (inclusive)
     */
    static inRange(actual, min, max, message) {
        if (actual < min || actual > max) {
            throw new types_1.AssertionError(message || `Expected ${actual} to be between ${min} and ${max}`, `${min} <= x <= ${max}`, actual);
        }
    }
    /**
     * Assert that a function throws an error
     */
    static throws(fn, message) {
        try {
            fn();
            throw new types_1.AssertionError(message || 'Expected function to throw an error', 'throws', 'no error thrown');
        }
        catch (error) {
            if (error instanceof types_1.AssertionError && error.message.includes('Expected function to throw')) {
                throw error;
            }
            // Function threw as expected
        }
    }
    /**
     * Assert that an object has a specific property
     */
    static hasProperty(obj, property, message) {
        if (!(property in obj)) {
            throw new types_1.AssertionError(message || `Expected object to have property '${property}'`, `has ${property}`, Object.keys(obj).join(', '));
        }
    }
    /**
     * Fail immediately with a message
     */
    static fail(message) {
        throw new types_1.AssertionError(message);
    }
}
exports.Assert = Assert;
/**
 * Convenience function to create assertions
 */
function expect(value) {
    return {
        toBe: (expected, message) => Assert.equal(value, expected, message),
        toEqual: (expected, message) => Assert.deepEqual(value, expected, message),
        toBeTruthy: (message) => Assert.isTrue(value, message),
        toBeFalsy: (message) => Assert.isFalse(value, message),
        toBeNull: (message) => Assert.equal(value, null, message),
        toBeUndefined: (message) => Assert.equal(value, undefined, message),
        toBeGreaterThan: (expected, message) => Assert.greaterThan(value, expected, message),
        toBeLessThan: (expected, message) => Assert.lessThan(value, expected, message),
        toContain: (item, message) => Assert.includes(value, item, message),
        toHaveProperty: (property, message) => Assert.hasProperty(value, property, message)
    };
}
//# sourceMappingURL=assertions.js.map
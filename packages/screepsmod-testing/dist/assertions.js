"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Assert = void 0;
exports.expect = expect;
var types_1 = require("./types");
/**
 * Simple assertion library for use within Screeps mods
 */
var Assert = /** @class */ (function () {
    function Assert() {
    }
    /**
     * Assert that a value is truthy
     */
    Assert.isTrue = function (value, message) {
        if (!value) {
            throw new types_1.AssertionError(message || "Expected value to be truthy, but got ".concat(value), true, value);
        }
    };
    /**
     * Assert that a value is falsy
     */
    Assert.isFalse = function (value, message) {
        if (value) {
            throw new types_1.AssertionError(message || "Expected value to be falsy, but got ".concat(value), false, value);
        }
    };
    /**
     * Assert that two values are equal (using ===)
     */
    Assert.equal = function (actual, expected, message) {
        if (actual !== expected) {
            throw new types_1.AssertionError(message || "Expected ".concat(actual, " to equal ").concat(expected), expected, actual);
        }
    };
    /**
     * Assert that two values are not equal (using !==)
     */
    Assert.notEqual = function (actual, expected, message) {
        if (actual === expected) {
            throw new types_1.AssertionError(message || "Expected ".concat(actual, " to not equal ").concat(expected), "not ".concat(expected), actual);
        }
    };
    /**
     * Assert deep equality for objects and arrays
     */
    Assert.deepEqual = function (actual, expected, message) {
        var actualStr = JSON.stringify(actual);
        var expectedStr = JSON.stringify(expected);
        if (actualStr !== expectedStr) {
            throw new types_1.AssertionError(message || "Expected ".concat(actualStr, " to deep equal ").concat(expectedStr), expected, actual);
        }
    };
    /**
     * Assert that a value is null or undefined
     */
    Assert.isNullish = function (value, message) {
        if (value != null) {
            throw new types_1.AssertionError(message || "Expected value to be null or undefined, but got ".concat(value), null, value);
        }
    };
    /**
     * Assert that a value is not null or undefined
     */
    Assert.isNotNullish = function (value, message) {
        if (value == null) {
            throw new types_1.AssertionError(message || "Expected value to not be null or undefined", 'not null', value);
        }
    };
    /**
     * Assert that a value is of a specific type
     */
    Assert.isType = function (value, type, message) {
        var actualType = typeof value;
        if (actualType !== type) {
            throw new types_1.AssertionError(message || "Expected value to be of type ".concat(type, ", but got ").concat(actualType), type, actualType);
        }
    };
    /**
     * Assert that a value is an instance of a class
     */
    Assert.isInstanceOf = function (value, constructor, message) {
        var _a;
        if (!(value instanceof constructor)) {
            throw new types_1.AssertionError(message || "Expected value to be an instance of ".concat(constructor.name), constructor.name, (_a = value.constructor) === null || _a === void 0 ? void 0 : _a.name);
        }
    };
    /**
     * Assert that an array or string contains a value
     */
    Assert.includes = function (container, value, message) {
        if (!container.includes(value)) {
            throw new types_1.AssertionError(message || "Expected ".concat(container, " to include ").concat(value), "includes ".concat(value), container);
        }
    };
    /**
     * Assert that a value is greater than another
     */
    Assert.greaterThan = function (actual, expected, message) {
        if (actual <= expected) {
            throw new types_1.AssertionError(message || "Expected ".concat(actual, " to be greater than ").concat(expected), "> ".concat(expected), actual);
        }
    };
    /**
     * Assert that a value is less than another
     */
    Assert.lessThan = function (actual, expected, message) {
        if (actual >= expected) {
            throw new types_1.AssertionError(message || "Expected ".concat(actual, " to be less than ").concat(expected), "< ".concat(expected), actual);
        }
    };
    /**
     * Assert that a value is within a range (inclusive)
     */
    Assert.inRange = function (actual, min, max, message) {
        if (actual < min || actual > max) {
            throw new types_1.AssertionError(message || "Expected ".concat(actual, " to be between ").concat(min, " and ").concat(max), "".concat(min, " <= x <= ").concat(max), actual);
        }
    };
    /**
     * Assert that a function throws an error
     */
    Assert.throws = function (fn, message) {
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
    };
    /**
     * Assert that an object has a specific property
     */
    Assert.hasProperty = function (obj, property, message) {
        if (!(property in obj)) {
            throw new types_1.AssertionError(message || "Expected object to have property '".concat(property, "'"), "has ".concat(property), Object.keys(obj).join(', '));
        }
    };
    /**
     * Fail immediately with a message
     */
    Assert.fail = function (message) {
        throw new types_1.AssertionError(message);
    };
    return Assert;
}());
exports.Assert = Assert;
/**
 * Convenience function to create assertions
 */
function expect(value) {
    return {
        toBe: function (expected, message) { return Assert.equal(value, expected, message); },
        toEqual: function (expected, message) { return Assert.deepEqual(value, expected, message); },
        toBeTruthy: function (message) { return Assert.isTrue(value, message); },
        toBeFalsy: function (message) { return Assert.isFalse(value, message); },
        toBeNull: function (message) { return Assert.equal(value, null, message); },
        toBeUndefined: function (message) { return Assert.equal(value, undefined, message); },
        toBeGreaterThan: function (expected, message) { return Assert.greaterThan(value, expected, message); },
        toBeLessThan: function (expected, message) { return Assert.lessThan(value, expected, message); },
        toContain: function (item, message) { return Assert.includes(value, item, message); },
        toHaveProperty: function (property, message) { return Assert.hasProperty(value, property, message); }
    };
}
//# sourceMappingURL=assertions.js.map
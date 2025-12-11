"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssertionError = void 0;
/**
 * Test assertion error
 */
class AssertionError extends Error {
    constructor(message, expected, actual) {
        super(message);
        this.expected = expected;
        this.actual = actual;
        this.name = 'AssertionError';
    }
}
exports.AssertionError = AssertionError;
//# sourceMappingURL=types.js.map
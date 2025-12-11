/**
 * Simple assertion library for use within Screeps mods
 */
export declare class Assert {
    /**
     * Assert that a value is truthy
     */
    static isTrue(value: any, message?: string): void;
    /**
     * Assert that a value is falsy
     */
    static isFalse(value: any, message?: string): void;
    /**
     * Assert that two values are equal (using ===)
     */
    static equal(actual: any, expected: any, message?: string): void;
    /**
     * Assert that two values are not equal (using !==)
     */
    static notEqual(actual: any, expected: any, message?: string): void;
    /**
     * Assert deep equality for objects and arrays
     */
    static deepEqual(actual: any, expected: any, message?: string): void;
    /**
     * Assert that a value is null or undefined
     */
    static isNullish(value: any, message?: string): void;
    /**
     * Assert that a value is not null or undefined
     */
    static isNotNullish(value: any, message?: string): void;
    /**
     * Assert that a value is of a specific type
     */
    static isType(value: any, type: string, message?: string): void;
    /**
     * Assert that a value is an instance of a class
     */
    static isInstanceOf(value: any, constructor: any, message?: string): void;
    /**
     * Assert that an array or string contains a value
     */
    static includes(container: any[] | string, value: any, message?: string): void;
    /**
     * Assert that a value is greater than another
     */
    static greaterThan(actual: number, expected: number, message?: string): void;
    /**
     * Assert that a value is less than another
     */
    static lessThan(actual: number, expected: number, message?: string): void;
    /**
     * Assert that a value is within a range (inclusive)
     */
    static inRange(actual: number, min: number, max: number, message?: string): void;
    /**
     * Assert that a function throws an error
     */
    static throws(fn: () => void, message?: string): void;
    /**
     * Assert that an object has a specific property
     */
    static hasProperty(obj: any, property: string, message?: string): void;
    /**
     * Fail immediately with a message
     */
    static fail(message: string): void;
}
/**
 * Convenience function to create assertions
 */
export declare function expect(value: any): {
    toBe: (expected: any, message?: string) => void;
    toEqual: (expected: any, message?: string) => void;
    toBeTruthy: (message?: string) => void;
    toBeFalsy: (message?: string) => void;
    toBeNull: (message?: string) => void;
    toBeUndefined: (message?: string) => void;
    toBeGreaterThan: (expected: number, message?: string) => void;
    toBeLessThan: (expected: number, message?: string) => void;
    toContain: (item: any, message?: string) => void;
    toHaveProperty: (property: string, message?: string) => void;
};
//# sourceMappingURL=assertions.d.ts.map
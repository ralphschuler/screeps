/**
 * Example test file demonstrating how to write tests for screepsmod-testing
 */

import { describe, it, beforeEach, afterEach, expect, Assert } from '../src/index';

// Example 1: Basic assertions
describe('Basic Assertions', () => {
  it('should assert equality', () => {
    const value = 42;
    expect(value).toBe(42);
    Assert.equal(value, 42);
  });

  it('should assert truthiness', () => {
    expect(true).toBeTruthy();
    Assert.isTrue(1 > 0);
  });

  it('should assert deep equality', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 2 };
    expect(obj1).toEqual(obj2);
  });

  it('should assert type checks', () => {
    Assert.isType('hello', 'string');
    Assert.isType(42, 'number');
    Assert.isType(true, 'boolean');
  });

  it('should assert ranges', () => {
    Assert.greaterThan(10, 5);
    Assert.lessThan(5, 10);
    Assert.inRange(7, 5, 10);
  });
});

// Example 2: Game state testing
describe('Game State Access', () => {
  it('should access Game object', () => {
    // In actual tests, Game will be available from the test context
    // This is just an example of how to structure tests
    Assert.isNotNullish(Game);
  });

  it('should check memory structure', () => {
    // Example of testing memory structure
    if (Memory.rooms) {
      Assert.isType(Memory.rooms, 'object');
    }
  });
});

// Example 3: Testing with setup and teardown
describe('Lifecycle Hooks', () => {
  let testData: any;

  beforeEach(() => {
    // Setup before each test
    testData = { value: 0 };
  });

  afterEach(() => {
    // Cleanup after each test
    testData = null;
  });

  it('should have initialized data', () => {
    Assert.isNotNullish(testData);
    Assert.equal(testData.value, 0);
  });

  it('should modify data independently', () => {
    testData.value = 42;
    Assert.equal(testData.value, 42);
  });
});

// Example 4: Testing arrays and collections
describe('Collections', () => {
  it('should test array contents', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr).toContain(3);
    Assert.includes(arr, 3);
  });

  it('should test object properties', () => {
    const obj = { name: 'test', value: 42 };
    expect(obj).toHaveProperty('name');
    Assert.hasProperty(obj, 'name');
  });
});

// Example 5: Error handling
describe('Error Handling', () => {
  it('should catch thrown errors', () => {
    Assert.throws(() => {
      throw new Error('Expected error');
    });
  });

  it('should handle async operations', async () => {
    // Async tests are supported
    const result = await Promise.resolve(42);
    Assert.equal(result, 42);
  });
});

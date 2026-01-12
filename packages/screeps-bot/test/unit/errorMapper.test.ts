/**
 * Unit tests for ErrorMapper utilities
 * Phase 2.1: Enhanced coverage for ErrorMapper (40% → 70%)
 * Tests source map caching, stack trace mapping, and error handling edge cases
 */

import { assert } from "chai";
import { ErrorMapper } from "../../src/utils/legacy/ErrorMapper";
import sinon from "sinon";

// Mock global Game for tick tracking
interface GlobalWithGame {
  Game?: { time: number; rooms?: Record<string, unknown> };
}

describe("ErrorMapper", () => {
  let consoleStub: sinon.SinonStub;

  beforeEach(() => {
    // Setup mock Game
    (global as GlobalWithGame).Game = { time: 1000, rooms: {} };
    
    // Stub console.log to prevent test output pollution
    consoleStub = sinon.stub(console, "log");
    
    // Clear the error cache between tests
    ErrorMapper.cache = {};
  });

  afterEach(() => {
    // Clean up
    delete (global as GlobalWithGame).Game;
    consoleStub.restore();
  });

  describe("wrapLoop", () => {
    it("should execute the loop function without errors", () => {
      let executed = false;
      const loop = () => {
        executed = true;
      };

      ErrorMapper.wrapLoop(loop)();
      assert.isTrue(executed, "Loop function should be executed");
    });

    it("should return a wrapped function", () => {
      const loop = () => {};
      const wrapped = ErrorMapper.wrapLoop(loop);
      
      assert.isFunction(wrapped, "Should return a function");
    });

    it("should catch and format errors in the loop function", () => {
      const loop = () => {
        throw new Error("Test error message");
      };

      const wrapped = ErrorMapper.wrapLoop(loop);
      assert.doesNotThrow(() => {
        wrapped();
      });
    });

    it("should handle errors with stack traces", () => {
      const loop = () => {
        const err = new Error("Stack trace error");
        err.stack = "Error: Stack trace error\n    at loop (main.js:10:15)";
        throw err;
      };

      const wrapped = ErrorMapper.wrapLoop(loop);
      assert.doesNotThrow(() => {
        wrapped();
      });
    });

    it("should handle null/undefined errors gracefully", () => {
      const loop = () => {
        throw null;
      };

      const wrapped = ErrorMapper.wrapLoop(loop);
      // Null errors should re-throw since they can't be formatted
      assert.throws(() => {
        wrapped();
      });
    });

    it("should detect simulator environment", () => {
      // Set up simulator mode
      (global as GlobalWithGame).Game!.rooms = { sim: {} };
      
      const loop = () => {
        const err = new Error("Simulator error");
        err.stack = "Error: Simulator error\n    at loop (main.js:10:15)";
        throw err;
      };

      const wrapped = ErrorMapper.wrapLoop(loop);
      wrapped();
      
      // Should log a message about simulator
      assert.isTrue(consoleStub.called, "Should log error in simulator");
      const logCall = consoleStub.getCall(0);
      assert.include(logCall.args[0], "simulator", "Should mention simulator");
    });

    it("should use source mapped stack trace in normal mode", () => {
      // Normal mode (not simulator)
      (global as GlobalWithGame).Game!.rooms = { W1N1: {} };
      
      const loop = () => {
        const err = new Error("Normal error");
        err.stack = "Error: Normal error\n    at loop (main.js:10:15)";
        throw err;
      };

      const wrapped = ErrorMapper.wrapLoop(loop);
      wrapped();
      
      // Should log formatted error
      assert.isTrue(consoleStub.called, "Should log error");
    });
  });

  describe("error formatting", () => {
    it("should handle string errors", () => {
      const loop = () => {
        throw "String error message";
      };

      const wrapped = ErrorMapper.wrapLoop(loop);
      assert.doesNotThrow(() => {
        wrapped();
      });
    });

    it("should handle object errors", () => {
      const loop = () => {
        throw { message: "Object error", code: 123 };
      };

      const wrapped = ErrorMapper.wrapLoop(loop);
      assert.doesNotThrow(() => {
        wrapped();
      });
    });

    it("should handle errors with no stack", () => {
      const err = new Error("No stack error");
      delete err.stack;
      
      const loop = () => {
        throw err;
      };

      const wrapped = ErrorMapper.wrapLoop(loop);
      assert.doesNotThrow(() => {
        wrapped();
      });
    });

    it("should handle number errors", () => {
      const loop = () => {
        throw 42;
      };

      const wrapped = ErrorMapper.wrapLoop(loop);
      assert.doesNotThrow(() => {
        wrapped();
      });
    });
  });

  describe("sourceMappedStackTrace", () => {
    it("should handle Error objects", () => {
      const error = new Error("Test error");
      error.stack = "Error: Test error\n    at test (main:10:5)";
      
      const result = ErrorMapper.sourceMappedStackTrace(error);
      assert.isString(result, "Should return a string");
      assert.include(result, "Test error", "Should include error message");
    });

    it("should handle string stack traces", () => {
      const stack = "Error: String stack\n    at test (main:20:10)";
      
      const result = ErrorMapper.sourceMappedStackTrace(stack);
      assert.isString(result, "Should return a string");
      assert.include(result, "String stack", "Should include stack content");
    });

    it("should cache stack trace results", () => {
      const error = new Error("Cached error");
      error.stack = "Error: Cached error\n    at test (main:30:15)";
      
      // First call
      const result1 = ErrorMapper.sourceMappedStackTrace(error);
      
      // Second call should use cache
      const result2 = ErrorMapper.sourceMappedStackTrace(error);
      
      assert.strictEqual(result1, result2, "Should return same cached result");
      assert.property(ErrorMapper.cache, error.stack!, "Should cache the result");
    });

    it("should return error toString when no consumer available", () => {
      const error = new Error("No consumer error");
      error.stack = "Error: No consumer error\n    at test (main:40:20)";
      
      const result = ErrorMapper.sourceMappedStackTrace(error);
      assert.isString(result, "Should return a string");
    });

    it("should handle stack traces with multiple frames", () => {
      const stack = "Error: Multi-frame\n    at func1 (main:10:5)\n    at func2 (main:20:10)\n    at func3 (main:30:15)";
      
      const result = ErrorMapper.sourceMappedStackTrace(stack);
      assert.isString(result, "Should return a string");
      assert.include(result, "Multi-frame", "Should include error message");
    });

    it("should handle stack traces with no matching frames", () => {
      const stack = "Error: No match\n    at func (other.js:10:5)";
      
      const result = ErrorMapper.sourceMappedStackTrace(stack);
      assert.isString(result, "Should return a string");
    });
  });

  describe("consumer getter", () => {
    it("should return null when source map is not available", () => {
      const consumer = ErrorMapper.consumer;
      assert.isNull(consumer, "Should return null when source map unavailable");
    });

    it("should cache the consumer availability status", () => {
      // First access
      const consumer1 = ErrorMapper.consumer;
      
      // Second access should use cached value
      const consumer2 = ErrorMapper.consumer;
      
      assert.strictEqual(consumer1, consumer2, "Should return same cached consumer");
    });
  });

  describe("cache behavior", () => {
    it("should maintain separate cache entries for different errors", () => {
      const error1 = new Error("Error 1");
      error1.stack = "Error: Error 1\n    at test1 (main:10:5)";
      
      const error2 = new Error("Error 2");
      error2.stack = "Error: Error 2\n    at test2 (main:20:10)";
      
      const result1 = ErrorMapper.sourceMappedStackTrace(error1);
      const result2 = ErrorMapper.sourceMappedStackTrace(error2);
      
      assert.notStrictEqual(result1, result2, "Should cache different results");
      assert.equal(Object.keys(ErrorMapper.cache).length, 2, "Should have 2 cache entries");
    });

    it("should reuse cached entries on repeated calls", () => {
      const error = new Error("Repeated error");
      error.stack = "Error: Repeated error\n    at test (main:50:25)";
      
      // Call multiple times
      ErrorMapper.sourceMappedStackTrace(error);
      ErrorMapper.sourceMappedStackTrace(error);
      ErrorMapper.sourceMappedStackTrace(error);
      
      // Should only have one cache entry
      assert.equal(Object.keys(ErrorMapper.cache).length, 1, "Should have 1 cache entry");
    });
  });

  describe("HTML escaping", () => {
    it("should escape HTML in error messages", () => {
      const loop = () => {
        throw new Error("<script>alert('xss')</script>");
      };

      const wrapped = ErrorMapper.wrapLoop(loop);
      wrapped();
      
      // Check that console.log was called with escaped HTML
      assert.isTrue(consoleStub.called, "Should log error");
      const logCall = consoleStub.getCall(0);
      const loggedMessage = logCall.args[0];
      assert.notInclude(loggedMessage, "<script>", "Should escape script tags");
      assert.include(loggedMessage, "&lt;", "Should contain escaped HTML");
    });
  });
});

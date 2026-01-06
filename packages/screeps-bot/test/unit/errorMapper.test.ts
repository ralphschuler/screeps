/**
 * Unit tests for ErrorMapper utilities
 * Addresses Phase 1 coverage improvement: Error Mapper utilities
 */

import { assert } from "chai";
import { ErrorMapper } from "../../src/utils/legacy/ErrorMapper";

// Mock global Game for tick tracking
interface GlobalWithGame {
  Game?: { time: number };
}

describe("ErrorMapper", () => {
  beforeEach(() => {
    // Setup mock Game
    (global as GlobalWithGame).Game = { time: 1000 };
  });

  afterEach(() => {
    // Clean up
    delete (global as GlobalWithGame).Game;
  });

  describe("wrapLoop", () => {
    it("should execute the loop function without errors", () => {
      let executed = false;
      const loop = () => {
        executed = true;
      };

      ErrorMapper.wrapLoop(loop);
      assert.isTrue(executed, "Loop function should be executed");
    });

    it("should catch and format errors in the loop function", () => {
      const loop = () => {
        throw new Error("Test error message");
      };

      // Should not throw - error should be caught and formatted
      assert.doesNotThrow(() => {
        ErrorMapper.wrapLoop(loop);
      });
    });

    it("should handle errors with stack traces", () => {
      const loop = () => {
        const err = new Error("Stack trace error");
        err.stack = "Error: Stack trace error\n    at loop (main.js:10:15)";
        throw err;
      };

      assert.doesNotThrow(() => {
        ErrorMapper.wrapLoop(loop);
      });
    });

    it("should handle null/undefined errors gracefully", () => {
      const loop = () => {
        throw null;
      };

      assert.doesNotThrow(() => {
        ErrorMapper.wrapLoop(loop);
      });
    });
  });

  describe("error formatting", () => {
    it("should handle string errors", () => {
      const loop = () => {
        throw "String error message";
      };

      assert.doesNotThrow(() => {
        ErrorMapper.wrapLoop(loop);
      });
    });

    it("should handle object errors", () => {
      const loop = () => {
        throw { message: "Object error", code: 123 };
      };

      assert.doesNotThrow(() => {
        ErrorMapper.wrapLoop(loop);
      });
    });

    it("should handle errors with no stack", () => {
      const err = new Error("No stack error");
      delete err.stack;
      
      const loop = () => {
        throw err;
      };

      assert.doesNotThrow(() => {
        ErrorMapper.wrapLoop(loop);
      });
    });
  });

  describe("source map integration", () => {
    it("should handle missing source maps gracefully", () => {
      const loop = () => {
        const err = new Error("Error with source map");
        err.stack = "Error: Test\n    at main.js:100:50";
        throw err;
      };

      // Should not fail even without source maps
      assert.doesNotThrow(() => {
        ErrorMapper.wrapLoop(loop);
      });
    });
  });
});

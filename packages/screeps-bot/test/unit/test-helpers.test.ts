/**
 * Unit tests for test helper utilities
 */

import { assert } from "chai";
import {
  getMemoryProperty,
  getRoomMemoryProperty,
  getCreepMemoryProperty,
  hasProperty,
  setTestProperty
} from "../../src/tests/test-helpers";

describe("Test Helper Utilities", () => {
  beforeEach(() => {
    // Setup minimal Memory mock
    (global as any).Memory = {
      creeps: {},
      rooms: {},
      spawns: {},
      flags: {}
    };
  });

  afterEach(() => {
    // Clean up
    delete (global as any).Memory;
  });

  describe("getMemoryProperty", () => {
    it("should return property value when it exists", () => {
      (global as any).Memory.testProp = "test value";
      
      const result = getMemoryProperty("testProp");
      assert.equal(result, "test value");
    });

    it("should return undefined when property does not exist", () => {
      const result = getMemoryProperty("nonExistent");
      assert.isUndefined(result);
    });

    it("should handle different data types", () => {
      (global as any).Memory.numberProp = 42;
      (global as any).Memory.objectProp = { key: "value" };
      (global as any).Memory.arrayProp = [1, 2, 3];
      (global as any).Memory.boolProp = true;
      
      assert.equal(getMemoryProperty<number>("numberProp"), 42);
      assert.deepEqual(getMemoryProperty<object>("objectProp"), { key: "value" });
      assert.deepEqual(getMemoryProperty<number[]>("arrayProp"), [1, 2, 3]);
      assert.equal(getMemoryProperty<boolean>("boolProp"), true);
    });

    it("should handle null and undefined values", () => {
      (global as any).Memory.nullProp = null;
      (global as any).Memory.undefinedProp = undefined;
      
      assert.isNull(getMemoryProperty("nullProp"));
      assert.isUndefined(getMemoryProperty("undefinedProp"));
    });
  });

  describe("getRoomMemoryProperty", () => {
    it("should return room property when it exists", () => {
      (global as any).Memory.rooms.W1N1 = {
        level: 5,
        sources: ["source1", "source2"]
      };
      
      const level = getRoomMemoryProperty<number>("W1N1", "level");
      const sources = getRoomMemoryProperty<string[]>("W1N1", "sources");
      
      assert.equal(level, 5);
      assert.deepEqual(sources, ["source1", "source2"]);
    });

    it("should return undefined when room does not exist", () => {
      const result = getRoomMemoryProperty("W1N1", "level");
      assert.isUndefined(result);
    });

    it("should return undefined when property does not exist in room", () => {
      (global as any).Memory.rooms.W1N1 = { level: 5 };
      
      const result = getRoomMemoryProperty("W1N1", "nonExistent");
      assert.isUndefined(result);
    });

    it("should handle missing rooms object", () => {
      delete (global as any).Memory.rooms;
      
      const result = getRoomMemoryProperty("W1N1", "level");
      assert.isUndefined(result);
    });

    it("should handle different room names", () => {
      (global as any).Memory.rooms.E5S5 = { data: "east" };
      (global as any).Memory.rooms.W10N10 = { data: "west" };
      
      assert.equal(getRoomMemoryProperty("E5S5", "data"), "east");
      assert.equal(getRoomMemoryProperty("W10N10", "data"), "west");
    });
  });

  describe("getCreepMemoryProperty", () => {
    it("should return creep property when it exists", () => {
      (global as any).Memory.creeps.Harvester1 = {
        role: "harvester",
        task: "harvest"
      };
      
      const role = getCreepMemoryProperty<string>("Harvester1", "role");
      const task = getCreepMemoryProperty<string>("Harvester1", "task");
      
      assert.equal(role, "harvester");
      assert.equal(task, "harvest");
    });

    it("should return undefined when creep does not exist", () => {
      const result = getCreepMemoryProperty("NonExistent", "role");
      assert.isUndefined(result);
    });

    it("should return undefined when property does not exist in creep", () => {
      (global as any).Memory.creeps.Builder1 = { role: "builder" };
      
      const result = getCreepMemoryProperty("Builder1", "nonExistent");
      assert.isUndefined(result);
    });

    it("should handle complex creep memory structures", () => {
      (global as any).Memory.creeps.Worker1 = {
        role: "worker",
        tasks: ["build", "repair", "upgrade"],
        stats: { energy: 100, moves: 50 }
      };
      
      const tasks = getCreepMemoryProperty<string[]>("Worker1", "tasks");
      const stats = getCreepMemoryProperty<object>("Worker1", "stats");
      
      assert.deepEqual(tasks, ["build", "repair", "upgrade"]);
      assert.deepEqual(stats, { energy: 100, moves: 50 });
    });
  });

  describe("hasProperty", () => {
    it("should return true when property exists", () => {
      const obj = { key: "value", count: 0, flag: false };
      
      assert.isTrue(hasProperty(obj, "key"));
      assert.isTrue(hasProperty(obj, "count"));
      assert.isTrue(hasProperty(obj, "flag"));
    });

    it("should return false when property does not exist", () => {
      const obj = { key: "value" };
      
      assert.isFalse(hasProperty(obj, "nonExistent"));
    });

    it("should handle null object", () => {
      assert.isFalse(hasProperty(null, "key"));
    });

    it("should handle undefined object", () => {
      assert.isFalse(hasProperty(undefined, "key"));
    });

    it("should handle empty object", () => {
      assert.isFalse(hasProperty({}, "key"));
    });

    it("should detect inherited properties", () => {
      const obj = Object.create({ inherited: "value" });
      obj.own = "value";
      
      assert.isTrue(hasProperty(obj, "own"));
      assert.isTrue(hasProperty(obj, "inherited"));
    });

    it("should handle properties with falsy values", () => {
      const obj = {
        zero: 0,
        empty: "",
        no: false,
        nothing: null,
        undef: undefined
      };
      
      assert.isTrue(hasProperty(obj, "zero"));
      assert.isTrue(hasProperty(obj, "empty"));
      assert.isTrue(hasProperty(obj, "no"));
      assert.isTrue(hasProperty(obj, "nothing"));
      assert.isTrue(hasProperty(obj, "undef"));
    });
  });

  describe("setTestProperty", () => {
    it("should set property in Memory with _test_ prefix", () => {
      const cleanup = setTestProperty("myProp", "myValue");
      
      assert.equal((global as any).Memory._test_myProp, "myValue");
      
      cleanup();
    });

    it("should return cleanup function that removes property", () => {
      const cleanup = setTestProperty("tempProp", 123);
      
      assert.equal((global as any).Memory._test_tempProp, 123);
      
      cleanup();
      
      assert.isUndefined((global as any).Memory._test_tempProp);
    });

    it("should handle different data types", () => {
      const cleanupObj = setTestProperty("obj", { key: "value" });
      const cleanupArr = setTestProperty("arr", [1, 2, 3]);
      const cleanupBool = setTestProperty("bool", true);
      const cleanupNum = setTestProperty("num", 42);
      
      assert.deepEqual((global as any).Memory._test_obj, { key: "value" });
      assert.deepEqual((global as any).Memory._test_arr, [1, 2, 3]);
      assert.equal((global as any).Memory._test_bool, true);
      assert.equal((global as any).Memory._test_num, 42);
      
      cleanupObj();
      cleanupArr();
      cleanupBool();
      cleanupNum();
      
      assert.isUndefined((global as any).Memory._test_obj);
      assert.isUndefined((global as any).Memory._test_arr);
      assert.isUndefined((global as any).Memory._test_bool);
      assert.isUndefined((global as any).Memory._test_num);
    });

    it("should handle multiple test properties simultaneously", () => {
      const cleanup1 = setTestProperty("prop1", "value1");
      const cleanup2 = setTestProperty("prop2", "value2");
      const cleanup3 = setTestProperty("prop3", "value3");
      
      assert.equal((global as any).Memory._test_prop1, "value1");
      assert.equal((global as any).Memory._test_prop2, "value2");
      assert.equal((global as any).Memory._test_prop3, "value3");
      
      cleanup2();
      
      assert.equal((global as any).Memory._test_prop1, "value1");
      assert.isUndefined((global as any).Memory._test_prop2);
      assert.equal((global as any).Memory._test_prop3, "value3");
      
      cleanup1();
      cleanup3();
    });

    it("should allow calling cleanup multiple times safely", () => {
      const cleanup = setTestProperty("safe", "value");
      
      assert.equal((global as any).Memory._test_safe, "value");
      
      cleanup();
      cleanup(); // Should not throw
      
      assert.isUndefined((global as any).Memory._test_safe);
    });

    it("should handle overwriting existing test property", () => {
      const cleanup1 = setTestProperty("overwrite", "first");
      assert.equal((global as any).Memory._test_overwrite, "first");
      
      const cleanup2 = setTestProperty("overwrite", "second");
      assert.equal((global as any).Memory._test_overwrite, "second");
      
      cleanup2();
      assert.isUndefined((global as any).Memory._test_overwrite);
      
      cleanup1(); // Should not restore old value
      assert.isUndefined((global as any).Memory._test_overwrite);
    });
  });

  describe("Integration scenarios", () => {
    it("should work together for test setup and teardown", () => {
      // Setup test data
      const cleanup1 = setTestProperty("testData", { count: 0 });
      const cleanup2 = setTestProperty("testFlag", true);
      
      // Verify setup
      assert.isDefined(getMemoryProperty("_test_testData"));
      assert.isDefined(getMemoryProperty("_test_testFlag"));
      
      // Use data
      const data = getMemoryProperty<{ count: number }>("_test_testData");
      assert.equal(data?.count, 0);
      
      // Cleanup
      cleanup1();
      cleanup2();
      
      // Verify cleanup
      assert.isUndefined(getMemoryProperty("_test_testData"));
      assert.isUndefined(getMemoryProperty("_test_testFlag"));
    });

    it("should verify property existence before access", () => {
      (global as any).Memory.rooms.W1N1 = { level: 5 };
      
      if (hasProperty((global as any).Memory.rooms, "W1N1")) {
        const level = getRoomMemoryProperty("W1N1", "level");
        assert.equal(level, 5);
      }
      
      if (!hasProperty((global as any).Memory.rooms, "W2N2")) {
        const level = getRoomMemoryProperty("W2N2", "level");
        assert.isUndefined(level);
      }
    });
  });
});

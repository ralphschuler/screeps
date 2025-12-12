import { assert } from "chai";
import {
  findDistributedTarget,
  registerAssignment,
  getAssignmentCount,
  getAssignedCreeps,
  clearTargetAssignments
} from "../../src/utils/targetDistribution";

/**
 * Test suite for target distribution system
 * 
 * This system prevents multiple creeps from selecting the same target,
 * which was causing the deadlock bug where larvaWorkers and haulers
 * would block each other.
 */
describe("Target Distribution System", () => {
  // Mock position for testing
  const createMockPosition = (x: number, y: number, roomName: string): RoomPosition => ({
    x,
    y,
    roomName,
    getRangeTo: function(target: RoomPosition | { pos: RoomPosition }): number {
      const targetPos = "pos" in target ? target.pos : target;
      const dx = Math.abs(this.x - targetPos.x);
      const dy = Math.abs(this.y - targetPos.y);
      return Math.max(dx, dy); // Chebyshev distance
    }
  } as RoomPosition);

  // Mock creep for testing
  const createMockCreep = (name: string, x: number, y: number, roomName: string = "W1N1"): Creep => ({
    name,
    pos: createMockPosition(x, y, roomName),
    room: {
      name: roomName
    } as Room
  } as Creep);

  // Mock container for testing
  const createMockContainer = (id: string, x: number, y: number, roomName: string = "W1N1"): StructureContainer => ({
    id: id as Id<StructureContainer>,
    pos: createMockPosition(x, y, roomName),
    structureType: STRUCTURE_CONTAINER,
    room: {
      name: roomName
    } as Room
  } as StructureContainer);

  beforeEach(() => {
    // Clear assignments before each test
    clearTargetAssignments();
    
    // Mock Game.time
    (global as any).Game = { time: 1000 };
  });

  afterEach(() => {
    // Clean up global mock
    delete (global as any).Game;
  });

  describe("findDistributedTarget()", () => {
    it("should return null for empty targets array", () => {
      const creep = createMockCreep("TestCreep", 25, 25);
      const result = findDistributedTarget(creep, [], "container");
      assert.isNull(result);
    });

    it("should return the only target when array has one element", () => {
      const creep = createMockCreep("TestCreep", 25, 25);
      const container = createMockContainer("container1", 20, 20);
      const result = findDistributedTarget(creep, [container], "container");
      assert.equal(result, container);
    });

    it("should select closest target when all have zero assignments", () => {
      const creep = createMockCreep("TestCreep", 25, 25);
      const container1 = createMockContainer("container1", 20, 20); // Distance: 5
      const container2 = createMockContainer("container2", 30, 30); // Distance: 5
      const container3 = createMockContainer("container3", 35, 35); // Distance: 10
      
      const result = findDistributedTarget(creep, [container1, container2, container3], "container");
      
      // Should select container1 or container2 (both distance 5)
      // The algorithm is deterministic based on array order
      assert.include([container1, container2], result);
    });

    it("should distribute multiple creeps across multiple containers", () => {
      const creep1 = createMockCreep("Creep1", 25, 25);
      const creep2 = createMockCreep("Creep2", 25, 25);
      const creep3 = createMockCreep("Creep3", 25, 25);
      
      const container1 = createMockContainer("container1", 20, 20);
      const container2 = createMockContainer("container2", 30, 30);
      
      const targets = [container1, container2];
      
      // First creep selects a container
      const result1 = findDistributedTarget(creep1, targets, "container");
      assert.isNotNull(result1);
      
      // Second creep should prefer the unassigned container
      const result2 = findDistributedTarget(creep2, targets, "container");
      assert.isNotNull(result2);
      
      // With 2 containers and 2 creeps, they should be distributed
      assert.notEqual(result1!.id, result2!.id, "Creeps should select different containers");
      
      // Third creep will have to share - should pick one with fewer assignments
      const result3 = findDistributedTarget(creep3, targets, "container");
      assert.isNotNull(result3);
    });

    it("should balance load when one container has more assignments", () => {
      const creep1 = createMockCreep("Creep1", 25, 25);
      const creep2 = createMockCreep("Creep2", 25, 25);
      const creep3 = createMockCreep("Creep3", 25, 25);
      
      const container1 = createMockContainer("container1", 20, 20);
      const container2 = createMockContainer("container2", 20, 21); // Very close to container1
      
      const targets = [container1, container2];
      
      // Manually assign two creeps to container1
      registerAssignment(createMockCreep("PreAssigned1", 20, 20), container1, "container");
      registerAssignment(createMockCreep("PreAssigned2", 20, 20), container1, "container");
      
      // Now creep1 should prefer container2 (fewer assignments)
      const result1 = findDistributedTarget(creep1, targets, "container");
      assert.equal(result1, container2, "Should select container with fewer assignments");
      
      // creep2 should also prefer container2
      const result2 = findDistributedTarget(creep2, targets, "container");
      assert.equal(result2, container2, "Should still prefer less-loaded container");
      
      // creep3 might go to either, but algorithm should balance
      const result3 = findDistributedTarget(creep3, targets, "container");
      assert.isNotNull(result3);
    });

    it("should tie-break by distance when assignment counts are equal", () => {
      const creep = createMockCreep("TestCreep", 25, 25);
      
      const container1 = createMockContainer("container1", 20, 20); // Distance: 5
      const container2 = createMockContainer("container2", 35, 35); // Distance: 10
      
      // Both containers have same assignments (zero)
      const result = findDistributedTarget(creep, [container1, container2], "container");
      
      // Should select closer container
      assert.equal(result, container1, "Should select closer container when assignments are equal");
    });

    it("should work with different target types independently", () => {
      const creep = createMockCreep("TestCreep", 25, 25);
      
      const container = createMockContainer("container1", 20, 20);
      const source = {
        id: "source1" as Id<Source>,
        pos: createMockPosition(30, 30, "W1N1")
      } as Source;
      
      // Assign to container with type "container"
      const result1 = findDistributedTarget(creep, [container], "container");
      assert.equal(result1, container);
      
      // Assign same creep to source with type "source"
      // This should be tracked separately
      const result2 = findDistributedTarget(creep, [source], "source");
      assert.equal(result2, source);
      
      // Both assignments should coexist
      assert.equal(getAssignmentCount("W1N1", container.id, "container"), 1);
      assert.equal(getAssignmentCount("W1N1", source.id, "source"), 1);
    });
  });

  describe("registerAssignment()", () => {
    it("should register a creep assignment to a target", () => {
      const creep = createMockCreep("TestCreep", 25, 25);
      const container = createMockContainer("container1", 20, 20);
      
      registerAssignment(creep, container, "container");
      
      const count = getAssignmentCount("W1N1", container.id, "container");
      assert.equal(count, 1);
    });

    it("should not create duplicate assignments for same creep", () => {
      const creep = createMockCreep("TestCreep", 25, 25);
      const container = createMockContainer("container1", 20, 20);
      
      registerAssignment(creep, container, "container");
      registerAssignment(creep, container, "container"); // Register twice
      
      const count = getAssignmentCount("W1N1", container.id, "container");
      assert.equal(count, 1, "Should not create duplicate assignments");
    });

    it("should track multiple creeps on same target", () => {
      const creep1 = createMockCreep("Creep1", 25, 25);
      const creep2 = createMockCreep("Creep2", 25, 25);
      const container = createMockContainer("container1", 20, 20);
      
      registerAssignment(creep1, container, "container");
      registerAssignment(creep2, container, "container");
      
      const count = getAssignmentCount("W1N1", container.id, "container");
      assert.equal(count, 2);
      
      const assigned = getAssignedCreeps("W1N1", container.id, "container");
      assert.include(assigned, "Creep1");
      assert.include(assigned, "Creep2");
    });
  });

  describe("getAssignmentCount()", () => {
    it("should return 0 for unassigned target", () => {
      const container = createMockContainer("container1", 20, 20);
      const count = getAssignmentCount("W1N1", container.id, "container");
      assert.equal(count, 0);
    });

    it("should return correct count after assignments", () => {
      const container = createMockContainer("container1", 20, 20);
      
      registerAssignment(createMockCreep("Creep1", 25, 25), container, "container");
      assert.equal(getAssignmentCount("W1N1", container.id, "container"), 1);
      
      registerAssignment(createMockCreep("Creep2", 25, 25), container, "container");
      assert.equal(getAssignmentCount("W1N1", container.id, "container"), 2);
      
      registerAssignment(createMockCreep("Creep3", 25, 25), container, "container");
      assert.equal(getAssignmentCount("W1N1", container.id, "container"), 3);
    });
  });

  describe("getAssignedCreeps()", () => {
    it("should return empty array for unassigned target", () => {
      const container = createMockContainer("container1", 20, 20);
      const assigned = getAssignedCreeps("W1N1", container.id, "container");
      assert.deepEqual(assigned, []);
    });

    it("should return all assigned creep names", () => {
      const container = createMockContainer("container1", 20, 20);
      
      registerAssignment(createMockCreep("Creep1", 25, 25), container, "container");
      registerAssignment(createMockCreep("Creep2", 25, 25), container, "container");
      registerAssignment(createMockCreep("Creep3", 25, 25), container, "container");
      
      const assigned = getAssignedCreeps("W1N1", container.id, "container");
      assert.equal(assigned.length, 3);
      assert.include(assigned, "Creep1");
      assert.include(assigned, "Creep2");
      assert.include(assigned, "Creep3");
    });
  });

  describe("clearTargetAssignments()", () => {
    it("should clear all assignments", () => {
      const container1 = createMockContainer("container1", 20, 20);
      const container2 = createMockContainer("container2", 30, 30);
      
      registerAssignment(createMockCreep("Creep1", 25, 25), container1, "container");
      registerAssignment(createMockCreep("Creep2", 25, 25), container2, "container");
      
      assert.equal(getAssignmentCount("W1N1", container1.id, "container"), 1);
      assert.equal(getAssignmentCount("W1N1", container2.id, "container"), 1);
      
      clearTargetAssignments();
      
      assert.equal(getAssignmentCount("W1N1", container1.id, "container"), 0);
      assert.equal(getAssignmentCount("W1N1", container2.id, "container"), 0);
    });
  });

  describe("Bug Reproduction: larvaWorker + hauler deadlock", () => {
    it("should prevent larvaWorker and hauler from selecting same container", () => {
      // Simulate the bug scenario:
      // 1. Room has 2 containers
      // 2. larvaWorker spawns first and selects a container
      // 3. hauler spawns and should select different container
      
      const larvaWorker = createMockCreep("LarvaWorker1", 25, 25, "W1N1");
      const hauler = createMockCreep("Hauler1", 25, 25, "W1N1");
      
      const container1 = createMockContainer("container1", 20, 20, "W1N1");
      const container2 = createMockContainer("container2", 30, 30, "W1N1");
      const containers = [container1, container2];
      
      // larvaWorker selects first
      const larvaTarget = findDistributedTarget(larvaWorker, containers, "energy_container");
      assert.isNotNull(larvaTarget);
      
      // hauler selects second (should get different container)
      const haulerTarget = findDistributedTarget(hauler, containers, "energy_container");
      assert.isNotNull(haulerTarget);
      
      // CRITICAL: They should NOT select the same container
      assert.notEqual(
        larvaTarget!.id,
        haulerTarget!.id,
        "larvaWorker and hauler MUST select different containers to avoid deadlock"
      );
    });

    it("should handle 3+ creeps with 2 containers gracefully", () => {
      // Even with more creeps than containers, distribution should prevent clustering
      const containers = [
        createMockContainer("container1", 20, 20, "W1N1"),
        createMockContainer("container2", 30, 30, "W1N1")
      ];
      
      const creep1 = createMockCreep("Creep1", 25, 25, "W1N1");
      const creep2 = createMockCreep("Creep2", 25, 25, "W1N1");
      const creep3 = createMockCreep("Creep3", 25, 25, "W1N1");
      
      const target1 = findDistributedTarget(creep1, containers, "energy_container");
      const target2 = findDistributedTarget(creep2, containers, "energy_container");
      const target3 = findDistributedTarget(creep3, containers, "energy_container");
      
      assert.isNotNull(target1);
      assert.isNotNull(target2);
      assert.isNotNull(target3);
      
      // First two should get different containers
      assert.notEqual(target1!.id, target2!.id);
      
      // Third will share with one of them
      const counts = {
        [containers[0].id]: getAssignmentCount("W1N1", containers[0].id, "energy_container"),
        [containers[1].id]: getAssignmentCount("W1N1", containers[1].id, "energy_container")
      };
      
      // Both containers should have at least 1 assignment
      assert.isAtLeast(counts[containers[0].id], 1);
      assert.isAtLeast(counts[containers[1].id], 1);
      
      // Total assignments should be 3
      assert.equal(counts[containers[0].id] + counts[containers[1].id], 3);
    });
  });
});

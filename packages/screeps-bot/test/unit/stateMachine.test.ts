import { assert } from "chai";
import { evaluateWithStateMachine } from "../../src/roles/behaviors/stateMachine";
import type { CreepContext, CreepAction } from "../../src/roles/behaviors/types";
import type { SwarmCreepMemory, CreepState } from "../../src/memory/schemas";

/**
 * Mock objects for testing
 */
interface MockStore {
  getCapacity: () => number | null;
  getFreeCapacity: () => number | null;
  getUsedCapacity: () => number;
}

interface MockPosition {
  inRangeTo: (target: { pos: RoomPosition } | RoomPosition, range: number) => boolean;
  isNearTo: (target: unknown) => boolean;
}

interface MockCreep {
  name: string;
  store: MockStore;
  pos: MockPosition;
}

interface MockRoom {
  name: string;
  find: () => never[];
}

/**
 * Create a mock creep for testing
 */
function createMockCreep(options: {
  name?: string;
  capacity: number | null;
  usedCapacity: number;
  inRange?: boolean;
}): Creep {
  const freeCapacity = options.capacity === null ? null : options.capacity - options.usedCapacity;
  const mockCreep: MockCreep = {
    name: options.name ?? "TestCreep",
    store: {
      getCapacity: () => options.capacity,
      getFreeCapacity: () => freeCapacity,
      getUsedCapacity: () => options.usedCapacity
    },
    pos: {
      inRangeTo: () => options.inRange ?? false,
      isNearTo: () => options.inRange ?? false
    }
  };
  return mockCreep as unknown as Creep;
}

/**
 * Create a mock room for testing
 */
function createMockRoom(name: string = "E1N1"): Room {
  const mockRoom: MockRoom = {
    name,
    find: () => []
  };
  return mockRoom as unknown as Room;
}

/**
 * Create a mock source for testing
 */
function createMockSource(id: string = "source1"): Source {
  return {
    id: id as Id<Source>,
    energy: 3000,
    pos: { x: 25, y: 25, roomName: "E1N1" } as RoomPosition,
    room: createMockRoom()
  } as unknown as Source;
}

/**
 * Setup Game.getObjectById mock
 */
function setupGameMock(objects: Record<string, unknown>): void {
  (global as any).Game = {
    time: 1000,
    getObjectById: (id: Id<any>) => objects[id] ?? null
  };
}

/**
 * Create a mock context for testing
 */
function createMockContext(
  creep: Creep,
  memory: Partial<SwarmCreepMemory> = {},
  options: Partial<CreepContext> = {}
): CreepContext {
  const fullMemory: SwarmCreepMemory = {
    role: "harvester",
    family: "economy",
    homeRoom: "E1N1",
    version: 1,
    ...memory
  };

  return {
    creep,
    room: createMockRoom(),
    memory: fullMemory,
    swarmState: undefined,
    squadMemory: undefined,
    homeRoom: "E1N1",
    isInHomeRoom: true,
    isFull: false,
    isEmpty: true,
    isWorking: false,
    assignedSource: null,
    assignedMineral: null,
    energyAvailable: true,
    nearbyEnemies: false,
    constructionSiteCount: 0,
    damagedStructureCount: 0,
    droppedResources: [],
    containers: [],
    depositContainers: [],
    spawnStructures: [],
    towers: [],
    storage: undefined,
    terminal: undefined,
    hostiles: [],
    damagedAllies: [],
    prioritizedSites: [],
    repairTargets: [],
    labs: [],
    factory: undefined,
    tombstones: [],
    mineralContainers: [],
    ...options
  };
}

describe("State Machine", () => {
  beforeEach(() => {
    // Setup Game mock
    setupGameMock({});
  });

  describe("evaluateWithStateMachine", () => {
    it("should evaluate new action when no state exists", () => {
      const creep = createMockCreep({ capacity: 50, usedCapacity: 0 });
      const ctx = createMockContext(creep);

      const behaviorFn = (ctx: CreepContext): CreepAction => {
        return { type: "idle" };
      };

      const action = evaluateWithStateMachine(ctx, behaviorFn);

      assert.equal(action.type, "idle");
      assert.isUndefined(ctx.memory.state, "Idle actions should not create state");
    });

    it("should store state for non-idle actions", () => {
      const source = createMockSource();
      setupGameMock({ source1: source });

      const creep = createMockCreep({ capacity: 50, usedCapacity: 0 });
      const ctx = createMockContext(creep);

      const behaviorFn = (): CreepAction => {
        return { type: "harvest", target: source };
      };

      const action = evaluateWithStateMachine(ctx, behaviorFn);

      assert.equal(action.type, "harvest");
      assert.isDefined(ctx.memory.state);
      assert.equal(ctx.memory.state?.action, "harvest");
      assert.equal(ctx.memory.state?.targetId, source.id);
    });

    it("should continue existing state when valid and incomplete", () => {
      const source = createMockSource();
      setupGameMock({ source1: source });

      const creep = createMockCreep({ capacity: 50, usedCapacity: 25 });
      const existingState: CreepState = {
        action: "harvest",
        targetId: source.id,
        startTick: 995,
        timeout: 50
      };

      const ctx = createMockContext(creep, { state: existingState });

      let behaviorCalled = false;
      const behaviorFn = (): CreepAction => {
        behaviorCalled = true;
        return { type: "idle" };
      };

      const action = evaluateWithStateMachine(ctx, behaviorFn);

      assert.equal(action.type, "harvest");
      assert.isFalse(behaviorCalled, "Behavior should not be called when continuing existing state");
      assert.isDefined(ctx.memory.state, "State should still exist");
    });

    it("should re-evaluate when state is complete (creep is full)", () => {
      const source = createMockSource();
      setupGameMock({ source1: source });

      const creep = createMockCreep({ capacity: 50, usedCapacity: 50 });
      const existingState: CreepState = {
        action: "harvest",
        targetId: source.id,
        startTick: 995,
        timeout: 50
      };

      const ctx = createMockContext(creep, { state: existingState });
      ctx.isFull = true;

      let behaviorCalled = false;
      const behaviorFn = (): CreepAction => {
        behaviorCalled = true;
        return { type: "idle" };
      };

      const action = evaluateWithStateMachine(ctx, behaviorFn);

      assert.equal(action.type, "idle");
      assert.isTrue(behaviorCalled, "Behavior should be called when state is complete");
      assert.isUndefined(ctx.memory.state, "State should be cleared after completion");
    });

    it("should re-evaluate when state target no longer exists", () => {
      const creep = createMockCreep({ capacity: 50, usedCapacity: 25 });
      const existingState: CreepState = {
        action: "harvest",
        targetId: "nonexistent" as Id<Source>,
        startTick: 995,
        timeout: 50
      };

      setupGameMock({}); // No objects exist

      const ctx = createMockContext(creep, { state: existingState });

      let behaviorCalled = false;
      const behaviorFn = (): CreepAction => {
        behaviorCalled = true;
        return { type: "idle" };
      };

      const action = evaluateWithStateMachine(ctx, behaviorFn);

      assert.equal(action.type, "idle");
      assert.isTrue(behaviorCalled, "Behavior should be called when target doesn't exist");
      assert.isUndefined(ctx.memory.state, "Invalid state should be cleared");
    });

    it("should re-evaluate when state has expired (timeout)", () => {
      const source = createMockSource();
      setupGameMock({ source1: source });

      const creep = createMockCreep({ capacity: 50, usedCapacity: 25 });
      const existingState: CreepState = {
        action: "harvest",
        targetId: source.id,
        startTick: 900, // 100 ticks ago
        timeout: 50 // Should have expired 50 ticks ago
      };

      const ctx = createMockContext(creep, { state: existingState });

      let behaviorCalled = false;
      const behaviorFn = (): CreepAction => {
        behaviorCalled = true;
        return { type: "idle" };
      };

      const action = evaluateWithStateMachine(ctx, behaviorFn);

      assert.equal(action.type, "idle");
      assert.isTrue(behaviorCalled, "Behavior should be called when state has expired");
      assert.isUndefined(ctx.memory.state, "Expired state should be cleared");
    });

    it("should complete transfer action when creep is empty", () => {
      const storage = {
        id: "storage1" as Id<StructureStorage>,
        pos: { x: 25, y: 25, roomName: "E1N1" } as RoomPosition,
        room: createMockRoom()
      } as unknown as StructureStorage;

      setupGameMock({ storage1: storage });

      const creep = createMockCreep({ capacity: 50, usedCapacity: 0 });
      const existingState: CreepState = {
        action: "transfer",
        targetId: storage.id,
        startTick: 995,
        timeout: 50,
        data: { resourceType: RESOURCE_ENERGY }
      };

      const ctx = createMockContext(creep, { state: existingState });
      ctx.isEmpty = true;

      const behaviorFn = (): CreepAction => {
        return { type: "idle" };
      };

      const action = evaluateWithStateMachine(ctx, behaviorFn);

      assert.equal(action.type, "idle");
      assert.isUndefined(ctx.memory.state, "Transfer state should complete when empty");
    });

    it("should complete moveToRoom action when in target room", () => {
      const creep = createMockCreep({ capacity: 50, usedCapacity: 0 });
      const existingState: CreepState = {
        action: "moveToRoom",
        targetRoom: "E2N2",
        startTick: 995,
        timeout: 100
      };

      const ctx = createMockContext(creep, { state: existingState });
      ctx.room = createMockRoom("E2N2");

      const behaviorFn = (): CreepAction => {
        return { type: "idle" };
      };

      const action = evaluateWithStateMachine(ctx, behaviorFn);

      assert.equal(action.type, "idle");
      assert.isUndefined(ctx.memory.state, "MoveToRoom state should complete when in target room");
    });

    it("should store resource type data for withdraw actions", () => {
      const storage = {
        id: "storage1" as Id<StructureStorage>,
        pos: { x: 25, y: 25, roomName: "E1N1" } as RoomPosition,
        room: createMockRoom()
      } as unknown as StructureStorage;

      setupGameMock({ storage1: storage });

      const creep = createMockCreep({ capacity: 50, usedCapacity: 0 });
      const ctx = createMockContext(creep);

      const behaviorFn = (): CreepAction => {
        return { type: "withdraw", target: storage, resourceType: RESOURCE_ENERGY };
      };

      const action = evaluateWithStateMachine(ctx, behaviorFn);

      assert.equal(action.type, "withdraw");
      assert.isDefined(ctx.memory.state);
      assert.equal(ctx.memory.state?.data?.resourceType, RESOURCE_ENERGY);
    });

    it("should not reset stuck tracking when state is invalidated", () => {
      const source = createMockSource();
      setupGameMock({ source1: source });

      const creep = createMockCreep({ capacity: 50, usedCapacity: 25 });
      const ctx = createMockContext(creep);

      // Set up stuck tracking - creep has been stuck for 5 ticks
      const memory = ctx.memory as any;
      const stuckStartTick = 995;
      memory.lastPosX = creep.pos.x;
      memory.lastPosY = creep.pos.y;
      memory.lastPosRoom = creep.pos.roomName;
      memory.lastPosTick = stuckStartTick;

      // Set up a state that will be detected as stuck
      const existingState: CreepState = {
        action: "moveTo", // Non-stationary action
        targetId: source.id,
        startTick: 995,
        timeout: 50
      };
      ctx.memory.state = existingState;

      // First call: should detect stuck and invalidate state
      const action1 = evaluateWithStateMachine(ctx, () => ({ type: "harvest", target: source }));

      // Verify state was invalidated and new action was evaluated
      assert.equal(action1.type, "harvest");
      assert.isDefined(ctx.memory.state);
      assert.equal(ctx.memory.state?.action, "harvest");

      // CRITICAL: Verify stuck tracking was NOT reset
      // The lastPosTick should still be the original stuck time
      assert.equal(memory.lastPosTick, stuckStartTick, "Stuck tracking should NOT be reset when state is invalidated");

      // Simulate creep still stuck on next tick (hasn't moved)
      (global as any).Game.time = 1001;

      // Second call on next tick: If stuck tracking was incorrectly reset,
      // the creep would appear "unstuck" and keep the invalid state.
      // With our fix, stuck tracking persists and immediately detects stuck again.
      const action2 = evaluateWithStateMachine(ctx, () => ({ type: "idle" }));

      // Since the creep still hasn't moved and stuck tracking wasn't reset,
      // it should be detected as stuck again immediately
      assert.equal(action2.type, "idle");
      assert.equal(memory.lastPosTick, stuckStartTick, "Stuck tracking should persist until creep moves");
    });

    it("should update stuck tracking only when creep moves", () => {
      const source = createMockSource();
      setupGameMock({ source1: source });

      const creep = createMockCreep({ capacity: 50, usedCapacity: 25, inRange: false });
      const ctx = createMockContext(creep);

      // Initialize stuck tracking
      const memory = ctx.memory as any;
      memory.lastPosX = 20;
      memory.lastPosY = 20;
      memory.lastPosRoom = "E1N1";
      memory.lastPosTick = 990;

      // Set up state
      const existingState: CreepState = {
        action: "moveTo",
        targetId: source.id,
        startTick: 995,
        timeout: 50
      };
      ctx.memory.state = existingState;

      // Simulate creep moved to new position
      (creep.pos as any).x = 21;
      (creep.pos as any).y = 21;

      const action = evaluateWithStateMachine(ctx, () => ({ type: "harvest", target: source }));

      // When creep moves, stuck tracking should be updated
      assert.equal(memory.lastPosX, 21, "Position X should be updated when creep moves");
      assert.equal(memory.lastPosY, 21, "Position Y should be updated when creep moves");
      assert.equal(memory.lastPosTick, 1000, "Tick should be updated when creep moves");

      // State should remain valid since creep is making progress
      assert.equal(action.type, "moveTo");
    });
  });
});

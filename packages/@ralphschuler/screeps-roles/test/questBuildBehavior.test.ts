import { expect } from "chai";
import {
  evaluateEconomyBehavior,
  evaluateWithStateMachine,
  getEconomyStateInterrupt,
  type CreepAction,
  type CreepContext
} from "../src/index";
import { createMockCreep, createMockRoom, resetMockGame, MockGame } from "./setup";

function makeEnergyStore(used: number, capacity: number): Store<RESOURCE_ENERGY, false> {
  return {
    [RESOURCE_ENERGY]: used,
    getUsedCapacity: (resource?: ResourceConstant) => resource === undefined || resource === RESOURCE_ENERGY ? used : 0,
    getFreeCapacity: (resource?: ResourceConstant) => resource === undefined || resource === RESOURCE_ENERGY ? Math.max(0, capacity - used) : 0,
    getCapacity: () => capacity
  } as unknown as Store<RESOURCE_ENERGY, false>;
}

function makeConstructionSite(id: Id<ConstructionSite>, roomName: string): ConstructionSite {
  return {
    id,
    structureType: STRUCTURE_ROAD,
    pos: new RoomPosition(20, 20, roomName),
    progress: 0,
    progressTotal: 500
  } as unknown as ConstructionSite;
}

function makeContext(role: "builder" | "larvaWorker", room: Room, energy = 50, capacity = 50): CreepContext {
  const creep = createMockCreep(`${role}1`, {
    room,
    memory: {
      role,
      family: "economy",
      homeRoom: "W1N1",
      version: 1,
      working: energy > 0,
      questId: "quest-buildcs-1",
      questTarget: "W2N1",
      questAction: "build"
    },
    store: makeEnergyStore(energy, capacity)
  });

  MockGame.rooms[room.name] = room;
  MockGame.creeps[creep.name] = creep;

  return {
    creep,
    room,
    memory: creep.memory as CreepContext["memory"],
    swarmState: undefined,
    squadMemory: undefined,
    homeRoom: "W1N1",
    isInHomeRoom: room.name === "W1N1",
    isFull: energy >= capacity,
    isEmpty: energy <= 0,
    isWorking: energy > 0,
    assignedSource: null,
    assignedMineral: null,
    energyAvailable: true,
    nearbyEnemies: false,
    constructionSiteCount: 0,
    damagedStructureCount: 0,
    droppedResources: [],
    containers: [],
    sourceContainers: [],
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
    mineralContainers: []
  };
}

describe("TooAngel buildcs quest economy behavior", () => {
  beforeEach(() => {
    resetMockGame();
    MockGame.getObjectById = () => null;
  });

  for (const role of ["builder", "larvaWorker"] as const) {
    it(`routes ${role} creeps with buildcs quest memory to the target room`, () => {
      const homeRoom = createMockRoom("W1N1", { controller: { my: true, level: 5 } });
      const ctx = makeContext(role, homeRoom);

      const action = evaluateEconomyBehavior(ctx);

      expect(action).to.deep.equal({ type: "remoteMoveToRoom", roomName: "W2N1", routeType: "hauler" });
    });

    it(`interrupts committed local ${role} state after buildcs quest assignment`, () => {
      const homeRoom = createMockRoom("W1N1", { controller: { my: true, level: 5 } });
      const ctx = makeContext(role, homeRoom);
      ctx.memory.state = {
        action: "moveToRoom",
        targetRoom: "W1N2",
        startTick: Game.time,
        timeout: 25
      };

      const action = evaluateWithStateMachine(ctx, evaluateEconomyBehavior, { interrupt: getEconomyStateInterrupt });

      expect(action).to.deep.equal({ type: "remoteMoveToRoom", roomName: "W2N1", routeType: "hauler" });
      expect(ctx.memory.state?.action).to.equal("remoteMoveToRoom");
      expect(ctx.memory.state?.targetRoom).to.equal("W2N1");
    });

    it(`makes ${role} creeps build visible target-room construction sites for buildcs quests`, () => {
      const site = makeConstructionSite("site1" as Id<ConstructionSite>, "W2N1");
      const targetRoom = createMockRoom("W2N1", { controller: { my: false, level: 3 } });
      (targetRoom as unknown as { find: Room["find"] }).find = ((type: FindConstant) => {
        if (type === FIND_CONSTRUCTION_SITES) return [site];
        return [];
      }) as Room["find"];
      const ctx = makeContext(role, targetRoom);

      const action = evaluateEconomyBehavior(ctx);

      expect(action.type).to.equal("build");
      expect((action as Extract<CreepAction, { type: "build" }>).target).to.equal(site);
    });

    it(`clears missing ${role} buildcs quest targets and falls back safely`, () => {
      const homeRoom = createMockRoom("W1N1", { controller: { my: true, level: 5 } });
      const ctx = makeContext(role, homeRoom);
      delete (ctx.creep.memory as Record<string, unknown>).questTarget;

      const action = evaluateEconomyBehavior(ctx);

      expect(action.type).to.equal("upgrade");
      expect((ctx.creep.memory as Record<string, unknown>).questId).to.equal(undefined);
      expect((ctx.creep.memory as Record<string, unknown>).questTarget).to.equal(undefined);
      expect((ctx.creep.memory as Record<string, unknown>).questAction).to.equal(undefined);
    });

    it(`routes empty ${role} buildcs quest creeps home from target rooms with remaining sites`, () => {
      const site = makeConstructionSite("site-empty" as Id<ConstructionSite>, "W2N1");
      const targetRoom = createMockRoom("W2N1", { controller: { my: false, level: 5 } });
      (targetRoom as unknown as { find: Room["find"] }).find = ((type: FindConstant) => {
        if (type === FIND_CONSTRUCTION_SITES) return [site];
        return [];
      }) as Room["find"];
      const ctx = makeContext(role, targetRoom, 0);

      const action = evaluateEconomyBehavior(ctx);

      expect(action).to.deep.equal({ type: "remoteMoveToRoom", roomName: "W1N1", routeType: "hauler" });
      expect((ctx.creep.memory as Record<string, unknown>).questId).to.equal("quest-buildcs-1");
      expect((ctx.creep.memory as Record<string, unknown>).questTarget).to.equal("W2N1");
      expect((ctx.creep.memory as Record<string, unknown>).questAction).to.equal("build");
    });

    it(`clears completed ${role} buildcs quest memory and returns home safely`, () => {
      const targetRoom = createMockRoom("W2N1", { controller: { my: false, level: 5 } });
      (targetRoom as unknown as { find: Room["find"] }).find = ((type: FindConstant) => {
        if (type === FIND_CONSTRUCTION_SITES) return [];
        return [];
      }) as Room["find"];
      const ctx = makeContext(role, targetRoom);

      const action = evaluateEconomyBehavior(ctx);

      expect(action).to.deep.equal({ type: "remoteMoveToRoom", roomName: "W1N1", routeType: "hauler" });
      expect((ctx.creep.memory as Record<string, unknown>).questId).to.equal(undefined);
      expect((ctx.creep.memory as Record<string, unknown>).questTarget).to.equal(undefined);
      expect((ctx.creep.memory as Record<string, unknown>).questAction).to.equal(undefined);
    });

    it(`clears completed ${role} buildcs quest memory even when empty`, () => {
      const targetRoom = createMockRoom("W2N1", { controller: { my: false, level: 5 } });
      (targetRoom as unknown as { find: Room["find"] }).find = ((type: FindConstant) => {
        if (type === FIND_CONSTRUCTION_SITES) return [];
        return [];
      }) as Room["find"];
      const ctx = makeContext(role, targetRoom, 0);

      const action = evaluateEconomyBehavior(ctx);

      expect(action).to.deep.equal({ type: "remoteMoveToRoom", roomName: "W1N1", routeType: "hauler" });
      expect((ctx.creep.memory as Record<string, unknown>).questId).to.equal(undefined);
      expect((ctx.creep.memory as Record<string, unknown>).questTarget).to.equal(undefined);
      expect((ctx.creep.memory as Record<string, unknown>).questAction).to.equal(undefined);
    });
  }
});

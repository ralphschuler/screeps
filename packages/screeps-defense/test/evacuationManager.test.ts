import { expect } from "chai";
import { memoryManager } from "@ralphschuler/screeps-memory";
import { EvacuationManager } from "../src/emergency/evacuationManager";

function createStore() {
  return {
    getUsedCapacity: () => 0,
    getFreeCapacity: () => 100_000,
    getCapacity: () => 100_000,
  } as unknown as Store<ResourceConstant>;
}

function createRoom(name: string, creeps: Creep[] = [], hostiles: Creep[] = []): Room {
  const terminal = { store: createStore(), send: () => OK } as unknown as StructureTerminal;
  const storage = { store: createStore() } as unknown as StructureStorage;
  return {
    name,
    controller: { my: true, level: 8 },
    terminal,
    storage,
    find: (type: FindConstant) => {
      if (type === FIND_MY_CREEPS) return creeps;
      if (type === FIND_HOSTILE_CREEPS) return hostiles;
      if (type === FIND_NUKES) return [];
      return [];
    },
  } as unknown as Room;
}

function createHostile(): Creep {
  return {
    owner: { username: "Invader" },
    body: [{ type: ATTACK, hits: 100 }],
  } as unknown as Creep;
}

function createCreep(name: string): Creep {
  return {
    name,
    memory: {},
    body: [{ type: MOVE, hits: 100 }],
  } as unknown as Creep;
}

describe("EvacuationManager persistence", () => {
  beforeEach(() => {
    (globalThis as any).Game = {
      ...Game,
      time: 100,
      rooms: {},
      creeps: {},
      map: { getRoomLinearDistance: () => 1 },
    };
    (globalThis as any).Memory = {
      creeps: {},
      rooms: {},
      spawns: {},
      flags: {},
      powerCreeps: {},
    };
  });

  it("starts siege evacuation when nominal defenders are spawning", () => {
    const source = createRoom(
      "W1N1",
      [{ name: "spawning-defender", spawning: true, memory: {}, body: [{ type: ATTACK, hits: 100 }] } as unknown as Creep],
      [createHostile(), createHostile(), createHostile()],
    );
    const target = createRoom("W2N1");
    (Game as any).rooms = { [source.name]: source, [target.name]: target };
    const swarm = memoryManager.initSwarmState(source.name);
    swarm.danger = 3;
    swarm.posture = "siege";

    const manager = new EvacuationManager();
    manager.run();

    expect(manager.getEvacuationState(source.name)).to.include({ reason: "siege", roomName: source.name });
  });

  it("persists the target and resumes an active evacuation after manager reset", () => {
    const evacuatingCreep = createCreep("evacuating-creep");
    const source = createRoom("W1N1", [evacuatingCreep]);
    const target = createRoom("W2N1");
    (Game as any).rooms = { [source.name]: source, [target.name]: target };
    (Game as any).creeps = { [evacuatingCreep.name]: evacuatingCreep };

    const swarm = memoryManager.initSwarmState(source.name);
    swarm.danger = 3;
    swarm.posture = "siege";

    const manager = new EvacuationManager();
    expect(manager.startEvacuation(source.name, "siege")).to.equal(true);

    const intent = (swarm as any).evacuationIntent;
    expect(intent).to.include({
      reason: "siege",
      targetRoom: target.name,
      startedAt: 100,
      complete: false,
    });

    (Game as any).time = 105;
    const restartedManager = new EvacuationManager();
    restartedManager.run();

    const resumed = restartedManager.getEvacuationState(source.name);
    expect(resumed).to.include({
      roomName: source.name,
      reason: "siege",
      targetRoom: target.name,
      startedAt: 100,
      complete: false,
    });
    expect(evacuatingCreep.memory).to.include({
      evacuating: true,
      evacuationTarget: target.name,
    });
    expect((swarm as any).evacuationIntent.progress).to.equal(resumed?.progress);
  });

  it("keeps a persisted evacuation idempotent before its first resumed run", () => {
    const source = createRoom("W1N1");
    const target = createRoom("W2N1");
    (Game as any).rooms = { [source.name]: source, [target.name]: target };
    const swarm = memoryManager.initSwarmState(source.name);
    swarm.posture = "evacuate";

    expect(new EvacuationManager().startEvacuation(source.name, "nuke", 500)).to.equal(true);
    expect(new EvacuationManager().startEvacuation(source.name, "nuke", 500)).to.equal(false);
    expect((swarm as any).evacuationIntent.targetRoom).to.equal(target.name);
  });

  it("resumes a persisted nuke intent with its deadline", () => {
    const source = createRoom("W1N1");
    const target = createRoom("W2N1");
    (Game as any).rooms = { [source.name]: source, [target.name]: target };
    const swarm = memoryManager.initSwarmState(source.name);

    expect(new EvacuationManager().startEvacuation(source.name, "nuke", 500)).to.equal(true);
    (Game as any).time = 105;

    const restartedManager = new EvacuationManager();
    const resumed = restartedManager.getEvacuationState(source.name);

    expect(resumed).to.include({
      reason: "nuke",
      targetRoom: target.name,
      deadline: 500,
      complete: false,
    });
    expect((swarm as any).evacuationIntent.deadline).to.equal(500);
  });

  it("clears persisted intent and recalled creep flags when cancelled after reset", () => {
    const evacuatingCreep = createCreep("evacuating-creep");
    const source = createRoom("W1N1", [evacuatingCreep]);
    const target = createRoom("W2N1");
    (Game as any).rooms = { [source.name]: source, [target.name]: target };
    (Game as any).creeps = { [evacuatingCreep.name]: evacuatingCreep };
    const swarm = memoryManager.initSwarmState(source.name);

    const manager = new EvacuationManager();
    expect(manager.startEvacuation(source.name, "siege")).to.equal(true);
    manager.run();
    const restartedManager = new EvacuationManager();
    restartedManager.cancelEvacuation(source.name);

    expect(restartedManager.getEvacuationState(source.name)).to.equal(undefined);
    expect((swarm as any).evacuationIntent).to.equal(undefined);
    expect(evacuatingCreep.memory).to.not.have.property("evacuating");
    expect(evacuatingCreep.memory).to.not.have.property("evacuationTarget");
  });

  it("expires completed persisted intent instead of reviving it", () => {
    const source = createRoom("W1N1");
    (Game as any).rooms = { [source.name]: source };
    const swarm = memoryManager.initSwarmState(source.name);
    (swarm as any).evacuationIntent = {
      reason: "nuke",
      targetRoom: "W2N1",
      startedAt: 100,
      progress: 100,
      complete: true,
      updatedAt: 100,
    };
    (Game as any).time = 1_101;

    const manager = new EvacuationManager();
    manager.run();

    expect(manager.getEvacuationState(source.name)).to.equal(undefined);
    expect((swarm as any).evacuationIntent).to.equal(undefined);
  });
});

import { expect } from "chai";
import { RoomVisualizer } from "../src/roomVisualizer.ts";
import type { MemoryManager } from "../src/types.ts";

type MutableGlobal = typeof globalThis & {
  Game: any;
  Memory: any;
  RoomVisual: any;
  FIND_HOSTILE_CREEPS: number;
  FIND_MY_CREEPS: number;
  FIND_MY_SPAWNS: number;
  FIND_MY_STRUCTURES: number;
  STRUCTURE_TOWER: StructureConstant;
};

class MockRoomVisual {
  public readonly textCalls: string[] = [];

  public text(message: string): this {
    this.textCalls.push(String(message));
    return this;
  }

  public rect(): this { return this; }
  public circle(): this { return this; }
  public line(): this { return this; }
  public poly(): this { return this; }
}

const memoryManager: MemoryManager = {
  getOrInitSwarmState: () => ({
    colonyLevel: "seed",
    posture: "eco",
    danger: 0,
    remoteAssignments: [],
    pheromones: {}
  })
};

describe("RoomVisualizer", () => {
  const g = globalThis as MutableGlobal;
  let visuals: MockRoomVisual[];

  beforeEach(() => {
    visuals = [];
    g.FIND_HOSTILE_CREEPS = 101;
    g.FIND_MY_CREEPS = 102;
    g.FIND_MY_SPAWNS = 103;
    g.FIND_MY_STRUCTURES = 104;
    g.STRUCTURE_TOWER = "tower" as StructureConstant;
    g.Memory = { visualConfig: undefined };
    g.Game = {
      time: 1000,
      cpu: { getUsed: () => 1, limit: 100, bucket: 10000 },
      flags: {},
      creeps: {}
    };
    g.RoomVisual = function RoomVisual() {
      const visual = new MockRoomVisual();
      visuals.push(visual);
      return visual;
    };
  });

  it("renders zero controller progress when progressTotal is unavailable", () => {
    const room = {
      name: "W1N1",
      controller: { level: 5, progress: 42, progressTotal: 0 },
      energyAvailable: 300,
      energyCapacityAvailable: 550,
      find: (type: number) => (type === g.FIND_MY_CREEPS || type === g.FIND_HOSTILE_CREEPS ? [] : [])
    } as unknown as Room;

    const visualizer = new RoomVisualizer({
      showPheromones: false,
      showPaths: false,
      showCombat: false,
      showResourceFlow: false,
      showSpawnQueue: false,
      showRoomStats: true,
      showStructures: false
    }, memoryManager);

    visualizer.draw(room);

    expect(visuals[0]?.textCalls.join("\n")).to.contain("RCL 5 (0%)");
  });

  it("handles hostile creep stubs without body data", () => {
    const hostile = { pos: { x: 10, y: 10 }, owner: { username: "Invader" } };
    const room = {
      name: "W1N1",
      find: (type: number) => (type === g.FIND_HOSTILE_CREEPS ? [hostile] : [])
    } as unknown as Room;

    const visualizer = new RoomVisualizer({
      showPheromones: false,
      showPaths: false,
      showCombat: true,
      showResourceFlow: false,
      showSpawnQueue: false,
      showRoomStats: false,
      showStructures: false
    }, memoryManager);

    expect(() => visualizer.draw(room)).not.to.throw();
    expect(visuals[0]?.textCalls.join("\n")).to.contain("T:0");
  });
});

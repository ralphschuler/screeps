import { expect } from "chai";
import { LabConfigManager } from "../src/labs/labConfig";
import type { RoomLabConfig } from "../src/types";

function pos(x: number, y: number, roomName = "W1N1") {
  return {
    x,
    y,
    roomName,
    getRangeTo(target: { pos?: { x: number; y: number }; x?: number; y?: number }) {
      const other = target.pos ?? target;
      return Math.max(Math.abs(x - Number(other.x)), Math.abs(y - Number(other.y)));
    }
  };
}

function lab(id: string, x: number, y: number, overrides: Partial<StructureLab> = {}): StructureLab {
  return {
    id,
    structureType: STRUCTURE_LAB,
    pos: pos(x, y),
    store: {},
    cooldown: 0,
    runReaction: () => OK,
    ...overrides
  } as unknown as StructureLab;
}

function installRoom(labs: StructureLab[]): void {
  (Game as any).getObjectById = (id: string) => labs.find(l => l.id === id) ?? null;
  Game.rooms.W1N1 = {
    name: "W1N1",
    controller: { my: true, level: 6 },
    find: (type: number, opts?: { filter?: (item: any) => boolean }) => {
      if (type !== FIND_MY_STRUCTURES) return [];
      return opts?.filter ? labs.filter(opts.filter) : labs;
    }
  } as unknown as Room;
}

function staleConfig(overrides: Partial<RoomLabConfig> = {}): RoomLabConfig {
  return {
    roomName: "W1N1",
    labs: [
      {
        labId: "lab1" as Id<StructureLab>,
        role: "unassigned",
        pos: { x: 25, y: 25 },
        lastConfigured: 1
      }
    ],
    lastUpdate: 1,
    isValid: true,
    ...overrides
  };
}

describe("LabConfigManager live config refresh", () => {
  beforeEach(() => {
    Game.time = 2000;
    Game.rooms = {};
    Memory.rooms = {};
  });

  it("invalidates stale valid memory when fewer than three labs are built", () => {
    const manager = new LabConfigManager();
    installRoom([lab("lab1", 25, 25)]);
    manager.importConfig(staleConfig());

    manager.initialize("W1N1");

    const config = manager.exportConfig("W1N1");
    expect(config?.isValid).to.equal(false);
    expect(config?.activeReaction).to.equal(undefined);
    expect(config?.labs.map(entry => entry.role)).to.deep.equal(["unassigned"]);
  });

  it("reassigns roles when additional labs are built after stale memory was loaded", () => {
    const manager = new LabConfigManager();
    installRoom([lab("lab1", 25, 25), lab("lab2", 26, 25), lab("lab3", 25, 26)]);
    manager.importConfig(staleConfig());

    manager.initialize("W1N1");

    const config = manager.exportConfig("W1N1");
    expect(config?.isValid).to.equal(true);
    expect(config?.labs.map(entry => entry.role).sort()).to.deep.equal(["input1", "input2", "output"]);
  });

  it("keeps line-spaced lab clusters valid by selecting the shared center as output", () => {
    const manager = new LabConfigManager();
    installRoom([lab("center", 25, 25), lab("east", 27, 25), lab("west", 23, 25)]);
    manager.importConfig(staleConfig());

    manager.initialize("W1N1");

    const config = manager.exportConfig("W1N1");
    expect(config?.isValid).to.equal(true);
    expect(config?.labs.map(entry => entry.role)).to.deep.equal(["output", "input1", "input2"]);
  });

  it("reapplies the active reaction after refreshing stale roles", () => {
    const manager = new LabConfigManager();
    installRoom([lab("lab1", 25, 25), lab("lab2", 26, 25), lab("lab3", 25, 26)]);
    manager.importConfig(
      staleConfig({
        activeReaction: {
          input1: RESOURCE_HYDROGEN,
          input2: RESOURCE_OXYGEN,
          output: RESOURCE_HYDROXIDE
        }
      })
    );

    manager.initialize("W1N1");

    const config = manager.exportConfig("W1N1");
    expect(config?.labs.find(entry => entry.role === "input1")?.resourceType).to.equal(RESOURCE_HYDROGEN);
    expect(config?.labs.find(entry => entry.role === "input2")?.resourceType).to.equal(RESOURCE_OXYGEN);
    expect(config?.labs.find(entry => entry.role === "output")?.resourceType).to.equal(RESOURCE_HYDROXIDE);
  });

  it("runs only ready output labs", () => {
    const reactionsRun: string[] = [];
    const manager = new LabConfigManager();
    installRoom([
      lab("lab1", 25, 25),
      lab("lab2", 26, 25),
      lab("ready", 25, 26, {
        runReaction: () => {
          reactionsRun.push("ready");
          return OK;
        }
      }),
      lab("cooling", 26, 26, {
        cooldown: 3,
        runReaction: () => {
          reactionsRun.push("cooling");
          return OK;
        }
      })
    ]);

    manager.initialize("W1N1");
    manager.setActiveReaction("W1N1", RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_HYDROXIDE);

    expect(manager.runReactions("W1N1")).to.equal(1);
    expect(reactionsRun).to.deep.equal(["ready"]);
  });

  it("lists rooms with persisted lab config", () => {
    const manager = new LabConfigManager();
    Memory.rooms = {
      W1N1: { labConfig: staleConfig({ roomName: "W1N1" }) },
      W2N2: {},
      W3N3: { labConfig: staleConfig({ roomName: "W3N3" }) }
    } as unknown as typeof Memory.rooms;

    expect(manager.getConfiguredRooms().sort()).to.deep.equal(["W1N1", "W3N3"]);
  });
});

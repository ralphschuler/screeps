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

function lab(id: string, x: number, y: number): StructureLab {
  return {
    id,
    structureType: STRUCTURE_LAB,
    pos: pos(x, y),
    store: {},
    cooldown: 0
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

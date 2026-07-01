import { expect } from "chai";
import { IntelScanner } from "../../src/empire/intelScanner";
import { createDefaultEmpireMemory, type EmpireMemory } from "@ralphschuler/screeps-memory";

function ownedStructure(structureType: StructureConstant, owner: string): Structure {
  return { structureType, owner: { username: owner } } as unknown as Structure;
}

function createVisibleRoom(
  structures: Structure[],
  hostileStructures: Structure[],
  owner = "TooAngel"
): Room {
  return {
    name: "W2N2",
    controller: { level: 8, owner: { username: owner }, my: false },
    find: (type: FindConstant, opts?: { filter?: (structure: Structure) => boolean }) => {
      if (type === FIND_SOURCES) return [{ id: "source1" }, { id: "source2" }];
      if (type === FIND_MINERALS) return [{ mineralType: RESOURCE_UTRIUM }];
      if (type === FIND_STRUCTURES) return opts?.filter ? structures.filter(opts.filter) : structures;
      if (type === FIND_HOSTILE_STRUCTURES) {
        return opts?.filter ? hostileStructures.filter(opts.filter) : hostileStructures;
      }
      return [];
    },
    getTerrain: () => ({ get: () => 0 })
  } as unknown as Room;
}

describe("IntelScanner", () => {
  it("does not count allied towers or spawns as hostile structure intel", () => {
    const empire = createDefaultEmpireMemory();
    const allyTower = ownedStructure(STRUCTURE_TOWER, "TooAngel");
    const allySpawn = ownedStructure(STRUCTURE_SPAWN, "TedRoastBeef");
    const portal = { structureType: STRUCTURE_PORTAL } as Structure;
    const room = createVisibleRoom([allyTower, allySpawn, portal], [allyTower, allySpawn]);
    const scanner = new IntelScanner();

    (scanner as unknown as { updateRoomIntel(room: Room, empire: EmpireMemory): void }).updateRoomIntel(room, empire);

    expect(empire.knownRooms.W2N2).to.deep.include({
      owner: "TooAngel",
      towerCount: 0,
      spawnCount: 0,
      hasPortal: true
    });
  });

  it("still counts real hostile towers and spawns", () => {
    const empire = createDefaultEmpireMemory();
    const enemyTower = ownedStructure(STRUCTURE_TOWER, "Enemy");
    const enemySpawn = ownedStructure(STRUCTURE_SPAWN, "Enemy");
    const allyTower = ownedStructure(STRUCTURE_TOWER, "TooAngel");
    const allySpawn = ownedStructure(STRUCTURE_SPAWN, "TedRoastBeef");
    const room = createVisibleRoom(
      [enemyTower, enemySpawn, allyTower, allySpawn],
      [enemyTower, enemySpawn, allyTower, allySpawn],
      "Enemy"
    );
    const scanner = new IntelScanner();

    (scanner as unknown as { updateRoomIntel(room: Room, empire: EmpireMemory): void }).updateRoomIntel(room, empire);

    expect(empire.knownRooms.W2N2).to.deep.include({
      owner: "Enemy",
      towerCount: 1,
      spawnCount: 1
    });
  });

  it("respects configured allies when counting hostile structure intel", () => {
    const empire = createDefaultEmpireMemory();
    const configuredAllyTower = ownedStructure(STRUCTURE_TOWER, "FriendlyNeighbor");
    const configuredAllySpawn = ownedStructure(STRUCTURE_SPAWN, "FriendlyNeighbor");
    const room = createVisibleRoom(
      [configuredAllyTower, configuredAllySpawn],
      [configuredAllyTower, configuredAllySpawn],
      "FriendlyNeighbor"
    );
    const scanner = new IntelScanner({ allies: ["FriendlyNeighbor"] });

    (scanner as unknown as { updateRoomIntel(room: Room, empire: EmpireMemory): void }).updateRoomIntel(room, empire);

    expect(empire.knownRooms.W2N2).to.deep.include({
      owner: "FriendlyNeighbor",
      towerCount: 0,
      spawnCount: 0
    });
  });
});

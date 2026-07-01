import { expect } from "chai";
import { IntelScanner } from "../../src/empire/intelScanner";
import { createDefaultEmpireMemory, type EmpireMemory } from "@ralphschuler/screeps-memory";

function ownedStructure(structureType: StructureConstant, owner: string): Structure {
  return { structureType, owner: { username: owner } } as unknown as Structure;
}

function aggressiveCreep(owner: string): Creep {
  return {
    owner: { username: owner },
    body: [{ type: ATTACK }],
    getActiveBodyparts: (part: BodyPartConstant) => (part === ATTACK ? 1 : 0)
  } as unknown as Creep;
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

  it("does not raise room threat for configured ally creeps", () => {
    const globals = global as unknown as Record<string, unknown>;
    const previousGlobals = {
      ATTACK: globals.ATTACK,
      RANGED_ATTACK: globals.RANGED_ATTACK,
      WORK: globals.WORK,
      FIND_HOSTILE_CREEPS: globals.FIND_HOSTILE_CREEPS,
      FIND_NUKES: globals.FIND_NUKES,
      Game: globals.Game,
      Memory: globals.Memory
    };

    try {
      globals.ATTACK = "attack";
      globals.RANGED_ATTACK = "ranged_attack";
      globals.WORK = "work";
      globals.FIND_HOSTILE_CREEPS = 103;
      globals.FIND_NUKES = 117;

      const empire = createDefaultEmpireMemory();
      empire.knownRooms.W2N2 = {
        name: "W2N2",
        lastSeen: 1,
        sources: 2,
        controllerLevel: 8,
        threatLevel: 0,
        scouted: true,
        terrain: "plains",
        isHighway: false,
        isSK: false
      };
      const configuredAlly = aggressiveCreep("FriendlyNeighbor");
      const room = {
        name: "W2N2",
        find: (type: FindConstant) => {
          if (type === FIND_HOSTILE_CREEPS) return [configuredAlly];
          if (type === FIND_NUKES) return [];
          return [];
        }
      } as unknown as Room;
      (global as unknown as { Game: Partial<Game> }).Game = { rooms: { W2N2: room }, time: 100 };
      (global as unknown as { Memory: Memory }).Memory = { empire } as Memory;
      const scanner = new IntelScanner({ allies: ["FriendlyNeighbor"] });

      (scanner as unknown as { detectThreats(): void }).detectThreats();

      expect(empire.knownRooms.W2N2.threatLevel).to.equal(0);
    } finally {
      for (const [key, value] of Object.entries(previousGlobals)) {
        if (value === undefined) {
          delete globals[key];
        } else {
          globals[key] = value;
        }
      }
    }
  });

  it("uses runtime configured allies when tracking visible creeps", () => {
    const globals = global as unknown as Record<string, unknown>;
    const previousGlobals = {
      ATTACK: globals.ATTACK,
      RANGED_ATTACK: globals.RANGED_ATTACK,
      WORK: globals.WORK,
      FIND_HOSTILE_CREEPS: globals.FIND_HOSTILE_CREEPS,
      Game: globals.Game,
      Memory: globals.Memory
    };

    try {
      globals.ATTACK = "attack";
      globals.RANGED_ATTACK = "ranged_attack";
      globals.WORK = "work";
      globals.FIND_HOSTILE_CREEPS = 103;

      const empire = createDefaultEmpireMemory();
      (empire as EmpireMemory & { diplomacy: { allies: string[] } }).diplomacy = { allies: ["FriendlyNeighbor"] };
      const configuredAlly = aggressiveCreep("FriendlyNeighbor");
      const room = {
        name: "W2N2",
        controller: { level: 8, owner: { username: "FriendlyNeighbor" }, my: false },
        find: (type: FindConstant) => {
          if (type === FIND_HOSTILE_CREEPS) return [configuredAlly];
          return [];
        }
      } as unknown as Room;
      (global as unknown as { Game: Partial<Game> }).Game = { time: 100, rooms: { W2N2: room } };
      (global as unknown as { Memory: Memory }).Memory = { empire } as Memory;
      const scanner = new IntelScanner({ aggressionThreshold: 1 });
      const internals = scanner as unknown as { updateEnemyTracking(): void; updateRoomThreatLevels(): void };

      internals.updateEnemyTracking();
      (global as unknown as { Game: { time: number } }).Game.time = 101;
      internals.updateEnemyTracking();
      internals.updateRoomThreatLevels();

      expect(scanner.getEnemyPlayer("FriendlyNeighbor")).to.equal(undefined);
      expect(empire.warTargets).to.deep.equal([]);
    } finally {
      for (const [key, value] of Object.entries(previousGlobals)) {
        if (value === undefined) {
          delete globals[key];
        } else {
          globals[key] = value;
        }
      }
    }
  });

  it("does not add configured allies to war targets", () => {
    const globals = global as unknown as Record<string, unknown>;
    const previousGlobals = { Game: globals.Game, Memory: globals.Memory };

    try {
      const empire = createDefaultEmpireMemory();
      (global as unknown as { Game: Partial<Game> }).Game = { time: 100, rooms: {} };
      (global as unknown as { Memory: Memory }).Memory = { empire } as Memory;
      const scanner = new IntelScanner({ allies: ["FriendlyNeighbor"] });
      const enemyPlayers = (scanner as unknown as { enemyPlayers: Map<string, unknown> }).enemyPlayers;
      enemyPlayers.set("FriendlyNeighbor", {
        username: "FriendlyNeighbor",
        lastSeen: Game.time,
        rooms: ["W2N2"],
        threatLevel: 3,
        aggressionCount: 99,
        isAlly: false
      });
      enemyPlayers.set("Enemy", {
        username: "Enemy",
        lastSeen: Game.time,
        rooms: ["W3N3"],
        threatLevel: 3,
        aggressionCount: 99,
        isAlly: false
      });

      (scanner as unknown as { updateRoomThreatLevels(): void }).updateRoomThreatLevels();

      expect(empire.warTargets).to.deep.equal(["Enemy"]);
    } finally {
      for (const [key, value] of Object.entries(previousGlobals)) {
        if (value === undefined) {
          delete globals[key];
        } else {
          globals[key] = value;
        }
      }
    }
  });

  it("removes stale enemy tracking when a player becomes a configured ally", () => {
    const globals = global as unknown as Record<string, unknown>;
    const previousGlobals = { Game: globals.Game, Memory: globals.Memory };

    try {
      const empire = createDefaultEmpireMemory();
      (empire as EmpireMemory & { diplomacy: { allies: string[] } }).diplomacy = { allies: ["FriendlyNeighbor"] };
      (global as unknown as { Game: Partial<Game> }).Game = { time: 100, rooms: {} };
      (global as unknown as { Memory: Memory }).Memory = { empire } as Memory;
      const scanner = new IntelScanner();
      const enemyPlayers = (scanner as unknown as { enemyPlayers: Map<string, unknown> }).enemyPlayers;
      enemyPlayers.set("FriendlyNeighbor", {
        username: "FriendlyNeighbor",
        lastSeen: Game.time - 1,
        rooms: ["W2N2"],
        threatLevel: 3,
        aggressionCount: 99,
        isAlly: false
      });
      enemyPlayers.set("Enemy", {
        username: "Enemy",
        lastSeen: Game.time - 1,
        rooms: ["W3N3"],
        threatLevel: 3,
        aggressionCount: 99,
        isAlly: false
      });

      (scanner as unknown as { updateEnemyTracking(): void }).updateEnemyTracking();

      expect(scanner.getEnemyPlayer("FriendlyNeighbor")).to.equal(undefined);
      expect(scanner.getEnemyPlayer("Enemy")?.username).to.equal("Enemy");
    } finally {
      for (const [key, value] of Object.entries(previousGlobals)) {
        if (value === undefined) {
          delete globals[key];
        } else {
          globals[key] = value;
        }
      }
    }
  });
});

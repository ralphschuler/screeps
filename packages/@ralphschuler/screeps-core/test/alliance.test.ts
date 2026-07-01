import { expect } from "chai";
import {
  filterAllyCreeps,
  filterAllyStructures,
  filterKnownAllyCreeps,
  getActualHostileCreeps,
  getConfiguredAllyPlayers,
  getKnownHostileCreeps,
  isAllyPlayer,
  isKnownAllyPlayer,
  NON_AGGRESSION_PACT_PLAYERS
} from "../src/alliance";

describe("alliance safety helpers", () => {
  before(() => {
    (global as any).FIND_HOSTILE_CREEPS = 103;
  });

  it("keeps the permanent non-aggression pact in one shared source", () => {
    expect(NON_AGGRESSION_PACT_PLAYERS).to.deep.equal(["TooAngel", "TedRoastBeef"]);
    expect(isAllyPlayer("TooAngel")).to.equal(true);
    expect(isAllyPlayer("TedRoastBeef")).to.equal(true);
    expect(isAllyPlayer("Invader")).to.equal(false);
  });

  it("filters allied creeps and structures from hostile lists", () => {
    const ally = { owner: { username: "TooAngel" } } as Creep;
    const ted = { owner: { username: "TedRoastBeef" } } as Creep;
    const hostile = { owner: { username: "Invader" } } as Creep;

    expect(filterAllyCreeps([ally, ted, hostile])).to.deep.equal([hostile]);

    const allyStructure = { owner: { username: "TooAngel" } } as Structure;
    const hostileStructure = { owner: { username: "Invader" } } as Structure;
    expect(filterAllyStructures([allyStructure, hostileStructure])).to.deep.equal([hostileStructure]);
  });

  it("includes runtime configured allies in known ally policy", () => {
    const globals = global as unknown as { Memory?: unknown };
    const previousMemory = globals.Memory;

    try {
      globals.Memory = { empire: { diplomacy: { allies: ["FriendlyNeighbor"] } } };

      expect(getConfiguredAllyPlayers()).to.deep.equal(["FriendlyNeighbor"]);
      expect(isKnownAllyPlayer("TooAngel")).to.equal(true);
      expect(isKnownAllyPlayer("FriendlyNeighbor")).to.equal(true);
      expect(isKnownAllyPlayer("Invader")).to.equal(false);
    } finally {
      if (previousMemory === undefined) {
        delete globals.Memory;
      } else {
        globals.Memory = previousMemory;
      }
    }
  });

  it("filters runtime configured allies from known hostile creep lists", () => {
    const globals = global as unknown as { Memory?: unknown };
    const previousMemory = globals.Memory;

    try {
      globals.Memory = { diplomacy: { allies: ["FriendlyNeighbor"] } };
      const configuredAlly = { owner: { username: "FriendlyNeighbor" } } as Creep;
      const hostile = { owner: { username: "Invader" } } as Creep;

      expect(filterKnownAllyCreeps([configuredAlly, hostile])).to.deep.equal([hostile]);

      const room = {
        find: (type: FindConstant) => (type === FIND_HOSTILE_CREEPS ? [configuredAlly, hostile] : [])
      } as Room;
      expect(getKnownHostileCreeps(room)).to.deep.equal([hostile]);
      expect(getActualHostileCreeps(room)).to.deep.equal([hostile]);
    } finally {
      if (previousMemory === undefined) {
        delete globals.Memory;
      } else {
        globals.Memory = previousMemory;
      }
    }
  });

  it("preserves the original array reference when no allies are present", () => {
    const hostile = { owner: { username: "Invader" } } as Creep;
    const hostiles = [hostile];

    expect(filterAllyCreeps(hostiles)).to.equal(hostiles);
  });

  it("wraps Room.find(FIND_HOSTILE_CREEPS) with ally filtering", () => {
    const ally = { owner: { username: "TooAngel" } } as Creep;
    const hostile = { owner: { username: "Invader" } } as Creep;
    const room = {
      find: (type: FindConstant) => (type === FIND_HOSTILE_CREEPS ? [ally, hostile] : [])
    } as Room;

    expect(getActualHostileCreeps(room)).to.deep.equal([hostile]);
  });
});

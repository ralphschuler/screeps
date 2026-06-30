import { expect } from "chai";
import {
  filterAllyCreeps,
  filterAllyStructures,
  getActualHostileCreeps,
  isAllyPlayer,
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

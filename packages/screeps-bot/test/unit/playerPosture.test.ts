import { expect } from "chai";
import { heapCache } from "@ralphschuler/screeps-memory";
import {
  PLAYER_ATTACK_MAX_STORED_INCIDENTS,
  getQualifyingAttackers,
  recordPlayerAttack
} from "../../src/empire/postureManager";

function hostile(username: string, parts: BodyPartConstant[]): Creep {
  return {
    owner: { username },
    body: parts.map(type => ({ type, hits: 100 }))
  } as unknown as Creep;
}

describe("player posture attack memory", () => {
  beforeEach(() => {
    (global as any).Game = (global as any).Game ?? {};
    (global as any).Memory = (global as any).Memory ?? {};
    (global as any).Game.time = 1000;
    heapCache.clear();
    (global as any).Memory.empire = {
      knownRooms: {},
      clusters: [],
      warTargets: [],
      ownedRooms: {},
      claimQueue: [],
      nukeCandidates: [],
      powerBanks: [],
      objectives: {
        targetPowerLevel: 0,
        targetRoomCount: 1,
        warMode: false,
        expansionPaused: false
      },
      lastUpdate: 1000
    };
  });

  it("ignores allied attackers", () => {
    recordPlayerAttack("TooAngel", "W1N1");
    recordPlayerAttack("TedRoastBeef", "W1N1");

    expect((Memory as any).empire.warTargets).to.deep.equal([]);
    expect((Memory as any).empire.playerPostures).to.equal(undefined);
  });

  it("ignores runtime configured allied attackers", () => {
    (Memory as any).empire.diplomacy = { allies: ["FriendlyNeighbor"] };

    recordPlayerAttack("FriendlyNeighbor", "W1N1");
    const attackers = getQualifyingAttackers([
      hostile("FriendlyNeighbor", [ATTACK]),
      hostile("Invader", [ATTACK])
    ]);

    expect((Memory as any).empire.warTargets).to.deep.equal([]);
    expect((Memory as any).empire.playerPostures).to.equal(undefined);
    expect(attackers).to.deep.equal(["Invader"]);
  });

  it("declares war after three attacks inside the rolling window", () => {
    recordPlayerAttack("Enemy", "W1N1");
    (global as any).Game.time += 100;
    recordPlayerAttack("Enemy", "W1N2");
    (global as any).Game.time += 100;
    const entry = recordPlayerAttack("Enemy", "W1N3");

    expect(entry?.state).to.equal("war");
    expect((Memory as any).empire.warTargets).to.deep.equal(["Enemy"]);
    expect((Memory as any).empire.objectives.warMode).to.equal(true);
  });

  it("caps stored incident details while preserving posture escalation", () => {
    for (let i = 0; i < PLAYER_ATTACK_MAX_STORED_INCIDENTS + 5; i += 1) {
      (global as any).Game.time = 1000 + i;
      recordPlayerAttack("Enemy", `W${i}N1`);
    }

    const entry = (Memory as any).empire.playerPostures.players.Enemy;

    expect(entry.incidents).to.have.length(PLAYER_ATTACK_MAX_STORED_INCIDENTS);
    expect(entry.attackCount).to.equal(PLAYER_ATTACK_MAX_STORED_INCIDENTS);
    expect(entry.state).to.equal("war");
  });

  it("does not count non-combat scouts as qualifying attackers", () => {
    const attackers = getQualifyingAttackers([
      hostile("Scout", [MOVE]),
      hostile("Invader", [MOVE, ATTACK]),
      hostile("TooAngel", [ATTACK])
    ]);

    expect(attackers).to.deep.equal(["Invader"]);
  });
});

import { expect } from "chai";
import type { EmpireMemory, RoomIntel } from "@ralphschuler/screeps-memory";
import { evaluateExpansionOpportunities, planExpansionClaimQueue } from "../../src/empire/expansionOpportunityModule";

function roomIntel(name: string, overrides: Partial<RoomIntel> = {}): RoomIntel {
  return {
    name,
    lastSeen: 1000,
    sources: 2,
    controllerLevel: 0,
    threatLevel: 0,
    scouted: true,
    terrain: "plains",
    isHighway: false,
    isSK: false,
    ...overrides
  };
}

function empireWithRooms(knownRooms: Record<string, RoomIntel>): EmpireMemory {
  return {
    knownRooms,
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
    lastUpdate: 0
  };
}

function ownedRoom(name: string): Room {
  return { name } as Room;
}

describe("Expansion opportunity evaluation", () => {
  beforeEach(() => {
    global.Game = {
      ...global.Game,
      time: 1234,
      map: {
        ...global.Game.map,
        getRoomLinearDistance: (a: string, b: string) => {
          const ax = Number(a.match(/^[WE](\d+)/)?.[1] ?? 0);
          const bx = Number(b.match(/^[WE](\d+)/)?.[1] ?? 0);
          return Math.abs(ax - bx);
        },
        describeExits: () => ({})
      }
    } as typeof Game;
  });

  it("returns viable scouted rooms as sorted expansion candidates with evaluation metadata", () => {
    const empire = empireWithRooms({
      E2N1: roomIntel("E2N1", { sources: 1 }),
      E1N1: roomIntel("E1N1", { sources: 2 })
    });

    const opportunities = evaluateExpansionOpportunities(empire, [ownedRoom("E0N1")], {
      maxExpansionDistance: 10,
      minExpansionScore: 1,
      maxCandidates: 10
    });

    expect(opportunities.map(candidate => candidate.roomName)).to.deep.equal(["E1N1", "E2N1"]);
    expect(opportunities[0]).to.include({ claimed: false, lastEvaluated: 1234, distance: 1 });
    expect(opportunities[0].score).to.be.greaterThan(opportunities[1].score);
  });

  it("excludes rooms that cannot become expansion opportunities", () => {
    const empire = empireWithRooms({
      owned: roomIntel("E1N1", { owner: "me" }),
      reserved: roomIntel("E2N1", { reserver: "other" }),
      unscouted: roomIntel("E3N1", { scouted: false }),
      highway: roomIntel("E4N1", { isHighway: true }),
      far: roomIntel("E20N1"),
      viable: roomIntel("E5N1")
    });

    const opportunities = evaluateExpansionOpportunities(empire, [ownedRoom("E0N1")], {
      maxExpansionDistance: 10,
      minExpansionScore: 1,
      maxCandidates: 10
    });

    expect(opportunities.map(candidate => candidate.roomName)).to.deep.equal(["E5N1"]);
  });

  it("preserves already-claimed active targets while refreshing new opportunities", () => {
    const empire = empireWithRooms({
      E1N1: roomIntel("E1N1", { sources: 2 }),
      E2N1: roomIntel("E2N1", { sources: 2 })
    });
    empire.claimQueue = [
      {
        roomName: "E9N1",
        score: 999,
        distance: 9,
        claimed: true,
        lastEvaluated: 1000
      }
    ];

    const plan = planExpansionClaimQueue(empire, [ownedRoom("E0N1")], {
      maxExpansionDistance: 10,
      minExpansionScore: 1,
      maxCandidates: 3
    });

    expect(plan.claimQueue.map(candidate => [candidate.roomName, candidate.claimed])).to.deep.equal([
      ["E9N1", true],
      ["E1N1", false],
      ["E2N1", false]
    ]);
    expect(plan.preservedActiveTargets).to.equal(1);
  });

  it("caps output to the requested number of strongest opportunities", () => {
    const empire = empireWithRooms({
      E1N1: roomIntel("E1N1", { sources: 2 }),
      E2N1: roomIntel("E2N1", { sources: 2 }),
      E3N1: roomIntel("E3N1", { sources: 1 })
    });

    const opportunities = evaluateExpansionOpportunities(empire, [ownedRoom("E0N1")], {
      maxExpansionDistance: 10,
      minExpansionScore: 1,
      maxCandidates: 2
    });

    expect(opportunities.map(candidate => candidate.roomName)).to.deep.equal(["E1N1", "E2N1"]);
  });
});

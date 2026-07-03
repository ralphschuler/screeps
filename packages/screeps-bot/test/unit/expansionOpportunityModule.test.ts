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

function constructionSite(roomName: string, structureType: BuildableStructureConstant): ConstructionSite {
  return {
    id: `${roomName}-${structureType}` as Id<ConstructionSite>,
    pos: { roomName },
    structureType
  } as ConstructionSite;
}

function hostileCreep(owner: string, parts: BodyPartConstant[]): Creep {
  return {
    owner: { username: owner },
    body: parts.map(type => ({ type, hits: 100 }))
  } as Creep;
}

function visibleRoom(roomName: string, hostiles: Creep[] = [], controller: Partial<StructureController> = {}): Room {
  return {
    name: roomName,
    controller,
    find: (type: FindConstant) => (type === FIND_HOSTILE_CREEPS ? hostiles : [])
  } as unknown as Room;
}

describe("Expansion opportunity evaluation", () => {
  beforeEach(() => {
    global.Game = {
      ...global.Game,
      time: 1234,
      constructionSites: {},
      rooms: {},
      spawns: {
        Spawn1: { owner: { username: "Me" } }
      },
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

  it("keeps live owned spawn construction targets in the claim queue even with only stub intel", () => {
    const empire = empireWithRooms({
      E1N1: roomIntel("E1N1", { scouted: false, sources: 0 })
    });
    Game.constructionSites = {
      staleSpawn: constructionSite("E1N1", STRUCTURE_SPAWN)
    };

    const plan = planExpansionClaimQueue(empire, [ownedRoom("E0N1")], {
      maxExpansionDistance: 10,
      minExpansionScore: 50,
      maxCandidates: 3
    });

    expect(plan.claimQueue).to.have.length(1);
    expect(plan.claimQueue[0]).to.include({ roomName: "E1N1", claimed: false, lastEvaluated: 1234, distance: 1 });
    expect(plan.claimQueue[0].score).to.be.greaterThan(50);
    expect(plan.ownedConstructionTargets).to.equal(1);
  });

  it("does not treat container-only construction sites as claim targets", () => {
    const empire = empireWithRooms({});
    Game.constructionSites = {
      remoteContainer: constructionSite("E1N1", STRUCTURE_CONTAINER)
    };

    const plan = planExpansionClaimQueue(empire, [ownedRoom("E0N1")], {
      maxExpansionDistance: 10,
      minExpansionScore: 50,
      maxCandidates: 3
    });

    expect(plan.claimQueue).to.deep.equal([]);
    expect(plan.ownedConstructionTargets).to.equal(0);
  });

  it("does not report owned spawn construction targets as queued when the claim queue cap drops them", () => {
    const empire = empireWithRooms({});
    empire.claimQueue = [
      {
        roomName: "E9N1",
        score: 999,
        distance: 9,
        claimed: true,
        lastEvaluated: 1000
      }
    ];
    Game.constructionSites = {
      staleSpawn: constructionSite("E1N1", STRUCTURE_SPAWN)
    };

    const plan = planExpansionClaimQueue(empire, [ownedRoom("E0N1")], {
      maxExpansionDistance: 10,
      minExpansionScore: 50,
      maxCandidates: 1
    });

    expect(plan.claimQueue.map(candidate => candidate.roomName)).to.deep.equal(["E9N1"]);
    expect(plan.ownedConstructionTargets).to.equal(0);
    expect(plan.skippedOwnedConstructionTargets).to.deep.include({ roomName: "E1N1", reason: "claim queue cap" });
  });

  it("does not revive owned spawn construction targets that are no longer claimable or in range", () => {
    const empire = empireWithRooms({
      E1N1: roomIntel("E1N1", { owner: "Enemy" }),
      E2N1: roomIntel("E2N1", { threatLevel: 3 }),
      E20N1: roomIntel("E20N1")
    });
    Game.constructionSites = {
      enemySpawn: constructionSite("E1N1", STRUCTURE_SPAWN),
      threatenedSpawn: constructionSite("E2N1", STRUCTURE_SPAWN),
      farSpawn: constructionSite("E20N1", STRUCTURE_SPAWN)
    };

    const plan = planExpansionClaimQueue(empire, [ownedRoom("E0N1")], {
      maxExpansionDistance: 10,
      minExpansionScore: 50,
      maxCandidates: 3
    });

    expect(plan.claimQueue).to.deep.equal([]);
    expect(plan.ownedConstructionTargets).to.equal(0);
    expect(plan.skippedOwnedConstructionTargets).to.deep.include({ roomName: "E2N1", reason: "threat level 3" });
  });

  it("requeues construction targets with stale self-owner intel when the room is no longer owned", () => {
    const empire = empireWithRooms({
      E1N1: roomIntel("E1N1", { owner: "Me" })
    });
    Game.constructionSites = {
      staleSpawn: constructionSite("E1N1", STRUCTURE_SPAWN)
    };

    const plan = planExpansionClaimQueue(empire, [ownedRoom("E0N1")], {
      maxExpansionDistance: 10,
      minExpansionScore: 50,
      maxCandidates: 3
    });

    expect(plan.claimQueue.map(candidate => candidate.roomName)).to.deep.equal(["E1N1"]);
    expect(plan.ownedConstructionTargets).to.equal(1);
  });

  it("resets stale claimed construction targets so spawn demand can assign a claimer", () => {
    const empire = empireWithRooms({
      E1N1: roomIntel("E1N1", { scouted: false, sources: 0 })
    });
    empire.claimQueue = [
      {
        roomName: "E1N1",
        score: 90,
        distance: 1,
        claimed: true,
        lastEvaluated: 1000
      }
    ];
    Game.constructionSites = {
      staleSpawn: constructionSite("E1N1", STRUCTURE_SPAWN)
    };

    const plan = planExpansionClaimQueue(empire, [ownedRoom("E0N1")], {
      maxExpansionDistance: 10,
      minExpansionScore: 50,
      maxCandidates: 3
    });

    expect(plan.claimQueue).to.have.length(1);
    expect(plan.claimQueue[0]).to.include({ roomName: "E1N1", claimed: false, lastEvaluated: 1234 });
    expect(plan.ownedConstructionTargets).to.equal(1);
    expect(plan.preservedActiveTargets).to.equal(0);
  });

  it("requeues construction targets reserved by us but skips rooms reserved by others", () => {
    const empire = empireWithRooms({
      E1N1: roomIntel("E1N1", { reserver: "Me" }),
      E2N1: roomIntel("E2N1", { reserver: "Enemy" })
    });
    Game.constructionSites = {
      selfReservedSpawn: constructionSite("E1N1", STRUCTURE_SPAWN),
      enemyReservedSpawn: constructionSite("E2N1", STRUCTURE_SPAWN)
    };
    Game.rooms = {
      E1N1: visibleRoom("E1N1", [], { reservation: { username: "Me", ticksToEnd: 1000 } } as StructureController),
      E2N1: visibleRoom("E2N1", [], { reservation: { username: "Enemy", ticksToEnd: 1000 } } as StructureController)
    };

    const plan = planExpansionClaimQueue(empire, [ownedRoom("E0N1")], {
      maxExpansionDistance: 10,
      minExpansionScore: 50,
      maxCandidates: 3
    });

    expect(plan.claimQueue.map(candidate => candidate.roomName)).to.deep.equal(["E1N1"]);
    expect(plan.skippedOwnedConstructionTargets).to.deep.include({ roomName: "E2N1", reason: "reserved by Enemy" });
  });

  it("trusts visible self-reservation over stale hostile reservation intel", () => {
    const empire = empireWithRooms({
      E1N1: roomIntel("E1N1", { reserver: "Enemy" })
    });
    Game.constructionSites = {
      staleReservationSpawn: constructionSite("E1N1", STRUCTURE_SPAWN)
    };
    Game.rooms = {
      E1N1: visibleRoom("E1N1", [], { reservation: { username: "Me", ticksToEnd: 1000 } } as StructureController)
    };

    const plan = planExpansionClaimQueue(empire, [ownedRoom("E0N1")], {
      maxExpansionDistance: 10,
      minExpansionScore: 50,
      maxCandidates: 3
    });

    expect(plan.claimQueue.map(candidate => candidate.roomName)).to.deep.equal(["E1N1"]);
    expect(plan.skippedOwnedConstructionTargets).to.deep.equal([]);
  });

  it("drops active construction targets when current target safety blocks them", () => {
    const empire = empireWithRooms({
      E1N1: roomIntel("E1N1", { owner: "Enemy" })
    });
    empire.claimQueue = [
      {
        roomName: "E1N1",
        score: 999,
        distance: 1,
        claimed: true,
        lastEvaluated: 1000
      }
    ];
    Game.constructionSites = {
      blockedActiveSpawn: constructionSite("E1N1", STRUCTURE_SPAWN)
    };

    const plan = planExpansionClaimQueue(empire, [ownedRoom("E0N1")], {
      maxExpansionDistance: 10,
      minExpansionScore: 50,
      maxCandidates: 3
    });

    expect(plan.claimQueue).to.deep.equal([]);
    expect(plan.preservedActiveTargets).to.equal(0);
    expect(plan.skippedOwnedConstructionTargets).to.deep.include({ roomName: "E1N1", reason: "owned by Enemy" });
  });

  it("uses visible room safety before requeueing construction targets", () => {
    const empire = empireWithRooms({
      E1N1: roomIntel("E1N1"),
      E2N1: roomIntel("E2N1")
    });
    Game.constructionSites = {
      dangerousSpawn: constructionSite("E1N1", STRUCTURE_SPAWN),
      allyOnlySpawn: constructionSite("E2N1", STRUCTURE_SPAWN)
    };
    Game.rooms = {
      E1N1: visibleRoom("E1N1", [hostileCreep("Invader", [ATTACK])]),
      E2N1: visibleRoom("E2N1", [hostileCreep("TooAngel", [ATTACK])])
    };

    const plan = planExpansionClaimQueue(empire, [ownedRoom("E0N1")], {
      maxExpansionDistance: 10,
      minExpansionScore: 50,
      maxCandidates: 3
    });

    expect(plan.claimQueue.map(candidate => candidate.roomName)).to.deep.equal(["E2N1"]);
    expect(plan.skippedOwnedConstructionTargets).to.deep.include({
      roomName: "E1N1",
      reason: "visible dangerous hostiles"
    });
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

import { expect } from "chai";
import { NukeManager } from "../../src/empire/nukeManager";
import { createDefaultSwarmState, createDefaultOvermindMemory } from "../../src/memory/schemas";
import { Game, Memory } from "./mock";
import * as sinon from "sinon";

describe("Nuke Manager", () => {
  let nukeManager: NukeManager;
  let getOvermindStub: sinon.SinonStub;
  let getSwarmStateStub: sinon.SinonStub;
  let getClustersStub: sinon.SinonStub;

  beforeEach(() => {
    // Reset global mocks
    // @ts-ignore: allow adding Game to global
    global.Game = {
      ...Game,
      time: 10000,
      rooms: {},
      creeps: {},
      map: {
        getRoomLinearDistance: (from: string, to: string) => 5
      } as any
    };
    // @ts-ignore: allow adding Memory to global
    global.Memory = { ...Memory };

    // Create fresh nuke manager for each test
    nukeManager = new NukeManager();

    // Setup stubs for memory manager
    const memoryManager = require("../../src/memory/manager").memoryManager;
    getOvermindStub = sinon.stub(memoryManager, "getOvermind").returns(createDefaultOvermindMemory());
    getSwarmStateStub = sinon.stub(memoryManager, "getSwarmState");
    getClustersStub = sinon.stub(memoryManager, "getClusters").returns({});
  });

  afterEach(() => {
    // Restore all stubs
    sinon.restore();
  });

  describe("Incoming Nuke Detection", () => {
    it("should detect incoming nukes and update pheromones", () => {
      const swarm = createDefaultSwarmState();
      swarm.nukeDetected = false;
      swarm.pheromones.defense = 10;
      swarm.danger = 0;

      // Mock room with incoming nuke
      const mockNuke = {
        timeToLand: 1000,
        launchRoomName: "W2N2",
        pos: { x: 25, y: 25, roomName: "W1N1" }
      };

      const mockRoom = {
        name: "W1N1",
        controller: { my: true },
        find: (type: FindConstant) => {
          if (type === FIND_NUKES) return [mockNuke];
          return [];
        }
      } as unknown as Room;

      // @ts-ignore
      global.Game.rooms["W1N1"] = mockRoom;

      // Setup memory manager to return our swarm
      getSwarmStateStub.withArgs("W1N1").returns(swarm);

      // Run detection - use private method via any cast
      (nukeManager as any).detectIncomingNukes();

      // Verify detection
      expect(swarm.nukeDetected).to.be.true;
      expect(swarm.pheromones.defense).to.be.greaterThan(10);
      expect(swarm.danger).to.equal(3);
      expect(swarm.eventLog.length).to.be.greaterThan(0);
    });

    it("should clear nuke detection when nukes are gone", () => {
      const swarm = createDefaultSwarmState();
      swarm.nukeDetected = true;

      const mockRoom = {
        name: "W1N1",
        controller: { my: true },
        find: () => [] // No nukes
      } as unknown as Room;

      // @ts-ignore
      global.Game.rooms["W1N1"] = mockRoom;

      getSwarmStateStub.withArgs("W1N1").returns(swarm);

      (nukeManager as any).detectIncomingNukes();

      expect(swarm.nukeDetected).to.be.false;
    });
  });

  describe("Nuke Candidate Scoring", () => {
    it("should score rooms based on threat level and structures", () => {
      const overmind = createDefaultOvermindMemory();
      overmind.objectives.warMode = true;
      overmind.warTargets = ["W2N2"];
      overmind.roomIntel["W2N2"] = {
        name: "W2N2",
        lastSeen: Game.time,
        sources: 2,
        controllerLevel: 7,
        owner: "enemy",
        threatLevel: 2,
        scouted: true,
        terrain: "mixed",
        isHighway: false,
        isSK: false,
        towerCount: 3,
        spawnCount: 2
      };

      // Mock owned room for distance calculation
      const mockRoom = {
        name: "W1N1",
        controller: { my: true, level: 8 }
      } as unknown as Room;

      // @ts-ignore
      global.Game.rooms["W1N1"] = mockRoom;

      getOvermindStub.returns(overmind);

      const score = (nukeManager as any).scoreNukeCandidate("W2N2");

      expect(score.score).to.be.greaterThan(0);
      expect(score.reasons).to.include("Owned room");
      expect(score.reasons.some((r: string) => r.includes("towers"))).to.be.true;
    });

    it("should apply distance penalty", () => {
      const overmind = createDefaultOvermindMemory();
      overmind.roomIntel["W10N10"] = {
        name: "W10N10",
        lastSeen: Game.time,
        sources: 2,
        controllerLevel: 5,
        owner: "enemy",
        threatLevel: 1,
        scouted: true,
        terrain: "plains",
        isHighway: false,
        isSK: false
      };

      const mockRoom = {
        name: "W1N1",
        controller: { my: true, level: 8 }
      } as unknown as Room;

      // @ts-ignore
      global.Game.rooms["W1N1"] = mockRoom;

      // Mock larger distance
      // @ts-ignore
      global.Game.map.getRoomLinearDistance = (from: string, to: string) => {
        if (to === "W10N10") return 15;
        return 5;
      };

      getOvermindStub.returns(overmind);

      const score = (nukeManager as any).scoreNukeCandidate("W10N10");
      expect(score.reasons.some((r: string) => r.includes("rooms away"))).to.be.true;
    });
  });

  describe("Resource Management", () => {
    it("should detect nuker resource needs", () => {
      const overmind = createDefaultOvermindMemory();
      overmind.objectives.warMode = true;

      getOvermindStub.returns(overmind);

      const mockNuker = {
        structureType: STRUCTURE_NUKER,
        store: {
          getFreeCapacity: (resource: ResourceConstant) => {
            if (resource === RESOURCE_GHODIUM) return 2000;
            if (resource === RESOURCE_ENERGY) return 100000;
            return 0;
          },
          getUsedCapacity: () => 0
        }
      };

      const mockTerminal = {
        my: true,
        store: {
          getUsedCapacity: (resource?: ResourceConstant) => {
            if (resource === RESOURCE_GHODIUM) return 500;
            return 0;
          }
        }
      };

      const mockRoom = {
        name: "W1N1",
        controller: { my: true },
        terminal: mockTerminal,
        find: (type: FindConstant, opts?: FilterOptions<any>) => {
          if (type === FIND_MY_STRUCTURES) {
            if (opts?.filter) {
              const structures = [mockNuker];
              return structures.filter(opts.filter as any);
            }
          }
          return [];
        }
      } as unknown as Room;

      // @ts-ignore
      global.Game.rooms["W1N1"] = mockRoom;

      // Should identify resource needs without error
      expect(() => {
        (nukeManager as any).manageNukeResources();
      }).to.not.throw();
    });
  });

  describe("Siege Coordination", () => {
    it("should coordinate nuke launch with siege squad arrival", () => {
      const overmind = createDefaultOvermindMemory();
      overmind.objectives.warMode = true;
      overmind.nukeCandidates = [
        {
          roomName: "W2N2",
          score: 75,
          launched: false,
          launchTick: 0
        }
      ];

      getOvermindStub.returns(overmind);

      const mockSquad = {
        id: "siege_W2N2_1000",
        type: "siege" as const,
        members: ["creep1", "creep2"],
        rallyRoom: "W1N1",
        targetRooms: ["W2N2"],
        state: "moving" as const,
        createdAt: 1000
      };

      // Mock cluster with siege squad
      const mockCluster = {
        id: "cluster1",
        coreRoom: "W1N1",
        memberRooms: ["W1N1"],
        remoteRooms: [],
        forwardBases: [],
        role: "war" as const,
        aggregatedMetrics: {
          totalEnergy: 100000,
          totalMinerals: 10000,
          avgThreatLevel: 1,
          totalCreepCount: 50
        },
        squads: [mockSquad],
        defenseRequests: [],
        transferRequests: [],
        lastUpdate: Game.time
      };

      getClustersStub.returns({ cluster1: mockCluster });

      // Mock creep in squad
      // @ts-ignore
      global.Game.creeps["creep1"] = {
        name: "creep1",
        room: { name: "W1N2" } as any
      } as Creep;

      const swarm = createDefaultSwarmState();
      getSwarmStateStub.withArgs("W2N2").returns(swarm);

      // Should process without error
      expect(() => {
        (nukeManager as any).coordinateWithSieges();
      }).to.not.throw();
    });
  });

  describe("Squad ETA Estimation", () => {
    it("should estimate ETA based on squad member positions", () => {
      const mockSquad = {
        id: "squad1",
        type: "siege" as const,
        members: ["creep1"],
        rallyRoom: "W1N1",
        targetRooms: ["W3N3"],
        state: "moving" as const,
        createdAt: 1000
      };

      // @ts-ignore
      global.Game.creeps["creep1"] = {
        name: "creep1",
        room: { name: "W2N2" } as any
      } as Creep;

      // @ts-ignore
      global.Game.map.getRoomLinearDistance = (from: string, to: string) => 2;

      const eta = (nukeManager as any).estimateSquadEta(mockSquad, "W3N3");

      expect(eta).to.be.greaterThan(0);
      expect(eta).to.equal(100); // 2 rooms * 50 ticks
    });

    it("should estimate from rally room when squad not spawned", () => {
      const mockSquad = {
        id: "squad1",
        type: "siege" as const,
        members: [],
        rallyRoom: "W1N1",
        targetRooms: ["W4N4"],
        state: "gathering" as const,
        createdAt: 1000
      };

      // @ts-ignore
      global.Game.map.getRoomLinearDistance = (from: string, to: string) => 3;

      const eta = (nukeManager as any).estimateSquadEta(mockSquad, "W4N4");

      expect(eta).to.equal(150); // 3 rooms * 50 ticks
    });
  });
});

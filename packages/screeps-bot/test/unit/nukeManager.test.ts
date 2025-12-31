import { expect } from "chai";
import { NukeManager } from "../../src/empire/nukeManager";
import { createDefaultSwarmState, createDefaultEmpireMemory } from "../../src/memory/schemas";
import { Game, Memory } from "./mock";
import * as sinon from "sinon";

describe("Nuke Manager", () => {
  let nukeManager: NukeManager;
  let getEmpireStub: sinon.SinonStub;
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
    getOvermindStub = sinon.stub(memoryManager, "getEmpire").returns(createDefaultEmpireMemory());
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
      const empire = createDefaultEmpireMemory();
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
      const empire = createDefaultEmpireMemory();
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
      const empire = createDefaultEmpireMemory();
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
            const structures = [mockNuker];
            if (opts?.filter) {
              return structures.filter(opts.filter as any);
            }
            return structures;
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
      const empire = createDefaultEmpireMemory();
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

  describe("Nuke Impact Prediction", () => {
    it("should predict damage for structures in blast radius", () => {
      const empire = createDefaultEmpireMemory();
      getOvermindStub.returns(overmind);

      const mockStructure = {
        structureType: STRUCTURE_TOWER,
        hits: 3000000,
        hitsMax: 3000000,
        pos: { x: 25, y: 25, roomName: "W2N2" }
      };

      const mockRoom = {
        name: "W2N2",
        lookForAtArea: () => [{ structure: mockStructure }]
      } as unknown as Room;

      // @ts-ignore
      global.Game.rooms["W2N2"] = mockRoom;

      const targetPos = { x: 25, y: 25, roomName: "W2N2" } as RoomPosition;
      const prediction = (nukeManager as any).predictNukeImpact("W2N2", targetPos);

      expect(prediction.estimatedDamage).to.be.greaterThan(0);
      expect(prediction.estimatedValue).to.be.greaterThan(0);
      expect(prediction.threatenedStructures).to.be.an("array");
    });

    it("should estimate damage when room is not visible", () => {
      const empire = createDefaultEmpireMemory();
      overmind.roomIntel["W5N5"] = {
        name: "W5N5",
        lastSeen: Game.time - 1000,
        sources: 2,
        controllerLevel: 6,
        owner: "enemy",
        threatLevel: 2,
        scouted: true,
        terrain: "mixed",
        isHighway: false,
        isSK: false,
        towerCount: 2,
        spawnCount: 1
      };

      getOvermindStub.returns(overmind);

      const targetPos = { x: 25, y: 25, roomName: "W5N5" } as RoomPosition;
      const prediction = (nukeManager as any).predictNukeImpact("W5N5", targetPos);

      expect(prediction.estimatedDamage).to.be.greaterThan(0);
      expect(prediction.estimatedValue).to.be.greaterThan(0);
    });
  });

  describe("ROI Calculation", () => {
    it("should calculate positive ROI for valuable targets", () => {
      const empire = createDefaultEmpireMemory();
      getOvermindStub.returns(overmind);

      const mockStructure = {
        structureType: STRUCTURE_SPAWN,
        hits: 5000,
        hitsMax: 5000,
        pos: { x: 25, y: 25, roomName: "W2N2" }
      };

      const mockRoom = {
        name: "W2N2",
        lookForAtArea: () => [{ structure: mockStructure }]
      } as unknown as Room;

      // @ts-ignore
      global.Game.rooms["W2N2"] = mockRoom;

      const targetPos = { x: 25, y: 25, roomName: "W2N2" } as RoomPosition;
      const roi = (nukeManager as any).calculateNukeROI("W2N2", targetPos);

      expect(roi).to.be.a("number");
      expect(roi).to.be.greaterThan(0);
    });
  });

  describe("Counter-Nuke Strategies", () => {
    it("should identify counter-nuke opportunity", () => {
      const empire = createDefaultEmpireMemory();
      overmind.incomingNukes = [
        {
          roomName: "W1N1",
          landingPos: { x: 25, y: 25 },
          impactTick: 51000,
          timeToLand: 40000,
          detectedAt: 11000,
          evacuationTriggered: false,
          sourceRoom: "W2N2"
        }
      ];
      overmind.roomIntel["W2N2"] = {
        name: "W2N2",
        lastSeen: Game.time,
        sources: 2,
        controllerLevel: 8, // RCL 8 = has nuker
        owner: "enemy",
        threatLevel: 3,
        scouted: true,
        terrain: "mixed",
        isHighway: false,
        isSK: false
      };

      const swarm = createDefaultSwarmState();
      swarm.pheromones.war = 70; // Above threshold

      getOvermindStub.returns(overmind);
      getSwarmStateStub.withArgs("W1N1").returns(swarm);

      // Mock available resources
      const mockStorage = {
        store: {
          getUsedCapacity: (resource: ResourceConstant) => {
            if (resource === RESOURCE_ENERGY) return 1000000;
            return 0;
          }
        }
      };

      const mockTerminal = {
        store: {
          getUsedCapacity: (resource: ResourceConstant) => {
            if (resource === RESOURCE_ENERGY) return 500000;
            if (resource === RESOURCE_GHODIUM) return 20000;
            return 0;
          }
        }
      };

      const mockRoom = {
        name: "W1N1",
        controller: { my: true },
        storage: mockStorage,
        terminal: mockTerminal
      } as unknown as Room;

      // @ts-ignore
      global.Game.rooms["W1N1"] = mockRoom;

      // Process counter-nukes
      (nukeManager as any).processCounterNukeStrategies();

      // Should add enemy to war targets
      expect(overmind.warTargets).to.include("W2N2");
    });
  });

  describe("Salvo Coordination", () => {
    it("should coordinate multiple nukes on same target", () => {
      const empire = createDefaultEmpireMemory();
      overmind.nukesInFlight = [
        {
          id: "nuke1",
          sourceRoom: "W1N1",
          targetRoom: "W3N3",
          targetPos: { x: 25, y: 25 },
          launchTick: 1000,
          impactTick: 51000
        },
        {
          id: "nuke2",
          sourceRoom: "W1N2",
          targetRoom: "W3N3",
          targetPos: { x: 25, y: 25 },
          launchTick: 1005,
          impactTick: 51005
        }
      ];

      getOvermindStub.returns(overmind);

      (nukeManager as any).coordinateNukeSalvos();

      // Both nukes should have same salvo ID
      expect(overmind.nukesInFlight[0].salvoId).to.equal(overmind.nukesInFlight[1].salvoId);
      expect(overmind.nukesInFlight[0].salvoId).to.be.a("string");
    });

    it("should detect desynchronized nukes", () => {
      const empire = createDefaultEmpireMemory();
      overmind.nukesInFlight = [
        {
          id: "nuke1",
          sourceRoom: "W1N1",
          targetRoom: "W3N3",
          targetPos: { x: 25, y: 25 },
          launchTick: 1000,
          impactTick: 51000
        },
        {
          id: "nuke2",
          sourceRoom: "W1N2",
          targetRoom: "W3N3",
          targetPos: { x: 25, y: 25 },
          launchTick: 1100,
          impactTick: 51100 // 100 ticks difference, > sync window
        }
      ];

      getOvermindStub.returns(overmind);

      (nukeManager as any).coordinateNukeSalvos();

      // Nukes should not have matching salvo IDs (or undefined)
      const salvo1 = overmind.nukesInFlight[0].salvoId;
      const salvo2 = overmind.nukesInFlight[1].salvoId;
      
      if (salvo1 && salvo2) {
        expect(salvo1).to.not.equal(salvo2);
      }
    });
  });

  describe("Cleanup Operations", () => {
    it("should remove impacted nukes from tracking", () => {
      const empire = createDefaultEmpireMemory();
      overmind.nukesInFlight = [
        {
          id: "nuke1",
          sourceRoom: "W1N1",
          targetRoom: "W2N2",
          targetPos: { x: 25, y: 25 },
          launchTick: 1000,
          impactTick: 5000 // Already impacted
        },
        {
          id: "nuke2",
          sourceRoom: "W1N1",
          targetRoom: "W3N3",
          targetPos: { x: 25, y: 25 },
          launchTick: 5000,
          impactTick: 55000 // Still in flight
        }
      ];

      // @ts-ignore
      global.Game.time = 10000;

      getOvermindStub.returns(overmind);

      (nukeManager as any).cleanupNukeTracking();

      expect(overmind.nukesInFlight).to.have.lengthOf(1);
      expect(overmind.nukesInFlight[0].id).to.equal("nuke2");
    });

    it("should remove old incoming nuke alerts", () => {
      const empire = createDefaultEmpireMemory();
      overmind.incomingNukes = [
        {
          roomName: "W1N1",
          landingPos: { x: 25, y: 25 },
          impactTick: 5000,
          timeToLand: 0,
          detectedAt: 1000,
          evacuationTriggered: false
        },
        {
          roomName: "W1N2",
          landingPos: { x: 25, y: 25 },
          impactTick: 55000,
          timeToLand: 45000,
          detectedAt: 10000,
          evacuationTriggered: false
        }
      ];

      // @ts-ignore
      global.Game.time = 10000;

      getOvermindStub.returns(overmind);

      (nukeManager as any).cleanupNukeTracking();

      expect(overmind.incomingNukes).to.have.lengthOf(1);
      expect(overmind.incomingNukes[0].roomName).to.equal("W1N2");
    });
  });

  describe("Economics Tracking", () => {
    it("should initialize economics tracking", () => {
      const empire = createDefaultEmpireMemory();
      delete overmind.nukeEconomics;

      getOvermindStub.returns(overmind);

      (nukeManager as any).initializeNukeTracking();

      expect(overmind.nukeEconomics).to.exist;
      expect(overmind.nukeEconomics.nukesLaunched).to.equal(0);
      expect(overmind.nukeEconomics.totalEnergyCost).to.equal(0);
      expect(overmind.nukeEconomics.totalGhodiumCost).to.equal(0);
    });

    it("should update economics tracking", () => {
      const empire = createDefaultEmpireMemory();
      overmind.nukeEconomics = {
        nukesLaunched: 2,
        totalEnergyCost: 600000,
        totalGhodiumCost: 10000,
        totalDamageDealt: 50000000,
        totalValueDestroyed: 2000000
      };

      getOvermindStub.returns(overmind);

      (nukeManager as any).updateNukeEconomics();

      expect(overmind.nukeEconomics.lastROI).to.exist;
      expect(overmind.nukeEconomics.lastROI).to.be.greaterThan(0);
    });
  });
});

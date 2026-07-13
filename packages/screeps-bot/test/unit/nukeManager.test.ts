import { expect } from "chai";
import { NukeManager } from "../../src/empire/nukeManager";
import { createDefaultSwarmState, createDefaultEmpireMemory } from "../../src/memory/schemas";
import { memoryManager } from "../../src/memory/manager";
import {
  calculateNukeROI,
  canAffordNuke,
  cleanupNukeTracking,
  coordinateNukeSalvos,
  coordinateWithSieges,
  detectIncomingNukes,
  detectIncomingNukesInRoom,
  getOwnedRoomNukes,
  estimateSquadEta,
  evaluateNukeCandidates,
  initializeNukeTracking,
  launchNukes,
  manageNukeResources,
  predictNukeImpact,
  processCounterNukeStrategies,
  scoreNukeCandidate,
  updateNukeEconomics,
  DEFAULT_NUKE_CONFIG
} from "@ralphschuler/screeps-empire";
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
    getEmpireStub = sinon.stub(memoryManager, "getEmpire").returns(createDefaultEmpireMemory());
    getSwarmStateStub = sinon.stub(memoryManager, "getSwarmState");
    getClustersStub = sinon.stub(memoryManager, "getClusters").returns({});
  });

  afterEach(() => {
    // Restore all stubs
    sinon.restore();
  });

  describe("Configuration", () => {
    it("uses framework nuke defaults unless overridden", () => {
      expect(nukeManager.getConfig()).to.deep.equal(DEFAULT_NUKE_CONFIG);

      const customManager = new NukeManager({ minScore: 99 });

      expect(customManager.getConfig()).to.deep.equal({
        ...DEFAULT_NUKE_CONFIG,
        minScore: 99
      });
    });
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
        lookForAtArea: () => [],
        find: (type: FindConstant) => {
          if (type === FIND_NUKES) return [mockNuke];
          return [];
        }
      } as unknown as Room;

      // @ts-ignore
      global.Game.rooms["W1N1"] = mockRoom;

      // Setup memory manager to return our swarm
      getSwarmStateStub.withArgs("W1N1").returns(swarm);

      detectIncomingNukes(memoryManager.getEmpire() as any, getSwarmStateStub as any);

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

      detectIncomingNukes(memoryManager.getEmpire() as any, getSwarmStateStub as any);

      expect(swarm.nukeDetected).to.be.false;
    });

    it("should reuse one room nuke scan for repeated same-tick observation", () => {
      let findCalls = 0;
      const mockRoom = {
        name: "W1N1",
        controller: { my: true },
        find: () => {
          findCalls += 1;
          return [];
        }
      } as unknown as Room;

      getOwnedRoomNukes(mockRoom);
      getOwnedRoomNukes(mockRoom);

      expect(findCalls).to.equal(1);
    });

    it("should skip empire re-observation after room defense publishes the same tick", () => {
      let findCalls = 0;
      const mockRoom = {
        name: "W1N1",
        controller: { my: true },
        find: () => {
          findCalls += 1;
          return [];
        }
      } as unknown as Room;
      const swarm = createDefaultSwarmState();
      const empire = memoryManager.getEmpire() as any;
      getSwarmStateStub.withArgs("W1N1").returns(swarm);

      detectIncomingNukesInRoom(empire, mockRoom, swarm, []);
      detectIncomingNukes(empire, getSwarmStateStub as any);

      expect(findCalls).to.equal(0);
    });

    it("should detect incoming nukes when no owned nuker is available", () => {
      const swarm = createDefaultSwarmState();
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
          if (type === FIND_MY_STRUCTURES) return [];
          return [];
        },
        lookForAtArea: () => []
      } as unknown as Room;

      // @ts-ignore
      global.Game.rooms["W1N1"] = mockRoom;
      getSwarmStateStub.withArgs("W1N1").returns(swarm);

      nukeManager.run();

      expect(swarm.nukeDetected).to.be.true;
      expect(memoryManager.getEmpire().incomingNukes).to.have.length(1);
      expect(memoryManager.getEmpire().nukeCandidates).to.deep.equal([]);
    });

    it("should preserve separate alerts for same-tile stacked nukes", () => {
      const swarm = createDefaultSwarmState();
      const landingPos = { x: 25, y: 25, roomName: "W1N1" };
      const nukes = [
        { id: "nuke-a", timeToLand: 1000, launchRoomName: "W2N2", pos: landingPos },
        { id: "nuke-b", timeToLand: 1000, launchRoomName: "W3N3", pos: landingPos }
      ];
      let structureLookups = 0;
      const mockRoom = {
        name: "W1N1",
        controller: { my: true },
        find: (type: FindConstant) => type === FIND_NUKES ? nukes : [],
        lookForAtArea: () => {
          structureLookups += 1;
          return [];
        }
      } as unknown as Room;

      // @ts-ignore
      global.Game.rooms["W1N1"] = mockRoom;
      getSwarmStateStub.withArgs("W1N1").returns(swarm);

      detectIncomingNukes(memoryManager.getEmpire() as any, getSwarmStateStub as any);

      const alerts = memoryManager.getEmpire().incomingNukes ?? [];
      expect(alerts).to.have.length(2);
      expect(structureLookups).to.equal(1);
      expect(alerts.map(alert => alert.nukeId).sort()).to.deep.equal(["nuke-a", "nuke-b"]);
      expect(alerts.map(alert => alert.landingPos)).to.deep.equal([
        { x: landingPos.x, y: landingPos.y },
        { x: landingPos.x, y: landingPos.y }
      ]);
    });

    it("should refresh threatened structures after the bounded snapshot interval", () => {
      const swarm = createDefaultSwarmState();
      const nuke = {
        id: "nuke-refresh",
        timeToLand: 1000,
        launchRoomName: "W2N2",
        pos: { x: 25, y: 25, roomName: "W1N1" }
      };
      let structures: Array<{ structure: Structure }> = [];
      let structureLookups = 0;
      const mockRoom = {
        name: "W1N1",
        controller: { my: true },
        find: (type: FindConstant) => type === FIND_NUKES ? [nuke] : [],
        lookForAtArea: () => {
          structureLookups += 1;
          return structures;
        }
      } as unknown as Room;

      // @ts-ignore
      global.Game.rooms["W1N1"] = mockRoom;
      getSwarmStateStub.withArgs("W1N1").returns(swarm);

      detectIncomingNukes(memoryManager.getEmpire() as any, getSwarmStateStub as any);
      expect(memoryManager.getEmpire().incomingNukes?.[0]?.threatenedStructures).to.deep.equal([]);
      expect(structureLookups).to.equal(1);

      structures = [{
        structure: {
          structureType: STRUCTURE_SPAWN,
          hits: 100,
          pos: { x: 25, y: 25 }
        } as unknown as Structure
      }];
      // A normal same-tick/nearby observation does not rescan the room.
      (global.Game as any).time += 9;
      detectIncomingNukes(memoryManager.getEmpire() as any, getSwarmStateStub as any);
      expect(memoryManager.getEmpire().incomingNukes?.[0]?.threatenedStructures).to.deep.equal([]);
      expect(structureLookups).to.equal(1);

      (global.Game as any).time += 1;
      detectIncomingNukes(memoryManager.getEmpire() as any, getSwarmStateStub as any);
      expect(memoryManager.getEmpire().incomingNukes?.[0]?.threatenedStructures)
        .to.deep.equal([`${STRUCTURE_SPAWN}-25,25`]);
      expect(structureLookups).to.equal(2);
    });

    it("should refresh legacy alerts without a snapshot timestamp", () => {
      const swarm = createDefaultSwarmState();
      const nuke = {
        id: "legacy-alert-nuke",
        timeToLand: 1000,
        launchRoomName: "W2N2",
        pos: { x: 25, y: 25, roomName: "W1N1" }
      };
      const mockRoom = {
        name: "W1N1",
        controller: { my: true },
        find: (type: FindConstant) => type === FIND_NUKES ? [nuke] : [],
        lookForAtArea: () => [{
          structure: {
            structureType: STRUCTURE_SPAWN,
            hits: 100,
            pos: { x: 25, y: 25 }
          }
        }]
      } as unknown as Room;
      const empire = memoryManager.getEmpire() as any;
      empire.incomingNukes = [{
        nukeId: nuke.id,
        roomName: "W1N1",
        landingPos: { x: 25, y: 25 },
        impactTick: Game.time + nuke.timeToLand,
        timeToLand: nuke.timeToLand,
        detectedAt: Game.time - 100,
        threatenedStructures: [],
        evacuationTriggered: false,
        sourceRoom: nuke.launchRoomName
      }];

      // @ts-ignore
      global.Game.rooms["W1N1"] = mockRoom;
      getSwarmStateStub.withArgs("W1N1").returns(swarm);

      detectIncomingNukes(empire, getSwarmStateStub as any);

      expect(empire.incomingNukes[0].threatenedStructures)
        .to.deep.equal([`${STRUCTURE_SPAWN}-25,25`]);
      expect(empire.incomingNukes[0].threatenedStructuresUpdatedAt).to.equal((global.Game as any).time);
    });
  });

  describe("Nuke Candidate Scoring", () => {
    it("should score rooms based on threat level and structures", () => {
      const empire = createDefaultEmpireMemory();
      empire.objectives.warMode = true;
      empire.warTargets = ["W2N2"];
      empire.knownRooms["W2N2"] = {
        roomName: "W2N2",
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

      getEmpireStub.returns(empire);

      const score = scoreNukeCandidate("W2N2", empire as any, nukeManager.getConfig(), getSwarmStateStub as any);

      expect(score.score).to.be.greaterThan(0);
      expect(score.reasons).to.include("Owned room");
      expect(score.reasons.some((r: string) => r.includes("towers"))).to.be.true;
    });

    it("should apply distance penalty", () => {
      const empire = createDefaultEmpireMemory();
      empire.knownRooms["W10N10"] = {
        roomName: "W10N10",
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

      getEmpireStub.returns(empire);

      const score = scoreNukeCandidate("W10N10", empire as any, nukeManager.getConfig(), getSwarmStateStub as any);
      expect(score.reasons.some((r: string) => r.includes("rooms away"))).to.be.true;
    });

    it("skips runtime configured allies when scoring and evaluating nuke candidates", () => {
      const empire = createDefaultEmpireMemory();
      empire.objectives.warMode = true;
      empire.warTargets = ["W2N2"];
      (empire as any).diplomacy = { allies: ["FriendlyNeighbor"] };
      empire.knownRooms["W2N2"] = {
        roomName: "W2N2",
        lastSeen: Game.time,
        sources: 2,
        controllerLevel: 8,
        owner: "FriendlyNeighbor",
        threatLevel: 3,
        scouted: true,
        terrain: "mixed",
        isHighway: false,
        isSK: false,
        towerCount: 6,
        spawnCount: 3
      };

      const score = scoreNukeCandidate("W2N2", empire as any, { ...nukeManager.getConfig(), minScore: 0 }, getSwarmStateStub as any);
      expect(score).to.deep.equal({ roomName: "W2N2", score: 0, reasons: ["Allied room"] });

      evaluateNukeCandidates(empire as any, { ...nukeManager.getConfig(), minScore: 0 }, getSwarmStateStub as any);
      expect(empire.nukeCandidates).to.deep.equal([]);
    });
  });

  describe("Resource Management", () => {
    it("should detect nuker resource needs", () => {
      const empire = createDefaultEmpireMemory();
      empire.objectives.warMode = true;

      getEmpireStub.returns(empire);

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
        manageNukeResources(empire as any, nukeManager.getConfig(), new Set(), () => undefined);
      }).to.not.throw();
    });
  });

  describe("Siege Coordination", () => {
    it("should coordinate nuke launch with siege squad arrival", () => {
      const empire = createDefaultEmpireMemory();
      empire.objectives.warMode = true;
      empire.nukeCandidates = [
        {
          roomName: "W2N2",
          score: 75,
          launched: false,
          launchTick: 0
        }
      ];

      getEmpireStub.returns(empire);

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
        coordinateWithSieges(empire as any, nukeManager.getConfig(), getClustersStub as any, getSwarmStateStub as any);
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

      const eta = estimateSquadEta(mockSquad as any, "W3N3");

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

      const eta = estimateSquadEta(mockSquad as any, "W4N4");

      expect(eta).to.equal(150); // 3 rooms * 50 ticks
    });
  });

  describe("Nuke Impact Prediction", () => {
    it("should predict damage for structures in blast radius", () => {
      const empire = createDefaultEmpireMemory();
      getEmpireStub.returns(empire);

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
      const prediction = predictNukeImpact("W2N2", targetPos, empire as any);

      expect(prediction.estimatedDamage).to.be.greaterThan(0);
      expect(prediction.estimatedValue).to.be.greaterThan(0);
      expect(prediction.threatenedStructures).to.be.an("array");
    });

    it("should estimate damage when room is not visible", () => {
      const empire = createDefaultEmpireMemory();
      empire.knownRooms["W5N5"] = {
        roomName: "W5N5",
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

      getEmpireStub.returns(empire);

      const targetPos = { x: 25, y: 25, roomName: "W5N5" } as RoomPosition;
      const prediction = predictNukeImpact("W5N5", targetPos, empire as any);

      expect(prediction.estimatedDamage).to.be.greaterThan(0);
      expect(prediction.estimatedValue).to.be.greaterThan(0);
    });
  });

  describe("ROI Calculation", () => {
    it("should calculate positive ROI for valuable targets", () => {
      const empire = createDefaultEmpireMemory();
      getEmpireStub.returns(empire);

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
      const roi = calculateNukeROI("W2N2", targetPos, empire as any);

      expect(roi).to.be.a("number");
      expect(roi).to.be.greaterThan(0);
    });
  });

  describe("Counter-Nuke Strategies", () => {
    it("should identify counter-nuke opportunity", () => {
      const empire = createDefaultEmpireMemory();
      empire.incomingNukes = [
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
      empire.knownRooms["W2N2"] = {
        roomName: "W2N2",
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

      getEmpireStub.returns(empire);
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
      processCounterNukeStrategies(empire as any, nukeManager.getConfig(), getSwarmStateStub as any, canAffordNuke);

      // Should add enemy to war targets
      expect(empire.warTargets).to.include("W2N2");
    });

    it("does not add runtime configured ally nuke sources as counter-nuke targets", () => {
      const empire = createDefaultEmpireMemory();
      (empire as any).diplomacy = { allies: ["FriendlyNeighbor"] };
      empire.incomingNukes = [
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
      empire.knownRooms["W2N2"] = {
        roomName: "W2N2",
        lastSeen: Game.time,
        sources: 2,
        controllerLevel: 8,
        owner: "FriendlyNeighbor",
        threatLevel: 3,
        scouted: true,
        terrain: "mixed",
        isHighway: false,
        isSK: false
      };
      const swarm = createDefaultSwarmState();
      swarm.pheromones.war = 100;
      getSwarmStateStub.withArgs("W1N1").returns(swarm);

      processCounterNukeStrategies(empire as any, nukeManager.getConfig(), getSwarmStateStub as any, () => true);

      expect(empire.warTargets).to.not.include("W2N2");
    });
  });

  describe("Nuke Launch Safety", () => {
    it("refuses to launch stale nuke candidates against runtime configured allies", () => {
      const empire = createDefaultEmpireMemory();
      empire.objectives.warMode = true;
      (empire as any).diplomacy = { allies: ["FriendlyNeighbor"] };
      empire.nukeCandidates = [{ roomName: "W2N2", score: 100, launched: false, launchTick: 0 }];
      empire.knownRooms["W2N2"] = {
        roomName: "W2N2",
        lastSeen: Game.time,
        sources: 2,
        controllerLevel: 8,
        owner: "FriendlyNeighbor",
        threatLevel: 3,
        scouted: true,
        terrain: "mixed",
        isHighway: false,
        isSK: false,
        towerCount: 6,
        spawnCount: 3
      };

      const launchNuke = sinon.stub().returns(OK);
      const mockNuker = {
        structureType: STRUCTURE_NUKER,
        room: { name: "W1N1" },
        store: {
          getUsedCapacity: (resource: ResourceConstant) => {
            if (resource === RESOURCE_ENERGY) return 300000;
            if (resource === RESOURCE_GHODIUM) return 5000;
            return 0;
          }
        },
        launchNuke
      };
      const mockRoom = {
        name: "W1N1",
        controller: { my: true },
        find: (type: FindConstant, opts?: FilterOptions<Structure>) => {
          if (type !== FIND_MY_STRUCTURES) return [];
          const structures = [mockNuker];
          return opts?.filter ? structures.filter(opts.filter as any) : structures;
        }
      } as unknown as Room;
      // @ts-ignore
      global.Game.rooms["W1N1"] = mockRoom;

      launchNukes(empire as any, { ...nukeManager.getConfig(), roiThreshold: 0 });

      expect(launchNuke.called).to.equal(false);
      expect(empire.nukeCandidates[0].launched).to.equal(false);
    });

    for (const { label, findConstant, alliedEntity } of [
      {
        label: "creeps",
        findConstant: FIND_CREEPS,
        alliedEntity: { owner: { username: "FriendlyNeighbor" }, pos: { x: 10, y: 10, roomName: "W2N2" } }
      },
      {
        label: "power creeps",
        findConstant: FIND_POWER_CREEPS,
        alliedEntity: { owner: { username: "FriendlyNeighbor" }, pos: { x: 11, y: 11, roomName: "W2N2" } }
      },
      {
        label: "structures",
        findConstant: FIND_STRUCTURES,
        alliedEntity: {
          owner: { username: "FriendlyNeighbor" },
          pos: { x: 25, y: 25, roomName: "W2N2" },
          hits: 5000,
          structureType: STRUCTURE_SPAWN
        }
      },
      {
        label: "construction sites",
        findConstant: FIND_CONSTRUCTION_SITES,
        alliedEntity: {
          owner: { username: "FriendlyNeighbor" },
          pos: { x: 12, y: 12, roomName: "W2N2" },
          structureType: STRUCTURE_EXTENSION
        }
      }
    ] as const) {
      it(`refuses to launch when visible target room contains runtime configured ally ${label}`, () => {
        const empire = createDefaultEmpireMemory();
        empire.objectives.warMode = true;
        (empire as any).diplomacy = { allies: ["FriendlyNeighbor"] };
        empire.nukeCandidates = [{ roomName: "W2N2", score: 100, launched: false, launchTick: 0 }];
        empire.knownRooms["W2N2"] = {
          roomName: "W2N2",
          lastSeen: Game.time - 1000,
          sources: 2,
          controllerLevel: 8,
          owner: "OldEnemy",
          threatLevel: 3,
          scouted: true,
          terrain: "mixed",
          isHighway: false,
          isSK: false,
          towerCount: 6,
          spawnCount: 3
        };

        const launchNuke = sinon.stub().returns(OK);
        const mockNuker = {
          structureType: STRUCTURE_NUKER,
          room: { name: "W1N1" },
          store: {
            getUsedCapacity: (resource: ResourceConstant) => {
              if (resource === RESOURCE_ENERGY) return 300000;
              if (resource === RESOURCE_GHODIUM) return 5000;
              return 0;
            }
          },
          launchNuke
        };
        const launchRoom = {
          name: "W1N1",
          controller: { my: true },
          find: (type: FindConstant, opts?: FilterOptions<Structure>) => {
            if (type !== FIND_MY_STRUCTURES) return [];
            const structures = [mockNuker];
            return opts?.filter ? structures.filter(opts.filter as any) : structures;
          }
        } as unknown as Room;
        const targetRoom = {
          name: "W2N2",
          controller: { owner: { username: "OldEnemy" } },
          find: (type: FindConstant) => {
            if (type === findConstant) return [alliedEntity];
            return [];
          },
          lookForAtArea: () => findConstant === FIND_STRUCTURES ? [{ structure: alliedEntity }] : []
        } as unknown as Room;
        // @ts-ignore
        global.Game.rooms["W1N1"] = launchRoom;
        // @ts-ignore
        global.Game.rooms["W2N2"] = targetRoom;

        launchNukes(empire as any, { ...nukeManager.getConfig(), roiThreshold: 0 });

        expect(launchNuke.called).to.equal(false);
        expect(empire.nukeCandidates[0].launched).to.equal(false);
      });
    }

    it("refuses to launch when visible controller ownership shows a runtime configured ally", () => {
      const empire = createDefaultEmpireMemory();
      empire.objectives.warMode = true;
      (empire as any).diplomacy = { allies: ["FriendlyNeighbor"] };
      empire.nukeCandidates = [{ roomName: "W2N2", score: 100, launched: false, launchTick: 0 }];
      empire.knownRooms["W2N2"] = {
        roomName: "W2N2",
        lastSeen: Game.time - 1000,
        sources: 2,
        controllerLevel: 8,
        owner: "OldEnemy",
        threatLevel: 3,
        scouted: true,
        terrain: "mixed",
        isHighway: false,
        isSK: false,
        towerCount: 6,
        spawnCount: 3
      };

      const launchNuke = sinon.stub().returns(OK);
      const mockNuker = {
        structureType: STRUCTURE_NUKER,
        room: { name: "W1N1" },
        store: {
          getUsedCapacity: (resource: ResourceConstant) => {
            if (resource === RESOURCE_ENERGY) return 300000;
            if (resource === RESOURCE_GHODIUM) return 5000;
            return 0;
          }
        },
        launchNuke
      };
      const launchRoom = {
        name: "W1N1",
        controller: { my: true },
        find: (type: FindConstant, opts?: FilterOptions<Structure>) => {
          if (type !== FIND_MY_STRUCTURES) return [];
          const structures = [mockNuker];
          return opts?.filter ? structures.filter(opts.filter as any) : structures;
        }
      } as unknown as Room;
      const targetRoom = {
        name: "W2N2",
        controller: { owner: { username: "FriendlyNeighbor" } }
      } as unknown as Room;
      // @ts-ignore
      global.Game.rooms["W1N1"] = launchRoom;
      // @ts-ignore
      global.Game.rooms["W2N2"] = targetRoom;

      launchNukes(empire as any, { ...nukeManager.getConfig(), roiThreshold: 0 });

      expect(launchNuke.called).to.equal(false);
      expect(empire.nukeCandidates[0].launched).to.equal(false);
    });
  });

  describe("Siege Coordination Safety", () => {
    it("does not create siege intent for a permanent ally after nuke tracking becomes stale", () => {
      const empire = createDefaultEmpireMemory();
      empire.objectives.warMode = true;
      empire.nukesInFlight = [{
        id: "stale-ally-nuke",
        sourceRoom: "W1N1",
        targetRoom: "W2N2",
        targetPos: { x: 25, y: 25 },
        launchTick: 9500,
        impactTick: 10500,
        siegeSquadId: "stale-squad"
      }];
      empire.knownRooms.W2N2 = {
        roomName: "W2N2",
        lastSeen: Game.time,
        controllerLevel: 8,
        owner: "TooAngel",
        threatLevel: 3
      };
      const swarm = createDefaultSwarmState();
      const initialSiege = swarm.pheromones.siege;
      const initialWar = swarm.pheromones.war;
      getSwarmStateStub.withArgs("W2N2").returns(swarm);
      const staleSquad = {
        id: "stale-squad",
        type: "siege",
        members: [],
        rallyRoom: "W1N1",
        targetRooms: ["W2N2"],
        state: "moving",
        createdAt: Game.time - 100
      };
      const clusters = { cluster: { id: "cluster", coreRoom: "W1N1", squads: [staleSquad] } };

      coordinateWithSieges(
        empire as any,
        nukeManager.getConfig(),
        () => clusters as any,
        getSwarmStateStub as any
      );

      expect(clusters.cluster.squads).to.have.lengthOf(1);
      expect(staleSquad.state).to.equal("dissolving");
      expect(swarm.pheromones.siege).to.equal(initialSiege);
      expect(swarm.pheromones.war).to.equal(initialWar);
      expect(empire.nukesInFlight[0].siegeSquadId).to.equal(undefined);
    });

    it("does not link an existing siege squad to a configured ally", () => {
      const empire = createDefaultEmpireMemory();
      empire.objectives.warMode = true;
      (empire as any).diplomacy = { allies: ["FriendlyNeighbor"] };
      empire.nukesInFlight = [{
        id: "stale-configured-ally-nuke",
        sourceRoom: "W1N1",
        targetRoom: "W2N2",
        targetPos: { x: 25, y: 25 },
        launchTick: 9500,
        impactTick: 10500
      }];
      empire.knownRooms.W2N2 = {
        roomName: "W2N2",
        lastSeen: Game.time,
        controllerLevel: 8,
        owner: "FriendlyNeighbor",
        threatLevel: 3
      };
      const squad = {
        id: "existing-siege",
        type: "siege",
        members: [],
        rallyRoom: "W1N1",
        targetRooms: ["W2N2"],
        state: "moving",
        createdAt: Game.time - 100
      };
      const clusters = {
        cluster: { id: "cluster", coreRoom: "W1N1", squads: [squad] }
      };

      coordinateWithSieges(
        empire as any,
        nukeManager.getConfig(),
        () => clusters as any,
        getSwarmStateStub as any
      );

      expect(empire.nukesInFlight[0].siegeSquadId).to.equal(undefined);
    });

    it("retains siege coordination for a non-allied target", () => {
      const empire = createDefaultEmpireMemory();
      empire.objectives.warMode = true;
      empire.nukesInFlight = [{
        id: "enemy-nuke",
        sourceRoom: "W1N1",
        targetRoom: "W2N2",
        targetPos: { x: 25, y: 25 },
        launchTick: 9500,
        impactTick: 10500
      }];
      empire.knownRooms.W2N2 = {
        roomName: "W2N2",
        lastSeen: Game.time,
        controllerLevel: 8,
        owner: "Enemy",
        threatLevel: 3
      };
      const swarm = createDefaultSwarmState();
      getSwarmStateStub.withArgs("W2N2").returns(swarm);
      const clusters = { cluster: { id: "cluster", coreRoom: "W1N1" } };

      coordinateWithSieges(
        empire as any,
        nukeManager.getConfig(),
        () => clusters as any,
        getSwarmStateStub as any
      );

      expect(clusters.cluster.squads).to.have.lengthOf(1);
      expect(empire.nukesInFlight[0].siegeSquadId).to.equal("siege-nuke-W2N2-10000");
    });
  });

  describe("Salvo Coordination", () => {
    it("should coordinate multiple nukes on same target", () => {
      const empire = createDefaultEmpireMemory();
      empire.nukesInFlight = [
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

      getEmpireStub.returns(empire);

      coordinateNukeSalvos(empire as any, nukeManager.getConfig());

      // Both nukes should have same salvo ID
      expect(empire.nukesInFlight[0].salvoId).to.equal(empire.nukesInFlight[1].salvoId);
      expect(empire.nukesInFlight[0].salvoId).to.be.a("string");
    });

    it("should detect desynchronized nukes", () => {
      const empire = createDefaultEmpireMemory();
      empire.nukesInFlight = [
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

      getEmpireStub.returns(empire);

      coordinateNukeSalvos(empire as any, nukeManager.getConfig());

      // Nukes should not have matching salvo IDs (or undefined)
      const salvo1 = empire.nukesInFlight[0].salvoId;
      const salvo2 = empire.nukesInFlight[1].salvoId;

      if (salvo1 && salvo2) {
        expect(salvo1).to.not.equal(salvo2);
      }
    });
  });

  describe("Cleanup Operations", () => {
    it("should remove impacted nukes from tracking", () => {
      const empire = createDefaultEmpireMemory();
      empire.nukesInFlight = [
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

      getEmpireStub.returns(empire);

      cleanupNukeTracking(empire as any);

      expect(empire.nukesInFlight).to.have.lengthOf(1);
      expect(empire.nukesInFlight[0].id).to.equal("nuke2");
    });

    it("should remove old incoming nuke alerts", () => {
      const empire = createDefaultEmpireMemory();
      empire.incomingNukes = [
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

      getEmpireStub.returns(empire);

      cleanupNukeTracking(empire as any);

      expect(empire.incomingNukes).to.have.lengthOf(1);
      expect(empire.incomingNukes[0].roomName).to.equal("W1N2");
    });
  });

  describe("Economics Tracking", () => {
    it("should initialize economics tracking", () => {
      const empire = createDefaultEmpireMemory();
      delete empire.nukeEconomics;

      getEmpireStub.returns(empire);

      initializeNukeTracking(empire as any);

      expect(empire.nukeEconomics).to.exist;
      expect(empire.nukeEconomics.nukesLaunched).to.equal(0);
      expect(empire.nukeEconomics.totalEnergyCost).to.equal(0);
      expect(empire.nukeEconomics.totalGhodiumCost).to.equal(0);
    });

    it("should update economics tracking", () => {
      const empire = createDefaultEmpireMemory();
      empire.nukeEconomics = {
        nukesLaunched: 2,
        totalEnergyCost: 600000,
        totalGhodiumCost: 10000,
        totalDamageDealt: 50000000,
        totalValueDestroyed: 2000000
      };

      getEmpireStub.returns(empire);

      updateNukeEconomics(empire as any);

      expect(empire.nukeEconomics.lastROI).to.exist;
      expect(empire.nukeEconomics.lastROI).to.be.greaterThan(0);
    });
  });
});

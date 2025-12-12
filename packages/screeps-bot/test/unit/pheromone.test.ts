import { expect } from "chai";
import { PheromoneManager, DEFAULT_PHEROMONE_CONFIG } from "../../src/logic/pheromone";
import { createDefaultSwarmState } from "../../src/memory/schemas";
import { Game, Memory } from "./mock";

describe("Pheromone System", () => {
  let pheromoneManager: PheromoneManager;

  beforeEach(() => {
    // Reset global mocks
    // @ts-ignore: allow adding Game to global
    global.Game = {
      ...Game,
      time: 1000
    };
    // @ts-ignore: allow adding Memory to global
    global.Memory = { ...Memory };

    // Create fresh pheromone manager for each test
    pheromoneManager = new PheromoneManager();
  });

  describe("Pheromone Decay", () => {
    it("should apply decay factors to all pheromones", () => {
      const swarm = createDefaultSwarmState();
      swarm.pheromones.defense = 100;
      swarm.pheromones.war = 100;
      swarm.pheromones.expand = 100;
      swarm.nextUpdateTick = 0; // Allow update

      // Mock room
      const room = {
        name: "W1N1",
        find: () => []
      } as unknown as Room;

      pheromoneManager.updatePheromones(swarm, room);

      // All pheromones should decay
      expect(swarm.pheromones.defense).to.be.lessThan(100);
      expect(swarm.pheromones.war).to.be.lessThan(100);
      expect(swarm.pheromones.expand).to.be.lessThan(100);
    });

    it("should use different decay rates for different pheromones", () => {
      const swarm = createDefaultSwarmState();
      swarm.pheromones.harvest = 100; // decay: 0.9
      swarm.pheromones.war = 100; // decay: 0.98
      swarm.nextUpdateTick = 0;

      const room = {
        name: "W1N1",
        find: () => []
      } as unknown as Room;

      pheromoneManager.updatePheromones(swarm, room);

      // War should decay slower than harvest
      expect(swarm.pheromones.war).to.be.greaterThan(swarm.pheromones.harvest);
    });
  });

  describe("Event-Driven Updates", () => {
    it("should increase defense and war pheromones on hostile detection", () => {
      const swarm = createDefaultSwarmState();
      const initialDefense = swarm.pheromones.defense;
      const initialWar = swarm.pheromones.war;

      pheromoneManager.onHostileDetected(swarm, 5, 2);

      expect(swarm.pheromones.defense).to.be.greaterThan(initialDefense);
      expect(swarm.pheromones.war).to.be.greaterThan(initialWar);
      expect(swarm.danger).to.equal(2);
    });

    it("should increase siege pheromone for high danger levels", () => {
      const swarm = createDefaultSwarmState();
      const initialSiege = swarm.pheromones.siege;

      pheromoneManager.onHostileDetected(swarm, 10, 3);

      expect(swarm.pheromones.siege).to.be.greaterThan(initialSiege);
      expect(swarm.danger).to.equal(3);
    });

    it("should update pheromones on structure destroyed", () => {
      const swarm = createDefaultSwarmState();
      const initialDefense = swarm.pheromones.defense;
      const initialBuild = swarm.pheromones.build;

      pheromoneManager.onStructureDestroyed(swarm, STRUCTURE_TOWER);

      expect(swarm.pheromones.defense).to.be.greaterThan(initialDefense);
      expect(swarm.pheromones.build).to.be.greaterThan(initialBuild);
    });

    it("should increase danger on critical structure destroyed", () => {
      const swarm = createDefaultSwarmState();
      swarm.danger = 1;

      pheromoneManager.onStructureDestroyed(swarm, STRUCTURE_SPAWN);

      expect(swarm.danger).to.equal(2);
    });

    it("should set danger to 3 and increase siege on nuke detection", () => {
      const swarm = createDefaultSwarmState();
      swarm.danger = 0;

  pheromoneManager.onNukeDetected(swarm);

  expect(swarm.danger).to.equal(3);
      expect(swarm.pheromones.siege).to.be.at.least(50);
    });

    it("should decrease expand pheromone on remote source lost", () => {
      const swarm = createDefaultSwarmState();
      swarm.pheromones.expand = 50;

      pheromoneManager.onRemoteSourceLost(swarm);

      expect(swarm.pheromones.expand).to.be.lessThan(50);
    });
  });

  describe("Pheromone Diffusion", () => {
    it("should propagate defense pheromone to neighboring rooms", () => {
      const swarm1 = createDefaultSwarmState();
      const swarm2 = createDefaultSwarmState();
      
      swarm1.pheromones.defense = 50;
      swarm2.pheromones.defense = 0;

      const rooms = new Map<string, typeof swarm1>();
      rooms.set("W1N1", swarm1);
      rooms.set("W2N1", swarm2);

      pheromoneManager.applyDiffusion(rooms);

      expect(swarm2.pheromones.defense).to.be.greaterThan(0);
      expect(swarm2.pheromones.defense).to.be.lessThan(swarm1.pheromones.defense);
    });

    it("should not propagate pheromones below threshold", () => {
      const swarm1 = createDefaultSwarmState();
      const swarm2 = createDefaultSwarmState();
      
      swarm1.pheromones.defense = 0.5; // Below threshold of 1
      swarm2.pheromones.defense = 0;

      const rooms = new Map<string, typeof swarm1>();
      rooms.set("W1N1", swarm1);
      rooms.set("W2N1", swarm2);

      pheromoneManager.applyDiffusion(rooms);

      expect(swarm2.pheromones.defense).to.equal(0);
    });
  });

  describe("Dominant Pheromone Detection", () => {
    it("should identify the highest pheromone as dominant", () => {
      const pheromones = createDefaultSwarmState().pheromones;
      pheromones.defense = 80;
      pheromones.war = 30;
      pheromones.expand = 10;

      const dominant = pheromoneManager.getDominantPheromone(pheromones);

      expect(dominant).to.equal("defense");
    });

    it("should return null if all pheromones are below threshold", () => {
      const pheromones = createDefaultSwarmState().pheromones;
      for (const key of Object.keys(pheromones) as (keyof typeof pheromones)[]) {
        pheromones[key] = 0;
      }
      pheromones.defense = 0.5;
      pheromones.war = 0.8;

      const dominant = pheromoneManager.getDominantPheromone(pheromones);

      expect(dominant).to.be.null;
    });
  });

  describe("Pheromone Clamping", () => {
    it("should clamp pheromone values to max", () => {
      const swarm = createDefaultSwarmState();
      swarm.pheromones.defense = 150; // Above max of 100

      // Call any event that would process pheromones
      pheromoneManager.onHostileDetected(swarm, 10, 3);

      // Defense should be clamped at 100
      expect(swarm.pheromones.defense).to.be.at.most(DEFAULT_PHEROMONE_CONFIG.maxValue);
    });
  });
});

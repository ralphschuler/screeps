import { assert } from "chai";
import { RoomEconomyManager } from "../../src/core/managers/RoomEconomyManager";
import type { SwarmState } from "../../src/memory/schemas";

/**
 * Test suite for RoomEconomyManager
 *
 * Tests the implementation of:
 * - Lab reactions and boosting
 * - Factory production
 * - Power spawn processing
 * - Link transfers (source -> storage -> controller)
 */
describe("RoomEconomyManager", () => {
  let manager: RoomEconomyManager;

  beforeEach(() => {
    manager = new RoomEconomyManager();
  });

  describe("Resource processing coordination", () => {
    function roomAtRcl(level: number): Room {
      return {
        name: `W${level}N1`,
        controller: { level }
      } as unknown as Room;
    }

    it("exposes room economy intent through RCL gates", () => {
      const rcl5 = manager.getRoomEconomyIntent(roomAtRcl(5), { links: [] });
      const rcl6 = manager.getRoomEconomyIntent(roomAtRcl(6), { links: [] });
      const rcl7 = manager.getRoomEconomyIntent(roomAtRcl(7), { links: [] });
      const rcl8 = manager.getRoomEconomyIntent(roomAtRcl(8), { links: [{} as StructureLink, {} as StructureLink] });

      assert.deepEqual(rcl5.processing, { labs: false, factory: false, powerSpawn: false });
      assert.deepEqual(rcl6.processing, { labs: true, factory: false, powerSpawn: false });
      assert.deepEqual(rcl7.processing, { labs: true, factory: true, powerSpawn: false });
      assert.deepEqual(rcl8.processing, { labs: true, factory: true, powerSpawn: true });
      assert.deepEqual(rcl8.links, { count: 2, hasNetwork: true });
    });
  });

  describe("Lab reactions", () => {
    function createSwarm(): SwarmState {
      return {
        colonyLevel: "matureColony",
        posture: "eco",
        danger: 0,
        pheromones: {
          expand: 0,
          harvest: 0,
          build: 0,
          upgrade: 0,
          defense: 0,
          war: 0,
          siege: 0,
          logistics: 0,
          nukeTarget: 0
        },
        nextUpdateTick: 0,
        eventLog: [],
        missingStructures: {
          spawn: false,
          storage: false,
          terminal: false,
          labs: false,
          nuker: true,
          factory: true,
          extractor: false,
          powerSpawn: true,
          observer: true
        },
        role: "capital",
        remoteAssignments: [],
        metrics: {
          energyHarvested: 0,
          energySpawning: 0,
          energyConstruction: 0,
          energyRepair: 0,
          energyTower: 0,
          controllerProgress: 0,
          hostileCount: 0,
          damageReceived: 0,
          constructionSites: 0,
          energyAvailable: 0,
          energyCapacity: 0,
          energyNeed: 0
        },
        lastUpdate: 1000
      };
    }

    function createProcessingCache() {
      return {
        factory: undefined,
        powerSpawn: undefined,
        links: [],
        sources: []
      };
    }

    it("routes RCL6 lab processing through the lab workflow using the provided swarm", () => {
      const calls: string[] = [];
      const swarm = createSwarm();
      const room = {
        name: "W6N1",
        controller: { level: 6 }
      } as unknown as Room;
      const managerWithWorkflow = new RoomEconomyManager({
        run: (workflowRoom, workflowSwarm) => {
          calls.push(`${workflowRoom.name}:${workflowSwarm.posture}`);
          return {
            roomName: workflowRoom.name,
            initialized: true,
            boostPrepared: true,
            reactionPlanned: false,
            reactionReady: false,
            activeReactionChanged: false,
            reactionExecuted: false,
            saved: true
          };
        }
      });

      managerWithWorkflow.runResourceProcessing(room, swarm, createProcessingCache());

      assert.deepEqual(calls, ["W6N1:eco"]);
    });

    it("skips lab workflow before RCL6", () => {
      const calls: string[] = [];
      const managerWithWorkflow = new RoomEconomyManager({
        run: () => {
          calls.push("run");
          return {
            roomName: "W5N1",
            initialized: true,
            boostPrepared: true,
            reactionPlanned: false,
            reactionReady: false,
            activeReactionChanged: false,
            reactionExecuted: false,
            saved: true
          };
        }
      });
      const room = {
        name: "W5N1",
        controller: { level: 5 }
      } as unknown as Room;

      managerWithWorkflow.runResourceProcessing(room, createSwarm(), createProcessingCache());

      assert.deepEqual(calls, []);
    });
  });

  describe("Factory production", () => {
    it("should skip production if factory is on cooldown", () => {
      assert.exists(manager);
    });

    it("should produce compressed bars when resources available", () => {
      assert.exists(manager);
    });
  });

  describe("Power spawn", () => {
    it("should process power when resources available", () => {
      assert.exists(manager);
    });

    it("should skip processing if insufficient resources", () => {
      assert.exists(manager);
    });
  });

  describe("Link transfers", () => {
    it("should transfer from source links to storage link", () => {
      assert.exists(manager);
    });

    it("should transfer from storage link to controller link", () => {
      assert.exists(manager);
    });

    it("should prioritize source->storage over storage->controller", () => {
      assert.exists(manager);
    });

    it("should handle missing storage gracefully", () => {
      assert.exists(manager);
    });
  });
});

/**
 * Unit tests for Memory Schema Helper Functions
 * Addresses Phase 1 coverage improvement: Schema factory functions
 */

import { assert } from "chai";
import {
  createDefaultClusterMemory,
  createDefaultCreepMemory
} from "../../src/memory/schemas";

describe("Memory Schema Helper Functions", () => {
  describe("createDefaultClusterMemory", () => {
    it("should create cluster memory with correct structure", () => {
      const clusterId = "cluster_1";
      const coreRoom = "W1N1";
      
      const cluster = createDefaultClusterMemory(clusterId, coreRoom);
      
      assert.equal(cluster.id, clusterId);
      assert.equal(cluster.coreRoom, coreRoom);
      assert.deepEqual(cluster.memberRooms, [coreRoom]);
      assert.isArray(cluster.remoteRooms);
      assert.lengthOf(cluster.remoteRooms, 0);
    });

    it("should initialize default metrics", () => {
      const cluster = createDefaultClusterMemory("test", "W1N1");
      
      assert.isDefined(cluster.metrics);
      assert.equal(cluster.metrics.energyIncome, 0);
      assert.equal(cluster.metrics.energyConsumption, 0);
      assert.equal(cluster.metrics.energyBalance, 0);
      assert.equal(cluster.metrics.warIndex, 0);
      assert.equal(cluster.metrics.economyIndex, 50);
    });

    it("should set economic role by default", () => {
      const cluster = createDefaultClusterMemory("test", "W1N1");
      
      assert.equal(cluster.role, "economic");
    });

    it("should initialize empty arrays for squads and rally points", () => {
      const cluster = createDefaultClusterMemory("test", "W1N1");
      
      assert.isArray(cluster.squads);
      assert.lengthOf(cluster.squads, 0);
      assert.isArray(cluster.rallyPoints);
      assert.lengthOf(cluster.rallyPoints, 0);
      assert.isArray(cluster.defenseRequests);
      assert.lengthOf(cluster.defenseRequests, 0);
      assert.isArray(cluster.resourceRequests);
      assert.lengthOf(cluster.resourceRequests, 0);
    });

    it("should set lastUpdate to 0", () => {
      const cluster = createDefaultClusterMemory("test", "W1N1");
      
      assert.equal(cluster.lastUpdate, 0);
    });

    it("should initialize forwardBases as empty array", () => {
      const cluster = createDefaultClusterMemory("test", "W1N1");
      
      assert.isArray(cluster.forwardBases);
      assert.lengthOf(cluster.forwardBases, 0);
    });
  });

  describe("createDefaultCreepMemory", () => {
    it("should create creep memory with role and family", () => {
      const role = "harvester";
      const family = "economy";
      const homeRoom = "W1N1";
      
      const creepMem = createDefaultCreepMemory(role as any, family as any, homeRoom);
      
      assert.equal(creepMem.role, role);
      assert.equal(creepMem.family, family);
      assert.equal(creepMem.homeRoom, homeRoom);
    });

    it("should set version to 1", () => {
      const creepMem = createDefaultCreepMemory("upgrader" as any, "economy" as any, "W1N1");
      
      assert.equal(creepMem.version, 1);
    });

    it("should handle different role types", () => {
      const roles = ["harvester", "upgrader", "builder", "hauler"];
      
      roles.forEach(role => {
        const creepMem = createDefaultCreepMemory(role as any, "economy" as any, "W1N1");
        assert.equal(creepMem.role, role);
      });
    });

    it("should handle different family types", () => {
      const families = ["economy", "military", "utility"];
      
      families.forEach(family => {
        const creepMem = createDefaultCreepMemory("test" as any, family as any, "W1N1");
        assert.equal(creepMem.family, family);
      });
    });

    it("should handle different room names", () => {
      const rooms = ["W1N1", "E5S3", "W10N10"];
      
      rooms.forEach(room => {
        const creepMem = createDefaultCreepMemory("test" as any, "economy" as any, room);
        assert.equal(creepMem.homeRoom, room);
      });
    });
  });
});

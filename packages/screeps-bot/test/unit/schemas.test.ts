/**
 * Unit tests for Memory Schema Helper Functions
 * Addresses Phase 1 coverage improvement: Schema factory functions
 */

import { assert } from "chai";
import {
  createDefaultClusterMemory,
  createDefaultCreepMemory,
  type CreepRole,
  type RoleFamily
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
      const role: CreepRole = "harvester";
      const family: RoleFamily = "economy";
      const homeRoom = "W1N1";
      
      const creepMem = createDefaultCreepMemory(role, family, homeRoom);
      
      assert.equal(creepMem.role, role);
      assert.equal(creepMem.family, family);
      assert.equal(creepMem.homeRoom, homeRoom);
      assert.equal(creepMem.version, 1);
    });
  });
});

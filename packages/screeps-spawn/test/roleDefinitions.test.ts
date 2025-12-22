/**
 * Role Definitions Tests
 */

import { expect } from "chai";
import {
  DEFAULT_ROLE_DEFINITIONS,
  getRoleDefinition,
  getAllRoles,
  getRolesByFamily
} from "../src/roleDefinitions";

describe("Role Definitions", () => {
  describe("DEFAULT_ROLE_DEFINITIONS", () => {
    it("should contain economy roles", () => {
      expect(DEFAULT_ROLE_DEFINITIONS.harvester).to.exist;
      expect(DEFAULT_ROLE_DEFINITIONS.hauler).to.exist;
      expect(DEFAULT_ROLE_DEFINITIONS.upgrader).to.exist;
      expect(DEFAULT_ROLE_DEFINITIONS.builder).to.exist;
    });

    it("should contain military roles", () => {
      expect(DEFAULT_ROLE_DEFINITIONS.guard).to.exist;
      expect(DEFAULT_ROLE_DEFINITIONS.healer).to.exist;
    });

    it("should contain utility roles", () => {
      expect(DEFAULT_ROLE_DEFINITIONS.scout).to.exist;
      expect(DEFAULT_ROLE_DEFINITIONS.claimer).to.exist;
      expect(DEFAULT_ROLE_DEFINITIONS.reserver).to.exist;
    });

    it("should have valid body templates", () => {
      for (const [role, def] of Object.entries(DEFAULT_ROLE_DEFINITIONS)) {
        expect(def.bodies.length).to.be.greaterThan(0, `${role} has no bodies`);
        
        for (const body of def.bodies) {
          expect(body.parts.length).to.be.greaterThan(0, `${role} has empty body`);
          expect(body.cost).to.be.greaterThan(0, `${role} has zero cost body`);
        }
      }
    });

    it("should have bodies sorted by cost", () => {
      for (const [role, def] of Object.entries(DEFAULT_ROLE_DEFINITIONS)) {
        for (let i = 1; i < def.bodies.length; i++) {
          expect(def.bodies[i].cost).to.be.at.least(
            def.bodies[i - 1].cost,
            `${role} bodies not sorted by cost`
          );
        }
      }
    });

    it("should have valid priorities", () => {
      for (const [role, def] of Object.entries(DEFAULT_ROLE_DEFINITIONS)) {
        expect(def.priority).to.be.a("number", `${role} priority not a number`);
        expect(def.priority).to.be.greaterThan(0, `${role} priority not positive`);
      }
    });

    it("should have valid maxPerRoom", () => {
      for (const [role, def] of Object.entries(DEFAULT_ROLE_DEFINITIONS)) {
        expect(def.maxPerRoom).to.be.a("number", `${role} maxPerRoom not a number`);
        expect(def.maxPerRoom).to.be.greaterThan(0, `${role} maxPerRoom not positive`);
      }
    });
  });

  describe("getRoleDefinition", () => {
    it("should return definition for valid role", () => {
      const def = getRoleDefinition("harvester");
      expect(def).to.exist;
      expect(def?.role).to.equal("harvester");
    });

    it("should return null for invalid role", () => {
      const def = getRoleDefinition("invalidRole");
      expect(def).to.be.null;
    });

    it("should use custom definitions when provided", () => {
      const customDefs = {
        customRole: {
          role: "customRole",
          family: "economy" as const,
          bodies: [{
            parts: [WORK, CARRY, MOVE],
            cost: 200,
            minCapacity: 200
          }],
          priority: 100,
          maxPerRoom: 1,
          remoteRole: false
        }
      };

      const def = getRoleDefinition("customRole", customDefs);
      expect(def).to.exist;
      expect(def?.role).to.equal("customRole");
    });
  });

  describe("getAllRoles", () => {
    it("should return all role names", () => {
      const roles = getAllRoles();
      expect(roles).to.be.an("array");
      expect(roles.length).to.be.greaterThan(0);
      expect(roles).to.include("harvester");
      expect(roles).to.include("hauler");
    });

    it("should use custom definitions when provided", () => {
      const customDefs = {
        customRole: {
          role: "customRole",
          family: "economy" as const,
          bodies: [],
          priority: 100,
          maxPerRoom: 1,
          remoteRole: false
        }
      };

      const roles = getAllRoles(customDefs);
      expect(roles).to.deep.equal(["customRole"]);
    });
  });

  describe("getRolesByFamily", () => {
    it("should return economy roles", () => {
      const roles = getRolesByFamily("economy");
      expect(roles).to.be.an("array");
      expect(roles).to.include("harvester");
      expect(roles).to.include("hauler");
      expect(roles).to.not.include("guard");
    });

    it("should return military roles", () => {
      const roles = getRolesByFamily("military");
      expect(roles).to.be.an("array");
      expect(roles).to.include("guard");
      expect(roles).to.not.include("harvester");
    });

    it("should return utility roles", () => {
      const roles = getRolesByFamily("utility");
      expect(roles).to.be.an("array");
      expect(roles).to.include("scout");
      expect(roles).to.include("claimer");
    });

    it("should use custom definitions when provided", () => {
      const customDefs = {
        customEco: {
          role: "customEco",
          family: "economy" as const,
          bodies: [],
          priority: 100,
          maxPerRoom: 1,
          remoteRole: false
        },
        customMil: {
          role: "customMil",
          family: "military" as const,
          bodies: [],
          priority: 100,
          maxPerRoom: 1,
          remoteRole: false
        }
      };

      const ecoRoles = getRolesByFamily("economy", customDefs);
      expect(ecoRoles).to.deep.equal(["customEco"]);

      const milRoles = getRolesByFamily("military", customDefs);
      expect(milRoles).to.deep.equal(["customMil"]);
    });
  });
});

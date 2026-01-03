/**
 * Tests for Non-Aggression Alliance System
 */

import { expect } from "chai";
import {
  isAllyCreep,
  filterAllyCreeps,
  NON_AGGRESSION_PACT_PLAYERS,
  getActualHostileCreeps
} from "@ralphschuler/screeps-defense";

describe("Non-Aggression Alliance System", () => {
  describe("isAllyCreep", () => {
    it("should identify allied creeps correctly", () => {
      const tooAngelCreep = {
        owner: { username: "TooAngel" }
      } as Creep;

      const tedRoastBeefCreep = {
        owner: { username: "TedRoastBeef" }
      } as Creep;

      const otherCreep = {
        owner: { username: "SomeOtherPlayer" }
      } as Creep;

      expect(isAllyCreep(tooAngelCreep)).to.be.true;
      expect(isAllyCreep(tedRoastBeefCreep)).to.be.true;
      expect(isAllyCreep(otherCreep)).to.be.false;
    });

    it("should have both allied players in the pact", () => {
      expect(NON_AGGRESSION_PACT_PLAYERS).to.include("TooAngel");
      expect(NON_AGGRESSION_PACT_PLAYERS).to.include("TedRoastBeef");
    });
  });

  describe("filterAllyCreeps", () => {
    it("should filter out all allied creeps from hostile list", () => {
      const tooAngelCreep = {
        name: "tooangel1",
        owner: { username: "TooAngel" },
        room: { name: "W1N1" }
      } as Creep;

      const tedRoastBeefCreep = {
        name: "ted1",
        owner: { username: "TedRoastBeef" },
        room: { name: "W1N1" }
      } as Creep;

      const hostileCreep1 = {
        name: "hostile1",
        owner: { username: "EvilPlayer" },
        room: { name: "W1N1" }
      } as Creep;

      const hostileCreep2 = {
        name: "hostile2",
        owner: { username: "BadGuy" },
        room: { name: "W1N1" }
      } as Creep;

      const allHostiles = [tooAngelCreep, hostileCreep1, tedRoastBeefCreep, hostileCreep2];
      const actualHostiles = filterAllyCreeps(allHostiles);

      expect(actualHostiles).to.have.lengthOf(2);
      expect(actualHostiles).to.include(hostileCreep1);
      expect(actualHostiles).to.include(hostileCreep2);
      expect(actualHostiles).to.not.include(tooAngelCreep);
      expect(actualHostiles).to.not.include(tedRoastBeefCreep);
    });

    it("should return empty array when all hostiles are allies", () => {
      const tooAngelCreep = {
        name: "tooangel1",
        owner: { username: "TooAngel" },
        room: { name: "W1N1" }
      } as Creep;

      const tedRoastBeefCreep = {
        name: "ted1",
        owner: { username: "TedRoastBeef" },
        room: { name: "W1N1" }
      } as Creep;

      const allHostiles = [tooAngelCreep, tedRoastBeefCreep];
      const actualHostiles = filterAllyCreeps(allHostiles);

      expect(actualHostiles).to.be.empty;
    });

    it("should return same array when no allies present", () => {
      const hostileCreep1 = {
        name: "hostile1",
        owner: { username: "EvilPlayer" }
      } as Creep;

      const hostileCreep2 = {
        name: "hostile2",
        owner: { username: "BadGuy" }
      } as Creep;

      const allHostiles = [hostileCreep1, hostileCreep2];
      const actualHostiles = filterAllyCreeps(allHostiles);

      expect(actualHostiles).to.have.lengthOf(2);
      expect(actualHostiles).to.deep.equal(allHostiles);
    });
  });

  describe("getActualHostileCreeps", () => {
    it("should filter allies from room hostile detection", () => {
      const tooAngelCreep = {
        name: "tooangel1",
        owner: { username: "TooAngel" }
      } as Creep;

      const tedRoastBeefCreep = {
        name: "ted1",
        owner: { username: "TedRoastBeef" }
      } as Creep;

      const hostileCreep = {
        name: "hostile1",
        owner: { username: "EvilPlayer" }
      } as Creep;

      const mockRoom = {
        find: (findConstant: FindConstant) => {
          if (findConstant === FIND_HOSTILE_CREEPS) {
            return [tooAngelCreep, tedRoastBeefCreep, hostileCreep];
          }
          return [];
        }
      } as Room;

      const actualHostiles = getActualHostileCreeps(mockRoom);

      expect(actualHostiles).to.have.lengthOf(1);
      expect(actualHostiles[0]).to.equal(hostileCreep);
    });
  });
});

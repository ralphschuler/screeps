/**
 * Tests for TooAngel Ally Filter
 */

import { expect } from "chai";
import {
  isTooAngelCreep,
  filterTooAngelCreeps,
  TOOANGEL_PLAYER_NAME,
  getActualHostileCreeps
} from "@ralphschuler/screeps-defense";

describe("TooAngel Ally Filter", () => {
  describe("isTooAngelCreep", () => {
    it("should identify TooAngel creeps correctly", () => {
      const tooAngelCreep = {
        owner: { username: "TooAngel" }
      } as Creep;

      const otherCreep = {
        owner: { username: "SomeOtherPlayer" }
      } as Creep;

      expect(isTooAngelCreep(tooAngelCreep)).to.be.true;
      expect(isTooAngelCreep(otherCreep)).to.be.false;
    });

    it("should match the constant player name", () => {
      expect(TOOANGEL_PLAYER_NAME).to.equal("TooAngel");
    });
  });

  describe("filterTooAngelCreeps", () => {
    it("should filter out TooAngel creeps from hostile list", () => {
      const tooAngelCreep1 = {
        name: "tooangel1",
        owner: { username: "TooAngel" },
        room: { name: "W1N1" }
      } as Creep;

      const tooAngelCreep2 = {
        name: "tooangel2",
        owner: { username: "TooAngel" },
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

      const allHostiles = [tooAngelCreep1, hostileCreep1, tooAngelCreep2, hostileCreep2];
      const actualHostiles = filterTooAngelCreeps(allHostiles);

      expect(actualHostiles).to.have.lengthOf(2);
      expect(actualHostiles).to.include(hostileCreep1);
      expect(actualHostiles).to.include(hostileCreep2);
      expect(actualHostiles).to.not.include(tooAngelCreep1);
      expect(actualHostiles).to.not.include(tooAngelCreep2);
    });

    it("should return empty array when all hostiles are TooAngel", () => {
      const tooAngelCreep1 = {
        name: "tooangel1",
        owner: { username: "TooAngel" },
        room: { name: "W1N1" }
      } as Creep;

      const tooAngelCreep2 = {
        name: "tooangel2",
        owner: { username: "TooAngel" },
        room: { name: "W1N1" }
      } as Creep;

      const allHostiles = [tooAngelCreep1, tooAngelCreep2];
      const actualHostiles = filterTooAngelCreeps(allHostiles);

      expect(actualHostiles).to.be.empty;
    });

    it("should return same array when no TooAngel creeps present", () => {
      const hostileCreep1 = {
        name: "hostile1",
        owner: { username: "EvilPlayer" }
      } as Creep;

      const hostileCreep2 = {
        name: "hostile2",
        owner: { username: "BadGuy" }
      } as Creep;

      const allHostiles = [hostileCreep1, hostileCreep2];
      const actualHostiles = filterTooAngelCreeps(allHostiles);

      expect(actualHostiles).to.have.lengthOf(2);
      expect(actualHostiles).to.deep.equal(allHostiles);
    });
  });

  describe("getActualHostileCreeps", () => {
    it("should filter TooAngel from room hostile detection", () => {
      const tooAngelCreep = {
        name: "tooangel1",
        owner: { username: "TooAngel" }
      } as Creep;

      const hostileCreep = {
        name: "hostile1",
        owner: { username: "EvilPlayer" }
      } as Creep;

      const mockRoom = {
        find: (findConstant: FindConstant) => {
          if (findConstant === FIND_HOSTILE_CREEPS) {
            return [tooAngelCreep, hostileCreep];
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

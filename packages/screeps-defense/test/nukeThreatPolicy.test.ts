import { expect } from "chai";
import { hasCriticalStructuresThreatened } from "../src/emergency/nukeThreatPolicy";

describe("nuke structure threat policy", () => {
  it("identifies persisted spawn, storage, and terminal threats", () => {
    for (const structureType of [STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_TERMINAL]) {
      expect(hasCriticalStructuresThreatened({
        threatenedStructures: [`${structureType}-25,25`],
      })).to.equal(true);
    }
  });

  it("ignores missing, empty, and non-critical structure threats", () => {
    expect(hasCriticalStructuresThreatened({})).to.equal(false);
    expect(hasCriticalStructuresThreatened({ threatenedStructures: [] })).to.equal(false);
    expect(hasCriticalStructuresThreatened({
      threatenedStructures: [`${STRUCTURE_TOWER}-25,25`],
    })).to.equal(false);
  });

  it("finds a critical descriptor after non-critical entries", () => {
    expect(hasCriticalStructuresThreatened({
      threatenedStructures: [
        `${STRUCTURE_TOWER}-25,25`,
        `${STRUCTURE_STORAGE}-24,25`,
      ],
    })).to.equal(true);
  });
});

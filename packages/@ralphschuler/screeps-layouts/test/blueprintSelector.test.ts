import { expect } from "chai";

describe("Blueprint selector", () => {
  before(() => {
    Object.assign(globalThis, {
      STRUCTURE_EXTENSION: "extension",
      STRUCTURE_SPAWN: "spawn",
      STRUCTURE_ROAD: "road",
      STRUCTURE_TOWER: "tower",
      STRUCTURE_STORAGE: "storage",
      STRUCTURE_TERMINAL: "terminal",
      STRUCTURE_FACTORY: "factory",
      STRUCTURE_LAB: "lab",
      STRUCTURE_NUKER: "nuker",
      STRUCTURE_OBSERVER: "observer",
      STRUCTURE_POWER_SPAWN: "powerSpawn",
      STRUCTURE_LINK: "link",
      STRUCTURE_RAMPART: "rampart"
    });
  });

  it("clamps invalid high RCL values to RCL 8 structure limits", async () => {
    const { getStructuresForRCL } = await import("../src/blueprints/selector.ts");
    const { EARLY_COLONY_BLUEPRINT } = await import("../src/blueprints/definitions/early-colony.ts");

    const structures = getStructuresForRCL(EARLY_COLONY_BLUEPRINT, 9);

    expect(structures.filter(s => s.structureType === "extension")).to.have.length(60);
    expect(structures.filter(s => s.structureType === "spawn")).to.have.length(1);
  });

  it("clamps invalid low RCL values to RCL 1 structure limits", async () => {
    const { getStructuresForRCL } = await import("../src/blueprints/selector.ts");
    const { EARLY_COLONY_BLUEPRINT } = await import("../src/blueprints/definitions/early-colony.ts");

    const structures = getStructuresForRCL(EARLY_COLONY_BLUEPRINT, 0);

    expect(structures.filter(s => s.structureType === "extension")).to.have.length(0);
    expect(structures.filter(s => s.structureType === "spawn")).to.have.length(1);
  });

  it("treats non-finite RCL values as RCL 1 structure limits", async () => {
    const { getStructuresForRCL } = await import("../src/blueprints/selector.ts");
    const { EARLY_COLONY_BLUEPRINT } = await import("../src/blueprints/definitions/early-colony.ts");

    const structures = getStructuresForRCL(EARLY_COLONY_BLUEPRINT, Number.NaN);

    expect(structures.filter(s => s.structureType === "extension")).to.have.length(0);
    expect(structures.filter(s => s.structureType === "spawn")).to.have.length(1);
  });
});

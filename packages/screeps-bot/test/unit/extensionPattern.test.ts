import { expect } from "chai";
import {
  addExtensionPatternToBlueprint,
  generateExtensionPattern,
  hasEdgeAdjacentExtensions,
  isCheckerboardPatternPosition
} from "@ralphschuler/screeps-layouts";

describe("Extension layout pattern Module", () => {
  it("generates deterministic checkerboard extension positions", () => {
    const extensions = generateExtensionPattern(4);

    expect(extensions).to.deep.equal([
      { x: -2, y: 0, structureType: STRUCTURE_EXTENSION },
      { x: 2, y: 0, structureType: STRUCTURE_EXTENSION },
      { x: 0, y: -2, structureType: STRUCTURE_EXTENSION },
      { x: 0, y: 2, structureType: STRUCTURE_EXTENSION }
    ]);
    expect(extensions.every(extension => isCheckerboardPatternPosition(extension.x, extension.y))).to.equal(true);
  });

  it("returns no extensions for negative counts", () => {
    expect(generateExtensionPattern(-1)).to.deep.equal([]);
  });

  it("preserves movement space by avoiding edge-adjacent extensions", () => {
    expect(hasEdgeAdjacentExtensions(generateExtensionPattern(80))).to.equal(false);
  });

  it("adds needed extensions without colliding with existing structures", () => {
    const structures = [
      { x: 0, y: 0, structureType: STRUCTURE_SPAWN },
      { x: -2, y: 0, structureType: STRUCTURE_ROAD }
    ];

    const result = addExtensionPatternToBlueprint(structures, 2);

    expect(result.filter(structure => structure.structureType === STRUCTURE_EXTENSION)).to.deep.equal([
      { x: 2, y: 0, structureType: STRUCTURE_EXTENSION },
      { x: 0, y: -2, structureType: STRUCTURE_EXTENSION }
    ]);
  });
});

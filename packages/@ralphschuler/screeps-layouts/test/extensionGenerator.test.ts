import { expect } from "chai";
import {
  addExtensionsToBlueprint,
  generateExtensions,
  isCheckerboardPosition
} from "../src/extensionGenerator.ts";

describe("Extension Generator", () => {
  beforeEach(() => {
    (globalThis as Record<string, unknown>).STRUCTURE_EXTENSION = "extension";
    (globalThis as Record<string, unknown>).STRUCTURE_SPAWN = "spawn";
  });

  it("generates non-adjacent checkerboard extension positions", () => {
    const extensions = generateExtensions(8);

    expect(extensions).to.have.length(8);
    for (const extension of extensions) {
      expect(extension.structureType).to.equal("extension");
      expect(isCheckerboardPosition(extension.x, extension.y)).to.be.true;
    }
  });

  it("adds only the missing extension count to an existing blueprint", () => {
    const existing = [
      { x: 0, y: 0, structureType: "spawn" as StructureConstant },
      { x: -2, y: 0, structureType: "extension" as StructureConstant }
    ];

    const updated = addExtensionsToBlueprint(existing, 3);

    expect(updated).to.have.length(4);
    expect(updated.filter(s => s.structureType === "extension")).to.have.length(3);
  });
});

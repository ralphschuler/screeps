import { expect } from "chai";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ts from "typescript";

const STRUCTURE_TYPES = {
  STRUCTURE_SPAWN: "spawn",
  STRUCTURE_TOWER: "tower",
  STRUCTURE_STORAGE: "storage",
  STRUCTURE_TERMINAL: "terminal",
  STRUCTURE_LAB: "lab",
  STRUCTURE_NUKER: "nuker",
  STRUCTURE_POWER_SPAWN: "powerSpawn",
  STRUCTURE_OBSERVER: "observer",
  STRUCTURE_EXTENSION: "extension",
  STRUCTURE_LINK: "link",
};

describe("nuke API compatibility", () => {
  it("keeps compatible package-root and canonical subpath type contracts", () => {
    const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const configPath = path.join(packageRoot, "tsconfig.json");
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, packageRoot);
    const fixture = path.join(packageRoot, "test/fixtures/nukeCompatibilityConsumer.ts");
    const program = ts.createProgram([fixture], {
      ...config.options,
      noEmit: true,
      rootDir: packageRoot,
    });
    const diagnostics = ts.getPreEmitDiagnostics(program).map(diagnostic =>
      ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
    );

    expect(diagnostics).to.deep.equal([]);
  });

  it("exports the deprecated predicate from its previous public module", async () => {
    const previousGlobals = new Map(
      Object.keys(STRUCTURE_TYPES).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)])
    );
    Object.assign(globalThis, STRUCTURE_TYPES);

    try {
      const api = await import("../src/nuke/detection");
      expect(api).to.have.property("hasCriticalStructuresThreatened").that.is.a("function");
      const predicate = (api as Record<string, unknown>).hasCriticalStructuresThreatened as
        (alert: { threatenedStructures?: string[] }) => boolean;
      expect(predicate({ threatenedStructures: ["spawn-25,25"] })).to.equal(true);
      expect(predicate({ threatenedStructures: ["tower-25,25"] })).to.equal(false);
    } finally {
      for (const [key, descriptor] of previousGlobals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete (globalThis as Record<string, unknown>)[key];
      }
    }
  });
});

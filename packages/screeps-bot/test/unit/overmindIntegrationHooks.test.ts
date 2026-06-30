import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { assert } from "chai";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcRoot = resolve(__dirname, "../../src");

describe("Overmind-inspired integration hooks", () => {
  it("registers the IntelScanner process with the kernel process registry", () => {
    const registrySource = readFileSync(resolve(srcRoot, "core/processRegistry.ts"), "utf8");

    assert.include(registrySource, "../empire/intelScanner");
    assert.match(registrySource, /registerAllDecoratedProcesses\([\s\S]*intelScanner[\s\S]*\)/);
  });

  it("routes the main spawn loop through the persistent spawn coordinator", () => {
    const swarmBotSource = readFileSync(resolve(srcRoot, "SwarmBot.ts"), "utf8");

    assert.include(swarmBotSource, "@ralphschuler/screeps-spawn");
    assert.include(swarmBotSource, "coordinateSpawning(room, swarm)");
    assert.notInclude(swarmBotSource, "runSpawnManager(room, swarm)");
  });

  it("runs spawn continuity before movement and kernel work can fail", () => {
    const swarmBotSource = readFileSync(resolve(srcRoot, "SwarmBot.ts"), "utf8");
    const spawnIndex = swarmBotSource.indexOf('unifiedStats.measureSubsystem("spawns"');
    const movementIndex = swarmBotSource.indexOf("initMovement();");
    const kernelIndex = swarmBotSource.indexOf("botKernelRuntime.runProcesses();");

    assert.isAtLeast(spawnIndex, 0, "spawn subsystem should be present");
    assert.isBelow(spawnIndex, movementIndex, "spawning should run before traffic movement setup");
    assert.isBelow(spawnIndex, kernelIndex, "spawning should run before kernel process execution");
  });
});

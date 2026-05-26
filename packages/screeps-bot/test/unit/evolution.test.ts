import { expect } from "chai";
import { globalCache } from "@ralphschuler/screeps-cache";
import { createDefaultSwarmState, type SwarmState } from "@ralphschuler/screeps-memory";
import { evolutionManager } from "../../src/logic/evolution";

declare const global: { Game: typeof Game; Memory: typeof Memory };

function createSwarm(): SwarmState {
  return createDefaultSwarmState();
}

function createRoom(level: number, structureTypes: BuildableStructureConstant[] = []): Room {
  return {
    name: "W1N1",
    controller: { level, my: true },
    find: (findType: FindConstant) => {
      if (findType !== FIND_MY_STRUCTURES) return [];
      return structureTypes.map((structureType, index) => ({
        id: `${structureType}-${index}`,
        structureType
      }));
    }
  } as unknown as Room;
}

describe("EvolutionManager", () => {
  beforeEach(() => {
    global.Game = {
      time: 1000,
      gcl: { level: 4, progress: 0, progressTotal: 1000000 }
    } as unknown as typeof Game;
    global.Memory = { creeps: {}, rooms: {} } as typeof Memory;
    globalCache.clear();
  });

  it("maps colonyLevel to RCL lifecycle bands instead of readiness gates", () => {
    const swarm = createSwarm();

    expect(evolutionManager.determineEvolutionStage(swarm, createRoom(2), 1)).to.equal("seedNest");
    expect(evolutionManager.determineEvolutionStage(swarm, createRoom(3), 1)).to.equal("foragingExpansion");
    expect(evolutionManager.determineEvolutionStage(swarm, createRoom(6), 1)).to.equal("matureColony");
    expect(evolutionManager.determineEvolutionStage(swarm, createRoom(7), 1)).to.equal("fortifiedHive");
  });

  it("keeps missing structure readiness separate from lifecycle stage", () => {
    const swarm = createSwarm();
    const room = createRoom(6, [STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_EXTRACTOR]);

    const changed = evolutionManager.updateEvolutionStage(swarm, room, 1);
    evolutionManager.updateMissingStructures(swarm, room);

    expect(changed).to.equal(true);
    expect(swarm.colonyLevel).to.equal("matureColony");
    expect(swarm.missingStructures.storage).to.equal(false);
    expect(swarm.missingStructures.terminal).to.equal(true);
    expect(swarm.missingStructures.labs).to.equal(true);
    expect(swarm.missingStructures.extractor).to.equal(false);
  });
});

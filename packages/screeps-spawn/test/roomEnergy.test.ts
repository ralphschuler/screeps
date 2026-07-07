import { expect } from "chai";
import { getEffectiveRoomEnergyAvailable } from "../src/roomEnergy";

function createEnergyStore(getEnergy: () => number): Store<RESOURCE_ENERGY, false> {
  return {
    getUsedCapacity: (resource?: ResourceConstant) => (resource === RESOURCE_ENERGY ? getEnergy() : 0)
  } as unknown as Store<RESOURCE_ENERGY, false>;
}

function createEnergyStructure(
  structureType: typeof STRUCTURE_SPAWN | typeof STRUCTURE_EXTENSION,
  getEnergy: () => number
): StructureSpawn | StructureExtension {
  return {
    structureType,
    store: createEnergyStore(getEnergy)
  } as unknown as StructureSpawn | StructureExtension;
}

function createRoomWithTrackedFinds(options: {
  name?: string;
  energyAvailable?: number;
  spawnEnergy?: () => number;
  extensionEnergy?: () => number;
}): { room: Room; findCallTypes: FindConstant[] } {
  const findCallTypes: FindConstant[] = [];
  const spawn = createEnergyStructure(STRUCTURE_SPAWN, options.spawnEnergy ?? (() => 0));
  const extension = createEnergyStructure(STRUCTURE_EXTENSION, options.extensionEnergy ?? (() => 0));

  const room = {
    name: options.name ?? "E1N1",
    energyAvailable: options.energyAvailable ?? 0,
    energyCapacityAvailable: 800,
    find: (type: FindConstant) => {
      findCallTypes.push(type);
      if (type === FIND_MY_SPAWNS) return [spawn];
      if (type === FIND_MY_STRUCTURES) return [spawn, extension];
      return [];
    }
  } as unknown as Room;

  return { room, findCallTypes };
}

describe("room energy fallback cache", () => {
  beforeEach(() => {
    (globalThis as any).Game = {
      time: 20_000,
      rooms: {},
      creeps: {},
      spawns: {},
      structures: {}
    };
    (globalThis as any).Memory = {};
  });

  it("caches effective spawn energy per room for the current tick", () => {
    const { room, findCallTypes } = createRoomWithTrackedFinds({
      energyAvailable: 0,
      spawnEnergy: () => 300,
      extensionEnergy: () => 50
    });

    expect(getEffectiveRoomEnergyAvailable(room)).to.equal(350);
    expect(getEffectiveRoomEnergyAvailable(room)).to.equal(350);

    expect(findCallTypes).to.deep.equal([FIND_MY_SPAWNS, FIND_MY_STRUCTURES]);
  });

  it("recomputes effective spawn energy on a later tick", () => {
    let spawnEnergy = 300;
    const { room, findCallTypes } = createRoomWithTrackedFinds({
      energyAvailable: 0,
      spawnEnergy: () => spawnEnergy
    });

    expect(getEffectiveRoomEnergyAvailable(room)).to.equal(300);

    spawnEnergy = 400;
    Game.time += 1;

    expect(getEffectiveRoomEnergyAvailable(room)).to.equal(400);
    expect(findCallTypes).to.deep.equal([
      FIND_MY_SPAWNS,
      FIND_MY_STRUCTURES,
      FIND_MY_SPAWNS,
      FIND_MY_STRUCTURES
    ]);
  });

  it("preserves the structure-energy fallback disable switch without scanning structures", () => {
    (globalThis as any).Memory = { spawnSettings: { structureEnergyFallback: false } };
    const { room, findCallTypes } = createRoomWithTrackedFinds({
      energyAvailable: 0,
      spawnEnergy: () => 300,
      extensionEnergy: () => 50
    });

    expect(getEffectiveRoomEnergyAvailable(room)).to.equal(0);
    expect(getEffectiveRoomEnergyAvailable(room)).to.equal(0);
    expect(findCallTypes).to.deep.equal([]);
  });
});

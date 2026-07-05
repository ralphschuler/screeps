import { expect } from "chai";
import { FactoryManager } from "../src/factories/factoryManager";

type StoreContents = Partial<Record<ResourceConstant, number>>;

function createStore(contents: StoreContents, capacity = 100000): StoreDefinition {
  return {
    ...contents,
    getUsedCapacity: (resource?: ResourceConstant) => {
      if (resource) return contents[resource] ?? 0;
      return Object.values(contents).reduce((sum, amount) => sum + (amount ?? 0), 0);
    },
    getFreeCapacity: (_resource?: ResourceConstant) => {
      const used = Object.values(contents).reduce((sum, amount) => sum + (amount ?? 0), 0);
      return capacity - used;
    },
    getCapacity: () => capacity
  } as unknown as StoreDefinition;
}

function createRoomWithFactory(
  factoryStore: StoreDefinition,
  storageStore: StoreDefinition,
  produce: StructureFactory["produce"]
): Room {
  const factory = {
    my: true,
    structureType: STRUCTURE_FACTORY,
    cooldown: 0,
    store: factoryStore,
    produce
  } as unknown as StructureFactory;
  const storage = {
    my: true,
    structureType: STRUCTURE_STORAGE,
    store: storageStore
  } as unknown as StructureStorage;
  const room = {
    name: "W1N1",
    controller: { my: true, level: 8 },
    storage,
    find: (_find: FindConstant, options?: { filter?: (structure: Structure) => boolean }) => {
      const structures = [factory];
      return options?.filter ? structures.filter(options.filter) : structures;
    }
  } as unknown as Room;
  (factory as unknown as { room: Room }).room = room;
  (storage as unknown as { room: Room }).room = room;
  return room;
}

function runFactory(factoryContents: StoreContents, storageContents: StoreContents): CommodityConstant[] {
  const produced: CommodityConstant[] = [];
  const room = createRoomWithFactory(
    createStore(factoryContents),
    createStore(storageContents),
    ((commodity: CommodityConstant) => {
      produced.push(commodity);
      return OK;
    }) as StructureFactory["produce"]
  );
  (Game.rooms as Record<string, Room>).W1N1 = room;

  new FactoryManager({ minBucket: 0, minStorageEnergy: 0 }).run();

  return produced;
}

describe("FactoryManager", () => {
  beforeEach(() => {
    (global as any).Game = {
      ...Game,
      cpu: { ...Game.cpu, bucket: 10000 },
      rooms: {}
    };
  });

  it("produces the matching level-0 commodity for every ready factory input", () => {
    const cases: Array<{ input: ResourceConstant; output: CommodityConstant; amount: number }> = [
      { input: RESOURCE_UTRIUM, output: RESOURCE_UTRIUM_BAR, amount: 500 },
      { input: RESOURCE_LEMERGIUM, output: RESOURCE_LEMERGIUM_BAR, amount: 500 },
      { input: RESOURCE_ZYNTHIUM, output: RESOURCE_ZYNTHIUM_BAR, amount: 500 },
      { input: RESOURCE_KEANIUM, output: RESOURCE_KEANIUM_BAR, amount: 500 },
      { input: RESOURCE_GHODIUM, output: RESOURCE_GHODIUM_MELT, amount: 500 },
      { input: RESOURCE_OXYGEN, output: RESOURCE_OXIDANT, amount: 500 },
      { input: RESOURCE_HYDROGEN, output: RESOURCE_REDUCTANT, amount: 500 },
      { input: RESOURCE_CATALYST, output: RESOURCE_PURIFIER, amount: 500 },
      { input: RESOURCE_ENERGY, output: RESOURCE_BATTERY, amount: 600 }
    ];

    for (const { input, output, amount } of cases) {
      const factoryContents: StoreContents = { [input]: amount };
      const storageContents: StoreContents = { [input]: amount * 2, [RESOURCE_ENERGY]: 100000 };

      if (input !== RESOURCE_ENERGY) {
        factoryContents[RESOURCE_ENERGY] = 200;
        storageContents[RESOURCE_BATTERY] = 6000;
      }

      expect(runFactory(factoryContents, storageContents), output).to.deep.equal([output]);
    }
  });

  it("skips a higher-priority recipe when its inputs are not ready in the factory", () => {
    const produced = runFactory(
      { [RESOURCE_LEMERGIUM]: 500, [RESOURCE_ENERGY]: 200 },
      { [RESOURCE_LEMERGIUM]: 1000, [RESOURCE_ENERGY]: 100000 }
    );

    expect(produced).to.deep.equal([RESOURCE_LEMERGIUM_BAR]);
  });
});

import { expect } from "chai";
import { TerminalManager } from "../src/terminals/terminalManager";
import { marketManager } from "../src/market/marketManager";

function createStore(contents: Partial<Record<ResourceConstant, number>>, capacity = 100000): StoreDefinition {
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

function createRoom(name: string, terminalStore: StoreDefinition, send?: StructureTerminal["send"]): Room {
  const terminal = {
    my: true,
    cooldown: 0,
    isActive: () => true,
    store: terminalStore,
    send: send ?? (() => OK)
  } as unknown as StructureTerminal;
  const room = {
    name,
    controller: { my: true, level: 8 },
    terminal
  } as unknown as Room;
  (terminal as unknown as { room: Room }).room = room;
  return room;
}

describe("TerminalManager", () => {
  beforeEach(() => {
    (global as any).Memory = { rooms: {}, creeps: {}, spawns: {}, flags: {}, powerCreeps: {}, clusters: {}, empire: undefined };
    (global as any).Game = {
      time: 20,
      cpu: { bucket: 10000 },
      rooms: {},
      map: { getRoomLinearDistance: () => 1 },
      market: {
        calcTransactionCost: () => 100
      }
    };
  });

  it("runs terminal capacity clearing even with one owned terminal", () => {
    const calls: Array<{ roomName: string; resource: ResourceConstant; amount: number }> = [];
    const originalSell = marketManager.sellSurplusFromTerminal.bind(marketManager);
    marketManager.sellSurplusFromTerminal = (roomName, resource, amount) => {
      calls.push({ roomName, resource, amount });
      return true;
    };

    try {
      const room = createRoom("W1N1", createStore({ [RESOURCE_HYDROGEN]: 10000 }, 10000));
      (Game.rooms as Record<string, Room>).W1N1 = room;

      new TerminalManager({ minBucket: 0 }).run();

      expect(calls).to.deep.equal([{ roomName: "W1N1", resource: RESOURCE_HYDROGEN, amount: 5000 }]);
    } finally {
      marketManager.sellSurplusFromTerminal = originalSell;
    }
  });

  it("does not send energy when transfer cost would consume below requested amount plus fee", () => {
    let sendCount = 0;
    (Game.market as Market).calcTransactionCost = () => 600;
    const source = createRoom(
      "W1N1",
      createStore({ [RESOURCE_ENERGY]: 5500 }),
      (() => {
        sendCount++;
        return OK;
      }) as StructureTerminal["send"]
    );
    const target = createRoom("W2N2", createStore({ [RESOURCE_ENERGY]: 0 }));
    (Game.rooms as Record<string, Room>).W1N1 = source;
    (Game.rooms as Record<string, Room>).W2N2 = target;

    const manager = new TerminalManager({
      minBucket: 0,
      energySendThreshold: 999999,
      energyRequestThreshold: 0,
      capacityClearanceThreshold: 1.1
    });
    manager.queueTransfer("W1N1", "W2N2", RESOURCE_ENERGY, 5000, 10);
    manager.run();

    expect(sendCount).to.equal(0);
  });

  it("does not send resources into a terminal without destination capacity", () => {
    let sendCount = 0;
    (Game.market as Market).calcTransactionCost = () => 100;
    const source = createRoom(
      "W1N1",
      createStore({ [RESOURCE_ENERGY]: 10000, [RESOURCE_HYDROGEN]: 5000 }),
      (() => {
        sendCount++;
        return OK;
      }) as StructureTerminal["send"]
    );
    const target = createRoom("W2N2", createStore({ [RESOURCE_HYDROGEN]: 99000 }));
    (Game.rooms as Record<string, Room>).W1N1 = source;
    (Game.rooms as Record<string, Room>).W2N2 = target;

    const manager = new TerminalManager({
      minBucket: 0,
      energySendThreshold: 999999,
      energyRequestThreshold: 0,
      capacityClearanceThreshold: 1.1
    });
    manager.queueTransfer("W1N1", "W2N2", RESOURCE_HYDROGEN, 3000, 10);
    manager.run();

    expect(sendCount).to.equal(0);
  });

  it("balances minerals to an owned terminal that currently has zero stock", () => {
    const sends: Array<{ resource: ResourceConstant; amount: number; destination: string }> = [];
    (Game.market as Market).calcTransactionCost = () => 100;
    const source = createRoom(
      "W1N1",
      createStore({ [RESOURCE_ENERGY]: 10000, [RESOURCE_HYDROGEN]: 12000 }),
      ((resource, amount, destination) => {
        sends.push({ resource, amount, destination });
        return OK;
      }) as StructureTerminal["send"]
    );
    const target = createRoom("W2N2", createStore({ [RESOURCE_ENERGY]: 10000 }));
    (Game.rooms as Record<string, Room>).W1N1 = source;
    (Game.rooms as Record<string, Room>).W2N2 = target;

    new TerminalManager({
      minBucket: 0,
      energySendThreshold: 999999,
      energyRequestThreshold: 0,
      capacityClearanceThreshold: 1.1
    }).run();

    expect(sends).to.deep.equal([
      { resource: RESOURCE_HYDROGEN, amount: 6000, destination: "W2N2" }
    ]);
  });
});

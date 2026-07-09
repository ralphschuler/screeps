import { assert } from "chai";
import { clearGameObjectCache } from "@ralphschuler/screeps-cache";
import { Game as MockGame, Memory as MockMemory } from "./mock";
import { RoomManager, RoomNode } from "../../src/core/roomNode";

// Use global sinon from test setup (setup-mocha.mjs)
declare const sinon: typeof import("sinon");

function createRoom(name: string, owned: boolean): Room {
  return {
    name,
    controller: { my: owned } as StructureController,
    find: () => []
  } as unknown as Room;
}

describe("RoomManager owned-room cache", () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    clearGameObjectCache();
    sandbox = sinon.createSandbox();
    // @ts-ignore: globals provided by test setup
    global.Game = _.clone(MockGame);
    // @ts-ignore: globals provided by test setup
    global.Memory = _.clone(MockMemory);
  });

  afterEach(() => {
    sandbox.restore();
    clearGameObjectCache();
  });

  it("reuses the framework owned-room snapshot across room manager entry points in one tick", () => {
    const ownedRoom = createRoom("W1N1", true);
    const neutralRoom = createRoom("W2N2", false);
    const rooms = { W1N1: ownedRoom, W2N2: neutralRoom };
    let roomEnumerations = 0;

    // @ts-ignore: test setup for Game globals
    global.Game.time = 12345;
    // @ts-ignore: test setup for Game globals
    global.Game.rooms = new Proxy(rooms, {
      ownKeys(target) {
        roomEnumerations += 1;
        return Reflect.ownKeys(target);
      },
      getOwnPropertyDescriptor(target, property) {
        return Object.getOwnPropertyDescriptor(target, property);
      }
    });

    const runStub = sandbox.stub(RoomNode.prototype, "run");
    const manager = new RoomManager();

    manager.run();
    manager.runRoom(ownedRoom);

    assert.equal(roomEnumerations, 1, "same-tick RoomManager paths should share getOwnedRooms cache");
    sinon.assert.calledTwice(runStub);
    assert.deepEqual(runStub.firstCall.args, [1]);
    assert.deepEqual(runStub.secondCall.args, [1]);

    // @ts-ignore: test setup for Game globals
    global.Game.time += 1;

    manager.runRoom(ownedRoom);

    assert.equal(roomEnumerations, 2, "owned-room cache should refresh on the next tick");
    sinon.assert.calledThrice(runStub);
    assert.deepEqual(runStub.thirdCall.args, [1]);
  });
});

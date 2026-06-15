import { expect } from "chai";
import {
  getBucketWorkMode,
  getOwnedRoomsForTick,
  selectRoomsForPeriodicWork,
  shouldRunOptionalTickWork
} from "../../src/core/botTickLifecycle";

describe("bot tick lifecycle", () => {
  beforeEach(() => {
    delete (global as any)._ownedRooms;
    delete (global as any)._ownedRoomsTick;
  });

  it("caches owned rooms per tick for lifecycle phases", () => {
    let scans = 0;
    const owned = { name: "W1N1", controller: { my: true } } as Room;
    const neutral = { name: "W2N1", controller: { my: false } } as Room;

    const first = getOwnedRoomsForTick({
      tick: 10,
      rooms: () => {
        scans++;
        return [owned, neutral];
      },
      cache: global as unknown as Record<string, unknown>
    });
    const second = getOwnedRoomsForTick({
      tick: 10,
      rooms: () => {
        scans++;
        return [];
      },
      cache: global as unknown as Record<string, unknown>
    });

    expect(first).to.deep.equal([owned]);
    expect(second).to.equal(first);
    expect(scans).to.equal(1);
  });

  it("returns competitive bucket mode at key thresholds", () => {
    const toMode = (bucket: number) => getBucketWorkMode({ bucket });

    expect(toMode(9000)).to.equal("full");
    expect(toMode(8000)).to.equal("full");
    expect(toMode(7000)).to.equal("normal");
    expect(toMode(6000)).to.equal("normal");
    expect(toMode(5000)).to.equal("degraded");
    expect(toMode(1500)).to.equal("degraded");
    expect(toMode(1499)).to.equal("survival");
    expect(toMode(500)).to.equal("survival");
    expect(toMode(499)).to.equal("panic");
  });

  it("runs optional tick work only in full/normal bucket windows", () => {
    expect(shouldRunOptionalTickWork({ hasCpuBudget: true, bucketMode: "normal", bucket: 8000 })).to.equal(true);
    expect(shouldRunOptionalTickWork({ hasCpuBudget: true, bucketMode: "normal", bucket: 6000 })).to.equal(true);
    expect(shouldRunOptionalTickWork({ hasCpuBudget: true, bucketMode: "normal", bucket: 5000 })).to.equal(false);
    expect(shouldRunOptionalTickWork({ hasCpuBudget: false, bucketMode: "normal", bucket: 8000 })).to.equal(false);
    expect(shouldRunOptionalTickWork({ hasCpuBudget: true, bucketMode: "low", bucket: 3500 })).to.equal(false);
    expect(shouldRunOptionalTickWork({ hasCpuBudget: true, bucketMode: "low", bucket: 1500 })).to.equal(false);
    expect(shouldRunOptionalTickWork({ hasCpuBudget: true, bucketMode: "critical", bucket: 490 })).to.equal(false);
  });

  it("stagger-selects rooms for periodic lifecycle work", () => {
    const rooms = ["W1N1", "W2N1", "W3N1", "W4N1"].map(name => ({ name }) as Room);

    expect(selectRoomsForPeriodicWork({ tick: 10, rooms, interval: 3 }).map(room => room.name)).to.deep.equal([
      "W3N1"
    ]);
    expect(selectRoomsForPeriodicWork({ tick: 11, rooms, interval: 3 }).map(room => room.name)).to.deep.equal([
      "W2N1"
    ]);
    expect(selectRoomsForPeriodicWork({ tick: 12, rooms, interval: 3 }).map(room => room.name)).to.deep.equal([
      "W1N1",
      "W4N1"
    ]);
  });
});

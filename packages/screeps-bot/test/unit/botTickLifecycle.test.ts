import { expect } from "chai";
import { getOwnedRoomsForTick, shouldRunOptionalTickWork } from "../../src/core/botTickLifecycle";

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

  it("runs optional tick work only with CPU budget outside low/critical bucket modes", () => {
    expect(shouldRunOptionalTickWork({ hasCpuBudget: true, bucketMode: "normal" })).to.equal(true);
    expect(shouldRunOptionalTickWork({ hasCpuBudget: false, bucketMode: "normal" })).to.equal(false);
    expect(shouldRunOptionalTickWork({ hasCpuBudget: true, bucketMode: "low" })).to.equal(false);
    expect(shouldRunOptionalTickWork({ hasCpuBudget: true, bucketMode: "critical" })).to.equal(false);
  });
});

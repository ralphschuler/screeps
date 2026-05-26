import { assert } from "chai";
import { planEnemyTrackingIntent, planIntelScanIntent } from "../../src/empire/intelIntent";

describe("Intel intent Module", () => {
  it("prioritizes threatened and stale rooms for scanning", () => {
    const intent = planIntelScanIntent({
      time: 2000,
      rescanInterval: 1000,
      roomsPerTick: 2,
      knownRooms: [
        { roomName: "W1N1", lastSeen: 1500, threatLevel: 0 },
        { roomName: "W2N1", lastSeen: 1999, threatLevel: 2 },
        { roomName: "W3N1", lastSeen: 500, threatLevel: 0 },
        { roomName: "W4N1", lastSeen: 1000, threatLevel: 1 }
      ]
    });

    assert.deepEqual(intent.scanQueue, ["W2N1", "W4N1", "W3N1"]);
    assert.deepEqual(intent.roomsToScanThisTick, ["W2N1", "W4N1"]);
  });

  it("excludes allied sightings from enemy tracking", () => {
    const intent = planEnemyTrackingIntent(3000, [
      { username: "TooAngel", roomName: "W1N1", isAlly: true, hostileBodyParts: 50 },
      { username: "Enemy", roomName: "W2N1", isAlly: false, hostileBodyParts: 12 },
      { username: "Enemy", roomName: "W3N1", isAlly: false, hostileBodyParts: 30 }
    ]);

    assert.deepEqual(intent.enemies, [
      { username: "Enemy", lastSeen: 3000, rooms: ["W2N1", "W3N1"], threatLevel: 3, isAlly: false }
    ]);
  });
});

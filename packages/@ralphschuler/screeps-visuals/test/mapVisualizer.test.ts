import { expect } from "chai";
import { clearGameObjectCache, getGameObjectCacheStats } from "@ralphschuler/screeps-cache";
import { MapVisualizer } from "../src/mapVisualizer.ts";

type MutableGlobal = typeof globalThis & {
  Game: any;
  Memory: any;
  RoomPosition: any;
};

describe("MapVisualizer", () => {
  const g = globalThis as MutableGlobal;

  beforeEach(() => {
    clearGameObjectCache();
    g.Memory = { rooms: {}, creeps: {}, spawns: {}, flags: {}, powerCreeps: {} };
    g.Game = {
      time: 1000,
      rooms: {},
      map: undefined,
      market: { orders: {} }
    };
    g.RoomPosition = class MockRoomPosition {
      public constructor(
        public readonly x: number,
        public readonly y: number,
        public readonly roomName: string
      ) {}
    };
  });

  it("no-ops when the private-server map visual accessor throws", () => {
    Object.defineProperty(g.Game, "map", {
      configurable: true,
      get() {
        throw new TypeError("WorldMapGrid unavailable");
      }
    });

    const visualizer = new MapVisualizer();

    expect(() => visualizer.draw()).not.to.throw();
  });

  it("shares cached visible and owned room collections across overlays and ticks", () => {
    const calls: Array<{ method: string; roomName?: string; text?: string }> = [];
    const visual = {
      circle: (pos: RoomPosition) => {
        calls.push({ method: "circle", roomName: pos.roomName });
        return visual;
      },
      line: (from: RoomPosition, to: RoomPosition) => {
        calls.push({ method: "line", roomName: `${from.roomName}->${to.roomName}` });
        return visual;
      },
      rect: (pos: RoomPosition) => {
        calls.push({ method: "rect", roomName: pos.roomName });
        return visual;
      },
      text: (text: string, pos: RoomPosition) => {
        calls.push({ method: "text", roomName: pos.roomName, text });
        return visual;
      }
    };
    const findNone = () => [];

    g.Game.map = {
      visual,
      getRoomLinearDistance: () => 1
    };
    g.Game.rooms = {
      W1N1: {
        name: "W1N1",
        controller: { my: true, level: 4 },
        terminal: undefined,
        find: findNone
      },
      W2N1: {
        name: "W2N1",
        controller: { my: false },
        find: findNone
      },
      W10N10: {
        name: "W10N10",
        find: findNone
      }
    };

    const visualizer = new MapVisualizer({
      showRoomStatus: true,
      showConnections: true,
      showThreats: true,
      showExpansion: true,
      showResourceFlow: true,
      showHighways: true,
      opacity: 0.6
    }, {
      getOrInitSwarmState: () => ({ posture: "war", remoteAssignments: [], danger: 0 })
    });

    visualizer.draw();

    const afterFirstDraw = getGameObjectCacheStats();
    expect(afterFirstDraw).to.include({ misses: 2, size: 2 });
    expect(afterFirstDraw.hits).to.be.greaterThan(0);
    expect(calls.filter(call => call.text?.startsWith("RCL")).map(call => call.roomName)).to.deep.equal(["W1N1"]);
    expect(calls).to.deep.include({ method: "text", roomName: "W2N1", text: "EXP" });

    g.Game.rooms.W3N1 = {
      name: "W3N1",
      controller: { my: true, level: 8 },
      find: findNone
    };

    visualizer.draw();

    const afterSameTickDraw = getGameObjectCacheStats();
    expect(afterSameTickDraw.misses).to.equal(afterFirstDraw.misses);
    expect(afterSameTickDraw.hits).to.be.greaterThan(afterFirstDraw.hits);
    expect(calls.some(call => call.text === "RCL8" && call.roomName === "W3N1")).to.equal(false);

    g.Game.time += 1;
    visualizer.draw();

    const afterNextTickDraw = getGameObjectCacheStats();
    expect(afterNextTickDraw.misses).to.equal(afterFirstDraw.misses + 2);
    expect(afterNextTickDraw.evictions).to.equal(2);
    expect(calls).to.deep.include({ method: "text", roomName: "W3N1", text: "RCL8" });
  });

  it("skips map-distance overlays when room distance lookup throws", () => {
    const calls: string[] = [];
    const visual = {
      circle: () => { calls.push("circle"); return visual; },
      line: () => { calls.push("line"); return visual; },
      rect: () => { calls.push("rect"); return visual; },
      text: () => { calls.push("text"); return visual; }
    };

    g.Game.map = {
      visual,
      getRoomLinearDistance: () => {
        throw new TypeError("WorldMapGrid unavailable");
      }
    };
    g.Game.rooms = {
      W1N1: {
        name: "W1N1",
        controller: { my: true, level: 3 },
        find: () => []
      },
      W2N1: {
        name: "W2N1",
        find: () => [{}]
      }
    };

    const visualizer = new MapVisualizer({
      showRoomStatus: false,
      showConnections: true,
      showThreats: false,
      showExpansion: false,
      showResourceFlow: false,
      showHighways: false,
      opacity: 0.6
    }, {
      getOrInitSwarmState: () => ({ posture: "war", remoteAssignments: [], danger: 0 })
    });

    expect(() => visualizer.draw()).not.to.throw();
    expect(calls).not.to.include("line");
  });
});

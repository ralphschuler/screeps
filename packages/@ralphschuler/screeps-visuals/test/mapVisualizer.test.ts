import { expect } from "chai";
import { MapVisualizer } from "../src/mapVisualizer.ts";

type MutableGlobal = typeof globalThis & {
  Game: any;
  FIND_HOSTILE_CREEPS?: number;
};

describe("MapVisualizer", () => {
  const g = globalThis as MutableGlobal;

  beforeEach(() => {
    g.Game = {
      time: 1000,
      rooms: {},
      map: undefined,
      market: { orders: {} }
    };
    g.FIND_HOSTILE_CREEPS = 101;
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

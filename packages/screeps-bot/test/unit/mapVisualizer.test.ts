import { assert } from "chai";
import { clearGameObjectCache } from "@ralphschuler/screeps-cache";
import { MapVisualizer } from "../../src/visuals/mapVisualizer";
import { Game as MockGame, Memory as MockMemory } from "./mock";

// Use global sinon from test setup (setup-mocha.mjs)
declare const sinon: typeof import("sinon");

describe("MapVisualizer", () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    clearGameObjectCache();
    sandbox = sinon.createSandbox();

    // Reset global fixtures so tests are deterministic.
    // @ts-ignore: globals provided by test setup
    global.Game = _.clone(MockGame);
    // @ts-ignore: globals provided by test setup
    global.Memory = _.clone(MockMemory);
    global.Memory.rooms = {};

    // Keep map off by default to validate graceful no-op behavior
    delete (global.Game as any).map;
  });

  afterEach(() => {
    sandbox.restore();
    clearGameObjectCache();
  });

  it("no-op draws when Game.map is missing", () => {
    const visualizer = new MapVisualizer();
    assert.doesNotThrow(() => visualizer.draw());
  });

  it("no-op draws when private-server map visual access throws", () => {
    Object.defineProperty(global.Game, "map", {
      configurable: true,
      get() {
        throw new TypeError("WorldMapGrid unavailable");
      }
    });

    const visualizer = new MapVisualizer();
    assert.doesNotThrow(() => visualizer.draw());
  });

  it("skips expansion overlays when distance lookup throws", () => {
    const calls: string[] = [];
    const visual = {
      circle: () => {
        calls.push("circle");
        return visual as any;
      },
      line: () => {
        calls.push("line");
        return visual as any;
      },
      rect: () => {
        calls.push("rect");
        return visual as any;
      },
      text: () => {
        calls.push("text");
        return visual as any;
      }
    } as any;

    (global.Game as any).map = {
      visual,
      getRoomLinearDistance: () => {
        throw new Error("WorldMapGrid unavailable");
      }
    };
    (global.Game as any).rooms = {
      W1N1: {
        name: "W1N1",
        controller: { my: true, level: 3 },
        find: () => []
      } as any,
      W2N1: {
        name: "W2N1",
        controller: { my: false },
        find: () => []
      } as any
    };

    const visualizer = new MapVisualizer({
      showRoomStatus: false,
      showConnections: false,
      showThreats: false,
      showExpansion: true,
      showResourceFlow: false,
      showHighways: false,
      opacity: 0.6
    });

    assert.doesNotThrow(() => visualizer.draw());
    assert.notInclude(calls, "circle", "unavailable distance should skip expansion marker");
  });

  it("no-op draws when map visual API is incomplete", () => {
    (global.Game as any).map = {
      visual: {}
    };

    // Owned room to exercise draw paths without hostiles
    (global.Game as any).rooms = {
      W1N1: {
        name: "W1N1",
        controller: { my: true, level: 3 },
        find: () => []
      } as any
    };

    const visualizer = new MapVisualizer();
    assert.doesNotThrow(() => visualizer.draw());
  });

  it("calls map visual methods when API is available", () => {
    const calls: string[] = [];
    const visual = {
      circle: () => {
        calls.push("circle");
        return visual as any;
      },
      line: () => {
        calls.push("line");
        return visual as any;
      },
      rect: () => {
        calls.push("rect");
        return visual as any;
      },
      text: () => {
        calls.push("text");
        return visual as any;
      }
    } as any;

    (global.Game as any).map = { visual };
    (global.Game as any).rooms = {
      W1N1: {
        name: "W1N1",
        controller: { my: true, level: 3 },
        find: () => []
      } as any
    };

    const visualizer = new MapVisualizer({
      showThreats: true,
      showConnections: true,
      showResourceFlow: false,
      showExpansion: false,
      showHighways: false,
      showRoomStatus: true,
      opacity: 0.6
    });

    visualizer.draw();

    assert.include(calls, "circle", "room status drawing should call circle");
    assert.include(calls, "text", "room status/threat drawing should call text");
  });
});

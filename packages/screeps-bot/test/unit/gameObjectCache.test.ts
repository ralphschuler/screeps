import { expect } from "chai";
import { Game as MockGame } from "./mock";
import {
  getOwnedRooms,
  getCreepsByRole,
  getCreepsByRoom,
  getMyCreeps,
  getCreepCountByRole,
  getCreepCountByRoom,
  clearGameObjectCache
} from "../../src/cache";

describe("GameObjectCache", () => {
  let tickCounter = 0;

  beforeEach(() => {
    tickCounter++;
    // @ts-ignore test setup
    global.Game = {
      ...MockGame,
      time: tickCounter,
      rooms: {},
      creeps: {}
    };
    clearGameObjectCache();
  });

  describe("getOwnedRooms", () => {
    it("should return only owned rooms", () => {
      const ownedRoom = {
        name: "W1N1",
        controller: { my: true, level: 5 }
      } as Room;

      const notOwnedRoom = {
        name: "W2N2",
        controller: { my: false, level: 0 }
      } as Room;

      const noControllerRoom = {
        name: "W3N3",
        controller: undefined
      } as Room;

      // @ts-ignore test setup
      global.Game.rooms = {
        W1N1: ownedRoom,
        W2N2: notOwnedRoom,
        W3N3: noControllerRoom
      };

      const owned = getOwnedRooms();
      expect(owned).to.have.lengthOf(1);
      expect(owned[0].name).to.equal("W1N1");
    });

    it("should cache results for one tick", () => {
      const ownedRoom = {
        name: "W1N1",
        controller: { my: true, level: 5 }
      } as Room;

      // @ts-ignore test setup
      global.Game.rooms = { W1N1: ownedRoom };

      // First call computes
      const first = getOwnedRooms();
      expect(first).to.have.lengthOf(1);

      // Modify Game.rooms
      // @ts-ignore test setup
      global.Game.rooms = {};

      // Second call returns cached value (same tick)
      const second = getOwnedRooms();
      expect(second).to.have.lengthOf(1);

      // Next tick, cache expires
      tickCounter++;
      // @ts-ignore test setup
      global.Game.time = tickCounter;

      const third = getOwnedRooms();
      expect(third).to.have.lengthOf(0);
    });
  });

  describe("getCreepsByRole", () => {
    it("should return creeps filtered by role", () => {
      const harvester1 = {
        name: "harvester1",
        memory: { role: "harvester" },
        room: { name: "W1N1" }
      } as Creep;

      const harvester2 = {
        name: "harvester2",
        memory: { role: "harvester" },
        room: { name: "W1N1" }
      } as Creep;

      const builder = {
        name: "builder1",
        memory: { role: "builder" },
        room: { name: "W1N1" }
      } as Creep;

      // @ts-ignore test setup
      global.Game.creeps = {
        harvester1,
        harvester2,
        builder1: builder
      };

      const harvesters = getCreepsByRole("harvester");
      expect(harvesters).to.have.lengthOf(2);

      const builders = getCreepsByRole("builder");
      expect(builders).to.have.lengthOf(1);

      const scouts = getCreepsByRole("scout");
      expect(scouts).to.have.lengthOf(0);
    });

    it("should cache results per role", () => {
      const harvester = {
        name: "harvester1",
        memory: { role: "harvester" },
        room: { name: "W1N1" }
      } as Creep;

      // @ts-ignore test setup
      global.Game.creeps = { harvester1: harvester };

      // First call computes
      const first = getCreepsByRole("harvester");
      expect(first).to.have.lengthOf(1);

      // Remove creep
      // @ts-ignore test setup
      global.Game.creeps = {};

      // Second call returns cached value (same tick)
      const second = getCreepsByRole("harvester");
      expect(second).to.have.lengthOf(1);
    });
  });

  describe("getCreepsByRoom", () => {
    it("should return creeps filtered by room", () => {
      const creep1 = {
        name: "creep1",
        memory: { role: "harvester" },
        room: { name: "W1N1" }
      } as Creep;

      const creep2 = {
        name: "creep2",
        memory: { role: "builder" },
        room: { name: "W1N1" }
      } as Creep;

      const creep3 = {
        name: "creep3",
        memory: { role: "harvester" },
        room: { name: "W2N2" }
      } as Creep;

      // @ts-ignore test setup
      global.Game.creeps = { creep1, creep2, creep3 };

      const w1n1Creeps = getCreepsByRoom("W1N1");
      expect(w1n1Creeps).to.have.lengthOf(2);

      const w2n2Creeps = getCreepsByRoom("W2N2");
      expect(w2n2Creeps).to.have.lengthOf(1);

      const w3n3Creeps = getCreepsByRoom("W3N3");
      expect(w3n3Creeps).to.have.lengthOf(0);
    });
  });

  describe("getMyCreeps", () => {
    it("should return all creeps", () => {
      const creep1 = {
        name: "creep1",
        memory: { role: "harvester" }
      } as Creep;

      const creep2 = {
        name: "creep2",
        memory: { role: "builder" }
      } as Creep;

      // @ts-ignore test setup
      global.Game.creeps = { creep1, creep2 };

      const allCreeps = getMyCreeps();
      expect(allCreeps).to.have.lengthOf(2);
    });
  });

  describe("getCreepCountByRole", () => {
    it("should return count of creeps by role", () => {
      const harvester1 = {
        name: "harvester1",
        memory: { role: "harvester" }
      } as Creep;

      const harvester2 = {
        name: "harvester2",
        memory: { role: "harvester" }
      } as Creep;

      const builder = {
        name: "builder1",
        memory: { role: "builder" }
      } as Creep;

      // @ts-ignore test setup
      global.Game.creeps = { harvester1, harvester2, builder1: builder };

      expect(getCreepCountByRole("harvester")).to.equal(2);
      expect(getCreepCountByRole("builder")).to.equal(1);
      expect(getCreepCountByRole("scout")).to.equal(0);
    });
  });

  describe("getCreepCountByRoom", () => {
    it("should return count of creeps by room", () => {
      const creep1 = {
        name: "creep1",
        room: { name: "W1N1" }
      } as Creep;

      const creep2 = {
        name: "creep2",
        room: { name: "W1N1" }
      } as Creep;

      const creep3 = {
        name: "creep3",
        room: { name: "W2N2" }
      } as Creep;

      // @ts-ignore test setup
      global.Game.creeps = { creep1, creep2, creep3 };

      expect(getCreepCountByRoom("W1N1")).to.equal(2);
      expect(getCreepCountByRoom("W2N2")).to.equal(1);
      expect(getCreepCountByRoom("W3N3")).to.equal(0);
    });
  });
});

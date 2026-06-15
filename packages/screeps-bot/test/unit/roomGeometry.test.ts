import { expect } from "chai";

import { classifyRoomName, isHighwayRoom, isSourceKeeperRoom, parseRoomName } from "../../src/empire/roomGeometry";

describe("Room geometry helpers", () => {
  it("parses west room names using signed coordinates", () => {
    expect(parseRoomName("W9N4")).to.deep.equal({ x: -10, y: -5, xDir: "W", yDir: "N" });
    expect(parseRoomName("W10N1")).to.deep.equal({ x: -11, y: -2, xDir: "W", yDir: "N" });
    expect(parseRoomName("E4S4")).to.deep.equal({ x: 4, y: 4, xDir: "E", yDir: "S" });
    expect(parseRoomName("invalid-room")).to.equal(null);
  });

  it("classifies highway rooms with signed/raw mixed conventions", () => {
    expect(isHighwayRoom("E10N10")).to.equal(true);
    expect(isHighwayRoom("W10N1")).to.equal(true);
    expect(isHighwayRoom("W9N1")).to.equal(true);
    expect(isHighwayRoom("W0N0")).to.equal(true);
    expect(isHighwayRoom("E11N7")).to.equal(false);
  });

  it("classifies source keeper rooms with signed coordinates", () => {
    expect(isSourceKeeperRoom("E5N5")).to.equal(true);
    expect(isSourceKeeperRoom("W5N5")).to.equal(true);
    expect(isSourceKeeperRoom("W6N6")).to.equal(false);
    expect(isSourceKeeperRoom("W9N9")).to.equal(false);
  });

  it("reuses shared classification in room-intel snapshot", () => {
    expect(classifyRoomName("W9N1")).to.deep.equal({ isHighway: true, isSK: false });
  });
});

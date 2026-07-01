import { expect } from "chai";

import { classifyRoomName, isHighwayRoom, isSourceKeeperRoom, parseRoomName } from "../src/roomGeometry";

describe("roomGeometry", () => {
  it("parses room names into signed map coordinates", () => {
    expect(parseRoomName("W9N4")).to.deep.equal({ x: -10, y: -5, xDir: "W", yDir: "N" });
    expect(parseRoomName("W10N1")).to.deep.equal({ x: -11, y: -2, xDir: "W", yDir: "N" });
    expect(parseRoomName("E4S4")).to.deep.equal({ x: 4, y: 4, xDir: "E", yDir: "S" });
    expect(parseRoomName("invalid-room")).to.equal(null);
  });

  it("classifies highways with raw room-name indices", () => {
    expect(isHighwayRoom("E10N10")).to.equal(true);
    expect(isHighwayRoom("W10N1")).to.equal(true);
    expect(isHighwayRoom("W9N1")).to.equal(false);
    expect(isHighwayRoom("W19S26")).to.equal(false);
    expect(isHighwayRoom("W0N0")).to.equal(true);
    expect(isHighwayRoom("E11N7")).to.equal(false);
  });

  it("classifies source keeper rooms with raw room-name indices", () => {
    expect(isSourceKeeperRoom("E5N5")).to.equal(true);
    expect(isSourceKeeperRoom("W5N5")).to.equal(true);
    expect(isSourceKeeperRoom("W6N6")).to.equal(true);
    expect(isSourceKeeperRoom("W16S24")).to.equal(true);
    expect(isSourceKeeperRoom("W9N9")).to.equal(false);
  });

  it("provides a compact room-intel classification", () => {
    expect(classifyRoomName("W10N1")).to.deep.equal({ isHighway: true, isSK: false });
    expect(classifyRoomName("W16S24")).to.deep.equal({ isHighway: false, isSK: true });
  });
});

import { expect } from "chai";
import { globalCache } from "../src/cache";
import { getNextPatrolWaypoint, getPatrolWaypoints } from "../src/behaviors/military/patrolWaypoints";
import { createMockCreep, createMockRoom, resetMockGame } from "./setup";

type PositionTuple = [number, number, string];

interface PatrolRoomHarness {
  room: Room;
  setSpawns(spawns: StructureSpawn[]): void;
  setWalls(walls: Array<[number, number]>): void;
  terrainLookups(): number;
}

function makeSpawn(x: number, y: number, roomName = "W1N1"): StructureSpawn {
  return { pos: new RoomPosition(x, y, roomName) } as StructureSpawn;
}

function coords(waypoints: RoomPosition[]): PositionTuple[] {
  return waypoints.map(pos => [pos.x, pos.y, pos.roomName]);
}

function makePatrolRoom(spawns: StructureSpawn[] = []): PatrolRoomHarness {
  const room = createMockRoom("W1N1");
  let currentSpawns = spawns;
  let currentWalls = new Set<string>();
  let terrainLookupCount = 0;

  (room as unknown as { find: Room["find"] }).find = ((type: FindConstant) => {
    if (type === FIND_MY_SPAWNS) return currentSpawns;
    return [];
  }) as Room["find"];

  (room as unknown as { getTerrain: Room["getTerrain"] }).getTerrain = () => ({
    get: (x: number, y: number) => {
      terrainLookupCount++;
      return currentWalls.has(`${x},${y}`) ? TERRAIN_MASK_WALL : 0;
    }
  } as RoomTerrain);

  return {
    room,
    setSpawns(nextSpawns: StructureSpawn[]): void {
      currentSpawns = nextSpawns;
    },
    setWalls(walls: Array<[number, number]>): void {
      currentWalls = new Set(walls.map(([x, y]) => `${x},${y}`));
    },
    terrainLookups(): number {
      return terrainLookupCount;
    }
  };
}

describe("military patrol waypoints", () => {
  beforeEach(() => {
    resetMockGame();
    globalCache.clear("patrol");
  });

  it("builds deterministic spawn, exit, corner, and center coverage", () => {
    const harness = makePatrolRoom([makeSpawn(25, 25)]);

    const waypoints = getPatrolWaypoints(harness.room);

    expect(coords(waypoints)).to.deep.equal([
      [28, 28, "W1N1"],
      [22, 22, "W1N1"],
      [10, 5, "W1N1"],
      [25, 5, "W1N1"],
      [39, 5, "W1N1"],
      [10, 44, "W1N1"],
      [25, 44, "W1N1"],
      [39, 44, "W1N1"],
      [5, 10, "W1N1"],
      [5, 25, "W1N1"],
      [5, 39, "W1N1"],
      [44, 10, "W1N1"],
      [44, 25, "W1N1"],
      [44, 39, "W1N1"],
      [10, 10, "W1N1"],
      [39, 10, "W1N1"],
      [10, 39, "W1N1"],
      [39, 39, "W1N1"],
      [25, 25, "W1N1"]
    ]);
  });

  it("clamps spawn-offset waypoints before filtering wall terrain", () => {
    const harness = makePatrolRoom([makeSpawn(1, 1)]);
    harness.setWalls([[4, 4]]);

    const waypoints = getPatrolWaypoints(harness.room);

    expect(coords(waypoints).slice(0, 2)).to.deep.equal([
      [2, 2, "W1N1"],
      [10, 5, "W1N1"]
    ]);
    expect(coords(waypoints)).not.to.deep.include([4, 4, "W1N1"]);
  });

  it("reuses cached terrain-filtered waypoints while spawn count is unchanged", () => {
    const harness = makePatrolRoom([makeSpawn(25, 25)]);
    const first = getPatrolWaypoints(harness.room);
    const firstTerrainLookups = harness.terrainLookups();

    harness.setWalls([[28, 28], [22, 22], [25, 25]]);
    const second = getPatrolWaypoints(harness.room);

    expect(coords(second)).to.deep.equal(coords(first));
    expect(harness.terrainLookups()).to.equal(firstTerrainLookups);
  });

  it("regenerates cached waypoints when spawn count changes", () => {
    const harness = makePatrolRoom([makeSpawn(25, 25)]);
    getPatrolWaypoints(harness.room);
    const firstTerrainLookups = harness.terrainLookups();

    harness.setSpawns([makeSpawn(25, 25), makeSpawn(10, 10)]);
    const second = getPatrolWaypoints(harness.room);

    expect(harness.terrainLookups()).to.be.greaterThan(firstTerrainLookups);
    expect(coords(second).slice(0, 4)).to.deep.equal([
      [28, 28, "W1N1"],
      [22, 22, "W1N1"],
      [13, 13, "W1N1"],
      [7, 7, "W1N1"]
    ]);
  });

  it("returns null for empty waypoint lists without writing patrol memory", () => {
    const creep = createMockCreep("guard1", { memory: { role: "guard", homeRoom: "W1N1" } });

    const waypoint = getNextPatrolWaypoint(creep, []);

    expect(waypoint).to.equal(null);
    expect("patrolIndex" in creep.memory).to.equal(false);
  });

  it("initializes patrol memory to the first waypoint while far away", () => {
    const creep = createMockCreep("guard1", {
      memory: { role: "guard", homeRoom: "W1N1" },
      pos: { getRangeTo: () => 3 }
    });
    const waypoints = [new RoomPosition(10, 10, "W1N1"), new RoomPosition(20, 20, "W1N1")];

    const waypoint = getNextPatrolWaypoint(creep, waypoints);

    expect(waypoint).to.equal(waypoints[0]);
    expect((creep.memory as CreepMemory & { patrolIndex?: number }).patrolIndex).to.equal(0);
  });

  it("advances when within range two and wraps after the last waypoint", () => {
    const creep = createMockCreep("guard1", {
      memory: { role: "guard", homeRoom: "W1N1", patrolIndex: 0 },
      pos: { getRangeTo: () => 2 }
    });
    const waypoints = [new RoomPosition(10, 10, "W1N1"), new RoomPosition(20, 20, "W1N1")];

    expect(getNextPatrolWaypoint(creep, waypoints)).to.equal(waypoints[1]);
    expect((creep.memory as CreepMemory & { patrolIndex?: number }).patrolIndex).to.equal(1);

    expect(getNextPatrolWaypoint(creep, waypoints)).to.equal(waypoints[0]);
    expect((creep.memory as CreepMemory & { patrolIndex?: number }).patrolIndex).to.equal(0);
  });
});

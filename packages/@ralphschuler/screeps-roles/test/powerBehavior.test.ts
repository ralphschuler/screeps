import { expect } from "chai";
import { clearRoomCaches, createContext } from "../src/index";
import { evaluatePowerBehavior } from "../src/behaviors/power";
import { createMockCreep, createMockRoom, resetMockGame } from "./setup";

describe("power behavior", () => {
  beforeEach(() => {
    resetMockGame();
    clearRoomCaches();
  });

  it("routes power harvesters with operation target-room memory instead of idling", () => {
    const room = createMockRoom("W1N1");
    const creep = createMockCreep("powerHarvester1", {
      room,
      memory: { role: "powerHarvester", family: "power", homeRoom: "W1N1", targetRoom: "W10N10", version: 1 }
    });
    Game.rooms[room.name] = room;
    Game.creeps[creep.name] = creep;

    const action = evaluatePowerBehavior(createContext(creep));

    expect(action).to.deep.equal({ type: "moveToRoom", roomName: "W10N10" });
  });

  it("collects dropped power in the operation target room", () => {
    const droppedPower = { id: "power1", resourceType: RESOURCE_POWER } as Resource<RESOURCE_POWER>;
    const room = createMockRoom("W10N10");
    (room as unknown as { find: Room["find"] }).find = ((type: FindConstant, opts?: { filter?: (value: unknown) => boolean }) => {
      if (type === FIND_DROPPED_RESOURCES) {
        return opts?.filter ? [droppedPower].filter(opts.filter) : [droppedPower];
      }
      if (type === FIND_STRUCTURES || type === FIND_RUINS || type === FIND_MY_CREEPS) return [];
      return [];
    }) as Room["find"];
    const creep = createMockCreep("powerCarrier1", {
      room,
      memory: { role: "powerCarrier", family: "power", homeRoom: "W1N1", targetRoom: "W10N10", version: 1 },
      store: {
        getUsedCapacity: () => 0,
        getFreeCapacity: () => 50,
        getCapacity: () => 50
      }
    });
    Game.rooms[room.name] = room;
    Game.creeps[creep.name] = creep;
    clearRoomCaches();

    const action = evaluatePowerBehavior(createContext(creep));

    expect(action).to.deep.equal({ type: "pickup", target: droppedPower });
  });
});

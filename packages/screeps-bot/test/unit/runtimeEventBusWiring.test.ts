import { expect } from "chai";
import { eventBus } from "../../src/core/events";
import { kernel } from "../../src/core/kernel";
import { BotEventBusAdapter } from "../../src/utils/pathfinding/pathfindingAdapter";
import { Game, Memory } from "./mock";

describe("runtime event bus wiring", () => {
  beforeEach(() => {
    (global as any).Game = {
      ...Game,
      time: 12345,
      cpu: {
        ...Game.cpu,
        bucket: 10000
      }
    };
    (global as any).Memory = { ...Memory };
    eventBus.clear();
  });

  afterEach(() => {
    eventBus.clear();
  });

  it("routes path cache subscriptions through events emitted by the kernel", () => {
    const adapter = new BotEventBusAdapter();
    let observedRoom: string | undefined;
    let observedStructure: StructureConstant | undefined;

    adapter.on("structure.destroyed", event => {
      observedRoom = event.roomName;
      observedStructure = event.structureType;
    });

    kernel.emit("structure.destroyed", {
      roomName: "W1N1",
      structureType: "road" as StructureConstant,
      structureId: "road-1"
    });

    expect(observedRoom).to.equal("W1N1");
    expect(observedStructure).to.equal("road");
  });
});

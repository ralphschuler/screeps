import { expect } from "chai";
import { UICommands } from "../../src/core/uiCommands";

describe("UICommands", () => {
  beforeEach(() => {
    (global as any).Game = {
      time: 1234,
      rooms: {},
      creeps: {}
    };
  });

  it("escapes room names embedded in spawn form commands", () => {
    const roomName = "W1N1']; return 'owned'; //";
    (global as any).Game.rooms[roomName] = {
      find: () => [],
      energyAvailable: 300,
      energyCapacityAvailable: 300
    };

    const output = new UICommands().spawnForm(roomName);

    const escapedRoomLiteral = JSON.stringify(roomName).replace(/"/g, "&quot;");

    expect(output).to.include(escapedRoomLiteral);
    expect(output).to.not.include(`Game.rooms['${roomName}']`);
  });
});

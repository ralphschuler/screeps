import { expect } from "chai";
import type { BotConfig } from "../../src/config";
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

  it("only writes typed BotConfig keys from quick actions", () => {
    const output = new UICommands().quickActions();
    const typedBotConfigKeys = new Set<keyof BotConfig>([
      "pheromone",
      "war",
      "nuke",
      "expansion",
      "cpu",
      "market",
      "spawn",
      "boost",
      "debug",
      "profiling",
      "visualizations",
      "lazyLoadConsoleCommands"
    ]);
    const updatedConfigKeys = [...output.matchAll(/updateConfig\(\{([A-Za-z_$][\w$]*)\s*:/g)].map(match => match[1]);

    expect(output).to.include("🐛 Toggle Debug");
    expect(output).to.include("🗑️ Clear Cache");
    expect(output).to.not.include("Emergency Mode");
    expect(output).to.not.include("emergencyMode");
    expect(updatedConfigKeys).to.deep.equal(["debug"]);
    expect(updatedConfigKeys.every(key => typedBotConfigKeys.has(key as keyof BotConfig))).to.equal(true);
  });
});

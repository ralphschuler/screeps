import { expect } from "chai";
import { PowerBankHarvestingManager, type PowerBankOperation } from "../../src/empire/powerBankHarvesting";

describe("PowerBankHarvestingManager", () => {
  beforeEach(() => {
    Game.time = 1000;
    Game.creeps = {};
  });

  it("returns operation-scoped spawn needs and counts active/spawning creeps by target room", () => {
    const manager = new PowerBankHarvestingManager({ healerRatio: 1 });
    const operation: PowerBankOperation = {
      roomName: "W10N10",
      pos: { x: 25, y: 25 },
      power: 4000,
      decayTick: Game.time + 5000,
      homeRoom: "W1N1",
      state: "attacking",
      assignedCreeps: { attackers: [], healers: [], carriers: [] },
      damageDealt: 0,
      powerCollected: 0,
      startedAt: Game.time,
      estimatedCompletion: 0
    };
    (manager as unknown as { operations: Map<string, PowerBankOperation> }).operations.set(operation.roomName, operation);

    Game.creeps.activeHarvester = {
      name: "activeHarvester",
      spawning: false,
      memory: { role: "powerHarvester", family: "power", homeRoom: "W1N1", targetRoom: "W10N10", version: 1 }
    } as Creep;
    Game.creeps.activeHealer = {
      name: "activeHealer",
      spawning: false,
      memory: { role: "healer", family: "military", homeRoom: "W1N1", targetRoom: "W10N10", task: "powerBank", version: 1 }
    } as Creep;
    Game.creeps.spawningCarrier = {
      name: "spawningCarrier",
      spawning: true,
      memory: { role: "powerCarrier", family: "power", homeRoom: "W1N1", targetRoom: "W10N10", version: 1 }
    } as Creep;
    Game.creeps.otherOperationCarrier = {
      name: "otherOperationCarrier",
      spawning: true,
      memory: { role: "powerCarrier", family: "power", homeRoom: "W1N1", targetRoom: "W11N10", version: 1 }
    } as Creep;

    const requests = manager.requestSpawns("W1N1");

    expect(requests.powerHarvesters).to.equal(0);
    expect(requests.healers).to.equal(0);
    expect(requests.powerCarriers).to.equal(1);
    expect(requests.operations).to.deep.equal([
      { targetRoom: "W10N10", powerHarvesters: 0, healers: 0, powerCarriers: 1 }
    ]);
  });
});

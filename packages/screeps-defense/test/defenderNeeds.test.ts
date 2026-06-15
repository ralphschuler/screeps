import { expect } from "chai";
import { createDefenseRequest, needsDefenseAssistance } from "../src/analysis/defenderNeeds";
import { EmergencyResponseManager, EmergencyLevel } from "../src/emergency/emergencyResponse";

function createHostile(parts: BodyPartConstant[]): Creep {
  return {
    owner: { username: "Invader" },
    hits: 100,
    body: parts.map(type => ({ type, hits: 100 })),
    pos: { getRangeTo: () => 10 } as unknown as RoomPosition
  } as unknown as Creep;
}

function createRoom(hostiles: Creep[]): Room {
  const spawn = { spawning: false };
  return {
    name: "W1N1",
    energyAvailable: 800,
    energyCapacityAvailable: 800,
    controller: { my: true, level: 4 },
    find: (type: FindConstant) => {
      if (type === FIND_HOSTILE_CREEPS) return hostiles;
      if (type === FIND_MY_CREEPS) return [];
      if (type === FIND_MY_SPAWNS) return [spawn];
      if (type === FIND_MY_STRUCTURES) return [];
      return [];
    }
  } as unknown as Room;
}

describe("defense assistance needs", () => {
  beforeEach(() => {
    (globalThis as any).Game = { time: 1000 };
    (globalThis as any).Memory = {};
  });

  it("requests cross-room assistance for visible dangerous hostiles even before danger reaches siege levels", () => {
    const room = createRoom([createHostile([ATTACK, MOVE])]);
    const swarm = { danger: 1 } as any;

    expect(needsDefenseAssistance(room, swarm)).to.equal(true);
    const request = createDefenseRequest(room, swarm);
    expect(request?.roomName).to.equal("W1N1");
    expect(request?.guardsNeeded).to.be.greaterThan(0);
  });

  it("emergency response writes a defense request as soon as a hostile is visible", () => {
    const room = createRoom([createHostile([WORK, MOVE])]);
    const manager = new EmergencyResponseManager();
    const swarm = {
      danger: 0,
      posture: "eco",
      pheromones: { defense: 0, war: 0, siege: 0 }
    } as any;

    const state = manager.assess(room, swarm);

    expect(state.level).to.equal(EmergencyLevel.LOW);
    expect((Memory as any).defenseRequests?.[0]?.roomName).to.equal("W1N1");
  });
});

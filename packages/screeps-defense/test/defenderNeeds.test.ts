import { expect } from "chai";
import {
  analyzeDefenderNeeds,
  createDefenseRequest,
  getCurrentDefenders,
  needsDefenseAssistance,
} from "../src/analysis/defenderNeeds";
import { EmergencyResponseManager, EmergencyLevel } from "../src/emergency/emergencyResponse";

function createHostile(parts: BodyPartConstant[], boost?: string): Creep {
  return {
    owner: { username: "Invader" },
    hits: 100,
    body: parts.map(type => ({ type, hits: 100, ...(boost ? { boost } : {}) })),
    pos: { getRangeTo: () => 10 } as unknown as RoomPosition
  } as unknown as Creep;
}

function repeatedParts(part: BodyPartConstant, count: number): BodyPartConstant[] {
  return Array.from({ length: count }, () => part);
}

function createRoom(hostiles: Creep[], controllerLevel = 4, spawnCount = 1, friendlyRoles: string[] = []): Room {
  const spawns = Array.from({ length: spawnCount }, () => ({ spawning: false }));
  const friendlyCreeps = friendlyRoles.map(role => ({ memory: { role } }));
  return {
    name: "W1N1",
    energyAvailable: 800,
    energyCapacityAvailable: 800,
    controller: { my: true, level: controllerLevel },
    find: (type: FindConstant) => {
      if (type === FIND_HOSTILE_CREEPS) return hostiles;
      if (type === FIND_MY_CREEPS) return friendlyCreeps;
      if (type === FIND_MY_SPAWNS) return spawns;
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

  it("does not create defender requirements for peaceful RCL3+ rooms", () => {
    const room = createRoom([], 4, 1);

    expect(analyzeDefenderNeeds(room)).to.deep.equal({
      guards: 0,
      rangers: 0,
      healers: 0,
      urgency: 1.0,
      reasons: [],
    });
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

  it("refreshes an active defense request when the visible attack force grows", () => {
    const manager = new EmergencyResponseManager();
    const swarm = {
      danger: 0,
      posture: "eco",
      pheromones: { defense: 0, war: 0, siege: 0 }
    } as any;

    manager.assess(createRoom([createHostile([RANGED_ATTACK, MOVE])], 1, 0), swarm);
    const first = (Memory as any).defenseRequests?.[0];

    (Game as any).time = 1010;
    const grownAttack = [
      createHostile([...repeatedParts(RANGED_ATTACK, 3), ...repeatedParts(MOVE, 4), HEAL]),
      createHostile([RANGED_ATTACK, ...repeatedParts(MOVE, 3), HEAL, HEAL]),
      createHostile([...repeatedParts(ATTACK, 5), ...repeatedParts(MOVE, 5)]),
      createHostile([...repeatedParts(RANGED_ATTACK, 3), ...repeatedParts(MOVE, 4), HEAL]),
      createHostile([...repeatedParts(ATTACK, 5), ...repeatedParts(MOVE, 5)]),
      createHostile([RANGED_ATTACK, ...repeatedParts(MOVE, 3), HEAL, HEAL])
    ];
    manager.assess(createRoom(grownAttack, 1, 0), swarm);

    const refreshed = (Memory as any).defenseRequests?.[0];
    expect(first?.threat).to.not.equal(refreshed?.threat);
    expect(refreshed?.guardsNeeded).to.be.greaterThan(first?.guardsNeeded ?? 0);
    expect(refreshed?.rangersNeeded).to.be.greaterThan(first?.rangersNeeded ?? 0);
    expect(refreshed?.healersNeeded).to.be.greaterThan(first?.healersNeeded ?? 0);
    expect(refreshed?.createdAt).to.equal(Game.time);
    expect(refreshed?.threat).to.include("6 hostiles");
  });

  it("requests bootstrap defense for spawn-less RCL <=3 rooms with any hostile sighting", () => {
    const room = createRoom([createHostile([MOVE])], 2, 0);
    const swarm = { danger: 0 } as any;

    expect(needsDefenseAssistance(room, swarm)).to.equal(true);
    const request = createDefenseRequest(room, swarm);

    expect(request).to.not.equal(null);
    expect(request?.guardsNeeded).to.equal(1);
    expect(request?.threat).to.include("bootstrap defense gap");
  });

  it("records the tick when an existing emergency escalates", () => {
    const manager = new EmergencyResponseManager();
    const swarm = {
      danger: 0,
      posture: "eco",
      pheromones: { defense: 0, war: 0, siege: 0 }
    } as any;

    const lowState = manager.assess(createRoom([createHostile([MOVE])]), swarm);
    expect(lowState.level).to.equal(EmergencyLevel.LOW);
    expect(lowState.lastEscalation).to.equal(0);

    (Game as any).time = 1015;
    const escalated = manager.assess(
      createRoom([
        createHostile([...repeatedParts(RANGED_ATTACK, 2), MOVE, MOVE], "XKHO2"),
        createHostile([ATTACK, MOVE])
      ]),
      swarm
    );

    expect(escalated.level).to.equal(EmergencyLevel.HIGH);
    expect(escalated.lastEscalation).to.equal(1015);
  });

  it("does not let surplus guards mask a ranger deficit when assessing emergencies", () => {
    const manager = new EmergencyResponseManager();
    const swarm = {
      danger: 2,
      posture: "eco",
      pheromones: { defense: 0, war: 0, siege: 0 }
    } as any;
    const surplusGuards = Array.from({ length: 10 }, () => "guard");
    const room = createRoom(
      [createHostile([...repeatedParts(RANGED_ATTACK, 2), MOVE, MOVE], "XKHO2")],
      4,
      1,
      surplusGuards
    );

    const state = manager.assess(room, swarm);

    expect(state.level).to.equal(EmergencyLevel.HIGH);
  });

  it("does not count spawning or disarmed defenders as current defense", () => {
    const creeps = [
      { spawning: true, memory: { role: "guard" }, body: [{ type: ATTACK, hits: 100 }] },
      { spawning: false, memory: { role: "guard" }, body: [{ type: ATTACK, hits: 0 }] },
      { spawning: false, memory: { role: "ranger" }, body: [{ type: RANGED_ATTACK, hits: 0 }] },
      { spawning: false, memory: { role: "healer" }, body: [{ type: HEAL, hits: 0 }] },
    ] as unknown as Creep[];
    const room = {
      find: (type: FindConstant) => (type === FIND_MY_CREEPS ? creeps : []),
    } as unknown as Room;

    expect(getCurrentDefenders(room)).to.deep.equal({ guards: 0, rangers: 0, healers: 0 });
  });

  it("does not force defense when bootstrap room is empty", () => {
    const room = createRoom([], 2, 0);
    const swarm = { danger: 0 } as any;

    expect(needsDefenseAssistance(room, swarm)).to.equal(false);
    expect(createDefenseRequest(room, swarm)).to.equal(null);
  });

  it("ignores destroyed hostile combat parts when sizing defenders", () => {
    const disarmedHostile = {
      owner: { username: "Invader" },
      hits: 100,
      body: [
        { type: ATTACK, hits: 0 },
        { type: RANGED_ATTACK, hits: 0 },
        { type: HEAL, hits: 0 },
        { type: WORK, hits: 0 },
        { type: MOVE, hits: 100 },
      ],
      pos: { getRangeTo: () => 10 } as unknown as RoomPosition,
    } as unknown as Creep;
    const room = createRoom([disarmedHostile], 2, 1);

    expect(analyzeDefenderNeeds(room)).to.deep.equal({
      guards: 0,
      rangers: 0,
      healers: 0,
      urgency: 1.0,
      reasons: [],
    });
    expect(needsDefenseAssistance(room, { danger: 0 } as any)).to.equal(false);
    expect(createDefenseRequest(room, { danger: 0 } as any)).to.equal(null);
  });
});

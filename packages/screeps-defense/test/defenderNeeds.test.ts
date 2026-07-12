import { expect } from "chai";
import {
  analyzeDefenderNeeds,
  createDefenseRequest,
  getCombatEscortRequirement,
  countActiveCombatDefenders,
  getCurrentDefenders,
  hasActiveDefenseThreat,
  hasSufficientCombatEscort,
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

function createRoom(
  hostiles: Creep[],
  controllerLevel = 4,
  spawnCount = 1,
  friendlyRoles: string[] = [],
  controllerOwned = true,
  criticalStructure = false,
  incomingNukeCount = 0
): Room {
  const spawns = Array.from({ length: spawnCount }, () => ({ spawning: false }));
  const friendlyCreeps = friendlyRoles.map(role => ({
    spawning: false,
    memory: { role },
    body: [{ type: role === "ranger" ? RANGED_ATTACK : role === "healer" ? HEAL : ATTACK, hits: 100 }]
  }));
  return {
    name: "W1N1",
    energyAvailable: 800,
    energyCapacityAvailable: 800,
    controller: { my: controllerOwned, level: controllerLevel },
    find: (type: FindConstant) => {
      if (type === FIND_HOSTILE_CREEPS) return hostiles;
      if (type === FIND_MY_CREEPS) return friendlyCreeps;
      if (type === FIND_MY_SPAWNS) return spawns;
      if (type === FIND_MY_STRUCTURES) {
        return criticalStructure
          ? [{ structureType: STRUCTURE_SPAWN, hits: 10, hitsMax: 100 }]
          : [];
      }
      if (type === FIND_NUKES) return Array.from({ length: incomingNukeCount }, () => ({}));
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

  it("escalates clustered ranged-heal owned-room attacks above low alert", () => {
    const manager = new EmergencyResponseManager();
    const swarm = {
      danger: 0,
      posture: "eco",
      pheromones: { defense: 0, war: 0, siege: 0 }
    } as any;
    const rangedHealBody = [
      ...repeatedParts(RANGED_ATTACK, 14),
      ...repeatedParts(MOVE, 25),
      ...repeatedParts(HEAL, 11),
    ];
    const room = createRoom([
      createHostile(rangedHealBody),
      createHostile(rangedHealBody),
      createHostile(rangedHealBody),
      createHostile(rangedHealBody),
    ], 5, 1);

    const needs = analyzeDefenderNeeds(room);
    const state = manager.assess(room, swarm);
    const request = (Memory as any).defenseRequests?.[0];

    expect(needs.urgency).to.be.at.least(2);
    expect(needs.reasons.join("; ")).to.include("coordinated ranged-heal attack");
    expect(state.level).to.equal(EmergencyLevel.HIGH);
    expect(request?.urgency).to.be.at.least(2);
    expect(request?.rangersNeeded).to.be.greaterThan(0);
    expect(request?.healersNeeded).to.be.greaterThan(0);
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

  it("escalates hostile spawnless owned rooms at any RCL to emergency assistance", () => {
    const room = createRoom([createHostile([ATTACK, MOVE])], 5, 0);
    const swarm = { danger: 0 } as any;

    const needs = analyzeDefenderNeeds(room);
    const request = createDefenseRequest(room, swarm);

    expect(needs.urgency).to.equal(3.0);
    expect(needs.reasons.join("; ")).to.include("no local spawn capacity");
    expect(request).to.not.equal(null);
    expect(request?.urgency).to.equal(3.0);
    expect(request?.guardsNeeded).to.be.greaterThan(0);
    expect(request?.threat).to.include("no local spawn capacity");
  });

  it("keeps no-spawn hostile urgency at emergency level when attackers are boosted", () => {
    const room = createRoom([createHostile([ATTACK, MOVE], "XUH2O")], 5, 0);

    const needs = analyzeDefenderNeeds(room);

    expect(needs.urgency).to.equal(3.0);
    expect(needs.reasons.join("; ")).to.include("boosted enemies");
  });

  it("treats zero room energy capacity under hostile pressure as no local spawn capacity", () => {
    const room = createRoom([createHostile([ATTACK, MOVE])], 5, 1) as Room & { energyCapacityAvailable: number };
    room.energyCapacityAvailable = 0;

    const needs = analyzeDefenderNeeds(room);

    expect(needs.urgency).to.equal(3.0);
    expect(needs.reasons.join("; ")).to.include("no local spawn capacity");
  });

  it("does not apply owned-room spawnless recovery escalation to neutral rooms", () => {
    const room = createRoom([createHostile([ATTACK, MOVE])], 0, 0, [], false);

    const needs = analyzeDefenderNeeds(room);

    expect(needs.urgency).to.equal(1.0);
    expect(needs.guards).to.equal(1);
    expect(needs.reasons.join("; ")).to.not.include("no local spawn capacity");
  });

  it("clears boost priority when an active emergency resolves", () => {
    const manager = new EmergencyResponseManager();
    const swarm = {
      danger: 0,
      posture: "eco",
      pheromones: { defense: 0, war: 0, siege: 0 }
    } as any;
    const room = createRoom([createHostile([ATTACK, MOVE], "XUH2O")], 6, 1);

    manager.assess(room, swarm);
    expect((Memory as any).boostDefensePriority?.W1N1).to.equal(true);

    (Game as any).time = 1010;
    manager.assess(createRoom([], 6, 1), { ...swarm, danger: 0 });

    expect((Memory as any).boostDefensePriority?.W1N1).to.equal(undefined);
  });

  it("clears stale boost priority after a global reset with no active emergency", () => {
    (Memory as any).boostDefensePriority = { W1N1: true, W2N2: true };
    const manager = new EmergencyResponseManager();
    const room = createRoom([], 6, 1);

    manager.assess(room, {
      danger: 0,
      posture: "eco",
      pheromones: { defense: 0, war: 0, siege: 0 }
    } as any);

    expect((Memory as any).boostDefensePriority).to.deep.equal({ W2N2: true });
  });

  it("preserves boost priority while critical structures remain damaged", () => {
    (Memory as any).boostDefensePriority = { W1N1: true };
    const manager = new EmergencyResponseManager();

    const state = manager.assess(createRoom([], 6, 1, [], true, true), {
      danger: 0,
      posture: "eco",
      pheromones: { defense: 0, war: 0, siege: 0 }
    } as any);

    expect(state.level).to.equal(EmergencyLevel.CRITICAL);
    expect((Memory as any).boostDefensePriority?.W1N1).to.equal(true);
  });

  it("preserves boost priority for an incoming nuke before hostile detection catches up", () => {
    (Memory as any).boostDefensePriority = { W1N1: true };
    const manager = new EmergencyResponseManager();

    const state = manager.assess(createRoom([], 6, 1, [], true, false, 1), {
      danger: 0,
      posture: "eco",
      pheromones: { defense: 0, war: 0, siege: 0 }
    } as any);

    expect(state.level).to.equal(EmergencyLevel.CRITICAL);
    expect((Memory as any).boostDefensePriority?.W1N1).to.equal(true);
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

  it("ignores harmless scouts when sizing recovery escort coverage", () => {
    expect(getCombatEscortRequirement([createHostile([MOVE])])).to.deep.equal({ guards: 0, rangers: 0 });
  });

  it("never classifies permanent or configured allies as recovery threats", () => {
    const permanentAlly = { ...createHostile([ATTACK]), owner: { username: "TooAngel" } } as Creep;
    const configuredAlly = { ...createHostile([CLAIM]), owner: { username: "ConfiguredFriend" } } as Creep;
    (Memory as any).diplomacy = { allies: ["ConfiguredFriend"] };

    expect(hasActiveDefenseThreat(permanentAlly)).to.equal(false);
    expect(hasActiveDefenseThreat(configuredAlly)).to.equal(false);
    expect(getCombatEscortRequirement([permanentAlly, configuredAlly])).to.deep.equal({ guards: 0, rangers: 0 });
  });

  it("counts an assigned active remote guard as escort coverage only in its target room", () => {
    const assigned = {
      spawning: false,
      memory: { role: "remoteGuard", targetRoom: "W1N1" },
      body: [{ type: ATTACK, hits: 100 }]
    } as unknown as Creep;
    const elsewhere = {
      spawning: false,
      memory: { role: "remoteGuard", targetRoom: "W2N1" },
      body: [{ type: ATTACK, hits: 100 }]
    } as unknown as Creep;
    const room = {
      name: "W1N1",
      find: (type: FindConstant) => (type === FIND_MY_CREEPS ? [assigned, elsewhere] : [])
    } as unknown as Room;

    expect(getCurrentDefenders(room)).to.deep.equal({ guards: 1, rangers: 0, healers: 0 });
  });

  it("requires matching guard and ranger coverage for a coordinated attack", () => {
    const hostiles = [
      createHostile([ATTACK, MOVE]),
      createHostile([RANGED_ATTACK, HEAL, MOVE])
    ];

    expect(getCombatEscortRequirement(hostiles)).to.deep.equal({ guards: 2, rangers: 2 });

    const underpowered = createRoom(hostiles, 5, 0, ["guard"]);
    expect(hasSufficientCombatEscort(underpowered)).to.equal(false);

    const covered = createRoom(hostiles, 5, 0, ["guard", "guard", "ranger", "ranger"]);
    expect(hasSufficientCombatEscort(covered)).to.equal(true);
  });

  it("does not let one nominal guard cover a high-part melee attacker", () => {
    const hostile = createHostile([ATTACK, ATTACK, ATTACK, ATTACK, MOVE]);

    expect(getCombatEscortRequirement([hostile]).guards).to.be.greaterThan(1);
    expect(hasSufficientCombatEscort(createRoom([hostile], 5, 0, ["guard"]))).to.equal(false);
  });

  it("requires an escort for hostile controller attackers", () => {
    const hostile = createHostile([CLAIM]);

    expect(getCombatEscortRequirement([hostile])).to.deep.equal({ guards: 1, rangers: 0 });
    expect(hasSufficientCombatEscort(createRoom([hostile], 5, 0))).to.equal(false);
  });

  it("creates a guard requirement for claim attackers even when a spawn exists", () => {
    const room = createRoom([createHostile([CLAIM])], 5, 1);

    const needs = analyzeDefenderNeeds(room);

    expect(needs.guards).to.equal(1);
    expect(needs.reasons).to.include("1 claim parts detected");
  });

  it("counts only active combat defenders for emergency decisions", () => {
    const creeps = [
      { spawning: false, hits: 100, memory: { role: "guard" }, body: [{ type: ATTACK, hits: 100 }] },
      { spawning: true, hits: 100, memory: { role: "ranger" }, body: [{ type: RANGED_ATTACK, hits: 100 }] },
      { spawning: false, hits: 0, memory: { role: "soldier" }, body: [{ type: ATTACK, hits: 100 }] },
      { spawning: false, hits: 100, memory: { role: "worker" }, body: [{ type: WORK, hits: 100 }] },
    ] as unknown as Creep[];
    const room = {
      find: (type: FindConstant) => (type === FIND_MY_CREEPS ? creeps : []),
    } as unknown as Room;

    expect(countActiveCombatDefenders(room)).to.equal(1);
    expect(countActiveCombatDefenders(room, ["guard", "ranger", "soldier"])).to.equal(1);
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

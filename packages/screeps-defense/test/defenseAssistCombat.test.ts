import { expect } from "chai";
import {
  analyzeDefenseAssistThreat,
  buildDefenseAssistBody,
  calculateAggregateDefenseResponsePlan,
  calculateCombatPower,
  calculateThreatParitySquadSize,
} from "../src/index";

function bodyPart(type: BodyPartConstant, hits = 100, boost?: string): BodyPartDefinition {
  return { type, hits, ...(boost ? { boost } : {}) } as BodyPartDefinition;
}

function createHostile(body: BodyPartDefinition[]): Creep {
  return {
    owner: { username: "Invader" },
    body,
  } as unknown as Creep;
}

function createRepeatedParts(...counts: Array<readonly [BodyPartConstant, number]>): BodyPartConstant[] {
  return counts.flatMap(([part, count]) => Array<BodyPartConstant>(count).fill(part));
}

describe("defense assist combat planning", () => {
  it("counts only active BodyPartDefinition entries when estimating combat power", () => {
    const power = calculateCombatPower([
      bodyPart(ATTACK, 0),
      bodyPart(HEAL, 0),
      bodyPart(MOVE, 100),
    ]);

    expect(power).to.deep.equal({
      partCount: 1,
      attack: 0,
      ranged: 0,
      heal: 0,
      dismantle: 0,
      score: 2,
    });
  });

  it("ignores destroyed hostile combat parts in defense-assist threat aggregation", () => {
    const profile = analyzeDefenseAssistThreat([
      createHostile([bodyPart(ATTACK, 0), bodyPart(HEAL, 0), bodyPart(MOVE, 100)]),
      createHostile([bodyPart(ATTACK), bodyPart(MOVE)]),
    ]);

    expect(profile?.hostileCount).to.equal(2);
    expect(profile?.total.attack).to.equal(30);
    expect(profile?.total.heal).to.equal(0);
    expect(profile?.total.partCount).to.equal(3);
    expect(profile?.strongest?.attack).to.equal(30);
  });

  it("calculates aggregate parity squad size when no single affordable defender matches the threat", () => {
    const threatProfile = {
      hostileCount: 1,
      strongest: calculateCombatPower(createRepeatedParts([ATTACK, 20], [MOVE, 20])),
      total: calculateCombatPower(createRepeatedParts([ATTACK, 20], [MOVE, 20])),
    };

    const body = buildDefenseAssistBody("guard", 800, threatProfile);
    const squadSize = calculateThreatParitySquadSize("guard", 800, threatProfile);

    expect(body).to.not.equal(null);
    expect(calculateCombatPower(body!.parts).score).to.be.lessThan(threatProfile.strongest.score);
    expect(squadSize).to.be.greaterThan(1);
    expect(calculateCombatPower(body!.parts).score * squadSize).to.be.at.least(threatProfile.total.score);
  });

  it("plans aggregate friendly fight power strictly above visible hostile power", () => {
    const threatProfile = {
      hostileCount: 1,
      strongest: calculateCombatPower(createRepeatedParts([ATTACK, 20], [MOVE, 20])),
      total: calculateCombatPower(createRepeatedParts([ATTACK, 20], [MOVE, 20])),
    };

    const plan = calculateAggregateDefenseResponsePlan(800, threatProfile, { guard: 1 });

    expect(plan.counts.guard + plan.counts.ranger + plan.counts.healer).to.be.greaterThan(1);
    expect(plan.totalPower.score).to.be.greaterThan(threatProfile.total.score);
  });

  it("adds healer coverage when aggregate defense needs multiple combat creeps", () => {
    const threatProfile = {
      hostileCount: 1,
      strongest: calculateCombatPower(createRepeatedParts([ATTACK, 12], [MOVE, 12])),
      total: calculateCombatPower(createRepeatedParts([ATTACK, 12], [MOVE, 12])),
    };

    const plan = calculateAggregateDefenseResponsePlan(800, threatProfile, { guard: 1 });

    expect(plan.healerFloor).to.be.at.least(1);
    expect(plan.counts.healer).to.be.at.least(1);
    expect(plan.totalPower.heal).to.be.at.least(Math.ceil((threatProfile.total.attack + threatProfile.total.ranged) * 0.5));
  });
});

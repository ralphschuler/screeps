import { getActualHostileCreeps } from "@ralphschuler/screeps-defense";
import { calculateBodyCost, MAX_BODY_PARTS } from "./bodyUtils";
import type { BodyTemplate } from "./roleDefinitions";

export type DefenseAssistRole = "guard" | "ranger" | "healer";

export interface CombatPower {
  partCount: number;
  attack: number;
  ranged: number;
  heal: number;
  dismantle: number;
  score: number;
}

export interface DefenseAssistThreatProfile {
  hostileCount: number;
  strongest: CombatPower | null;
  total: CombatPower;
}

export interface DefenseAggregateResponsePlan {
  counts: Record<DefenseAssistRole, number>;
  bodies: Partial<Record<DefenseAssistRole, BodyTemplate>>;
  totalPower: CombatPower;
  healerFloor: number;
  targetScore: number;
  capped: boolean;
}

export type ExistingDefensePower = Partial<Record<DefenseAssistRole, CombatPower>>;

const ATTACK_DAMAGE = 30;
const RANGED_DAMAGE = 10;
const HEAL_AMOUNT = 12;
const DISMANTLE_DAMAGE = 50;
const PART_SIZE_SCORE = 2;
const HEAL_COVERAGE_RATIO = 0.5;
const MAX_DEFENSE_ASSIST_SQUAD_SIZE = 8;
const MAX_AGGREGATE_DEFENSE_RESPONSE_SIZE = 12;

function getPartType(part: BodyPartConstant | BodyPartDefinition): BodyPartConstant {
  return typeof part === "string" ? part : part.type;
}

function getPartBoost(part: BodyPartConstant | BodyPartDefinition): string | undefined {
  if (typeof part === "string" || part.boost === undefined) return undefined;
  return String(part.boost);
}

function getBoostMultiplier(partType: BodyPartConstant, boost: string | undefined, action: string): number {
  if (!boost) return 1;
  const boosts = (globalThis as { BOOSTS?: Record<string, Record<string, Record<string, number>>> }).BOOSTS;
  const multiplier = boosts?.[partType]?.[boost]?.[action];
  return typeof multiplier === "number" && multiplier > 0 ? multiplier : 1;
}

/**
 * Estimate combat power from Screeps body parts.
 *
 * API facts verified in node_modules/@types/screeps/index.d.ts:
 * Creep.body is BodyPartDefinition[], body part max is 50, and base powers are
 * ATTACK_POWER=30, RANGED_ATTACK_POWER=10, HEAL_POWER=12, DISMANTLE_POWER=50.
 */
export function calculateCombatPower(parts: Array<BodyPartConstant | BodyPartDefinition>): CombatPower {
  let attack = 0;
  let ranged = 0;
  let heal = 0;
  let dismantle = 0;

  for (const part of parts) {
    const type = getPartType(part);
    const boost = getPartBoost(part);

    if (type === ATTACK) attack += ATTACK_DAMAGE * getBoostMultiplier(type, boost, "attack");
    if (type === RANGED_ATTACK) ranged += RANGED_DAMAGE * getBoostMultiplier(type, boost, "rangedAttack");
    if (type === HEAL) heal += HEAL_AMOUNT * getBoostMultiplier(type, boost, "heal");
    if (type === WORK) dismantle += DISMANTLE_DAMAGE * getBoostMultiplier(type, boost, "dismantle");
  }

  const partCount = parts.length;
  return {
    partCount,
    attack,
    ranged,
    heal,
    dismantle,
    score: attack + ranged + heal + dismantle + partCount * PART_SIZE_SCORE
  };
}

export function emptyCombatPower(): CombatPower {
  return { partCount: 0, attack: 0, ranged: 0, heal: 0, dismantle: 0, score: 0 };
}

export function addCombatPower(a: CombatPower, b: CombatPower): CombatPower {
  return {
    partCount: a.partCount + b.partCount,
    attack: a.attack + b.attack,
    ranged: a.ranged + b.ranged,
    heal: a.heal + b.heal,
    dismantle: a.dismantle + b.dismantle,
    score: a.score + b.score
  };
}

export function multiplyCombatPower(power: CombatPower, count: number): CombatPower {
  return {
    partCount: power.partCount * count,
    attack: power.attack * count,
    ranged: power.ranged * count,
    heal: power.heal * count,
    dismantle: power.dismantle * count,
    score: power.score * count
  };
}

export function analyzeDefenseAssistThreat(hostiles: Creep[]): DefenseAssistThreatProfile | null {
  if (hostiles.length === 0) return null;

  let strongest: CombatPower | null = null;
  const total = emptyCombatPower();

  for (const hostile of hostiles) {
    const power = calculateCombatPower(hostile.body);
    total.partCount += power.partCount;
    total.attack += power.attack;
    total.ranged += power.ranged;
    total.heal += power.heal;
    total.dismantle += power.dismantle;
    total.score += power.score;

    if (!strongest || power.score > strongest.score) {
      strongest = power;
    }
  }

  return { hostileCount: hostiles.length, strongest, total };
}

export function getVisibleDefenseAssistThreatProfile(targetRoom: string): DefenseAssistThreatProfile | null {
  const room = Game.rooms[targetRoom];
  if (!room) return null;
  return analyzeDefenseAssistThreat(getActualHostileCreeps(room));
}

export function isDefenseAssistMilitaryRole(role: string): role is DefenseAssistRole {
  return role === "guard" || role === "ranger" || role === "healer";
}

function makeBody(parts: BodyPartConstant[]): BodyTemplate | null {
  if (parts.length === 0 || parts.length > MAX_BODY_PARTS || !parts.includes(MOVE)) return null;
  const cost = calculateBodyCost(parts);
  return { parts, cost, minCapacity: cost };
}

function addCandidate(candidates: BodyTemplate[], parts: BodyPartConstant[], energyCapacity: number): void {
  const body = makeBody(parts);
  if (!body || body.cost > energyCapacity) return;
  const key = body.parts.join(",");
  if (!candidates.some(candidate => candidate.parts.join(",") === key)) {
    candidates.push(body);
  }
}

function orderedBody(counts: Partial<Record<BodyPartConstant, number>>): BodyPartConstant[] {
  const parts: BodyPartConstant[] = [];
  for (const part of [TOUGH, WORK, ATTACK, RANGED_ATTACK, HEAL, MOVE] as const) {
    const count = counts[part] ?? 0;
    for (let i = 0; i < count; i++) parts.push(part);
  }
  return parts;
}

function generateGuardBodies(energyCapacity: number): BodyTemplate[] {
  const candidates: BodyTemplate[] = [];
  for (let attackParts = 1; attackParts <= 25; attackParts++) {
    addCandidate(candidates, orderedBody({ [ATTACK]: attackParts, [MOVE]: attackParts }), energyCapacity);
    addCandidate(candidates, orderedBody({ [TOUGH]: attackParts, [ATTACK]: attackParts, [MOVE]: attackParts }), energyCapacity);
  }
  return candidates;
}

function generateRangerBodies(energyCapacity: number): BodyTemplate[] {
  const candidates: BodyTemplate[] = [];
  for (let rangedParts = 1; rangedParts <= 25; rangedParts++) {
    addCandidate(candidates, orderedBody({ [RANGED_ATTACK]: rangedParts, [MOVE]: rangedParts }), energyCapacity);
    addCandidate(
      candidates,
      orderedBody({ [TOUGH]: Math.ceil(rangedParts / 2), [RANGED_ATTACK]: rangedParts, [MOVE]: rangedParts }),
      energyCapacity
    );
  }
  return candidates;
}

function generateHealerBodies(energyCapacity: number): BodyTemplate[] {
  const candidates: BodyTemplate[] = [];
  for (let healParts = 1; healParts <= 25; healParts++) {
    addCandidate(candidates, orderedBody({ [HEAL]: healParts, [MOVE]: healParts }), energyCapacity);
    addCandidate(
      candidates,
      orderedBody({ [TOUGH]: Math.ceil(healParts / 2), [HEAL]: healParts, [MOVE]: healParts }),
      energyCapacity
    );
  }
  return candidates;
}

function generateDefenseAssistBodies(role: DefenseAssistRole, energyCapacity: number): BodyTemplate[] {
  if (role === "guard") return generateGuardBodies(energyCapacity);
  if (role === "ranger") return generateRangerBodies(energyCapacity);
  return generateHealerBodies(energyCapacity);
}

export function isDefenseAssistBodyStrongerThanThreat(
  parts: BodyPartConstant[],
  threat: CombatPower | null | undefined
): boolean {
  if (!threat || threat.score <= 0) return true;
  const power = calculateCombatPower(parts);
  return power.partCount >= threat.partCount && power.score >= threat.score;
}

function compareByPowerThenCost(a: BodyTemplate, b: BodyTemplate): number {
  const powerDelta = calculateCombatPower(b.parts).score - calculateCombatPower(a.parts).score;
  if (powerDelta !== 0) return powerDelta;
  return b.cost - a.cost;
}

/**
 * Build a defense-assist body that outclasses the strongest visible attacker when affordable.
 * If no single affordable body can do that, return the strongest body; callers can request a squad.
 */
export function buildDefenseAssistBody(
  role: DefenseAssistRole,
  energyCapacity: number,
  threatProfile?: DefenseAssistThreatProfile | null
): BodyTemplate | null {
  const candidates = generateDefenseAssistBodies(role, energyCapacity);
  if (candidates.length === 0) return null;

  const strongestThreat = threatProfile?.strongest;
  if (strongestThreat && strongestThreat.score > 0) {
    const outmatching = candidates
      .filter(candidate => isDefenseAssistBodyStrongerThanThreat(candidate.parts, strongestThreat))
      .sort((a, b) => a.cost - b.cost || compareByPowerThenCost(a, b));

    if (outmatching.length > 0) return outmatching[0]!;
  }

  return [...candidates].sort(compareByPowerThenCost)[0] ?? null;
}

function createEmptyCounts(): Record<DefenseAssistRole, number> {
  return { guard: 0, ranger: 0, healer: 0 };
}

function getExistingTotalPower(existingPower?: ExistingDefensePower): CombatPower {
  let total = emptyCombatPower();
  if (!existingPower) return total;
  for (const role of ["guard", "ranger", "healer"] as const) {
    const power = existingPower[role];
    if (power) total = addCombatPower(total, power);
  }
  return total;
}

function getPlanTotalPower(
  counts: Record<DefenseAssistRole, number>,
  bodyPowers: Partial<Record<DefenseAssistRole, CombatPower>>,
  existingPower?: ExistingDefensePower
): CombatPower {
  let total = getExistingTotalPower(existingPower);
  for (const role of ["guard", "ranger", "healer"] as const) {
    const power = bodyPowers[role];
    if (power && counts[role] > 0) total = addCombatPower(total, multiplyCombatPower(power, counts[role]));
  }
  return total;
}

function getHealerFloor(
  threatProfile: DefenseAssistThreatProfile,
  healerPower: CombatPower | undefined,
  nonHealerCount: number,
  baseHealerNeed: number
): number {
  if (!healerPower || healerPower.heal <= 0) return 0;
  const incomingDamage = threatProfile.total.attack + threatProfile.total.ranged;
  const needsHealerSupport = baseHealerNeed > 0 || threatProfile.total.heal > 0 || nonHealerCount >= 3;
  if (!needsHealerSupport || incomingDamage <= 0) return baseHealerNeed;
  const requiredHeal = Math.ceil(incomingDamage * HEAL_COVERAGE_RATIO);
  return Math.max(1, baseHealerNeed, Math.ceil(requiredHeal / healerPower.heal));
}

function getBestPowerRole(bodyPowers: Partial<Record<DefenseAssistRole, CombatPower>>): DefenseAssistRole | null {
  const candidates = (["guard", "ranger"] as const).filter(role => (bodyPowers[role]?.score ?? 0) > 0);
  if (candidates.length === 0) return bodyPowers.healer ? "healer" : null;
  return candidates.sort((a, b) => (bodyPowers[b]?.score ?? 0) - (bodyPowers[a]?.score ?? 0))[0] ?? null;
}

export function calculateAggregateDefenseResponsePlan(
  energyCapacity: number,
  threatProfile?: DefenseAssistThreatProfile | null,
  baseNeeds: Partial<Record<DefenseAssistRole, number>> = {},
  existingPower?: ExistingDefensePower,
  maxSize = MAX_AGGREGATE_DEFENSE_RESPONSE_SIZE
): DefenseAggregateResponsePlan {
  const counts = createEmptyCounts();
  const bodies: Partial<Record<DefenseAssistRole, BodyTemplate>> = {};
  const bodyPowers: Partial<Record<DefenseAssistRole, CombatPower>> = {};

  for (const role of ["guard", "ranger", "healer"] as const) {
    const body = buildDefenseAssistBody(role, energyCapacity, threatProfile);
    if (!body) continue;
    bodies[role] = body;
    bodyPowers[role] = calculateCombatPower(body.parts);
    counts[role] = Math.max(0, Math.floor(baseNeeds[role] ?? 0));
  }

  if (!threatProfile) {
    return { counts, bodies, totalPower: getPlanTotalPower(counts, bodyPowers, existingPower), healerFloor: 0, targetScore: 0, capped: false };
  }

  const targetScore = threatProfile.total.score;
  const bestPowerRole = getBestPowerRole(bodyPowers);
  let capped = false;

  const getPlannedCount = () => counts.guard + counts.ranger + counts.healer;
  const addRole = (role: DefenseAssistRole): boolean => {
    if (!bodyPowers[role]) return false;
    if (getPlannedCount() >= maxSize) {
      capped = true;
      return false;
    }
    counts[role]++;
    return true;
  };

  if (bestPowerRole && getPlannedCount() === 0) addRole(bestPowerRole);

  let healerFloor = getHealerFloor(threatProfile, bodyPowers.healer, counts.guard + counts.ranger, counts.healer);
  while (counts.healer < healerFloor && addRole("healer")) {
    healerFloor = getHealerFloor(threatProfile, bodyPowers.healer, counts.guard + counts.ranger, counts.healer);
  }

  let totalPower = getPlanTotalPower(counts, bodyPowers, existingPower);
  while (totalPower.score <= targetScore) {
    const role = bestPowerRole ?? "healer";
    if (!addRole(role)) break;
    healerFloor = getHealerFloor(threatProfile, bodyPowers.healer, counts.guard + counts.ranger, counts.healer);
    while (counts.healer < healerFloor && addRole("healer")) {
      healerFloor = getHealerFloor(threatProfile, bodyPowers.healer, counts.guard + counts.ranger, counts.healer);
    }
    totalPower = getPlanTotalPower(counts, bodyPowers, existingPower);
  }

  return { counts, bodies, totalPower, healerFloor, targetScore, capped };
}

export function calculateThreatParitySquadSize(
  role: DefenseAssistRole,
  energyCapacity: number,
  threatProfile?: DefenseAssistThreatProfile | null
): number {
  const body = buildDefenseAssistBody(role, energyCapacity, null);
  const strongestThreat = threatProfile?.strongest;
  if (!body) return 0;
  if (!strongestThreat) return 1;

  const bodyPower = calculateCombatPower(body.parts);
  const strongestPowerSquadSize = Math.floor(strongestThreat.score / Math.max(1, bodyPower.score)) + 1;
  const strongestSizeSquadSize = Math.ceil(strongestThreat.partCount / Math.max(1, bodyPower.partCount));
  const totalThreat = threatProfile?.total;
  const totalPowerSquadSize = totalThreat ? Math.floor(totalThreat.score / Math.max(1, bodyPower.score)) + 1 : 1;
  const totalSizeSquadSize = totalThreat ? Math.ceil(totalThreat.partCount / Math.max(1, bodyPower.partCount)) : 1;
  return Math.min(
    MAX_DEFENSE_ASSIST_SQUAD_SIZE,
    Math.max(1, strongestPowerSquadSize, strongestSizeSquadSize, totalPowerSquadSize, totalSizeSquadSize)
  );
}

export function calculateDefenseAssistSquadSize(
  role: DefenseAssistRole,
  energyCapacity: number,
  threatProfile?: DefenseAssistThreatProfile | null
): number {
  return calculateThreatParitySquadSize(role, energyCapacity, threatProfile);
}

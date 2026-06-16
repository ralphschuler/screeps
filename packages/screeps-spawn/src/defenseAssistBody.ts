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

const ATTACK_DAMAGE = 30;
const RANGED_DAMAGE = 10;
const HEAL_AMOUNT = 12;
const DISMANTLE_DAMAGE = 50;
const PART_SIZE_SCORE = 2;
const MAX_DEFENSE_ASSIST_SQUAD_SIZE = 8;

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

function emptyCombatPower(): CombatPower {
  return { partCount: 0, attack: 0, ranged: 0, heal: 0, dismantle: 0, score: 0 };
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
  const strongestPowerSquadSize = Math.ceil(strongestThreat.score / Math.max(1, bodyPower.score));
  const strongestSizeSquadSize = Math.ceil(strongestThreat.partCount / Math.max(1, bodyPower.partCount));
  const totalThreat = threatProfile?.total;
  const totalPowerSquadSize = totalThreat ? Math.ceil(totalThreat.score / Math.max(1, bodyPower.score)) : 1;
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

/**
 * Pure hostile body profiling for threat assessment.
 *
 * Keeps the Screeps-specific body-part math in one small module so
 * assessThreat() can focus on room-level defense decisions.
 */

/** Minimum score assigned to any active WORK-part dismantle threat. */
const MIN_WORK_PART_THREAT_SCORE = 100;
const LEGACY_DISMANTLER_WORK_PARTS = 5;
const LEGACY_DISMANTLER_THREAT_SCORE = 150;

interface BodyThreatProfileOptions {
  /**
   * When true, every active WORK part contributes dismantle pressure.
   * When false, preserves the older 5+ WORK dismantler heuristic as rollback.
   */
  scoreWorkPartThreats?: boolean;
}

export interface HostileBodyThreatProfile {
  /** Active ATTACK parts. */
  attackParts: number;
  /** Active RANGED_ATTACK parts. */
  rangedParts: number;
  /** Active HEAL parts. */
  healParts: number;
  /** Active WORK parts. */
  workParts: number;
  /** True when any body part carries a boost. Mirrors legacy threat scoring. */
  isBoosted: boolean;
  /** Combined creep/structure pressure per tick. */
  dps: number;
  /** Threat-score contribution from this hostile body only. */
  scoreContribution: number;
  /** Role classification derived from active ATTACK parts. */
  isMelee: boolean;
  /** Role classification derived from active RANGED_ATTACK parts. */
  isRanged: boolean;
  /** Role classification derived from active HEAL parts. */
  isHealer: boolean;
  /** Role classification derived from active WORK parts and rollback setting. */
  isDismantler: boolean;
}

/**
 * Summarize a hostile body into counts, pressure, and threat score.
 *
 * Screeps facts used here:
 * - ATTACK: 30 damage/tick
 * - RANGED_ATTACK: 10 single-target damage/tick
 * - WORK dismantle: DISMANTLE_POWER structure hits/tick
 *
 * Destroyed body parts are ignored for threat output. Boost detection remains
 * intentionally body-wide to preserve the previous assessThreat() behavior.
 */
export function summarizeHostileBody(
  hostile: Pick<Creep, "body">,
  options: BodyThreatProfileOptions = {}
): HostileBodyThreatProfile {
  const scoreWorkPartThreats = options.scoreWorkPartThreats ?? true;

  let attackParts = 0;
  let rangedParts = 0;
  let healParts = 0;
  let workParts = 0;

  for (const part of hostile.body) {
    if (part.hits === 0) continue;

    switch (part.type) {
      case ATTACK:
        attackParts++;
        break;
      case RANGED_ATTACK:
        rangedParts++;
        break;
      case HEAL:
        healParts++;
        break;
      case WORK:
        workParts++;
        break;
    }
  }

  const dismantlePower = scoreWorkPartThreats ? workParts * DISMANTLE_POWER : 0;
  const isBoosted = hostile.body.some(part => part.boost);
  const isHealer = healParts > 0;
  const isRanged = rangedParts > 0;
  const isMelee = attackParts > 0;
  const isDismantler = scoreWorkPartThreats
    ? workParts > 0
    : workParts >= LEGACY_DISMANTLER_WORK_PARTS;

  let scoreContribution = 0;
  if (isBoosted) {
    scoreContribution += 200;
  }
  if (isHealer) {
    scoreContribution += 100;
  }
  if (scoreWorkPartThreats) {
    if (workParts > 0) {
      scoreContribution += Math.max(MIN_WORK_PART_THREAT_SCORE, dismantlePower * 2);
    }
  } else if (isDismantler) {
    scoreContribution += LEGACY_DISMANTLER_THREAT_SCORE;
  }

  scoreContribution += (attackParts + rangedParts) * 10;

  return {
    attackParts,
    rangedParts,
    healParts,
    workParts,
    isBoosted,
    dps: attackParts * 30 + rangedParts * 10 + dismantlePower,
    scoreContribution,
    isMelee,
    isRanged,
    isHealer,
    isDismantler
  };
}

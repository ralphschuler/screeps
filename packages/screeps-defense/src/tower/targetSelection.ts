import type { TowerTargetOptions } from "./policyTypes";

/**
 * Select the hostile a tower should focus this tick.
 *
 * The score favors creeps that can heal, fight, claim, or dismantle. When two
 * hostiles have equal tactical priority, wounded creeps are preferred so towers
 * finish kills instead of spreading damage.
 */
export function selectTowerTarget(hostiles: Creep[], options: TowerTargetOptions = {}): Creep | null {
  const preferWoundedTargets = options.preferWoundedTargets !== false;
  let bestTarget: Creep | null = null;

  for (const hostile of hostiles) {
    if (!bestTarget || compareTowerTargets(hostile, bestTarget, preferWoundedTargets) < 0) {
      bestTarget = hostile;
    }
  }

  return bestTarget;
}

function compareTowerTargets(a: Creep, b: Creep, preferWoundedTargets: boolean): number {
  const priorityDelta = getHostilePriority(b) - getHostilePriority(a);
  if (priorityDelta !== 0) return priorityDelta;

  if (!preferWoundedTargets) return 0;

  const woundDelta = getHitRatio(a) - getHitRatio(b);
  if (woundDelta !== 0) return woundDelta;

  return getHits(a) - getHits(b);
}

function getHits(hostile: Creep): number {
  return typeof hostile.hits === "number" ? hostile.hits : Infinity;
}

function getHitRatio(hostile: Creep): number {
  if (typeof hostile.hits !== "number" || typeof hostile.hitsMax !== "number" || hostile.hitsMax <= 0) {
    return 1;
  }
  return hostile.hits / hostile.hitsMax;
}

/** Score hostile body parts by tower response urgency. */
export function getHostilePriority(hostile: Creep): number {
  let score = 0;

  score += hostile.getActiveBodyparts(HEAL) * 100;
  score += hostile.getActiveBodyparts(RANGED_ATTACK) * 50;
  score += hostile.getActiveBodyparts(ATTACK) * 40;
  score += hostile.getActiveBodyparts(CLAIM) * 60;
  score += hostile.getActiveBodyparts(WORK) * 30;

  if (score > 0 && hostile.body.some((part) => part.boost)) {
    score += 20;
  }

  return score;
}

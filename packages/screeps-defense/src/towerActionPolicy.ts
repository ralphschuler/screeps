export type TowerAction =
  | { type: "attack"; target: Creep }
  | { type: "heal"; target: Creep }
  | { type: "repair"; target: Structure }
  | { type: "idle" };

export interface TowerActionPolicyInput {
  tower: StructureTower;
  hostiles: Creep[];
  posture: string;
  rcl: number;
  danger: number;
  isCombatPosture: boolean;
  wallRepairTarget: number;
}

export function selectTowerTarget(hostiles: Creep[]): Creep | null {
  const sorted = [...hostiles].sort(
    (a, b) => getHostilePriority(b) - getHostilePriority(a),
  );
  return sorted[0] ?? null;
}

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

export function selectTowerAction(input: TowerActionPolicyInput): TowerAction {
  const primaryTarget =
    input.hostiles.length > 0 ? selectTowerTarget(input.hostiles) : null;
  if (primaryTarget) return { type: "attack", target: primaryTarget };

  if (input.posture !== "siege") {
    const damaged = input.tower.pos.findClosestByRange(FIND_MY_CREEPS, {
      filter: (c) => c.hits < c.hitsMax,
    });
    if (damaged) return { type: "heal", target: damaged };
  }

  if (!input.isCombatPosture) {
    const damaged = input.tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (s) =>
        s.hits < s.hitsMax * 0.8 &&
        s.structureType !== STRUCTURE_WALL &&
        s.structureType !== STRUCTURE_RAMPART,
    });
    if (damaged) return { type: "repair", target: damaged };
  }

  if (!input.isCombatPosture && input.hostiles.length === 0) {
    const wallOrRampart = input.tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (s) =>
        (s.structureType === STRUCTURE_WALL ||
          s.structureType === STRUCTURE_RAMPART) &&
        s.hits < input.wallRepairTarget,
    });
    if (wallOrRampart) return { type: "repair", target: wallOrRampart };
  }

  return { type: "idle" };
}

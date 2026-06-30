import type { LinkCandidate, PositionLike } from "./types";

/** Stable coordinate key used for blocked/used/protected link sets. */
export function positionKey(x: number, y: number): string {
  return `${x},${y}`;
}

/** Screeps range uses Chebyshev distance. */
export function getRange(a: PositionLike, b: PositionLike): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

/**
 * Select the best buildable link tile around a target.
 *
 * Ordering is deterministic: lower score first, then lower x, then lower y.
 * The score target usually points at the receiver side of the network so source
 * links prefer shorter transfer paths where several adjacent tiles are valid.
 */
export function selectCandidate(
  room: Room,
  target: RoomPosition,
  minRange: number,
  maxRange: number,
  blocked: Set<string>,
  used: Set<string>,
  scoreTarget?: PositionLike
): LinkCandidate | undefined {
  const candidates: LinkCandidate[] = [];
  const terrain = room.getTerrain();

  for (let x = target.x - maxRange; x <= target.x + maxRange; x += 1) {
    for (let y = target.y - maxRange; y <= target.y + maxRange; y += 1) {
      const range = getRange({ x, y }, target);
      if (range < minRange || range > maxRange) continue;
      if (x < 1 || x > 48 || y < 1 || y > 48) continue;
      if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;

      const key = positionKey(x, y);
      if (blocked.has(key) || used.has(key)) continue;

      const score = scoreTarget ? getRange({ x, y }, scoreTarget) : 0;
      candidates.push({ x, y, score });
    }
  }

  candidates.sort((a, b) => {
    const scoreCompare = a.score - b.score;
    if (scoreCompare !== 0) return scoreCompare;
    const xCompare = a.x - b.x;
    if (xCompare !== 0) return xCompare;
    return a.y - b.y;
  });

  return candidates[0];
}

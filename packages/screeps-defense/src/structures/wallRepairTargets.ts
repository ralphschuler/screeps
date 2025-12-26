/**
 * Wall and Rampart Repair Target Calculator
 * 
 * Calculates repair thresholds for walls and ramparts based on RCL and danger level.
 * Used by both tower control and engineer creeps for consistent repair behavior.
 * 
 * ROADMAP Reference: Section 17 - Mauern & Ramparts
 */

/**
 * Calculate wall/rampart repair target based on RCL and danger level
 * 
 * Uses RCL-based thresholds aligned with Screeps rampart max hits limits:
 * - RCL 2: 300K max
 * - RCL 3: 1M max
 * - RCL 4: 3M max
 * - RCL 5: 10M max
 * - RCL 6: 30M max
 * - RCL 7: 100M max
 * - RCL 8: 300M max
 * 
 * Danger level modifies the target:
 * - danger 0: 30% of max (peaceful maintenance)
 * - danger 1: 50% of max (threat detected)
 * - danger 2: 80% of max (active attack)
 * - danger 3+: 100% of max (siege/nuke)
 * 
 * @param rcl Room Controller Level (1-8)
 * @param danger Danger level (0-3+)
 * @returns Target repair hits threshold
 */
export function calculateWallRepairTarget(rcl: number, danger: number): number {
  // RCL-based max hits (Screeps rampart limits)
  const maxHitsByRCL: Record<number, number> = {
    1: 0,        // No ramparts at RCL 1
    2: 300000,   // 300K
    3: 1000000,  // 1M
    4: 3000000,  // 3M
    5: 10000000, // 10M
    6: 30000000, // 30M
    7: 100000000, // 100M
    8: 300000000  // 300M
  };

  const maxHits = maxHitsByRCL[rcl] ?? 0;
  if (maxHits === 0) return 0;

  // Danger level multipliers
  const dangerMultipliers: Record<number, number> = {
    0: 0.3,  // Peaceful maintenance
    1: 0.5,  // Threat detected
    2: 0.8,  // Active attack
    3: 1.0   // Siege/nuke (default for 3+)
  };
  const dangerMultiplier = dangerMultipliers[danger] ?? 1.0;

  return Math.floor(maxHits * dangerMultiplier);
}

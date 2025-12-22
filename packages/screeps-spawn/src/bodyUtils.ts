/**
 * Body Part Costs and Utilities
 * 
 * Core constants and utility functions for body part calculations.
 */

/**
 * Standard Screeps body part costs
 * 
 * Verified with MCP (screeps-docs-mcp: StructureSpawn API, screeps-typescript-mcp: Creep interface):
 * - MOVE: 50 ✓
 * - WORK: 100 ✓
 * - CARRY: 50 ✓
 * - ATTACK: 80 ✓
 * - RANGED_ATTACK: 150 ✓
 * - HEAL: 250 ✓
 * - CLAIM: 600 ✓
 * - TOUGH: 10 ✓
 */
export const BODY_PART_COSTS: Record<BodyPartConstant, number> = {
  [MOVE]: 50,
  [WORK]: 100,
  [CARRY]: 50,
  [ATTACK]: 80,
  [RANGED_ATTACK]: 150,
  [HEAL]: 250,
  [CLAIM]: 600,
  [TOUGH]: 10
};

/**
 * Maximum body parts per creep
 * 
 * Verified with MCP (screeps-docs-mcp: Creep API, screeps-typescript-mcp: Creep interface):
 * "Each creep consists of up to 50 body parts"
 */
export const MAX_BODY_PARTS = 50;

/**
 * Calculate the energy cost of a body part array
 */
export function calculateBodyCost(
  parts: BodyPartConstant[],
  costs: Partial<Record<BodyPartConstant, number>> = {}
): number {
  const costMap = { ...BODY_PART_COSTS, ...costs };
  return parts.reduce((sum, part) => sum + (costMap[part] ?? BODY_PART_COSTS[part]), 0);
}

/**
 * Validate body parts array
 * 
 * Verified with MCP (screeps-docs-mcp, screeps-typescript-mcp):
 * - MAX_BODY_PARTS = 50 (confirmed from Creep interface docs)
 * - Body part costs verified against official Screeps API
 * - MOVE requirement is a practical necessity (without MOVE, creeps cannot move),
 *   though not explicitly mandated by the game API
 * 
 * @returns true if valid, error message if invalid
 */
export function validateBody(parts: BodyPartConstant[]): true | string {
  if (parts.length === 0) {
    return "Body must contain at least one part";
  }
  
  if (parts.length > MAX_BODY_PARTS) {
    return `Body exceeds maximum of ${MAX_BODY_PARTS} parts`;
  }

  // Must have at least one MOVE part (practical requirement - creeps without MOVE cannot move)
  if (!parts.includes(MOVE)) {
    return "Body must contain at least one MOVE part";
  }

  return true;
}

/**
 * Sort body parts for optimal placement
 * TOUGH parts first (absorb damage), then functional parts, MOVE last
 */
export function sortBodyParts(parts: BodyPartConstant[]): BodyPartConstant[] {
  const priority: Record<string, number> = {
    [TOUGH]: 0,
    [WORK]: 1,
    [CARRY]: 1,
    [ATTACK]: 1,
    [RANGED_ATTACK]: 1,
    [HEAL]: 1,
    [CLAIM]: 1,
    [MOVE]: 2
  };

  return [...parts].sort((a, b) => {
    const pa = priority[a] ?? 1;
    const pb = priority[b] ?? 1;
    return pa - pb;
  });
}

/**
 * Create a balanced body with specified ratios
 * @param maxEnergy Maximum energy to spend
 * @param ratios Part ratios (e.g., { [WORK]: 1, [CARRY]: 1, [MOVE]: 2 })
 * @returns Optimized body parts array
 */
export function createBalancedBody(
  maxEnergy: number,
  ratios: Partial<Record<BodyPartConstant, number>>
): BodyPartConstant[] {
  const parts: BodyPartConstant[] = [];
  
  // Calculate cost of one "unit" based on ratios
  let unitCost = 0;
  const partTypes = Object.keys(ratios) as BodyPartConstant[];
  
  for (const part of partTypes) {
    unitCost += BODY_PART_COSTS[part] * (ratios[part] ?? 0);
  }

  if (unitCost === 0) return [];

  // Calculate how many units we can afford
  const maxUnits = Math.floor(maxEnergy / unitCost);
  
  // Build the body
  for (let i = 0; i < maxUnits; i++) {
    for (const part of partTypes) {
      const count = ratios[part] ?? 0;
      for (let j = 0; j < count; j++) {
        if (parts.length < MAX_BODY_PARTS) {
          parts.push(part);
        }
      }
    }
  }

  return sortBodyParts(parts);
}

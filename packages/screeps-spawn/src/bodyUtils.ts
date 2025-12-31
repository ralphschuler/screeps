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
 * 
 * Sums up the energy cost of all body parts using either the
 * standard costs or custom cost overrides.
 * 
 * @param parts - Array of body part constants
 * @param costs - Optional custom cost overrides for specific parts
 * @returns Total energy cost
 * 
 * @example
 * ```typescript
 * const body = [WORK, WORK, CARRY, MOVE, MOVE];
 * const cost = calculateBodyCost(body);
 * console.log(cost); // 300 (100+100+50+50)
 * 
 * // With custom costs (e.g., for testing)
 * const customCost = calculateBodyCost(body, { [WORK]: 50 });
 * console.log(customCost); // 200 (50+50+50+50)
 * ```
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
 * Checks that a body part array meets all game requirements:
 * - Contains at least one part
 * - Does not exceed 50 parts maximum
 * - Contains at least one MOVE part (practical requirement)
 * 
 * Verified with MCP (screeps-docs-mcp, screeps-typescript-mcp):
 * - MAX_BODY_PARTS = 50 (confirmed from Creep interface docs)
 * - Body part costs verified against official Screeps API
 * - MOVE requirement is a practical necessity (without MOVE, creeps cannot move),
 *   though not explicitly mandated by the game API
 * 
 * @param parts - Array of body part constants to validate
 * @returns `true` if valid, error message string if invalid
 * 
 * @example
 * ```typescript
 * const validBody = [WORK, CARRY, MOVE];
 * const result = validateBody(validBody);
 * if (result === true) {
 *   console.log('Body is valid');
 * }
 * 
 * const invalidBody = [WORK, CARRY]; // No MOVE
 * const result2 = validateBody(invalidBody);
 * console.log(result2); // "Body must contain at least one MOVE part"
 * 
 * const tooLarge = new Array(51).fill(MOVE);
 * const result3 = validateBody(tooLarge);
 * console.log(result3); // "Body exceeds maximum of 50 parts"
 * ```
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
 * 
 * Arranges body parts to maximize creep effectiveness:
 * - TOUGH parts first (absorb damage before other parts)
 * - Functional parts in the middle (WORK, CARRY, ATTACK, RANGED_ATTACK, HEAL, CLAIM)
 * - MOVE parts last (least important to protect)
 * 
 * @param parts - Array of body part constants to sort
 * @returns New sorted array (original array is not modified)
 * 
 * @example
 * ```typescript
 * const unsorted = [MOVE, WORK, TOUGH, CARRY, MOVE];
 * const sorted = sortBodyParts(unsorted);
 * console.log(sorted); // [TOUGH, WORK, CARRY, MOVE, MOVE]
 * 
 * // Original array is unchanged
 * console.log(unsorted); // [MOVE, WORK, TOUGH, CARRY, MOVE]
 * ```
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
 * 
 * Builds a creep body with specific part ratios, maximizing the number
 * of complete "units" that fit within the energy budget. Each unit
 * contains parts in the specified ratio.
 * 
 * The body is automatically sorted using sortBodyParts() for optimal placement.
 * Will not exceed MAX_BODY_PARTS (50 parts).
 * 
 * @param maxEnergy - Maximum energy to spend on body parts
 * @param ratios - Part ratios (e.g., { [WORK]: 1, [CARRY]: 1, [MOVE]: 2 })
 * @returns Optimized body parts array, sorted for optimal placement
 * 
 * @example
 * ```typescript
 * // Create harvester with 1 WORK : 1 CARRY : 2 MOVE ratio
 * const body = createBalancedBody(550, {
 *   [WORK]: 1,
 *   [CARRY]: 1,
 *   [MOVE]: 2
 * });
 * // One unit costs: 100 + 50 + 100 = 250
 * // Can afford 2 units with 550 energy
 * // Result: [WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE] (sorted)
 * 
 * // Create upgrader with 2 WORK : 1 CARRY : 3 MOVE ratio
 * const upgrader = createBalancedBody(800, {
 *   [WORK]: 2,
 *   [CARRY]: 1,
 *   [MOVE]: 3
 * });
 * // One unit costs: 200 + 50 + 150 = 400
 * // Can afford 2 units with 800 energy
 * // Result: [WORK, WORK, CARRY, MOVE, MOVE, MOVE, ...] (sorted)
 * ```
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

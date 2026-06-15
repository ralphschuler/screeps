/**
 * Body Optimizer
 *
 * Advanced body part optimization for creeps:
 * - Generates optimal body compositions based on role, energy, and conditions
 * - Considers terrain, roads, and distance for movement optimization
 * - Supports boost-aware body generation
 * - Optimizes for specific tasks (mining, hauling, combat, etc.)
 *
 * Principles:
 * - WORK parts for energy harvesting: 5 WORK = 10 energy/tick (optimal for 3000 energy source)
 * - CARRY parts for transport: scale with distance and energy rate
 * - MOVE parts: 1:1 ratio for off-road, 1:2 for roads (when fully loaded)
 * - Combat: Balance ATTACK/RANGED_ATTACK/HEAL with TOUGH and MOVE
 */

import { MAX_BODY_PARTS, calculateBodyCost } from "./bodyUtils";
import type { BodyTemplate } from "./roleDefinitions";
import type { BodyOptimizationOptions } from "./types";

export { BODY_PART_COSTS, MAX_BODY_PARTS, calculateBodyCost } from "./bodyUtils";

function buildBodyTemplate(partGroups: Array<[BodyPartConstant, number]>): BodyTemplate {
  const parts: BodyPartConstant[] = [];

  for (const [part, count] of partGroups) {
    for (let i = 0; i < count; i++) {
      parts.push(part);
    }
  }

  return makeBodyTemplate(parts);
}

function makeBodyTemplate(parts: BodyPartConstant[]): BodyTemplate {
  const cost = calculateBodyCost(parts);
  return {
    parts,
    cost,
    minCapacity: cost
  };
}

function strongestAffordableBody(candidates: BodyPartConstant[][], maxEnergy: number): BodyTemplate | null {
  return candidates
    .map(makeBodyTemplate)
    .filter(body => body.cost <= maxEnergy && body.parts.length <= MAX_BODY_PARTS)
    .sort((a, b) => b.cost - a.cost || b.parts.length - a.parts.length)[0] ?? null;
}

/**
 * Optimize harvester body
 * Static harvesters sit at source and mine
 * Optimal: 5 WORK for standard source (10 energy/tick = 3000 energy / 300 ticks)
 */
export function optimizeHarvesterBody(options: BodyOptimizationOptions): BodyTemplate {
  const { maxEnergy } = options;

  // Pattern: N * WORK + 1 CARRY + M * MOVE
  // Goal: Maximize WORK parts while keeping cost <= maxEnergy and having at least 1 MOVE
  // Static harvesters don't move much, but need at least 1 MOVE

  const carry = 1; // Always 1 CARRY for flexibility

  // Start with max WORK we could theoretically afford
  let work = Math.min(10, Math.floor(maxEnergy / 100)); // Cap at 10 WORK
  work = Math.max(2, work); // Minimum 2 WORK

  // Calculate how many MOVE we need (at least 1, ideally enough to move reasonably)
  // For static miners: 1 MOVE per 2 body parts is sufficient
  let move = Math.max(1, Math.ceil((work + carry) / 2));

  // Check if this fits in budget
  let totalCost = work * 100 + carry * 50 + move * 50;

  // If over budget, reduce WORK parts
  while (totalCost > maxEnergy && work > 2) {
    work--;
    move = Math.max(1, Math.ceil((work + carry) / 2));
    totalCost = work * 100 + carry * 50 + move * 50;
  }

  // Final safety check: if still over budget with minimum work, reduce move
  if (totalCost > maxEnergy) {
    while (move > 1 && totalCost > maxEnergy) {
      move--;
      totalCost = work * 100 + carry * 50 + move * 50;
    }
  }

  const parts: BodyPartConstant[] = [];

  // Add WORK parts
  for (let i = 0; i < work; i++) {
    parts.push(WORK);
  }

  // Add CARRY
  for (let i = 0; i < carry; i++) {
    parts.push(CARRY);
  }

  // Add MOVE
  for (let i = 0; i < move; i++) {
    parts.push(MOVE);
  }

  const cost = calculateBodyCost(parts);

  return {
    parts,
    cost,
    minCapacity: cost
  };
}

/**
 * Optimize hauler/carrier body
 * Transport creeps that move energy from sources to storage/spawns
 * Uses distance and energy rate to calculate optimal size
 */
export function optimizeHaulerBody(options: BodyOptimizationOptions): BodyTemplate {
  const { maxEnergy, distance = 10, hasRoads = false, energyPerTick = 10 } = options;

  // Calculate movement multiplier
  // With roads: 1 tile per tick when ratio is 1 MOVE per 2 CARRY
  // Without roads: 1 tile per tick when ratio is 1 MOVE per 1 CARRY
  const moveRatio = hasRoads ? 2 : 1;

  // Round trip time (in ticks)
  const roundTripTime = distance * 2;

  // Energy to transport per trip
  const energyPerTrip = energyPerTick * roundTripTime;

  // Calculate CARRY parts needed (50 energy per CARRY)
  let carryParts = Math.ceil(energyPerTrip / 50);

  // Calculate MOVE parts based on ratio
  let moveParts = Math.ceil(carryParts / moveRatio);

  // Calculate cost
  let cost = carryParts * 50 + moveParts * 50;

  // Scale down if over budget
  if (cost > maxEnergy) {
    const scale = maxEnergy / cost;
    carryParts = Math.max(2, Math.floor(carryParts * scale));
    moveParts = Math.ceil(carryParts / moveRatio);
    cost = carryParts * 50 + moveParts * 50;
  }

  // Enforce min/max
  carryParts = Math.max(2, Math.min(25, carryParts));
  moveParts = Math.max(1, Math.min(25, moveParts));

  const parts: BodyPartConstant[] = [];

  // Add CARRY parts
  for (let i = 0; i < carryParts; i++) {
    parts.push(CARRY);
  }

  // Add MOVE parts
  for (let i = 0; i < moveParts; i++) {
    parts.push(MOVE);
  }

  return {
    parts,
    cost: calculateBodyCost(parts),
    minCapacity: calculateBodyCost(parts)
  };
}

/**
 * Optimize upgrader body
 * Works at controller, needs WORK and CARRY
 * Balanced for upgrade efficiency
 */
export function optimizeUpgraderBody(options: BodyOptimizationOptions): BodyTemplate {
  const { maxEnergy } = options;

  // Pattern: multiple WORK, some CARRY, enough MOVE
  // Ratio: 3 WORK : 1 CARRY : 2 MOVE (when roads present near controller)
  const costPerUnit = 300 + 50 + 100; // 3 WORK + 1 CARRY + 2 MOVE = 450

  const units = Math.floor(maxEnergy / costPerUnit);

  const work = Math.max(1, Math.min(15, units * 3)); // Cap at 15 WORK (max upgrade without controller downgrade)
  const carry = Math.max(1, Math.ceil(work / 3));
  const move = Math.max(1, Math.ceil((work + carry) / 2));

  return buildBodyTemplate([
    [WORK, work],
    [CARRY, carry],
    [MOVE, move]
  ]);
}

/**
 * Optimize builder body
 * Needs balance of WORK, CARRY, and MOVE for building tasks
 */
export function optimizeBuilderBody(options: BodyOptimizationOptions): BodyTemplate {
  const { maxEnergy } = options;

  // Pattern: balanced WORK, CARRY, MOVE
  // Ratio: 1 WORK : 1 CARRY : 1 MOVE
  const costPerUnit = 100 + 50 + 50; // 200

  const units = Math.floor(maxEnergy / costPerUnit);

  const work = Math.max(1, Math.min(16, units));
  const carry = work;
  const move = work;

  return buildBodyTemplate([
    [WORK, work],
    [CARRY, carry],
    [MOVE, move]
  ]);
}

/**
 * Optimize combat body (melee)
 * Balanced ATTACK, TOUGH, and MOVE
 */
export function optimizeCombatBody(options: BodyOptimizationOptions): BodyTemplate {
  const { maxEnergy, willBoost = false } = options;

  const candidates: BodyPartConstant[][] = [];
  const maxAttack = Math.min(25, Math.floor(maxEnergy / (80 + 50)) || 1);
  for (let attack = 1; attack <= maxAttack; attack++) {
    candidates.push([...Array(attack).fill(ATTACK), ...Array(attack).fill(MOVE)]);
    candidates.push([TOUGH, ...Array(attack).fill(ATTACK), ...Array(attack + 1).fill(MOVE)]);
    if (willBoost) {
      candidates.push([...Array(Math.min(10, attack)).fill(TOUGH), ...Array(attack).fill(ATTACK), ...Array(attack + Math.min(10, attack)).fill(MOVE)]);
    }
  }

  const body = strongestAffordableBody(candidates, maxEnergy);
  if (body) return body;
  throw new Error(`No affordable combat body for ${maxEnergy} energy`);
}

/**
 * Optimize ranged combat body
 * Balanced RANGED_ATTACK, TOUGH, and MOVE
 */
export function optimizeRangedBody(options: BodyOptimizationOptions): BodyTemplate {
  const { maxEnergy, willBoost = false } = options;

  const candidates: BodyPartConstant[][] = [];
  const maxRanged = Math.min(25, Math.floor(maxEnergy / (150 + 50)) || 1);
  for (let ranged = 1; ranged <= maxRanged; ranged++) {
    candidates.push([...Array(ranged).fill(RANGED_ATTACK), ...Array(ranged).fill(MOVE)]);
    candidates.push([TOUGH, ...Array(ranged).fill(RANGED_ATTACK), ...Array(ranged + 1).fill(MOVE)]);
    if (willBoost) {
      candidates.push([...Array(Math.min(5, ranged)).fill(TOUGH), ...Array(ranged).fill(RANGED_ATTACK), ...Array(ranged + Math.min(5, ranged)).fill(MOVE)]);
    }
  }

  const body = strongestAffordableBody(candidates, maxEnergy);
  if (body) return body;
  throw new Error(`No affordable ranged body for ${maxEnergy} energy`);
}

/**
 * Optimize healer body
 */
export function optimizeHealerBody(options: BodyOptimizationOptions): BodyTemplate {
  const { maxEnergy } = options;

  const candidates: BodyPartConstant[][] = [];
  const maxHeal = Math.min(25, Math.floor(maxEnergy / (250 + 50)) || 1);
  for (let heal = 1; heal <= maxHeal; heal++) {
    candidates.push([...Array(heal).fill(HEAL), ...Array(heal).fill(MOVE)]);
    candidates.push([TOUGH, ...Array(heal).fill(HEAL), ...Array(heal + 1).fill(MOVE)]);
  }

  const body = strongestAffordableBody(candidates, maxEnergy);
  if (body) return body;
  throw new Error(`No affordable healer body for ${maxEnergy} energy`);
}

/**
 * Main body optimizer function
 * Routes to role-specific optimizers
 */
export function optimizeBody(options: BodyOptimizationOptions): BodyTemplate {
  const { role } = options;

  switch (role) {
    case "harvester":
    case "staticMiner":
    case "mineralHarvester":
    case "remoteHarvester":
      return optimizeHarvesterBody(options);

    case "hauler":
    case "carrier":
    case "queenCarrier":
    case "remoteHauler":
    case "interRoomCarrier":
    case "crossShardCarrier":
      return optimizeHaulerBody(options);

    case "upgrader":
      return optimizeUpgraderBody(options);

    case "builder":
    case "engineer":
    case "remoteWorker":
      return optimizeBuilderBody(options);

    case "guard":
    case "soldier":
      return optimizeCombatBody(options);

    case "ranger":
      return optimizeRangedBody(options);

    case "healer":
      return optimizeHealerBody(options);

    default:
      // Default: balanced body
      return optimizeBuilderBody(options);
  }
}

/**
 * Generate multiple body templates for different energy levels
 * Used to create role definitions with tiered bodies
 */
export function generateBodyTiers(role: string, energyLevels: number[]): BodyTemplate[] {
  return energyLevels.map(maxEnergy =>
    optimizeBody({
      maxEnergy,
      role
    })
  );
}

/**
 * Validate body template
 * Ensures body meets game constraints
 */
export function validateBody(body: BodyTemplate): boolean {
  // Check max parts
  if (body.parts.length > MAX_BODY_PARTS) {
    return false;
  }

  // Check cost matches
  const calculatedCost = calculateBodyCost(body.parts);
  if (calculatedCost !== body.cost) {
    return false;
  }

  // Check valid parts
  const validParts = [MOVE, WORK, CARRY, ATTACK, RANGED_ATTACK, HEAL, CLAIM, TOUGH];
  for (const part of body.parts) {
    if (!validParts.includes(part)) {
      return false;
    }
  }

  return true;
}

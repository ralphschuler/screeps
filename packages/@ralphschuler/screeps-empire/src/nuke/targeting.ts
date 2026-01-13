/**
 * Nuke Targeting Module
 * 
 * Handles nuke candidate evaluation, scoring, and ROI calculations
 */

import { logger } from "@ralphschuler/screeps-core";
import type { EmpireMemory, RoomIntel, SwarmState } from "../types";
import type { NukeConfig, NukeScore, NukeImpactPrediction } from "./types";
import { NUKE_DAMAGE, NUKE_COST, STRUCTURE_VALUES, INTEL_DAMAGE_WEIGHTS } from "./types";

/**
 * Evaluate nuke candidates and populate empire nuke candidates list
 */
export function evaluateNukeCandidates(
  empire: EmpireMemory,
  config: NukeConfig,
  getSwarmState: (roomName: string) => SwarmState | undefined
): void {
  // Clear old candidates
  empire.nukeCandidates = [];

  // Only evaluate if in war mode
  if (!empire.objectives.warMode) {
    return;
  }

  // Score all war targets
  for (const roomName of empire.warTargets) {
    const score = scoreNukeCandidate(roomName, empire, config, getSwarmState);
    if (score.score >= config.minScore) {
      empire.nukeCandidates.push({
        roomName,
        score: score.score,
        launched: false,
        launchTick: 0
      });

      logger.info(`Nuke candidate: ${roomName} (score: ${score.score}) - ${score.reasons.join(", ")}`, {
        subsystem: "Nuke"
      });
    }
  }

  // Sort by score
  empire.nukeCandidates.sort((a, b) => b.score - a.score);
}

/**
 * Score a nuke candidate with strategic prioritization
 */
export function scoreNukeCandidate(
  roomName: string,
  empire: EmpireMemory,
  config: NukeConfig,
  getSwarmState: (roomName: string) => SwarmState | undefined
): NukeScore {
  let score = 0;
  const reasons: string[] = [];

  const intel = empire.knownRooms[roomName];
  if (!intel) {
    return { roomName, score: 0, reasons: ["No intel"] };
  }

  // Strategic target prioritization factors

  // 1. Enemy RCL (higher = more valuable) - up to 24 points
  if (intel.controllerLevel) {
    score += intel.controllerLevel * 3;
    reasons.push(`RCL ${intel.controllerLevel}`);
  }

  // 2. Structure density (more destruction potential)
  // Tower count bonus (more towers = better target, also harder defense)
  if (intel.towerCount) {
    score += intel.towerCount * 5;
    reasons.push(`${intel.towerCount} towers`);
  }

  // Spawn count bonus (critical structures)
  if (intel.spawnCount) {
    score += intel.spawnCount * 10;
    reasons.push(`${intel.spawnCount} spawns`);
  }

  // 3. Owned room bonus (higher value than unclaimed)
  if (intel.owner && intel.owner !== "") {
    score += 30;
    reasons.push("Owned room");
  }

  // 4. War pheromone level (active conflict priority)
  const swarm = getSwarmState(roomName);
  if (swarm) {
    const warBonus = Math.floor(swarm.pheromones.war / 10);
    if (warBonus > 0) {
      score += warBonus;
      reasons.push(`War intensity: ${swarm.pheromones.war}`);
    }
  }

  // 5. Strategic position factors
  // Highway rooms are often chokepoints
  if (intel.isHighway) {
    score += 10;
    reasons.push("Highway (strategic)");
  }

  // High threat bonus (immediate danger to our empire)
  if (intel.threatLevel >= 2) {
    score += 20;
    reasons.push("High threat");
  }

  // 6. Distance penalty (prefer closer targets for easier siege coordination)
  const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
  if (ownedRooms.length > 0) {
    const minDistance = Math.min(...ownedRooms.map(r => Game.map.getRoomLinearDistance(roomName, r.name)));
    score -= minDistance * 2;
    reasons.push(`${minDistance} rooms away`);
  }

  // 7. War target bonus (aligned with empire objectives)
  if (empire.warTargets.includes(roomName)) {
    score += 15;
    reasons.push("War target");
  }

  // 8. ROI check - only suggest if economically viable
  const targetPos = new RoomPosition(25, 25, roomName);
  const roi = calculateNukeROI(roomName, targetPos, empire);
  if (roi >= config.roiThreshold) {
    const roiBonus = Math.min(20, Math.floor(roi * 5));
    score += roiBonus;
    reasons.push(`ROI: ${roi.toFixed(1)}x`);
  } else {
    score -= 20; // Penalty for poor ROI
    reasons.push(`Low ROI: ${roi.toFixed(1)}x`);
  }

  return { roomName, score, reasons };
}

/**
 * Predict impact and assess damage for a nuke strike
 * Returns estimated damage and value destroyed
 */
export function predictNukeImpact(
  targetRoom: string,
  targetPos: RoomPosition,
  empire: EmpireMemory
): NukeImpactPrediction {
  const result: NukeImpactPrediction = {
    estimatedDamage: 0,
    estimatedValue: 0,
    threatenedStructures: []
  };

  // If we can see the room, calculate precise damage
  const room = Game.rooms[targetRoom];
  if (!room) {
    // Estimate based on intel
    const intel = empire.knownRooms[targetRoom];
    if (intel) {
      // Rough estimate: towers, spawns, and storage using configurable weights
      const structureEstimate = 
        (intel.towerCount || 0) * INTEL_DAMAGE_WEIGHTS.TOWER_WEIGHT + 
        (intel.spawnCount || 0) * INTEL_DAMAGE_WEIGHTS.SPAWN_WEIGHT + 
        INTEL_DAMAGE_WEIGHTS.BASE_STRUCTURE_COUNT;
      result.estimatedDamage = NUKE_DAMAGE.CENTER + NUKE_DAMAGE.RADIUS * structureEstimate;
      result.estimatedValue = result.estimatedDamage * 0.01; // Rough energy equivalent
    }
    return result;
  }

  // Find all structures in blast radius
  const structures = room.lookForAtArea(
    LOOK_STRUCTURES,
    Math.max(0, targetPos.y - NUKE_DAMAGE.RANGE),
    Math.max(0, targetPos.x - NUKE_DAMAGE.RANGE),
    Math.min(49, targetPos.y + NUKE_DAMAGE.RANGE),
    Math.min(49, targetPos.x + NUKE_DAMAGE.RANGE),
    true
  );

  for (const item of structures) {
    const structure = item.structure;
    const dx = Math.abs(structure.pos.x - targetPos.x);
    const dy = Math.abs(structure.pos.y - targetPos.y);
    const distance = Math.max(dx, dy);

    // Calculate damage based on distance
    const damage = distance === 0 ? NUKE_DAMAGE.CENTER : NUKE_DAMAGE.RADIUS;
    
    // Estimate if structure will be destroyed
    if (structure.hits <= damage) {
      result.estimatedDamage += structure.hits;
      result.threatenedStructures.push(`${structure.structureType}-${structure.pos.x},${structure.pos.y}`);
      
      // Estimate value destroyed
      result.estimatedValue += estimateStructureValue(structure);
    } else {
      result.estimatedDamage += damage;
    }
  }

  return result;
}

/**
 * Calculate ROI for a potential nuke strike
 */
export function calculateNukeROI(
  targetRoom: string,
  targetPos: RoomPosition,
  empire: EmpireMemory
): number {
  const prediction = predictNukeImpact(targetRoom, targetPos, empire);
  const cost = NUKE_COST.ENERGY + NUKE_COST.GHODIUM;
  
  // Handle edge case where no value is predicted
  if (prediction.estimatedValue === 0) {
    return 0;
  }
  
  const gain = prediction.estimatedValue;
  return gain / cost;
}

/**
 * Estimate energy value of a structure
 */
function estimateStructureValue(structure: Structure): number {
  return STRUCTURE_VALUES[structure.structureType] || 1000;
}

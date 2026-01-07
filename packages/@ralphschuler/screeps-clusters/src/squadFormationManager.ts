/**
 * Squad Formation Manager
 *
 * Coordinates squad formation by:
 * - Creating spawn requests for squad members
 * - Tracking formation progress
 * - Adding spawned creeps to squads
 * - Managing squad lifecycle
 *
 * Addresses Issue: Squad formation logic and role composition
 */

import type { ClusterMemory, SquadDefinition } from "../memory/schemas";
import { logger } from "@ralphschuler/screeps-core";
import { SpawnPriority, type SpawnRequest, spawnQueue } from "../spawning/spawnQueue";
import { addCreepToSquad, getSquadReadiness } from "./squadCoordinator";
import { DOCTRINE_CONFIGS, getDoctrineComposition } from "./offensiveDoctrine";

/**
 * Screeps BODYPART_COST constants
 */
const BODYPART_COST: Record<BodyPartConstant, number> = {
  move: 50,
  work: 100,
  carry: 50,
  attack: 80,
  ranged_attack: 150,
  heal: 250,
  claim: 600,
  tough: 10
};

/**
 * Squad formation tracking
 */
interface SquadFormation {
  squadId: string;
  targetComposition: Record<string, number>;
  currentComposition: Record<string, number>;
  spawnRequests: Set<string>;
  formationStarted: number;
}

/**
 * Active formations per cluster
 */
const activeFormations = new Map<string, SquadFormation>();

/**
 * Start forming a squad by creating spawn requests
 */
export function startSquadFormation(
  cluster: ClusterMemory,
  squad: SquadDefinition
): void {
  const squadId = squad.id;
  
  // Check if already forming
  if (activeFormations.has(squadId)) {
    logger.debug(`Squad ${squadId} already forming`, { subsystem: "SquadFormation" });
    return;
  }
  
  // Get composition from doctrine (map squad type to doctrine)
  let composition: { harassers: number; soldiers: number; rangers: number; healers: number; siegeUnits: number };
  
  if (squad.type === "defense") {
    // Defense squads use a default composition (will be enhanced by defense manager)
    composition = {
      harassers: 0,
      soldiers: 2,
      rangers: 2,
      healers: 1,
      siegeUnits: 0
    };
  } else {
    const doctrineType = squad.type === "harass" ? "harassment" : squad.type;
    const config = DOCTRINE_CONFIGS[doctrineType];
    composition = config.composition;
  }
  
  // Convert composition to role map
  const targetComposition: Record<string, number> = {};
  if (composition.harassers > 0) targetComposition.harasser = composition.harassers;
  if (composition.soldiers > 0) targetComposition.soldier = composition.soldiers;
  if (composition.rangers > 0) targetComposition.ranger = composition.rangers;
  if (composition.healers > 0) targetComposition.healer = composition.healers;
  if (composition.siegeUnits > 0) targetComposition.siegeUnit = composition.siegeUnits;
  
  // Create formation tracker
  const formation: SquadFormation = {
    squadId,
    targetComposition,
    currentComposition: {},
    spawnRequests: new Set(),
    formationStarted: Game.time
  };
  
  activeFormations.set(squadId, formation);
  
  // Create spawn requests for each role
  const rallyRoom = Game.rooms[squad.rallyRoom];
  if (!rallyRoom) {
    logger.warn(`Rally room ${squad.rallyRoom} not visible for squad ${squadId}`, {
      subsystem: "SquadFormation"
    });
    return;
  }
  
  createSquadSpawnRequests(rallyRoom, squad, composition, formation);
  
  logger.info(
    `Started forming squad ${squadId}: ${JSON.stringify(targetComposition)}`,
    { subsystem: "SquadFormation" }
  );
}

/**
 * Create spawn requests for squad members
 */
function createSquadSpawnRequests(
  room: Room,
  squad: SquadDefinition,
  composition: { harassers: number; soldiers: number; rangers: number; healers: number; siegeUnits: number },
  formation: SquadFormation
): void {
  // Determine config based on squad type
  let useBoosts = false;
  if (squad.type !== "defense") {
    const doctrineType = squad.type === "harass" ? "harassment" : squad.type;
    const config = DOCTRINE_CONFIGS[doctrineType];
    useBoosts = config.useBoosts;
  }
  
  // Determine priority based on squad type
  let priority = SpawnPriority.NORMAL;
  if (squad.type === "siege") {
    priority = SpawnPriority.HIGH;
  } else if (squad.type === "defense") {
    priority = SpawnPriority.EMERGENCY;
  }
  
  // Helper to create a spawn request
  const createRequest = (role: string, count: number) => {
    for (let i = 0; i < count; i++) {
      const bodyParts = getBodyForRole(role, "medium", room.energyCapacityAvailable);
      const bodyCost = bodyParts.reduce((sum, part) => sum + BODYPART_COST[part], 0);
      
      const boostReqs = useBoosts ? getBoostsForRole(role) : [];
      
      const request: SpawnRequest = {
        id: `${squad.id}_${role}_${i}_${Game.time}`,
        roomName: room.name,
        role: role as any,
        family: "military",
        body: {
          parts: bodyParts,
          cost: bodyCost,
          minCapacity: bodyCost
        },
        priority,
        targetRoom: squad.targetRooms[0],
        boostRequirements: boostReqs.length > 0 ? boostReqs.map(boost => ({
          resourceType: boost.compound,
          bodyParts: bodyParts.filter(part => boost.parts.includes(part))
        })) : undefined,
        createdAt: Game.time,
        additionalMemory: {
          squadId: squad.id
        }
      };
      
      spawnQueue.addRequest(request);
      formation.spawnRequests.add(request.id);
    }
  };
  
  // Create requests for each role
  if (composition.harassers > 0) createRequest("harasser", composition.harassers);
  if (composition.soldiers > 0) createRequest("soldier", composition.soldiers);
  if (composition.rangers > 0) createRequest("ranger", composition.rangers);
  if (composition.healers > 0) createRequest("healer", composition.healers);
  if (composition.siegeUnits > 0) createRequest("siegeUnit", composition.siegeUnits);
}

/**
 * Get body template for a role
 */
function getBodyForRole(role: string, size: "small" | "medium" | "large", maxEnergy: number): BodyPartConstant[] {
  // Simple body generation - can be enhanced later
  const budget = Math.min(maxEnergy, size === "small" ? 1500 : size === "medium" ? 3000 : 5000);
  
  switch (role) {
    case "harasser":
      return generateBody([MOVE, ATTACK], budget, [MOVE, ATTACK]);
    case "soldier":
      return generateBody([TOUGH, MOVE, ATTACK, MOVE, ATTACK], budget, [TOUGH, MOVE, ATTACK]);
    case "ranger":
      return generateBody([TOUGH, MOVE, RANGED_ATTACK], budget, [MOVE, RANGED_ATTACK]);
    case "healer":
      return generateBody([TOUGH, MOVE, HEAL], budget, [MOVE, HEAL]);
    case "siegeUnit":
      return generateBody([TOUGH, MOVE, WORK], budget, [TOUGH, MOVE, WORK]);
    default:
      return [MOVE, ATTACK];
  }
}

/**
 * Generate body with a pattern up to budget
 */
function generateBody(pattern: BodyPartConstant[], budget: number, repeatPattern: BodyPartConstant[]): BodyPartConstant[] {
  const body: BodyPartConstant[] = [...pattern];
  let cost = pattern.reduce((sum, part) => sum + BODYPART_COST[part], 0);
  
  const repeatCost = repeatPattern.reduce((sum, part) => sum + BODYPART_COST[part], 0);
  
  while (cost + repeatCost <= budget && body.length < 50) {
    body.push(...repeatPattern);
    cost += repeatCost;
  }
  
  return body.slice(0, 50); // Max 50 parts
}

/**
 * Get boost compounds and applicable body parts for a role
 */
function getBoostsForRole(role: string): { compound: MineralBoostConstant; parts: BodyPartConstant[] }[] {
  switch (role) {
    case "soldier":
      // XUH2O: T3 attack boost (UH -> UH2O -> XUH2O)
      return [{ compound: RESOURCE_CATALYZED_UTRIUM_ALKALIDE, parts: [ATTACK] }];
    case "ranger":
      // XKH2O: T3 ranged attack boost (KH -> KH2O -> XKH2O)
      return [{ compound: RESOURCE_CATALYZED_KEANIUM_ALKALIDE, parts: [RANGED_ATTACK] }];
    case "healer":
      // XLH2O: T3 heal boost (LH -> LH2O -> XLH2O)
      return [{ compound: RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE, parts: [HEAL] }];
    case "siegeUnit":
      // XZH2O: T3 dismantle boost (ZH -> ZH2O -> XZH2O)
      return [{ compound: RESOURCE_CATALYZED_ZYNTHIUM_ACID, parts: [WORK] }];
    default:
      return [];
  }
}

/**
 * Update squad formation progress
 * Called when a creep spawns
 */
export function onCreepSpawned(creep: Creep): void {
  const squadId = (creep.memory as any).squadId;
  if (!squadId) return;
  
  const formation = activeFormations.get(squadId);
  if (!formation) return;
  
  // Update composition
  const role = creep.memory.role ;
  formation.currentComposition[role] = (formation.currentComposition[role] ?? 0) + 1;
  
  // Add creep to squad
  addCreepToSquad(creep.name, squadId);
  
  logger.debug(`Added ${creep.name} (${role}) to squad ${squadId}`, {
    subsystem: "SquadFormation"
  });
  
  // Check if formation is complete
  checkFormationComplete(squadId, formation);
}

/**
 * Check if squad formation is complete
 */
function checkFormationComplete(squadId: string, formation: SquadFormation): void {
  const isComplete = Object.entries(formation.targetComposition).every(
    ([role, target]) => (formation.currentComposition[role] ?? 0) >= target
  );
  
  if (isComplete) {
    logger.info(
      `Squad ${squadId} formation complete: ${JSON.stringify(formation.currentComposition)}`,
      { subsystem: "SquadFormation" }
    );
    activeFormations.delete(squadId);
  }
}

/**
 * Update all active formations
 * Remove stale formations that are taking too long
 */
export function updateSquadFormations(): void {
  const now = Game.time;
  const FORMATION_TIMEOUT = 500; // 500 ticks = ~25 minutes at 20 ticks/sec
  
  for (const [squadId, formation] of activeFormations.entries()) {
    const age = now - formation.formationStarted;
    
    if (age > FORMATION_TIMEOUT) {
      logger.warn(`Squad ${squadId} formation timed out after ${age} ticks`, {
        subsystem: "SquadFormation"
      });
      activeFormations.delete(squadId);
    }
  }
}

/**
 * Cancel squad formation
 */
export function cancelSquadFormation(squadId: string): void {
  const formation = activeFormations.get(squadId);
  if (!formation) return;
  
  // Cancel all pending spawn requests
  for (const requestId of formation.spawnRequests) {
    // Note: spawnQueue would need a cancel method - for now just log
    logger.debug(`Would cancel spawn request ${requestId} for squad ${squadId}`, {
      subsystem: "SquadFormation"
    });
  }
  
  activeFormations.delete(squadId);
  logger.info(`Cancelled formation for squad ${squadId}`, { subsystem: "SquadFormation" });
}

/**
 * Get formation status
 */
export function getFormationStatus(squadId: string): SquadFormation | null {
  return activeFormations.get(squadId) ?? null;
}

/**
 * Check if a squad is currently forming
 */
export function isSquadForming(squadId: string): boolean {
  return activeFormations.has(squadId);
}

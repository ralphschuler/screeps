/**
 * Nuke Coordination Module
 * 
 * Handles coordination between nuke strikes and siege squads
 */

import { logger } from "@ralphschuler/screeps-core";
import type { EmpireMemory, NukeInFlight, SquadDefinition, ClusterMemory, SwarmState } from "../types";
import type { NukeConfig } from "./types";

/**
 * Coordinate nuke launches with siege squads
 * Ensures nukes land when siege squads arrive, and deploys squads if needed
 */
export function coordinateWithSieges(
  empire: EmpireMemory,
  config: NukeConfig,
  getClusters: () => Record<string, ClusterMemory>,
  getSwarmState: (roomName: string) => SwarmState | undefined
): void {
  if (!empire.objectives.warMode) return;
  if (!empire.nukesInFlight || empire.nukesInFlight.length === 0) return;

  const clusters = getClusters();

  // Check each nuke in flight for siege coordination opportunity
  for (const nuke of empire.nukesInFlight) {
    const ticksUntilImpact = nuke.impactTick - Game.time;

    // Skip if nuke already has a siege squad assigned
    if (nuke.siegeSquadId) continue;

    // Check if we should deploy siege squad (within coordination window)
    if (ticksUntilImpact <= config.siegeCoordinationWindow && ticksUntilImpact > 0) {
      // Try to find or create siege squad for this nuke
      const deployed = deploySiegeSquadForNuke(nuke, clusters, getSwarmState);
      if (deployed) {
        logger.info(
          `Siege squad deployment coordinated with nuke on ${nuke.targetRoom}, ` +
          `impact in ${ticksUntilImpact} ticks`,
          { subsystem: "Nuke" }
        );
      }
    }
  }

  // Also check existing siege squads and match with nukes
  for (const cluster of Object.values(clusters)) {
    if (!cluster.squads || cluster.squads.length === 0) continue;

    // Find siege squads
    const siegeSquads = cluster.squads.filter(s => s.type === "siege");

    for (const squad of siegeSquads) {
      if (squad.state !== "moving" && squad.state !== "attacking") continue;

      // Check if squad is targeting a room with a nuke in flight
      const targetRoom = squad.targetRooms[0];
      if (!targetRoom) continue;

      const targetedNuke = empire.nukesInFlight?.find(n => n.targetRoom === targetRoom);
      if (targetedNuke && !targetedNuke.siegeSquadId) {
        targetedNuke.siegeSquadId = squad.id;
        logger.info(
          `Linked siege squad ${squad.id} with nuke on ${targetRoom}`,
          { subsystem: "Nuke" }
        );
      }
    }
  }
}

/**
 * Deploy a siege squad to coordinate with a nuke strike
 * Returns true if squad was deployed or already exists
 */
function deploySiegeSquadForNuke(
  nuke: NukeInFlight,
  clusters: Record<string, ClusterMemory>,
  getSwarmState: (roomName: string) => SwarmState | undefined
): boolean {
  // Find nearest cluster to target
  let nearestCluster: { id: string; distance: number } | null = null;

  for (const cluster of Object.values(clusters)) {
    const distance = Game.map.getRoomLinearDistance(cluster.coreRoom, nuke.targetRoom);
    if (!nearestCluster || distance < nearestCluster.distance) {
      nearestCluster = { id: cluster.id, distance };
    }
  }

  if (!nearestCluster) {
    logger.warn(
      `Cannot deploy siege squad for nuke on ${nuke.targetRoom}: No clusters available`,
      { subsystem: "Nuke" }
    );
    return false;
  }

  const cluster = clusters[nearestCluster.id];
  if (!cluster) return false;

  // Check if cluster already has a siege squad targeting this room
  const existingSquad = cluster.squads?.find(
    s => s.type === "siege" && s.targetRooms.includes(nuke.targetRoom)
  );

  if (existingSquad) {
    nuke.siegeSquadId = existingSquad.id;
    return true;
  }

  // Create new siege squad request
  // Note: Actual squad creation is handled by squadCoordinator/squadFormationManager
  // We just set the pheromones and create the request structure
  const targetSwarm = getSwarmState(nuke.targetRoom);
  if (targetSwarm) {
    // Increase siege pheromone to trigger squad creation
    targetSwarm.pheromones.siege = Math.min(100, targetSwarm.pheromones.siege + 80);
    targetSwarm.pheromones.war = Math.min(100, targetSwarm.pheromones.war + 60);
    
    logger.info(
      `Siege pheromones increased for ${nuke.targetRoom} to coordinate with nuke strike`,
      { subsystem: "Nuke" }
    );
  }

  // Create squad definition for the cluster to pick up
  const squadId = `siege-nuke-${nuke.targetRoom}-${Game.time}`;
  const newSquad: SquadDefinition = {
    id: squadId,
    type: "siege",
    members: [], // Will be filled by squad formation manager
    rallyRoom: cluster.coreRoom,
    targetRooms: [nuke.targetRoom],
    state: "gathering",
    createdAt: Game.time,
    retreatThreshold: 0.3
  };

  if (!cluster.squads) {
    cluster.squads = [];
  }
  cluster.squads.push(newSquad);
  nuke.siegeSquadId = squadId;

  logger.warn(
    `SIEGE SQUAD DEPLOYED: Squad ${squadId} will coordinate with nuke on ${nuke.targetRoom}`,
    { subsystem: "Nuke" }
  );

  return true;
}

/**
 * Estimate ticks until squad reaches target
 */
export function estimateSquadEta(squad: SquadDefinition, targetRoom: string): number {
  // Find average position of squad members
  const members = squad.members
    .map(name => Game.creeps[name])
    .filter((c): c is Creep => c != null);

  if (members.length === 0) {
    // Squad not spawned yet, estimate from rally room
    const distance = Game.map.getRoomLinearDistance(squad.rallyRoom, targetRoom);
    return distance * 50; // Rough estimate: 50 ticks per room
  }

  // Use closest member to target as estimate
  const distances = members.map(creep => {
    const distance = Game.map.getRoomLinearDistance(creep.room.name, targetRoom);
    return distance * 50; // Rough estimate
  });

  return Math.min(...distances);
}

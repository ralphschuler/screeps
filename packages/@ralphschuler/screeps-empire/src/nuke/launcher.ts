/**
 * Nuke Launcher Module
 * 
 * Handles nuke launching and salvo coordination
 */

import { logger } from "@ralphschuler/screeps-core";
import type { EmpireMemory, NukeInFlight, NukeEconomics } from "../types";
import type { NukeConfig } from "./types";
import { NUKE_COST } from "./types";
import { predictNukeImpact, calculateNukeROI } from "./targeting";

/**
 * Launch nukes at top candidates with tracking and economics
 */
export function launchNukes(
  empire: EmpireMemory,
  config: NukeConfig
): void {
  // Only launch if in war mode
  if (!empire.objectives.warMode) {
    return;
  }

  // Get all nukers
  const nukers: StructureNuker[] = [];
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (!room.controller?.my) continue;

    const nuker = room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_NUKER
    })[0] as StructureNuker | undefined;

    if (
      nuker &&
      nuker.store.getUsedCapacity(RESOURCE_ENERGY) >= config.minEnergy &&
      nuker.store.getUsedCapacity(RESOURCE_GHODIUM) >= config.minGhodium
    ) {
      nukers.push(nuker);
    }
  }

  if (nukers.length === 0) {
    return; // No ready nukers
  }

  // Launch at top candidates
  for (const candidate of empire.nukeCandidates) {
    if (candidate.launched) continue;

    // Find a nuker in range
    for (const nuker of nukers) {
      const distance = Game.map.getRoomLinearDistance(nuker.room.name, candidate.roomName);
      if (distance > 10) continue; // Out of range

      // Get target position (center of room for maximum impact)
      const targetPos = new RoomPosition(25, 25, candidate.roomName);

      // Predict impact before launching
      const prediction = predictNukeImpact(candidate.roomName, targetPos, empire);

      // Verify ROI one more time before launch
      const roi = calculateNukeROI(candidate.roomName, targetPos, empire);
      if (roi < config.roiThreshold) {
        logger.warn(
          `Skipping nuke launch on ${candidate.roomName}: ROI ${roi.toFixed(2)}x below threshold ${config.roiThreshold}x`,
          { subsystem: "Nuke" }
        );
        continue;
      }

      const result = nuker.launchNuke(targetPos);
      if (result === OK) {
        candidate.launched = true;
        candidate.launchTick = Game.time;

        // Track nuke in flight
        const nukeId = `${nuker.room.name}-${candidate.roomName}-${Game.time}`;
        const nukeInFlight: NukeInFlight = {
          id: nukeId,
          sourceRoom: nuker.room.name,
          targetRoom: candidate.roomName,
          targetPos: { x: targetPos.x, y: targetPos.y },
          launchTick: Game.time,
          impactTick: Game.time + config.nukeFlightTime,
          estimatedDamage: prediction.estimatedDamage,
          estimatedValue: prediction.estimatedValue
        };

        if (!empire.nukesInFlight) {
          empire.nukesInFlight = [];
        }
        empire.nukesInFlight.push(nukeInFlight);

        // Update economics tracking
        if (!empire.nukeEconomics) {
          empire.nukeEconomics = {
            nukesLaunched: 0,
            totalEnergyCost: 0,
            totalGhodiumCost: 0,
            totalDamageDealt: 0,
            totalValueDestroyed: 0
          };
        }
        empire.nukeEconomics.nukesLaunched++;
        empire.nukeEconomics.totalEnergyCost += NUKE_COST.ENERGY;
        empire.nukeEconomics.totalGhodiumCost += NUKE_COST.GHODIUM;
        empire.nukeEconomics.totalDamageDealt += prediction.estimatedDamage;
        empire.nukeEconomics.totalValueDestroyed += prediction.estimatedValue;
        empire.nukeEconomics.lastLaunchTick = Game.time;

        logger.warn(
          `NUKE LAUNCHED from ${nuker.room.name} to ${candidate.roomName}! ` +
          `Impact in ${config.nukeFlightTime} ticks. ` +
          `Predicted damage: ${(prediction.estimatedDamage / 1000000).toFixed(1)}M hits, ` +
          `value: ${(prediction.estimatedValue / 1000).toFixed(0)}k, ROI: ${roi.toFixed(2)}x`,
          { subsystem: "Nuke" }
        );

        // Remove this nuker from available list
        const index = nukers.indexOf(nuker);
        if (index > -1) {
          nukers.splice(index, 1);
        }

        break;
      } else {
        logger.error(`Failed to launch nuke: ${result}`, { subsystem: "Nuke" });
      }
    }

    if (nukers.length === 0) {
      break; // No more nukers available
    }
  }
}

/**
 * Coordinate nuke salvos for maximum impact
 * Groups nukes targeting the same room to hit within salvoSyncWindow
 */
export function coordinateNukeSalvos(
  empire: EmpireMemory,
  config: NukeConfig
): void {
  if (!empire.nukesInFlight || empire.nukesInFlight.length === 0) return;

  // Group nukes by target room
  const nukesByTarget = new Map<string, NukeInFlight[]>();
  for (const nuke of empire.nukesInFlight) {
    const existing = nukesByTarget.get(nuke.targetRoom) || [];
    existing.push(nuke);
    nukesByTarget.set(nuke.targetRoom, existing);
  }

  // Coordinate salvos for rooms with multiple nukes
  for (const [targetRoom, nukes] of nukesByTarget.entries()) {
    if (nukes.length < 2) continue;

    // Check if nukes are within sync window
    const impactTicks = nukes.map(n => n.impactTick);
    const minImpact = Math.min(...impactTicks);
    const maxImpact = Math.max(...impactTicks);
    const spread = maxImpact - minImpact;

    if (spread <= config.salvoSyncWindow) {
      // Nukes are synchronized, assign salvo ID if not already assigned
      const salvoId = nukes[0].salvoId || `salvo-${targetRoom}-${minImpact}`;
      for (const nuke of nukes) {
        nuke.salvoId = salvoId;
      }
      
      logger.info(
        `Nuke salvo ${salvoId} coordinated: ${nukes.length} nukes on ${targetRoom}, impact spread: ${spread} ticks`,
        { subsystem: "Nuke" }
      );
    } else {
      logger.warn(
        `Nukes on ${targetRoom} not synchronized (spread: ${spread} ticks > ${config.salvoSyncWindow})`,
        { subsystem: "Nuke" }
      );
    }
  }
}

/**
 * Update nuke economics tracking
 */
export function updateNukeEconomics(empire: EmpireMemory): void {
  if (!empire.nukeEconomics) return;

  const economics = empire.nukeEconomics;

  // Update ROI calculation if we have data
  const totalCost = economics.totalEnergyCost + economics.totalGhodiumCost;
  if (totalCost > 0) {
    const totalGain = economics.totalValueDestroyed;
    economics.lastROI = totalGain / totalCost;

    // Log significant ROI milestones
    if (economics.nukesLaunched > 0 && economics.nukesLaunched % 5 === 0) {
      logger.info(
        `Nuke economics: ${economics.nukesLaunched} nukes, ROI: ${economics.lastROI?.toFixed(2)}x, ` +
        `Value destroyed: ${(economics.totalValueDestroyed / 1000).toFixed(0)}k`,
        { subsystem: "Nuke" }
      );
    }
  }
}

/**
 * Clean up old nuke tracking data
 */
export function cleanupNukeTracking(empire: EmpireMemory): void {
  // Remove nukes that have already impacted
  if (empire.nukesInFlight) {
    empire.nukesInFlight = empire.nukesInFlight.filter(
      nuke => nuke.impactTick > Game.time
    );
  }

  // Remove old incoming nuke alerts (already impacted)
  if (empire.incomingNukes) {
    const before = empire.incomingNukes.length;
    empire.incomingNukes = empire.incomingNukes.filter(
      alert => alert.impactTick > Game.time
    );
    const removed = before - empire.incomingNukes.length;
    
    if (removed > 0) {
      logger.info(`Cleaned up ${removed} impacted nuke alert(s)`, { subsystem: "Nuke" });
    }
  }
}

/**
 * Initialize nuke tracking arrays if they don't exist
 */
export function initializeNukeTracking(empire: EmpireMemory): void {
  if (!empire.nukesInFlight) {
    empire.nukesInFlight = [];
  }
  
  if (!empire.incomingNukes) {
    empire.incomingNukes = [];
  }
  
  if (!empire.nukeEconomics) {
    empire.nukeEconomics = {
      nukesLaunched: 0,
      totalEnergyCost: 0,
      totalGhodiumCost: 0,
      totalDamageDealt: 0,
      totalValueDestroyed: 0
    };
  }
}

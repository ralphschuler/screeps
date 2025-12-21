/**
 * Bootstrap Manager Module
 * 
 * Handles early game and emergency recovery logic.
 * When the economy collapses (all energy producers die), this module
 * takes over with deterministic priority spawning to rebuild the workforce.
 */

import type { SwarmState } from "../memory/schemas";
import { countCreepsByRole, needsRole } from "./spawnNeedsAnalyzer";
import { cachedFindSources } from "../utils/caching";
import { logger } from "../core/logger";

/**
 * Get count of energy-producing creeps (harvesters + larvaWorkers)
 */
export function getEnergyProducerCount(counts: Map<string, number>): number {
  return (counts.get("harvester") ?? 0) + (counts.get("larvaWorker") ?? 0);
}

/**
 * Get count of transport creeps (haulers + larvaWorkers)
 */
export function getTransportCount(counts: Map<string, number>): number {
  return (counts.get("hauler") ?? 0) + (counts.get("larvaWorker") ?? 0);
}

/**
 * Check if room is in emergency state (no ACTIVE energy-producing creeps)
 * This happens when all creeps die and extensions are empty.
 * 
 * IMPORTANT: Only counts ACTIVE (non-spawning) creeps. This ensures we continue
 * spawning bootstrap creeps even while one is already spawning, allowing
 * faster recovery from total workforce collapse.
 */
export function isEmergencySpawnState(roomName: string): boolean {
  const counts = countCreepsByRole(roomName, true); // activeOnly = true
  return getEnergyProducerCount(counts) === 0;
}

/**
 * Bootstrap spawn order - deterministic priority-based spawning.
 * This defines the order in which critical roles should be spawned during
 * recovery from a bad state, ensuring the economy can bootstrap properly.
 * 
 * DYNAMIC: Harvester count is determined by the number of sources in the room.
 * Each room needs 1 harvester per source for optimal energy production.
 */
function getBootstrapSpawnOrder(room: Room): { role: string; minCount: number; condition?: (room: Room) => boolean }[] {
  // Count sources in the room to determine how many harvesters we need
  // Most rooms have 2 sources, but some have only 1
  const sources = cachedFindSources(room);
  const sourceCount = Math.max(sources.length, 1); // Ensure at least 1
  
  return [
    // 1. Energy production first - can't do anything without energy
    { role: "larvaWorker", minCount: 1 },
    // 2. First harvester (always needed, regardless of source count)
    { role: "harvester", minCount: 1 },
    // 3. Transport to distribute energy (1 is enough with bigger bodies)
    { role: "hauler", minCount: 1 },
    // 4. Additional harvesters for remaining sources (1 per source)
    // FIXED: Dynamic harvester count based on actual sources in room
    // This ensures single-source rooms don't get stuck waiting for 2nd harvester
    { role: "harvester", minCount: sourceCount },
    // 5. Queen carrier when storage exists (manages spawns/extensions)
    { role: "queenCarrier", minCount: 1, condition: (room: Room) => Boolean(room.storage) },
    // 6. Upgrader for controller progress
    { role: "upgrader", minCount: 1 }
  ];
}

/**
 * Determine if the room is in "bootstrap" mode where critical roles are missing.
 * In bootstrap mode, we use deterministic priority spawning instead of weighted selection.
 *
 * Bootstrap mode is active when:
 * - Zero ACTIVE energy producers exist, OR
 * - We have energy producers but no transport (energy can't be distributed), OR
 * - We have fewer than minimum critical roles
 * 
 * IMPORTANT: Uses activeOnly counts for emergency detection but total counts for
 * role minimums. This ensures we aggressively spawn multiple small creeps during
 * workforce collapse while still allowing spawning creeps to count towards role limits.
 */
export function isBootstrapMode(roomName: string, room: Room): boolean {
  // Check ACTIVE creeps for emergency detection
  const activeCounts = countCreepsByRole(roomName, true);
  
  // Critical: no ACTIVE energy production at all
  // This ensures we keep spawning even while a larvaWorker is spawning
  if (getEnergyProducerCount(activeCounts) === 0) {
    return true;
  }

  // Critical: we have harvesters but no way to transport energy
  // (larvaWorkers can self-transport so they count as transport)
  if (getTransportCount(activeCounts) === 0 && (activeCounts.get("harvester") ?? 0) > 0) {
    return true;
  }

  // For minimum role checks, use total counts (including spawning)
  // This prevents spawning duplicates when one is already spawning
  const totalCounts = countCreepsByRole(roomName, false);
  
  // Check minimum counts against bootstrap order
  // FIXED: Use dynamic bootstrap order based on room's source count
  const bootstrapOrder = getBootstrapSpawnOrder(room);
  for (const req of bootstrapOrder) {
    // Skip conditional roles if condition not met
    if (req.condition && !req.condition(room)) {
      continue;
    }

    const current = totalCounts.get(req.role) ?? 0;
    if (current < req.minCount) {
      return true;
    }
  }

  return false;
}

/**
 * Get the next role to spawn in bootstrap mode.
 * Uses deterministic priority order instead of weighted random selection.
 * 
 * IMPORTANT: Checks active counts for emergency, but total counts for role minimums.
 * This allows spawning additional larvaWorkers if none are active, even if one is spawning.
 */
export function getBootstrapRole(roomName: string, room: Room, swarm: SwarmState): string | null {
  // Check ACTIVE energy producers for emergency
  const activeCounts = countCreepsByRole(roomName, true);
  
  // First check emergency: zero ACTIVE energy producers
  // This ensures we can spawn multiple larvaWorkers if needed for faster recovery
  if (getEnergyProducerCount(activeCounts) === 0) {
    logger.info(`Bootstrap: Spawning larvaWorker (emergency - no active energy producers)`, {
      subsystem: "spawn",
      room: roomName
    });
    return "larvaWorker";
  }

  // For role minimums, use total counts (including spawning)
  const totalCounts = countCreepsByRole(roomName, false);
  
  // Follow bootstrap order
  // FIXED: Use dynamic bootstrap order based on room's source count
  const bootstrapOrder = getBootstrapSpawnOrder(room);
  
  logger.info(`Bootstrap: Checking ${bootstrapOrder.length} roles in order`, {
    subsystem: "spawn",
    room: roomName,
    meta: {
      totalCreeps: totalCounts.size,
      creepCounts: Array.from(totalCounts.entries())
    }
  });
  
  for (const req of bootstrapOrder) {
    // Skip conditional roles if condition not met
    if (req.condition && !req.condition(room)) {
      logger.info(`Bootstrap: Skipping ${req.role} (condition not met)`, {
        subsystem: "spawn",
        room: roomName
      });
      continue;
    }

    const current = totalCounts.get(req.role) ?? 0;
    if (current < req.minCount) {
      // Verify we can spawn this role (check needsRole for special conditions)
      // Pass isBootstrapMode = true to allow larvaWorker in bootstrap mode
      const canSpawn = needsRole(roomName, req.role, swarm, true);
      logger.info(
        `Bootstrap: Role ${req.role} needs spawning (current: ${current}, min: ${req.minCount}, needsRole: ${canSpawn})`,
        {
          subsystem: "spawn",
          room: roomName
        }
      );
      if (canSpawn) {
        return req.role;
      } else {
        logger.warn(
          `Bootstrap: Role ${req.role} blocked by needsRole check (current: ${current}/${req.minCount})`,
          {
            subsystem: "spawn",
            room: roomName
          }
        );
      }
    }
  }

  logger.info(`Bootstrap: No role needs spawning`, {
    subsystem: "spawn",
    room: roomName
  });
  return null;
}

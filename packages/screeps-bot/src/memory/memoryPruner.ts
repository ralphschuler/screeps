/**
 * Memory Pruner
 *
 * Automatically prunes stale and unnecessary data from memory.
 * Reduces memory footprint by removing old event logs, expired intel, and completed tasks.
 *
 * ROADMAP Section 4: Automatic memory pruning for old/stale data
 */

import { logger } from "../core/logger";
import type { EmpireMemory, SwarmState } from "./schemas";

/** Maximum event log entries per room */
const MAX_EVENT_LOG_ENTRIES = 20;

/** Maximum age for intel data (ticks) */
const MAX_INTEL_AGE = 10000;

/** Maximum age for market history (ticks) */
const MAX_MARKET_HISTORY_AGE = 5000;

/**
 * Pruning statistics
 */
export interface PruningStats {
  /** Dead creeps removed */
  deadCreeps: number;
  /** Event log entries removed */
  eventLogs: number;
  /** Stale intel entries removed */
  staleIntel: number;
  /** Market history entries removed */
  marketHistory: number;
  /** Total bytes freed */
  bytesSaved: number;
}

/**
 * Memory Pruner class
 */
export class MemoryPruner {
  /**
   * Run all pruning operations
   */
  public pruneAll(): PruningStats {
    const sizeBefore = RawMemory.get().length;

    const stats: PruningStats = {
      deadCreeps: 0,
      eventLogs: 0,
      staleIntel: 0,
      marketHistory: 0,
      bytesSaved: 0
    };

    // Run individual pruning operations
    stats.deadCreeps = this.pruneDeadCreeps();
    stats.eventLogs = this.pruneEventLogs(MAX_EVENT_LOG_ENTRIES);
    stats.staleIntel = this.pruneStaleIntel(MAX_INTEL_AGE);
    stats.marketHistory = this.pruneMarketHistory(MAX_MARKET_HISTORY_AGE);

    const sizeAfter = RawMemory.get().length;
    stats.bytesSaved = Math.max(0, sizeBefore - sizeAfter);

    if (stats.bytesSaved > 0) {
      logger.info("Memory pruning complete", {
        subsystem: "MemoryPruner",
        meta: stats
      });
    }

    return stats;
  }

  /**
   * Prune dead creep memory
   */
  public pruneDeadCreeps(): number {
    let pruned = 0;
    for (const name in Memory.creeps) {
      if (!(name in Game.creeps)) {
        delete Memory.creeps[name];
        pruned++;
      }
    }
    return pruned;
  }

  /**
   * Prune event logs to keep only recent entries
   */
  public pruneEventLogs(maxEntries: number): number {
    let totalPruned = 0;

    if (!Memory.rooms) return 0;

    for (const roomName in Memory.rooms) {
      const roomMem = Memory.rooms[roomName] as unknown as { swarm?: SwarmState };
      const swarm = roomMem?.swarm;
      
      if (swarm?.eventLog && swarm.eventLog.length > maxEntries) {
        const pruned = swarm.eventLog.length - maxEntries;
        swarm.eventLog.splice(0, pruned);
        totalPruned += pruned;
      }
    }

    return totalPruned;
  }

  /**
   * Prune stale intel data
   */
  public pruneStaleIntel(maxAge: number): number {
    const mem = Memory as unknown as Record<string, unknown>;
    const empire = mem.empire as EmpireMemory | undefined;
    
    if (!empire?.knownRooms) return 0;

    let pruned = 0;
    const cutoffTime = Game.time - maxAge;

    for (const roomName in empire.knownRooms) {
      const intel = empire.knownRooms[roomName];
      
      // Don't prune intel for rooms we currently own or are actively scouting
      const room = Game.rooms[roomName];
      if (room?.controller?.my) continue;
      
      // Remove intel that's too old and not for highway/portal rooms
      if (intel.lastSeen < cutoffTime && !intel.isHighway && !intel.hasPortal) {
        delete empire.knownRooms[roomName];
        pruned++;
      }
    }

    return pruned;
  }

  /**
   * Prune old market history
   */
  public pruneMarketHistory(maxAge: number): number {
    const mem = Memory as unknown as Record<string, unknown>;
    const empire = mem.empire as EmpireMemory | undefined;
    
    if (!empire?.market) return 0;

    // Check if priceHistory exists (it may not be in the type but could be in memory)
    const marketRecord = empire.market as unknown as Record<string, unknown>;
    const priceHistory = marketRecord.priceHistory as Record<string, Array<{ time: number }>> | undefined;
    
    if (!priceHistory) return 0;

    let pruned = 0;
    const cutoffTime = Game.time - maxAge;

    for (const resourceType in priceHistory) {
      const history = priceHistory[resourceType];
      if (!history) continue;

      const initialLength = history.length;
      // Keep only recent price data
      priceHistory[resourceType] = history.filter(
        entry => entry.time >= cutoffTime
      );
      pruned += initialLength - priceHistory[resourceType].length;
    }

    return pruned;
  }

  /**
   * Prune completed construction sites from memory
   */
  public pruneCompletedConstruction(): number {
    let pruned = 0;

    if (!Memory.rooms) return 0;

    for (const roomName in Memory.rooms) {
      const room = Game.rooms[roomName];
      if (!room) continue;

      const roomMem = Memory.rooms[roomName] as unknown as { 
        swarm?: SwarmState;
        construction?: { sites?: string[] };
      };

      // Remove construction site IDs that no longer exist
      if (roomMem.construction?.sites) {
        const beforeCount = roomMem.construction.sites.length;
        roomMem.construction.sites = roomMem.construction.sites.filter(siteId => {
          return Game.getObjectById(siteId as Id<ConstructionSite>) !== null;
        });
        pruned += beforeCount - roomMem.construction.sites.length;
      }
    }

    return pruned;
  }

  /**
   * Prune old powerbank entries
   */
  public prunePowerBanks(): number {
    const mem = Memory as unknown as Record<string, unknown>;
    const empire = mem.empire as EmpireMemory | undefined;
    
    if (!empire?.powerBanks) return 0;

    const initialCount = empire.powerBanks.length;
    
    // Remove powerbanks that have already decayed
    empire.powerBanks = empire.powerBanks.filter(pb => pb.decayTick > Game.time);

    return initialCount - empire.powerBanks.length;
  }

  /**
   * Prune old nuke tracking data
   */
  public pruneOldNukes(): number {
    const mem = Memory as unknown as Record<string, unknown>;
    const empire = mem.empire as EmpireMemory | undefined;
    
    if (!empire) return 0;

    let pruned = 0;

    // Remove landed nukes from tracking
    if (empire.nukesInFlight) {
      for (const nukeId in empire.nukesInFlight) {
        const nuke = empire.nukesInFlight[nukeId];
        if (nuke.impactTick < Game.time) {
          delete empire.nukesInFlight[nukeId];
          pruned++;
        }
      }
    }

    // Remove old incoming nuke alerts
    if (empire.incomingNukes) {
      const initialCount = empire.incomingNukes.length;
      empire.incomingNukes = empire.incomingNukes.filter(
        alert => alert.impactTick >= Game.time
      );
      pruned += initialCount - empire.incomingNukes.length;
    }

    return pruned;
  }

  /**
   * Get pruning recommendations
   */
  public getRecommendations(): string[] {
    const recommendations: string[] = [];
    const mem = Memory as unknown as Record<string, unknown>;
    const empire = mem.empire as EmpireMemory | undefined;

    // Check event logs
    if (Memory.rooms) {
      for (const roomName in Memory.rooms) {
        const roomMem = Memory.rooms[roomName] as unknown as { swarm?: SwarmState };
        const swarm = roomMem?.swarm;
        if (swarm?.eventLog) {
          if (swarm.eventLog.length > MAX_EVENT_LOG_ENTRIES * 2) {
            recommendations.push(`Room ${roomName} has ${swarm.eventLog.length} event log entries (recommended max: ${MAX_EVENT_LOG_ENTRIES})`);
          }
        }
      }
    }

    // Check intel age
    if (empire?.knownRooms) {
      let staleCount = 0;
      const cutoffTime = Game.time - MAX_INTEL_AGE;
      for (const roomName in empire.knownRooms) {
        const intel = empire.knownRooms[roomName];
        if (intel.lastSeen < cutoffTime && !intel.isHighway && !intel.hasPortal) {
          staleCount++;
        }
      }
      if (staleCount > 50) {
        recommendations.push(`${staleCount} stale intel entries (older than ${MAX_INTEL_AGE} ticks)`);
      }
    }

    // Check dead creeps
    let deadCreeps = 0;
    for (const name in Memory.creeps) {
      if (!(name in Game.creeps)) {
        deadCreeps++;
      }
    }
    if (deadCreeps > 10) {
      recommendations.push(`${deadCreeps} dead creeps in memory`);
    }

    return recommendations;
  }
}

/**
 * Global memory pruner instance
 */
export const memoryPruner = new MemoryPruner();

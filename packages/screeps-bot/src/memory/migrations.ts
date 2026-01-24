/**
 * Memory Migrations
 *
 * Versioned schema migration system for safe memory structure updates.
 * Allows backward-compatible changes without manual memory wipes.
 *
 * ROADMAP Section 4: Memory migration system for schema changes
 */

import { logger } from "@ralphschuler/screeps-core";
import { memoryCompressor } from "./memoryCompressor";
import { memorySegmentManager } from "./memorySegmentManager";
import type { EmpireMemory } from "./schemas";

/**
 * Migration definition
 */
export interface Migration {
  /** Migration version number (incremental) */
  version: number;
  /** Human-readable description */
  description: string;
  /** Migration function */
  migrate: (memory: Memory) => void;
}

/**
 * Migration registry
 * Add new migrations here with incremental version numbers
 */
export const migrations: Migration[] = [
  {
    version: 4,
    description: "Move historical intel to memory segments",
    migrate: (memory) => {
      const mem = memory as unknown as Record<string, unknown>;
      const empire = mem.empire as EmpireMemory | undefined;
      
      if (!empire?.knownRooms) return;

      // Separate active and historical intel
      const activeIntel: Record<string, unknown> = {};
      const historicalIntel: Record<string, unknown> = {};
      const cutoffTime = Game.time - 5000; // Keep last 5000 ticks in main memory

      for (const roomName in empire.knownRooms) {
        const intel = empire.knownRooms[roomName];
        
        // Keep recent intel, owned rooms, and special rooms in main memory
        if (
          intel.lastSeen >= cutoffTime ||
          Game.rooms[roomName]?.controller?.my ||
          intel.isHighway ||
          intel.hasPortal
        ) {
          activeIntel[roomName] = intel;
        } else {
          historicalIntel[roomName] = intel;
        }
      }

      // Move historical intel to segment
      if (Object.keys(historicalIntel).length > 0) {
        const segmentId = memorySegmentManager.suggestSegmentForType("HISTORICAL_INTEL");
        
        // Request segment if not loaded - it will be available next tick
        if (!memorySegmentManager.isSegmentLoaded(segmentId)) {
          memorySegmentManager.requestSegment(segmentId);
          logger.info("Segment not loaded, migration will continue next tick", {
            subsystem: "MemoryMigrations",
            meta: { segmentId }
          });
          // Don't modify memory yet - migration will retry next tick
          return;
        }
        
        // Segment is loaded, write data
        const writeSuccess = memorySegmentManager.writeSegment(segmentId, "historicalIntel", historicalIntel);
        
        if (!writeSuccess) {
          logger.error("Failed to write historical intel to segment", {
            subsystem: "MemoryMigrations",
            meta: { segmentId }
          });
          // Don't delete from main memory if write failed
          return;
        }
        
        // Only update main memory after successful write
        empire.knownRooms = activeIntel as EmpireMemory["knownRooms"];
        
        logger.info("Migrated historical intel to segments", {
          subsystem: "MemoryMigrations",
          meta: {
            historicalCount: Object.keys(historicalIntel).length,
            activeCount: Object.keys(activeIntel).length,
            segmentId
          }
        });
      }
    }
  },
  {
    version: 5,
    description: "Compress portal map data",
    migrate: (memory) => {
      const mem = memory as unknown as Record<string, unknown>;
      const empire = mem.empire as EmpireMemory | undefined;
      
      if (!empire) return;

      // Check if portals exist and are not already compressed
      const empireRecord = empire as unknown as Record<string, unknown>;
      const portals = empireRecord.portals;
      if (portals && !memoryCompressor.isCompressed(portals)) {
        const compressed = memoryCompressor.compressPortalMap(portals as unknown[]);
        empireRecord.compressedPortals = compressed;
        delete empireRecord.portals;
        
        logger.info("Compressed portal map data", {
          subsystem: "MemoryMigrations",
          meta: {
            originalSize: compressed.originalSize,
            compressedSize: compressed.compressedSize,
            ratio: (compressed.compressedSize / compressed.originalSize * 100).toFixed(1) + "%"
          }
        });
      }
    }
  },
  {
    version: 6,
    description: "Move market history to segments with compression",
    migrate: (memory) => {
      const mem = memory as unknown as Record<string, unknown>;
      const empire = mem.empire as EmpireMemory | undefined;
      
      if (!empire?.market) return;

      // Check if priceHistory exists (it may not be in the type but could be in memory)
      const marketRecord = empire.market as unknown as Record<string, unknown>;
      const priceHistory = marketRecord.priceHistory;
      
      if (!priceHistory) return;

      // Compress market history
      const compressed = memoryCompressor.compressMarketHistory(priceHistory);
      
      // Move to segment
      const segmentId = memorySegmentManager.suggestSegmentForType("MARKET_HISTORY");
      
      // Request segment if not loaded - it will be available next tick
      if (!memorySegmentManager.isSegmentLoaded(segmentId)) {
        memorySegmentManager.requestSegment(segmentId);
        logger.info("Segment not loaded, migration will continue next tick", {
          subsystem: "MemoryMigrations",
          meta: { segmentId }
        });
        // Don't modify memory yet - migration will retry next tick
        return;
      }
      
      // Segment is loaded, write data
      const writeSuccess = memorySegmentManager.writeSegment(segmentId, "priceHistory", compressed);
      
      if (!writeSuccess) {
        logger.error("Failed to write market history to segment", {
          subsystem: "MemoryMigrations",
          meta: { segmentId }
        });
        // Don't delete from main memory if write failed
        return;
      }
      
      // Only remove from main memory after successful write
      delete marketRecord.priceHistory;
      
      logger.info("Migrated market history to segments", {
        subsystem: "MemoryMigrations",
        meta: {
          originalSize: compressed.originalSize,
          compressedSize: compressed.compressedSize,
          segmentId
        }
      });
    }
  },
  {
    version: 7,
    description: "Ensure all clusters have required array properties",
    migrate: (memory) => {
      const mem = memory as unknown as Record<string, unknown>;
      const clusters = mem.clusters as Record<string, unknown> | undefined;
      
      if (!clusters) return;

      let migratedCount = 0;
      
      // Iterate through all clusters and ensure they have required arrays
      for (const clusterId in clusters) {
        const cluster = clusters[clusterId] as Record<string, unknown>;
        
        // Ensure squads array exists
        if (!cluster.squads) {
          cluster.squads = [];
          migratedCount++;
        }
        
        // Ensure defenseRequests array exists
        if (!cluster.defenseRequests) {
          cluster.defenseRequests = [];
          migratedCount++;
        }
        
        // Ensure resourceRequests array exists
        if (!cluster.resourceRequests) {
          cluster.resourceRequests = [];
          migratedCount++;
        }
        
        // Ensure rallyPoints array exists
        if (!cluster.rallyPoints) {
          cluster.rallyPoints = [];
          migratedCount++;
        }
      }
      
      if (migratedCount > 0) {
        logger.info(`Migrated ${migratedCount} cluster array properties`, {
          subsystem: "MemoryMigrations",
          meta: { clustersProcessed: Object.keys(clusters).length }
        });
      }
    }
  }
];

/**
 * Migration runner
 */
export class MigrationRunner {
  /**
   * Run all pending migrations
   */
  public runMigrations(): void {
    const mem = Memory as unknown as Record<string, unknown>;
    const currentVersion = (mem.memoryVersion as number) ?? 0;
    
    // Find pending migrations
    const pendingMigrations = migrations.filter(m => m.version > currentVersion);
    
    if (pendingMigrations.length === 0) {
      return; // No migrations needed
    }

    logger.info(`Running ${pendingMigrations.length} memory migration(s)`, {
      subsystem: "MigrationRunner",
      meta: {
        fromVersion: currentVersion,
        toVersion: pendingMigrations[pendingMigrations.length - 1].version
      }
    });

    // Run migrations in order
    for (const migration of pendingMigrations) {
      try {
        logger.info(`Running migration v${migration.version}: ${migration.description}`, {
          subsystem: "MigrationRunner"
        });

        migration.migrate(Memory);
        
        // Update version after successful migration
        mem.memoryVersion = migration.version;
        
        logger.info(`Migration v${migration.version} complete`, {
          subsystem: "MigrationRunner"
        });
      } catch (error) {
        logger.error(`Migration v${migration.version} failed`, {
          subsystem: "MigrationRunner",
          meta: { error: String(error) }
        });
        
        // Stop running migrations on failure to prevent data corruption
        Game.notify(`Migration v${migration.version} failed: ${String(error)}`);
        break;
      }
    }
  }

  /**
   * Get current memory version
   */
  public getCurrentVersion(): number {
    const mem = Memory as unknown as Record<string, unknown>;
    return (mem.memoryVersion as number) ?? 0;
  }

  /**
   * Get latest migration version
   */
  public getLatestVersion(): number {
    if (migrations.length === 0) return 0;
    return Math.max(...migrations.map(m => m.version));
  }

  /**
   * Check if migrations are pending
   */
  public hasPendingMigrations(): boolean {
    return this.getCurrentVersion() < this.getLatestVersion();
  }

  /**
   * Get pending migrations
   */
  public getPendingMigrations(): Migration[] {
    const currentVersion = this.getCurrentVersion();
    return migrations.filter(m => m.version > currentVersion);
  }

  /**
   * Rollback to a specific version (dangerous!)
   */
  public rollbackToVersion(version: number): void {
    const mem = Memory as unknown as Record<string, unknown>;
    
    logger.warn(`Rolling back memory version to ${version}`, {
      subsystem: "MigrationRunner",
      meta: { fromVersion: this.getCurrentVersion(), toVersion: version }
    });

    mem.memoryVersion = version;
    
    Game.notify(`Memory version rolled back to ${version}. Data may be inconsistent!`);
  }
}

/**
 * Global migration runner instance
 */
export const migrationRunner = new MigrationRunner();

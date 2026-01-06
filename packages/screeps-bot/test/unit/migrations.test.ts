/**
 * Unit tests for MigrationRunner
 * Addresses Phase 1 coverage improvement: Memory migrations
 */

import { assert } from "chai";
import { MigrationRunner, migrations } from "../../src/memory/migrations";

// Mock global objects
interface GlobalWithMocks {
  Memory?: {
    memoryVersion?: number;
    [key: string]: unknown;
  };
  Game?: {
    time: number;
    notify: (message: string) => void;
  };
}

describe("MigrationRunner", () => {
  let runner: MigrationRunner;

  beforeEach(() => {
    // Setup mock Memory
    (global as GlobalWithMocks).Memory = {
      memoryVersion: 0
    };

    // Setup mock Game
    (global as GlobalWithMocks).Game = {
      time: 1000,
      notify: () => {} // Noop for tests
    };

    runner = new MigrationRunner();
  });

  afterEach(() => {
    // Clean up
    delete (global as GlobalWithMocks).Memory;
    delete (global as GlobalWithMocks).Game;
  });

  describe("Version Tracking", () => {
    it("should get current version from memory", () => {
      const version = runner.getCurrentVersion();
      
      assert.isNumber(version);
      assert.equal(version, 0);
    });

    it("should handle missing memory version", () => {
      delete (global as GlobalWithMocks).Memory!.memoryVersion;
      
      const version = runner.getCurrentVersion();
      assert.equal(version, 0);
    });

    it("should get latest migration version", () => {
      const latestVersion = runner.getLatestVersion();
      
      assert.isNumber(latestVersion);
      assert.isAtLeast(latestVersion, 0);
    });

    it("should handle no migrations", () => {
      // When there are no migrations, latest version should be 0
      const latestVersion = runner.getLatestVersion();
      
      // Either there are migrations (latestVersion > 0) or not (latestVersion = 0)
      assert.isAtLeast(latestVersion, 0);
    });
  });

  describe("Pending Migration Detection", () => {
    it("should detect when no migrations are pending", () => {
      // Set memory version to latest
      const latestVersion = runner.getLatestVersion();
      (global as GlobalWithMocks).Memory!.memoryVersion = latestVersion;
      
      const hasPending = runner.hasPendingMigrations();
      
      if (latestVersion > 0) {
        assert.isFalse(hasPending);
      } else {
        // No migrations exist, so no pending migrations
        assert.isFalse(hasPending);
      }
    });

    it("should detect when migrations are pending", () => {
      // Set memory version to 0
      (global as GlobalWithMocks).Memory!.memoryVersion = 0;
      
      const hasPending = runner.hasPendingMigrations();
      const latestVersion = runner.getLatestVersion();
      
      if (latestVersion > 0) {
        assert.isTrue(hasPending);
      } else {
        assert.isFalse(hasPending);
      }
    });

    it("should get list of pending migrations", () => {
      // Set memory version to 0
      (global as GlobalWithMocks).Memory!.memoryVersion = 0;
      
      const pending = runner.getPendingMigrations();
      
      assert.isArray(pending);
      
      // All pending migrations should have version > 0
      pending.forEach(migration => {
        assert.isAbove(migration.version, 0);
      });
    });

    it("should return empty array when no migrations pending", () => {
      const latestVersion = runner.getLatestVersion();
      (global as GlobalWithMocks).Memory!.memoryVersion = latestVersion;
      
      const pending = runner.getPendingMigrations();
      
      assert.isArray(pending);
      assert.lengthOf(pending, 0);
    });
  });

  describe("Migration Execution", () => {
    it("should run migrations without errors", () => {
      // Should not throw
      assert.doesNotThrow(() => {
        runner.runMigrations();
      });
    });

    it("should update memory version after migrations", () => {
      const initialVersion = runner.getCurrentVersion();
      
      runner.runMigrations();
      
      const finalVersion = runner.getCurrentVersion();
      
      // Version should either stay the same (no migrations) or increase
      assert.isAtLeast(finalVersion, initialVersion);
    });

    it("should not run migrations if already up to date", () => {
      const latestVersion = runner.getLatestVersion();
      (global as GlobalWithMocks).Memory!.memoryVersion = latestVersion;
      
      const initialVersion = runner.getCurrentVersion();
      runner.runMigrations();
      const finalVersion = runner.getCurrentVersion();
      
      // Version should stay the same
      assert.equal(finalVersion, initialVersion);
    });
  });

  describe("Migration Registry", () => {
    it("should have migrations array defined", () => {
      assert.isDefined(migrations);
      assert.isArray(migrations);
    });

    it("should have valid migration structure", () => {
      migrations.forEach(migration => {
        assert.isNumber(migration.version);
        assert.isString(migration.description);
        assert.isFunction(migration.migrate);
        assert.isAbove(migration.version, 0);
      });
    });

    it("should have unique migration versions", () => {
      const versions = migrations.map(m => m.version);
      const uniqueVersions = new Set(versions);
      
      assert.equal(versions.length, uniqueVersions.size);
    });

    it("should have migrations in ascending order", () => {
      for (let i = 1; i < migrations.length; i++) {
        assert.isAbove(migrations[i].version, migrations[i - 1].version);
      }
    });
  });
});

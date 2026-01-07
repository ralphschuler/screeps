/**
 * Test Loader for screepsmod-testing Integration Tests
 * 
 * This module loads and registers all integration tests with screepsmod-testing.
 * Tests are only loaded when running in the performance testing environment.
 */

import { createLogger } from "@ralphschuler/screeps-core";
import "./basic-game-state.test";
import "./spawn-system.test";
import "./creep-management.test";
import "./swarm-kernel.test";
import "./pheromone-system.test";
import "./stats-system.test";

const logger = createLogger("TestLoader");

/**
 * Loads all integration tests if screepsmod-testing is available
 * Tests are now statically imported to ensure proper bundling
 * This function only checks for screepsmod-testing availability
 */
export function loadIntegrationTests(): void {
  try {
    // Check if screepsmod-testing is available
    // The module exports are injected by the mod into the game environment
    if (typeof global.describe !== 'function') {
      logger.info('screepsmod-testing not available, skipping test registration');
      return;
    }

    logger.info('Integration tests loaded successfully');
    // Test files are already imported statically above
    // They will register themselves when screepsmod-testing is available
  } catch (error) {
    logger.error('Error loading integration tests', { meta: { error: String(error) } });
  }
}

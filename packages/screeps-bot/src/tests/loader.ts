/**
 * Test Loader for screepsmod-testing Integration Tests
 * 
 * This module loads and registers all integration tests with screepsmod-testing.
 * Tests are only loaded when running in the performance testing environment.
 */

import { createLogger } from "../core/logger";

const logger = createLogger("TestLoader");

/**
 * Loads all integration tests if screepsmod-testing is available
 */
export function loadIntegrationTests(): void {
  try {
    // Check if screepsmod-testing is available
    // The module exports are injected by the mod into the game environment
    if (typeof global.describe !== 'function') {
      logger.info('screepsmod-testing not available, skipping test registration');
      return;
    }

    logger.info('Loading integration tests...');

    // Import test suites
    require('./basic-game-state.test');
    require('./spawn-system.test');
    require('./creep-management.test');
    require('./swarm-kernel.test');
    require('./pheromone-system.test');
    require('./stats-system.test');

    logger.info('Integration tests loaded successfully');
  } catch (error) {
    logger.error('Error loading integration tests', { meta: { error: String(error) } });
  }
}

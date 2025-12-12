/**
 * Test Loader for screepsmod-testing Integration Tests
 * 
 * This module loads and registers all integration tests with screepsmod-testing.
 * Tests are only loaded when running in the performance testing environment.
 */

/**
 * Loads all integration tests if screepsmod-testing is available
 */
export function loadIntegrationTests(): void {
  try {
    // Check if screepsmod-testing is available
    // The module exports are injected by the mod into the game environment
    if (typeof global.describe !== 'function') {
      console.log('[Tests] screepsmod-testing not available, skipping test registration');
      return;
    }

    console.log('[Tests] Loading integration tests...');

    // Import test suites
    require('./basic-game-state.test');
    require('./spawn-system.test');
    require('./creep-management.test');
    require('./swarm-kernel.test');
    require('./pheromone-system.test');

    console.log('[Tests] Integration tests loaded successfully');
  } catch (error) {
    console.log('[Tests] Error loading integration tests:', error);
  }
}

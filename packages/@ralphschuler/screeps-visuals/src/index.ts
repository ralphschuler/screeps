/**
 * @ralphschuler/screeps-visuals
 * 
 * Self-contained visualization system for Screeps with optional theming and performance tracking
 */

// Export types
export * from './types';

// Export visualization manager
export { visualizationManager, VisualizationManager } from './visualizationManager';

// Export room visualizer
export { RoomVisualizer } from './roomVisualizer';

// Export map visualizer
export { MapVisualizer } from './mapVisualizer';

// Export budget dashboard
export { renderBudgetDashboard, renderCompactBudgetStatus } from './budgetDashboard';
export type { BudgetDashboardOptions } from './budgetDashboard';

// Export room visual extensions initializer
export { initializeRoomVisualExtensions } from './roomVisualExtensions';

// Export logger for consistency
export { createLogger } from './logger';

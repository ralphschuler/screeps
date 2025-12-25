/**
 * @ralphschuler/screeps-economy
 * 
 * Economy subsystem for Screeps - manages resource flow, production, and trading
 * 
 * This package provides:
 * - Link network coordination for fast energy transfer
 * - Terminal routing for inter-room resource distribution
 * - Factory management for commodity production
 * - Market trading AI with trend analysis
 * 
 * @example
 * ```typescript
 * import { linkManager, terminalManager, marketManager } from '@ralphschuler/screeps-economy';
 * 
 * // Managers are registered with the kernel via decorators
 * // The bot's process registry will automatically register them
 * ```
 * 
 * @packageDocumentation
 */

// Link management
export { LinkManager, linkManager } from './links/linkManager';
export type { LinkManagerConfig } from './links/linkManager';

// Terminal management
export { TerminalManager, terminalManager } from './terminals/terminalManager';
export type { TerminalManagerConfig } from './terminals/terminalManager';
export { terminalRouter } from './terminals/terminalRouter';
export type { TerminalRoute, TerminalNode } from './terminals/terminalRouter';

// Factory management
export { FactoryManager, factoryManager } from './factories/factoryManager';
export type { FactoryManagerConfig } from './factories/factoryManager';

// Market management
export { MarketManager, marketManager } from './market/marketManager';
export type { MarketConfig } from './market/marketManager';
export { MarketTrendAnalyzer } from './market/marketTrendAnalyzer';

// TODO: Add spawning exports once spawning files are moved
// Issue URL: https://github.com/ralphschuler/screeps/issues/853
// TODO: Add other economy utilities (energyFlowPredictor, targetAssignmentManager, etc.)
// Issue URL: https://github.com/ralphschuler/screeps/issues/852

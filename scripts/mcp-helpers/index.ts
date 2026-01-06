/**
 * MCP Integration Helpers - Main Export
 * 
 * This module provides helper functions and types for integrating with MCP servers.
 * 
 * IMPORTANT: These functions are primarily for documentation and testing purposes.
 * AI agents should use MCP tools directly rather than calling these functions.
 * 
 * Example AI Agent Usage:
 * 
 * Instead of:
 *   import { getBotHealth } from './mcp-helpers';
 *   const health = await getBotHealth();
 * 
 * Do this:
 *   const stats = await screeps_stats();
 *   const rooms = await screeps_user_rooms({ userId: "user-id" });
 * 
 * The helpers serve as:
 * 1. Type definitions for common data structures
 * 2. Documentation of MCP tool usage patterns
 * 3. Utilities for performance regression detection
 */

// Type exports
export type {
  CPUMetrics,
  BotHealth,
  PerformanceBaseline,
  RegressionReport,
  WikiArticle,
  MetricQuery,
  LogQuery
} from './types.js';

// Grafana documentation (see grafana.ts for MCP tool usage examples)
// Note: No exports - AI agents should use grafana-mcp tools directly

// Screeps helpers (placeholders - agents use screeps-mcp tools)
export {
  getBotHealth,
  getRoomInfo,
  executeCommand,
  getMemory,
  getMarketData,
  getGameTime
} from './screeps.js';

// Wiki helpers (placeholders - agents use screeps-wiki-mcp tools)
export {
  searchWikiStrategies,
  getWikiArticle,
  getWikiCategories
} from './wiki.js';

// Regression detection (actual implementation)
export {
  getBaseline,
  detectRegression,
  saveBaseline,
  getRegressionHistory
} from './regression.js';

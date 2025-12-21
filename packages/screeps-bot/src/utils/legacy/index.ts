/**
 * Legacy Utilities
 *
 * Deprecated utilities kept for backward compatibility.
 * These should be migrated or removed in future versions.
 */

// ErrorMapper - source map error tracing
// TODO(P2): STYLE - Re-enable eslint for this file and fix style issues
// TODO(P2): PERF - Cache source map parsing to avoid expensive re-parsing on global resets
// TODO(P1): BUG - Add error handling for missing source map file
export { ErrorMapper } from "./ErrorMapper";

// Cache Integration - documentation-only file
// This file contains migration examples and is kept for reference
export {} from "./cacheIntegration";

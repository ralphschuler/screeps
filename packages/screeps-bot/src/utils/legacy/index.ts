/**
 * Legacy Utilities
 *
 * Deprecated utilities kept for backward compatibility.
 * These should be migrated or removed in future versions.
 */

// ErrorMapper - source map error tracing
// TODO(P2): STYLE - Re-enable eslint for this file and fix style issues
// Issue URL: https://github.com/ralphschuler/screeps/issues/811
// TODO(P2): PERF - Cache source map parsing to avoid expensive re-parsing on global resets
// Issue URL: https://github.com/ralphschuler/screeps/issues/810
// TODO(P1): BUG - Add error handling for missing source map file
// Issue URL: https://github.com/ralphschuler/screeps/issues/809
export { ErrorMapper } from "./ErrorMapper";

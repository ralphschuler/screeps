/**
 * Native Calls Tracker
 *
 * Wraps Screeps native methods to track usage statistics:
 * - PathFinder.search calls
 * - Creep movement calls (moveTo, move)
 * - Creep action calls (harvest, transfer, build, etc.)
 *
 * This helps identify performance bottlenecks and optimize native call usage.
 */

import { unifiedStats } from "./unifiedStats";

/**
 * Whether native calls tracking is enabled
 */
let trackingEnabled = true;

/**
 * Enable or disable native calls tracking
 */
export function setNativeCallsTracking(enabled: boolean): void {
  trackingEnabled = enabled;
}

/**
 * Check if native calls tracking is enabled
 */
export function isNativeCallsTrackingEnabled(): boolean {
  return trackingEnabled;
}

/**
 * Wrap PathFinder.search to track calls
 * 
 * Note: Uses 'any' types to handle the complex overloaded signature of PathFinder.search.
 * The TypeScript definitions for PathFinder.search have multiple overloads that are
 * difficult to preserve when wrapping. Using 'any' here allows the wrapper to work
 * correctly while maintaining runtime type safety through the original method.
 * 
 * Uses Object.defineProperty to override read-only properties that may exist in some
 * Screeps environments (e.g., private servers with strict property descriptors).
 */
export function wrapPathFinderSearch(): void {
  if (!PathFinder.search) return;

  // Check if already wrapped by looking for our marker
  const currentSearch = PathFinder.search as any;
  if (currentSearch.__nativeCallsTrackerWrapped) {
    return; // Already wrapped, skip
  }

  // Get the property descriptor to check if we can redefine it
  const descriptor = Object.getOwnPropertyDescriptor(PathFinder, "search");
  if (descriptor && descriptor.configurable === false) {
    // Property is not configurable, we cannot wrap it
    console.log(`[NativeCallsTracker] Warning: Cannot wrap PathFinder.search - property is not configurable`);
    return;
  }

  const originalSearch = PathFinder.search;
  
  try {
    const wrappedFunction = function (...args: any[]): PathFinderPath {
      if (trackingEnabled) {
        unifiedStats.recordNativeCall("pathfinderSearch");
      }
      return (originalSearch as any).apply(PathFinder, args);
    };
    
    // Mark the wrapped function so we can detect it later
    (wrappedFunction as any).__nativeCallsTrackerWrapped = true;
    
    Object.defineProperty(PathFinder, "search", {
      value: wrappedFunction,
      writable: true,
      enumerable: true,
      configurable: true
    });
  } catch (error) {
    console.log(`[NativeCallsTracker] Warning: Failed to wrap PathFinder.search: ${error}`);
  }
}

/**
 * Helper function to safely wrap a method on a prototype
 * Uses Object.defineProperty to handle read-only properties
 */
function wrapMethod(
  prototype: any,
  methodName: string,
  statName: keyof Omit<import("./unifiedStats").NativeCallStats, "total">
): void {
  const original = prototype[methodName];
  if (!original) return;

  // Check if already wrapped by looking for our marker
  if (original.__nativeCallsTrackerWrapped) {
    return; // Already wrapped, skip
  }

  // Get the property descriptor to check if we can redefine it
  const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);
  if (descriptor && descriptor.configurable === false) {
    // Property is not configurable, we cannot wrap it
    console.log(`[NativeCallsTracker] Warning: Cannot wrap ${methodName} - property is not configurable`);
    return;
  }

  try {
    const wrappedFunction = function (this: any, ...args: any[]): any {
      if (trackingEnabled) {
        unifiedStats.recordNativeCall(statName);
      }
      return original.apply(this, args);
    };
    
    // Mark the wrapped function so we can detect it later
    (wrappedFunction as any).__nativeCallsTrackerWrapped = true;
    
    Object.defineProperty(prototype, methodName, {
      value: wrappedFunction,
      writable: true,
      enumerable: true,
      configurable: true
    });
  } catch (error) {
    console.log(`[NativeCallsTracker] Warning: Failed to wrap ${methodName}: ${error}`);
  }
}

/**
 * Wrap Creep.prototype methods to track calls
 * 
 * Note: Uses 'any' types to handle the various overloaded method signatures on Creep.prototype.
 * Many Creep methods have multiple overloads (e.g., moveTo has 2-3 different signatures).
 * Using 'any' allows the wrappers to work correctly with all overloads while maintaining
 * runtime type safety through the original methods. This is a common pattern for method
 * wrapping in JavaScript/TypeScript.
 * 
 * Uses Object.defineProperty to override read-only properties that may exist in some
 * Screeps environments (e.g., private servers with strict property descriptors).
 */
export function wrapCreepMethods(): void {
  const creepProto = Creep.prototype as any;

  // Wrap movement methods
  wrapMethod(creepProto, "moveTo", "moveTo");
  wrapMethod(creepProto, "move", "move");

  // Wrap economy methods
  wrapMethod(creepProto, "harvest", "harvest");
  wrapMethod(creepProto, "transfer", "transfer");
  wrapMethod(creepProto, "withdraw", "withdraw");
  wrapMethod(creepProto, "build", "build");
  wrapMethod(creepProto, "repair", "repair");
  wrapMethod(creepProto, "upgradeController", "upgradeController");

  // Wrap combat methods
  wrapMethod(creepProto, "attack", "attack");
  wrapMethod(creepProto, "rangedAttack", "rangedAttack");
  wrapMethod(creepProto, "heal", "heal");
  wrapMethod(creepProto, "dismantle", "dismantle");

  // Wrap utility methods
  wrapMethod(creepProto, "say", "say");
}

/**
 * Initialize native calls tracking
 * Should be called once at bot startup
 */
export function initializeNativeCallsTracking(): void {
  wrapPathFinderSearch();
  wrapCreepMethods();
}

/**
 * Test Helper Utilities
 * 
 * Type-safe helpers for accessing dynamic memory properties in tests
 */

/**
 * Safely get a property from Memory with type checking
 */
export function getMemoryProperty<T = any>(key: string): T | undefined {
  if (key in Memory) {
    return (Memory as Record<string, any>)[key];
  }
  return undefined;
}

/**
 * Safely get a room memory property with type checking
 */
export function getRoomMemoryProperty<T = any>(roomName: string, key: string): T | undefined {
  const roomMemory = Memory.rooms?.[roomName];
  if (roomMemory && key in roomMemory) {
    return (roomMemory as Record<string, any>)[key];
  }
  return undefined;
}

/**
 * Safely get a creep memory property with type checking
 */
export function getCreepMemoryProperty<T = any>(creepName: string, key: string): T | undefined {
  const creepMemory = Memory.creeps[creepName];
  if (creepMemory && key in creepMemory) {
    return (creepMemory as Record<string, any>)[key];
  }
  return undefined;
}

/**
 * Check if a property exists in an object
 */
export function hasProperty(obj: any, key: string): boolean {
  return obj && key in obj;
}

/**
 * Set a test property in Memory and automatically clean it up
 * Returns a cleanup function
 */
export function setTestProperty<T>(key: string, value: T): () => void {
  const testKey = `_test_${key}`;
  (Memory as Record<string, any>)[testKey] = value;
  
  return () => {
    delete (Memory as Record<string, any>)[testKey];
  };
}

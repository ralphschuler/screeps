/**
 * Stub interfaces for external dependencies
 * These allow the package to build independently
 * The actual implementations should be provided by the consuming bot
 */

// Stub for ProcessClass decorator
export function ProcessClass() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function <T extends new (...args: any[]) => object>(constructor: T) {
    return constructor;
  };
}

// Stub for LowFrequencyProcess decorator
export function LowFrequencyProcess(
  _id: string,
  _name: string,
  _options?: {
    priority?: ProcessPriority;
    frequency?: string;
    minBucket?: number;
    cpuBudget?: number;
    interval?: number;
  }
) {
  return function (_target: object, _propertyKey: string, _descriptor?: PropertyDescriptor) {
    // Stub implementation - returns void  
  };
}

// Stub for ProcessPriority
export enum ProcessPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  CRITICAL = 3
}

// Stub for SpawnPriority
export enum SpawnPriority {
  LOW = 0,
  NORMAL = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
  EMERGENCY = 5
}

// Stub for SpawnRequest
export interface SpawnRequest {
  id?: string;
  roomName?: string;
  targetRoom?: string;
  family?: string;
  createdAt?: number;
  role: string;
  priority: SpawnPriority;
  body?: BodyPartConstant[] | { parts: BodyPartConstant[] };
  memory?: Record<string, unknown>;
  name?: string;
  options?: SpawnOptions;
  [key: string]: unknown; // Allow additional properties
}

// Stub for spawnQueue
export const spawnQueue = {
  add: (_roomName: string, _request: SpawnRequest) => {
    // Stub implementation
  },
  addRequest: (_request: SpawnRequest) => {
    // Stub implementation
  }
};

// Stub for optimizeBody
export function optimizeBody(
  _options: { role: string; energy?: number; maxEnergy?: number; preferRoads?: boolean } | string,
  _energy?: number
): { parts: BodyPartConstant[] } {
  return { parts: [WORK, CARRY, MOVE] };
}

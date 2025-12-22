/**
 * Type definitions for the Screeps Spawn System
 * 
 * These interfaces provide clean abstractions that decouple the spawn system
 * from bot-specific memory structures and the Game object.
 */

/**
 * Role family classification
 */
export type RoleFamily = "economy" | "military" | "utility" | "power";

/**
 * Room posture types
 */
export type RoomPosture = "eco" | "defense" | "war" | "siege" | "recovery" | "bootstrap";

/**
 * Body template definition
 */
export interface BodyTemplate {
  /** Body part composition */
  parts: BodyPartConstant[];
  /** Total energy cost */
  cost: number;
  /** Minimum capacity required to spawn this body */
  minCapacity: number;
}

/**
 * Role spawn definition
 */
export interface RoleSpawnDef {
  /** Role identifier */
  role: string;
  /** Role family classification */
  family: RoleFamily;
  /** Available body templates (sorted by cost) */
  bodies: BodyTemplate[];
  /** Base spawn priority (higher = more important) */
  priority: number;
  /** Maximum creeps of this role per room */
  maxPerRoom: number;
  /** Whether this is a remote role (spawns for other rooms) */
  remoteRole: boolean;
}

/**
 * Pheromone state for influencing spawn priorities
 */
export interface PheromoneState {
  /** Expansion pressure (0-1) */
  expand: number;
  /** Harvest pressure (0-1) */
  harvest: number;
  /** Build pressure (0-1) */
  build: number;
  /** Upgrade pressure (0-1) */
  upgrade: number;
  /** Defense pressure (0-1) */
  defense: number;
  /** War pressure (0-1) */
  war: number;
  /** Siege pressure (0-1) */
  siege: number;
  /** Logistics pressure (0-1) */
  logistics: number;
}

/**
 * Room state interface (decoupled from bot memory)
 */
export interface RoomState {
  /** Room name */
  name: string;
  /** Available energy */
  energyAvailable: number;
  /** Energy capacity */
  energyCapacityAvailable: number;
  /** Room controller level */
  rcl: number;
  /** Current room posture */
  posture: RoomPosture;
  /** Pheromone values */
  pheromones: PheromoneState;
  /** Danger level (0-3) */
  danger: 0 | 1 | 2 | 3;
  /** Whether room is in bootstrap mode */
  bootstrap: boolean;
}

/**
 * Creep count by role
 */
export type RoleCount = Map<string, number>;

/**
 * Spawn request
 */
export interface SpawnRequest {
  /** Role identifier */
  role: string;
  /** Priority (higher = more urgent) */
  priority: number;
  /** Memory to assign to creep */
  memory: Record<string, unknown>;
  /** Optional custom body parts */
  body?: BodyPartConstant[];
  /** Energy budget (default: use all available) */
  energyBudget?: number;
  /** Spawn name to use (if multiple spawns available) */
  spawnName?: string;
}

/**
 * Spawn result
 */
export interface SpawnResult {
  /** Success status */
  success: boolean;
  /** Creep name if spawned */
  creepName?: string;
  /** Error code if failed */
  error?: ScreepsReturnCode;
  /** Human-readable error message */
  message?: string;
  /** Role that was spawned */
  role?: string;
  /** Energy cost of spawned creep */
  energyCost?: number;
}

/**
 * Spawn configuration
 */
export interface SpawnConfig {
  /** Body part costs (default: standard Screeps costs) */
  bodyCosts?: Partial<Record<BodyPartConstant, number>>;
  /** Role priorities (higher = more important) */
  rolePriorities?: Record<string, number>;
  /** Minimum creep counts per role */
  minCreepCounts?: Record<string, number>;
  /** Maximum creep counts per role (overrides role definitions) */
  maxCreepCounts?: Record<string, number>;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Body optimization options
 */
export interface BodyOptimizationOptions {
  /** Maximum energy to spend on body */
  maxEnergy: number;
  /** Role-specific requirements */
  role: string;
  /** Distance to work location (for haulers, remote workers) */
  distance?: number;
  /** Whether roads are present on route */
  hasRoads?: boolean;
  /** Energy production rate (for dimensioning haulers) */
  energyPerTick?: number;
  /** Whether creep will be boosted */
  willBoost?: boolean;
  /** Terrain type (plain, swamp, road) */
  terrainType?: "plain" | "swamp" | "road";
}

/**
 * Posture-based spawn weights
 */
export interface PostureWeights {
  [role: string]: number;
}

/**
 * Event Type Definitions
 *
 * This module contains all event type definitions and interfaces for the event system.
 * Extracted from events.ts for better modularity and maintainability.
 *
 * Design Principles (from ROADMAP.md):
 * - Type-safe event definitions with typed payloads
 * - Clear, documented event interfaces
 * - Centralized event type map for type safety
 */

// ============================================================================
// Event Type Definitions
// ============================================================================

/**
 * Base event interface - all events extend this
 */
export interface BaseEvent {
  /** Timestamp when event was created */
  tick: number;
  /** Event source (room, creep, system) */
  source?: string;
}

/**
 * Hostile detection event
 */
export interface HostileDetectedEvent extends BaseEvent {
  roomName: string;
  hostileId: Id<Creep>;
  hostileOwner: string;
  bodyParts: number;
  threatLevel: number;
}

/**
 * Hostile cleared event
 */
export interface HostileClearedEvent extends BaseEvent {
  roomName: string;
}

/**
 * Structure destroyed event
 */
export interface StructureDestroyedEvent extends BaseEvent {
  roomName: string;
  structureType: StructureConstant;
  structureId: string;
}

/**
 * Nuke detected event
 */
export interface NukeDetectedEvent extends BaseEvent {
  roomName: string;
  nukeId: Id<Nuke>;
  landingTick: number;
  launchRoomName: string;
}

/**
 * Remote room lost event
 */
export interface RemoteLostEvent extends BaseEvent {
  homeRoom: string;
  remoteRoom: string;
  reason: "hostile" | "claimed" | "unreachable";
}

/**
 * Spawn completed event
 */
export interface SpawnCompletedEvent extends BaseEvent {
  roomName: string;
  creepName: string;
  role: string;
  cost: number;
}

/**
 * Spawn emergency event - triggered during workforce collapse with critically low energy
 */
export interface SpawnEmergencyEvent extends BaseEvent {
  roomName: string;
  energyAvailable: number;
  message: string;
}

/**
 * Creep died event
 */
export interface CreepDiedEvent extends BaseEvent {
  creepName: string;
  role: string;
  homeRoom: string;
  cause: "ttl" | "combat" | "unknown";
}

/**
 * RCL upgrade event
 */
export interface RclUpgradeEvent extends BaseEvent {
  roomName: string;
  newLevel: number;
}

/**
 * Energy critical event
 */
export interface EnergyCriticalEvent extends BaseEvent {
  roomName: string;
  energyAvailable: number;
  energyCapacity: number;
}

/**
 * Construction complete event
 */
export interface ConstructionCompleteEvent extends BaseEvent {
  roomName: string;
  structureType: StructureConstant;
  structureId: Id<Structure>;
}

/**
 * Market transaction event
 */
export interface MarketTransactionEvent extends BaseEvent {
  resourceType: ResourceConstant;
  amount: number;
  price: number;
  incoming: boolean;
  roomName: string;
}

/**
 * Pheromone update event
 */
export interface PheromoneUpdateEvent extends BaseEvent {
  roomName: string;
  pheromoneType: string;
  oldValue: number;
  newValue: number;
}

/**
 * Posture change event
 */
export interface PostureChangeEvent extends BaseEvent {
  roomName: string;
  oldPosture: string;
  newPosture: string;
}

/**
 * Squad formed event
 */
export interface SquadFormedEvent extends BaseEvent {
  squadId: string;
  squadType: string;
  memberCount: number;
  targetRoom: string;
}

/**
 * Squad dissolved event
 */
export interface SquadDissolvedEvent extends BaseEvent {
  squadId: string;
  reason: "complete" | "failed" | "timeout";
}

/**
 * Cluster event
 */
export interface ClusterUpdateEvent extends BaseEvent {
  clusterId: string;
  updateType: "metrics" | "role" | "membership";
}

/**
 * CPU spike event
 */
export interface CpuSpikeEvent extends BaseEvent {
  cpuUsed: number;
  cpuLimit: number;
  subsystem: string;
}

/**
 * Bucket mode change event
 */
export interface BucketModeChangeEvent extends BaseEvent {
  oldMode: string;
  newMode: string;
  bucket: number;
}

/**
 * Safe mode activated event
 */
export interface SafeModeActivatedEvent extends BaseEvent {
  roomName: string;
  ticksRemaining: number;
}

/**
 * Power bank discovered event
 */
export interface PowerBankDiscoveredEvent extends BaseEvent {
  roomName: string;
  power: number;
  decayTick: number;
}

/**
 * Expansion candidate found event
 */
export interface ExpansionCandidateEvent extends BaseEvent {
  roomName: string;
  score: number;
  distance: number;
}

/**
 * Process suspended event
 */
export interface ProcessSuspendedEvent extends BaseEvent {
  processId: string;
  processName: string;
  reason: string;
  consecutive: number;
  permanent: boolean;
  resumeAt?: number;
}

/**
 * Process recovered event
 */
export interface ProcessRecoveredEvent extends BaseEvent {
  processId: string;
  processName: string;
  previousReason: string;
  consecutiveErrors: number;
  manual?: boolean;
}

// ============================================================================
// Event Map - Maps event names to their payload types
// ============================================================================

/**
 * Map of all event types and their payloads
 * This provides type safety for event subscriptions and emissions
 */
export interface EventMap {
  // Combat events
  "hostile.detected": HostileDetectedEvent;
  "hostile.cleared": HostileClearedEvent;
  "structure.destroyed": StructureDestroyedEvent;
  "nuke.detected": NukeDetectedEvent;
  "safemode.activated": SafeModeActivatedEvent;

  // Economy events
  "spawn.completed": SpawnCompletedEvent;
  "spawn.emergency": SpawnEmergencyEvent;
  "creep.died": CreepDiedEvent;
  "rcl.upgrade": RclUpgradeEvent;
  "energy.critical": EnergyCriticalEvent;
  "construction.complete": ConstructionCompleteEvent;
  "market.transaction": MarketTransactionEvent;

  // Strategic events
  "remote.lost": RemoteLostEvent;
  "expansion.candidate": ExpansionCandidateEvent;
  "powerbank.discovered": PowerBankDiscoveredEvent;

  // Swarm events
  "pheromone.update": PheromoneUpdateEvent;
  "posture.change": PostureChangeEvent;
  "squad.formed": SquadFormedEvent;
  "squad.dissolved": SquadDissolvedEvent;
  "cluster.update": ClusterUpdateEvent;

  // System events
  "cpu.spike": CpuSpikeEvent;
  "bucket.modeChange": BucketModeChangeEvent;
  
  // Process events
  "process.suspended": ProcessSuspendedEvent;
  "process.recovered": ProcessRecoveredEvent;
}

/**
 * All possible event names
 */
export type EventName = keyof EventMap;

/**
 * Get the payload type for a given event name
 */
export type EventPayload<T extends EventName> = EventMap[T];

// ============================================================================
// Event Handler Types
// ============================================================================

/**
 * Event handler function type
 */
export type EventHandler<T extends EventName> = (event: EventPayload<T>) => void;

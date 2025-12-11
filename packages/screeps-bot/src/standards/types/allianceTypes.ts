/**
 * Alliance and Diplomacy System Types
 * Based on simpleAllies: https://github.com/screepers/simpleAllies
 * 
 * Provides types for alliance requests, responses, and coordination
 * using segment-based communication (SS1 compatible).
 */

/**
 * Priority level for requests (0-1, where 1 is highest)
 */
export type RequestPriority = number;

/**
 * Resource request from an ally
 */
export interface ResourceRequest {
  /**
   * 0-1 where 1 is highest consideration
   */
  priority: RequestPriority;
  roomName: string;
  resourceType: ResourceConstant;
  /**
   * How much they want of the resource. Partial fulfillment is acceptable.
   */
  amount: number;
  /**
   * If false or undefined, allies should haul the resources to the room
   */
  terminal?: boolean;
}

/**
 * Defense assistance request from an ally
 */
export interface DefenseRequest {
  roomName: string;
  /**
   * 0-1 where 1 is highest consideration
   */
  priority: RequestPriority;
}

/**
 * Attack coordination request from an ally
 */
export interface AttackRequest {
  roomName: string;
  /**
   * 0-1 where 1 is highest consideration
   */
  priority: RequestPriority;
}

/**
 * Player reputation/status information
 */
export interface PlayerRequest {
  playerName: string;
  /**
   * 0-1 where 1 is highest consideration. 
   * How much your team should hate the player. 
   * Should affect combat aggression and targeting.
   */
  hate?: number;
  /**
   * The last time this player attacked you (game tick)
   */
  lastAttackedBy?: number;
}

/**
 * Work request types
 */
export type WorkRequestType = "build" | "repair";

/**
 * Work assistance request from an ally
 */
export interface WorkRequest {
  roomName: string;
  /**
   * 0-1 where 1 is highest consideration
   */
  priority: RequestPriority;
  workType: WorkRequestType;
}

/**
 * Funnel goals for energy transfer
 */
export enum FunnelGoal {
  GCL = 0,
  RCL7 = 1,
  RCL8 = 2
}

/**
 * Energy funnel request for rapid progression
 */
export interface FunnelRequest {
  /**
   * Amount of energy needed. Should equal energy required to achieve goal.
   */
  maxAmount: number;
  /**
   * What energy will be spent on. Room should focus solely on this goal.
   */
  goalType: FunnelGoal;
  /**
   * Room to which energy should be sent. 
   * If undefined, resources can be sent to any room.
   */
  roomName?: string;
}

/**
 * Economic status information
 */
export interface EconRequest {
  /**
   * Total credits the bot has. Should be 0 if there is no market.
   */
  credits: number;
  /**
   * Maximum energy willing to share with allies.
   * Should never exceed actual stored energy.
   */
  sharableEnergy: number;
  /**
   * Average energy income calculated over last 100 ticks
   */
  energyIncome?: number;
  /**
   * Number of mineral nodes the bot has access to
   */
  mineralNodes?: { [key in MineralConstant]?: number };
}

/**
 * Room intelligence/status information
 */
export interface RoomRequest {
  roomName: string;
  /**
   * Player who owns this room. 
   * If no owner, room probably isn't worth requesting about.
   */
  playerName: string;
  /**
   * Last tick this room was scouted
   */
  lastScout: number;
  rcl: number;
  /**
   * Stored energy (storage + terminal + factory)
   */
  energy: number;
  towers: number;
  avgRampartHits: number;
  terminal: boolean;
}

/**
 * Collection of all alliance requests
 */
export interface AllyRequests {
  resource: ResourceRequest[];
  defense: DefenseRequest[];
  attack: AttackRequest[];
  player: PlayerRequest[];
  work: WorkRequest[];
  funnel: FunnelRequest[];
  econ?: EconRequest;
  room: RoomRequest[];
}

/**
 * Segment data structure for alliance communication
 */
export interface SimpleAlliesSegment {
  /**
   * All requests from this ally
   */
  requests: AllyRequests;
}

/**
 * Alliance configuration
 */
export interface AllianceConfig {
  /**
   * List of allied player usernames
   */
  allies: string[];
  /**
   * Segment ID used for alliance communication (default: 90)
   */
  allySegmentID: number;
  /**
   * Whether alliance system is enabled
   */
  enabled: boolean;
}

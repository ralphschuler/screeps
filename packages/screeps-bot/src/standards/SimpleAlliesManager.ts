/**
 * SimpleAlliesManager - Alliance Communication System
 * Based on: https://github.com/screepers/simpleAllies
 * 
 * Manages segment-based communication with allied players.
 * Uses memory segment 90 (conventional) for team communication.
 * 
 * USAGE:
 * 1. Call initRun() at start of tick to read ally data
 * 2. Make requests using request* methods
 * 3. Call endRun() at end of tick to publish our data
 * 
 * INTEGRATION:
 * - Compatible with Screepers Standards SS1 (segment protocol)
 * - Can be extended to use SS2 (terminal communication) for real-time coordination
 */

import type {
  AllyRequests,
  ResourceRequest,
  DefenseRequest,
  AttackRequest,
  PlayerRequest,
  WorkRequest,
  FunnelRequest,
  EconRequest,
  RoomRequest,
  SimpleAlliesSegment,
  AllianceConfig
} from "./types/allianceTypes";
import { createLogger } from "../core/logger";

const logger = createLogger("SimpleAlliesManager");

/**
 * Maximum number of segments that can be open simultaneously
 */
const MAX_SEGMENTS_OPEN = 10;

/**
 * Default configuration
 */
const DEFAULT_CONFIG: AllianceConfig = {
  allies: [],
  allySegmentID: 90,
  enabled: false
};

/**
 * Empty requests skeleton
 */
const EMPTY_REQUESTS: AllyRequests = {
  resource: [],
  defense: [],
  attack: [],
  player: [],
  work: [],
  funnel: [],
  room: []
};

/**
 * Manager for alliance communication and coordination
 */
export class SimpleAlliesManager {
  private config: AllianceConfig;
  private myRequests: AllyRequests;
  private allySegmentData: Partial<SimpleAlliesSegment>;
  private currentAlly?: string;

  constructor(config: Partial<AllianceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.myRequests = { ...EMPTY_REQUESTS };
    this.allySegmentData = {};
  }

  /**
   * Initialize for this tick - reads ally segment data
   * Call at the start of your main loop
   */
  public initRun(): void {
    if (!this.config.enabled || !this.config.allies.length) {
      return;
    }

    // Reset our requests for this tick
    this.myRequests = {
      resource: [],
      defense: [],
      attack: [],
      player: [],
      work: [],
      funnel: [],
      room: []
    };

    this.readAllySegment();
  }

  /**
   * Finalize tick - publishes our segment data
   * Call at the end of your main loop
   */
  public endRun(): void {
    if (!this.config.enabled || !this.config.allies.length) {
      return;
    }

    // Check segment limit
    if (Object.keys(RawMemory.segments).length >= MAX_SEGMENTS_OPEN) {
      logger.warn("Too many segments open, skipping publish", { meta: { segmentCount: Object.keys(RawMemory.segments).length, maxSegments: MAX_SEGMENTS_OPEN } });
      return;
    }

    const segmentData: SimpleAlliesSegment = {
      requests: this.myRequests
    };

    RawMemory.segments[this.config.allySegmentID] = JSON.stringify(segmentData);
    RawMemory.setPublicSegments([this.config.allySegmentID]);
  }

  /**
   * Read segment data from current ally
   * Rotates through allies each tick for fairness
   */
  private readAllySegment(): void {
    if (!this.config.allies.length) {
      return;
    }

    // Rotate through allies each tick
    this.currentAlly = this.config.allies[Game.time % this.config.allies.length];

    // Request next ally's segment for next tick (look-ahead)
    const nextAllyName = this.config.allies[(Game.time + 1) % this.config.allies.length];
    RawMemory.setActiveForeignSegment(nextAllyName, this.config.allySegmentID);

    // Check if we have data from previous tick's request
    if (!RawMemory.foreignSegment) {
      return;
    }

    if (RawMemory.foreignSegment.username !== this.currentAlly) {
      return;
    }

    // Parse ally data with error handling
    try {
      this.allySegmentData = JSON.parse(RawMemory.foreignSegment.data || "{}");
    } catch (err) {
      logger.error("Error parsing ally data", { meta: { ally: this.currentAlly, error: String(err) } });
      this.allySegmentData = {};
    }
  }

  // =============================================================================
  // Request Methods - Build up our requests for allies
  // =============================================================================

  public requestResource(request: ResourceRequest): void {
    this.myRequests.resource.push(request);
  }

  public requestDefense(request: DefenseRequest): void {
    this.myRequests.defense.push(request);
  }

  public requestAttack(request: AttackRequest): void {
    this.myRequests.attack.push(request);
  }

  public requestPlayer(request: PlayerRequest): void {
    this.myRequests.player.push(request);
  }

  public requestWork(request: WorkRequest): void {
    this.myRequests.work.push(request);
  }

  public requestFunnel(request: FunnelRequest): void {
    this.myRequests.funnel.push(request);
  }

  public requestEcon(request: EconRequest): void {
    this.myRequests.econ = request;
  }

  public requestRoom(request: RoomRequest): void {
    this.myRequests.room.push(request);
  }

  // =============================================================================
  // Accessor Methods - Read ally requests
  // =============================================================================

  /**
   * Get current ally's requests (from previous tick's read)
   */
  public getAllyRequests(): Partial<AllyRequests> {
    return this.allySegmentData.requests || {};
  }

  /**
   * Get current ally name (rotated each tick)
   */
  public getCurrentAlly(): string | undefined {
    return this.currentAlly;
  }

  /**
   * Get all configured allies
   */
  public getAllies(): string[] {
    return this.config.allies;
  }

  /**
   * Check if alliance system is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled && this.config.allies.length > 0;
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<AllianceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get resource requests from current ally
   */
  public getResourceRequests(): ResourceRequest[] {
    return this.allySegmentData.requests?.resource || [];
  }

  /**
   * Get defense requests from current ally
   */
  public getDefenseRequests(): DefenseRequest[] {
    return this.allySegmentData.requests?.defense || [];
  }

  /**
   * Get attack requests from current ally
   */
  public getAttackRequests(): AttackRequest[] {
    return this.allySegmentData.requests?.attack || [];
  }

  /**
   * Get player reputation data from current ally
   */
  public getPlayerRequests(): PlayerRequest[] {
    return this.allySegmentData.requests?.player || [];
  }

  /**
   * Get work requests from current ally
   */
  public getWorkRequests(): WorkRequest[] {
    return this.allySegmentData.requests?.work || [];
  }

  /**
   * Get funnel requests from current ally
   */
  public getFunnelRequests(): FunnelRequest[] {
    return this.allySegmentData.requests?.funnel || [];
  }

  /**
   * Get economic status from current ally
   */
  public getEconRequest(): EconRequest | undefined {
    return this.allySegmentData.requests?.econ;
  }

  /**
   * Get room intel from current ally
   */
  public getRoomRequests(): RoomRequest[] {
    return this.allySegmentData.requests?.room || [];
  }
}

/**
 * Global singleton instance
 * Initialize with your alliance configuration
 */
export const simpleAllies = new SimpleAlliesManager();

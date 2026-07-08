export const DEFAULT_ROOM_CONSTRUCTION_SITE_LIMIT = 10;

export interface ConstructionSiteBudgetOptions {
  roomSiteCount?: number;
  globalSiteCount?: number;
  roomLimit?: number;
  globalLimit?: number;
}

export interface ConstructionSiteBudgetPlacementOptions {
  /**
   * Allows survival-critical/bootstrap/mandatory construction to exceed the
   * room's intended throttle while still respecting the global Screeps cap.
   */
  bypassRoomLimit?: boolean;
}

function normalizeNonNegativeInteger(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.floor(value));
}

function getGlobalConstructionSiteCount(fallback: number): number {
  if (typeof Game === "undefined") return fallback;
  return Object.keys(Game.constructionSites ?? {}).length;
}

function getGlobalConstructionSiteLimit(): number {
  return typeof MAX_CONSTRUCTION_SITES === "undefined" ? 100 : MAX_CONSTRUCTION_SITES;
}

function findStructureType(args: unknown[]): BuildableStructureConstant | undefined {
  for (const arg of args) {
    if (typeof arg === "string") return arg as BuildableStructureConstant;
  }
  return undefined;
}

/**
 * Tracks intended room-level construction throttling and the hard global site cap
 * for one construction pass. The room limit is a bot throttle, not a Screeps hard
 * cap, so explicit bypasses can exceed it while still sharing the global budget.
 */
export class ConstructionSiteBudget {
  private createdSites = 0;
  private readonly createdByStructureType: Partial<Record<BuildableStructureConstant, number>> = {};

  public constructor(
    public readonly initialRoomSiteCount: number,
    public readonly initialGlobalSiteCount: number,
    public readonly roomLimit = DEFAULT_ROOM_CONSTRUCTION_SITE_LIMIT,
    public readonly globalLimit = getGlobalConstructionSiteLimit()
  ) {}

  public get created(): number {
    return this.createdSites;
  }

  public get roomSiteCount(): number {
    return this.initialRoomSiteCount + this.createdSites;
  }

  public get globalSiteCount(): number {
    return this.initialGlobalSiteCount + this.createdSites;
  }

  public get remainingRoomSites(): number {
    return Math.max(0, this.roomLimit - this.roomSiteCount);
  }

  public get remainingGlobalSites(): number {
    return Math.max(0, this.globalLimit - this.globalSiteCount);
  }

  public getPlacedCount(structureType: BuildableStructureConstant): number {
    return this.createdByStructureType[structureType] ?? 0;
  }

  public canPlace(options: ConstructionSiteBudgetPlacementOptions = {}): boolean {
    if (this.remainingGlobalSites <= 0) return false;
    return options.bypassRoomLimit === true || this.remainingRoomSites > 0;
  }

  public capRequested(maxSites: number, options: ConstructionSiteBudgetPlacementOptions = {}): number {
    const requested = normalizeNonNegativeInteger(maxSites, 0);
    if (requested <= 0 || this.remainingGlobalSites <= 0) return 0;
    const remaining = options.bypassRoomLimit === true
      ? this.remainingGlobalSites
      : Math.min(this.remainingRoomSites, this.remainingGlobalSites);
    return Math.min(requested, remaining);
  }

  public recordPlacement(structureType: BuildableStructureConstant | undefined): void {
    this.createdSites += 1;
    if (!structureType) return;
    this.createdByStructureType[structureType] = (this.createdByStructureType[structureType] ?? 0) + 1;
  }

  public recordResult(result: ScreepsReturnCode, structureType: BuildableStructureConstant | undefined): number {
    if (result !== OK) return 0;
    this.recordPlacement(structureType);
    return 1;
  }
}

export function createConstructionSiteBudget(room: Room, options: ConstructionSiteBudgetOptions = {}): ConstructionSiteBudget {
  const roomSiteCount = normalizeNonNegativeInteger(
    options.roomSiteCount,
    room.find(FIND_MY_CONSTRUCTION_SITES).length
  );
  const globalSiteCount = normalizeNonNegativeInteger(
    options.globalSiteCount,
    getGlobalConstructionSiteCount(roomSiteCount)
  );
  const roomLimit = normalizeNonNegativeInteger(options.roomLimit, DEFAULT_ROOM_CONSTRUCTION_SITE_LIMIT);
  const globalLimit = normalizeNonNegativeInteger(options.globalLimit, getGlobalConstructionSiteLimit());

  return new ConstructionSiteBudget(roomSiteCount, globalSiteCount, roomLimit, globalLimit);
}

/**
 * Room facade that makes existing planners share a ConstructionSiteBudget without
 * duplicating their placement logic. Any successful createConstructionSite call
 * records into the shared pass budget.
 */
export function withConstructionSiteBudget(
  room: Room,
  budget: ConstructionSiteBudget,
  options: ConstructionSiteBudgetPlacementOptions = {}
): Room {
  const createConstructionSite = (...args: unknown[]): ScreepsReturnCode => {
    const structureType = findStructureType(args);
    if (!budget.canPlace(options)) return ERR_FULL;

    const result = (room.createConstructionSite as (...callArgs: unknown[]) => ScreepsReturnCode).apply(room, args);
    budget.recordResult(result, structureType);
    return result;
  };

  return new Proxy(room, {
    get(target, property, receiver) {
      if (property === "createConstructionSite") return createConstructionSite;
      const value = Reflect.get(target, property, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    }
  }) as Room;
}

/**
 * Empire-level memory schemas for global meta-layer state (ROADMAP Section 4)
 * Tracks all colonies, clusters, and empire-wide strategic decisions
 */

/** Room intel entry for known rooms */
export interface RoomIntel {
  /** Room name */
  name: string;
  /** Last seen game time */
  lastSeen: number;
  /** Number of sources */
  sources: number;
  /** Controller level (0 if none) */
  controllerLevel: number;
  /** Controller owner username (undefined if unowned) */
  owner?: string;
  /** Controller reserver username */
  reserver?: string;
  /** Mineral type if present */
  mineralType?: MineralConstant;
  /** Threat indicators */
  threatLevel: 0 | 1 | 2 | 3;
  /** Whether room has been fully scouted */
  scouted: boolean;
  /** Terrain type classification */
  terrain: "plains" | "swamp" | "mixed";
  /** Highway room flag */
  isHighway: boolean;
  /** Source keeper room flag */
  isSK: boolean;
  /** Number of towers (for nuke targeting) */
  towerCount?: number;
  /** Number of spawns (for nuke targeting) */
  spawnCount?: number;
  /** Whether room contains portal structures */
  hasPortal?: boolean;
}

/**
 * Expansion candidate with scoring
 */
export interface ExpansionCandidate {
  /** Room name */
  roomName: string;
  /** Expansion score (higher = better) */
  score: number;
  /** Distance from nearest owned room */
  distance: number;
  /** Whether room has been claimed/reserved */
  claimed: boolean;
  /** Last evaluated tick */
  lastEvaluated: number;
}

/**
 * Power bank location tracking
 */
export interface PowerBankEntry {
  /** Room name */
  roomName: string;
  /** Position */
  pos: { x: number; y: number };
  /** Remaining power amount */
  power: number;
  /** Decay tick */
  decayTick: number;
  /** Whether we're actively harvesting */
  active: boolean;
}

/**
 * Nuke in flight tracking for salvo coordination
 */
export interface NukeInFlight {
  /** Unique ID for this nuke */
  id: string;
  /** Source room that launched the nuke */
  sourceRoom: string;
  /** Target room */
  targetRoom: string;
  /** Target position */
  targetPos: { x: number; y: number };
  /** Launch tick */
  launchTick: number;
  /** Expected impact tick (launchTick + 50000) */
  impactTick: number;
  /** Coordinated salvo ID (multiple nukes with same ID hit simultaneously) */
  salvoId?: string;
  /** Associated siege squad ID for coordination */
  siegeSquadId?: string;
  /** Estimated damage to be dealt (hits) */
  estimatedDamage?: number;
  /** Estimated resource value destroyed */
  estimatedValue?: number;
}

/**
 * Incoming nuke alert for defense
 */
export interface IncomingNukeAlert {
  /** Room under threat */
  roomName: string;
  /** Nuke landing position */
  landingPos: { x: number; y: number };
  /** Impact tick */
  impactTick: number;
  /** Time to land (ticks remaining) */
  timeToLand: number;
  /** First detection tick */
  detectedAt: number;
  /** Structures in blast radius */
  threatenedStructures?: string[];
  /** Whether evacuation has been triggered */
  evacuationTriggered: boolean;
  /** Identified source room (if known) */
  sourceRoom?: string;
}

/**
 * Nuke economics tracking
 */
export interface NukeEconomics {
  /** Total nukes launched */
  nukesLaunched: number;
  /** Total energy cost (300k per nuke) */
  totalEnergyCost: number;
  /** Total ghodium cost (5k per nuke) */
  totalGhodiumCost: number;
  /** Estimated total damage dealt (hits) */
  totalDamageDealt: number;
  /** Estimated total value destroyed (energy equivalent) */
  totalValueDestroyed: number;
  /** Last calculated ROI (return on investment) */
  lastROI?: number;
  /** Last nuke launch tick */
  lastLaunchTick?: number;
}

/**
 * Historical price data point for a resource
 */
export interface PriceDataPoint {
  /** Game tick when price was recorded */
  tick: number;
  /** Average price at this time */
  avgPrice: number;
  /** Lowest price at this time */
  lowPrice: number;
  /** Highest price at this time */
  highPrice: number;
}

/**
 * Market intelligence for a specific resource
 */
export interface ResourceMarketData {
  /** Resource type */
  resource: ResourceConstant;
  /** Historical prices (max 30 entries, oldest entries removed) */
  priceHistory: PriceDataPoint[];
  /** Rolling average price (last 10 data points) */
  avgPrice: number;
  /** Current trend: -1 (falling), 0 (stable), 1 (rising) */
  trend: -1 | 0 | 1;
  /** Last update tick */
  lastUpdate: number;
  /** Price volatility (standard deviation / average) */
  volatility?: number;
  /** Predicted next price (simple moving average) */
  predictedPrice?: number;
}

/**
 * Order statistics for tracking
 */
export interface OrderStats {
  /** Order ID */
  orderId: string;
  /** Resource type */
  resource: ResourceConstant;
  /** Order type */
  type: "buy" | "sell";
  /** Created tick */
  created: number;
  /** Last extended tick */
  lastExtended?: number;
  /** Total amount traded */
  totalTraded: number;
  /** Total profit/cost */
  totalValue: number;
}

/**
 * Pending arbitrage trade tracking
 */
export interface PendingArbitrageTrade {
  /** Unique trade identifier */
  id: string;
  /** Resource being traded */
  resource: ResourceConstant;
  /** Amount purchased */
  amount: number;
  /** Buy order used */
  buyOrderId: string;
  /** Target buy order to sell into */
  sellOrderId?: string;
  /** Target sell price if no order is available */
  targetSellPrice: number;
  /** Room that executed the purchase */
  destinationRoom: string;
  /** Expected tick when transfer is ready */
  expectedArrival: number;
  /** Price paid per unit */
  buyPrice: number;
  /** Estimated transport cost paid in energy */
  transportCost: number;
}

/**
 * Market memory containing all market intelligence
 */
export interface MarketMemory {
  /** Market data per resource */
  resources: Record<string, ResourceMarketData>;
  /** Last full market scan tick */
  lastScan: number;
  /** Order tracking */
  orders?: Record<string, OrderStats>;
  /** Total profit from trading */
  totalProfit?: number;
  /** Last balance tick */
  lastBalance?: number;
  /** Pending arbitrage trades */
  pendingArbitrage?: PendingArbitrageTrade[];
  /** Number of completed arbitrage cycles */
  completedArbitrage?: number;
  /** Profit generated from arbitrage cycles */
  arbitrageProfit?: number;
}

/**
 * Owned room entry with role
 */
export interface OwnedRoomEntry {
  /** Room name */
  name: string;
  /** Room role */
  role: "capital" | "core" | "remoteHub" | "forwardBase" | "mineral" | "buffer";
  /** Cluster ID this room belongs to */
  clusterId: string;
  /** RCL */
  rcl: number;
}

/**
 * Empire memory - Global meta-layer state (ROADMAP Section 4)
 * Tracks all colonies, clusters, and empire-wide strategic decisions
 */
export interface EmpireMemory {
  /** Known rooms with intel data */
  knownRooms: Record<string, RoomIntel>;
  /** List of active cluster IDs */
  clusters: string[];
  /** Active war targets (player usernames or room names) */
  warTargets: string[];
  /** Owned rooms with roles and cluster assignments */
  ownedRooms: Record<string, OwnedRoomEntry>;
  /** Claim queue sorted by expansion score */
  claimQueue: ExpansionCandidate[];
  /** Nuke candidates with scores */
  nukeCandidates: { roomName: string; score: number; launched: boolean; launchTick: number }[];
  /** Power bank locations */
  powerBanks: PowerBankEntry[];
  /** Nukes in flight for salvo coordination */
  nukesInFlight?: NukeInFlight[];
  /** Incoming nuke alerts for defense */
  incomingNukes?: IncomingNukeAlert[];
  /** Nuke economics tracking */
  nukeEconomics?: NukeEconomics;
  /** Market intelligence data */
  market?: MarketMemory;
  /** Global strategic objectives */
  objectives: {
    targetPowerLevel: number;
    targetRoomCount: number;
    warMode: boolean;
    expansionPaused: boolean;
  };
  /** Last update tick */
  lastUpdate: number;
}

/**
 * Create default market memory
 */
export function createDefaultMarketMemory(): MarketMemory {
  return {
    resources: {},
    lastScan: 0,
    orders: {},
    totalProfit: 0,
    lastBalance: 0,
    pendingArbitrage: [],
    completedArbitrage: 0,
    arbitrageProfit: 0
  };
}

/**
 * Create default empire memory
 */
export function createDefaultEmpireMemory(): EmpireMemory {
  return {
    knownRooms: {},
    clusters: [],
    warTargets: [],
    ownedRooms: {},
    claimQueue: [],
    nukeCandidates: [],
    powerBanks: [],
    market: createDefaultMarketMemory(),
    objectives: {
      targetPowerLevel: 0,
      targetRoomCount: 1,
      warMode: false,
      expansionPaused: false
    },
    lastUpdate: 0
  };
}

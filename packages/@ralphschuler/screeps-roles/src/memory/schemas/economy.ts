/**
 * Economy and market-related memory schemas
 * Tracks market intelligence, trading, and resource management
 */

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
 * Create default market memory
 */
export function createDefaultMarketMemory(): MarketMemory {
  return {
    resources: {},
    lastScan: 0,
    pendingArbitrage: [],
    completedArbitrage: 0,
    arbitrageProfit: 0
  };
}

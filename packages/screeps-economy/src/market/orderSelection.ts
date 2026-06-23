/**
 * Pure market order-ranking helpers.
 *
 * `MarketManager` owns Screeps side effects (`Game.market.deal`, order creation,
 * memory accounting). This module keeps the CPU-sensitive scoring rules isolated
 * so trade selection can be tested without a live `Game.market` object.
 */

export type TransactionCostCalculator = (amount: number, fromRoomName: string, toRoomName: string) => number;

type MarketOrderWithRoom = Order & { roomName: string };

export interface ActiveSellOrderCandidate {
  order: MarketOrderWithRoom;
  dealAmount: number;
  energyCost: number;
  netValue: number;
  netUnitValue: number;
}

export interface ActiveSellOrderRankingInput {
  orders: readonly Order[];
  requestedAmount: number;
  sourceRoomName: string;
  maxDealAmount: number;
  energyCreditValue: number;
  calcTransactionCost: TransactionCostCalculator;
}

export interface EmergencyBuyOrderCandidate {
  order: MarketOrderWithRoom;
  cappedOrderAmount: number;
  transportCost: number;
  /** Unitless emergency ranking score: market price plus raw terminal energy per unit. */
  emergencyScore: number;
}

export interface EmergencyBuyOrderRankingInput {
  orders: readonly Order[];
  requestedAmount: number;
  destinationRoomName: string;
  maxDealAmount: number;
  calcTransactionCost: TransactionCostCalculator;
}

function hasRoomName(order: Order): order is MarketOrderWithRoom {
  return typeof order.roomName === "string" && order.roomName.length > 0;
}

function remainingAmount(order: Order): number {
  return Math.max(0, order.remainingAmount ?? order.amount ?? 0);
}

/**
 * Rank buy orders for an immediate terminal sale.
 *
 * Orders with non-positive net value are excluded. Ranking favors the highest
 * energy-adjusted value per unit, then raw price for deterministic tie-breaking.
 */
export function rankActiveSellOrders(input: ActiveSellOrderRankingInput): ActiveSellOrderCandidate[] {
  return input.orders
    .filter(hasRoomName)
    .map(order => {
      const dealAmount = Math.min(input.requestedAmount, remainingAmount(order), input.maxDealAmount);
      if (dealAmount <= 0) return undefined;

      const energyCost = input.calcTransactionCost(dealAmount, input.sourceRoomName, order.roomName);
      const netValue = order.price * dealAmount - energyCost * input.energyCreditValue;

      return {
        order,
        dealAmount,
        energyCost,
        netValue,
        netUnitValue: netValue / dealAmount
      };
    })
    .filter((candidate): candidate is ActiveSellOrderCandidate => candidate !== undefined && candidate.netValue > 0)
    .sort((a, b) => b.netUnitValue - a.netUnitValue || b.order.price - a.order.price);
}

/**
 * Rank sell orders for an emergency buy.
 *
 * Emergency replenishment intentionally uses a unitless score made from market
 * price plus raw terminal-energy cost per unit. This preserves the manager's
 * existing terminal-energy-conservation behavior instead of converting energy
 * into credits like discretionary arbitrage does.
 */
export function rankEmergencyBuyOrders(input: EmergencyBuyOrderRankingInput): EmergencyBuyOrderCandidate[] {
  return input.orders
    .filter(hasRoomName)
    .map(order => {
      const cappedOrderAmount = Math.min(remainingAmount(order), input.maxDealAmount, input.requestedAmount);
      if (cappedOrderAmount <= 0) return undefined;

      const transportCost = input.calcTransactionCost(cappedOrderAmount, order.roomName, input.destinationRoomName);
      const emergencyScore = order.price + transportCost / cappedOrderAmount;

      return {
        order,
        cappedOrderAmount,
        transportCost,
        emergencyScore
      };
    })
    .filter((candidate): candidate is EmergencyBuyOrderCandidate => candidate !== undefined)
    .sort((a, b) => a.emergencyScore - b.emergencyScore);
}

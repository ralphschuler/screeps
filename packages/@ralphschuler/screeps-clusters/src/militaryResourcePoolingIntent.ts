export interface MilitaryBoostAllocationInput {
  squadId: string;
  needs: Partial<Record<ResourceConstant, number>>;
  available: Partial<Record<ResourceConstant, number>>;
}

export interface MilitaryBoostAllocationIntent {
  success: boolean;
  allocated: string[];
  missing: { resourceType: ResourceConstant; needed: number; available: number }[];
}

export interface MilitaryEnergySourceSnapshot {
  roomName: string;
  availableEnergy: number;
  reservedEnergy: number;
  hasTerminal: boolean;
  terminalEnergy: number;
}

export interface MilitaryEnergyRouteInput {
  targetRoom: string;
  amount: number;
  targetHasTerminal: boolean;
  sources: MilitaryEnergySourceSnapshot[];
  distance?: (fromRoom: string, toRoom: string) => number;
  terminalTransferCostRate?: number;
}

export type MilitaryEnergyRouteIntent =
  | { success: false; reason: "no-source" }
  | { success: true; sourceRoom: string; delivery: "terminal" | "hauler"; excessEnergy: number };

const DEFAULT_TERMINAL_TRANSFER_COST_RATE = 0.1;

export function planMilitaryBoostAllocation(input: MilitaryBoostAllocationInput): MilitaryBoostAllocationIntent {
  const missing: MilitaryBoostAllocationIntent["missing"] = [];

  for (const resource in input.needs) {
    const resourceType = resource as ResourceConstant;
    const needed = input.needs[resourceType] ?? 0;
    const available = input.available[resourceType] ?? 0;
    if (available < needed) missing.push({ resourceType, needed, available });
  }

  if (missing.length > 0) return { success: false, allocated: [], missing };

  return {
    success: true,
    allocated: Object.entries(input.needs)
      .filter(([, amount]) => (amount ?? 0) > 0)
      .map(([resource, amount]) => `${amount} ${resource}`),
    missing: []
  };
}

export function planEmergencyEnergyRoute(input: MilitaryEnergyRouteInput): MilitaryEnergyRouteIntent {
  const getDistance = input.distance ?? (() => 0);
  const terminalRate = input.terminalTransferCostRate ?? DEFAULT_TERMINAL_TRANSFER_COST_RATE;

  const source = input.sources
    .filter(candidate => candidate.roomName !== input.targetRoom)
    .map(candidate => {
      const distance = getDistance(candidate.roomName, input.targetRoom);
      const excessEnergy = candidate.availableEnergy - candidate.reservedEnergy;

      const canTerminalDelivery = candidate.hasTerminal && input.targetHasTerminal;
      const terminalCost = canTerminalDelivery
        ? Math.ceil(input.amount * distance * terminalRate)
        : 0;
      const canUseTerminalDelivery = canTerminalDelivery
        ? candidate.terminalEnergy >= input.amount + terminalCost
        : false;

      const delivery: "terminal" | "hauler" = canUseTerminalDelivery
        ? "terminal"
        : "hauler";

      return {
        ...candidate,
        distance,
        excessEnergy,
        terminalCost,
        delivery
      };
    })
    .filter(candidate => candidate.excessEnergy >= input.amount)
    .sort((a, b) => {
      const distanceCompare = a.distance - b.distance;
      if (distanceCompare !== 0) return distanceCompare;

      const deliveryCompare = a.delivery === b.delivery ? 0 : a.delivery === "terminal" ? -1 : 1;
      if (deliveryCompare !== 0) return deliveryCompare;

      const excessCompare = b.excessEnergy - a.excessEnergy;
      if (excessCompare !== 0) return excessCompare;

      return a.roomName.localeCompare(b.roomName);
    })[0];

  if (!source) return { success: false, reason: "no-source" };

  return {
    success: true,
    sourceRoom: source.roomName,
    delivery: source.delivery,
    excessEnergy: source.excessEnergy
  };
}

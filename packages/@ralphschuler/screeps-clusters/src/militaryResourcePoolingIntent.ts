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
}

export interface MilitaryEnergyRouteInput {
  targetRoom: string;
  amount: number;
  targetHasTerminal: boolean;
  sources: MilitaryEnergySourceSnapshot[];
}

export type MilitaryEnergyRouteIntent =
  | { success: false; reason: "no-source" }
  | { success: true; sourceRoom: string; delivery: "terminal" | "hauler"; excessEnergy: number };

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
  const source = input.sources
    .filter(candidate => candidate.roomName !== input.targetRoom)
    .map(candidate => ({ ...candidate, excessEnergy: candidate.availableEnergy - candidate.reservedEnergy }))
    .filter(candidate => candidate.excessEnergy > input.amount)
    .sort((a, b) => {
      const excessCompare = b.excessEnergy - a.excessEnergy;
      if (excessCompare !== 0) return excessCompare;
      return a.roomName.localeCompare(b.roomName);
    })[0];

  if (!source) return { success: false, reason: "no-source" };

  return {
    success: true,
    sourceRoom: source.roomName,
    delivery: source.hasTerminal && input.targetHasTerminal ? "terminal" : "hauler",
    excessEnergy: source.excessEnergy
  };
}

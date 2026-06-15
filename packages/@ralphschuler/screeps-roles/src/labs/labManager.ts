/**
 * Lab Manager provider for role behaviors.
 *
 * The reusable roles package has no direct dependency on the bot lab system.
 * Consuming applications inject their lab-needs provider at startup; tests and
 * packages without labs keep the safe no-op default.
 */

export interface LabResourceNeed {
  labId: Id<StructureLab>;
  resourceType: ResourceConstant;
  amount: number;
  priority: number;
}

export interface LabManagerProvider {
  getLabResourceNeeds(roomName: string): LabResourceNeed[];
  getLabSupplyNeeds(roomName: string): LabResourceNeed[];
  getLabOverflow(roomName: string): LabResourceNeed[];
}

const NOOP_PROVIDER: LabManagerProvider = {
  getLabResourceNeeds: () => [],
  getLabSupplyNeeds: () => [],
  getLabOverflow: () => []
};

let provider: LabManagerProvider = NOOP_PROVIDER;

export function setLabManagerProvider(nextProvider?: Partial<LabManagerProvider>): void {
  provider = nextProvider
    ? {
        getLabResourceNeeds: nextProvider.getLabResourceNeeds ?? NOOP_PROVIDER.getLabResourceNeeds,
        getLabSupplyNeeds: nextProvider.getLabSupplyNeeds ?? nextProvider.getLabResourceNeeds ?? NOOP_PROVIDER.getLabSupplyNeeds,
        getLabOverflow: nextProvider.getLabOverflow ?? NOOP_PROVIDER.getLabOverflow
      }
    : NOOP_PROVIDER;
}

export const labManager: LabManagerProvider = {
  getLabResourceNeeds: roomName => provider.getLabResourceNeeds(roomName),
  getLabSupplyNeeds: roomName => provider.getLabSupplyNeeds(roomName),
  getLabOverflow: roomName => provider.getLabOverflow(roomName)
};

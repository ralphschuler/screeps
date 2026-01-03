/**
 * Lab manager stub for roles package
 */

interface LabResourceNeed {
  labId: Id<StructureLab>;
  resourceType: ResourceConstant;
  priority: number;
}

interface LabOverflow {
  labId: Id<StructureLab>;
  resourceType: ResourceConstant;
  priority: number;
}

export const labManager = {
  getLabsNeedingInput: (_room: Room): StructureLab[] => [],
  getLabsNeedingOutput: (_room: Room): StructureLab[] => [],
  getReactionTarget: (_lab: StructureLab): { resource: ResourceConstant; amount: number } | null => null,
  getLabResourceNeeds: (_roomName: string): LabResourceNeed[] => [],
  getLabOverflow: (_roomName: string): LabOverflow[] => []
};

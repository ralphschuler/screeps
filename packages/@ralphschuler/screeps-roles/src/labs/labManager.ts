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
  getLabsNeedingInput: (room: Room): StructureLab[] => [],
  getLabsNeedingOutput: (room: Room): StructureLab[] => [],
  getReactionTarget: (lab: StructureLab): { resource: ResourceConstant; amount: number } | null => null,
  getLabResourceNeeds: (roomName: string): LabResourceNeed[] => [],
  getLabOverflow: (roomName: string): LabOverflow[] => []
};

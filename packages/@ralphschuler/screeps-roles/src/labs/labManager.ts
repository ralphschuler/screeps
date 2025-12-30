/**
 * Lab manager stub for roles package
 */

export const labManager = {
  getLabsNeedingInput: (room: Room): StructureLab[] => [],
  getLabsNeedingOutput: (room: Room): StructureLab[] => [],
  getReactionTarget: (lab: StructureLab): { resource: ResourceConstant; amount: number } | null => null
};

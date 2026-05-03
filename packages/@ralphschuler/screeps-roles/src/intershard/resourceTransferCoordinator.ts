/**
 * Resource transfer coordinator stub for roles package
 */

export interface CrossShardTransferRequest {
  id: string;
  taskId?: string;
  resourceType: ResourceConstant;
  amount: number;
  fromShard: string;
  toShard: string;
  targetShard?: string;
  sourceRoom?: string;
  targetRoom?: string;
  portalRoom?: string;
  status: "pending" | "in-progress" | "completed";
}

export const resourceTransferCoordinator = {
  getPendingTransfers: (): CrossShardTransferRequest[] => [],
  getPrioritizedRequests: (): CrossShardTransferRequest[] => [],
  getCreepRequest: (_creepName: string): CrossShardTransferRequest | undefined => undefined,
  assignCreep: (_taskId: string, _creepName: string): void => {
    // No-op stub
  },
  markTransferComplete: (_id: string): void => {
    // No-op stub
  }
};

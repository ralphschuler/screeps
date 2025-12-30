/**
 * Resource transfer coordinator stub for roles package
 */

export interface CrossShardTransferRequest {
  id: string;
  resourceType: ResourceConstant;
  amount: number;
  fromShard: string;
  toShard: string;
  status: "pending" | "in-progress" | "completed";
}

export const resourceTransferCoordinator = {
  getPendingTransfers: (): CrossShardTransferRequest[] => [],
  markTransferComplete: (id: string): void => {
    // No-op stub
  }
};

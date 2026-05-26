/**
 * Resource transfer coordinator adapter for the roles package.
 *
 * The full intershard package owns transfer creation and processing. Roles only
 * need a small runtime facade to discover queued work and claim it from shared
 * `Memory.crossShardTransfers`.
 */

export interface CrossShardTransferRequest {
  id?: string;
  taskId?: string;
  resourceType: ResourceConstant;
  amount: number;
  fromShard?: string;
  toShard?: string;
  targetShard?: string;
  sourceRoom?: string;
  targetRoom?: string;
  portalRoom?: string;
  priority?: number;
  status: "pending" | "in-progress" | "completed" | "queued" | "gathering" | "moving" | "transferring" | "complete" | "failed";
  assignedCreeps?: string[];
  transferred?: number;
}

interface TransferCoordinatorMemory {
  requests?: Record<string, CrossShardTransferRequest>;
}

const activeStatuses = new Set<CrossShardTransferRequest["status"]>([
  "pending",
  "in-progress",
  "queued",
  "gathering",
  "moving",
  "transferring"
]);

const pendingStatuses = new Set<CrossShardTransferRequest["status"]>(["pending", "queued"]);

function getTransferMemory(): TransferCoordinatorMemory | undefined {
  return (globalThis as typeof globalThis & { Memory?: { crossShardTransfers?: TransferCoordinatorMemory } }).Memory
    ?.crossShardTransfers;
}

function getRequests(): CrossShardTransferRequest[] {
  return Object.values(getTransferMemory()?.requests ?? {});
}

function getRequestId(request: CrossShardTransferRequest): string | undefined {
  return request.taskId ?? request.id;
}

export const resourceTransferCoordinator = {
  getPendingTransfers: (): CrossShardTransferRequest[] =>
    getRequests().filter(request => pendingStatuses.has(request.status)),

  getPrioritizedRequests: (): CrossShardTransferRequest[] =>
    getRequests()
      .filter(request => pendingStatuses.has(request.status))
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0)),

  getCreepRequest: (creepName: string): CrossShardTransferRequest | undefined =>
    getRequests().find(
      request => activeStatuses.has(request.status) && request.assignedCreeps?.includes(creepName)
    ),

  assignCreep: (taskId: string, creepName: string): void => {
    const request = getTransferMemory()?.requests?.[taskId] ?? getRequests().find(candidate => getRequestId(candidate) === taskId);
    if (!request) return;

    request.assignedCreeps ??= [];
    if (!request.assignedCreeps.includes(creepName)) {
      request.assignedCreeps.push(creepName);
    }
  },

  markTransferComplete: (id: string): void => {
    const request = getTransferMemory()?.requests?.[id] ?? getRequests().find(candidate => getRequestId(candidate) === id);
    if (request) {
      request.status = request.status === "completed" ? "completed" : "complete";
      request.transferred = request.amount;
    }
  }
};

import { describe, beforeEach, it } from "mocha";
import { expect } from "chai";
import { resourceTransferCoordinator } from "../src/intershard/resourceTransferCoordinator";

describe("resourceTransferCoordinator roles adapter", () => {
  beforeEach(() => {
    (globalThis as typeof globalThis & { Memory: Memory }).Memory = {
      crossShardTransfers: {
        requests: {
          low: {
            taskId: "low",
            resourceType: "energy" as ResourceConstant,
            amount: 100,
            sourceRoom: "W1N1",
            targetShard: "shard1",
            targetRoom: "W2N2",
            portalRoom: "W0N0",
            priority: 1,
            status: "queued",
            assignedCreeps: [],
            transferred: 0
          },
          high: {
            taskId: "high",
            resourceType: "energy" as ResourceConstant,
            amount: 100,
            sourceRoom: "W1N1",
            targetShard: "shard1",
            targetRoom: "W2N2",
            portalRoom: "W0N0",
            priority: 10,
            status: "queued",
            assignedCreeps: [],
            transferred: 0
          },
          complete: {
            taskId: "complete",
            resourceType: "energy" as ResourceConstant,
            amount: 100,
            sourceRoom: "W1N1",
            targetShard: "shard1",
            targetRoom: "W2N2",
            portalRoom: "W0N0",
            priority: 20,
            status: "complete",
            assignedCreeps: [],
            transferred: 100
          }
        },
        lastUpdate: 1
      }
    } as Memory;
  });

  it("returns active queued requests by descending priority", () => {
    expect(resourceTransferCoordinator.getPrioritizedRequests().map(request => request.taskId)).to.deep.equal([
      "high",
      "low"
    ]);
  });

  it("assigns creeps and finds their request", () => {
    resourceTransferCoordinator.assignCreep("high", "carrier1");

    const request = resourceTransferCoordinator.getCreepRequest("carrier1");

    expect(request?.taskId).to.equal("high");
    expect(request?.assignedCreeps).to.deep.equal(["carrier1"]);
  });

  it("marks transfers complete", () => {
    resourceTransferCoordinator.markTransferComplete("high");

    expect(resourceTransferCoordinator.getCreepRequest("carrier1")).to.equal(undefined);
    expect(resourceTransferCoordinator.getPrioritizedRequests().map(request => request.taskId)).to.deep.equal(["low"]);
  });
});

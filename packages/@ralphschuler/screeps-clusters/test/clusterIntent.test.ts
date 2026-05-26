import { expect } from "chai";
import {
  buildClusterOperationIntent,
  CLUSTER_OPERATION_STEPS
} from "../src/clusterIntent.ts";
import type { ClusterMemory } from "../src/types.ts";

function makeCluster(overrides: Partial<ClusterMemory> = {}): ClusterMemory {
  return {
    id: "cluster_W1N1",
    coreRoom: "W1N1",
    memberRooms: ["W1N1", "W1N2"],
    remoteRooms: [],
    forwardBases: [],
    role: "mixed",
    metrics: {
      energyIncome: 0,
      energyConsumption: 0,
      energyBalance: 0,
      warIndex: 0,
      economyIndex: 0,
      militaryReadiness: 0
    },
    squads: [],
    rallyPoints: [],
    defenseRequests: [],
    resourceRequests: [],
    lastUpdate: 0,
    ...overrides
  };
}

describe("Cluster operation intent", () => {
  it("exposes the ordered cluster operations as the public test surface", () => {
    const intent = buildClusterOperationIntent(makeCluster());

    expect(intent.clusterId).to.equal("cluster_W1N1");
    expect(intent.steps.map(step => step.name)).to.deep.equal([
      "metrics",
      "defense",
      "terminals",
      "resourceSharing",
      "squads",
      "offensive",
      "rallyPoints",
      "militaryResources",
      "role",
      "focusRoom"
    ]);
    expect(intent.steps.map(step => step.statsKey)).to.deep.equal(
      CLUSTER_OPERATION_STEPS.map(step => `cluster:cluster_W1N1:${step.name}`)
    );
  });

  it("summarizes planned side effects without mutating cluster memory", () => {
    const cluster = makeCluster({
      role: "economic",
      focusRoom: "W1N2",
      defenseRequests: [
        {
          roomName: "W1N1",
          guardsNeeded: 1,
          rangersNeeded: 0,
          healersNeeded: 0,
          urgency: 3,
          createdAt: 10,
          threat: "hostiles",
          assignedCreeps: []
        }
      ],
      squads: [
        {
          id: "squad1",
          type: "defense",
          members: ["guard1"],
          rallyRoom: "W1N2",
          targetRooms: ["W1N1"],
          state: "gathering",
          createdAt: 20
        }
      ],
      resourceRequests: [
        {
          toRoom: "W1N1",
          fromRoom: "W1N2",
          resourceType: "energy" as ResourceConstant,
          amount: 1000,
          priority: 3,
          createdAt: 30,
          assignedCreeps: [],
          delivered: 0
        }
      ]
    });
    const before = JSON.stringify(cluster);

    const intent = buildClusterOperationIntent(cluster);

    expect(JSON.stringify(cluster)).to.equal(before);
    expect(intent.summary).to.deep.equal({
      memberRoomCount: 2,
      remoteRoomCount: 0,
      defenseRequestCount: 1,
      resourceRequestCount: 1,
      squadCount: 1,
      role: "economic",
      focusRoom: "W1N2"
    });
  });
});

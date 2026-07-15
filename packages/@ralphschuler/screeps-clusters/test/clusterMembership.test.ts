import { expect } from "chai";
import { planOwnedRoomClusterMembership } from "../src/clusterMembership";

function distance(rooms: Record<string, number>) {
  return (fromRoom: string, toRoom: string): number =>
    rooms[`${fromRoom}:${toRoom}`] ?? rooms[`${toRoom}:${fromRoom}`] ?? 99;
}

describe("owned-room cluster membership", () => {
  it("creates a cluster for a first owned room", () => {
    const plan = planOwnedRoomClusterMembership({
      roomNames: ["W1N1"],
      clusters: {},
      distance: () => 99,
    });

    expect(plan.clusterByRoom).to.deep.equal({ W1N1: "cluster_W1N1" });
    expect(plan.createdClusters).to.deep.equal([
      { id: "cluster_W1N1", coreRoom: "W1N1" },
    ]);
    expect(plan.memberRoomsByCluster.cluster_W1N1).to.deep.equal(["W1N1"]);
  });

  it("groups nearby newly owned rooms deterministically", () => {
    const plan = planOwnedRoomClusterMembership({
      roomNames: ["W2N1", "W1N1"],
      clusters: {},
      distance: distance({ "W1N1:W2N1": 1 }),
    });

    expect(plan.clusterByRoom).to.deep.equal({
      W1N1: "cluster_W1N1",
      W2N1: "cluster_W1N1",
    });
    expect(plan.createdClusters).to.deep.equal([
      { id: "cluster_W1N1", coreRoom: "W1N1" },
    ]);
    expect(plan.memberRoomsByCluster.cluster_W1N1).to.deep.equal([
      "W1N1",
      "W2N1",
    ]);
  });

  it("connects a frontier room at the default defense-assistance boundary", () => {
    const plan = planOwnedRoomClusterMembership({
      roomNames: ["W1N1", "W1N4"],
      clusters: {},
      distance: distance({ "W1N1:W1N4": 3 })
    });

    expect(plan.clusterByRoom).to.deep.equal({
      W1N1: "cluster_W1N1",
      W1N4: "cluster_W1N1"
    });
  });

  it("preserves an existing room assignment over proximity", () => {
    const plan = planOwnedRoomClusterMembership({
      roomNames: ["W1N1", "W2N1"],
      clusters: {
        cluster_W2N1: {
          id: "cluster_W2N1",
          coreRoom: "W2N1",
          memberRooms: ["W2N1"],
        },
      },
      preferredClusterByRoom: { W2N1: "cluster_W2N1" },
      distance: distance({ "W1N1:W2N1": 1 }),
    });

    expect(plan.clusterByRoom).to.deep.equal({
      W1N1: "cluster_W2N1",
      W2N1: "cluster_W2N1",
    });
    expect(plan.createdClusters).to.deep.equal([]);
  });

  it("keeps disconnected owned rooms in separate clusters", () => {
    const plan = planOwnedRoomClusterMembership({
      roomNames: ["W1N1", "W10N10"],
      clusters: {},
      distance: () => 99,
    });

    expect(plan.clusterByRoom).to.deep.equal({
      W10N10: "cluster_W10N10",
      W1N1: "cluster_W1N1",
    });
    expect(plan.createdClusters).to.deep.equal([
      { id: "cluster_W10N10", coreRoom: "W10N10" },
      { id: "cluster_W1N1", coreRoom: "W1N1" },
    ]);
  });
});

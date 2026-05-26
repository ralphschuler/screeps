import { assert } from "chai";
import { planClusterHealthIntent } from "../../src/empire/clusterHealthIntent";

describe("Cluster health intent Module", () => {
  it("calculates observable health scores and warnings", () => {
    const intent = planClusterHealthIntent({
      clusterId: "cluster1",
      memberRooms: ["W1N1", "W2N1"],
      visibleRooms: [{ roomName: "W1N1", energy: 20000 }],
      cpuUsed: 6,
      ownedRoomCount: 2,
      time: 1000
    });

    assert.equal(intent?.averageEnergy, 20000);
    assert.equal(intent?.averageCpuPerRoom, 3);
    assert.equal(intent?.economyIndex, 35);
    assert.deepEqual(intent?.warnings.map(w => w.type), ["low-energy", "high-cpu", "low-economy"]);
  });

  it("returns no intent when no cluster rooms are visible", () => {
    assert.isNull(
      planClusterHealthIntent({ clusterId: "cluster1", memberRooms: ["W1N1"], visibleRooms: [], cpuUsed: 0, ownedRoomCount: 0, time: 1 })
    );
  });
});

import { expect } from "chai";
import sinon from "sinon";
import { createDefaultClusterMemory, createDefaultSwarmState } from "@ralphschuler/screeps-memory";
import { routeEmergencyEnergy } from "../src/militaryResourcePooling.ts";

(globalThis as any).OK = 0;
(globalThis as any).RESOURCE_ENERGY = "energy";

type RoomFixture = {
  terminal?: {
    store: {
      getUsedCapacity: () => number;
    };
    send: sinon.SinonSpy;
  };
  storage?: {
    store: {
      getUsedCapacity: () => number;
    };
  };
  name?: string;
};

const createStore = (energy: number) => ({
  getUsedCapacity: () => energy
});

describe("Military resource pooling", () => {
  beforeEach(() => {
    const sendW2N1 = sinon.spy(() => 0);

    (globalThis as any).Game = {
      time: 1000,
      rooms: {
        W1N1: {
          name: "W1N1",
          terminal: {
            store: createStore(10000),
            send: sendW2N1
          },
          storage: { store: createStore(0) }
        } as RoomFixture,
        W2N1: {
          name: "W2N1",
          terminal: {
            store: createStore(10000),
            send: sendW2N1
          },
          storage: { store: createStore(0) }
        } as RoomFixture
      }
    };

    const swarm = createDefaultSwarmState();
    (globalThis as any).Memory = {
      rooms: {
        W1N1: { swarm },
        W2N1: { swarm }
      }
    };
  });

  it("uses exact excess energy when routing via terminal", () => {
    const cluster = createDefaultClusterMemory("cluster_test", "W1N1");
    cluster.memberRooms = ["W1N1", "W2N1"];

    const result = routeEmergencyEnergy(cluster, "W1N1", 5000);

    expect(result).to.deep.equal({ success: true, sourceRoom: "W2N1" });
    const targetRoom = (globalThis as any).Game.rooms.W2N1 as RoomFixture;
    expect(targetRoom.terminal?.send.calledOnce).to.equal(true);
    expect(targetRoom.terminal?.send.firstCall.args).to.deep.equal(["energy", 5000, "W1N1"]);
  });

  it("does not enqueue duplicate transfer when outstanding energy already covers need", () => {
    const cluster = createDefaultClusterMemory("cluster_test", "W1N1");
    cluster.memberRooms = ["W1N1", "W2N1"];
    cluster.resourceRequests.push({
      toRoom: "W1N1",
      fromRoom: "W2N1",
      resourceType: "energy",
      amount: 5000,
      priority: 5,
      createdAt: 1000,
      assignedCreeps: [],
      delivered: 0
    });

    const clusterBefore = cluster.resourceRequests.length;
    const result = routeEmergencyEnergy(cluster, "W1N1", 5000);

    expect(result).to.deep.equal({ success: true, sourceRoom: "W2N1" });
    expect(cluster.resourceRequests).to.have.length(clusterBefore);
  });
});

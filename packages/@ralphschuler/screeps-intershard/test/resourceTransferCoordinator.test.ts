import { expect } from "chai";
import {
  configureResourceTransferCoordinator,
  ResourceTransferCoordinator,
  type ResourceTransferCoordinatorDependencies
} from "../src/resourceTransferCoordinator.ts";
import { shardManager } from "../src/shardManager.ts";
import type { InterShardTask, PortalInfo } from "../src/schema.ts";

Object.assign(globalThis, {
  CARRY: "carry",
  MOVE: "move",
  RESOURCE_ENERGY: "energy"
});

describe("ResourceTransferCoordinator", () => {
  let originalGetActiveTransferTasks: typeof shardManager.getActiveTransferTasks;
  let originalGetOptimalPortalRoute: typeof shardManager.getOptimalPortalRoute;
  let originalUpdateTaskProgress: typeof shardManager.updateTaskProgress;

  beforeEach(() => {
    originalGetActiveTransferTasks = shardManager.getActiveTransferTasks.bind(shardManager);
    originalGetOptimalPortalRoute = shardManager.getOptimalPortalRoute.bind(shardManager);
    originalUpdateTaskProgress = shardManager.updateTaskProgress.bind(shardManager);

    (globalThis as { Memory: Memory }).Memory = {
      stats: {},
      rooms: {},
      creeps: {}
    } as unknown as Memory;

    const richStore = {
      getUsedCapacity: (resource: ResourceConstant) => (resource === RESOURCE_ENERGY ? 1_000 : 0)
    };

    (globalThis as { Game: Game }).Game = {
      ...(globalThis as { Game: Game }).Game,
      time: 1234,
      shard: { name: "shard0", type: "normal", ptr: false },
      creeps: {},
      rooms: {
        W1N1: {
          name: "W1N1",
          controller: { my: true },
          energyCapacityAvailable: 800,
          terminal: { store: richStore },
          storage: { store: richStore }
        } as unknown as Room
      }
    } as unknown as Game;
  });

  afterEach(() => {
    (shardManager as unknown as { getActiveTransferTasks: typeof shardManager.getActiveTransferTasks }).getActiveTransferTasks = originalGetActiveTransferTasks;
    (shardManager as unknown as { getOptimalPortalRoute: typeof shardManager.getOptimalPortalRoute }).getOptimalPortalRoute = originalGetOptimalPortalRoute;
    (shardManager as unknown as { updateTaskProgress: typeof shardManager.updateTaskProgress }).updateTaskProgress = originalUpdateTaskProgress;

    configureResourceTransferCoordinator({
      optimizeBody: () => ({ parts: [CARRY, MOVE] }),
      spawnQueue: { addRequest: () => undefined },
      spawnPriorities: { LOW: 0, NORMAL: 1, HIGH: 3 }
    });
  });

  it("uses injected spawn ports for cross-shard carrier requests", () => {
    const transferTask: InterShardTask = {
      id: "transfer-1",
      type: "transfer",
      sourceShard: "shard0",
      targetShard: "shard1",
      targetRoom: "W9N9",
      resourceType: RESOURCE_ENERGY,
      resourceAmount: 150,
      priority: 90,
      status: "active",
      createdAt: Game.time
    };
    const portal: PortalInfo = {
      sourceRoom: "W1N2",
      sourcePos: { x: 25, y: 25 },
      targetShard: "shard1",
      targetRoom: "W9N9",
      threatRating: 0,
      lastScouted: Game.time,
      isStable: true,
      traversalCount: 0
    };
    const spawnRequests: unknown[] = [];
    const dependencies: ResourceTransferCoordinatorDependencies = {
      optimizeBody: ({ maxEnergy, role }) => {
        expect(maxEnergy).to.equal(800);
        expect(role).to.equal("crossShardCarrier");
        return { parts: [CARRY, CARRY, MOVE] };
      },
      spawnQueue: {
        addRequest: request => {
          spawnRequests.push(request);
        }
      },
      spawnPriorities: {
        LOW: 50,
        NORMAL: 100,
        HIGH: 500
      }
    };

    (shardManager as unknown as { getActiveTransferTasks: () => InterShardTask[] }).getActiveTransferTasks = () => [transferTask];
    (shardManager as unknown as { getOptimalPortalRoute: () => PortalInfo }).getOptimalPortalRoute = () => portal;
    (shardManager as unknown as { updateTaskProgress: () => void }).updateTaskProgress = () => undefined;

    configureResourceTransferCoordinator(dependencies);

    const coordinator = new ResourceTransferCoordinator();
    coordinator.run();

    expect(spawnRequests).to.have.length(2);
    for (const spawnRequest of spawnRequests) {
      expect(spawnRequest).to.deep.include({
        roomName: "W1N1",
        role: "crossShardCarrier",
        priority: 500,
        targetRoom: "W9N9"
      });
    }
    expect((Memory.crossShardTransfers?.requests["transfer-1"]?.status)).to.equal("queued");
  });
});

import { expect } from "chai";

import { getConfig } from "../../src/config";
import { creepProcessManager } from "../../src/core/creepProcessManager";
import { roomProcessManager } from "../../src/core/roomProcessManager";
import { kernel } from "../../src/core/kernel";
import { ProcessPriority } from "../../src/core/kernel";
import { Game as MockGame } from "./mock";

describe("Process manager bucket policy", () => {
  let tickCounter = 0;

  beforeEach(() => {
    tickCounter++;

    // @ts-ignore allow overriding global Game object for tests
    global.Game = {
      ...MockGame,
      creeps: {},
      rooms: {},
      time: tickCounter,
      cpu: {
        ...MockGame.cpu,
        bucket: 10000,
        limit: 50,
        getUsed: () => 0
      }
    };

    // Remove existing manager processes to keep test isolation
    const existing = kernel.getProcesses().filter((p) => p.id.startsWith("creep:") || p.id.startsWith("room:"));
    for (const process of existing) {
      kernel.unregisterProcess(process.id);
    }

    creepProcessManager.reset();
    roomProcessManager.reset();
  });

  it("maps creep priorities to bucket-aware minBucket values", () => {
    const { lowMode, highMode } = getConfig().cpu.bucketThresholds;

    const homeRoom = {
      name: "W1N1",
      controller: { my: true, level: 1 }
    } as unknown as Room;

    // @ts-ignore test setup
    global.Game.rooms = { W1N1: homeRoom };

    const creeps: Record<string, Creep> = {
      "creep-harvester": {
        name: "creep-harvester",
        memory: { role: "harvester", family: "economy", homeRoom: "W1N1" },
        spawning: false
      } as unknown as Creep,
      "creep-builder": {
        name: "creep-builder",
        memory: { role: "builder", family: "economy", homeRoom: "W1N1" },
        spawning: false
      } as unknown as Creep,
      "creep-upgrader": {
        name: "creep-upgrader",
        memory: { role: "upgrader", family: "economy", homeRoom: "W1N1" },
        room: homeRoom,
        spawning: false
      } as unknown as Creep,
      "creep-remote-hauler": {
        name: "creep-remote-hauler",
        memory: { role: "remoteHauler", family: "economy", homeRoom: "W1N1" },
        spawning: false
      } as unknown as Creep,
      "creep-lab-tech": {
        name: "creep-lab-tech",
        memory: { role: "labTech", family: "utility", homeRoom: "W1N1" },
        spawning: false
      } as unknown as Creep
    };

    global.Game.creeps = creeps;

    creepProcessManager.syncCreepProcesses();

    expect(kernel.getProcess("creep:creep-harvester")?.minBucket).to.equal(0);
    expect(kernel.getProcess("creep:creep-builder")?.minBucket).to.equal(lowMode);
    expect(kernel.getProcess("creep:creep-upgrader")?.minBucket).to.equal(0);
    expect(kernel.getProcess("creep:creep-remote-hauler")?.minBucket).to.equal(lowMode);
    expect(kernel.getProcess("creep:creep-lab-tech")?.minBucket).to.equal(highMode);
    expect(kernel.getProcess("creep:creep-lab-tech")?.priority).to.equal(ProcessPriority.IDLE);
  });

  it("maps room priorities to bucket-aware minBucket values", () => {
    const { lowMode } = getConfig().cpu.bucketThresholds;
    const myUsername = "TestPlayer";

    global.Game.rooms = {
      W1N1: {
        name: "W1N1",
        controller: {
          my: true,
          level: 7
        },
        find: () => []
      } as unknown as Room,
      W1N2: {
        name: "W1N2",
        controller: {
          my: false,
          reservation: { username: myUsername, ticksToEnd: 2000 }
        },
        find: () => []
      } as unknown as Room,
      W1N3: {
        name: "W1N3",
        controller: {
          my: false,
          reservation: { username: "other-player", ticksToEnd: 2000 }
        },
        find: () => []
      } as unknown as Room
    } as unknown as Record<string, Room>;

    global.Game.spawns = {
      Spawn1: {
        owner: {
          username: myUsername
        }
      } as unknown as StructureSpawn
    };

    roomProcessManager.syncRoomProcesses();

    expect(kernel.getProcess("room:W1N1")?.minBucket).to.equal(0);
    expect(kernel.getProcess("room:W1N1")?.priority).to.equal(ProcessPriority.HIGH);

    expect(kernel.getProcess("room:W1N2")?.minBucket).to.equal(lowMode);
    expect(kernel.getProcess("room:W1N2")?.priority).to.equal(ProcessPriority.MEDIUM);

    expect(kernel.getProcess("room:W1N3")?.minBucket).to.equal(lowMode);
    expect(kernel.getProcess("room:W1N3")?.priority).to.equal(ProcessPriority.LOW);
  });
});
